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
