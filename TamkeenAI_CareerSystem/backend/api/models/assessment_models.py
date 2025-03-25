from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum

class InterestArea(str, Enum):
    REALISTIC = "realistic"
    INVESTIGATIVE = "investigative"
    ARTISTIC = "artistic"
    SOCIAL = "social"
    ENTERPRISING = "enterprising"
    CONVENTIONAL = "conventional"

class WorkValue(str, Enum):
    ACHIEVEMENT = "achievement"
    INDEPENDENCE = "independence"
    RECOGNITION = "recognition"
    RELATIONSHIPS = "relationships"
    SUPPORT = "support"
    WORKING_CONDITIONS = "working_conditions"

class SkillLevel(str, Enum):
    NOVICE = "novice"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class PersonalityQuestion(BaseModel):
    id: str
    question: str
    trait: str
    reverse_scored: bool = False

class InterestQuestion(BaseModel):
    id: str
    question: str
    interest_area: InterestArea

class ValueQuestion(BaseModel):
    id: str
    question: str
    work_value: WorkValue

class AssessmentResponse(BaseModel):
    question_id: str
    score: int  # Usually 1-5 for Likert scale

class AssessmentResult(BaseModel):
    personality_traits: Dict[str, float]
    interest_areas: Dict[str, float]
    work_values: Dict[str, float]
    recommended_careers: List[Dict[str, Any]]
    career_alignment_reasons: List[str] 