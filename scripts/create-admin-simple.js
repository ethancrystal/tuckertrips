#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env.local')
  process.exit(1)
}

console.log('🔧 Starting admin user creation...\n')

// Using the standard signup endpoint with service role (bypasses RLS)
const signupUrl = `${SUPABASE_URL}/auth/v1/signup`

fetch(signupUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
  },
  body: JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    data: {
      full_name: 'Tucker Trips Admin'
    }
  })
})
.then(async response => {
  const data = await response.json()

  if (!response.ok) {
    // Check if user already exists
    if (data.msg?.includes('already') || data.message?.includes('already') ||
        data.error?.includes('already') || data.error_description?.includes('already')) {
      console.log('⚠️  Admin user already exists in Supabase Auth')
      console.log('\n✨ Admin user already exists!')
      console.log('\n📝 Admin Credentials:')
      console.log(`   Email:    ${ADMIN_EMAIL}`)
      console.log('   Password: [from ADMIN_PASSWORD env var]')
      console.log('\n🔗 You can now login at: /admin-login\n')
      console.log('⚠️  Note: To add the is_admin flag, run this SQL in Supabase SQL Editor:')
      console.log('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;')
      console.log(`UPDATE public.profiles SET is_admin = true WHERE email = '${ADMIN_EMAIL}';\n`)
      return
    }
    throw new Error(data.message || data.error || data.msg || 'Signup failed')
  }

  console.log('✅ Admin user created in Supabase Auth')
  console.log('   User ID:', data.user?.id || data.id)

  console.log('\n✨ Admin user setup complete!')
  console.log('\n📝 Admin Credentials:')
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log('   Password: [from ADMIN_PASSWORD env var]')
  console.log('\n🔗 You can now login at: /admin-login\n')
  console.log('⚠️  To enable admin features, run this SQL in Supabase SQL Editor:')
  console.log('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;')
  console.log(`UPDATE public.profiles SET is_admin = true WHERE email = '${ADMIN_EMAIL}';\n`)
})
.catch(error => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})
