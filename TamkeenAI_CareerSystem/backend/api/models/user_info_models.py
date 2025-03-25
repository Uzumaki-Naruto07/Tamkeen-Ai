from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class UserInfo(BaseModel):
    """Model for collecting user information for career guidance"""
    name: str
    age: Optional[int] = None
    education_level: str
    field_of_study: Optional[str] = None
    work_experience_years: Optional[int] = None
    skills: List[str]
    interests: List[str]
    personality_traits: Optional[List[str]] = None
    career_goals: Optional[str] = None
    preferred_work_environment: Optional[str] = None
    location: Optional[str] = None
    language: str = "en"

class PersonalityAssessment(BaseModel):
    """Model for personality assessment results"""
    traits: Dict[str, float]
    strengths: List[str]
    weaknesses: List[str]
    recommended_environments: List[str]
    communication_style: str

class CareerGuidanceRequest(BaseModel):
    """Request model for personalized career guidance"""
    user_info: UserInfo
    personality_assessment: Optional[PersonalityAssessment] = None
    resume_text: Optional[str] = None
    preferred_industries: Optional[List[str]] = None
    preferred_roles: Optional[List[str]] = None

class CareerGuidanceResponse(BaseModel):
    """Response model for personalized career guidance"""
    recommended_careers: List[Dict[str, Any]]
    skill_gaps: List[Dict[str, Any]]
    learning_paths: List[Dict[str, Any]]
    career_timeline: List[Dict[str, Any]]
    personalized_advice: str 