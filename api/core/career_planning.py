"""
Career planning core functionality.
"""

import logging
from typing import List, Dict, Any, Optional


logger = logging.getLogger(__name__)


class CareerPlanner:
    """
    Career planning service for generating career paths, 
    recommendations, and professional development plans.
    """
    
    def __init__(self):
        """Initialize the career planner."""
        logger.info("Initializing CareerPlanner")
        
        # Sample career paths for demo purposes
        self.sample_career_paths = {
            "software_engineer": {
                "title": "Software Engineer",
                "description": "Career path for software engineering professionals",
                "levels": [
                    {
                        "title": "Junior Software Engineer",
                        "years_experience": "0-2",
                        "skills": ["Programming Basics", "Version Control", "Testing"],
                        "typical_salary": "$60,000 - $85,000"
                    },
                    {
                        "title": "Software Engineer",
                        "years_experience": "2-5",
                        "skills": ["Advanced Programming", "System Design", "DevOps Basics"],
                        "typical_salary": "$85,000 - $120,000"
                    },
                    {
                        "title": "Senior Software Engineer",
                        "years_experience": "5-8",
                        "skills": ["Architecture", "Team Leadership", "Performance Optimization"],
                        "typical_salary": "$120,000 - $160,000"
                    },
                    {
                        "title": "Principal Engineer / Architect",
                        "years_experience": "8+",
                        "skills": ["System Architecture", "Strategic Planning", "Cross-team Coordination"],
                        "typical_salary": "$160,000 - $220,000+"
                    }
                ]
            },
            "data_scientist": {
                "title": "Data Scientist",
                "description": "Career path for data science professionals",
                "levels": [
                    {
                        "title": "Junior Data Scientist",
                        "years_experience": "0-2",
                        "skills": ["Statistics", "Python/R", "Data Visualization"],
                        "typical_salary": "$70,000 - $90,000"
                    },
                    {
                        "title": "Data Scientist",
                        "years_experience": "2-5",
                        "skills": ["Machine Learning", "Big Data Technologies", "Domain Expertise"],
                        "typical_salary": "$90,000 - $130,000"
                    },
                    {
                        "title": "Senior Data Scientist",
                        "years_experience": "5-8",
                        "skills": ["Advanced ML", "Research", "Team Leadership"],
                        "typical_salary": "$130,000 - $170,000"
                    },
                    {
                        "title": "Principal Data Scientist / ML Architect",
                        "years_experience": "8+",
                        "skills": ["AI Strategy", "Research Direction", "Business Impact"],
                        "typical_salary": "$170,000 - $250,000+"
                    }
                ]
            }
        }
    
    def get_career_path(self, path_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a career path by ID.
        
        Args:
            path_id: The ID of the career path
            
        Returns:
            Career path data or None if not found
        """
        return self.sample_career_paths.get(path_id)
    
    def list_available_paths(self) -> List[Dict[str, Any]]:
        """
        List all available career paths.
        
        Returns:
            List of career path summaries
        """
        return [
            {"id": k, "title": v["title"], "description": v["description"]}
            for k, v in self.sample_career_paths.items()
        ]
    
    def recommend_paths(self, user_skills: List[str], 
                       user_interests: List[str], 
                       user_experience: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Recommend career paths based on user profile.
        
        Args:
            user_skills: List of user skills
            user_interests: List of user interests
            user_experience: Years of experience (optional)
            
        Returns:
            List of recommended career paths with match scores
        """
        # In a real implementation, this would use ML/AI to match user to careers
        # For demo, just return sample recommendations
        recommendations = []
        
        for path_id, path in self.sample_career_paths.items():
            # Calculate a mock match score
            match_score = 0.5  # Base score
            
            # Add to recommendations
            recommendations.append({
                "id": path_id,
                "title": path["title"],
                "description": path["description"],
                "match_score": match_score,
                "next_level": path["levels"][0] if path["levels"] else None
            })
        
        # Sort by match score
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        return recommendations
    
    def create_development_plan(self, user_id: str, 
                               current_skills: List[str],
                               target_career: str,
                               target_level: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a personalized development plan.
        
        Args:
            user_id: User ID
            current_skills: User's current skills
            target_career: Target career path ID
            target_level: Target career level (optional)
            
        Returns:
            Development plan
        """
        # Get the career path
        career_path = self.sample_career_paths.get(target_career)
        if not career_path:
            return {"error": "Career path not found"}
        
        # Find the appropriate level (first level if not specified)
        target_level_data = career_path["levels"][0]
        if target_level:
            for level in career_path["levels"]:
                if level["title"].lower() == target_level.lower():
                    target_level_data = level
                    break
        
        # Calculate skills gap
        required_skills = target_level_data["skills"]
        skills_gap = [skill for skill in required_skills if skill not in current_skills]
        
        # Create development plan
        plan = {
            "user_id": user_id,
            "target_career": career_path["title"],
            "target_level": target_level_data["title"],
            "current_skills": current_skills,
            "required_skills": required_skills,
            "skills_gap": skills_gap,
            "estimated_timeline": f"{len(skills_gap) * 3} months",
            "recommended_resources": [
                {"type": "course", "name": f"Learn {skill}", "url": f"https://example.com/courses/{skill.lower().replace(' ', '-')}"}
                for skill in skills_gap
            ]
        }
        
        return plan 