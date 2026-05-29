#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_EMAIL || !ADMIN_USER_ID) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, and ADMIN_USER_ID must be set in .env.local')
  process.exit(1)
}

console.log('🔧 Updating admin profile...\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function updateProfile() {
  try {
    // First, check if profile exists
    console.log('🔍 Checking for existing profile...')

    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', ADMIN_USER_ID)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    // Try to add is_admin column (may fail if already exists, which is fine)
    console.log('📋 Adding is_admin column to profiles table...')

    // We'll use a direct SQL approach via RPC if available
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;`
    })

    if (rpcError && !rpcError.message.includes('already exists')) {
      console.log('ℹ️  Could not add column via RPC (may need to be done manually)')
    }

    // Now update the profile
    console.log('📝 Updating admin profile with is_admin flag...')

    const updateData = {
      email: ADMIN_EMAIL,
      full_name: 'Tucker Trips Admin',
      updated_at: new Date().toISOString()
    }

    // Try to include is_admin, if it exists
    const { error: testError } = await supabase
      .from('profiles')
      .update({ ...updateData, is_admin: true })
      .eq('id', ADMIN_USER_ID)

    if (testError) {
      if (testError.message.includes('is_admin') || testError.code === '42703') {
        console.log('\n⚠️  The is_admin column does not exist.')
        console.log('Please run this SQL in your Supabase SQL Editor:\n')
        console.log('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;')
        console.log(`UPDATE public.profiles SET is_admin = true WHERE id = '${ADMIN_USER_ID}';\n`)

        // Update without is_admin flag
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', ADMIN_USER_ID)

        if (updateError) {
          throw updateError
        }
        console.log('✅ Profile updated (without is_admin flag - add column manually)')
      } else {
        throw testError
      }
    } else {
      console.log('✅ Admin profile updated with is_admin = true')
    }

    console.log('\n✨ Admin setup complete!')
    console.log('\n📝 Admin Credentials:')
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log('   Password: [from ADMIN_PASSWORD env var]')
    console.log('\n🔗 You can now login at: /admin-login\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

updateProfile()
