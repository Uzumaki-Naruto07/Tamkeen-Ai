"""
Job Recommendation Engine Module

This module provides functionality for recommending jobs to users based on their
profile, skills, experience, and other factors.
"""

import os
import json
import logging
import random
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import utilities
from backend.utils.preprocess import (
    clean_text, normalize_skill, extract_skills_from_text,
    normalize_job_title, extract_education_from_text,
    extract_experience_from_text
)
from backend.utils.cache_utils import cache_result

# Try to import optional dependencies
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("scikit-learn not installed. Advanced recommendations will be unavailable. Install with: pip install scikit-learn")

# Setup logger
logger = logging.getLogger(__name__)


class JobRecommender:
    """Job recommendation engine class"""
    
    def __init__(self):
        """Initialize job recommender"""
        # Initialize TF-IDF vectorizer if scikit-learn is available
        if SKLEARN_AVAILABLE:
            self.vectorizer = TfidfVectorizer(
                stop_words='english',
                min_df=2,
                max_df=0.85,
                ngram_range=(1, 2)
            )
        else:
            self.vectorizer = None
    
    def recommend_jobs_for_user(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Recommend jobs for a user
        
        Args:
            user_id: User ID
            limit: Maximum number of recommendations
            
        Returns:
            list: Recommended jobs
        """
        try:
            # Import models here to avoid circular imports
            from backend.database.models import User, Job, UserActivity
            
            # Get user
            users = User.find_by_id(user_id)
            
            if not users:
                logger.error(f"User not found: {user_id}")
                return []
            
            user = users[0]
            profile = user.profile
            
            # Get user activities
            activities = UserActivity.find_by_user_id(user_id)
            
            # Get user skills
            if profile and "skills" in profile:
                user_skills = profile["skills"]
            else:
                user_skills = []
            
            # Get user job titles
            user_job_titles = []
            if profile and "experience" in profile:
                for exp in profile["experience"]:
                    if "title" in exp:
                        user_job_titles.append(normalize_job_title(exp["title"]))
            
            # Get active jobs
            jobs = Job.find_active_jobs()
            job_dicts = [job.to_dict() for job in jobs]
            
            # Generate recommendations
            if SKLEARN_AVAILABLE and len(user_skills) > 0:
                # Use content-based filtering
                recommendations = self._content_based_recommendations(
                    job_dicts, user_skills, user_job_titles, limit
                )
            else:
                # Fall back to simple matching
                recommendations = self._simple_recommendations(
                    job_dicts, user_skills, user_job_titles, limit
                )
            
            # Record recommendation
            UserActivity.record_activity(
                user_id=user_id,
                activity_type="job_recommendations",
                activity_data={"count": len(recommendations)}
            )
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error recommending jobs for user: {str(e)}")
            return []
    
    def recommend_similar_jobs(self, job_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Recommend similar jobs
        
        Args:
            job_id: Job ID
            limit: Maximum number of recommendations
            
        Returns:
            list: Similar jobs
        """
        try:
            # Import models here to avoid circular imports
            from backend.database.models import Job
            
            # Get job
            jobs = Job.find_by_id(job_id)
            
            if not jobs:
                logger.error(f"Job not found: {job_id}")
                return []
            
            job = jobs[0].to_dict()
            
            # Get active jobs
            all_jobs = Job.find_active_jobs()
            job_dicts = [j.to_dict() for j in all_jobs if j.id != job_id]
            
            # Generate recommendations
            if SKLEARN_AVAILABLE:
                # Use content-based filtering
                recommendations = self._find_similar_jobs(job, job_dicts, limit)
            else:
                # Fall back to simple matching
                recommendations = self._simple_similar_jobs(job, job_dicts, limit)
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error recommending similar jobs: {str(e)}")
            return []
    
    def get_career_path(self, current_job: str, years_experience: int) -> List[Dict[str, Any]]:
        """
        Get career path from current job
        
        Args:
            current_job: Current job title
            years_experience: Years of experience
            
        Returns:
            list: Career path
        """
        try:
            # Import models here to avoid circular imports
            from backend.database.models import Job, CareerPath
            
            # Normalize job title
            normalized_job = normalize_job_title(current_job)
            
            # Get career paths for this job
            paths = CareerPath.find_by_job_title(normalized_job)
            
            if not paths or len(paths) == 0:
                # Fallback to generated path
                return self._generate_career_path(current_job, years_experience)
            
            # Get most relevant path based on experience
            path = paths[0]
            
            # Convert path to list of job steps
            path_data = path.path_data
            
            # Adjust starting point based on experience
            experience_level = self._map_experience_to_level(years_experience)
            
            # Find starting point in path
            start_index = 0
            for i, step in enumerate(path_data):
                if step.get("level") == experience_level:
                    start_index = i
                    break
            
            # Return path from current position forward
            return path_data[start_index:]
        
        except Exception as e:
            logger.error(f"Error getting career path: {str(e)}")
            return self._generate_career_path(current_job, years_experience)
    
    def get_personalized_skill_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get personalized skill recommendations
        
        Args:
            user_id: User ID
            
        Returns:
            list: Recommended skills
        """
        try:
            # Import models here to avoid circular imports
            from backend.database.models import User, Job, UserActivity
            
            # Get user
            users = User.find_by_id(user_id)
            
            if not users:
                logger.error(f"User not found: {user_id}")
                return []
            
            user = users[0]
            profile = user.profile
            
            # Get user skills
            if profile and "skills" in profile:
                user_skills = profile["skills"]
            else:
                user_skills = []
            
            # Get user job titles
            user_job_titles = []
            if profile and "experience" in profile:
                for exp in profile["experience"]:
                    if "title" in exp:
                        user_job_titles.append(normalize_job_title(exp["title"]))
            
            # Get skill recommendations based on job roles
            role_skills = self._get_skills_for_roles(user_job_titles)
            
            # Get skill recommendations based on career progression
            career_skills = self._get_career_progression_skills(user_job_titles, user_skills)
            
            # Get trending skills
            from backend.core.job_market_insights import get_trending_skills
            industry = profile.get("industry") if profile else None
            location = profile.get("location") if profile else None
            trending_skills = get_trending_skills(industry, location, 5)
            
            # Combine recommendations
            recommendations = []
            
            # Add missing role skills first
            for skill in role_skills:
                if skill["name"] not in user_skills:
                    skill["reason"] = "Common skill for your role"
                    recommendations.append(skill)
            
            # Add career progression skills
            for skill in career_skills:
                if skill["name"] not in user_skills and skill["name"] not in [r["name"] for r in recommendations]:
                    skill["reason"] = "Important for career advancement"
                    recommendations.append(skill)
            
            # Add trending skills
            for skill in trending_skills:
                if skill["name"] not in user_skills and skill["name"] not in [r["name"] for r in recommendations]:
                    skill["reason"] = "Trending in the job market"
                    recommendations.append(skill)
            
            # Record recommendation
            UserActivity.record_activity(
                user_id=user_id,
                activity_type="skill_recommendations",
                activity_data={"count": len(recommendations)}
            )
            
            return recommendations[:10]  # Return top 10
        
        except Exception as e:
            logger.error(f"Error getting skill recommendations: {str(e)}")
            return []
    
    def _content_based_recommendations(self, jobs, user_skills, user_job_titles, limit):
        """Generate content-based job recommendations"""
        try:
            if not jobs:
                return []
            
            # Create job texts for vectorization
            job_texts = []
            for job in jobs:
                # Combine relevant fields
                job_text = f"{job.get('title', '')} {job.get('description', '')} "
                job_text += f"{' '.join(job.get('skills', []))} "
                job_text += f"{job.get('company', '')} {job.get('location', '')}"
                job_texts.append(job_text.lower())
            
            # Create user profile text
            user_text = f"{' '.join(user_job_titles)} {' '.join(user_skills)}"
            
            # Add user text to corpus
            all_texts = job_texts + [user_text]
            
            # Transform texts to TF-IDF features
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            
            # Calculate similarity between user profile and jobs
            user_vector = tfidf_matrix[-1]
            job_vectors = tfidf_matrix[:-1]
            
            # Calculate cosine similarity
            cosine_similarities = cosine_similarity(user_vector, job_vectors).flatten()
            
            # Get top job indices
            top_indices = cosine_similarities.argsort()[-limit:][::-1]
            
            # Create recommendation results
            recommendations = []
            for idx in top_indices:
                if cosine_similarities[idx] > 0:
                    job = jobs[idx]
                    recommendations.append({
                        "job": job,
                        "score": float(cosine_similarities[idx]),
                        "match_reason": self._get_match_reason(job, user_skills, user_job_titles)
                    })
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error in content-based recommendations: {str(e)}")
            return self._simple_recommendations(jobs, user_skills, user_job_titles, limit)
    
    def _simple_recommendations(self, jobs, user_skills, user_job_titles, limit):
        """Generate simple job recommendations"""
        try:
            if not jobs:
                return []
            
            scored_jobs = []
            
            for job in jobs:
                score = 0
                job_skills = job.get('skills', [])
                job_title = job.get('title', '')
                
                # Score based on skill match
                for skill in user_skills:
                    if skill.lower() in [s.lower() for s in job_skills]:
                        score += 1
                
                # Score based on title similarity
                for title in user_job_titles:
                    if title.lower() in job_title.lower() or job_title.lower() in title.lower():
                        score += 2
                
                # Add job and score
                if score > 0:
                    scored_jobs.append((job, score))
            
            # Sort by score
            scored_jobs.sort(key=lambda x: x[1], reverse=True)
            
            # Get top jobs
            recommendations = []
            for job, score in scored_jobs[:limit]:
                recommendations.append({
                    "job": job,
                    "score": score / max(len(user_skills), 1),
                    "match_reason": self._get_match_reason(job, user_skills, user_job_titles)
                })
            
            # Add some randomness if needed
            if len(recommendations) < limit:
                remaining = limit - len(recommendations)
                random_jobs = [j for j in jobs if j not in [r["job"] for r in recommendations]]
                
                if random_jobs:
                    random.shuffle(random_jobs)
                    for job in random_jobs[:remaining]:
                        recommendations.append({
                            "job": job,
                            "score": 0.1,
                            "match_reason": "You might find this interesting"
                        })
            
            return recommendations
        
        except Exception as e:
            logger.error(f"Error in simple recommendations: {str(e)}")
            return []
    
    def _find_similar_jobs(self, job, other_jobs, limit):
        """Find similar jobs using content-based filtering"""
        try:
            if not other_jobs:
                return []
            
            # Create job texts for vectorization
            job_texts = []
            for other_job in other_jobs:
                # Combine relevant fields
                job_text = f"{other_job.get('title', '')} {other_job.get('description', '')} "
                job_text += f"{' '.join(other_job.get('skills', []))} "
                job_text += f"{other_job.get('company', '')} {other_job.get('location', '')}"
                job_texts.append(job_text.lower())
            
            # Create target job text
            target_job_text = f"{job.get('title', '')} {job.get('description', '')} "
            target_job_text += f"{' '.join(job.get('skills', []))} "
            target_job_text += f"{job.get('company', '')} {job.get('location', '')}"
            
            # Add target job text to corpus
            all_texts = job_texts + [target_job_text]
            
            # Transform texts to TF-IDF features
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            
            # Calculate similarity between target job and other jobs
            target_vector = tfidf_matrix[-1]
            other_vectors = tfidf_matrix[:-1]
            
            # Calculate cosine similarity
            cosine_similarities = cosine_similarity(target_vector, other_vectors).flatten()
            
            # Get top job indices
            top_indices = cosine_similarities.argsort()[-limit:][::-1]
            
            # Create similar jobs results
            similar_jobs = []
            for idx in top_indices:
                if cosine_similarities[idx] > 0:
                    similar_job = other_jobs[idx]
                    similar_jobs.append({
                        "job": similar_job,
                        "similarity_score": float(cosine_similarities[idx]),
                        "common_skills": self._get_common_skills(job.get('skills', []), similar_job.get('skills', []))
                    })
            
            return similar_jobs
        
        except Exception as e:
            logger.error(f"Error finding similar jobs: {str(e)}")
            return self._simple_similar_jobs(job, other_jobs, limit)
    
    def _simple_similar_jobs(self, job, other_jobs, limit):
        """Find similar jobs using simple matching"""
        try:
            if not other_jobs:
                return []
            
            scored_jobs = []
            job_skills = job.get('skills', [])
            job_title = job.get('title', '')
            
            for other_job in other_jobs:
                score = 0
                other_skills = other_job.get('skills', [])
                other_title = other_job.get('title', '')
                
                # Score based on skill match
                common_skills = self._get_common_skills(job_skills, other_skills)
                score += len(common_skills)
                
                # Score based on title similarity
                if job_title.lower() in other_title.lower() or other_title.lower() in job_title.lower():
                    score += 2
                
                # Add job and score
                if score > 0:
                    scored_jobs.append((other_job, score, common_skills))
            
            # Sort by score
            scored_jobs.sort(key=lambda x: x[1], reverse=True)
            
            # Get top jobs
            similar_jobs = []
            for other_job, score, common_skills in scored_jobs[:limit]:
                similar_jobs.append({
                    "job": other_job,
                    "similarity_score": score / max(len(job_skills), 1),
                    "common_skills": common_skills
                })
            
            return similar_jobs
        
        except Exception as e:
            logger.error(f"Error in simple similar jobs: {str(e)}")
            return []
    
    def _get_match_reason(self, job, user_skills, user_job_titles):
        """Generate a personalized match reason"""
        # Check for skill match
        job_skills = job.get('skills', [])
        matching_skills = self._get_common_skills(user_skills, job_skills)
        
        if matching_skills:
            if len(matching_skills) > 1:
                return f"Matches your skills: {', '.join(matching_skills[:2])}"
            else:
                return f"Matches your skill: {matching_skills[0]}"
        
        # Check for title match
        job_title = job.get('title', '')
        for title in user_job_titles:
            if title.lower() in job_title.lower():
                return f"Related to your experience as {title}"
        
        # Default reason
        return "Recommended based on your profile"
    
    def _get_common_skills(self, skills1, skills2):
        """Get common skills between two skill lists"""
        skills1_lower = [s.lower() for s in skills1]
        skills2_lower = [s.lower() for s in skills2]
        
        common_indices = [i for i, s in enumerate(skills1_lower) if s in skills2_lower]
        common_skills = [skills1[i] for i in common_indices]
        
        return common_skills
    
    def _generate_career_path(self, current_job, years_experience):
        """Generate a career path recommendation"""
        # This would use more sophisticated techniques in a real system
        # Here we use a simplified approach for demonstration
        
        # Map job titles to career paths
        career_paths = {
            "software engineer": [
                {"title": "Junior Software Engineer", "level": "entry", "years": "0-2", "skills_needed": ["Programming", "Data Structures"]},
                {"title": "Software Engineer", "level": "mid", "years": "2-5", "skills_needed": ["System Design", "Testing"]},
                {"title": "Senior Software Engineer", "level": "senior", "years": "5-8", "skills_needed": ["Architecture", "Mentoring"]},
                {"title": "Lead Software Engineer", "level": "lead", "years": "8-12", "skills_needed": ["Project Management", "Team Leadership"]},
                {"title": "Software Architect", "level": "architect", "years": "12+", "skills_needed": ["Enterprise Architecture", "Technical Strategy"]}
            ],
            "data scientist": [
                {"title": "Junior Data Scientist", "level": "entry", "years": "0-2", "skills_needed": ["Statistics", "Python"]},
                {"title": "Data Scientist", "level": "mid", "years": "2-5", "skills_needed": ["Machine Learning", "Data Visualization"]},
                {"title": "Senior Data Scientist", "level": "senior", "years": "5-8", "skills_needed": ["Advanced ML", "Research"]},
                {"title": "Lead Data Scientist", "level": "lead", "years": "8-12", "skills_needed": ["Team Leadership", "Strategic Analysis"]},
                {"title": "Chief Data Scientist", "level": "executive", "years": "12+", "skills_needed": ["Executive Communication", "Business Strategy"]}
            ],
            "marketing": [
                {"title": "Marketing Assistant", "level": "entry", "years": "0-2", "skills_needed": ["Communication", "Social Media"]},
                {"title": "Marketing Specialist", "level": "mid", "years": "2-5", "skills_needed": ["Campaign Management", "Analytics"]},
                {"title": "Marketing Manager", "level": "senior", "years": "5-8", "skills_needed": ["Strategy", "Team Management"]},
                {"title": "Marketing Director", "level": "director", "years": "8-12", "skills_needed": ["Budget Management", "Cross-functional Leadership"]},
                {"title": "CMO", "level": "executive", "years": "12+", "skills_needed": ["Executive Leadership", "Business Strategy"]}
            ]
        }
        
        # Find matching career path
        normalized_job = normalize_job_title(current_job).lower()
        matched_path = None
        
        for key, path in career_paths.items():
            if key in normalized_job or normalized_job in key:
                matched_path = path
                break
        
        # Use default path if no match
        if not matched_path:
            matched_path = career_paths["software engineer"]
        
        # Determine current level based on experience
        experience_level = self._map_experience_to_level(years_experience)
        
        # Find starting point in path
        start_index = 0
        for i, step in enumerate(matched_path):
            if step["level"] == experience_level:
                start_index = i
                break
        
        # Return path from current position forward
        return matched_path[start_index:]
    
    def _map_experience_to_level(self, years_experience):
        """Map years of experience to career level"""
        if years_experience < 2:
            return "entry"
        elif years_experience < 5:
            return "mid"
        elif years_experience < 8:
            return "senior"
        elif years_experience < 12:
            return "lead"
        else:
            return "executive"
    
    def _get_skills_for_roles(self, job_titles):
        """Get recommended skills for job roles"""
        # This would use more sophisticated techniques in a real system
        
        # Define skills by role
        role_skills = {
            "software engineer": [
                {"name": "JavaScript", "importance": "high", "demand": "high"},
                {"name": "Python", "importance": "high", "demand": "high"},
                {"name": "Docker", "importance": "medium", "demand": "high"},
                {"name": "Kubernetes", "importance": "medium", "demand": "high"},
                {"name": "CI/CD", "importance": "medium", "demand": "high"}
            ],
            "data scientist": [
                {"name": "Python", "importance": "high", "demand": "high"},
                {"name": "Machine Learning", "importance": "high", "demand": "high"},
                {"name": "SQL", "importance": "high", "demand": "high"},
                {"name": "Data Visualization", "importance": "medium", "demand": "high"},
                {"name": "Big Data", "importance": "medium", "demand": "high"}
            ],
            "product manager": [
                {"name": "Agile", "importance": "high", "demand": "high"},
                {"name": "Product Strategy", "importance": "high", "demand": "high"},
                {"name": "User Research", "importance": "high", "demand": "medium"},
                {"name": "Analytics", "importance": "medium", "demand": "high"},
                {"name": "Roadmapping", "importance": "medium", "demand": "medium"}
            ]
        }
        
        # Find matching skills
        recommended_skills = []
        
        for title in job_titles:
            normalized_title = normalize_job_title(title).lower()
            
            for role, skills in role_skills.items():
                if role in normalized_title or normalized_title in role:
                    for skill in skills:
                        if skill not in recommended_skills:
                            recommended_skills.append(skill)
        
        return recommended_skills
    
    def _get_career_progression_skills(self, job_titles, current_skills):
        """Get skills needed for career progression"""
        # This would use more sophisticated techniques in a real system
        
        # Define progression skills by role and level
        progression_skills = {
            "software engineer": {
                "entry_to_mid": [
                    {"name": "System Design", "importance": "high", "demand": "high"},
                    {"name": "Testing", "importance": "high", "demand": "medium"},
                    {"name": "CI/CD", "importance": "medium", "demand": "high"}
                ],
                "mid_to_senior": [
                    {"name": "Architecture", "importance": "high", "demand": "high"},
                    {"name": "Mentoring", "importance": "high", "demand": "medium"},
                    {"name": "Performance Optimization", "importance": "medium", "demand": "medium"}
                ],
                "senior_to_lead": [
                    {"name": "Project Management", "importance": "high", "demand": "high"},
                    {"name": "Team Leadership", "importance": "high", "demand": "high"},
                    {"name": "Technical Strategy", "importance": "high", "demand": "medium"}
                ]
            },
            "data scientist": {
                "entry_to_mid": [
                    {"name": "Machine Learning", "importance": "high", "demand": "high"},
                    {"name": "Data Visualization", "importance": "high", "demand": "high"},
                    {"name": "Feature Engineering", "importance": "medium", "demand": "high"}
                ],
                "mid_to_senior": [
                    {"name": "Advanced ML", "importance": "high", "demand": "high"},
                    {"name": "Research", "importance": "high", "demand": "medium"},
                    {"name": "MLOps", "importance": "medium", "demand": "high"}
                ],
                "senior_to_lead": [
                    {"name": "Team Leadership", "importance": "high", "demand": "high"},
                    {"name": "Strategic Analysis", "importance": "high", "demand": "medium"},
                    {"name": "Business Acumen", "importance": "high", "demand": "high"}
                ]
            }
        }
        
        # Find matching progression skills
        recommended_skills = []
        
        for title in job_titles:
            normalized_title = normalize_job_title(title).lower()
            
            for role, levels in progression_skills.items():
                if role in normalized_title or normalized_title in role:
                    # Choose level based on current skills
                    level_key = "entry_to_mid"  # Default
                    
                    if len(current_skills) >= 10:
                        level_key = "senior_to_lead"
                    elif len(current_skills) >= 5:
                        level_key = "mid_to_senior"
                    
                    # Add skills for this level
                    if level_key in levels:
                        for skill in levels[level_key]:
                            if skill not in recommended_skills:
                                recommended_skills.append(skill)
        
        return recommended_skills


# Exported functions

@cache_result(expires=3600)  # Cache for 1 hour
def recommend_jobs(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Recommend jobs for a user
    
    Args:
        user_id: User ID
        limit: Maximum number of recommendations
        
    Returns:
        list: Recommended jobs
    """
    recommender = JobRecommender()
    return recommender.recommend_jobs_for_user(user_id, limit)


@cache_result(expires=3600)  # Cache for 1 hour
def recommend_similar_jobs(job_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Recommend similar jobs
    
    Args:
        job_id: Job ID
        limit: Maximum number of recommendations
        
    Returns:
        list: Similar jobs
    """
    recommender = JobRecommender()
    return recommender.recommend_similar_jobs(job_id, limit)


def recommend_job_search_strategy(user_id: str) -> Dict[str, Any]:
    """
    Recommend job search strategy for a user
    
    Args:
        user_id: User ID
        
    Returns:
        dict: Strategy recommendations
    """
    try:
        # Import models here to avoid circular imports
        from backend.database.models import User, UserActivity
        
        # Get user
        users = User.find_by_id(user_id)
        
        if not users:
            logger.error(f"User not found: {user_id}")
            return {}
        
        user = users[0]
        profile = user.profile
        
        # Get user activities
        activities = UserActivity.find_by_user_id(user_id)
        
        # Calculate application metrics
        application_count = 0
        response_rate = 0
        
        for activity in activities:
            if activity.activity_type == "job_application":
                application_count += 1
            elif activity.activity_type == "application_response":
                response_rate += 1
        
        if application_count > 0:
            response_rate = (response_rate / application_count) * 100
        
        # Generate strategy recommendations
        strategy = {
            "application_analysis": {
                "applications_submitted": application_count,
                "response_rate": response_rate,
                "target_rate": 10 if application_count < 10 else application_count + 5
            },
            "recommendations": [
                "Tailor your resume for each application",
                "Follow up after 1-2 weeks",
                "Expand your network on professional platforms"
            ],
            "resources": [
                {
                    "title": "Resume Optimization Guide",
                    "description": "Learn how to optimize your resume for ATS systems",
                    "url": "/resources/resume-optimization"
                },
                {
                    "title": "Interview Preparation",
                    "description": "Prepare for common interview questions",
                    "url": "/resources/interview-prep"
                }
            ]
        }
        
        # Personalize recommendations
        if application_count < 5:
            strategy["recommendations"].append("Increase your application volume")
        elif response_rate < 10:
            strategy["recommendations"].append("Focus on quality over quantity")
        
        if profile and "skills" in profile and len(profile["skills"]) < 5:
            strategy["recommendations"].append("Add more skills to your profile")
        
        # Record activity
        UserActivity.record_activity(
            user_id=user_id,
            activity_type="strategy_recommendation",
            activity_data={}
        )
        
        return strategy
    
    except Exception as e:
        logger.error(f"Error recommending job search strategy: {str(e)}")
        return {
            "recommendations": [
                "Tailor your resume for each application",
                "Follow up after 1-2 weeks",
                "Expand your network on professional platforms"
            ]
        }


def upskill_recommendations(user_id: str) -> List[Dict[str, Any]]:
    """
    Get upskilling recommendations for a user
    
    Args:
        user_id: User ID
        
    Returns:
        list: Upskilling recommendations
    """
    try:
        recommender = JobRecommender()
        
        # Import models here to avoid circular imports
        from backend.database.models import User, UserActivity
        
        # Get user
        users = User.find_by_id(user_id)
        
        if not users:
            logger.error(f"User not found: {user_id}")
            return []
        
        user = users[0]
        profile = user.profile
        
        # Get user skills
        if profile and "skills" in profile:
            user_skills = profile["skills"]
        else:
            user_skills = []
        
        # Get user job titles
        user_job_titles = []
        if profile and "experience" in profile:
            for exp in profile["experience"]:
                if "title" in exp:
                    user_job_titles.append(normalize_job_title(exp["title"]))
        
        # Get skill recommendations
        skill_recommendations = recommender.get_personalized_skill_recommendations(user_id)
        
        # Create upskill recommendations
        upskill_recommendations = []
        
        for skill in skill_recommendations:
            # Generate course recommendations for this skill
            courses = _generate_courses_for_skill(skill["name"])
            
            # Add to recommendations
            upskill_recommendations.append({
                "skill": skill["name"],
                "reason": skill["reason"],
                "courses": courses
            })
        
        # Record activity
        UserActivity.record_activity(
            user_id=user_id,
            activity_type="upskill_recommendation",
            activity_data={"count": len(upskill_recommendations)}
        )
        
        return upskill_recommendations
    
    except Exception as e:
        logger.error(f"Error getting upskill recommendations: {str(e)}")
        return []


def _generate_courses_for_skill(skill_name: str) -> List[Dict[str, Any]]:
    """
    Generate course recommendations for a skill
    
    Args:
        skill_name: Skill name
        
    Returns:
        list: Course recommendations
    """
    # This would use an external API or database in a real system
    # Here we use a simplified approach for demonstration
    
    # Define sample courses by skill
    skill_courses = {
        "Python": [
            {
                "title": "Complete Python Developer",
                "provider": "Udemy",
                "level": "Beginner",
                "url": "https://www.udemy.com/course/complete-python-developer",
                "duration": "40 hours"
            },
            {
                "title": "Python for Data Science",
                "provider": "Coursera",
                "level": "Intermediate",
                "url": "https://www.coursera.org/learn/python-for-data-science",
                "duration": "30 hours"
            }
        ],
        "Machine Learning": [
            {
                "title": "Machine Learning Specialization",
                "provider": "Coursera",
                "level": "Intermediate",
                "url": "https://www.coursera.org/specializations/machine-learning",
                "duration": "80 hours"
            },
            {
                "title": "Deep Learning Specialization",
                "provider": "Coursera",
                "level": "Advanced",
                "url": "https://www.coursera.org/specializations/deep-learning",
                "duration": "120 hours"
            }
        ],
        "JavaScript": [
            {
                "title": "Modern JavaScript",
                "provider": "Udemy",
                "level": "Beginner",
                "url": "https://www.udemy.com/course/modern-javascript",
                "duration": "35 hours"
            },
            {
                "title": "Advanced JavaScript Concepts",
                "provider": "Udemy",
                "level": "Advanced",
                "url": "https://www.udemy.com/course/advanced-javascript-concepts",
                "duration": "25 hours"
            }
        ]
    }
    
    # Generic courses for any skill
    generic_courses = [
        {
            "title": f"Introduction to {skill_name}",
            "provider": "Udemy",
            "level": "Beginner",
            "url": f"https://www.udemy.com/course/introduction-to-{skill_name.lower().replace(' ', '-')}",
            "duration": "20 hours"
        },
        {
            "title": f"Advanced {skill_name} Techniques",
            "provider": "Coursera",
            "level": "Advanced",
            "url": f"https://www.coursera.org/learn/{skill_name.lower().replace(' ', '-')}-techniques",
            "duration": "40 hours"
        }
    ]
    
    # Return courses for this skill or generic courses
    return skill_courses.get(skill_name, generic_courses)