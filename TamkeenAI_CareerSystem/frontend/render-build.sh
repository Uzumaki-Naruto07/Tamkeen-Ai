#!/bin/bash

# Exit on error
set -e

echo "Starting Render build process..."

# Clean up node_modules to ensure fresh installation
echo "Cleaning previous installations..."
rm -rf node_modules

# Install React 18 core packages first
echo "Installing React 18 core dependencies..."
npm install --no-save react@18.2.0 react-dom@18.2.0

# Install all dependencies with legacy peer deps
echo "Installing remaining dependencies..."
npm install --legacy-peer-deps

# Copy simplified configuration for Render
echo "Configuring for Render deployment..."
cp vite.render.config.js vite.config.js
cp package.render.json package.build.json

# Create public directory and redirects file if they don't exist
echo "Setting up SPA routing..."
mkdir -p public
echo "/* /index.html 200" > public/_redirects

# Build the application
echo "Building application..."
VITE_API_URL=https://tamkeen-main-api.onrender.com \
VITE_INTERVIEW_API_URL=https://tamkeen-interview-api.onrender.com \
VITE_USE_MOCK_DATA=false \
VITE_ENABLE_MOCK_DATA=false \
VITE_ENABLE_MOCK_FALLBACK=false \
VITE_ENABLE_BACKEND_CHECK=true \
npm run build

echo "Build completed successfully!" 