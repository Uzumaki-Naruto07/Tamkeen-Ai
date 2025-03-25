import os
import json
import time
import random
import logging
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime, timedelta
import requests
import re
import hashlib

# Optional dependencies - allow graceful fallback if not available
try:
    import nltk
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    NLTK_AVAILABLE = True
    # Download required NLTK data if not already present
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
except ImportError:
    NLTK_AVAILABLE = False


class JobSearch:
    """
    Job search and recommendation engine that integrates with multiple
    job boards and provides personalized job recommendations.
    """
    
    def __init__(self, 
               api_keys: Optional[Dict[str, str]] = None,
               cache_dir: Optional[str] = None,
               cache_duration: int = 3600,  # 1 hour cache by default
               user_agent: Optional[str] = None):
        """
        Initialize the job search engine
        
        Args:
            api_keys: Dictionary of API keys for various job boards
            cache_dir: Directory to cache job search results
            cache_duration: Duration to cache results (in seconds)
            user_agent: Custom user agent string for API requests
        """
        self.api_keys = api_keys or {}
        self.cache_duration = cache_duration
        self.logger = logging.getLogger(__name__)
        
        # Set up cache directory
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = None
            
        # Setup user agent
        if user_agent:
            self.user_agent = user_agent
        else:
            self.user_agent = "TamkeenAI Career System/1.0"
            
        # Check available job boards
        self.available_boards = []
        
        # Add boards based on available API keys
        if "indeed_client_id" in self.api_keys and "indeed_client_secret" in self.api_keys:
            self.available_boards.append("indeed")
            
        if "linkedin_client_id" in self.api_keys and "linkedin_client_secret" in self.api_keys:
            self.available_boards.append("linkedin")
            
        if "glassdoor_api_key" in self.api_keys:
            self.available_boards.append("glassdoor")
            
        if "reed_api_key" in self.api_keys:
            self.available_boards.append("reed")
        
        # Always add these as they don't require API keys
        self.available_boards.append("usajobs")
        self.available_boards.append("github_jobs")
        
        self.logger.info(f"Job search initialized with boards: {', '.join(self.available_boards)}")
        
    def search_jobs(self, 
                  query: str,
                  location: Optional[str] = None,
                  job_boards: Optional[List[str]] = None,
                  filters: Optional[Dict[str, Any]] = None,
                  limit: int = 50,
                  sort_by: str = "relevance") -> List[Dict[str, Any]]:
        """
        Search for jobs across multiple job boards
        
        Args:
            query: Search query (job title, keywords, etc.)
            location: Job location
            job_boards: List of job boards to search (defaults to all available)
            filters: Additional filters (experience level, job type, etc.)
            limit: Maximum number of results to return
            sort_by: How to sort results (relevance, date, salary)
            
        Returns:
            List of job listings
        """
        filters = filters or {}
        job_boards = job_boards or self.available_boards
        
        # Check cache first
        cache_key = self._generate_cache_key(query, location, job_boards, filters, sort_by)
        cached_results = self._get_cached_results(cache_key)
        if cached_results:
            self.logger.info(f"Returning cached results for query: {query}")
            return cached_results[:limit]
        
        # Initialize results
        all_results = []
        
        # Search each job board
        for board in job_boards:
            if board not in self.available_boards:
                self.logger.warning(f"Job board '{board}' is not available")
                continue
                
            try:
                board_method = getattr(self, f"_search_{board}", None)
                if board_method:
                    board_results = board_method(query, location, filters)
                    if board_results:
                        for job in board_results:
                            job['source'] = board
                        all_results.extend(board_results)
                        self.logger.info(f"Found {len(board_results)} jobs on {board}")
                else:
                    self.logger.warning(f"Search method for '{board}' not implemented")
            except Exception as e:
                self.logger.error(f"Error searching {board}: {str(e)}")
        
        # Sort results
        sorted_results = self._sort_results(all_results, sort_by)
        
        # Cache results
        if self.cache_dir:
            self._cache_results(cache_key, sorted_results)
        
        # Return limited results
        return sorted_results[:limit]
    
    def get_job_details(self, job_id: str, source: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific job
        
        Args:
            job_id: Unique identifier for the job
            source: Job board source
            
        Returns:
            Detailed job information or None if not found
        """
        if source not in self.available_boards:
            self.logger.warning(f"Job board '{source}' is not available")
            return None
            
        try:
            detail_method = getattr(self, f"_get_details_{source}", None)
            if detail_method:
                return detail_method(job_id)
            else:
                self.logger.warning(f"Get details method for '{source}' not implemented")
        except Exception as e:
            self.logger.error(f"Error getting job details from {source}: {str(e)}")
            
        return None
        
    def recommend_jobs(self, 
                     user_profile: Dict[str, Any],
                     location: Optional[str] = None,
                     job_boards: Optional[List[str]] = None,
                     limit: int = 20) -> List[Dict[str, Any]]:
        """
        Recommend jobs based on user profile
        
        Args:
            user_profile: User profile containing skills, experience, etc.
            location: Preferred job location
            job_boards: List of job boards to search
            limit: Maximum number of recommendations
            
        Returns:
            List of recommended job listings
        """
        # Extract relevant information from user profile
        skills = user_profile.get('skills', [])
        experience = user_profile.get('experience', [])
        education = user_profile.get('education', [])
        
        # Build search query
        query_parts = []
        
        # Add job titles from experience
        job_titles = [exp.get('title', '') for exp in experience if 'title' in exp]
        if job_titles:
            query_parts.append(' OR '.join(f'"{title}"' for title in job_titles[:3]))
        
        # Add top skills
        top_skills = skills[:5] if isinstance(skills, list) else []
        if top_skills:
            query_parts.append(' OR '.join(f'"{skill}"' for skill in top_skills))
        
        # Add degrees and fields of study
        degrees = []
        for edu in education:
            if 'degree' in edu and 'field' in edu:
                degrees.append(f"{edu['degree']} {edu['field']}")
            elif 'degree' in edu:
                degrees.append(edu['degree'])
                
        if degrees:
            query_parts.append(' OR '.join(f'"{degree}"' for degree in degrees[:2]))
        
        # Combine query parts
        query = ' '.join(f"({part})" for part in query_parts if part)
        
        if not query:
            # Fallback to industry or interests if no query could be built
            industry = user_profile.get('industry', '')
            interests = user_profile.get('interests', [])
            
            if industry:
                query = industry
            elif interests and isinstance(interests, list):
                query = ' OR '.join(interests[:3])
            else:
                return []
        
        # Set up filters based on user profile
        filters = {}
        
        # Experience level
        total_years = sum(exp.get('years', 0) for exp in experience if 'years' in exp)
        if total_years < 2:
            filters['experience_level'] = 'entry'
        elif total_years < 5:
            filters['experience_level'] = 'mid'
        else:
            filters['experience_level'] = 'senior'
        
        # Job type preference
        job_type = user_profile.get('job_type_preference', 'full_time')
        filters['job_type'] = job_type
        
        # Search for jobs
        search_results = self.search_jobs(
            query=query,
            location=location or user_profile.get('location', ''),
            job_boards=job_boards,
            filters=filters,
            limit=limit*2,  # Get more results to filter them further
            sort_by='relevance'
        )
        
        # Further refine results based on user profile
        scored_results = self._score_jobs_for_user(search_results, user_profile)
        
        # Sort by score
        recommendations = sorted(scored_results, key=lambda x: x['match_score'], reverse=True)
        
        return recommendations[:limit]
        
    def _score_jobs_for_user(self, 
                          jobs: List[Dict[str, Any]], 
                          user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Score jobs based on how well they match the user profile
        
        Args:
            jobs: List of job listings
            user_profile: User profile dictionary
            
        Returns:
            Jobs with added match_score field
        """
        user_skills = set(skill.lower() for skill in user_profile.get('skills', []))
        user_titles = set(exp.get('title', '').lower() for exp in user_profile.get('experience', []) 
                     if 'title' in exp)
        
        # Extract years of experience
        user_years = sum(exp.get('years', 0) for exp in user_profile.get('experience', []) 
                    if 'years' in exp)
        
        for job in jobs:
            score = 0.0
            max_score = 100.0
            
            # Job title match
            job_title = job.get('title', '').lower()
            if any(title in job_title or job_title in title for title in user_titles):
                score += 30.0
            
            # Skills match
            job_skills = set()
            # Extract skills from description
            desc = job.get('description', '').lower()
            
            if user_skills:
                # Count matching skills
                matching_skills = sum(1 for skill in user_skills if skill.lower() in desc)
                skill_score = (matching_skills / len(user_skills)) * 40.0 if user_skills else 0
                score += skill_score
            
            # Experience match
            req_experience = job.get('experience_required', 0)
            if req_experience > 0:
                if user_years >= req_experience:
                    score += 20.0
                else:
                    # Partial match
                    score += (user_years / req_experience) * 15.0
            else:
                # No experience specified, assume entry level
                score += 10.0
            
            # Location match
            user_location = user_profile.get('location', '').lower()
            job_location = job.get('location', '').lower()
            
            if user_location and job_location:
                if user_location in job_location or job_location in user_location:
                    score += 10.0
            
            # Add match score to job object
            job['match_score'] = min(score, max_score)
            
        return jobs
        
    # ===== Internal methods =====
    
    def _generate_cache_key(self, 
                          query: str, 
                          location: Optional[str], 
                          job_boards: List[str],
                          filters: Dict[str, Any],
                          sort_by: str) -> str:
        """Generate a cache key from search parameters"""
        # Create a string representation of the search
        params = {
            'query': query,
            'location': location,
            'job_boards': sorted(job_boards),
            'filters': {k: filters[k] for k in sorted(filters.keys())},
            'sort_by': sort_by
        }
        
        # Generate a hash of the parameters
        param_str = json.dumps(params, sort_keys=True)
        return hashlib.md5(param_str.encode('utf-8')).hexdigest()
        
    def _get_cached_results(self, cache_key: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached results if available and not expired"""
        if not self.cache_dir:
            return None
            
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        if not os.path.exists(cache_file):
            return None
            
        # Check if cache is expired
        file_age = time.time() - os.path.getmtime(cache_file)
        if file_age > self.cache_duration:
            return None
            
        try:
            with open(cache_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error reading cache: {str(e)}")
            return None
            
    def _cache_results(self, cache_key: str, results: List[Dict[str, Any]]) -> None:
        """Cache search results"""
        if not self.cache_dir:
            return
            
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        try:
            with open(cache_file, 'w') as f:
                json.dump(results, f)
        except Exception as e:
            self.logger.error(f"Error writing cache: {str(e)}")
            
    def _sort_results(self, 
                    results: List[Dict[str, Any]], 
                    sort_by: str) -> List[Dict[str, Any]]:
        """Sort job results by the specified criterion"""
        if not results:
            return []
            
        if sort_by == 'date':
            # Sort by date posted (most recent first)
            return sorted(results, 
                      key=lambda x: x.get('date_posted', '1970-01-01'), 
                      reverse=True)
                      
        elif sort_by == 'salary':
            # Sort by salary (highest first)
            return sorted(results, 
                      key=lambda x: x.get('salary_max', 0), 
                      reverse=True)
                      
        elif sort_by == 'relevance':
            # Results are already sorted by relevance by each API
            return results
            
        else:
            # Default to relevance
            return results
            
    # ===== Job board specific search methods =====
    
    def _search_indeed(self, 
                    query: str, 
                    location: Optional[str], 
                    filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search jobs on Indeed"""
        if "indeed_client_id" not in self.api_keys or "indeed_client_secret" not in self.api_keys:
            return []
            
        try:
            # Implementation depends on Indeed API
            # This is a placeholder for the API call
            self.logger.info(f"Searching Indeed for: {query} in {location}")
            
            # Mock results for development
            if os.environ.get('ENVIRONMENT') == 'development':
                return self._generate_mock_jobs(query, location, 'indeed', 15)
                
            # Actual API implementation would go here
            return []
            
        except Exception as e:
            self.logger.error(f"Indeed search error: {str(e)}")
            return []
            
    def _search_linkedin(self, 
                       query: str, 
                       location: Optional[str], 
                       filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search jobs on LinkedIn"""
        if "linkedin_client_id" not in self.api_keys or "linkedin_client_secret" not in self.api_keys:
            return []
            
        try:
            # Implementation depends on LinkedIn API
            self.logger.info(f"Searching LinkedIn for: {query} in {location}")
            
            # Mock results for development
            if os.environ.get('ENVIRONMENT') == 'development':
                return self._generate_mock_jobs(query, location, 'linkedin', 15)
                
            # Actual API implementation would go here
            return []
            
        except Exception as e:
            self.logger.error(f"LinkedIn search error: {str(e)}")
            return []
            
    def _search_usajobs(self, 
                     query: str, 
                     location: Optional[str], 
                     filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search jobs on USAJobs"""
        try:
            # USAJobs API endpoint
            url = "https://data.usajobs.gov/api/search"
            
            # Prepare request parameters
            params = {
                "Keyword": query,
                "ResultsPerPage": 50
            }
            
            if location:
                params["LocationName"] = location
                
            # Map filters to USAJobs parameters
            if "job_type" in filters:
                job_type_map = {
                    "full_time": "Full-time",
                    "part_time": "Part-time",
                    "contract": "Term",
                    "temporary": "Temporary",
                    "internship": "Internship"
                }
                params["WorkSchedule"] = job_type_map.get(filters["job_type"], "Full-time")
                
            if "experience_level" in filters:
                exp_level_map = {
                    "entry": "15",  # GS-1/5
                    "mid": "59",    # GS-6/9
                    "senior": "1112"  # GS-11/12
                }
                params["PayGradeHigh"] = exp_level_map.get(filters["experience_level"], "")
                
            # Request headers
            headers = {
                "User-Agent": self.user_agent,
                "Host": "data.usajobs.gov"
            }
            
            # Add API key if available
            if "usajobs_api_key" in self.api_keys:
                headers["Authorization-Key"] = self.api_keys["usajobs_api_key"]
                
            # Make the request
            response = requests.get(url, params=params, headers=headers)
            
            if response.status_code != 200:
                self.logger.error(f"USAJobs API error: {response.status_code}")
                return []
                
            data = response.json()
            
            # Parse response
            jobs = []
            for item in data.get("SearchResult", {}).get("SearchResultItems", []):
                job = {
                    "id": item.get("MatchedObjectId", ""),
                    "title": item.get("MatchedObjectDescriptor", {}).get("PositionTitle", ""),
                    "company": item.get("MatchedObjectDescriptor", {}).get("DepartmentName", ""),
                    "location": item.get("MatchedObjectDescriptor", {}).get("PositionLocationDisplay", ""),
                    "description": item.get("MatchedObjectDescriptor", {}).get("QualificationSummary", ""),
                    "url": item.get("MatchedObjectDescriptor", {}).get("ApplyURI", [""])[0],
                    "date_posted": item.get("MatchedObjectDescriptor", {}).get("PublicationStartDate", ""),
                    "job_type": item.get("MatchedObjectDescriptor", {}).get("PositionSchedule", [{}])[0].get("Name", ""),
                    "salary_min": self._parse_salary(item.get("MatchedObjectDescriptor", {}).get("PositionRemuneration", [{}])[0].get("MinimumRange", "")),
                    "salary_max": self._parse_salary(item.get("MatchedObjectDescriptor", {}).get("PositionRemuneration", [{}])[0].get("MaximumRange", "")),
                    "source": "usajobs"
                }
                jobs.append(job)
                
            return jobs
            
        except Exception as e:
            self.logger.error(f"USAJobs search error: {str(e)}")
            return []
            
    def _generate_mock_jobs(self, 
                         query: str, 
                         location: Optional[str], 
                         source: str,
                         count: int = 10) -> List[Dict[str, Any]]:
        """Generate mock job listings for development testing"""
        if not NLTK_AVAILABLE:
            # Simple fallback if NLTK is not available
            skills = ["Python", "JavaScript", "Java", "C++", "Machine Learning", 
                   "Data Analysis", "React", "Node.js", "SQL", "AWS"]
            query_parts = query.lower().split()
        else:
            # Use NLTK for better text processing
            stop_words = set(stopwords.words('english'))
            query_tokens = word_tokenize(query.lower())
            query_parts = [word for word in query_tokens if word.isalnum() and word not in stop_words]
            
            # Common tech skills
            skills = ["Python", "JavaScript", "Java", "C++", "Machine Learning", 
                   "Data Analysis", "React", "Node.js", "SQL", "AWS", 
                   "Docker", "Kubernetes", "TensorFlow", "PyTorch", "Git",
                   "Agile", "Scrum", "CI/CD", "REST API", "GraphQL"]
        
        companies = [
            "TechCorp Solutions", "Digital Innovations Inc.", "ByteStream Technologies",
            "Quantum Software", "Apex Systems", "DataWave Analytics", "Cloud Sphere",
            "Neural Systems", "Logic Gate Solutions", "Cyber Security Alliance",
            "Global Tech Partners", "Fusion Technologies", "Binary Solutions",
            "Rapid Innovations", "Venture Technologies"
        ]
        
        job_titles = [
            "Software Engineer", "Data Scientist", "Web Developer", "DevOps Engineer",
            "Systems Architect", "Product Manager", "UX/UI Designer", "Database Administrator",
            "Network Engineer", "Security Analyst", "Full Stack Developer", "AI Researcher",
            "Cloud Engineer", "Mobile Developer", "QA Engineer"
        ]
        
        jobs = []
        for i in range(count):
            # Select job title, preferring those matching the query
            if any(part in [t.lower() for t in job_titles] for part in query_parts):
                matching_titles = [t for t in job_titles 
                                if any(part in t.lower() for part in query_parts)]
                title = random.choice(matching_titles) if matching_titles else random.choice(job_titles)
            else:
                title = random.choice(job_titles)
                
            # Add seniority level sometimes
            if random.random() < 0.7:
                levels = ["Junior", "Senior", "Lead", "Principal", "Staff"]
                weights = [0.3, 0.4, 0.15, 0.1, 0.05]
                level = random.choices(levels, weights=weights)[0]
                title = f"{level} {title}"
                
            company = random.choice(companies)
            
            # Generate realistic location
            if location:
                job_location = location
                if random.random() < 0.3:
                    # Add specificity sometimes
                    areas = ["Downtown", "North", "South", "East", "West", "Central"]
                    job_location = f"{random.choice(areas)} {location}"
            else:
                cities = ["New York, NY", "San Francisco, CA", "Seattle, WA", "Austin, TX", 
                       "Boston, MA", "Chicago, IL", "Denver, CO", "Atlanta, GA"]
                job_location = random.choice(cities)
                
            # Select skills that might be relevant to the query
            related_skills = [s for s in skills if any(part in s.lower() for part in query_parts)]
            if not related_skills:
                related_skills = skills
                
            # Pick a few skills for this job
            job_skills = random.sample(related_skills, min(random.randint(3, 7), len(related_skills)))
            
            # Generate description
            description = f"We are looking for a {title} to join our team at {company}. "
            description += f"The ideal candidate will have experience with {', '.join(job_skills[:-1])} and {job_skills[-1]}. "
            
            paragraphs = [
                "You will work on cutting-edge projects in a collaborative environment.",
                f"This role requires strong skills in {random.choice(job_skills)} and a passion for innovation.",
                f"Join our talented team building the future of technology in {job_location}.",
                "We offer competitive salary, benefits, and career growth opportunities.",
                f"Experience with {random.choice(job_skills)} is highly desirable for this position."
            ]
            
            description += " ".join(random.sample(paragraphs, 3))
            
            # Generate salary range
            base_salary = random.randint(60000, 120000)
            salary_min = base_salary - random.randint(0, 15000)
            salary_max = base_salary + random.randint(10000, 30000)
            
            # Generate random date in last 30 days
            days_ago = random.randint(0, 30)
            post_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            post_date = post_date - timedelta(days=days_ago)
            date_str = post_date.strftime("%Y-%m-%d")
            
            # Job type
            job_types = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"]
            weights = [0.7, 0.1, 0.1, 0.05, 0.05]
            job_type = random.choices(job_types, weights=weights)[0]
            
            # Experience required
            exp_years = 0
            if "junior" in title.lower():
                exp_years = random.randint(0, 2)
            elif "senior" in title.lower() or "lead" in title.lower():
                exp_years = random.randint(3, 8)
            elif "principal" in title.lower() or "staff" in title.lower():
                exp_years = random.randint(5, 12)
            else:
                exp_years = random.randint(1, 5)
                
            job = {
                "id": f"{source}_{i}_{int(time.time())}",
                "title": title,
                "company": company,
                "location": job_location,
                "description": description,
                "date_posted": date_str,
                "url": f"https://example.com/{source}/jobs/{i}",
                "salary_min": salary_min,
                "salary_max": salary_max,
                "job_type": job_type,
                "required_skills": job_skills,
                "experience_required": exp_years,
                "source": source
            }
            
            jobs.append(job)
            
        return jobs
        
    def _parse_salary(self, salary_str: str) -> float:
        """Parse salary string to float"""
        if not salary_str:
            return 0.0
            
        try:
            # Remove any non-numeric characters except decimal point
            clean_str = re.sub(r'[^\d.]', '', salary_str)
            return float(clean_str)
        except:
            return 0.0
