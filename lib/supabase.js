export { supabase, getBrowserClient } from './supabase-clients'
import { getBrowserClient } from './supabase-clients'

export const getCurrentUser = async () => {
  const client = getBrowserClient()
  const { data: { user }, error } = await client.auth.getUser()
  if (error) throw error
  return user
}

export const isAuthenticated = async () => {
  const client = getBrowserClient()
  const { data: { session } } = await client.auth.getSession()
  return !!session
}

/**
 * Returns the current access token, tolerating Supabase's auth-token lock.
 *
 * supabase-js serialises auth work behind a Web Locks entry that is shared by
 * every tab and by the background token refresh. When a holder is slow, auth-js
 * steals the lock and the losing caller rejects with `isAcquireTimeout` set:
 *   Lock "lock:sb-<ref>-auth-token" was released because another request stole it
 *
 * That is transient contention, not an auth failure, so retry briefly rather
 * than surfacing it to the user as a failed upload.
 *
 * @returns {Promise<string|null>} access token, or null when signed out
 */
export const getAccessToken = async ({ retries = 3, delayMs = 150 } = {}) => {
  const client = getBrowserClient()

  for (let attempt = 0; ; attempt++) {
    try {
      const { data: { session } } = await client.auth.getSession()
      return session?.access_token ?? null
    } catch (error) {
      if (!error?.isAcquireTimeout || attempt >= retries) throw error
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
    }
  }
}

export const uploadPhoto = async (file, path, bucket = 'trip-photos') => {
  const client = getBrowserClient()
  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  return data
}

export const getPublicUrl = (path, bucket = 'trip-photos') => {
  const client = getBrowserClient()
  const { data } = client.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
