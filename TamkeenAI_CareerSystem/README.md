# TamkeenAI Career System

A comprehensive career guidance system that leverages AI to provide personalized career recommendations, skill development plans, and job matching.

## Features

- User profile creation with personality assessment
- AI-powered career matching algorithm
- Personalized career path recommendations
- Interactive career timeline generation
- Resume preview and generation
- Multilingual support (English and Arabic)
- Chat with AI career advisor

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **AI Integration**: DeepSeek AI API for career guidance
- **Authentication**: JWT authentication

## Setup and Installation

### Prerequisites

- Python 3.9+
- PostgreSQL
- DeepSeek API key

### Environment Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/TamkeenAI_CareerSystem.git
   cd TamkeenAI_CareerSystem
   ```

2. Create a virtual environment
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DATABASE_URL=postgresql://username:password@localhost/tamkeen_db
   JWT_SECRET_KEY=your_secret_key
   ENVIRONMENT=development
   ```

5. Create the database
   ```
   psql -U postgres
   CREATE DATABASE tamkeen_db;
   ```

6. Run database migrations
   ```
   cd backend
   alembic upgrade head
   ```

### Running the Application

1. Start the backend server
   ```
   cd backend
   uvicorn main:app --reload
   ```

2. Access the API documentation
   ```
   http://localhost:8000/docs
   ```

## API Documentation

The API documentation is available at `/docs` or `/redoc` endpoints when the server is running.

## License

[MIT License](LICENSE) 