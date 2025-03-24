"""
Job Matching Module

This module provides functionality for matching users to relevant job opportunities,
generating personalized job recommendations, and scoring job fit.
"""

import logging
import json
import requests
from backend.core.job_matching import JobMatcher
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import random

# Import utilities
from backend.utils.preprocess import extract_skills, preprocess_text
from backend.utils.cache_utils import cache_result

# Import settings
from backend.config.settings import DEEPSEEK_API_KEY

# Setup logger
logger = logging.getLogger(__name__)


class JobMatcher:
    """Class for job matching and recommendations"""
    
    def __init__(self):
        """Initialize job matcher"""
        self.api_key = DEEPSEEK_API_KEY
        
        # Load skill taxonomy
        self.skill_taxonomy = self._load_skill_taxonomy()
        
        # Load industry keywords
        self.industry_keywords = self._load_industry_keywords()
    
    def _load_skill_taxonomy(self) -> Dict[str, List[str]]:
        """
        Load skill taxonomy for skill normalization and matching
        
        Returns:
            Dict mapping skill groups to list of related skills
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "programming": [
                "python", "javascript", "java", "c++", "c#", "ruby", "php",
                "golang", "scala", "kotlin", "swift", "typescript", "perl"
            ],
            "data_science": [
                "machine learning", "deep learning", "natural language processing",
                "data mining", "statistical analysis", "data visualization",
                "predictive modeling", "neural networks", "computer vision"
            ],
            "web_development": [
                "html", "css", "react", "angular", "vue", "node.js", "express",
                "django", "flask", "ruby on rails", "asp.net", "jquery", "bootstrap"
            ],
            "databases": [
                "sql", "mysql", "postgresql", "mongodb", "dynamodb", "oracle",
                "sql server", "cassandra", "redis", "elasticsearch", "neo4j"
            ],
            "devops": [
                "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible",
                "aws", "azure", "gcp", "cloud", "infrastructure as code", "monitoring"
            ],
            "soft_skills": [
                "communication", "teamwork", "leadership", "problem solving",
                "critical thinking", "time management", "project management",
                "adaptability", "creativity", "emotional intelligence"
            ]
        }
    
    def _load_industry_keywords(self) -> Dict[str, List[str]]:
        """
        Load industry keywords for industry matching
        
        Returns:
            Dict mapping industries to list of keywords
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "technology": [
                "software", "tech", "information technology", "it", "saas", "cloud",
                "digital", "internet", "computer", "web", "app", "application"
            ],
            "healthcare": [
                "health", "medical", "hospital", "clinical", "patient", "pharma",
                "healthcare", "biotech", "life sciences", "diagnostic"
            ],
            "finance": [
                "bank", "financial", "investment", "insurance", "fintech", "wealth",
                "asset management", "capital", "trading", "finance"
            ],
            "retail": [
                "retail", "e-commerce", "ecommerce", "store", "shop", "consumer",
                "commerce", "sales", "merchandise", "shopping"
            ],
            "manufacturing": [
                "manufacturing", "factory", "production", "industrial", "assembly",
                "fabrication", "engineering", "supply chain", "logistics"
            ],
            "education": [
                "education", "academic", "school", "university", "college", "teaching",
                "learning", "training", "edtech", "educational"
            ],
            "media": [
                "media", "entertainment", "publishing", "content", "news", "digital media",
                "broadcasting", "advertising", "marketing", "creative"
            ]
        }
    
    def match_jobs(self, user_profile: Dict[str, Any], jobs: List[Dict[str, Any]], 
                 limit: int = 10, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Match jobs to user profile
        
        Args:
            user_profile: User profile data
            jobs: List of job postings
            limit: Maximum number of matches to return
            filters: Additional filters
            
        Returns:
            List of matched jobs with scores
        """
        try:
            # Extract user skills and experience
            user_skills = user_profile.get("skills", [])
            user_experience = user_profile.get("experience", [])
            target_role = user_profile.get("target_role", "")
            
            # Extract user industries from experience
            user_industries = set()
            for exp in user_experience:
                company_industry = exp.get("industry", "")
                if company_industry:
                    user_industries.add(company_industry.lower())
            
            # Filter jobs if filters are provided
            filtered_jobs = jobs
            if filters:
                filtered_jobs = self._apply_job_filters(jobs, filters)
            
            # Calculate match scores for each job
            scored_jobs = []
            for job in filtered_jobs:
                # Initial score
                score = self._calculate_match_score(user_profile, job)
                
                # Add score and job to results
                scored_jobs.append({
                    "job": job,
                    "match_score": score,
                    "match_factors": self._get_match_factors(user_profile, job, score)
                })
            
            # Sort by match score descending
            scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
            
            # Return top matches up to limit
            return scored_jobs[:limit]
            
        except Exception as e:
            logger.error(f"Error matching jobs: {str(e)}")
            return []
    
    def _apply_job_filters(self, jobs: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Apply filters to job list
        
        Args:
            jobs: List of job postings
            filters: Filters to apply
            
        Returns:
            Filtered list of jobs
        """
        filtered_jobs = jobs
        
        # Filter by location
        if "location" in filters and filters["location"]:
            locations = [loc.lower() for loc in filters["location"]]
            filtered_jobs = [
                job for job in filtered_jobs 
                if any(loc in job.get("location", "").lower() for loc in locations)
            ]
        
        # Filter by remote
        if "remote" in filters:
            remote_filter = filters["remote"]
            if remote_filter is True:
                filtered_jobs = [
                    job for job in filtered_jobs 
                    if job.get("remote", False) is True or "remote" in job.get("location", "").lower()
                ]
            elif remote_filter is False:
                filtered_jobs = [
                    job for job in filtered_jobs 
                    if job.get("remote", False) is False and "remote" not in job.get("location", "").lower()
                ]
        
        # Filter by salary
        if "min_salary" in filters and filters["min_salary"]:
            min_salary = filters["min_salary"]
            filtered_jobs = [
                job for job in filtered_jobs 
                if job.get("salary_min", 0) >= min_salary or job.get("salary_max", 0) >= min_salary
            ]
        
        if "max_salary" in filters and filters["max_salary"]:
            max_salary = filters["max_salary"]
            filtered_jobs = [
                job for job in filtered_jobs 
                if job.get("salary_min", float('inf')) <= max_salary
            ]
        
        # Filter by job type
        if "job_type" in filters and filters["job_type"]:
            job_types = [jt.lower() for jt in filters["job_type"]]
            filtered_jobs = [
                job for job in filtered_jobs 
                if job.get("job_type", "").lower() in job_types
            ]
        
        # Filter by experience level
        if "experience_level" in filters and filters["experience_level"]:
            exp_levels = [el.lower() for el in filters["experience_level"]]
            filtered_jobs = [
                job for job in filtered_jobs 
                if job.get("experience_level", "").lower() in exp_levels
            ]
        
        # Filter by industry
        if "industry" in filters and filters["industry"]:
            industries = [ind.lower() for ind in filters["industry"]]
            filtered_jobs = [
                job for job in filtered_jobs 
                if job.get("industry", "").lower() in industries
            ]
        
        # Filter by date posted
        if "posted_after" in filters and filters["posted_after"]:
            posted_after = filters["posted_after"]
            filtered_jobs = [
                job for job in filtered_jobs 
                if job.get("posted_date", datetime.now()) >= posted_after
            ]
        
        return filtered_jobs
    
    def _calculate_match_score(self, user_profile: Dict[str, Any], job: Dict[str, Any]) -> int:
        """
        Calculate match score between user and job
        
        Args:
            user_profile: User profile data
            job: Job posting
            
        Returns:
            Match score (0-100)
        """
        # Base score
        score = 50
        
        # Score components
        skill_score = 0
        title_score = 0
        industry_score = 0
        experience_score = 0
        education_score = 0
        
        # Extract user data
        user_skills = [skill.lower() for skill in user_profile.get("skills", [])]
        user_title = user_profile.get("current_role", "").lower()
        user_target_role = user_profile.get("target_role", "").lower()
        user_years_experience = user_profile.get("years_experience", 0)
        user_education = user_profile.get("education", [])
        user_degree_level = self._get_highest_degree_level(user_education)
        
        # Extract job data
        job_skills = [skill.lower() for skill in job.get("skills", [])]
        job_title = job.get("title", "").lower()
        job_description = job.get("description", "").lower()
        job_industry = job.get("industry", "").lower()
        job_min_experience = job.get("min_experience", 0)
        job_required_degree = job.get("required_degree", "").lower()
        
        # Add skills from description if not provided
        if not job_skills and job_description:
            job_skills = extract_skills(job_description)
        
        # Calculate skill match score (most important)
        if user_skills and job_skills:
            matching_skills = 0
            total_job_skills = len(job_skills)
            
            for job_skill in job_skills:
                for user_skill in user_skills:
                    # Exact match
                    if job_skill == user_skill:
                        matching_skills += 1
                        break
                    # Partial match
                    elif job_skill in user_skill or user_skill in job_skill:
                        matching_skills += 0.5
                        break
            
            # Calculate skill match percentage
            if total_job_skills > 0:
                skill_match_percentage = (matching_skills / total_job_skills) * 100
                skill_score = min(40, skill_match_percentage * 0.4)  # Max 40 points
        
        # Calculate title match score
        if user_title or user_target_role:
            title_match = False
            
            # Check if current role matches
            if user_title and (user_title in job_title or job_title in user_title):
                title_match = True
            
            # Check if target role matches
            if user_target_role and (user_target_role in job_title or job_title in user_target_role):
                title_match = True
            
            if title_match:
                title_score = 20  # 20 points for title match
        
        # Calculate industry match score
        if job_industry:
            # Get user industries from experience
            user_industries = set()
            for exp in user_profile.get("experience", []):
                exp_industry = exp.get("industry", "").lower()
                if exp_industry:
                    user_industries.add(exp_industry)
            
            # Check industry match
            if job_industry in user_industries:
                industry_score = 10  # 10 points for industry match
            # Check if user has worked in related industry
            elif any(self._are_industries_related(job_industry, ui) for ui in user_industries):
                industry_score = 5  # 5 points for related industry
        
        # Calculate experience match score
        if user_years_experience >= job_min_experience:
            # Full points if experience matches exactly or exceeds by up to 2 years
            if user_years_experience <= job_min_experience + 2:
                experience_score = 15
            # Partial points if significantly overqualified
            else:
                experience_score = 10
        elif job_min_experience > 0 and user_years_experience >= job_min_experience * 0.7:
            # Partial points if close to minimum experience
            experience_score = 5
        
        # Calculate education match score
        if job_required_degree:
            # No education requirement or matches user's degree
            if job_required_degree == "none" or self._meets_education_requirement(user_degree_level, job_required_degree):
                education_score = 15
        else:
            # If no specific education requirement
            education_score = 15
        
        # Combine scores
        score = skill_score + title_score + industry_score + experience_score + education_score
        
        # Ensure score is within range
        return max(0, min(100, score))
    
    def _get_match_factors(self, user_profile: Dict[str, Any], job: Dict[str, Any], score: int) -> List[Dict[str, Any]]:
        """
        Get factors that influenced match score
        
        Args:
            user_profile: User profile data
            job: Job posting
            score: Match score
            
        Returns:
            List of match factors
        """
        factors = []
        
        # Extract user data
        user_skills = [skill.lower() for skill in user_profile.get("skills", [])]
        user_title = user_profile.get("current_role", "").lower()
        user_target_role = user_profile.get("target_role", "").lower()
        user_years_experience = user_profile.get("years_experience", 0)
        user_education = user_profile.get("education", [])
        
        # Extract job data
        job_skills = [skill.lower() for skill in job.get("skills", [])]
        job_title = job.get("title", "").lower()
        job_industry = job.get("industry", "").lower()
        job_min_experience = job.get("min_experience", 0)
        job_required_degree = job.get("required_degree", "").lower()
        
        # Add skills from description if not provided
        if not job_skills and job.get("description"):
            job_skills = extract_skills(job.get("description", "").lower())
        
        # Skill match factor
        if user_skills and job_skills:
            matching_skills = []
            missing_skills = []
            
            for job_skill in job_skills:
                skill_found = False
                for user_skill in user_skills:
                    if job_skill == user_skill or job_skill in user_skill or user_skill in job_skill:
                        matching_skills.append(job_skill)
                        skill_found = True
                        break
                
                if not skill_found:
                    missing_skills.append(job_skill)
            
            # Calculate match percentage
            skill_match_percent = len(matching_skills) / len(job_skills) * 100 if job_skills else 0
            
            # Add factor
            factors.append({
                "name": "Skill Match",
                "score": int(skill_match_percent),
                "details": {
                    "matching_skills": matching_skills[:5],  # Limit to top 5
                    "missing_skills": missing_skills[:5],    # Limit to top 5
                    "total_matching": len(matching_skills),
                    "total_required": len(job_skills)
                }
            })
        
        # Job title match factor
        title_match = False
        if user_title and (user_title in job_title or job_title in user_title):
            title_match = True
        elif user_target_role and (user_target_role in job_title or job_title in user_target_role):
            title_match = True
        
        factors.append({
            "name": "Job Title Match",
            "score": 100 if title_match else 0,
            "details": {
                "user_current_role": user_title,
                "user_target_role": user_target_role,
                "job_title": job_title
            }
        })
        
        # Experience match factor
        experience_match_percent = min(100, (user_years_experience / job_min_experience) * 100) if job_min_experience > 0 else 100
        
        factors.append({
            "name": "Experience Match",
            "score": int(experience_match_percent),
            "details": {
                "user_years": user_years_experience,
                "required_years": job_min_experience
            }
        })
        
        # Education match factor
        user_degree_level = self._get_highest_degree_level(user_education)
        meets_education = self._meets_education_requirement(user_degree_level, job_required_degree)
        
        factors.append({
            "name": "Education Match",
            "score": 100 if meets_education else 50 if user_degree_level else 0,
            "details": {
                "user_highest_degree": user_degree_level,
                "required_degree": job_required_degree
            }
        })
        
        return factors
    
    def _get_highest_degree_level(self, education: List[Dict[str, Any]]) -> str:
        """
        Get highest degree level from education history
        
        Args:
            education: List of education entries
            
        Returns:
            Highest degree level
        """
        # Define degree hierarchy
        degree_levels = {
            "phd": 5,
            "doctorate": 5,
            "doctoral": 5,
            "master": 4,
            "ms": 4,
            "ma": 4,
            "mba": 4,
            "bachelor": 3,
            "bs": 3,
            "ba": 3,
            "bsc": 3,
            "associate": 2,
            "diploma": 1,
            "certificate": 1,
            "high school": 0
        }
        
        highest_level = ""
        highest_value = -1
        
        for edu in education:
            degree = edu.get("degree", "").lower()
            
            for level, value in degree_levels.items():
                if level in degree and value > highest_value:
                    highest_level = level
                    highest_value = value
        
        return highest_level
    
    def _meets_education_requirement(self, user_degree: str, required_degree: str) -> bool:
        """
        Check if user's education meets job requirement
        
        Args:
            user_degree: User's highest degree
            required_degree: Required degree
            
        Returns:
            True if requirement is met
        """
        # Define degree hierarchy
        degree_levels = {
            "phd": 5,
            "doctorate": 5,
            "doctoral": 5,
            "master": 4,
            "ms": 4,
            "ma": 4,
            "mba": 4,
            "bachelor": 3,
            "bs": 3,
            "ba": 3,
            "bsc": 3,
            "associate": 2,
            "diploma": 1,
            "certificate": 1,
            "high school": 0
        }
        
        # Get level values
        user_level = -1
        for level, value in degree_levels.items():
            if user_degree and level in user_degree:
                user_level = value
                break
        
        required_level = -1
        for level, value in degree_levels.items():
            if required_degree and level in required_degree:
                required_level = value
                break
        
        # Check if user meets or exceeds required level
        return user_level >= required_level if required_level >= 0 else True
    
    def _are_industries_related(self, industry1: str, industry2: str) -> bool:
        """
        Check if two industries are related
        
        Args:
            industry1: First industry
            industry2: Second industry
            
        Returns:
            True if industries are related
        """
        # Direct match
        if industry1 == industry2:
            return True
        
        # Check industry keywords
        industry1_keywords = set()
        industry2_keywords = set()
        
        for industry, keywords in self.industry_keywords.items():
            if industry.lower() == industry1 or any(kw in industry1 for kw in keywords):
                industry1_keywords.update(keywords)
            
            if industry.lower() == industry2 or any(kw in industry2 for kw in keywords):
                industry2_keywords.update(keywords)
        
        # Check if industries share keywords
        common_keywords = industry1_keywords.intersection(industry2_keywords)
        return len(common_keywords) > 0
    
    def get_job_recommendations(self, user_profile: Dict[str, Any], jobs: List[Dict[str, Any]], 
                              limit: int = 5) -> Dict[str, Any]:
        """
        Get personalized job recommendations with AI analysis
        
        Args:
            user_profile: User profile data
            jobs: List of job postings
            limit: Maximum number of recommendations
            
        Returns:
            Job recommendations
        """
        try:
            # Get base matches
            matched_jobs = self.match_jobs(user_profile, jobs, limit * 2)
            
            # Get top matches
            top_matches = matched_jobs[:limit]
            
            # Get AI insights for top matches
            ai_insights = {}
            if self.api_key:
                ai_insights = self._get_job_recommendation_insights_from_ai(user_profile, top_matches)
            
            # Format recommendations
            recommendations = {
                "matches": top_matches,
                "match_count": len(matched_jobs),
                "generated_at": datetime.now().isoformat()
            }
            
            if ai_insights:
                recommendations["ai_insights"] = ai_insights
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting job recommendations: {str(e)}")
            return {
                "error": str(e),
                "matches": []
            }
    
    def get_similar_jobs(self, job_id: str, job_title: str, jobs: List[Dict[str, Any]], 
                       limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get similar jobs to a given job
        
        Args:
            job_id: ID of the reference job
            job_title: Title of the reference job
            jobs: List of job postings
            limit: Maximum number of similar jobs
            
        Returns:
            List of similar jobs
        """
        try:
            # Filter out the reference job
            other_jobs = [job for job in jobs if job.get("id") != job_id]
            
            # Sort jobs by title similarity
            similar_jobs = []
            for job in other_jobs:
                similarity_score = self._calculate_job_similarity(job_title, job.get("title", ""))
                similar_jobs.append({
                    "job": job,
                    "similarity_score": similarity_score
                })
            
            # Sort by similarity score descending
            similar_jobs.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            # Return top similar jobs
            return [item["job"] for item in similar_jobs[:limit]]
            
        except Exception as e:
            logger.error(f"Error getting similar jobs: {str(e)}")
            return []
    
    def _calculate_job_similarity(self, title1: str, title2: str) -> float:
        """
        Calculate similarity between two job titles
        
        Args:
            title1: First job title
            title2: Second job title
            
        Returns:
            Similarity score (0-100)
        """
        # Normalize titles
        title1 = title1.lower()
        title2 = title2.lower()
        
        # Exact match
        if title1 == title2:
            return 100
        
        # Check for title containment
        if title1 in title2 or title2 in title1:
            return 90
        
        # Split into words and count common words
        words1 = set(title1.split())
        words2 = set(title2.split())
        
        common_words = words1.intersection(words2)
        
        # Calculate word overlap
        similarity = len(common_words) / max(len(words1), len(words2)) * 100
        
        return similarity
    
    def _get_job_recommendation_insights_from_ai(self, user_profile: Dict[str, Any], 
                                               matched_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get job recommendation insights from DeepSeek AI
        
        Args:
            user_profile: User profile data
            matched_jobs: List of matched jobs
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI insights")
            return {}
        
        try:
            # Simplify data to avoid token limits
            simplified_profile = {
                "current_role": user_profile.get("current_role", ""),
                "years_experience": user_profile.get("years_experience", 0),
                "skills": user_profile.get("skills", [])[:10]
            }
            
            simplified_jobs = []
            for match in matched_jobs:
                job = match["job"]
                simplified_jobs.append({
                    "title": job.get("title", ""),
                    "company": job.get("company", ""),
                    "match_score": match.get("match_score", 0),
                    "skills": job.get("skills", [])[:5]
                })
            
            # Prepare the API request
            prompt = f"""Based on this user profile and matched jobs, provide personalized insights:
            
            User Profile: {json.dumps(simplified_profile)}
            
            Matched Jobs: {json.dumps(simplified_jobs)}
            
            Please provide:
            1. Overall pattern analysis of the matched jobs
            2. Skill alignment between the user and opportunities
            3. Specific application strategy recommendations
            4. Skill development suggestions to improve match quality
            
            Format as a JSON object with keys: "patterns", "skill_alignment", "application_strategy", 
            and "skill_development". Each containing an array of objects with "title" and "description" fields.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career advisor providing personalized job search insights and strategies."},
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
            logger.error(f"Error getting job recommendation insights from AI: {str(e)}")
            return {} 