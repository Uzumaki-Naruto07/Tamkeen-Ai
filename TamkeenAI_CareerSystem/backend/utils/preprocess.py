"""
Preprocessing Utility Module

This module provides utilities for text preprocessing, normalization, and extraction
used across various components of the system.
"""

import os
import re
import json
import logging
import string
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import settings
from backend.config.settings import SKILLS_FILE, EDUCATION_PATTERNS, JOB_TITLE_PATTERNS

# Setup logger
logger = logging.getLogger(__name__)

# Try to import optional dependencies
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer
    
    # Ensure NLTK resources are downloaded
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt')
    
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords')
    
    try:
        nltk.data.find('corpora/wordnet')
    except LookupError:
        nltk.download('wordnet')
    
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    logging.warning("NLTK not installed. Some NLP functions will be unavailable. Install with: pip install nltk")


def clean_text(text: str) -> str:
    """
    Clean and normalize text
    
    Args:
        text: Input text
        
    Returns:
        str: Cleaned text
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace multiple whitespace with single space
    text = re.sub(r'\s+', ' ', text)
    
    # Replace tabs and newlines with spaces
    text = re.sub(r'[\t\n\r]+', ' ', text)
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Remove phone numbers
    text = re.sub(r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}', '', text)
    
    # Replace punctuation with space (except for + and # in technical terms)
    for p in string.punctuation.replace('+', '').replace('#', ''):
        text = text.replace(p, ' ')
    
    # Remove extra spaces again
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def normalize_skill(skill: str) -> str:
    """
    Normalize skill name
    
    Args:
        skill: Skill name
        
    Returns:
        str: Normalized skill name
    """
    if not skill:
        return ""
    
    # Clean skill text
    normalized = skill.lower().strip()
    
    # Remove common prefixes
    for prefix in ["knowledge of ", "experience with ", "proficient in ", "skilled in "]:
        if normalized.startswith(prefix):
            normalized = normalized[len(prefix):]
    
    # Remove common suffixes
    for suffix in [" experience", " knowledge", " skills", " proficiency"]:
        if normalized.endswith(suffix):
            normalized = normalized[:-len(suffix)]
    
    # Handle special cases
    replacements = {
        "js": "javascript",
        "ts": "typescript",
        "py": "python",
        "c/c++": "c++",
        "reactjs": "react",
        "react.js": "react",
        "node.js": "nodejs",
        "vuejs": "vue",
        "vue.js": "vue",
        "aws": "amazon web services",
        "ml": "machine learning",
        "ai": "artificial intelligence",
        "dl": "deep learning",
        "oop": "object oriented programming"
    }
    
    # Apply replacements
    for old, new in replacements.items():
        if normalized == old:
            normalized = new
    
    return normalized.strip()


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract skills from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted skills
    """
    try:
        # Clean text
        clean = clean_text(text)
        
        # Load skills list if available
        skills_list = []
        try:
            if os.path.exists(SKILLS_FILE):
                with open(SKILLS_FILE, 'r') as f:
                    skills_list = json.load(f)
        except Exception as e:
            logger.error(f"Error loading skills file: {str(e)}")
        
        # Find skills in text
        found_skills = []
        
        # Match skills from list
        if skills_list:
            for skill in skills_list:
                # Check if skill is in text
                skill_pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                if re.search(skill_pattern, clean):
                    found_skills.append(skill)
        
        # Extract additional skills using patterns
        skill_patterns = [
            r'(?:proficient|experience|skilled) (?:in|with) ([^.,;:]+)',
            r'knowledge of ([^.,;:]+)',
            r'expertise in ([^.,;:]+)'
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, clean)
            for match in matches:
                skill = normalize_skill(match.strip())
                if skill and skill not in found_skills:
                    found_skills.append(skill)
        
        # Extract skills from bullet points
        bullet_pattern = r'[•\-\*]\s+([^•\-\*\n]+)'
        bullet_matches = re.findall(bullet_pattern, text)
        for match in bullet_matches:
            if 3 < len(match) < 50:  # Filter by reasonable skill description length
                skill = normalize_skill(match.strip())
                if skill and skill not in found_skills:
                    found_skills.append(skill)
        
        return found_skills
    
    except Exception as e:
        logger.error(f"Error extracting skills: {str(e)}")
        return []


def normalize_job_title(title: str) -> str:
    """
    Normalize job title
    
    Args:
        title: Job title
        
    Returns:
        str: Normalized job title
    """
    if not title:
        return ""
    
    # Clean title text
    normalized = title.lower().strip()
    
    # Handle common abbreviations and variations
    replacements = {
        "sr.": "senior",
        "jr.": "junior",
        "mgr": "manager",
        "eng": "engineer",
        "dev": "developer",
        "admin": "administrator",
        "architect": "architect",
        "specialist": "specialist",
        "analyst": "analyst",
        "tech": "technician",
        "frontend": "front end",
        "backend": "back end",
        "fullstack": "full stack"
    }
    
    # Apply replacements
    for old, new in replacements.items():
        if old in normalized:
            normalized = normalized.replace(old, new)
    
    return normalized.strip()


def extract_education_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract education information from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted education items
    """
    try:
        # Clean text
        clean = clean_text(text)
        
        # Find education section
        education_section = None
        
        # Common section headers
        section_headers = {
            "education": ["education", "academic background", "educational background", "academic qualifications"],
            "experience": ["experience", "work experience", "employment history", "professional experience"],
            "skills": ["skills", "technical skills", "core competencies", "qualifications"],
            "projects": ["projects", "professional projects", "academic projects"],
            "certifications": ["certifications", "certificates", "professional certifications"],
        }
        
        # Split text into sections
        sections = {}
        current_section = "header"
        lines = text.split("\n")
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line is a section header
            found_section = None
            for section, headers in section_headers.items():
                for header in headers:
                    if re.search(r'\b' + re.escape(header) + r'\b', line.lower()):
                        found_section = section
                        break
                if found_section:
                    break
            
            if found_section:
                current_section = found_section
                sections[current_section] = []
            else:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(line)
        
        # Get education section
        if "education" in sections:
            education_section = "\n".join(sections["education"])
        
        if not education_section:
            # Try to find education from whole text
            education_section = text
        
        # Extract education using patterns
        education_items = []
        
        # Define patterns for degrees
        degree_patterns = [
            r"(bachelor|bachelor's|bachelors|bs|ba|bsc|btech|b\.tech|undergraduate)",
            r"(master|master's|masters|ms|msc|mtech|m\.tech|mba|graduate)",
            r"(phd|ph\.d|doctorate|doctoral)",
            r"(associate|associate's|associates|diploma)"
        ]
        
        # Define patterns for fields of study
        field_patterns = [
            r"(computer science|cs|software engineering|information technology|it)",
            r"(business administration|business|management|finance|accounting|economics)",
            r"(electrical engineering|ee|mechanical engineering|civil engineering|engineering)",
            r"(mathematics|math|physics|chemistry|biology|science)",
            r"(arts|humanities|psychology|sociology|literature|history)"
        ]
        
        # Define patterns for institutions
        institution_patterns = [
            r"(university|college|institute|school) of ([a-z ]+)",
            r"([a-z ]+) (university|college|institute|school)",
            r"([a-z ]+) (university|college|institute|school) of ([a-z ]+)"
        ]
        
        # Define patterns for dates
        date_patterns = [
            r"(19|20)\d{2}\s*-\s*(19|20)\d{2}",
            r"(19|20)\d{2}\s*to\s*(19|20)\d{2}",
            r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (19|20)\d{2}"
        ]
        
        # Special case: extract education blocks using a combined pattern
        education_blocks = re.findall(r'(' + '|'.join(degree_patterns) + r').{0,30}(' + '|'.join(field_patterns) + r').{0,50}(' + '|'.join(institution_patterns) + r')', education_section, re.IGNORECASE)
        
        for block in education_blocks:
            # Process each block
            block_text = ' '.join(block)
            
            # Extract degree
            degree = None
            for pattern in degree_patterns:
                degree_match = re.search(pattern, block_text, re.IGNORECASE)
                if degree_match:
                    degree = degree_match.group(0)
                    break
            
            # Extract field
            field = None
            for pattern in field_patterns:
                field_match = re.search(pattern, block_text, re.IGNORECASE)
                if field_match:
                    field = field_match.group(0)
                    break
            
            # Extract institution
            institution = None
            for pattern in institution_patterns:
                institution_match = re.search(pattern, block_text, re.IGNORECASE)
                if institution_match:
                    institution = institution_match.group(0)
                    break
            
            # Extract dates
            dates = []
            for pattern in date_patterns:
                date_matches = re.findall(pattern, block_text, re.IGNORECASE)
                for date_match in date_matches:
                    if isinstance(date_match, tuple):
                        date = ' '.join(date_match)
                    else:
                        date = date_match
                    dates.append(date)
            
            # Create education item
            if degree or field or institution:
                education_item = {
                    "degree": degree,
                    "field": field,
                    "institution": institution
                }
                
                if dates:
                    education_item["dates"] = dates[0]
                
                education_items.append(education_item)
        
        # If no blocks found, try simple patterns
        if not education_items:
            # Extract each component separately
            degrees = []
            for pattern in degree_patterns:
                degree_matches = re.findall(pattern, education_section, re.IGNORECASE)
                degrees.extend(degree_matches)
            
            fields = []
            for pattern in field_patterns:
                field_matches = re.findall(pattern, education_section, re.IGNORECASE)
                fields.extend(field_matches)
            
            institutions = []
            for pattern in institution_patterns:
                institution_matches = re.findall(pattern, education_section, re.IGNORECASE)
                for match in institution_matches:
                    if isinstance(match, tuple):
                        institution = ' '.join(match)
                    else:
                        institution = match
                    institutions.append(institution)
            
            dates = []
            for pattern in date_patterns:
                date_matches = re.findall(pattern, education_section, re.IGNORECASE)
                for match in date_matches:
                    if isinstance(match, tuple):
                        date = ' '.join(match)
                    else:
                        date = match
                    dates.append(date)
            
            # Create education items
            if len(degrees) > 0:
                for i in range(min(len(degrees), max(len(fields), len(institutions)))):
                    education_item = {
                        "degree": degrees[i] if i < len(degrees) else None,
                        "field": fields[i] if i < len(fields) else None,
                        "institution": institutions[i] if i < len(institutions) else None
                    }
                    
                    if i < len(dates):
                        education_item["dates"] = dates[i]
                    
                    education_items.append(education_item)
            
        return education_items
    
    except Exception as e:
        logger.error(f"Error extracting education: {str(e)}")
        return []


def extract_experience_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract work experience information from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted experience items
    """
    try:
        # Clean text
        clean = text.strip()
        
        # Find experience section
        experience_section = None
        
        # Common section headers
        section_headers = {
            "education": ["education", "academic background", "educational background", "academic qualifications"],
            "experience": ["experience", "work experience", "employment history", "professional experience"],
            "skills": ["skills", "technical skills", "core competencies", "qualifications"],
            "projects": ["projects", "professional projects", "academic projects"],
            "certifications": ["certifications", "certificates", "professional certifications"],
        }
        
        # Split text into sections
        sections = {}
        current_section = "header"
        lines = text.split("\n")
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line is a section header
            found_section = None
            for section, headers in section_headers.items():
                for header in headers:
                    if re.search(r'\b' + re.escape(header) + r'\b', line.lower()):
                        found_section = section
                        break
                if found_section:
                    break
            
            if found_section:
                current_section = found_section
                sections[current_section] = []
            else:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(line)
        
        # Get experience section
        if "experience" in sections:
            experience_section = "\n".join(sections["experience"])
        
        if not experience_section:
            # Try to find experience from whole text
            experience_section = text
        
        # Extract experience using patterns
        experience_items = []
        
        # Define patterns for job titles
        title_patterns = [
            r"(senior|lead|staff|principal|junior) (software|systems|data|frontend|backend|full stack|mobile|ios|android|devops|cloud|network|security) (engineer|developer|architect|administrator|specialist|analyst)",
            r"(software|systems|data|frontend|backend|full stack|mobile|ios|android|devops|cloud|network|security) (engineer|developer|architect|administrator|specialist|analyst)",
            r"(engineering|product|project|program|technical|team) (manager|lead|director|head)",
            r"(chief|vp|director|head) of (technology|engineering|product|information|technical)",
            r"(cto|cio|ceo|cpo|vp)"
        ]
        
        # Define patterns for companies
        company_patterns = [
            r"(?:at|with|for) ([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*)",
            r"([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*) (?:Inc\.|LLC|Ltd\.|Corp\.|Corporation|Company)",
            r"(?:at|with|for) ([A-Z][A-Za-z]+(?:[.,\-&]\s?[A-Z][A-Za-z]+)+)"
        ]
        
        # Define patterns for dates
        date_patterns = [
            r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2} (?:-|to|–) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2}",
            r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2} (?:-|to|–) (?:Present|Current)",
            r"(19|20)\d{2} (?:-|to|–) (19|20)\d{2}",
            r"(19|20)\d{2} (?:-|to|–) (?:Present|Current)"
        ]
        
        # Split experience section into blocks
        # Try to find blocks that start with dates or titles
        experience_blocks = []
        block_start_pattern = r'(' + '|'.join(date_patterns) + '|' + '|'.join(title_patterns) + ')'
        block_matches = re.finditer(block_start_pattern, experience_section, re.IGNORECASE)
        
        prev_start = 0
        prev_match = None
        
        for match in block_matches:
            if prev_match:
                block_text = experience_section[prev_start:match.start()].strip()
                experience_blocks.append(block_text)
            
            prev_start = match.start()
            prev_match = match
        
        # Add the last block
        if prev_match:
            block_text = experience_section[prev_start:].strip()
            experience_blocks.append(block_text)
        
        # If we couldn't find blocks, just use the entire section
        if not experience_blocks:
            experience_blocks = [experience_section]
        
        # Process each block
        for block in experience_blocks:
            # Skip short blocks (likely not an experience item)
            if len(block) < 50:
                continue
            
            # Extract title
            title = None
            for pattern in title_patterns:
                title_match = re.search(pattern, block, re.IGNORECASE)
                if title_match:
                    title = title_match.group(0)
                    break
            
            # Extract company
            company = None
            for pattern in company_patterns:
                company_match = re.search(pattern, block, re.IGNORECASE)
                if company_match:
                    company = company_match.group(1)
                    break
            
            # Extract dates
            start_date = None
            end_date = None
            for pattern in date_patterns:
                date_match = re.search(pattern, block, re.IGNORECASE)
                if date_match:
                    date_text = date_match.group(0)
                    
                    # Parse date range
                    if "present" in date_text.lower() or "current" in date_text.lower():
                        # Extract start date
                        start_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2}|^(19|20)\d{2}', date_text, re.IGNORECASE)
                        if start_match:
                            start_date = start_match.group(0)
                        
                        end_date = "Present"
                    else:
                        # Extract start and end dates
                        dates = re.findall(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2}|(19|20)\d{2}', date_text, re.IGNORECASE)
                        if len(dates) >= 2:
                            if isinstance(dates[0], tuple):
                                start_date = ' '.join(filter(None, dates[0]))
                            else:
                                start_date = dates[0]
                            
                            if isinstance(dates[1], tuple):
                                end_date = ' '.join(filter(None, dates[1]))
                            else:
                                end_date = dates[1]
                    
                    break
            
            # Extract description
            description = block
            
            # Clean description
            if title:
                description = description.replace(title, "", 1)
            if company:
                description = description.replace(company, "", 1)
            if start_date:
                description = description.replace(start_date, "", 1)
            if end_date and end_date != "Present":
                description = description.replace(end_date, "", 1)
            
            # Clean up description
            description = re.sub(r'\s+', ' ', description).strip()
            description = re.sub(r'^[^a-zA-Z0-9]*', '', description)  # Remove non-alphanumeric chars at start
            
            # Extract responsibilities
            responsibilities = []
            bullet_pattern = r'[•\-\*]\s+([^•\-\*\n]+)'
            bullet_matches = re.findall(bullet_pattern, block)
            if bullet_matches:
                responsibilities = [match.strip() for match in bullet_matches]
            
            # Create experience item
            if title or company:
                experience_item = {
                    "title": title,
                    "company": company,
                    "start_date": start_date,
                    "end_date": end_date,
                    "description": description
                }
                
                if responsibilities:
                    experience_item["responsibilities"] = responsibilities
                
                experience_items.append(experience_item)
        
        return experience_items
    
    except Exception as e:
        logger.error(f"Error extracting experience: {str(e)}")
        return []


def extract_personal_info_from_text(text: str) -> Dict[str, Any]:
    """
    Extract personal information from text
    
    Args:
        text: Input text
        
    Returns:
        dict: Extracted personal information
    """
    try:
        # Initialize result
        personal_info = {}
        
        # Extract name
        name_patterns = [
            r'^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)',  # Name at start of resume
            r'(?:name:?\s+)([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)',  # Name with label
            r'^(?:curriculum vitae|resume|cv)\s+of\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)'  # Name with CV/resume label
        ]
        
        for pattern in name_patterns:
            name_match = re.search(pattern, text)
            if name_match:
                personal_info["name"] = name_match.group(1).strip()
                break
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            personal_info["email"] = email_match.group(0)
        
        # Extract phone
        phone_patterns = [
            r'\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',  # US/Canada format
            r'\b\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b'  # International format
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                personal_info["phone"] = phone_match.group(0)
                break
        
        # Extract location
        location_patterns = [
            r'(?:location|address|residing in|based in):\s+([^,\n]+(?:,\s+[^,\n]+)?)',
            r'\b([A-Z][a-z]+(?:,\s+[A-Z]{2})?(?:,\s+\d{5})?)\b'  # City, State ZIP
        ]
        
        for pattern in location_patterns:
            location_match = re.search(pattern, text, re.IGNORECASE)
            if location_match:
                personal_info["location"] = location_match.group(1).strip()
                break
        
        # Extract LinkedIn profile
        linkedin_patterns = [
            r'(?:linkedin|linkedin\.com)\/in\/([a-z0-9_-]+)',
            r'(?:linkedin|linkedin\.com).{0,5}(?:profile|\/in).{0,5}([a-z0-9_-]+)'
        ]
        
        for pattern in linkedin_patterns:
            linkedin_match = re.search(pattern, text, re.IGNORECASE)
            if linkedin_match:
                personal_info["linkedin"] = "linkedin.com/in/" + linkedin_match.group(1).strip()
                break
        
        # Extract website/portfolio
        website_patterns = [
            r'(?:website|portfolio|blog):\s+(https?:\/\/[^\s,]+)',
            r'(https?:\/\/(?:www\.)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?:\/[^\s]*)?)'
        ]
        
        for pattern in website_patterns:
            website_match = re.search(pattern, text, re.IGNORECASE)
            if website_match:
                personal_info["website"] = website_match.group(1).strip()
                break
        
        return personal_info
    
    except Exception as e:
        logger.error(f"Error extracting personal info: {str(e)}")
        return {}


def extract_sections(text: str) -> Dict[str, str]:
    """
    Extract sections from text
    
    Args:
        text: Input text
        
    Returns:
        dict: Extracted sections
    """
    try:
        # Common section headers
        section_headers = {
            "education": ["education", "academic background", "educational background", "academic qualifications"],
            "experience": ["experience", "work experience", "employment history", "professional experience"],
            "skills": ["skills", "technical skills", "core competencies", "qualifications"],
            "projects": ["projects", "professional projects", "academic projects"],
            "certifications": ["certifications", "certificates", "professional certifications"],
        }
        
        # Split text into sections
        sections = {}
        current_section = "header"
        lines = text.split("\n")
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line is a section header
            found_section = None
            for section, headers in section_headers.items():
                for header in headers:
                    if re.search(r'\b' + re.escape(header) + r'\b', line.lower()):
                        found_section = section
                        break
                if found_section:
                    break
            
            if found_section:
                current_section = found_section
                sections[current_section] = []
            else:
                if current_section not in sections:
                    sections[current_section] = []
                sections[current_section].append(line)
        
        # Convert lists to strings
        section_texts = {}
        for section, lines in sections.items():
            section_texts[section] = "\n".join(lines)
        
        return section_texts
    
    except Exception as e:
        logger.error(f"Error extracting sections: {str(e)}")
        return {}


def extract_dates(text: str) -> List[str]:
    """
    Extract dates from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted dates
    """
    try:
        date_patterns = [
            r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2}",
            r"(19|20)\d{2}-(19|20)\d{2}",
            r"(19|20)\d{2} to (19|20)\d{2}",
            r"(19|20)\d{2} - (19|20)\d{2}",
            r"(19|20)\d{2} – (19|20)\d{2}",
            r"(19|20)\d{2} to Present",
            r"(19|20)\d{2} - Present",
            r"(19|20)\d{2} – Present"
        ]
        
        # Extract dates
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            if matches:
                for match in matches:
                    if isinstance(match, tuple):
                        date = ' '.join(match)
                    else:
                        date = match
                    dates.append(date)
        
        return dates
    
    except Exception as e:
        logger.error(f"Error extracting dates: {str(e)}")
        return []


def extract_job_titles(text: str) -> List[str]:
    """
    Extract job titles from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted job titles
    """
    try:
        title_patterns = [
            r"(senior|lead|staff|principal|junior) (software|systems|data|frontend|backend|full stack|mobile|ios|android|devops|cloud|network|security) (engineer|developer|architect|administrator|specialist|analyst)",
            r"(software|systems|data|frontend|backend|full stack|mobile|ios|android|devops|cloud|network|security) (engineer|developer|architect|administrator|specialist|analyst)",
            r"(engineering|product|project|program|technical|team) (manager|lead|director|head)",
            r"(chief|vp|director|head) of (technology|engineering|product|information|technical)",
            r"(cto|cio|ceo|cpo|vp)"
        ]
        
        # Extract titles
        titles = []
        for pattern in title_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                for match in matches:
                    if isinstance(match, tuple):
                        title = ' '.join(match)
                    else:
                        title = match
                    titles.append(title)
        
        # Normalize and deduplicate
        normalized_titles = []
        for title in titles:
            normalized = normalize_job_title(title)
            if normalized and normalized not in normalized_titles:
                normalized_titles.append(normalized)
        
        return normalized_titles
    
    except Exception as e:
        logger.error(f"Error extracting job titles: {str(e)}")
        return []


def extract_companies(text: str) -> List[str]:
    """
    Extract company names from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted company names
    """
    try:
        company_patterns = [
            r"(?:at|with|for) ([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*)",
            r"([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*) (?:Inc\.|LLC|Ltd\.|Corp\.|Corporation|Company)",
            r"(?:at|with|for) ([A-Z][A-Za-z]+(?:[.,\-&]\s?[A-Z][A-Za-z]+)+)"
        ]
        
        # Extract companies
        companies = []
        for pattern in company_patterns:
            matches = re.findall(pattern, text)
            companies.extend(matches)
        
        # Deduplicate
        companies = list(set(companies))
        
        return companies
    
    except Exception as e:
        logger.error(f"Error extracting companies: {str(e)}")
        return []


def extract_locations(text: str) -> List[str]:
    """
    Extract locations from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted locations
    """
    try:
        location_patterns = [
            r"(?:in|at) ([A-Z][a-z]+(?:,\s+[A-Z]{2})?)",  # City, State
            r"([A-Z][a-z]+(?:,\s+[A-Z]{2})(?:,\s+\d{5})?)",  # City, State ZIP
            r"(?:relocated to|based in|located in) ([A-Z][a-z]+(?:,\s+[A-Z]{2})?)"  # Descriptive location
        ]
        
        # Extract locations
        locations = []
        for pattern in location_patterns:
            matches = re.findall(pattern, text)
            locations.extend(matches)
        
        # Deduplicate
        locations = list(set(locations))
        
        return locations
    
    except Exception as e:
        logger.error(f"Error extracting locations: {str(e)}")
        return []


def extract_entities(text: str) -> Dict[str, List[str]]:
    """
    Extract named entities from text
    
    Args:
        text: Input text
        
    Returns:
        dict: Extracted entities by type
    """
    try:
        entities = {
            "skills": extract_skills_from_text(text),
            "job_titles": extract_job_titles(text),
            "companies": extract_companies(text),
            "locations": extract_locations(text),
            "dates": extract_dates(text),
            "education": extract_education_from_text(text)
        }
        
        return entities
    
    except Exception as e:
        logger.error(f"Error extracting entities: {str(e)}")
        return {
            "skills": [],
            "job_titles": [],
            "companies": [],
            "locations": [],
            "dates": [],
            "education": []
        }


def extract_keywords(text: str, max_keywords: int = 10, min_word_length: int = 3) -> List[str]:
    """
    Extract important keywords from text by removing stopwords and sorting by frequency
    
    Args:
        text: Input text to extract keywords from
        max_keywords: Maximum number of keywords to return
        min_word_length: Minimum length of words to consider
        
    Returns:
        List of extracted keywords
    """
    if not text:
        return []
        
    # Convert to lowercase and tokenize
    tokens = word_tokenize(text.lower())
    
    # Remove stopwords, punctuation, and short words
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [
        token for token in tokens 
        if token not in stop_words 
        and token.isalnum() 
        and len(token) >= min_word_length
    ]
    
    # Count word frequencies
    word_freq = {}
    for token in filtered_tokens:
        if token in word_freq:
            word_freq[token] += 1
        else:
            word_freq[token] = 1
    
    # Sort by frequency
    sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    # Return top keywords
    return [keyword for keyword, _ in sorted_keywords[:max_keywords]]