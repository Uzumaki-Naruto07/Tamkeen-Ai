"""
Resume Parser Module

This module provides functionality for parsing and analyzing resumes to extract
information such as skills, experience, education, and personal details.
"""

import os
import re
import json
import logging
import string
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import utilities
from backend.utils.preprocess import (
    clean_text, extract_skills_from_text, extract_education_from_text,
    extract_experience_from_text, extract_personal_info_from_text,
    extract_sections, extract_dates, extract_job_titles,
    extract_companies, extract_locations, extract_entities
)

# Import settings
from backend.config.settings import PARSER_CONFIG

# Setup logger
logger = logging.getLogger(__name__)


def parse_resume(resume_text: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Parse resume text and extract structured information
    
    Args:
        resume_text: Raw resume text
        config: Optional configuration parameters
        
    Returns:
        dict: Structured resume data
    """
    try:
        # Use default config if not provided
        if config is None:
            config = PARSER_CONFIG
        
        # Clean text
        clean_resume_text = clean_text(resume_text)
        
        # Extract sections
        sections = extract_sections(clean_resume_text)
        
        # Extract personal information
        personal_info = extract_personal_info_from_text(clean_resume_text)
        
        # Extract skills
        skills = extract_skills_from_text(clean_resume_text)
        
        # Extract education
        education = extract_education_from_text(clean_resume_text)
        
        # Extract experience
        experience = extract_experience_from_text(clean_resume_text)
        
        # Extract entities
        entities = extract_entities(clean_resume_text)
        
        # Compile results
        resume_data = {
            "personal_info": personal_info,
            "skills": skills,
            "education": education,
            "experience": experience,
            "sections": sections,
            "entities": entities,
            "raw_text": resume_text,
            "parsed_date": datetime.now().isoformat(),
            "parser_version": "1.0"
        }
        
        # Perform additional processing based on config
        if config.get("extract_keywords", True):
            from backend.core.keyword_extraction import extract_keywords
            resume_data["keywords"] = extract_keywords(clean_resume_text)
        
        if config.get("extract_summary", True):
            # Generate summary
            resume_data["summary"] = _generate_resume_summary(resume_data)
        
        if config.get("extract_job_titles", True):
            # Extract job titles
            resume_data["job_titles"] = extract_job_titles(clean_resume_text)
        
        if config.get("extract_projects", False):
            # Extract projects
            resume_data["projects"] = _extract_projects(clean_resume_text)
        
        return resume_data
    
    except Exception as e:
        logger.error(f"Error parsing resume: {str(e)}")
        return {
            "error": str(e),
            "parsed_date": datetime.now().isoformat(),
            "parser_version": "1.0"
        }


def extract_resume_keywords(resume_text: str) -> List[str]:
    """
    Extract relevant keywords from resume
    
    Args:
        resume_text: Resume text
        
    Returns:
        list: Keywords
    """
    try:
        # Clean text
        clean_resume_text = clean_text(resume_text)
        
        # Extract keywords
        from backend.core.keyword_extraction import extract_keywords
        keywords = extract_keywords(clean_resume_text)
        
        return keywords
    
    except Exception as e:
        logger.error(f"Error extracting resume keywords: {str(e)}")
        return []


def analyze_resume(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze resume data and provide insights
    
    Args:
        resume_data: Parsed resume data
        
    Returns:
        dict: Resume analysis
    """
    try:
        # Initialize analysis
        analysis = {
            "completeness": _calculate_completeness(resume_data),
            "skills_summary": _analyze_skills(resume_data.get("skills", [])),
            "experience_summary": _analyze_experience(resume_data.get("experience", [])),
            "education_summary": _analyze_education(resume_data.get("education", [])),
            "analysis_date": datetime.now().isoformat()
        }
        
        # Calculate overall score
        scores = [
            analysis["completeness"]["score"],
            analysis["skills_summary"]["score"],
            analysis["experience_summary"]["score"],
            analysis["education_summary"]["score"]
        ]
        
        overall_score = sum(scores) / len(scores)
        analysis["overall_score"] = overall_score
        
        # Determine level
        if overall_score >= 80:
            analysis["level"] = "excellent"
        elif overall_score >= 65:
            analysis["level"] = "good"
        elif overall_score >= 50:
            analysis["level"] = "average"
        else:
            analysis["level"] = "needs improvement"
        
        # Generate improvement suggestions
        analysis["improvement_suggestions"] = _get_improvement_suggestions(resume_data, overall_score)
        
        return analysis
    
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        return {
            "error": str(e),
            "analysis_date": datetime.now().isoformat()
        }


def compare_resume_to_job(resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare resume to job description
    
    Args:
        resume_data: Parsed resume data
        job_data: Job data
        
    Returns:
        dict: Comparison result
    """
    try:
        # Import matching utils
        from backend.core.job_matching import JobMatcher
        matcher = JobMatcher()
        
        # Create profile from resume
        profile = _resume_to_profile(resume_data)
        
        # Match profile to job
        match_result = matcher.match_profile_to_job(profile, job_data)
        
        return match_result
    
    except Exception as e:
        logger.error(f"Error comparing resume to job: {str(e)}")
        return {
            "error": str(e),
            "comparison_date": datetime.now().isoformat()
        }


def _resume_to_profile(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert resume data to user profile format
    
    Args:
        resume_data: Parsed resume data
        
    Returns:
        dict: User profile
    """
    # Extract personal info
    personal_info = resume_data.get("personal_info", {})
    
    # Extract skills
    skills = resume_data.get("skills", [])
    
    # Extract education
    education = resume_data.get("education", [])
    
    # Extract experience
    experience = resume_data.get("experience", [])
    
    # Calculate total experience
    total_experience = _calculate_total_experience(experience)
    
    # Create profile
    profile = {
        "personal_info": personal_info,
        "skills": skills,
        "education": education,
        "experience": experience,
        "total_experience": total_experience,
        "job_titles": resume_data.get("job_titles", []),
        "keywords": resume_data.get("keywords", [])
    }
    
    return profile


def _calculate_completeness(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate resume completeness
    
    Args:
        resume_data: Parsed resume data
        
    Returns:
        dict: Completeness metrics
    """
    score = 0
    max_score = 100
    feedback = []
    
    # Check personal info
    personal_info = resume_data.get("personal_info", {})
    
    if personal_info.get("name"):
        score += 5
    else:
        feedback.append("Missing name")
    
    if personal_info.get("email"):
        score += 5
    else:
        feedback.append("Missing email")
    
    if personal_info.get("phone"):
        score += 5
    else:
        feedback.append("Missing phone number")
    
    if personal_info.get("location"):
        score += 5
    else:
        feedback.append("Missing location")
    
    # Check skills
    skills = resume_data.get("skills", [])
    
    if len(skills) >= 10:
        score += 20
    elif len(skills) >= 5:
        score += 10
        feedback.append("Consider adding more skills")
    else:
        feedback.append("Too few skills listed")
    
    # Check experience
    experience = resume_data.get("experience", [])
    
    if len(experience) >= 3:
        score += 20
    elif len(experience) >= 1:
        score += 10
        feedback.append("Consider adding more work experience")
    else:
        feedback.append("Missing work experience")
    
    # Check experience descriptions
    experience_with_desc = 0
    
    for exp in experience:
        if exp.get("description") and len(exp.get("description", "")) > 100:
            experience_with_desc += 1
    
    if experience_with_desc >= 2:
        score += 15
    elif experience_with_desc >= 1:
        score += 5
        feedback.append("Add more detailed descriptions to work experiences")
    else:
        feedback.append("Missing detailed work descriptions")
    
    # Check education
    education = resume_data.get("education", [])
    
    if len(education) >= 1:
        score += 15
    else:
        feedback.append("Missing education information")
    
    # Return results
    return {
        "score": score,
        "max_score": max_score,
        "percentage": score / max_score * 100,
        "feedback": feedback
    }


def _analyze_skills(skills: List[str]) -> Dict[str, Any]:
    """
    Analyze skills
    
    Args:
        skills: List of skills
        
    Returns:
        dict: Skill analysis
    """
    # Score based on number of skills
    if len(skills) >= 15:
        score = 100
        feedback = "Excellent range of skills"
    elif len(skills) >= 10:
        score = 80
        feedback = "Good range of skills"
    elif len(skills) >= 5:
        score = 60
        feedback = "Average number of skills"
    else:
        score = 40
        feedback = "Add more skills to strengthen your profile"
    
    # Category analysis
    categories = {
        "technical": [],
        "soft": [],
        "languages": [],
        "tools": [],
        "other": []
    }
    
    # This would use a more sophisticated categorization in a real system
    soft_skills = [
        "communication", "teamwork", "leadership", "problem solving", "creativity",
        "critical thinking", "time management", "adaptability", "collaboration"
    ]
    
    languages = [
        "english", "spanish", "french", "german", "chinese", "arabic", "russian",
        "japanese", "hindi", "portuguese", "italian"
    ]
    
    tools = [
        "word", "excel", "powerpoint", "outlook", "adobe", "photoshop", "illustrator",
        "indesign", "jira", "trello", "slack", "zoom", "teams"
    ]
    
    for skill in skills:
        skill_lower = skill.lower()
        
        if skill_lower in soft_skills:
            categories["soft"].append(skill)
        elif skill_lower in languages:
            categories["languages"].append(skill)
        elif skill_lower in tools:
            categories["tools"].append(skill)
        elif any(tech in skill_lower for tech in ["programming", "software", "code", "develop", "engineer"]):
            categories["technical"].append(skill)
        else:
            categories["other"].append(skill)
    
    # Return analysis
    return {
        "count": len(skills),
        "score": score,
        "feedback": feedback,
        "categories": categories
    }


def _analyze_experience(experience: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze experience
    
    Args:
        experience: List of experience items
        
    Returns:
        dict: Experience analysis
    """
    # Score based on number of experiences and total years
    total_years = _calculate_total_experience(experience)
    
    if total_years >= 10:
        score = 100
        level = "senior"
        feedback = "Extensive professional experience"
    elif total_years >= 5:
        score = 80
        level = "mid-level"
        feedback = "Good professional experience"
    elif total_years >= 2:
        score = 60
        level = "junior"
        feedback = "Growing professional experience"
    elif total_years >= 0.5:
        score = 40
        level = "entry-level"
        feedback = "Entry-level experience"
    else:
        score = 20
        level = "beginner"
        feedback = "Limited professional experience"
    
    # Return analysis
    return {
        "count": len(experience),
        "total_years": total_years,
        "level": level,
        "score": score,
        "feedback": feedback
    }


def _analyze_education(education: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze education
    
    Args:
        education: List of education items
        
    Returns:
        dict: Education analysis
    """
    highest_degree = "None"
    institutions = []
    fields_of_study = []
    
    for edu in education:
        if edu.get("institution"):
            institutions.append(edu.get("institution"))
        
        if edu.get("field_of_study"):
            fields_of_study.append(edu.get("field_of_study"))
        
        degree = edu.get("degree", "").lower()
        
        if "phd" in degree or "doctor" in degree:
            highest_degree = "PhD"
        elif "master" in degree and highest_degree not in ["PhD"]:
            highest_degree = "Master's"
        elif "bachelor" in degree and highest_degree not in ["PhD", "Master's"]:
            highest_degree = "Bachelor's"
        elif "associate" in degree and highest_degree not in ["PhD", "Master's", "Bachelor's"]:
            highest_degree = "Associate's"
    
    # Score based on highest degree
    if highest_degree == "PhD":
        score = 100
        feedback = "Advanced academic credentials"
    elif highest_degree == "Master's":
        score = 85
        feedback = "Strong academic credentials"
    elif highest_degree == "Bachelor's":
        score = 70
        feedback = "Good academic credentials"
    elif highest_degree == "Associate's":
        score = 55
        feedback = "Foundational academic credentials"
    else:
        score = 40
        feedback = "Consider adding more educational details"
    
    # Return analysis
    return {
        "count": len(education),
        "highest_degree": highest_degree,
        "institutions": institutions,
        "fields_of_study": fields_of_study,
        "score": score,
        "feedback": feedback
    }


def _get_improvement_suggestions(resume_data: Dict[str, Any], overall_score: float) -> List[str]:
    """
    Get suggestions for improving resume
    
    Args:
        resume_data: Parsed resume data
        overall_score: Overall score
        
    Returns:
        list: Improvement suggestions
    """
    suggestions = []
    
    # Personal info suggestions
    personal_info = resume_data.get("personal_info", {})
    
    if not personal_info.get("email"):
        suggestions.append("Add your email address for contact information")
    
    if not personal_info.get("phone"):
        suggestions.append("Add your phone number for contact information")
    
    # Skills suggestions
    skills = resume_data.get("skills", [])
    
    if len(skills) < 5:
        suggestions.append("Add more skills to showcase your capabilities")
    
    # Experience suggestions
    experience = resume_data.get("experience", [])
    
    if len(experience) == 0:
        suggestions.append("Add your work experience to demonstrate your background")
    else:
        has_descriptions = False
        for exp in experience:
            if exp.get("description") and len(exp.get("description", "")) > 100:
                has_descriptions = True
                break
        
        if not has_descriptions:
            suggestions.append("Add detailed descriptions of your responsibilities and achievements")
    
    # Education suggestions
    education = resume_data.get("education", [])
    
    if len(education) == 0:
        suggestions.append("Add your educational background")
    
    # Projects suggestions
    projects = resume_data.get("projects", [])
    
    if len(projects) == 0:
        suggestions.append("Consider adding relevant projects to showcase your skills")
    
    return suggestions


def _calculate_total_experience(experience: List[Dict[str, Any]]) -> float:
    """
    Calculate total years of experience
    
    Args:
        experience: List of experience items
        
    Returns:
        float: Total years
    """
    total_years = 0
    
    for exp in experience:
        start_date = exp.get("start_date")
        end_date = exp.get("end_date", "present")
        
        if start_date:
            # Parse start date
            if isinstance(start_date, str):
                try:
                    start_year = int(re.search(r"\b(19|20)\d{2}\b", start_date).group(0))
                    start_month = 1  # Default to January if month not specified
                except:
                    continue
            else:
                start_year = start_date.year
                start_month = start_date.month
            
            # Parse end date
            if end_date == "present" or end_date == "current":
                end_year = datetime.now().year
                end_month = datetime.now().month
            else:
                if isinstance(end_date, str):
                    try:
                        end_year = int(re.search(r"\b(19|20)\d{2}\b", end_date).group(0))
                        end_month = 12  # Assume December if month not specified
                    except:
                        continue
                else:
                    end_year = end_date.year
                    end_month = end_date.month
            
            # Calculate duration
            years = end_year - start_year
            months = end_month - start_month
            
            if months < 0:
                years -= 1
                months += 12
            
            total_years += years + (months / 12)
    
    return round(total_years, 1)


def _extract_projects(text: str) -> List[Dict[str, Any]]:
    """
    Extract projects from resume text
    
    Args:
        text: Resume text
        
    Returns:
        list: Projects
    """
    projects = []
    
    # Find projects section
    project_section = None
    sections = extract_sections(text)
    
    for section_name, section_text in sections.items():
        if "project" in section_name.lower():
            project_section = section_text
            break
    
    if not project_section:
        return projects
    
    # Extract projects
    # This would use more sophisticated techniques in a real system
    project_blocks = re.split(r'\n{2,}', project_section)
    
    for block in project_blocks:
        if len(block.strip()) < 20:
            continue
        
        # Extract project name
        name_match = re.search(r'^([A-Za-z0-9 \-_]+)(?:\:|$)', block, re.MULTILINE)
        name = name_match.group(1).strip() if name_match else "Unnamed Project"
        
        # Extract description
        description = block
        
        # Extract technologies
        tech_pattern = r'(?:technologies|tools|tech stack|using|built with)[^\w]+([\w, \-\+\#\.]+)'
        tech_match = re.search(tech_pattern, block, re.IGNORECASE)
        
        technologies = []
        if tech_match:
            tech_text = tech_match.group(1)
            technologies = [t.strip() for t in re.split(r'[,;]', tech_text) if t.strip()]
        
        # Create project
        project = {
            "name": name,
            "description": description,
            "technologies": technologies
        }
        
        projects.append(project)
    
    return projects


def _generate_resume_summary(resume_data: Dict[str, Any]) -> str:
    """
    Generate a summary of the resume
    
    Args:
        resume_data: Parsed resume data
        
    Returns:
        str: Resume summary
    """
    # Extract key information
    personal_info = resume_data.get("personal_info", {})
    name = personal_info.get("name", "")
    
    experience = resume_data.get("experience", [])
    total_experience = _calculate_total_experience(experience)
    
    latest_job = experience[0].get("title", "") if experience else ""
    
    education = resume_data.get("education", [])
    education_summary = _analyze_education(education)
    highest_degree = education_summary.get("highest_degree", "")
    
    skills = resume_data.get("skills", [])
    top_skills = skills[:5] if skills else []
    
    # Generate summary
    summary_parts = []
    
    if name:
        summary_parts.append(f"{name} is")
    else:
        summary_parts.append("The candidate is")
    
    if latest_job:
        summary_parts.append(f"a {latest_job}")
    
    if total_experience > 0:
        if total_experience == 1:
            summary_parts.append(f"with {total_experience} year of experience")
        else:
            summary_parts.append(f"with {total_experience} years of experience")
    
    if highest_degree and highest_degree != "None":
        summary_parts.append(f"holding a {highest_degree} degree")
    
    if top_skills:
        skills_str = ", ".join(top_skills[:-1]) + " and " + top_skills[-1] if len(top_skills) > 1 else top_skills[0]
        summary_parts.append(f"skilled in {skills_str}")
    
    # Join parts
    summary = " ".join(summary_parts)
    
    return summary