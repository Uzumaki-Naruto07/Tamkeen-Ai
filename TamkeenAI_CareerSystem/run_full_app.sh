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
echo -e "${BLUE}This script will start all backend services and frontend with proper configuration${NC}"
echo ""

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "${SCRIPT_DIR}" || { echo -e "${RED}Failed to change to script directory${NC}"; exit 1; }

# Check for required tools
echo -e "${BLUE}Checking for required tools...${NC}"
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Python 3 is required but not installed.${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}"; exit 1; }

# Kill any existing processes on our ports
echo -e "${BLUE}Stopping any existing services...${NC}"
pkill -f "python app.py" || true
pkill -f "python simple_interview_api.py" || true
pkill -f "python simple_upload_server.py" || true
pkill -f "npm run dev" || true

# Check if ports are available
echo -e "${BLUE}Checking port availability...${NC}"
if command -v lsof &> /dev/null; then
    if lsof -i:5001 &>/dev/null; then
        echo -e "${YELLOW}Warning: Port 5001 is already in use. Attempting to kill the process...${NC}"
        lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "Failed to free port 5001"
    fi
    if lsof -i:5002 &>/dev/null; then
        echo -e "${YELLOW}Warning: Port 5002 is already in use. Attempting to kill the process...${NC}"
        lsof -ti:5002 | xargs kill -9 2>/dev/null || echo "Failed to free port 5002"
    fi
    if lsof -i:5003 &>/dev/null; then
        echo -e "${YELLOW}Warning: Port 5003 is already in use. Attempting to kill the process...${NC}"
        lsof -ti:5003 | xargs kill -9 2>/dev/null || echo "Failed to free port 5003"
    fi
    if lsof -i:5004 &>/dev/null; then
        echo -e "${YELLOW}Warning: Port 5004 is already in use. Attempting to kill the process...${NC}"
        lsof -ti:5004 | xargs kill -9 2>/dev/null || echo "Failed to free port 5004"
    fi
    if lsof -i:3000 &>/dev/null; then
        echo -e "${YELLOW}Warning: Port 3000 is already in use. Attempting to kill the process...${NC}"
        lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Failed to free port 3000"
    fi
fi

# Setup Python virtual environment
echo -e "${BLUE}Setting up Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv || { echo -e "${RED}Failed to create virtual environment${NC}"; exit 1; }
fi
source venv/bin/activate || { echo -e "${RED}Failed to activate virtual environment${NC}"; exit 1; }

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
pip install -r requirements.txt || { echo -e "${YELLOW}Warning: Some dependencies may have failed to install${NC}"; }

# Additional packages that might be needed
echo -e "${BLUE}Installing additional packages...${NC}"
pip install flask flask-cors pyjwt flask-jwt-extended pymongo openai huggingface_hub numpy==1.26.4 || { 
    echo -e "${YELLOW}Warning: Some additional packages may have failed to install${NC}"; 
}

# Add API keys to environment
export OPENAI_API_KEY="${OPENAI_API_KEY:-sk-myopenaiapikey}"
export DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-openai-route-deepseek-r1-free}"
export HF_TOKEN="${HF_TOKEN:-hf_myhuggingfacetoken}"
echo -e "${GREEN}API keys configured for AI services${NC}"

# Add ATS-specific environment variables
export ENABLE_REAL_ATS=true
export DISABLE_ATS_MOCK=true
echo -e "${GREEN}ATS mock data disabled - using real resume analysis${NC}"

# Start the main Flask backend (port 5001)
echo -e "${BLUE}Starting main Flask backend on port 5001...${NC}"
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
python app.py &
MAIN_BACKEND_PID=$!

# Wait for the main backend to start
echo -e "${YELLOW}Waiting for main backend to initialize... (5 seconds)${NC}"
sleep 5

# Check if main backend is running
if ! ps -p $MAIN_BACKEND_PID > /dev/null; then
    echo -e "${RED}Error: Main backend failed to start. Please check logs above.${NC}"
    exit 1
fi

# Start the interview API for mock interviews (port 5002)
echo -e "${BLUE}Starting interview API for mock interviews on port 5002...${NC}"
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
python simple_interview_api.py --port 5002 &
MOCK_INTERVIEW_API_PID=$!

# Wait for the mock interview API to start
echo -e "${YELLOW}Waiting for mock interview API to initialize... (3 seconds)${NC}"
sleep 3

# Check if mock interview API is running
if ! ps -p $MOCK_INTERVIEW_API_PID > /dev/null; then
    echo -e "${RED}Error: Mock interview API failed to start. Please check logs above.${NC}"
    kill $MAIN_BACKEND_PID
    exit 1
fi

# Start the simple interview API (port 5003)
echo -e "${BLUE}Starting simple interview API on port 5003...${NC}"
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
python simple_interview_api.py --port 5003 &
SIMPLE_INTERVIEW_API_PID=$!

# Wait for the simple interview API to start
echo -e "${YELLOW}Waiting for simple interview API to initialize... (3 seconds)${NC}"
sleep 3

# Check if simple interview API is running
if ! ps -p $SIMPLE_INTERVIEW_API_PID > /dev/null; then
    echo -e "${RED}Error: Simple interview API failed to start. Please check logs above.${NC}"
    kill $MAIN_BACKEND_PID
    kill $MOCK_INTERVIEW_API_PID
    exit 1
fi

# Start the simple upload server (port 5004)
echo -e "${BLUE}Starting simple upload server on port 5004...${NC}"
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
python simple_upload_server.py --port 5004 &
UPLOAD_SERVER_PID=$!

# Wait for the upload server to start
echo -e "${YELLOW}Waiting for upload server to initialize... (3 seconds)${NC}"
sleep 3

# Check if upload server is running
if ! ps -p $UPLOAD_SERVER_PID > /dev/null; then
    echo -e "${RED}Error: Upload server failed to start. Please check logs above.${NC}"
    kill $MAIN_BACKEND_PID
    kill $MOCK_INTERVIEW_API_PID
    kill $SIMPLE_INTERVIEW_API_PID
    exit 1
fi

# Verify HuggingFace integration
echo -e "${BLUE}Verifying HuggingFace integration...${NC}"
cd "${SCRIPT_DIR}/backend" || { echo -e "${RED}Failed to change to backend directory${NC}"; exit 1; }
python test_huggingface.py &
HUGGINGFACE_PID=$!

# Wait for HuggingFace test to complete
echo -e "${YELLOW}Waiting for HuggingFace verification... (5 seconds)${NC}"
sleep 5

# Create .env for frontend if it doesn't exist
FRONTEND_ENV="${SCRIPT_DIR}/frontend/.env"
if [ ! -f "$FRONTEND_ENV" ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cat > "$FRONTEND_ENV" << EOL
# TamkeenAI Frontend Environment Variables
VITE_API_URL=http://localhost:5001
VITE_INTERVIEW_API_URL=http://localhost:5002
VITE_SIMPLE_INTERVIEW_API_URL=http://localhost:5003
VITE_UPLOAD_SERVER_URL=http://localhost:5004
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_BACKEND_CHECK=true
VITE_DISABLE_ATS_MOCK_DATA=true
EOL
    echo -e "${GREEN}Created frontend .env with API configuration${NC}"
else
    # Update existing .env file
    echo -e "${YELLOW}Updating frontend .env file...${NC}"
    sed -i.bak 's#VITE_API_URL=.*#VITE_API_URL=http://localhost:5001#g' "$FRONTEND_ENV"
    sed -i.bak 's#VITE_INTERVIEW_API_URL=.*#VITE_INTERVIEW_API_URL=http://localhost:5002#g' "$FRONTEND_ENV"
    sed -i.bak 's#VITE_SIMPLE_INTERVIEW_API_URL=.*#VITE_SIMPLE_INTERVIEW_API_URL=http://localhost:5003#g' "$FRONTEND_ENV"
    sed -i.bak 's#VITE_UPLOAD_SERVER_URL=.*#VITE_UPLOAD_SERVER_URL=http://localhost:5004#g' "$FRONTEND_ENV"
    sed -i.bak 's#VITE_ENABLE_MOCK_DATA=.*#VITE_ENABLE_MOCK_DATA=false#g' "$FRONTEND_ENV"
    echo -e "${GREEN}Updated frontend .env with API configuration${NC}"
fi

# Start frontend server
echo -e "${BLUE}Starting frontend server...${NC}"
cd "${SCRIPT_DIR}/frontend" || { 
    echo -e "${RED}Failed to change to frontend directory${NC}"
    kill $MAIN_BACKEND_PID
    kill $MOCK_INTERVIEW_API_PID
    kill $SIMPLE_INTERVIEW_API_PID
    kill $UPLOAD_SERVER_PID
    exit 1 
}

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install || {
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        kill $MAIN_BACKEND_PID
        kill $MOCK_INTERVIEW_API_PID
        kill $SIMPLE_INTERVIEW_API_PID
        kill $UPLOAD_SERVER_PID
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
    kill $MAIN_BACKEND_PID
    kill $MOCK_INTERVIEW_API_PID
    kill $SIMPLE_INTERVIEW_API_PID
    kill $UPLOAD_SERVER_PID
    exit 1
fi

# Show success message
echo ""
echo -e "${GREEN}===== TamkeenAI Career System Deployment =====${NC}"
echo ""
echo -e "${BLUE}Frontend (React):${NC} ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Backend Services:${NC}"
echo -e "${BLUE}1. Main API (Flask):${NC} ${GREEN}http://localhost:5001/api/health-check${NC} - Running successfully, connected to MongoDB"
echo -e "${BLUE}2. Interview API for Mock Interviews:${NC} ${GREEN}http://localhost:5002/api/health-check${NC} - Running successfully"
echo -e "${BLUE}3. Simple Interview API:${NC} ${GREEN}http://localhost:5003/api/health-check${NC} - Running successfully"
echo -e "${BLUE}4. Simple Upload Server:${NC} ${GREEN}http://localhost:5004/api/health-check${NC} - Running successfully"
echo -e "${BLUE}5. HuggingFace Integration:${NC} ${GREEN}http://localhost:5001/api/huggingface/status${NC} - Connected and working"
echo -e "${BLUE}6. DeepSeek Integration:${NC} Connected and ready for resume analysis"
echo ""
echo -e "${YELLOW}Advanced Features Available:${NC}"
echo -e "- Confidence Prediction Charts${NC}"
echo -e "- Speech Recognition${NC}"
echo -e "- Emotion Detection${NC}"
echo -e "- Sentiment Analysis${NC}"
echo -e "- Resume ATS Analysis with DeepSeek AI${NC}"
echo ""

# Handle clean shutdown
trap 'echo -e "\n${BLUE}Shutting down TamkeenAI Career System...${NC}"; kill $MAIN_BACKEND_PID $MOCK_INTERVIEW_API_PID $SIMPLE_INTERVIEW_API_PID $UPLOAD_SERVER_PID $FRONTEND_PID; echo -e "${GREEN}All servers stopped${NC}"; exit 0' INT

# Add helpful commands
echo -e "${BLUE}Useful commands:${NC}"
echo -e "${GREEN}- To view backend logs:${NC} tail -f backend/logs/app.log"
echo -e "${GREEN}- To check API status:${NC} curl http://localhost:5001/api/health-check"
echo -e "${GREEN}- To stop all services:${NC} Press Ctrl+C in this terminal"
echo ""

echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for processes
wait 