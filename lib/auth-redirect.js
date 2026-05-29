function normalizePath(path) {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function getConfiguredSiteOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!siteUrl) return null

  try {
    return new URL(siteUrl).origin
  } catch (error) {
    console.error('Invalid NEXT_PUBLIC_SITE_URL:', error)
    return null
  }
}

export function buildAuthRedirectUrl(path) {
  const normalizedPath = normalizePath(path)
  const configuredOrigin = getConfiguredSiteOrigin()

  if (configuredOrigin) {
    return new URL(normalizedPath, configuredOrigin).toString()
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return new URL(normalizedPath, window.location.origin).toString()
  }

  return normalizedPath
}
