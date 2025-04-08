#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ASCII Art
echo -e "╔════════════════════════════════════════════════════════════╗"
echo -e "║                                                            ║"
echo -e "║  ████████╗ █████╗ ███╗   ███╗██╗  ██╗███████╗███████╗███╗   ██╗ ║"
echo -e "║  ╚══██╔══╝██╔══██╗████╗ ████║██║ ██╔╝██╔════╝██╔════╝████╗  ██║ ║"
echo -e "║     ██║   ███████║██╔████╔██║█████╔╝ █████╗  █████╗  ██╔██╗ ██║ ║"
echo -e "║     ██║   ██╔══██║██║╚██╔╝██║██╔═██╗ ██╔══╝  ██╔══╝  ██║╚██╗██║ ║"
echo -e "║     ██║   ██║  ██║██║ ╚═╝ ██║██║  ██╗███████╗███████╗██║ ╚████║ ║"
echo -e "║     ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝ ║"
echo -e "║                                                            ║"
echo -e "║           Career Intelligence System - v1.0.0               ║"
echo -e "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}TamkeenAI Career Intelligence System Launcher${NC}"
echo -e "${BLUE}This script will start both backend and frontend with proper configuration${NC}"
echo ""

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "${SCRIPT_DIR}" || { echo -e "${RED}Failed to change to script directory${NC}"; exit 1; }

# Check for required tools
echo -e "${BLUE}Checking for required tools...${NC}"
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Python 3 is required but not installed.${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}"; exit 1; }

# Check if ports are available and kill any process using them
echo -e "${BLUE}Checking port availability...${NC}"
if command -v lsof &> /dev/null; then
    if lsof -i:5001 &>/dev/null; then
        echo -e "${YELLOW}Warning: Port 5001 is already in use. Attempting to free this port...${NC}"
        lsof -ti:5001 | xargs kill -9 || { echo -e "${RED}Failed to kill process using port 5001. Please free this port manually.${NC}"; }
        sleep 2
    fi
    if lsof -i:3000 &>/dev/null; then
        echo -e "${YELLOW}Warning: Port 3000 is already in use. Attempting to free this port...${NC}"
        lsof -ti:3000 | xargs kill -9 || { echo -e "${RED}Failed to kill process using port 3000. Please free this port manually.${NC}"; }
        sleep 2
    fi
fi

# Also use pkill to ensure processes are terminated
echo -e "${BLUE}Ensuring no Python or Node processes are running on the required ports...${NC}"
pkill -f "uvicorn.*5001" || true
pkill -f "vite.*3000" || true
pkill -f "node.*3000" || true
sleep 2

# Update .env file with correct environment variables for frontend
echo -e "${BLUE}Updating frontend environment variables...${NC}"
cat > "${SCRIPT_DIR}/frontend/.env" << EOL
VITE_API_URL=http://localhost:5001
VITE_INTERVIEW_API_URL=http://localhost:5001
VITE_USE_MOCK_DATA=true
VITE_ENABLE_MOCK_DATA=true
VITE_USE_DEEPSEEK_OPENAI_FALLBACK=true
VITE_ENABLE_MOCK_FALLBACK=true
VITE_ENABLE_BACKEND_CHECK=true
EOL

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
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
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

# Install backend dependencies and start backend
echo -e "${BLUE}Starting backend server...${NC}"
chmod +x "${SCRIPT_DIR}/run_backend.sh"

# Add DeepSeek API key to environment
export DEEPSEEK_API_KEY="openai-route-deepseek-r1-free"
echo -e "${GREEN}DeepSeek API key set for resume analysis${NC}"

# Add ATS-specific environment variables to disable mock data
export ENABLE_REAL_ATS=true
export DISABLE_ATS_MOCK=true
echo -e "${GREEN}ATS mock data disabled - using real resume analysis${NC}"

"${SCRIPT_DIR}/run_backend.sh" &
BACKEND_PID=$!

# Comments about the improved backend
echo -e "${YELLOW}Backend now configured with:${NC}"
echo -e " - DeepSeek API for resume analysis"
echo -e " - Real ATS analysis (no mock data)"
echo -e " - Uvicorn server for faster performance"
echo -e " - Optimized text extraction"

# Start interview API on port 5001
echo -e "${BLUE}Starting interview API on port 5001...${NC}"
chmod +x "${SCRIPT_DIR}/run_interview_api.sh"
"${SCRIPT_DIR}/run_interview_api.sh" &
INTERVIEW_API_PID=$!

# Wait for the Interview API to start
echo -e "${YELLOW}Waiting for Interview API to initialize... (3 seconds)${NC}"
sleep 3

# Start frontend server
echo -e "${BLUE}Starting frontend server...${NC}"
cd "${SCRIPT_DIR}/frontend" || { 
    echo -e "${RED}Failed to change to frontend directory${NC}"
    kill $BACKEND_PID $INTERVIEW_API_PID 2>/dev/null || true
    exit 1 
}

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install || {
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        kill $BACKEND_PID $INTERVIEW_API_PID 2>/dev/null || true
        exit 1
    }
fi

# Start the frontend with NODE_OPTIONS to increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
echo -e "${BLUE}Starting frontend development server...${NC}"
npm run dev -- --port 3000 --host &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to initialize... (5 seconds)${NC}"
sleep 5

# Show success message
echo ""
echo -e "${GREEN}TamkeenAI Career Intelligence System is now running!${NC}"
echo -e "${BLUE}Backend URL: ${GREEN}http://localhost:5001/api${NC}"
echo -e "${BLUE}Interview API URL: ${GREEN}http://localhost:5001/api/interviews${NC}"
echo -e "${BLUE}Frontend URL: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Handle clean shutdown
trap 'echo -e "\n${BLUE}Shutting down TamkeenAI Career System...${NC}"; kill $BACKEND_PID $FRONTEND_PID $INTERVIEW_API_PID 2>/dev/null || true; echo -e "${GREEN}Servers stopped${NC}"; exit 0' INT

# Wait for processes
wait 