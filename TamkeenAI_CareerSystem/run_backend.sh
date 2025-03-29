#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting TamkeenAI Career System Backend${NC}"

# Change to the backend directory
echo -e "${BLUE}Changing to backend directory...${NC}"
cd backend || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }

# Check MongoDB status
echo -e "${BLUE}Checking MongoDB status...${NC}"
cd .. && chmod +x ./start_mongodb.sh && ./start_mongodb.sh
cd backend || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }

# Check if port is already in use
if lsof -i:5001 &>/dev/null; then
    echo -e "${RED}Error: Port 5001 is already in use. Backend cannot start.${NC}"
    exit 1
fi

# Try to create or check the virtual environment
if [ ! -d "../venv" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    cd .. && python3 -m venv venv || { echo -e "${RED}Failed to create virtual environment${NC}"; exit 1; }
    cd backend || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
fi

# Activate virtual environment
echo -e "${BLUE}Activating Python virtual environment...${NC}"
source ../venv/bin/activate || { echo -e "${RED}Failed to activate virtual environment${NC}"; exit 1; }

# Ensure the backend/.env file is loaded
if [ -f ".env" ]; then
    echo -e "${GREEN}Found .env file in backend directory${NC}"
    # Export environment variables from .env file
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}Warning: No .env file found in backend directory${NC}"
fi

# Set environment variables for using mock database
echo -e "${YELLOW}Setting USE_MOCK_DB=true to bypass MongoDB connection${NC}"
export USE_MOCK_DB="true"
export MONGO_URI="mongodb://localhost:27017/"
export MONGO_DB="tamkeen_db"
export ENABLE_MOCK_DATA="true"

# Start the backend
echo -e "${BLUE}Starting backend server...${NC}"
python app.py --host 0.0.0.0 --port 5001 --debug

# Deactivate virtual environment on exit
deactivate 