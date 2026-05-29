// Direct SQL Execution for Baby Project Setup
const { createClient } = require('@supabase/supabase-js')

// Service role connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🔧 Setting up Baby Project Database (Direct SQL Execution)...')
console.log(`📡 Connected to: ${supabaseUrl}\n`)

// SQL statements to execute in order
const sqlStatements = [
  // Enable extensions
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

  // Create custom types
  `DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('active', 'completed', 'paused', 'archived');
    END IF;
END $$;`,

  `DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_type') THEN
        CREATE TYPE milestone_type AS ENUM ('physical', 'cognitive', 'social', 'emotional', 'health');
    END IF;
END $$;`,

  `DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE activity_type AS ENUM ('feeding', 'sleeping', 'playing', 'diaper', 'bathing', 'outdoor', 'learning');
    END IF;
END $$;`,

  // Create projects table
  `CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      description TEXT,
      status project_status DEFAULT 'active',
      type VARCHAR(100) DEFAULT 'monitoring',
      start_date DATE,
      end_date DATE,
      metadata JSONB DEFAULT '{}',
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Create milestones table
  `CREATE TABLE IF NOT EXISTS milestones (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      milestone_type milestone_type,
      milestone_date DATE,
      achieved BOOLEAN DEFAULT FALSE,
      achieved_at TIMESTAMPTZ,
      notes TEXT,
      photos TEXT[],
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Create activities table
  `CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      activity_type activity_type,
      title VARCHAR(255),
      description TEXT,
      activity_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      duration INTEGER,
      notes TEXT,
      photos TEXT[],
      mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Create measurements table
  `CREATE TABLE IF NOT EXISTS measurements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      measurement_date DATE NOT NULL,
      weight DECIMAL(5,2),
      height DECIMAL(5,2),
      head_circumference DECIMAL(5,2),
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Create health_records table
  `CREATE TABLE IF NOT EXISTS health_records (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      record_date DATE NOT NULL,
      record_type VARCHAR(100),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      doctor_name VARCHAR(255),
      location VARCHAR(255),
      next_visit DATE,
      documents TEXT[],
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Create users table
  `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      full_name VARCHAR(255),
      avatar_url TEXT,
      role VARCHAR(50) DEFAULT 'parent',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Create project_collaborators table
  `CREATE TABLE IF NOT EXISTS project_collaborators (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'viewer',
      permissions JSONB DEFAULT '{}',
      invited_by UUID REFERENCES users(id),
      invited_at TIMESTAMPTZ DEFAULT NOW(),
      accepted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`,
  `CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);`,
  `CREATE INDEX IF NOT EXISTS idx_milestones_date ON milestones(milestone_date);`,
  `CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);`,
  `CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(activity_date);`,
  `CREATE INDEX IF NOT EXISTS idx_measurements_project_id ON measurements(project_id);`,
  `CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(measurement_date);`,
  `CREATE INDEX IF NOT EXISTS idx_health_records_project_id ON health_records(project_id);`,
  `CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date);`,

  // Create updated_at function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql';`,

  // Create triggers
  `DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
  CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
  CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
  CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_measurements_updated_at ON measurements;
  CREATE TRIGGER update_measurements_updated_at BEFORE UPDATE ON measurements
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
  CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  `DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

  // Insert Baby project
  `INSERT INTO projects (
      id,
      name,
      title,
      description,
      status,
      type,
      start_date,
      metadata,
      tags
  ) VALUES (
      uuid_generate_v4(),
      'baby',
      'Baby Tracking Project',
      'Comprehensive tracking of baby milestones, activities, and growth measurements',
      'active',
      'monitoring',
      CURRENT_DATE,
      '{"current_stage": "infancy", "focus_areas": ["milestones", "activities", "measurements"]}',
      ARRAY['baby', 'milestones', 'monitoring', 'growth', 'health']
  ) ON CONFLICT (name) DO NOTHING;`,

  // Insert sample milestones
  `INSERT INTO milestones (
      id,
      project_id,
      title,
      description,
      milestone_type,
      milestone_date,
      notes
  ) SELECT
      uuid_generate_v4(),
      p.id,
      'First Smile',
      'Baby smiled for the first time',
      'emotional',
      CURRENT_DATE,
      'Beautiful moment captured on camera!'
  FROM projects p
  WHERE p.name = 'baby'
  ON CONFLICT DO NOTHING;`,

  `INSERT INTO milestones (
      id,
      project_id,
      title,
      description,
      milestone_type,
      milestone_date,
      notes
  ) SELECT
      uuid_generate_v4(),
      p.id,
      'First Steps',
      'Baby took first independent steps',
      'physical',
      CURRENT_DATE + INTERVAL '1 year',
      'Walked 5 steps independently!'
  FROM projects p
  WHERE p.name = 'baby'
  ON CONFLICT DO NOTHING;`,

  `INSERT INTO milestones (
      id,
      project_id,
      title,
      description,
      milestone_type,
      milestone_date,
      notes
  ) SELECT
      uuid_generate_v4(),
      p.id,
      'First Word',
      'Baby said "mama" clearly',
      'cognitive',
      CURRENT_DATE + INTERVAL '6 months',
      'Clear as day! Said "mama" looking at mom.'
  FROM projects p
  WHERE p.name = 'baby'
  ON CONFLICT DO NOTHING;`
]

async function executeSetup() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  let successCount = 0
  let failureCount = 0

  console.log(`📋 Executing ${sqlStatements.length} SQL statements...\n`)

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i]
    console.log(`[${i + 1}/${sqlStatements.length}] Executing SQL...`)

    try {
      // Use the raw SQL execution via PostgREST
      const { data, error } = await supabase
        .rpc('exec', { sql_string: sql })
        .catch(async () => {
          // Fallback: Try using the SQL editor endpoint
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseKey
            },
            body: JSON.stringify({ sql_string: sql })
          })
          return response.json()
        })

      if (error) {
        // Try alternative approach using direct fetch to Supabase SQL API
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/sql',
              'apikey': supabaseKey,
              'Prefer': 'return=minimal'
            },
            body: sql
          })

          if (response.ok) {
            console.log('   ✅ Success')
            successCount++
          } else {
            console.log(`   ⚠️  ${response.statusText}`)
            failureCount++
          }
        } catch (e) {
          console.log(`   ❌ Error: ${error.message || 'Unknown error'}`)
          failureCount++
        }
      } else {
        console.log('   ✅ Success')
        successCount++
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`)
      failureCount++
    }
  }

  console.log('\n🎯 Execution Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failureCount}`)

  console.log('\n🔍 Verifying Baby project creation...')
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('name', 'baby')
      .single()

    if (data) {
      console.log('\n✅ Baby project created successfully!')
      console.log(`   📝 Name: ${data.name}`)
      console.log(`   📄 Title: ${data.title}`)
      console.log(`   📅 Status: ${data.status}`)
      console.log(`   🏷️ Type: ${data.type}`)
    } else {
      console.log('\n❌ Baby project not found:', error?.message)
    }
  } catch (e) {
    console.log('\n❌ Error verifying Baby project:', e.message)
  }

  console.log('\n📌 Database Dashboard:')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   SQL Editor: ${supabaseUrl}/project/sql`)
  console.log(`   Table Editor: ${supabaseUrl}/project/editor`)

  console.log('\n💡 Next Steps:')
  console.log('   1. Enable Row Level Security (RLS) on all tables')
  console.log('   2. Set up RLS policies for secure access')
  console.log('   3. Create additional user accounts as needed')
  console.log('   4. Start tracking baby milestones! 👶')
}

// Execute the setup
executeSetup().catch(console.error)
