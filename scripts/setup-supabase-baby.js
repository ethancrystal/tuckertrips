// Setup Supabase database for "Baby" project
const { createClient } = require('@supabase/supabase-js')

// Connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database for "Baby" project...\n')
  console.log(`📡 Connected to: ${supabaseUrl}\n`)

  try {
    // First, let's see what tables exist
    console.log('📊 Checking existing tables...')

    // Try to get all tables using information schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables', { schema_name: 'public' })
      .catch(() => ({ data: null, error: true }))

    if (tablesError || !tables) {
      console.log('ℹ️  Could not fetch table list, will try direct approach')
    } else {
      console.log('Existing tables:', tables)
    }

    // Create a "baby" project record if we have the right table
    console.log('\n👶 Creating "Baby" project record...')

    // Try to insert into a generic "projects" table
    const babyProject = {
      name: 'Baby',
      title: 'Baby Project',
      description: 'The Baby project - monitoring and tracking baby milestones',
      status: 'active',
      created_at: new Date().toISOString(),
      type: 'monitoring',
      tags: ['baby', 'milestones', 'monitoring'],
      metadata: {
        start_date: '2024-01-01',
        current_stage: 'infancy'
      }
    }

    // Try to create/insert
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .upsert(babyProject, {
        onConflict: 'name'
      })
      .select()
      .single()

    if (projectError) {
      console.error('❌ Could not create project (table might not exist):', projectError.message)

      // Create a simple record in a default table
      console.log('\n📝 Creating a simple record...')

      // Try creating a notes table and add the baby record
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          title: 'Baby Project',
          content: 'Project started for tracking baby milestones and activities',
          category: 'project',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (noteError) {
        console.log('ℹ️  Could not create record - tables may need to be created manually')
        console.log('\n📋 To set up the database:')
        console.log(`1. Go to Supabase dashboard: ${supabaseUrl}`)
        console.log('2. Go to Table Editor')
        console.log('3. Create tables: projects, trips, profiles, notes')
        console.log('4. Enable RLS (Row Level Security)')
      } else {
        console.log('✅ Created a note entry for Baby project')
      }
    } else {
      console.log('✅ Successfully created/updated Baby project:')
      console.log(`   ID: ${projectData.id}`)
      console.log(`   Name: ${projectData.name}`)
      console.log(`   Status: ${projectData.status}`)
    }

    // Check for any existing data
    console.log('\n🔍 Checking for any existing "Baby" related data...')

    // Try to query all possible tables that might have data
    const possibleTables = ['projects', 'trips', 'notes', 'profiles', 'users', 'activities', 'milestones']

    for (const table of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .ilike('title', '%Baby%')
          .limit(5)

        if (!error && data && data.length > 0) {
          console.log(`\n📋 Found ${data.length} records in "${table}" table:`)
          data.forEach(item => {
            console.log(`   • ${item.title || item.name || JSON.stringify(item).substring(0, 50)}...`)
          })
        }
      } catch (e) {
        // Table doesn't exist, skip it
      }
    }

    console.log('\n✅ Database setup completed!')
    console.log('\n💡 Next steps:')
    console.log('1. Visit the Supabase dashboard to verify tables')
    console.log('2. Create any additional tables needed')
    console.log('3. Set up Row Level Security (RLS) policies')
    console.log('4. Start tracking baby milestones! 👶')

  } catch (error) {
    console.error('\n💥 Setup failed:', error.message)
  }
}

// Run the setup
setupDatabase()
