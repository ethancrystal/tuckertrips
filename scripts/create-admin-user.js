#!/usr/bin/env node

/**
 * Create Admin User Script
 *
 * This script:
 * 1. Adds the is_admin column to the profiles table (if not exists)
 * 2. Creates the admin user in Supabase Auth via Management API
 * 3. Creates the profile with is_admin = true
 *
 * Run with: node scripts/create-admin-user.js
 */

require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env.local')
  process.exit(1)
}

async function createAdminUser() {
  console.log('🔧 Starting admin user creation...\n')

  // Extract project ref from URL
  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
  const MANAGEMENT_API_URL = `https://${projectRef}.supabase.co/auth/v1/admin`

  try {
    // Step 1: Create admin user in Supabase Auth via Management API
    console.log(`👤 Creating admin user in Supabase Auth (${ADMIN_EMAIL})...`)

    const createUserResponse = await fetch(`${MANAGEMENT_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'Tucker Trips Admin',
          is_admin: true
        }
      })
    })

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json()

      // If user already exists, that's fine - we'll just get their ID
      if (errorData.message?.includes('already been registered') || errorData.message?.includes('already exists')) {
        console.log('⚠️  Admin user already exists, fetching user ID...')

        // List users to find the admin
        const listResponse = await fetch(`${MANAGEMENT_API_URL}/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY
          }
        })

        if (listResponse.ok) {
          const usersData = await listResponse.json()
          const adminUser = usersData.users?.find(u => u.email === ADMIN_EMAIL)

          if (adminUser) {
            await updateOrCreateProfile(adminUser.id)
            return
          }
        }

        console.log('ℹ️  User exists but could not fetch ID. You may need to manually set is_admin flag.')
        console.log('\n✨ Admin user already exists in Supabase Auth!')
        console.log('\n📝 Admin Credentials:')
        console.log(`   Email:    ${ADMIN_EMAIL}`)
        console.log('   Password: [from ADMIN_PASSWORD env var]')
        console.log('\n🔗 You can now login at: /admin-login\n')
        return
      }

      throw new Error(errorData.message || 'Failed to create admin user')
    }

    const userData = await createUserResponse.json()
    console.log('✅ Admin user created successfully')
    console.log('   User ID:', userData.id)

    // Step 2: Update or create profile with is_admin = true
    await updateOrCreateProfile(userData.id)

  } catch (error) {
    console.error('\n❌ Error during admin user creation:', error.message)
    console.error('\n💡 Alternative: Run this SQL in your Supabase SQL Editor:')
    console.error('\n-- Add is_admin column')
    console.error('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;')
    console.error('\n-- The admin user was created in Auth but you may need to manually create the profile.')
    process.exit(1)
  }
}

async function updateOrCreateProfile(adminUserId) {
  const { createClient } = require('@supabase/supabase-js')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  console.log('📝 Updating admin profile...')

  // First, try to add the column (will fail if already exists, which is fine)
  try {
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;`
    })
  } catch (e) {
    // Ignore - column might already exist or rpc might not work
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: adminUserId,
      email: ADMIN_EMAIL,
      full_name: 'Tucker Trips Admin',
      is_admin: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })

  if (profileError) {
    // If is_admin column doesn't exist, we need to add it
    if (profileError.message.includes('is_admin') || profileError.code === '42703') {
      console.log('\n⚠️  The is_admin column does not exist in the profiles table.')
      console.log('Please run this SQL in your Supabase SQL Editor:')
      console.log('\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;\n')
      console.log('Then run this script again.\n')
    } else {
      console.error('❌ Error updating profile:', profileError.message)
    }
    throw profileError
  }

  console.log('✅ Admin profile updated with is_admin = true')

  console.log('\n✨ Admin user setup complete!')
  console.log('\n📝 Admin Credentials:')
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log('   Password: [from ADMIN_PASSWORD env var]')
  console.log('\n🔗 You can now login at: /admin-login\n')
}

createAdminUser()
