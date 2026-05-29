// Direct Supabase query for "Baby" project
const { createClient } = require('@supabase/supabase-js')

// Use the provided URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// The provided anon key
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Create client
const supabase = createClient(supabaseUrl, supabaseKey)

async function queryBabyProject() {
  console.log('🔍 Querying Supabase for "Baby" project...\n')
  console.log(`📡 Connected to: ${supabaseUrl}\n`)

  try {
    // Query trips table for anything with "Baby"
    console.log('📊 Querying trips table...')
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .or('title.ilike.%Baby%,destination.ilike.%Baby%,description.ilike.%Baby%')
      .order('created_at', { ascending: false })

    if (tripsError) {
      console.error('❌ Error:', tripsError.message)
      console.error('Details:', tripsError)
    } else {
      console.log(`✅ Found ${trips.length} trips related to "Baby":\n`)

      trips.forEach((trip, index) => {
        console.log(`${index + 1}. ${trip.title || 'Untitled'}`)
        console.log(`   📍 Destination: ${trip.destination || 'N/A'}`)
        console.log(`   👤 User: ${trip.user_id}`)
        console.log(`   📅 Created: ${new Date(trip.created_at).toLocaleString()}`)
        console.log(`   📝 Description: ${trip.description?.substring(0, 100) || 'No description'}${trip.description?.length > 100 ? '...' : ''}`)
        console.log(`   🏷️  Status: ${trip.status || trip.trip_type || 'N/A'}`)
        console.log(`   👁️  Visibility: ${trip.visibility || 'N/A'}`)
        console.log('')
      })
    }

    // Also check profiles
    console.log('👥 Querying profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', '%Baby%')
      .or('bio.ilike.%Baby%')

    if (profilesError && !profilesError.message.includes('does not exist')) {
      console.error('❌ Profile query error:', profilesError.message)
    } else if (profiles) {
      console.log(`\n✅ Found ${profiles.length} profiles related to "Baby":\n`)

      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name || 'No name'}`)
        console.log(`   📧 Email: ${profile.email}`)
        console.log(`   📝 Bio: ${profile.bio?.substring(0, 100) || 'No bio'}${profile.bio?.length > 100 ? '...' : ''}`)
        console.log('')
      })
    }

    // Check if there's any other relevant data
    console.log('🔍 Checking for any table with "Baby" references...')

    // List all trips to see if we missed anything
    const { data: allTrips, error: allError } = await supabase
      .from('trips')
      .select('title, destination, id')
      .limit(10)

    if (!allError) {
      console.log('\n📋 Recent trips in database (showing 10 most recent):')
      allTrips.forEach(trip => {
        console.log(`   • ${trip.title || 'No title'} - ${trip.destination || 'No destination'}`)
      })
    }

    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('📋 QUERY SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total trips matching "Baby": ${trips ? trips.length : 0}`)
    console.log(`Total profiles matching "Baby": ${profiles ? profiles.length : 0}`)
    console.log('\n✅ Query completed successfully!')

  } catch (err) {
    console.error('\n💥 Unexpected error:', err.message)
  }
}

// Execute the query
queryBabyProject()
