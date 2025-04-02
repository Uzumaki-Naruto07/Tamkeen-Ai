import os
import logging
import random
import json
import uuid
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any, Optional
from ..config.emotion_detection_config import ROLES, DEFAULT_NUM_QUESTIONS, DEFAULT_ANSWER_TIME

logger = logging.getLogger(__name__)

class InterviewService:
    """Service for conducting interviews with emotion analysis"""
    
    def __init__(self):
        """Initialize the interview service"""
        self._load_questions()
        self.active_sessions = {}
        self.session_directory = "interview_sessions"
        os.makedirs(self.session_directory, exist_ok=True)
        
        # Load UAE cultural context data
        self._load_uae_cultural_data()
    
    def _load_uae_cultural_data(self):
        """Load UAE-specific cultural context and localization data"""
        self.uae_cultural_data = {
            "greetings": [
                "Marhaba! Ready to ace your interview today?",
                "Ahlan wa sahlan! Let's prepare you for interview success.",
                "As-salamu alaykum! I'm here to help with your interview preparation."
            ],
            "cultural_tips": {
                "general": [
                    "In the UAE market, showcasing adaptability and multilingual communication can make a difference.",
                    "Understanding of UAE Vision 2030 can demonstrate your alignment with national goals.",
                    "Highlighting experience with diverse teams shows cultural adaptability valued in the UAE."
                ],
                "government": [
                    "Knowledge of UAE government structures and Emiratization policies is valuable.",
                    "Highlighting Arabic language skills can be advantageous for government positions.",
                    "Understanding of UAE Vision 2030 and national priorities is important."
                ],
                "tech": [
                    "The UAE is investing heavily in AI, blockchain, and smart city technologies.",
                    "Experience with regional tech implementations can set you apart.",
                    "Familiarity with UAE tech regulations and compliance may be relevant."
                ],
                "education": [
                    "UAE education sector values international experience and multilingual abilities.",
                    "Knowledge of UAE educational frameworks and cultural sensitivities is important.",
                    "Experience with diverse student populations is highly regarded."
                ]
            },
            "coach_personas": {
                "noora": {
                    "name": "NooraGPT",
                    "title": "Government Sector Interview Specialist 🇦🇪",
                    "specialty": "UAE government hiring practices and Emiratization policies",
                    "greeting": "Marhaba! I'm Noora, your UAE government sector interview specialist. Ready to help you prepare for your public sector career!",
                    "language_style": "formal, professional, government-focused"
                },
                "ahmed": {
                    "name": "AhmedGPT",
                    "title": "Tech Industry Senior Manager",
                    "specialty": "Technical interviews and system design",
                    "greeting": "Hello! I'm Ahmed, your tech industry interview guide. Let's prepare you for technical and managerial questions!",
                    "language_style": "analytical, technical, solution-oriented"
                },
                "fatima": {
                    "name": "FatimaGPT",
                    "title": "Female Empowerment & Career Strategist",
                    "specialty": "Women's career advancement in the UAE",
                    "greeting": "Ahlan! I'm Fatima, focused on empowering women in their UAE career journeys. Let's build your confidence for your interview!",
                    "language_style": "encouraging, supportive, empowering"
                },
                "zayd": {
                    "name": "ZaydGPT",
                    "title": "AI-driven Logic and Brainy Questions Bot",
                    "specialty": "Analytical thinking and problem-solving",
                    "greeting": "Greetings. I am Zayd, designed to challenge your analytical thinking. Let's assess your problem-solving capabilities.",
                    "language_style": "precise, logical, challenging"
                }
            },
            "local_companies": [
                {"name": "ADNOC", "sector": "Energy", "focus": "Oil, gas, and energy transition"},
                {"name": "Etisalat (e&)", "sector": "Telecommunications", "focus": "Digital transformation"},
                {"name": "Emirates", "sector": "Aviation", "focus": "Global air travel and hospitality"},
                {"name": "Mubadala", "sector": "Investment", "focus": "Strategic investments and sovereign wealth"},
                {"name": "Dubai Holding", "sector": "Investment", "focus": "Diversified investments and real estate"},
                {"name": "Masdar", "sector": "Renewable Energy", "focus": "Clean energy and sustainable development"},
                {"name": "ADCB", "sector": "Banking", "focus": "Financial services and digital banking"},
                {"name": "Aldar Properties", "sector": "Real Estate", "focus": "Property development and management"}
            ]
        }
        
        # UAE-specific questions for various sectors
        self.question_bank["UAE Government"] = [
            "How does your experience align with UAE Vision 2030 goals?",
            "Describe your understanding of Emiratization and its importance.",
            "How would you contribute to digital government transformation?",
            "Explain your experience working in multicultural teams.",
            "How would you approach implementing policy changes in a government entity?",
            "What experience do you have with UAE regulatory frameworks?",
            "How would you handle a situation where traditional processes need modernization?"
        ]
        
        self.question_bank["UAE Tech"] = [
            "How would you contribute to UAE's goal of becoming a global AI hub?",
            "Describe a technical project that could benefit UAE's smart city initiatives.",
            "How would you approach technology implementation while respecting local values?",
            "What experience do you have with tech solutions for desert environments?",
            "How would you manage a team with diverse cultural backgrounds in the tech sector?",
            "What cybersecurity considerations are unique to UAE operations?",
            "How would you align technical solutions with UAE's innovation strategy?"
        ]
        
        self.question_bank["UAE Education"] = [
            "How would you balance international educational standards with UAE cultural values?",
            "Describe your approach to teaching in multilingual environments.",
            "How would you incorporate UAE history and culture into your curriculum?",
            "What experience do you have with UAE's educational framework?",
            "How would you engage with parents from diverse cultural backgrounds?",
            "Describe how you would contribute to UAE's educational vision.",
            "What approaches would you take to foster innovation in UAE classrooms?"
        ]
        
        logger.info("UAE cultural data loaded successfully")
    
    def _load_questions(self):
        """Load interview questions from file or initialize defaults"""
        self.question_bank = {
            "common": [
                "Tell me about yourself and your background.",
                "What are your greatest strengths?",
                "What do you consider to be your weaknesses?",
                "Why are you interested in this position?",
                "Where do you see yourself in five years?",
                "Describe a challenge you faced at work and how you handled it.",
                "How do you handle pressure or stressful situations?",
                "What are your salary expectations?",
                "Do you have any questions for me about the role or company?"
            ]
        }
        
        # Role-specific questions
        self.question_bank["Data Scientist"] = [
            "Can you explain a complex data science concept in simple terms?",
            "Describe a data project you've worked on from start to finish.",
            "How do you ensure your data analyses are both accurate and actionable?",
            "How do you handle missing or corrupted data in your datasets?",
            "Explain the difference between supervised and unsupervised learning.",
            "What metrics would you use to evaluate a classification model?",
            "How do you communicate technical findings to non-technical stakeholders?"
        ]
        
        self.question_bank["Software Engineer"] = [
            "Describe your experience with different programming languages and frameworks.",
            "How do you approach debugging a complex software issue?",
            "Explain your process for designing scalable software architecture.",
            "How do you ensure code quality and maintainability?",
            "Tell me about a time you had to refactor a piece of code and why.",
            "How do you stay updated with the latest technology trends?",
            "Describe your experience with agile development methodologies."
        ]
        
        self.question_bank["Product Manager"] = [
            "How do you prioritize product features?",
            "Describe how you would launch a new product from concept to market.",
            "How do you gather and incorporate user feedback?",
            "Tell me about a product you managed that wasn't successful. What did you learn?",
            "How do you balance stakeholder requests with user needs?",
            "Describe your experience working with engineering and design teams.",
            "How do you measure the success of a product?"
        ]
        
        self.question_bank["UI/UX Designer"] = [
            "Walk me through your design process from concept to implementation.",
            "How do you incorporate user research into your designs?",
            "Describe a UI/UX problem you solved and your approach.",
            "How do you handle feedback and criticism on your designs?",
            "How do you balance aesthetics with functionality?",
            "Describe how you would design for accessibility.",
            "What design tools and software are you proficient with?"
        ]
        
        self.question_bank["Marketing Specialist"] = [
            "Describe a successful marketing campaign you developed.",
            "How do you measure the success of marketing initiatives?",
            "How do you stay current with marketing trends and technologies?",
            "Describe your experience with digital marketing channels.",
            "How would you approach marketing to a new target audience?",
            "Describe your experience with content creation and management.",
            "How do you analyze market research and apply it to marketing strategies?"
        ]
        
        # General questions for roles not specifically listed
        self.question_bank["General"] = [
            "What specific skills do you bring to this role?",
            "How does your experience align with this position?",
            "Describe your ideal working environment.",
            "What motivates you in your work?",
            "How do you approach learning new skills?",
            "Tell me about a time you had to adapt to a significant change at work.",
            "How do you prioritize tasks when you have multiple deadlines?"
        ]
        
        logger.info("Interview question bank loaded successfully")
    
    def generate_interview_questions(self, role: str, num_questions: int = DEFAULT_NUM_QUESTIONS, sector_context: str = None, is_uae_focused: bool = False) -> List[str]:
        """
        Generate role-specific interview questions
        
        Args:
            role: Job role to generate questions for
            num_questions: Number of questions to generate
            sector_context: Optional UAE sector context (government, tech, education)
            is_uae_focused: Whether to include UAE-specific questions
            
        Returns:
            List of interview questions
        """
        # Validate role
        if role not in self.question_bank and role not in ROLES:
            logger.warning(f"Unknown role: {role}, using general questions")
            specific_questions = self.question_bank.get("General", [])
        else:
            specific_questions = self.question_bank.get(role, self.question_bank["General"])
        
        # Always include common questions
        common_questions = self.question_bank["common"]
        
        # Add UAE-specific questions if requested
        uae_questions = []
        if is_uae_focused and sector_context:
            uae_context_key = f"UAE {sector_context.capitalize()}"
            if uae_context_key in self.question_bank:
                uae_questions = self.question_bank[uae_context_key]
                logger.info(f"Added UAE-specific questions for {sector_context} sector")
            else:
                logger.warning(f"No UAE-specific questions found for {sector_context} sector")
        
        # Combine questions and select the required number
        all_questions = common_questions + specific_questions + uae_questions
        
        if num_questions >= len(all_questions):
            return all_questions
        else:
            # Ensure we have at least one role-specific question if available
            selected = []
            if specific_questions:
                selected.append(random.choice(specific_questions))
            
            # Include at least one UAE-specific question if available and requested
            if uae_questions and is_uae_focused:
                selected.append(random.choice(uae_questions))
            
            # Always include "Tell me about yourself" as the first question
            about_yourself = "Tell me about yourself and your background."
            if about_yourself in all_questions:
                selected.append(about_yourself)
                all_questions.remove(about_yourself)
            
            # Add remaining random questions
            remaining_slots = num_questions - len(selected)
            if remaining_slots > 0:
                remaining_questions = random.sample(
                    [q for q in all_questions if q not in selected], 
                    min(remaining_slots, len(all_questions) - len(selected))
                )
                selected.extend(remaining_questions)
            
            # Make "Tell me about yourself" the first question if selected
            if about_yourself in selected:
                selected.remove(about_yourself)
                selected.insert(0, about_yourself)
            
            return selected
    
    def start_interview_session(self, role: str, user_id: str, num_questions: int = DEFAULT_NUM_QUESTIONS, 
                               coach_persona: str = "zayd", sector_context: str = None) -> Dict[str, Any]:
        """
        Start a new interview session
        
        Args:
            role: Job role for interview questions
            user_id: ID of the user conducting the interview
            num_questions: Number of questions to include
            coach_persona: Selected coach persona ID
            sector_context: Optional UAE sector context
            
        Returns:
            Dictionary with session details
        """
        # Generate a session ID
        session_id = str(uuid.uuid4())
        
        # Generate questions (include UAE context if sector_context is provided)
        questions = self.generate_interview_questions(
            role, 
            num_questions, 
            sector_context=sector_context, 
            is_uae_focused=sector_context is not None
        )
        
        # Get coach persona details
        coach = self.uae_cultural_data["coach_personas"].get(
            coach_persona, 
            self.uae_cultural_data["coach_personas"]["zayd"]
        )
        
        # Get appropriate greeting for the coach
        greeting = coach["greeting"]
        
        # Create session data
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "role": role,
            "questions": questions,
            "current_question": 0,
            "answers": [],
            "emotion_analyses": [],
            "start_time": datetime.now().isoformat(),
            "completed": False,
            "coach_persona": coach_persona,
            "sector_context": sector_context,
            "greeting": greeting
        }
        
        # Store the session
        self.active_sessions[session_id] = session
        self._save_session(session_id, session)
        
        return {
            "session_id": session_id,
            "role": role,
            "total_questions": len(questions),
            "current_question": 1,
            "question": questions[0],
            "coach_persona": coach_persona,
            "greeting": greeting
        }
    
    def get_uae_cultural_tips(self, sector: str) -> List[str]:
        """
        Get UAE cultural tips for a specific sector
        
        Args:
            sector: Sector to get cultural tips for (general, government, tech, education)
            
        Returns:
            List of cultural tips
        """
        if sector not in self.uae_cultural_data["cultural_tips"]:
            logger.warning(f"Unknown sector: {sector}, using general cultural tips")
            return self.uae_cultural_data["cultural_tips"]["general"]
        
        return self.uae_cultural_data["cultural_tips"][sector]
    
    def get_coach_personas(self) -> Dict[str, Dict[str, str]]:
        """
        Get all available coach personas
        
        Returns:
            Dictionary of coach personas
        """
        return self.uae_cultural_data["coach_personas"]
    
    def get_local_companies(self) -> List[Dict[str, str]]:
        """
        Get list of prominent UAE companies
        
        Returns:
            List of company data
        """
        return self.uae_cultural_data["local_companies"]
    
    def get_current_question(self, session_id: str) -> Dict[str, Any]:
        """
        Get the current question for an active interview session
        
        Args:
            session_id: ID of the interview session
            
        Returns:
            Dictionary with current question details
        """
        session = self._get_session(session_id)
        
        if not session:
            return {"error": "Session not found"}
        
        if session["completed"]:
            return {"error": "Interview already completed"}
        
        current_index = session["current_question"]
        if current_index >= len(session["questions"]):
            # All questions answered
            return {
                "session_id": session_id,
                "completed": True,
                "message": "All questions have been answered"
            }
        
        return {
            "session_id": session_id,
            "role": session["role"],
            "total_questions": len(session["questions"]),
            "current_question": current_index + 1,  # 1-based for display
            "question": session["questions"][current_index]
        }
    
    def submit_answer(self, session_id: str, answer_text: str, emotion_analysis: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Submit an answer to the current question
        
        Args:
            session_id: ID of the interview session
            answer_text: Text of the user's answer
            emotion_analysis: Optional emotion analysis data
            
        Returns:
            Dictionary with next question or completion status
        """
        session = self._get_session(session_id)
        
        if not session:
            return {"error": "Session not found"}
        
        if session["completed"]:
            return {"error": "Interview already completed"}
        
        current_index = session["current_question"]
        if current_index >= len(session["questions"]):
            return {"error": "All questions already answered"}
        
        # Record the answer
        answer = {
            "question_index": current_index,
            "question": session["questions"][current_index],
            "answer_text": answer_text,
            "timestamp": datetime.now().isoformat()
        }
        
        session["answers"].append(answer)
        session["emotion_analyses"].append(emotion_analysis)
        
        # Move to the next question
        session["current_question"] += 1
        
        # Check if interview is complete
        is_complete = session["current_question"] >= len(session["questions"])
        if is_complete:
            session["completed"] = True
            session["end_time"] = datetime.now().isoformat()
        
        # Save updated session
        self._save_session(session_id, session)
        
        # Return next question or completion status
        if is_complete:
            return {
                "session_id": session_id,
                "completed": True,
                "message": "Interview completed",
                "next_step": "Get your interview analysis"
            }
        else:
            next_index = session["current_question"]
            return {
                "session_id": session_id,
                "role": session["role"],
                "total_questions": len(session["questions"]),
                "current_question": next_index + 1,  # 1-based for display
                "question": session["questions"][next_index]
            }
    
    def get_interview_analysis(self, session_id: str) -> Dict[str, Any]:
        """
        Get a comprehensive analysis of the completed interview
        
        Args:
            session_id: ID of the interview session
            
        Returns:
            Dictionary with interview analysis
        """
        session = self._get_session(session_id)
        
        if not session:
            return {"error": "Session not found"}
        
        if not session["completed"]:
            return {"error": "Interview not yet completed"}
        
        # Get emotion analyses
        emotion_analyses = session["emotion_analyses"]
        
        # Skip questions with no emotion data
        valid_analyses = [ea for ea in emotion_analyses if ea and ea.get('emotion_percentages')]
        
        if not valid_analyses:
            return {
                "session_id": session_id,
                "completed": True,
                "message": "Interview completed but no valid emotion data was collected",
                "questions": session["questions"],
                "answers": [a["answer_text"] for a in session["answers"]]
            }
        
        # Calculate average metrics
        confidence_scores = [a.get('confidence_score', 0) for a in valid_analyses]
        engagement_scores = [a.get('engagement_score', 0) for a in valid_analyses]
        positive_ratios = [a.get('positive_ratio', 0) for a in valid_analyses]
        negative_ratios = [a.get('negative_ratio', 0) for a in valid_analyses]
        neutral_ratios = [a.get('neutral_ratio', 0) for a in valid_analyses]
        
        avg_confidence = sum(confidence_scores) / len(confidence_scores)
        avg_engagement = sum(engagement_scores) / len(engagement_scores)
        avg_positive = sum(positive_ratios) / len(positive_ratios)
        avg_negative = sum(negative_ratios) / len(negative_ratios)
        avg_neutral = sum(neutral_ratios) / len(neutral_ratios)
        
        # Count all emotions across answers
        all_emotions = defaultdict(int)
        for analysis in valid_analyses:
            for emotion, count in analysis.get('emotion_counts', {}).items():
                all_emotions[emotion] += count
        
        # Find strongest and weakest responses
        strongest_q_idx = confidence_scores.index(max(confidence_scores))
        weakest_q_idx = confidence_scores.index(min(confidence_scores))
        
        # Generate overall insights
        insights = []
        
        if avg_confidence < 0.4:
            insights.append("Work on building confidence in your responses. Practice answering common interview questions.")
        if avg_engagement < 0.4:
            insights.append("Try to show more engagement and enthusiasm during interviews.")
        if avg_positive < 0.3:
            insights.append("Consider showing more positive emotions like smiling during your responses.")
        if avg_negative > 0.3:
            insights.append("You displayed significant negative emotions, which might impact interviewer perception.")
        
        consistency = 1.0 - (max(confidence_scores) - min(confidence_scores))
        if consistency < 0.7:
            insights.append("Your emotional expression varied considerably between questions. Aim for more consistency.")
        
        # Calculate total and emotion percentages
        total_emotions = sum(all_emotions.values())
        emotion_percentages = {k: v/total_emotions for k, v in all_emotions.items()} if total_emotions > 0 else {}
        
        # Combine everything into a summary
        summary = {
            "session_id": session_id,
            "completed": True,
            "role": session["role"],
            "questions_and_answers": [
                {
                    "question_index": i,
                    "question": session["questions"][i],
                    "answer": session["answers"][i]["answer_text"] if i < len(session["answers"]) else "",
                    "emotion_analysis": session["emotion_analyses"][i] if i < len(session["emotion_analyses"]) else None
                }
                for i in range(len(session["questions"]))
            ],
            "overall_metrics": {
                "avg_confidence": avg_confidence,
                "avg_engagement": avg_engagement,
                "avg_positive": avg_positive,
                "avg_negative": avg_negative,
                "avg_neutral": avg_neutral,
                "consistency": consistency,
                "all_emotions": dict(all_emotions),
                "emotion_percentages": emotion_percentages
            },
            "strongest_response": {
                "question_index": strongest_q_idx,
                "question": session["questions"][strongest_q_idx],
                "metrics": {
                    "confidence": confidence_scores[strongest_q_idx],
                    "engagement": engagement_scores[strongest_q_idx]
                }
            },
            "weakest_response": {
                "question_index": weakest_q_idx,
                "question": session["questions"][weakest_q_idx],
                "metrics": {
                    "confidence": confidence_scores[weakest_q_idx],
                    "engagement": engagement_scores[weakest_q_idx]
                }
            },
            "insights": insights
        }
        
        return summary
    
    def list_interview_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        List all interview sessions for a user
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of session summaries
        """
        sessions = []
        
        try:
            # List all session files
            for filename in os.listdir(self.session_directory):
                if filename.endswith('.json'):
                    filepath = os.path.join(self.session_directory, filename)
                    with open(filepath, 'r') as f:
                        session = json.load(f)
                        
                        # Filter by user_id
                        if session.get("user_id") == user_id:
                            # Create a summary
                            summary = {
                                "session_id": session.get("session_id"),
                                "role": session.get("role"),
                                "start_time": session.get("start_time"),
                                "end_time": session.get("end_time"),
                                "completed": session.get("completed", False),
                                "num_questions": len(session.get("questions", [])),
                                "num_answers": len(session.get("answers", []))
                            }
                            sessions.append(summary)
        
        except Exception as e:
            logger.error(f"Error listing interview sessions: {str(e)}")
        
        return sessions
    
    def _get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get interview session data"""
        # Check active sessions first
        if session_id in self.active_sessions:
            return self.active_sessions[session_id]
        
        # Otherwise load from disk
        try:
            filepath = os.path.join(self.session_directory, f"{session_id}.json")
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    session = json.load(f)
                    # Add back to active sessions
                    self.active_sessions[session_id] = session
                    return session
        except Exception as e:
            logger.error(f"Error loading interview session {session_id}: {str(e)}")
        
        return None
    
    def _save_session(self, session_id: str, session: Dict[str, Any]) -> bool:
        """Save interview session data to disk"""
        try:
            filepath = os.path.join(self.session_directory, f"{session_id}.json")
            with open(filepath, 'w') as f:
                json.dump(session, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error saving interview session {session_id}: {str(e)}")
            return False 