╔════════════════════════════════════════════════════════════╗
║                                                            ║
║ ████████╗ █████╗ ███╗   ███╗██╗   ██╗███████╗███████╗███╗   ██╗ ║
║ ╚══██╔══╝██╔══██╗████╗ ████║██║   ██╔╝██╔════╝██╔════╝████╗  ██║ ║
║    ██║   ███████║██╔████╔██║█████╔╝ █████╗  █████╗  ██╔██╗ ██║ ║
║    ██║   ██╔══██║██║╚██╔╝██║██╔═██╗ ██╔══╝  ██╔══╝  ██║╚██╗██║ ║
║    ██║   ██║  ██║██║ ╚═╝ ██║██║  ██╗███████╗███████╗██║ ╚████║ ║
║    ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝ ║
║                                                            ║
║             Career Intelligence System - v1.0.0            ║
╚════════════════════════════════════════════════════════════╝

🎯 Tamkeen AI: Career Intelligence System
TamkeenAI is a comprehensive career empowerment system that helps users manage their entire career journey using AI-powered tools. From creating a professional profile to finding jobs, improving resumes, and preparing for interviews - TamkeenAI is the all-in-one solution.

🧠 Built by Hessa Almaazmi حصة المازمي — an Emirati AI Engineer with a mission to elevate the future of work for UAE Nationals.

---

## 🔥 Why TamkeenAI Is a Game-Changer

TamkeenAI is a full-stack, AI-powered career empowerment system designed to help users achieve career excellence. It integrates resume optimization, job automation, emotional AI analysis, skill tracking, and interactive dashboards — all tailored for the UAE vision of innovation, empowerment, and leadership.

---

## 🌟 Features Overview

| Module                        | Powering Tools & APIs                                      |
|-----------------------------|-------------------------------------------------------------|
| 🧑‍💼 User Profile Management  | React + Flask + JWT                                         |
| 💬 AI Career Coach Chatbot   | DeepSeek + HuggingFace + OpenRouter                        |
| 📄 ATS Resume Analysis       | PDF Parsing + Keyword Extraction + Resume Score            |
| 🚀 Job Application Automation| GPT for Cover Letters + UAE Job APIs (Bayt, Indeed, etc.)  |
| 🎮 Gamified Dashboard        | XP Levels, Badges, Leaderboards                           |
| 🎯 Skill Gap Visualization   | Nivo Radar, AI Predicted Gaps                             |
| 🧠 AI Feedback & Insights    | LLM-Generated Reports & Career Advice                     |
| 🎥 Mock Interview Simulator  | Speech & Video Emotion via Google Colab                   |
| 📊 Admin Analytics           | User Stats, Leaderboards, Progress                         |

---

## 🧪 Application Flow

1. **User Login & Emirati-themed Onboarding**
Create and maintain a professional profile with skills, experience, and career goals.
   - Arabic welcome animation & Emirati flag effects
   - Google, GitHub, Apple login support
   - User fills basic info (name, goals, resume)

2. **ChatGPT Career Companion**
Natural language Q&A for career guidance and assistance.
   - Career Q&A in Arabic or English
   - Auto-generates CV, Cover Letters, Job Matches

3. **ATS Matching Engine**
Compare uploaded resumes with job descriptions and get improvement suggestions.
   - Upload CV + Job Description
   - Get Score, Missing Keywords, Match % & Word Cloud

4. **Dashboard: The Career HQ**
   - Animated charts: Resume Score, XP, Market Trends
   - Daily goals, interview alerts, industry radar

5. **Mock Interview Arena**
   - Choose # of questions
   - Voice input via Web Speech API
   - Video recorded → Google Colab → Emotion & Confidence Charts
   - Sentiment AI shows happiness, stress, readiness

6. **Admin Panel & Analytics**
Track user progress and system metrics (for administrators).
   - See all users' dashboards, stats, skill heatmaps

7. **Gamification & Learning**
 Track your progress with XP, levels, badges, and a career leaderboard.
   - Badges, XP, Quests
   - Personalized course recommendations (Udemy API / mock)

8. **Personalized Learning Paths**
 Get AI-recommended courses and resources based on your skill gaps.

9. **Job Automation Application**: One-click job applications with personalized cover letters.
10. **Interview Simulator**: Practice with AI-powered mock interviews and get feedback.
11. **AI Feedback Engine**: Receive personalized career insights and recommendations.
12. **Confidence Prediction Charts**: Visualize and track your confidence metrics over time based on interview performance.
13. **Speech Recognition**: Record and transcribe spoken answers during mock interviews.
14. **Emotion Detection**: Analyze facial expressions during video interviews to provide emotional intelligence insights.
15. **Sentiment Analysis**: Understand the sentiment patterns in your interview responses to improve communication.

16. ## Job Application Automation

TamkeenAI Career System includes job application automation features for multiple UAE job platforms:

- Bayt.com
- GulfTalent
- Indeed UAE
- Naukrigulf
- Monster Gulf
- LinkedIn UAE
---
### IMPORTANT DISCLAIMER - LinkedIn Automation

**PLEASE NOTE**: LinkedIn automation features are included in this codebase **EXCLUSIVELY FOR DEMONSTRATION PURPOSES** as part of a private competition submission. This implementation:

- Is NOT meant for public use or distribution
- Does NOT encourage violation of LinkedIn's Terms of Service
- Should NOT be used in production environments
- Respects that LinkedIn prohibits automated access to their platform

In a production version of this application, we fully comply with LinkedIn's automation policies by not including any LinkedIn automation capabilities.

### LinkedIn Automation Feature: Implementation Details

#### Why a Simulation Approach Was Chosen

The LinkedIn automation feature in this application was deliberately implemented as a **simulation** rather than actual automation for several important reasons:

1. **LinkedIn Terms of Service Compliance**: LinkedIn explicitly prohibits automated scraping, logging in, and applying to jobs. Actual automation would violate these terms and potentially lead to account bans and legal issues.

2. **Competition Requirement**: This feature was developed for a competition demonstration, where showing the concept was required, but actual automation was neither necessary nor appropriate.

3. **Educational Purpose**: The simulation demonstrates what automation could theoretically look like without the risks of real implementation.

#### What Was Actually Implemented

Instead of real automation, we built a comprehensive simulation that:

1. **Visually demonstrates** the job application workflow through a step-by-step interface
2. **Simulates login processes** without actually connecting to LinkedIn
3. **Shows realistic job search results** based on user criteria without scraping LinkedIn
4. **Simulates form filling** for job applications without submitting real applications
5. **Displays detailed logs** of the automated processes that would theoretically occur
6. **Provides configuration options** that would be relevant in a real automation scenario
7. **Includes multiple disclaimers** throughout the UI making it clear this is simulation-only
8. **Integrates with the user's profile data**, including:
   - Pre-filling search criteria based on current job title and location
   - Using skills from resume for job matching algorithms
   - Creating customized cover letter templates from resume summary
   - Using profile information for application form fields
   - Calculating realistic match scores based on resume content

#### Technical Implementation

The simulation uses:
- React and Material UI for the frontend interface
- Simulated delay functions to mimic real-world timing
- Random data generation for job titles, company names, and application outcomes
- Detailed logging to show the potential steps of automation
- Framer Motion animations to enhance the demonstration experience

#### Development Trade-offs and Decisions

While researching this feature, we found open-source projects that implement actual LinkedIn automation (like the Auto_job_applier_linkedIn project). However, we intentionally chose not to:

1. Use browser automation libraries like Selenium or Puppeteer
2. Implement actual LinkedIn page loading or scraping
3. Create mechanisms for automated login or form submission
4. Store or process actual LinkedIn credentials

This preserves the educational value of the demonstration while ensuring ethical compliance with LinkedIn's policies.

## Tech Stack

### Frontend
- React with Vite
- Material-UI for components
- Framer Motion for animations
- Nivo for data visualization
- React Beautiful DnD for drag-and-drop

### Backend
- Flask API
- OpenAI/ChatGPT for language model capabilities
- DeepSeek for AI processing
- HuggingFace for NLP tasks
- TensorFlow for emotion and speech recognition
- SQLite database (configurable to use other databases)
- NumPy, Pandas, and scikit-learn for data analysis and predictions

## Getting Started

> **IMPORTANT**: To run the complete project with all features (including Confidence Prediction Charts), use the `run_full_app.sh` script. This script handles all dependencies and connections between the backend and frontend automatically.
>
> ```bash
> chmod +x run_full_app.sh
> ./run_full_app.sh
> ```

## 🚀 How to Run the Project

### 🔧 Prerequisites

- Python 3.8+
- pip + npm
- Bash / Terminal
- Node.js 16+ with npm
- API keys for OpenAI, DeepSeek, and HuggingFace (optional, mock data will be used if not provided)
---

### 🛠 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/TamkeenAI_CareerSystem.git
cd TamkeenAI_CareerSystem
chmod +x setup_tamkeen.sh
./setup_tamkeen.sh
```
2. Set up API keys in `.env` file
   ```bash
   # Backend/.env
   OPENAI_API_KEY=your_openai_api_key_here
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

3. Run the unified application start script (recommended method)
   ```bash
   chmod +x run_full_app.sh  # Make it executable
   ./run_full_app.sh
   ```
   This enhanced script will:
   - Check for required tools and dependencies
   - Create and activate a Python virtual environment
   - Install critical data science packages (NumPy, pandas, scikit-learn)
   - Install backend dependencies
   - Verify the proper installation of required packages
   - Start the backend server
   - Configure frontend environment variables
   - Install frontend dependencies
   - Start the frontend development server
   - Connect both servers for seamless operation

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api

### Alternative Setup Methods

#### Backend-only Mode
```bash
chmod +x run_backend.sh  # Make it executable
./run_backend.sh
```

#### Frontend-only Mode
```bash
chmod +x run_frontend.sh  # Make it executable
./run_frontend.sh
```

## Troubleshooting API Connection Issues

If you encounter connection issues between the frontend and backend APIs (particularly the Interview API), follow these steps:

### Issue: API Port Switching During Reloading

The debug interview API server may switch between ports 5001 and 5005 during Flask's auto-reloading, causing connection issues with the frontend. This typically appears as `ERR_CONNECTION_REFUSED` errors in the browser console.

### Solution: Use the Simple Interview API

We created a simplified version of the interview API (`simple_interview_api.py`) that resolves these issues by:
- Using a fixed port 5001 (matching frontend expectations)
- Disabling auto-reloading to prevent port switching
- Implementing permissive CORS settings for development

To use this solution:

1. Kill any existing Python processes using port 5001:
```bash
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "No process running on port 5001"
```

2. Run the simple interview API:
```bash
cd TamkeenAI_CareerSystem/backend
python simple_interview_api.py
```

3. Verify the API is running by checking these endpoints:
```bash
curl http://localhost:5001/health-check
curl http://localhost:5001/api/interviews/topics
```

### Updating Your Frontend Environment

Ensure your frontend environment points to the correct API URL in the `.env` file:

```bash
# In TamkeenAI_CareerSystem/frontend/.env
VITE_API_URL=http://localhost:5001
VITE_INTERVIEW_API_URL=http://localhost:5001
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_BACKEND_CHECK=true
```

### Using the Combined Run Script

The `run_full_app.sh` script has been updated to:
- Start the backend API on port 5001
- Start the simplified interview API (also on port 5001)
- Configure frontend environment variables correctly
- Properly manage process termination

```bash
chmod +x run_full_app.sh
./run_full_app.sh
```

### Other Common Issues

1. **Browser caching**: Try opening your app in a private/incognito window
2. **Network interfaces**: Use `127.0.0.1` instead of `localhost` if DNS resolution issues occur
3. **Multiple backends**: Check for multiple Python processes running with `ps aux | grep python`
4. **Port conflicts**: Ensure no other applications are using port 5001

## Development Notes

---

## 📁 Project Structure

```
TamkeenAI_CareerSystem/
├── backend/              # Flask backend
│   ├── api/              # API modules
│   │   ├── core/         # Core business logic
│   │   ├── database/     # Database connectors
│   │   ├── models/       # Data models
│   │   ├── routes/       # API endpoints
│   │   └── utils/        # Utility functions
│   ├── app.py            # Main Flask application
│   └── requirements.txt  # Python dependencies
├── frontend/             # React frontend
│   ├── public/           # Static assets
│   ├── src/              # React components
│   └── package.json      # JS dependencies
├── run_backend.sh        # Backend start script
├── run_frontend.sh       # Frontend start script
├── run_full_app.sh       # Full application launcher
└── README.md             # This file
```

---

## 🤖 AI Integration Highlights

| AI Feature                  | Engine / Notebook               |
|----------------------------|---------------------------------|
| Speech-to-Text             | Google Colab + Web Speech API   |
| Emotion Detection (Video)  | Google Colab + OpenCV + FER     |
| Confidence Prediction      | Sentiment Analyzer in Flask     |
| Resume NLP Keyword Match   | HuggingFace Transformers        |
| Deep Career Insights       | DeepSeek LLM                    |
| ChatGPT Career Assistant   | OpenRouter (ChatGPT + API call) |

---
## Usage

## 💻 Sample Accounts

| Role   | Email              | Password      |
|--------|--------------------|---------------|
| Admin  | admin@tamkeen.ai   | password      |
| User   | user@tamkeen.ai    | password      |

2. Complete your profile information to get personalized recommendations.

3. Explore the dashboard widgets to see your career progress.

4. Use the ChatGPT integration to get career advice and assistance.

5. Upload your resume to get ATS scoring and improvement suggestions.

6. Search for jobs and apply with one click.

7. Practice interviews with the AI coach.

8. Monitor your confidence metrics through the prediction charts to track improvement.

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'numpy'**
   - This is a common error when running the backend:
   ```
   Traceback (most recent call last):
     File "/path/to/TamkeenAI_CareerSystem/backend/app.py", line 36, in <module>
       from api.routes.confidence_chart_routes import confidence_charts
     File "/path/to/TamkeenAI_CareerSystem/backend/api/routes/confidence_chart_routes.py", line 5, in <module>
       import numpy as np
   ModuleNotFoundError: No module named 'numpy'
   ```
   - Solution: Use the `run_full_app.sh` script which automatically handles this dependency:
   ```bash
   chmod +x run_full_app.sh
   ./run_full_app.sh
   ```
   - Alternatively, manually install NumPy in your virtual environment:
   ```bash
   source venv/bin/activate
   pip install numpy pandas scikit-learn

2. **Port already in use**
   - Solution: Free the port or change the port numbers in the scripts
   ```bash
   # Check what's using port 5001
   lsof -i:5001
   # Kill the process
   kill <PID>
   ```

3. **MongoDB connection issues**
   - Solution: The application uses a mock database by default. If you need real MongoDB:
   ```bash
   # Start MongoDB
   ./start_mongodb.sh
   # Then edit .env to set
   USE_MOCK_DB=false
   ```

4. **OpenAI API issues**
   - Solution: The mock mode doesn't require an API key. For real API:
   ```bash
   pip install openai
   # Then add your key to .env
   OPENAI_API_KEY=your_key_here
   ```

## API Endpoints

### Confidence Prediction Charts
- **POST /api/confidence/prediction**: Get confidence predictions based on interview data
- **GET /api/confidence/trends**: Get confidence trends over time for visualization
- **GET /api/confidence/breakdown**: Get confidence metrics breakdown for radar charts
- **POST /api/confidence/compare**: Compare confidence with industry averages or job requirements

### Speech Recognition
- **POST /api/speech/text-to-speech**: Convert text to speech audio
- **POST /api/speech/speech-to-text**: Convert speech audio to text
- **WebSocket /api/speech/ws/microphone/{client_id}**: Real-time speech recognition

### Emotion Detection
- **POST /api/emotion/detect**: Detect emotions in an uploaded image
- **WebSocket /api/emotion/ws/camera/{client_id}**: Real-time emotion analysis
---
## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for ChatGPT API
- DeepSeek for AI processing
- HuggingFace for NLP models
- TensorFlow for machine learning capabilities
- All the contributors who helped build this project

---
## 🏁 Built With Vision

"نحن لا نرضى إلا بالمركز الأول" — 🇦🇪

TamkeenAI was built to serve Emirati students, graduates, and professionals to achieve excellence in their careers using the power of AI.

> 💡 If you're reading this, you're not just using an app — you're stepping into the future.

Built with ❤️ by حصة المازمي — CEO of Solo Anonymous, Sharjah Capability Winner 🏆

Date Generated: March 29, 2025

## New Feature: AI-Powered Emotion Detection

We've added advanced real-time emotion detection to the interview and assessment modules. The system now analyzes facial expressions using TensorFlow.js with face-api.js, providing immediate feedback and emotional intelligence insights.

### Key Benefits

- **Enhanced Interview Analysis**: Provides objective feedback on emotional responses during mock interviews
- **Privacy-Focused**: All facial analysis is processed directly in the browser - no images are sent to servers
- **Flexible Implementation**: Falls back gracefully to server-side analysis or mock data if client-side detection isn't available
- **Accurate Recognition**: Detects 7 key emotions: happy, sad, angry, surprised, fearful, disgusted, and neutral

### Technical Implementation

- Built with face-api.js (TensorFlow.js)
- Uses pre-trained models for face detection and emotion recognition
- Processes video frames in real-time with optimized performance
- Implemented with React hooks and context for state management

For detailed implementation instructions, see the [frontend README](/TamkeenAI_CareerSystem/frontend/README.md).

## Project Overview

Tamkeen AI is a comprehensive career development platform that helps job seekers prepare for interviews, assess their skills, and find suitable career opportunities.

## Setup Instructions

1. Clone the repository
2. See individual READMEs in each directory for specific setup instructions:
   - [Frontend Setup](/TamkeenAI_CareerSystem/frontend/README.md)
   - [Backend Setup](/TamkeenAI_CareerSystem/backend/README.md)

## Features

- **Career Assessment Tools**: Skills assessment, personality tests, and career fit analysis
- **Interview Preparation**: AI-powered mock interviews with feedback
- **Job Matching**: Smart job recommendations based on skills and preferences
- **Learning Resources**: Curated resources for skill development
- **Resume Builder**: AI-assisted resume creation and optimization

## Technology Stack

- **Frontend**: React, Material UI
- **Backend**: Python, FastAPI
- **Data Processing**: TensorFlow, NLP models
- **Database**: PostgreSQL, MongoDB
- **Deployment**: Docker, Kubernetes
