"""
Interview Simulator Module

This module provides functionality for generating interview questions, evaluating responses,
and conducting mock interview sessions to help users prepare for job interviews.
"""

import os
import json
import random
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import re

# Import other modules
from .keyword_recommender import extract_keywords, find_matching_keywords
from .feedback_engine import FeedbackEngine

# Import settings
from config.settings import BASE_DIR

# Define paths for interview data
INTERVIEW_QUESTIONS_DIR = os.path.join(BASE_DIR, 'data', 'interviews', 'questions')
INTERVIEW_TIPS_DIR = os.path.join(BASE_DIR, 'data', 'interviews', 'tips')
os.makedirs(INTERVIEW_QUESTIONS_DIR, exist_ok=True)
os.makedirs(INTERVIEW_TIPS_DIR, exist_ok=True)

# Try importing NLP libraries for response analysis
try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        print("Warning: spaCy model not found. Run: python -m spacy download en_core_web_sm")
        SPACY_AVAILABLE = False
except ImportError:
    SPACY_AVAILABLE = False
    print("Warning: spaCy not available. Install with: pip install spacy")

# Try importing sentence transformers for semantic similarity
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
    # Initialize model (loading will be done lazily)
    sentence_model = None
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    sentence_model = None
    print("Warning: sentence-transformers not available. Install with: pip install sentence-transformers")


class InterviewSimulator:
    """Class for managing interview simulation sessions"""
    
    def __init__(self, user_id: Optional[str] = None):
        """
        Initialize interview simulator
        
        Args:
            user_id: Optional user ID for tracking interview history
        """
        self.user_id = user_id
        self.feedback_engine = FeedbackEngine()
        self.questions = self._load_questions()
        self.interview_tips = self._load_interview_tips()
        self.current_session = {
            "start_time": None,
            "job_title": None,
            "questions": [],
            "current_question_index": 0,
            "responses": [],
            "feedback": [],
            "completed": False
        }
    
    def _load_questions(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load interview questions from files"""
        questions = {
            "behavioral": [],
            "technical": [],
            "situational": [],
            "common": [],
            "role_specific": {}
        }
        
        try:
            # Look for question JSON files
            for filename in os.listdir(INTERVIEW_QUESTIONS_DIR):
                if filename.endswith('.json'):
                    category = os.path.splitext(filename)[0]
                    file_path = os.path.join(INTERVIEW_QUESTIONS_DIR, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if category.startswith("role_"):
                            role_name = category.replace("role_", "")
                            questions["role_specific"][role_name] = data
                        else:
                            questions[category] = data
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading questions: {e}")
            
            # Create default questions if none exist
            questions = {
                "behavioral": [
                    {
                        "id": "b1",
                        "question": "Tell me about a time you faced a difficult challenge at work.",
                        "expected_keywords": ["challenge", "problem", "solution", "team", "success"],
                        "tips": "Use the STAR method: Situation, Task, Action, Result.",
                        "difficulty": "medium"
                    },
                    {
                        "id": "b2",
                        "question": "Describe a situation where you had to work with a difficult colleague.",
                        "expected_keywords": ["conflict", "collaboration", "communication", "resolution"],
                        "tips": "Focus on how you resolved the situation professionally.",
                        "difficulty": "medium"
                    },
                    {
                        "id": "b3",
                        "question": "Tell me about a time you made a mistake. How did you handle it?",
                        "expected_keywords": ["mistake", "error", "learn", "improve", "responsibility"],
                        "tips": "Show accountability and what you learned from the experience.",
                        "difficulty": "hard"
                    },
                    {
                        "id": "b4",
                        "question": "Describe a project you're particularly proud of.",
                        "expected_keywords": ["achievement", "success", "impact", "skills", "contribution"],
                        "tips": "Highlight your specific contributions and the impact of the project.",
                        "difficulty": "easy"
                    },
                    {
                        "id": "b5",
                        "question": "Tell me about a time you had to meet a tight deadline.",
                        "expected_keywords": ["deadline", "pressure", "prioritize", "deliver", "time management"],
                        "tips": "Emphasize your planning and prioritization skills.",
                        "difficulty": "medium"
                    }
                ],
                "technical": [
                    {
                        "id": "t1",
                        "question": "How do you approach debugging a complex issue?",
                        "expected_keywords": ["systematic", "logs", "reproduce", "isolate", "test"],
                        "tips": "Describe your step-by-step methodology with a specific example.",
                        "difficulty": "medium"
                    },
                    {
                        "id": "t2",
                        "question": "Explain how you ensure the quality of your work.",
                        "expected_keywords": ["testing", "review", "standards", "documentation", "validation"],
                        "tips": "Include testing strategies, peer reviews, and quality standards you follow.",
                        "difficulty": "medium"
                    }
                ],
                "situational": [
                    {
                        "id": "s1",
                        "question": "How would you handle a situation where you disagree with your manager's decision?",
                        "expected_keywords": ["respect", "perspective", "communicate", "propose", "compromise"],
                        "tips": "Show respect for authority while demonstrating your ability to communicate effectively.",
                        "difficulty": "hard"
                    },
                    {
                        "id": "s2",
                        "question": "If a project is falling behind schedule, what steps would you take?",
                        "expected_keywords": ["communicate", "assess", "prioritize", "team", "plan"],
                        "tips": "Emphasize proactive communication and pragmatic problem-solving.",
                        "difficulty": "medium"
                    }
                ],
                "common": [
                    {
                        "id": "c1",
                        "question": "Tell me about yourself.",
                        "expected_keywords": ["experience", "skills", "background", "relevant", "achievements"],
                        "tips": "Keep it professional and relevant to the role. 2-3 minutes is ideal.",
                        "difficulty": "easy"
                    },
                    {
                        "id": "c2",
                        "question": "Why do you want to work for this company?",
                        "expected_keywords": ["research", "values", "culture", "growth", "contribution"],
                        "tips": "Show you've done your research on the company and explain how your goals align.",
                        "difficulty": "medium"
                    },
                    {
                        "id": "c3",
                        "question": "What are your greatest strengths?",
                        "expected_keywords": ["relevant", "example", "skill", "benefit", "value"],
                        "tips": "Focus on strengths relevant to the role and provide specific examples.",
                        "difficulty": "easy"
                    },
                    {
                        "id": "c4",
                        "question": "What is your greatest weakness?",
                        "expected_keywords": ["aware", "improve", "learning", "overcome", "positive"],
                        "tips": "Be honest but strategic. Mention steps you're taking to improve.",
                        "difficulty": "hard"
                    },
                    {
                        "id": "c5",
                        "question": "Where do you see yourself in five years?",
                        "expected_keywords": ["growth", "develop", "learn", "contribute", "goals"],
                        "tips": "Show ambition while ensuring alignment with the company and role.",
                        "difficulty": "medium"
                    }
                ],
            }
        
        return questions
    
    def _load_interview_tips(self) -> Dict[str, List[str]]:
        """Load interview tips from files"""
        tips = {
            "behavioral": [],
            "technical": [],
            "situational": [],
            "common": [],
            "role_specific": {}
        }
        
        try:
            # Look for tip JSON files
            for filename in os.listdir(INTERVIEW_TIPS_DIR):
                if filename.endswith('.json'):
                    category = os.path.splitext(filename)[0]
                    file_path = os.path.join(INTERVIEW_TIPS_DIR, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if category.startswith("role_"):
                            role_name = category.replace("role_", "")
                            tips["role_specific"][role_name] = data
                        else:
                            tips[category] = data
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading tips: {e}")
            
            # Create default tips if none exist
            tips = {
                "behavioral": [
                    "Use the STAR method: Situation, Task, Action, Result.",
                    "Focus on the specific details of the situation.",
                    "Show accountability and what you learned from the experience.",
                    "Highlight your specific contributions and the impact of the project.",
                    "Emphasize your planning and prioritization skills."
                ],
                "technical": [
                    "Describe your step-by-step methodology with a specific example.",
                    "Include testing strategies, peer reviews, and quality standards you follow."
                ],
                "situational": [
                    "Show respect for authority while demonstrating your ability to communicate effectively.",
                    "Emphasize proactive communication and pragmatic problem-solving."
                ],
                "common": [
                    "Keep it professional and relevant to the role. 2-3 minutes is ideal.",
                    "Show you've done your research on the company and explain how your goals align.",
                    "Focus on strengths relevant to the role and provide specific examples.",
                    "Be honest but strategic. Mention steps you're taking to improve.",
                    "Show ambition while ensuring alignment with the company and role."
                ],
            }
        
        return tips
    
    def generate_questions(self, job_title: str, job_description: str, 
                           user_skills: List[str], difficulty: str = "medium",
                           question_count: int = 5) -> List[Dict[str, Any]]:
        """
        Generate relevant interview questions for a job
        
        Args:
            job_title: Title of the job
            job_description: Description of the job
            user_skills: List of user's skills
            difficulty: Difficulty level (easy, medium, hard)
            question_count: Number of questions to generate
            
        Returns:
            list: List of interview questions
        """
        questions = []
        for _ in range(question_count):
            question = self._generate_question(job_title, job_description, user_skills, difficulty)
            questions.append(question)
        return questions
    
    def _generate_question(self, job_title: str, job_description: str, 
                           user_skills: List[str], difficulty: str = "medium") -> Dict[str, Any]:
        """
        Generate a single relevant interview question for a job
        
        Args:
            job_title: Title of the job
            job_description: Description of the job
            user_skills: List of user's skills
            difficulty: Difficulty level (easy, medium, hard)
            
        Returns:
            dict: Interview question
        """
        # Implement question generation logic based on job title, description, and user skills
        # This is a placeholder and should be replaced with actual implementation
        return {
            "id": "temp_id",
            "question": "This is a placeholder question. Actual implementation needed.",
            "expected_keywords": [],
            "tips": "This is a placeholder tip. Actual implementation needed.",
            "difficulty": difficulty
        }
    
    def start_session(self, job_title: str, job_description: str, 
                      difficulty: str = "medium", question_count: int = 5) -> Dict[str, Any]:
        """
        Start a new mock interview session
        
        Args:
            job_title: Job title
            job_description: Job description
            difficulty: Difficulty level
            question_count: Number of questions
            
        Returns:
            dict: Mock interview session data
        """
        self.current_session["start_time"] = datetime.now()
        self.current_session["job_title"] = job_title
        self.current_session["questions"] = self.generate_questions(job_title, job_description, [], difficulty, question_count)
        self.current_session["current_question_index"] = 0
        self.current_session["responses"] = []
        self.current_session["feedback"] = []
        self.current_session["completed"] = False
        
        return {
            "job_title": job_title,
            "job_description": job_description,
            "difficulty": difficulty,
            "question_count": question_count,
            "current_question_index": 0,
            "questions": self.current_session["questions"],
            "responses": self.current_session["responses"],
            "feedback": self.current_session["feedback"],
            "completed": self.current_session["completed"]
        }
    
    def evaluate_response(self, question: Dict[str, Any], response: str) -> Dict[str, Any]:
        """
        Evaluate user's response to an interview question
        
        Args:
            question: Question data
            response: User's response text
            
        Returns:
            dict: Feedback and evaluation
        """
        # Implement response evaluation logic
        # This is a placeholder and should be replaced with actual implementation
        return {
            "feedback": "This is a placeholder feedback. Actual implementation needed.",
            "evaluation": "This is a placeholder evaluation. Actual implementation needed."
        }
    
    def save_interview_history(self) -> bool:
        """Save interview session history"""
        if not self.user_id:
            return False
        
        history_dir = os.path.join(BASE_DIR, 'data', 'users', self.user_id, 'interviews')
        os.makedirs(history_dir, exist_ok=True)
        
        # Create a timestamped record
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_{timestamp}.json"
        
        try:
            with open(os.path.join(history_dir, filename), 'w', encoding='utf-8') as f:
                json.dump(self.current_session, f, indent=2)
            return True
        except IOError as e:
            print(f"Error saving interview history: {e}")
            return False


# Standalone functions for interview simulation

def generate_interview_questions(job_title: str, job_description: str, 
                               user_skills: List[str], difficulty: str = "medium",
                               question_count: int = 5) -> List[Dict[str, Any]]:
    """
    Generate relevant interview questions for a job
    
    Args:
        job_title: Title of the job
        job_description: Description of the job
        user_skills: List of user's skills
        difficulty: Difficulty level (easy, medium, hard)
        question_count: Number of questions to generate
        
    Returns:
        list: List of interview questions
    """
    simulator = InterviewSimulator()
    questions = simulator.generate_questions(
        job_title=job_title,
        job_description=job_description,
        user_skills=user_skills,
        difficulty=difficulty,
        question_count=question_count
    )
    return questions


def evaluate_interview_response(question: Dict[str, Any], response: str) -> Dict[str, Any]:
    """
    Evaluate user's response to an interview question
    
    Args:
        question: Question data
        response: User's response text
        
    Returns:
        dict: Feedback and evaluation
    """
    simulator = InterviewSimulator()
    return simulator.evaluate_response(question, response)


def start_mock_interview(user_id: str, job_title: str, job_description: str,
                        difficulty: str = "medium", question_count: int = 5) -> Dict[str, Any]:
    """
    Start a new mock interview session
    
    Args:
        user_id: User ID
        job_title: Job title
        job_description: Job description
        difficulty: Difficulty level
        question_count: Number of questions
        
    Returns:
        dict: Mock interview session data
    """
    simulator = InterviewSimulator(user_id)
    return simulator.start_session(job_title, job_description, difficulty, question_count) 