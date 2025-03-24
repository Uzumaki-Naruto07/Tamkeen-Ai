"""
Profile Extractor Module

This module provides functionality for extracting information from resumes
and profiles, including skills, experience, education, and other attributes.
"""

import logging
import re
import os
import json
from typing import Dict, List, Any, Optional, Tuple, Union
import base64
from datetime import datetime
import requests

# Try to import optional packages
try:
    import pdfplumber
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    import docx
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

try:
    import spacy
    SPACY_SUPPORT = True
    # Load spaCy model
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        SPACY_SUPPORT = False
except ImportError:
    SPACY_SUPPORT = False

# Import utilities
from backend.utils.preprocess import (
    preprocess_text, extract_skills, extract_keywords, 
    clean_html, normalize_text
)

# Import settings for DeepSeek API
from backend.config.settings import DEEPSEEK_API_KEY

# Setup logger
logger = logging.getLogger(__name__)


class ProfileExtractor:
    """Class for extracting information from resumes and profiles"""
    
    def __init__(self):
        """Initialize profile extractor"""
        self.skill_keywords = self._load_skill_keywords()
        self.education_keywords = self._load_education_keywords()
        self.api_key = DEEPSEEK_API_KEY
    
    def _load_skill_keywords(self) -> List[str]:
        """
        Load skill keywords for skill extraction
        
        Returns:
            List of skill keywords
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return [
            "python", "java", "javascript", "typescript", "html", "css",
            "react", "angular", "vue", "node.js", "express", "django",
            "flask", "ruby", "c++", "c#", "php", "swift", "kotlin",
            "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
            "data analysis", "machine learning", "deep learning", "nlp",
            "sql", "mysql", "postgresql", "mongodb", "redis", "oracle",
            "docker", "kubernetes", "aws", "azure", "gcp", "devops",
            "ci/cd", "jenkins", "git", "github", "gitlab", "bitbucket",
            "agile", "scrum", "jira", "confluence", "project management",
            "leadership", "communication", "teamwork", "problem solving"
        ]
    
    def _load_education_keywords(self) -> Dict[str, List[str]]:
        """
        Load education keywords for education extraction
        
        Returns:
            Dict of education keywords
        """
        # In a real app, this would load from a database or file
        # This is a simplified example
        return {
            "degree_types": [
                "bachelor", "master", "phd", "doctorate", "mba", 
                "associate", "bs", "ms", "ba", "ma", "btech", "mtech",
                "b.s.", "m.s.", "b.a.", "m.a.", "b.tech", "m.tech"
            ],
            "fields": [
                "computer science", "information technology", "engineering",
                "business", "finance", "management", "marketing", "economics",
                "mathematics", "statistics", "physics", "chemistry", "biology",
                "psychology", "sociology", "communications", "journalism",
                "english", "history", "political science", "international relations"
            ],
            "institutions": [
                "university", "college", "institute", "school"
            ]
        }
    
    def extract_from_file(self, file_path: str) -> Dict[str, Any]:
        """
        Extract information from resume file
        
        Args:
            file_path: Path to resume file
            
        Returns:
            Dict of extracted information
        """
        try:
            # Get file extension
            _, extension = os.path.splitext(file_path)
            extension = extension.lower()
            
            # Extract text based on file type
            if extension == '.pdf' and PDF_SUPPORT:
                text = self._extract_from_pdf(file_path)
            elif extension in ['.docx', '.doc'] and DOCX_SUPPORT:
                text = self._extract_from_docx(file_path)
            elif extension in ['.txt', '.text']:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                logger.error(f"Unsupported file type: {extension}")
                return {"error": f"Unsupported file type: {extension}"}
            
            # Extract information from text
            return self.extract_from_text(text)
            
        except Exception as e:
            logger.error(f"Error extracting from file {file_path}: {str(e)}")
            return {"error": str(e)}
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """
        Extract text from PDF file
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        if not PDF_SUPPORT:
            logger.error("PDF support not available")
            return ""
        
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text
        except Exception as e:
            logger.error(f"Error extracting from PDF {file_path}: {str(e)}")
            return ""
    
    def _extract_from_docx(self, file_path: str) -> str:
        """
        Extract text from DOCX file
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Extracted text
        """
        if not DOCX_SUPPORT:
            logger.error("DOCX support not available")
            return ""
        
        text = ""
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting from DOCX {file_path}: {str(e)}")
            return ""
    
    def extract_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extract information from text
        
        Args:
            text: Resume text
            
        Returns:
            Dict of extracted information
        """
        try:
            # Clean and preprocess text
            cleaned_text = preprocess_text(text)
            
            # Extract basic information
            result = {
                "extracted_text": cleaned_text,
                "skills": self._extract_skills(cleaned_text),
                "education": self._extract_education(cleaned_text),
                "experience": self._extract_experience(cleaned_text)
            }
            
            # Try to enhance extraction with DeepSeek AI
            enhanced_result = self._enhance_with_deepseek(cleaned_text)
            if enhanced_result:
                result.update(enhanced_result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error extracting from text: {str(e)}")
            return {"error": str(e)}
    
    def _extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text
        
        Args:
            text: Resume text
            
        Returns:
            List of extracted skills
        """
        try:
            # Extract skills using keyword matching
            skills = extract_skills(text, self.skill_keywords)
            
            # Extract skills using NLP if available
            if SPACY_SUPPORT:
                skills = self._extract_skills_with_spacy(text, skills)
            
            return list(set(skills))
            
        except Exception as e:
            logger.error(f"Error extracting skills: {str(e)}")
            return []
    
    def _extract_skills_with_spacy(self, text: str, existing_skills: List[str] = None) -> List[str]:
        """
        Extract skills using spaCy
        
        Args:
            text: Resume text
            existing_skills: Already extracted skills
            
        Returns:
            List of extracted skills
        """
        if not SPACY_SUPPORT:
            return existing_skills or []
        
        skills = set(existing_skills or [])
        
        try:
            # Process text with spaCy
            doc = nlp(text)
            
            # Extract noun phrases as potential skills
            for chunk in doc.noun_chunks:
                if chunk.text.lower() in self.skill_keywords:
                    skills.add(chunk.text.lower())
            
            return list(skills)
            
        except Exception as e:
            logger.error(f"Error extracting skills with spaCy: {str(e)}")
            return list(skills)
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """
        Extract education from text
        
        Args:
            text: Resume text
            
        Returns:
            List of education entries
        """
        try:
            education = []
            
            # Look for education section
            education_sections = self._find_sections(text, ["education", "academic background"])
            
            if education_sections:
                edu_text = "\n".join(education_sections)
                
                # Extract degree information using regex
                degree_pattern = r"(?i)(bachelor|master|phd|doctorate|mba|associate|bs|ms|ba|ma|b\.s\.|m\.s\.|b\.a\.|m\.a\.)[^\n.]*(?:degree)?[^\n.]*(?:in|of)[^\n.]*([^\n.]*)"
                degree_matches = re.finditer(degree_pattern, edu_text)
                
                for match in degree_matches:
                    degree_type = match.group(1).strip()
                    field = match.group(2).strip() if match.group(2) else ""
                    
                    # Extract institution
                    institution = ""
                    for inst_keyword in self.education_keywords["institutions"]:
                        inst_pattern = f"(?i){inst_keyword} of ([^\n.,]*)"
                        inst_match = re.search(inst_pattern, match.group(0))
                        if inst_match:
                            institution = inst_match.group(1).strip()
                            break
                    
                    # Extract dates
                    dates = ""
                    date_pattern = r"(?i)(?:from|between)?\s*(\d{4})\s*(?:to|--|–|-|until)?\s*(\d{4}|present)"
                    date_match = re.search(date_pattern, match.group(0))
                    if date_match:
                        dates = f"{date_match.group(1)} - {date_match.group(2)}"
                    
                    education.append({
                        "degree": degree_type,
                        "field": field,
                        "institution": institution,
                        "dates": dates
                    })
            
            return education
            
        except Exception as e:
            logger.error(f"Error extracting education: {str(e)}")
            return []
    
    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        """
        Extract work experience from text
        
        Args:
            text: Resume text
            
        Returns:
            List of experience entries
        """
        try:
            experience = []
            
            # Look for experience section
            experience_sections = self._find_sections(text, [
                "experience", "work experience", "employment history", 
                "professional experience", "work history"
            ])
            
            if experience_sections:
                exp_text = "\n".join(experience_sections)
                
                # Split into entries - usually separated by dates or company names
                date_pattern = r"(?i)(?:from|between)?\s*(\d{4})\s*(?:to|--|–|-|until)?\s*(\d{4}|present)"
                date_matches = list(re.finditer(date_pattern, exp_text))
                
                # If we found date ranges, split by those
                if date_matches:
                    for i, match in enumerate(date_matches):
                        start_pos = match.start()
                        
                        # Determine end position
                        if i < len(date_matches) - 1:
                            end_pos = date_matches[i+1].start()
                        else:
                            # Find the next section or end of text
                            next_section = re.search(r"(?i)^\s*(education|skills|projects|certifications)", exp_text[match.end():], re.MULTILINE)
                            if next_section:
                                end_pos = match.end() + next_section.start()
                            else:
                                end_pos = len(exp_text)
                        
                        # Extract this experience entry
                        entry_text = exp_text[start_pos:end_pos].strip()
                        
                        # Extract job title - usually before or after company
                        title = ""
                        company = ""
                        
                        # Try to extract company name
                        company_pattern = r"(?i)(?:at|with|for)\s+([A-Z][A-Za-z0-9\s&.,]+)"
                        company_match = re.search(company_pattern, entry_text)
                        if company_match:
                            company = company_match.group(1).strip()
                        
                        # Try to extract job title
                        title_pattern = r"(?i)(software engineer|developer|engineer|manager|director|analyst|consultant)(?:\s+[A-Za-z]+)?"
                        title_match = re.search(title_pattern, entry_text)
                        if title_match:
                            title = title_match.group(0).strip()
                        
                        # Extract dates from the match
                        dates = f"{match.group(1)} - {match.group(2)}"
                        
                        # Extract description
                        description = entry_text
                        if company:
                            description = re.sub(company_pattern, "", description)
                        if title:
                            description = re.sub(title_pattern, "", description, 1)
                        description = re.sub(date_pattern, "", description, 1)
                        description = description.strip()
                        
                        experience.append({
                            "title": title,
                            "company": company,
                            "dates": dates,
                            "description": description
                        })
            
            return experience
            
        except Exception as e:
            logger.error(f"Error extracting experience: {str(e)}")
            return []
    
    def _find_sections(self, text: str, section_names: List[str]) -> List[str]:
        """
        Find sections in text matching given names
        
        Args:
            text: Resume text
            section_names: Section names to find
            
        Returns:
            List of matching sections
        """
        sections = []
        
        try:
            # Split text into lines
            lines = text.split("\n")
            
            # Find section headers
            section_indices = []
            for i, line in enumerate(lines):
                for name in section_names:
                    if re.search(f"(?i)\\b{name}\\b", line):
                        section_indices.append(i)
                        break
            
            # Sort section indices
            section_indices.sort()
            
            # Extract sections
            for i, start_idx in enumerate(section_indices):
                # Determine section end
                if i < len(section_indices) - 1:
                    end_idx = section_indices[i+1]
                else:
                    end_idx = len(lines)
                
                # Extract section
                section = "\n".join(lines[start_idx:end_idx])
                sections.append(section)
            
            return sections
            
        except Exception as e:
            logger.error(f"Error finding sections: {str(e)}")
            return []
    
    def _enhance_with_deepseek(self, text: str) -> Dict[str, Any]:
        """
        Enhance extraction with DeepSeek AI
        
        Args:
            text: Resume text
            
        Returns:
            Enhanced extraction results
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping AI enhancement")
            return {}
        
        try:
            # Prepare the API request
            prompt = f"""Extract structured information from this resume text. Return a JSON object with the following fields:
            - name: The person's name
            - email: Email address (if found)
            - phone: Phone number (if found)
            - linkedin: LinkedIn URL (if found)
            - skills: Array of skills mentioned
            - education: Array of education entries, each with degree, field, institution, and dates
            - experience: Array of work experiences with title, company, dates, and description
            - summary: A brief professional summary
            
            Resume text:
            {text[:2000]}...
            
            Return only valid JSON with no additional text.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload with the carefully crafted system message
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert resume parser. Extract structured information accurately from resume text. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
                "max_tokens": 1500
            }
            
            # Set up headers with API key
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Make the API request
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            
            # Check if the request was successful
            if response.status_code == 200:
                # Parse the response
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Parse the JSON content
                try:
                    parsed = json.loads(content)
                    return parsed
                except json.JSONDecodeError:
                    logger.error("Failed to parse DeepSeek response as JSON")
                    return {}
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return {}
            
        except Exception as e:
            logger.error(f"Error enhancing with DeepSeek: {str(e)}")
            return {}
    
    def generate_profile_summary(self, profile_data: Dict[str, Any]) -> str:
        """
        Generate a professional summary from profile data
        
        Args:
            profile_data: Extracted profile data
            
        Returns:
            Generated summary
        """
        if not self.api_key:
            logger.warning("DeepSeek API key not available, skipping summary generation")
            return ""
        
        try:
            # Create a simplified profile for the prompt
            simplified = {
                "skills": profile_data.get("skills", []),
                "education": profile_data.get("education", []),
                "experience": profile_data.get("experience", [])
            }
            
            # Prepare the API request
            prompt = f"""Based on this profile information, generate a professional summary paragraph:
            {json.dumps(simplified)}
            
            The summary should be concise (2-3 sentences), professional, and highlight key strengths and expertise.
            """
            
            # API endpoint
            url = "https://api.deepseek.com/v1/chat/completions"
            
            # Prepare the payload
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert career advisor who writes professional summaries."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 200
            }
            
            # Set up headers with API key
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            # Make the API request
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            
            # Check if the request was successful
            if response.status_code == 200:
                # Parse the response
                result = response.json()
                summary = result["choices"][0]["message"]["content"]
                return summary.strip()
            else:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return ""
            
        except Exception as e:
            logger.error(f"Error generating profile summary: {str(e)}")
            return "" 