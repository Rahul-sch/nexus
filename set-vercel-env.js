#!/usr/bin/env node

/**
 * Automatically set environment variables in Vercel
 * Run: node set-vercel-env.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 VERCEL ENVIRONMENT VARIABLE SETUP\n');
console.log('This script will set all required environment variables in your Vercel project.\n');

// Environment variables to set
const envVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://ztmlfiyqeqdbsyboilmf.supabase.co',
    sensitive: false,
    description: 'Supabase project URL (public)'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bWxmaXlxZXFkYnN5Ym9pbG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ3MDMsImV4cCI6MjA4Mzg5MDcwM30.BagjK166_Y226X6Ipm-R8oopp3IGxcZZCAl4GC7jm98',
    sensitive: false,
    description: 'Supabase anonymous key (public)'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bWxmaXlxZXFkYnN5Ym9pbG1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDcwMywiZXhwIjoyMDgzODkwNzAzfQ.TNhwEcD-gR8eSFvkeSBeAltMxJ4gQm4I7VO_mt0409Q',
    sensitive: true,
    description: 'Supabase service role key (SENSITIVE - full database access)'
  },
  {
    name: 'VAULT_ENCRYPTION_SECRET',
    value: 'WDpMUb2ancGWewPLq9jUaofN-70LkFxGRTiEfK5NktE',
    sensitive: true,
    description: 'Vault encryption secret (SENSITIVE - encrypts API keys)'
  }
];

async function setEnvVar(envVar) {
  const sensitiveFlag = envVar.sensitive ? '--sensitive' : '';
  const command = `vercel env add ${envVar.name} production ${sensitiveFlag} --yes`;

  try {
    console.log(`\n📝 Setting: ${envVar.name}`);
    console.log(`   ${envVar.description}`);

    // Write value to stdin
    execSync(command, {
      input: envVar.value + '\n',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    console.log(`✅ Successfully set ${envVar.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to set ${envVar.name}`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log('This will set the following environment variables:\n');

  envVars.forEach((envVar, index) => {
    console.log(`${index + 1}. ${envVar.name} ${envVar.sensitive ? '(SENSITIVE)' : '(PUBLIC)'}`);
    console.log(`   ${envVar.description}`);
  });

  console.log('\n');

  rl.question('Do you want to proceed? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Aborted. No changes made.');
      rl.close();
      process.exit(0);
    }

    console.log('\n🚀 Setting environment variables...\n');

    let successCount = 0;
    for (const envVar of envVars) {
      const success = await setEnvVar(envVar);
      if (success) successCount++;

      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n========================================');
    console.log(`✅ Successfully set ${successCount}/${envVars.length} environment variables`);
    console.log('========================================\n');

    if (successCount === envVars.length) {
      console.log('🎉 All environment variables are set!\n');
      console.log('Next steps:');
      console.log('1. Redeploy your app: vercel --prod');
      console.log('2. Or wait for automatic deployment from GitHub\n');
    } else {
      console.log('⚠️  Some variables failed to set. You may need to set them manually.');
      console.log('   Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables\n');
    }

    rl.close();
  });
}

// Check if in correct directory
const fs = require('fs');
if (!fs.existsSync('./apps/web')) {
  console.error('\n❌ Error: Must run from nexus root directory');
  console.error('   cd to: C:\\Users\\rahul\\Desktop\\Prompty\\nexus\n');
  process.exit(1);
}

main();
