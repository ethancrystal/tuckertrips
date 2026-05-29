import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import ErrorBoundary from '@/components/ErrorBoundary'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tuckertrips.com'

export const metadata = {
  title: 'Tucker Trips - Your Travel Planner',
  description: 'Plan, document, and share your travel adventures. Get real trip recommendations from people you actually know and trust.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Tucker Trips - Your Travel Planner',
    description: 'Plan, document, and share your travel adventures. Real trips. Real friends. Real trust.',
    url: siteUrl,
    siteName: 'Tucker Trips',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tucker Trips - Your Travel Planner',
    description: 'Plan, document, and share your travel adventures. Real trips. Real friends. Real trust.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  )
}