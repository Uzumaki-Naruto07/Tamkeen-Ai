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
   - See all users’ dashboards, stats, skill heatmaps

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

### Manual Setup (if scripts don't work)

#### Backend
```bash
cd TamkeenAI_CareerSystem
python3 -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -U pip wheel setuptools
pip install -U numpy pandas scikit-learn  # Critical data science packages
cd backend
pip install -r requirements.txt
python app.py
```


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

“نحن لا نرضى إلا بالمركز الأول” — 🇦🇪

TamkeenAI was built to serve Emirati students, graduates, and professionals to achieve excellence in their careers using the power of AI.

> 💡 If you’re reading this, you’re not just using an app — you're stepping into the future.

Built with ❤️ by حصة المازمي — CEO of Solo Anonymous, Sharjah Capability Winner 🏆

Date Generated: March 29, 2025
