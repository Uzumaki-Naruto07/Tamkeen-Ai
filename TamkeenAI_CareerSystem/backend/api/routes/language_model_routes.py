from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Dict, Any, Optional
from ..services.language_model_service import LanguageModelService
from ..services.auth_service import get_current_user
from ..db.database import get_db
from sqlalchemy.orm import Session
from ..models.user_models import User
from pydantic import BaseModel

router = APIRouter(
    prefix="/language-model",
    tags=["language model"]
)

class TextGenerationRequest(BaseModel):
    """Request model for text generation"""
    prompt: str
    model_id: Optional[str] = None
    max_new_tokens: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None

@router.post("/generate")
async def generate_text(
    request: TextGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate text using the language model service"""
    try:
        # Initialize language model service
        lm_service = LanguageModelService()
        
        # Generate text
        generated_text = lm_service.generate_text(
            prompt=request.prompt,
            model_id=request.model_id if request.model_id else None,
            max_new_tokens=request.max_new_tokens if request.max_new_tokens else None,
            temperature=request.temperature if request.temperature else None,
            top_p=request.top_p if request.top_p else None
        )
        
        return {"generated_text": generated_text}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate text: {str(e)}"
        )

@router.get("/models")
async def get_available_models(
    current_user: User = Depends(get_current_user)
):
    """Get list of available language models"""
    from ..config.language_models import DEFAULT_MODEL, ALTERNATIVE_MODELS
    
    models = [DEFAULT_MODEL] + ALTERNATIVE_MODELS
    
    return {
        "default_model": DEFAULT_MODEL,
        "alternative_models": ALTERNATIVE_MODELS,
        "all_models": models
    } 