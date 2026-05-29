describe('buildAuthRedirectUrl', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
    }
  })

  test('uses NEXT_PUBLIC_SITE_URL when configured', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.tuckertrips.com'

    const { buildAuthRedirectUrl } = await import('@/lib/auth-redirect')

    expect(buildAuthRedirectUrl('/auth/callback')).toBe('https://www.tuckertrips.com/auth/callback')
  })

  test('falls back to the browser origin when NEXT_PUBLIC_SITE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL

    const { buildAuthRedirectUrl } = await import('@/lib/auth-redirect')

    expect(buildAuthRedirectUrl('/reset-password')).toBe(`${window.location.origin}/reset-password`)
  })
})
