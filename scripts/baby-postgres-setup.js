// Baby Project Database Setup using PostgreSQL
const { Client } = require('pg')

// PostgreSQL connection details
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ Missing required env var: DATABASE_URL')
  process.exit(1)
}

console.log('🔧 Setting up Baby Project Database (PostgreSQL Connection)...')
console.log(`📡 Connecting to PostgreSQL...\n`)

async function setupDatabase() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL database')

    // Read the SQL file
    const fs = require('fs')
    const path = require('path')

    const sqlPath = path.join(__dirname, 'baby-project-schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📝 Read SQL schema file successfully')

    // Execute the SQL
    console.log('\n📋 Executing SQL schema...')
    await client.query(sqlContent)

    console.log('✅ Database schema created successfully!')

    // Verify Baby project was created
    const { rows } = await client.query(
      "SELECT * FROM projects WHERE name = 'baby'"
    )

    if (rows.length > 0) {
      const project = rows[0]
      console.log('\n✅ Baby project verified:')
      console.log(`   📝 Name: ${project.name}`)
      console.log(`   📄 Title: ${project.title}`)
      console.log(`   📅 Status: ${project.status}`)
      console.log(`   🏷️ Type: ${project.type}`)

      // Count milestones
      const { count } = await client.query(
        "SELECT COUNT(*) FROM milestones WHERE project_id = $1",
        [project.id]
      )
      console.log(`   🎯 Milestones: ${count}`)
    }

    console.log('\n🎯 Setup Complete!')
    console.log('\n📊 Summary:')
    console.log('   • All tables created with proper relationships')
    console.log('   • Row Level Security enabled')
    console.log('   • Triggers for timestamps created')
    console.log('   • Helper functions defined')
    console.log('   • Sample data inserted')

    console.log('\n📌 Database Info:')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   SQL Editor: ${supabaseUrl}/project/sql`)
    console.log(`   Table Editor: ${supabaseUrl}/project/editor`)

  } catch (error) {
    console.error('\n💥 Setup failed:', error.message)

    if (error.code === '23505') {
      console.log('\nℹ️  Some data already exists (this is normal)')
    } else if (error.code === '3D000') {
      console.log('\n❌ Database does not exist')
    } else if (error.code === '28P01') {
      console.log('\n❌ Authentication failed - check credentials')
    } else {
      console.log('\n⚠️  Please check the SQL syntax')
      console.log('   You can also run it manually in the Supabase SQL Editor')
    }
  } finally {
    await client.end()
    console.log('\n🔌 Disconnected from PostgreSQL')
  }
}

// Execute the setup
setupDatabase().catch(console.error)
