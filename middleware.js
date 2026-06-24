/**
 * TEMPORARY MAINTENANCE MIDDLEWARE
 * --------------------------------
 * For every incoming request, this returns a single self-contained HTTP 500
 * "database connection failed" error page. The real application is untouched —
 * to restore it, replace this file with the contents of
 * `middleware.original.bak.js`.
 *
 * The page is fully inline (no DB, no layout, no external assets), so it
 * renders even while the backend is unavailable. A per-request id + timestamp
 * are injected so it reads like a freshly generated server error.
 */

import { NextResponse } from 'next/server'

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>500 — Database Error</title>
<style>
  html, body { height: 100%; margin: 0; }
  body {
    background: #f6f6f6;
    color: #1a1a1a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
  }
  .card {
    width: 100%;
    max-width: 640px;
    background: #ffffff;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    padding: 32px 36px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .code {
    color: #b00020;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 8px;
  }
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 12px;
  }
  p {
    color: #555;
    line-height: 1.55;
    margin: 0 0 20px;
    font-size: 0.95rem;
  }
  .trace {
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 6px;
    padding: 16px 18px;
    font-family: "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
    font-size: 0.82rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: auto;
  }
  .trace .err { color: #f48771; }
  .trace .dim { color: #808080; }
  .meta {
    margin-top: 20px;
    color: #999;
    font-size: 0.78rem;
    font-family: "SF Mono", Menlo, Consolas, monospace;
  }
</style>
</head>
<body>
  <div class="card">
    <p class="code">HTTP 500 · Internal Server Error</p>
    <h1>Database connection failed</h1>
    <p>The application could not establish a connection to its database. This is a temporary problem on our end — please try again in a little while.</p>
    <div class="trace"><span class="err">Error: connection to database failed</span>
  <span class="dim">at</span> Pool.connect (pg-pool)
  <span class="dim">at</span> async query (lib/db)
<span class="err">SequelizeConnectionError: could not connect to server: Connection refused</span>
  <span class="dim">Is the server running on that host and accepting TCP/IP connections?</span></div>
    <p class="meta">Request ID: __REQUEST_ID__ · __TIMESTAMP__</p>
  </div>
</body>
</html>`

export function middleware(request) {
  // Build a per-request error fingerprint so the page reads like a real,
  // freshly generated 500 rather than a static sign.
  const requestId =
    (request && request.headers && request.headers.get('x-vercel-id')) ||
    Math.random().toString(16).slice(2, 10) + '-' + Math.random().toString(16).slice(2, 6)
  const html = MAINTENANCE_HTML
    .replace('__REQUEST_ID__', requestId)
    .replace('__TIMESTAMP__', new Date().toUTCString())

  return new NextResponse(html, {
    status: 500,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  })
}

// Match every route. The static-asset exclusions below keep Next's internal
// build assets from being intercepted; everything user-facing returns the
// maintenance page.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
