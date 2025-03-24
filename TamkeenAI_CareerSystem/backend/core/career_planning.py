"""
Career Planning Module

This module provides functionality for career path planning, progression strategies,
and transition analysis to help users plan their career trajectories.
"""

import logging
import json
import requests
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import random

# Import settings
from backend.config.settings import DEEPSEEK_API_KEY

# Setup logger
logger = logging.getLogger(__name__)


class CareerPlanner:
    """Class for career planning and progression"""
    
    def __init__(self):
        """Initialize career planner"""
        self.api_key = DEEPSEEK_API_KEY
        
        # Load career paths
        self.career_paths = self._load_career_paths()
        
        # Load skill requirements
        self.skill_requirements = self._load_skill_requirements()
    
    def _load_career_paths(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Load predefined career paths
        
        Returns:
            Dict mapping career domains to list of career paths
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "software_engineering": [
                {
                    "name": "Full-Stack Development Track",
                    "description": "Path for becoming a versatile full-stack software engineer",
                    "stages": [
                        {"title": "Junior Software Engineer", "years": "0-2", "salary_range": "$70,000-$90,000"},
                        {"title": "Software Engineer", "years": "2-4", "salary_range": "$90,000-$120,000"},
                        {"title": "Senior Software Engineer", "years": "4-8", "salary_range": "$120,000-$160,000"},
                        {"title": "Lead Software Engineer", "years": "8-12", "salary_range": "$150,000-$190,000"},
                        {"title": "Software Architect", "years": "12+", "salary_range": "$180,000-$220,000+"}
                    ]
                },
                {
                    "name": "Frontend Specialization Track",
                    "description": "Path focused on frontend development and user experience",
                    "stages": [
                        {"title": "Junior Frontend Developer", "years": "0-2", "salary_range": "$65,000-$85,000"},
                        {"title": "Frontend Developer", "years": "2-4", "salary_range": "$85,000-$110,000"},
                        {"title": "Senior Frontend Developer", "years": "4-7", "salary_range": "$110,000-$145,000"},
                        {"title": "Frontend Architect", "years": "7-10", "salary_range": "$140,000-$180,000"},
                        {"title": "UI/UX Architect", "years": "10+", "salary_range": "$160,000-$200,000+"}
                    ]
                },
                {
                    "name": "Backend Specialization Track",
                    "description": "Path focused on backend systems and infrastructure",
                    "stages": [
                        {"title": "Junior Backend Developer", "years": "0-2", "salary_range": "$70,000-$90,000"},
                        {"title": "Backend Developer", "years": "2-4", "salary_range": "$90,000-$120,000"},
                        {"title": "Senior Backend Developer", "years": "4-7", "salary_range": "$120,000-$155,000"},
                        {"title": "Backend Architect", "years": "7-10", "salary_range": "$150,000-$190,000"},
                        {"title": "Systems Architect", "years": "10+", "salary_range": "$180,000-$220,000+"}
                    ]
                },
                {
                    "name": "Engineering Management Track",
                    "description": "Path transitioning from development to people and project management",
                    "stages": [
                        {"title": "Senior Software Engineer", "years": "4-6", "salary_range": "$120,000-$150,000"},
                        {"title": "Team Lead", "years": "6-8", "salary_range": "$140,000-$170,000"},
                        {"title": "Engineering Manager", "years": "8-12", "salary_range": "$160,000-$200,000"},
                        {"title": "Director of Engineering", "years": "12-15", "salary_range": "$190,000-$240,000"},
                        {"title": "VP of Engineering", "years": "15+", "salary_range": "$220,000-$300,000+"}
                    ]
                }
            ],
            "data_science": [
                {
                    "name": "Data Science Generalist Track",
                    "description": "Path for becoming a versatile data scientist",
                    "stages": [
                        {"title": "Junior Data Analyst", "years": "0-2", "salary_range": "$65,000-$85,000"},
                        {"title": "Data Scientist", "years": "2-4", "salary_range": "$85,000-$120,000"},
                        {"title": "Senior Data Scientist", "years": "4-8", "salary_range": "$120,000-$160,000"},
                        {"title": "Lead Data Scientist", "years": "8-12", "salary_range": "$150,000-$190,000"},
                        {"title": "Principal Data Scientist", "years": "12+", "salary_range": "$180,000-$250,000+"}
                    ]
                },
                {
                    "name": "Machine Learning Engineering Track",
                    "description": "Path focused on building and deploying ML systems",
                    "stages": [
                        {"title": "Junior ML Engineer", "years": "0-2", "salary_range": "$75,000-$95,000"},
                        {"title": "ML Engineer", "years": "2-4", "salary_range": "$95,000-$130,000"},
                        {"title": "Senior ML Engineer", "years": "4-7", "salary_range": "$130,000-$170,000"},
                        {"title": "ML Architect", "years": "7-10", "salary_range": "$160,000-$200,000"},
                        {"title": "Principal ML Engineer", "years": "10+", "salary_range": "$190,000-$260,000+"}
                    ]
                },
                {
                    "name": "Data Science Management Track",
                    "description": "Path transitioning from technical data science to leading teams",
                    "stages": [
                        {"title": "Senior Data Scientist", "years": "4-6", "salary_range": "$120,000-$160,000"},
                        {"title": "Data Science Team Lead", "years": "6-8", "salary_range": "$150,000-$180,000"},
                        {"title": "Data Science Manager", "years": "8-12", "salary_range": "$170,000-$210,000"},
                        {"title": "Director of Data Science", "years": "12-15", "salary_range": "$200,000-$250,000"},
                        {"title": "VP of Data", "years": "15+", "salary_range": "$230,000-$320,000+"}
                    ]
                }
            ],
            "product_management": [
                {
                    "name": "Technical Product Management Track",
                    "description": "Path for technical product managers in software companies",
                    "stages": [
                        {"title": "Associate Product Manager", "years": "0-2", "salary_range": "$70,000-$90,000"},
                        {"title": "Product Manager", "years": "2-5", "salary_range": "$90,000-$130,000"},
                        {"title": "Senior Product Manager", "years": "5-8", "salary_range": "$130,000-$170,000"},
                        {"title": "Lead Product Manager", "years": "8-12", "salary_range": "$160,000-$200,000"},
                        {"title": "Director of Product", "years": "12+", "salary_range": "$190,000-$250,000+"}
                    ]
                },
                {
                    "name": "Product Leadership Track",
                    "description": "Path focused on product vision and strategy",
                    "stages": [
                        {"title": "Senior Product Manager", "years": "5-8", "salary_range": "$130,000-$170,000"},
                        {"title": "Product Lead", "years": "8-10", "salary_range": "$160,000-$200,000"},
                        {"title": "Director of Product", "years": "10-15", "salary_range": "$190,000-$240,000"},
                        {"title": "VP of Product", "years": "15-20", "salary_range": "$230,000-$300,000"},
                        {"title": "Chief Product Officer", "years": "20+", "salary_range": "$280,000-$400,000+"}
                    ]
                }
            ]
        }
    
    def _load_skill_requirements(self) -> Dict[str, Dict[str, List[str]]]:
        """
        Load skill requirements for different job roles
        
        Returns:
            Dict mapping job domains to roles and their required skills
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "software_engineering": {
                "Junior Software Engineer": [
                    "programming basics", "data structures", "algorithms", "git", "html", "css",
                    "javascript", "sql basics", "api basics", "problem solving"
                ],
                "Software Engineer": [
                    "frontend frameworks", "backend frameworks", "databases", "api design",
                    "testing", "ci/cd basics", "system design basics", "cloud basics"
                ],
                "Senior Software Engineer": [
                    "advanced system design", "architectural patterns", "performance optimization",
                    "mentoring", "technical leadership", "project planning", "advanced cloud",
                    "security best practices"
                ],
                "Lead Software Engineer": [
                    "team leadership", "technical strategy", "complex system architecture",
                    "cross-team collaboration", "technical roadmapping", "hiring", "technical specs"
                ],
                "Software Architect": [
                    "enterprise architecture", "scalability design", "technical governance",
                    "technology evaluation", "architectural standards", "cross-functional leadership"
                ]
            },
            "data_science": {
                "Junior Data Analyst": [
                    "statistics basics", "data manipulation", "sql", "excel", "data visualization",
                    "python basics", "basic machine learning concepts"
                ],
                "Data Scientist": [
                    "advanced statistics", "machine learning algorithms", "feature engineering",
                    "data pipelines", "experimental design", "ml frameworks", "data storytelling"
                ],
                "Senior Data Scientist": [
                    "advanced ml models", "deep learning", "nlp", "computer vision", "ml systems design",
                    "business strategy", "project leadership", "mentoring"
                ],
                "Lead Data Scientist": [
                    "research direction", "team leadership", "ml strategy", "technical roadmapping",
                    "cross-team collaboration", "hiring", "advanced ml systems architecture"
                ],
                "Principal Data Scientist": [
                    "research innovation", "cutting-edge ml approaches", "strategic direction",
                    "mentorship programs", "scientific publication", "organizational impact"
                ]
            },
            "product_management": {
                "Associate Product Manager": [
                    "user research basics", "project management", "agile methodologies", "basic analytics",
                    "market research", "product requirements", "presentation skills"
                ],
                "Product Manager": [
                    "user experience design", "data analysis", "product strategy", "stakeholder management",
                    "feature prioritization", "roadmapping", "a/b testing", "competitive analysis"
                ],
                "Senior Product Manager": [
                    "strategic planning", "team leadership", "product metrics definition", "market strategy",
                    "executive communication", "advanced user research", "cross-functional leadership"
                ],
                "Lead Product Manager": [
                    "product vision", "multi-product strategy", "team development", "organizational alignment",
                    "product operations", "go-to-market strategy", "revenue modeling"
                ],
                "Director of Product": [
                    "product organization leadership", "strategic partnerships", "product portfolio management",
                    "executive influence", "team structure design", "hiring strategy", "business strategy"
                ]
            }
        }
    
    def get_career_paths(self, current_role: str, domain: str = None) -> Dict[str, Any]:
        """
        Get relevant career paths based on current role and domain
        
        Args:
            current_role: Current job role
            domain: Career domain (optional)
            
        Returns:
            Career paths
        """
        try:
            # Determine domain if not provided
            if not domain:
                domain = self._infer_domain(current_role)
            
            # Get career paths for domain
            if domain in self.career_paths:
                domain_paths = self.career_paths[domain]
            else:
                # Default to software engineering
                domain_paths = self.career_paths["software_engineering"]
            
            # Map current role to each career path
            mapped_paths = []
            for path in domain_paths:
                # Map current role to a stage in this path
                current_stage, next_stages = self._map_role_to_path(current_role, path)
                
                mapped_path = path.copy()
                mapped_path["current_stage"] = current_stage
                mapped_path["next_stages"] = next_stages
                
                mapped_paths.append(mapped_path)
            
            # Try to get personalized insights from AI
            ai_insights = self._get_career_path_insights_from_ai(current_role, domain, mapped_paths)
            
            result = {
                "domain": domain,
                "current_role": current_role,
                "career_paths": mapped_paths
            }
            
            if ai_insights:
                result["ai_insights"] = ai_insights
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting career paths: {str(e)}")
            return {
                "error": str(e),
                "career_paths": []
            }
    
    def _infer_domain(self, role: str) -> str:
        """
        Infer career domain from role
        
        Args:
            role: Job role
            
        Returns:
            Inferred domain
        """
        role_lower = role.lower()
        
        # Software engineering roles
        if any(term in role_lower for term in [
            "software", "developer", "engineer", "programmer", "frontend", "backend", 
            "fullstack", "full-stack", "web", "mobile", "devops", "sre"
        ]):
            return "software_engineering"
        
        # Data science roles
        elif any(term in role_lower for term in [
            "data", "analyst", "analytics", "scientist", "machine learning", "ml", "ai",
            "artificial intelligence", "statistics", "statistical"
        ]):
            return "data_science"
        
        # Product management roles
        elif any(term in role_lower for term in [
            "product", "pm", "program", "project", "scrum"
        ]):
            return "product_management"
        
        # Default to software engineering
        return "software_engineering"
    
    def _map_role_to_path(self, role: str, path: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Map current role to a stage in the career path
        
        Args:
            role: Current role
            path: Career path
            
        Returns:
            Tuple of (current stage, next stages)
        """
        stages = path.get("stages", [])
        
        # If no stages, return empty results
        if not stages:
            return {}, []
        
        # Try to find exact match
        for i, stage in enumerate(stages):
            if role.lower() == stage["title"].lower():
                # Found exact match
                current_stage = stage
                next_stages = stages[i+1:] if i < len(stages) - 1 else []
                return current_stage, next_stages
        
        # Try to find partial match
        for i, stage in enumerate(stages):
            if role.lower() in stage["title"].lower() or stage["title"].lower() in role.lower():
                # Found partial match
                current_stage = stage
                next_stages = stages[i+1:] if i < len(stages) - 1 else []
                return current_stage, next_stages
        
        # If no match found, try to infer based on keywords
        level_terms = {
            "junior": 0,
            "associate": 0,
            "intern": 0,
            "entry": 0,
            "senior": 2,
            "lead": 3,
            "staff": 3,
            "principal": 4,
            "architect": 4,
            "director": 4,
            "head": 4,
            "vp": 5,
            "chief": 5
        }
        
        role_lower = role.lower()
        inferred_level = 1  # Default to mid-level
        
        for term, level in level_terms.items():
            if term in role_lower:
                inferred_level = level
                break
        
        # Map inferred level to stage
        if inferred_level >= len(stages):
            inferred_level = len(stages) - 1
        
        current_stage = stages[inferred_level]
        next_stages = stages[inferred_level+1:] if inferred_level < len(stages) - 1 else []
        
        return current_stage, next_stages
    
    def _get_career_path_insights_from_ai(self, current_role: str, domain: str, 
                                        career_paths: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Get career path insights from DeepSeek AI
        
        Args:
            current_role: Current role
            domain: Career domain
            career_paths: Career paths
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI insights")
            return []
        
        try:
            # Simplified data to avoid token limits
            simplified_data = {
                "current_role": current_role,
                "domain": domain,
                "paths": []
            }
            
            for path in career_paths:
                simplified_path = {
                    "name": path["name"],
                    "current_stage": path.get("current_stage", {}).get("title", ""),
                    "next_stages": [stage["title"] for stage in path.get("next_stages", [])]
                }
                simplified_data["paths"].append(simplified_path)
            
            # Prepare the API request
            prompt = f"""Based on this career information, provide personalized career development insights:
            
            Data: {json.dumps(simplified_data)}
            
            Provide 3-4 concise, strategic insights about:
            1. Career progression strategies
            2. Skill development focus areas
            3. Timeline considerations
            4. Decision factors between paths
            
            Format as a JSON array with objects containing "title" and "description" fields.
            Keep insights actionable and tailored to someone in this specific role.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career counselor providing personalized career path guidance."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4,
                "response_format": {"type": "json_object"},
                "max_tokens": 800
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
                    return []
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return []
            
        except Exception as e:
            logger.error(f"Error getting career path insights from AI: {str(e)}")
            return []
    
    def get_skill_gap_analysis(self, current_role: str, target_role: str, 
                             current_skills: List[str]) -> Dict[str, Any]:
        """
        Analyze skill gaps between current and target roles
        
        Args:
            current_role: Current job role
            target_role: Target job role
            current_skills: List of current skills
            
        Returns:
            Skill gap analysis
        """
        try:
            # Determine domains
            current_domain = self._infer_domain(current_role)
            target_domain = self._infer_domain(target_role)
            
            # Get skill requirements
            current_required_skills = self._get_role_skills(current_role, current_domain)
            target_required_skills = self._get_role_skills(target_role, target_domain)
            
            # Normalize current skills
            normalized_current_skills = [skill.lower() for skill in current_skills]
            
            # Calculate gaps
            missing_skills = []
            for skill in target_required_skills:
                # Check if user has this skill
                has_skill = False
                for user_skill in normalized_current_skills:
                    if skill.lower() == user_skill or skill.lower() in user_skill or user_skill in skill.lower():
                        has_skill = True
                        break
                
                if not has_skill:
                    missing_skills.append(skill)
            
            # Calculate proficiency levels
            beginner_skills = []
            intermediate_skills = []
            advanced_skills = []
            
            for skill in missing_skills:
                # In a real app, this would use a more sophisticated algorithm
                # Here we use a simple random assignment with weighting
                random_value = random.random()
                if random_value < 0.2:
                    advanced_skills.append(skill)
                elif random_value < 0.5:
                    intermediate_skills.append(skill)
                else:
                    beginner_skills.append(skill)
            
            # Format results
            gap_analysis = {
                "current_role": current_role,
                "target_role": target_role,
                "current_skills": normalized_current_skills,
                "target_required_skills": target_required_skills,
                "missing_skills": {
                    "total": len(missing_skills),
                    "beginner": beginner_skills,
                    "intermediate": intermediate_skills,
                    "advanced": advanced_skills
                },
                "coverage_percentage": int(
                    (len(target_required_skills) - len(missing_skills)) / len(target_required_skills) * 100
                ) if target_required_skills else 0
            }
            
            # Try to get AI insights
            ai_insights = self._get_skill_gap_insights_from_ai(
                current_role, target_role, normalized_current_skills, missing_skills
            )
            
            if ai_insights:
                gap_analysis["ai_insights"] = ai_insights
            
            return gap_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing skill gaps: {str(e)}")
            return {
                "error": str(e),
                "missing_skills": {
                    "beginner": [],
                    "intermediate": [],
                    "advanced": []
                }
            }
    
    def _get_role_skills(self, role: str, domain: str) -> List[str]:
        """
        Get required skills for a role
        
        Args:
            role: Job role
            domain: Career domain
            
        Returns:
            List of required skills
        """
        # Check if we have this domain
        if domain not in self.skill_requirements:
            return []
        
        domain_skills = self.skill_requirements[domain]
        
        # Try to find exact match
        role_lower = role.lower()
        for role_title, skills in domain_skills.items():
            if role_lower == role_title.lower():
                return skills
        
        # Try to find partial match
        for role_title, skills in domain_skills.items():
            if role_lower in role_title.lower() or role_title.lower() in role_lower:
                return skills
        
        # If no match found, return generic skills based on level
        level_terms = {
            "junior": ["junior", "associate", "entry"],
            "mid": ["developer", "engineer", "analyst", "designer"],
            "senior": ["senior", "lead", "staff", "principal", "architect"],
            "manager": ["manager", "director", "head", "vp", "chief"]
        }
        
        role_level = None
        for level, terms in level_terms.items():
            if any(term in role_lower for term in terms):
                role_level = level
                break
        
        if not role_level:
            role_level = "mid"  # Default to mid-level
        
        # Return skills based on level
        for role_title, skills in domain_skills.items():
            role_title_lower = role_title.lower()
            if role_level == "junior" and any(term in role_title_lower for term in level_terms["junior"]):
                return skills
            elif role_level == "mid" and not any(term in role_title_lower for term in level_terms["junior"] + level_terms["senior"] + level_terms["manager"]):
                return skills
            elif role_level == "senior" and any(term in role_title_lower for term in level_terms["senior"]):
                return skills
            elif role_level == "manager" and any(term in role_title_lower for term in level_terms["manager"]):
                return skills
        
        # If still no match, return the first role's skills as default
        return next(iter(domain_skills.values()), [])
    
    def _get_skill_gap_insights_from_ai(self, current_role: str, target_role: str,
                                      current_skills: List[str], missing_skills: List[str]) -> List[Dict[str, str]]:
        """
        Get skill gap insights from DeepSeek AI
        
        Args:
            current_role: Current role
            target_role: Target role
            current_skills: Current skills
            missing_skills: Missing skills
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI insights")
            return []
        
        try:
            # Simplified data to avoid token limits
            simplified_data = {
                "current_role": current_role,
                "target_role": target_role,
                "current_skills": current_skills[:10],  # Limit to 10 skills
                "missing_skills": missing_skills[:10]  # Limit to 10 skills
            }
            
            # Prepare the API request
            prompt = f"""Based on this career transition information, provide personalized skill development guidance:
            
            Data: {json.dumps(simplified_data)}
            
            Provide 3-4 concise, actionable recommendations about:
            1. Skill acquisition strategy and prioritization
            2. Learning resources or approaches
            3. Timeline considerations
            4. Potential challenges and how to overcome them
            
            Format as a JSON array with objects containing "title" and "description" fields.
            Keep insights focused on practical skill development for this specific career transition.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career coach specializing in skill development planning."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4,
                "response_format": {"type": "json_object"},
                "max_tokens": 800
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
                    return []
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return []
            
        except Exception as e:
            logger.error(f"Error getting skill gap insights from AI: {str(e)}")
            return []
    
    def analyze_career_transition(self, current_role: str, target_role: str, 
                                current_skills: List[str], experience_years: int = 0,
                                education: List[str] = None) -> Dict[str, Any]:
        """
        Analyze feasibility and strategy for career transition
        
        Args:
            current_role: Current job role
            target_role: Target job role
            current_skills: List of current skills
            experience_years: Years of experience
            education: List of educational backgrounds
            
        Returns:
            Career transition analysis
        """
        try:
            # Default education if not provided
            if not education:
                education = []
            
            # Get skill gap analysis
            skill_gap = self.get_skill_gap_analysis(
                current_role=current_role,
                target_role=target_role,
                current_skills=current_skills
            )
            
            # Calculate transition difficulty
            difficulty_score = self._calculate_transition_difficulty(
                current_role=current_role,
                target_role=target_role,
                skill_gap=skill_gap,
                experience_years=experience_years,
                education=education
            )
            
            # Calculate transition timeframe
            timeframe = self._calculate_transition_timeframe(
                difficulty_score=difficulty_score,
                skill_gap=skill_gap,
                experience_years=experience_years
            )
            
            # Generate transition steps
            transition_steps = self._generate_transition_steps(
                current_role=current_role,
                target_role=target_role,
                skill_gap=skill_gap,
                difficulty_score=difficulty_score
            )
            
            # Try to get AI insights
            ai_insights = self._get_transition_insights_from_ai(
                current_role=current_role,
                target_role=target_role,
                current_skills=current_skills,
                experience_years=experience_years,
                education=education,
                difficulty_score=difficulty_score,
                timeframe=timeframe
            )
            
            transition_analysis = {
                "current_role": current_role,
                "target_role": target_role,
                "difficulty": {
                    "score": difficulty_score,
                    "level": self._get_difficulty_level(difficulty_score),
                    "factors": self._get_difficulty_factors(
                        current_role=current_role,
                        target_role=target_role,
                        skill_gap=skill_gap,
                        experience_years=experience_years
                    )
                },
                "timeframe": timeframe,
                "skill_gap": skill_gap.get("missing_skills", {}),
                "transition_steps": transition_steps
            }
            
            if ai_insights:
                transition_analysis["ai_insights"] = ai_insights
            
            return transition_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing career transition: {str(e)}")
            return {
                "error": str(e),
                "difficulty": {
                    "score": 0,
                    "level": "Unknown",
                    "factors": []
                },
                "timeframe": {},
                "transition_steps": []
            }
    
    def _calculate_transition_difficulty(self, current_role: str, target_role: str,
                                       skill_gap: Dict[str, Any], experience_years: int,
                                       education: List[str]) -> int:
        """
        Calculate transition difficulty score
        
        Args:
            current_role: Current role
            target_role: Target role
            skill_gap: Skill gap analysis
            experience_years: Years of experience
            education: List of educational backgrounds
            
        Returns:
            Difficulty score (0-100)
        """
        # Base difficulty is 50 (moderate)
        difficulty = 50
        
        # Adjust based on skill gap
        missing_skills_count = skill_gap.get("missing_skills", {}).get("total", 0)
        if missing_skills_count > 10:
            difficulty += 20
        elif missing_skills_count > 5:
            difficulty += 10
        elif missing_skills_count < 3:
            difficulty -= 10
        
        # Adjust based on domain change
        current_domain = self._infer_domain(current_role)
        target_domain = self._infer_domain(target_role)
        if current_domain != target_domain:
            difficulty += 15
        
        # Adjust based on experience
        if experience_years >= 10:
            difficulty -= 10  # Experienced professionals can adapt more easily
        elif experience_years >= 5:
            difficulty -= 5
        elif experience_years < 2:
            difficulty += 10  # Early career transitions are harder
        
        # Adjust based on education
        has_relevant_education = False
        education_terms = {
            "software_engineering": ["computer science", "software engineering", "information technology"],
            "data_science": ["data science", "statistics", "mathematics", "computer science"],
            "product_management": ["business", "product management", "mba", "computer science"]
        }
        
        if target_domain in education_terms:
            relevant_terms = education_terms[target_domain]
            for edu in education:
                if any(term in edu.lower() for term in relevant_terms):
                    has_relevant_education = True
                    break
        
        if has_relevant_education:
            difficulty -= 10
        
        # Ensure difficulty is within range
        return max(10, min(90, difficulty))
    
    def _get_difficulty_level(self, score: int) -> str:
        """
        Get difficulty level from score
        
        Args:
            score: Difficulty score
            
        Returns:
            Difficulty level
        """
        if score >= 80:
            return "Very High"
        elif score >= 65:
            return "High"
        elif score >= 45:
            return "Moderate"
        elif score >= 25:
            return "Low"
        else:
            return "Very Low"
    
    def _get_difficulty_factors(self, current_role: str, target_role: str,
                              skill_gap: Dict[str, Any], experience_years: int) -> List[Dict[str, Any]]:
        """
        Get factors affecting transition difficulty
        
        Args:
            current_role: Current role
            target_role: Target role
            skill_gap: Skill gap analysis
            experience_years: Years of experience
            
        Returns:
            List of difficulty factors
        """
        factors = []
        
        # Domain change factor
        current_domain = self._infer_domain(current_role)
        target_domain = self._infer_domain(target_role)
        if current_domain != target_domain:
            factors.append({
                "name": "Domain Change",
                "impact": "high",
                "description": f"Transitioning from {current_domain.replace('_', ' ')} to {target_domain.replace('_', ' ')} requires learning new industry knowledge and practices."
            })
        
        # Skill gap factor
        missing_skills_count = skill_gap.get("missing_skills", {}).get("total", 0)
        if missing_skills_count > 0:
            impact = "high" if missing_skills_count > 7 else "medium" if missing_skills_count > 3 else "low"
            factors.append({
                "name": "Skill Gap",
                "impact": impact,
                "description": f"You need to acquire {missing_skills_count} new skills for the target role."
            })
        
        # Experience factor
        if experience_years < 2:
            factors.append({
                "name": "Limited Experience",
                "impact": "high",
                "description": "Limited professional experience may make the transition more challenging."
            })
        elif experience_years < 5:
            factors.append({
                "name": "Moderate Experience",
                "impact": "medium",
                "description": "Your professional experience will help, but more specialized experience may be needed."
            })
        
        # Career level factor
        if "senior" in target_role.lower() or "lead" in target_role.lower() or "manager" in target_role.lower():
            factors.append({
                "name": "Senior Level Target",
                "impact": "medium",
                "description": "The target role is a senior position, which typically requires demonstrated expertise and leadership."
            })
        
        return factors
    
    def _estimate_transition_timeframe(self, difficulty_score: int, skill_gap: Dict[str, Any]) -> Dict[str, Any]:
        """
        Estimate timeframe for career transition
        
        Args:
            difficulty_score: Transition difficulty score
            skill_gap: Skill gap analysis
            
        Returns:
            Timeframe estimation
        """
        # Base transition time in months
        base_time = 3
        
        # Adjust based on difficulty
        if difficulty_score >= 80:
            base_time = 18
        elif difficulty_score >= 65:
            base_time = 12
        elif difficulty_score >= 45:
            base_time = 9
        elif difficulty_score >= 25:
            base_time = 6
        
        # Adjust based on skills to acquire
        missing_skills_count = skill_gap.get("missing_skills", {}).get("total", 0)
        skill_time = missing_skills_count * 1.5  # Assume 1.5 months per skill on average
        
        # Calculate range
        min_time = max(1, int(base_time * 0.7))
        max_time = int((base_time + skill_time) * 1.3)
        
        # Handle very long timeframes
        if max_time > 36:
            max_time = 36
        
        return {
            "minimum_months": min_time,
            "maximum_months": max_time,
            "average_months": int((min_time + max_time) / 2)
        }
    
    def _generate_transition_steps(self, current_role: str, target_role: str, 
                                skill_gap: Dict[str, Any], timeframe: Dict[str, int]) -> List[Dict[str, Any]]:
        """
        Generate steps for career transition
        
        Args:
            current_role: Current role
            target_role: Target role
            skill_gap: Skill gap analysis
            timeframe: Transition timeframe
            
        Returns:
            List of transition steps
        """
        steps = []
        total_time = timeframe.get("average_months", 12)
        time_elapsed = 0
        
        # Step 1: Skills assessment and planning
        steps.append({
            "title": "Skills Assessment and Planning",
            "description": "Conduct a thorough assessment of your current skills and create a detailed learning plan.",
            "timeframe": "0-1 months",
            "activities": [
                "Identify specific skills to develop",
                "Research learning resources",
                "Set specific, measurable learning goals",
                "Create a schedule for skill development"
            ]
        })
        time_elapsed += 1
        
        # Step 2: Skill development
        missing_skills = skill_gap.get("missing_skills", {}).get("skills", [])
        if missing_skills:
            skill_time = min(total_time * 0.5, len(missing_skills) * 1.5)
            skill_time = max(2, int(skill_time))
            
            steps.append({
                "title": "Skill Development",
                "description": f"Focus on acquiring the key skills needed for the {target_role} role.",
                "timeframe": f"{time_elapsed}-{time_elapsed + skill_time} months",
                "activities": [
                    f"Learn {skill}" for skill in missing_skills[:3]
                ] + ["Complete online courses or certifications", "Build projects to demonstrate new skills"]
            })
            time_elapsed += skill_time
        
        # Step 3: Networking and mentorship
        network_time = max(1, int(total_time * 0.2))
        steps.append({
            "title": "Networking and Mentorship",
            "description": "Connect with professionals in your target role and seek mentorship.",
            "timeframe": f"{time_elapsed}-{time_elapsed + network_time} months",
            "activities": [
                "Attend industry events and meetups",
                "Connect with professionals on LinkedIn",
                "Join relevant online communities",
                "Find a mentor in your target field"
            ]
        })
        time_elapsed += network_time
        
        # Step 4: Experience building
        experience_time = max(2, total_time - time_elapsed - 1)
        steps.append({
            "title": "Experience Building",
            "description": "Gain practical experience relevant to your target role.",
            "timeframe": f"{time_elapsed}-{time_elapsed + experience_time} months",
            "activities": [
                "Take on relevant projects in your current role",
                "Volunteer for cross-functional initiatives",
                "Contribute to open-source projects",
                "Build a portfolio showcasing relevant work"
            ]
        })
        time_elapsed += experience_time
        
        # Step 5: Job search and transition
        steps.append({
            "title": "Job Search and Transition",
            "description": "Prepare materials and begin applying for roles.",
            "timeframe": f"{time_elapsed}+ months",
            "activities": [
                "Update resume and LinkedIn profile",
                "Prepare for interviews specific to the target role",
                "Reach out to your network for opportunities",
                "Begin applying for relevant positions"
            ]
        })
        
        return steps
    
    def _get_transition_insights_from_ai(self, current_role: str, target_role: str,
                                      current_skills: List[str], experience_years: int,
                                      education: List[str], difficulty_score: int,
                                      timeframe: Dict[str, int]) -> List[Dict[str, str]]:
        """
        Get AI-powered insights for career transition
        
        Args:
            current_role: Current role
            target_role: Target role
            current_skills: Current skills
            experience_years: Years of experience
            education: Educational background
            difficulty_score: Transition difficulty score
            timeframe: Transition timeframe
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI insights")
            return []
        
        try:
            # Simplified data to avoid token limits
            simplified_data = {
                "current_role": current_role,
                "target_role": target_role,
                "current_skills": current_skills[:10],
                "experience_years": experience_years,
                "education": education,
                "difficulty_score": difficulty_score,
                "difficulty_level": self._get_difficulty_level(difficulty_score),
                "timeframe_months": timeframe.get("average_months", 12)
            }
            
            # Prepare the API request
            prompt = f"""Based on this career transition information, provide strategic insights:
            
            Data: {json.dumps(simplified_data)}
            
            Provide 3-5 concise, strategic insights about:
            1. Key challenges in this transition
            2. Strategic advantages to leverage
            3. Essential skills to prioritize
            4. Potential career acceleration approaches
            
            Format as a JSON array with objects containing "title" and "description" fields.
            Keep insights focused, factual, and actionable.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career coach providing strategic career transition advice."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
                "max_tokens": 800
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
                    return []
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return []
            
        except Exception as e:
            logger.error(f"Error getting transition insights from AI: {str(e)}")
            return []
    
    def get_required_skills(self, job_title: str) -> List[str]:
        """
        Get required skills for a job title
        
        Args:
            job_title: Job title
            
        Returns:
            List of required skills
        """
        # Normalize job title
        job_title = job_title.lower()
        
        # Find domain and role
        domain = self._infer_domain(job_title)
        matched_role = None
        
        if domain in self.skill_requirements:
            for role in self.skill_requirements[domain]:
                if role.lower() in job_title:
                    matched_role = role
                    break
            
            if matched_role:
                return self.skill_requirements[domain][matched_role]
        
        # If no exact match, return similar role skills
        for domain, roles in self.skill_requirements.items():
            for role, skills in roles.items():
                if any(keyword in job_title for keyword in role.lower().split()):
                    return skills
        
        # Default generic skills
        return [
            "communication", "problem solving", "teamwork", "time management",
            "critical thinking", "adaptability", "technical aptitude"
        ]