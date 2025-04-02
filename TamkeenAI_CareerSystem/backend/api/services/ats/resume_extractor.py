"""
Advanced Resume Text Extraction Module

This module handles text extraction from various resume file formats
and implements advanced NLP processing for resume analysis.
"""

import os
import io
import re
import json
import logging
from typing import Dict, List, Any, Optional, Tuple, Union

# Import document processing libraries
try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logging.warning("pdfplumber not installed. PDF extraction will be unavailable.")

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    logging.warning("python-docx not installed. DOCX extraction will be unavailable.")

try:
    import docx2txt
    DOCX2TXT_AVAILABLE = True
except ImportError:
    DOCX2TXT_AVAILABLE = False
    logging.warning("docx2txt not installed. Alternative DOCX extraction will be unavailable.")

# Import NLP libraries
try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        try:
            # Download if not available
            spacy.cli.download("en_core_web_sm")
            nlp = spacy.load("en_core_web_sm")
        except:
            nlp = spacy.blank("en")
except ImportError:
    SPACY_AVAILABLE = False
    nlp = None
    logging.warning("spaCy not installed. Advanced NLP processing will be unavailable.")

try:
    import nltk
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    NLTK_AVAILABLE = True
    # Ensure NLTK resources are downloaded
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
except ImportError:
    NLTK_AVAILABLE = False
    logging.warning("NLTK not installed. Some NLP functions will be unavailable.")

# Setup logger
logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_file) -> str:
    """
    Extract text from a PDF file using pdfplumber.
    
    Args:
        pdf_file: File path or file-like object
        
    Returns:
        str: Extracted text
    """
    text = ""
    try:
        if not PDF_AVAILABLE:
            logger.error("PDF extraction not available. Install pdfplumber.")
            return "PDF extraction unavailable. Please install pdfplumber."
        
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text() or ""
                text += extracted + "\n"
                
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return f"Error extracting text: {str(e)}"

def extract_text_from_docx(docx_file) -> str:
    """
    Extract text from a DOCX file using python-docx or docx2txt.
    
    Args:
        docx_file: File path or file-like object
        
    Returns:
        str: Extracted text
    """
    text = ""
    try:
        # Try python-docx first
        if DOCX_AVAILABLE:
            doc = docx.Document(docx_file)
            text = "\n".join([para.text for para in doc.paragraphs])
        # Fall back to docx2txt if available
        elif DOCX2TXT_AVAILABLE:
            text = docx2txt.process(docx_file)
        else:
            logger.error("DOCX extraction not available. Install python-docx or docx2txt.")
            return "DOCX extraction unavailable. Please install python-docx or docx2txt."
            
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        return f"Error extracting text: {str(e)}"

def preprocess_text(text: str) -> str:
    """
    Clean and preprocess extracted text.
    
    Args:
        text: Raw text
        
    Returns:
        str: Cleaned text
    """
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)  # Replace punctuation with space
    text = re.sub(r'\d+', ' ', text)      # Replace numbers with space
    text = re.sub(r'\s+', ' ', text).strip()  # Normalize whitespace
    return text

def extract_text_from_resume(file_path_or_obj, file_type=None):
    """
    Extract text from a resume file based on file type.
    
    Args:
        file_path_or_obj: File path or file-like object
        file_type: File type (optional, will be detected if not provided)
        
    Returns:
        str: Extracted text
    """
    try:
        # Determine file type if not provided
        if not file_type:
            if isinstance(file_path_or_obj, str):
                file_type = os.path.splitext(file_path_or_obj)[1].lower()
            else:
                # If file object doesn't have a name attribute, assume PDF
                file_type = getattr(file_path_or_obj, 'name', '.pdf')
                file_type = os.path.splitext(file_type)[1].lower()
        
        # Extract text based on file type
        if file_type in ['.pdf', 'pdf']:
            return extract_text_from_pdf(file_path_or_obj)
        elif file_type in ['.docx', '.doc', 'docx', 'doc']:
            return extract_text_from_docx(file_path_or_obj)
        elif file_type in ['.txt', 'txt']:
            # Handle text files
            if isinstance(file_path_or_obj, str):
                with open(file_path_or_obj, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
            else:
                # If file object, read content
                content = file_path_or_obj.read()
                if isinstance(content, bytes):
                    return content.decode('utf-8', errors='ignore')
                return content
        else:
            logger.error(f"Unsupported file type: {file_type}")
            return f"Unsupported file type: {file_type}. Please upload a PDF, DOCX, or TXT file."
            
    except Exception as e:
        logger.error(f"Error extracting text from resume: {str(e)}")
        return f"Error extracting text: {str(e)}"

def extract_sections_from_resume(text: str) -> Dict[str, str]:
    """
    Extract common resume sections from text.
    
    Args:
        text: Resume text
        
    Returns:
        dict: Dict of section name to section content
    """
    # Common section headers in resumes
    section_patterns = [
        (r'EDUCATION|ACADEMIC|QUALIFICATION', 'education'),
        (r'EXPERIENCE|EMPLOYMENT|WORK HISTORY|PROFESSIONAL', 'experience'),
        (r'SKILLS|TECHNICAL SKILLS|COMPETENCIES', 'skills'),
        (r'CERTIFICATIONS|CERTIFICATES|LICENSES', 'certifications'),
        (r'PROJECTS|PROJECT EXPERIENCE', 'projects'),
        (r'SUMMARY|PROFILE|OBJECTIVE', 'summary'),
        (r'ACHIEVEMENTS|ACCOMPLISHMENTS', 'achievements'),
        (r'LANGUAGES|LANGUAGE PROFICIENCY', 'languages'),
        (r'REFERENCES', 'references'),
        (r'PUBLICATIONS|PAPERS|RESEARCH', 'publications'),
        (r'INTERESTS|HOBBIES', 'interests'),
        (r'VOLUNTEER|COMMUNITY SERVICE', 'volunteer')
    ]
    
    # Find all section headers and their positions
    section_positions = []
    for pattern, section_name in section_patterns:
        for match in re.finditer(r'(?i)(?:^|\n)(' + pattern + r')\s*(?::|\n)', text):
            section_positions.append((match.start(), section_name))
    
    # Sort by position
    section_positions.sort()
    
    # If no sections found, return the whole text as "full_text"
    if not section_positions:
        return {'full_text': text}
    
    # Extract each section's content
    sections = {}
    for i, (pos, section_name) in enumerate(section_positions):
        # Find section end (next section start or end of text)
        if i < len(section_positions) - 1:
            next_pos = section_positions[i + 1][0]
        else:
            next_pos = len(text)
        
        # Extract section content (skip the header line)
        header_end = text.find('\n', pos)
        if header_end == -1 or header_end > next_pos:  # No newline found or beyond next section
            header_end = text.find(':', pos)
            if header_end == -1 or header_end > next_pos:
                header_end = pos + 20  # Arbitrary cutoff
        
        section_content = text[header_end:next_pos].strip()
        sections[section_name] = section_content
    
    return sections

# Main function to process a resume file
def process_resume(file_path_or_obj, file_type=None) -> Dict[str, Any]:
    """
    Process a resume file and extract structured information.
    
    Args:
        file_path_or_obj: File path or file-like object
        file_type: File type (optional)
        
    Returns:
        dict: Structured resume data
    """
    result = {
        'success': False,
        'text': '',
        'sections': {},
        'error': None
    }
    
    try:
        # Extract text
        text = extract_text_from_resume(file_path_or_obj, file_type)
        
        # Check if extraction was successful
        if text.startswith('Error') or text.startswith('Unsupported'):
            result['error'] = text
            return result
        
        result['text'] = text
        result['success'] = True
        
        # Extract sections
        result['sections'] = extract_sections_from_resume(text)
        
        return result
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        result['error'] = f"Error processing resume: {str(e)}"
        return result 