#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
const { Client } = require('pg')

function loadEnv() {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

async function ensureTripPhotosBucket() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url || !serviceKey) {
    return { status: 'skipped' }
  }

  const supabase = createSupabaseClient(url, serviceKey)

  const { data: bucket } = await supabase.storage.getBucket('trip-photos')
  if (bucket) return { status: 'exists' }

  const { error } = await supabase.storage.createBucket('trip-photos', {
    public: true,
    fileSizeLimit: 52428800,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })

  if (error) {
    const msg = String(error.message || '')
    if (!msg.toLowerCase().includes('already exists')) {
      throw error
    }
  }

  return { status: 'created' }
}

async function main() {
  loadEnv()

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ Missing `DATABASE_URL` (expected in `.env.local`).')
    process.exit(1)
  }

  const schemaPath = path.resolve(process.cwd(), 'scripts', 'complete-app-schema.sql')
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')

  if (!schemaSql.trim()) {
    console.error(`❌ Schema file is empty: ${schemaPath}`)
    process.exit(1)
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  })

  console.log('🚀 Deploying Tucker Trips schema...')
  await client.connect()

  try {
    await client.query(schemaSql)
    console.log('✅ Schema SQL executed.')

    const requiredTables = [
      'profiles',
      'trips',
      'trip_categories',
      'friendships',
      'trip_shares',
      'pending_shares',
      'messages',
    ]

    const { rows: tableRows } = await client.query(
      `SELECT tablename
       FROM pg_tables
       WHERE schemaname = 'public'
         AND tablename = ANY($1::text[])
       ORDER BY tablename`,
      [requiredTables]
    )

    const presentTables = new Set(tableRows.map((row) => row.tablename))
    const missingTables = requiredTables.filter((name) => !presentTables.has(name))

    if (missingTables.length) {
      console.error(`❌ Missing tables: ${missingTables.join(', ')}`)
      process.exitCode = 2
    } else {
      console.log('✅ All Tucker Trips tables present.')
    }

    const requiredRpcs = [
      'get_user_conversations',
      'get_unread_message_count',
      'mark_conversation_read',
    ]

    const { rows: rpcRows } = await client.query(
      `SELECT proname
       FROM pg_proc
       WHERE pronamespace = 'public'::regnamespace
         AND proname = ANY($1::text[])
       ORDER BY proname`,
      [requiredRpcs]
    )

    const presentRpcs = new Set(rpcRows.map((row) => row.proname))
    const missingRpcs = requiredRpcs.filter((name) => !presentRpcs.has(name))

    if (missingRpcs.length) {
      console.error(`❌ Missing RPCs: ${missingRpcs.join(', ')}`)
      process.exitCode = 2
    } else {
      console.log('✅ Messaging RPCs present.')
    }
  } finally {
    await client.end()
  }

  try {
    const result = await ensureTripPhotosBucket()
    if (result.status === 'created' || result.status === 'exists') {
      console.log('✅ trip-photos bucket ready.')
    }
  } catch (error) {
    console.warn('⚠️  trip-photos bucket setup skipped:', error?.message || error)
  }
}

main().catch((error) => {
  console.error('❌ Deploy failed:', error?.message || error)
  process.exit(1)
})
