#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting TamkeenAI Career System Frontend${NC}"

# Change to the frontend directory
echo -e "${BLUE}Changing to frontend directory...${NC}"
cd frontend || { echo -e "${RED}Failed to change to frontend directory${NC}"; exit 1; }

# Check if port is already in use
if lsof -i:3000 &>/dev/null; then
    echo -e "${RED}Error: Port 3000 is already in use. Frontend cannot start.${NC}"
    exit 1
fi

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Running npm install...${NC}"
    npm install || { echo -e "${RED}Failed to install frontend dependencies${NC}"; exit 1; }
else
    echo -e "${GREEN}node_modules already exists, skipping install${NC}"
fi

# Start the frontend
echo -e "${BLUE}Starting frontend development server...${NC}"
npm run dev 