import { createAdminClient } from '@/lib/supabase-clients'
import { verifyAdminSession } from '@/lib/admin-auth-middleware'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const admin = await verifyAdminSession(request)
  if (!admin) return unauthorizedResponse()

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        profiles:profiles(id, full_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return successResponse(data)
  } catch (error) {
    return errorResponse('Failed to fetch trips', 500, error)
  }
}

export async function DELETE(request) {
  const admin = await verifyAdminSession(request)
  if (!admin) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return errorResponse('ID required', 400)

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)

    if (error) throw error
    return successResponse({ deleted: true })
  } catch (error) {
    return errorResponse('Failed to delete trip', 500, error)
  }
}
