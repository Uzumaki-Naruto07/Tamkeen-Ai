# TamkeenAI Career Intelligence System

TamkeenAI is a comprehensive career empowerment system that helps users manage their entire career journey using AI-powered tools. From creating a professional profile to finding jobs, improving resumes, and preparing for interviews - TamkeenAI is the all-in-one solution.

## Features

- **User Profile Management**: Create and maintain a professional profile with skills, experience, and career goals.
- **ChatGPT Integration**: Natural language Q&A for career guidance and assistance.
- **ATS Matching System**: Compare uploaded resumes with job descriptions and get improvement suggestions.
- **Gamified Career Dashboard**: Track your progress with XP, levels, badges, and a career leaderboard.
- **Personalized Learning Paths**: Get AI-recommended courses and resources based on your skill gaps.
- **Job Automation Application**: One-click job applications with personalized cover letters.
- **Interview Simulator**: Practice with AI-powered mock interviews and get feedback.
- **AI Feedback Engine**: Receive personalized career insights and recommendations.
- **Admin & Analytics**: Track user progress and system metrics (for administrators).

## Application Flow

1. **User Information Collection**: Gather user profile information with an animated welcome screen.
2. **ChatGPT + AI Job Automation**: AI agent helps with CVs, cover letters, and job matching.
3. **ATS Matching System**: Compare resumes with job descriptions and get keyword analysis.
4. **Gamified Career Dashboard**: Track career progress with a smart navigation bar and reorderable widgets.
5. **Personalized Learning Paths**: Get course recommendations based on skill gaps.
6. **Job Automation Application**: Apply to jobs with one click and receive job alerts.
7. **Interview Simulator**: Practice with AI-powered mock interviews and get feedback.
8. **AI Feedback Engine**: Get AI-generated career insights and recommendations.
9. **Admin & Analytics**: Track user statistics and system performance.

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
- SQLite database (configurable to use other databases)

## Getting Started

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- API keys for OpenAI, DeepSeek, and HuggingFace (optional, mock data will be used if not provided)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/TamkeenAI_CareerSystem.git
   cd TamkeenAI_CareerSystem
   ```

2. Set up API keys in `.env` file
   ```bash
   # Backend/.env
   OPENAI_API_KEY=your_openai_api_key_here
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

3. Run the application start script
   ```bash
   ./run_app.sh
   ```
   This will:
   - Create and activate a Python virtual environment
   - Install backend dependencies
   - Install frontend dependencies
   - Start both the backend and frontend servers

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Manual Setup (if the script doesn't work)

#### Backend
```bash
cd TamkeenAI_CareerSystem/backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd TamkeenAI_CareerSystem/frontend
npm install
npm run dev
```

## Usage

1. Register a new account or use the following demo credentials:
   - Email: demo@tamkeen.ai
   - Password: tamkeen2023

2. Complete your profile information to get personalized recommendations.

3. Explore the dashboard widgets to see your career progress.

4. Use the ChatGPT integration to get career advice and assistance.

5. Upload your resume to get ATS scoring and improvement suggestions.

6. Search for jobs and apply with one click.

7. Practice interviews with the AI coach.

## Configuration

You can configure various aspects of the application in the following files:

- `backend/.env`: API keys and backend configuration
- `frontend/.env`: Frontend environment variables
- `backend/api/utils/mock_data.py`: Mock data for development

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
- All the contributors who helped build this project

---

*Built by an Emirati, for Emiratis. We don't settle for second place.* 