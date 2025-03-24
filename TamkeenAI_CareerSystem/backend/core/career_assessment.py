"""
Career Assessment Module

This module provides assessments for career interests, skills, and personality traits
to help users discover suitable career paths and development opportunities.
"""

import os
import json
import math
import random
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import uuid
import logging

# Import other core modules
from .user_info import UserProfile
from .keyword_recommender import extract_keywords, find_matching_keywords, KeywordRecommender

# Import settings
from config.settings import CAREER_READINESS_THRESHOLD, BASE_DIR

# Import database models
from backend.database.models import User, Resume, ResumeVersion, Career, CareerAssessment, UserSkill
from backend.database.connector import get_db, DatabaseError

# Setup logger
logger = logging.getLogger(__name__)

# Define paths for industry data
INDUSTRY_DATA_DIR = os.path.join(BASE_DIR, 'data', 'industries')
os.makedirs(INDUSTRY_DATA_DIR, exist_ok=True)

# Define paths for assessment data
ASSESSMENT_DIR = os.path.join(BASE_DIR, 'data', 'assessments')
INTEREST_ASSESSMENT_DIR = os.path.join(ASSESSMENT_DIR, 'interests')
SKILL_ASSESSMENT_DIR = os.path.join(ASSESSMENT_DIR, 'skills')
PERSONALITY_ASSESSMENT_DIR = os.path.join(ASSESSMENT_DIR, 'personality')

# Create directories
for directory in [ASSESSMENT_DIR, INTEREST_ASSESSMENT_DIR, SKILL_ASSESSMENT_DIR, PERSONALITY_ASSESSMENT_DIR]:
    os.makedirs(directory, exist_ok=True)

# Try importing scikit-learn for prediction models
try:
    import numpy as np
    import pandas as pd
    from sklearn.preprocessing import StandardScaler
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: scikit-learn not available. Advanced assessment features will be limited.")


class CareerAssessment:
    """Class for generating and evaluating various career assessments"""
    
    def __init__(self):
        """Initialize assessment resources"""
        self.interest_data = self._load_interest_data()
        self.skill_categories = self._load_skill_categories()
        self.personality_assessment = self._load_personality_assessment()
        self.career_paths = self._load_career_paths()
        self.keyword_recommender = KeywordRecommender()
    
    def _load_interest_data(self) -> Dict[str, Any]:
        """Load interest assessment data"""
        # Try to load from file
        interest_file = os.path.join(INTEREST_ASSESSMENT_DIR, 'interest_areas.json')
        interest_data = {}
        
        try:
            if os.path.exists(interest_file):
                with open(interest_file, 'r', encoding='utf-8') as f:
                    interest_data = json.load(f)
                return interest_data
        except Exception as e:
            print(f"Error loading interest assessment data: {e}")
        
        # Default data if file not available
        return {
            "categories": {
                "technical": {
                    "name": "Technical & Scientific",
                    "description": "Work that involves technology, science, engineering, data analysis, and solving complex technical problems."
                },
                "creative": {
                    "name": "Creative & Artistic",
                    "description": "Work that involves creative expression, design, writing, visual arts, and innovative thinking."
                },
                "business": {
                    "name": "Business & Management",
                    "description": "Work that involves leadership, strategy, financial analysis, and organizational management."
                },
                "social": {
                    "name": "Social & Service",
                    "description": "Work that involves helping others, teaching, counseling, healthcare, and community service."
                },
                "investigative": {
                    "name": "Research & Analysis",
                    "description": "Work that involves investigation, research, data analysis, and intellectual exploration."
                },
                "structured": {
                    "name": "Organizational & Structured",
                    "description": "Work that involves organization, attention to detail, processes, and systematic approaches."
                }
            },
            "questions": [
                {
                    "id": "q1",
                    "text": "I enjoy solving technical problems and working with technology",
                    "category": "technical"
                },
                {
                    "id": "q2",
                    "text": "I like to express myself creatively and think outside the box",
                    "category": "creative"
                },
                {
                    "id": "q3",
                    "text": "I enjoy leading teams and making strategic business decisions",
                    "category": "business"
                },
                {
                    "id": "q4",
                    "text": "I find satisfaction in helping others and making a positive impact",
                    "category": "social"
                },
                {
                    "id": "q5",
                    "text": "I enjoy analyzing information and finding patterns in data",
                    "category": "investigative"
                },
                {
                    "id": "q6",
                    "text": "I prefer working with clear processes and organized systems",
                    "category": "structured"
                },
                {
                    "id": "q7",
                    "text": "I enjoy building or fixing things",
                    "category": "technical"
                },
                {
                    "id": "q8",
                    "text": "I like designing visually appealing content",
                    "category": "creative"
                },
                {
                    "id": "q9",
                    "text": "I enjoy analyzing financial information and making investment decisions",
                    "category": "business"
                },
                {
                    "id": "q10",
                    "text": "I prefer working directly with people rather than things",
                    "category": "social"
                },
                {
                    "id": "q11",
                    "text": "I enjoy conducting research and testing hypotheses",
                    "category": "investigative"
                },
                {
                    "id": "q12",
                    "text": "I like creating detailed plans and following schedules",
                    "category": "structured"
                },
                {
                    "id": "q13",
                    "text": "I enjoy learning how things work and solving complex problems",
                    "category": "technical"
                },
                {
                    "id": "q14",
                    "text": "I find satisfaction in creative writing or artistic expression",
                    "category": "creative"
                },
                {
                    "id": "q15",
                    "text": "I enjoy negotiating deals and strategic planning",
                    "category": "business"
                },
                {
                    "id": "q16",
                    "text": "I like teaching or mentoring others",
                    "category": "social"
                },
                {
                    "id": "q17",
                    "text": "I enjoy collecting and analyzing data to solve problems",
                    "category": "investigative"
                },
                {
                    "id": "q18",
                    "text": "I prefer environments with clear rules and expectations",
                    "category": "structured"
                }
            ],
            "career_mappings": {
                "technical": ["Software Engineer", "Data Scientist", "IT Specialist", "Systems Analyst", "Network Engineer"],
                "creative": ["Graphic Designer", "Content Creator", "UX Designer", "Marketing Creative", "Digital Media Specialist"],
                "business": ["Business Analyst", "Project Manager", "Financial Analyst", "Marketing Manager", "Business Development"],
                "social": ["HR Specialist", "Customer Success Manager", "Training Specialist", "Community Manager", "Support Specialist"],
                "investigative": ["Data Analyst", "Research Scientist", "Market Researcher", "Business Intelligence", "Quality Assurance"],
                "structured": ["Operations Manager", "Process Analyst", "Compliance Specialist", "Administrative Manager", "Logistics Coordinator"]
            }
        }
    
    def _load_skill_categories(self) -> Dict[str, Dict[str, Any]]:
        """Load skill assessment categories and questions"""
        # Try to load from file
        skills_file = os.path.join(SKILL_ASSESSMENT_DIR, 'skill_categories.json')
        skill_categories = {}
        
        try:
            if os.path.exists(skills_file):
                with open(skills_file, 'r', encoding='utf-8') as f:
                    skill_categories = json.load(f)
                return skill_categories
        except Exception as e:
            print(f"Error loading skill categories: {e}")
        
        # Default data if file not available
        return {
            "technical": {
                "name": "Technical Skills",
                "description": "Skills related to technology, programming, and technical systems",
                "questions": [
                    {
                        "id": "tech1",
                        "text": "I can efficiently write code in at least one programming language",
                        "weight": 1.0
                    },
                    {
                        "id": "tech2",
                        "text": "I can set up and manage databases effectively",
                        "weight": 1.0
                    },
                    {
                        "id": "tech3",
                        "text": "I can troubleshoot technical issues systematically",
                        "weight": 1.0
                    },
                    {
                        "id": "tech4",
                        "text": "I can learn new technologies quickly",
                        "weight": 1.0
                    }
                ]
            },
            "data": {
                "name": "Data Analysis",
                "description": "Skills related to analyzing, interpreting, and using data",
                "questions": [
                    {
                        "id": "data1",
                        "text": "I can identify patterns and insights in complex data",
                        "weight": 1.0
                    },
                    {
                        "id": "data2",
                        "text": "I can create effective data visualizations",
                        "weight": 1.0
                    },
                    {
                        "id": "data3",
                        "text": "I can use statistical methods to analyze information",
                        "weight": 1.0
                    },
                    {
                        "id": "data4",
                        "text": "I can interpret data to make informed decisions",
                        "weight": 1.0
                    }
                ]
            },
            "communication": {
                "name": "Communication Skills",
                "description": "Skills related to verbal and written communication",
                "questions": [
                    {
                        "id": "comm1",
                        "text": "I can explain complex concepts in simple terms",
                        "weight": 1.0
                    },
                    {
                        "id": "comm2",
                        "text": "I can write clear and concise professional documents",
                        "weight": 1.0
                    },
                    {
                        "id": "comm3",
                        "text": "I can deliver effective presentations",
                        "weight": 1.0
                    },
                    {
                        "id": "comm4",
                        "text": "I am an active listener who understands others' perspectives",
                        "weight": 1.0
                    }
                ]
            },
            "leadership": {
                "name": "Leadership & Management",
                "description": "Skills related to leading teams and managing projects",
                "questions": [
                    {
                        "id": "lead1",
                        "text": "I can motivate team members to achieve goals",
                        "weight": 1.0
                    },
                    {
                        "id": "lead2",
                        "text": "I can delegate tasks effectively",
                        "weight": 1.0
                    },
                    {
                        "id": "lead3",
                        "text": "I can manage projects from planning to completion",
                        "weight": 1.0
                    },
                    {
                        "id": "lead4",
                        "text": "I can make difficult decisions when necessary",
                        "weight": 1.0
                    }
                ]
            },
            "problem_solving": {
                "name": "Problem Solving",
                "description": "Skills related to analytical thinking and problem resolution",
                "questions": [
                    {
                        "id": "prob1",
                        "text": "I can break down complex problems into manageable parts",
                        "weight": 1.0
                    },
                    {
                        "id": "prob2",
                        "text": "I can generate multiple solutions to a problem",
                        "weight": 1.0
                    },
                    {
                        "id": "prob3",
                        "text": "I can evaluate options objectively to find the best solution",
                        "weight": 1.0
                    },
                    {
                        "id": "prob4",
                        "text": "I can implement solutions effectively",
                        "weight": 1.0
                    }
                ]
            },
            "creativity": {
                "name": "Creativity & Innovation",
                "description": "Skills related to generating new ideas and approaches",
                "questions": [
                    {
                        "id": "creat1",
                        "text": "I can think outside the box to develop innovative ideas",
                        "weight": 1.0
                    },
                    {
                        "id": "creat2",
                        "text": "I can design visually appealing content",
                        "weight": 1.0
                    },
                    {
                        "id": "creat3",
                        "text": "I can find creative solutions to challenges",
                        "weight": 1.0
                    },
                    {
                        "id": "creat4",
                        "text": "I am comfortable experimenting with new approaches",
                        "weight": 1.0
                    }
                ]
            }
        }
    
    def _load_personality_assessment(self) -> Dict[str, Any]:
        """Load personality assessment data"""
        # Try to load from file
        personality_file = os.path.join(PERSONALITY_ASSESSMENT_DIR, 'personality_assessment.json')
        personality_data = {}
        
        try:
            if os.path.exists(personality_file):
                with open(personality_file, 'r', encoding='utf-8') as f:
                    personality_data = json.load(f)
                return personality_data
        except Exception as e:
            print(f"Error loading personality assessment data: {e}")
        
        # Default data if file not available
        return {
            "dimensions": {
                "analytical": {
                    "name": "Analytical Thinking",
                    "description": "Preference for logical analysis and data-driven approaches",
                    "high_description": "You prefer logical, analytical approaches and value data-driven decision making",
                    "low_description": "You tend to rely more on intuition and emotional judgment than detailed analysis"
                },
                "creative": {
                    "name": "Creative Thinking",
                    "description": "Preference for innovation and unconventional approaches",
                    "high_description": "You enjoy thinking outside the box and finding innovative solutions",
                    "low_description": "You prefer established, proven approaches rather than experimental methods"
                },
                "social": {
                    "name": "Social Orientation",
                    "description": "Preference for working with others vs. independently",
                    "high_description": "You thrive in collaborative environments and enjoy working with others",
                    "low_description": "You prefer working independently and may find extensive teamwork draining"
                },
                "structured": {
                    "name": "Structure Preference",
                    "description": "Preference for ordered, planned approaches vs. flexibility",
                    "high_description": "You prefer well-defined processes, planning, and structured environments",
                    "low_description": "You prefer flexibility and adaptability over rigid structure"
                },
                "leadership": {
                    "name": "Leadership Orientation",
                    "description": "Preference for taking charge vs. supporting roles",
                    "high_description": "You naturally gravitate toward leadership positions and enjoy directing projects",
                    "low_description": "You prefer supportive roles rather than being in charge of directing others"
                }
            },
            "questions": [
                {
                    "id": "q1",
                    "text": "I enjoy solving technical problems and working with technology",
                    "category": "technical"
                },
                {
                    "id": "q2",
                    "text": "I like to express myself creatively and think outside the box",
                    "category": "creative"
                },
                {
                    "id": "q3",
                    "text": "I enjoy leading teams and making strategic business decisions",
                    "category": "business"
                },
                {
                    "id": "q4",
                    "text": "I find satisfaction in helping others and making a positive impact",
                    "category": "social"
                },
                {
                    "id": "q5",
                    "text": "I enjoy analyzing information and finding patterns in data",
                    "category": "investigative"
                },
                {
                    "id": "q6",
                    "text": "I prefer working with clear processes and organized systems",
                    "category": "structured"
                },
                {
                    "id": "q7",
                    "text": "I enjoy building or fixing things",
                    "category": "technical"
                },
                {
                    "id": "q8",
                    "text": "I like designing visually appealing content",
                    "category": "creative"
                },
                {
                    "id": "q9",
                    "text": "I enjoy analyzing financial information and making investment decisions",
                    "category": "business"
                },
                {
                    "id": "q10",
                    "text": "I prefer working directly with people rather than things",
                    "category": "social"
                },
                {
                    "id": "q11",
                    "text": "I enjoy conducting research and testing hypotheses",
                    "category": "investigative"
                },
                {
                    "id": "q12",
                    "text": "I like creating detailed plans and following schedules",
                    "category": "structured"
                },
                {
                    "id": "q13",
                    "text": "I enjoy learning how things work and solving complex problems",
                    "category": "technical"
                },
                {
                    "id": "q14",
                    "text": "I find satisfaction in creative writing or artistic expression",
                    "category": "creative"
                },
                {
                    "id": "q15",
                    "text": "I enjoy negotiating deals and strategic planning",
                    "category": "business"
                },
                {
                    "id": "q16",
                    "text": "I like teaching or mentoring others",
                    "category": "social"
                },
                {
                    "id": "q17",
                    "text": "I enjoy collecting and analyzing data to solve problems",
                    "category": "investigative"
                },
                {
                    "id": "q18",
                    "text": "I prefer environments with clear rules and expectations",
                    "category": "structured"
                }
            ],
            "career_mappings": {
                "technical": ["Software Engineer", "Data Scientist", "IT Specialist", "Systems Analyst", "Network Engineer"],
                "creative": ["Graphic Designer", "Content Creator", "UX Designer", "Marketing Creative", "Digital Media Specialist"],
                "business": ["Business Analyst", "Project Manager", "Financial Analyst", "Marketing Manager", "Business Development"],
                "social": ["HR Specialist", "Customer Success Manager", "Training Specialist", "Community Manager", "Support Specialist"],
                "investigative": ["Data Analyst", "Research Scientist", "Market Researcher", "Business Intelligence", "Quality Assurance"],
                "structured": ["Operations Manager", "Process Analyst", "Compliance Specialist", "Administrative Manager", "Logistics Coordinator"]
            }
        }
    
    def _load_career_paths(self) -> Dict[str, List[str]]:
        """Load career paths data"""
        # Try to load from file
        career_paths_file = os.path.join(ASSESSMENT_DIR, 'career_paths.json')
        career_paths = {}
        
        try:
            if os.path.exists(career_paths_file):
                with open(career_paths_file, 'r', encoding='utf-8') as f:
                    career_paths = json.load(f)
                return career_paths
        except Exception as e:
            print(f"Error loading career paths data: {e}")
        
        # Default data if file not available
        return {
            "technical": ["Software Engineer", "Data Scientist", "IT Specialist", "Systems Analyst", "Network Engineer"],
            "creative": ["Graphic Designer", "Content Creator", "UX Designer", "Marketing Creative", "Digital Media Specialist"],
            "business": ["Business Analyst", "Project Manager", "Financial Analyst", "Marketing Manager", "Business Development"],
            "social": ["HR Specialist", "Customer Success Manager", "Training Specialist", "Community Manager", "Support Specialist"],
            "investigative": ["Data Analyst", "Research Scientist", "Market Researcher", "Business Intelligence", "Quality Assurance"],
            "structured": ["Operations Manager", "Process Analyst", "Compliance Specialist", "Administrative Manager", "Logistics Coordinator"]
        }
    
    def create_assessment(self, assessment_id: str) -> Dict[str, Any]:
        """
        Create a new career assessment
        
        Args:
            assessment_id: Assessment ID
            
        Returns:
            dict: Assessment data
        """
        # Generate the assessment questions
        questions = []
        
        # Interest questions
        interest_questions = self.interest_data.get("questions", [])
        if interest_questions:
            # Randomly select a subset of questions
            selected_interest_questions = random.sample(interest_questions, min(len(interest_questions), 10))
            for q in selected_interest_questions:
                questions.append({
                    "id": q["id"],
                    "text": q["text"],
                    "type": "interest",
                    "category": q["category"],
                    "response_type": "likert_5"
                })
        
        # Skill questions
        all_skill_questions = []
        for category, data in self.skill_categories.items():
            category_questions = data.get("questions", [])
            if category_questions:
                for q in category_questions:
                    q["category"] = category
                    all_skill_questions.append(q)
        
        if all_skill_questions:
            # Randomly select a subset of skill questions
            selected_skill_questions = random.sample(all_skill_questions, min(len(all_skill_questions), 15))
            for q in selected_skill_questions:
                questions.append({
                    "id": q["id"],
                    "text": q["text"],
                    "type": "skill",
                    "category": q["category"],
                    "response_type": "likert_5"
                })
        
        # Personality questions
        personality_questions = self.personality_assessment.get("questions", [])
        if personality_questions:
            # Randomly select a subset of personality questions
            selected_personality_questions = random.sample(personality_questions, min(len(personality_questions), 10))
            for q in selected_personality_questions:
                questions.append({
                    "id": q["id"],
                    "text": q["text"],
                    "type": "personality",
                    "dimension": q["dimension"],
                    "direction": q.get("direction", "positive"),
                    "response_type": "likert_5"
                })
        
        # Randomize the order of all questions
        random.shuffle(questions)
        
        # Create the assessment structure
        assessment = {
            "id": assessment_id,
            "title": "Career Assessment",
            "description": "This assessment will help identify your career interests, skills, and work style preferences.",
            "created_at": datetime.now().isoformat(),
            "questions": questions,
            "response_scales": {
                "likert_5": {
                    "type": "scale",
                    "options": [
                        {"value": 1, "label": "Strongly Disagree"},
                        {"value": 2, "label": "Disagree"},
                        {"value": 3, "label": "Neutral"},
                        {"value": 4, "label": "Agree"},
                        {"value": 5, "label": "Strongly Agree"}
                    ]
                }
            }
        }
        
        return assessment
    
    def evaluate_assessment(self, assessment_id: str, responses: Dict[str, int]) -> Dict[str, Any]:
        """
        Evaluate assessment responses
        
        Args:
            assessment_id: Assessment ID
            responses: Dictionary of question IDs and response values
            
        Returns:
            dict: Assessment results
        """
        # Initialize results structure
        results = {
            "assessment_id": assessment_id,
            "evaluated_at": datetime.now().isoformat(),
            "interest_areas": {},
            "skill_areas": {},
            "personality_dimensions": {},
            "career_matches": [],
            "skill_recommendations": [],
            "overall_career_orientation": "",
            "career_path_suggestions": []
        }
        
        # Try to load the assessment to get the questions
        assessment_file = os.path.join(ASSESSMENT_DIR, f"assessment_{assessment_id}.json")
        assessment = None
        
        try:
            if os.path.exists(assessment_file):
                with open(assessment_file, 'r', encoding='utf-8') as f:
                    assessment = json.load(f)
        except Exception as e:
            print(f"Error loading assessment: {e}")
            return {"error": f"Assessment not found: {e}"}
        
        if not assessment:
            return {"error": "Assessment not found"}
        
        # Process responses by question type
        interest_scores = {}
        skill_scores = {}
        personality_scores = {}
        
        # Initialize counters for each category/dimension
        for category in self.interest_data.get("categories", {}).keys():
            interest_scores[category] = {"total": 0, "count": 0}
        
        for category in self.skill_categories.keys():
            skill_scores[category] = {"total": 0, "count": 0}
        
        for dimension in self.personality_assessment.get("dimensions", {}).keys():
            personality_scores[dimension] = {"total": 0, "count": 0}
        
        # Process each question response
        for question in assessment.get("questions", []):
            question_id = question.get("id")
            if question_id not in responses:
                continue  # Skip questions without responses
            
            response_value = responses[question_id]
            
            if question.get("type") == "interest":
                category = question.get("category")
                if category in interest_scores:
                    interest_scores[category]["total"] += response_value
                    interest_scores[category]["count"] += 1
            
            elif question.get("type") == "skill":
                category = question.get("category")
                if category in skill_scores:
                    skill_scores[category]["total"] += response_value
                    skill_scores[category]["count"] += 1
            
            elif question.get("type") == "personality":
                dimension = question.get("dimension")
                if dimension in personality_scores:
                    # Adjust for negative direction questions
                    if question.get("direction") == "negative":
                        response_value = 6 - response_value  # Invert scale (1→5, 2→4, etc.)
                    
                    personality_scores[dimension]["total"] += response_value
                    personality_scores[dimension]["count"] += 1
        
        # Calculate average scores for each category
        for category, data in interest_scores.items():
            if data["count"] > 0:
                avg_score = data["total"] / data["count"]
                results["interest_areas"][category] = {
                    "score": round(avg_score, 2),
                    "percentage": round((avg_score / 5) * 100, 1),
                    "name": self.interest_data.get("categories", {}).get(category, {}).get("name", category)
                }
        
        for category, data in skill_scores.items():
            if data["count"] > 0:
                avg_score = data["total"] / data["count"]
                results["skill_areas"][category] = {
                    "score": round(avg_score, 2),
                    "percentage": round((avg_score / 5) * 100, 1),
                    "name": self.skill_categories.get(category, {}).get("name", category)
                }
        
        for dimension, data in personality_scores.items():
            if data["count"] > 0:
                avg_score = data["total"] / data["count"]
                results["personality_dimensions"][dimension] = {
                    "score": round(avg_score, 2),
                    "percentage": round((avg_score / 5) * 100, 1),
                    "name": self.personality_assessment.get("dimensions", {}).get(dimension, {}).get("name", dimension),
                    "description": self._get_dimension_description(dimension, avg_score)
                }
        
        # Generate career matches based on interest and skill scores
        results["career_matches"] = self._generate_career_matches(results["interest_areas"], results["skill_areas"])
        
        # Suggest skill improvements
        results["skill_recommendations"] = self._generate_skill_recommendations(results["skill_areas"], results["career_matches"])
        
        # Determine overall career orientation
        results["overall_career_orientation"] = self._determine_career_orientation(results["interest_areas"], results["personality_dimensions"])
        
        # Generate career path suggestions
        results["career_path_suggestions"] = self._generate_career_paths(results)
        
        return results
    
    def _get_dimension_description(self, dimension: str, score: float) -> str:
        """Get appropriate description for personality dimension based on score"""
        dimensions = self.personality_assessment.get("dimensions", {})
        dim_data = dimensions.get(dimension, {})
        
        if score >= 3.5:
            return dim_data.get("high_description", "")
        else:
            return dim_data.get("low_description", "")
    
    def _generate_career_matches(self, interest_areas: Dict[str, Any], skill_areas: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate career matches based on interests and skills"""
        # Get top interest areas
        top_interests = sorted(
            interest_areas.items(), 
            key=lambda x: x[1]["score"], 
            reverse=True
        )[:3]
        
        # Get top skill areas
        top_skills = sorted(
            skill_areas.items(), 
            key=lambda x: x[1]["score"], 
            reverse=True
        )[:3]
        
        # Get career mappings from interest areas
        career_matches = []
        seen_careers = set()
        
        # Add careers from top interests
        for interest_category, interest_data in top_interests:
            interest_score = interest_data["score"]
            careers = self.interest_data.get("career_mappings", {}).get(interest_category, [])
            
            for career in careers:
                if career not in seen_careers:
                    # Calculate match score (50% from interest, will add skill contribution later)
                    match_score = interest_score / 5 * 50  # 50% from interest
                    
                    career_match = {
                        "career": career,
                        "match_score": match_score,
                        "interest_match": interest_score / 5 * 100,
                        "skill_match": 0,  # Will be updated if matching skills found
                        "primary_interest": interest_category,
                        "relevant_skills": []
                    }
                    
                    career_matches.append(career_match)
                    seen_careers.add(career)
        
        # Update career matches with skill information
        for career_match in career_matches:
            career = career_match["career"]
            
            # Find relevant skills for this career
            career_relevant_skills = self._get_relevant_skills_for_career(career)
            
            # Calculate skill match
            skill_match_score = 0
            skill_match_count = 0
            
            for skill_category, skill_relevance in career_relevant_skills.items():
                if skill_category in skill_areas:
                    skill_score = skill_areas[skill_category]["score"]
                    skill_match_score += skill_score * skill_relevance
                    skill_match_count += skill_relevance
                    
                    # Add to relevant skills if score is decent
                    if skill_score >= 3:
                        career_match["relevant_skills"].append(skill_category)
            
            # Calculate final skill match percentage
            if skill_match_count > 0:
                skill_match_percent = (skill_match_score / skill_match_count) / 5 * 100
                career_match["skill_match"] = round(skill_match_percent, 1)
                
                # Update overall match score (50% interest, 50% skills)
                career_match["match_score"] += skill_match_percent / 2
            
            # Round final score
            career_match["match_score"] = round(career_match["match_score"], 1)
        
        # Sort by match score
        career_matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        return career_matches
    
    def _get_relevant_skills_for_career(self, career: str) -> Dict[str, float]:
        """Get relevance of each skill category for a career"""
        # Default skill relevance mapping for common careers
        common_careers = {
            "Software Engineer": {
                "technical": 1.0,
                "problem_solving": 0.8,
                "creativity": 0.5,
                "communication": 0.4,
                "data": 0.6
            },
            "Data Scientist": {
                "data": 1.0,
                "technical": 0.8,
                "problem_solving": 0.9,
                "communication": 0.5,
                "creativity": 0.3
            },
            "Graphic Designer": {
                "creative": 1.0,
                "problem_solving": 0.5,
                "communication": 0.4,
                "data": 0.3
            },
            "Content Creator": {
                "creative": 1.0,
                "problem_solving": 0.5,
                "communication": 0.4,
                "data": 0.3
            },
            "UX Designer": {
                "creative": 1.0,
                "problem_solving": 0.5,
                "communication": 0.4,
                "data": 0.3
            },
            "Marketing Creative": {
                "creative": 1.0,
                "problem_solving": 0.5,
                "communication": 0.4,
                "data": 0.3
            },
            "Digital Media Specialist": {
                "creative": 1.0,
                "problem_solving": 0.5,
                "communication": 0.4,
                "data": 0.3
            },
            "Business Analyst": {
                "problem_solving": 1.0,
                "communication": 0.8,
                "data": 0.7
            },
            "Project Manager": {
                "problem_solving": 0.9,
                "communication": 0.8,
                "leadership": 0.7
            },
            "Financial Analyst": {
                "problem_solving": 0.9,
                "communication": 0.7,
                "data": 0.8
            },
            "Marketing Manager": {
                "problem_solving": 0.8,
                "communication": 0.9,
                "leadership": 0.7
            },
            "Business Development": {
                "problem_solving": 0.8,
                "communication": 0.7,
                "leadership": 0.6
            },
            "HR Specialist": {
                "social": 1.0,
                "communication": 0.8,
                "leadership": 0.7
            },
            "Customer Success Manager": {
                "social": 1.0,
                "communication": 0.8,
                "leadership": 0.7
            },
            "Training Specialist": {
                "social": 0.9,
                "communication": 0.8,
                "leadership": 0.7
            },
            "Community Manager": {
                "social": 0.9,
                "communication": 0.8,
                "leadership": 0.7
            },
            "Support Specialist": {
                "social": 1.0,
                "communication": 0.9,
                "leadership": 0.8
            },
            "Operations Manager": {
                "structured": 1.0,
                "leadership": 0.9
            },
            "Process Analyst": {
                "structured": 0.9,
                "leadership": 0.8
            },
            "Compliance Specialist": {
                "structured": 0.8,
                "leadership": 0.7
            },
            "Administrative Manager": {
                "structured": 0.8,
                "leadership": 0.7
            },
            "Logistics Coordinator": {
                "structured": 0.8,
                "leadership": 0.7
            }
        }
        
        return common_careers.get(career, {})
    
    def _generate_career_paths(self, results: Dict[str, Any]) -> List[str]:
        """Generate career path suggestions based on assessment results"""
        # Implementation of career path generation logic
        # This is a placeholder and should be replaced with actual implementation
        return ["Software Engineer", "Data Scientist"]
    
    def _determine_career_orientation(self, interest_areas: Dict[str, Any], personality_dimensions: Dict[str, Any]) -> str:
        """Determine overall career orientation based on interest and personality dimensions"""
        # Implementation of career orientation determination logic
        # This is a placeholder and should be replaced with actual implementation
        return "Technical"
    
    def _generate_skill_recommendations(self, skill_areas: Dict[str, Any], career_matches: List[Dict[str, Any]]) -> List[str]:
        """Generate skill recommendations based on skill areas and career matches"""
        # Implementation of skill recommendation generation logic
        # This is a placeholder and should be replaced with actual implementation
        return ["Python Programming", "Data Visualization"]


def create_assessment(user_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new career assessment
    
    Args:
        user_id: Optional user ID
        
    Returns:
        dict: Assessment data
    """
    assessment_engine = CareerAssessment()
    assessment_id = str(uuid.uuid4()) if 'uuid' in globals() else datetime.now().strftime("%Y%m%d%H%M%S")
    return assessment_engine.create_assessment(assessment_id)


def evaluate_assessment(assessment_id: str, responses: Dict[str, int]) -> Dict[str, Any]:
    """
    Evaluate career assessment responses
    
    Args:
        assessment_id: Assessment ID
        responses: Dictionary of question IDs and response values
        
    Returns:
        dict: Assessment results
    """
    assessment_engine = CareerAssessment()
    return assessment_engine.evaluate_assessment(assessment_id, responses)


def assess_career_readiness(user_profile: Dict[str, Any], target_career: str) -> Dict[str, Any]:
    """
    Assess user's readiness for a specific career
    
    Args:
        user_profile: User profile data
        target_career: Target career
        
    Returns:
        dict: Career readiness assessment
    """
    assessment_engine = CareerAssessment()
    return assessment_engine.assess_career_readiness(user_profile, target_career)


def get_skill_gap_analysis(user_skills: List[str], target_role: str) -> Dict[str, Any]:
    """
    Analyze skill gaps for a target role
    
    Args:
        user_skills: User's current skills
        target_role: Target job role
        
    Returns:
        dict: Skill gap analysis
    """
    assessment_engine = CareerAssessment()
    return assessment_engine.analyze_skill_gaps(user_skills, target_role)


class CareerAssessor:
    """Career assessment and recommendation class"""
    
    def __init__(self):
        """Initialize assessor with careers data"""
        self.careers = self._load_careers()
        self.skills_weights = self._load_skills_weights()
    
    def _load_careers(self) -> List[Dict[str, Any]]:
        """
        Load careers data
        
        Returns:
            list: Careers with skills and requirements
        """
        try:
            careers_path = os.path.join(os.path.dirname(__file__), '../data/careers.json')
            
            if os.path.exists(careers_path):
                with open(careers_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            # Default careers if file not found
            return [
                {
                    "id": "software-developer",
                    "title": "Software Developer",
                    "description": "Designs, develops, and maintains software applications",
                    "skills": ["Python", "JavaScript", "SQL", "Git", "Problem Solving"],
                    "education": ["Computer Science", "Software Engineering"],
                    "experience_levels": {
                        "entry": {
                            "years": 0,
                            "skills": ["Python", "JavaScript", "Problem Solving"]
                        },
                        "mid": {
                            "years": 2,
                            "skills": ["Python", "JavaScript", "SQL", "Git", "Problem Solving", "API Development"]
                        },
                        "senior": {
                            "years": 5,
                            "skills": ["Python", "JavaScript", "SQL", "Git", "Problem Solving", "API Development", 
                                      "System Design", "Leadership"]
                        }
                    }
                },
                {
                    "id": "data-scientist",
                    "title": "Data Scientist",
                    "description": "Analyzes and interprets complex data to help organizations make decisions",
                    "skills": ["Python", "R", "SQL", "Machine Learning", "Statistics", "Data Visualization"],
                    "education": ["Data Science", "Statistics", "Computer Science", "Mathematics"],
                    "experience_levels": {
                        "entry": {
                            "years": 0,
                            "skills": ["Python", "SQL", "Statistics"]
                        },
                        "mid": {
                            "years": 2,
                            "skills": ["Python", "R", "SQL", "Machine Learning", "Statistics", "Data Visualization"]
                        },
                        "senior": {
                            "years": 5,
                            "skills": ["Python", "R", "SQL", "Machine Learning", "Statistics", "Data Visualization",
                                      "Big Data", "Deep Learning", "Leadership"]
                        }
                    }
                }
            ]
        
        except Exception as e:
            logger.error(f"Error loading careers data: {str(e)}")
            return []
    
    def _load_skills_weights(self) -> Dict[str, float]:
        """
        Load skills weights for assessment
        
        Returns:
            dict: Skills and their importance weights
        """
        try:
            weights_path = os.path.join(os.path.dirname(__file__), '../data/skills_weights.json')
            
            if os.path.exists(weights_path):
                with open(weights_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            # Default weights if file not found
            return {
                # Technical skills
                "Programming": 0.8,
                "Data Analysis": 0.7,
                "Machine Learning": 0.6,
                "Web Development": 0.7,
                "Mobile Development": 0.6,
                "DevOps": 0.6,
                "Cloud Computing": 0.7,
                "Database": 0.6,
                
                # Soft skills
                "Communication": 0.9,
                "Problem Solving": 0.9,
                "Teamwork": 0.8,
                "Leadership": 0.7,
                "Time Management": 0.7,
                "Creativity": 0.6,
                
                # Business skills
                "Project Management": 0.7,
                "Business Analysis": 0.6,
                "Product Management": 0.6,
                "Marketing": 0.5,
                "Sales": 0.5,
                "Customer Service": 0.6
            }
        
        except Exception as e:
            logger.error(f"Error loading skills weights: {str(e)}")
            return {}
    
    def perform_skills_gap_analysis(self, user_id: str, target_career_id: str, resume_id: Optional[str] = None) -> Dict[str, Any]:
        """Perform skills gap analysis for a target career"""
        try:
            # Find target career
            target_career = None
            for career in self.careers:
                if career.get('id') == target_career_id:
                    target_career = career
                    break
            
            if not target_career:
                return {"error": "Target career not found"}
            
            # Get user skills
            user_skills = UserSkill.find_by_user_id(user_id)
            user_skill_names = [skill.name for skill in user_skills]
            
            # Find user resumes
            resumes = Resume.find_by_user_id(user_id)
            
            if not resumes:
                return {"error": "No resumes found for the user"}
            
            # Get latest resume
            latest_resume = max(resumes, key=lambda r: r.created_at)
            
            # Get latest version
            versions = ResumeVersion.find_by_resume_id(latest_resume.id)
            
            if versions:
                latest_version = max(versions, key=lambda v: v.created_at)
                
                # Parse resume data
                try:
                    parsed_data = json.loads(latest_version.parsed_data)
                    
                    # Get resume skills
                    if parsed_data.get('skills'):
                        resume_skills = parsed_data.get('skills', [])
                        user_skill_names.extend(skill for skill in resume_skills if skill not in user_skill_names)
                
                except (json.JSONDecodeError, TypeError):
                    pass
            
            # Determine missing skills
            missing_skills = [skill for skill in target_career.get('skills', []) if skill not in user_skill_names]
            
            if missing_skills:
                # Generate assessment data
                assessment_data = {
                    "user_id": user_id,
                    "resume_id": latest_resume.id if resumes else None,
                    "target_career": target_career,
                    "missing_skills": missing_skills
                }
                
                # Create assessment
                assessment = CareerAssessment(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    resume_id=resume_id,
                    assessment_type='skills-gap',
                    assessment_data=json.dumps(assessment_data),
                    created_at=datetime.now().isoformat()
                )
                
                # Save assessment
                assessment.save()
                
                logger.info(f"Skills gap analysis completed for user {user_id}, resume {resume_id}")
                
                return assessment_data
            
            return {"error": "No skills gaps found"}
        
        except Exception as e:
            error_msg = f"Error performing skills gap analysis: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}
    
    def generate_career_path(self, user_id: str, target_career_id: str) -> Dict[str, Any]:
        """
        Generate career path for a target career
        
        Args:
            user_id: User ID
            target_career_id: Target career ID
            
        Returns:
            dict: Career path data
        """
        try:
            # Find target career
            target_career = None
            for career in self.careers:
                if career.get('id') == target_career_id:
                    target_career = career
                    break
            
            if not target_career:
                return {"error": "Target career not found"}
            
            # Get user skills
            user_skills = UserSkill.find_by_user_id(user_id)
            user_skill_names = [skill.name for skill in user_skills]
            
            # Find user resumes
            resumes = Resume.find_by_user_id(user_id)
            
            if not resumes:
                return {
                    "user_id": user_id,
                    "target_career": target_career,
                    "current_level": "entry",
                    "missing_skills": target_career.get('skills', []),
                    "path": [
                        {
                            "level": "entry",
                            "skills_to_acquire": target_career.get('experience_levels', {}).get('entry', {}).get('skills', []),
                            "estimated_time": "1-2 years"
                        }
                    ]
                }
            
            # Get latest resume
            latest_resume = max(resumes, key=lambda r: r.created_at)
            
            # Get latest version
            versions = ResumeVersion.find_by_resume_id(latest_resume.id)
            
            if versions:
                latest_version = max(versions, key=lambda v: v.created_at)
                
                # Parse resume data
                try:
                    parsed_data = json.loads(latest_version.parsed_data)
                    
                    # Get resume skills
                    if parsed_data.get('skills'):
                        resume_skills = parsed_data.get('skills', [])
                        user_skill_names.extend(skill for skill in resume_skills if skill not in user_skill_names)
                
                except (json.JSONDecodeError, TypeError):
                    pass
            
            # Determine current level
            levels = ['entry', 'mid', 'senior']
            current_level = 'entry'
            
            for level in levels:
                level_skills = target_career.get('experience_levels', {}).get(level, {}).get('skills', [])
                required_years = target_career.get('experience_levels', {}).get(level, {}).get('years', 0)
                
                # Calculate skills match
                matching_skills = [skill for skill in level_skills if skill in user_skill_names]
                skills_ratio = len(matching_skills) / len(level_skills) if level_skills else 0
                
                # If user has most of the skills for this level, consider them at this level
                if skills_ratio >= 0.7:
                    current_level = level
                    continue
                
                # Otherwise stop at previous level
                break
            
            # Generate path based on current level and target career
            path = []
            current_index = levels.index(current_level)
            
            for i in range(current_index, len(levels)):
                level = levels[i]
                level_skills = target_career.get('experience_levels', {}).get(level, {}).get('skills', [])
                required_years = target_career.get('experience_levels', {}).get(level, {}).get('years', 0)
                
                # Skills to acquire
                skills_to_acquire = [skill for skill in level_skills if skill not in user_skill_names]
                
                if skills_to_acquire:
                    # Estimate time based on number of skills to acquire
                    if level == 'entry':
                        estimated_time = "3-6 months"
                    elif level == 'mid':
                        estimated_time = "6-12 months"
                    elif level == 'senior':
                        estimated_time = "1-2 years"
                    
                    path.append({
                        "level": level,
                        "skills_to_acquire": skills_to_acquire,
                        "estimated_time": estimated_time
                    })
                
                # Add skills to user skills for next level calculation
                user_skill_names.extend(skills_to_acquire)
            
            # Generate result
            result = {
                "user_id": user_id,
                "target_career": target_career,
                "current_level": current_level,
                "path": path
            }
            
            # Save assessment
            assessment = CareerAssessment(
                id=str(uuid.uuid4()),
                user_id=user_id,
                resume_id=latest_resume.id if resumes else None,
                assessment_type='career-path',
                assessment_data=json.dumps(result),
                created_at=datetime.now().isoformat()
            )
            
            # Save assessment
            assessment.save()
            
            logger.info(f"Career path generated for user {user_id}, target career {target_career_id}")
            
            return result
        
        except Exception as e:
            error_msg = f"Error generating career path: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}

# Convenience functions

def get_career_options() -> List[Dict[str, Any]]:
    """Get available career options"""
    assessor = CareerAssessor()
    return assessor.get_career_options()


def assess_career_compatibility(user_id: str, resume_id: Optional[str] = None, limit: int = 5) -> Dict[str, Any]:
    """Assess career compatibility based on skills and experience"""
    assessor = CareerAssessor()
    return assessor.assess_career_compatibility(user_id, resume_id, limit)


def perform_skills_gap_analysis(user_id: str, target_career_id: str, resume_id: Optional[str] = None) -> Dict[str, Any]:
    """Perform skills gap analysis for a target career"""
    assessor = CareerAssessor()
    return assessor.perform_skills_gap_analysis(user_id, target_career_id, resume_id)


def generate_career_path(user_id: str, target_career_id: str) -> Dict[str, Any]:
    """Generate career path for a target career"""
    assessor = CareerAssessor()
    return assessor.generate_career_path(user_id, target_career_id)


def get_user_assessments(user_id: str) -> List[Dict[str, Any]]:
    """Get user's career assessments"""
    try:
        assessments = CareerAssessment.find_by_user_id(user_id)
        return [assessment.to_dict() for assessment in assessments]
    
    except Exception as e:
        logger.error(f"Error retrieving user assessments: {str(e)}")
        return []