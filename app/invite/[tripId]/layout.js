const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuckertrips.com'

export async function generateMetadata({ params }) {
  const tripId = params.tripId

  return {
    title: 'Trip Invitation | Tucker Trips',
    description: 'You\'ve been invited to view a trip on Tucker Trips - Real trips. Real friends. Real trust.',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/invite/${tripId}`,
    },
    openGraph: {
      title: 'You\'re Invited! | Tucker Trips',
      description: 'Someone has shared an amazing trip with you on Tucker Trips. Sign up to see the full details!',
      url: `${siteUrl}/invite/${tripId}`,
      siteName: 'Tucker Trips',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'You\'re Invited! | Tucker Trips',
      description: 'Someone has shared an amazing trip with you on Tucker Trips. Sign up to see the full details!',
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function InviteLayout({ children }) {
  return children
}
