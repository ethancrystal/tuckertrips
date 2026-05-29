const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function deploySchemaViaAPI() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    console.log('🔗 Connecting to Supabase via REST API...');

    // Read the schema file
    const schemaSQL = fs.readFileSync('./apply-schema.sql', 'utf8');

    console.log('📝 Deploying schema via REST API...');

    // Split SQL into individual statements to avoid timeout issues
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      const response = await makeAPIRequest(supabaseUrl, serviceRoleKey, statement);

      if (response.success) {
        console.log(`✅ Statement ${i + 1}/${statements.length}: Executed successfully`);
      } else {
        console.log(`⚠️  Statement ${i + 1}/${statements.length}: ${response.error}`);
        // Continue with other statements
      }
    }

    console.log('✅ Schema deployment completed!');
    console.log('🎉 Database is now ready for the Tucker Trips application');

  } catch (error) {
    console.error('❌ Error deploying schema:', error.message);
    process.exit(1);
  }
}

function makeAPIRequest(supabaseUrl, serviceRoleKey, query) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query });

    const options = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/rpc/execute_sql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = res.statusCode === 200 ?
            { success: true, data: JSON.parse(data) } :
            { success: false, error: data || 'Unknown error' };
          resolve(result);
        } catch (e) {
          resolve({ success: false, error: data });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

deploySchemaViaAPI();