"""
User Profiler Module

This module handles user information collection, profile completion, 
recommendation gathering, and user data processing.
"""

import logging
import json
import requests
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import random

# Import utilities
from backend.utils.date_utils import now

# Import settings
from backend.config.settings import DEEPSEEK_API_KEY

# Import other core modules
from backend.core.profile_extractor import ProfileExtractor

# Setup logger
logger = logging.getLogger(__name__)


class UserProfiler:
    """Class for managing user profile information and collection"""
    
    def __init__(self):
        """Initialize user profiler"""
        self.api_key = DEEPSEEK_API_KEY
        self.profile_extractor = ProfileExtractor()
        
        # Load profile templates
        self.profile_templates = self._load_profile_templates()
        
        # Load question templates
        self.question_templates = self._load_question_templates()
    
    def _load_profile_templates(self) -> Dict[str, Dict[str, Any]]:
        """
        Load profile templates for different career paths
        
        Returns:
            Dict of profile templates
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "software_engineering": {
                "required_sections": ["education", "skills", "experience", "projects"],
                "optional_sections": ["certifications", "languages", "interests"],
                "skill_categories": ["programming_languages", "frameworks", "tools", "soft_skills"],
                "recommended_skills": [
                    "problem solving", "algorithms", "data structures", "version control",
                    "testing", "debugging", "object-oriented programming"
                ]
            },
            "data_science": {
                "required_sections": ["education", "skills", "experience", "projects"],
                "optional_sections": ["certifications", "publications", "interests"],
                "skill_categories": ["programming_languages", "ml_frameworks", "data_tools", "statistics", "soft_skills"],
                "recommended_skills": [
                    "machine learning", "data analysis", "statistics", "data visualization", 
                    "sql", "python", "experiment design"
                ]
            },
            "product_management": {
                "required_sections": ["education", "skills", "experience", "achievements"],
                "optional_sections": ["certifications", "interests", "leadership"],
                "skill_categories": ["product_skills", "technical_knowledge", "business_skills", "soft_skills"],
                "recommended_skills": [
                    "product strategy", "user research", "market analysis", "roadmapping",
                    "stakeholder management", "communication", "agile methodologies"
                ]
            },
            "design": {
                "required_sections": ["education", "skills", "experience", "portfolio"],
                "optional_sections": ["certifications", "interests", "achievements"],
                "skill_categories": ["design_tools", "design_methodologies", "technical_skills", "soft_skills"],
                "recommended_skills": [
                    "user experience", "visual design", "wireframing", "prototyping",
                    "user research", "design systems", "accessibility"
                ]
            },
            "marketing": {
                "required_sections": ["education", "skills", "experience", "campaigns"],
                "optional_sections": ["certifications", "interests", "achievements"],
                "skill_categories": ["marketing_channels", "analytics_tools", "content_skills", "soft_skills"],
                "recommended_skills": [
                    "digital marketing", "content strategy", "analytics", "SEO",
                    "social media", "campaign management", "brand development"
                ]
            }
        }
    
    def _load_question_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Load question templates for profile completion
        
        Returns:
            Dict of question templates by category
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "basic_info": [
                {
                    "id": "full_name",
                    "question": "What is your full name?",
                    "type": "text",
                    "required": True
                },
                {
                    "id": "email",
                    "question": "What is your email address?",
                    "type": "email",
                    "required": True
                },
                {
                    "id": "phone",
                    "question": "What is your phone number?",
                    "type": "phone",
                    "required": False
                },
                {
                    "id": "location",
                    "question": "Where are you located (city, country)?",
                    "type": "text",
                    "required": True
                },
                {
                    "id": "linkedin",
                    "question": "What is your LinkedIn profile URL?",
                    "type": "url",
                    "required": False
                }
            ],
            "career_goals": [
                {
                    "id": "current_role",
                    "question": "What is your current job title?",
                    "type": "text",
                    "required": True
                },
                {
                    "id": "years_experience",
                    "question": "How many years of professional experience do you have?",
                    "type": "number",
                    "required": True
                },
                {
                    "id": "target_role",
                    "question": "What role are you targeting in your job search?",
                    "type": "text",
                    "required": True
                },
                {
                    "id": "career_interests",
                    "question": "What industries or domains are you interested in?",
                    "type": "multi_select",
                    "options": ["Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Media", "Government"],
                    "required": True
                },
                {
                    "id": "relocation",
                    "question": "Are you willing to relocate for work?",
                    "type": "boolean",
                    "required": False
                },
                {
                    "id": "remote_preference",
                    "question": "What is your work location preference?",
                    "type": "select",
                    "options": ["Remote only", "Hybrid", "In-office", "No preference"],
                    "required": True
                }
            ],
            "skills": [
                {
                    "id": "technical_skills",
                    "question": "What technical skills do you have? (programming languages, tools, frameworks, etc.)",
                    "type": "multi_text",
                    "required": True
                },
                {
                    "id": "soft_skills",
                    "question": "What soft skills are you strongest in?",
                    "type": "multi_select",
                    "options": ["Communication", "Leadership", "Problem Solving", "Teamwork", "Time Management", "Adaptability", "Creativity", "Critical Thinking"],
                    "required": True
                },
                {
                    "id": "languages",
                    "question": "What languages do you speak and at what proficiency?",
                    "type": "complex",
                    "required": False
                },
                {
                    "id": "certifications",
                    "question": "Do you have any relevant certifications?",
                    "type": "multi_text",
                    "required": False
                }
            ],
            "education": [
                {
                    "id": "highest_education",
                    "question": "What is your highest level of education?",
                    "type": "select",
                    "options": ["High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Other"],
                    "required": True
                },
                {
                    "id": "education_details",
                    "question": "Please list your educational background (degrees, institutions, years)",
                    "type": "complex",
                    "required": True
                },
                {
                    "id": "continuing_education",
                    "question": "Are you currently pursuing any additional education or training?",
                    "type": "text",
                    "required": False
                }
            ],
            "experience": [
                {
                    "id": "work_history",
                    "question": "Please list your work history (roles, companies, dates, responsibilities)",
                    "type": "complex",
                    "required": True
                },
                {
                    "id": "achievements",
                    "question": "What are your most significant professional achievements?",
                    "type": "multi_text",
                    "required": True
                },
                {
                    "id": "management_experience",
                    "question": "Do you have management experience? If so, how many people have you managed?",
                    "type": "text",
                    "required": False
                }
            ],
            "preferences": [
                {
                    "id": "salary_expectations",
                    "question": "What are your salary expectations?",
                    "type": "range",
                    "required": False
                },
                {
                    "id": "company_size",
                    "question": "What company size do you prefer?",
                    "type": "select",
                    "options": ["Startup (1-50)", "Small (51-200)", "Mid-size (201-1000)", "Large (1000+)", "No preference"],
                    "required": False
                },
                {
                    "id": "work_culture",
                    "question": "What type of work culture do you thrive in?",
                    "type": "multi_select",
                    "options": ["Fast-paced", "Collaborative", "Autonomous", "Innovative", "Structured", "Results-oriented"],
                    "required": False
                }
            ]
        }
    
    def get_profile_completion_rate(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate profile completion rate and identify missing sections
        
        Args:
            user_profile: User profile data
            
        Returns:
            Profile completion statistics
        """
        try:
            # Get career field from profile or default to software engineering
            career_field = user_profile.get("career_field", "software_engineering")
            if career_field not in self.profile_templates:
                career_field = "software_engineering"
            
            template = self.profile_templates[career_field]
            
            # Check required sections
            required_sections = template["required_sections"]
            optional_sections = template["optional_sections"]
            all_sections = required_sections + optional_sections
            
            # Count completed sections
            completed_required = 0
            completed_optional = 0
            
            for section in required_sections:
                if section in user_profile and user_profile[section]:
                    # Check if section has content
                    if isinstance(user_profile[section], list):
                        if len(user_profile[section]) > 0:
                            completed_required += 1
                    elif isinstance(user_profile[section], dict):
                        if len(user_profile[section]) > 0:
                            completed_required += 1
                    elif user_profile[section]:
                        completed_required += 1
            
            for section in optional_sections:
                if section in user_profile and user_profile[section]:
                    # Check if section has content
                    if isinstance(user_profile[section], list):
                        if len(user_profile[section]) > 0:
                            completed_optional += 1
                    elif isinstance(user_profile[section], dict):
                        if len(user_profile[section]) > 0:
                            completed_optional += 1
                    elif user_profile[section]:
                        completed_optional += 1
            
            # Calculate completion percentage
            required_percentage = 0 if not required_sections else (completed_required / len(required_sections)) * 100
            optional_percentage = 0 if not optional_sections else (completed_optional / len(optional_sections)) * 100
            
            # Weight: required sections count more toward completion
            overall_percentage = (required_percentage * 0.7) + (optional_percentage * 0.3)
            
            # Identify missing sections
            missing_required = [section for section in required_sections 
                              if section not in user_profile or not user_profile[section]]
            
            missing_optional = [section for section in optional_sections 
                              if section not in user_profile or not user_profile[section]]
            
            # Recommend next sections to complete
            recommended_next = missing_required[:2]
            if not recommended_next and missing_optional:
                recommended_next = missing_optional[:2]
            
            # Check skills against recommended skills
            recommended_skills = template.get("recommended_skills", [])
            user_skills = user_profile.get("skills", [])
            
            if isinstance(user_skills, list):
                missing_skills = [skill for skill in recommended_skills 
                                if not any(user_skill.lower() == skill.lower() 
                                        for user_skill in user_skills)]
            else:
                missing_skills = recommended_skills
            
            return {
                "completion_percentage": round(overall_percentage, 1),
                "required_sections": {
                    "completed": completed_required,
                    "total": len(required_sections),
                    "percentage": round(required_percentage, 1)
                },
                "optional_sections": {
                    "completed": completed_optional,
                    "total": len(optional_sections),
                    "percentage": round(optional_percentage, 1)
                },
                "missing_required": missing_required,
                "missing_optional": missing_optional,
                "recommended_next": recommended_next,
                "recommended_skills": missing_skills[:5] if missing_skills else []
            }
            
        except Exception as e:
            logger.error(f"Error calculating profile completion: {str(e)}")
            return {
                "completion_percentage": 0,
                "error": str(e)
            }
    
    def get_profile_completion_questions(self, user_profile: Dict[str, Any], 
                                       section: str = None) -> List[Dict[str, Any]]:
        """
        Get questions to help complete user profile
        
        Args:
            user_profile: User profile data
            section: Specific section to get questions for (optional)
            
        Returns:
            List of questions
        """
        try:
            # If section is specified, only return those questions
            if section and section in self.question_templates:
                return self.question_templates[section]
            
            # Otherwise, analyze profile to determine which questions to ask
            completion_stats = self.get_profile_completion_rate(user_profile)
            
            # Get recommended sections to complete
            next_sections = completion_stats.get("recommended_next", [])
            
            if not next_sections:
                # If no specific recommendations, start with basics
                if completion_stats["completion_percentage"] < 30:
                    next_sections = ["basic_info", "career_goals"]
                elif completion_stats["completion_percentage"] < 60:
                    next_sections = ["skills", "education"]
                else:
                    next_sections = ["experience", "preferences"]
            
            # Map section names to question template categories
            section_to_category = {
                "education": "education",
                "skills": "skills",
                "experience": "experience",
                "achievements": "experience",
                "projects": "experience",
                "certifications": "skills",
                "languages": "skills",
                "interests": "preferences",
                "portfolio": "experience"
            }
            
            # Collect questions for the recommended sections
            questions = []
            for section_name in next_sections:
                if section_name in section_to_category:
                    category = section_to_category[section_name]
                    if category in self.question_templates:
                        questions.extend(self.question_templates[category])
            
            # If no questions were collected, add basic questions
            if not questions:
                for category in ["basic_info", "career_goals"]:
                    questions.extend(self.question_templates[category])
            
            # Remove duplicates while preserving order
            seen = set()
            unique_questions = []
            for q in questions:
                if q["id"] not in seen:
                    seen.add(q["id"])
                    unique_questions.append(q)
            
            return unique_questions
            
        except Exception as e:
            logger.error(f"Error getting profile completion questions: {str(e)}")
            return self.question_templates.get("basic_info", [])
    
    def analyze_profile_with_ai(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze user profile with DeepSeek AI
        
        Args:
            user_profile: User profile data
            
        Returns:
            Profile analysis and recommendations
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI analysis")
            return {}
        
        try:
            # Simplify profile to avoid token limits
            simplified_profile = {
                "current_role": user_profile.get("current_role", ""),
                "years_experience": user_profile.get("years_experience", 0),
                "target_role": user_profile.get("target_role", ""),
                "skills": user_profile.get("skills", [])[:15],  # Limit number of skills
                "education": [edu.get("degree", "") for edu in user_profile.get("education", [])[:3]],
                "experience": [
                    {
                        "title": exp.get("title", ""),
                        "company": exp.get("company", ""),
                        "duration": exp.get("duration", "")
                    } 
                    for exp in user_profile.get("experience", [])[:3]  # Limit to recent experience
                ]
            }
            
            # Prepare the API request
            prompt = f"""Analyze this professional profile and provide recommendations:
            
            Profile: {json.dumps(simplified_profile)}
            
            Please provide:
            1. Profile strengths and weaknesses (max 3 each)
            2. Skill development recommendations (max 3)
            3. Career path suggestions (max 2)
            4. Resume improvement tips (max 3)
            
            Format as a JSON object with keys: "strengths", "weaknesses", "skill_recommendations", 
            "career_paths", and "resume_tips". Each containing an array of objects with "title" and 
            "description" fields.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career advisor providing profile analysis and personalized career recommendations."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
                "max_tokens": 1000
            }
            
            # Set up headers with API key
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Make the API request
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            
            # Check if the request was successful
            if response.status_code == 200:
                # Parse the response
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Parse the JSON content
                try:
                    parsed = json.loads(content)
                    return parsed
                except json.JSONDecodeError:
                    logger.error("Failed to parse DeepSeek response as JSON")
                    return {}
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return {}
            
        except Exception as e:
            logger.error(f"Error analyzing profile with AI: {str(e)}")
            return {}
    
    def extract_user_data_from_resume(self, resume_file_path: str, resume_text: str = None) -> Dict[str, Any]:
        """
        Extract user data from resume
        
        Args:
            resume_file_path: Path to resume file
            resume_text: Resume text (if already extracted)
            
        Returns:
            Extracted user data
        """
        try:
            # Use profile extractor to parse resume
            extracted_data = self.profile_extractor.extract_from_resume(
                file_path=resume_file_path,
                text=resume_text
            )
            
            # Return extracted data
            return extracted_data
            
        except Exception as e:
            logger.error(f"Error extracting user data from resume: {str(e)}")
            return {}
    
    def get_profile_recommendations(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get recommendations for improving user profile
        
        Args:
            user_profile: User profile data
            
        Returns:
            Profile recommendations
        """
        try:
            # Get profile completion stats
            completion_stats = self.get_profile_completion_rate(user_profile)
            
            # Get AI analysis if profile is at least 40% complete
            ai_analysis = {}
            if completion_stats["completion_percentage"] >= 40:
                ai_analysis = self.analyze_profile_with_ai(user_profile)
            
            # Build recommendations
            recommendations = {
                "completion": completion_stats,
                "next_steps": []
            }
            
            # Add next steps based on completion
            if completion_stats["completion_percentage"] < 50:
                recommendations["next_steps"].append({
                    "title": "Complete Your Profile",
                    "description": "Your profile needs more information to maximize job matching accuracy.",
                    "action": "complete_profile",
                    "priority": "high"
                })
            
            # Add skills recommendations
            if "recommended_skills" in completion_stats and completion_stats["recommended_skills"]:
                recommendations["next_steps"].append({
                    "title": "Add Recommended Skills",
                    "description": f"Add these relevant skills to your profile: {', '.join(completion_stats['recommended_skills'])}",
                    "action": "add_skills",
                    "priority": "medium"
                })
            
            # Add resume upload recommendation if not present
            if not user_profile.get("has_resume", False):
                recommendations["next_steps"].append({
                    "title": "Upload Your Resume",
                    "description": "Upload your resume to automatically extract your experience and skills.",
                    "action": "upload_resume",
                    "priority": "high"
                })
            
            # Add AI recommendations if available
            if ai_analysis:
                recommendations["ai_analysis"] = ai_analysis
                
                # Add skill recommendations from AI
                if "skill_recommendations" in ai_analysis:
                    recommendations["next_steps"].append({
                        "title": "Develop Recommended Skills",
                        "description": "Based on your profile, consider developing these skills.",
                        "action": "develop_skills",
                        "priority": "medium",
                        "details": ai_analysis["skill_recommendations"]
                    })
                
                # Add resume recommendations from AI
                if "resume_tips" in ai_analysis:
                    recommendations["next_steps"].append({
                        "title": "Improve Your Resume",
                        "description": "Enhance your resume with these professional tips.",
                        "action": "improve_resume",
                        "priority": "medium",
                        "details": ai_analysis["resume_tips"]
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting profile recommendations: {str(e)}")
            return {
                "error": str(e),
                "next_steps": []
            } 