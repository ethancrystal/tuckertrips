jest.mock('next/server', () => ({
  NextResponse: {
    json(body, init = {}) {
      return {
        status: init.status || 200,
        async json() {
          return body
        },
      }
    },
  },
}))

jest.mock('@/lib/supabase-clients', () => ({
  createAdminClient: jest.fn(),
}))

jest.mock('@/lib/admin-auth-middleware', () => ({
  verifyAdminSession: jest.fn(),
}))

const { getDelayedSignupAnalyticsWindow } = require('@/app/api/admin/users/stats/route')

describe('admin signup click analytics window', () => {
  it('delays visible click stats by one hour', () => {
    const referenceDate = new Date('2026-03-08T12:00:00.000Z')
    const window = getDelayedSignupAnalyticsWindow(referenceDate)

    expect(window.delayHours).toBe(1)
    expect(window.visibleThrough).toBe('2026-03-08T11:00:00.000Z')
    expect(window.recentClicksSince).toBe('2026-03-01T12:00:00.000Z')
  })
})
