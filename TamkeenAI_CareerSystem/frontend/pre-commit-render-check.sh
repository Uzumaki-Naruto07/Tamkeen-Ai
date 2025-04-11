#!/bin/bash

# This script verifies that your code will build correctly on Render
# You can run this before committing to avoid deploy failures

echo "Checking Render compatibility..."

# Save original config files
cp vite.config.js vite.config.js.bak
cp package.json package.json.bak

# Copy Render configurations
cp vite.render.config.js vite.config.js
cp package.render.json package.build.json

# Create public directory and redirects file if they don't exist
mkdir -p public
echo "/* /index.html 200" > public/_redirects

# Try to build
echo "Attempting build with Render configuration..."
VITE_API_URL=https://tamkeen-main-api.onrender.com \
VITE_INTERVIEW_API_URL=https://tamkeen-interview-api.onrender.com \
VITE_USE_MOCK_DATA=false \
VITE_ENABLE_MOCK_DATA=false \
VITE_ENABLE_MOCK_FALLBACK=false \
VITE_ENABLE_BACKEND_CHECK=true \
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful! Your code should work on Render."
else
  echo "❌ Build failed! Your code may not deploy correctly on Render."
fi

# Restore original config files
mv vite.config.js.bak vite.config.js
mv package.json.bak package.json

echo "Check complete. Original configuration restored." 