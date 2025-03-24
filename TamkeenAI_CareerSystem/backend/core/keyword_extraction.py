"""
Keyword Extraction Module

This module provides functionality for extracting relevant keywords from text,
particularly focused on job descriptions and resumes.
"""

import os
import re
import json
import logging
import string
from typing import Dict, List, Any, Optional, Tuple, Union
from collections import Counter

# Import utilities
from backend.utils.preprocess import clean_text, normalize_skill

# Import settings
from backend.config.settings import SKILLS_FILE

# Setup logger
logger = logging.getLogger(__name__)

# Try to import optional dependencies
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("scikit-learn not installed. Advanced extraction will be unavailable. Install with: pip install scikit-learn")

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


# Load skills list if file exists
SKILLS_LIST = []
try:
    if os.path.exists(SKILLS_FILE):
        with open(SKILLS_FILE, 'r') as f:
            SKILLS_LIST = json.load(f)
except Exception as e:
    logger.error(f"Error loading skills file: {str(e)}")


def extract_keywords(text: str, method: str = "hybrid", max_keywords: int = 20) -> List[str]:
    """
    Extract keywords from text
    
    Args:
        text: Input text
        method: Extraction method ("tfidf", "rule", "hybrid")
        max_keywords: Maximum number of keywords to return
        
    Returns:
        list: Extracted keywords
    """
    try:
        # Clean text
        clean = clean_text(text)
        
        if method == "tfidf" and SKLEARN_AVAILABLE:
            # Use TF-IDF for extraction
            keywords = _extract_keywords_tfidf(clean, max_keywords)
        elif method == "rule" or not SKLEARN_AVAILABLE:
            # Use rule-based extraction
            keywords = _extract_keywords_rule_based(clean, max_keywords)
        else:
            # Use hybrid approach (default)
            keywords_tfidf = _extract_keywords_tfidf(clean, max_keywords) if SKLEARN_AVAILABLE else []
            keywords_rule = _extract_keywords_rule_based(clean, max_keywords)
            
            # Combine and deduplicate
            keywords = list(set(keywords_tfidf + keywords_rule))
            
            # Limit to max_keywords
            keywords = keywords[:max_keywords]
        
        return keywords
    
    except Exception as e:
        logger.error(f"Error extracting keywords: {str(e)}")
        return []


def extract_skills(text: str, max_skills: int = 20) -> List[str]:
    """
    Extract skills from text
    
    Args:
        text: Input text
        max_skills: Maximum number of skills to return
        
    Returns:
        list: Extracted skills
    """
    try:
        # Clean text
        clean = clean_text(text)
        
        # Extract skills
        skills = []
        
        # Use global skills list if available
        if SKILLS_LIST:
            for skill in SKILLS_LIST:
                # Check if skill is in text
                skill_pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                if re.search(skill_pattern, clean):
                    skills.append(skill)
        
        # Use rule-based extraction as backup
        if len(skills) < max_skills:
            # Extract skill phrases
            rule_skills = _extract_skill_phrases(clean)
            
            # Add new skills
            for skill in rule_skills:
                if skill not in skills:
                    skills.append(skill)
                    
                    if len(skills) >= max_skills:
                        break
        
        return skills[:max_skills]
    
    except Exception as e:
        logger.error(f"Error extracting skills: {str(e)}")
        return []


def _extract_keywords_tfidf(text: str, max_keywords: int = 20) -> List[str]:
    """
    Extract keywords using TF-IDF
    
    Args:
        text: Input text
        max_keywords: Maximum number of keywords to return
        
    Returns:
        list: Extracted keywords
    """
    # Ensure scikit-learn is available
    if not SKLEARN_AVAILABLE:
        return []
    
    try:
        # Tokenize text
        if NLTK_AVAILABLE:
            tokens = word_tokenize(text.lower())
            stop_words = set(stopwords.words('english'))
            tokens = [token for token in tokens if token not in stop_words and token not in string.punctuation]
            
            # Lemmatize tokens
            lemmatizer = WordNetLemmatizer()
            tokens = [lemmatizer.lemmatize(token) for token in tokens]
            
            # Rejoin tokens
            processed_text = ' '.join(tokens)
        else:
            processed_text = text
        
        # Create corpus with similar documents
        corpus = [processed_text]
        
        # Add some variations to improve TF-IDF results
        for i in range(3):
            words = processed_text.split()
            if len(words) > 10:
                # Create variation by removing some words
                import random
                remove_count = int(len(words) * 0.2)
                indices = random.sample(range(len(words)), remove_count)
                variation = ' '.join([w for i, w in enumerate(words) if i not in indices])
                corpus.append(variation)
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_df=0.85,
            min_df=1,
            stop_words='english',
            use_idf=True,
            ngram_range=(1, 3)
        )
        
        # Fit and transform
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # Get feature names
        feature_names = vectorizer.get_feature_names_out()
        
        # Get scores
        scores = zip(feature_names, np.asarray(tfidf_matrix[0].sum(axis=0)).ravel())
        sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)
        
        # Get top keywords
        keywords = [item[0] for item in sorted_scores[:max_keywords]]
        
        return keywords
    
    except Exception as e:
        logger.error(f"Error in TF-IDF keyword extraction: {str(e)}")
        return []


def _extract_keywords_rule_based(text: str, max_keywords: int = 20) -> List[str]:
    """
    Extract keywords using rule-based approach
    
    Args:
        text: Input text
        max_keywords: Maximum number of keywords to return
        
    Returns:
        list: Extracted keywords
    """
    try:
        # Get words
        words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-_]{2,}\b', text.lower())
        
        # Remove common stop words
        common_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
            'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
            'about', 'against', 'between', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over',
            'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
            'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
            'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
            'same', 'so', 'than', 'too', 'very', 'will', 'just', 'should', 'now'
        }
        
        filtered_words = [word for word in words if word not in common_words]
        
        # Count word frequencies
        word_counts = Counter(filtered_words)
        
        # Get phrases
        phrases = _extract_phrases(text)
        phrase_counts = Counter(phrases)
        
        # Combine words and phrases
        all_keywords = []
        
        # Add top phrases
        for phrase, count in phrase_counts.most_common(max_keywords // 2):
            all_keywords.append(phrase)
        
        # Add top words
        for word, count in word_counts.most_common(max_keywords):
            # Check if word is not already part of a phrase
            if not any(word in phrase for phrase in all_keywords):
                all_keywords.append(word)
        
        # Limit to max_keywords
        return all_keywords[:max_keywords]
    
    except Exception as e:
        logger.error(f"Error in rule-based keyword extraction: {str(e)}")
        return []


def _extract_phrases(text: str) -> List[str]:
    """
    Extract potentially meaningful phrases from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted phrases
    """
    phrases = []
    
    # Extract noun phrases (simplified approach)
    noun_phrase_pattern = r'\b([A-Z][a-z]+\s[A-Z][a-z]+|[A-Z][a-z]+\s[a-z]+|[a-z]+\s[A-Z][a-z]+)\b'
    noun_phrases = re.findall(noun_phrase_pattern, text)
    phrases.extend(noun_phrases)
    
    # Extract technical terms
    tech_patterns = [
        r'\b[A-Za-z]+\+\+\b',                      # C++, C#
        r'\b[A-Za-z]+#\b',                         # C#
        r'\b[A-Za-z]+\.[A-Za-z]+\b',               # ASP.NET, Node.js
        r'\b[A-Za-z]+-[A-Za-z]+\b',                # Object-Oriented
        r'\b[A-Za-z]+\s[A-Za-z]+\s[A-Za-z]+\b'     # Three word terms
    ]
    
    for pattern in tech_patterns:
        tech_terms = re.findall(pattern, text)
        phrases.extend(tech_terms)
    
    # Normalize and deduplicate
    normalized_phrases = []
    for phrase in phrases:
        normalized = phrase.lower().strip()
        if normalized and normalized not in normalized_phrases:
            normalized_phrases.append(normalized)
    
    return normalized_phrases


def _extract_skill_phrases(text: str) -> List[str]:
    """
    Extract skill phrases from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted skill phrases
    """
    skill_phrases = []
    
    # Common skill-related prefixes and suffixes
    skill_indicators = [
        r'proficient in\s+([^.,;:]+)',
        r'experience (?:with|in)\s+([^.,;:]+)',
        r'knowledge of\s+([^.,;:]+)',
        r'skilled in\s+([^.,;:]+)',
        r'expertise in\s+([^.,;:]+)',
        r'familiar with\s+([^.,;:]+)',
        r'specializing in\s+([^.,;:]+)',
        r'certified in\s+([^.,;:]+)'
    ]
    
    # Extract skill phrases using indicators
    for pattern in skill_indicators:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            # Clean and normalize skill
            skill = normalize_skill(match.strip())
            if skill and len(skill) > 2:
                skill_phrases.append(skill)
    
    # Extract skills from bullet points
    bullet_pattern = r'[•\-\*]\s+([^•\-\*\n]+)'
    bullet_matches = re.findall(bullet_pattern, text)
    for match in bullet_matches:
        if 3 < len(match) < 50:
            # Likely a concise skill description
            skill = normalize_skill(match.strip())
            if skill:
                skill_phrases.append(skill)
    
    # Deduplicate
    skill_phrases = list(set(skill_phrases))
    
    return skill_phrases 