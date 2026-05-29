import { render, waitFor } from '@testing-library/react'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

const mockQueries = []

function mockCreateThenableQuery(result) {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  }
  mockQueries.push(query)
  return query
}

jest.mock('@/lib/supabase.js', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn((table) => {
      if (table === 'trip_shares') {
        return mockCreateThenableQuery({ data: [], error: null })
      }

      return mockCreateThenableQuery({ data: [], error: null })
    }),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}))

describe('DashboardNew - Discover trips fetching', () => {
  let consoleLogSpy

  beforeEach(() => {
    mockQueries.length = 0
    jest.clearAllMocks()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy?.mockRestore()
  })

  it('does not exclude the current user from public trips', async () => {
    const DashboardNew = require('@/components/DashboardNew').default

    render(
      <DashboardNew
        user={{ id: 'user-1', email: 'user@example.com', user_metadata: { full_name: 'User' } }}
        onLogout={jest.fn()}
      />
    )

    await waitFor(() => {
      const eqCalls = mockQueries.flatMap((q) => q.eq.mock.calls)
      expect(eqCalls.some(([col, val]) => col === 'visibility' && val === 'public')).toBe(true)
    })

    const neqCalls = mockQueries.flatMap((q) => q.neq.mock.calls)
    expect(neqCalls.length).toBe(0)
  })
})
