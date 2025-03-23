import os
import re
import json
import logging
import hashlib
import random
import uuid
import time
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
from collections import defaultdict

# Optional dependencies - allow graceful fallback if not available
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import nltk
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    NLTK_AVAILABLE = True
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
    try:
        nltk.data.find('corpora/wordnet')
    except LookupError:
        nltk.download('wordnet', quiet=True)
        
    lemmatizer = WordNetLemmatizer()
    stop_words = set(stopwords.words('english'))
except ImportError:
    NLTK_AVAILABLE = False
    lemmatizer = None
    stop_words = None

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False


class EnhancedInterview:
    """
    Advanced interview simulation system with comprehensive scoring and feedback.
    
    Key features:
    - Question generation based on job requirements and user skills
    - Answer quality assessment using NLP techniques
    - Context-aware evaluation of responses
    - Technical and behavioral interview support
    - Integration with sentiment analysis for confidence evaluation
    - Detailed performance metrics and improvement tracking
    """
    
    def __init__(self, 
                question_bank_path: Optional[str] = None,
                model_path: Optional[str] = None,
                cache_dir: Optional[str] = None,
                sentiment_analyzer=None):
        """
        Initialize the enhanced interview simulator
        
        Args:
            question_bank_path: Path to interview question bank
            model_path: Path to NLP models for answer assessment
            cache_dir: Directory to cache interview data
            sentiment_analyzer: Optional sentiment analyzer instance for confidence scoring
        """
        self.logger = logging.getLogger(__name__)
        
        # Set up cache
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = None
            
        # Load question bank
        self.question_bank = self._load_question_bank(question_bank_path)
        
        # Initialize NLP components
        self.initialize_nlp(model_path)
        
        # Set up sentiment analyzer
        self.sentiment_analyzer = sentiment_analyzer
        
        # Session tracking
        self.active_sessions = {}
        
        self.logger.info("Enhanced interview simulator initialized")
    
    def initialize_nlp(self, model_path: Optional[str] = None):
        """Initialize NLP components for answer assessment"""
        self.nlp_models = {}
        
        # Set up QA assessment model
        if TRANSFORMERS_AVAILABLE:
            try:
                # Initialize answer quality assessment model
                qa_model_name = "distilbert-base-uncased-finetuned-sst-2-english"
                self.qa_tokenizer = AutoTokenizer.from_pretrained(qa_model_name)
                self.qa_model = AutoModelForSequenceClassification.from_pretrained(qa_model_name)
                self.nlp_models["qa_assessment"] = True
                
                # Initialize question classifier
                self.question_classifier = pipeline("zero-shot-classification")
                self.nlp_models["question_classifier"] = True
                
                # Initialize question answering model
                self.qa_pipeline = pipeline("question-answering")
                self.nlp_models["qa"] = True
                
                self.logger.info("Transformer models initialized for interview assessment")
            except Exception as e:
                self.logger.warning(f"Error initializing transformer models: {str(e)}")
        
        # Set up TFIDF model for answer similarity
        if SKLEARN_AVAILABLE:
            self.tfidf_vectorizer = TfidfVectorizer(
                analyzer='word',
                stop_words='english',
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.95
            )
            # We'll fit this later when we have example answers
            self.nlp_models["tfidf"] = True
        
        # Set up basic NLP tools
        self.nlp_available = NLTK_AVAILABLE
            
    def _load_question_bank(self, file_path: Optional[str] = None) -> Dict[str, Any]:
        """Load interview question bank from file or use default"""
        question_bank = {}
        
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    question_bank = json.load(f)
                self.logger.info(f"Loaded question bank from {file_path}")
            except Exception as e:
                self.logger.error(f"Error loading question bank: {str(e)}")
                question_bank = self._get_default_question_bank()
        else:
            question_bank = self._get_default_question_bank()
            
        return question_bank
    
    def _get_default_question_bank(self) -> Dict[str, Any]:
        """Get default interview question bank"""
        return {
            "behavioral": {
                "teamwork": [
                    {
                        "question": "Can you describe a time when you had to work with a difficult team member?",
                        "context": "collaboration, conflict resolution",
                        "key_aspects": ["problem identification", "solution approach", "outcome", "learning"]
                    },
                    {
                        "question": "Tell me about a successful team project you worked on. What was your contribution?",
                        "context": "collaboration, contribution",
                        "key_aspects": ["role clarity", "specific contribution", "outcome", "team dynamics"]
                    }
                ],
                "problem_solving": [
                    {
                        "question": "Describe a complex problem you faced and how you solved it.",
                        "context": "analytical thinking, solution implementation",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    },
                    {
                        "question": "Tell me about a time when you had to make a decision with incomplete information.",
                        "context": "decision making, uncertainty",
                        "key_aspects": ["situation context", "approach", "reasoning process", "outcome"]
                    }
                ],
                "leadership": [
                    {
                        "question": "Can you describe a situation where you had to lead a team through a difficult project?",
                        "context": "leadership style, team management",
                        "key_aspects": ["leadership approach", "challenge description", "actions taken", "results"]
                    },
                    {
                        "question": "Tell me about a time when you had to motivate a team member who was struggling.",
                        "context": "motivation, empathy",
                        "key_aspects": ["situation assessment", "approach", "specific actions", "outcome"]
                    }
                ],
            },
            "technical": {
                "problem_solving": [
                    {
                        "question": "Tell me about a time when you faced a complex technical problem and how you solved it.",
                        "context": "technical problem solving, analytical thinking",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    },
                    {
                        "question": "Describe a situation where you had to apply multiple technologies to solve a problem.",
                        "context": "technical integration, problem solving",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    }
                ],
                "coding": [
                    {
                        "question": "Can you explain how you would implement a specific algorithm in Python?",
                        "context": "coding skills, algorithm implementation",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    },
                    {
                        "question": "Tell me about a project where you had to write a custom function. What was the purpose of the function?",
                        "context": "coding skills, function implementation",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    }
                ],
                "data_analysis": [
                    {
                        "question": "Describe a situation where you had to analyze a large dataset. What was the outcome?",
                        "context": "data analysis, problem solving",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    },
                    {
                        "question": "Tell me about a project where you had to apply statistical methods to analyze data.",
                        "context": "data analysis, statistical methods",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    }
                ]
            },
            "behavioral": {
                "teamwork": [
                    {
                        "question": "Can you describe a time when you had to work with a difficult team member?",
                        "context": "collaboration, conflict resolution",
                        "key_aspects": ["problem identification", "solution approach", "outcome", "learning"]
                    },
                    {
                        "question": "Tell me about a successful team project you worked on. What was your contribution?",
                        "context": "collaboration, contribution",
                        "key_aspects": ["role clarity", "specific contribution", "outcome", "team dynamics"]
                    }
                ],
                "problem_solving": [
                    {
                        "question": "Describe a complex problem you faced and how you solved it.",
                        "context": "analytical thinking, solution implementation",
                        "key_aspects": ["problem complexity", "analytical process", "solution", "result"]
                    },
                    {
                        "question": "Tell me about a time when you had to make a decision with incomplete information.",
                        "context": "decision making, uncertainty",
                        "key_aspects": ["situation context", "approach", "reasoning process", "outcome"]
                    }
                ],
                "leadership": [
                    {
                        "question": "Can you describe a situation where you had to lead a team through a difficult project?",
                        "context": "leadership style, team management",
                        "key_aspects": ["leadership approach", "challenge description", "actions taken", "results"]
                    },
                    {
                        "question": "Tell me about a time when you had to motivate a team member who was struggling.",
                        "context": "motivation, empathy",
                        "key_aspects": ["situation assessment", "approach", "specific actions", "outcome"]
                    }
                ]
            }
        }
    
    def generate_interview_questions(self, job_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate interview questions based on job requirements"""
        questions = {}
        
        for category, aspects in job_requirements.items():
            questions[category] = []
            for aspect in aspects:
                questions[category].append({
                    "question": f"Tell me about a time when you {aspect}.",
                    "context": category,
                    "key_aspects": [aspect]
                })
        
        return questions
    
    def assess_answer(self, question: Dict[str, Any], answer: str) -> Dict[str, Any]:
        """Assess the quality of an answer based on the question"""
        # Implement answer assessment logic here
        # This is a placeholder and should be replaced with actual implementation
        return {
            "score": 0.8,  # Placeholder score
            "feedback": "Great answer! Keep up the good work."
        }
    
    def analyze_interview(self, session_id: str) -> Dict[str, Any]:
        """Analyze the entire interview session"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
            
        session_data = self.active_sessions[session_id]
        
        # Analyze each question and answer
        analysis = {}
        for question, answer in session_data["questions"].items():
            analysis[question] = self.assess_answer(question, answer)
        
        # Generate overall insights
        insights = self.generate_insights(analysis)
        
        return {
            "analysis": analysis,
            "insights": insights
        }
    
    def generate_insights(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights from the analysis of interview responses"""
        strengths = []
        improvements = []
        overall = []
        
        for question, result in analysis.items():
            score = result["score"]
            feedback = result["feedback"]
            
            if score >= 0.8:
                strengths.append(f"You demonstrated {question} effectively.")
            else:
                improvements.append(f"Consider improving your {question} responses.")
            
            overall.append(feedback)
        
        # Return insight groups
        return {
            "strengths": strengths,
            "areas_to_improve": improvements,
            "overall_insights": overall
        }
    
    def get_interview_history(self, session_id: str) -> Dict[str, Any]:
        """Get complete interview history for a session"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
            
        return self.active_sessions[session_id]
    
    def save_interview_session(self, session_id: str, save_path: Optional[str] = None) -> Dict[str, Any]:
        """Save interview session to file"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
            
        session_data = self.active_sessions[session_id]
        
        # Generate filename if not provided
        if not save_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            save_path = os.path.join(
                self.cache_dir or os.getcwd(),
                f"interview_session_{timestamp}_{session_id[:8]}.json"
            )
        
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            # Save session data
            with open(save_path, 'w') as f:
                json.dump(session_data, f, indent=2)
                
            return {
                "success": True,
                "file_path": save_path,
                "message": "Interview session saved successfully"
            }
        except Exception as e:
            self.logger.error(f"Error saving interview session: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to save interview session"
            }
    
    def load_interview_session(self, file_path: str) -> str:
        """Load interview session from file"""
        try:
            with open(file_path, 'r') as f:
                session_data = json.load(f)
                
            # Generate new session ID
            session_id = str(uuid.uuid4())
            
            # Store session data
            self.active_sessions[session_id] = session_data
            
            return session_id
        except Exception as e:
            self.logger.error(f"Error loading interview session: {str(e)}")
            return ""
