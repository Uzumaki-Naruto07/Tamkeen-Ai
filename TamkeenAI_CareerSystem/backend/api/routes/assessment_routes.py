from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List, Any, Optional
from ..models.assessment_models import (
    InterestArea, WorkValue, PersonalityQuestion, InterestQuestion, 
    ValueQuestion, AssessmentResponse, AssessmentResult
)
from ..services.assessment_service import (
    get_personality_questions, get_interest_questions, get_value_questions,
    process_comprehensive_assessment
)
from ..services.auth_service import get_current_user
from ..db.database import get_db
from sqlalchemy.orm import Session
from ..models.user_models import User

router = APIRouter(
    prefix="/assessments",
    tags=["career assessments"]
)

@router.get("/personality/questions")
async def get_all_personality_questions(
    current_user: User = Depends(get_current_user)
):
    """Get all personality assessment questions"""
    try:
        questions = get_personality_questions()
        return {"questions": questions}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get personality questions: {str(e)}"
        )

@router.get("/interests/questions")
async def get_all_interest_questions(
    current_user: User = Depends(get_current_user)
):
    """Get all interest assessment questions"""
    try:
        questions = get_interest_questions()
        return {"questions": questions}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get interest questions: {str(e)}"
        )

@router.get("/values/questions")
async def get_all_value_questions(
    current_user: User = Depends(get_current_user)
):
    """Get all work value assessment questions"""
    try:
        questions = get_value_questions()
        return {"questions": questions}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get value questions: {str(e)}"
        )

@router.post("/comprehensive", response_model=AssessmentResult)
async def complete_comprehensive_assessment(
    personality_responses: List[AssessmentResponse],
    interest_responses: List[AssessmentResponse],
    value_responses: List[AssessmentResponse],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process a comprehensive career assessment"""
    try:
        assessment_result = process_comprehensive_assessment(
            personality_responses,
            interest_responses,
            value_responses
        )
        
        # In a real implementation, you'd save these results to the database
        
        return assessment_result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process assessment: {str(e)}"
        ) 