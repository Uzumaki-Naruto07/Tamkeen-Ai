# 💼 Tamkeen AI: Career Intelligence System
*Empowering Emirati Talent through Intelligent Career Matching & Interview Simulation*
TamkeenAI Career System is a full-stack modular application designed to help users optimize their career journey through AI-powered tools for resume analysis, job matching, interview preparation, and career path visualization.
Prerequisites
Bash shell environment (Linux, macOS, or Windows with WSL/Git Bash)
Python 3.8+ (for backend)
Node.js 14+ (for frontend)
pip and npm package managers
Installation Instructions
Step 1: Clone or create the project structure
╔════════════════════════════════════════════════════════════╗ ║ ║ ║ ████████╗ █████╗ ███╗ ███╗██╗ ██╗███████╗███████╗███╗ ██╗ ║ ║ ╚══██╔══╝██╔══██╗████╗ ████║██║ ██╔╝██╔════╝██╔════╝████╗ ██║ ║ ║ ██║ ███████║██╔████╔██║█████╔╝ █████╗ █████╗ ██╔██╗ ██║ ║ ║ ██║ ██╔══██║██║╚██╔╝██║██╔═██╗ ██╔══╝ ██╔══╝ ██║╚██╗██║ ║ ║ ██║ ██║ ██║██║ ╚═╝ ██║██║ ██╗███████╗███████╗██║ ╚████║ ║ ║ ╚═╝ ╚═╝ ╚═╝╚═╝ ╚═╝╚═╝ ╚═╝╚══════╝╚══════╝╚═╝ ╚═══╝ ║ ║ ║ ║ Career Intelligence System - v1.0.0 ║ ╚════════════════════════════════════════════════════════════╝

TamkeenAI Career Intelligence System
TamkeenAI is a comprehensive career empowerment system that helps users manage their entire career journey using AI-powered tools. From creating a professional profile to finding jobs, improving resumes, and preparing for interviews - TamkeenAI is the all-in-one solution.

Features
User Profile Management: Create and maintain a professional profile with skills, experience, and career goals.
ChatGPT Integration: Natural language Q&A for career guidance and assistance.
ATS Matching System: Compare uploaded resumes with job descriptions and get improvement suggestions.
Gamified Career Dashboard: Track your progress with XP, levels, badges, and a career leaderboard.
Personalized Learning Paths: Get AI-recommended courses and resources based on your skill gaps.
Job Automation Application: One-click job applications with personalized cover letters.
Interview Simulator: Practice with AI-powered mock interviews and get feedback.
AI Feedback Engine: Receive personalized career insights and recommendations.
Admin & Analytics: Track user progress and system metrics (for administrators).
Job Application Automation
TamkeenAI Career System includes job application automation features for multiple UAE job platforms:

Bayt.com
GulfTalent
Indeed UAE
Naukrigulf
Monster Gulf
IMPORTANT DISCLAIMER - LinkedIn Automation
PLEASE NOTE: LinkedIn automation features are included in this codebase EXCLUSIVELY FOR DEMONSTRATION PURPOSES as part of a private competition submission. This implementation:

Is NOT meant for public use or distribution
Does NOT encourage violation of LinkedIn's Terms of Service
Should NOT be used in production environments
Respects that LinkedIn prohibits automated access to their platform
In a production version of this application, we fully comply with LinkedIn's automation policies by not including any LinkedIn automation capabilities.

Application Flow
User Information Collection: Gather user profile information with an animated welcome screen.
ChatGPT + AI Job Automation: AI agent helps with CVs, cover letters, and job matching.
ATS Matching System: Compare resumes with job descriptions and get keyword analysis.
Gamified Career Dashboard: Track career progress with a smart navigation bar and reorderable widgets.
Personalized Learning Paths: Get course recommendations based on skill gaps.
Job Automation Application: Apply to jobs with one click and receive job alerts.
Interview Simulator: Practice with AI-powered mock interviews and get feedback.
AI Feedback Engine: Get AI-generated career insights and recommendations.
Admin & Analytics: Track user statistics and system performance.
Tech Stack
Frontend
React with Vite
Material-UI for components
Framer Motion for animations
Nivo for data visualization
React Beautiful DnD for drag-and-drop
Backend
Flask API
OpenAI/ChatGPT for language model capabilities
DeepSeek for AI processing
HuggingFace for NLP tasks
SQLite database (configurable to use other databases)
Getting Started
Prerequisites
Python 3.8+ with pip
Node.js 16+ with npm
API keys for OpenAI, DeepSeek, and HuggingFace (optional, mock data will be used if not provided)
Installation
Clone the repository

git clone https://github.com/yourusername/TamkeenAI_CareerSystem.git
cd TamkeenAI_CareerSystem
Set up API keys in .env file

# Backend/.env
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
Run the application start script

./run_app.sh
This will:

Create and activate a Python virtual environment
Install backend dependencies
Install frontend dependencies
Start both the backend and frontend servers
Access the application

Frontend: http://localhost:3000
Backend API: http://localhost:5000/api
Manual Setup (if the script doesn't work)
Backend
cd TamkeenAI_CareerSystem/backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
python app.py
Frontend
cd TamkeenAI_CareerSystem/frontend
npm install
npm run dev
Usage
Register a new account or use the following demo credentials:

Email: demo@tamkeen.ai
Password: tamkeen2023
You can also use these test accounts:

For admin access: admin@tamkeen.ai
For regular user access: user@tamkeen.ai
Password for both: password
Complete your profile information to get personalized recommendations.

Explore the dashboard widgets to see your career progress.

Use the ChatGPT integration to get career advice and assistance.

Upload your resume to get ATS scoring and improvement suggestions.

Search for jobs and apply with one click.

Practice interviews with the AI coach.

Recent Fixes
These changes resolve the login issues and eliminate the React Router warnings:

Fixed login error handling to prevent "Login failed: Object" errors
Configured React Router future flags to eliminate warnings
Improved error messaging in the login process
Enhanced mock login functionality for clearer responses
Configuration
You can configure various aspects of the application in the following files:

backend/.env: API keys and backend configuration
frontend/.env: Frontend environment variables
backend/api/utils/mock_data.py: Mock data for development
Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
OpenAI for ChatGPT API
DeepSeek for AI processing
HuggingFace for NLP models
All the contributors who helped build this project
Built by an Emirati, for Emiratis. We don't settle for second place.
# Option 1: Clone the repository if available
# git clone https://github.com/yourusername/TamkeenAI_CareerSystem.git

# Option 2: Create the structure using our setup script
# Save the script below as setup_tamkeen.sh
Step 2: Create setup script
Create a file named setup_tamkeen.sh with the following content:
```
#!/bin/bash

# Create the root directory
mkdir -p TamkeenAI_CareerSystem

# Create main directories
mkdir -p TamkeenAI_CareerSystem/backend/core
mkdir -p TamkeenAI_CareerSystem/backend/utils
mkdir -p TamkeenAI_CareerSystem/backend/config
mkdir -p TamkeenAI_CareerSystem/frontend/public
mkdir -p TamkeenAI_CareerSystem/frontend/src/assets
mkdir -p TamkeenAI_CareerSystem/frontend/src/components
mkdir -p TamkeenAI_CareerSystem/frontend/src/pages
mkdir -p TamkeenAI_CareerSystem/frontend/src/utils

# Create backend core files
touch TamkeenAI_CareerSystem/backend/core/user_info.py
touch TamkeenAI_CareerSystem/backend/core/resume_parser.py
touch TamkeenAI_CareerSystem/backend/core/ats_matcher.py
touch TamkeenAI_CareerSystem/backend/core/job_workflow.py
touch TamkeenAI_CareerSystem/backend/core/tts_engine.py
touch TamkeenAI_CareerSystem/backend/core/face_expression.py
touch TamkeenAI_CareerSystem/backend/core/career_intelligence.py
touch TamkeenAI_CareerSystem/backend/core/career_assessment.py
touch TamkeenAI_CareerSystem/backend/core/nlp_resume_manager.py
touch TamkeenAI_CareerSystem/backend/core/enhanced_interview.py
touch TamkeenAI_CareerSystem/backend/core/gamification.py
touch TamkeenAI_CareerSystem/backend/core/analytics_engine.py
touch TamkeenAI_CareerSystem/backend/core/report_generator.py
touch TamkeenAI_CareerSystem/backend/core/dashboard_data.py
touch TamkeenAI_CareerSystem/backend/core/keyword_recommender.py
touch TamkeenAI_CareerSystem/backend/core/skill_gap_predictor.py
touch TamkeenAI_CareerSystem/backend/core/career_path_visualizer.py
touch TamkeenAI_CareerSystem/backend/core/sentiment_analyzer.py
touch TamkeenAI_CareerSystem/backend/core/feedback_generator.py

# Create backend utils files
touch TamkeenAI_CareerSystem/backend/utils/preprocess.py
touch TamkeenAI_CareerSystem/backend/utils/file_handler.py

# Create backend config file
touch TamkeenAI_CareerSystem/backend/config/settings.py

# Create backend root files
touch TamkeenAI_CareerSystem/backend/app.py
touch TamkeenAI_CareerSystem/backend/requirements.txt

# Create frontend component files
touch TamkeenAI_CareerSystem/frontend/src/components/UserInfoForm.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/ResumeUploader.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/JobDescriptionForm.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/ATSResultsCard.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/WordCloudVisualizer.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/EmotionScorePanel.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/GamificationBoard.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/CareerInsightsChart.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/SkillGapRadar.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/CareerPathTimeline.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/PDFReportViewer.jsx

# Create frontend pages files
touch TamkeenAI_CareerSystem/frontend/src/pages/Dashboard.jsx
touch TamkeenAI_CareerSystem/frontend/src/pages/ResumeAnalysis.jsx
touch TamkeenAI_CareerSystem/frontend/src/pages/CareerAssessment.jsx
touch TamkeenAI_CareerSystem/frontend/src/pages/InterviewResults.jsx

# Create frontend utils files
touch TamkeenAI_CareerSystem/frontend/src/utils/api.js
touch TamkeenAI_CareerSystem/frontend/src/utils/constants.js

# Create remaining frontend files
touch TamkeenAI_CareerSystem/frontend/src/App.jsx
touch TamkeenAI_CareerSystem/frontend/src/index.js
touch TamkeenAI_CareerSystem/frontend/package.json

echo "TamkeenAI_CareerSystem directory structure has been created successfully!"

# Make the script executable
chmod +x setup_tamkeen.sh

# Run the script
./setup_tamkeen.sh
Project Structure
The TamkeenAI Career System follows a modular architecture:

TamkeenAI_CareerSystem/
├── backend/                           # Flask API backend
│   ├── core/                          # Functional logic modules
│   ├── utils/                         # Helper utilities
│   ├── config/                        # Configuration settings
│   ├── app.py                         # Main Flask application
│   └── requirements.txt               # Python dependencies
└── frontend/                          # React frontend
    ├── public/                        # Static assets
    ├── src/                           # Source code
    │   ├── assets/                    # Images and media
    │   ├── components/                # Reusable UI components
    │   ├── pages/                     # Page components
    │   ├── utils/                     # Frontend utilities
    │   ├── App.jsx                    # Main app component
    │   └── index.js                   # Entry point
    └── package.json                   # Node.js dependencies

Running the Application
Start the Backend

cd TamkeenAI_CareerSystem/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
