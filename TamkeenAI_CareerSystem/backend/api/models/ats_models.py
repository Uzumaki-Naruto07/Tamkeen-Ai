from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ATSRequest(BaseModel):
    job_title: str
    job_description: str

class KeywordAnalysis(BaseModel):
    resume_keywords: List[str]
    job_keywords: List[str]
    matching_keywords: List[str]
    missing_keywords: List[str]

class ATSAnalysisResult(BaseModel):
    score: float
    job_title: str
    matching_keywords: List[str]
    missing_keywords: List[str]
    assessment: str
    llm_analysis: Optional[str] = None
    improvement_roadmap: Optional[str] = None

class ATSKeywordRequest(BaseModel):
    job_description: str 