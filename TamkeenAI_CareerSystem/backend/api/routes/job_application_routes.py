from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from typing import List, Dict, Any, Optional
from ..models.job_application_models import (
    JobRole, JobApplicationSettings, PlatformCredentials, 
    CoverLetterRequest, ApplicationLog, JobApplicationRequest
)
from ..services.job_application_service import (
    generate_top_job_roles, generate_application_strategy,
    generate_cover_letter, generate_application_report
)
from ..services.job_automation_service import JobApplicationAutomation
from ..services.auth_service import get_current_user
from ..db.database import get_db
from sqlalchemy.orm import Session
from ..models.user_models import User
from ..services.ats_service import extract_text_from_pdf, extract_text_from_docx
import io
import os

router = APIRouter(
    prefix="/job-application",
    tags=["job application"]
)

@router.post("/generate-roles")
async def get_job_roles(
    cv_text: str,
    current_user: User = Depends(get_current_user)
):
    """Generate top job roles based on CV text"""
    try:
        roles = generate_top_job_roles(cv_text)
        return {"job_roles": roles}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate job roles: {str(e)}"
        )

@router.post("/upload-cv-generate-roles")
async def upload_cv_and_generate_roles(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload CV and generate top job roles"""
    try:
        # Read file content
        file_content = await file.read()
        file_extension = os.path.splitext(file.filename)[1].lower()

        # Extract text based on file type
        if file_extension == '.pdf':
            pdf_io = io.BytesIO(file_content)
            cv_text = extract_text_from_pdf(pdf_io)
        elif file_extension in ['.docx', '.doc']:
            docx_io = io.BytesIO(file_content)
            cv_text = extract_text_from_docx(docx_io)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload a PDF or DOCX file."
            )

        if not cv_text or len(cv_text) < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract sufficient text from the CV file."
            )
        
        # Generate job roles
        roles = generate_top_job_roles(cv_text)
        return {"job_roles": roles, "cv_text": cv_text}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process CV and generate job roles: {str(e)}"
        )

@router.post("/generate-strategy")
async def create_application_strategy(
    selected_roles: List[str],
    selected_emirates: List[str],
    current_user: User = Depends(get_current_user)
):
    """Generate comprehensive job application strategy"""
    try:
        strategy = generate_application_strategy(selected_roles, selected_emirates)
        return {"application_strategy": strategy}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate application strategy: {str(e)}"
        )

@router.post("/generate-cover-letter")
async def create_cover_letter(
    request: CoverLetterRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate a personalized cover letter"""
    try:
        cover_letter = generate_cover_letter(request.dict())
        return {"cover_letter": cover_letter}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cover letter: {str(e)}"
        )

@router.post("/simulate-applications")
async def simulate_job_applications(
    request: JobApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulate automated job applications (for backend)"""
    try:
        # Create automation service
        automation = JobApplicationAutomation(
            request.cv_text,
            request.user_profile,
            request.settings
        )
        
        # Run multi-platform application
        results = automation.multi_platform_application(request.platform_credentials)
        
        # Generate application report
        job_details = {
            "roles": request.settings.selected_roles,
            "emirates": request.settings.selected_emirates
        }
        application_report = generate_application_report(results["application_log"], job_details)
        
        # Add report to results
        results["application_report"] = application_report
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simulate job applications: {str(e)}"
        ) 