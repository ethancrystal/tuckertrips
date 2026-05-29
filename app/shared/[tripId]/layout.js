const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuckertrips.com'

export async function generateMetadata({ params }) {
  const tripId = params.tripId

  return {
    title: 'Shared Trip | Tucker Trips',
    description: 'View this amazing trip shared on Tucker Trips - Real trips. Real friends. Real trust.',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/shared/${tripId}`,
    },
    openGraph: {
      title: 'Shared Trip | Tucker Trips',
      description: 'Check out this trip shared on Tucker Trips - Real trips. Real friends. Real trust.',
      url: `${siteUrl}/shared/${tripId}`,
      siteName: 'Tucker Trips',
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shared Trip | Tucker Trips',
      description: 'Check out this trip shared on Tucker Trips - Real trips. Real friends. Real trust.',
    },
  }
}

export default function SharedTripLayout({ children }) {
  return children
}
