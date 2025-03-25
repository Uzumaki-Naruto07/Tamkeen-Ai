"""
Dashboard Service

This module implements business logic for the dashboard, including data processing,
analytics, and integration with the gamification system.
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Union
import random
import math

from ...core.gamification import GamificationEngine, get_user_gamification_status
from ..utils.ai_service import generate_career_insights
from ..database import get_user_data, save_user_data, get_resume_data, get_job_application_data
from config.settings import BASE_DIR

# Define paths for dashboard data
DASHBOARD_DIR = os.path.join(BASE_DIR, 'data', 'dashboard')
MARKET_DATA_DIR = os.path.join(DASHBOARD_DIR, 'market_data')
CAREER_PATHS_DIR = os.path.join(DASHBOARD_DIR, 'career_paths')

# Create directories if they don't exist
for directory in [DASHBOARD_DIR, MARKET_DATA_DIR, CAREER_PATHS_DIR]:
    os.makedirs(directory, exist_ok=True)

class DashboardService:
    """Service for dashboard functionality"""
    
    def __init__(self):
        """Initialize dashboard service"""
        # Load necessary data
        self._load_market_data()
        self._load_career_paths()
        
    def _load_market_data(self):
        """Load market data from file or initialize defaults"""
        market_data_path = os.path.join(MARKET_DATA_DIR, 'market_insights.json')
        
        if os.path.exists(market_data_path):
            try:
                with open(market_data_path, 'r') as f:
                    self.market_data = json.load(f)
            except Exception as e:
                print(f"Error loading market data: {e}")
                self.market_data = self._generate_default_market_data()
        else:
            self.market_data = self._generate_default_market_data()
            
            # Save default data
            try:
                with open(market_data_path, 'w') as f:
                    json.dump(self.market_data, f, indent=2)
            except Exception as e:
                print(f"Error saving default market data: {e}")
    
    def _generate_default_market_data(self) -> Dict[str, Any]:
        """Generate default market insights data"""
        # Sample data for data science related roles
        salary_data = [
            {
                "role": "Data Analyst",
                "median": 70000,
                "range_low": 55000,
                "range_high": 95000,
                "experience_factor": 1.15
            },
            {
                "role": "Data Scientist",
                "median": 95000,
                "range_low": 75000,
                "range_high": 130000,
                "experience_factor": 1.25
            },
            {
                "role": "Machine Learning Engineer",
                "median": 110000,
                "range_low": 85000,
                "range_high": 150000,
                "experience_factor": 1.3
            },
            {
                "role": "Business Intelligence Analyst",
                "median": 75000,
                "range_low": 60000,
                "range_high": 100000,
                "experience_factor": 1.15
            },
            {
                "role": "AI Research Scientist",
                "median": 120000,
                "range_low": 90000,
                "range_high": 180000,
                "experience_factor": 1.35
            }
        ]
        
        # Sample regional demand data
        regional_demand = [
            {"region": "United States", "demand_index": 9.5, "growth_rate": 3.2, "job_count": 35000},
            {"region": "European Union", "demand_index": 8.2, "growth_rate": 4.5, "job_count": 28000},
            {"region": "United Kingdom", "demand_index": 7.8, "growth_rate": 3.8, "job_count": 12000},
            {"region": "Canada", "demand_index": 7.5, "growth_rate": 4.1, "job_count": 8000},
            {"region": "Australia", "demand_index": 7.0, "growth_rate": 3.5, "job_count": 5500},
            {"region": "India", "demand_index": 8.8, "growth_rate": 6.2, "job_count": 22000},
            {"region": "Singapore", "demand_index": 7.2, "growth_rate": 4.3, "job_count": 3200},
            {"region": "Germany", "demand_index": 8.0, "growth_rate": 3.9, "job_count": 9500},
            {"region": "Japan", "demand_index": 6.5, "growth_rate": 2.8, "job_count": 7800},
            {"region": "Brazil", "demand_index": 5.8, "growth_rate": 4.7, "job_count": 4500}
        ]
        
        # Sample skill demand data
        skill_demand = [
            {"skill": "Python", "demand_index": 9.8, "growth_rate": 2.5, "job_frequency": 0.85},
            {"skill": "Machine Learning", "demand_index": 9.5, "growth_rate": 3.8, "job_frequency": 0.75},
            {"skill": "SQL", "demand_index": 9.2, "growth_rate": 1.5, "job_frequency": 0.82},
            {"skill": "Data Visualization", "demand_index": 8.7, "growth_rate": 2.2, "job_frequency": 0.70},
            {"skill": "Big Data", "demand_index": 8.5, "growth_rate": 2.8, "job_frequency": 0.65},
            {"skill": "Deep Learning", "demand_index": 8.8, "growth_rate": 4.5, "job_frequency": 0.60},
            {"skill": "Cloud Computing", "demand_index": 9.0, "growth_rate": 3.7, "job_frequency": 0.72},
            {"skill": "Natural Language Processing", "demand_index": 8.6, "growth_rate": 4.8, "job_frequency": 0.48},
            {"skill": "Statistical Analysis", "demand_index": 8.3, "growth_rate": 1.8, "job_frequency": 0.68},
            {"skill": "TensorFlow/PyTorch", "demand_index": 8.5, "growth_rate": 3.5, "job_frequency": 0.55},
            {"skill": "Data Engineering", "demand_index": 8.8, "growth_rate": 3.0, "job_frequency": 0.62},
            {"skill": "MLOps", "demand_index": 8.2, "growth_rate": 5.2, "job_frequency": 0.45}
        ]
        
        # Industry trends
        industry_trends = {
            "growing_sectors": [
                "Healthcare AI", 
                "Financial Analytics", 
                "E-commerce Personalization", 
                "Cybersecurity Analytics",
                "Autonomous Vehicles"
            ],
            "emerging_roles": [
                "AI Ethics Officer",
                "MLOps Engineer",
                "Decision Intelligence Analyst",
                "Data Compliance Specialist"
            ],
            "key_trends": [
                {
                    "trend": "AutoML Adoption",
                    "description": "Increased use of automated machine learning tools",
                    "impact_score": 8.5
                },
                {
                    "trend": "Responsible AI",
                    "description": "Greater focus on ethics, fairness, and transparency in AI",
                    "impact_score": 9.2
                },
                {
                    "trend": "Edge AI",
                    "description": "AI processing moving to edge devices rather than cloud",
                    "impact_score": 8.7
                },
                {
                    "trend": "AI Regulation",
                    "description": "Growing legal frameworks around AI/ML applications",
                    "impact_score": 9.0
                }
            ]
        }
        
        # Combine all data
        return {
            "salary_data": salary_data,
            "regional_demand": regional_demand,
            "skill_demand": skill_demand,
            "industry_trends": industry_trends,
            "last_updated": datetime.now().isoformat()
        }
    
    def _load_career_paths(self):
        """Load career path data from file or initialize defaults"""
        career_paths_file = os.path.join(CAREER_PATHS_DIR, 'career_paths.json')
        
        if os.path.exists(career_paths_file):
            try:
                with open(career_paths_file, 'r') as f:
                    self.career_paths = json.load(f)
            except Exception as e:
                print(f"Error loading career paths: {e}")
                self.career_paths = self._generate_default_career_paths()
        else:
            self.career_paths = self._generate_default_career_paths()
            
            # Save default data
            try:
                with open(career_paths_file, 'w') as f:
                    json.dump(self.career_paths, f, indent=2)
            except Exception as e:
                print(f"Error saving default career paths: {e}")
    
    def _generate_default_career_paths(self) -> Dict[str, Any]:
        """Generate default career path data"""
        return {
            "Data Science": {
                "path_name": "Data Science",
                "compatibility": 90,
                "entry_roles": [
                    {
                        "role": "Junior Data Analyst",
                        "description": "Analyze data and create basic reports",
                        "required_skills": ["Python", "SQL", "Excel", "Statistics"]
                    },
                    {
                        "role": "Data Analyst",
                        "description": "Perform complex data analysis and visualization",
                        "required_skills": ["Python", "SQL", "Data Visualization", "Statistical Analysis"]
                    },
                    {
                        "role": "BI Analyst",
                        "description": "Create business intelligence dashboards and reports",
                        "required_skills": ["SQL", "Power BI/Tableau", "Data Modeling", "Business Acumen"]
                    }
                ],
                "mid_roles": [
                    {
                        "role": "Data Scientist",
                        "description": "Building ML models and performing advanced analytics",
                        "required_skills": ["Machine Learning", "Python", "SQL", "Statistics", "Data Visualization"]
                    },
                    {
                        "role": "ML Engineer",
                        "description": "Developing and deploying machine learning models",
                        "required_skills": ["Python", "Machine Learning", "Deep Learning", "MLOps", "Cloud Computing"]
                    },
                    {
                        "role": "Data Science Consultant",
                        "description": "Providing data science expertise to clients across industries",
                        "required_skills": ["Machine Learning", "Python", "Communication", "Domain Knowledge", "Problem Solving"]
                    }
                ],
                "advanced_roles": [
                    {
                        "role": "Lead Data Scientist",
                        "description": "Leading a team of data scientists on complex projects",
                        "required_skills": ["Advanced ML", "Team Leadership", "Project Management", "Communication"]
                    },
                    {
                        "role": "AI Research Scientist",
                        "description": "Conducting cutting-edge research in AI and ML",
                        "required_skills": ["Advanced ML", "Deep Learning", "Research", "Mathematical Foundations", "Publication Record"]
                    },
                    {
                        "role": "Chief Data Officer",
                        "description": "Executive role overseeing all data initiatives in an organization",
                        "required_skills": ["Strategic Thinking", "Leadership", "Data Governance", "Business Acumen", "Communication"]
                    }
                ],
                "skill_gaps": ["Deep Learning", "MLOps", "Cloud Platforms", "Production ML Systems", "Team Leadership"]
            },
            "Data Engineering": {
                "path_name": "Data Engineering",
                "compatibility": 75,
                "entry_roles": [
                    {
                        "role": "Junior Data Engineer",
                        "description": "Building and maintaining data pipelines",
                        "required_skills": ["Python", "SQL", "ETL", "Basic Cloud"]
                    },
                    {
                        "role": "Database Administrator",
                        "description": "Managing and optimizing databases",
                        "required_skills": ["SQL", "Database Management", "Performance Tuning", "Data Security"]
                    },
                    {
                        "role": "ETL Developer",
                        "description": "Developing extract, transform, load processes",
                        "required_skills": ["ETL Tools", "SQL", "Python", "Data Modeling"]
                    }
                ],
                "mid_roles": [
                    {
                        "role": "Data Engineer",
                        "description": "Designing and implementing complex data infrastructure",
                        "required_skills": ["Python", "Spark", "SQL", "Cloud Platforms", "Data Modeling"]
                    },
                    {
                        "role": "Big Data Engineer",
                        "description": "Building systems for processing large-scale data",
                        "required_skills": ["Hadoop", "Spark", "NoSQL", "Distributed Systems", "Data Warehousing"]
                    },
                    {
                        "role": "Data Architect",
                        "description": "Designing enterprise data management systems",
                        "required_skills": ["Data Modeling", "System Design", "Database Architecture", "Data Governance"]
                    }
                ],
                "advanced_roles": [
                    {
                        "role": "Lead Data Engineer",
                        "description": "Leading data engineering teams and initiatives",
                        "required_skills": ["Team Leadership", "Advanced Cloud", "System Architecture", "Project Management"]
                    },
                    {
                        "role": "Data Infrastructure Architect",
                        "description": "Designing enterprise-wide data infrastructure",
                        "required_skills": ["Enterprise Architecture", "Multi-cloud Strategy", "Data Strategy", "Governance"]
                    },
                    {
                        "role": "VP of Data Engineering",
                        "description": "Executive leadership of data engineering organization",
                        "required_skills": ["Leadership", "Strategy", "Data Architecture", "Business Acumen"]
                    }
                ],
                "skill_gaps": ["Distributed Systems", "Containerization", "Data Lake Architecture", "Streaming Data", "Multi-cloud"]
            },
            "AI Product Management": {
                "path_name": "AI Product Management",
                "compatibility": 65,
                "entry_roles": [
                    {
                        "role": "Product Analyst",
                        "description": "Analyzing product metrics and user behavior",
                        "required_skills": ["Analytics", "SQL", "Data Visualization", "Product Thinking"]
                    },
                    {
                        "role": "Technical Product Specialist",
                        "description": "Supporting technical products with data and analytics expertise",
                        "required_skills": ["Technical Knowledge", "Communication", "Customer Support", "Analytics"]
                    },
                    {
                        "role": "Junior Product Manager",
                        "description": "Managing aspects of product development with technical background",
                        "required_skills": ["Product Management", "Technical Background", "Communication", "Agile"]
                    }
                ],
                "mid_roles": [
                    {
                        "role": "AI Product Manager",
                        "description": "Managing AI/ML product development",
                        "required_skills": ["Product Management", "AI/ML Knowledge", "User Research", "Agile", "Communication"]
                    },
                    {
                        "role": "Data Product Manager",
                        "description": "Managing data products and analytics solutions",
                        "required_skills": ["Product Management", "Data Strategy", "Analytics", "UX for Data Products"]
                    },
                    {
                        "role": "Technical Program Manager",
                        "description": "Coordinating complex technical programs involving AI/ML",
                        "required_skills": ["Program Management", "Technical Background", "Cross-team Coordination", "Strategic Thinking"]
                    }
                ],
                "advanced_roles": [
                    {
                        "role": "Director of AI Products",
                        "description": "Leading AI product strategy and development",
                        "required_skills": ["AI Strategy", "Product Leadership", "Business Strategy", "Team Management"]
                    },
                    {
                        "role": "VP of Product - AI",
                        "description": "Executive leadership of AI product organization",
                        "required_skills": ["Product Leadership", "Executive Communication", "AI Strategy", "Business Leadership"]
                    },
                    {
                        "role": "Chief Product Officer",
                        "description": "Executive leadership of all product initiatives",
                        "required_skills": ["Executive Leadership", "Product Strategy", "Business Acumen", "Visionary Thinking"]
                    }
                ],
                "skill_gaps": ["Product Development", "User Research", "Business Strategy", "AI Ethics", "Executive Communication"]
            }
        }
    
    def get_complete_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Get complete dashboard data for a user"""
        # Get user data
        user_data = get_user_data(user_id)
        if not user_data:
            raise ValueError(f"User data not found for user ID: {user_id}")
            
        # Get resume data
        resume_data = get_resume_data(user_id)
        
        # Get job application data
        job_application_data = get_job_application_data(user_id)
        
        # Get gamification data
        gamification = GamificationEngine(user_id)
        gamification_data = get_user_gamification_status(user_id)
        
        # Get resume scores
        resume_scores = self._get_resume_scores(user_id, resume_data)
        
        # Get skill progress
        skill_progress = self._get_skill_progress(user_id, user_data)
        
        # Get career paths
        career_paths = self._get_career_paths(user_id, user_data)
        
        # Get market insights
        market_insights = self._get_market_insights(user_id, user_data)
        
        # Get activity log
        activity_log = gamification_data.get("activity_log", [])
        
        # Generate career prediction
        career_prediction = self._generate_career_prediction(user_id, user_data)
        
        # Get leaderboard position
        leaderboard = gamification.get_leaderboard(count=100)
        leaderboard_position = next((entry.get("rank") for entry in leaderboard 
                                   if entry.get("user_id") == user_id), None)
        
        # Compile user progress data
        user_progress = {
            "level": gamification_data.get("current_level", 1),
            "xp": gamification_data.get("total_xp", 0),
            "xp_to_next_level": gamification_data.get("xp_to_next_level", 100),
            "badges_earned": sum(1 for badge in gamification_data.get("badges", {}).values() 
                                if badge.get("earned", False)),
            "badges_total": len(gamification_data.get("badges", {})),
            "recent_achievements": gamification_data.get("recent_achievements", [])[:5],
            "skill_completion": self._calculate_skill_completion(skill_progress)
        }
        
        # Compile complete dashboard response
        dashboard_data = {
            "user_progress": user_progress,
            "resume_scores": resume_scores,
            "badges": [badge for badge in gamification_data.get("badges", {}).values()],
            "skill_progress": skill_progress,
            "career_paths": career_paths,
            "market_insights": market_insights,
            "activity_log": activity_log[:20],  # Only most recent 20 activities
            "leaderboard_position": leaderboard_position,
            "career_prediction": career_prediction
        }
        
        return dashboard_data
    
    def _format_resume_scores(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format resume scores for dashboard display"""
        if not resume_data or "versions" not in resume_data:
            # Return empty default
            return {
                "scores": [],
                "average_improvement": 0,
                "latest_score": 0,
                "total_versions": 0
            }
            
        versions = resume_data.get("versions", [])
        scores = []
        
        for i, version in enumerate(versions):
            if "ats_score" in version:
                scores.append({
                    "date": version.get("date", datetime.now().isoformat()),
                    "score": version.get("ats_score", 0),
                    "version": i + 1
                })
        
        # Calculate improvements
        average_improvement = 0
        if len(scores) > 1:
            improvements = [scores[i]["score"] - scores[i-1]["score"] for i in range(1, len(scores))]
            average_improvement = sum(improvements) / len(improvements)
        
        return {
            "scores": scores,
            "average_improvement": average_improvement,
            "latest_score": scores[-1]["score"] if scores else 0,
            "total_versions": len(scores)
        }
    
    def _format_skill_progress(self, skill_progress: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """Format skill progress data for dashboard display"""
        if not skill_progress:
            # Generate from user skills if available
            if user_data and "skills" in user_data:
                skill_progress = {}
                for category, skills in user_data.get("skills", {}).items():
                    skill_progress[category] = {}
                    for skill, details in skills.items():
                        proficiency = details.get("proficiency", 0)
                        skill_progress[category][skill] = {
                            "current": proficiency,
                            "history": [max(0, proficiency - random.randint(5, 20))],  # Generate fake history
                            "target": min(100, proficiency + random.randint(10, 25))
                        }
                return skill_progress
                
            # Generate default if no user skills
            return {
                "Technical Skills": {
                    "Python": {"current": 70, "history": [50, 60, 65, 70], "target": 90},
                    "Data Analysis": {"current": 65, "history": [45, 55, 60, 65], "target": 85},
                    "Machine Learning": {"current": 45, "history": [20, 30, 40, 45], "target": 75}
                },
                "Soft Skills": {
                    "Communication": {"current": 75, "history": [60, 65, 70, 75], "target": 90},
                    "Teamwork": {"current": 80, "history": [65, 70, 75, 80], "target": 90},
                    "Problem Solving": {"current": 65, "history": [50, 55, 60, 65], "target": 85}
                }
            }
            
        # Format existing skill progress data
        formatted_skills = {}
        for category, skills in skill_progress.items():
            formatted_skills[category] = {}
            for skill, details in skills.items():
                if isinstance(details, dict) and "current" in details:
                    formatted_skills[category][skill] = details
                else:
                    # Handle case where skill data is just a number
                    formatted_skills[category][skill] = {
                        "current": details if isinstance(details, (int, float)) else 50,
                        "history": [max(0, details - 20), max(0, details - 10), details] if isinstance(details, (int, float)) else [30, 40, 50],
                        "target": min(100, details + 15) if isinstance(details, (int, float)) else 75
                    }
                    
        return formatted_skills
    
    def _calculate_skill_completion(self, skill_progress: Dict[str, Any]) -> Dict[str, int]:
        """Calculate skill completion percentages by category"""
        completion = {}
        
        for category, skills in skill_progress.items():
            total_percentage = 0
            skill_count = len(skills)
            
            if skill_count == 0:
                completion[category] = 0
                continue
            
            for skill_name, skill_data in skills.items():
                current = skill_data.get("current", 0)
                target = skill_data.get("target", 100)
                
                # Calculate percentage completion toward target
                if target > 0:
                    percentage = min(100, (current / target) * 100)
                else:
                    percentage = 0
                
                total_percentage += percentage
            
            # Average completion for category
            completion[category] = int(total_percentage / skill_count)
        
        return completion
    
    def _get_personalized_career_paths(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get personalized career paths based on user data"""
        # Get user skills
        user_skills = set()
        if user_data and "skills" in user_data:
            for category, skills in user_data.get("skills", {}).items():
                user_skills.update(skills.keys())
        
        # Calculate compatibility for each path
        paths = {}
        for path_name, path_data in self.career_paths.items():
            path_copy = path_data.copy()
            
            # Calculate skill match for each role in the path
            for role_level in ["entry_roles", "mid_roles", "advanced_roles"]:
                if role_level in path_copy:
                    for i, role in enumerate(path_copy[role_level]):
                        required_skills = set(role.get("required_skills", []))
                        matching_skills = required_skills.intersection(user_skills)
                        match_percent = round((len(matching_skills) / len(required_skills)) * 100) if required_skills else 0
                        path_copy[role_level][i]["skill_match"] = match_percent
            
            # Adjust compatibility based on user skills
            all_required_skills = set()
            for role_level in ["entry_roles", "mid_roles", "advanced_roles"]:
                for role in path_copy.get(role_level, []):
                    all_required_skills.update(role.get("required_skills", []))
            
            matching_skills = all_required_skills.intersection(user_skills)
            skill_compatibility = (len(matching_skills) / len(all_required_skills)) * 100 if all_required_skills else 0
            
            # Blend original compatibility with skill compatibility
            original_compat = path_copy.get("compatibility", 50)
            path_copy["compatibility"] = round(0.7 * original_compat + 0.3 * skill_compatibility)
            
            paths[path_name] = path_copy
        
        # Sort paths by compatibility
        sorted_paths = dict(sorted(
            paths.items(),
            key=lambda item: item[1].get("compatibility", 0),
            reverse=True
        ))
        
        # Get learning paths
        learning_paths = self._generate_learning_paths(user_id, user_data, sorted_paths)
        
        return {
            "career_paths": sorted_paths,
            "learning_paths": learning_paths,
            "current_role": user_data.get("current_role", "Not specified"),
            "target_role": user_data.get("target_role", "Not specified")
        }
    
    def _generate_learning_paths(self, user_id: str, user_data: Dict[str, Any], career_paths: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate learning paths based on career paths and user data"""
        learning_paths = []
        
        # Use the top 2 career paths to generate learning paths
        top_paths = list(career_paths.items())[:2]
        
        for path_name, path_data in top_paths:
            # Find the most appropriate role level based on user data
            current_role = user_data.get("current_role", "").lower()
            years_experience = user_data.get("years_experience", 0)
            
            if years_experience < 2:
                role_level = "entry_roles"
            elif years_experience < 5:
                role_level = "mid_roles"
            else:
                role_level = "advanced_roles"
            
            # Find most compatible role in this level
            best_role = None
            best_match = 0
            
            for role in path_data.get(role_level, []):
                match = role.get("skill_match", 0)
                if match > best_match:
                    best_match = match
                    best_role = role
            
            if best_role:
                # Get skill gaps
                user_skills = set()
                if user_data and "skills" in user_data:
                    for category, skills in user_data.get("skills", {}).items():
                        user_skills.update(skills.keys())
                
                required_skills = set(best_role.get("required_skills", []))
                missing_skills = required_skills - user_skills
                
                # Create learning path
                learning_path = {
                    "path_name": f"{path_name}: {best_role.get('role')}",
                    "description": f"Path to become a {best_role.get('role')}",
                    "target_role": best_role.get("role"),
                    "required_skills": best_role.get("required_skills", []),
                    "skill_gaps": list(missing_skills),
                    "match_percentage": best_match,
                    "estimated_time": f"{len(missing_skills) * 2}-{len(missing_skills) * 4} months",
                    "recommended_resources": self._generate_learning_resources(missing_skills)
                }
                
                learning_paths.append(learning_path)
        
        return learning_paths
    
    def _generate_learning_resources(self, missing_skills: set) -> List[Dict[str, Any]]:
        """Generate recommended learning resources for missing skills"""
        resources = []
        
        skill_resource_map = {
            "Python": [
                {"name": "Python for Data Science", "type": "course", "provider": "DataCamp", "difficulty": "beginner"},
                {"name": "Python Programming", "type": "course", "provider": "Coursera", "difficulty": "beginner"}
            ],
            "SQL": [
                {"name": "SQL for Data Analysis", "type": "course", "provider": "Udacity", "difficulty": "beginner"},
                {"name": "SQL Masterclass", "type": "course", "provider": "DataCamp", "difficulty": "intermediate"}
            ],
            "Machine Learning": [
                {"name": "Machine Learning", "type": "course", "provider": "Stanford Online", "difficulty": "intermediate"},
                {"name": "Machine Learning A-Z", "type": "course", "provider": "Udemy", "difficulty": "intermediate"}
            ],
            "Deep Learning": [
                {"name": "Deep Learning Specialization", "type": "specialization", "provider": "Coursera", "difficulty": "advanced"},
                {"name": "PyTorch for Deep Learning", "type": "course", "provider": "fast.ai", "difficulty": "intermediate"}
            ],
            "Data Visualization": [
                {"name": "Data Visualization with Matplotlib and Seaborn", "type": "course", "provider": "DataCamp", "difficulty": "beginner"},
                {"name": "Tableau Training", "type": "certification", "provider": "Tableau", "difficulty": "intermediate"}
            ],
            "Cloud Computing": [
                {"name": "AWS Certified Cloud Practitioner", "type": "certification", "provider": "Amazon", "difficulty": "beginner"},
                {"name": "Google Cloud Fundamentals", "type": "course", "provider": "Google", "difficulty": "beginner"}
            ],
            "Communication": [
                {"name": "Business Communication Skills", "type": "course", "provider": "LinkedIn Learning", "difficulty": "intermediate"},
                {"name": "Technical Communication", "type": "book", "provider": "O'Reilly", "difficulty": "intermediate"}
            ],
            "Leadership": [
                {"name": "Leadership Development Program", "type": "program", "provider": "Harvard Business School", "difficulty": "advanced"},
                {"name": "Team Leadership", "type": "course", "provider": "Coursera", "difficulty": "intermediate"}
            ]
        }
        
        # Generic resources for skills not in the map
        generic_resources = [
            {"name": "Online course on Coursera", "type": "course", "provider": "Coursera", "difficulty": "varies"},
            {"name": "Tutorial on w3schools", "type": "tutorial", "provider": "w3schools", "difficulty": "beginner"},
            {"name": "Certification program", "type": "certification", "provider": "Various", "difficulty": "intermediate"}
        ]
        
        # Generate resources for each missing skill
        for skill in missing_skills:
            if skill in skill_resource_map:
                for resource in skill_resource_map[skill]:
                    resources.append({
                        "skill": skill,
                        "name": resource["name"],
                        "type": resource["type"],
                        "provider": resource["provider"],
                        "difficulty": resource["difficulty"],
                        "url": f"https://example.com/{skill.lower().replace(' ', '-')}"  # Placeholder URL
                    })
            else:
                # Use generic resource
                generic = random.choice(generic_resources)
                resources.append({
                    "skill": skill,
                    "name": f"{skill} - {generic['name']}",
                    "type": generic["type"],
                    "provider": generic["provider"],
                    "difficulty": generic["difficulty"],
                    "url": f"https://example.com/{skill.lower().replace(' ', '-')}"  # Placeholder URL
                })
        
        return resources
    
    def _get_market_insights(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get personalized market insights based on user data"""
        # Filter salary data for relevant roles
        target_role = user_data.get("target_role", "").lower()
        current_role = user_data.get("current_role", "").lower()
        
        relevant_roles = []
        for role_data in self.market_data.get("salary_data", []):
            role_name = role_data.get("role", "").lower()
            if (target_role and target_role in role_name) or (current_role and current_role in role_name):
                relevant_roles.append(role_data)
        
        # If no matches, include all roles
        if not relevant_roles:
            relevant_roles = self.market_data.get("salary_data", [])
        
        # Get user skills
        user_skills = set()
        if user_data and "skills" in user_data:
            for category, skills in user_data.get("skills", {}).items():
                user_skills.update(skills.keys())
        
        # Filter skill demand for relevant skills
        relevant_skills = []
        for skill_data in self.market_data.get("skill_demand", []):
            skill_name = skill_data.get("skill", "")
            if skill_name in user_skills or len(relevant_skills) < 5:  # Include at least 5 skills
                relevant_skills.append(skill_data)
        
        # Return personalized insights
        return {
            "salary_data": relevant_roles,
            "regional_demand": self.market_data.get("regional_demand", []),
            "skill_demand": relevant_skills,
            "industry_trends": self.market_data.get("industry_trends", {}),
            "personalized_insights": self._generate_personalized_insights(user_data)
        }
    
    def _generate_personalized_insights(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized insights based on user data"""
        insights = {
            "market_position": {
                "percentile": random.randint(60, 85),
                "explanation": "Your skills place you in a competitive position for your target roles."
            },
            "suggestions": [
                "Consider strengthening your cloud computing skills to increase marketability",
                "Roles requiring machine learning expertise command 15-20% higher salaries",
                "Adding team leadership experience can open up more senior positions"
            ],
            "salary_potential": {
                "low": random.randint(70000, 80000),
                "median": random.randint(85000, 95000),
                "high": random.randint(100000, 120000),
                "factors": ["Years of experience", "Technical skill depth", "Leadership experience"]
            }
        }
        
        # Try to use AI for more personalized insights if available
        try:
            ai_insights = generate_career_insights(user_data)
            if ai_insights:
                insights["ai_generated"] = ai_insights
        except Exception as e:
            print(f"Error generating AI insights: {e}")
        
        return insights
    
    def _generate_career_prediction(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered career trajectory prediction"""
        # Default prediction data
        prediction = {
            "predicted_roles": [
                {"role": "Junior Data Analyst", "timeline": "Current", "probability": 95, "skill_match": 85},
                {"role": "Data Analyst", "timeline": "0-1 years", "probability": 85, "skill_match": 80},
                {"role": "Senior Data Analyst", "timeline": "1-2 years", "probability": 75, "skill_match": 70},
                {"role": "Data Scientist", "timeline": "2-3 years", "probability": 65, "skill_match": 60},
                {"role": "Senior Data Scientist", "timeline": "4-5 years", "probability": 55, "skill_match": 50}
            ],
            "alternate_paths": [
                {"path": "Machine Learning Engineer", "compatibility": 80, "required_skills": ["Python", "Deep Learning", "MLOps"]},
                {"path": "Data Engineer", "compatibility": 75, "required_skills": ["SQL", "ETL", "Big Data"]},
                {"path": "Business Intelligence Analyst", "compatibility": 85, "required_skills": ["SQL", "Data Visualization", "Business Acumen"]},
                {"path": "AI Product Management", "compatibility": 70, "required_skills": ["Product Management", "AI/ML Knowledge", "Business Acumen"]},
                {"path": "Data Science", "compatibility": 80, "required_skills": ["Machine Learning", "Python", "SQL"]},
                {"path": "Data Engineering", "compatibility": 75, "required_skills": ["SQL", "ETL", "Big Data"]},
                {"path": "AI Ethics Officer", "compatibility": 60, "required_skills": ["Leadership", "AI Ethics", "Communication"]},
                {"path": "MLOps Engineer", "compatibility": 70, "required_skills": ["Python", "Machine Learning", "MLOps"]},
                {"path": "Decision Intelligence Analyst", "compatibility": 75, "required_skills": ["Machine Learning", "Python", "Data Visualization"]},
                {"path": "Data Compliance Specialist", "compatibility": 60, "required_skills": ["Data Governance", "Legal Knowledge", "Data Protection"]}
            ],
            "market_alignment": 78,
            "skill_gaps": ["Deep Learning", "Cloud Platforms", "Production ML Systems"],
            "career_velocity": 7.5  # Career progression speed on scale of 1-10
        }
        
        # Try to use AI for more personalized prediction if available
        try:
            ai_prediction = generate_career_insights(user_data, prediction_type="career_path")
            if ai_prediction and isinstance(ai_prediction, dict):
                # Merge AI prediction with default, prioritizing AI values
                for key, value in ai_prediction.items():
                    prediction[key] = value
        except Exception as e:
            print(f"Error generating AI career prediction: {e}")
        
        return prediction
    
    def update_user_activity(self, user_id: str, activity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user activity and track in gamification system"""
        # Record activity in gamification engine
        gamification = GamificationEngine(user_id)
        
        activity_type = activity_data.get("activity_type", "")
        description = activity_data.get("description", "")
        
        # Award XP based on activity type
        xp_values = {
            "view_dashboard": 5,
            "use_feature": 10,
            "complete_assessment": 25,
            "update_profile": 15,
            "share_insights": 20
        }
        
        xp_amount = xp_values.get(activity_type, 5)
        gamification.add_experience_points(user_id, xp_amount, f"Dashboard: {description}")
        
        # Update dashboard-specific stats if provided
        if "dashboard_stats" in activity_data:
            self.update_dashboard_stats(user_id, activity_data["dashboard_stats"])
        
        # Get updated user progress
        gamification_data = get_user_gamification_status(user_id)
        
        return {
            "level": gamification_data.get("current_level", 1),
            "xp": gamification_data.get("total_xp", 0),
            "xp_to_next_level": gamification_data.get("xp_to_next_level", 100),
            "badges_earned": sum(1 for badge in gamification_data.get("badges", {}).values() 
                                if badge.get("earned", False)),
            "badges_total": len(gamification_data.get("badges", {})),
            "recent_achievements": gamification_data.get("recent_achievements", [])[:5],
            "xp_earned": xp_amount
        }
    
    def update_skill_progress(self, user_id: str, skill_update: Dict[str, Any]) -> Dict[str, Any]:
        """Update skill progress for a user"""
        user_data = get_user_data(user_id)
        if not user_data:
            raise ValueError(f"User data not found for user ID: {user_id}")
        
        category = skill_update.get("category")
        skill_name = skill_update.get("skill_name")
        new_level = skill_update.get("new_level")
        
        # Initialize skills structure if needed
        if "skills" not in user_data:
            user_data["skills"] = {}
        
        if category not in user_data["skills"]:
            user_data["skills"][category] = {}
        
        # Get previous level for calculating improvement
        previous_level = 0
        if skill_name in user_data["skills"][category]:
            if isinstance(user_data["skills"][category][skill_name], dict):
                previous_level = user_data["skills"][category][skill_name].get("current", 0)
            else:
                # Handle case where skill is stored as simple value
                previous_level = user_data["skills"][category][skill_name]
        
        # Update skill with detailed structure
        if skill_name not in user_data["skills"][category]:
            user_data["skills"][category][skill_name] = {
                "current": new_level,
                "history": [new_level],
                "target": min(100, new_level + 20)  # Default target
            }
        else:
            # Convert from simple value to struct if needed
            if not isinstance(user_data["skills"][category][skill_name], dict):
                user_data["skills"][category][skill_name] = {
                    "current": user_data["skills"][category][skill_name],
                    "history": [user_data["skills"][category][skill_name]],
                    "target": min(100, user_data["skills"][category][skill_name] + 20)
                }
            
            # Update with new values
            skill_data = user_data["skills"][category][skill_name]
            skill_data["current"] = new_level
            if "history" not in skill_data:
                skill_data["history"] = []
            skill_data["history"].append(new_level)
            
            # Keep only last 10 history points
            if len(skill_data["history"]) > 10:
                skill_data["history"] = skill_data["history"][-10:]
        
        # Save updated user data
        save_user_data(user_id, user_data)
        
        # Update gamification based on skill improvement
        improvement = new_level - previous_level
        if improvement > 0:
            gamification = GamificationEngine(user_id)
            xp_earned = improvement * 2  # 2 XP per point of improvement
            gamification.add_experience_points(user_id, xp_earned, f"Improved {skill_name} skill by {improvement} points")
            
            # Check for skill-related achievements
            self._check_skill_achievements(user_id, user_data["skills"])
        
        return {
            "category": category,
            "skill_name": skill_name,
            "current_level": new_level,
            "previous_level": previous_level,
            "improvement": improvement,
            "xp_earned": improvement * 2 if improvement > 0 else 0
        }
    
    def _check_skill_achievements(self, user_id: str, skills: Dict[str, Any]) -> None:
        """Check and award skill-related achievements"""
        gamification = GamificationEngine(user_id)
        
        # Count skills at different proficiency levels
        skills_above_50 = 0
        skills_above_70 = 0
        skills_above_90 = 0
        
        for category, category_skills in skills.items():
            for skill_name, skill_data in category_skills.items():
                if isinstance(skill_data, dict):
                    skill_level = skill_data.get("current", 0)
                else:
                    skill_level = skill_data
                
                if skill_level >= 50:
                    skills_above_50 += 1
                if skill_level >= 70:
                    skills_above_70 += 1
                if skill_level >= 90:
                    skills_above_90 += 1
        
        # Award badges based on skill proficiency
        if skills_above_50 >= 3:
            gamification.award_badge(user_id, "skill_apprentice")
        if skills_above_70 >= 3:
            gamification.award_badge(user_id, "skill_professional")
        if skills_above_90 >= 1:
            gamification.award_badge(user_id, "skill_expert")
        if skills_above_90 >= 3:
            gamification.award_badge(user_id, "skill_master")
    
    def get_resume_scores(self, user_id: str) -> Dict[str, Any]:
        """Get resume score history for a user"""
        resume_data = get_resume_data(user_id)
        return self._format_resume_scores(resume_data)
    
    def get_career_paths(self, user_id: str) -> Dict[str, Any]:
        """Get career path recommendations for a user"""
        user_data = get_user_data(user_id)
        return self._get_personalized_career_paths(user_id, user_data)
    
    def get_market_insights(self, user_id: str) -> Dict[str, Any]:
        """Get market insights for a user"""
        user_data = get_user_data(user_id)
        return self._get_market_insights(user_id, user_data)
    
    def get_skill_progress(self, user_id: str) -> Dict[str, Any]:
        """Get skill progress data for a user"""
        user_data = get_user_data(user_id)
        return self._format_skill_progress(self._get_skill_progress(user_id, user_data), user_data)
    
    def get_badges(self, user_id: str) -> List[Dict[str, Any]]:
        """Get badges for a user"""
        gamification_data = get_user_gamification_status(user_id)
        return [badge for badge in gamification_data.get("badges", {}).values()]
    
    def get_leaderboard(self, count: int = 10) -> Dict[str, Any]:
        """Get global leaderboard"""
        gamification = GamificationEngine()
        leaderboard_entries = gamification.get_leaderboard(count=count)
        
        return {
            "entries": leaderboard_entries,
            "total_users": len(leaderboard_entries)
        }
    
    def get_career_prediction(self, user_id: str) -> Dict[str, Any]:
        """Get career prediction for a user"""
        user_data = get_user_data(user_id)
        return self._generate_career_prediction(user_id, user_data)
    
    def update_dashboard_stats(self, user_id: str, stats_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update dashboard usage statistics"""
        # Get user data
        user_data = get_user_data(user_id)
        if not user_data:
            raise ValueError(f"User data not found for user ID: {user_id}")
        
        # Initialize dashboard stats if not present
        if "dashboard_stats" not in user_data:
            user_data["dashboard_stats"] = {
                "dashboard_views": 0,
                "feature_usage": {},
                "last_visit": None,
                "streak_days": 0,
                "insights_viewed": False,
                "career_paths_viewed": False,
                "skill_tracking_days": 0,
                "analytics_based_decisions": 0
            }
        
        # Update dashboard views if specified
        if "dashboard_opens" in stats_data:
            user_data["dashboard_stats"]["dashboard_views"] = (
                user_data["dashboard_stats"].get("dashboard_views", 0) + stats_data["dashboard_opens"]
            )
        
        # Update feature usage
        if "feature_used" in stats_data:
            feature = stats_data["feature_used"]
            if "feature_usage" not in user_data["dashboard_stats"]:
                user_data["dashboard_stats"]["feature_usage"] = {}
            
            if feature in user_data["dashboard_stats"]["feature_usage"]:
                user_data["dashboard_stats"]["feature_usage"][feature] += 1
            else:
                user_data["dashboard_stats"]["feature_usage"][feature] = 1
        
        # Track sections viewed
        for section in stats_data.get("sections_viewed", []):
            if section == "market_insights":
                user_data["dashboard_stats"]["insights_viewed"] = True
            elif section == "career_paths":
                user_data["dashboard_stats"]["career_paths_viewed"] = True
        
        # Update streak and tracking
        today = datetime.now().date().isoformat()
        last_visit = user_data["dashboard_stats"].get("last_visit")
        
        # Check if this is a new day compared to last visit
        if last_visit != today:
            yesterday = (datetime.now() - timedelta(days=1)).date().isoformat()
            
            # If visited yesterday, increment streak
            if last_visit == yesterday:
                user_data["dashboard_stats"]["streak_days"] = user_data["dashboard_stats"].get("streak_days", 0) + 1
                
                # Skill tracking days only increases with consecutive daily visits
                if "skill_tracking" in stats_data.get("sections_viewed", []):
                    user_data["dashboard_stats"]["skill_tracking_days"] = (
                        user_data["dashboard_stats"].get("skill_tracking_days", 0) + 1
                    )
            else:
                # Reset streak if not consecutive
                user_data["dashboard_stats"]["streak_days"] = 1
        
        # Update last visit
        user_data["dashboard_stats"]["last_visit"] = today
        
        # Save updated user data
        save_user_data(user_id, user_data)
        
        # Check for dashboard-related achievements
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "dashboard_interaction",
            "description": "Used dashboard features",
            "dashboard_stats": user_data["dashboard_stats"]
        })
        
        return user_data["dashboard_stats"]