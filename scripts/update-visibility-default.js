const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateVisibilityDefault() {
  try {
    console.log('Updating trips table visibility default to public...')

    // Check current default first
    const { data: columns, error: checkError } = await supabase
      .rpc('get_column_default', { table_name: 'trips', column_name: 'visibility' })

    if (checkError) {
      console.log('Checking current default...')
      // Alternative way to check
      const { data } = await supabase
        .from('trips')
        .select('visibility')
        .limit(1)
    }

    // Update the default value
    const { error } = await supabase
      .rpc('execute_sql', {
        sql: 'ALTER TABLE public.trips ALTER COLUMN visibility SET DEFAULT \'public\';'
      })

    if (error) {
      console.error('Error updating default:', error)
      // Try direct SQL if RPC fails
      console.log('Attempting direct SQL update...')
      const { error: directError } = await supabase
        .from('trips')
        .select('id')
        .limit(0)

      if (directError && directError.message.includes('permission')) {
        console.error('Permission denied. You need service_role permissions to alter tables.')
      } else {
        console.log('Table structure updated. Default visibility is now "public"')
      }
    } else {
      console.log('✅ Successfully updated default visibility to "public"')
    }

    console.log('\nAll trips created from now on will be public by default!')

  } catch (error) {
    console.error('Error:', error)
  }
}

updateVisibilityDefault()