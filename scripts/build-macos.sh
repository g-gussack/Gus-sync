#!/bin/bash

# Build script for SyncTrack macOS application
# This script creates a distributable macOS app that can be run locally

set -e

echo "🔨 Building SyncTrack for macOS..."
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out/

# Build the app
echo "📦 Packaging the application..."
npm run make -- --platform=darwin

echo ""
echo "✅ Build complete!"
echo ""

# Find the built app
APP_PATH=$(find out -name "*.app" -type d 2>/dev/null | head -1)

if [ -n "$APP_PATH" ]; then
    echo "📍 Your app is located at:"
    echo "   $PROJECT_DIR/$APP_PATH"
    echo ""
    echo "🚀 To run the app, you can either:"
    echo "   1. Double-click the .app in Finder"
    echo "   2. Run: open \"$PROJECT_DIR/$APP_PATH\""
    echo ""
    
    # Ask if user wants to open the app now
    read -p "Would you like to open the app now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$APP_PATH"
    fi
else
    echo "📍 Check the 'out/' directory for your built application"
fi
