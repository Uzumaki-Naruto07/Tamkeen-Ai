"""
User profiling functionality for TamkeenAI.
"""

import logging
import random
from typing import Dict, List, Any, Optional

# Setup logger
logger = logging.getLogger(__name__)


class UserProfiler:
    """
    Service for analyzing user profiles, extracting skills, and generating insights.
    """
    
    def __init__(self):
        """Initialize the user profiler."""
        logger.info("Initializing UserProfiler")
        
        # Sample skills data
        self.skill_categories = {
            "technical": [
                "Python", "JavaScript", "Java", "C++", "C#", "Ruby", "Go", "PHP", "Swift",
                "SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "AWS", "Azure", "GCP",
                "Docker", "Kubernetes", "React", "Angular", "Vue", "Node.js", "Django", "Flask",
                "TensorFlow", "PyTorch", "Machine Learning", "AI", "Data Science", "Big Data",
                "Blockchain", "IoT", "Mobile Development", "Web Development", "DevOps", "Testing"
            ],
            "soft": [
                "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
                "Leadership", "Time Management", "Adaptability", "Creativity", "Emotional Intelligence",
                "Conflict Resolution", "Negotiation", "Presentation", "Public Speaking",
                "Writing", "Decision Making", "Project Management", "Work Ethic",
                "Attention to Detail", "Stress Management", "Active Listening"
            ],
            "business": [
                "Marketing", "Sales", "Finance", "Accounting", "Management", "Strategy",
                "Business Analysis", "Product Management", "Customer Service", "Operations",
                "Supply Chain", "Human Resources", "Recruitment", "Training", "Consulting",
                "Market Research", "Business Development", "Entrepreneurship", "E-commerce", "SEO"
            ]
        }
    
    def extract_skills_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract skills from text using NLP.
        
        Args:
            text: Text to extract skills from
            
        Returns:
            List of extracted skills with confidence scores
        """
        # In a real implementation, this would use NLP to extract skills
        # For demo, just find matches with the skill list
        
        # Normalize text
        normalized_text = text.lower()
        
        # Extract skills
        extracted_skills = []
        
        # Check for each skill in each category
        for category, skills in self.skill_categories.items():
            for skill in skills:
                if skill.lower() in normalized_text:
                    # Mock confidence score between 0.7 and 1.0
                    confidence = round(random.uniform(0.7, 1.0), 2)
                    
                    extracted_skills.append({
                        "name": skill,
                        "category": category,
                        "confidence": confidence
                    })
        
        # Sort by confidence score
        extracted_skills.sort(key=lambda x: x["confidence"], reverse=True)
        
        return extracted_skills
    
    def extract_skills_from_resume(self, resume_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract skills from a resume.
        
        Args:
            resume_data: Resume data to extract skills from
            
        Returns:
            List of extracted skills with confidence scores
        """
        skills = []
        
        # Extract from content fields
        if "content" in resume_data:
            content = resume_data["content"]
            
            # Extract from summary
            if "summary" in content:
                summary_skills = self.extract_skills_from_text(content["summary"])
                skills.extend(summary_skills)
            
            # Extract from experience
            if "experience" in content:
                for exp in content["experience"]:
                    description = exp.get("description", "")
                    exp_skills = self.extract_skills_from_text(description)
                    skills.extend(exp_skills)
            
            # Extract from education
            if "education" in content:
                for edu in content["education"]:
                    description = edu.get("description", "")
                    edu_skills = self.extract_skills_from_text(description)
                    skills.extend(edu_skills)
        
        # Deduplicate skills
        unique_skills = {}
        for skill in skills:
            skill_name = skill["name"]
            if skill_name not in unique_skills or skill["confidence"] > unique_skills[skill_name]["confidence"]:
                unique_skills[skill_name] = skill
        
        # Convert back to list and sort
        result = list(unique_skills.values())
        result.sort(key=lambda x: x["confidence"], reverse=True)
        
        return result
    
    def recommend_skills(self, user_id: str, existing_skills: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Recommend skills for a user based on their existing skills.
        
        Args:
            user_id: User ID
            existing_skills: List of existing user skills
            
        Returns:
            List of recommended skills with relevance scores
        """
        # In a real implementation, this would use ML to recommend skills
        # For demo, use a simple rule-based approach
        
        if not existing_skills:
            existing_skills = []
        
        # Convert to lowercase for matching
        existing_skills_lower = [s.lower() for s in existing_skills]
        
        # Define skill relationships (simple adjacency list)
        skill_relationships = {
            "python": ["django", "flask", "machine learning", "data science", "tensorflow", "pytorch"],
            "javascript": ["react", "angular", "vue", "node.js", "typescript"],
            "java": ["spring", "hibernate", "android development"],
            "communication": ["presentation", "public speaking", "writing", "active listening"],
            "leadership": ["management", "team management", "conflict resolution", "decision making"],
            "marketing": ["digital marketing", "content marketing", "seo", "social media"],
            "data science": ["machine learning", "statistics", "python", "r", "data visualization"],
            "web development": ["html", "css", "javascript", "react", "node.js"]
        }
        
        # Collect recommendations
        recommendations = []
        
        # Check for each existing skill
        for skill in existing_skills:
            skill_lower = skill.lower()
            
            # Get related skills
            related_skills = skill_relationships.get(skill_lower, [])
            
            for related in related_skills:
                # Skip if already in existing skills
                if related.lower() in existing_skills_lower:
                    continue
                
                # Generate relevance score
                relevance = round(random.uniform(0.6, 0.95), 2)
                
                # Add to recommendations
                recommendations.append({
                    "name": related.title(),
                    "relevance": relevance,
                    "based_on": [skill]
                })
        
        # Add some general recommendations
        general_recommendations = [
            "Communication", "Problem Solving", "Project Management", 
            "Python", "JavaScript", "SQL", "Leadership", "Critical Thinking",
            "Time Management", "Teamwork"
        ]
        
        for skill in general_recommendations:
            # Skip if already in existing skills or recommendations
            if skill.lower() in existing_skills_lower or skill.lower() in [r["name"].lower() for r in recommendations]:
                continue
            
            # Generate relevance score (lower than skill-based recommendations)
            relevance = round(random.uniform(0.4, 0.7), 2)
            
            # Add to recommendations
            recommendations.append({
                "name": skill,
                "relevance": relevance,
                "based_on": ["General Recommendation"]
            })
        
        # Sort by relevance
        recommendations.sort(key=lambda x: x["relevance"], reverse=True)
        
        # Limit to top 10
        return recommendations[:10]
    
    def analyze_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a user profile and generate insights.
        
        Args:
            user_data: User profile data
            
        Returns:
            Profile analysis
        """
        # In a real implementation, this would use ML to analyze the profile
        # For demo, generate mock insights
        
        # Extract profile data
        profile = user_data.get("profile", {})
        skills = profile.get("skills", [])
        experience = profile.get("experience", [])
        education = profile.get("education", [])
        
        # Calculate profile completeness
        completeness_factors = {
            "basic_info": 0.2,
            "skills": 0.3,
            "experience": 0.3,
            "education": 0.2
        }
        
        completeness_scores = {
            "basic_info": 1.0 if profile.get("full_name") and profile.get("location") else 0.5,
            "skills": min(1.0, len(skills) / 5),  # At least 5 skills for full score
            "experience": min(1.0, len(experience) / 2),  # At least 2 experiences for full score
            "education": min(1.0, len(education) / 1)  # At least 1 education for full score
        }
        
        profile_completeness = sum(completeness_factors[k] * completeness_scores[k] for k in completeness_factors)
        
        # Categorize skills
        skill_categories = {
            "technical": 0,
            "soft": 0,
            "business": 0
        }
        
        for skill in skills:
            for category, category_skills in self.skill_categories.items():
                if skill in category_skills:
                    skill_categories[category] += 1
                    break
        
        # Calculate skill diversity score
        total_skills = sum(skill_categories.values())
        skill_diversity = 0
        
        if total_skills > 0:
            max_category = max(skill_categories.values())
            skill_diversity = 1 - (max_category / total_skills) if total_skills > 0 else 0
        
        # Generate insights and recommendations
        insights = []
        
        if profile_completeness < 0.7:
            insights.append({
                "type": "improvement",
                "message": "Your profile completeness is below 70%. Complete your profile to improve visibility.",
                "action": "Complete profile",
                "priority": "high"
            })
        
        if skill_categories["technical"] < 3:
            insights.append({
                "type": "skill_gap",
                "message": "You have fewer than 3 technical skills. Consider adding more technical skills.",
                "action": "Add technical skills",
                "priority": "medium"
            })
        
        if skill_categories["soft"] < 2:
            insights.append({
                "type": "skill_gap",
                "message": "You have fewer than 2 soft skills. Soft skills are important for career growth.",
                "action": "Add soft skills",
                "priority": "medium"
            })
        
        # Return analysis
        return {
            "user_id": user_data.get("id", ""),
            "profile_completeness": round(profile_completeness * 100, 1),
            "skill_count": total_skills,
            "skill_categories": skill_categories,
            "skill_diversity": round(skill_diversity * 100, 1),
            "insights": insights,
            "recommended_actions": [insight["action"] for insight in insights]
        } 