describe('browser Supabase config helpers', () => {
  const expectedError =
    'Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'

  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  test('returns null when required public env vars are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    const { getBrowserSupabaseConfigError } = await import('@/lib/supabase-config')

    expect(getBrowserSupabaseConfigError()).toBeNull()
  })

  test('returns one error path when either public env var is missing', async () => {
    const { getBrowserSupabaseConfigError } = await import('@/lib/supabase-config')

    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    expect(getBrowserSupabaseConfigError()).toBe(expectedError)

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    expect(getBrowserSupabaseConfigError()).toBe(expectedError)

    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    expect(getBrowserSupabaseConfigError()).toBe(expectedError)
  })

  test('throws deterministic error metadata when asserted', async () => {
    const { assertBrowserSupabaseConfig } = await import('@/lib/supabase-config')

    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(() => assertBrowserSupabaseConfig()).toThrow(expectedError)

    try {
      assertBrowserSupabaseConfig()
    } catch (error) {
      expect(error.name).toBe('SupabaseBrowserConfigError')
      expect(error.code).toBe('SUPABASE_BROWSER_CONFIG_MISSING')
      expect(error.missingEnvVars).toEqual([
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ])
    }
  })

  test('returns canonical validated browser config shape', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    const { getBrowserSupabaseConfigOrThrow } = await import('@/lib/supabase-config')

    expect(getBrowserSupabaseConfigOrThrow()).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    })
  })
})
