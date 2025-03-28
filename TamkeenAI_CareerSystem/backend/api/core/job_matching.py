"""
Job matching functionality for TamkeenAI.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple

# Import database models
from api.database.models import Job, User, Resume

# Setup logger
logger = logging.getLogger(__name__)


class JobMatcher:
    """
    Job matching service for finding jobs based on user profiles,
    resumes, and search criteria.
    """
    
    def __init__(self):
        """Initialize the job matcher."""
        logger.info("Initializing JobMatcher")
        
        # Sample jobs for demo purposes
        self.sample_jobs = [
            {
                "id": "job-001",
                "title": "Senior Software Engineer",
                "company": "TechCorp Inc.",
                "location": "San Francisco, CA",
                "description": "We're looking for a senior software engineer to join our team...",
                "requirements": ["Python", "AWS", "Microservices", "5+ years experience"],
                "salary_range": {"min": 120000, "max": 180000, "currency": "USD"},
                "job_type": "full-time",
                "posted_date": "2023-03-15T10:00:00",
                "status": "active"
            },
            {
                "id": "job-002",
                "title": "Data Scientist",
                "company": "DataInsight Co.",
                "location": "Remote",
                "description": "Seeking a data scientist to analyze large datasets and build models...",
                "requirements": ["Python", "R", "Machine Learning", "Statistics", "3+ years experience"],
                "salary_range": {"min": 110000, "max": 160000, "currency": "USD"},
                "job_type": "full-time",
                "posted_date": "2023-03-18T14:30:00",
                "status": "active"
            },
            {
                "id": "job-003",
                "title": "Frontend Developer",
                "company": "WebWiz Solutions",
                "location": "New York, NY",
                "description": "Join our frontend team to build responsive web applications...",
                "requirements": ["JavaScript", "React", "CSS", "HTML", "2+ years experience"],
                "salary_range": {"min": 90000, "max": 130000, "currency": "USD"},
                "job_type": "full-time",
                "posted_date": "2023-03-20T09:15:00",
                "status": "active"
            },
            {
                "id": "job-004",
                "title": "Product Manager",
                "company": "InnovateTech",
                "location": "Austin, TX",
                "description": "Lead product development and work with cross-functional teams...",
                "requirements": ["Product Management", "Agile", "User Research", "4+ years experience"],
                "salary_range": {"min": 115000, "max": 170000, "currency": "USD"},
                "job_type": "full-time",
                "posted_date": "2023-03-22T11:45:00",
                "status": "active"
            },
            {
                "id": "job-005",
                "title": "DevOps Engineer",
                "company": "CloudScale Systems",
                "location": "Seattle, WA",
                "description": "Help us build and maintain our cloud infrastructure...",
                "requirements": ["AWS", "Docker", "Kubernetes", "CI/CD", "3+ years experience"],
                "salary_range": {"min": 105000, "max": 155000, "currency": "USD"},
                "job_type": "full-time",
                "posted_date": "2023-03-25T08:30:00",
                "status": "active"
            }
        ]
    
    def search_jobs(self, query: str = "", filters: Dict[str, Any] = None, 
                   page: int = 1, limit: int = 10, 
                   sort_by: str = "date", sort_order: str = "desc") -> Tuple[List[Dict[str, Any]], int]:
        """
        Search for jobs based on query and filters.
        
        Args:
            query: Search query
            filters: Search filters
            page: Page number
            limit: Items per page
            sort_by: Sort field
            sort_order: Sort order (asc or desc)
            
        Returns:
            Tuple of (jobs list, total count)
        """
        # In a real implementation, this would query a database
        # For demo, just filter and return sample jobs
        
        # Filter jobs
        filtered_jobs = self.sample_jobs.copy()
        
        # Apply query filter
        if query:
            query = query.lower()
            filtered_jobs = [job for job in filtered_jobs if
                            query in job["title"].lower() or
                            query in job["company"].lower() or
                            query in job["description"].lower()]
        
        # Apply additional filters
        if filters:
            if "location" in filters:
                location = filters["location"].lower()
                filtered_jobs = [job for job in filtered_jobs if
                                location in job["location"].lower()]
            
            if "job_type" in filters:
                job_type = filters["job_type"].lower()
                filtered_jobs = [job for job in filtered_jobs if
                                job["job_type"].lower() == job_type]
            
            if "company" in filters:
                company = filters["company"].lower()
                filtered_jobs = [job for job in filtered_jobs if
                                company in job["company"].lower()]
        
        # Sort jobs
        if sort_by == "date":
            filtered_jobs.sort(key=lambda job: job["posted_date"], 
                              reverse=(sort_order.lower() == "desc"))
        elif sort_by == "salary":
            filtered_jobs.sort(key=lambda job: job["salary_range"]["min"], 
                              reverse=(sort_order.lower() == "desc"))
        elif sort_by == "title":
            filtered_jobs.sort(key=lambda job: job["title"], 
                              reverse=(sort_order.lower() == "desc"))
        
        # Get total count
        total = len(filtered_jobs)
        
        # Paginate results
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_jobs = filtered_jobs[start_idx:end_idx]
        
        return paginated_jobs, total
    
    def get_recommended_jobs(self, user_id: str, resume_data: Optional[Dict[str, Any]] = None,
                            page: int = 1, limit: int = 10) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get recommended jobs for a user.
        
        Args:
            user_id: User ID
            resume_data: Resume data for matching
            page: Page number
            limit: Items per page
            
        Returns:
            Tuple of (recommended jobs list, total count)
        """
        # In a real implementation, this would use ML/AI to match jobs to user
        # For demo, return sample jobs with match scores
        
        # Add a mock match score to each job
        recommended_jobs = []
        for job in self.sample_jobs:
            # Calculate a mock match score (50-100%)
            match_score = 0.7  # Base score for demo
            
            # Add match details to job
            job_with_score = job.copy()
            job_with_score["match_score"] = match_score
            job_with_score["match_reasons"] = [
                "Skills match your profile",
                "Location matches your preference",
                "Salary in your expected range"
            ]
            job_with_score["missing_skills"] = ["Docker", "Kubernetes"]
            
            recommended_jobs.append(job_with_score)
        
        # Sort by match score
        recommended_jobs.sort(key=lambda j: j["match_score"], reverse=True)
        
        # Get total count
        total = len(recommended_jobs)
        
        # Paginate results
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_jobs = recommended_jobs[start_idx:end_idx]
        
        return paginated_jobs, total
    
    def get_job_match_score(self, job_id: str, resume_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calculate match score between a job and a resume.
        
        Args:
            job_id: Job ID
            resume_data: Resume data for matching
            
        Returns:
            Match score details
        """
        # Find the job
        job = next((j for j in self.sample_jobs if j["id"] == job_id), None)
        if not job:
            return {"error": "Job not found"}
        
        # Calculate a mock match score (50-100%)
        match_score = 0.75  # Base score for demo
        
        # Generate match details
        match_details = {
            "job_id": job_id,
            "job_title": job["title"],
            "match_score": match_score,
            "skills_match": {
                "matching": ["Python", "AWS"],
                "missing": ["Docker", "Kubernetes"]
            },
            "experience_match": {
                "required": "3+ years",
                "user": "5 years"
            },
            "location_match": {
                "job_location": job["location"],
                "preferred_location": "Remote"
            },
            "salary_match": {
                "job_range": job["salary_range"],
                "expected": {"min": 100000, "max": 150000, "currency": "USD"}
            }
        }
        
        return match_details
    
    def get_similar_jobs(self, job_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get similar jobs to a given job.
        
        Args:
            job_id: Job ID
            limit: Maximum number of similar jobs to return
            
        Returns:
            List of similar jobs
        """
        # Find the job
        job = next((j for j in self.sample_jobs if j["id"] == job_id), None)
        if not job:
            return []
        
        # In a real implementation, this would use semantic similarity
        # For demo, return other jobs with similarity scores
        similar_jobs = []
        
        for other_job in self.sample_jobs:
            if other_job["id"] == job_id:
                continue
            
            # Calculate a mock similarity score (0-100%)
            similarity = 0.0
            
            # Simple word overlap for demo
            title_words = set(job["title"].lower().split())
            other_title_words = set(other_job["title"].lower().split())
            if title_words.intersection(other_title_words):
                similarity += 0.3
            
            # Same location
            if job["location"] == other_job["location"]:
                similarity += 0.2
            
            # Similar requirements
            job_reqs = set(job["requirements"])
            other_reqs = set(other_job["requirements"])
            req_overlap = len(job_reqs.intersection(other_reqs)) / max(len(job_reqs), len(other_reqs))
            similarity += req_overlap * 0.5
            
            # Add similarity to job
            job_with_similarity = other_job.copy()
            job_with_similarity["similarity"] = min(similarity, 1.0)
            
            similar_jobs.append(job_with_similarity)
        
        # Sort by similarity
        similar_jobs.sort(key=lambda j: j["similarity"], reverse=True)
        
        # Limit results
        limited_jobs = similar_jobs[:limit]
        
        return limited_jobs 