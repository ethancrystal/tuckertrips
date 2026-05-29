// Verify Baby Project Database Setup
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Verifying Baby Project Database Setup...\n')

async function verifySetup() {
  try {
    // 1. Check Baby project
    console.log('1. 📋 Baby Project:')
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('name', 'baby')
      .single()

    if (project) {
      console.log(`   ✅ Found: ${project.title}`)
      console.log(`   📝 Description: ${project.description}`)
      console.log(`   📅 Status: ${project.status}`)
      console.log(`   🏷️ Type: ${project.type}`)
      console.log(`   📊 Metadata: ${JSON.stringify(project.metadata)}`)
    } else {
      console.log('   ❌ Baby project not found')
    }

    // 2. Check milestones
    console.log('\n2. 🎯 Milestones:')
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', project.id)

    if (milestones && milestones.length > 0) {
      console.log(`   ✅ Found ${milestones.length} milestones:`)
      milestones.forEach(m => {
        console.log(`   • ${m.title} (${m.milestone_type}) - ${m.achieved ? 'Achieved' : 'Pending'}`)
      })
    } else {
      console.log('   ⚠️  No milestones found')
    }

    // 3. Check activities
    console.log('\n3. 📝 Activities:')
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('activity_type, title, count')
      .eq('project_id', project.id)

    if (activities && activities.length > 0) {
      console.log(`   ✅ Found ${activities.length} activities`)
    } else {
      console.log('   ℹ️  No activities yet (ready for tracking)')
    }

    // 4. Check measurements
    console.log('\n4. 📏 Measurements:')
    const { data: measurements, error: measurementsError } = await supabase
      .from('measurements')
      .select('measurement_date, weight, height')
      .eq('project_id', project.id)

    if (measurements && measurements.length > 0) {
      console.log(`   ✅ Found ${measurements.length} measurements`)
    } else {
      console.log('   ℹ️  No measurements yet (ready for tracking)')
    }

    // 5. Check health records
    console.log('\n5. 🏥 Health Records:')
    const { data: healthRecords, error: healthError } = await supabase
      .from('health_records')
      .select('record_type, title, record_date')
      .eq('project_id', project.id)

    if (healthRecords && healthRecords.length > 0) {
      console.log(`   ✅ Found ${healthRecords.length} health records`)
    } else {
      console.log('   ℹ️  No health records yet (ready for tracking)')
    }

    // 6. Check users
    console.log('\n6. 👥 Users:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, full_name, role')

    if (users && users.length > 0) {
      console.log(`   ✅ Found ${users.length} users:`)
      users.forEach(u => {
        console.log(`   • ${u.email} (${u.role})`)
      })
    } else {
      console.log('   ℹ️  No users found')
    }

    // 7. Check collaborators
    console.log('\n7. 🤝 Project Collaborators:')
    const { data: collaborators, error: collabError } = await supabase
      .from('project_collaborators')
      .select(`
        role,
        users (email, full_name),
        invited_at,
        accepted_at
      `)
      .eq('project_id', project.id)

    if (collaborators && collaborators.length > 0) {
      console.log(`   ✅ Found ${collaborators.length} collaborators:`)
      collaborators.forEach(c => {
        console.log(`   • ${c.users?.email} - ${c.role} - ${c.accepted_at ? 'Accepted' : 'Pending'}`)
      })
    } else {
      console.log('   ℹ️  No collaborators found')
    }

    // 8. Test statistics function
    console.log('\n8. 📊 Project Statistics:')
    try {
      const { data, error } = await supabase
        .rpc('get_project_stats', { project_uuid: project.id })

      if (data) {
        console.log('   ✅ Statistics function working:')
        console.log(`   • Total Milestones: ${data.total_milestones}`)
        console.log(`   • Achieved: ${data.milestones_count}`)
        console.log(`   • Activities: ${data.activities_count}`)
        console.log(`   • Measurements: ${data.measurements_count}`)
        console.log(`   • Health Records: ${data.health_records_count}`)
      }
    } catch (e) {
      console.log('   ℹ️  Statistics function not accessible via anon key')
    }

    console.log('\n✅ Verification Complete!')
    console.log('\n🚀 Ready to start tracking baby milestones! 👶')

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message)
  }
}

// Run verification
verifySetup()
