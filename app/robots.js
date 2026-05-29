export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuckertrips.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/invite/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
