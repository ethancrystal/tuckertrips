#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const DATABASE_URL = process.env.DATABASE_URL

const BABY_PROJECT_TABLES = [
  'projects',
  'milestones',
  'activities',
  'measurements',
  'health_records',
  'users',
  'project_collaborators',
]

const TUCKER_TRIPS_TABLES = [
  'profiles',
  'trips',
  'trip_shares',
  'pending_shares',
  'messages',
  'trip_categories',
  'friendships',
]

const REQUIRED_FUNCTIONS = [
  'get_project_stats',
  'get_user_conversations',
  'get_unread_message_count',
  'mark_conversation_read',
  'tucker_handle_new_user',
  'tucker_handle_updated_at',
]

const formatTableStatus = (name, exists) => `${exists ? '✅' : '❌'} ${name} - ${exists ? 'EXISTS' : 'MISSING'}`

async function main() {
  if (!DATABASE_URL) {
    console.error('❌ Missing `DATABASE_URL` (expected in `.env.local`).')
    process.exit(1)
  }

  if (SUPABASE_URL) {
    console.log('============================================================')
    console.log(`📍 URL: ${SUPABASE_URL}`)
    console.log('')
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()

  try {
    const { rows: tableRows } = await client.query(
      "select tablename from pg_tables where schemaname='public' order by tablename"
    )
    const publicTables = new Set(tableRows.map((r) => r.tablename))

    const { rows: functionRows } = await client.query(
      "select proname from pg_proc where pronamespace = 'public'::regnamespace order by proname"
    )
    const publicFunctions = new Set(functionRows.map((r) => r.proname))

    console.log('📊 BABY PROJECT TABLES:')
    console.log('----------------------------------------')
    for (const table of BABY_PROJECT_TABLES) {
      console.log(formatTableStatus(table, publicTables.has(table)))
    }

    console.log('')
    console.log('🧳 TUCKER TRIPS TABLES:')
    console.log('----------------------------------------')
    for (const table of TUCKER_TRIPS_TABLES) {
      console.log(formatTableStatus(table, publicTables.has(table)))
    }

    console.log('')
    console.log('⚙️  FUNCTIONS & TRIGGERS:')
    console.log('----------------------------------------')
    for (const fn of REQUIRED_FUNCTIONS) {
      console.log(`${publicFunctions.has(fn) ? '✅' : '❌'} ${fn} - ${publicFunctions.has(fn) ? 'EXISTS' : 'MISSING'}`)
    }

    const babyOk = BABY_PROJECT_TABLES.every((t) => publicTables.has(t))
    const tripsOk = TUCKER_TRIPS_TABLES.every((t) => publicTables.has(t))

    console.log('')
    console.log('============================================================')
    console.log('📋 DEPLOYMENT SUMMARY:')
    console.log('----------------------------------------')
    console.log(`Baby Project: ${BABY_PROJECT_TABLES.filter((t) => publicTables.has(t)).length}/${BABY_PROJECT_TABLES.length} tables deployed`)
    console.log(`Tucker Trips: ${TUCKER_TRIPS_TABLES.filter((t) => publicTables.has(t)).length}/${TUCKER_TRIPS_TABLES.length} tables deployed`)
    console.log(`Total: ${BABY_PROJECT_TABLES.concat(TUCKER_TRIPS_TABLES).filter((t) => publicTables.has(t)).length}/${BABY_PROJECT_TABLES.length + TUCKER_TRIPS_TABLES.length} tables deployed`)
    console.log('')

    if (!tripsOk) {
      console.log('⚠️  Tucker Trips tables NOT fully deployed.')
      process.exitCode = 2
    } else {
      console.log('✅ Tucker Trips: FULLY DEPLOYED')
    }

    if (!babyOk) {
      console.log('⚠️  Baby Project tables NOT fully deployed.')
      process.exitCode = 2
    } else {
      console.log('✅ Baby Project: FULLY DEPLOYED')
    }
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('❌ Verification failed:', error?.message || error)
  process.exit(1)
})

