"""
Job Matching Module

This module provides functionality for matching resumes to jobs,
calculating match scores, and suggesting job recommendations.
"""

import logging
import math
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple, Union

# Import utilities
from backend.utils.preprocess import (
    preprocess_text, extract_skills, extract_keywords, 
    calculate_similarity, normalize_job_titles
)

# Import database models
from backend.database.models import Job, User, Resume, JobApplication

# Setup logger
logger = logging.getLogger(__name__)


class JobMatcher:
    """Job matching class for matching resumes to jobs"""
    
    def __init__(self):
        """Initialize job matcher"""
        self.skill_importance_weight = 0.5
        self.experience_importance_weight = 0.3
        self.education_importance_weight = 0.2
        
        # Skills taxonomy
        self.skills_taxonomy = self._load_skills_taxonomy()
        
        # Job title normalization
        self.job_title_mappings = self._load_job_title_mappings()
    
    def _load_skills_taxonomy(self) -> Dict[str, List[str]]:
        """
        Load skills taxonomy for skill normalization and grouping
        
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
            # Add more skill categories as needed
        }
    
    def _load_job_title_mappings(self) -> Dict[str, str]:
        """
        Load job title mappings for normalization
        
        Returns:
            Dict mapping job title variations to standardized titles
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "software engineer": "software engineer",
            "software developer": "software engineer",
            "programmer": "software engineer",
            "coder": "software engineer",
            
            "data scientist": "data scientist",
            "ml engineer": "data scientist",
            "machine learning engineer": "data scientist",
            "ai researcher": "data scientist",
            
            "web developer": "web developer",
            "frontend developer": "web developer",
            "frontend engineer": "web developer",
            "ui developer": "web developer",
            
            "backend developer": "backend developer",
            "backend engineer": "backend developer",
            "api developer": "backend developer",
            
            "devops engineer": "devops engineer",
            "site reliability engineer": "devops engineer",
            "infrastructure engineer": "devops engineer",
            "cloud engineer": "devops engineer",
            
            # Add more job title mappings as needed
        }
    
    def search_jobs(self, query: str = "", filters: Dict[str, Any] = None, 
                  page: int = 1, limit: int = 10, 
                  sort_by: str = "date", sort_order: str = "desc") -> Tuple[List[Dict[str, Any]], int]:
        """
        Search for jobs with query and filters
        
        Args:
            query: Search query
            filters: Filters dict (location, job_type, etc.)
            page: Page number
            limit: Results per page
            sort_by: Sort field
            sort_order: Sort order ('asc' or 'desc')
            
        Returns:
            Tuple of (list of job dicts, total count)
        """
        try:
            # Get active jobs
            all_jobs = Job.find_active()
            
            # Filter jobs
            filtered_jobs = self._filter_jobs(all_jobs, query, filters)
            
            # Sort jobs
            sorted_jobs = self._sort_jobs(filtered_jobs, sort_by, sort_order)
            
            # Get total count
            total = len(sorted_jobs)
            
            # Paginate
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_jobs = sorted_jobs[start_idx:end_idx]
            
            # Convert to dict format
            job_dicts = [job.to_dict() for job in paginated_jobs]
            
            return job_dicts, total
            
        except Exception as e:
            logger.error(f"Error searching jobs: {str(e)}")
            return [], 0
    
    def _filter_jobs(self, jobs: List[Any], query: str = "", 
                   filters: Dict[str, Any] = None) -> List[Any]:
        """
        Filter jobs by query and filters
        
        Args:
            jobs: List of job objects
            query: Search query
            filters: Filters dict
            
        Returns:
            Filtered list of jobs
        """
        if not filters:
            filters = {}
        
        # Preprocess query for better matching
        processed_query = preprocess_text(query) if query else ""
        query_keywords = extract_keywords(processed_query) if query else []
        
        filtered_jobs = []
        
        for job in jobs:
            # Check if job should be included
            include = True
            
            # Filter by location
            if filters.get('location') and filters['location'].lower() not in job.location.lower():
                include = False
                continue
            
            # Filter by job type
            if filters.get('job_type') and filters['job_type'] != job.job_type:
                include = False
                continue
            
            # Filter by company
            if filters.get('company') and filters['company'].lower() not in job.company.lower():
                include = False
                continue
            
            # Filter by industry
            if filters.get('industry') and filters['industry'] != job.industry:
                include = False
                continue
            
            # Filter by experience level
            if filters.get('experience'):
                if not self._matches_experience_filter(job.experience_required, filters['experience']):
                    include = False
                    continue
            
            # Filter by query text
            if query:
                # Preprocess job text for matching
                job_text = f"{job.title} {job.description} {job.company} {job.skills}"
                processed_job_text = preprocess_text(job_text)
                
                # Check if query matches job text
                if not any(keyword in processed_job_text for keyword in query_keywords):
                    include = False
                    continue
            
            # If all filters pass, include the job
            if include:
                filtered_jobs.append(job)
        
        return filtered_jobs
    
    def _matches_experience_filter(self, job_experience: str, filter_experience: str) -> bool:
        """
        Check if job experience matches the experience filter
        
        Args:
            job_experience: Job experience level
            filter_experience: Filter experience level
            
        Returns:
            True if matches, False otherwise
        """
        # Map common experience level terms
        experience_levels = {
            "entry": ["entry", "entry level", "junior", "0-1", "0-2"],
            "mid": ["mid", "mid level", "intermediate", "2-5", "3-5"],
            "senior": ["senior", "senior level", "experienced", "5-7", "5+", "7+"],
            "expert": ["expert", "lead", "principal", "8+", "10+"]
        }
        
        # Check if filter matches job experience
        if filter_experience in experience_levels:
            job_exp_lower = job_experience.lower()
            for term in experience_levels[filter_experience]:
                if term in job_exp_lower:
                    return True
            
            # Also check years of experience
            try:
                # Extract numbers from experience string
                import re
                numbers = re.findall(r'\d+', job_exp_lower)
                if numbers:
                    min_years = min(int(num) for num in numbers)
                    
                    # Match based on minimum years
                    if filter_experience == "entry" and min_years <= 2:
                        return True
                    elif filter_experience == "mid" and 2 <= min_years <= 5:
                        return True
                    elif filter_experience == "senior" and 5 <= min_years <= 8:
                        return True
                    elif filter_experience == "expert" and min_years >= 8:
                        return True
            except:
                pass
            
            return False
        
        # If filter isn't one of our defined levels, do direct text matching
        return filter_experience.lower() in job_experience.lower()
    
    def _sort_jobs(self, jobs: List[Any], sort_by: str = "date", 
                 sort_order: str = "desc") -> List[Any]:
        """
        Sort jobs by specified field
        
        Args:
            jobs: List of job objects
            sort_by: Field to sort by
            sort_order: Sort order ('asc' or 'desc')
            
        Returns:
            Sorted list of jobs
        """
        reverse = sort_order.lower() == "desc"
        
        if sort_by == "date":
            return sorted(jobs, key=lambda x: x.created_at, reverse=reverse)
        elif sort_by == "title":
            return sorted(jobs, key=lambda x: x.title, reverse=reverse)
        elif sort_by == "company":
            return sorted(jobs, key=lambda x: x.company, reverse=reverse)
        elif sort_by == "location":
            return sorted(jobs, key=lambda x: x.location, reverse=reverse)
        elif sort_by == "salary":
            # Sort by minimum salary in range if available
            def get_min_salary(job):
                try:
                    if hasattr(job, 'salary_range') and isinstance(job.salary_range, dict):
                        return job.salary_range.get('min', 0)
                    return 0
                except:
                    return 0
            return sorted(jobs, key=get_min_salary, reverse=reverse)
        else:
            # Default to date sorting
            return sorted(jobs, key=lambda x: x.created_at, reverse=reverse)
    
    def get_recommended_jobs(self, user_id: str, resume_data: Dict[str, Any] = None,
                           page: int = 1, limit: int = 10) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get recommended jobs for a user
        
        Args:
            user_id: User ID
            resume_data: Parsed resume data
            page: Page number
            limit: Results per page
            
        Returns:
            Tuple of (recommended jobs list, total count)
        """
        try:
            # Get active jobs
            all_jobs = Job.find_active()
            
            # Get user's applied jobs to exclude them
            user_applications = JobApplication.find_by_user(user_id)
            applied_job_ids = set(app.job_id for app in user_applications)
            
            # Filter out jobs the user has already applied to
            available_jobs = [job for job in all_jobs if job.id not in applied_job_ids]
            
            # Calculate match scores
            job_scores = []
            for job in available_jobs:
                score = self.calculate_job_match(job.to_dict(), resume_data)
                job_scores.append((job, score.get('overall_score', 0)))
            
            # Sort by match score (descending)
            job_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Get total count
            total = len(job_scores)
            
            # Paginate
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_jobs = job_scores[start_idx:end_idx]
            
            # Convert to dict format and add match score
            result = []
            for job, score in paginated_jobs:
                job_dict = job.to_dict()
                job_dict['match_score'] = score
                result.append(job_dict)
            
            return result, total
            
        except Exception as e:
            logger.error(f"Error getting recommended jobs: {str(e)}")
            return [], 0
    
    def calculate_job_match(self, job: Dict[str, Any], 
                          resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate match score between resume and job
        
        Args:
            job: Job data dictionary
            resume_data: Resume data dictionary
            
        Returns:
            Match score dictionary with overall and category scores
        """
        try:
            # Initialize scores
            skills_score = 0.0
            experience_score = 0.0
            education_score = 0.0
            
            # Get skills from job and resume
            job_skills = self._extract_job_skills(job)
            resume_skills = self._extract_resume_skills(resume_data)
            
            # Calculate skills match score
            if job_skills and resume_skills:
                skills_score = self._calculate_skills_match(job_skills, resume_skills)
            
            # Calculate experience match score
            experience_score = self._calculate_experience_match(job, resume_data)
            
            # Calculate education match score
            education_score = self._calculate_education_match(job, resume_data)
            
            # Calculate overall score
            overall_score = (
                (skills_score * self.skill_importance_weight) +
                (experience_score * self.experience_importance_weight) +
                (education_score * self.education_importance_weight)
            )
            
            # Format score as percentage
            overall_percent = min(round(overall_score * 100), 100)
            skills_percent = min(round(skills_score * 100), 100)
            experience_percent = min(round(experience_score * 100), 100)
            education_percent = min(round(education_score * 100), 100)
            
            # Prepare result
            result = {
                'overall_score': overall_percent,
                'skills_score': skills_percent,
                'experience_score': experience_percent,
                'education_score': education_percent,
                'matching_skills': self._get_matching_skills(job_skills, resume_skills),
                'missing_skills': self._get_missing_skills(job_skills, resume_skills)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating job match: {str(e)}")
            return {
                'overall_score': 0,
                'skills_score': 0,
                'experience_score': 0,
                'education_score': 0,
                'matching_skills': [],
                'missing_skills': []
            }
    
    def _extract_job_skills(self, job: Dict[str, Any]) -> List[str]:
        """
        Extract skills from job data
        
        Args:
            job: Job data dictionary
            
        Returns:
            List of skills
        """
        skills = []
        
        # Extract skills from dedicated skills field if available
        if job.get('skills'):
            if isinstance(job['skills'], list):
                skills.extend(job['skills'])
            elif isinstance(job['skills'], str):
                # Extract skills from skills text
                skills.extend(extract_skills(job['skills']))
        
        # Extract skills from job description
        if job.get('description'):
            skills.extend(extract_skills(job['description']))
        
        # Clean and normalize skills
        normalized_skills = []
        for skill in skills:
            skill = skill.lower().strip()
            if skill:
                normalized_skills.append(skill)
        
        # Remove duplicates
        return list(set(normalized_skills))
    
    def _extract_resume_skills(self, resume_data: Dict[str, Any]) -> List[str]:
        """
        Extract skills from resume data
        
        Args:
            resume_data: Resume data dictionary
            
        Returns:
            List of skills
        """
        skills = []
        
        # Extract skills from dedicated skills field if available
        if resume_data.get('skills'):
            if isinstance(resume_data['skills'], list):
                skills.extend(resume_data['skills'])
            elif isinstance(resume_data['skills'], str):
                # Extract skills from skills text
                skills.extend(extract_skills(resume_data['skills']))
        
        # Extract skills from work experience
        if resume_data.get('experience') and isinstance(resume_data['experience'], list):
            for exp in resume_data['experience']:
                if exp.get('description'):
                    skills.extend(extract_skills(exp['description']))
        
        # Clean and normalize skills
        normalized_skills = []
        for skill in skills:
            skill = skill.lower().strip()
            if skill:
                normalized_skills.append(skill)
        
        # Remove duplicates
        return list(set(normalized_skills))
    
    def _calculate_skills_match(self, job_skills: List[str], 
                              resume_skills: List[str]) -> float:
        """
        Calculate skills match score
        
        Args:
            job_skills: List of job skills
            resume_skills: List of resume skills
            
        Returns:
            Match score (0.0 to 1.0)
        """
        if not job_skills:
            return 0.0
        
        # Direct matches
        direct_matches = set(job_skills).intersection(set(resume_skills))
        direct_match_count = len(direct_matches)
        
        # Semantic matches (skills that are not exact matches but are related)
        semantic_matches = set()
        
        for job_skill in job_skills:
            if job_skill in direct_matches:
                continue
                
            for resume_skill in resume_skills:
                # Skip already matched skills
                if resume_skill in direct_matches or resume_skill in semantic_matches:
                    continue
                
                # Check if skills are semantically similar
                similarity = calculate_similarity(job_skill, resume_skill)
                if similarity > 0.8:  # Threshold for semantic similarity
                    semantic_matches.add(resume_skill)
                    break
        
        semantic_match_count = len(semantic_matches)
        
        # Calculate total match score
        # Direct matches count fully, semantic matches count partially
        total_match_score = direct_match_count + (semantic_match_count * 0.5)
        
        # Normalize by number of job skills
        return min(total_match_score / len(job_skills), 1.0)
    
    def _calculate_experience_match(self, job: Dict[str, Any], 
                                  resume_data: Dict[str, Any]) -> float:
        """
        Calculate experience match score
        
        Args:
            job: Job data dictionary
            resume_data: Resume data dictionary
            
        Returns:
            Match score (0.0 to 1.0)
        """
        # Extract job experience requirement
        job_experience_years = self._extract_job_experience_years(job)
        if job_experience_years is None:
            return 0.5  # Default when job doesn't specify experience
        
        # Extract resume experience
        resume_experience_years = self._extract_resume_experience_years(resume_data)
        if resume_experience_years is None:
            return 0.0  # No experience found in resume
        
        # Calculate score based on how close the experience is to the requirement
        if resume_experience_years >= job_experience_years:
            # Candidate meets or exceeds the requirement
            return 1.0
        else:
            # Candidate has some experience but less than required
            # Score decreases linearly as the gap increases
            ratio = resume_experience_years / job_experience_years
            return max(0.0, min(ratio, 1.0))
    
    def _extract_job_experience_years(self, job: Dict[str, Any]) -> Optional[float]:
        """
        Extract years of experience required from job data
        
        Args:
            job: Job data dictionary
            
        Returns:
            Years of experience or None
        """
        try:
            # Check for dedicated experience field
            if job.get('experience_required'):
                experience_text = job['experience_required']
                return self._parse_experience_text(experience_text)
            
            # Check for experience in job description
            if job.get('description'):
                import re
                # Look for common experience patterns in the description
                patterns = [
                    r'(\d+)\+?\s*years?(?:\s*of)?(?:\s*experience)?',
                    r'(\d+)(?:\s*to|-)\s*(\d+)(?:\s*years)?(?:\s*of)?(?:\s*experience)?',
                    r'(?:minimum|min|at least)(?:\s*of)?\s*(\d+)(?:\s*years)?(?:\s*of)?(?:\s*experience)?'
                ]
                
                for pattern in patterns:
                    matches = re.search(pattern, job['description'], re.IGNORECASE)
                    if matches:
                        # If range (e.g., "3-5 years"), take the lower number
                        if len(matches.groups()) > 1 and matches.group(2):
                            return float(matches.group(1))
                        return float(matches.group(1))
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting job experience: {str(e)}")
            return None
    
    def _extract_resume_experience_years(self, resume_data: Dict[str, Any]) -> Optional[float]:
        """
        Extract years of experience from resume data
        
        Args:
            resume_data: Resume data dictionary
            
        Returns:
            Years of experience or None
        """
        try:
            total_years = 0.0
            
            # Check for work experience entries
            if resume_data.get('experience') and isinstance(resume_data['experience'], list):
                for exp in resume_data['experience']:
                    # If experience has explicit duration
                    if exp.get('duration_years'):
                        try:
                            total_years += float(exp['duration_years'])
                        except:
                            pass
                    # If experience has start and end dates
                    elif exp.get('start_date') and exp.get('end_date'):
                        try:
                            start_date = self._parse_date(exp['start_date'])
                            
                            # End date could be "present" or similar
                            if exp['end_date'].lower() in ['present', 'current', 'now']:
                                end_date = datetime.now()
                            else:
                                end_date = self._parse_date(exp['end_date'])
                            
                            if start_date and end_date:
                                duration = end_date - start_date
                                duration_years = duration.days / 365.25
                                total_years += duration_years
                        except:
                            pass
            
            return total_years if total_years > 0 else None
            
        except Exception as e:
            logger.error(f"Error extracting resume experience: {str(e)}")
            return None
    
    def _parse_experience_text(self, text: str) -> Optional[float]:
        """
        Parse experience text to extract years
        
        Args:
            text: Experience text
            
        Returns:
            Years of experience or None
        """
        try:
            import re
            text = text.lower()
            
            # Check for ranges like "3-5 years"
            range_match = re.search(r'(\d+)(?:\s*-\s*|\s*to\s*)(\d+)', text)
            if range_match:
                # Take the minimum years in the range
                return float(range_match.group(1))
            
            # Check for "X+ years"
            plus_match = re.search(r'(\d+)\+', text)
            if plus_match:
                return float(plus_match.group(1))
            
            # Check for "X years"
            years_match = re.search(r'(\d+)(?:\s*years?)', text)
            if years_match:
                return float(years_match.group(1))
            
            # Check for experience levels
            if any(term in text for term in ['entry', 'junior', 'fresher']):
                return 0.0
            if any(term in text for term in ['mid', 'intermediate']):
                return 3.0
            if any(term in text for term in ['senior', 'experienced']):
                return 5.0
            if any(term in text for term in ['expert', 'lead', 'principal']):
                return 8.0
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing experience text: {str(e)}")
            return None
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """
        Parse date string
        
        Args:
            date_str: Date string
            
        Returns:
            Datetime object or None
        """
        try:
            from dateutil import parser
            return parser.parse(date_str)
        except:
            return None
    
    def _calculate_education_match(self, job: Dict[str, Any], 
                                 resume_data: Dict[str, Any]) -> float:
        """
        Calculate education match score
        
        Args:
            job: Job data dictionary
            resume_data: Resume data dictionary
            
        Returns:
            Match score (0.0 to 1.0)
        """
        # Extract job education requirement
        required_education = self._extract_job_education(job)
        if not required_education:
            return 0.5  # Default when job doesn't specify education
        
        # Extract highest education from resume
        highest_education = self._extract_resume_education(resume_data)
        if not highest_education:
            return 0.0  # No education found in resume
        
        # Education levels with weights
        education_levels = {
            'high school': 1,
            'associate': 2,
            'bachelor': 3,
            'undergraduate': 3,
            'master': 4,
            'mba': 4,
            'phd': 5,
            'doctorate': 5
        }
        
        # Get the level weights
        required_level = 0
        for level, weight in education_levels.items():
            if level in required_education.lower():
                required_level = max(required_level, weight)
        
        highest_level = 0
        for level, weight in education_levels.items():
            if level in highest_education.lower():
                highest_level = max(highest_level, weight)
        
        # If no specific level was identified
        if required_level == 0:
            required_level = 3  # Default to bachelor's
        if highest_level == 0:
            highest_level = 1  # Default to high school
        
        # Calculate match score
        if highest_level >= required_level:
            return 1.0  # Meets or exceeds requirements
        else:
            # Partial credit for being close to the requirement
            return max(0.0, highest_level / required_level)
    
    def _extract_job_education(self, job: Dict[str, Any]) -> Optional[str]:
        """
        Extract education requirement from job data
        
        Args:
            job: Job data dictionary
            
        Returns:
            Education requirement or None
        """
        try:
            # Check for dedicated education field
            if job.get('education_required'):
                return job['education_required']
            
            # Check for education in job description
            if job.get('description'):
                import re
                # Look for common education patterns in the description
                patterns = [
                    r'(?:requires?|requiring|need|with)(?:\s*a)?\s*(bachelor|master|phd|doctorate|mba|undergraduate|associate)(?:\'s)?(?:\s*degree)?',
                    r'(bachelor|master|phd|doctorate|mba|undergraduate|associate)(?:\'s)?(?:\s*degree)(?:\s*required)?',
                    r'(?:degree)(?:\s*in)(?:\s*[a-zA-Z\s,]+)?(?:\s*or related field)?'
                ]
                
                for pattern in patterns:
                    matches = re.search(pattern, job['description'], re.IGNORECASE)
                    if matches and matches.group(1):
                        return matches.group(1)
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting job education: {str(e)}")
            return None
    
    def _extract_resume_education(self, resume_data: Dict[str, Any]) -> Optional[str]:
        """
        Extract highest education from resume data
        
        Args:
            resume_data: Resume data dictionary
            
        Returns:
            Highest education level or None
        """
        try:
            # Education level weights for comparison
            education_weights = {
                'high school': 1,
                'associate': 2,
                'bachelor': 3,
                'undergrad': 3,
                'master': 4,
                'mba': 4,
                'phd': 5,
                'doctorate': 5
            }
            
            highest_education = None
            highest_weight = 0
            
            # Check for education entries
            if resume_data.get('education') and isinstance(resume_data['education'], list):
                for edu in resume_data['education']:
                    if edu.get('degree') or edu.get('level'):
                        degree_text = (edu.get('degree') or '') + ' ' + (edu.get('level') or '')
                        degree_text = degree_text.lower()
                        
                        # Find the highest education level
                        for level, weight in education_weights.items():
                            if level in degree_text and weight > highest_weight:
                                highest_education = degree_text
                                highest_weight = weight
            
            return highest_education
            
        except Exception as e:
            logger.error(f"Error extracting resume education: {str(e)}")
            return None
    
    def _get_matching_skills(self, job_skills: List[str], 
                           resume_skills: List[str]) -> List[str]:
        """
        Get skills that match between job and resume
        
        Args:
            job_skills: List of job skills
            resume_skills: List of resume skills
            
        Returns:
            List of matching skills
        """
        # Direct matches
        direct_matches = set(job_skills).intersection(set(resume_skills))
        
        # Semantic matches
        semantic_matches = set()
        
        for job_skill in job_skills:
            if job_skill in direct_matches:
                continue
                
            for resume_skill in resume_skills:
                # Skip already matched skills
                if resume_skill in direct_matches or resume_skill in semantic_matches:
                    continue
                
                # Check if skills are semantically similar
                similarity = calculate_similarity(job_skill, resume_skill)
                if similarity > 0.8:
                    semantic_matches.add(job_skill)
                    break
        
        return list(direct_matches) + list(semantic_matches)
    
    def _get_missing_skills(self, job_skills: List[str], 
                          resume_skills: List[str]) -> List[str]:
        """
        Get skills in the job that are missing from the resume
        
        Args:
            job_skills: List of job skills
            resume_skills: List of resume skills
            
        Returns:
            List of missing skills
        """
        # Get matching skills
        matching = self._get_matching_skills(job_skills, resume_skills)
        
        # Return skills that are not in the matching set
        return [skill for skill in job_skills if skill not in matching] 