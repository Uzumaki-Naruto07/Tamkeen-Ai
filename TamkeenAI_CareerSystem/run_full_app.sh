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

# Check if ports are available
echo -e "${BLUE}Checking port availability...${NC}"
if command -v lsof &> /dev/null; then
    if lsof -i:5001 &>/dev/null; then
        echo -e "${RED}Error: Port 5001 is already in use (backend). Please free this port.${NC}"
        exit 1
    fi
    if lsof -i:3000 &>/dev/null; then
        echo -e "${RED}Error: Port 3000 is already in use (frontend). Please free this port.${NC}"
        exit 1
    fi
fi

# Install backend dependencies and start backend
echo -e "${BLUE}Starting backend server...${NC}"
chmod +x "${SCRIPT_DIR}/run_backend.sh"
"${SCRIPT_DIR}/run_backend.sh" &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize... (5 seconds)${NC}"
sleep 5

# Check if backend is running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}Error: Backend failed to start. Please check logs above.${NC}"
    exit 1
fi

# Create .env for frontend if it doesn't exist
FRONTEND_ENV="${SCRIPT_DIR}/frontend/.env"
if [ ! -f "$FRONTEND_ENV" ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cat > "$FRONTEND_ENV" << EOL
VITE_API_URL=http://localhost:5001/api
VITE_ENABLE_MOCK_DATA=true
EOL
    echo -e "${GREEN}Created frontend .env with API configuration${NC}"
fi

# Start frontend server
echo -e "${BLUE}Starting frontend server...${NC}"
cd "${SCRIPT_DIR}/frontend" || { 
    echo -e "${RED}Failed to change to frontend directory${NC}"
    kill $BACKEND_PID
    exit 1 
}

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install || {
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        kill $BACKEND_PID
        exit 1
    }
fi

# Start the frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to initialize... (5 seconds)${NC}"
sleep 5

# Check if frontend is running
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}Error: Frontend failed to start. Please check logs above.${NC}"
    kill $BACKEND_PID
    exit 1
fi

# Show success message
echo ""
echo -e "${GREEN}TamkeenAI Career Intelligence System is now running!${NC}"
echo -e "${BLUE}Backend URL: ${GREEN}http://localhost:5001/api${NC}"
echo -e "${BLUE}Frontend URL: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}New features available:${NC}"
echo -e "- Confidence Prediction Charts${NC}"
echo -e "- Speech Recognition${NC}"
echo -e "- Emotion Detection${NC}"
echo -e "- Sentiment Analysis${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Handle clean shutdown
trap 'echo -e "\n${BLUE}Shutting down TamkeenAI Career System...${NC}"; kill $BACKEND_PID $FRONTEND_PID; echo -e "${GREEN}Servers stopped${NC}"; exit 0' INT

# Wait for processes
wait 