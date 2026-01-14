#!/bin/bash

# Get Vercel token
TOKEN=$(vercel whoami 2>&1 | grep -oP 'token: \K.*' || echo "")

if [ -z "$TOKEN" ]; then
  echo "Getting token from vercel login..."
  vercel login
  TOKEN=$(vercel whoami 2>&1 | grep -oP 'token: \K.*')
fi

PROJECT_ID="prj_YnJypKiH0Fq4Rt6QzsDB5TJ2BfYP"
TEAM_ID="team_i33OLUzFMRZWMyMgPRia48tk"

echo "Updating project settings..."

# Update project settings
curl -X PATCH "https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "framework": "nextjs",
    "rootDirectory": "apps/web",
    "buildCommand": "cd ../.. && pnpm turbo run build --filter=web",
    "installCommand": "cd ../.. && pnpm install",
    "nodeVersion": "20.x"
  }'

echo ""
echo "Project settings updated!"
