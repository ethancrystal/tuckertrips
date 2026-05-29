#!/usr/bin/env node
/**
 * Deploy schema using HTTP API workaround since direct connection fails
 */

const https = require('https');
const fs = require('fs');

const schema = fs.readFileSync('./apply-schema.sql', 'utf8');
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_17f9cc77c055dac40fe33dbb83e87c73aa44ab22';
const projectRef = 'rogrzxjxtypzsempesrf';

console.log('🚀 Deploying schema to project:', projectRef);
console.log('📄 Schema size:', schema.length, 'bytes\n');

const data = JSON.stringify({
  query: schema
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Schema deployed successfully!');
      console.log('Response:', body.substring(0, 200));
    } else if (res.statusCode === 403) {
      console.error('❌ Permission denied. Management API requires upgraded account.');
      console.error('\n📋 Please deploy via Supabase Dashboard:');
      console.error(`   https://supabase.com/dashboard/project/${projectRef}/sql\n`);
    } else {
      console.error('❌ Deployment failed:', res.statusCode);
      console.error('Response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(data);
req.end();
