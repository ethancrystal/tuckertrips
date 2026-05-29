jest.mock('@/lib/admin-auth-middleware', () => ({
  verifyAdminSession: jest.fn(),
}))

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

let mockStore = {}

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        data: Object.entries(mockStore).map(([key, value]) => ({ key, value })),
        error: null,
      }),
      upsert: jest.fn((rows) => {
        for (const row of rows) {
          mockStore[row.key] = row.value
        }
        return { error: null }
      }),
    }),
  }),
}))

const { verifyAdminSession } = require('@/lib/admin-auth-middleware')
const { GET, PUT } = require('@/app/api/admin/counters/route')

const createRequest = (body) => ({
  headers: new Headers(),
  json: async () => body,
})

describe('/api/admin/counters', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mockStore = {}
    verifyAdminSession.mockResolvedValue({ authenticated: true })
  })

  it('returns counters in the shape expected by the secure dashboards', async () => {
    const response = await GET(createRequest())
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      counters: {
        totalUsers: 0,
        activeBookings: 0,
        revenue: 0,
        reviews: 0,
      },
    })
  })

  it('accepts nested counters payloads from the super admin dashboard', async () => {
    const response = await PUT(createRequest({
      counters: {
        totalUsers: 12,
        activeBookings: 7,
        revenue: 5400,
        reviews: 18,
      },
    }))

    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.counters).toEqual({
      totalUsers: 12,
      activeBookings: 7,
      revenue: 5400,
      reviews: 18,
    })
  })

  it('rejects invalid counter keys', async () => {
    const response = await PUT(createRequest({
      counters: {
        systemHealth: 100,
      },
    }))

    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toMatch(/Invalid counter keys/)
  })
})
