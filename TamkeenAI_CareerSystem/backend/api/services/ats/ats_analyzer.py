"""
Advanced ATS (Applicant Tracking System) Analyzer

This module provides a comprehensive ATS analysis service with advanced
NLP, resume parsing, and job matching capabilities.
"""

import os
import io
import re
import json
import logging
import tempfile
from typing import Dict, Any, List, Optional, Tuple, Union
from datetime import datetime

# Import custom modules
from .resume_extractor import extract_text_from_resume, extract_sections_from_resume
from .keyword_extractor import extract_keywords_advanced, find_matching_keywords, calculate_similarity_score

# Setup logger
logger = logging.getLogger(__name__)

class ATSAnalyzer:
    """
    Advanced ATS Analyzer with modern NLP and AI capabilities
    for resume analysis, job matching, and ATS optimization.
    """
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        Initialize the ATS Analyzer with optional parameters for
        DeepSeek integration.
        
        Args:
            api_key: API key for DeepSeek integration
            base_url: Base URL for DeepSeek API
        """
        self.api_key = api_key
        self.base_url = base_url or "https://openrouter.ai/api/v1"
        
        # Initialize DeepSeek client if API key is provided
        if self.api_key:
            try:
                from openai import OpenAI
                self.llm_client = OpenAI(
                    base_url=self.base_url,
                    api_key=self.api_key
                )
                logger.info("DeepSeek client initialized successfully")
            except ImportError:
                logger.warning("OpenAI library not installed, DeepSeek integration disabled")
                self.llm_client = None
            except Exception as e:
                logger.error(f"Error initializing DeepSeek client: {str(e)}")
                self.llm_client = None
        else:
            self.llm_client = None
    
    def analyze_resume(
        self, 
        resume_path: str,
        job_description: Optional[str] = None,
        job_title: Optional[str] = None,
        use_semantic_matching: bool = True,
        use_contextual_analysis: bool = True,
        use_deepseek: bool = False
    ) -> Dict[str, Any]:
        """
        Provide comprehensive analysis of resume for ATS compatibility
        
        Args:
            resume_path: Path to resume file
            job_description: Job description for matching
            job_title: Job title for reference
            use_semantic_matching: Whether to use semantic matching for keywords
            use_contextual_analysis: Whether to analyze resume sections contextually
            use_deepseek: Whether to use DeepSeek LLM for advanced analysis
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Extract text from resume
            resume_text = extract_text_from_resume(resume_path)
            
            if not resume_text or len(resume_text) < 100:
                return {
                    "success": False,
                    "error": "Could not extract sufficient text from resume",
                    "score": 0
                }
            
            # Extract sections from resume
            sections = extract_sections_from_resume(resume_text)
            
            # Initialize result structure
            result = {
                "success": True,
                "score": 0,
                "job_title": job_title,
                "file_format": os.path.splitext(resume_path)[1],
                "sections_found": list(sections.keys()) if sections else [],
                "text_length": len(resume_text),
                "extraction_date": datetime.now().isoformat()
            }
            
            # Analyze format
            format_analysis = self._analyze_format(resume_path, resume_text)
            result.update(format_analysis)
            
            # Match against job description if provided
            if job_description:
                matching_result = self._match_job_description(
                    resume_text, 
                    sections,
                    job_description,
                    use_semantic_matching,
                    use_contextual_analysis
                )
                result.update(matching_result)
            
            # Analyze sections
            if sections and use_contextual_analysis:
                sections_analysis = self._analyze_sections(sections, job_description)
                result["sections_analysis"] = sections_analysis
            
            # Generate recommendations
            recommendations = self._generate_recommendations(result)
            result["recommendations"] = recommendations
            
            # Use DeepSeek for advanced analysis if requested and available
            if use_deepseek and self.llm_client and job_description:
                llm_analysis = self._analyze_with_llm(resume_text, job_description, job_title)
                
                if llm_analysis:
                    result["llm_analysis"] = llm_analysis
                    
                    # Extract score from LLM analysis if possible
                    llm_score = self._extract_score_from_llm_analysis(llm_analysis)
                    if llm_score:
                        # Combine scores, giving more weight to LLM analysis
                        result["score"] = round(0.3 * result["score"] + 0.7 * llm_score)
                    
                    # Get improvement roadmap
                    roadmap = self._generate_improvement_roadmap(resume_text, job_description, job_title)
                    if roadmap:
                        result["improvement_roadmap"] = roadmap
            
            # Generate assessment message based on score
            result["assessment"] = self._get_assessment_message(result["score"])
            
            # Generate visualizations if contextual analysis is enabled
            if use_contextual_analysis and job_description:
                visualizations = self._generate_visualizations(result)
                if visualizations:
                    result["visualizations"] = visualizations
            
            return result
        
        except Exception as e:
            logger.error(f"Error analyzing resume: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "score": 0
            }
    
    def _analyze_format(self, resume_path: str, resume_text: str) -> Dict[str, Any]:
        """
        Analyze resume format for ATS compatibility
        
        Args:
            resume_path: Path to resume file
            resume_text: Extracted text from resume
            
        Returns:
            Dictionary with format analysis results
        """
        file_extension = os.path.splitext(resume_path)[1].lower()
        
        result = {
            "format_analysis": {
                "file_format": file_extension,
                "format_score": 0,
                "format_issues": []
            }
        }
        
        # Check file format
        if file_extension == ".pdf":
            result["format_analysis"]["format_score"] = 90
            result["format_analysis"]["format_issues"].append(
                "PDF is generally good for ATS, but ensure it's machine-readable (not scanned)"
            )
        elif file_extension == ".docx":
            result["format_analysis"]["format_score"] = 100
            result["format_analysis"]["format_issues"].append(
                "DOCX is ideal for ATS systems"
            )
        elif file_extension == ".doc":
            result["format_analysis"]["format_score"] = 85
            result["format_analysis"]["format_issues"].append(
                "DOC format is acceptable but DOCX is preferred"
            )
        elif file_extension == ".txt":
            result["format_analysis"]["format_score"] = 80
            result["format_analysis"]["format_issues"].append(
                "TXT format lacks formatting which may impact readability"
            )
        else:
            result["format_analysis"]["format_score"] = 50
            result["format_analysis"]["format_issues"].append(
                f"Format {file_extension} may not be ideal for ATS systems"
            )
        
        # Check content length
        if len(resume_text) < 1500:
            result["format_analysis"]["format_score"] -= 10
            result["format_analysis"]["format_issues"].append(
                "Resume text is quite short, consider adding more details"
            )
        
        # Check for formatting issues
        if resume_text.count("\n\n\n") > 5:
            result["format_analysis"]["format_score"] -= 5
            result["format_analysis"]["format_issues"].append(
                "Multiple large gaps in text may indicate formatting issues"
            )
        
        # Check for bullet points
        if resume_text.count("•") < 5 and resume_text.count("-") < 5:
            result["format_analysis"]["format_score"] -= 5
            result["format_analysis"]["format_issues"].append(
                "Few or no bullet points detected - bullet points improve readability"
            )
        
        return result
    
    def _match_job_description(
        self, 
        resume_text: str, 
        sections: Dict[str, List[str]],
        job_description: str,
        use_semantic_matching: bool = True,
        use_contextual_analysis: bool = True
    ) -> Dict[str, Any]:
        """
        Match resume against job description
        
        Args:
            resume_text: Extracted text from resume
            sections: Extracted sections from resume
            job_description: Job description for matching
            use_semantic_matching: Whether to use semantic matching
            use_contextual_analysis: Whether to use contextual analysis
            
        Returns:
            Dictionary with matching results
        """
        result = {}
        
        # Find matching and missing keywords
        keyword_matches = find_matching_keywords(resume_text, job_description)
        
        result["matching_keywords"] = keyword_matches.get("matching_keywords", [])
        result["missing_keywords"] = keyword_matches.get("missing_keywords", [])
        
        # Calculate similarity score
        similarity_score = calculate_similarity_score(resume_text, job_description)
        result["score"] = round(similarity_score)
        
        # Analyze experience section specifically if available
        if "experience" in sections and use_contextual_analysis:
            experience_text = "\n".join(sections["experience"])
            experience_score = calculate_similarity_score(experience_text, job_description)
            result["experience_match_score"] = round(experience_score)
        
        # Analyze skills section specifically if available
        if "skills" in sections and use_contextual_analysis:
            skills_text = "\n".join(sections["skills"])
            skills_keywords = extract_keywords_advanced(skills_text, method="simple")
            job_keywords = extract_keywords_advanced(job_description, method="simple")
            
            matching_skills = set(skills_keywords).intersection(set(job_keywords))
            missing_skills = set(job_keywords) - set(skills_keywords)
            
            result["matching_skills"] = list(matching_skills)
            result["missing_skills"] = list(missing_skills)
            result["skills_match_score"] = round((len(matching_skills) / max(len(job_keywords), 1)) * 100)
        
        return result
    
    def _analyze_sections(
        self, 
        sections: Dict[str, List[str]], 
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze resume sections for completeness and relevance
        
        Args:
            sections: Extracted sections from resume
            job_description: Job description for relevance analysis
            
        Returns:
            Dictionary with section analysis results
        """
        result = {}
        
        # Define essential sections
        essential_sections = ["experience", "education", "skills"]
        recommended_sections = ["objective", "projects", "certifications"]
        
        # Analyze each section
        for section_name, lines in sections.items():
            section_text = "\n".join(lines)
            section_word_count = len(section_text.split())
            
            section_analysis = {
                "word_count": section_word_count,
                "completeness": self._analyze_section_completeness(section_name, section_text),
                "relevance": 0,
                "recommendations": []
            }
            
            # Add basic recommendations based on section content
            if section_word_count < 50 and section_name in essential_sections:
                section_analysis["recommendations"].append(
                    f"Your {section_name} section is quite brief. Consider adding more details."
                )
            
            # Calculate relevance to job description if provided
            if job_description:
                relevance_score = calculate_similarity_score(section_text, job_description)
                section_analysis["relevance"] = round(relevance_score)
                
                # Add relevance-based recommendations
                if section_name in essential_sections and relevance_score < 40:
                    section_analysis["recommendations"].append(
                        f"Your {section_name} section shows low relevance to the job description. "
                        "Consider tailoring it to match job requirements better."
                    )
            
            result[section_name] = section_analysis
        
        # Check for missing essential sections
        missing_sections = [section for section in essential_sections if section not in sections]
        if missing_sections:
            result["missing_essential_sections"] = missing_sections
        
        # Check for missing recommended sections
        missing_recommended = [section for section in recommended_sections if section not in sections]
        if missing_recommended:
            result["missing_recommended_sections"] = missing_recommended
        
        return result
    
    def _analyze_section_completeness(self, section_name: str, section_text: str) -> int:
        """
        Analyze section completeness based on expected content
        
        Args:
            section_name: Section name
            section_text: Section text
            
        Returns:
            Completeness score (0-100)
        """
        # Define expected patterns/words for each section type
        expected_patterns = {
            "experience": {
                "date_pattern": r'(19|20)\d{2}\s*(-|–|to)\s*(19|20)\d{2}|present|current|now',
                "role_pattern": r'(manager|engineer|developer|analyst|specialist|coordinator|associate|assistant|director|lead|head)',
                "action_verbs": ["managed", "developed", "created", "designed", "implemented", "led", "coordinated", "analyzed", "built", "improved"]
            },
            "education": {
                "degree_pattern": r'(bachelor|master|phd|doctorate|bs|ba|ms|ma|mba|associate)',
                "date_pattern": r'(19|20)\d{2}',
                "gpa_pattern": r'gpa\s*:?\s*\d\.\d|g\.p\.a\.?\s*:?\s*\d\.\d'
            },
            "skills": {
                "tech_pattern": r'(python|java|javascript|c\+\+|sql|html|css|react|angular|node|aws|azure|cloud|docker|kubernetes)',
                "soft_skills": ["communication", "leadership", "teamwork", "problem-solving", "critical thinking", "time management"]
            },
            "projects": {
                "tech_pattern": r'(python|java|javascript|c\+\+|sql|html|css|react|angular|node|aws|azure|cloud|docker|kubernetes)',
                "url_pattern": r'github\.com|gitlab\.com|bitbucket\.org'
            },
            "certifications": {
                "cert_pattern": r'(certified|certification|certificate|license)',
                "date_pattern": r'(19|20)\d{2}'
            }
        }
        
        # Default patterns for other sections
        default_patterns = {
            "date_pattern": r'(19|20)\d{2}',
            "keyword_count": 5  # Minimum expected keywords in a section
        }
        
        score = 0
        
        # Get patterns for this section or use default
        patterns = expected_patterns.get(section_name, default_patterns)
        
        # Check for patterns in the section text
        for pattern_name, pattern in patterns.items():
            if isinstance(pattern, str):  # Regex pattern
                if re.search(pattern, section_text, re.IGNORECASE):
                    score += 20
            elif isinstance(pattern, list):  # List of words/phrases
                found_count = sum(1 for word in pattern if word.lower() in section_text.lower())
                score += min(20, (found_count / len(pattern)) * 20)
        
        # Adjust score based on length
        word_count = len(section_text.split())
        if word_count < 20:
            score = min(score, 60)  # Cap score for very short sections
        elif word_count > 200:
            score = min(100, score + 10)  # Bonus for detailed sections
        
        return min(100, score)
    
    def _generate_recommendations(self, analysis_result: Dict[str, Any]) -> List[str]:
        """
        Generate recommendations based on analysis results
        
        Args:
            analysis_result: Analysis results dictionary
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Format recommendations
        format_issues = analysis_result.get("format_analysis", {}).get("format_issues", [])
        recommendations.extend(format_issues)
        
        # Missing keywords recommendations
        missing_keywords = analysis_result.get("missing_keywords", [])
        if missing_keywords:
            top_missing = missing_keywords[:10]
            recommendations.append(
                f"Consider adding these missing keywords: {', '.join(top_missing)}"
            )
        
        # Section recommendations
        sections_analysis = analysis_result.get("sections_analysis", {})
        
        # Check for missing essential sections
        missing_sections = sections_analysis.get("missing_essential_sections", [])
        if missing_sections:
            recommendations.append(
                f"Add these essential missing sections: {', '.join(missing_sections)}"
            )
        
        # Check for missing recommended sections
        missing_recommended = sections_analysis.get("missing_recommended_sections", [])
        if missing_recommended:
            recommendations.append(
                f"Consider adding these recommended sections: {', '.join(missing_recommended)}"
            )
        
        # Add section-specific recommendations
        for section_name, section_data in sections_analysis.items():
            if isinstance(section_data, dict) and "recommendations" in section_data:
                section_recommendations = section_data["recommendations"]
                recommendations.extend(section_recommendations)
        
        # Overall score recommendations
        score = analysis_result.get("score", 0)
        if score < 50:
            recommendations.append(
                "Your resume needs significant improvements to match this job description."
            )
        elif score < 70:
            recommendations.append(
                "Consider tailoring your resume more specifically to this job description."
            )
        
        return recommendations
    
    def _analyze_with_llm(
        self, 
        resume_text: str, 
        job_description: str, 
        job_title: Optional[str] = None
    ) -> str:
        """
        Analyze resume using DeepSeek LLM for advanced insights
        
        Args:
            resume_text: Extracted text from resume
            job_description: Job description for matching
            job_title: Job title for reference
            
        Returns:
            LLM analysis string
        """
        if not self.llm_client:
            return "LLM analysis unavailable - DeepSeek client not initialized"
        
        try:
            # Truncate texts to manage token limits
            resume_text_truncated = resume_text[:2500]
            job_description_truncated = job_description[:1000]
            
            job_title_text = f"Job Title: {job_title}\n\n" if job_title else ""
            
            prompt = f"""You are an expert ATS evaluator. Analyze this resume against job description.

RESUME:
{resume_text_truncated}

JOB DESCRIPTION:
{job_title_text}{job_description_truncated}

Provide concise analysis:
1. OVERALL MATCH SCORE: Give a percentage (e.g., 75%)
2. MATCHING KEYWORDS: List the top 5-10 matching keywords found
3. MISSING KEYWORDS: List the top 5-10 keywords from the job description missing in the resume
4. STRENGTHS: 2-3 bullet points on resume strengths
5. WEAKNESSES: 2-3 bullet points on resume weaknesses
6. IMPROVEMENT SUGGESTIONS: 3-4 specific suggestions to improve ATS compatibility

Be precise and direct. Focus on the most important points only."""

            response = self.llm_client.chat.completions.create(
                model="deepseek/deepseek-r1:free",
                messages=[
                    {"role": "system", "content": "You are an ATS evaluator providing resume analysis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            logger.error(f"Error using DeepSeek for analysis: {str(e)}")
            return f"Error connecting to DeepSeek API: {str(e)}"
    
    def _generate_improvement_roadmap(
        self, 
        resume_text: str, 
        job_description: str, 
        job_title: Optional[str] = None
    ) -> str:
        """
        Generate comprehensive improvement roadmap using DeepSeek
        
        Args:
            resume_text: Extracted text from resume
            job_description: Job description for matching
            job_title: Job title for reference
            
        Returns:
            Improvement roadmap string
        """
        if not self.llm_client:
            return "Improvement roadmap unavailable - DeepSeek client not initialized"
        
        try:
            # Truncate texts to manage token limits
            resume_text_truncated = resume_text[:3000]
            job_description_truncated = job_description[:1500]
            
            job_title_text = f"Job Title: {job_title}\n\n" if job_title else ""
            
            prompt = f"""You are an expert career development advisor.
Analyze the following resume and job description to provide a comprehensive improvement roadmap.

RESUME:
{resume_text_truncated}

JOB DESCRIPTION:
{job_title_text}{job_description_truncated}

Please provide a detailed analysis with the following structure:

1. SKILL GAP ANALYSIS
- Identify critical skills missing from the current resume
- Compare current skills with job requirements
- Rank skills by importance and difficulty to acquire

2. RESUME IMPROVEMENT PLAN
- Specific content additions and modifications
- Structure and formatting improvements
- Keywords and phrases to include

3. LEARNING ROADMAP
- Recommended courses and certifications
- Suggested learning resources
- Estimated time to skill proficiency

Provide actionable, specific guidance that helps transform this resume for better ATS compatibility and job matching."""

            response = self.llm_client.chat.completions.create(
                model="deepseek/deepseek-r1:free",
                messages=[
                    {"role": "system", "content": "You are an expert career development advisor providing resume improvement guidance."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1200
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            logger.error(f"Error generating improvement roadmap: {str(e)}")
            return f"Error generating improvement roadmap: {str(e)}"
    
    def _extract_score_from_llm_analysis(self, analysis_text: str) -> Optional[int]:
        """
        Extract score from LLM analysis text
        
        Args:
            analysis_text: LLM analysis text
            
        Returns:
            Extracted score (0-100) or None if not found
        """
        try:
            # Look for percentage patterns in the text
            percentage_pattern = r'(\d{1,3})%'
            matches = re.findall(percentage_pattern, analysis_text)
            
            if matches:
                # Take the first percentage found
                score = int(matches[0])
                # Validate score range
                if 0 <= score <= 100:
                    return score
            
            # Look for score out of 100 pattern
            score_pattern = r'(\d{1,3})/100'
            matches = re.findall(score_pattern, analysis_text)
            
            if matches:
                score = int(matches[0])
                if 0 <= score <= 100:
                    return score
            
            # Look for explicit score mention
            score_mention_pattern = r'score:?\s*(\d{1,3})'
            matches = re.findall(score_mention_pattern, analysis_text, re.IGNORECASE)
            
            if matches:
                score = int(matches[0])
                if 0 <= score <= 100:
                    return score
            
            return None
        
        except Exception as e:
            logger.error(f"Error extracting score from LLM analysis: {str(e)}")
            return None
    
    def _get_assessment_message(self, score: int) -> str:
        """
        Get assessment message based on score
        
        Args:
            score: ATS compatibility score (0-100)
            
        Returns:
            Assessment message
        """
        if score >= 80:
            return "Excellent! Your resume is highly compatible with this job."
        elif score >= 60:
            return "Good. Your resume matches the job requirements reasonably well."
        elif score >= 40:
            return "Average. Consider optimizing your resume for better matching."
        else:
            return "Low match. Your resume needs significant adjustments for this role."
    
    def _generate_visualizations(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate visualization data for frontend display
        
        Args:
            analysis_result: Analysis results dictionary
            
        Returns:
            Dictionary with visualization data
        """
        try:
            visualizations = {}
            
            # Score gauge data
            visualizations["score_gauge"] = {
                "score": analysis_result.get("score", 0),
                "ranges": [
                    {"min": 0, "max": 40, "label": "Low", "color": "#ff4d4f"},
                    {"min": 40, "max": 60, "label": "Average", "color": "#faad14"},
                    {"min": 60, "max": 80, "label": "Good", "color": "#52c41a"},
                    {"min": 80, "max": 100, "label": "Excellent", "color": "#1890ff"}
                ]
            }
            
            # Keyword match data
            matching_keywords = analysis_result.get("matching_keywords", [])
            missing_keywords = analysis_result.get("missing_keywords", [])
            
            visualizations["keyword_match"] = {
                "matching": len(matching_keywords),
                "missing": len(missing_keywords),
                "total": len(matching_keywords) + len(missing_keywords)
            }
            
            # Section scores data if available
            sections_analysis = analysis_result.get("sections_analysis", {})
            if sections_analysis:
                section_scores = {}
                
                for section_name, section_data in sections_analysis.items():
                    if isinstance(section_data, dict) and "relevance" in section_data:
                        section_scores[section_name] = section_data["relevance"]
                
                if section_scores:
                    visualizations["section_scores"] = section_scores
            
            return visualizations
        
        except Exception as e:
            logger.error(f"Error generating visualizations: {str(e)}")
            return {}


def create_ats_analyzer(api_key: Optional[str] = None, base_url: Optional[str] = None) -> ATSAnalyzer:
    """
    Create an instance of the ATSAnalyzer
    
    Args:
        api_key: Optional API key for DeepSeek integration
        base_url: Optional base URL for DeepSeek API
        
    Returns:
        ATSAnalyzer instance
    """
    return ATSAnalyzer(api_key=api_key, base_url=base_url) 