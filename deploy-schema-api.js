#!/usr/bin/env node
/**
 * Deploy schema to Supabase via Management API
 * Uses the Supabase Management API to execute SQL
 */

const fs = require('fs');
const https = require('https');

// Read environment variables
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'rogrzxjxtypzsempesrf';

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN not found in environment');
  console.error('Please set it in your .env.local file');
  process.exit(1);
}

// Read the schema file
const schemaPath = './apply-schema.sql';
if (!fs.existsSync(schemaPath)) {
  console.error(`❌ Error: Schema file not found: ${schemaPath}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(schemaPath, 'utf8');
console.log(`📄 Read schema file: ${schemaPath} (${sqlContent.length} bytes)`);

// Split SQL into individual statements (simple approach)
// More robust: handle multi-line statements and comments
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📊 Found ${statements.length} SQL statements to execute`);
console.log(`\n🚀 Deploying to Supabase project: ${PROJECT_REF}\n`);

// Execute SQL via Supabase Management API
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            resolve({ success: true, data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Execute all statements sequentially
async function deploySchema() {
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 100).replace(/\n/g, ' ');
    
    try {
      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);
      await executeSql(statement);
      console.log('✅');
      successCount++;
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      errorCount++;
      
      // Continue with remaining statements unless it's a critical error
      if (error.message.includes('already exists')) {
        console.log('    ⚠️  Already exists, continuing...');
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Successfully executed: ${successCount} statements`);
  if (errorCount > 0) {
    console.log(`⚠️  Errors/Warnings: ${errorCount} statements`);
  }
  console.log(`${'='.repeat(60)}\n`);
  
  if (errorCount > 0 && successCount === 0) {
    console.error('❌ Schema deployment failed');
    process.exit(1);
  } else {
    console.log('🎉 Schema deployment completed!');
  }
}

// Run deployment
deploySchema().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
