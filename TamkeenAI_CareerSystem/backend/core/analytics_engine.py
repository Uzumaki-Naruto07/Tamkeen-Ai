import os
import re
import json
import logging
import hashlib
import uuid
import random
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime, timedelta
import calendar
import math
from collections import defaultdict, Counter

# Optional dependencies - allow graceful fallback if not available
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import matplotlib.pyplot as plt
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import seaborn as sns
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False


class AnalyticsEngine:
    """
    Advanced analytics processing system for career development insights.
    
    Key features:
    - Cross-component analytics and correlations
    - Trend analysis for career metrics over time
    - Cohort comparison and benchmarking
    - Predictive analytics for career outcomes
    - Custom report generation for different stakeholders
    - Aggregated insights across user base
    """
    
    def __init__(self, 
                data_dir: Optional[str] = None,
                report_dir: Optional[str] = None,
                cache_dir: Optional[str] = None,
                cache_ttl: int = 3600,
                admin_mode: bool = False):
        """
        Initialize the analytics engine
        
        Args:
            data_dir: Directory for analytics data storage
            report_dir: Directory for generated reports
            cache_dir: Directory for caching analytics results
            cache_ttl: Cache time-to-live in seconds
            admin_mode: Enable admin-level analytics (aggregated across users)
        """
        self.logger = logging.getLogger(__name__)
        
        # Set up data directory
        if data_dir:
            os.makedirs(data_dir, exist_ok=True)
            self.data_dir = data_dir
        else:
            self.data_dir = os.path.join(os.getcwd(), "analytics_data")
            os.makedirs(self.data_dir, exist_ok=True)
            
        # Set up reports directory
        if report_dir:
            os.makedirs(report_dir, exist_ok=True)
            self.report_dir = report_dir
        else:
            self.report_dir = os.path.join(self.data_dir, "reports")
            os.makedirs(self.report_dir, exist_ok=True)
            
        # Set up cache
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = os.path.join(self.data_dir, "cache")
            os.makedirs(self.cache_dir, exist_ok=True)
            
        self.cache_ttl = cache_ttl
        self.admin_mode = admin_mode
        
        # Initialize data stores
        self.cached_data = {}
        
        self.logger.info(f"Analytics engine initialized (admin_mode: {admin_mode})")
    
    def analyze_career_progression(self,
                                 user_id: str,
                                 feedback_history: List[Dict[str, Any]],
                                 user_info: Optional[Dict[str, Any]] = None,
                                 job_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze career progression over time
        
        Args:
            user_id: User identifier
            feedback_history: History of all feedback
            user_info: User profile information
            job_data: Job application tracking data
            
        Returns:
            Dictionary with career progression analytics
        """
        cache_key = f"career_progression_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Group feedback by type and sort by timestamp
            feedback_by_type = defaultdict(list)
            for feedback in feedback_history:
                if "feedback_type" in feedback and "timestamp" in feedback:
                    feedback_by_type[feedback["feedback_type"]].append(feedback)
            
            for feedback_type in feedback_by_type:
                feedback_by_type[feedback_type].sort(key=lambda x: x["timestamp"])
            
            # Get timeline data for key metrics
            timeline_data = self._get_career_timeline(feedback_by_type)
            
            # Get major milestone achievements
            milestones = self._get_career_milestones(feedback_by_type, job_data)
            
            # Get growth rate metrics
            growth_metrics = self._calculate_growth_metrics(feedback_by_type)
            
            # Calculate current career stage
            career_stage = self._determine_career_stage(
                feedback_by_type, user_info, job_data)
            
            # Calculate time-to-readiness projection
            readiness_projection = self._project_career_readiness(
                feedback_by_type, user_info)
            
            # Get skill acquisition velocity
            skill_velocity = self._calculate_skill_velocity(feedback_by_type)
            
            # Get career insights
            insights = self._generate_career_progression_insights(
                timeline_data, growth_metrics, career_stage, 
                readiness_projection, skill_velocity)
            
            # Assemble analytics result
            result = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "timeline_data": timeline_data,
                "milestones": milestones,
                "growth_metrics": growth_metrics,
                "career_stage": career_stage,
                "readiness_projection": readiness_projection,
                "skill_velocity": skill_velocity,
                "insights": insights
            }
            
            # Cache the result
            self._cache_result(cache_key, result)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error analyzing career progression: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def analyze_skill_market_alignment(self,
                                     user_id: str,
                                     skill_data: Dict[str, Any],
                                     market_data: Optional[Dict[str, Any]] = None,
                                     job_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze how user skills align with market demands
        
        Args:
            user_id: User identifier
            skill_data: User skill assessment data
            market_data: Market trend data (optional)
            job_data: Job listing data (optional)
            
        Returns:
            Dictionary with skill market alignment analytics
        """
        cache_key = f"skill_market_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Get user's current skills
            current_skills = skill_data.get("current_skills", [])
            
            # Get market demand for skills
            # If market_data not provided, use internal approximation
            market_demand = self._get_skill_market_demand(current_skills, market_data)
            
            # Calculate alignment score
            alignment_score, alignment_details = self._calculate_market_alignment(
                current_skills, market_demand)
            
            # Get emerging skills relevant to user
            emerging_skills = self._identify_emerging_skills(
                current_skills, market_data, job_data)
            
            # Get skill obsolescence risk
            obsolescence_risk = self._calculate_obsolescence_risk(
                current_skills, market_data)
            
            # Get salary impact of skills
            salary_impact = self._calculate_skill_salary_impact(
                current_skills, market_data)
            
            # Get industry-specific insights
            industry_insights = self._get_industry_skill_insights(
                current_skills, market_data, skill_data.get("target_industry"))
            
            # Assemble analytics result
            result = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "alignment_score": alignment_score,
                "alignment_details": alignment_details,
                "market_demand": market_demand,
                "emerging_skills": emerging_skills,
                "obsolescence_risk": obsolescence_risk,
                "salary_impact": salary_impact,
                "industry_insights": industry_insights
            }
            
            # Cache the result
            self._cache_result(cache_key, result)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error analyzing skill market alignment: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def _get_skill_market_demand(self, skills: List[str], market_data: Optional[Dict[str, Any]] = None) -> float:
        """
        Calculate market demand for a list of skills
        
        Args:
            skills: List of skill names
            market_data: Market trend data (optional)
            
        Returns:
            Market demand score
        """
        # Implementation of _get_skill_market_demand method
        # This is a placeholder and should be implemented based on your specific requirements
        return 0.75  # Placeholder return, actual implementation needed
    
    def _calculate_market_alignment(self, skills: List[str], market_demand: float) -> Tuple[float, Dict[str, Any]]:
        """
        Calculate market alignment score and details
        
        Args:
            skills: List of skill names
            market_demand: Market demand score
            
        Returns:
            Tuple containing alignment score and alignment details
        """
        # Implementation of _calculate_market_alignment method
        # This is a placeholder and should be implemented based on your specific requirements
        return 0.85, {}  # Placeholder return, actual implementation needed
    
    def _identify_emerging_skills(self, skills: List[str], market_data: Optional[Dict[str, Any]] = None, job_data: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Identify emerging skills relevant to a user
        
        Args:
            skills: List of current skills
            market_data: Market trend data (optional)
            job_data: Job listing data (optional)
            
        Returns:
            List of emerging skills
        """
        # Implementation of _identify_emerging_skills method
        # This is a placeholder and should be implemented based on your specific requirements
        return []  # Placeholder return, actual implementation needed
    
    def _calculate_obsolescence_risk(self, skills: List[str], market_data: Optional[Dict[str, Any]] = None) -> float:
        """
        Calculate obsolescence risk for a list of skills
        
        Args:
            skills: List of skill names
            market_data: Market trend data (optional)
            
        Returns:
            Obsolescence risk score
        """
        # Implementation of _calculate_obsolescence_risk method
        # This is a placeholder and should be implemented based on your specific requirements
        return 0.10  # Placeholder return, actual implementation needed
    
    def _calculate_skill_salary_impact(self, skills: List[str], market_data: Optional[Dict[str, Any]] = None) -> float:
        """
        Calculate salary impact of a list of skills
        
        Args:
            skills: List of skill names
            market_data: Market trend data (optional)
            
        Returns:
            Salary impact score
        """
        # Implementation of _calculate_skill_salary_impact method
        # This is a placeholder and should be implemented based on your specific requirements
        return 0.90  # Placeholder return, actual implementation needed
    
    def _get_industry_skill_insights(self, skills: List[str], market_data: Optional[Dict[str, Any]] = None, target_industry: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get industry-specific insights for a list of skills
        
        Args:
            skills: List of skill names
            market_data: Market trend data (optional)
            target_industry: Target industry for insights
            
        Returns:
            List of industry-specific insights
        """
        try:
            if not target_industry:
                return []
            
            industry_data = market_data.get('industry_data', {}).get(target_industry, {})
            if not industry_data:
                return []
            
            industry_insights = []
            
            # Check if user has key skills for industry
            key_industry_skills = industry_data.get('key_skills', [])
            has_key_skills = [skill for skill in key_industry_skills if any(
                self._skill_match(skill, user_skill) for user_skill in skills)]
            
            missing_key_skills = [skill for skill in key_industry_skills if not any(
                self._skill_match(skill, user_skill) for user_skill in skills)]
            
            if has_key_skills:
                industry_insights.append({
                    "type": "strength",
                    "insight": f"You have {len(has_key_skills)} of {len(key_industry_skills)} key skills for the {target_industry} industry.",
                    "skills": has_key_skills
                })
            
            if missing_key_skills:
                industry_insights.append({
                    "type": "gap",
                    "insight": f"Acquiring these {len(missing_key_skills)} skills would strengthen your position in {target_industry}.",
                    "skills": missing_key_skills
                })
            
            # Check for industry growth trends
            growth_rate = industry_data.get('growth_rate', 0)
            if growth_rate > 0:
                industry_insights.append({
                    "type": "opportunity",
                    "insight": f"The {target_industry} industry is growing at {growth_rate}% annually, creating new opportunities."
                })
            elif growth_rate < 0:
                industry_insights.append({
                    "type": "warning",
                    "insight": f"The {target_industry} industry is contracting at {abs(growth_rate)}% annually. Consider diversifying skills."
                })
            
            # Add regional insights if available
            regional_data = industry_data.get('regional_data', {})
            if regional_data:
                top_regions = sorted(regional_data.items(), key=lambda x: x[1]['demand'], reverse=True)[:3]
                if top_regions:
                    regions_text = ", ".join(region for region, _ in top_regions)
                    industry_insights.append({
                        "type": "location",
                        "insight": f"Highest demand for your skills in {target_industry} is in {regions_text}."
                    })
            
            return industry_insights
        except Exception as e:
            self.logger.error(f"Error generating industry insights: {str(e)}")
            return []
    
    def _skill_match(self, skill1: str, skill2: str) -> bool:
        """Check if two skills match (simple implementation)"""
        skill1 = skill1.lower().strip()
        skill2 = skill2.lower().strip()
        
        # Direct match
        if skill1 == skill2:
            return True
        
        # One contains the other
        if skill1 in skill2 or skill2 in skill1:
            return True
        
        # Check for plurals/singulars
        if skill1.endswith('s') and skill1[:-1] == skill2:
            return True
        if skill2.endswith('s') and skill2[:-1] == skill1:
            return True
        
        return False
