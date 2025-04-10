from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File, Body
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
import logging
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/job-application",
    tags=["job application"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

class JobApplicationRequest(BaseModel):
    cv_text: str
    user_profile: Dict[str, Any]
    settings: Dict[str, Any]
    platform_credentials: Dict[str, Dict[str, str]]

class JobApplicationResponse(BaseModel):
    success: bool
    applications: List[Dict[str, Any]] = []
    application_strategy: Dict[str, str] = {}
    total_applications: int = 0
    platforms_accessed: List[str] = []
    error_message: Optional[str] = None

class LinkedInJobRequest(BaseModel):
    jobTitle: str
    jobDescription: Optional[str] = None
    location: Optional[str] = None
    preferences: Dict[str, bool]
    customMessage: Optional[str] = None
    resumeId: Optional[str] = None

class LinkedInJobResponse(BaseModel):
    success: bool
    message: str
    totalJobs: int = 0
    matchingJobs: int = 0
    readyToApply: int = 0
    alreadyApplied: int = 0
    jobs: List[Dict[str, Any]] = []

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

@router.post("/automate-application", response_model=JobApplicationResponse)
async def automate_job_application(
    request: JobApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Automate job applications across multiple platforms.
    
    Notes:
    - LinkedIn automation is for DEMONSTRATION PURPOSES ONLY in a competition setting
    - Actual implementation respects platform terms of service
    """
    try:
        logger.info(f"Starting automated job application for user: {current_user.id}")
        
        # Create automation instance
        job_automation = JobApplicationAutomation(
            cv_text=request.cv_text,
            user_profile=request.user_profile,
            settings=request.settings
        )
        
        # Run the automation
        result = job_automation.multi_platform_application(request.platform_credentials)
        
        # Log the results
        logger.info(f"Completed job applications. Total: {result['total_applications']}, Platforms: {result['platforms_accessed']}")
        
        # Store application history in database
        for application in result["applications"]:
            # This would typically insert records into a database
            # For now, we'll just log them
            logger.info(f"Applied to {application['job_title']} at {application['company']} via {application['platform']}")
            
            # Example of how you might store in database:
            # new_application = JobApplicationModel(
            #     user_id=current_user.id,
            #     job_title=application["job_title"],
            #     company=application["company"],
            #     platform=application["platform"],
            #     status=application["status"],
            #     date_applied=datetime.strptime(application["date_applied"], "%Y-%m-%d %H:%M:%S"),
            #     location=application["location"]
            # )
            # db.add(new_application)
        
        # db.commit()
        
        return result
    except Exception as e:
        logger.error(f"Error in job automation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to automate job applications: {str(e)}"
        )

@router.get("/applications", response_model=List[Dict[str, Any]])
async def get_job_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all job applications for the current user"""
    try:
        # This would typically query the database
        # For now, return demo data
        return [
            {
                "id": 1,
                "job_title": "Software Developer",
                "company": "Tech Solutions LLC",
                "platform": "bayt",
                "status": "applied",
                "date_applied": "2023-10-15 14:30:00",
                "location": "Dubai, UAE"
            },
            {
                "id": 2,
                "job_title": "Data Analyst",
                "company": "Analytics Pro",
                "platform": "indeed",
                "status": "applied", 
                "date_applied": "2023-10-16 09:45:00",
                "location": "Dubai, UAE"
            },
            {
                "id": 3,
                "job_title": "Project Manager",
                "company": "Global Systems",
                "platform": "gulftalent",
                "status": "applied",
                "date_applied": "2023-10-16 11:20:00", 
                "location": "Abu Dhabi, UAE"
            },
            {
                "id": 4,
                "job_title": "Senior Developer",
                "company": "LinkedIn Corp",
                "platform": "linkedin",
                "status": "applied",
                "date_applied": "2023-10-17 15:10:00",
                "location": "Dubai, UAE"
            }
        ]
    except Exception as e:
        logger.error(f"Error retrieving job applications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve job applications: {str(e)}"
        )

@router.post("/linkedin-automation", response_model=LinkedInJobResponse)
async def linkedin_job_automation(
    request: LinkedInJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Handle LinkedIn job search and application process for competition demo.
    
    This endpoint demonstrates automated LinkedIn job applications similar to 
    the Jobs_Applier_AI_Agent_AIHawk repository approach.
    
    NOTE: This is for COMPETITION DEMONSTRATION ONLY. In a real-world application,
    automating LinkedIn actions would violate their terms of service.
    """
    try:
        logger.info(f"Starting LinkedIn job automation for user: {current_user.id}")
        
        # Log the request details
        logger.info(f"Job search criteria: {request.jobTitle}, {request.location}")
        
        # Simulate browser automation process (for demonstration)
        logger.info("Simulating browser automation for LinkedIn")
        
        # Calculate estimated jobs based on search criteria
        job_title_multiplier = 2.5 if request.jobTitle else 1.0
        location_multiplier = 1.5 if request.location else 1.0
        keyword_multiplier = 1.2 if request.jobDescription else 1.0
        
        base_jobs = 15
        total_jobs = int(base_jobs * job_title_multiplier * location_multiplier * keyword_multiplier)
        
        # Calculate match parameters
        matching_ratio = 0.65  # 65% of jobs match criteria
        apply_ratio = 0.80  # 80% of matching jobs can be applied to
        already_applied_ratio = 0.15  # 15% already applied to
        
        matching_jobs = int(total_jobs * matching_ratio)
        ready_to_apply = int(matching_jobs * apply_ratio)
        already_applied = int(matching_jobs * already_applied_ratio)
        
        # Generate job examples that would be similar to those found in the real automation
        job_examples = [
            {
                "id": "job1",
                "title": request.jobTitle,
                "company": "Example Tech Company",
                "location": request.location or "Dubai, UAE",
                "description": "This is a sample job description that matches your search criteria.",
                "matchScore": 92,
                "datePosted": "2023-10-15",
                "applicationUrl": "https://linkedin.com/jobs/view/example1",
                "easyApply": True,
                "applied": True,
                "applicationDate": "2023-10-23"
            },
            {
                "id": "job2",
                "title": f"Senior {request.jobTitle}",
                "company": "Innovation Solutions",
                "location": request.location or "Remote",
                "description": "Looking for an experienced professional to join our team.",
                "matchScore": 87,
                "datePosted": "2023-10-17",
                "applicationUrl": "https://linkedin.com/jobs/view/example2",
                "easyApply": True,
                "applied": True,
                "applicationDate": "2023-10-23"
            },
            {
                "id": "job3",
                "title": f"{request.jobTitle} Specialist",
                "company": "Global Services Ltd",
                "location": request.location or "Abu Dhabi, UAE",
                "description": "Join our growing team as a specialist in this field.",
                "matchScore": 85,
                "datePosted": "2023-10-18",
                "applicationUrl": "https://linkedin.com/jobs/view/example3",
                "easyApply": False,
                "applied": True,
                "applicationDate": "2023-10-23"
            },
            {
                "id": "job4",
                "title": f"Junior {request.jobTitle}",
                "company": "StartupX",
                "location": request.location or "Dubai, UAE",
                "description": "Great opportunity for someone early in their career.",
                "matchScore": 78,
                "datePosted": "2023-10-19",
                "applicationUrl": "https://linkedin.com/jobs/view/example4",
                "easyApply": True,
                "applied": True, 
                "applicationDate": "2023-10-23"
            },
            {
                "id": "job5",
                "title": f"{request.jobTitle} Consultant",
                "company": "Consulting Pro",
                "location": request.location or "Sharjah, UAE",
                "description": "Looking for consultants with expertise in this field.",
                "matchScore": 82,
                "datePosted": "2023-10-16",
                "applicationUrl": "https://linkedin.com/jobs/view/example5",
                "easyApply": True,
                "applied": False
            }
        ]
        
        # Log automation steps that would happen in real implementation
        logger.info("Process: Initializing browser automation")
        logger.info("Process: Logging in to LinkedIn")
        logger.info(f"Process: Searching for jobs with title '{request.jobTitle}'")
        logger.info(f"Process: Found {total_jobs} jobs, {matching_jobs} matching criteria")
        logger.info(f"Process: Applied to {len([j for j in job_examples if j.get('applied', False)])} jobs")
        logger.info("Process: Completed LinkedIn automation process")
        
        # Return response with simulation results
        return {
            "success": True,
            "message": f"Successfully applied to {len([j for j in job_examples if j.get('applied', False)])} jobs on LinkedIn. (Competition Demo)",
            "totalJobs": total_jobs,
            "matchingJobs": matching_jobs,
            "readyToApply": ready_to_apply,
            "alreadyApplied": already_applied,
            "jobs": job_examples
        }
        
    except Exception as e:
        logger.error(f"Error in LinkedIn job automation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process LinkedIn job automation: {str(e)}"
        ) 