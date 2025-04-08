#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting TamkeenAI Career System Frontend${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Update .env file with correct environment variables
echo -e "${BLUE}Updating frontend environment variables...${NC}"
cat > "${SCRIPT_DIR}/frontend/.env" << EOL
VITE_API_URL=http://localhost:5001
VITE_INTERVIEW_API_URL=http://localhost:5001
VITE_USE_MOCK_DATA=true
VITE_ENABLE_MOCK_DATA=true
VITE_USE_DEEPSEEK_OPENAI_FALLBACK=true
VITE_ENABLE_MOCK_FALLBACK=true
VITE_ENABLE_BACKEND_CHECK=false
EOL

# Change to the frontend directory
echo -e "${BLUE}Changing to frontend directory...${NC}"
cd "${SCRIPT_DIR}/frontend" || { echo -e "${RED}Failed to change to frontend directory${NC}"; exit 1; }

# Check if port is already in use
if command -v lsof &> /dev/null && lsof -i:3000 &>/dev/null; then
    echo -e "${RED}Error: Port 3000 is already in use. Killing the process...${NC}"
    lsof -ti:3000 | xargs kill -9 || true
    sleep 1
fi

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Running npm install...${NC}"
    npm install || { echo -e "${RED}Failed to install frontend dependencies${NC}"; exit 1; }
else
    echo -e "${GREEN}node_modules already exists, skipping install${NC}"
fi

# Create a fixed vite.config.js file that works
echo -e "${BLUE}Ensuring Vite configuration is correct...${NC}"
cat > "${SCRIPT_DIR}/frontend/vite.config.js" << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    open: true,
    cors: true,
    hmr: {
      clientPort: 3000,
      host: 'localhost',
      protocol: 'ws',
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      src: path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'date-fns',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
EOL

# Start the frontend with NODE_OPTIONS to increase memory limit
echo -e "${BLUE}Starting frontend development server...${NC}"
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev -- --port 3000 --host 