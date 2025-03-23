import os
import json
import logging
import math
from typing import Dict, List, Any, Optional, Union
import re
from collections import Counter

# Initialize logging
logger = logging.getLogger(__name__)

# Optional ML dependencies with fallbacks
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    logger.warning("NumPy not available. Using basic scoring techniques.")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logger.warning("Scikit-learn not available. Using basic similarity methods.")

# Load assessment configurations
ASSESSMENT_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                    "data", "assessment", "assessment_config.json")

def calculate_career_score(resume_data: Dict[str, Any], job_title: Optional[str] = None) -> Dict[str, Any]:
    """
    Calculate a comprehensive career readiness score based on resume data.
    
    Args:
        resume_data (Dict[str, Any]): Structured resume data including skills, 
                                     experience, education, etc.
        job_title (Optional[str]): Target job title for specific scoring
        
    Returns:
        Dict[str, Any]: Career readiness assessment with overall score and section scores
    """
    # Initialize overall score and section scores
    assessment = {
        "overall_score": 0,
        "sections": {
            "skills": {"score": 0, "max_score": 30, "feedback": []},
            "experience": {"score": 0, "max_score": 25, "feedback": []},
            "education": {"score": 0, "max_score": 20, "feedback": []},
            "projects": {"score": 0, "max_score": 15, "feedback": []},
            "resume_quality": {"score": 0, "max_score": 10, "feedback": []}
        },
        "insights": [],
        "improvement_areas": [],
        "strengths": []
    }
    
    # Load assessment configuration
    config = _load_assessment_config()
    
    # Calculate section scores
    try:
        # Skills assessment
        skills_assessment = _assess_skills(resume_data, job_title, config)
        assessment["sections"]["skills"].update(skills_assessment)
        
        # Experience assessment
        experience_assessment = _assess_experience(resume_data, job_title, config)
        assessment["sections"]["experience"].update(experience_assessment)
        
        # Education assessment
        education_assessment = _assess_education(resume_data, config)
        assessment["sections"]["education"].update(education_assessment)
        
        # Projects assessment
        projects_assessment = _assess_projects(resume_data, config)
        assessment["sections"]["projects"].update(projects_assessment)
        
        # Resume quality assessment
        quality_assessment = _assess_resume_quality(resume_data, config)
        assessment["sections"]["resume_quality"].update(quality_assessment)
        
        # Calculate overall score
        total_points = sum(section["score"] for section in assessment["sections"].values())
        total_possible = sum(section["max_score"] for section in assessment["sections"].values())
        assessment["overall_score"] = round((total_points / total_possible) * 100)
        
        # Generate insights
        assessment["insights"] = _generate_assessment_insights(assessment, resume_data, job_title)
        
        # Identify improvement areas
        assessment["improvement_areas"] = _identify_improvement_areas(assessment)
        
        # Identify strengths
        assessment["strengths"] = _identify_strengths(assessment)
        
        # Add assessment metadata
        assessment["target_job"] = job_title
        assessment["assessment_timestamp"] = _get_timestamp()
        
        return assessment
        
    except Exception as e:
        logger.error(f"Error in career assessment: {str(e)}")
        # Return basic assessment in case of errors
        return {
            "overall_score": 50,  # Default middle score
            "sections": {
                "skills": {"score": 15, "max_score": 30, "feedback": ["Error processing skills"]},
                "experience": {"score": 12, "max_score": 25, "feedback": ["Error processing experience"]},
                "education": {"score": 10, "max_score": 20, "feedback": ["Error processing education"]},
                "projects": {"score": 7, "max_score": 15, "feedback": ["Error processing projects"]},
                "resume_quality": {"score": 5, "max_score": 10, "feedback": ["Error processing resume quality"]}
            },
            "insights": ["An error occurred during detailed assessment. This is a fallback score."],
            "improvement_areas": ["Ensure your resume data is complete and properly formatted."],
            "strengths": [],
            "assessment_timestamp": _get_timestamp(),
            "error": str(e)
        }

def _load_assessment_config() -> Dict[str, Any]:
    """Load assessment configuration"""
    default_config = {
        "skills": {
            "technical_weight": 0.6,
            "soft_weight": 0.4,
            "min_technical_skills": 5,
            "min_soft_skills": 3,
            "ideal_skill_count": 12
        },
        "experience": {
            "years_weight": 0.4,
            "relevance_weight": 0.6,
            "ideal_experiences": 3,
            "min_experience_years": 1
        },
        "education": {
            "degree_weights": {
                "high_school": 0.3,
                "associate": 0.5,
                "bachelor": 0.8,
                "master": 0.9,
                "phd": 1.0
            },
            "relevance_weight": 0.7,
            "prestige_weight": 0.3
        },
        "projects": {
            "count_weight": 0.3,
            "complexity_weight": 0.4,
            "relevance_weight": 0.3,
            "ideal_project_count": 3
        },
        "resume_quality": {
            "length_weight": 0.3,
            "structure_weight": 0.4,
            "language_weight": 0.3,
            "ideal_length_range": [400, 700]
        },
        "job_specific": {
            "software_engineer": {
                "key_skills": ["programming", "software development", "algorithms", "python", "java", "javascript"]
            },
            "data_scientist": {
                "key_skills": ["machine learning", "data analysis", "statistics", "python", "r", "sql"]
            },
            "ux_designer": {
                "key_skills": ["ui design", "user research", "wireframing", "prototyping", "figma", "sketch"]
            }
            # Add more job-specific criteria as needed
        }
    }
    
    try:
        if os.path.exists(ASSESSMENT_CONFIG_PATH):
            with open(ASSESSMENT_CONFIG_PATH, 'r') as f:
                config = json.load(f)
                logger.info("Loaded assessment configuration")
                return config
    except Exception as e:
        logger.error(f"Error loading assessment config: {str(e)}")
    
    logger.info("Using default assessment configuration")
    return default_config

def _assess_skills(resume_data: Dict[str, Any], job_title: Optional[str], 
                 config: Dict[str, Any]) -> Dict[str, Any]:
    """Assess skills section"""
    result = {"score": 0, "feedback": []}
    
    # Extract skills
    skills = []
    if "skills" in resume_data:
        if isinstance(resume_data["skills"], list):
            skills = resume_data["skills"]
        elif isinstance(resume_data["skills"], str):
            skills = [s.strip() for s in resume_data["skills"].split(",")]
    
    # Check skill count
    skill_count = len(skills)
    
    if skill_count == 0:
        result["score"] = 0
        result["feedback"].append("No skills found. Add relevant skills to your resume.")
        return result
    
    # Get job-specific key skills if job title provided
    job_specific_skills = []
    if job_title:
        normalized_job = _normalize_job_title(job_title)
        for job_key, job_data in config.get("job_specific", {}).items():
            if job_key in normalized_job or normalized_job in job_key:
                job_specific_skills = job_data.get("key_skills", [])
                break
    
    # Calculate basic skill score based on count
    ideal_count = config.get("skills", {}).get("ideal_skill_count", 12)
    count_score = min(1.0, skill_count / ideal_count)
    
    # Analyze skill quality
    technical_skills = []
    soft_skills = []
    
    # Basic classification of technical vs soft skills
    technical_keywords = ["programming", "software", "analysis", "design", "development", 
                         "engineering", "technical", "data", "system", "framework", "language"]
    
    soft_keywords = ["communication", "leadership", "teamwork", "problem solving", 
                    "collaboration", "organization", "creativity", "interpersonal", 
                    "management", "adaptability", "flexibility"]
    
    for skill in skills:
        skill_lower = skill.lower()
        if any(kw in skill_lower for kw in technical_keywords):
            technical_skills.append(skill)
        elif any(kw in skill_lower for kw in soft_keywords):
            soft_skills.append(skill)
        # If not clearly categorized, classify based on length and complexity
        elif len(skill_lower) > 7 or " " in skill_lower:
            technical_skills.append(skill)
        else:
            # Default to technical
            technical_skills.append(skill)
    
    # Calculate technical and soft skill scores
    tech_weight = config.get("skills", {}).get("technical_weight", 0.6)
    soft_weight = config.get("skills", {}).get("soft_weight", 0.4)
    
    min_tech_skills = config.get("skills", {}).get("min_technical_skills", 5)
    min_soft_skills = config.get("skills", {}).get("min_soft_skills", 3)
    
    tech_score = min(1.0, len(technical_skills) / min_tech_skills)
    soft_score = min(1.0, len(soft_skills) / min_soft_skills)
    
    # Job-specific skill score
    job_specific_score = 0
    if job_specific_skills:
        matching_job_skills = sum(1 for s in skills if any(js in s.lower() for js in job_specific_skills))
        job_specific_score = min(1.0, matching_job_skills / len(job_specific_skills))
    
    # Calculate weighted total skill score
    if job_specific_skills:
        weighted_score = (tech_score * tech_weight + 
                        soft_score * soft_weight + 
                        job_specific_score) / 3
    else:
        weighted_score = tech_score * tech_weight + soft_score * soft_weight
    
    # Scale to max score (30 points)
    max_score = 30
    result["score"] = round(weighted_score * max_score)
    
    # Generate feedback
    if skill_count < min_tech_skills + min_soft_skills:
        result["feedback"].append(f"Add more skills. Aim for at least {min_tech_skills} technical skills and {min_soft_skills} soft skills.")
    
    if job_specific_skills and job_specific_score < 0.5:
        missing_job_skills = [js for js in job_specific_skills 
                             if not any(js in s.lower() for s in skills)]
        result["feedback"].append(f"Add more job-specific skills like: {', '.join(missing_job_skills[:3])}.")
    
    if len(soft_skills) < min_soft_skills:
        result["feedback"].append("Include more soft skills like communication, leadership, or teamwork.")
    
    if len(technical_skills) < min_tech_skills:
        result["feedback"].append("Add more technical skills relevant to your field.")
    
    if result["score"] == max_score:
        result["feedback"].append("Excellent skills section!")
    
    return result

def _assess_experience(resume_data: Dict[str, Any], job_title: Optional[str],
                     config: Dict[str, Any]) -> Dict[str, Any]:
    """Assess experience section"""
    result = {"score": 0, "feedback": []}
    
    # Extract experience entries
    experiences = []
    if "experience" in resume_data:
        if isinstance(resume_data["experience"], list):
            experiences = resume_data["experience"]
        elif isinstance(resume_data["experience"], dict):
            experiences = [resume_data["experience"]]
    
    # Check if experience exists
    if not experiences:
        result["score"] = 0
        result["feedback"].append("No work experience found. Add your work history to your resume.")
        return result
    
    # Calculate basic experience score
    ideal_exp_count = config.get("experience", {}).get("ideal_experiences", 3)
    exp_count_score = min(1.0, len(experiences) / ideal_exp_count)
    
    # Calculate years of experience
    total_years = 0
    for exp in experiences:
        # Different ways experience might be structured
        years = 0
        if "duration" in exp:
            # Try to extract years from duration string
            duration = exp["duration"]
            year_match = re.search(r'(\d+)\s*(?:years|year|yr)', duration, re.IGNORECASE)
            if year_match:
                years = int(year_match.group(1))
            else:
                # Try to calculate from start/end dates if available
                if "start_date" in exp and "end_date" in exp:
                    try:
                        start = exp["start_date"]
                        end = exp["end_date"] if exp["end_date"].lower() != "present" else _get_timestamp()[:4]
                        
                        # Extract years from dates
                        start_year = int(re.search(r'\b\d{4}\b', start).group(0))
                        end_year = int(re.search(r'\b\d{4}\b', end).group(0)) if "present" not in end.lower() else int(_get_timestamp()[:4])
                        
                        years = end_year - start_year
                    except:
                        years = 1  # Default if parsing fails
                else:
                    years = 1  # Default assumption
                    
        elif "years" in exp:
            years = int(exp["years"])
        
        total_years += max(0, years)
    
    # Calculate years score
    min_years = config.get("experience", {}).get("min_experience_years", 1)
    years_score = min(1.0, total_years / min_years)
    
    # Calculate relevance to job title
    relevance_score = 0.5  # Default medium relevance
    
    if job_title:
        normalized_job = _normalize_job_title(job_title)
        relevant_exp_count = 0
        
        for exp in experiences:
            # Check if title, description or company contains job keywords
            exp_title = exp.get("title", "").lower()
            exp_description = exp.get("description", "").lower()
            exp_company = exp.get("company", "").lower()
            
            # Check for job title relevance
            job_parts = normalized_job.split()
            
            title_relevance = any(jp in exp_title for jp in job_parts)
            desc_relevance = sum(1 for jp in job_parts if jp in exp_description) / len(job_parts) if job_parts else 0
            
            # Combine relevance metrics
            if title_relevance or desc_relevance > 0.3:
                relevant_exp_count += 1
        
        relevance_score = min(1.0, relevant_exp_count / len(experiences))
    
    # Calculate weighted experience score
    years_weight = config.get("experience", {}).get("years_weight", 0.4)
    relevance_weight = config.get("experience", {}).get("relevance_weight", 0.6)
    
    weighted_score = (years_score * years_weight + 
                     relevance_score * relevance_weight + 
                     exp_count_score) / 3
    
    # Scale to max score (25 points)
    max_score = 25
    result["score"] = round(weighted_score * max_score)
    
    # Generate feedback
    if len(experiences) < ideal_exp_count:
        result["feedback"].append(f"Consider adding more work experiences. Aim for at least {ideal_exp_count} relevant positions.")
    
    if total_years < min_years:
        result["feedback"].append(f"Your total work experience ({total_years} years) is below the recommended minimum ({min_years} years).")
    
    if job_title and relevance_score < 0.5:
        result["feedback"].append(f"Your work experience could be more relevant to {job_title}. Highlight transferable skills.")
    
    if result["score"] == max_score:
        result["feedback"].append("Excellent experience section!")
    
    return result

def _assess_education(resume_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Assess education section"""
    result = {"score": 0, "feedback": []}
    
    # Extract education entries
    education = []
    if "education" in resume_data:
        if isinstance(resume_data["education"], list):
            education = resume_data["education"]
        elif isinstance(resume_data["education"], dict):
            education = [resume_data["education"]]
    
    # Check if education exists
    if not education:
        result["score"] = 0
        result["feedback"].append("No education information found. Add your educational background.")
        return result
    
    # Determine highest degree
    degree_weights = config.get("education", {}).get("degree_weights", {
        "high_school": 0.3,
        "associate": 0.5,
        "bachelor": 0.8,
        "master": 0.9,
        "phd": 1.0
    })
    
    highest_degree_score = 0
    highest_degree = None
    
    for edu in education:
        degree = edu.get("degree", "").lower()
        
        # Check for degree matches
        for degree_type, weight in degree_weights.items():
            if degree_type in degree:
                if weight > highest_degree_score:
                    highest_degree_score = weight
                    highest_degree = degree
                break
    
    # If no explicit degree found, try to infer from institution or other fields
    if highest_degree_score == 0:
        # Check for university or college mentions
        for edu in education:
            institution = edu.get("institution", "").lower()
            if "university" in institution or "college" in institution:
                highest_degree_score = degree_weights.get("bachelor", 0.8)
                highest_degree = "Bachelor's Degree (inferred)"
                break
    
    # Check for educational relevance and prestige
    relevance_score = 0.7  # Default medium-high relevance
    prestige_score = 0.5   # Default medium prestige
    
    # Calculate weighted education score
    relevance_weight = config.get("education", {}).get("relevance_weight", 0.7)
    prestige_weight = config.get("education", {}).get("prestige_weight", 0.3)
    
    weighted_score = (highest_degree_score * 0.6 + 
                     relevance_score * relevance_weight * 0.2 + 
                     prestige_score * prestige_weight * 0.2)
    
    # Scale to max score (20 points)
    max_score = 20
    result["score"] = round(weighted_score * max_score)
    
    # Generate feedback
    if highest_degree_score < 0.8:
        result["feedback"].append("Consider pursuing higher education or relevant certifications.")
    
    if highest_degree_score == 0:
        result["feedback"].append("Add your degree type (Associate's, Bachelor's, Master's, etc.).")
    
    if len(education) < 2:
        result["feedback"].append("Consider adding additional educational experiences (certifications, workshops, etc.).")
    
    if result["score"] == max_score:
        result["feedback"].append("Excellent education section!")
    
    return result

def _assess_projects(resume_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Assess projects section"""
    result = {"score": 0, "feedback": []}
    
    # Extract projects
    projects = []
    if "projects" in resume_data:
        if isinstance(resume_data["projects"], list):
            projects = resume_data["projects"]
        elif isinstance(resume_data["projects"], dict):
            projects = [resume_data["projects"]]
    
    # Check if projects exist
    if not projects:
        result["score"] = 0
        result["feedback"].append("No projects found. Add relevant projects to showcase your skills.")
        return result
    
    # Calculate project count score
    ideal_project_count = config.get("projects", {}).get("ideal_project_count", 3)
    count_score = min(1.0, len(projects) / ideal_project_count)
    
    # Estimate project complexity
    complexity_scores = []
    
    for project in projects:
        description = project.get("description", "")
        tech_stack = project.get("technologies", "")
        
        if isinstance(tech_stack, list):
            tech_stack = ", ".join(tech_stack)
        
        # Check description length and complexity indicators
        desc_length = len(description)
        complexity_indicators = ["complex", "advanced", "challenging", "implemented", 
                                "developed", "architected", "designed", "optimized"]
        
        tech_count = len(tech_stack.split(",")) if tech_stack else 0
        
        # Calculate complexity score based on indicators and tech stack
        indicator_count = sum(1 for indicator in complexity_indicators if indicator in description.lower())
        complexity_score = min(1.0, (indicator_count / 5) + (tech_count / 5) + (desc_length / 500))
        
        complexity_scores.append(complexity_score)
    
    # Calculate average complexity
    avg_complexity = sum(complexity_scores) / len(complexity_scores) if complexity_scores else 0
    
    # Calculate relevance (simple estimate)
    relevance_score = 0.7  # Default to medium-high relevance
    
    # Calculate weighted project score
    count_weight = config.get("projects", {}).get("count_weight", 0.3)
    complexity_weight = config.get("projects", {}).get("complexity_weight", 0.4)
    relevance_weight = config.get("projects", {}).get("relevance_weight", 0.3)
    
    weighted_score = (count_score * count_weight + 
                     avg_complexity * complexity_weight + 
                     relevance_score * relevance_weight)
    
    # Scale to max score (15 points)
    max_score = 15
    result["score"] = round(weighted_score * max_score)
    
    # Generate feedback
    if len(projects) < ideal_project_count:
        result["feedback"].append(f"Add more projects. Aim for at least {ideal_project_count} showcase projects.")
    
    if avg_complexity < 0.5:
        result["feedback"].append("Enhance your project descriptions with technical details and achievements.")
    
    if result["score"] < 10:
        result["feedback"].append("Add more complex projects that demonstrate advanced skills.")
    
    if result["score"] == max_score:
        result["feedback"].append("Excellent projects section!")
    
    return result

def _assess_resume_quality(resume_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Assess overall resume quality"""
    result = {"score": 0, "feedback": []}
    
    # Extract resume text
    resume_text = ""
    if "raw_text" in resume_data:
        resume_text = resume_data["raw_text"]
    else:
        # Try to reconstruct from sections
        sections = ["summary", "skills", "experience", "education", "projects"]
        for section in sections:
            if section in resume_data:
                section_data = resume_data[section]
                
                if isinstance(section_data, str):
                    resume_text += section_data + "\n\n"
                elif isinstance(section_data, list):
                    if all(isinstance(item, str) for item in section_data):
                        resume_text += "\n".join(section_data) + "\n\n"
                    else:
                        # Complex data structure, extract text fields
                        for item in section_data:
                            if isinstance(item, dict):
                                for _, value in item.items():
                                    if isinstance(value, str):
                                        resume_text += value + "\n"
                        resume_text += "\n\n"
                elif isinstance(section_data, dict):
                    for _, value in section_data.items():
                        if isinstance(value, str):
                            resume_text += value + "\n"
                    resume_text += "\n\n"
    
    # Calculate length score
    word_count = len(resume_text.split())
    ideal_range = config.get("resume_quality", {}).get("ideal_length_range", [400, 700])
    
    if word_count < ideal_range[0]:
        length_score = word_count / ideal_range[0]
    elif word_count > ideal_range[1]:
        # Penalize for being too long, but less severely
        overage = (word_count - ideal_range[1]) / ideal_range[1]
        length_score = max(0.5, 1 - overage)
    else:
        length_score = 1.0
    
    # Calculate structure score
    structure_score = 0.5  # Default moderate structure
    
    # Count the number of sections present
    core_sections = ["summary", "skills", "experience", "education"]
    present_sections = sum(1 for section in core_sections if section in resume_data)
    section_ratio = present_sections / len(core_sections)
    
    # Higher structure score if more core sections are present
    structure_score = min(1.0, section_ratio + 0.2)
    
    # Calculate language quality score (basic estimation)
    language_score = 0.7  # Default good language
    
    # Calculate weighted resume quality score
    length_weight = config.get("resume_quality", {}).get("length_weight", 0.3)
    structure_weight = config.get("resume_quality", {}).get("structure_weight", 0.4)
    language_weight = config.get("resume_quality", {}).get("language_weight", 0.3)
    
    weighted_score = (length_score * length_weight + 
                     structure_score * structure_weight + 
                     language_score * language_weight)
    
    # Scale to max score (10 points)
    max_score = 10
    result["score"] = round(weighted_score * max_score)
    
    # Generate feedback
    if word_count < ideal_range[0]:
        result["feedback"].append(f"Your resume is too short ({word_count} words). Aim for {ideal_range[0]}-{ideal_range[1]} words.")
    elif word_count > ideal_range[1]:
        result["feedback"].append(f"Your resume is too long ({word_count} words). Try to condense it to {ideal_range[0]}-{ideal_range[1]} words.")
    
    if section_ratio < 1.0:
        missing_sections = [s for s in core_sections if s not in resume_data]
        result["feedback"].append(f"Add missing sections: {', '.join(missing_sections)}.")
    
    if result["score"] == max_score:
        result["feedback"].append("Excellent resume structure and quality!")
    
    return result

def _generate_assessment_insights(assessment: Dict[str, Any], 
                                resume_data: Dict[str, Any],
                                job_title: Optional[str]) -> List[str]:
    """Generate overall assessment insights"""
    insights = []
    
    # Overall score insights
    overall_score = assessment["overall_score"]
    
    if overall_score >= 90:
        insights.append("Your career profile is excellent! You have a very strong foundation for job success.")
    elif overall_score >= 75:
        insights.append("Your career profile is strong. With a few improvements, you'll be highly competitive.")
    elif overall_score >= 60:
        insights.append("Your career profile is good but has room for improvement in several key areas.")
    elif overall_score >= 40:
        insights.append("Your career profile needs significant improvement. Focus on the recommended areas.")
    else:
        insights.append("Your career profile requires extensive development. Begin with the most critical areas identified.")
    
    # Section-specific insights
    sections = assessment["sections"]
    
    # Skills insights
    skills_score = sections["skills"]["score"]
    skills_max = sections["skills"]["max_score"]
    skills_ratio = skills_score / skills_max
    
    if skills_ratio < 0.5:
        insights.append("Your skills section is underdeveloped. This is a critical area to improve.")
    elif "skills" in resume_data and len(resume_data["skills"]) > 15:
        insights.append("You have listed many skills. Consider focusing on your strongest and most relevant ones.")
    
    # Experience insights
    exp_score = sections["experience"]["score"]
    exp_max = sections["experience"]["max_score"]
    exp_ratio = exp_score / exp_max
    
    if exp_ratio < 0.4:
        insights.append("Your work experience needs strengthening. Consider internships or volunteer work.")
    elif job_title and exp_ratio < 0.7:
        insights.append(f"Your work experience could be better aligned with your target role of {job_title}.")
    
    # Education insights
    edu_score = sections["education"]["score"]
    edu_max = sections["education"]["max_score"]
    edu_ratio = edu_score / edu_max
    
    if edu_ratio < 0.5:
        insights.append("Consider additional education or certification to strengthen your profile.")
    
    # Balance insights
    section_scores = [(name, section["score"] / section["max_score"]) 
                     for name, section in sections.items()]
    
    # Check for balance
    score_values = [score for _, score in section_scores]
    score_variance = max(score_values) - min(score_values)
    
    if score_variance > 0.4:
        weak_sections = [name for name, score in section_scores if score == min(score_values)]
        insights.append(f"Your career profile is unbalanced. Focus on improving: {', '.join(weak_sections)}.")
    
    # Job-specific insight
    if job_title:
        insights.append(f"For a {job_title} role, pay special attention to technical skills and relevant experience.")
    
    return insights

def _identify_improvement_areas(assessment: Dict[str, Any]) -> List[str]:
    """Identify key areas for improvement"""
    improvements = []
    
    # Extract section scores and feedback
    sections = assessment["sections"]
    
    # Identify the weakest sections
    section_scores = [(name, section["score"] / section["max_score"]) 
                     for name, section in sections.items()]
    
    sorted_sections = sorted(section_scores, key=lambda x: x[1])
    
    # Add feedback from the weakest sections
    for section_name, score_ratio in sorted_sections:
        if score_ratio < 0.7:  # Only include sections that need improvement
            section = sections[section_name]
            for feedback in section["feedback"]:
                if "excellent" not in feedback.lower():  # Skip positive feedback
                    improvements.append(feedback)
    
    # Limit to top 5 improvement areas
    return improvements[:5]

def _identify_strengths(assessment: Dict[str, Any]) -> List[str]:
    """Identify key strengths"""
    strengths = []
    
    # Extract section scores
    sections = assessment["sections"]
    
    # Identify the strongest sections
    section_scores = [(name, section["score"] / section["max_score"]) 
                     for name, section in sections.items()]
    
    sorted_sections = sorted(section_scores, key=lambda x: x[1], reverse=True)
    
    # Add strengths based on section scores
    for section_name, score_ratio in sorted_sections:
        if score_ratio >= 0.8:  # Only include strong sections
            if section_name == "skills":
                strengths.append("Strong skills profile that demonstrates technical competence")
            elif section_name == "experience":
                strengths.append("Solid work experience that showcases professional development")
            elif section_name == "education":
                strengths.append("Excellent educational background")
            elif section_name == "projects":
                strengths.append("Impressive project portfolio demonstrating practical skills")
            elif section_name == "resume_quality":
                strengths.append("Well-structured resume with clear presentation")
    
    # If overall score is high, add general strength
    if assessment["overall_score"] >= 80:
        strengths.append("Well-rounded career profile with good balance across all areas")
    
    # Limit to 3 strengths
    return strengths[:3]

def _normalize_job_title(job_title: str) -> str:
    """Normalize job title for comparison"""
    job_title = job_title.lower().strip()
    
    # Remove common prefixes
    prefixes = ["senior", "junior", "lead", "principal", "chief", "head"]
    for prefix in prefixes:
        if job_title.startswith(prefix):
            job_title = job_title[len(prefix):].strip()
    
    # Remove common suffixes
    suffixes = ["specialist", "analyst", "associate", "consultant", "intern"]
    for suffix in suffixes:
        if job_title.endswith(suffix):
            job_title = job_title[:-len(suffix)].strip()
    
    return job_title

def _get_timestamp() -> str:
    """Get current timestamp in ISO format"""
    from datetime import datetime
    return datetime.now().isoformat()