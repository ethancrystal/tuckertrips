const { withSentryConfig } = require("@sentry/nextjs");

const isReplit = !!process.env.REPLIT_DEV_DOMAIN;

// Normalize NEXT_PUBLIC_SUPABASE_ANON_KEY in case it was stored with a duplicated value.
// A valid JWT has exactly 3 dot-separated parts; trim any extras.
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const normalizedAnonKey = rawAnonKey.split('.').length > 3
  ? rawAnonKey.split('.').slice(0, 3).join('.')
  : rawAnonKey

const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: normalizedAnonKey,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async redirects() {
    return [
      { source: '/login', destination: '/', statusCode: 301 },
      { source: '/signup', destination: '/', statusCode: 301 },
      { source: '/auth', destination: '/', statusCode: 301 },
      { source: '/signin', destination: '/', statusCode: 301 },
      { source: '/dashboard', destination: '/', statusCode: 301 },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: isReplit ? "ALLOWALL" : "DENY" },
      { key: "Content-Security-Policy", value: isReplit ? "frame-ancestors *;" : "frame-ancestors 'none';" },
    ];

    if (isReplit || process.env.CORS_ORIGINS) {
      securityHeaders.push(
        { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGINS || "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "*" },
      );
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

if (isReplit) {
  nextConfig.allowedDevOrigins = [
    'localhost',
    '127.0.0.1',
    'localhost:5000',
    '127.0.0.1:5000',
    process.env.REPLIT_DEV_DOMAIN,
    process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : undefined,
  ].filter(Boolean);
}

const hasSentryAuth = !!process.env.SENTRY_AUTH_TOKEN;

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "tuckertrips",
  project: process.env.SENTRY_PROJECT || "tucker-trips",
  silent: true,
  disableServerWebpackPlugin: !hasSentryAuth,
  disableClientWebpackPlugin: !hasSentryAuth,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
});
