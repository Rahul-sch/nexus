@echo off
REM Nexus Quick Start Script (Windows)
REM This script installs dependencies, builds, and runs the Nexus application

echo ======================================
echo 🚀 Nexus Application Launcher
echo ======================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ first.
    exit /b 1
)

echo ✓ Node.js installed
call node -v

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  pnpm is not installed. Installing globally...
    npm install -g pnpm
)

echo ✓ pnpm installed
call pnpm -v
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call pnpm install
    echo ✓ Dependencies installed
    echo.
) else (
    echo ✓ Dependencies already installed
    echo.
)

REM Check if build is needed
if not exist "apps\web\.next" (
    echo 🔨 Building project...
    call pnpm build
    echo ✓ Build completed
    echo.
) else (
    echo ✓ Build already exists ^(run 'pnpm build' to rebuild^)
    echo.
)

REM Check environment variables
if not exist "apps\web\.env.local" (
    echo ⚠️  Warning: apps\web\.env.local not found
    echo    Please create it with required environment variables
    echo    See apps\web\.env.example for reference
    echo.
)

REM Kill any existing Node processes
echo 🧹 Cleaning up existing processes...
powershell -Command "Stop-Process -Name node -Force -ErrorAction SilentlyContinue"
timeout /t 1 /nobreak >nul

REM Start development server
echo ======================================
echo 🎯 Starting Nexus Development Server
echo ======================================
echo.
echo Server will be available at:
echo   → http://localhost:3000
echo   → http://localhost:3001 ^(if 3000 is taken^)
echo.
echo Press Ctrl+C to stop the server
echo.

call pnpm dev
