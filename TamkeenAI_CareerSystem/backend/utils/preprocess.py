"""
Text Preprocessing Utility Module

This module provides utilities for text preprocessing, analysis, and information extraction
used in resume parsing, job matching, and other NLP-related tasks.
"""

import re
import string
import json
from typing import Dict, List, Any, Optional, Tuple, Union
import logging
from datetime import datetime
import unicodedata

# Try importing NLP libraries
try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        # Try to load English model
        nlp = spacy.load("en_core_web_sm")
    except:
        # If model not found, try to download it
        try:
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
            nlp = spacy.load("en_core_web_sm")
        except:
            nlp = None
            SPACY_AVAILABLE = False
except ImportError:
    SPACY_AVAILABLE = False
    nlp = None

# Import educational background data
try:
    EDUCATION_DATA_PATH = "backend/data/education_data.json"
    with open(EDUCATION_DATA_PATH, "r", encoding="utf-8") as f:
        EDUCATION_DATA = json.load(f)
except:
    EDUCATION_DATA = {
        "degrees": [
            "bachelor", "bachelors", "b.a.", "b.s.", "b.e.", "b.tech", "b.sc", "undergraduate",
            "master", "masters", "m.a.", "m.s.", "m.e.", "m.tech", "m.sc", "mba", "postgraduate",
            "phd", "ph.d.", "doctorate", "doctoral", "doctor of philosophy",
            "associate", "diploma", "certificate", "certification"
        ],
        "majors": [
            "computer science", "information technology", "software engineering", "data science",
            "artificial intelligence", "machine learning", "cybersecurity", "networking",
            "business administration", "finance", "accounting", "marketing", "economics",
            "electrical engineering", "mechanical engineering", "civil engineering",
            "psychology", "sociology", "communications", "english", "history", "mathematics",
            "physics", "chemistry", "biology", "medicine", "nursing"
        ],
        "institutions": [
            "university", "college", "institute", "school", "academy"
        ]
    }

# Setup logger
logger = logging.getLogger(__name__)


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
    
    # Normalize unicode
    text = unicodedata.normalize('NFKD', text)
    
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    
    # Remove excessive line breaks
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    # Replace tab characters with spaces
    text = text.replace('\t', ' ')
    
    # Remove non-printable characters
    text = ''.join(c for c in text if c.isprintable() or c == '\n')
    
    return text.strip()


def extract_emails(text: str) -> List[str]:
    """
    Extract email addresses from text
    
    Args:
        text: Input text
        
    Returns:
        list: Found email addresses
    """
    if not text:
        return []
    
    # Regex pattern for email addresses
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(pattern, text)
    
    # Remove duplicates and return
    return list(set(emails))


def extract_phone_numbers(text: str) -> List[str]:
    """
    Extract phone numbers from text
    
    Args:
        text: Input text
        
    Returns:
        list: Found phone numbers
    """
    if not text:
        return []
    
    # Regex patterns for different phone number formats
    patterns = [
        r'\+\d{1,3}\s?\(\d{1,4}\)\s?\d{3,4}[-\s]?\d{3,4}',  # +1 (123) 456-7890
        r'\+\d{1,3}\s?\d{1,4}\s?\d{3,4}\s?\d{3,4}',          # +1 123 456 7890
        r'\(\d{3,4}\)\s?\d{3,4}[-\s]?\d{3,4}',               # (123) 456-7890
        r'\d{3}[-\s]?\d{3}[-\s]?\d{4}',                      # 123-456-7890
        r'\d{5}[-\s]?\d{5,7}'                                # 12345-67890
    ]
    
    phone_numbers = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        phone_numbers.extend(matches)
    
    # Remove duplicates and return
    return list(set(phone_numbers))


def extract_urls(text: str) -> List[str]:
    """
    Extract URLs from text
    
    Args:
        text: Input text
        
    Returns:
        list: Found URLs
    """
    if not text:
        return []
    
    # Regex pattern for URLs
    pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+\.[^\s<>"]{2,}'
    urls = re.findall(pattern, text)
    
    # Remove duplicates and return
    return list(set(urls))


def extract_dates(text: str) -> List[Dict[str, Any]]:
    """
    Extract dates from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted dates
    """
    if not text:
        return []
    
    # Patterns for different date formats
    date_patterns = [
        # Year ranges (e.g., 2018-2020, 2019-Present)
        r'\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|[Pp]resent|[Cc]urrent|[Nn]ow)\b',
        
        # Month Year ranges
        r'\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\s*[-–—]\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',
        
        # Single years
        r'\b((?:19|20)\d{2})\b',
        
        # Month Year
        r'\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',
        
        # MM/YYYY or MM-YYYY
        r'\b(0?[1-9]|1[0-2])[/-]((?:19|20)\d{2})\b',
        
        # Full dates (MM/DD/YYYY)
        r'\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])[/-]((?:19|20)\d{2})\b'
    ]
    
    dates = []
    
    for pattern in date_patterns:
        matches = re.findall(pattern, text)
        if matches:
            for match in matches:
                if isinstance(match, tuple):
                    # If the pattern captured groups, join them
                    date_str = '-'.join([part for part in match if part])
                else:
                    date_str = match
                
                dates.append({
                    'date': date_str,
                    'type': 'date'
                })
    
    return dates


def extract_languages(text: str) -> List[Dict[str, str]]:
    """
    Extract languages from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted languages
    """
    if not text:
        return []
    
    # List of common language keywords
    language_keywords = [
        "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean",
        "Portuguese", "Russian", "Italian", "Dutch", "Arabic", "Hindi", "Bengali",
        "Marathi", "Tamil", "Telugu", "Urdu", "Punjabi", "Gujarati", "Bhojpuri",
        "Hakka", "Cantonese", "Mandarin", "Shanghainese", "Wu", "Xinjiang", "Tibetan",
        "Uyghur", "Tajik", "Kazakh", "Uzbek", "Turkish", "Greek", "Hebrew", "Aramaic",
        "Amharic", "Somali", "Swahili", "Kiswahili", "Kinyarwanda", "Rwanda", "Burundi",
        "French", "German", "Italian", "Spanish", "Portuguese", "Dutch", "Russian",
        "Chinese", "Japanese", "Korean", "Arabic", "Hebrew", "Amharic", "Swahili"
    ]
    
    languages = []
    
    # If spaCy is available, use NER
    if SPACY_AVAILABLE and nlp:
        doc = nlp(text)
        
        for ent in doc.ents:
            if ent.label_ == "LANGUAGE":
                language = ent.text
                if language.title() in language_keywords:
                    languages.append({
                        'language': language.title(),
                        'type': 'native'
                    })
    
    # Use regex patterns to find language mentions
    for keyword in language_keywords:
        for window in get_text_windows(text, 200, 100):
            if keyword.lower() in window.lower():
                # Extract language mentions
                for line in window.split('\n'):
                    if keyword.lower() in line.lower():
                        # Common languages
                        for lang in EDUCATION_DATA["degrees"]:
                            if lang.lower() in line.lower():
                                languages.append({
                                    'language': lang.title(),
                                    'type': 'degree'
                                })
    
    # Remove duplicates
    unique_langs = []
    seen = set()
    for lang in languages:
        lang_name = lang['language'] if isinstance(lang, dict) else lang
        if lang_name.lower() not in seen:
            seen.add(lang_name.lower())
            unique_langs.append(lang)
    
    return unique_langs


def extract_entities(text: str, entity_types: List[str] = None) -> Dict[str, List[str]]:
    """
    Extract named entities from text
    
    Args:
        text: Input text
        entity_types: List of entity types to extract (e.g., ["PERSON", "ORG"])
        
    Returns:
        dict: Dictionary of entity types and their values
    """
    if not text or not SPACY_AVAILABLE or not nlp:
        return {}
    
    if not entity_types:
        entity_types = ["PERSON", "ORG", "GPE", "LOC", "PRODUCT", "EVENT", "DATE"]
    
    try:
        doc = nlp(text)
        entities = {}
        
        for ent in doc.ents:
            if ent.label_ in entity_types:
                if ent.label_ not in entities:
                    entities[ent.label_] = []
                
                entities[ent.label_].append(ent.text)
        
        # Remove duplicates
        for entity_type, values in entities.items():
            entities[entity_type] = list(set(values))
        
        return entities
    
    except Exception as e:
        logger.error(f"Error extracting entities: {str(e)}")
        return {}


def get_text_windows(text: str, window_size: int = 200, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping windows for processing
    
    Args:
        text: Input text
        window_size: Size of each window
        overlap: Overlap between windows
        
    Returns:
        list: Text windows
    """
    if not text:
        return []
    
    windows = []
    lines = text.split('\n')
    current_window = []
    current_size = 0
    
    for line in lines:
        current_window.append(line)
        current_size += len(line)
        
        if current_size >= window_size:
            windows.append('\n'.join(current_window))
            
            # Keep overlap for next window
            overlap_lines = []
            overlap_size = 0
            for i in range(len(current_window) - 1, -1, -1):
                line_size = len(current_window[i])
                if overlap_size + line_size <= overlap:
                    overlap_lines.insert(0, current_window[i])
                    overlap_size += line_size
                else:
                    break
            
            current_window = overlap_lines
            current_size = overlap_size
    
    # Add final window if not empty
    if current_window:
        windows.append('\n'.join(current_window))
    
    return windows


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculate text similarity using Jaccard similarity
    
    Args:
        text1: First text
        text2: Second text
        
    Returns:
        float: Similarity score (0-1)
    """
    if not text1 or not text2:
        return 0.0
    
    # Tokenize texts
    tokens1 = set(text1.lower().split())
    tokens2 = set(text2.lower().split())
    
    # Calculate Jaccard similarity
    intersection = len(tokens1.intersection(tokens2))
    union = len(tokens1.union(tokens2))
    
    if union == 0:
        return 0.0
    
    return intersection / union


def extract_text_segments(text: str, start_marker: str, end_marker: Optional[str] = None, 
                         case_insensitive: bool = True) -> List[str]:
    """
    Extract text segments between markers
    
    Args:
        text: Input text
        start_marker: Start marker
        end_marker: End marker (if None, extracts to next start marker or end of text)
        case_insensitive: Whether to ignore case
        
    Returns:
        list: Extracted text segments
    """
    if not text or not start_marker:
        return []
    
    if case_insensitive:
        flags = re.IGNORECASE
    else:
        flags = 0
    
    segments = []
    
    if end_marker:
        pattern = f"{re.escape(start_marker)}(.*?){re.escape(end_marker)}"
        matches = re.finditer(pattern, text, re.DOTALL | flags)
        segments = [match.group(1).strip() for match in matches]
    else:
        # Find all start marker positions
        start_positions = [m.start() for m in re.finditer(re.escape(start_marker), text, flags)]
        
        if not start_positions:
            return []
        
        for i, start_pos in enumerate(start_positions):
            start = start_pos + len(start_marker)
            
            # End at next start marker or end of text
            if i < len(start_positions) - 1:
                end = start_positions[i + 1]
            else:
                end = len(text)
            
            segment = text[start:end].strip()
            segments.append(segment)
    
    return segments


def clean_html(text: str) -> str:
    """
    Remove HTML tags from text
    
    Args:
        text: HTML text
        
    Returns:
        str: Clean text
    """
    if not text:
        return ""
    
    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', ' ', text)
    
    # Replace HTML entities
    entities = {
        '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&amp;': '&',
        '&quot;': '"', '&apos;': "'", '&cent;': '¢', '&pound;': '£',
        '&yen;': '¥', '&euro;': '€', '&copy;': '©', '&reg;': '®'
    }
    
    for entity, char in entities.items():
        clean = clean.replace(entity, char)
    
    # Remove excessive whitespace
    clean = re.sub(r'\s+', ' ', clean)
    
    return clean.strip()