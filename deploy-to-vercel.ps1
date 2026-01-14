# PowerShell Deployment Script for Nexus
# Run this script to deploy your app to Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 NEXUS DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if in correct directory
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Step 2: Remind about database migration
Write-Host "⚠️  STEP 1: DEPLOY DATABASE MIGRATION FIRST!" -ForegroundColor Red
Write-Host "   Before deploying to Vercel, you MUST apply the RLS migration:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://supabase.com/dashboard/project/ztmlfiyqeqdbsyboilmf/sql/new" -ForegroundColor White
Write-Host "   2. Copy contents of: apps\web\supabase\migrations\005_rls_insert_update_policies.sql" -ForegroundColor White
Write-Host "   3. Paste and click 'Run'" -ForegroundColor White
Write-Host ""
$dbMigrationDone = Read-Host "Have you deployed the database migration? (yes/no)"

if ($dbMigrationDone -ne "yes") {
    Write-Host ""
    Write-Host "❌ Please deploy the database migration first!" -ForegroundColor Red
    Write-Host "   See: DEPLOY_NOW.md for detailed instructions" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host ""
Write-Host "✅ Database migration confirmed!" -ForegroundColor Green
Write-Host ""

# Step 3: Remind about environment variables
Write-Host "⚠️  STEP 2: SET ENVIRONMENT VARIABLES IN VERCEL!" -ForegroundColor Red
Write-Host "   Go to your Vercel project settings and add these variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Public variables:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host ""
Write-Host "   Sensitive variables (mark as 'Sensitive'):" -ForegroundColor Cyan
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "   - VAULT_ENCRYPTION_SECRET" -ForegroundColor White
Write-Host ""
Write-Host "   See DEPLOY_NOW.md for the actual values to use!" -ForegroundColor Yellow
Write-Host ""
$envVarsDone = Read-Host "Have you set all environment variables in Vercel? (yes/no)"

if ($envVarsDone -ne "yes") {
    Write-Host ""
    Write-Host "❌ Please set environment variables first!" -ForegroundColor Red
    Write-Host "   See: DEPLOY_NOW.md for detailed instructions" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host ""
Write-Host "✅ Environment variables confirmed!" -ForegroundColor Green
Write-Host ""

# Step 4: Navigate to web app directory
Write-Host "📂 Navigating to web app directory..." -ForegroundColor Cyan
Set-Location -Path "apps\web"
Write-Host "✅ Now in: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOYING TO VERCEL..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Link your project to Vercel (if first time)" -ForegroundColor White
Write-Host "  2. Build your application" -ForegroundColor White
Write-Host "  3. Deploy to production" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to start deployment or Ctrl+C to cancel..." -ForegroundColor Yellow
pause

Write-Host ""
Write-Host "🔨 Building and deploying..." -ForegroundColor Cyan
Write-Host ""

# Run Vercel deploy
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your app should now be live!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test your deployment URL" -ForegroundColor White
Write-Host "  2. Try signing up with a weak password (should be blocked)" -ForegroundColor White
Write-Host "  3. Sign up with a strong password (should work)" -ForegroundColor White
Write-Host "  4. Show your friends! 🚀" -ForegroundColor White
Write-Host ""
Write-Host "Security features active:" -ForegroundColor Cyan
Write-Host "  ✅ Password strength enforcement (12+ chars)" -ForegroundColor Green
Write-Host "  ✅ Rate limiting on all endpoints" -ForegroundColor Green
Write-Host "  ✅ Database RLS policies (20+ policies)" -ForegroundColor Green
Write-Host "  ✅ Security headers (HSTS, CSP, etc.)" -ForegroundColor Green
Write-Host "  ✅ API key encryption (AES-256-GCM)" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - SECURITY.md (full threat model)" -ForegroundColor White
Write-Host "  - DEPLOYMENT.md (deployment guide)" -ForegroundColor White
Write-Host "  - SECURITY_CHECKLIST.md (quick reference)" -ForegroundColor White
Write-Host ""
pause
