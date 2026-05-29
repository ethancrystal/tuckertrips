const { execSync } = require('child_process');

const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  console.error('Missing required environment variables:');
  for (const envName of missingEnv) {
    console.error(`- ${envName}`);
  }
  process.exit(1);
}

try {
  console.log('Building project with pnpm...');
  execSync('pnpm build', { stdio: 'inherit' });

  console.log('Deploying to Vercel production...');
  execSync('vercel --prod', {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('Deployment completed successfully.');
} catch (error) {
  console.error('Deployment failed.');
  process.exit(error.status || 1);
}
