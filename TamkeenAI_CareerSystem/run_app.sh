#!/bin/bash

# TamkeenAI Career System Startup Script
# This script starts both the backend Flask API and frontend React app

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║  ${GREEN}████████╗ █████╗ ███╗   ███╗██╗  ██╗███████╗███████╗███╗   ██╗${BLUE} ║${NC}"
echo -e "${BLUE}║  ${GREEN}╚══██╔══╝██╔══██╗████╗ ████║██║ ██╔╝██╔════╝██╔════╝████╗  ██║${BLUE} ║${NC}"
echo -e "${BLUE}║  ${GREEN}   ██║   ███████║██╔████╔██║█████╔╝ █████╗  █████╗  ██╔██╗ ██║${BLUE} ║${NC}"
echo -e "${BLUE}║  ${GREEN}   ██║   ██╔══██║██║╚██╔╝██║██╔═██╗ ██╔══╝  ██╔══╝  ██║╚██╗██║${BLUE} ║${NC}"
echo -e "${BLUE}║  ${GREEN}   ██║   ██║  ██║██║ ╚═╝ ██║██║  ██╗███████╗███████╗██║ ╚████║${BLUE} ║${NC}"
echo -e "${BLUE}║  ${GREEN}   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝${BLUE} ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║           ${YELLOW}Career Intelligence System - v1.0.0${BLUE}               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for required dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not found${NC}"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not found${NC}"
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is required but not found${NC}"
    exit 1
fi

echo -e "${GREEN}All dependencies found!${NC}"

# Function to check if a process is running on the port
is_port_in_use() {
    if command -v lsof &> /dev/null; then
        lsof -i:"$1" &> /dev/null
        return $?
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$1 "
        return $?
    else
        echo -e "${YELLOW}Warning: Cannot check if port $1 is in use${NC}"
        return 1
    fi
}

# Check if ports are already in use
if is_port_in_use 5001; then
    echo -e "${RED}Error: Port 5001 is already in use. Backend cannot start.${NC}"
    exit 1
fi

if is_port_in_use 3000; then
    echo -e "${RED}Error: Port 3000 is already in use. Frontend cannot start.${NC}"
    exit 1
fi

# Create or activate Python virtual environment
echo -e "${BLUE}Setting up Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    echo "Creating new virtual environment..."
    python3 -m venv venv || { echo -e "${RED}Failed to create virtual environment${NC}"; exit 1; }
fi

# Activate virtual environment
source venv/bin/activate || { echo -e "${RED}Failed to activate virtual environment${NC}"; exit 1; }

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
# pip install -r requirements.txt || { echo -e "${RED}Failed to install backend dependencies${NC}"; exit 1; }
echo -e "${GREEN}Skipping dependency installation...${NC}"

# Starting backend server in the background
echo -e "${BLUE}Starting backend server...${NC}"
python app.py --debug &
BACKEND_PID=$!
cd ..

# Check if backend started successfully
sleep 2
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}Error: Backend server failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}Backend server running with PID $BACKEND_PID${NC}"

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd frontend || { echo -e "${RED}Failed to change to frontend directory${NC}"; exit 1; }
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install || { echo -e "${RED}Failed to install frontend dependencies${NC}"; exit 1; }
fi

# Start frontend dev server
echo -e "${BLUE}Starting frontend server...${NC}"
npm run dev &
FRONTEND_PID=$!
cd ..

# Check if frontend started successfully
sleep 5
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}Error: Frontend server failed to start${NC}"
    kill $BACKEND_PID
    exit 1
fi
echo -e "${GREEN}Frontend server running with PID $FRONTEND_PID${NC}"

# Print success message
echo ""
echo -e "${GREEN}=== TamkeenAI Career System is now running ===${NC}"
echo -e "${BLUE}Backend server: ${GREEN}http://localhost:5001/api/health-check${NC}"
echo -e "${BLUE}Frontend app: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Trap termination signal
trap 'echo -e "\n${BLUE}Shutting down TamkeenAI Career System...${NC}"; kill $BACKEND_PID $FRONTEND_PID; echo -e "${GREEN}Servers stopped${NC}"; exit 0' INT

# Keep the script running
wait
