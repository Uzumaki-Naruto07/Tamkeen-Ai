"""
Resume Parser Module

This module provides functionality for parsing and extracting information from 
resumes in various formats for the Tamkeen AI Career Intelligence System.
"""

import os
import re
import json
import uuid
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import logging

# Import utilities
from backend.utils.file_handler import extract_text_from_file, detect_sections
from backend.utils.text_preprocess import (
    clean_text, extract_emails, extract_phone_numbers, extract_urls,
    extract_dates, extract_education, extract_experience, extract_skills,
    extract_entities, extract_languages
)
from backend.database.models import Resume, ResumeVersion
from backend.utils.file_utils import get_file_extension, save_uploaded_file, allowed_file

# Setup logger
logger = logging.getLogger(__name__)


class ResumeParser:
    """Resume parsing and information extraction class"""
    
    def __init__(self):
        """Initialize parser with skills list and config"""
        self.skills_list = self._load_skills_list()
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load parser configuration
        
        Returns:
            dict: Configuration settings
        """
        try:
            config_path = os.path.join(os.path.dirname(__file__), '../config/parser_config.json')
            
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            # Default config if file not found
            return {
                "max_text_length": 50000,
                "min_text_length": 100,
                "section_similarity_threshold": 0.75,
                "extract_name": True,
                "extract_contact_info": True,
                "extract_education": True,
                "extract_experience": True,
                "extract_skills": True,
                "extract_languages": True,
                "extract_certifications": True,
                "extract_projects": True,
                "languages": ["en", "ar", "fr"]
            }
        
        except Exception as e:
            logger.error(f"Error loading parser config: {str(e)}")
            return {
                "max_text_length": 50000,
                "min_text_length": 100
            }
    
    def _load_skills_list(self) -> List[str]:
        """
        Load skills list from file or default list
        
        Returns:
            list: Skills list
        """
        try:
            skills_path = os.path.join(os.path.dirname(__file__), '../data/skills.json')
            
            if os.path.exists(skills_path):
                with open(skills_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            # Default skills if file not found
            return [
                # Programming languages
                "Python", "Java", "JavaScript", "C++", "C#", "PHP", "Ruby", "Swift",
                "Kotlin", "TypeScript", "Go", "Scala", "R", "MATLAB", "SQL",
                
                # Frameworks & libraries
                "React", "Angular", "Vue.js", "Django", "Flask", "Spring", "Express",
                "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", ".NET", "Node.js",
                
                # Tools & platforms
                "Git", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Linux",
                "Jenkins", "Travis CI", "CircleCI", "Jira", "Confluence",
                
                # Business & soft skills
                "Project Management", "Agile", "Scrum", "Leadership", "Communication",
                "Presentation", "Negotiation", "Problem Solving", "Critical Thinking",
                
                # Design
                "UX", "UI", "Graphic Design", "Adobe Photoshop", "Illustrator", "Figma",
                "Sketch", "Adobe XD",
                
                # Data & analytics
                "Data Analysis", "Big Data", "Machine Learning", "Deep Learning", 
                "Natural Language Processing", "Data Visualization", "Tableau", "Power BI"
            ]
        
        except Exception as e:
            logger.error(f"Error loading skills list: {str(e)}")
            return []
    
    def validate_resume_file(self, file_path: str) -> Tuple[bool, Optional[str]]:
        """
        Validate resume file
        
        Args:
            file_path: Path to resume file
            
        Returns:
            tuple: (is_valid, error_message)
        """
        # Check if file exists
        if not os.path.exists(file_path):
            return False, "File not found"
        
        # Check file extension
        file_ext = get_file_extension(file_path)
        if not file_ext or file_ext not in {'pdf', 'doc', 'docx', 'txt', 'rtf'}:
            return False, "Unsupported file format"
        
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return False, "File is empty"
        
        # Maximum file size (10MB)
        max_size = 10 * 1024 * 1024
        if file_size > max_size:
            return False, "File size exceeds maximum allowed size (10MB)"
        
        return True, None
    
    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """
        Parse resume and extract information
        
        Args:
            file_path: Path to resume file
            
        Returns:
            dict: Extracted information
        """
        try:
            # Validate file
            is_valid, error = self.validate_resume_file(file_path)
            if not is_valid:
                logger.warning(f"Invalid resume file: {error}")
                return {"error": error}
            
            # Extract text
            text = extract_text_from_file(file_path)
            
            if not text:
                logger.warning(f"No text extracted from file: {file_path}")
                return {"error": "No text could be extracted from the file"}
            
            # Check text length
            if len(text) < self.config.get("min_text_length", 100):
                logger.warning(f"Resume text too short: {len(text)} characters")
                return {"error": "Resume text is too short"}
            
            # Truncate if too long
            max_length = self.config.get("max_text_length", 50000)
            if len(text) > max_length:
                text = text[:max_length]
                logger.info(f"Resume text truncated to {max_length} characters")
            
            # Clean text
            cleaned_text = clean_text(text)
            
            # Result dictionary
            result = {
                'meta': {
                    'file_path': file_path,
                    'file_type': get_file_extension(file_path),
                    'text_length': len(cleaned_text),
                    'parsed_at': datetime.now().isoformat()
                },
                'raw_text': cleaned_text
            }
            
            # Extract sections
            sections = detect_sections(cleaned_text)
            result['sections'] = {k: v for k, v in sections.items()}
            
            # Extract basic information
            if self.config.get("extract_contact_info", True):
                emails = extract_emails(cleaned_text)
                phone_numbers = extract_phone_numbers(cleaned_text)
                urls = extract_urls(cleaned_text)
                
                result['contact_info'] = {
                    'emails': emails,
                    'phone_numbers': phone_numbers,
                    'websites': urls
                }
            
            # Extract detailed information
            if self.config.get("extract_education", True):
                education = extract_education(sections.get('education', ''))
                result['education'] = education
            
            if self.config.get("extract_experience", True):
                experience = extract_experience(sections.get('experience', '') or 
                                              sections.get('work experience', '') or
                                              sections.get('employment', ''))
                result['experience'] = experience
            
            if self.config.get("extract_skills", True):
                skills = extract_skills(cleaned_text, self.skills_list)
                result['skills'] = skills
            
            if self.config.get("extract_languages", True):
                languages = extract_languages(cleaned_text)
                result['languages'] = languages
            
            # Extract name and other entities
            if self.config.get("extract_name", True):
                entities = extract_entities(cleaned_text)
                
                # Extract name (looking for a person entity near the start of the document)
                if 'PERSON' in entities and entities['PERSON']:
                    # Use first person mentioned as the name
                    result['name'] = entities['PERSON'][0]
                else:
                    # Fallback method: try to get name from the header section
                    if 'header' in sections:
                        lines = sections['header'].strip().split('\n')
                        if lines:
                            # Assume the first non-empty line that's not an email, phone, or URL is the name
                            for line in lines:
                                line = line.strip()
                                if line and not re.search(r'@|www|\d{3}[-.]?\d{3}[-.]?\d{4}', line):
                                    result['name'] = line
                                    break
                
                # Include other entities
                result['entities'] = entities
            
            # Return all extracted information
            return result
        
        except Exception as e:
            error_msg = f"Error parsing resume: {str(e)}"
            logger.error(error_msg)
            return {'error': error_msg}
    
    def save_parsed_resume(self, user_id: str, file_path: str, file_name: str) -> Tuple[bool, Optional[Resume], Optional[str]]:
        """
        Parse resume and save to database
        
        Args:
            user_id: User ID
            file_path: Path to resume file
            file_name: Original file name
            
        Returns:
            tuple: (success, resume, message)
        """
        try:
            # Parse resume
            parsed_data = self.parse_resume(file_path)
            
            if not parsed_data or 'error' in parsed_data:
                return False, None, parsed_data.get('error', 'Failed to parse resume')
            
            # Create resume object
            resume = Resume(
                id=str(uuid.uuid4()),
                user_id=user_id,
                file_path=file_path,
                original_filename=file_name,
                file_type=get_file_extension(file_name),
                name=parsed_data.get('name', file_name),
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            
            # Save resume
            resume.save()
            
            # Create version object
            version = ResumeVersion(
                id=str(uuid.uuid4()),
                resume_id=resume.id,
                user_id=user_id,
                version_number=1,
                file_path=file_path,
                parsed_data=json.dumps(parsed_data),
                created_at=datetime.now().isoformat()
            )
            
            # Save version
            version.save()
            
            logger.info(f"Resume saved: {resume.id}")
            
            return True, resume, None
        
        except Exception as e:
            error_msg = f"Error saving parsed resume: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    def update_resume(self, resume_id: str, file_path: str, file_name: str) -> Tuple[bool, Optional[Resume], Optional[str]]:
        """
        Update existing resume with new file
        
        Args:
            resume_id: Resume ID
            file_path: Path to new resume file
            file_name: Original file name
            
        Returns:
            tuple: (success, resume, message)
        """
        try:
            # Find resume
            resume = Resume.find_by_id(resume_id)
            if not resume:
                return False, None, "Resume not found"
            
            # Parse new resume
            parsed_data = self.parse_resume(file_path)
            
            if not parsed_data or 'error' in parsed_data:
                return False, None, parsed_data.get('error', 'Failed to parse resume')
            
            # Get current version number
            versions = ResumeVersion.find_by_resume_id(resume_id)
            version_number = len(versions) + 1
            
            # Update resume
            resume.file_path = file_path
            resume.original_filename = file_name
            resume.file_type = get_file_extension(file_name)
            resume.name = parsed_data.get('name', file_name)
            resume.updated_at = datetime.now().isoformat()
            
            # Save resume
            resume.save()
            
            # Create new version
            version = ResumeVersion(
                id=str(uuid.uuid4()),
                resume_id=resume.id,
                user_id=resume.user_id,
                version_number=version_number,
                file_path=file_path,
                parsed_data=json.dumps(parsed_data),
                created_at=datetime.now().isoformat()
            )
            
            # Save version
            version.save()
            
            logger.info(f"Resume updated: {resume.id}, new version: {version.id}")
            
            return True, resume, None
        
        except Exception as e:
            error_msg = f"Error updating resume: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    def get_resume_data(self, resume_id: str, version_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get parsed resume data
        
        Args:
            resume_id: Resume ID
            version_id: Optional version ID (defaults to latest)
            
        Returns:
            dict: Resume data including parsed information
        """
        try:
            # Find resume
            resume = Resume.find_by_id(resume_id)
            if not resume:
                return {"error": "Resume not found"}
            
            # Get resume data
            resume_data = resume.to_dict()
            
            # Find version
            if version_id:
                version = ResumeVersion.find_by_id(version_id)
                if not version or version.resume_id != resume_id:
                    return {"error": "Version not found"}
            else:
                # Get latest version
                versions = ResumeVersion.find_by_resume_id(resume_id)
                if not versions:
                    return {"error": "No versions found"}
                
                version = max(versions, key=lambda v: v.version_number)
            
            # Parse JSON data
            try:
                parsed_data = json.loads(version.parsed_data)
            except (json.JSONDecodeError, TypeError):
                parsed_data = {"error": "Invalid parsed data format"}
            
            # Add version info
            resume_data['version'] = version.to_dict()
            resume_data['parsed_data'] = parsed_data
            
            return resume_data
        
        except Exception as e:
            error_msg = f"Error getting resume data: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}
    
    def extract_resume_text(self, file_path: str) -> str:
        """
        Extract text from resume file
        
        Args:
            file_path: Path to resume file
            
        Returns:
            str: Extracted text
        """
        try:
            text = extract_text_from_file(file_path)
            return clean_text(text) if text else ""
        
        except Exception as e:
            logger.error(f"Error extracting resume text: {str(e)}")
            return ""
    
    def get_resume_versions(self, resume_id: str) -> List[Dict[str, Any]]:
        """
        Get all versions of a resume
        
        Args:
            resume_id: Resume ID
            
        Returns:
            list: Resume versions
        """
        try:
            versions = ResumeVersion.find_by_resume_id(resume_id)
            return [version.to_dict() for version in versions]
        
        except Exception as e:
            logger.error(f"Error getting resume versions: {str(e)}")
            return []
    
    def compare_resume_versions(self, resume_id: str, version1_id: str, version2_id: str) -> Dict[str, Any]:
        """
        Compare two resume versions
        
        Args:
            resume_id: Resume ID
            version1_id: First version ID
            version2_id: Second version ID
            
        Returns:
            dict: Comparison results
        """
        try:
            # Find versions
            version1 = ResumeVersion.find_by_id(version1_id)
            version2 = ResumeVersion.find_by_id(version2_id)
            
            if not version1 or not version2:
                return {"error": "Version not found"}
            
            if version1.resume_id != resume_id or version2.resume_id != resume_id:
                return {"error": "Versions do not belong to the specified resume"}
            
            # Parse JSON data
            try:
                data1 = json.loads(version1.parsed_data)
                data2 = json.loads(version2.parsed_data)
            except (json.JSONDecodeError, TypeError):
                return {"error": "Invalid parsed data format"}
            
            # Compare data
            comparison = {
                'version1': {
                    'id': version1.id,
                    'version_number': version1.version_number,
                    'created_at': version1.created_at
                },
                'version2': {
                    'id': version2.id,
                    'version_number': version2.version_number,
                    'created_at': version2.created_at
                },
                'changes': {}
            }
            
            # Compare skills
            if 'skills' in data1 and 'skills' in data2:
                skills1 = set(data1['skills'])
                skills2 = set(data2['skills'])
                
                comparison['changes']['skills'] = {
                    'added': list(skills2 - skills1),
                    'removed': list(skills1 - skills2),
                    'unchanged': list(skills1 & skills2)
                }
            
            # Compare education
            if 'education' in data1 and 'education' in data2:
                edu1 = {entry.get('institution', ''): entry for entry in data1['education']}
                edu2 = {entry.get('institution', ''): entry for entry in data2['education']}
                
                comparison['changes']['education'] = {
                    'added': [entry for inst, entry in edu2.items() if inst and inst not in edu1],
                    'removed': [entry for inst, entry in edu1.items() if inst and inst not in edu2],
                    'changed': [entry for inst, entry in edu2.items() if inst in edu1 and entry != edu1[inst]]
                }
            
            # Compare experience
            if 'experience' in data1 and 'experience' in data2:
                exp1 = {f"{entry.get('company', '')}-{entry.get('title', '')}": entry for entry in data1['experience']}
                exp2 = {f"{entry.get('company', '')}-{entry.get('title', '')}": entry for entry in data2['experience']}
                
                comparison['changes']['experience'] = {
                    'added': [entry for key, entry in exp2.items() if key and key not in exp1],
                    'removed': [entry for key, entry in exp1.items() if key and key not in exp2],
                    'changed': [entry for key, entry in exp2.items() if key in exp1 and entry != exp1[key]]
                }
            
            return comparison
        
        except Exception as e:
            error_msg = f"Error comparing resume versions: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}


# Convenience functions

def parse_resume(file_path: str) -> Dict[str, Any]:
    """Parse resume and extract information"""
    parser = ResumeParser()
    return parser.parse_resume(file_path)


def extract_text_from_resume(file_path: str) -> str:
    """Extract text from resume file"""
    parser = ResumeParser()
    return parser.extract_resume_text(file_path)


def save_parsed_resume(user_id: str, file_path: str, file_name: str) -> Tuple[bool, Optional[Resume], Optional[str]]:
    """Parse resume and save to database"""
    parser = ResumeParser()
    return parser.save_parsed_resume(user_id, file_path, file_name)


def update_resume(resume_id: str, file_path: str, file_name: str) -> Tuple[bool, Optional[Resume], Optional[str]]:
    """Update existing resume with new file"""
    parser = ResumeParser()
    return parser.update_resume(resume_id, file_path, file_name)


def get_resume_data(resume_id: str, version_id: Optional[str] = None) -> Dict[str, Any]:
    """Get parsed resume data"""
    parser = ResumeParser()
    return parser.get_resume_data(resume_id, version_id)


def get_resume_versions(resume_id: str) -> List[Dict[str, Any]]:
    """Get all versions of a resume"""
    parser = ResumeParser()
    return parser.get_resume_versions(resume_id)


def compare_resume_versions(resume_id: str, version1_id: str, version2_id: str) -> Dict[str, Any]:
    """Compare two resume versions"""
    parser = ResumeParser()
    return parser.compare_resume_versions(resume_id, version1_id, version2_id)


def process_resume_upload(user_id: str, file) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """
    Process uploaded resume file
    
    Args:
        user_id: User ID
        file: Uploaded file
        
    Returns:
        tuple: (success, data, message)
    """
    try:
        # Check if file is valid
        if not file or not file.filename:
            return False, None, "No file provided"
        
        # Check file extension
        if not allowed_file(file.filename, file_type='resume'):
            return False, None, "Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, RTF"
        
        # Save uploaded file
        file_path = save_uploaded_file(file, f"resumes/{user_id}")
        
        if not file_path:
            return False, None, "Failed to save file"
        
        # Parse and save resume
        success, resume, message = save_parsed_resume(user_id, file_path, file.filename)
        
        if not success:
            return False, None, message
        
        # Get parsed data
        resume_data = get_resume_data(resume.id)
        
        if 'error' in resume_data:
            return False, None, resume_data['error']
        
        return True, resume_data, None
    
    except Exception as e:
        error_msg = f"Error processing resume upload: {str(e)}"
        logger.error(error_msg)
        return False, None, error_msg