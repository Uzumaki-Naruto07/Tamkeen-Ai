"""
ATS Matcher Module

This module analyzes resumes for ATS (Applicant Tracking System) compatibility and
performs job description matching to help users optimize their applications.
"""

import os
import re
import json
import math
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import other core modules
from .resume_parser import extract_text_from_resume, parse_resume
from .keyword_recommender import extract_keywords, find_matching_keywords

# Import settings
from config.settings import BASE_DIR

# Try importing NLP libraries for better text processing
try:
    import spacy
    import nltk
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    
    # Initialize NLTK resources
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
    
    NLP_AVAILABLE = True
    STOP_WORDS = set(stopwords.words('english'))
except ImportError:
    NLP_AVAILABLE = False
    STOP_WORDS = set()
    print("Warning: Advanced NLP libraries not available. Install with: pip install spacy nltk")


class ATSMatcher:
    """Class for analyzing resume compatibility with ATS systems"""
    
    def __init__(self):
        """Initialize with common ATS criteria"""
        self.ats_criteria = {
            "file_formats": ["pdf", "docx", "txt"],
            "problematic_formats": ["png", "jpg", "jpeg", "gif", "bmp", "doc", "rtf"],
            "min_words": 300,
            "max_words": 1200,
            "optimal_words": 600,
            "min_sections": 4,  # Typical sections: contact, summary, experience, education
            "required_sections": ["contact", "experience", "education", "skills"],
            "common_ats_systems": ["Workday", "Taleo", "Greenhouse", "Lever", "iCIMS", "BrassRing", "SmartRecruiters"],
            "problematic_elements": ["tables", "headers", "footers", "images", "graphics", "columns", "text boxes", "fancy fonts"]
        }
        
        # Load keyword database
        self.job_keyword_db = self._load_job_keywords()
    
    def _load_job_keywords(self) -> Dict[str, List[str]]:
        """Load job keywords database"""
        job_keywords = {}
        
        # Try to load from file
        keywords_file = os.path.join(BASE_DIR, 'data', 'job_keywords', 'job_keywords.json')
        try:
            if os.path.exists(keywords_file):
                with open(keywords_file, 'r', encoding='utf-8') as f:
                    job_keywords = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading job keywords: {e}")
            
            # Create minimal default data
            job_keywords = {
                "software_engineer": [
                    "python", "java", "javascript", "react", "angular", "node.js", "aws", "ci/cd",
                    "agile", "scrum", "algorithms", "data structures", "rest api", "microservices"
                ],
                "data_scientist": [
                    "machine learning", "python", "r", "sql", "statistics", "deep learning", "nlp",
                    "data visualization", "pandas", "sklearn", "tensorflow", "data analysis"
                ],
                "product_manager": [
                    "product development", "roadmap", "user stories", "agile", "market research",
                    "user experience", "stakeholder management", "kpis", "product strategy"
                ],
                "marketing_specialist": [
                    "digital marketing", "social media", "seo", "content marketing", "analytics",
                    "campaign management", "market research", "brand awareness", "copywriting"
                ],
                "financial_analyst": [
                    "financial modeling", "excel", "forecasting", "budgeting", "variance analysis",
                    "financial statements", "accounting", "investment analysis", "valuation"
                ]
            }
        
        return job_keywords
    
    def analyze_resume_format(self, file_path: str) -> Dict[str, Any]:
        """
        Analyze resume file format for ATS compatibility
        
        Args:
            file_path: Path to resume file
            
        Returns:
            dict: Format analysis results
        """
        # Initialize results
        results = {
            "format_score": 0,
            "file_format_compatible": False,
            "format_issues": [],
            "format_recommendations": []
        }
        
        # Check file extension
        file_ext = os.path.splitext(file_path)[1].lower().replace(".", "")
        results["detected_format"] = file_ext
        
        if file_ext in self.ats_criteria["file_formats"]:
            results["file_format_compatible"] = True
            results["format_score"] += 30  # 30 points for compatible format
        elif file_ext in self.ats_criteria["problematic_formats"]:
            results["format_issues"].append(f"File format .{file_ext} may cause issues with ATS systems")
            results["format_recommendations"].append(f"Convert your resume to PDF or DOCX format")
        else:
            results["format_issues"].append(f"Unrecognized file format .{file_ext}")
            results["format_recommendations"].append("Use standard formats like PDF or DOCX for best compatibility")
        
        # Extract text to analyze content
        try:
            resume_text = extract_text_from_resume(file_path)
            word_count = len(resume_text.split())
            results["word_count"] = word_count
            
            # Assess word count
            if word_count < self.ats_criteria["min_words"]:
                results["format_issues"].append(f"Resume is too short ({word_count} words)")
                results["format_recommendations"].append(
                    f"Expand your resume to at least {self.ats_criteria['min_words']} words with relevant experience and skills"
                )
            elif word_count > self.ats_criteria["max_words"]:
                results["format_issues"].append(f"Resume is too long ({word_count} words)")
                results["format_recommendations"].append(
                    f"Trim your resume to {self.ats_criteria['optimal_words']}-{self.ats_criteria['max_words']} words"
                )
            else:
                results["format_score"] += 20  # 20 points for good length
            
            # Check for common formatting issues (basic check)
            # Note: More sophisticated checks would require parsing the original file
            
            # Check for potential table structures
            if "\t" in resume_text or "  " in resume_text:
                results["format_issues"].append("Possible use of tables or unusual spacing detected")
                results["format_recommendations"].append("Avoid tables, columns, and unusual formatting - use simple layouts")
            
            # Check for sections
            parsed_resume = parse_resume(resume_text)
            sections = parsed_resume.get("sections", {})
            section_count = len(sections)
            results["detected_sections"] = list(sections.keys())
            
            if section_count < self.ats_criteria["min_sections"]:
                results["format_issues"].append(f"Only {section_count} sections detected, may be missing key sections")
                results["format_recommendations"].append(
                    f"Include clearly labeled sections for: " + ", ".join(self.ats_criteria["required_sections"])
                )
            else:
                # Check for required sections
                missing_sections = []
                for required in self.ats_criteria["required_sections"]:
                    found = False
                    for section in sections:
                        if required.lower() in section.lower():
                            found = True
                            break
                    if not found:
                        missing_sections.append(required)
                
                if missing_sections:
                    results["format_issues"].append(f"Missing key sections: {', '.join(missing_sections)}")
                    results["format_recommendations"].append(
                        f"Add clearly labeled sections for: {', '.join(missing_sections)}"
                    )
                else:
                    results["format_score"] += 30  # 30 points for all required sections
            
            # Add general ATS recommendations
            if not results["format_recommendations"]:
                results["format_recommendations"].append("Your resume format appears compatible with ATS systems")
            
            # Adjust format score based on issues
            if results["format_score"] == 0 and not results["format_issues"]:
                results["format_score"] = 50  # Base score if no specific issues found
            
            issue_penalty = min(len(results["format_issues"]) * 10, 40)
            results["format_score"] = max(results["format_score"] - issue_penalty, 10)
            
        except Exception as e:
            results["format_issues"].append(f"Error analyzing resume: {e}")
            results["format_recommendations"].append("Ensure your file is not corrupted and try again")
        
        return results
    
    def match_job_description(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Match resume against job description
        
        Args:
            resume_text: Text content of resume
            job_description: Job description text
            
        Returns:
            dict: Matching analysis results
        """
        results = {
            "match_score": 0,
            "keyword_matches": [],
            "missing_keywords": [],
            "skill_matches": [],
            "recommended_additions": [],
            "match_recommendations": []
        }
        
        # Extract keywords from job description
        job_keywords = extract_keywords(job_description, top_n=20)
        job_keywords_dict = dict(job_keywords)
        
        # Find matching keywords in resume
        matches = find_matching_keywords(resume_text, job_description)
        
        # Process matches
        matching_keywords = matches.get("matching_keywords", [])
        results["keyword_matches"] = matching_keywords
        
        # Calculate match percentage
        total_keywords = len(job_keywords)
        matching_count = len(matching_keywords)
        
        if total_keywords > 0:
            match_percent = (matching_count / total_keywords) * 100
            results["keyword_match_percent"] = round(match_percent, 1)
            
            # Calculate match score (0-100)
            results["match_score"] = min(round(match_percent), 100)
            
            # Determine match quality
            if match_percent >= 80:
                results["match_quality"] = "excellent"
            elif match_percent >= 60:
                results["match_quality"] = "good"
            elif match_percent >= 40:
                results["match_quality"] = "fair"
            else:
                results["match_quality"] = "poor"
        
        # Identify missing important keywords
        missing_keywords = []
        for kw, score in job_keywords:
            if kw not in [m["keyword"] for m in matching_keywords]:
                missing_keywords.append({
                    "keyword": kw,
                    "importance": score
                })
        
        # Sort by importance
        missing_keywords.sort(key=lambda x: x["importance"], reverse=True)
        results["missing_keywords"] = missing_keywords[:10]  # Top 10 missing keywords
        
        # Generate recommendations
        if results["missing_keywords"]:
            top_missing = [k["keyword"] for k in results["missing_keywords"][:5]]
            results["recommended_additions"] = top_missing
            
            if len(top_missing) > 0:
                results["match_recommendations"].append(
                    f"Add these key terms to your resume: {', '.join(top_missing)}"
                )
        
        if results["match_score"] < 40:
            results["match_recommendations"].append(
                "Your resume doesn't match well with this job description. Consider tailoring it specifically to this role."
            )
        elif results["match_score"] < 60:
            results["match_recommendations"].append(
                "Your resume partially matches this job. Highlight more relevant skills and experiences."
            )
        
        if len(matches.get("matching_keywords", [])) > 0:
            # Some strong points to emphasize
            strong_matches = sorted(matches.get("matching_keywords", []), 
                                    key=lambda x: x.get("count", 0) * x.get("relevance", 0), 
                                    reverse=True)[:3]
            if strong_matches:
                strong_terms = [m["keyword"] for m in strong_matches]
                results["match_recommendations"].append(
                    f"Emphasize your experience with: {', '.join(strong_terms)}"
                )
        
        return results
    
    def analyze_resume(self, file_path: str, job_description: Optional[str] = None) -> Dict[str, Any]:
        """
        Comprehensive resume analysis for ATS compatibility
        
        Args:
            file_path: Path to resume file
            job_description: Optional job description for matching
            
        Returns:
            dict: Complete analysis results
        """
        results = {
            "timestamp": datetime.now().isoformat(),
            "filename": os.path.basename(file_path),
            "overall_score": 0,
            "analysis": {}
        }
        
        # Analyze format
        format_results = self.analyze_resume_format(file_path)
        results["analysis"]["format"] = format_results
        
        # Extract text
        try:
            resume_text = extract_text_from_resume(file_path)
            results["word_count"] = len(resume_text.split())
            
            # Parse resume content
            parsed_resume = parse_resume(resume_text)
            results["analysis"]["content"] = {
                "sections": list(parsed_resume.get("sections", {}).keys()),
                "detected_skills": parsed_resume.get("entities", {}).get("skills", []),
                "detected_jobs": parsed_resume.get("entities", {}).get("job_titles", []),
                "keyword_density": {},
                "content_recommendations": []
            }
            
            # Extract keywords for content analysis
            resume_keywords = extract_keywords(resume_text, top_n=20)
            
            # Calculate keyword density (percentage of text)
            words = resume_text.lower().split()
            total_words = len(words)
            
            for keyword, score in resume_keywords:
                keyword_words = keyword.lower().split()
                # For multi-word keywords, need to check phrases
                if len(keyword_words) > 1:
                    # This is a simplified approach - a more accurate implementation would use regex
                    count = 0
                    for i in range(len(words) - len(keyword_words) + 1):
                        if words[i:i+len(keyword_words)] == keyword_words:
                            count += 1
                else:
                    count = words.count(keyword_words[0])
                
                density = (count * len(keyword_words) / total_words) * 100 if total_words > 0 else 0
                results["analysis"]["content"]["keyword_density"][keyword] = {
                    "count": count,
                    "density": round(density, 2),
                    "relevance": round(score, 2)
                }
            
            # Check for content issues
            content_issues = []
            
            # Check skill section
            skills = parsed_resume.get("entities", {}).get("skills", [])
            if not skills or len(skills) < 5:
                content_issues.append("Limited skills section detected")
                results["analysis"]["content"]["content_recommendations"].append(
                    "Expand your skills section with at least 8-10 relevant technical and soft skills"
                )
            
            # Check job descriptions
            experience = parsed_resume.get("sections", {}).get("experience", "")
            if experience:
                # Check for bullet points (indicated by dashes, asterisks, or numbers)
                has_bullets = bool(re.search(r'[\-\*•]|\d+\.', experience))
                if not has_bullets:
                    content_issues.append("Job descriptions may lack bullet points")
                    results["analysis"]["content"]["content_recommendations"].append(
                        "Format job descriptions as bullet points starting with action verbs"
                    )
                
                # Check for action verbs
                action_verbs = ["managed", "developed", "created", "implemented", "designed", 
                                "led", "coordinated", "achieved", "improved", "increased"]
                has_action_verbs = any(verb in experience.lower() for verb in action_verbs)
                if not has_action_verbs:
                    content_issues.append("Job descriptions may lack action verbs")
                    results["analysis"]["content"]["content_recommendations"].append(
                        "Start bullet points with strong action verbs describing accomplishments"
                    )
                
                # Check for metrics/achievements
                has_metrics = bool(re.search(r'\d+%|\$\d+|\d+ [a-z]+', experience))
                if not has_metrics:
                    content_issues.append("Job descriptions may lack quantifiable achievements")
                    results["analysis"]["content"]["content_recommendations"].append(
                        "Include metrics and quantifiable achievements in your job descriptions"
                    )
            
            # Job description matching
            if job_description:
                match_results = self.match_job_description(resume_text, job_description)
                results["analysis"]["job_match"] = match_results
            
            # Calculate overall score
            format_score = format_results.get("format_score", 0)
            
            if "job_match" in results["analysis"]:
                match_score = results["analysis"]["job_match"].get("match_score", 0)
                # Weight: 40% format, 60% job match
                results["overall_score"] = round(0.4 * format_score + 0.6 * match_score)
            else:
                # Without job match, format is 100%
                results["overall_score"] = format_score
            
            # Generate overall recommendations
            results["recommendations"] = format_results.get("format_recommendations", [])
            
            if "content_recommendations" in results["analysis"]["content"]:
                results["recommendations"].extend(
                    results["analysis"]["content"]["content_recommendations"]
                )
            
            if "job_match" in results["analysis"] and "match_recommendations" in results["analysis"]["job_match"]:
                results["recommendations"].extend(
                    results["analysis"]["job_match"]["match_recommendations"]
                )
            
        except Exception as e:
            results["error"] = str(e)
            results["recommendations"] = ["Error analyzing resume. Please check the file format and try again."]
        
        return results


# Standalone functions for ATS analysis

def analyze_resume_for_ats(file_path: str) -> Dict[str, Any]:
    """
    Analyze resume for ATS compatibility
    
    Args:
        file_path: Path to resume file
        
    Returns:
        dict: ATS analysis results
    """
    matcher = ATSMatcher()
    return matcher.analyze_resume_format(file_path)


def match_resume_to_job(resume_path: str, job_description: str) -> Dict[str, Any]:
    """
    Match resume to job description
    
    Args:
        resume_path: Path to resume file
        job_description: Job description text
        
    Returns:
        dict: Job matching results
    """
    matcher = ATSMatcher()
    resume_text = extract_text_from_resume(resume_path)
    return matcher.match_job_description(resume_text, job_description)


def analyze_resume(resume_path: str, job_description: Optional[str] = None) -> Dict[str, Any]:
    """
    Complete resume analysis including ATS compatibility and job matching
    
    Args:
        resume_path: Path to resume file
        job_description: Optional job description text
        
    Returns:
        dict: Complete analysis results
    """
    matcher = ATSMatcher()
    return matcher.analyze_resume(resume_path, job_description)
