// Storage upload API (server-side)
// Uploads to Supabase Storage using a service role key.

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { authenticateOrThrow } from '@/lib/auth-middleware'
import { errorResponse, unauthorizedResponse } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ============================================================================
// File Upload Validation Constants
// ============================================================================

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

// Magic numbers for file type validation (detects actual file type)
const FILE_MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/gif': [0x47, 0x49, 0x46, 0x38]
}

/**
 * Validate file type using magic numbers (more reliable than MIME type)
 * @param {Buffer} buffer - File buffer
 * @returns {string|null} - Detected MIME type or null
 */
function detectFileType(buffer) {
  for (const [mimeType, magicNumbers] of Object.entries(FILE_MAGIC_NUMBERS)) {
    if (buffer.length < magicNumbers.length) continue

    let matches = true
    for (let i = 0; i < magicNumbers.length; i++) {
      if (buffer[i] !== magicNumbers[i]) {
        matches = false
        break
      }
    }

    if (matches) return mimeType
  }

  return null
}


const getServiceSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url) throw new Error('Missing Supabase URL')
  if (!serviceKey) throw new Error('Missing Supabase service role key')

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

async function ensureTripPhotosBucket(serviceSupabase) {
  const { data: bucket, error } = await serviceSupabase.storage.getBucket('trip-photos')
  if (bucket && !error) return

  const { error: createError } = await serviceSupabase.storage.createBucket('trip-photos', {
    public: true,
    fileSizeLimit: 52428800,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })

  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    throw createError
  }
}

export async function POST(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const user = await authenticateOrThrow(request, supabase)

    const formData = await request.formData()
    const file = formData.get('file')
    const kind = String(formData.get('kind') || 'trips')

    // Validate file exists
    if (!file || typeof file.arrayBuffer !== 'function') {
      return errorResponse('Missing file', 400)
    }

    // Validate file size BEFORE loading into memory
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`, 413)
    }

    if (file.size === 0) {
      return errorResponse('Empty file not allowed', 400)
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(
        `Invalid file type: ${file.type || 'unknown'}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        400
      )
    }

    // Load file and validate actual content (magic number check)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const detectedType = detectFileType(buffer)
    if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType)) {
      return errorResponse(
        'File content does not match its extension. Please upload a valid image file.',
        400
      )
    }

    // Use detected type for more reliable content-type
    const contentType = detectedType
    const folder = kind === 'cover' ? 'covers' : 'trips'
    const safeName = String(file.name || 'upload')
      .replace(/[^\w.\-]+/g, '_')
      .slice(0, 128)

    const objectPath = `${user.id}/${folder}/${Date.now()}-${safeName}`

    const serviceSupabase = getServiceSupabase()
    await ensureTripPhotosBucket(serviceSupabase)

    const { error: uploadError } = await serviceSupabase.storage
      .from('trip-photos')
      .upload(objectPath, buffer, { contentType, upsert: false })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      if (uploadError.message?.includes('too large')) {
        return errorResponse('File too large. Maximum size is 50MB.', 413)
      }
      throw uploadError
    }

    const { data: { publicUrl } } = serviceSupabase.storage
      .from('trip-photos')
      .getPublicUrl(objectPath)

    return NextResponse.json({ publicUrl, path: objectPath })
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return unauthorizedResponse()
    }

    const uploadErrResponse = { error: 'Upload failed' }
    if (process.env.NODE_ENV === 'development') {
      uploadErrResponse.details = error.message
    }
    return NextResponse.json(uploadErrResponse, { status: 500 })
  }
}

