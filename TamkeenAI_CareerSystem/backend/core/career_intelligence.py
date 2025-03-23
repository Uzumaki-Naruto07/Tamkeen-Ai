import os
import json
import time
import logging
import requests
import hashlib
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime, timedelta
import random
import statistics
import re

# Optional dependencies
try:
    import pandas as pd
    import numpy as np
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False


class CareerIntelligence:
    """
    Provides labor market insights, career trend analysis, and skill demand forecasting.
    Helps users make data-driven career decisions based on market trends.
    """
    
    def __init__(self, 
               api_keys: Optional[Dict[str, str]] = None,
               cache_dir: Optional[str] = None,
               cache_duration: int = 86400,  # 24 hour cache by default
               geo_focus: str = "global"):
        """
        Initialize the career intelligence system
        
        Args:
            api_keys: Dictionary of API keys for various data sources
            cache_dir: Directory to cache career intelligence data
            cache_duration: Duration to cache results (in seconds)
            geo_focus: Geographic focus for data (global, us, eu, asia, etc.)
        """
        self.api_keys = api_keys or {}
        self.cache_duration = cache_duration
        self.geo_focus = geo_focus
        self.logger = logging.getLogger(__name__)
        
        # Set up cache directory
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = None
            
        # Initialize data sources
        self.data_sources = self._initialize_data_sources()
        
        # Load local data if available
        self.local_data = self._load_local_data()
        
    def _initialize_data_sources(self) -> Dict[str, Dict[str, Any]]:
        """Initialize and configure available data sources"""
        sources = {}
        
        # BLS (Bureau of Labor Statistics) - US
        if "bls_api_key" in self.api_keys:
            sources["bls"] = {
                "name": "Bureau of Labor Statistics",
                "region": "us",
                "api_key": self.api_keys["bls_api_key"],
                "base_url": "https://api.bls.gov/publicAPI/v2/timeseries/data/",
                "available": True
            }
        
        # EMSI - Global labor market data
        if "emsi_api_key" in self.api_keys and "emsi_client_id" in self.api_keys:
            sources["emsi"] = {
                "name": "EMSI Labor Market Analytics",
                "region": "global",
                "api_key": self.api_keys["emsi_api_key"],
                "client_id": self.api_keys["emsi_client_id"],
                "base_url": "https://emsiservices.com/skills/",
                "available": True
            }
            
        # LinkedIn Insights API
        if "linkedin_client_id" in self.api_keys and "linkedin_client_secret" in self.api_keys:
            sources["linkedin"] = {
                "name": "LinkedIn Insights",
                "region": "global",
                "client_id": self.api_keys["linkedin_client_id"],
                "client_secret": self.api_keys["linkedin_client_secret"],
                "base_url": "https://api.linkedin.com/v2/",
                "available": True
            }
            
        # Always include local data as a source
        sources["local"] = {
            "name": "Local Career Data",
            "region": "global",
            "available": True
        }
        
        # GitHub Jobs Trends
        sources["github"] = {
            "name": "GitHub Jobs Trends",
            "region": "global",
            "base_url": "https://jobs.github.com/positions.json",
            "available": True
        }
        
        # Log available sources
        available_sources = [s for s, data in sources.items() if data["available"]]
        self.logger.info(f"Career intelligence initialized with sources: {', '.join(available_sources)}")
        
        return sources
    
    def _load_local_data(self) -> Dict[str, Any]:
        """Load locally stored career intelligence data"""
        local_data = {}
        
        # Define possible data file locations
        data_files = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "career_intelligence.json"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "career_intelligence.json"),
            os.path.join(os.path.expanduser("~"), ".tamkeen", "data", "career_intelligence.json")
        ]
        
        if self.cache_dir:
            data_files.append(os.path.join(self.cache_dir, "career_intelligence.json"))
        
        # Try to load from each location
        for file_path in data_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        local_data = json.load(f)
                    self.logger.info(f"Loaded local career data from {file_path}")
                    break
                except Exception as e:
                    self.logger.error(f"Error loading local data from {file_path}: {str(e)}")
        
        return local_data
    
    def get_skill_demand(self, skill: str, timeframe: str = "5years") -> Dict[str, Any]:
        """
        Get historical and projected demand for a specific skill
        
        Args:
            skill: Skill to analyze (e.g., "Python", "Machine Learning")
            timeframe: Timeframe for analysis ("1year", "5years", "10years")
            
        Returns:
            Dictionary with demand data and trends
        """
        # Check cache first
        cache_key = f"skill_demand_{skill}_{timeframe}"
        cached_data = self._get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # Initialize result
        result = {
            "skill": skill,
            "timeframe": timeframe,
            "historic_demand": [],
            "projected_demand": [],
            "trend": None,
            "growth_rate": None,
            "related_skills": [],
            "top_industries": [],
            "geographical_demand": {},
            "source": None
        }
        
        # Try each data source until we get results
        for source_name, source_data in self.data_sources.items():
            if not source_data["available"]:
                continue
                
            try:
                # Call the appropriate method for each source
                source_method = getattr(self, f"_get_skill_demand_{source_name}", None)
                if source_method:
                    source_result = source_method(skill, timeframe)
                    if source_result and len(source_result.get("historic_demand", [])) > 0:
                        result = source_result
                        result["source"] = source_name
                        break
            except Exception as e:
                self.logger.error(f"Error getting skill demand from {source_name}: {str(e)}")
        
        # If no data from APIs, use local data or generate mock data
        if not result["historic_demand"]:
            if "skills" in self.local_data and skill.lower() in self.local_data["skills"]:
                skill_data = self.local_data["skills"][skill.lower()]
                result = {**result, **skill_data}
                result["source"] = "local"
            else:
                # Generate mock data for demonstration
                mock_data = self._generate_mock_skill_demand(skill, timeframe)
                result = {**result, **mock_data}
                result["source"] = "mock"
        
        # Calculate trend and growth rate if not already set
        if not result["trend"] and result["historic_demand"]:
            values = [point["value"] for point in result["historic_demand"]]
            result["trend"] = self._calculate_trend(values)
            
            if len(values) >= 2:
                first_value = values[0]
                last_value = values[-1]
                if first_value > 0:
                    result["growth_rate"] = (last_value - first_value) / first_value
                else:
                    result["growth_rate"] = 0
        
        # Cache results
        self._cache_data(cache_key, result)
        
        return result
    
    def get_career_outlook(self, 
                         job_title: str, 
                         region: Optional[str] = None,
                         timeframe: str = "5years") -> Dict[str, Any]:
        """
        Get career outlook for a specific job title
        
        Args:
            job_title: Job title to analyze
            region: Region for analysis (defaults to geo_focus setting)
            timeframe: Timeframe for analysis ("1year", "5years", "10years")
            
        Returns:
            Dictionary with outlook data and projections
        """
        # Use instance geo_focus if region not specified
        region = region or self.geo_focus
        
        # Check cache first
        cache_key = f"career_outlook_{job_title}_{region}_{timeframe}"
        cached_data = self._get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # Initialize result
        result = {
            "job_title": job_title,
            "region": region,
            "timeframe": timeframe,
            "current_demand": None,
            "projected_growth": None,
            "growth_category": None,  # "declining", "stable", "growing", "rapidly growing"
            "median_salary": None,
            "salary_range": {"min": None, "max": None},
            "required_skills": [],
            "emerging_skills": [],
            "automation_risk": None,
            "key_industries": [],
            "source": None
        }
        
        # Try each data source until we get results
        for source_name, source_data in self.data_sources.items():
            if not source_data["available"]:
                continue
                
            try:
                # Call the appropriate method for each source
                source_method = getattr(self, f"_get_career_outlook_{source_name}", None)
                if source_method:
                    source_result = source_method(job_title, region, timeframe)
                    if source_result:
                        result = source_result
                        result["source"] = source_name
                        break
            except Exception as e:
                self.logger.error(f"Error getting career outlook from {source_name}: {str(e)}")
        
        # Cache results
        self._cache_data(cache_key, result)
        
        return result
    
    def _generate_mock_skill_demand(self, skill: str, timeframe: str) -> Dict[str, Any]:
        """Generate mock skill demand data for demonstration"""
        # Seed random with skill name for consistent results
        seed = int(hashlib.md5(skill.lower().encode()).hexdigest(), 16) % 10000
        random.seed(seed)
        
        # Determine number of data points based on timeframe
        if timeframe == "1year":
            num_historic = 12  # Monthly for a year
            num_projected = 6  # 6 months projection
            time_unit = "month"
        elif timeframe == "10years":
            num_historic = 10  # Yearly for 10 years
            num_projected = 5  # 5 years projection
            time_unit = "year"
        else:  # 5years default
            num_historic = 20  # Quarterly for 5 years
            num_projected = 8  # 2 years projection
            time_unit = "quarter"
        
        # Generate base trend (growing, stable, or declining)
        trend_type = random.choices(
            ["growing", "stable", "declining"],
            weights=[0.6, 0.3, 0.1]
        )[0]
        
        # Tech skills are more likely to be growing
        tech_skills = ["python", "javascript", "react", "aws", "machine learning", 
                     "data science", "cloud", "kubernetes", "devops", "blockchain"]
                     
        if skill.lower() in tech_skills and trend_type == "declining":
            # Re-roll for tech skills that were declining
            trend_type = random.choices(
                ["growing", "stable"],
                weights=[0.8, 0.2]
            )[0]
        
        # Generate historic demand data
        base_value = random.uniform(30, 100)
        historic_demand = []
        
        # Adjust trend parameters based on type
        if trend_type == "growing":
            growth_rate = random.uniform(0.02, 0.10)
            volatility = random.uniform(0.01, 0.05)
        elif trend_type == "stable":
            growth_rate = random.uniform(-0.01, 0.01)
            volatility = random.uniform(0.01, 0.03)
        else:  # declining
            growth_rate = random.uniform(-0.08, -0.02)
            volatility = random.uniform(0.01, 0.04)
        
        # Generate historic data points
        current_value = base_value
        for i in range(num_historic):
            date = datetime.now() - timedelta(
                days=365 if time_unit == "year" else (
                    30 if time_unit == "month" else 90
                )
            ) * (num_historic - i)
            
            # Add some random variation
            random_factor = 1 + random.uniform(-volatility, volatility)
            # Apply growth trend
            current_value *= (1 + growth_rate) * random_factor
            
            historic_demand.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(current_value, 2)
            })
        
        # Generate projected demand
        projected_demand = []
        for i in range(num_projected):
            date = datetime.now() + timedelta(
                days=365 if time_unit == "year" else (
                    30 if time_unit == "month" else 90
                )
            ) * (i + 1)
            
            # Add increasing uncertainty in projections
            future_volatility = volatility * (1 + i * 0.2)
            random_factor = 1 + random.uniform(-future_volatility, future_volatility)
            current_value *= (1 + growth_rate) * random_factor
            
            projected_demand.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(current_value, 2)
            })
        
        # Generate related skills
        all_skills = [
            "Python", "JavaScript", "Java", "SQL", "Machine Learning",
            "Data Analysis", "Cloud Computing", "AWS", "Azure", "DevOps", 
            "React", "Angular", "Node.js", "Docker", "Kubernetes",
            "C++", "C#", "Go", "Swift", "Project Management",
            "Agile", "Scrum", "Communication", "Leadership", "Problem Solving"
        ]
        
        # Make related skills somewhat coherent
        tech_clusters = {
            "web": ["JavaScript", "HTML", "CSS", "React", "Angular", "Node.js", "Vue.js"],
            "data": ["Python", "R", "SQL", "Machine Learning", "Data Analysis", "Pandas", "TensorFlow"],
            "cloud": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "DevOps"],
            "mobile": ["Swift", "Kotlin", "Flutter", "React Native", "iOS", "Android"],
            "backend": ["Java", "C#", ".NET", "Spring", "Go", "Node.js", "PHP"],
            "soft": ["Communication", "Leadership", "Project Management", "Agile", "Scrum", "Team Building"]
        }
        
        # Try to find which cluster the skill belongs to
        skill_cluster = None
        for cluster, cluster_skills in tech_clusters.items():
            if skill in cluster_skills:
                skill_cluster = cluster
                break
        
        # Generate related skills, preferring from the same cluster if found
        if skill_cluster:
            cluster_skills = [s for s in tech_clusters[skill_cluster] if s != skill]
            other_skills = [s for s in all_skills if s != skill and s not in cluster_skills]
            
            # Mix cluster-specific and general skills
            related_skills = random.sample(cluster_skills, min(3, len(cluster_skills)))
            if len(related_skills) < 5:
                related_skills.extend(random.sample(other_skills, min(5 - len(related_skills), len(other_skills))))
        else:
            related_skills = random.sample([s for s in all_skills if s != skill], min(5, len(all_skills) - 1))
        
        # Generate top industries
        all_industries = [
            "Technology", "Healthcare", "Finance", "Manufacturing",
            "Education", "Retail", "Media", "Telecommunications",
            "Energy", "Consulting", "Government", "Transportation"
        ]
        top_industries = random.sample(all_industries, 5)
        
        # Generate geographical demand
        geo_demand = {
            "us": round(random.uniform(20, 100), 1),
            "eu": round(random.uniform(20, 100), 1),
            "asia": round(random.uniform(20, 100), 1),
            "other": round(random.uniform(20, 100), 1)
        }
        
        # Get historic values for final calculations
        historic_values = [point["value"] for point in historic_demand]
        growth_rate = 0
        if len(historic_values) >= 2:
            first_value = historic_values[0]
            last_value = historic_values[-1]
            if first_value > 0:
                growth_rate = (last_value - first_value) / first_value
        
        result = {
            "historic_demand": historic_demand,
            "projected_demand": projected_demand,
            "trend": trend_type,
            "growth_rate": round(growth_rate, 4),
            "related_skills": related_skills,
            "top_industries": top_industries,
            "geographical_demand": geo_demand
        }
        
        return result
