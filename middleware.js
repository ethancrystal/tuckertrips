/**
 * TEMPORARY MAINTENANCE MIDDLEWARE
 * --------------------------------
 * For every incoming request, this returns a single self-contained
 * "DATABASE ERROR" page. The real application is untouched — to restore it,
 * replace this file with the contents of `middleware.original.bak.js`.
 *
 * The page is fully inline (no DB, no layout, no external assets), so it
 * renders even while the backend is unavailable.
 */

import { NextResponse } from 'next/server'

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Database Error</title>
<style>
  html, body { height: 100%; margin: 0; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
  }
  .msg {
    color: #d10000;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="msg">DATABASE ERROR</div>
</body>
</html>`

export function middleware() {
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'retry-after': '172800',
    },
  })
}

// Match every route. The static-asset exclusions below keep Next's internal
// build assets from being intercepted; everything user-facing returns the
// maintenance page.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
