jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => undefined),
  })),
}))

describe('admin auth middleware helpers', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.ADMIN_PASSWORD = 'super-secret-password'
    process.env.ADMIN_SESSION_SECRET = 'another-very-secret-session-key-123456'
  })

  it('creates and verifies a signed admin session token', () => {
    const {
      createAdminSessionToken,
      verifyAdminSessionToken,
    } = require('@/lib/admin-auth-middleware')

    const token = createAdminSessionToken('admin@example.com', Date.now())
    const session = verifyAdminSessionToken(token)

    expect(session).toMatchObject({
      email: 'admin@example.com',
      authenticated: true,
    })
  })

  it('rejects tampered admin session tokens', () => {
    const {
      createAdminSessionToken,
      verifyAdminSessionToken,
    } = require('@/lib/admin-auth-middleware')

    const token = createAdminSessionToken('admin@example.com')
    const tamperedToken = `${token.slice(0, -1)}x`

    expect(verifyAdminSessionToken(tamperedToken)).toBeNull()
  })

  it('validates admin credentials from environment variables', () => {
    const { validateAdminCredentials } = require('@/lib/admin-auth-middleware')

    expect(validateAdminCredentials('admin@example.com', 'super-secret-password')).toBe(true)
    expect(validateAdminCredentials('admin@example.com', 'wrong-password')).toBe(false)
    expect(validateAdminCredentials('wrong@example.com', 'super-secret-password')).toBe(false)
  })
})
