from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import logging
from sqlalchemy.orm import Session

from ..utils.dataset_generator import load_or_generate_datasets
from ..services.auth_service import get_current_user
from ..db.database import get_db
from ..models.user_models import User

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/datasets",
    tags=["datasets"]
)

# Make sure data directory exists
os.makedirs("data", exist_ok=True)

# Request models
class DatasetGenerationRequest(BaseModel):
    use_huggingface: bool = True
    generate_if_missing: bool = True
    num_samples: int = 10000

# Response models
class DatasetInfoResponse(BaseModel):
    filename: str
    num_records: int
    num_features: int
    features: List[str]
    has_target_variables: bool
    dataset_path: str

@router.post("/generate", response_model=DatasetInfoResponse)
async def generate_dataset(
    request: DatasetGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new interview dataset for training evaluation models
    
    This endpoint will generate a synthetic dataset if needed, or load one from Hugging Face
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can generate datasets"
        )
    
    try:
        # Start dataset generation
        dataset = load_or_generate_datasets(
            use_huggingface=request.use_huggingface,
            generate_if_missing=request.generate_if_missing,
            num_samples=request.num_samples
        )
        
        if dataset is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate or load dataset. Check server logs for details."
            )
        
        # Get dataset info
        dataset_path = "data/processed_se_interview_data.csv"
        
        return {
            "filename": "processed_se_interview_data.csv",
            "num_records": len(dataset),
            "num_features": len(dataset.columns),
            "features": dataset.columns.tolist(),
            "has_target_variables": all(target in dataset.columns for target in 
                                      ['technical', 'problem_solving', 'communication', 'cultural_fit', 'overall']),
            "dataset_path": dataset_path
        }
        
    except Exception as e:
        logger.error(f"Error generating dataset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating dataset: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_dataset(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download a generated dataset file
    """
    # Basic security check - only allow downloading specific files
    if filename not in ["processed_se_interview_data.csv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename requested"
        )
    
    file_path = f"data/{filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found"
        )
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/csv"
    )

@router.get("/info")
async def get_dataset_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get information about available datasets
    """
    datasets = []
    
    # Check for processed dataset
    if os.path.exists("data/processed_se_interview_data.csv"):
        try:
            import pandas as pd
            dataset = pd.read_csv("data/processed_se_interview_data.csv")
            
            datasets.append({
                "filename": "processed_se_interview_data.csv",
                "num_records": len(dataset),
                "num_features": len(dataset.columns),
                "features": dataset.columns.tolist(),
                "has_target_variables": all(target in dataset.columns for target in 
                                         ['technical', 'problem_solving', 'communication', 'cultural_fit', 'overall']),
                "created_at": os.path.getmtime("data/processed_se_interview_data.csv")
            })
        except Exception as e:
            logger.error(f"Error getting dataset info: {str(e)}")
            
    return {"datasets": datasets} 