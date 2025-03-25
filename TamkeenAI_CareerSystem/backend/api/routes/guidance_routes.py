from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List, Any, Optional
from ..models.user_info_models import UserInfo, PersonalityAssessment, CareerGuidanceRequest, CareerGuidanceResponse
from ..services.career_guidance_service import provide_career_guidance
from ..services.auth_service import get_current_user
from ..db.database import get_db
from sqlalchemy.orm import Session
from ..models.user_models import User

router = APIRouter(
    prefix="/guidance",
    tags=["career guidance"]
)

@router.post("/career-guidance", response_model=CareerGuidanceResponse)
async def get_career_guidance(
    request: CareerGuidanceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized career guidance based on user information"""
    try:
        guidance = provide_career_guidance(request)
        return guidance
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate career guidance: {str(e)}"
        )

@router.post("/personality-assessment")
async def assess_personality(
    responses: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze personality assessment responses"""
    try:
        # This would be replaced with actual personality assessment logic
        # For simplicity, we're returning mock data
        
        # Simple trait mapping based on responses
        traits = {
            "openness": 0.7,
            "conscientiousness": 0.85,
            "extraversion": 0.5,
            "agreeableness": 0.65,
            "neuroticism": 0.3
        }
        
        # Mock strengths and weaknesses based on traits
        strengths = ["Detail-oriented", "Organized", "Analytical", "Creative thinking"]
        weaknesses = ["May struggle in highly social environments", "Perfectionism"]
        
        # Mock recommended environments
        recommended_environments = ["Structured work environments", "Creative industries with clear processes"]
        
        # Mock communication style
        communication_style = "Direct and detailed, prefers written communication and preparation time"
        
        return {
            "traits": traits,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommended_environments": recommended_environments,
            "communication_style": communication_style
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assess personality: {str(e)}"
        )

@router.get("/career-info/{career_title}")
async def get_career_information(
    career_title: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific career"""
    from ..services.career_guidance_service import CAREER_DATA
    
    if career_title not in CAREER_DATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_title}' not found"
        )
    
    return {
        "title": career_title,
        "info": CAREER_DATA[career_title]
    } 