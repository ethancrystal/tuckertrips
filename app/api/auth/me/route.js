// Get / Update Current User Profile
// Uses withAuth HOF — no manual auth boilerplate needed

import { withAuth } from '@/lib/auth-middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

// GET — Return the authenticated user's profile
export const GET = withAuth(async (request) => {
  try {
    const { user } = request
    return successResponse({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return errorResponse('Failed to get user', 500, error)
  }
})

// PATCH — Update the authenticated user's profile
export const PATCH = withAuth(async (request) => {
  try {
    const { user, supabase } = request
    const body = await request.json()
    const { fullName, bio, avatarUrl, coverPhotoUrl } = body

    const updateData = { updated_at: new Date().toISOString() }
    if (fullName !== undefined) updateData.full_name = fullName
    if (bio !== undefined) updateData.bio = bio
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl
    if (coverPhotoUrl !== undefined) updateData.cover_photo_url = coverPhotoUrl

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Keep Supabase Auth metadata in sync with the profile
    if (fullName) {
      await supabase.auth.updateUser({ data: { full_name: fullName } })
    }

    return successResponse({ user: updatedProfile })
  } catch (error) {
    console.error('Update profile error:', error)
    return errorResponse('Failed to update profile', 500, error)
  }
})
