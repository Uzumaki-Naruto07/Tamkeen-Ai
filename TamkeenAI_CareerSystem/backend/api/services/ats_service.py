import io
import re
import json
import requests
import os
from typing import Dict, List, Tuple, Any, Optional
import pdfplumber
import docx
import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Setup logger
logger = logging.getLogger(__name__)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, download it (for first-time setup)
    import subprocess
    subprocess.call([
        "python", "-m", "spacy", "download", "en_core_web_sm"
    ])
    nlp = spacy.load("en_core_web_sm")

# Try to import KeyBERT for advanced keyword extraction
try:
    from keybert import KeyBERT
    keybert_model = KeyBERT()
    keybert_available = True
except ImportError:
    keybert_available = False

# DeepSeek API integration
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')

# Try to import additional NLP libraries
try:
    from nltk.corpus import wordnet
    import spacy
    ADVANCED_NLP_AVAILABLE = True
except ImportError:
    ADVANCED_NLP_AVAILABLE = False
    logger.warning("Advanced NLP libraries not available, some features will be limited")

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text

def extract_text_from_docx(docx_file):
    """Extract text from a DOCX file."""
    text = ""
    try:
        doc = docx.Document(docx_file)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
    return text

def preprocess_text(text):
    """Clean and preprocess text."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\d+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_keywords(text, max_keywords=30):
    """Extract important keywords from text using spaCy."""
    doc = nlp(text)
    keywords = [token.text for token in doc if token.pos_ in ['NOUN', 'PROPN', 'ADJ'] and len(token.text) > 2]
    keyword_freq = {}
    for word in keywords:
        keyword_freq[word] = keyword_freq.get(word, 0) + 1
    sorted_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, freq in sorted_keywords[:max_keywords]]

def extract_keywords_basic(text):
    """Extract basic keywords from text."""
    # Remove special characters and convert to lowercase
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    
    # Tokenize
    words = text.split()
    
    # Remove short words and common stop words
    stop_words = set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
                    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
                    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
                    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
                    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
                    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
                    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
                    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
                    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
                    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
                    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
                    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'])
    
    filtered_words = [word for word in words if len(word) > 2 and word not in stop_words]
    
    # Count word frequencies
    word_freq = {}
    for word in filtered_words:
        if word in word_freq:
            word_freq[word] += 1
        else:
            word_freq[word] = 1
    
    # Get top keywords
    keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, _ in keywords[:50]]  # Return top 50 keywords

def extract_keywords_advanced(text, method="keybert", min_relevance=0.3, max_keywords=50):
    """Extract keywords using advanced methods like KeyBERT."""
    if method == "keybert" and keybert_model:
        # Use KeyBERT for higher quality keyword extraction
        keywords = keybert_model.extract_keywords(
            text, 
            keyphrase_ngram_range=(1, 3), 
            stop_words='english',
            use_mmr=True,
            diversity=0.5,
            top_n=max_keywords
        )
        return [keyword for keyword, score in keywords if score >= min_relevance]
    else:
        # Fallback to basic extraction
        return extract_keywords_basic(text)

def calculate_ats_score(cv_text, job_description):
    """Calculate ATS compatibility score between CV and job description."""
    cv_text_processed = preprocess_text(cv_text)
    job_description_processed = preprocess_text(job_description)
    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform([cv_text_processed, job_description_processed])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    return similarity * 100

def highlight_matching_keywords(cv_text, job_description):
    """Identify matching keywords between CV and job description."""
    cv_keywords = set(extract_keywords(cv_text))
    job_keywords = set(extract_keywords(job_description))
    matching_keywords = cv_keywords.intersection(job_keywords)
    missing_keywords = job_keywords - cv_keywords
    return list(matching_keywords), list(missing_keywords)

def get_keywords_json(cv_text, job_description):
    """Get keywords from both resume and job description as a dict."""
    cv_keywords = extract_keywords_advanced(cv_text, method="keybert" if keybert_available else "spacy")
    job_keywords = extract_keywords_advanced(job_description, method="keybert" if keybert_available else "spacy")
    matching_keywords = list(set(cv_keywords).intersection(set(job_keywords)))
    missing_keywords = list(set(job_keywords) - set(cv_keywords))

    keywords_dict = {
        "resume_keywords": cv_keywords,
        "job_keywords": job_keywords,
        "matching_keywords": matching_keywords,
        "missing_keywords": missing_keywords
    }

    return keywords_dict

def analyze_resume_with_deepseek(cv_text, job_description, industry=None, use_semantic=True, use_contextual=True):
    """Analyze resume using DeepSeek API with a comprehensive prompt."""
    if not DEEPSEEK_API_KEY:
        return "DeepSeek API key is not configured. Please add it to the environment variables."

    # Drastically reduce content size for faster processing
    cv_text_truncated = cv_text[:2500]  # Reduced from 4000 to speed up
    job_description_truncated = job_description[:1000]  # Reduced from 2000 to speed up

    # Enhance prompt with industry context if provided - but keep it brief
    industry_context = ""
    if industry:
        industry_context = f"\nFocus on {industry} industry context."
    
    # Add brief info about analysis methods
    analysis_methods = ""
    if use_semantic and use_contextual:
        analysis_methods = "\nUse semantic and contextual understanding."
    elif use_semantic:
        analysis_methods = "\nUse semantic understanding."
    elif use_contextual:
        analysis_methods = "\nUse contextual analysis."
    
    # Simplified, more direct prompt for faster response
    prompt = f"""You are an ATS evaluator. Analyze this resume against job description quickly.

RESUME:
{cv_text_truncated}

JOB DESCRIPTION:
{job_description_truncated}{industry_context}{analysis_methods}

Provide concise analysis:
1. OVERALL MATCH: Percentage only (e.g., 75%)
2. STRENGTHS: 3 key points
3. WEAKNESSES: 3 key points
4. MATCHING KEYWORDS: List 5-7 keywords
5. MISSING KEYWORDS: List 5-7 keywords
6. FEEDBACK: 2-3 sentences of improvement advice

Be precise and direct. Focus on the most important points only."""

    try:
        # Initialize DeepSeek client
        from openai import OpenAI
        deepseek_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=DEEPSEEK_API_KEY
        )
        
        # Use faster parameters
        response = deepseek_client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[
                {"role": "system", "content": "You provide quick ATS analysis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for faster, more predictable responses
            max_tokens=750  # Reduced tokens for faster response
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error using DeepSeek for analysis: {e}")
        return "Error connecting to DeepSeek API. Try again later."

def find_semantic_matches(cv_text, job_description, threshold=0.75, include_synonyms=True, include_related=True):
    """Find semantically similar terms between resume and job description."""
    if not ADVANCED_NLP_AVAILABLE or nlp is None:
        logger.warning("Semantic matching unavailable - missing required libraries")
        return []
    
    results = []
    
    # Extract keywords from job description
    job_keywords = extract_keywords_basic(job_description)
    
    # Process resume text with spaCy
    cv_doc = nlp(cv_text)
    
    # Find semantic matches for each job keyword
    for keyword in job_keywords:
        matches = []
        job_term = nlp(keyword)
        
        # Look for exact, synonym, and related term matches
        for token in cv_doc:
            if len(token.text) <= 2:  # Skip very short tokens
                continue
                
            # Check for similarity
            if token.has_vector and job_term.has_vector:
                similarity = token.similarity(job_term)
                
                # If similarity is above threshold, add to matches
                if similarity >= threshold:
                    matches.append((token.text, similarity))
            
            # Check for synonyms if requested
            if include_synonyms:
                synonyms = []
                for syn in wordnet.synsets(keyword):
                    for lemma in syn.lemmas():
                        synonyms.append(lemma.name().lower().replace('_', ' '))
                
                if token.text.lower() in synonyms:
                    matches.append((token.text, 0.9))  # High score for synonyms
            
            # Check for related terms if requested
            if include_related and token.has_vector and job_term.has_vector:
                # Add terms that are related but slightly below threshold
                if 0.6 <= token.similarity(job_term) < threshold:
                    matches.append((token.text, token.similarity(job_term)))
        
        # Add unique matches
        if matches:
            unique_matches = {}
            for term, score in matches:
                if term not in unique_matches or score > unique_matches[term]:
                    unique_matches[term] = score
            
            results.append({
                "term": keyword,
                "matches": [term for term, _ in sorted(unique_matches.items(), key=lambda x: x[1], reverse=True)],
                "score": max(score for _, score in unique_matches.items())
            })
    
    return results

def analyze_for_industry(cv_text, job_description, industry):
    """Perform industry-specific analysis of resume."""
    # Industry-specific scores
    industry_specific_scores = {
        "overall": 0,
        "skills_match": 0,
        "experience_relevance": 0,
        "education_fit": 0,
        "format_compliance": 0
    }
    
    # Define industry-specific keywords
    industry_keywords = {
        "technology": [
            "programming", "software", "development", "algorithm", "database", 
            "cloud", "api", "framework", "agile", "scrum", "devops"
        ],
        "healthcare": [
            "patient", "medical", "clinical", "health", "care", "treatment", 
            "diagnosis", "healthcare", "hospital", "physician", "nurse"
        ],
        "finance": [
            "financial", "investment", "banking", "accounting", "portfolio", 
            "audit", "compliance", "budgeting", "forecasting", "risk", "analysis"
        ],
        "marketing": [
            "marketing", "brand", "campaign", "social media", "content", "seo", 
            "analytics", "advertising", "strategy", "customer", "audience"
        ],
        "education": [
            "teaching", "curriculum", "education", "student", "learning", 
            "instruction", "assessment", "classroom", "pedagogy", "academic"
        ]
    }
    
    # Add more industries as needed
    if industry.lower() not in industry_keywords:
        # Default to a generic analysis if industry not specifically defined
        industry_specific_scores["overall"] = 70
        industry_specific_scores["skills_match"] = 65
        industry_specific_scores["experience_relevance"] = 70
        industry_specific_scores["education_fit"] = 75
        industry_specific_scores["format_compliance"] = 80
        return industry_specific_scores
    
    # Use industry-specific keywords for analysis
    industry_terms = industry_keywords[industry.lower()]
    
    # Calculate how many industry terms appear in the resume
    cv_text_lower = cv_text.lower()
    hits = sum(1 for term in industry_terms if term in cv_text_lower)
    industry_specific_scores["skills_match"] = min(100, round((hits / len(industry_terms)) * 100))
    
    # Calculate relevance of experience
    experience_relevance = min(100, round((hits / len(industry_terms)) * 110))  # Slightly boost for experience
    industry_specific_scores["experience_relevance"] = experience_relevance
    
    # Estimate education fit
    education_keywords = ["degree", "bachelor", "master", "phd", "certificate", "certification", "diploma"]
    education_hits = sum(1 for term in education_keywords if term in cv_text_lower)
    industry_specific_scores["education_fit"] = min(100, round((education_hits / len(education_keywords)) * 100))
    
    # Format compliance is generally high if using a standard format
    industry_specific_scores["format_compliance"] = 75
    
    # Calculate overall score as a weighted average
    industry_specific_scores["overall"] = round(
        (industry_specific_scores["skills_match"] * 0.4) +
        (industry_specific_scores["experience_relevance"] * 0.3) +
        (industry_specific_scores["education_fit"] * 0.2) +
        (industry_specific_scores["format_compliance"] * 0.1)
    )
    
    return industry_specific_scores

def extract_score_from_deepseek(analysis_text):
    """Extract the score from DeepSeek analysis text."""
    if not analysis_text:
        return None
        
    # Look for percentage in the OVERALL MATCH section
    match_section = re.search(r'OVERALL MATCH[^\n]*\n(.*?)(?:[\r\n]\d+\.|\Z)', analysis_text, re.DOTALL)
    if match_section:
        # Look for percentage values in this section
        percentages = re.findall(r'(\d{1,3})%', match_section.group(1))
        if percentages:
            # Extract the first percentage found
            try:
                score = int(percentages[0])
                return score if 0 <= score <= 100 else None
            except ValueError:
                pass
    
    # Alternative: look for numbers that might be scores
    score_patterns = [
        r'score[^\n]*?(\d{1,3})%',
        r'match[^\n]*?(\d{1,3})%',
        r'overall[^\n]*?(\d{1,3})%',
        r'compatibility[^\n]*?(\d{1,3})%',
    ]
    
    for pattern in score_patterns:
        score_match = re.search(pattern, analysis_text.lower())
        if score_match:
            try:
                score = int(score_match.group(1))
                return score if 0 <= score <= 100 else None
            except ValueError:
                continue
    
    return None

def get_improvement_roadmap(cv_text, job_description, industry=None):
    """Generate an improvement roadmap for career development."""
    if not DEEPSEEK_API_KEY:
        return "Improvement roadmap unavailable - DeepSeek API key not configured."
    
    # Truncate texts to manage token limits
    cv_text_truncated = cv_text[:3000]
    job_description_truncated = job_description[:1500]
    
    industry_context = ""
    if industry:
        industry_context = f"This analysis is for a candidate in the {industry} industry."
    
    prompt = f"""Based on this resume and job description, create a personalized career development roadmap.
{industry_context}

RESUME:
{cv_text_truncated}

JOB DESCRIPTION:
{job_description_truncated}

Create a structured career development plan with these sections:

1. SKILL GAP ANALYSIS
- Identify key skills missing from the resume that would be valuable for this career path
- Prioritize skills based on current job market demand and future trends

2. LEARNING STRATEGY
- Recommend specific courses, certifications, or learning resources
- Suggest time frames for acquiring each skill or certification
- Include both technical and soft skills development

3. CAREER POSITIONING
- Suggest how to position experience for career advancement
- Identify potential career progression paths based on current skills
- Note emerging opportunities in this field

Format as a clear, actionable roadmap with bullet points and specific recommendations.
"""

    try:
        # Try OpenAI-compatible endpoint first
        from openai import OpenAI
        deepseek_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=DEEPSEEK_API_KEY
        )
        
        response = deepseek_client.chat.completions.create(
            model="deepseek/deepseek-r1:free",
            messages=[
                {"role": "system", "content": "You are a career development expert creating personalized improvement roadmaps."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except (ImportError, Exception) as e:
        # Fallback to direct API call
        try:
            url = "https://api.deepseek.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
            }
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are a career development expert creating personalized improvement roadmaps."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                return f"Error generating improvement roadmap: {response.text}"
        except Exception as e:
            return f"Error generating improvement roadmap: {str(e)}"

def generate_ats_report(cv_text, job_description, job_title):
    """Generate a comprehensive ATS compatibility report."""
    # Get basic ATS score and keywords
    score = calculate_ats_score(cv_text, job_description)
    matching_keywords, missing_keywords = highlight_matching_keywords(cv_text, job_description)

    # Create assessment message
    if score >= 80:
        assessment = "Excellent! Your resume is highly compatible with this job."
    elif score >= 60:
        assessment = "Good. Your resume matches the job requirements reasonably well."
    elif score >= 40:
        assessment = "Average. Consider optimizing your resume for better matching."
    else:
        assessment = "Low match. Your resume needs significant adjustments for this role."

    # Generate full report
    return {
        "score": score,
        "job_title": job_title,
        "matching_keywords": matching_keywords,
        "missing_keywords": missing_keywords,
        "assessment": assessment
    }

def enhanced_ats_report(cv_text, job_description, job_title, include_llm=True):
    """Generate an enhanced ATS report with optional DeepSeek analysis."""
    # Get basic report
    basic_report = generate_ats_report(cv_text, job_description, job_title)
    
    # If LLM analysis is requested and API key is available
    if include_llm and DEEPSEEK_API_KEY:
        # Get DeepSeek analysis
        deepseek_analysis = analyze_resume_with_deepseek(cv_text, job_description)
        
        # Generate improvement roadmap
        improvement_roadmap = get_improvement_roadmap(cv_text, job_description)
        
        # Add to report
        basic_report["llm_analysis"] = deepseek_analysis
        basic_report["improvement_roadmap"] = improvement_roadmap
    
    return basic_report

def enhanced_ats_report_with_visuals(cv_text, job_description, job_title, include_llm=True):
    """
    Generate an enhanced ATS report with visualization data
    This is closer to the Colab implementation
    """
    # Get basic report first
    report = enhanced_ats_report(cv_text, job_description, job_title, include_llm)
    
    # Add visualization data to the report
    from ..utils.visualization_utils import generate_word_cloud_base64, create_comparison_chart_base64
    
    try:
        # Generate word clouds
        cv_wordcloud = generate_word_cloud_base64(cv_text, "Resume Word Cloud")
        job_wordcloud = generate_word_cloud_base64(job_description, "Job Description Word Cloud")
        
        # Generate score chart
        score_chart = create_comparison_chart_base64(report["score"])
        
        # Add to report
        report["visualizations"] = {
            "cv_wordcloud": cv_wordcloud,
            "job_wordcloud": job_wordcloud,
            "score_chart": score_chart
        }
    except Exception as e:
        report["visualizations_error"] = str(e)
    
    return report 