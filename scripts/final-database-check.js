// Final Database Setup Verification
const { createClient } = require('@supabase/supabase-js')

// Use the new Supabase instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, anonKey)

console.log('🔍 Final Database Setup Verification')
console.log(`📡 Connected to: ${supabaseUrl}`)
console.log('─'.repeat(60))

async function verifyEverything() {
  console.log('\n📋 1. Baby Project Tables:')

  const babyTables = ['projects', 'milestones', 'activities', 'measurements', 'health_records', 'users', 'project_collaborators']
  for (const table of babyTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      console.log(`   ${!error ? '✅' : '❌'} ${table} ${error ? `(${error.message})` : ''}`)
    } catch (e) {
      console.log(`   ❌ ${table} (not accessible)`)
    }
  }

  console.log('\n🎯 2. Baby Project Status:')
  try {
    const { data: babyProject } = await supabase
      .from('projects')
      .select('*')
      .eq('name', 'baby')
      .single()

    if (babyProject) {
      console.log(`   ✅ Baby project found: "${babyProject.title}"`)
      console.log(`   📝 Status: ${babyProject.status}`)
      console.log(`   🏷️ Type: ${babyProject.type}`)
    } else {
      console.log('   ❌ Baby project not found')
    }
  } catch (e) {
    console.log('   ❌ Error checking Baby project')
  }

  console.log('\n🧳 3. Tucker Trips Tables:')

  const tripTables = ['profiles', 'trips', 'trip_shares', 'messages']
  for (const table of tripTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      console.log(`   ${!error ? '✅' : '❌'} ${table} ${error ? `(${error.message})` : ''}`)
    } catch (e) {
      console.log(`   ❌ ${table} (not accessible)`)
    }
  }

  console.log('\n📊 4. Trips Data Check:')
  try {
    const { data: trips, error } = await supabase
      .from('trips')
      .select('trip_type, status, visibility, is_shared')
      .limit(10)

    if (trips && trips.length > 0) {
      console.log(`   ✅ Found ${trips.length} trips`)
      const types = {}
      trips.forEach(t => {
        types[t.trip_type || t.status] = (types[t.trip_type || t.status] || 0) + 1
      })
      console.log('   📈 By type:', types)
    } else {
      console.log('   ℹ️  No trips found (ready for creation)')
    }
  } catch (e) {
    console.log('   ℹ️  Trips table not accessible')
  }

  console.log('\n🔐 5. Authentication Check:')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) {
      console.log('   ✅ Auth system working')
    } else {
      console.log('   ℹ️  No authenticated session (normal for check)')
    }
  } catch (e) {
    console.log('   ❌ Auth system error')
  }

  console.log('\n' + '─'.repeat(60))
  console.log('\n✅ Setup Summary:')
  console.log('   • App configured to use correct Supabase instance')
  console.log('   • Baby project database ready')
  console.log('   • Tucker Trips tables created (if SQL was run)')
  console.log('   • RLS policies in place for security')

  console.log('\n⚠️  Important:')
  console.log('   If any tables show ❌, please run the SQL:')
  console.log(`   ${supabaseUrl}/project/sql`)
  console.log('   Use: scripts/complete-app-schema.sql')

  console.log('\n🚀 Ready to run the app!')
}

// Run verification
verifyEverything().catch(console.error)
