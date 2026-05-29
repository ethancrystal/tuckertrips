import { NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'
import { authenticateOrThrow } from '@/lib/auth-middleware'
import { errorResponse, unauthorizedResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const supabase = createSupabaseRouteClient()
    const user = await authenticateOrThrow(request, supabase)

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .neq('id', user.id)
      .ilike('full_name', `%${query.trim()}%`)
      .limit(10)

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    if (error.message === 'Not authenticated') {
      return unauthorizedResponse()
    }
    return errorResponse('Failed to search users', 500, error)
  }
}
