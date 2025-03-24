"""
Career Assessment Module

This module calculates career readiness scores, assesses skills against industry standards,
and provides recommendations for career development.
"""

import os
import json
import math
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import other core modules
from .user_info import UserProfile
from .keyword_recommender import extract_keywords, find_matching_keywords

# Import settings
from config.settings import CAREER_READINESS_THRESHOLD, BASE_DIR

# Define paths for industry data
INDUSTRY_DATA_DIR = os.path.join(BASE_DIR, 'data', 'industries')
os.makedirs(INDUSTRY_DATA_DIR, exist_ok=True)

# Try importing scikit-learn for prediction models
try:
    import numpy as np
    import pandas as pd
    from sklearn.preprocessing import StandardScaler
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: scikit-learn not available. Advanced assessment features will be limited.")


class CareerAssessment:
    """Class for handling career assessments and scoring"""
    
    def __init__(self, user_profile: Optional[UserProfile] = None):
        """
        Initialize with optional user profile
        
        Args:
            user_profile: User profile object (optional)
        """
        self.user_profile = user_profile
        self.assessment_data = {
            "timestamp": datetime.now().isoformat(),
            "overall_score": 0,
            "category_scores": {},
            "strengths": [],
            "weaknesses": [],
            "recommendations": []
        }
        
        # Load industry data for benchmarking
        self.industry_benchmarks = self._load_industry_benchmarks()
    
    def _load_industry_benchmarks(self) -> Dict[str, Any]:
        """Load industry benchmark data for skill comparisons"""
        benchmarks = {}
        
        try:
            # Look for industry JSON files in the data directory
            for filename in os.listdir(INDUSTRY_DATA_DIR):
                if filename.endswith('.json'):
                    industry_name = os.path.splitext(filename)[0]
                    file_path = os.path.join(INDUSTRY_DATA_DIR, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        benchmarks[industry_name] = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading industry benchmarks: {e}")
            
            # Create minimal default data if no files exist
            benchmarks = {
                "technology": {
                    "required_skills": ["programming", "problem solving", "communication"],
                    "skill_thresholds": {"programming": 0.7, "problem solving": 0.6}
                },
                "finance": {
                    "required_skills": ["financial analysis", "excel", "accounting"],
                    "skill_thresholds": {"financial analysis": 0.7, "excel": 0.6}
                },
                "healthcare": {
                    "required_skills": ["patient care", "medical knowledge", "teamwork"],
                    "skill_thresholds": {"patient care": 0.8, "medical knowledge": 0.7}
                }
            }
        
        return benchmarks
    
    def calculate_career_readiness(self, user_profile: Optional[UserProfile] = None,
                                  resume_text: Optional[str] = None,
                                  target_industry: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculate career readiness score based on profile and resume
        
        Args:
            user_profile: User profile object (optional)
            resume_text: Resume text content (optional)
            target_industry: Target industry for assessment (optional)
            
        Returns:
            dict: Assessment data with scores and recommendations
        """
        # Use provided profile or the one initialized with the class
        profile = user_profile if user_profile else self.user_profile
        
        # Initialize category scores
        category_scores = {
            "profile_completeness": 0,
            "skill_relevance": 0,
            "experience_alignment": 0,
            "education_match": 0,
            "certification_value": 0
        }
        
        # If no profile or resume, return zero scores
        if not profile and not resume_text:
            self.assessment_data["overall_score"] = 0
            self.assessment_data["category_scores"] = category_scores
            self.assessment_data["recommendations"].append(
                "Please complete your profile or upload a resume for assessment."
            )
            return self.assessment_data
        
        # Calculate profile completeness score
        if profile:
            profile_data = profile.get_profile_data()
            category_scores["profile_completeness"] = self._calculate_profile_completeness(profile_data)
            
            # Get career readiness score from user profile if available
            if hasattr(profile, 'get_career_readiness_score'):
                profile_score = profile.get_career_readiness_score()
                category_scores["profile_completeness"] = profile_score
        
        # Calculate skill relevance if resume and target industry provided
        if resume_text and target_industry and target_industry in self.industry_benchmarks:
            category_scores["skill_relevance"] = self._calculate_skill_relevance(
                resume_text, target_industry
            )
        
        # Calculate experience alignment
        if profile and 'experience' in profile.profile_data:
            category_scores["experience_alignment"] = self._calculate_experience_alignment(
                profile.profile_data["experience"], target_industry
            )
        
        # Calculate education match
        if profile and 'education' in profile.profile_data:
            category_scores["education_match"] = self._calculate_education_match(
                profile.profile_data["education"], target_industry
            )
        
        # Calculate certification value
        if profile and 'certifications' in profile.profile_data:
            category_scores["certification_value"] = self._calculate_certification_value(
                profile.profile_data["certifications"], target_industry
            )
        
        # Calculate overall weighted score
        weights = {
            "profile_completeness": 0.2,
            "skill_relevance": 0.3,
            "experience_alignment": 0.25,
            "education_match": 0.15,
            "certification_value": 0.1
        }
        
        overall_score = sum(
            score * weights[category] for category, score in category_scores.items()
        )
        
        # Update assessment data
        self.assessment_data["overall_score"] = round(overall_score, 1)
        self.assessment_data["category_scores"] = {
            k: round(v, 1) for k, v in category_scores.items()
        }
        
        # Identify strengths and weaknesses
        self._identify_strengths_weaknesses(category_scores)
        
        # Generate recommendations
        self._generate_recommendations(category_scores, target_industry)
        
        return self.assessment_data
    
    def _calculate_profile_completeness(self, profile_data: Dict[str, Any]) -> float:
        """Calculate profile completeness score (0-100)"""
        if not profile_data:
            return 0
        
        # Define weights for different sections
        section_weights = {
            "personal_info": 0.2,
            "education": 0.15,
            "experience": 0.25,
            "skills": 0.25,
            "certifications": 0.1,
            "career_goals": 0.05
        }
        
        total_score = 0
        
        # Personal info completeness
        if "personal_info" in profile_data:
            personal_info = profile_data["personal_info"]
            required_fields = ["name", "email"]
            optional_fields = ["phone", "location", "linkedin", "website"]
            
            fields_present = 0
            for field in required_fields:
                if field in personal_info and personal_info[field]:
                    fields_present += 1
                    
            for field in optional_fields:
                if field in personal_info and personal_info[field]:
                    fields_present += 0.5  # Optional fields worth half
            
            max_fields = len(required_fields) + len(optional_fields) * 0.5
            personal_score = (fields_present / max_fields) * 100 if max_fields > 0 else 0
            total_score += personal_score * section_weights["personal_info"]
        
        # Education completeness
        if "education" in profile_data:
            education_count = len(profile_data["education"])
            education_score = min(100, education_count * 50)  # 2 entries = 100%
            total_score += education_score * section_weights["education"]
        
        # Experience completeness
        if "experience" in profile_data:
            experience_count = len(profile_data["experience"])
            experience_score = min(100, experience_count * 33.3)  # 3 entries = 100%
            total_score += experience_score * section_weights["experience"]
        
        # Skills completeness
        if "skills" in profile_data:
            skill_count = len(profile_data["skills"])
            skill_score = min(100, skill_count * 10)  # 10 skills = 100%
            total_score += skill_score * section_weights["skills"]
        
        # Certifications completeness
        if "certifications" in profile_data:
            cert_count = len(profile_data["certifications"])
            cert_score = min(100, cert_count * 33.3)  # 3 certs = 100%
            total_score += cert_score * section_weights["certifications"]
        
        # Career goals completeness
        if "career_goals" in profile_data and profile_data["career_goals"]:
            # Simply check if career goals exist
            career_score = 100 if len(profile_data["career_goals"]) > 0 else 0
            total_score += career_score * section_weights["career_goals"]
        
        return total_score
    
    def _calculate_skill_relevance(self, resume_text: str, target_industry: str) -> float:
        """Calculate skill relevance score based on industry benchmark"""
        # Extract keywords from resume
        resume_keywords = extract_keywords(resume_text, method="auto", top_n=30)
        resume_keywords_set = {kw.lower() for kw, _ in resume_keywords}
        
        # Get industry benchmark skills
        industry = self.industry_benchmarks.get(target_industry, {})
        required_skills = set(s.lower() for s in industry.get("required_skills", []))
        
        if not required_skills:
            return 50  # Default score if no industry benchmark
        
        # Calculate match percentage
        matches = resume_keywords_set.intersection(required_skills)
        match_percent = (len(matches) / len(required_skills)) * 100 if required_skills else 0
        
        # Apply skill threshold weighting if available
        skill_thresholds = industry.get("skill_thresholds", {})
        
        if skill_thresholds and matches:
            weighted_score = 0
            total_weight = 0
            
            for skill in matches:
                if skill in skill_thresholds:
                    weight = skill_thresholds[skill]
                    weighted_score += weight * 100
                    total_weight += weight
                else:
                    weighted_score += 50  # Default weight for matched skills not in threshold
                    total_weight += 0.5
            
            if total_weight > 0:
                return weighted_score / total_weight
        
        return match_percent
    
    def _calculate_experience_alignment(self, experience_list: List[Dict[str, Any]], 
                                        target_industry: Optional[str] = None) -> float:
        """Calculate experience alignment score"""
        if not experience_list:
            return 0
        
        # Basic score based on years of experience
        total_years = 0
        relevant_years = 0
        
        for exp in experience_list:
            # Calculate duration for this position
            start_date = exp.get("start_date", "")
            end_date = exp.get("end_date", "present")
            
            if not start_date:
                continue
                
            try:
                # Parse dates
                start_year = int(start_date.split("-")[0]) if "-" in start_date else int(start_date)
                
                if end_date.lower() == "present":
                    end_year = datetime.now().year
                else:
                    end_year = int(end_date.split("-")[0]) if "-" in end_date else int(end_date)
                
                years = end_year - start_year
                if years < 0:
                    years = 0
                
                total_years += years
                
                # Check if experience is relevant to target industry
                if target_industry and target_industry in self.industry_benchmarks:
                    description = exp.get("description", "").lower()
                    title = exp.get("title", "").lower()
                    company = exp.get("company", "").lower()
                    
                    # Check for industry keywords in experience
                    industry_keywords = set(k.lower() for k in 
                                          self.industry_benchmarks[target_industry].get("keywords", []))
                    
                    # If no keywords defined, use required skills
                    if not industry_keywords:
                        industry_keywords = set(s.lower() for s in 
                                              self.industry_benchmarks[target_industry].get("required_skills", []))
                    
                    # Look for matches in title, company, and description
                    text_to_check = f"{title} {company} {description}"
                    matches = any(kw in text_to_check for kw in industry_keywords)
                    
                    if matches:
                        relevant_years += years
            except (ValueError, IndexError):
                continue
        
        # Base experience score on total years (max out at 10 years)
        experience_score = min(100, total_years * 10)
        
        # If target industry specified, weight by relevance
        if target_industry and total_years > 0:
            relevance_factor = relevant_years / total_years
            experience_score = experience_score * (0.4 + 0.6 * relevance_factor)
        
        return experience_score
    
    def _calculate_education_match(self, education_list: List[Dict[str, Any]], 
                                   target_industry: Optional[str] = None) -> float:
        """Calculate education match score"""
        if not education_list:
            return 0
        
        # Basic score based on education level
        education_levels = {
            "high school": 30,
            "associate": 50,
            "bachelor": 70,
            "master": 85,
            "doctorate": 100,
            "phd": 100,
            "certificate": 40
        }
        
        # Get highest education score
        highest_score = 0
        for edu in education_list:
            degree = edu.get("degree", "").lower()
            
            # Try to match education level
            edu_score = 0
            for level, score in education_levels.items():
                if level in degree:
                    edu_score = score
                    break
            
            highest_score = max(highest_score, edu_score)
        
        # If target industry specified, check for relevant field of study
        if target_industry and target_industry in self.industry_benchmarks:
            relevant_fields = set(f.lower() for f in 
                                self.industry_benchmarks[target_industry].get("relevant_fields", []))
            
            if relevant_fields:
                has_relevant = False
                for edu in education_list:
                    field = edu.get("field", "").lower()
                    institution = edu.get("institution", "").lower()
                    
                    # Check for field match
                    if any(rf in field for rf in relevant_fields):
                        has_relevant = True
                        break
                
                # Adjust score based on relevance
                if not has_relevant:
                    highest_score *= 0.7  # Reduce score if no relevant field
        
        return highest_score
    
    def _calculate_certification_value(self, certification_list: List[Dict[str, Any]],
                                      target_industry: Optional[str] = None) -> float:
        """Calculate certification value score"""
        if not certification_list:
            return 0
        
        # Basic score based on number of certifications (max out at 5)
        cert_count = len(certification_list)
        cert_score = min(100, cert_count * 20)
        
        # If target industry specified, check for relevant certifications
        if target_industry and target_industry in self.industry_benchmarks:
            valuable_certs = set(c.lower() for c in 
                               self.industry_benchmarks[target_industry].get("valuable_certifications", []))
            
            if valuable_certs:
                matches = 0
                for cert in certification_list:
                    name = cert.get("name", "").lower()
                    issuer = cert.get("issuer", "").lower()
                    
                    # Check for certification match
                    cert_text = f"{name} {issuer}"
                    if any(vc in cert_text for vc in valuable_certs):
                        matches += 1
                
                # Weight score by relevant certifications
                relevance_factor = matches / cert_count if cert_count > 0 else 0
                cert_score = cert_score * (0.5 + 0.5 * relevance_factor)
        
        return cert_score
    
    def _identify_strengths_weaknesses(self, category_scores: Dict[str, float]) -> None:
        """Identify strengths and weaknesses based on category scores"""
        self.assessment_data["strengths"] = []
        self.assessment_data["weaknesses"] = []
        
        # Define threshold for strength/weakness classification
        strength_threshold = 70
        weakness_threshold = 50
        
        # Map score categories to friendly names
        category_names = {
            "profile_completeness": "Profile Completeness",
            "skill_relevance": "Skill Relevance",
            "experience_alignment": "Experience Alignment",
            "education_match": "Educational Background",
            "certification_value": "Professional Certifications"
        }
        
        # Classify each category
        for category, score in category_scores.items():
            if score >= strength_threshold:
                self.assessment_data["strengths"].append(category_names.get(category, category))
            elif score <= weakness_threshold:
                self.assessment_data["weaknesses"].append(category_names.get(category, category))
    
    def _generate_recommendations(self, category_scores: Dict[str, float],
                                target_industry: Optional[str] = None) -> None:
        """Generate recommendations based on assessment results"""
        self.assessment_data["recommendations"] = []
        
        # Check overall score against threshold
        overall_score = self.assessment_data["overall_score"]
        if overall_score < CAREER_READINESS_THRESHOLD:
            self.assessment_data["recommendations"].append(
                f"Your overall score of {overall_score} is below the recommended level of "
                f"{CAREER_READINESS_THRESHOLD}. Focus on the areas mentioned below."
            )
        
        # Recommendations for profile completeness
        if category_scores["profile_completeness"] < 70:
            self.assessment_data["recommendations"].append(
                "Complete your profile with more detailed information about your experience, "
                "education, and skills to improve your assessment."
            )
        
        # Recommendations for skill relevance
        if category_scores["skill_relevance"] < 60:
            if target_industry:
                self.assessment_data["recommendations"].append(
                    f"Your skills don't strongly align with the {target_industry} industry. "
                    f"Consider developing these key skills: " + 
                    ", ".join(self.industry_benchmarks.get(target_industry, {})
                             .get("required_skills", ["relevant technical skills"])[:3])
                )
            else:
                self.assessment_data["recommendations"].append(
                    "Add more specific skills to your profile that align with your target role."
                )
        
        # Recommendations for experience
        if category_scores["experience_alignment"] < 50:
            self.assessment_data["recommendations"].append(
                "Your experience could better align with your career goals. Consider internships, "
                "volunteer work, or projects that demonstrate relevant capabilities."
            )
        
        # Recommendations for education
        if category_scores["education_match"] < 60:
            self.assessment_data["recommendations"].append(
                "Consider additional education or training programs that align with your target career."
            )
        
        # Recommendations for certifications
        if category_scores["certification_value"] < 40:
            if target_industry:
                valuable_certs = self.industry_benchmarks.get(target_industry, {}).get("valuable_certifications", [])
                if valuable_certs:
                    self.assessment_data["recommendations"].append(
                        f"Pursue industry-recognized certifications like: " + 
                        ", ".join(valuable_certs[:2])
                    )
                else:
                    self.assessment_data["recommendations"].append(
                        "Industry-recognized certifications could strengthen your profile."
                    )
            else:
                self.assessment_data["recommendations"].append(
                    "Adding relevant certifications can boost your profile strength."
                )
    
    def get_assessment_report(self) -> Dict[str, Any]:
        """
        Get the complete assessment report
        
        Returns:
            dict: Assessment report with scores, strengths, weaknesses and recommendations
        """
        return self.assessment_data
    
    def analyze_career_trajectory(self, experience_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze career trajectory based on experience history
        
        Args:
            experience_list: List of experience entries
            
        Returns:
            dict: Career trajectory analysis
        """
        if not experience_list:
            return {
                "trajectory": "undefined",
                "growth_rate": 0,
                "job_changes": 0,
                "avg_tenure": 0,
                "analysis": "Not enough experience data to analyze career trajectory."
            }
        
        # Sort experiences by start date
        try:
            sorted_exp = sorted(experience_list, 
                               key=lambda x: datetime.strptime(x.get("start_date", "2000-01"), "%Y-%m")
                               if "-" in x.get("start_date", "") else datetime.strptime(x.get("start_date", "2000"), "%Y"))
        except ValueError:
            # If date parsing fails, assume order is already correct
            sorted_exp = experience_list
        
        # Calculate job changes and average tenure
        job_changes = len(experience_list) - 1
        total_tenure = 0
        tenures = []
        
        for i, exp in enumerate(sorted_exp):
            start_date = exp.get("start_date", "")
            end_date = exp.get("end_date", "present")
            
            if not start_date:
                continue
                
            try:
                # Parse dates
                if "-" in start_date:
                    start = datetime.strptime(start_date, "%Y-%m")
                else:
                    start = datetime.strptime(start_date, "%Y")
                
                if end_date.lower() == "present":
                    end = datetime.now()
                elif "-" in end_date:
                    end = datetime.strptime(end_date, "%Y-%m")
                else:
                    end = datetime.strptime(end_date, "%Y")
                
                # Calculate tenure in years
                tenure = (end.year - start.year) + (end.month - start.month) / 12
                if tenure < 0:
                    tenure = 0
                
                total_tenure += tenure
                tenures.append(tenure)
            except (ValueError, AttributeError):
                continue
        
        avg_tenure = total_tenure / len(tenures) if tenures else 0
        
        # Analyze job titles for growth
        job_titles = [exp.get("title", "").lower() for exp in sorted_exp]
        
        # Simple trajectory analysis based on title keywords
        leadership_keywords = ["senior", "lead", "manager", "director", "head", "chief", "vp", "president"]
        specialist_keywords = ["specialist", "expert", "analyst", "engineer", "developer"]
        
        leadership_progression = 0
        for i, title in enumerate(job_titles):
            for keyword in leadership_keywords:
                if keyword in title:
                    leadership_progression += (i + 1)  # Weight by position (newer jobs count more)
        
        # Normalize by number of positions
        growth_rate = leadership_progression / len(job_titles) if job_titles else 0
        
        # Determine trajectory
        if growth_rate > 3:
            trajectory = "rapid growth"
        elif growth_rate > 1.5:
            trajectory = "steady growth"
        elif growth_rate > 0.5:
            trajectory = "moderate growth"
        elif growth_rate > 0:
            trajectory = "slow growth"
        else:
            trajectory = "stable"
        
        # Consider job hopping
        if avg_tenure < 1 and job_changes > 2:
            trajectory_note = "Frequent job changes may impact stability perception."
        elif avg_tenure > 5:
            trajectory_note = "Long tenure demonstrates stability and commitment."
        else:
            trajectory_note = "Career progression shows typical industry mobility."
        
        return {
            "trajectory": trajectory,
            "growth_rate": round(growth_rate, 1),
            "job_changes": job_changes,
            "avg_tenure": round(avg_tenure, 1),
            "analysis": trajectory_note
        }


def assess_resume_for_job(resume_text: str, job_description: str) -> Dict[str, Any]:
    """
    Standalone function to assess a resume against a job description
    
    Args:
        resume_text: Resume text content
        job_description: Job description text
        
    Returns:
        dict: Assessment results with fit score and recommendations
    """
    # Extract keywords from both texts
    resume_keywords = extract_keywords(resume_text, method="auto", top_n=30)
    job_keywords = extract_keywords(job_description, method="auto", top_n=30)
    
    # Find keyword matches
    matches = find_matching_keywords(resume_text, job_description)
    match_percent = matches.get("match_percent", 0)
    
    # Calculate overall fit score (70% keyword match, 30% document similarity)
    fit_score = match_percent
    
    # Generate recommendations
    recommendations = []
    missing_keywords = matches.get("missing_keywords", [])
    
    if match_percent < 70:
        recommendations.append(
            "Your resume could better match this job description. Consider highlighting these keywords: " +
            ", ".join(missing_keywords[:5])
        )
    
    if match_percent < 50:
        recommendations.append(
            "Your resume needs significant tailoring for this position. Review the job requirements carefully."
        )
    
    if match_percent >= 80:
        recommendations.append(
            "Your resume is well-aligned with this position. Highlight your achievements for these key areas."
        )
    
    return {
        "fit_score": round(fit_score, 1),
        "keyword_match": round(match_percent, 1),
        "matched_keywords": matches.get("matching_keywords", []),
        "missing_keywords": missing_keywords,
        "recommendations": recommendations
    }


def predict_career_readiness(user_features: Dict[str, Any]) -> Optional[float]:
    """
    Use ML model to predict career readiness (if available)
    
    Args:
        user_features: Dictionary of user features
        
    Returns:
        float or None: Predicted career readiness score, or None if ML not available
    """
    if not ML_AVAILABLE:
        return None
    
    try:
        # This is a placeholder for a real ML model
        # In a real implementation, you would load a trained model from disk
        
        # Extract features
        features = [
            user_features.get("profile_completeness", 0),
            user_features.get("skill_count", 0),
            user_features.get("experience_years", 0),
            user_features.get("education_level", 0),
            user_features.get("certification_count", 0)
        ]
        
        # Normalize features
        scaler = StandardScaler()
        normalized_features = scaler.fit_transform([features])[0]
        
        # Simple weighted sum as a placeholder for a real model
        weights = [0.2, 0.3, 0.25, 0.15, 0.1]
        predicted_score = sum(f * w for f, w in zip(normalized_features, weights))
        
        # Scale to 0-100 range
        min_val, max_val = -2, 2  # Typical range for normalized values
        predicted_score = ((predicted_score - min_val) / (max_val - min_val)) * 100
        
        return max(0, min(100, predicted_score))
    except Exception as e:
        print(f"Error in ML prediction: {e}")
        return None