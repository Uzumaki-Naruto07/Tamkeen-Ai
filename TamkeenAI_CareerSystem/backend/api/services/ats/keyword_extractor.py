"""
Advanced Keyword Extraction Module

This module implements advanced keyword extraction techniques 
for resume analysis and job matching.
"""

import os
import re
import logging
import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Union
from collections import Counter

# Try to import advanced NLP libraries
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import WordNetLemmatizer
    
    # Ensure NLTK resources are downloaded
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
    
    try:
        nltk.data.find('corpora/wordnet')
    except LookupError:
        nltk.download('wordnet', quiet=True)
        
    NLTK_AVAILABLE = True
    STOP_WORDS = set(stopwords.words('english'))
    LEMMATIZER = WordNetLemmatizer()
except ImportError:
    NLTK_AVAILABLE = False
    STOP_WORDS = set()
    LEMMATIZER = None
    logging.warning("NLTK not installed. Some keyword extraction features will be limited.")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("scikit-learn not installed. Advanced keyword extraction will be limited.")

try:
    from keybert import KeyBERT
    KEYBERT_AVAILABLE = True
    # Initialize KeyBERT model (lazy loading - will be initialized when needed)
    KEYBERT_MODEL = None
except ImportError:
    KEYBERT_AVAILABLE = False
    logging.warning("KeyBERT not installed. Advanced keyword extraction will be unavailable.")

try:
    import spacy
    SPACY_AVAILABLE = True
    # Initialize spaCy model (lazy loading)
    NLP_MODEL = None
except ImportError:
    SPACY_AVAILABLE = False
    logging.warning("spaCy not installed. Some entity extraction features will be limited.")

# Setup logger
logger = logging.getLogger(__name__)

def get_keybert_model():
    """Get or initialize the KeyBERT model."""
    global KEYBERT_MODEL
    if KEYBERT_AVAILABLE and KEYBERT_MODEL is None:
        try:
            KEYBERT_MODEL = KeyBERT()
        except Exception as e:
            logger.error(f"Error initializing KeyBERT model: {str(e)}")
            return None
    return KEYBERT_MODEL

def get_spacy_model():
    """Get or initialize the spaCy model."""
    global NLP_MODEL
    if SPACY_AVAILABLE and NLP_MODEL is None:
        try:
            NLP_MODEL = spacy.load("en_core_web_sm")
        except:
            try:
                # Download if not available
                spacy.cli.download("en_core_web_sm")
                NLP_MODEL = spacy.load("en_core_web_sm")
            except Exception as e:
                logger.error(f"Error loading spaCy model: {str(e)}")
                return None
    return NLP_MODEL

def extract_keywords_with_keybert(text: str, top_n: int = 20) -> List[str]:
    """
    Extract keywords using KeyBERT.
    
    Args:
        text: Input text
        top_n: Number of keywords to extract
        
    Returns:
        List of keywords
    """
    if not KEYBERT_AVAILABLE:
        logger.warning("KeyBERT not available. Using fallback method.")
        return extract_keywords_simple(text, top_n)
    
    try:
        model = get_keybert_model()
        if model is None:
            return extract_keywords_simple(text, top_n)
            
        # Extract single-word and two-word keywords
        keywords = model.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 2),
            stop_words='english',
            use_mmr=True,  # Use Maximal Marginal Relevance
            diversity=0.7,  # Balance between relevance and diversity
            top_n=top_n
        )
        
        # Return just the keywords (not scores)
        return [keyword for keyword, score in keywords]
    except Exception as e:
        logger.error(f"Error extracting keywords with KeyBERT: {str(e)}")
        return extract_keywords_simple(text, top_n)

def extract_keywords_with_tfidf(text: str, top_n: int = 20) -> List[str]:
    """
    Extract keywords using TF-IDF.
    
    Args:
        text: Input text
        top_n: Number of keywords to extract
        
    Returns:
        List of keywords
    """
    if not SKLEARN_AVAILABLE:
        logger.warning("scikit-learn not available. Using fallback method.")
        return extract_keywords_simple(text, top_n)
    
    try:
        # Create corpus with similar documents (some variations of input text)
        corpus = [text]
        
        # Create synthetic variations to improve TF-IDF effectiveness
        words = text.split()
        if len(words) > 20:
            for _ in range(3):
                # Remove ~20% of words randomly to create variations
                import random
                remove_count = int(len(words) * 0.2)
                indices = random.sample(range(len(words)), remove_count)
                variation = " ".join([w for i, w in enumerate(words) if i not in indices])
                corpus.append(variation)
        
        # Create vectorizer with custom settings
        vectorizer = TfidfVectorizer(
            max_df=0.85,  # Ignore terms that appear in >85% of docs
            min_df=1,     # Keep terms that appear in at least 1 doc
            stop_words='english',
            use_idf=True,
            ngram_range=(1, 2)  # Use single words and bigrams
        )
        
        # Fit and transform
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # Get feature names
        feature_names = vectorizer.get_feature_names_out()
        
        # Get scores for the first document (original text)
        scores = zip(feature_names, np.asarray(tfidf_matrix[0].sum(axis=0)).ravel())
        sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)
        
        # Get top keywords
        keywords = [item[0] for item in sorted_scores[:top_n]]
        
        return keywords
    except Exception as e:
        logger.error(f"Error extracting keywords with TF-IDF: {str(e)}")
        return extract_keywords_simple(text, top_n)

def extract_keywords_with_spacy(text: str, top_n: int = 20) -> List[str]:
    """
    Extract keywords using spaCy.
    
    Args:
        text: Input text
        top_n: Number of keywords to extract
        
    Returns:
        List of keywords
    """
    if not SPACY_AVAILABLE:
        logger.warning("spaCy not available. Using fallback method.")
        return extract_keywords_simple(text, top_n)
    
    try:
        nlp = get_spacy_model()
        if nlp is None:
            return extract_keywords_simple(text, top_n)
            
        doc = nlp(text)
        
        # Extract noun phrases and named entities
        keywords = []
        
        # Add noun chunks (noun phrases)
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) <= 2:  # Limit to 1-2 word phrases
                keywords.append(chunk.text.lower())
        
        # Add named entities
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PRODUCT', 'GPE', 'SKILL', 'TECH']:  # Focus on relevant entity types
                keywords.append(ent.text.lower())
        
        # Add terms based on part-of-speech patterns
        for token in doc:
            # Include nouns and adjectives
            if token.pos_ in ('NOUN', 'PROPN', 'ADJ') and len(token.text) > 2:
                keywords.append(token.text.lower())
        
        # Count frequencies and get top keywords
        counter = Counter(keywords)
        return [item[0] for item in counter.most_common(top_n)]
    except Exception as e:
        logger.error(f"Error extracting keywords with spaCy: {str(e)}")
        return extract_keywords_simple(text, top_n)

def extract_keywords_simple(text: str, top_n: int = 20) -> List[str]:
    """
    Simple keyword extraction fallback method.
    
    Args:
        text: Input text
        top_n: Number of keywords to extract
        
    Returns:
        List of keywords
    """
    try:
        # Convert to lowercase
        text = text.lower()
        
        # Use NLTK if available
        if NLTK_AVAILABLE:
            # Tokenize
            tokens = word_tokenize(text)
            
            # Remove stopwords and short words
            filtered_tokens = [token for token in tokens 
                            if token.isalpha() 
                            and token not in STOP_WORDS 
                            and len(token) > 2]
            
            # Lemmatize
            lemmatized = [LEMMATIZER.lemmatize(token) for token in filtered_tokens]
            
            # Count frequencies
            counter = Counter(lemmatized)
            
            # Return top keywords
            return [item[0] for item in counter.most_common(top_n)]
        else:
            # Simple tokenization with regex
            words = re.findall(r'\b[a-z][a-z0-9]{2,}\b', text)
            
            # Simple stopwords (common English words)
            simple_stopwords = {'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 
                               'his', 'her', 'they', 'from', 'she', 'will', 'one', 'all', 'would', 'there', 
                               'their', 'what', 'out', 'about', 'who', 'get', 'which'}
            
            # Filter stopwords
            filtered_words = [word for word in words if word not in simple_stopwords]
            
            # Count frequencies
            counter = Counter(filtered_words)
            
            # Return top keywords
            return [item[0] for item in counter.most_common(top_n)]
    except Exception as e:
        logger.error(f"Error in simple keyword extraction: {str(e)}")
        return []

def extract_keywords_advanced(text: str, method: str = "keybert", top_n: int = 20) -> List[str]:
    """
    Extract keywords using the specified method or best available.
    
    Args:
        text: Input text
        method: Extraction method ("keybert", "tfidf", "spacy", or "hybrid")
        top_n: Maximum number of keywords to extract
        
    Returns:
        List of keywords
    """
    if method == "keybert" and KEYBERT_AVAILABLE:
        return extract_keywords_with_keybert(text, top_n)
    elif method == "tfidf" and SKLEARN_AVAILABLE:
        return extract_keywords_with_tfidf(text, top_n)
    elif method == "spacy" and SPACY_AVAILABLE:
        return extract_keywords_with_spacy(text, top_n)
    elif method == "hybrid":
        # Combine results from all available methods
        keywords = []
        
        if KEYBERT_AVAILABLE:
            keywords.extend(extract_keywords_with_keybert(text, top_n))
        
        if SKLEARN_AVAILABLE:
            keywords.extend(extract_keywords_with_tfidf(text, top_n))
        
        if SPACY_AVAILABLE:
            keywords.extend(extract_keywords_with_spacy(text, top_n))
        
        if not keywords:  # If no methods were available
            keywords = extract_keywords_simple(text, top_n)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_keywords = [k for k in keywords if not (k in seen or seen.add(k))]
        
        # Return top N
        return unique_keywords[:top_n]
    else:
        # Use best available method
        if KEYBERT_AVAILABLE:
            return extract_keywords_with_keybert(text, top_n)
        elif SKLEARN_AVAILABLE:
            return extract_keywords_with_tfidf(text, top_n)
        elif SPACY_AVAILABLE:
            return extract_keywords_with_spacy(text, top_n)
        else:
            return extract_keywords_simple(text, top_n)

def calculate_similarity_score(text1: str, text2: str) -> float:
    """
    Calculate similarity score between two texts.
    
    Args:
        text1: First text
        text2: Second text
        
    Returns:
        float: Similarity score (0-100)
    """
    if SKLEARN_AVAILABLE:
        try:
            # Create TF-IDF vectorizer
            vectorizer = TfidfVectorizer(stop_words='english')
            
            # Transform texts to vectors
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            
            # Calculate cosine similarity
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Convert to percentage (0-100)
            return float(cosine_sim * 100)
        except Exception as e:
            logger.error(f"Error calculating TF-IDF similarity: {str(e)}")
            # Fall back to simple word overlap
    
    # Simple word overlap method (fallback)
    try:
        # Tokenize and clean words from both texts
        words1 = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9]{2,}\b', text1.lower()))
        words2 = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9]{2,}\b', text2.lower()))
        
        # Calculate Jaccard similarity: intersection over union
        if not words1 or not words2:
            return 0
            
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return (intersection / union) * 100
    except Exception as e:
        logger.error(f"Error calculating simple similarity: {str(e)}")
        return 0

def find_matching_keywords(resume_text: str, job_description: str) -> Dict[str, List[str]]:
    """
    Find matching and missing keywords between resume and job description.
    
    Args:
        resume_text: Resume text
        job_description: Job description text
        
    Returns:
        dict: Dict with matching and missing keywords
    """
    # Extract keywords from both texts
    resume_keywords = extract_keywords_advanced(resume_text, method="hybrid")
    job_keywords = extract_keywords_advanced(job_description, method="hybrid")
    
    # Find matching keywords (intersection)
    matching_keywords = list(set(resume_keywords).intersection(set(job_keywords)))
    
    # Find missing keywords (difference)
    missing_keywords = list(set(job_keywords) - set(resume_keywords))
    
    return {
        "matching_keywords": matching_keywords,
        "missing_keywords": missing_keywords,
        "resume_keywords": resume_keywords,
        "job_keywords": job_keywords
    } 