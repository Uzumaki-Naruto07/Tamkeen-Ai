"""
DeepSeekClient - Specialized client for DeepSeek API integration

This module provides a specialized client for interacting with the DeepSeek API
through OpenRouter, with automatic fallback to mock data when needed.
"""

import os
import logging
from typing import Dict, Any, List, Optional, Union

from .predict_client import PredictClient

# Setup logger
logger = logging.getLogger(__name__)

class DeepSeekClient(PredictClient):
    """
    Specialized client for DeepSeek API integration.
    
    This client extends the PredictClient to provide specialized functionality
    for the DeepSeek AI models, including resume analysis, job matching,
    and career planning capabilities.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        mock_data_enabled: Optional[bool] = None,
        base_url: str = "https://openrouter.ai/api/v1"
    ):
        """
        Initialize the DeepSeek client.
        
        Args:
            api_key: DeepSeek API key (if None, will try to get from environment)
            mock_data_enabled: Whether to enable mock data fallback
            base_url: Base URL for DeepSeek API (defaults to OpenRouter endpoint)
        """
        super().__init__(
            api_key=api_key,
            provider='deepseek',
            mock_data_enabled=mock_data_enabled,
            base_url=base_url
        )
        
        # DeepSeek-specific models and configurations
        self.models = {
            'default': 'deepseek/deepseek-chat',
            'small': 'deepseek/deepseek-r1:free',
            'large': 'deepseek/deepseek-r1:latest',
            'coder': 'deepseek/deepseek-coder',
            'multilingual': 'deepseek/deepseek-llm-67b-chat'
        }
        
        logger.info(f"DeepSeek client initialized with API key: {'Present' if self.api_key else 'Missing'}")
    
    def analyze_resume(
        self,
        resume_text: str,
        job_description: str,
        job_title: Optional[str] = None,
        detailed: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze a resume against a job description using DeepSeek.
        
        Args:
            resume_text: Text content of the resume
            job_description: Text content of the job description
            job_title: Optional job title for context
            detailed: Whether to provide detailed analysis
            
        Returns:
            Dictionary with analysis results
        """
        # Prepare system prompt for resume analysis
        system_prompt = """You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of recruitment and hiring processes.
Your task is to analyze a resume against a job description, providing detailed feedback and actionable recommendations.
Be thorough yet concise in your analysis. Focus on match quality, keywords, skills, and formatting issues.
Provide a numerical score from 0-100 representing the overall match quality."""

        # Prepare user prompt with resume and job details
        job_context = f"Job Title: {job_title}\n" if job_title else ""
        user_prompt = f"""Please analyze this resume against the following job description:

{job_context}
JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Provide a comprehensive analysis including:
1. Overall match score (0-100)
2. Key matching skills and qualifications
3. Missing important qualifications
4. Resume format and structure assessment
5. Specific improvement recommendations
"""

        if not detailed:
            user_prompt += "\nProvide a concise summary only."

        # Call DeepSeek API via chat completion
        response = self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=self.models['small'] if not detailed else self.models['default'],
            temperature=0.3,  # Lower temperature for more consistent analysis
            max_tokens=1500 if detailed else 500,
            mock_endpoint='resume_analysis'
        )
        
        # Process response into structured format
        if response.get('success', False):
            content = response.get('content', '')
            
            # Try to extract score from the content
            score = self._extract_score_from_text(content)
            
            return {
                'analysis': content,
                'score': score,
                'using_mock_data': response.get('mock_used', False),
                'model': response.get('model', self.models['default']),
                'success': True
            }
        else:
            # Return error response
            return {
                'error': response.get('error', 'Failed to analyze resume'),
                'using_mock_data': response.get('mock_used', False),
                'success': False
            }
    
    def match_jobs(
        self,
        resume_text: str,
        job_listings: List[Dict[str, str]],
        detailed_analysis: bool = False
    ) -> Dict[str, Any]:
        """
        Match a resume against multiple job listings.
        
        Args:
            resume_text: Text content of the resume
            job_listings: List of job listing dictionaries
            detailed_analysis: Whether to provide detailed analysis for each job
            
        Returns:
            Dictionary with matching results
        """
        # For simplicity, if we're using mock data, return directly
        if self.is_using_mock():
            return self.mock_provider.get_mock_response(
                endpoint='job_matching',
                data={
                    'resume_text': resume_text,
                    'job_listings': job_listings,
                    'detailed_analysis': detailed_analysis
                }
            )
        
        # Real implementation would process each job and compute matches
        # This is simplified for the purpose of this example
        system_prompt = "You are an expert job matching algorithm that evaluates the fit between a resume and job listings."
        
        # Prepare job listings text
        jobs_text = ""
        for i, job in enumerate(job_listings[:5]):  # Limit to 5 jobs to avoid token limits
            jobs_text += f"JOB {i+1}:\n"
            jobs_text += f"Title: {job.get('title', 'No Title')}\n"
            jobs_text += f"Company: {job.get('company', 'Unknown')}\n"
            jobs_text += f"Description: {job.get('description', '')}\n\n"
        
        user_prompt = f"""Please match the following resume against these job listings:

RESUME:
{resume_text}

JOB LISTINGS:
{jobs_text}

For each job, provide:
1. Match score (0-100)
2. Key matching qualifications
3. Key missing qualifications
4. Brief explanation of the match quality
"""

        # Call DeepSeek API
        response = self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=self.models['default'],
            temperature=0.3,
            max_tokens=1500,
            mock_endpoint='job_matching'
        )
        
        # Return raw response for now - in a real implementation, we would parse this
        # into a structured format
        return {
            'matches': response.get('content', ''),
            'using_mock_data': response.get('mock_used', False),
            'success': response.get('success', False)
        }
    
    def generate_career_advice(
        self,
        question: str,
        user_background: Optional[Dict[str, Any]] = None,
        language: str = 'en'
    ) -> Dict[str, Any]:
        """
        Generate career advice using DeepSeek.
        
        Args:
            question: User's career question
            user_background: Optional dictionary with user background information
            language: Language code for the response
            
        Returns:
            Dictionary with career advice
        """
        # Prepare background information if provided
        background_text = ""
        if user_background:
            background_text = "User Background:\n"
            for key, value in user_background.items():
                background_text += f"- {key}: {value}\n"
        
        # Adjust system prompt based on language
        if language.lower() in ('ar', 'arabic'):
            system_prompt = """أنت مستشار مهني خبير ومتخصص في توجيه المسار الوظيفي. قدم نصائح دقيقة ومفيدة حول المسارات المهنية والتطوير الوظيفي ومتطلبات المهارات. ركز على تقديم إرشادات عملية ومحددة قابلة للتنفيذ."""
        else:
            system_prompt = """You are an expert career advisor specialized in professional development and career trajectories. Provide accurate, helpful advice on career paths, professional development, and skill requirements. Focus on giving practical, specific guidance that is actionable."""
        
        # Prepare user prompt
        user_prompt = f"""Career Question: {question}

{background_text}

Please provide detailed career advice that includes:
1. Direct answer to the question
2. Key considerations for this career path/decision
3. Recommended skills to develop
4. Practical next steps
5. Relevant resources for further learning"""

        # Call DeepSeek API
        response = self.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=self.models['default'],
            temperature=0.7,  # Higher temperature for more creative advice
            max_tokens=1200,
            mock_endpoint='career_advice'
        )
        
        return {
            'advice': response.get('content', ''),
            'using_mock_data': response.get('mock_used', False),
            'success': response.get('success', False)
        }
    
    def _extract_score_from_text(self, text: str) -> int:
        """Extract a numerical score from text content."""
        import re
        
        # Look for patterns like "Score: 85/100" or "Match score: 85"
        score_patterns = [
            r"(?:overall|match|ats|resume)?\s*(?:score|rating):\s*(\d{1,3})(?:/100)?",
            r"(\d{1,3})(?:/100)?\s*(?:score|rating|match)",
            r"score\s*(?:is|of)?\s*(\d{1,3})(?:/100)?",
            r"(\d{1,3})(?:/100)?\s*(?:percent|%)\s*match",
            r"matching\s*(?:score|percentage):\s*(\d{1,3})(?:%|/100)?"
        ]
        
        for pattern in score_patterns:
            matches = re.search(pattern, text.lower())
            if matches:
                try:
                    score = int(matches.group(1))
                    # Ensure score is within valid range
                    return max(0, min(score, 100))
                except ValueError:
                    continue
        
        # Default score if no patterns match
        return 70  # Reasonable default 