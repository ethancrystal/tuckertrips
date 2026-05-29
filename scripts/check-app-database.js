#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const DATABASE_URL = process.env.DATABASE_URL

async function main() {
  if (!DATABASE_URL) {
    console.error('❌ Missing `DATABASE_URL` (expected in `.env.local`).')
    process.exit(1)
  }

  console.log('🔍 Checking configured database...')
  if (SUPABASE_URL) {
    console.log(`📡 Supabase URL: ${SUPABASE_URL}`)
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  try {
    const { rows } = await client.query(
      "select tablename from pg_tables where schemaname='public' order by tablename"
    )

    console.log('\n📋 Public tables:')
    for (const row of rows) {
      console.log(`- ${row.tablename}`)
    }
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('❌ Check failed:', error?.message || error)
  process.exit(1)
})

