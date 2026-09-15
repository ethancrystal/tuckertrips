jest.unmock('@/lib/supabase')

// supabase-js serialises auth work behind a Web Locks entry. When a holder is
// slow, auth-js steals the lock and the loser rejects with isAcquireTimeout.
const lockStolenError = () => {
  const error = new Error(
    'Lock "lock:sb-rogrzxjxtypzsempesrf-auth-token" was released because another request stole it'
  )
  error.isAcquireTimeout = true
  return error
}

const loadWithSession = (getSession) => {
  let mod
  jest.isolateModules(() => {
    jest.doMock('@/lib/supabase-clients', () => ({
      getBrowserClient: () => ({ auth: { getSession } }),
      supabase: {},
    }))
    mod = require('@/lib/supabase')
  })
  return mod
}

describe('getAccessToken', () => {
  beforeEach(() => jest.resetModules())

  test('returns the access token when the lock is uncontended', async () => {
    const getSession = jest.fn().mockResolvedValue({ data: { session: { access_token: 'tok' } } })
    const { getAccessToken } = loadWithSession(getSession)

    await expect(getAccessToken()).resolves.toBe('tok')
    expect(getSession).toHaveBeenCalledTimes(1)
  })

  test('retries past a stolen auth lock and returns the token', async () => {
    const getSession = jest.fn()
      .mockRejectedValueOnce(lockStolenError())
      .mockRejectedValueOnce(lockStolenError())
      .mockResolvedValue({ data: { session: { access_token: 'tok' } } })
    const { getAccessToken } = loadWithSession(getSession)

    await expect(getAccessToken({ delayMs: 1 })).resolves.toBe('tok')
    expect(getSession).toHaveBeenCalledTimes(3)
  })

  test('gives up after the retry budget and rethrows the lock error', async () => {
    const getSession = jest.fn().mockRejectedValue(lockStolenError())
    const { getAccessToken } = loadWithSession(getSession)

    await expect(getAccessToken({ retries: 2, delayMs: 1 })).rejects.toThrow('stole it')
    expect(getSession).toHaveBeenCalledTimes(3)
  })

  test('does not retry errors unrelated to the lock', async () => {
    const getSession = jest.fn().mockRejectedValue(new Error('network down'))
    const { getAccessToken } = loadWithSession(getSession)

    await expect(getAccessToken({ delayMs: 1 })).rejects.toThrow('network down')
    expect(getSession).toHaveBeenCalledTimes(1)
  })

  test('returns null when signed out', async () => {
    const getSession = jest.fn().mockResolvedValue({ data: { session: null } })
    const { getAccessToken } = loadWithSession(getSession)

    await expect(getAccessToken()).resolves.toBeNull()
  })
})
