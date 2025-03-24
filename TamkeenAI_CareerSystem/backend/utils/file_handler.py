"""
File Handler Utility Module

This module provides utilities for file operations, including reading, writing,
uploading, and downloading files, with special support for resume file formats.
"""

import os
import re
import json
import uuid
import shutil
import logging
import mimetypes
from typing import Dict, List, Any, Optional, Tuple, Union, BinaryIO
from datetime import datetime
from pathlib import Path

# Import settings
from backend.config.settings import UPLOAD_FOLDER, TEMP_DIR, PARSER_CONFIG, ALLOWED_EXTENSIONS, STORAGE_TYPE, STORAGE_CONFIG

# Setup logger
logger = logging.getLogger(__name__)

# Try to import optional dependencies
try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    logging.warning("python-docx not installed. DOCX parsing will be unavailable. Install with: pip install python-docx")

try:
    from PyPDF2 import PdfReader
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    logging.warning("PyPDF2 not installed. PDF parsing will be unavailable. Install with: pip install PyPDF2")

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    logging.warning("pdfplumber not installed. Install with: pip install pdfplumber")

try:
    import odf
    from odf import text, teletype
    from odf.opendocument import load
    ODF_AVAILABLE = True
except ImportError:
    ODF_AVAILABLE = False
    logging.warning("odfpy not installed. ODT parsing will be unavailable. Install with: pip install odfpy")

try:
    import boto3
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False
    logging.warning("boto3 not installed. Install with: pip install boto3")

try:
    from azure.storage.blob import BlobServiceClient
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    logging.warning("azure-storage-blob not installed. Install with: pip install azure-storage-blob")


def is_allowed_file(filename: str) -> bool:
    """
    Check if file type is allowed
    
    Args:
        filename: File name
        
    Returns:
        bool: True if allowed
    """
    # Get allowed file types from config
    allowed_types = PARSER_CONFIG.get("supported_file_types", ["pdf", "docx", "txt", "rtf", "odt"])
    
    # Check extension
    extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    return extension in allowed_types


def get_file_extension(filename: str) -> str:
    """
    Get file extension
    
    Args:
        filename: File name
        
    Returns:
        str: File extension
    """
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


def get_mime_type(filename: str) -> str:
    """
    Get file MIME type
    
    Args:
        filename: File name
        
    Returns:
        str: MIME type
    """
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or "application/octet-stream"


def get_file_size(file_path: str) -> int:
    """
    Get file size in bytes
    
    Args:
        file_path: File path
        
    Returns:
        int: File size
    """
    return os.path.getsize(file_path)


def is_file_size_allowed(file_path: str) -> bool:
    """
    Check if file size is allowed
    
    Args:
        file_path: File path
        
    Returns:
        bool: True if allowed
    """
    # Get max file size from config
    max_size_mb = PARSER_CONFIG.get("max_file_size_mb", 10)
    max_size_bytes = max_size_mb * 1024 * 1024
    
    # Check size
    size = get_file_size(file_path)
    
    return size <= max_size_bytes


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate unique filename
    
    Args:
        original_filename: Original file name
        
    Returns:
        str: Unique filename
    """
    # Get extension
    extension = get_file_extension(original_filename)
    
    # Generate unique ID
    unique_id = str(uuid.uuid4())
    
    # Create timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # Create unique filename
    unique_filename = f"{timestamp}_{unique_id}.{extension}"
    
    return unique_filename


def save_uploaded_file(file_obj: BinaryIO, filename: str, 
                     directory: Optional[str] = None) -> Tuple[bool, str]:
    """
    Save uploaded file
    
    Args:
        file_obj: File object
        filename: Original filename
        directory: Target directory (default: UPLOAD_DIR)
        
    Returns:
        tuple: (success, saved_path)
    """
    try:
        # Check if file type is allowed
        if not is_allowed_file(filename):
            logger.warning(f"File type not allowed: {filename}")
            return False, "File type not allowed"
        
        # Generate unique filename
        unique_filename = generate_unique_filename(filename)
        
        # Set target directory
        target_dir = directory or UPLOAD_FOLDER
        
        # Ensure directory exists
        os.makedirs(target_dir, exist_ok=True)
        
        # Set target path
        target_path = os.path.join(target_dir, unique_filename)
        
        # Save file
        with open(target_path, 'wb') as f:
            shutil.copyfileobj(file_obj, f)
        
        # Check if file size is allowed
        if not is_file_size_allowed(target_path):
            # Remove file if too large
            os.remove(target_path)
            logger.warning(f"File too large: {filename}")
            return False, "File size exceeds maximum allowed"
        
        return True, target_path
    
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        return False, str(e)


def delete_file(file_path: str) -> bool:
    """
    Delete file
    
    Args:
        file_path: File path
        
    Returns:
        bool: Success status
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        
        return False
    
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return False


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file
    
    Args:
        file_path: PDF file path
        
    Returns:
        str: Extracted text
    """
    if not PYPDF2_AVAILABLE:
        logger.error("PyPDF2 not installed. Cannot extract text from PDF.")
        return ""
    
    try:
        text = ""
        
        # Open PDF
        with open(file_path, 'rb') as f:
            pdf = PdfReader(f)
            
            # Extract text from each page
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        
        return text
    
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """
    Extract text from DOCX file
    
    Args:
        file_path: DOCX file path
        
    Returns:
        str: Extracted text
    """
    if not DOCX_AVAILABLE:
        logger.error("python-docx not installed. Cannot extract text from DOCX.")
        return ""
    
    try:
        text = ""
        
        # Open DOCX
        doc = docx.Document(file_path)
        
        # Extract text from paragraphs
        for para in doc.paragraphs:
            text += para.text + "\n"
        
        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text += cell.text + "\n"
        
        return text
    
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        return ""


def extract_text_from_odt(file_path: str) -> str:
    """
    Extract text from ODT file
    
    Args:
        file_path: ODT file path
        
    Returns:
        str: Extracted text
    """
    if not ODF_AVAILABLE:
        logger.error("odfpy not installed. Cannot extract text from ODT.")
        return ""
    
    try:
        # Load document
        doc = load(file_path)
        
        # Extract text
        return teletype.extractText(doc)
    
    except Exception as e:
        logger.error(f"Error extracting text from ODT: {str(e)}")
        return ""


def extract_text_from_txt(file_path: str) -> str:
    """
    Extract text from TXT file
    
    Args:
        file_path: TXT file path
        
    Returns:
        str: Extracted text
    """
    try:
        # Open text file
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        
        return text
    
    except Exception as e:
        logger.error(f"Error extracting text from TXT: {str(e)}")
        
        # Try with different encoding
        try:
            with open(file_path, 'r', encoding='latin-1', errors='ignore') as f:
                text = f.read()
            
            return text
        
        except Exception as e:
            logger.error(f"Error extracting text with alternative encoding: {str(e)}")
            return ""


def extract_text_from_rtf(file_path: str) -> str:
    """
    Extract text from RTF file
    
    Args:
        file_path: RTF file path
        
    Returns:
        str: Extracted text
    """
    try:
        # Simple approach - strip RTF tags
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        
        # Remove RTF control sequences
        text = re.sub(r'\\[a-z]+\d*', ' ', text)
        text = re.sub(r'[{}]', '', text)
        text = re.sub(r'\\[\'a-f0-9]{2}', '', text)
        text = re.sub(r'\\\'[0-9a-f]{2}', '', text)
        text = re.sub(r'\\[^a-z]', '', text)
        
        return text
    
    except Exception as e:
        logger.error(f"Error extracting text from RTF: {str(e)}")
        return ""


def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from file based on file type
    
    Args:
        file_path: File path
        
    Returns:
        str: Extracted text
    """
    try:
        # Get file extension
        extension = get_file_extension(file_path)
        
        if extension == 'pdf':
            return extract_text_from_pdf(file_path)
        elif extension == 'docx':
            return extract_text_from_docx(file_path)
        elif extension == 'txt':
            return extract_text_from_txt(file_path)
        elif extension == 'rtf':
            return extract_text_from_rtf(file_path)
        elif extension == 'odt':
            return extract_text_from_odt(file_path)
        else:
            logger.error(f"Unsupported file type: {extension}")
            return ""
    
    except Exception as e:
        logger.error(f"Error extracting text from file: {str(e)}")
        return ""


def create_temp_file(content: str, filename: Optional[str] = None) -> str:
    """
    Create temporary file
    
    Args:
        content: File content
        filename: Optional filename
        
    Returns:
        str: Temporary file path
    """
    try:
        # Generate temporary filename if not provided
        if not filename:
            filename = f"temp_{uuid.uuid4()}.txt"
        
        # Ensure temp directory exists
        os.makedirs(TEMP_DIR, exist_ok=True)
        
        # Create temp file path
        temp_path = os.path.join(TEMP_DIR, filename)
        
        # Write content to file
        with open(temp_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return temp_path
    
    except Exception as e:
        logger.error(f"Error creating temp file: {str(e)}")
        return ""


def save_text_as_file(text: str, filename: str, directory: Optional[str] = None) -> Tuple[bool, str]:
    """
    Save text as file
    
    Args:
        text: Text content
        filename: Filename
        directory: Target directory (default: UPLOAD_DIR)
        
    Returns:
        tuple: (success, saved_path)
    """
    try:
        # Set target directory
        target_dir = directory or UPLOAD_FOLDER
        
        # Ensure directory exists
        os.makedirs(target_dir, exist_ok=True)
        
        # Set target path
        target_path = os.path.join(target_dir, filename)
        
        # Save file
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        return True, target_path
    
    except Exception as e:
        logger.error(f"Error saving text as file: {str(e)}")
        return False, str(e)


def clean_temp_files(max_age_hours: int = 24) -> int:
    """
    Clean temporary files older than specified age
    
    Args:
        max_age_hours: Maximum age in hours
        
    Returns:
        int: Number of files removed
    """
    try:
        if not os.path.exists(TEMP_DIR):
            return 0
        
        # Get current time
        now = datetime.now()
        
        # Track removed files
        removed_count = 0
        
        # Iterate through temp files
        for filename in os.listdir(TEMP_DIR):
            file_path = os.path.join(TEMP_DIR, filename)
            
            # Skip if not a file
            if not os.path.isfile(file_path):
                continue
            
            # Get file modification time
            mod_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            
            # Calculate age in hours
            age_hours = (now - mod_time).total_seconds() / 3600
            
            # Delete if older than max age
            if age_hours > max_age_hours:
                os.remove(file_path)
                removed_count += 1
        
        return removed_count
    
    except Exception as e:
        logger.error(f"Error cleaning temp files: {str(e)}")
        return 0


def get_file_url(file_path: str) -> str:
    """
    Get public URL for file
    
    Args:
        file_path: File path
        
    Returns:
        str: File URL
    """
    # If already a URL, return as is
    if file_path.startswith(('http://', 'https://')):
        return file_path
    
    # For local storage, determine relative path from UPLOAD_FOLDER
    if file_path.startswith(UPLOAD_FOLDER):
        rel_path = os.path.relpath(file_path, UPLOAD_FOLDER)
        return f"/uploads/{rel_path}"
    
    # Otherwise return as is
    return file_path


def detect_sections(text: str) -> Dict[str, str]:
    """
    Detect document sections
    
    Args:
        text: Document text
        
    Returns:
        dict: Detected sections
    """
    # Common resume section headings
    section_patterns = {
        'contact': r'(?i)(contact|personal)(?:\s+information)?',
        'summary': r'(?i)(summary|profile|objective|about me|personal statement)',
        'education': r'(?i)(education|academic|qualifications)',
        'experience': r'(?i)(experience|employment|work|history|background)',
        'skills': r'(?i)(skills|expertise|competencies|technologies)',
        'projects': r'(?i)(projects|portfolio)',
        'certifications': r'(?i)(certifications|certificates|licenses)',
        'languages': r'(?i)(languages)',
        'awards': r'(?i)(awards|honors|achievements)',
        'publications': r'(?i)(publications|research)',
        'references': r'(?i)(references|recommendations)',
        'volunteer': r'(?i)(volunteer|community)'
    }
    
    # Find all potential section headings and their positions
    section_positions = []
    for section, pattern in section_patterns.items():
        for match in re.finditer(pattern, text, re.MULTILINE):
            section_positions.append((match.start(), section, match.group()))
    
    # Sort by position
    section_positions.sort()
    
    if not section_positions:
        return {'full_text': text}
    
    # Extract text for each section
    sections = {}
    for i, (pos, section, heading) in enumerate(section_positions):
        start = pos
        
        # Find end position (start of next section or end of text)
        if i < len(section_positions) - 1:
            end = section_positions[i + 1][0]
        else:
            end = len(text)
        
        # Extract section text
        section_text = text[start:end].strip()
        sections[section] = section_text
    
    return sections
