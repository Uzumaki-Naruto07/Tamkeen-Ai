"""
Job Matching Module

This module provides functionality for matching users to jobs and generating
job recommendations based on skills, experience, and other criteria.
"""

import os
import re
import json
import math
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import logging

# Import database models
from backend.database.models import User, Resume, ResumeVersion, Job, JobApplication, UserSkill
from backend.database.connector import get_db, DatabaseError

# Import utilities
from backend.utils.text_preprocess import extract_skills, clean_text

# Setup logger
logger = logging.getLogger(__name__)


class JobMatcher:
    """Job matching and recommendation class"""
    
    def __init__(self):
        """Initialize matcher with config"""
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load matching configuration
        
        Returns:
            dict: Configuration settings
        """
        try:
            config_path = os.path.join(os.path.dirname(__file__), '../config/matching_config.json')
            
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            # Default config if file not found
            return {
                "weights": {
                    "skills_match": 0.4,
                    "experience_match": 0.3,
                    "education_match": 0.2,
                    "location_match": 0.1
                },
                "min_match_score": 0.5,
                "experience_level_mapping": {
                    "entry": 0,
                    "junior": 1,
                    "mid": 2,
                    "senior": 3,
                    "lead": 4,
                    "manager": 5,
                    "director": 6,
                    "executive": 7
                }
            }
        
        except Exception as e:
            logger.error(f"Error loading matcher config: {str(e)}")
            return {
                "weights": {
                    "skills_match": 0.4,
                    "experience_match": 0.3,
                    "education_match": 0.2,
                    "location_match": 0.1
                },
                "min_match_score": 0.5
            }
    
    def calculate_skills_match(self, user_skills: List[str], job_skills: List[str]) -> float:
        """
        Calculate skills match score
        
        Args:
            user_skills: List of user skills
            job_skills: List of job skills
            
        Returns:
            float: Match score between 0 and 1
        """
        if not job_skills:
            return 0.0
        
        # Convert to lowercase for case-insensitive matching
        user_skills_lower = [s.lower() for s in user_skills]
        job_skills_lower = [s.lower() for s in job_skills]
        
        # Count matching skills
        matched_skills = [s for s in job_skills_lower if s in user_skills_lower]
        
        # Calculate score
        score = len(matched_skills) / len(job_skills)
        
        return min(score, 1.0)  # Cap at 1.0
    
    def calculate_experience_match(self, user_experience: List[Dict[str, Any]], 
                                  job_min_years: int, job_level: str) -> float:
        """
        Calculate experience match score
        
        Args:
            user_experience: List of user experience entries
            job_min_years: Minimum years of experience required
            job_level: Job experience level
            
        Returns:
            float: Match score between 0 and 1
        """
        if not user_experience:
            return 0.0
        
        # Calculate total years of experience
        total_years = 0
        for exp in user_experience:
            # Extract start and end dates
            start_date = exp.get('start_date')
            end_date = exp.get('end_date', datetime.now().isoformat()[:10])
            
            # Skip if no start date
            if not start_date:
                continue
            
            # Convert to datetime
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                
                # Calculate years
                years = (end - start).days / 365.25
                total_years += years
            except (ValueError, TypeError):
                continue
        
        # Calculate years score
        years_score = total_years / job_min_years if job_min_years > 0 else 1.0
        
        # Calculate level score
        level_mapping = self.config.get('experience_level_mapping', {})
        user_level = self._determine_experience_level(user_experience)
        
        user_level_value = level_mapping.get(user_level, 0)
        job_level_value = level_mapping.get(job_level, 0)
        
        # If job requires higher level than user has
        if job_level_value > user_level_value:
            level_score = user_level_value / job_level_value if job_level_value > 0 else 0.0
        else:
            level_score = 1.0
        
        # Combine scores
        score = (years_score * 0.6) + (level_score * 0.4)
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _determine_experience_level(self, experience: List[Dict[str, Any]]) -> str:
        """
        Determine user's experience level
        
        Args:
            experience: List of experience entries
            
        Returns:
            str: Experience level (entry, junior, mid, senior, etc.)
        """
        # Extract job titles
        titles = [exp.get('title', '').lower() for exp in experience if exp.get('title')]
        
        # Check for executive roles
        executive_patterns = ['ceo', 'cto', 'cfo', 'coo', 'chief', 'president', 'vp', 'vice president']
        if any(any(pattern in title for pattern in executive_patterns) for title in titles):
            return 'executive'
        
        # Check for director roles
        director_patterns = ['director']
        if any(any(pattern in title for pattern in director_patterns) for title in titles):
            return 'director'
        
        # Check for manager roles
        manager_patterns = ['manager', 'head of', 'lead']
        if any(any(pattern in title for pattern in manager_patterns) for title in titles):
            return 'manager'
        
        # Check for senior roles
        senior_patterns = ['senior', 'sr', 'principal', 'staff']
        if any(any(pattern in title for pattern in senior_patterns) for title in titles):
            return 'senior'
        
        # Calculate total years of experience
        total_years = 0
        for exp in experience:
            # Extract start and end dates
            start_date = exp.get('start_date')
            end_date = exp.get('end_date', datetime.now().isoformat()[:10])
            
            # Skip if no start date
            if not start_date:
                continue
            
            # Convert to datetime
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                
                # Calculate years
                years = (end - start).days / 365.25
                total_years += years
            except (ValueError, TypeError):
                continue
        
        # Determine level based on total years of experience
        if total_years < 1:
            return 'entry'
        elif total_years < 3:
            return 'junior'
        elif total_years < 5:
            return 'mid'
        elif total_years < 10:
            return 'senior'
        else:
            return 'lead'
    
    def match_resume_to_job(self, resume_id: str, job_id: str) -> Dict[str, Any]:
        """Match resume to specific job"""
        try:
            # Get resume data
            resume = Resume.find_by_id(resume_id)
            if not resume:
                return None
            
            # Get job data
            job = Job.find_by_id(job_id)
            if not job:
                return None
            
            # Get resume skills
            skills = []
            
            if resume.parsed_data.get('skills'):
                skills = resume.parsed_data.get('skills', [])
            
            # Get user skills from database
            user_skills = UserSkill.find_by_user_id(resume.user_id)
            for skill in user_skills:
                if skill.name not in skills:
                    skills.append(skill.name)
            
            # Calculate match score
            match_score = self.match_job_to_user(
                job,
                {
                    'skills': skills,
                    'experience': resume.parsed_data.get('experience', []),
                    'education': resume.parsed_data.get('education', []),
                    'location': resume.parsed_data.get('location', '')
                }
            )
            
            return {
                'match_score': match_score,
                'job': job.to_dict()
            }
        
        except Exception as e:
            error_msg = f"Error matching resume to job: {str(e)}"
            logger.error(error_msg)
            return None
    
    def generate_job_recommendations(self, user_id: str, resume_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate job recommendations for a user"""
        try:
            # Get user location
            user_location = ''
            
            if resume_id:
                resume = Resume.find_by_id(resume_id)
                if resume:
                    user_location = resume.parsed_data.get('location', '')
            
            # Get resume skills
            skills = []
            
            if resume_id:
                resume = Resume.find_by_id(resume_id)
                if resume:
                    skills = resume.parsed_data.get('skills', [])
            
            # Get user skills from database
            user_skills = UserSkill.find_by_user_id(user_id)
            for skill in user_skills:
                if skill.name not in skills:
                    skills.append(skill.name)
            
            # Match against jobs
            jobs = Job.find_active_jobs()
            
            matched_jobs = []
            for job in jobs:
                # Calculate match score
                match_score = self.match_job_to_user(
                    job,
                    {
                        'skills': skills,
                        'experience': skills,
                        'education': skills,
                        'location': user_location
                    }
                )
                
                if match_score >= self.config.get('min_match_score', 0.5):
                    job_dict = job.to_dict()
                    job_dict['match_score'] = match_score
                    matched_jobs.append(job_dict)
            
            # Sort by match score
            matched_jobs.sort(key=lambda j: j['match_score'], reverse=True)
            
            return matched_jobs[:limit]
        
        except Exception as e:
            error_msg = f"Error generating job recommendations: {str(e)}"
            logger.error(error_msg)
            return []
    
    def match_job_to_user(self, job: Job, user_data: Dict[str, Any]) -> float:
        """Match job to user data"""
        try:
            # Calculate skills match
            skills_match = self.calculate_skills_match(user_data['skills'], job.skills)
            
            # Calculate experience match
            experience_match = self.calculate_experience_match(user_data['experience'], job.min_years, job.level)
            
            # Calculate education match
            education_match = 1.0 if job.education in user_data['education'] else 0.0
            
            # Calculate location match
            location_match = 1.0 if job.location.lower() in user_data['location'].lower() else 0.0
            
            # Calculate total match score
            total_match = (
                self.config['weights']['skills_match'] * skills_match +
                self.config['weights']['experience_match'] * experience_match +
                self.config['weights']['education_match'] * education_match +
                self.config['weights']['location_match'] * location_match
            )
            
            return total_match
        
        except Exception as e:
            error_msg = f"Error matching job to user: {str(e)}"
            logger.error(error_msg)
            return 0.0


# Convenience functions

def match_resume_to_job(resume_id: str, job_id: str) -> Dict[str, Any]:
    """Match resume to specific job"""
    matcher = JobMatcher()
    return matcher.match_resume_to_job(resume_id, job_id)


def generate_job_recommendations(user_id: str, resume_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """Generate job recommendations for a user"""
    matcher = JobMatcher()
    return matcher.generate_job_recommendations(user_id, resume_id, limit)


def match_job_to_user(job: Job, user_data: Dict[str, Any]) -> float:
    """Match job to user data"""
    matcher = JobMatcher()
    return matcher.match_job_to_user(job, user_data)


def apply_to_job(user_id: str, job_id: str, resume_id: str, cover_letter: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Apply to a job
    
    Args:
        user_id: User ID
        job_id: Job ID
        resume_id: Resume ID
        cover_letter: Optional cover letter
        
    Returns:
        tuple: (success, message)
    """
    try:
        # Check if already applied
        existing = JobApplication.find_by_user_and_job(user_id, job_id)
        if existing:
            return False, "You have already applied to this job"
        
        # Create application
        application = JobApplication(
            id=str(uuid.uuid4()),
            user_id=user_id,
            job_id=job_id,
            resume_id=resume_id,
            status='applied',
            cover_letter=cover_letter,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat()
        )
        
        # Save application
        application.save()
        
        logger.info(f"User {user_id} applied to job {job_id}")
        
        return True, None
    
    except Exception as e:
        error_msg = f"Error applying to job: {str(e)}"
        logger.error(error_msg)
        return False, error_msg 