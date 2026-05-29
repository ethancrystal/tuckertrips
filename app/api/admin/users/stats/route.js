// Admin User Stats API Route
// Returns user count and basic statistics (admin only)

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-clients'
import { verifyAdminSession } from '@/lib/admin-auth-middleware'

export const dynamic = 'force-dynamic'

const SIGNUP_CLICK_DELAY_MS = 60 * 60 * 1000

export function getDelayedSignupAnalyticsWindow(referenceDate = new Date()) {
  return {
    recentClicksSince: new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    visibleThrough: new Date(referenceDate.getTime() - SIGNUP_CLICK_DELAY_MS).toISOString(),
    delayHours: 1,
  }
}

export async function GET(request) {
  // Verify admin session
  const admin = await verifyAdminSession(request)

  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  try {
    const supabase = createAdminClient()

    // Get total user count
    const { count: totalUsers, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to count users: ${countError.message}`)
    }

    // Get online users count
    const { count: onlineUsers, error: onlineError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true)

    if (onlineError) {
      console.error('Error counting online users:', onlineError)
    }

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: newUsers, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (newUsersError) {
      console.error('Error counting new users:', newUsersError)
    }

    const { recentClicksSince, visibleThrough, delayHours } = getDelayedSignupAnalyticsWindow()

    // Get total Sign-Up button clicks, delayed by one hour for admin reporting
    const { count: signupClicks, error: clicksError } = await supabase
      .from('signup_clicks')
      .select('*', { count: 'exact', head: true })
      .lte('clicked_at', visibleThrough)

    if (clicksError) {
      console.error('Error counting signup clicks:', clicksError)
    }

    // Get Sign-Up clicks in last 7 days, also delayed by one hour
    const { count: recentClicks, error: recentClicksError } = await supabase
      .from('signup_clicks')
      .select('*', { count: 'exact', head: true })
      .gte('clicked_at', recentClicksSince)
      .lte('clicked_at', visibleThrough)

    if (recentClicksError) {
      console.error('Error counting recent clicks:', recentClicksError)
    }

    // Calculate conversion rate (total users / total clicks)
    const conversionRate = signupClicks > 0 
      ? ((totalUsers / signupClicks) * 100).toFixed(2)
      : 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      onlineUsers: onlineUsers || 0,
      newUsers: newUsers || 0,
      signupClicks: signupClicks || 0,
      recentClicks: recentClicks || 0,
      conversionRate: parseFloat(conversionRate),
      signupClicksDelayHours: delayHours,
      signupClicksVisibleThrough: visibleThrough
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    const response = { error: 'Failed to fetch stats' }
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message
    }
    return NextResponse.json(response, { status: 500 })
  }
}
