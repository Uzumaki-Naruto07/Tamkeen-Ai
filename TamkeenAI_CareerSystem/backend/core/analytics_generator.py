"""
Analytics Generator Module

This module provides functionality for generating analytics and insights about
careers, skills, job market, and personalized recommendations.
"""

import logging
import json
import requests
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta
import random  # For demo data

# Import utilities
from backend.utils.date_utils import now
from backend.utils.cache_utils import cache_result

# Import settings
from backend.config.settings import DEEPSEEK_API_KEY

# Setup logger
logger = logging.getLogger(__name__)


class AnalyticsGenerator:
    """Class for generating career and job market analytics"""
    
    def __init__(self):
        """Initialize analytics generator"""
        self.api_key = DEEPSEEK_API_KEY
        
        # Load skill taxonomy
        self.skill_taxonomy = self._load_skill_taxonomy()
        
        # Load industry data
        self.industry_data = self._load_industry_data()
    
    def _load_skill_taxonomy(self) -> Dict[str, List[str]]:
        """
        Load skill taxonomy for skill normalization and grouping
        
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
    
    def _load_industry_data(self) -> Dict[str, Dict[str, Any]]:
        """
        Load industry data for analysis
        
        Returns:
            Dict of industry data
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "technology": {
                "growth_rate": 12.3,
                "avg_salary": 95000,
                "job_openings": 150000,
                "remote_percentage": 65,
                "top_skills": ["python", "javascript", "cloud", "data analysis", "machine learning"]
            },
            "healthcare": {
                "growth_rate": 8.5,
                "avg_salary": 85000,
                "job_openings": 200000,
                "remote_percentage": 25,
                "top_skills": ["patient care", "medical records", "healthcare regulations", "electronic health records"]
            },
            "finance": {
                "growth_rate": 6.2,
                "avg_salary": 92000,
                "job_openings": 90000,
                "remote_percentage": 45,
                "top_skills": ["financial analysis", "accounting", "excel", "regulatory compliance", "risk management"]
            },
            "education": {
                "growth_rate": 4.5,
                "avg_salary": 68000,
                "job_openings": 120000,
                "remote_percentage": 40,
                "top_skills": ["curriculum development", "teaching", "assessment", "online learning"]
            },
            "manufacturing": {
                "growth_rate": 3.8,
                "avg_salary": 72000,
                "job_openings": 85000,
                "remote_percentage": 15,
                "top_skills": ["supply chain", "quality control", "lean manufacturing", "inventory management"]
            }
        }
    
    @cache_result(timeout=3600)  # Cache for 1 hour
    def analyze_job_market(self, industry: str = None, location: str = None,
                         start_date: datetime = None, end_date: datetime = None) -> Dict[str, Any]:
        """
        Analyze job market trends
        
        Args:
            industry: Industry to analyze
            location: Location to analyze
            start_date: Start date for analysis
            end_date: End date for analysis
            
        Returns:
            Job market analysis
        """
        try:
            # In a real app, this would query a database of job listings
            # For demo purposes, we'll generate synthetic data
            
            # Set default date range if not provided
            if not start_date:
                start_date = now() - timedelta(days=180)  # 6 months ago
            if not end_date:
                end_date = now()
            
            # Filter industry data
            filtered_industry = None
            if industry and industry.lower() in self.industry_data:
                filtered_industry = self.industry_data[industry.lower()]
            
            # Generate market trends
            trends = self._generate_market_trends(start_date, end_date, filtered_industry)
            
            # Generate salary data
            salary_data = self._generate_salary_data(industry, location)
            
            # Generate demand metrics
            demand_metrics = self._generate_demand_metrics(industry, location)
            
            # Generate top employers
            top_employers = self._generate_top_employers(industry, location)
            
            # Generate location insights
            location_insights = self._generate_location_insights(industry, location)
            
            # Combine results
            result = {
                "trends": trends,
                "salary_data": salary_data,
                "demand_metrics": demand_metrics,
                "top_employers": top_employers,
                "location_insights": location_insights
            }
            
            # Try to get AI-enhanced insights
            ai_insights = self._get_market_insights_from_ai(industry, location, result)
            if ai_insights:
                result["ai_insights"] = ai_insights
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing job market: {str(e)}")
            return {"error": str(e)}
    
    @cache_result(timeout=3600)  # Cache for 1 hour
    def analyze_in_demand_skills(self, industry: str = None, job_title: str = None,
                               location: str = None, start_date: datetime = None,
                               end_date: datetime = None, limit: int = 20) -> Dict[str, Any]:
        """
        Analyze in-demand skills
        
        Args:
            industry: Industry to analyze
            job_title: Job title to analyze
            location: Location to analyze
            start_date: Start date for analysis
            end_date: End date for analysis
            limit: Maximum number of skills to return
            
        Returns:
            In-demand skills analysis
        """
        try:
            # In a real app, this would query a database of job listings
            # For demo purposes, we'll generate synthetic data
            
            # Set default date range if not provided
            if not start_date:
                start_date = now() - timedelta(days=180)  # 6 months ago
            if not end_date:
                end_date = now()
            
            # Generate top skills
            top_skills = self._generate_top_skills(industry, job_title, limit)
            
            # Generate emerging skills
            emerging_skills = self._generate_emerging_skills(industry, job_title, limit // 2)
            
            # Generate skill demand trends
            skill_trends = self._generate_skill_trends(start_date, end_date, industry, job_title)
            
            # Combine results
            result = {
                "top_skills": top_skills,
                "emerging_skills": emerging_skills,
                "skill_trends": skill_trends
            }
            
            # Try to get AI-enhanced insights
            ai_insights = self._get_skill_insights_from_ai(industry, job_title, result)
            if ai_insights:
                result["ai_insights"] = ai_insights
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing in-demand skills: {str(e)}")
            return {"error": str(e)}
    
    def analyze_career_progression(self, current_role: str, years_experience: int = None) -> Dict[str, Any]:
        """
        Analyze career progression paths
        
        Args:
            current_role: Current job role
            years_experience: Years of experience
            
        Returns:
            Career progression analysis
        """
        try:
            # Normalize the current role
            current_role = current_role.lower()
            
            # Default years experience
            if not years_experience:
                years_experience = 2
            
            # Generate career path options
            career_paths = self._generate_career_paths(current_role, years_experience)
            
            # Generate skills to develop
            skills_to_develop = self._generate_skills_to_develop(current_role, years_experience)
            
            # Generate education recommendations
            education_recommendations = self._generate_education_recommendations(current_role, years_experience)
            
            # Generate timeline
            timeline = self._generate_career_timeline(current_role, years_experience)
            
            # Combine results
            result = {
                "current_role": current_role,
                "years_experience": years_experience,
                "career_paths": career_paths,
                "skills_to_develop": skills_to_develop,
                "education_recommendations": education_recommendations,
                "timeline": timeline
            }
            
            # Try to get AI-enhanced insights
            ai_insights = self._get_career_progression_insights_from_ai(current_role, years_experience)
            if ai_insights:
                result["ai_insights"] = ai_insights
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing career progression: {str(e)}")
            return {"error": str(e)}
    
    def analyze_skills_gap(self, current_skills: List[str], target_role: str) -> Dict[str, Any]:
        """
        Analyze skills gap between current skills and target role
        
        Args:
            current_skills: List of current skills
            target_role: Target job role
            
        Returns:
            Skills gap analysis
        """
        try:
            # Normalize skills and role
            current_skills = [s.lower() for s in current_skills]
            target_role = target_role.lower()
            
            # Get required skills for target role
            required_skills = self._get_required_skills_for_role(target_role)
            
            # Find missing skills
            missing_skills = [s for s in required_skills if s not in current_skills]
            
            # Find matching skills
            matching_skills = [s for s in current_skills if s in required_skills]
            
            # Calculate match percentage
            if required_skills:
                match_percentage = (len(matching_skills) / len(required_skills)) * 100
            else:
                match_percentage = 0
            
            # Prioritize missing skills
            prioritized_missing = self._prioritize_skills(missing_skills, target_role)
            
            # Generate learning resources
            learning_resources = self._generate_learning_resources(prioritized_missing[:5])
            
            # Combine results
            result = {
                "target_role": target_role,
                "match_percentage": round(match_percentage, 1),
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "prioritized_missing": prioritized_missing,
                "learning_resources": learning_resources
            }
            
            # Try to get AI-enhanced insights
            ai_insights = self._get_skills_gap_insights_from_ai(current_skills, target_role, result)
            if ai_insights:
                result["ai_insights"] = ai_insights
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing skills gap: {str(e)}")
            return {"error": str(e)}
    
    def compare_industries(self, industries: List[str]) -> Dict[str, Any]:
        """
        Compare multiple industries
        
        Args:
            industries: List of industries to compare
            
        Returns:
            Industry comparison
        """
        try:
            comparison = []
            
            for industry in industries:
                industry = industry.lower()
                if industry in self.industry_data:
                    industry_data = self.industry_data[industry]
                    
                    comparison.append({
                        "name": industry.title(),
                        "growth_rate": industry_data["growth_rate"],
                        "avg_salary": industry_data["avg_salary"],
                        "job_openings": industry_data["job_openings"],
                        "remote_percentage": industry_data["remote_percentage"],
                        "top_skills": industry_data["top_skills"]
                    })
            
            # Sort by growth rate
            comparison.sort(key=lambda x: x["growth_rate"], reverse=True)
            
            # Try to get AI-enhanced insights
            ai_insights = self._get_industry_comparison_insights_from_ai(industries, comparison)
            
            return {
                "industries": comparison,
                "ai_insights": ai_insights if ai_insights else []
            }
            
        except Exception as e:
            logger.error(f"Error comparing industries: {str(e)}")
            return {"error": str(e)}
    
    def analyze_resume_match(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze match between resume and job
        
        Args:
            resume_data: Resume data
            job_data: Job data
            
        Returns:
            Resume match analysis
        """
        try:
            # Extract resume skills
            resume_skills = resume_data.get("skills", [])
            resume_skills = [s.lower() for s in resume_skills]
            
            # Extract job skills
            job_skills = []
            if "required_skills" in job_data:
                job_skills.extend(job_data["required_skills"])
            if "preferred_skills" in job_data:
                job_skills.extend(job_data["preferred_skills"])
            job_skills = [s.lower() for s in job_skills]
            
            # If no job skills specified, try to extract from description
            if not job_skills and "description" in job_data:
                job_skills = self._extract_skills_from_text(job_data["description"])
            
            # Find matching skills
            matching_skills = [s for s in resume_skills if s in job_skills]
            
            # Find missing skills
            missing_skills = [s for s in job_skills if s not in resume_skills]
            
            # Calculate match percentage
            if job_skills:
                match_percentage = (len(matching_skills) / len(job_skills)) * 100
            else:
                match_percentage = 0
            
            # Calculate experience match
            experience_match = self._calculate_experience_match(resume_data, job_data)
            
            # Calculate education match
            education_match = self._calculate_education_match(resume_data, job_data)
            
            # Calculate overall match score
            overall_score = (match_percentage * 0.6) + (experience_match * 0.25) + (education_match * 0.15)
            
            # Generate match level
            match_level = self._get_match_level(overall_score)
            
            # Combine results
            result = {
                "overall_score": round(overall_score, 1),
                "match_level": match_level,
                "skill_match": {
                    "percentage": round(match_percentage, 1),
                    "matching_skills": matching_skills,
                    "missing_skills": missing_skills
                },
                "experience_match": {
                    "percentage": round(experience_match * 100, 1)
                },
                "education_match": {
                    "percentage": round(education_match * 100, 1)
                }
            }
            
            # Try to get AI-enhanced insights
            ai_insights = self._get_resume_match_insights_from_ai(resume_data, job_data, result)
            if ai_insights:
                result["ai_insights"] = ai_insights
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing resume match: {str(e)}")
            return {"error": str(e)}
    
    def _generate_market_trends(self, start_date: datetime, end_date: datetime, 
                              industry_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate market trends data
        
        Args:
            start_date: Start date
            end_date: End date
            industry_data: Industry data
            
        Returns:
            Market trends data
        """
        # Calculate number of months
        num_months = ((end_date.year - start_date.year) * 12) + end_date.month - start_date.month
        num_months = max(1, num_months)
        
        # Base job openings
        base_openings = 10000
        if industry_data:
            base_openings = industry_data["job_openings"] / 12  # Monthly openings
        
        # Base growth rate
        monthly_growth = 1.02  # 2% monthly growth
        if industry_data:
            annual_growth = 1 + (industry_data["growth_rate"] / 100)
            monthly_growth = annual_growth ** (1/12)
        
        # Generate monthly data
        monthly_data = []
        
        for i in range(num_months + 1):
            # Calculate date
            current_date = start_date + timedelta(days=i * 30)  # Approximate month
            
            # Calculate job openings with some randomness
            job_openings = int(base_openings * (monthly_growth ** i) * random.uniform(0.9, 1.1))
            
            monthly_data.append({
                "date": current_date.strftime("%Y-%m"),
                "job_openings": job_openings,
                "remote_percentage": int(random.uniform(30, 70)) if not industry_data else 
                                   int(industry_data["remote_percentage"] * random.uniform(0.9, 1.1))
            })
        
        # Calculate overall growth
        starting_openings = monthly_data[0]["job_openings"]
        ending_openings = monthly_data[-1]["job_openings"]
        growth_percentage = ((ending_openings - starting_openings) / starting_openings) * 100
        
        return {
            "monthly_data": monthly_data,
            "overall_growth": round(growth_percentage, 1),
            "period": f"{start_date.strftime('%Y-%m')} to {end_date.strftime('%Y-%m')}"
        }
    
    def _generate_salary_data(self, industry: str = None, location: str = None) -> Dict[str, Any]:
        """
        Generate salary data
        
        Args:
            industry: Industry
            location: Location
            
        Returns:
            Salary data
        """
        # Base salary ranges
        base_entry = 50000
        base_mid = 80000
        base_senior = 120000
        
        # Apply industry adjustments
        if industry and industry.lower() in self.industry_data:
            industry_data = self.industry_data[industry.lower()]
            industry_factor = industry_data["avg_salary"] / 85000  # Baseline average
            
            base_entry *= industry_factor
            base_mid *= industry_factor
            base_senior *= industry_factor
        
        # Apply location adjustments
        location_factor = 1.0
        if location:
            location = location.lower()
            if "new york" in location or "san francisco" in location:
                location_factor = 1.3
            elif "boston" in location or "seattle" in location or "washington" in location:
                location_factor = 1.2
            elif "chicago" in location or "los angeles" in location or "austin" in location:
                location_factor = 1.1
            elif "rural" in location or "midwest" in location:
                location_factor = 0.85
        
        # Apply factors
        entry_level = int(base_entry * location_factor)
        mid_level = int(base_mid * location_factor)
        senior_level = int(base_senior * location_factor)
        
        # Add some randomness
        entry_level = int(entry_level * random.uniform(0.9, 1.1))
        mid_level = int(mid_level * random.uniform(0.9, 1.1))
        senior_level = int(senior_level * random.uniform(0.9, 1.1))
        
        return {
            "entry_level": entry_level,
            "mid_level": mid_level,
            "senior_level": senior_level,
            "average": int((entry_level + mid_level + senior_level) / 3),
            "percentiles": {
                "25th": int(entry_level * 0.9),
                "50th": int(mid_level * 0.9),
                "75th": int(mid_level * 1.1),
                "90th": int(senior_level * 1.1)
            }
        }
    
    def _generate_demand_metrics(self, industry: str = None, location: str = None) -> Dict[str, Any]:
        """
        Generate demand metrics
        
        Args:
            industry: Industry
            location: Location
            
        Returns:
            Demand metrics
        """
        # Base metrics
        base_demand_score = 65
        base_competition = 75
        base_growth = 5.0
        remote_percentage = 40
        
        # Apply industry adjustments
        if industry and industry.lower() in self.industry_data:
            industry_data = self.industry_data[industry.lower()]
            base_growth = industry_data["growth_rate"]
            remote_percentage = industry_data["remote_percentage"]
            
            # Higher growth means higher demand
            if base_growth > 8:
                base_demand_score += 15
                base_competition += 10
            elif base_growth > 5:
                base_demand_score += 5
                base_competition += 5
        
        # Apply location adjustments
        if location:
            location = location.lower()
            if "new york" in location or "san francisco" in location:
                base_demand_score += 10
                base_competition += 15
            elif "boston" in location or "seattle" in location:
                base_demand_score += 5
                base_competition += 10
            elif "rural" in location:
                base_demand_score -= 10
                base_competition -= 20
        
        # Add some randomness
        demand_score = min(100, max(0, int(base_demand_score * random.uniform(0.9, 1.1))))
        competition = min(100, max(0, int(base_competition * random.uniform(0.9, 1.1))))
        
        return {
            "demand_score": demand_score,
            "competition_level": competition,
            "projected_growth": round(base_growth * random.uniform(0.9, 1.1), 1),
            "remote_work_percentage": min(100, max(0, int(remote_percentage * random.uniform(0.9, 1.1)))),
            "demand_level": self._get_demand_level(demand_score)
        }
    
    def _get_demand_level(self, score: int) -> str:
        """
        Get demand level label from score
        
        Args:
            score: Demand score
            
        Returns:
            Demand level label
        """
        if score >= 85:
            return "Very High"
        elif score >= 70:
            return "High"
        elif score >= 50:
            return "Moderate"
        elif score >= 30:
            return "Low"
        else:
            return "Very Low"
    
    def _generate_top_employers(self, industry: str = None, location: str = None) -> List[Dict[str, Any]]:
        """
        Generate top employers
        
        Args:
            industry: Industry
            location: Location
            
        Returns:
            List of top employers
        """
        # Industry-specific employers
        industry_employers = {
            "technology": [
                {"name": "Google", "openings": 450, "avg_salary": 145000},
                {"name": "Microsoft", "openings": 380, "avg_salary": 140000},
                {"name": "Amazon", "openings": 520, "avg_salary": 135000},
                {"name": "Apple", "openings": 280, "avg_salary": 150000},
                {"name": "Meta", "openings": 320, "avg_salary": 145000},
                {"name": "Netflix", "openings": 120, "avg_salary": 165000},
                {"name": "Salesforce", "openings": 250, "avg_salary": 130000},
                {"name": "Oracle", "openings": 180, "avg_salary": 125000}
            ],
            "finance": [
                {"name": "JPMorgan Chase", "openings": 350, "avg_salary": 125000},
                {"name": "Goldman Sachs", "openings": 280, "avg_salary": 140000},
                {"name": "Bank of America", "openings": 320, "avg_salary": 115000},
                {"name": "Morgan Stanley", "openings": 220, "avg_salary": 130000},
                {"name": "Wells Fargo", "openings": 290, "avg_salary": 110000},
                {"name": "Citigroup", "openings": 250, "avg_salary": 120000},
                {"name": "BlackRock", "openings": 180, "avg_salary": 135000},
                {"name": "Visa", "openings": 150, "avg_salary": 125000}
            ],
            "healthcare": [
                {"name": "UnitedHealth Group", "openings": 420, "avg_salary": 110000},
                {"name": "CVS Health", "openings": 380, "avg_salary": 105000},
                {"name": "Johnson & Johnson", "openings": 250, "avg_salary": 125000},
                {"name": "Pfizer", "openings": 210, "avg_salary": 130000},
                {"name": "Anthem", "openings": 310, "avg_salary": 115000},
                {"name": "Cardinal Health", "openings": 220, "avg_salary": 100000},
                {"name": "Cigna", "openings": 280, "avg_salary": 110000},
                {"name": "Mayo Clinic", "openings": 180, "avg_salary": 120000}
            ]
        }
        
        # Default employers for any industry
        default_employers = [
            {"name": "IBM", "openings": 300, "avg_salary": 120000},
            {"name": "Deloitte", "openings": 350, "avg_salary": 110000},
            {"name": "Accenture", "openings": 380, "avg_salary": 115000},
            {"name": "PwC", "openings": 320, "avg_salary": 105000},
            {"name": "EY", "openings": 300, "avg_salary": 110000},
            {"name": "KPMG", "openings": 270, "avg_salary": 105000},
            {"name": "Walmart", "openings": 400, "avg_salary": 95000},
            {"name": "Target", "openings": 350, "avg_salary": 90000}
        ]
        
        # Select employers based on industry
        selected_employers = []
        if industry and industry.lower() in industry_employers:
            selected_employers = industry_employers[industry.lower()].copy()
        else:
            selected_employers = default_employers.copy()
        
        # Adjust for location if specified
        if location:
            location = location.lower()
            
            # Adjust openings and salaries based on location
            location_factor = 1.0
            if "new york" in location or "san francisco" in location:
                location_factor = 1.3
            elif "boston" in location or "seattle" in location:
                location_factor = 1.2
            elif "chicago" in location or "los angeles" in location:
                location_factor = 1.1
            elif "rural" in location:
                location_factor = 0.7
            
            for employer in selected_employers:
                employer["avg_salary"] = int(employer["avg_salary"] * location_factor)
                employer["openings"] = int(employer["openings"] * random.uniform(0.7, 1.3))
        
        # Add some randomness and ensure we return at most 8 employers
        for employer in selected_employers:
            employer["openings"] = int(employer["openings"] * random.uniform(0.9, 1.1))
            employer["avg_salary"] = int(employer["avg_salary"] * random.uniform(0.95, 1.05))
        
        # Sort by openings and limit to 8
        selected_employers.sort(key=lambda x: x["openings"], reverse=True)
        return selected_employers[:8]
    
    def _generate_location_insights(self, industry: str = None, location: str = None) -> Dict[str, Any]:
        """
        Generate location insights
        
        Args:
            industry: Industry
            location: Location
            
        Returns:
            Location insights
        """
        # Default location data
        location_data = {
            "top_locations": [
                {"name": "San Francisco, CA", "demand_score": 92, "avg_salary": 145000},
                {"name": "New York, NY", "demand_score": 90, "avg_salary": 140000},
                {"name": "Seattle, WA", "demand_score": 88, "avg_salary": 135000},
                {"name": "Boston, MA", "demand_score": 85, "avg_salary": 130000},
                {"name": "Austin, TX", "demand_score": 82, "avg_salary": 120000}
            ],
            "remote_percentage": 45,
            "hybrid_percentage": 35,
            "onsite_percentage": 20
        }
        
        # Adjust for industry
        if industry and industry.lower() in self.industry_data:
            industry_data = self.industry_data[industry.lower()]
            
            # Adjust remote percentage
            location_data["remote_percentage"] = industry_data["remote_percentage"]
            location_data["hybrid_percentage"] = min(90 - industry_data["remote_percentage"], 50)
            location_data["onsite_percentage"] = 100 - location_data["remote_percentage"] - location_data["hybrid_percentage"]
            
            # Adjust salaries based on industry
            industry_factor = industry_data["avg_salary"] / 85000  # Baseline average
            for loc in location_data["top_locations"]:
                loc["avg_salary"] = int(loc["avg_salary"] * industry_factor * random.uniform(0.95, 1.05))
        
        # Add some randomness
        for loc in location_data["top_locations"]:
            loc["demand_score"] = min(100, max(0, int(loc["demand_score"] * random.uniform(0.95, 1.05))))
        
        return location_data
    
    def _generate_top_skills(self, industry: str = None, job_title: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate top skills
        
        Args:
            industry: Industry
            job_title: Job title
            limit: Maximum number of skills to return
            
        Returns:
            List of top skills
        """
        # Base skills
        base_skills = []
        
        # Add industry-specific skills
        if industry and industry.lower() in self.industry_data:
            industry_data = self.industry_data[industry.lower()]
            base_skills.extend([{"name": s, "importance": random.randint(80, 95)} for s in industry_data["top_skills"]])
        
        # Add job title-specific skills
        if job_title:
            job_title = job_title.lower()
            
            if "software" in job_title or "developer" in job_title:
                prog_skills = self.skill_taxonomy.get("programming", [])
                web_skills = self.skill_taxonomy.get("web_development", [])
                base_skills.extend([{"name": s, "importance": random.randint(75, 90)} for s in prog_skills[:3]])
                base_skills.extend([{"name": s, "importance": random.randint(75, 90)} for s in web_skills[:3]])
            
            elif "data" in job_title:
                data_skills = self.skill_taxonomy.get("data_science", [])
                base_skills.extend([{"name": s, "importance": random.randint(80, 95)} for s in data_skills[:6]])
            
            elif "devops" in job_title or "cloud" in job_title:
                devops_skills = self.skill_taxonomy.get("devops", [])
                base_skills.extend([{"name": s, "importance": random.randint(80, 95)} for s in devops_skills[:6]])
        
        # Add general skills
        soft_skills = self.skill_taxonomy.get("soft_skills", [])
        base_skills.extend([{"name": s, "importance": random.randint(70, 85)} for s in soft_skills[:3]])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_skills = []
        for skill in base_skills:
            if skill["name"] not in seen:
                seen.add(skill["name"])
                unique_skills.append(skill)
        
        # Sort by importance
        unique_skills.sort(key=lambda x: x["importance"], reverse=True)
        
        # Add more information
        for skill in unique_skills:
            skill["demand_score"] = random.randint(skill["importance"] - 10, skill["importance"] + 10)
            skill["demand_score"] = min(100, max(0, skill["demand_score"]))
            skill["growth_rate"] = round(random.uniform(1.0, 15.0), 1)
        
        # Limit results
        return unique_skills[:limit]
    
    def _generate_emerging_skills(self, industry: str = None, job_title: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Generate emerging skills
        
        Args:
            industry: Industry
            job_title: Job title
            limit: Maximum number of skills to return
            
        Returns:
            List of emerging skills
        """
        # Common emerging skills across industries
        common_emerging = [
            {"name": "artificial intelligence", "growth_rate": 32.5},
            {"name": "machine learning", "growth_rate": 28.7},
            {"name": "cloud computing", "growth_rate": 25.4},
            {"name": "cyber security", "growth_rate": 23.8},
            {"name": "big data", "growth_rate": 21.2},
            {"name": "blockchain", "growth_rate": 19.5},
            {"name": "augmented reality", "growth_rate": 18.3},
            {"name": "natural language processing", "growth_rate": 17.6},
            {"name": "virtual reality", "growth_rate": 16.9},
            {"name": "iot", "growth_rate": 16.2}
        ]
        
        # Industry-specific emerging skills
        industry_emerging = {
            "technology": [
                {"name": "quantum computing", "growth_rate": 35.2},
                {"name": "edge computing", "growth_rate": 27.8},
                {"name": "serverless architecture", "growth_rate": 24.6},
                {"name": "devops", "growth_rate": 22.3},
                {"name": "robotic process automation", "growth_rate": 20.1}
            ],
            "healthcare": [
                {"name": "telemedicine", "growth_rate": 34.7},
                {"name": "health informatics", "growth_rate": 30.2},
                {"name": "personalized medicine", "growth_rate": 28.5},
                {"name": "healthcare analytics", "growth_rate": 26.1},
                {"name": "remote patient monitoring", "growth_rate": 24.3}
            ],
            "finance": [
                {"name": "regtech", "growth_rate": 33.8},
                {"name": "algorithmic trading", "growth_rate": 29.5},
                {"name": "digital banking", "growth_rate": 27.2},
                {"name": "peer-to-peer lending", "growth_rate": 24.6},
                {"name": "insurtech", "growth_rate": 21.9}
            ]
        }
        
        # Combine skills
        emerging_skills = common_emerging.copy()
        
        if industry and industry.lower() in industry_emerging:
            emerging_skills.extend(industry_emerging[industry.lower()])
        
        # Add job title specific skills
        if job_title:
            job_title = job_title.lower()
            
            if "software" in job_title or "developer" in job_title:
                emerging_skills.extend([
                    {"name": "low-code development", "growth_rate": 26.7},
                    {"name": "progressive web apps", "growth_rate": 24.3},
                    {"name": "microservices", "growth_rate": 22.8}
                ])
            elif "data" in job_title:
                emerging_skills.extend([
                    {"name": "automated machine learning", "growth_rate": 31.4},
                    {"name": "data ethics", "growth_rate": 25.6},
                    {"name": "explainable ai", "growth_rate": 29.2}
                ])
        
        # Add additional information
        for skill in emerging_skills:
            skill["demand_score"] = int(skill["growth_rate"] * random.uniform(1.5, 2.5))
            skill["demand_score"] = min(100, max(0, skill["demand_score"]))
            skill["time_to_market"] = random.randint(6, 24)  # months until relevant in job market
        
        # Sort by growth rate
        emerging_skills.sort(key=lambda x: x["growth_rate"], reverse=True)
        
        # Remove duplicates
        seen = set()
        unique_skills = []
        for skill in emerging_skills:
            if skill["name"] not in seen:
                seen.add(skill["name"])
                unique_skills.append(skill)
        
        # Limit results
        return unique_skills[:limit]

    def _get_market_insights_from_ai(self, industry: str, location: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get market insights from DeepSeek AI
        
        Args:
            industry: Industry
            location: Location
            market_data: Market data
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI insights")
            return {}
        
        try:
            # Simplified data to avoid token limits
            simplified_data = {
                "industry": industry,
                "location": location,
                "salary_data": market_data.get("salary_data", {}),
                "demand_metrics": market_data.get("demand_metrics", {}),
                "top_employers": [emp["name"] for emp in market_data.get("top_employers", [])[:5]]
            }
            
            # Prepare the API request
            prompt = f"""Based on this job market data, provide strategic insights for job seekers:
            
            Data: {json.dumps(simplified_data)}
            
            Provide 3-5 concise, strategic insights about:
            1. Current market conditions
            2. Salary expectations
            3. Hiring trends
            4. Recommended actions for job seekers
            
            Format as a JSON array with objects containing "title" and "description" fields.
            Keep insights focused, factual, and actionable.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career analyst providing concise, data-driven insights about job markets."},
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
            logger.error(f"Error getting market insights from AI: {str(e)}")
            return {}

    @cache_result(timeout=3600)  # Cache for 1 hour
    def analyze_skills(self, industry: str = None, job_title: str = None, 
                    location: str = None, limit: int = 20) -> Dict[str, Any]:
        """
        Analyze skills demand and trends
        
        Args:
            industry: Industry to analyze
            job_title: Job title to analyze
            location: Location to analyze
            limit: Maximum number of skills to return
            
        Returns:
            Skills analysis
        """
        try:
            # Generate top skills
            top_skills = self._generate_top_skills(industry, job_title, limit)
            
            # Generate emerging skills
            emerging_skills = self._generate_emerging_skills(industry, job_title, limit // 2)
            
            # Generate skill gaps
            skill_gaps = self._generate_skill_gaps(industry, job_title, limit // 2)
            
            # Get skill categories
            skill_categories = self._get_skill_categories(industry, job_title)
            
            # Try to get AI-enhanced insights
            ai_insights = self._get_skills_insights_from_ai(industry, job_title, top_skills, emerging_skills)
            
            result = {
                "top_skills": top_skills,
                "emerging_skills": emerging_skills,
                "skill_gaps": skill_gaps,
                "skill_categories": skill_categories
            }
            
            if ai_insights:
                result["ai_insights"] = ai_insights
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing skills: {str(e)}")
            return {
                "error": str(e),
                "top_skills": [],
                "emerging_skills": [],
                "skill_gaps": [],
                "skill_categories": {}
            }

    def _generate_skill_gaps(self, industry: str = None, job_title: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Generate skill gaps
        
        Args:
            industry: Industry
            job_title: Job title
            limit: Maximum number of skills to return
            
        Returns:
            List of skill gaps
        """
        # Get emerging skills as base for gaps
        emerging_skills = self._generate_emerging_skills(industry, job_title, limit * 2)
        
        # Filter to skills with high growth rates
        high_growth_skills = [skill for skill in emerging_skills if skill["growth_rate"] > 20]
        
        # Add additional information
        for skill in high_growth_skills:
            skill["gap_level"] = random.randint(60, 90)  # higher means bigger gap
            skill["impact"] = random.randint(70, 95)  # impact on hiring
        
        # Sort by gap level
        high_growth_skills.sort(key=lambda x: x["gap_level"], reverse=True)
        
        return high_growth_skills[:limit]

    def _get_skill_categories(self, industry: str = None, job_title: str = None) -> Dict[str, Any]:
        """
        Get skill categories distribution
        
        Args:
            industry: Industry
            job_title: Job title
            
        Returns:
            Skill categories distribution
        """
        # Default distribution
        distribution = {
            "technical": 60,
            "soft_skills": 25,
            "domain_knowledge": 15
        }
        
        # Adjust based on industry
        if industry:
            industry = industry.lower()
            if industry == "technology":
                distribution = {
                    "technical": 70,
                    "soft_skills": 20,
                    "domain_knowledge": 10
                }
            elif industry == "healthcare":
                distribution = {
                    "technical": 45,
                    "soft_skills": 25,
                    "domain_knowledge": 30
                }
            elif industry == "finance":
                distribution = {
                    "technical": 50,
                    "soft_skills": 25,
                    "domain_knowledge": 25
                }
            else:
                distribution = {
                    "technical": 25,
                    "soft_skills": 20,
                    "domain_knowledge": 20,
                    "security": 20,
                    "specialized_tools": 15
                }
        
        # Adjust based on job title
        if job_title:
            job_title = job_title.lower()
            if "manager" in job_title or "lead" in job_title:
                distribution["soft_skills"] += 15
                distribution["technical"] -= 15
            elif "architect" in job_title or "senior" in job_title:
                distribution["technical"] += 10
                distribution["soft_skills"] -= 5
                distribution["domain_knowledge"] -= 5
        
        # Add breakdown of technical skills
        technical_breakdown = {}
        
        if industry:
            industry = industry.lower()
            if industry == "technology":
                technical_breakdown = {
                    "programming": 35,
                    "devops": 20,
                    "databases": 15,
                    "cloud": 20,
                    "security": 10
                }
            elif industry == "healthcare":
                technical_breakdown = {
                    "health_informatics": 30,
                    "data_analysis": 25,
                    "software_systems": 20,
                    "security": 15,
                    "cloud": 10
                }
            elif industry == "finance":
                technical_breakdown = {
                    "data_analysis": 30,
                    "security": 25,
                    "software_systems": 20,
                    "cloud": 15,
                    "blockchain": 10
                }
            else:
                technical_breakdown = {
                    "data_analysis": 25,
                    "software_systems": 20,
                    "cloud": 20,
                    "security": 20,
                    "specialized_tools": 15
                }
        
        # Add randomness
        for key in distribution:
            distribution[key] = int(distribution[key] * random.uniform(0.9, 1.1))
        
        # Normalize to 100%
        total = sum(distribution.values())
        for key in distribution:
            distribution[key] = int((distribution[key] / total) * 100)
        
        # Normalize technical breakdown
        if technical_breakdown:
            total = sum(technical_breakdown.values())
            for key in technical_breakdown:
                technical_breakdown[key] = int((technical_breakdown[key] / total) * 100)
        
        return {
            "distribution": distribution,
            "technical_breakdown": technical_breakdown
        }

    def _get_skills_insights_from_ai(self, industry: str, job_title: str, 
                                   top_skills: List[Dict[str, Any]], 
                                   emerging_skills: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Get skills insights from DeepSeek AI
        
        Args:
            industry: Industry
            job_title: Job title
            top_skills: List of top skills
            emerging_skills: List of emerging skills
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI insights")
            return []
        
        try:
            # Simplified data to avoid token limits
            simplified_data = {
                "industry": industry,
                "job_title": job_title,
                "top_skills": [skill["name"] for skill in top_skills[:10]],
                "emerging_skills": [skill["name"] for skill in emerging_skills[:5]]
            }
            
            # Prepare the API request
            prompt = f"""Based on this skills data, provide strategic insights for professionals in the {industry or 'technology'} industry{',' if job_title else ''} {job_title or ''}:
            
            Data: {json.dumps(simplified_data)}
            
            Provide 3-4 concise, strategic insights about:
            1. Current skill demands
            2. Skill acquisition priorities
            3. Future skill trends
            
            Format as a JSON array with objects containing "title" and "description" fields.
            Keep insights focused, factual, and actionable.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career advisor providing concise, data-driven insights about skills."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
                "max_tokens": 800
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
                    return []
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return []
            
        except Exception as e:
            logger.error(f"Error getting skills insights from AI: {str(e)}")
            return []

    @cache_result(timeout=3600 * 24)  # Cache for 24 hours
    def compare_industries(self, industries: List[str]) -> Dict[str, Any]:
        """
        Compare different industries
        
        Args:
            industries: List of industries to compare
            
        Returns:
            Industry comparison data
        """
        try:
            # Validate industries
            valid_industries = []
            for industry in industries:
                if industry.lower() in self.industry_data:
                    valid_industries.append(industry.lower())
            
            if not valid_industries:
                return {
                    "error": "No valid industries found",
                    "comparison": []
                }
            
            # Generate comparison data
            comparison = []
            for industry in valid_industries:
                industry_data = self.industry_data[industry]
                
                # Add random variance to data
                comparison.append({
                    "name": industry.capitalize(),
                    "metrics": {
                        "growth_rate": round(industry_data["growth_rate"] * random.uniform(0.9, 1.1), 1),
                        "avg_salary": int(industry_data["avg_salary"] * random.uniform(0.95, 1.05)),
                        "job_openings": int(industry_data["job_openings"] * random.uniform(0.9, 1.1)),
                        "remote_percentage": int(industry_data["remote_percentage"] * random.uniform(0.9, 1.1)),
                        "competitiveness": random.randint(60, 90),  # Random competitiveness score
                        "stability": random.randint(50, 90)  # Random stability score
                    },
                    "top_skills": industry_data["top_skills"],
                    "outlook": self._get_industry_outlook(industry)
                })
            
            # Generate comparison insights
            insights = self._get_industry_comparison_insights_from_ai(comparison)
            
            return {
                "comparison": comparison,
                "insights": insights
            }
            
        except Exception as e:
            logger.error(f"Error comparing industries: {str(e)}")
            return {
                "error": str(e),
                "comparison": []
            }

    def _get_industry_outlook(self, industry: str) -> Dict[str, Any]:
        """
        Generate industry outlook
        
        Args:
            industry: Industry
            
        Returns:
            Industry outlook
        """
        # Base outlook metrics
        growth_trends = ["positive", "stable", "mixed", "rapid", "slowing"]
        remote_trends = ["increasing", "stable", "mandatory", "hybrid", "varying"]
        innovation_levels = ["high", "moderate", "very high", "transformative", "incremental"]
        
        # Industry-specific outlooks
        outlooks = {
            "technology": {
                "short_term": "positive",
                "long_term": "very positive",
                "growth_trend": "rapid",
                "remote_trend": "increasing",
                "innovation_level": "very high",
                "disruption_risk": "moderate",
                "barriers_to_entry": "moderate"
            },
            "healthcare": {
                "short_term": "positive",
                "long_term": "very positive",
                "growth_trend": "stable",
                "remote_trend": "hybrid",
                "innovation_level": "high",
                "disruption_risk": "moderate",
                "barriers_to_entry": "high"
            },
            "finance": {
                "short_term": "stable",
                "long_term": "positive",
                "growth_trend": "moderate",
                "remote_trend": "hybrid",
                "innovation_level": "high",
                "disruption_risk": "high",
                "barriers_to_entry": "high"
            },
            "education": {
                "short_term": "mixed",
                "long_term": "positive",
                "growth_trend": "stable",
                "remote_trend": "increasing",
                "innovation_level": "moderate",
                "disruption_risk": "high",
                "barriers_to_entry": "moderate"
            },
            "manufacturing": {
                "short_term": "stable",
                "long_term": "stable",
                "growth_trend": "slow",
                "remote_trend": "limited",
                "innovation_level": "moderate",
                "disruption_risk": "high",
                "barriers_to_entry": "high"
            }
        }
        
        if industry in outlooks:
            return outlooks[industry]
        
        # Default outlook for unknown industries
        return {
            "short_term": random.choice(["positive", "stable", "mixed"]),
            "long_term": random.choice(["positive", "very positive", "stable"]),
            "growth_trend": random.choice(growth_trends),
            "remote_trend": random.choice(remote_trends),
            "innovation_level": random.choice(innovation_levels),
            "disruption_risk": random.choice(["low", "moderate", "high"]),
            "barriers_to_entry": random.choice(["low", "moderate", "high"])
        }

    def _get_industry_comparison_insights_from_ai(self, comparison_data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Get industry comparison insights from DeepSeek AI
        
        Args:
            comparison_data: Industry comparison data
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI insights")
            return []
        
        try:
            # Simplified data to avoid token limits
            simplified_data = []
            for industry in comparison_data:
                simplified_data.append({
                    "name": industry["name"],
                    "growth_rate": industry["metrics"]["growth_rate"],
                    "avg_salary": industry["metrics"]["avg_salary"],
                    "job_openings": industry["metrics"]["job_openings"],
                    "remote_percentage": industry["metrics"]["remote_percentage"],
                    "top_skills": industry["top_skills"]
                })
            
            # Prepare the API request
            prompt = f"""Compare these industries for career decisions:
            
            Data: {json.dumps(simplified_data)}
            
            Provide 4-5 concise, comparative insights about:
            1. Growth opportunities
            2. Salary expectations
            3. Work-life balance differences
            4. Skill transferability between industries
            5. Future outlook
            
            Format as a JSON array with objects containing "title" and "description" fields.
            Keep insights focused on helping career decisions.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career advisor specializing in industry analysis and comparison."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
                "max_tokens": 800
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
                    return []
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return []
            
        except Exception as e:
            logger.error(f"Error getting industry comparison insights from AI: {str(e)}")
            return []

    def _normalize_job_title(self, job_title: str) -> str:
        """
        Normalize job title for consistency
        
        Args:
            job_title: Job title to normalize
            
        Returns:
            Normalized job title
        """
        # Common title mappings
        title_mappings = {
            # Software engineering
            "swe": "Software Engineer",
            "software engineer": "Software Engineer",
            "software developer": "Software Engineer",
            "programmer": "Software Engineer",
            "coder": "Software Engineer",
            "developer": "Software Engineer",
            "software development engineer": "Software Engineer",
            
            # Data science
            "data scientist": "Data Scientist",
            "ml engineer": "Machine Learning Engineer",
            "machine learning engineer": "Machine Learning Engineer",
            "ai engineer": "Machine Learning Engineer",
            "artificial intelligence engineer": "Machine Learning Engineer",
            "data analyst": "Data Analyst",
            "business analyst": "Business Analyst",
            "data engineer": "Data Engineer",
            
            # Management
            "project manager": "Project Manager",
            "product manager": "Product Manager",
            "program manager": "Program Manager",
            "engineering manager": "Engineering Manager",
            "team lead": "Team Lead",
            "tech lead": "Technical Lead",
            "technical lead": "Technical Lead",
            
            # DevOps
            "devops engineer": "DevOps Engineer",
            "site reliability engineer": "Site Reliability Engineer",
            "sre": "Site Reliability Engineer",
            "cloud engineer": "Cloud Engineer",
            "infrastructure engineer": "Infrastructure Engineer",
            
            # UX/UI
            "ux designer": "UX Designer",
            "ui designer": "UI Designer",
            "ux/ui designer": "UX/UI Designer",
            "user experience designer": "UX Designer",
            "user interface designer": "UI Designer",
            "product designer": "Product Designer",
            
            # QA
            "qa engineer": "QA Engineer",
            "quality assurance engineer": "QA Engineer",
            "test engineer": "QA Engineer",
            "automation engineer": "QA Automation Engineer",
            "test automation engineer": "QA Automation Engineer",
            
            # Security
            "security engineer": "Security Engineer",
            "information security engineer": "Security Engineer",
            "cybersecurity engineer": "Security Engineer",
            "security analyst": "Security Analyst"
        }
        
        # Normalize the job title
        normalized = job_title.lower()
        
        # Check for exact matches
        if normalized in title_mappings:
            return title_mappings[normalized]
        
        # Check for partial matches
        for key, value in title_mappings.items():
            if key in normalized:
                return value
        
        # If no match found, capitalize words
        return " ".join(word.capitalize() for word in normalized.split())

    def get_skill_recommendations(self, user_skills: List[str], target_role: str = None, 
                                industry: str = None) -> Dict[str, Any]:
        """
        Get personalized skill recommendations
        
        Args:
            user_skills: List of user's current skills
            target_role: Target role (optional)
            industry: Industry (optional)
            
        Returns:
            Skill recommendations
        """
        try:
            # Get top skills for target role or industry
            if target_role:
                target_skills = self._generate_top_skills(industry, target_role, 20)
            elif industry:
                target_skills = self._generate_top_skills(industry, None, 20)
            else:
                # Default to general tech skills
                target_skills = self._generate_top_skills("technology", None, 20)
            
            # Normalize user skills
            normalized_user_skills = [skill.lower() for skill in user_skills]
            
            # Split into existing and missing skills
            existing_skills = []
            missing_skills = []
            
            for skill in target_skills:
                skill_name = skill["name"].lower()
                
                # Check if user has this skill
                has_skill = False
                for user_skill in normalized_user_skills:
                    if skill_name == user_skill or skill_name in user_skill or user_skill in skill_name:
                        has_skill = True
                        break
                
                if has_skill:
                    existing_skills.append(skill)
                else:
                    missing_skills.append(skill)
            
            # Sort missing skills by importance
            missing_skills.sort(key=lambda x: x["importance"], reverse=True)
            
            # Get emerging skills
            emerging_skills = self._generate_emerging_skills(industry, target_role, 10)
            
            # Try to get AI recommendations
            ai_recommendations = self._get_skill_recommendation_insights_from_ai(
                user_skills, target_role, industry, missing_skills
            )
            
            result = {
                "user_skills": normalized_user_skills,
                "existing_relevant_skills": existing_skills,
                "recommended_skills": missing_skills[:10],
                "emerging_skills": emerging_skills
            }
            
            if ai_recommendations:
                result["ai_recommendations"] = ai_recommendations
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting skill recommendations: {str(e)}")
            return {
                "error": str(e),
                "recommended_skills": []
            }

    def _get_skill_recommendation_insights_from_ai(self, user_skills: List[str], target_role: str,
                                                industry: str, missing_skills: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Get skill recommendation insights from DeepSeek AI
        
        Args:
            user_skills: User's current skills
            target_role: Target role
            industry: Industry
            missing_skills: List of missing skills
            
        Returns:
            AI-generated insights
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI recommendations")
            return []
        
        try:
            # Simplified data to avoid token limits
            simplified_data = {
                "current_skills": user_skills,
                "target_role": target_role,
                "industry": industry,
                "missing_skills": [skill["name"] for skill in missing_skills[:7]]
            }
            
            # Prepare the API request
            prompt = f"""Based on this information, provide personalized skill development recommendations:
            
            Data: {json.dumps(simplified_data)}
            
            Provide 3-4 concise, actionable recommendations for skill development:
            1. Which skills to prioritize and why
            2. Learning resources or approaches for those skills
            3. How these skills will benefit their career goals
            
            Format as a JSON array with objects containing "title" and "description" fields.
            Keep insights focused, actionable, and personalized.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career coach providing personalized skill development advice."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4,
                "response_format": {"type": "json_object"},
                "max_tokens": 800
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
                    return []
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return []
            
        except Exception as e:
            logger.error(f"Error getting skill recommendation insights from AI: {str(e)}")
            return []