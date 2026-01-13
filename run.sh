#!/bin/bash

# Nexus Quick Start Script
# This script installs dependencies, builds, and runs the Nexus application

set -e  # Exit on error

echo "======================================"
echo "🚀 Nexus Application Launcher"
echo "======================================"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing globally..."
    npm install -g pnpm
fi

echo "✓ pnpm version: $(pnpm -v)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✓ Dependencies installed"
    echo ""
else
    echo "✓ Dependencies already installed"
    echo ""
fi

# Check if build is needed
if [ ! -d "apps/web/.next" ] || [ ! -d "packages/orchestration/dist" ]; then
    echo "🔨 Building project..."
    pnpm build
    echo "✓ Build completed"
    echo ""
else
    echo "✓ Build already exists (run 'pnpm build' to rebuild)"
    echo ""
fi

# Check environment variables
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  Warning: apps/web/.env.local not found"
    echo "   Please create it with required environment variables"
    echo "   See apps/web/.env.example for reference"
    echo ""
fi

# Kill any existing Node processes on common ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000,3001 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Start development server
echo "======================================"
echo "🎯 Starting Nexus Development Server"
echo "======================================"
echo ""
echo "Server will be available at:"
echo "  → http://localhost:3000"
echo "  → http://localhost:3001 (if 3000 is taken)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

pnpm dev
