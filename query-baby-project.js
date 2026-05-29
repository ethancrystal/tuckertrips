const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

// Create admin client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function queryBabyProject() {
  console.log('🔍 Querying Supabase database for project named "Baby"...\n')

  try {
    // First, let's check what tables exist
    console.log('📊 Checking available tables...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names')

    if (tablesError) {
      console.log('⚠️  Could not fetch table names, trying direct query...')
    }

    // Query trips table for projects with "Baby" in name
    console.log('\n🔍 Searching for "Baby" in trips table...')
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .ilike('title', '%Baby%')
      .or('destination.ilike.%Baby%,title.ilike.%baby%,destination.ilike.%baby%')

    if (tripsError) {
      console.error('❌ Error querying trips:', tripsError)
    } else {
      console.log(`Found ${trips.length} trips related to "Baby":`)
      trips.forEach(trip => {
        console.log('\n----------------------------------------')
        console.log(`📍 Title: ${trip.title}`)
        console.log(`🌍 Destination: ${trip.destination}`)
        console.log(`📅 Start Date: ${trip.start_date || 'Not set'}`)
        console.log(`📅 End Date: ${trip.end_date || 'Not set'}`)
        console.log(`👤 User ID: ${trip.user_id}`)
        console.log(`📝 Status: ${trip.status || trip.trip_type || 'N/A'}`)
        console.log(`👁️ Visibility: ${trip.visibility}`)
        console.log(`🔄 Is Shared: ${trip.is_shared ? 'Yes' : 'No'}`)
        console.log(`📅 Created: ${trip.created_at}`)
      })
    }

    // Also check if there's a projects table
    console.log('\n🔍 Checking for dedicated projects table...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .ilike('name', '%Baby%')
      .or('name.ilike.%baby%,description.ilike.%Baby%,description.ilike.%baby%')

    if (projectsError && projectsError.code !== 'PGRST116') {
      console.log('ℹ️  No projects table found')
    } else if (projects) {
      console.log(`Found ${projects.length} projects related to "Baby":`)
      projects.forEach(project => {
        console.log('\n----------------------------------------')
        console.log(`📋 Project Name: ${project.name}`)
        console.log(`📝 Description: ${project.description || 'No description'}`)
        console.log(`👤 Owner ID: ${project.user_id || project.owner_id}`)
      })
    }

    // Check profiles table for "Baby" references
    console.log('\n🔍 Checking profiles for "Baby" references...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', '%Baby%')
      .or('full_name.ilike.%baby%,bio.ilike.%Baby%,bio.ilike.%baby%')

    if (profilesError) {
      console.log('ℹ️  No profiles found with "Baby" references')
    } else {
      console.log(`Found ${profiles.length} profiles related to "Baby":`)
      profiles.forEach(profile => {
        console.log('\n----------------------------------------')
        console.log(`👤 Name: ${profile.full_name}`)
        console.log(`📧 Email: ${profile.email}`)
        console.log(`📝 Bio: ${profile.bio || 'No bio'}`)
      })
    }

    // Check all tables that might contain "Baby"
    console.log('\n🔍 Searching across all string columns...')
    const { data: searchResults, error: searchError } = await supabase
      .from('trips')
      .select('*')
      .textSearch('title', 'Baby')

    if (!searchError && searchResults.length > 0) {
      console.log(`\n📝 Text search results: ${searchResults.length} items`)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }

  console.log('\n✅ Query completed!')
}

// Additional function to get table schema
async function getTableSchema() {
  console.log('\n📋 Getting table schema information...')

  // Try to get information about the trips table structure
  const { data: columns, error } = await supabase
    .from('trips')
    .select('*')
    .limit(1)

  if (columns && columns.length > 0) {
    console.log('\n📊 Trips table columns:')
    Object.keys(columns[0]).forEach(key => {
      console.log(`  - ${key}`)
    })
  }
}

// Run the query
queryBabyProject()
  .then(() => getTableSchema())
  .catch(console.error)