#!/bin/bash

# Quick Fix Script for LuckyDraw Verificator
# This script will help you get started quickly

echo "🔧 LuckyDraw Verificator - Quick Fix Script"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory!"
    echo "Please run this from the luckydraw-verificator folder"
    exit 1
fi

echo "✓ Found package.json"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Running npm install..."
    npm install
fi

echo "✓ Dependencies installed"

# Check if scripts directory exists
if [ ! -d "scripts" ]; then
    echo "❌ Error: scripts directory not found!"
    exit 1
fi

echo "✓ Found scripts directory"

# Check if migrate.js exists
if [ ! -f "scripts/migrate.js" ]; then
    echo "❌ Error: migrate.js not found in scripts directory!"
    exit 1
fi

echo "✓ Found migrate.js"

# Try to run migration directly
echo ""
echo "🚀 Running database migration..."
echo ""

node scripts/migrate.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database initialized successfully!"
    echo ""
    echo "🎉 You're all set! Now run:"
    echo "   npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
else
    echo ""
    echo "❌ Migration failed. Check errors above."
    exit 1
fi
