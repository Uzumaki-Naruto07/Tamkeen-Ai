import re
from typing import Dict, List, Tuple, Any, Optional
import math
from datetime import datetime
import json
import random
import os
import logging

# Initialize logging
logger = logging.getLogger(__name__)

# Path to career data files
CAREER_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "careers")

class CareerGuidanceSystem:
    """
    Provides career path suggestions, role recommendations,
    and development roadmaps based on user skills and goals.
    """
    
    def __init__(self):
        """Initialize the career guidance system"""
        # Load career data
        self._load_career_data()
        
    def generate_career_guidance(self, 
                              user_data: Dict[str, Any],
                              assessment_results: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate comprehensive career guidance based on user data
        
        Args:
            user_data: Dictionary containing user profile, skills, experience, etc.
            assessment_results: Optional assessment results from CareerReadinessAssessment
            
        Returns:
            Dictionary with career path suggestions and development roadmap
        """
        if not user_data:
            return {"error": "No user data provided for guidance"}
            
        # Initialize guidance result structure
        guidance = {
            "timestamp": datetime.now().isoformat(),
            "career_paths": [],
            "role_recommendations": [],
            "short_term_goals": [],
            "long_term_goals": [],
            "learning_roadmap": [],
            "industry_insights": [],
            "career_transition_steps": []
        }
        
        # Extract user profile components
        profile = user_data.get("profile", {})
        resume_data = user_data.get("resume_data", {})
        skills = self._extract_user_skills(user_data)
        experience = self._extract_user_experience(user_data)
        education = self._extract_user_education(user_data)
        interests = profile.get("interests", [])
        career_goals = profile.get("career_goals", [])
        
        # Generate career paths
        career_paths = self._suggest_career_paths(
            skills, 
            experience, 
            education, 
            interests, 
            career_goals
        )
        
        # Generate role recommendations
        role_recommendations = self._recommend_roles(
            skills, 
            experience, 
            education, 
            career_paths
        )
        
        # Create development roadmap
        learning_roadmap = self._create_learning_roadmap(
            skills,
            experience,
            role_recommendations,
            assessment_results
        )
        
        # Set career goals
        short_term_goals = self._set_short_term_goals(
            skills,
            experience,
            role_recommendations
        )
        
        long_term_goals = self._set_long_term_goals(
            career_paths,
            role_recommendations
        )
        
        # Add industry insights
        industry_insights = self._provide_industry_insights(career_paths)
        
        # Career transition guidance
        current_role = self._determine_current_role(experience)
        
        transition_steps = self._suggest_transition_steps(
            current_role,
            role_recommendations
        )
        
        # Update guidance result
        guidance.update({
            "career_paths": career_paths,
            "role_recommendations": role_recommendations,
            "short_term_goals": short_term_goals,
            "long_term_goals": long_term_goals,
            "learning_roadmap": learning_roadmap,
            "industry_insights": industry_insights,
            "career_transition_steps": transition_steps
        })
        
        return guidance
        
    def get_targeted_guidance(self, 
                           user_data: Dict[str, Any], 
                           target_job: str) -> Dict[str, Any]:
        """
        Generate targeted guidance for a specific role or job
        
        Args:
            user_data: Dictionary containing user profile data
            target_job: Specific job title or role the user is targeting
            
        Returns:
            Dictionary with targeted guidance for the specified role
        """
        if not user_data or not target_job:
            return {"error": "Missing user data or target job"}
            
        # Initialize targeted guidance
        targeted = {
            "target_job": target_job,
            "role_details": {},
            "skill_gaps": [],
            "preparation_steps": [],
            "resources": [],
            "alternative_titles": [],
            "advancement_paths": []
        }
        
        # Extract user skills
        skills = self._extract_user_skills(user_data)
        
        # Find matching role in our database
        role_details = None
        alternative_titles = []
        
        # Normalize the target job title
        normalized_target = target_job.lower().strip()
        
        for role in self.role_data:
            role_title = role.get("title", "").lower()
            
            # Check for exact match
            if role_title == normalized_target:
                role_details = role
                break
                
            # Check for partial match and collect alternatives
            elif normalized_target in role_title or role_title in normalized_target:
                alternative_titles.append(role.get("title"))
                
                # If no exact match found yet, use first close match
                if not role_details:
                    role_details = role
        
        # If no matching role found in our database
        if not role_details:
            # Try to find a close match by industry
            industry = self._guess_industry_from_job_title(target_job)
            
            for role in self.role_data:
                if role.get("industry") == industry:
                    role_details = role
                    break
                    
            # If still not found, create a generic role template
            if not role_details:
                role_details = {
                    "title": target_job,
                    "required_skills": [],
                    "preferred_skills": [],
                    "education": [],
                    "typical_experience": "0-1 years",
                    "industry": industry or "Unknown"
                }
        
        # Determine skill gaps
        required_skills = role_details.get("required_skills", [])
        preferred_skills = role_details.get("preferred_skills", [])
        
        skill_gaps = []
        
        for skill in required_skills:
            if not self._has_skill(skills, skill):
                skill_gaps.append({
                    "skill": skill,
                    "level": "required",
                    "priority": "high"
                })
                
        for skill in preferred_skills:
            if not self._has_skill(skills, skill):
                skill_gaps.append({
                    "skill": skill,
                    "level": "preferred",
                    "priority": "medium"
                })
        
        # Generate preparation steps
        preparation_steps = self._generate_preparation_steps(role_details, skill_gaps, user_data)
        
        # Suggest learning resources
        resources = self._suggest_learning_resources(skill_gaps, role_details)
        
        # Find advancement paths
        advancement_paths = self._find_advancement_paths(role_details)
        
        # Update targeted guidance
        targeted.update({
            "role_details": role_details,
            "skill_gaps": skill_gaps,
            "preparation_steps": preparation_steps,
            "resources": resources,
            "alternative_titles": alternative_titles,
            "advancement_paths": advancement_paths
        })
        
        return targeted
        
    def find_emerging_careers(self, 
                           user_skills: List[str], 
                           interests: List[str] = None) -> List[Dict[str, Any]]:
        """
        Identify emerging career opportunities based on user skills and interests
        
        Args:
            user_skills: List of user's skills
            interests: Optional list of user's interests
            
        Returns:
            List of emerging career opportunities with relevance scores
        """
        emerging_careers = []
        
        # Filter to careers marked as emerging or high growth
        for career in self.career_paths:
            if career.get("growth_potential", "medium") in ["high", "emerging", "rapid"]:
                relevance_score = self._calculate_career_relevance(career, user_skills, interests)
                
                if relevance_score > 30:  # Only return somewhat relevant careers
                    emerging_careers.append({
                        "title": career.get("title", ""),
                        "description": career.get("description", ""),
                        "growth_potential": career.get("growth_potential", ""),
                        "relevance_score": relevance_score,
                        "key_skills": career.get("key_skills", [])[:5],
                        "education_requirements": career.get("typical_education", []),
                        "typical_roles": career.get("typical_roles", [])[:3]
                    })
        
        return emerging_careers

    def _load_career_data(self):
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the __init__ method
        pass

    def _extract_user_skills(self, user_data: Dict[str, Any]) -> List[str]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _extract_user_experience(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _extract_user_education(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _suggest_career_paths(self, skills: List[str], experience: Dict[str, Any], education: Dict[str, Any], interests: List[str], career_goals: List[str]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _recommend_roles(self, skills: List[str], experience: Dict[str, Any], education: Dict[str, Any], career_paths: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _create_learning_roadmap(self, skills: List[str], experience: Dict[str, Any], role_recommendations: List[Dict[str, Any]], assessment_results: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _set_short_term_goals(self, skills: List[str], experience: Dict[str, Any], role_recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _set_long_term_goals(self, career_paths: List[Dict[str, Any]], role_recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _provide_industry_insights(self, career_paths: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _determine_current_role(self, experience: Dict[str, Any]) -> Dict[str, Any]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _suggest_transition_steps(self, current_role: Dict[str, Any], role_recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the generate_career_guidance method
        pass

    def _generate_preparation_steps(self, role_details: Dict[str, Any], skill_gaps: List[Dict[str, Any]], user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the get_targeted_guidance method
        pass

    def _suggest_learning_resources(self, skill_gaps: List[Dict[str, Any]], role_details: Dict[str, Any]) -> Dict[str, Any]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the get_targeted_guidance method
        pass

    def _find_advancement_paths(self, role_details: Dict[str, Any]) -> List[Dict[str, Any]]:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the get_targeted_guidance method
        pass

    def _calculate_career_relevance(self, career: Dict[str, Any], user_skills: List[str], interests: List[str] = None) -> float:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the find_emerging_careers method
        pass

    def _guess_industry_from_job_title(self, job_title: str) -> str:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the get_targeted_guidance method
        pass

    def _has_skill(self, skills: List[str], skill: str) -> bool:
        # This method is not provided in the original file or the new file
        # It's assumed to exist as it's called in the get_targeted_guidance method
        pass

def suggest_career_paths(skills: List[str], goals: str, experience_level: str = "entry", 
                        interests: Optional[List[str]] = None, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Suggest potential career paths based on skills, goals, and interests.
    
    Args:
        skills (List[str]): List of user's skills
        goals (str): Career goals or aspirations text
        experience_level (str): User's experience level ('entry', 'mid', 'senior')
        interests (Optional[List[str]]): User's interests or preferences
        limit (int): Maximum number of suggestions to return
        
    Returns:
        List[Dict[str, Any]]: List of career path suggestions with details
    """
    # Normalize inputs
    skills = [s.lower().strip() for s in skills]
    goals_text = goals.lower().strip()
    experience_level = experience_level.lower().strip()
    if interests:
        interests = [i.lower().strip() for i in interests]
    else:
        interests = []
    
    # Load career path data
    career_paths = _load_career_data()
    if not career_paths:
        logger.error("No career data available")
        return []
    
    # Match user profile to career paths
    matched_careers = []
    
    for career in career_paths:
        # Calculate skill match
        career_skills = [s.lower() for s in career.get("required_skills", [])]
        matching_skills = [s for s in skills if s in career_skills]
        skill_match_score = len(matching_skills) / len(career_skills) if career_skills else 0
        
        # Check experience level
        level_match = _check_level_match(career.get("levels", []), experience_level)
        
        # Check goal match using keywords
        goal_match_score = _calculate_goal_match(goals_text, career)
        
        # Check interest match
        interest_match_score = 0
        if interests:
            interest_categories = career.get("interest_categories", [])
            matching_interests = [i for i in interests if i in interest_categories]
            interest_match_score = len(matching_interests) / len(interests) if interests else 0
        
        # Calculate overall match
        overall_match = (
            skill_match_score * 0.5 + 
            level_match * 0.2 + 
            goal_match_score * 0.2 + 
            interest_match_score * 0.1
        )
        
        # Add to matches if above threshold
        if overall_match > 0.25 or skill_match_score > 0.4:
            matched_careers.append({
                "career_title": career.get("title", "Unknown Career"),
                "description": career.get("description", ""),
                "match_score": round(overall_match * 100),
                "salary_range": career.get("salary_range", ""),
                "growth_outlook": career.get("growth_outlook", ""),
                "matching_skills": matching_skills,
                "missing_skills": [s for s in career_skills if s not in skills],
                "education_requirements": career.get("education", ""),
                "entry_level_title": career.get("entry_level_title", ""),
                "certification_path": career.get("certifications", [])[:3],
                "next_step_roles": career.get("advancement_path", [])[:3]
            })
    
    # Sort by match score
    matched_careers.sort(key=lambda x: x["match_score"], reverse=True)
    
    # If no good matches, add some default suggestions based on skills
    if not matched_careers:
        matched_careers = _generate_default_suggestions(skills, experience_level)
    
    return matched_careers[:limit]

def _load_career_data() -> List[Dict[str, Any]]:
    """Load career path data from JSON files"""
    career_paths = []
    
    # Try to load data from main career data file
    main_data_path = os.path.join(CAREER_DATA_DIR, "career_paths.json")
    
    try:
        if os.path.exists(main_data_path):
            with open(main_data_path, 'r', encoding='utf-8') as file:
                career_paths = json.load(file)
            logger.info(f"Loaded {len(career_paths)} career paths from data file")
        else:
            # If file doesn't exist, use built-in data
            career_paths = _get_default_career_data()
            logger.info(f"Using built-in career data ({len(career_paths)} paths)")
    except Exception as e:
        logger.error(f"Error loading career data: {str(e)}")
        career_paths = _get_default_career_data()
    
    return career_paths

def _get_default_career_data() -> List[Dict[str, Any]]:
    """Get default career data when external data is not available"""
    # Simplified data structure with common career paths
    return [
        {
            "title": "Data Scientist",
            "description": "Analyze and interpret complex data to inform business decisions",
            "required_skills": ["python", "statistics", "machine learning", "data analysis", 
                              "sql", "data visualization", "problem solving"],
            "levels": ["entry", "mid", "senior"],
            "salary_range": "$80,000 - $150,000",
            "growth_outlook": "High growth",
            "education": "Bachelor's in Computer Science, Statistics, or related field",
            "entry_level_title": "Junior Data Analyst",
            "certifications": ["Google Data Analytics Professional Certificate", 
                             "IBM Data Science Professional Certificate",
                             "Microsoft Certified: Azure Data Scientist Associate"],
            "advancement_path": ["Senior Data Scientist", "Lead Data Scientist", "Chief Data Officer"],
            "interest_categories": ["data", "analysis", "research", "problem solving", "technology"]
        },
        {
            "title": "Software Engineer",
            "description": "Design, develop and maintain software systems and applications",
            "required_skills": ["programming", "software development", "problem solving", 
                              "algorithms", "debugging", "javascript", "python"],
            "levels": ["entry", "mid", "senior"],
            "salary_range": "$75,000 - $180,000",
            "growth_outlook": "High growth",
            "education": "Bachelor's in Computer Science or related field",
            "entry_level_title": "Junior Software Developer",
            "certifications": ["AWS Certified Developer", 
                             "Microsoft Certified: Azure Developer Associate",
                             "Certified Cloud Developer"],
            "advancement_path": ["Senior Software Engineer", "Software Architect", "CTO"],
            "interest_categories": ["programming", "development", "technology", "problem solving"]
        },
        {
            "title": "UX/UI Designer",
            "description": "Create user-friendly interfaces and optimize user experiences",
            "required_skills": ["user research", "wireframing", "prototyping", 
                              "visual design", "user testing", "figma", "adobe xd"],
            "levels": ["entry", "mid", "senior"],
            "salary_range": "$65,000 - $130,000",
            "growth_outlook": "High growth",
            "education": "Bachelor's in Design, HCI, or related field",
            "entry_level_title": "Junior UX Designer",
            "certifications": ["Google UX Design Professional Certificate", 
                             "Nielsen Norman Group UX Certification",
                             "Interaction Design Foundation Certification"],
            "advancement_path": ["Senior UX Designer", "UX Lead", "Head of Design"],
            "interest_categories": ["design", "creativity", "user experience", "research", "visual arts"]
        },
        {
            "title": "Digital Marketing Specialist",
            "description": "Develop and implement marketing strategies across digital channels",
            "required_skills": ["social media marketing", "content creation", "seo", 
                              "email marketing", "analytics", "copywriting", "campaign management"],
            "levels": ["entry", "mid", "senior"],
            "salary_range": "$50,000 - $120,000",
            "growth_outlook": "High growth",
            "education": "Bachelor's in Marketing, Communications, or related field",
            "entry_level_title": "Marketing Assistant",
            "certifications": ["Google Digital Marketing Certification", 
                             "Facebook Blueprint Certification",
                             "HubSpot Inbound Marketing Certification"],
            "advancement_path": ["Digital Marketing Manager", "Marketing Director", "CMO"],
            "interest_categories": ["marketing", "social media", "communications", "creativity", "business"]
        },
        {
            "title": "Project Manager",
            "description": "Plan, execute, and close projects, ensuring they're delivered on time and within budget",
            "required_skills": ["project planning", "team management", "budgeting", 
                             "risk management", "communication", "organization", "leadership"],
            "levels": ["entry", "mid", "senior"],
            "salary_range": "$65,000 - $140,000",
            "growth_outlook": "Stable growth",
            "education": "Bachelor's in Business, Management, or related field",
            "entry_level_title": "Project Coordinator",
            "certifications": ["Project Management Professional (PMP)", 
                             "Certified Associate in Project Management (CAPM)",
                             "Agile Certified Practitioner (PMI-ACP)"],
            "advancement_path": ["Senior Project Manager", "Program Manager", "Director of Operations"],
            "interest_categories": ["management", "leadership", "organization", "planning", "coordination"]
        }
    ]

def _check_level_match(career_levels: List[str], user_level: str) -> float:
    """Calculate match score for experience level"""
    if not career_levels:
        return 0.5  # Default neutral score
    
    if user_level in career_levels:
        return 1.0
    
    # If career supports senior and user is mid, that's a partial match
    if user_level == "mid" and "senior" in career_levels:
        return 0.7
    
    # If career supports mid and user is entry, that's a possible match
    if user_level == "entry" and "mid" in career_levels:
        return 0.5
    
    return 0.0  # No level match

def _calculate_goal_match(goals_text: str, career: Dict[str, Any]) -> float:
    """Calculate match score between user goals and career path"""
    if not goals_text:
        return 0.5  # Default neutral score
    
    # Keywords to look for in goals text
    match_keywords = []
    
    # Add career title words
    career_title = career.get("title", "").lower()
    match_keywords.extend(career_title.split())
    
    # Add career description keywords
    description = career.get("description", "").lower()
    match_keywords.extend([w for w in description.split() if len(w) > 4])
    
    # Add interest categories
    match_keywords.extend(career.get("interest_categories", []))
    
    # Check how many keywords match
    matching_count = sum(1 for kw in match_keywords if kw in goals_text)
    
    # Calculate match score
    return min(1.0, matching_count / 5)  # Cap at 1.0

def _generate_default_suggestions(skills: List[str], experience_level: str) -> List[Dict[str, Any]]:
    """Generate default career suggestions based on skills"""
    # Map common skills to career paths
    skill_to_career_map = {
        "python": "Data Scientist",
        "programming": "Software Engineer",
        "data analysis": "Data Analyst",
        "javascript": "Web Developer",
        "design": "UX/UI Designer",
        "communication": "Project Manager",
        "marketing": "Digital Marketing Specialist",
        "writing": "Content Strategist",
        "research": "Market Research Analyst",
        "customer service": "Customer Success Manager"
    }
    
    suggestions = []
    
    # Find careers that match user skills
    for skill in skills:
        for mapped_skill, career_title in skill_to_career_map.items():
            if mapped_skill in skill or skill in mapped_skill:
                # Don't add duplicates
                if not any(s["career_title"] == career_title for s in suggestions):
                    suggestions.append({
                        "career_title": career_title,
                        "description": f"Career path based on your {mapped_skill} skills",
                        "match_score": random.randint(60, 85),  # Random score for demonstration
                        "matching_skills": [skill],
                        "missing_skills": [],
                        "salary_range": "Varies by location and experience",
                        "growth_outlook": "Positive",
                        "education_requirements": "Bachelor's degree recommended",
                        "certification_path": [],
                        "next_step_roles": []
                    })
    
    # If still no suggestions, provide general ones based on experience level
    if not suggestions:
        general_careers = [
            "Project Coordinator", 
            "Marketing Assistant", 
            "Junior Developer",
            "Data Analyst",
            "Customer Success Representative"
        ] if experience_level == "entry" else [
            "Project Manager",
            "Marketing Specialist",
            "Software Engineer",
            "Data Scientist",
            "Product Manager"
        ]
        
        for career in general_careers:
            suggestions.append({
                "career_title": career,
                "description": "General career suggestion based on your profile",
                "match_score": random.randint(50, 70),
                "matching_skills": [],
                "missing_skills": [],
                "salary_range": "Varies by location and experience",
                "growth_outlook": "Varies",
                "education_requirements": "Bachelor's degree typically required",
                "certification_path": [],
                "next_step_roles": []
            })
    
    return suggestions
