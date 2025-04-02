from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import Dict, List, Optional
import io
import os
import pdfplumber
import docx
import re
import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
from openai import OpenAI
import os
import logging

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

# Setup logger
logger = logging.getLogger(__name__)

# Try to import KeyBERT, handle if not installed
try:
    from keybert import KeyBERT
    keybert_model = KeyBERT()
except ImportError:
    keybert_model = None
    logger.warning("KeyBERT not installed, falling back to simpler keyword extraction")

# Try to load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None
    logger.warning("spaCy model not loaded, falling back to simpler text processing")

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

@router.post("/analyze-with-visuals")
async def analyze_resume_with_visuals(
    file: UploadFile = File(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a resume and generate visual reports"""
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

        # Generate enhanced ATS report with visuals
        report = enhanced_ats_report_with_visuals(cv_text, job_description, job_title)
        
        return report

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume with visuals: {str(e)}"
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

@router.post("/extract-keywords")
async def extract_keywords(
    request: ATSKeywordRequest,
    current_user: User = Depends(get_current_user)
):
    """Extract keywords from resume and job description"""
    try:
        return get_keywords_json(request.resume_text, request.job_description)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract keywords: {str(e)}"
        )

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

@router.get("/sample-jobs")
async def get_sample_jobs():
    """Get sample job descriptions for testing"""
    return {
        "jobs": [{"title": title, "description": desc} 
                for title, desc in sample_job_descriptions.items()]
    }

@router.post("/analyze-with-deepseek")
async def analyze_with_deepseek(
    file: UploadFile = File(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a resume using DeepSeek AI for comprehensive analysis"""
    try:
        # Read file content
        file_content = await file.read()
        file_extension = os.path.splitext(file.filename)[1].lower()

        # Extract text based on file type
        if file_extension == '.pdf':
            try:
                with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                    cv_text = ""
                    for page in pdf.pages:
                        cv_text += page.extract_text() or ""
            except Exception as e:
                logger.error(f"Error extracting text from PDF: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to extract text from PDF: {str(e)}"
                )
        elif file_extension in ['.docx', '.doc']:
            try:
                doc = docx.Document(io.BytesIO(file_content))
                cv_text = ""
                for para in doc.paragraphs:
                    cv_text += para.text + "\n"
            except Exception as e:
                logger.error(f"Error extracting text from DOCX: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to extract text from DOCX: {str(e)}"
                )
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

        # Perform basic analysis first
        score = calculate_ats_score(cv_text, job_description)
        
        # Extract keywords
        if keybert_model:
            # Use KeyBERT for better keyword extraction
            cv_keywords = extract_keywords_advanced(cv_text, method="keybert")
            job_keywords = extract_keywords_advanced(job_description, method="keybert")
        else:
            # Fallback to basic keyword extraction
            cv_keywords = extract_keywords_basic(cv_text)
            job_keywords = extract_keywords_basic(job_description)
            
        matching_keywords = list(set(cv_keywords).intersection(set(job_keywords)))
        missing_keywords = list(set(job_keywords) - set(cv_keywords))
        
        # Get DeepSeek AI analysis
        deepseek_analysis = analyze_resume_with_deepseek(cv_text, job_description)
        
        # Get improvement roadmap
        improvement_roadmap = get_improvement_roadmap(cv_text, job_description)
        
        # Create assessment message
        if score >= 80:
            assessment = "Excellent! Your resume is highly compatible with this job."
        elif score >= 60:
            assessment = "Good. Your resume matches the job requirements reasonably well."
        elif score >= 40:
            assessment = "Average. Consider optimizing your resume for better matching."
        else:
            assessment = "Low match. Your resume needs significant adjustments for this role."
        
        # Prepare the result
        result = {
            "score": score,
            "job_title": job_title,
            "matching_keywords": matching_keywords,
            "missing_keywords": missing_keywords[:15] if len(missing_keywords) > 15 else missing_keywords,
            "assessment": assessment,
            "llm_analysis": deepseek_analysis,
            "improvement_roadmap": improvement_roadmap
        }
        
        # Save analysis to database
        save_ats_analysis(db, current_user.id, result, file.filename)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in analyze_with_deepseek: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume with DeepSeek: {str(e)}"
        )

# Helper functions for the DeepSeek analysis

def preprocess_text(text):
    """Clean and preprocess text."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\d+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def calculate_ats_score(cv_text, job_description):
    """Calculate ATS compatibility score between CV and job description."""
    cv_text_processed = preprocess_text(cv_text)
    job_description_processed = preprocess_text(job_description)
    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform([cv_text_processed, job_description_processed])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    return similarity * 100

def extract_keywords_basic(text, max_keywords=30):
    """Extract important keywords from text using basic methods."""
    if nlp:
        doc = nlp(text)
        keywords = [token.text for token in doc if token.pos_ in ['NOUN', 'PROPN', 'ADJ'] and len(token.text) > 2]
        keyword_freq = {}
        for word in keywords:
            keyword_freq[word] = keyword_freq.get(word, 0) + 1
        sorted_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_keywords[:max_keywords]]
    else:
        # Very basic fallback
        words = text.lower().split()
        stop_words = {'the', 'and', 'is', 'in', 'to', 'a', 'of', 'for', 'with', 'on', 'at', 'from', 'by'}
        word_freq = {}
        for word in words:
            if word not in stop_words and len(word) > 2:
                word_freq[word] = word_freq.get(word, 0) + 1
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:max_keywords]]

def extract_keywords_advanced(text, method="keybert", top_n=20):
    """Extract keywords using advanced methods (KeyBERT)."""
    if method == "keybert" and keybert_model:
        # Use KeyBERT with more flexible extraction
        keywords = keybert_model.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 2),  # Extract 1-2 word phrases
            stop_words='english',  # Remove common English stop words
            top_n=top_n,  # Number of top keywords to extract
            use_mmr=True,  # Use Maximal Marginal Relevance for diversity
            diversity=0.5  # Balance between relevance and diversity
        )
        return [keyword for keyword, score in keywords]
    else:
        # Fallback to existing basic method
        return extract_keywords_basic(text, max_keywords=top_n)

def analyze_resume_with_deepseek(cv_text, job_description):
    """Analyze resume using DeepSeek R1 with a comprehensive prompt."""
    # Get the API key from environment
    DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
    
    if not DEEPSEEK_API_KEY:
        logger.warning("DeepSeek API key not found in environment variables")
        return "DeepSeek analysis unavailable. Please configure the API key in environment variables."

    # Truncate texts to manage token limits
    cv_text_truncated = cv_text[:4000]  # Adjust as needed
    job_description_truncated = job_description[:2000]

    prompt = f"""You are an expert ATS (Applicant Tracking System) evaluator.
Compare the following resume and job description with a critical and constructive approach.

RESUME:
{cv_text_truncated}

JOB DESCRIPTION:
{job_description_truncated}

Provide a comprehensive analysis with the following structure:

1. STRENGTHS 🟢
- Highlight the top 5 strengths of the resume
- Explain how these strengths align with the job description

2. WEAKNESSES 🔴
- Identify up to 5 key weaknesses or missing elements
- Suggest specific improvements for each weakness

3. KEYWORD ANALYSIS 🔍
- Top 10 matching keywords
- Top 5 missing keywords
- Recommendations for incorporating missing keywords

4. OVERALL MATCH 📊
- Provide an estimated percentage match
- Detailed reasoning behind the match percentage

5. IMPROVEMENT SUGGESTIONS 🚀
- Concrete, actionable recommendations to enhance resume
- Specific edits to better align with job description

Maintain a professional, constructive tone. Focus on helping the candidate improve their resume."""

    try:
        # Initialize DeepSeek client
        deepseek_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=DEEPSEEK_API_KEY
        )
        
        response = deepseek_client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[
                {"role": "system", "content": "You are an expert ATS evaluator providing detailed, constructive resume analysis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error using DeepSeek for analysis: {e}")
        return "DeepSeek analysis unavailable. Please check your API configuration."

def get_improvement_roadmap(cv_text, job_description):
    """
    Generate a comprehensive improvement roadmap using DeepSeek
    """
    # Get the API key from environment
    DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
    
    if not DEEPSEEK_API_KEY:
        logger.warning("DeepSeek API key not found in environment variables")
        return "Improvement roadmap unavailable. Please configure the API key in environment variables."
        
    # Truncate texts to manage token limits
    cv_text_truncated = cv_text[:4000]  # Adjust as needed
    job_description_truncated = job_description[:2000]

    prompt = f"""You are an expert career development advisor and AI system architect.
Analyze the following resume and job description to provide a comprehensive, strategic improvement roadmap.

RESUME:
{cv_text_truncated}

JOB DESCRIPTION:
{job_description_truncated}

Please provide a detailed analysis with the following structure:

1. SKILL GAP ANALYSIS 🔍
- Identify critical skills missing from the current resume
- Compare current skills with job requirements
- Rank skills by importance and difficulty to acquire

2. LEARNING ROADMAP 📚
- Recommended courses and certifications
- Suggested learning platforms
- Estimated time to skill proficiency
- Specific resources for each skill gap

3. CAREER DEVELOPMENT STRATEGY 🚀
- Short-term (3-6 months) skill development plan
- Medium-term (6-12 months) career positioning
- Long-term career trajectory alignment

4. TECHNICAL SKILL ENHANCEMENT 💻
- Specific programming languages/tools to learn
- Recommended projects to build practical experience
- Industry-recognized certifications

5. SOFT SKILLS DEVELOPMENT 🤝
- Communication and interpersonal skill improvements
- Leadership and collaboration skill enhancement
- Emotional intelligence and adaptability training

Provide actionable, specific, and motivational guidance that transforms the current skill set into a competitive, future-ready professional profile."""

    try:
        # Initialize DeepSeek client
        deepseek_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=DEEPSEEK_API_KEY
        )
        
        response = deepseek_client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[
                {"role": "system", "content": "You are an expert career development strategist providing comprehensive, personalized improvement guidance."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error generating improvement roadmap: {e}")
        return "Analysis unavailable. Please check system configuration." 