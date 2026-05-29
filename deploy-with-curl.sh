#!/bin/bash

# Supabase configuration
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "❌ Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo "🔗 Deploying schema to Supabase..."
echo "📝 URL: $SUPABASE_URL"

# Read and execute the schema
SCHEMA_SQL=$(cat apply-schema.sql)

# Execute the schema using curl
echo "📝 Executing SQL schema..."

curl -X POST "$SUPABASE_URL/rest/v1/rpc/execute_sql" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SCHEMA_SQL" | jq -Rs .)}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "✅ Schema deployment attempted!"
echo "🎉 If you see HTTP Status: 200, the deployment was successful"
echo "📝 If you see errors, please run the schema manually in the Supabase SQL Editor:"
echo "   $SUPABASE_URL/project/sql"
