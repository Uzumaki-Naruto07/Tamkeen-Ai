#!/bin/bash
# Script to fix backend-frontend connection issues in TamkeenAI_CareerSystem
# This script updates CORS settings, health checks, and environment variables

# Set exit on error
set -e

echo "Fixing backend-frontend connection in TamkeenAI_CareerSystem..."

# 1. Update the simple_upload_server.py main block
echo "Updating upload server startup code..."
cat > backend/simple_upload_server_fix.py << 'EOF'
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simple upload server')
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', 5004)), 
                      help='Port to run server on')
    parser.add_argument('--debug', action='store_true', 
                      default=(os.environ.get('DEBUG', 'false').lower() == 'true'),
                      help='Run in debug mode')
    args = parser.parse_args()
    
    port = args.port
    print(f"Starting simple upload server on port {port}...")
    print(f"Debug mode: {args.debug}")
    app.run(host='0.0.0.0', port=port, debug=args.debug)
EOF

# Replace the if __name__ == "__main__" block in simple_upload_server.py
sed -i.bak '/if __name__ == "__main__":/,/app.run/ {//!d; /if __name__ == "__main__":/r backend/simple_upload_server_fix.py
}' backend/simple_upload_server.py

# 2. Make sure all services have the right environment variables in .env files
echo "Setting up environment variables..."

# Frontend .env.development
cat > frontend/.env.development << 'EOF'
VITE_API_URL=http://localhost:5001
VITE_INTERVIEW_API_URL=http://localhost:5002
VITE_UPLOAD_SERVER_URL=http://localhost:5004
VITE_USE_MOCK_DATA=true
VITE_ENABLE_MOCK_DATA=true
VITE_USE_DEEPSEEK_OPENAI_FALLBACK=true
VITE_ENABLE_MOCK_FALLBACK=true
VITE_ENABLE_BACKEND_CHECK=true
EOF

# Frontend .env.production
cat > frontend/.env.production << 'EOF'
VITE_API_URL=https://tamkeen-main-api.onrender.com
VITE_INTERVIEW_API_URL=https://tamkeen-interview-api.onrender.com
VITE_UPLOAD_SERVER_URL=https://tamkeen-upload-server.onrender.com
VITE_USE_MOCK_DATA=false
VITE_ENABLE_MOCK_DATA=false
VITE_USE_DEEPSEEK_OPENAI_FALLBACK=true
VITE_ENABLE_MOCK_FALLBACK=false
VITE_ENABLE_BACKEND_CHECK=true
VITE_MODE=production
EOF

# Backend .env
cat > backend/.env << 'EOF'
API_HOST=0.0.0.0
API_PORT=5001
JWT_SECRET_KEY=dev-jwt-secret-key
SECRET_KEY=dev-secret-key
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/tamkeen
DEBUG=true
EOF

# 3. Create a script to check connectivity
echo "Creating connectivity test script..."
cat > test_connectivity.py << 'EOF'
#!/usr/bin/env python3
"""
Connectivity test script for TamkeenAI_CareerSystem
This script tests if the backend services are running and accessible
"""

import requests
import sys
import json
from urllib.parse import urljoin

def test_endpoint(base_url, endpoint):
    """Test if an endpoint is accessible"""
    url = urljoin(base_url, endpoint)
    try:
        print(f"Testing {url}...")
        response = requests.get(url, timeout=3)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"Error: Unexpected status code {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def main():
    """Main function"""
    # Define the services to test
    services = [
        ("Main API", "http://localhost:5001", "/api/health-check"),
        ("Interview API", "http://localhost:5002", "/api/health-check"),
        ("Upload Server", "http://localhost:5004", "/api/health-check")
    ]
    
    # Test each service
    success_count = 0
    for name, base_url, endpoint in services:
        print(f"\nTesting {name}...")
        if test_endpoint(base_url, endpoint):
            success_count += 1
        else:
            print(f"Failed to connect to {name}!")
    
    # Print results
    print(f"\nResults: {success_count}/{len(services)} services are accessible")
    if success_count == len(services):
        print("All services are running correctly!")
        return 0
    else:
        print("Some services are not running or not accessible!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
EOF

chmod +x test_connectivity.py

echo "Creating instructions for deployment to Render..."
cat > DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Deployment Instructions for TamkeenAI Career System

This document outlines the steps to deploy the TamkeenAI Career System on Render.

## Prerequisites

1. A Render account (https://render.com)
2. The TamkeenAI Career System codebase

## Deployment Steps

### 1. Create a Blueprint

1. Copy the `render.yaml` file to your GitHub repository.
2. Log in to your Render dashboard.
3. Click on "Blueprints" in the left sidebar.
4. Click "New Blueprint Instance".
5. Select your repository and click "Continue".
6. Configure the environment variables as needed.
7. Click "Deploy".

### 2. Verify Services

Render will create the following services:
- tamkeen-main-api: The main Flask API
- tamkeen-interview-api: The interview API
- tamkeen-upload-server: The upload server
- tamkeen-frontend: The React frontend

### 3. Configure Environment Variables

Make sure each service has the correct environment variables:

**For all backend services**:
- FRONTEND_URL: https://tamkeen-frontend.onrender.com

**For the frontend**:
- VITE_API_URL: https://tamkeen-main-api.onrender.com
- VITE_INTERVIEW_API_URL: https://tamkeen-interview-api.onrender.com
- VITE_UPLOAD_SERVER_URL: https://tamkeen-upload-server.onrender.com

### 4. Test Connectivity

1. Check the health endpoints of each backend service:
   - https://tamkeen-main-api.onrender.com/api/health-check
   - https://tamkeen-interview-api.onrender.com/api/health-check
   - https://tamkeen-upload-server.onrender.com/api/health-check

2. Try logging in to the frontend:
   - https://tamkeen-frontend.onrender.com/login

### Troubleshooting

If you encounter issues:

1. Check the logs for each service in the Render dashboard.
2. Verify that CORS is properly configured in each backend service.
3. Make sure the health-check endpoints are working.
4. Check that the frontend is using the correct API URLs.

## Support

If you need additional help, please consult the Render documentation or contact the Tamkeen support team.
EOF

echo "Installation completed successfully!"
echo "Run './test_connectivity.py' to test if all services are running properly."
echo "See DEPLOYMENT_INSTRUCTIONS.md for deployment instructions."