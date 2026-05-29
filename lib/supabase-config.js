const SUPABASE_BROWSER_CONFIG_ERROR =
  'Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'

export class SupabaseBrowserConfigError extends Error {
  constructor(message, missingEnvVars = []) {
    super(message)
    this.name = 'SupabaseBrowserConfigError'
    this.code = 'SUPABASE_BROWSER_CONFIG_MISSING'
    this.missingEnvVars = missingEnvVars
  }
}

export function getMissingBrowserSupabaseEnvVars() {
  // Use direct property access — Next.js webpack only replaces process.env.KEY
  // static patterns, not dynamic access like process.env[key].
  const missing = []
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return missing
}

export function getBrowserSupabaseConfigError() {
  const missingVars = getMissingBrowserSupabaseEnvVars()
  if (missingVars.length === 0) return null
  return SUPABASE_BROWSER_CONFIG_ERROR
}

export function assertBrowserSupabaseConfig() {
  const missingVars = getMissingBrowserSupabaseEnvVars()
  if (missingVars.length > 0) {
    throw new SupabaseBrowserConfigError(SUPABASE_BROWSER_CONFIG_ERROR, missingVars)
  }
}

export function getBrowserSupabaseConfigOrThrow() {
  assertBrowserSupabaseConfig()
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}
