"""
File Handler Module

This module provides utilities for reading, processing, and extracting content from
different file types used in the Tamkeen AI Career Intelligence System.
"""

import os
import re
import tempfile
from typing import Dict, List, Any, Optional, Tuple, Union, BinaryIO
import logging

# Import file utilities
from .file_utils import get_file_extension

# Setup logger
logger = logging.getLogger(__name__)

# Try importing document parsing libraries
try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    logger.warning("python-docx not available. Install with: pip install python-docx")

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    logger.warning("PyPDF2 not available. Install with: pip install PyPDF2")

try:
    from pdfminer.high_level import extract_text as pdf_extract_text
    PDFMINER_AVAILABLE = True
except ImportError:
    PDFMINER_AVAILABLE = False
    logger.warning("pdfminer.six not available. Install with: pip install pdfminer.six")


def read_text_file(file_path: str) -> str:
    """
    Read content from a text file
    
    Args:
        file_path: Path to text file
        
    Returns:
        str: Text content
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading text file {file_path}: {e}")
        return ""


def read_docx_file(file_path: str) -> str:
    """
    Extract text from a DOCX file
    
    Args:
        file_path: Path to DOCX file
        
    Returns:
        str: Extracted text
    """
    if not DOCX_AVAILABLE:
        logger.error("python-docx is not installed")
        return ""
    
    try:
        doc = docx.Document(file_path)
        full_text = []
        
        # Extract text from paragraphs
        for para in doc.paragraphs:
            full_text.append(para.text)
        
        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    full_text.append(cell.text)
        
        return '\n'.join(full_text)
    except Exception as e:
        logger.error(f"Error reading DOCX file {file_path}: {e}")
        return ""


def read_pdf_file(file_path: str) -> str:
    """
    Extract text from a PDF file
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        str: Extracted text
    """
    # Try pdfminer.six first (better quality)
    if PDFMINER_AVAILABLE:
        try:
            return pdf_extract_text(file_path)
        except Exception as e:
            logger.warning(f"pdfminer.six extraction failed, trying PyPDF2: {e}")
    
    # Fall back to PyPDF2
    if PYPDF2_AVAILABLE:
        try:
            text = ""
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page_num in range(len(reader.pages)):
                    text += reader.pages[page_num].extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error reading PDF file {file_path}: {e}")
            return ""
    
    logger.error("No PDF extraction library available")
    return ""


def read_rtf_file(file_path: str) -> str:
    """
    Extract text from an RTF file
    
    Args:
        file_path: Path to RTF file
        
    Returns:
        str: Extracted text
    """
    try:
        # Convert RTF to text using a simple approach
        with open(file_path, 'r', errors='ignore') as f:
            content = f.read()
        
        # Remove RTF control sequences
        text = re.sub(r'\\[a-z]{1,32}[-]?[0-9]*[ ]?', ' ', content)
        text = re.sub(r'[{}]|\\\n|\\\r', '', text)
        text = re.sub(r'\s+', ' ', text)
        
        return text
    except Exception as e:
        logger.error(f"Error reading RTF file {file_path}: {e}")
        return ""


def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from a file based on its extension
    
    Args:
        file_path: Path to file
        
    Returns:
        str: Extracted text
    """
    extension = get_file_extension(file_path).lower()
    
    if extension == 'txt':
        return read_text_file(file_path)
    elif extension == 'docx':
        return read_docx_file(file_path)
    elif extension == 'doc':
        logger.warning("DOC format is not directly supported. Convert to DOCX for better results.")
        return ""
    elif extension == 'pdf':
        return read_pdf_file(file_path)
    elif extension == 'rtf':
        return read_rtf_file(file_path)
    else:
        logger.warning(f"Unsupported file extension: {extension}")
        return ""


def extract_images_from_file(file_path: str, output_dir: Optional[str] = None) -> List[str]:
    """
    Extract images from a document file
    
    Args:
        file_path: Path to document file
        output_dir: Directory to save extracted images
        
    Returns:
        list: Paths to extracted images
    """
    extension = get_file_extension(file_path).lower()
    image_paths = []
    
    # Create temp directory if output_dir not provided
    if output_dir is None:
        output_dir = tempfile.mkdtemp()
    else:
        os.makedirs(output_dir, exist_ok=True)
    
    # Extract from DOCX
    if extension == 'docx' and DOCX_AVAILABLE:
        try:
            doc = docx.Document(file_path)
            image_index = 0
            
            for rel in doc.part.rels.values():
                if "image" in rel.target_ref:
                    image_index += 1
                    image_path = os.path.join(output_dir, f"image_{image_index}.png")
                    
                    with open(image_path, 'wb') as f:
                        f.write(rel.target_part.blob)
                    
                    image_paths.append(image_path)
        except Exception as e:
            logger.error(f"Error extracting images from DOCX: {e}")
    
    # Extract from PDF
    elif extension == 'pdf' and PYPDF2_AVAILABLE:
        # Note: Image extraction from PDFs is complex
        # This is a simplified placeholder for the functionality
        logger.warning("Image extraction from PDF not implemented")
    
    return image_paths


def preprocess_text(text: str, 
                  remove_stopwords: bool = False,
                  normalize_whitespace: bool = True,
                  lowercase: bool = True) -> str:
    """
    Preprocess text for analysis
    
    Args:
        text: Input text
        remove_stopwords: Whether to remove stopwords
        normalize_whitespace: Whether to normalize whitespace
        lowercase: Whether to convert to lowercase
        
    Returns:
        str: Preprocessed text
    """
    if not text:
        return ""
    
    # Lowercase
    if lowercase:
        text = text.lower()
    
    # Normalize whitespace
    if normalize_whitespace:
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
    
    # Remove stopwords
    if remove_stopwords:
        try:
            import nltk
            from nltk.corpus import stopwords
            
            # Download stopwords if needed
            try:
                nltk.data.find('corpora/stopwords')
            except LookupError:
                nltk.download('stopwords', quiet=True)
            
            stop_words = set(stopwords.words('english'))
            words = text.split()
            filtered_words = [w for w in words if w.lower() not in stop_words]
            text = ' '.join(filtered_words)
        except ImportError:
            logger.warning("NLTK not available. Skipping stopword removal.")
    
    return text


def extract_metadata(file_path: str) -> Dict[str, Any]:
    """
    Extract metadata from a file
    
    Args:
        file_path: Path to file
        
    Returns:
        dict: File metadata
    """
    extension = get_file_extension(file_path).lower()
    metadata = {
        'file_name': os.path.basename(file_path),
        'file_size': os.path.getsize(file_path),
        'file_type': extension,
        'creation_time': os.path.getctime(file_path),
        'modification_time': os.path.getmtime(file_path)
    }
    
    # Extract document-specific metadata
    if extension == 'docx' and DOCX_AVAILABLE:
        try:
            doc = docx.Document(file_path)
            core_props = doc.core_properties
            
            # Add document properties
            metadata.update({
                'title': core_props.title,
                'author': core_props.author,
                'created': core_props.created,
                'modified': core_props.modified,
                'last_modified_by': core_props.last_modified_by,
                'revision': core_props.revision,
                'word_count': len(doc.paragraphs)
            })
        except Exception as e:
            logger.error(f"Error extracting DOCX metadata: {e}")
    
    elif extension == 'pdf' and PYPDF2_AVAILABLE:
        try:
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                info = reader.metadata
                
                if info:
                    # Add PDF properties
                    metadata.update({
                        'title': info.get('/Title', ''),
                        'author': info.get('/Author', ''),
                        'creator': info.get('/Creator', ''),
                        'producer': info.get('/Producer', ''),
                        'page_count': len(reader.pages)
                    })
        except Exception as e:
            logger.error(f"Error extracting PDF metadata: {e}")
    
    return metadata


def is_parseable(file_path: str) -> bool:
    """
    Check if a file can be parsed for text
    
    Args:
        file_path: Path to file
        
    Returns:
        bool: True if file can be parsed
    """
    extension = get_file_extension(file_path).lower()
    parseable_extensions = ['txt', 'pdf', 'docx', 'rtf']
    
    if extension not in parseable_extensions:
        return False
    
    # Additional checks for specific formats
    if extension == 'pdf' and not (PDFMINER_AVAILABLE or PYPDF2_AVAILABLE):
        return False
    
    if extension == 'docx' and not DOCX_AVAILABLE:
        return False
    
    return True


def convert_file_to_text(file_path: str, output_path: Optional[str] = None) -> str:
    """
    Convert a document file to plain text file
    
    Args:
        file_path: Path to source file
        output_path: Path to output text file (optional)
        
    Returns:
        str: Path to output text file
    """
    # Extract text from file
    text = extract_text_from_file(file_path)
    
    # Generate output path if not provided
    if output_path is None:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_dir = os.path.dirname(file_path)
        output_path = os.path.join(output_dir, f"{base_name}.txt")
    
    # Write text to file
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        return output_path
    except Exception as e:
        logger.error(f"Error writing text to file: {e}")
        return ""


def extract_file_sections(text: str) -> Dict[str, str]:
    """
    Extract common document sections based on headings
    
    Args:
        text: Document text
        
    Returns:
        dict: Sections with their content
    """
    # Common section titles in resumes and documents
    section_patterns = {
        'summary': r'(?i)(professional\s+summary|summary|profile|objective)',
        'experience': r'(?i)(work\s+experience|experience|employment|work\s+history)',
        'education': r'(?i)(education|academic|qualifications|training)',
        'skills': r'(?i)(skills|technical\s+skills|core\s+competencies|expertise)',
        'projects': r'(?i)(projects|personal\s+projects)',
        'achievements': r'(?i)(achievements|accomplishments|awards)',
        'certificates': r'(?i)(certifications|certificates|credentials)',
        'languages': r'(?i)(languages|language\s+proficiencies)',
        'interests': r'(?i)(interests|activities|hobbies)',
        'references': r'(?i)(references)'
    }
    
    # Find all section headers and their positions
    sections = {}
    section_positions = []
    
    for section_name, pattern in section_patterns.items():
        for match in re.finditer(pattern, text):
            # Find the start of the line containing the match
            line_start = text.rfind('\n', 0, match.start()) + 1
            if line_start == 0:  # Handle case where the section is at the start of text
                line_start = 0
            
            # Find the end of the line
            line_end = text.find('\n', match.end())
            if line_end == -1:  # Handle case where the section is at the end of text
                line_end = len(text)
            
            # Extract the full header line
            header = text[line_start:line_end].strip()
            
            section_positions.append((line_start, section_name, header))
    
    # Sort sections by their position in the document
    section_positions.sort()
    
    # Extract content between sections
    for i, (start_pos, section_name, header) in enumerate(section_positions):
        # Find the end of this section (start of next section or end of text)
        if i < len(section_positions) - 1:
            end_pos = section_positions[i+1][0]
        else:
            end_pos = len(text)
        
        # Extract section content (excluding the header)
        header_end = start_pos + len(header)
        content = text[header_end:end_pos].strip()
        
        sections[section_name] = content
    
    return sections


def count_words(text: str) -> int:
    """
    Count words in text
    
    Args:
        text: Input text
        
    Returns:
        int: Word count
    """
    if not text:
        return 0
    
    # Split by whitespace and count non-empty words
    words = [w for w in re.split(r'\s+', text) if w]
    return len(words)


def detect_language(text: str) -> str:
    """
    Detect the language of text
    
    Args:
        text: Input text
        
    Returns:
        str: Detected language code
    """
    try:
        from langdetect import detect
        return detect(text)
    except ImportError:
        logger.warning("langdetect not available. Install with: pip install langdetect")
        return "unknown"
    except Exception as e:
        logger.error(f"Error detecting language: {e}")
        return "unknown"
