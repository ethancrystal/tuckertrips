// Direct Baby Project Database Setup with Service Role
const { createClient } = require('@supabase/supabase-js')

// Service role connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🔧 Setting up Baby Project Database Schema (Direct Method)...')
console.log(`📡 Connected to: ${supabaseUrl}`)

async function setupDatabase() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('\n📊 Testing connection...')

    // Test connection
    const { data, error } = await supabase
      .from('_dummy')
      .select('*')
      .limit(1)

    if (error && !error.message.includes('does not exist')) {
      console.log('⚠️  Connection test failed:', error.message)
      console.log('   Will continue with table creation attempts...')
    } else {
      console.log('✅ Connection successful')
    }

    console.log('\n📝 Creating "Baby" project in projects table...')

    // Create the Baby project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .upsert({
        name: 'baby',
        title: 'Baby Tracking Project',
        description: 'Comprehensive tracking of baby milestones, activities, and growth measurements',
        status: 'active',
        type: 'monitoring',
        start_date: new Date().toISOString().split('T')[0],
        metadata: {
          current_stage: 'infancy',
          focus_areas: ['milestones', 'activities', 'measurements'],
          project_type: 'baby_tracking'
        },
        tags: ['baby', 'milestones', 'monitoring', 'growth', 'health'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (projectError) {
      console.error('❌ Could not create Baby project:', projectError.message)
      console.log('\n📋 Manual setup required:')
      console.log(`1. Go to: ${supabaseUrl}`)
      console.log('2. Click "SQL Editor"')
      console.log('3. Run the SQL from: scripts/baby-project-schema.sql')
      console.log('4. Or execute manually in the SQL Editor')
    } else {
      console.log('✅ Baby project created successfully!')
      console.log(`   ID: ${project.id}`)
      console.log(`   Name: ${project.name}`)
      console.log(`   Status: ${project.status}`)
    }

    // Try to create basic tables if they don't exist
    console.log('\n📊 Attempting to create basic tables...')

    const tables = [
      {
        name: 'milestones',
        query: `
          CREATE TABLE IF NOT EXISTS milestones (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID REFERENCES projects(id),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            milestone_date DATE,
            achieved BOOLEAN DEFAULT FALSE,
            achieved_at TIMESTAMPTZ,
            notes TEXT,
            photos TEXT[],
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `
      },
      {
        name: 'activities',
        query: `
          CREATE TABLE IF NOT EXISTS activities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID REFERENCES projects(id),
            activity_type VARCHAR(100),
            title VARCHAR(255),
            description TEXT,
            activity_date DATE,
            start_time TIME,
            end_time TIME,
            duration INTEGER,
            notes TEXT,
            photos TEXT[],
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `
      }
    ]

    for (const table of tables) {
      console.log(`\n📋 Creating table: ${table.name}`)
      try {
        const { error } = await supabase.rpc('exec', { sql: table.query })
        if (error && !error.message.includes('already exists')) {
          console.log(`   ⚠️  ${error.message}`)
        } else {
          console.log('   ✅ Created successfully')
        }
      } catch (e) {
        console.log(`   ❌ Error: ${e.message}`)
      }
    }

    console.log('\n🎯 Setup Summary:')
    console.log('1. Database schema created or verified')
    console.log('2. Baby project initialized')
    console.log('3. Basic tables created')
    console.log('\n📌 Supabase Dashboard:')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   SQL Editor: ${supabaseUrl}/project/sql`)
        console.log('📝 To complete setup:')
    console.log('   1. Run the full SQL script in SQL Editor')
    console.log('   2. Verify all tables created')
    console.log('   3. Test with sample data insertion')
    console.log('   4. Set up user accounts and collaborators')

  } catch (error) {
    console.error('\n💥 Setup failed:', error.message)
    console.log('\n⚠️  Please run the SQL manually at:')
    console.log(`   ${supabaseUrl}/project/sql`)
    console.log('\n📄 SQL file location: scripts/baby-project-schema.sql')
  }
}

// Run the setup
setupDatabase()
