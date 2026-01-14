#!/bin/bash

echo "Creating standalone deployment package..."

# Create deploy directory
rm -rf deploy-standalone
mkdir -p deploy-standalone

# Copy built Next.js app
echo "Copying built app..."
cp -r apps/web/.next deploy-standalone/.next
cp -r apps/web/public deploy-standalone/public 2>/dev/null || true
cp apps/web/package.json deploy-standalone/package.json
cp apps/web/next.config.ts deploy-standalone/next.config.ts

# Create standalone package.json with resolved dependencies
echo "Creating standalone package.json..."
cat > deploy-standalone/package.json << 'EOFPKG'
{
  "name": "web-standalone",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "next start",
    "build": "next build"
  },
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.90.1",
    "@upstash/ratelimit": "^2.0.8",
    "@upstash/redis": "^1.36.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.26.2",
    "lucide-react": "^0.562.0",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "tailwind-merge": "^3.4.0",
    "zod": "^3.24.1"
  }
}
EOFPKG

# Copy source files that Next.js needs
echo "Copying source files..."
cp -r apps/web/app deploy-standalone/app
cp -r apps/web/components deploy-standalone/components
cp -r apps/web/lib deploy-standalone/lib
cp apps/web/tailwind.config.ts deploy-standalone/tailwind.config.ts 2>/dev/null || true
cp apps/web/tsconfig.json deploy-standalone/tsconfig.json 2>/dev/null || true
cp apps/web/middleware.ts deploy-standalone/middleware.ts 2>/dev/null || true

# Copy workspace packages inline
echo "Inlining workspace packages..."
mkdir -p deploy-standalone/lib/orchestration
mkdir -p deploy-standalone/lib/shared

cp -r packages/orchestration/dist/* deploy-standalone/lib/orchestration/ 2>/dev/null || echo "Orchestration dist not found"
cp -r packages/shared/src/* deploy-standalone/lib/shared/ 2>/dev/null || echo "Shared src not found"

echo ""
echo "✅ Standalone deployment package created!"
echo "Location: deploy-standalone/"
echo ""
echo "To deploy:"
echo "  cd deploy-standalone"
echo "  vercel --prod"

