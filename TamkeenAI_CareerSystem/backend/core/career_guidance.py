"""
Career Guidance Module

This module provides career path recommendations, job suggestions, and
development roadmaps based on user profiles and career goals.
"""

import os
import json
import random
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import other core modules if needed
from .keyword_recommender import extract_keywords

# Import settings
from config.settings import BASE_DIR

# Define paths for career data
CAREER_DATA_DIR = os.path.join(BASE_DIR, 'data', 'careers')
JOB_MARKET_DATA_DIR = os.path.join(BASE_DIR, 'data', 'job_market')
os.makedirs(CAREER_DATA_DIR, exist_ok=True)
os.makedirs(JOB_MARKET_DATA_DIR, exist_ok=True)

# Try importing pandas for data analysis
try:
    import pandas as pd
    import numpy as np
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Warning: pandas not available. Advanced data analysis features will be limited.")


class CareerGuidance:
    """Class for providing career guidance and recommendations"""
    
    def __init__(self):
        """Initialize with career path data"""
        # Load career paths and job role data
        self.career_paths = self._load_career_paths()
        self.job_roles = self._load_job_roles()
        self.skill_matrix = self._load_skill_matrix()
    
    def _load_career_paths(self) -> Dict[str, Any]:
        """Load career path data from files"""
        career_paths = {}
        
        try:
            # Look for career path JSON files
            for filename in os.listdir(CAREER_DATA_DIR):
                if filename.endswith('.json') and filename.startswith('career_path_'):
                    path_name = os.path.splitext(filename)[0].replace('career_path_', '')
                    file_path = os.path.join(CAREER_DATA_DIR, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        career_paths[path_name] = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading career paths: {e}")
            
            # Create minimal default data if no files exist
            career_paths = {
                "software_development": {
                    "title": "Software Development",
                    "description": "Career path for software development professionals",
                    "progression": [
                        {"level": 1, "title": "Junior Developer", "years_experience": "0-2", 
                         "key_skills": ["programming basics", "version control", "testing"]},
                        {"level": 2, "title": "Software Developer", "years_experience": "2-4", 
                         "key_skills": ["full-stack development", "databases", "apis"]},
                        {"level": 3, "title": "Senior Developer", "years_experience": "4-7", 
                         "key_skills": ["system design", "mentoring", "architecture"]},
                        {"level": 4, "title": "Tech Lead", "years_experience": "7-10", 
                         "key_skills": ["technical leadership", "project management", "architecture"]},
                        {"level": 5, "title": "Software Architect", "years_experience": "10+", 
                         "key_skills": ["enterprise architecture", "technical strategy", "innovation"]}
                    ]
                },
                "data_science": {
                    "title": "Data Science",
                    "description": "Career path for data science professionals",
                    "progression": [
                        {"level": 1, "title": "Data Analyst", "years_experience": "0-2", 
                         "key_skills": ["sql", "data visualization", "statistics"]},
                        {"level": 2, "title": "Junior Data Scientist", "years_experience": "2-4", 
                         "key_skills": ["machine learning", "python", "data wrangling"]},
                        {"level": 3, "title": "Data Scientist", "years_experience": "4-7", 
                         "key_skills": ["advanced ml", "deep learning", "experimentation"]},
                        {"level": 4, "title": "Senior Data Scientist", "years_experience": "7-10", 
                         "key_skills": ["ml systems", "leadership", "research"]},
                        {"level": 5, "title": "Lead Data Scientist", "years_experience": "10+", 
                         "key_skills": ["ai strategy", "team leadership", "business impact"]}
                    ]
                }
            }
        
        return career_paths
    
    def _load_job_roles(self) -> Dict[str, Any]:
        """Load job role data from files"""
        job_roles = {}
        
        try:
            # Look for job role JSON files
            for filename in os.listdir(CAREER_DATA_DIR):
                if filename.endswith('.json') and filename.startswith('job_role_'):
                    role_name = os.path.splitext(filename)[0].replace('job_role_', '')
                    file_path = os.path.join(CAREER_DATA_DIR, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        job_roles[role_name] = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading job roles: {e}")
            
            # Create minimal default data if no files exist
            job_roles = {
                "software_engineer": {
                    "title": "Software Engineer",
                    "description": "Designs and develops software systems",
                    "required_skills": ["programming", "algorithms", "software design"],
                    "recommended_certifications": ["AWS Certified Developer", "Microsoft Certified: Azure Developer"],
                    "education": ["Computer Science", "Software Engineering"],
                    "career_paths": ["software_development", "devops"],
                    "avg_salary_range": {"min": 70000, "max": 120000, "currency": "USD"}
                },
                "data_scientist": {
                    "title": "Data Scientist",
                    "description": "Analyzes data to extract actionable insights",
                    "required_skills": ["machine learning", "statistics", "python", "data visualization"],
                    "recommended_certifications": ["Google Data Analytics", "IBM Data Science Professional"],
                    "education": ["Data Science", "Statistics", "Computer Science", "Mathematics"],
                    "career_paths": ["data_science", "machine_learning"],
                    "avg_salary_range": {"min": 85000, "max": 140000, "currency": "USD"}
                }
            }
        
        return job_roles
    
    def _load_skill_matrix(self) -> Dict[str, Dict[str, float]]:
        """Load skill relationship matrix"""
        skill_matrix = {}
        
        try:
            skill_matrix_path = os.path.join(CAREER_DATA_DIR, 'skill_matrix.json')
            if os.path.exists(skill_matrix_path):
                with open(skill_matrix_path, 'r', encoding='utf-8') as f:
                    skill_matrix = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading skill matrix: {e}")
            
            # Create minimal default data
            skill_matrix = {
                "programming": {
                    "software design": 0.8,
                    "algorithms": 0.7,
                    "data structures": 0.7,
                    "testing": 0.6
                },
                "machine learning": {
                    "statistics": 0.9,
                    "python": 0.7,
                    "data visualization": 0.6,
                    "big data": 0.5
                }
            }
        
        return skill_matrix
    
    def recommend_career_paths(self, skills: List[str], 
                              experience_years: float = 0,
                              education: Optional[List[Dict[str, Any]]] = None, 
                              preferences: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Recommend suitable career paths based on skills, experience, and education
        
        Args:
            skills: List of user skills
            experience_years: Years of professional experience
            education: List of education entries
            preferences: User preferences (work style, interests, etc.)
            
        Returns:
            list: List of recommended career paths with fit scores
        """
        if not skills:
            return []
        
        recommendations = []
        user_skills_lower = [s.lower() for s in skills]
        
        for path_id, path_data in self.career_paths.items():
            # Skip empty or invalid paths
            if not path_data or "progression" not in path_data:
                continue
            
            # Calculate fit score
            fit_score = 0
            max_score = 0
            skill_matches = []
            
            # Find appropriate level based on experience
            appropriate_level = 1
            for level_data in path_data["progression"]:
                level_years = level_data.get("years_experience", "0")
                if "-" in level_years:
                    min_years, max_years = map(int, level_years.split("-"))
                    if min_years <= experience_years <= max_years:
                        appropriate_level = level_data.get("level", 1)
                        break
                    if experience_years > max_years:
                        appropriate_level = level_data.get("level", 1)
            
            # Get the appropriate level data
            level_data = next((level for level in path_data["progression"] 
                              if level.get("level") == appropriate_level), None)
            
            if level_data and "key_skills" in level_data:
                # Calculate skill match score
                for path_skill in level_data["key_skills"]:
                    max_score += 1
                    path_skill_lower = path_skill.lower()
                    
                    # Direct match
                    if path_skill_lower in user_skills_lower:
                        fit_score += 1
                        skill_matches.append(path_skill)
                        continue
                    
                    # Related skill match using skill matrix
                    for user_skill in user_skills_lower:
                        if user_skill in self.skill_matrix and path_skill_lower in self.skill_matrix[user_skill]:
                            relation_score = self.skill_matrix[user_skill][path_skill_lower]
                            fit_score += relation_score
                            if relation_score > 0.5:  # Only count strong relationships
                                skill_matches.append(path_skill)
                            break
            
            # Normalize fit score to percentage
            percent_fit = (fit_score / max_score * 100) if max_score > 0 else 0
            
            # Education bonus (if education matches recommended fields)
            if education:
                education_fields = [edu.get("field", "").lower() for edu in education]
                path_education = path_data.get("recommended_education", [])
                
                for field in education_fields:
                    if any(field in edu.lower() for edu in path_education):
                        percent_fit += 10  # 10% bonus for relevant education
                        break
            
            # Create recommendation
            recommendation = {
                "path_id": path_id,
                "title": path_data.get("title", path_id),
                "fit_score": round(min(100, percent_fit), 1),
                "description": path_data.get("description", ""),
                "current_level": appropriate_level,
                "current_title": level_data.get("title", f"Level {appropriate_level}") if level_data else f"Level {appropriate_level}",
                "matching_skills": skill_matches,
                "next_steps": self._get_next_steps_for_path(path_id, appropriate_level, user_skills_lower)
            }
            
            recommendations.append(recommendation)
        
        # Sort by fit score (descending)
        recommendations.sort(key=lambda x: x["fit_score"], reverse=True)
        
        return recommendations
    
    def _get_next_steps_for_path(self, path_id: str, current_level: int, user_skills: List[str]) -> List[Dict[str, Any]]:
        """
        Get next steps for career progression in a specific path
        
        Args:
            path_id: Career path ID
            current_level: Current level in the path
            user_skills: User's current skills
            
        Returns:
            list: List of next steps to progress in career
        """
        next_steps = []
        
        # Get career path data
        path_data = self.career_paths.get(path_id)
        if not path_data or "progression" not in path_data:
            return next_steps
        
        # Find next level
        next_level = current_level + 1
        next_level_data = next((level for level in path_data["progression"] 
                               if level.get("level") == next_level), None)
        
        if not next_level_data:
            # User is at the highest level
            return [{
                "type": "mastery",
                "description": "You've reached the highest level in this career path. Focus on mastery and mentorship.",
                "action_items": [
                    "Mentor junior professionals",
                    "Speak at industry conferences",
                    "Write articles or books about your expertise",
                    "Consider parallel specializations"
                ]
            }]
        
        # Skill gaps
        skill_gaps = []
        if "key_skills" in next_level_data:
            for skill in next_level_data["key_skills"]:
                if skill.lower() not in user_skills:
                    skill_gaps.append(skill)
        
        if skill_gaps:
            next_steps.append({
                "type": "skills",
                "description": "Develop these skills to prepare for the next level",
                "skills": skill_gaps
            })
        
        # Recommended certifications
        recommended_certs = []
        next_role = next_level_data.get("title", f"Level {next_level}")
        
        # Find job roles that match this path and level
        for role_id, role_data in self.job_roles.items():
            if path_id in role_data.get("career_paths", []) and role_data.get("title", "").lower() in next_role.lower():
                recommended_certs.extend(role_data.get("recommended_certifications", []))
        
        if recommended_certs:
            next_steps.append({
                "type": "certifications",
                "description": "Consider these certifications to strengthen your profile",
                "certifications": list(set(recommended_certs))  # Remove duplicates
            })
        
        # General advice
        next_steps.append({
            "type": "experience",
            "description": f"Build experience toward becoming a {next_role}",
            "action_items": [
                f"Seek projects that involve {', '.join(skill_gaps[:2])}",
                "Ask for more responsibilities that align with the next level",
                "Find a mentor who is already at your target level",
                "Start documenting your achievements for future promotion discussions"
            ]
        })
        
        return next_steps
    
    def recommend_jobs(self, skills: List[str], experience_years: float = 0,
                     education: Optional[List[Dict[str, Any]]] = None,
                     preferences: Optional[Dict[str, Any]] = None,
                     location: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Recommend suitable job roles based on skills and experience
        
        Args:
            skills: List of user skills
            experience_years: Years of professional experience
            education: List of education entries
            preferences: User preferences (work style, interests, etc.)
            location: Preferred job location
            
        Returns:
            list: List of recommended job roles with fit scores
        """
        if not skills:
            return []
        
        recommendations = []
        user_skills_lower = [s.lower() for s in skills]
        
        for role_id, role_data in self.job_roles.items():
            # Calculate fit score
            fit_score = 0
            max_score = 0
            skill_matches = []
            
            # Required skills match
            required_skills = role_data.get("required_skills", [])
            for role_skill in required_skills:
                max_score += 1
                role_skill_lower = role_skill.lower()
                
                # Direct match
                if role_skill_lower in user_skills_lower:
                    fit_score += 1
                    skill_matches.append(role_skill)
                    continue
                
                # Related skill match using skill matrix
                for user_skill in user_skills_lower:
                    if user_skill in self.skill_matrix and role_skill_lower in self.skill_matrix[user_skill]:
                        relation_score = self.skill_matrix[user_skill][role_skill_lower]
                        fit_score += relation_score
                        if relation_score > 0.5:  # Only count strong relationships
                            skill_matches.append(role_skill)
                        break
            
            # Normalize fit score to percentage
            percent_fit = (fit_score / max_score * 100) if max_score > 0 else 0
            
            # Education bonus
            if education:
                education_fields = [edu.get("field", "").lower() for edu in education]
                role_education = role_data.get("education", [])
                
                for field in education_fields:
                    if any(field in edu.lower() for edu in role_education):
                        percent_fit += 10  # 10% bonus for relevant education
                        break
            
            # Experience match (simple linear scaling)
            role_min_exp = role_data.get("min_experience_years", 0)
            role_max_exp = role_data.get("max_experience_years", 10)
            
            if experience_years < role_min_exp:
                # Penalty for being underexperienced
                exp_factor = max(0, experience_years / role_min_exp) if role_min_exp > 0 else 1
                percent_fit *= (0.7 + (0.3 * exp_factor))  # Max 30% penalty
            elif experience_years > role_max_exp * 1.5:
                # Penalty for being significantly overexperienced
                percent_fit *= 0.9  # 10% penalty
            
            # Create recommendation
            recommendation = {
                "role_id": role_id,
                "title": role_data.get("title", role_id),
                "fit_score": round(min(100, percent_fit), 1),
                "description": role_data.get("description", ""),
                "matching_skills": skill_matches,
                "missing_skills": [s for s in required_skills if s not in skill_matches],
                "salary_range": role_data.get("avg_salary_range", {"min": 0, "max": 0, "currency": "USD"}),
                "recommended_certifications": role_data.get("recommended_certifications", [])
            }
            
            recommendations.append(recommendation)
        
        # Sort by fit score (descending)
        recommendations.sort(key=lambda x: x["fit_score"], reverse=True)
        
        return recommendations
    
    def generate_development_plan(self, current_skills: List[str], target_role: str,
                                 experience_years: float = 0) -> Dict[str, Any]:
        """
        Generate a personalized development plan to reach a target role
        
        Args:
            current_skills: List of current user skills
            target_role: Target job role
            experience_years: Years of professional experience
            
        Returns:
            dict: Development plan with timeline and steps
        """
        # Default empty plan
        development_plan = {
            "target_role": target_role,
            "timeline_months": 12,
            "skill_gaps": [],
            "learning_resources": [],
            "experience_goals": [],
            "milestones": []
        }
        
        # Get target role data
        role_data = None
        for role_id, data in self.job_roles.items():
            if role_id.lower() == target_role.lower() or data.get("title", "").lower() == target_role.lower():
                role_data = data
                break
        
        if not role_data:
            return development_plan
        
        # Calculate skill gaps
        current_skills_lower = [s.lower() for s in current_skills]
        required_skills = role_data.get("required_skills", [])
        
        skill_gaps = []
        for skill in required_skills:
            if skill.lower() not in current_skills_lower:
                # Check if user has related skills
                has_related = False
                for user_skill in current_skills_lower:
                    if user_skill in self.skill_matrix and skill.lower() in self.skill_matrix[user_skill]:
                        relation_score = self.skill_matrix[user_skill][skill.lower()]
                        if relation_score > 0.7:  # Strong relationship
                            has_related = True
                            break
                
                skill_gaps.append({
                    "skill": skill,
                    "has_related": has_related,
                    "priority": "high" if not has_related else "medium"
                })
        
        # Set timeline based on experience gap and skill gaps
        role_min_exp = role_data.get("min_experience_years", 0)
        exp_gap_years = max(0, role_min_exp - experience_years)
        skill_gap_count = len(skill_gaps)
        
        if exp_gap_years > 2 or skill_gap_count > 5:
            timeline_months = 24
        elif exp_gap_years > 1 or skill_gap_count > 3:
            timeline_months = 18
        else:
            timeline_months = 12
        
        # Generate learning resources
        learning_resources = []
        for skill_gap in skill_gaps:
            skill_name = skill_gap["skill"]
            # In a real system, these would come from a database or API
            resources = [
                {
                    "type": "course",
                    "title": f"Complete {skill_name} Course",
                    "url": f"https://example.com/courses/{skill_name.replace(' ', '-').lower()}",
                    "duration_hours": random.randint(15, 40)
                },
                {
                    "type": "book",
                    "title": f"{skill_name} Fundamentals",
                    "author": "Expert Author",
                    "url": f"https://example.com/books/{skill_name.replace(' ', '-').lower()}"
                }
            ]
            learning_resources.extend(resources)
        
        # Generate experience goals
        experience_goals = [
            f"Complete at least 2 projects involving {skill_gap['skill']}" 
            for skill_gap in skill_gaps[:3]
        ]
        experience_goals.extend([
            "Document all projects in a portfolio",
            "Connect with 3 professionals already in the target role",
            "Participate in relevant industry events or communities"
        ])
        
        # Generate milestones with timeline
        milestones = []
        timeline_segment = timeline_months / 4
        
        milestones.append({
            "month": int(timeline_segment),
            "title": "Foundation Building",
            "description": "Complete introductory training for key skill gaps",
            "goals": [
                f"Learn basics of {skill_gaps[0]['skill'] if skill_gaps else 'required skills'}",
                "Set up development environment and learning tools",
                "Connect with mentor or community in the field"
            ]
        })
        
        milestones.append({
            "month": int(timeline_segment * 2),
            "title": "Skill Development",
            "description": "Deepen knowledge and begin application",
            "goals": [
                "Complete at least 50% of learning resources",
                "Start first project applying new skills",
                "Obtain any entry-level certifications"
            ]
        })
        
        milestones.append({
            "month": int(timeline_segment * 3),
            "title": "Practical Application",
            "description": "Apply skills in real-world settings",
            "goals": [
                "Complete main project showcasing target skills",
                "Seek feedback from professionals",
                "Update resume and professional profiles with new skills"
            ]
        })
        
        milestones.append({
            "month": int(timeline_months),
            "title": "Role Readiness",
            "description": "Finalize preparation for target role",
            "goals": [
                "Complete portfolio demonstrating all key skills",
                "Pass required certifications",
                "Begin applying for target positions or prepare for internal promotion"
            ]
        })
        
        # Compile the development plan
        development_plan = {
            "target_role": role_data.get("title", target_role),
            "timeline_months": timeline_months,
            "skill_gaps": skill_gaps,
            "learning_resources": learning_resources[:5],  # Limit to top 5
            "experience_goals": experience_goals,
            "milestones": milestones
        }
        
        return development_plan
    
    def analyze_job_market_trends(self, industry: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze job market trends for career planning
        
        Args:
            industry: Industry to focus on (or None for general analysis)
            
        Returns:
            dict: Analysis of job market trends
        """
        # In a real system, this would fetch actual market data
        # For this implementation, we'll create simulated data
        
        market_data = self._get_job_market_data(industry)
        
        # Analyze growth roles
        growth_roles = []
        for role, data in market_data["roles"].items():
            if data["growth_rate"] > 5:
                growth_roles.append({
                    "title": role,
                    "growth_rate": data["growth_rate"],
                    "median_salary": data["median_salary"]
                })
        
        # Sort by growth rate
        growth_roles.sort(key=lambda x: x["growth_rate"], reverse=True)
        
        # Analyze skill demand
        skill_demand = []
        for skill, data in market_data["skills"].items():
            skill_demand.append({
                "skill": skill,
                "demand_score": data["demand_score"],
                "growth_rate": data["growth_rate"]
            })
        
        # Sort by demand score
        skill_demand.sort(key=lambda x: x["demand_score"], reverse=True)
        
        # Compile the analysis
        analysis = {
            "industry": industry if industry else "Overall Market",
            "timeframe": "Next 3-5 years",
            "growth_roles": growth_roles[:5],  # Top 5 growth roles
            "declining_roles": [
                role for role, data in market_data["roles"].items() 
                if data["growth_rate"] < 0
            ][:3],
            "high_demand_skills": skill_demand[:7],  # Top 7 in-demand skills
            "emerging_technologies": market_data.get("emerging_technologies", []),
            "remote_work_trend": market_data.get("remote_work_trend", {}),
            "salary_trends": market_data.get("salary_trends", {}),
            "last_updated": datetime.now().isoformat()
        }
        
        return analysis
    
    def _get_job_market_data(self, industry: Optional[str] = None) -> Dict[str, Any]:
        """Get job market data from files or default data"""
        if industry:
            # Try to load industry-specific data
            file_path = os.path.join(JOB_MARKET_DATA_DIR, f"{industry.lower().replace(' ', '_')}_market.json")
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except (json.JSONDecodeError, IOError):
                    pass
        
        # Try to load general market data
        file_path = os.path.join(JOB_MARKET_DATA_DIR, "general_market.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                pass
        
        # Return default data if files not found
        return {
            "roles": {
                "Data Scientist": {
                    "growth_rate": 22.0,
                    "median_salary": 110000,
                    "job_postings_count": 5800
                },
                "DevOps Engineer": {
                    "growth_rate": 18.5,
                    "median_salary": 115000,
                    "job_postings_count": 4300
                },
                "Full Stack Developer": {
                    "growth_rate": 12.2,
                    "median_salary": 102000,
                    "job_postings_count": 12500
                },
                "Cybersecurity Analyst": {
                    "growth_rate": 32.0,
                    "median_salary": 99000,
                    "job_postings_count": 3900
                },
                "Cloud Architect": {
                    "growth_rate": 15.7,
                    "median_salary": 130000,
                    "job_postings_count": 2700
                },
                "Web Developer": {
                    "growth_rate": 8.0,
                    "median_salary": 75000,
                    "job_postings_count": 9500
                },
                "Database Administrator": {
                    "growth_rate": -2.5,
                    "median_salary": 93000,
                    "job_postings_count": 2100
                },
                "Help Desk Technician": {
                    "growth_rate": -8.0,
                    "median_salary": 52000,
                    "job_postings_count": 3200
                }
            },
            "skills": {
                "Cloud Computing": {
                    "demand_score": 92,
                    "growth_rate": 25.0,
                    "top_industries": ["Technology", "Finance", "Healthcare"]
                },
                "Machine Learning": {
                    "demand_score": 90,
                    "growth_rate": 28.5,
                    "top_industries": ["Technology", "Finance", "Healthcare", "Retail"]
                },
                "DevOps": {
                    "demand_score": 88,
                    "growth_rate": 18.0,
                    "top_industries": ["Technology", "Finance"]
                },
                "Cybersecurity": {
                    "demand_score": 85,
                    "growth_rate": 30.0,
                    "top_industries": ["Technology", "Finance", "Government", "Healthcare"]
                },
                "JavaScript": {
                    "demand_score": 82,
                    "growth_rate": 10.0,
                    "top_industries": ["Technology", "Media", "Retail"]
                },
                "Data Analysis": {
                    "demand_score": 80,
                    "growth_rate": 15.5,
                    "top_industries": ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"]
                },
                "Python": {
                    "demand_score": 78,
                    "growth_rate": 22.0,
                    "top_industries": ["Technology", "Finance", "Research"]
                },
                "SQL": {
                    "demand_score": 75,
                    "growth_rate": 5.0,
                    "top_industries": ["Technology", "Finance", "Healthcare", "Retail"]
                }
            },
            "emerging_technologies": [
                "Artificial Intelligence",
                "Edge Computing",
                "Quantum Computing",
                "Blockchain",
                "Extended Reality (XR)"
            ],
            "remote_work_trend": {
                "percentage_remote": 38,
                "growth_rate": 15,
                "highest_remote_roles": ["Software Developer", "Data Analyst", "Digital Marketer"]
            },
            "salary_trends": {
                "overall_growth_rate": 4.2,
                "highest_growth_sectors": ["Technology", "Healthcare", "Renewable Energy"]
            }
        }


# Standalone function for career path suggestions based on resume
def suggest_career_paths_from_resume(resume_text: str, experience_years: float = 0) -> List[Dict[str, Any]]:
    """
    Suggest career paths based on resume content
    
    Args:
        resume_text: Text content of resume
        experience_years: Years of professional experience
        
    Returns:
        list: List of suggested career paths
    """
    # Extract skills from resume
    extracted_skills = extract_keywords(resume_text, top_n=20)
    skills = [skill for skill, _ in extracted_skills]
    
    # Initialize guidance module
    guidance = CareerGuidance()
    
    # Get recommendations based on extracted skills
    recommendations = guidance.recommend_career_paths(
        skills=skills,
        experience_years=experience_years
    )
    
    return recommendations


# Standalone function for quick job role recommendations
def recommend_jobs_from_skills(skills: List[str], experience_years: float = 0) -> List[Dict[str, Any]]:
    """
    Recommend job roles based on provided skills
    
    Args:
        skills: List of user skills
        experience_years: Years of professional experience
        
    Returns:
        list: List of recommended job roles
    """
    # Initialize guidance module
    guidance = CareerGuidance()
    
    # Get recommendations based on skills
    recommendations = guidance.recommend_jobs(
        skills=skills,
        experience_years=experience_years
    )
    
    return recommendations
