from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import Dict, List, Optional
import io
import os
from ..models.ats_models import ATSRequest, ATSAnalysisResult, KeywordAnalysis, ATSKeywordRequest
from ..services.ats_service import (
    extract_text_from_pdf, extract_text_from_docx, 
    enhanced_ats_report, get_keywords_json, enhanced_ats_report_with_visuals
)
from ..services.auth_service import get_current_user
from ..db.database import get_db
from sqlalchemy.orm import Session
from ..models.user_models import User
from ..services.ats_history_service import save_ats_analysis, get_user_ats_history, get_ats_analysis_by_id
from ..utils.sample_jobs import sample_job_descriptions

router = APIRouter(
    prefix="/ats",
    tags=["ats"]
)

@router.post("/analyze", response_model=ATSAnalysisResult)
async def analyze_resume(
    file: UploadFile = File(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    include_llm: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a resume against a job description for ATS compatibility"""
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
                detail="Could not extract sufficient text from the resume file."
            )

        # Generate enhanced ATS report
        report = enhanced_ats_report(cv_text, job_description, job_title, include_llm)
        
        # Save analysis to database
        save_ats_analysis(db, current_user.id, report, file.filename)
        
        return report

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume: {str(e)}"
        )

@router.post("/keywords", response_model=KeywordAnalysis)
async def get_keywords(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Extract keywords from both resume and job description"""
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
                detail="Could not extract sufficient text from the resume file."
            )

        # Get keywords from resume and job description
        keywords = get_keywords_json(cv_text, job_description)
        
        return keywords

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract keywords: {str(e)}"
        )

@router.post("/analyze/text", response_model=ATSAnalysisResult)
async def analyze_resume_text(
    request: ATSRequest,
    include_llm: bool = True,
    current_user: User = Depends(get_current_user)
):
    """Analyze resume text against a job description (when text is already extracted)"""
    try:
        cv_text = request.resume_text if hasattr(request, 'resume_text') else ""
        job_description = request.job_description
        job_title = request.job_title

        if not cv_text or len(cv_text) < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide sufficient resume text for analysis."
            )

        # Generate enhanced ATS report
        report = enhanced_ats_report(cv_text, job_description, job_title, include_llm)
        
        return report

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume text: {str(e)}"
        )

@router.get("/sample-jobs")
async def get_sample_job_descriptions(
    current_user: User = Depends(get_current_user)
):
    """Get sample job descriptions for testing"""
    return {"job_descriptions": sample_job_descriptions}

@router.get("/history")
async def get_ats_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's ATS analysis history"""
    try:
        history = get_user_ats_history(db, current_user.id, limit)
        
        return {
            "history": [
                {
                    "id": item.id,
                    "job_title": item.job_title,
                    "score": item.score,
                    "assessment": item.assessment,
                    "created_at": item.created_at,
                    "resume_filename": item.resume_filename
                }
                for item in history
            ]
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ATS history: {str(e)}"
        )

@router.get("/history/{analysis_id}")
async def get_ats_analysis_detail(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed ATS analysis by ID"""
    try:
        analysis = get_ats_analysis_by_id(db, analysis_id, current_user.id)
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        return {
            "id": analysis.id,
            "job_title": analysis.job_title,
            "score": analysis.score,
            "assessment": analysis.assessment,
            "matching_keywords": analysis.matching_keywords,
            "missing_keywords": analysis.missing_keywords,
            "llm_analysis": analysis.llm_analysis,
            "improvement_roadmap": analysis.improvement_roadmap,
            "resume_filename": analysis.resume_filename,
            "created_at": analysis.created_at
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ATS analysis detail: {str(e)}"
        )

@router.post("/analyze/with-visuals")
async def analyze_resume_with_visuals(
    file: UploadFile = File(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    include_llm: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a resume against a job description with visualizations"""
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
                detail="Could not extract sufficient text from the resume file."
            )

        # Generate enhanced ATS report with visuals
        report = enhanced_ats_report_with_visuals(cv_text, job_description, job_title, include_llm)
        
        # Save basic analysis to database (without visuals to save space)
        basic_report = {k: v for k, v in report.items() if k != "visualizations"}
        save_ats_analysis(db, current_user.id, basic_report, file.filename)
        
        return report

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume with visuals: {str(e)}"
        ) 