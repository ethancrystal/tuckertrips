jest.unmock('@/lib/supabase')

describe('supabase client environment guard', () => {
  const ORIGINAL_ENV = process.env
  const expectedError =
    'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'

  beforeEach(() => {
    jest.resetModules()
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  test('throws when accessing supabase client with missing env vars', () => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    }

    let supabaseModule
    jest.isolateModules(() => {
      supabaseModule = require('@/lib/supabase')
    })

    expect(() => supabaseModule.supabase.auth).toThrow(expectedError)
  })

  test('creates the client when required public env vars are provided', () => {
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'example-anon-key',
    }

    let supabaseModule
    jest.isolateModules(() => {
      supabaseModule = require('@/lib/supabase')
    })

    expect(supabaseModule.supabase).toBeDefined()
    expect(() => supabaseModule.supabase.auth).not.toThrow()
  })
})
