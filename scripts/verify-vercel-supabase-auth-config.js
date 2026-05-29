#!/usr/bin/env node

/**
 * Verifies local/runtime auth-related env config for Vercel + Supabase.
 * This cannot read dashboard-only scope assignments, but it validates
 * required variables and computes callback URLs that must exist in
 * Supabase Auth settings.
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
]

function normalizeUrl(value) {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)
    return parsed.origin
  } catch {
    return null
  }
}

function getMissingVars() {
  return requiredVars.filter((name) => !process.env[name]?.trim())
}

function getExpectedCallbackUrls() {
  const callbacks = new Set()

  const siteOrigin = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL)
  if (siteOrigin) {
    callbacks.add(`${siteOrigin}/auth/callback`)
  }

  const vercelUrl = normalizeUrl(process.env.VERCEL_URL)
  if (vercelUrl) {
    callbacks.add(`${vercelUrl}/auth/callback`)
  }

  return [...callbacks]
}

function run() {
  console.log('🔎 Verifying auth/deployment environment configuration...')

  const missing = getMissingVars()
  if (missing.length > 0) {
    console.error('\n❌ Missing required env vars:')
    for (const name of missing) {
      console.error(`   - ${name}`)
    }
  } else {
    console.log('\n✅ All required env vars are present in current environment.')
  }

  const siteOrigin = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL)
  if (!siteOrigin) {
    console.error('\n❌ NEXT_PUBLIC_SITE_URL is missing or invalid.')
  } else {
    console.log(`\n✅ NEXT_PUBLIC_SITE_URL resolves to: ${siteOrigin}`)
    console.log('   Confirm this matches your canonical Vercel/custom domain.')
  }

  const callbacks = getExpectedCallbackUrls()
  if (callbacks.length === 0) {
    console.error('\n❌ Could not compute callback URLs.')
  } else {
    console.log('\n📌 Ensure these URLs are in Supabase Auth > URL Configuration:')
    console.log('   - Site URL:')
    console.log(`     ${siteOrigin || '(set NEXT_PUBLIC_SITE_URL first)'}`)
    console.log('   - Redirect URLs:')
    callbacks.forEach((url) => {
      console.log(`     ${url}`)
    })
  }

  console.log('\n🧪 Suggested checks:')
  console.log('   1) Vercel: vercel env ls')
  console.log('   2) Vercel: verify vars are set for Production, Preview, Development')
  console.log('   3) Vercel: vercel --prod (fresh production deploy)')
  console.log('   4) Vercel: vercel (fresh preview deploy)')

  process.exit(missing.length > 0 || !siteOrigin ? 1 : 0)
}

run()
