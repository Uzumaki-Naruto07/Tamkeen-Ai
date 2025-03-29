#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting TamkeenAI Career System Backend${NC}"

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "${SCRIPT_DIR}" || { echo -e "${RED}Failed to change to script directory${NC}"; exit 1; }

# Change to the backend directory
echo -e "${BLUE}Changing to backend directory...${NC}"
cd backend || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }

# Check MongoDB status
echo -e "${BLUE}Checking MongoDB status...${NC}"
cd "${SCRIPT_DIR}" && chmod +x ./start_mongodb.sh && ./start_mongodb.sh || echo -e "${YELLOW}MongoDB check skipped${NC}"
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }

# Check if port is already in use
if command -v lsof &> /dev/null && lsof -i:5001 &>/dev/null; then
    echo -e "${RED}Error: Port 5001 is already in use. Backend cannot start.${NC}"
    exit 1
fi

# Try to create or check the virtual environment
VENV_PATH="${SCRIPT_DIR}/venv"
if [ ! -d "${VENV_PATH}" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    cd "${SCRIPT_DIR}" && python3 -m venv venv || { echo -e "${RED}Failed to create virtual environment${NC}"; exit 1; }
fi

# Activate virtual environment
echo -e "${BLUE}Activating Python virtual environment...${NC}"
source "${VENV_PATH}/bin/activate" || { echo -e "${RED}Failed to activate virtual environment${NC}"; exit 1; }

# Verify Python environment
echo -e "${BLUE}Verifying Python environment...${NC}"
PYTHON_PATH=$(which python)
echo -e "Using Python from: ${PYTHON_PATH}"

# Install critical dependencies first to the activated environment
echo -e "${BLUE}Installing critical data science packages...${NC}"
pip install -U pip || { echo -e "${YELLOW}Warning: Failed to upgrade pip${NC}"; }
pip install -U wheel setuptools || { echo -e "${YELLOW}Warning: Failed to install wheel and setuptools${NC}"; }
pip install -U numpy pandas scikit-learn || { echo -e "${RED}Failed to install critical data packages${NC}"; exit 1; }

# Verify numpy installation
python -c "import numpy; print(f'NumPy version: {numpy.__version__}')" || { echo -e "${RED}NumPy installation verification failed${NC}"; exit 1; }

# Ensure the backend/.env file is loaded
if [ -f "${SCRIPT_DIR}/backend/.env" ]; then
    echo -e "${GREEN}Found .env file in backend directory${NC}"
    # Export environment variables from .env file
    export $(grep -v '^#' "${SCRIPT_DIR}/backend/.env" | xargs)
else
    echo -e "${YELLOW}Warning: No .env file found in backend directory${NC}"
fi

# Set environment variables for using mock database
echo -e "${YELLOW}Setting USE_MOCK_DB=true to bypass MongoDB connection${NC}"
export USE_MOCK_DB="true"
export MONGO_URI="mongodb://localhost:27017/"
export MONGO_DB="tamkeen_db"
export ENABLE_MOCK_DATA="true"

# Ensure we're in the backend directory
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }

# Start the backend
echo -e "${BLUE}Starting backend server...${NC}"
python app.py --host 0.0.0.0 --port 5001 --debug

# Deactivate virtual environment on exit
deactivate 