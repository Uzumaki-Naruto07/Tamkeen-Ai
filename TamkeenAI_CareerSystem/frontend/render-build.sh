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

# Install Tailwind CSS and PostCSS plugins explicitly with exact versions
echo "Installing Tailwind CSS and PostCSS plugins..."
npm install --no-save tailwindcss@3.3.3 postcss@8.4.31 autoprefixer@10.4.15

# Install all dependencies with legacy peer deps
echo "Installing remaining dependencies..."
npm install --legacy-peer-deps

# Copy simplified configuration for Render
echo "Configuring for Render deployment..."
cp vite.render.config.js vite.config.js
cp package.render.json package.build.json

# Set up PostCSS configuration
echo "Setting up PostCSS configuration..."
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
EOF

# Set up Tailwind configuration
echo "Setting up Tailwind configuration..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae3ff',
          200: '#7cc4fa',
          300: '#47a3f3',
          400: '#2186eb',
          500: '#0967d2',
          600: '#0552b5',
          700: '#03449e',
          800: '#01337d',
          900: '#002159',
        },
        secondary: {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#fdba8c',
          400: '#ff8a4c',
          500: '#ff5a1f',
          600: '#d03801',
          700: '#b43403',
          800: '#8a2c0d',
          900: '#771d1d',
        },
      },
    },
  },
  plugins: [],
}
EOF

# Replace the index.css file completely to remove any problematic code
echo "Creating simplified CSS file without @layer components that are causing issues..."
cat > src/index.css << 'EOF'
/* Tailwind CSS directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles below */
:root {
  --primary: #0ea5e9;
  --secondary: #f97316;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

html, body {
  height: 100%;
  min-height: 100vh;
}

body {
  min-width: 320px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}

/* RTL Support */
html[dir="rtl"] body {
  font-family: 'Cairo', sans-serif;
}

html[dir="rtl"] * {
  letter-spacing: 0;
}

#root {
  height: 100%;
  min-height: 100vh;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Replace @apply with direct CSS for components */
.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: #0552b5;
  color: white;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: #d03801;
  color: white;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

a {
  text-decoration: inherit;
}
EOF

# Create public directory and redirects file if they don't exist
echo "Setting up SPA routing..."
mkdir -p public
echo "/* /index.html 200" > public/_redirects

# Ensure browser support in package.json
echo "Updating package.json browser list..."
cat > package.json.patch << 'EOF'
{
  "browserslist": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ]
}
EOF
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const patch = JSON.parse(fs.readFileSync('package.json.patch', 'utf8'));
  Object.assign(pkg, patch);
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

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