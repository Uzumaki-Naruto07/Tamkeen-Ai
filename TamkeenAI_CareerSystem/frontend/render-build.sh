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

# Install Tailwind CSS and PostCSS plugins explicitly
echo "Installing Tailwind CSS and PostCSS plugins..."
npm install --no-save @tailwindcss/postcss@4.0.17 autoprefixer@10.4.17 postcss@8.5.3 tailwindcss@4.0.17

# Install all dependencies with legacy peer deps
echo "Installing remaining dependencies..."
npm install --legacy-peer-deps

# Copy simplified configuration for Render
echo "Configuring for Render deployment..."
cp vite.render.config.js vite.config.js
cp package.render.json package.build.json

# Ensure we're using the existing CJS PostCSS config
echo "Setting up PostCSS configuration..."
cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {}
  }
}
EOF

# Also create the ESM version
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {}
  }
}
EOF

# Verify the tailwind.config.js exists
echo "Checking Tailwind configuration..."
if [ -f tailwind.config.js ]; then
  echo "Using existing tailwind.config.js"
else
  echo "Creating tailwind.config.js..."
  cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
fi

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