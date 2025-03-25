from sqlalchemy.orm import Session
from typing import Dict, Any
from ..models.database_models import ATSAnalysis

def save_ats_analysis(db: Session, user_id: int, analysis_data: Dict[str, Any], filename: str = None) -> ATSAnalysis:
    """Save ATS analysis results to the database"""
    ats_analysis = ATSAnalysis(
        user_id=user_id,
        job_title=analysis_data.get("job_title", ""),
        score=analysis_data.get("score", 0.0),
        assessment=analysis_data.get("assessment", ""),
        matching_keywords=analysis_data.get("matching_keywords", []),
        missing_keywords=analysis_data.get("missing_keywords", []),
        llm_analysis=analysis_data.get("llm_analysis", ""),
        improvement_roadmap=analysis_data.get("improvement_roadmap", ""),
        resume_filename=filename
    )
    
    db.add(ats_analysis)
    db.commit()
    db.refresh(ats_analysis)
    
    return ats_analysis

def get_user_ats_history(db: Session, user_id: int, limit: int = 10) -> list:
    """Get a user's ATS analysis history"""
    return db.query(ATSAnalysis).filter(
        ATSAnalysis.user_id == user_id
    ).order_by(ATSAnalysis.created_at.desc()).limit(limit).all()

def get_ats_analysis_by_id(db: Session, analysis_id: int, user_id: int) -> ATSAnalysis:
    """Get a specific ATS analysis by ID"""
    return db.query(ATSAnalysis).filter(
        ATSAnalysis.id == analysis_id,
        ATSAnalysis.user_id == user_id
    ).first() 