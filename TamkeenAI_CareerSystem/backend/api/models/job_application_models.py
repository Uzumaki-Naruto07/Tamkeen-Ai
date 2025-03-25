from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class JobRole(BaseModel):
    """Model for job role recommendations"""
    job_title: str
    compatibility: float
    matching_skills: List[str]
    career_growth: str
    skill_enhancements: List[str]

class JobApplicationSettings(BaseModel):
    """Model for job application settings"""
    selected_roles: List[str]
    selected_emirates: List[str]
    apply_through_linkedin: bool = False
    apply_through_bayt: bool = False
    apply_through_gulftalent: bool = False
    apply_through_indeed: bool = False
    apply_through_naukrigulf: bool = False
    apply_through_monster: bool = False

class PlatformCredentials(BaseModel):
    """Model for job platform credentials"""
    platform: str
    username: str
    password: str

class CoverLetterRequest(BaseModel):
    """Model for cover letter generation request"""
    job_title: str
    job_description: str
    user_skills: List[str]
    user_experience: str
    company_name: Optional[str] = None

class ApplicationLog(BaseModel):
    """Model for job application log entry"""
    platform: str
    job_title: str
    company: Optional[str] = None
    status: str
    application_date: str
    notes: Optional[str] = None

class JobApplicationRequest(BaseModel):
    """Model for job application request"""
    cv_text: str
    user_profile: Dict[str, Any]
    settings: JobApplicationSettings
    platform_credentials: Optional[List[PlatformCredentials]] = None 