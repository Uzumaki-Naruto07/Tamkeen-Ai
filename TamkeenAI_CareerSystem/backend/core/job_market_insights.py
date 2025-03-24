"""
Job Market Insights Module

This module provides functionality for analyzing job market trends, skill demands,
and salary information to support career decisions.
"""

import os
import json
import uuid
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta

# Try to import requests, with fallback
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Requests not installed. Install with: pip install requests")

from urllib.parse import urlencode
import time

# Import database models
from backend.database.models import JobMarketData, JobMarketQuery
from backend.database.connector import get_db, DatabaseError

# Import utilities
from backend.utils.file_utils import save_json_file
from backend.utils.cache_utils import cache_result

# Import settings
from backend.config.settings import JOB_MARKET_API, FEATURES

# Setup logger
logger = logging.getLogger(__name__)


class JobMarketAnalyzer:
    """Job market analysis and insights class"""
    
    def __init__(self):
        """Initialize analyzer with config"""
        self.config = JOB_MARKET_API
        self.cache_ttl = self.config.get('cache_ttl', 3600)  # 1 hour default
        
        # Load default data if available
        self.default_data = self._load_default_data()
    
    def _load_default_data(self) -> Dict[str, Any]:
        """
        Load default job market data
        
        Returns:
            dict: Default job market data
        """
        try:
            file_path = os.path.join(os.path.dirname(__file__), '../data/job_market_data.json')
            
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            return {}
        
        except Exception as e:
            logger.error(f"Error loading default job market data: {str(e)}")
            return {}
    
    def _call_external_api(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call external job market API
        
        Args:
            endpoint: API endpoint
            params: Query parameters
            
        Returns:
            dict: API response
        """
        if not self.config.get('enabled'):
            logger.info("External job market API is disabled")
            return {}
        
        if not REQUESTS_AVAILABLE:
            logger.error("Requests library not available. Cannot call external API.")
            return {}
        
        try:
            api_url = f"{self.config['url'].rstrip('/')}/{endpoint.lstrip('/')}"
            headers = {
                'Authorization': f"Bearer {self.config['api_key']}",
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Make API request
            response = requests.get(
                api_url, 
                params=urlencode(params),
                headers=headers,
                timeout=self.config.get('timeout', 30)
            )
            
            # Check response
            if response.status_code == 200:
                return response.json()
            
            logger.error(f"Job market API error: {response.status_code} - {response.text}")
            return {}
        
        except Exception as e:
            logger.error(f"Error calling job market API: {str(e)}")
            return {}
    
    def _save_query_result(self, query_type: str, query_params: Dict[str, Any], 
                          result: Dict[str, Any]) -> None:
        """
        Save query and result to database
        
        Args:
            query_type: Query type
            query_params: Query parameters
            result: Query result
        """
        try:
            # Save result
            market_data = JobMarketData(
                id=str(uuid.uuid4()),
                data_type=query_type,
                data=json.dumps(result),
                created_at=datetime.now().isoformat(),
                expires_at=(datetime.now() + timedelta(seconds=self.cache_ttl)).isoformat()
            )
            market_data.save()
            
            # Save query
            query = JobMarketQuery(
                id=str(uuid.uuid4()),
                query_type=query_type,
                query_params=json.dumps(query_params),
                result_id=market_data.id,
                created_at=datetime.now().isoformat()
            )
            query.save()
            
        except Exception as e:
            logger.error(f"Error saving query result: {str(e)}")
    
    @cache_result(prefix="job_market", ttl=3600)
    def get_skill_demand(self, skill: str, location: Optional[str] = None, 
                        period: str = "6m") -> Dict[str, Any]:
        """
        Get demand data for a specific skill
        
        Args:
            skill: Skill name
            location: Optional location filter
            period: Time period (1m, 3m, 6m, 1y, 2y)
            
        Returns:
            dict: Skill demand data
        """
        query_params = {
            "skill": skill,
            "period": period
        }
        
        if location:
            query_params["location"] = location
        
        # Check if feature is enabled
        if not FEATURES.get('job_market_insights', False):
            logger.info("Job market insights feature is disabled")
            return {
                "skill": skill,
                "location": location,
                "period": period,
                "note": "Job market insights feature is disabled"
            }
        
        # Try to get data from external API
        result = self._call_external_api("skills/demand", query_params)
        
        # If successful, save to database
        if result:
            self._save_query_result("skill_demand", query_params, result)
            return result
        
        # Fallback to default data
        if skill.lower() in self.default_data.get('skill_demand', {}):
            return self.default_data['skill_demand'][skill.lower()]
        
        # Return empty result
        return {
            "skill": skill,
            "location": location,
            "period": period,
            "demand_score": None,
            "trend": None,
            "data_available": False
        }
    
    @cache_result(prefix="job_market", ttl=3600)
    def get_salary_data(self, job_title: str, location: Optional[str] = None,
                       experience: Optional[str] = None) -> Dict[str, Any]:
        """
        Get salary data for a job title
        
        Args:
            job_title: Job title
            location: Optional location filter
            experience: Experience level (entry, mid, senior)
            
        Returns:
            dict: Salary data
        """
        query_params = {
            "job_title": job_title
        }
        
        if location:
            query_params["location"] = location
        
        if experience:
            query_params["experience"] = experience
        
        # Check if feature is enabled
        if not FEATURES.get('job_market_insights', False):
            logger.info("Job market insights feature is disabled")
            return {
                "job_title": job_title,
                "location": location,
                "experience": experience,
                "note": "Job market insights feature is disabled"
            }
        
        # Try to get data from external API
        result = self._call_external_api("salary", query_params)
        
        # If successful, save to database
        if result:
            self._save_query_result("salary_data", query_params, result)
            return result
        
        # Fallback to default data
        if job_title.lower() in self.default_data.get('salary_data', {}):
            data = self.default_data['salary_data'][job_title.lower()]
            
            # Filter by location if provided
            if location and 'by_location' in data:
                for loc_data in data['by_location']:
                    if location.lower() in loc_data['location'].lower():
                        return loc_data
            
            # Filter by experience if provided
            if experience and 'by_experience' in data:
                for exp_data in data['by_experience']:
                    if experience.lower() in exp_data['level'].lower():
                        return exp_data
            
            return data
        
        # Return empty result
        return {
            "job_title": job_title,
            "location": location,
            "experience": experience,
            "salary_range": None,
            "median_salary": None,
            "data_available": False
        }

    @cache_result(prefix="job_market", ttl=3600)
    def get_job_growth(self, job_title: str, location: Optional[str] = None, 
                      period: str = "1y") -> Dict[str, Any]:
        """
        Get job growth data for a job title
        
        Args:
            job_title: Job title
            location: Optional location filter
            period: Time period (1m, 3m, 6m, 1y, 2y)
            
        Returns:
            dict: Job growth data
        """
        query_params = {
            "job_title": job_title,
            "period": period
        }
        
        if location:
            query_params["location"] = location
        
        # Check if feature is enabled
        if not FEATURES.get('job_market_insights', False):
            logger.info("Job market insights feature is disabled")
            return {
                "job_title": job_title,
                "location": location,
                "period": period,
                "note": "Job market insights feature is disabled"
            }
        
        # Try to get data from external API
        result = self._call_external_api("jobs/growth", query_params)
        
        # If successful, save to database
        if result:
            self._save_query_result("job_growth", query_params, result)
            return result
        
        # Fallback to default data
        if job_title.lower() in self.default_data.get('job_growth', {}):
            return self.default_data['job_growth'][job_title.lower()]
        
        # Return empty result
        return {
            "job_title": job_title,
            "location": location,
            "period": period,
            "growth_rate": None,
            "trend": None,
            "data_available": False
        }

    @cache_result(prefix="job_market", ttl=3600)
    def get_top_skills_for_job(self, job_title: str, location: Optional[str] = None, 
                              limit: int = 10) -> Dict[str, Any]:
        """
        Get top skills for a job title
        
        Args:
            job_title: Job title
            location: Optional location filter
            limit: Maximum number of skills to return
            
        Returns:
            dict: Top skills data
        """
        query_params = {
            "job_title": job_title,
            "limit": limit
        }
        
        if location:
            query_params["location"] = location
        
        # Check if feature is enabled
        if not FEATURES.get('job_market_insights', False):
            logger.info("Job market insights feature is disabled")
            return {
                "job_title": job_title,
                "location": location,
                "skills": [],
                "note": "Job market insights feature is disabled"
            }
        
        # Try to get data from external API
        result = self._call_external_api("jobs/skills", query_params)
        
        # If successful, save to database
        if result:
            self._save_query_result("top_skills", query_params, result)
            return result
        
        # Fallback to default data
        if job_title.lower() in self.default_data.get('top_skills', {}):
            data = self.default_data['top_skills'][job_title.lower()]
            
            # Limit results
            if 'skills' in data and isinstance(data['skills'], list):
                data['skills'] = data['skills'][:limit]
            
            return data
        
        # Return empty result
        return {
            "job_title": job_title,
            "location": location,
            "skills": [],
            "data_available": False
        }

    @cache_result(prefix="job_market", ttl=3600)
    def get_skill_trend(self, job_title: str, skill: str, period: str = "1y") -> Dict[str, Any]:
        """
        Get trend data for a skill in a specific job
        
        Args:
            job_title: Job title
            skill: Skill name
            period: Time period (1m, 3m, 6m, 1y, 2y)
            
        Returns:
            dict: Skill trend data
        """
        query_params = {
            "job_title": job_title,
            "skill": skill,
            "period": period
        }
        
        # Check if feature is enabled
        if not FEATURES.get('job_market_insights', False):
            logger.info("Job market insights feature is disabled")
            return {
                "job_title": job_title,
                "skill": skill,
                "period": period,
                "trend_data": [],
                "data_available": False,
                "note": "Job market insights feature is disabled"
            }
        
        # Try to get data from external API
        result = self._call_external_api("skills/trend", query_params)
        
        # If successful, save to database
        if result:
            self._save_query_result("skill_trend", query_params, result)
            return result
        
        # Fallback to default data
        if 'skill_trends' in self.default_data:
            data = self.default_data['skill_trends']
            
            # Try to find exact match
            for trend in data:
                if (trend.get("job_title", "").lower() == job_title.lower() and 
                    trend.get("skill", "").lower() == skill.lower()):
                    return trend
            
            # Try to find partial match
            job_title_lower = job_title.lower()
            skill_lower = skill.lower()
            
            for trend in data:
                if (job_title_lower in trend.get("job_title", "").lower() and 
                    skill_lower in trend.get("skill", "").lower()):
                    return trend
            
            # Generate synthetic data for demo purposes
            if FEATURES.get('demo_mode', False):
                import random
                from datetime import datetime, timedelta
                
                dates = []
                values = []
                
                # Generate dates for the period
                end_date = datetime.now()
                
                if period == "1m":
                    days = 30
                    interval = 1
                elif period == "3m":
                    days = 90
                    interval = 3
                elif period == "6m":
                    days = 180
                    interval = 6
                elif period == "2y":
                    days = 730
                    interval = 14
                else:  # Default 1y
                    days = 365
                    interval = 7
                
                current_date = end_date - timedelta(days=days)
                
                # Generate random trending data
                trend_type = random.choice(["rising", "falling", "stable"])
                base_value = random.randint(50, 200)
                
                trend_data = []
                while current_date <= end_date:
                    if trend_type == "rising":
                        value = base_value + random.randint(-10, 20)
                        base_value = value
                    elif trend_type == "falling":
                        value = base_value + random.randint(-20, 10)
                        base_value = max(10, value)
                    else:  # stable
                        value = base_value + random.randint(-15, 15)
                    
                    trend_data.append({
                        "date": current_date.strftime("%Y-%m-%d"),
                        "value": value
                    })
                    current_date += timedelta(days=interval)
                
                return {
                    "job_title": job_title,
                    "skill": skill,
                    "period": period,
                    "trend_data": trend_data,
                    "trend_direction": trend_type,
                    "data_available": True,
                    "is_synthetic": True
                }
        
        # Return empty result
        return {
            "job_title": job_title,
            "skill": skill,
            "period": period,
            "trend_data": [],
            "data_available": False
        }


# Singleton instance
_analyzer = None

def get_analyzer() -> JobMarketAnalyzer:
    """
    Get job market analyzer instance
    
    Returns:
        JobMarketAnalyzer: Analyzer instance
    """
    global _analyzer
    
    if _analyzer is None:
        _analyzer = JobMarketAnalyzer()
    
    return _analyzer


# Convenience functions

def get_skill_demand(skill: str, location: Optional[str] = None, period: str = "6m") -> Dict[str, Any]:
    """Get demand data for a specific skill"""
    analyzer = get_analyzer()
    return analyzer.get_skill_demand(skill, location, period)


def get_salary_data(job_title: str, location: Optional[str] = None, experience: Optional[str] = None) -> Dict[str, Any]:
    """Get salary data for a job title"""
    analyzer = get_analyzer()
    return analyzer.get_salary_data(job_title, location, experience)


def get_job_growth(job_title: str, location: Optional[str] = None, period: str = "1y") -> Dict[str, Any]:
    """Get job growth data for a job title"""
    analyzer = get_analyzer()
    return analyzer.get_job_growth(job_title, location, period)


def get_top_skills_for_job(job_title: str, location: Optional[str] = None, limit: int = 10) -> Dict[str, Any]:
    """Get top skills for a job title"""
    analyzer = get_analyzer()
    return analyzer.get_top_skills_for_job(job_title, location, limit)


def get_skill_trend(job_title: str, skill: str, period: str = "1y") -> Dict[str, Any]:
    """Get skill trend data for a job and skill"""
    analyzer = get_analyzer()
    return analyzer.get_skill_trend(job_title, skill, period) 