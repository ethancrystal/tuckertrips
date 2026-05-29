import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database, Insert, Row, Update } from './db-types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ============================================================================
// Client Creation Functions
// ============================================================================

export function createBrowserClient(): SupabaseClient<Database> {
  return getBrowserClient()
}

export function createRouteClient(): SupabaseClient<Database> {
  const { cookies } = require('next/headers')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createServerClient } = require('@supabase/ssr') as {
    createServerClient: <T>(url: string, key: string, opts: Record<string, unknown>) => SupabaseClient<T>
  }
  const cookieStore = cookies()

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Ignore cookie write errors in read-only contexts
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Ignore cookie write errors in read-only contexts
          }
        },
      },
    }
  )
}

/**
 * Creates a server-side Supabase client with admin privileges
 * Uses service role key - ONLY for server-side admin operations
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient should only be called on the server side')
  }

  return createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Creates a server-side client for server components (RSC)
 * Uses service role key for full access
 */
export function createServerComponentClient(): SupabaseClient<Database> {
  return createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Extracts the Bearer token from request headers
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
}

/**
 * Gets the current user from a Supabase client
 */
export async function getCurrentUser(
  supabase: SupabaseClient<Database>,
  accessToken?: string
): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
  try {
    const { data: { user }, error } = accessToken
      ? await supabase.auth.getUser(accessToken)
      : await supabase.auth.getUser()

    if (error || !user) return null

    // Get full profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) return null

    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Checks if a user is authenticated
 */
export async function isAuthenticated(
  supabase: SupabaseClient<Database>,
  accessToken?: string
): Promise<boolean> {
  try {
    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      return !error && !!user
    }

    const { data: { session }, error } = await supabase.auth.getSession()
    return !error && !!session?.user
  } catch {
    return false
  }
}

/**
 * Updates user's online status
 */
export async function updateOnlineStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await ((supabase
      .from('profiles') as any)
      .update({
        is_online: true,
        last_seen: new Date().toISOString()
      } as Update<'profiles'>)
      .eq('id', userId))

    return !error
  } catch (error) {
    console.error('Error updating online status:', error)
    return false
  }
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Type-safe select helper
 */
export async function selectRows<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  options: {
    columns?: string
    filters?: Partial<Database['public']['Tables'][T]['Row']>
    orderBy?: {
      column: keyof Database['public']['Tables'][T]['Row']
      ascending?: boolean
    }
    limit?: number
    offset?: number
    single?: boolean
  } = {}
) {
  let query: any = supabase
    .from(table)
    .select(options.columns || '*')

  // Apply filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          query = query.in(key as any, value as any)
        } else {
          query = query.eq(key as any, value as any)
        }
      }
    })
  }

  // Apply ordering
  if (options.orderBy) {
    query = query.order(
      options.orderBy.column as string,
      { ascending: options.orderBy.ascending ?? true }
    )
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  // Execute query
  if (options.single) {
    return await query.single()
  }

  return await query
}

/**
 * Type-safe insert helper
 */
export async function insertRow<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  data: Insert<T>,
  options: {
    columns?: string
    onConflict?: string
  } = {}
) {
  let query: any = supabase
    .from(table)
    .insert(data as never)

  if (options.onConflict) {
    // Note: This would need specific implementation based on your needs
    // e.g., using .upsert() instead
  }

  if (options.columns) {
    query = query.select(options.columns)
  }

  return options.columns ? await query.single() : await query.select().single()
}

/**
 * Type-safe update helper
 */
export async function updateRow<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  filters: Partial<Row<T>>,
  data: Update<T>,
  options: {
    columns?: string
  } = {}
) {
  let query: any = supabase
    .from(table)
    .update(data as never)

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      query = query.eq(key as any, value as any)
    }
  })

  if (options.columns) {
    query = query.select(options.columns)
  }

  return options.columns ? await query.single() : await query.select().single()
}

/**
 * Type-safe delete helper
 */
export async function deleteRows<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  filters: Partial<Row<T>>
) {
  let query: any = supabase.from(table).delete()

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      query = query.eq(key as any, value as any)
    }
  })

  return await query
}

// ============================================================================
// Browser Client Singleton
// ============================================================================

let _browserClient: SupabaseClient<Database> | null = null

export function getBrowserClient(): SupabaseClient<Database> {
  if (!_browserClient) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
    }
    _browserClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'tucker-trips/1.0.0'
        }
      }
    })
  }
  return _browserClient
}

export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop: string | symbol) {
    const client = getBrowserClient() as unknown as Record<string | symbol, unknown>
    return client[prop]
  }
})

// ============================================================================
// Legacy Exports (for backward compatibility)
// ============================================================================

export const createSupabaseRouteClient = createRouteClient
