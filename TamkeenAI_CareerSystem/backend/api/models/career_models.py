from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PersonalityAssessment(BaseModel):
    team_orientation: int = Field(..., ge=1, le=5, description="Team orientation score (1-5)")
    problem_solving: int = Field(..., ge=1, le=5, description="Problem solving score (1-5)")
    detail_orientation: int = Field(..., ge=1, le=5, description="Detail orientation score (1-5)")
    adaptability: int = Field(..., ge=1, le=5, description="Adaptability score (1-5)")
    structure_preference: int = Field(..., ge=1, le=5, description="Structure preference score (1-5)")

class Certification(BaseModel):
    name: str
    issuer: str
    date: str

class UserProfileCreate(BaseModel):
    name: str
    email: str
    education_status: str
    linkedin_url: Optional[str] = None
    skills: str
    career_goals: str
    experience_level: str
    industry_preference: str
    work_environment: str
    personality_assessment: PersonalityAssessment
    certifications: Optional[List[Certification]] = []
    language: str = "en"

class CareerMatch(BaseModel):
    title: str
    title_ar: str
    match_percentage: int
    skills_match: int
    education_match: int
    trait_match: int
    growth_areas: List[str]

class CareerMatchResponse(BaseModel):
    matches: Dict[str, CareerMatch]

class TimelineEntry(BaseModel):
    year: int
    role: str
    skills: str
    growth_areas: str

class CareerTimeline(BaseModel):
    timeline: List[TimelineEntry]

class ChatbotRequest(BaseModel):
    query: str
    language: str = "en"

class ChatbotResponse(BaseModel):
    response: str 