import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
    Sentry.breadcrumbsIntegration({
      console: true,
      dom: true,
      fetch: true,
      history: true,
      xhr: true,
    }),
  ],

  beforeSend(event) {
    if (event.exception) {
      const errorMessage = event.exception.values?.[0]?.value || ''
      if (
        errorMessage.includes('ResizeObserver loop') ||
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('ChunkLoadError')
      ) {
        return null
      }
    }
    return event
  },

  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'fetch' && breadcrumb.data?.url) {
      const url = breadcrumb.data.url
      if (url.includes('/api/users/heartbeat') || url.includes('/api/analytics/')) {
        return null
      }
    }
    return breadcrumb
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
