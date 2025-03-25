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

def extract_keywords_advanced(text, method="keybert", top_n=20):
    """Extract keywords using advanced methods (KeyBERT if available)."""
    if method == "keybert" and keybert_available:
        # Use KeyBERT with more flexible extraction
        keywords = keybert_model.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 2),  # Extract 1-2 word phrases
            stop_words='english',  # Remove common English stop words
            top_n=top_n,  # Number of top keywords to extract
            use_mmr=True,  # Use Maximal Marginal Relevance for diversity
            diversity=0.5  # Balance between relevance and diversity
        )
        return [keyword for keyword, score in keywords]
    else:
        # Fallback to existing spaCy method
        return extract_keywords(text, max_keywords=top_n)

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

def analyze_resume_with_deepseek(cv_text, job_description):
    """Analyze resume using DeepSeek API with a comprehensive prompt."""
    if not DEEPSEEK_API_KEY:
        return "DeepSeek API key is not configured. Please add it to the environment variables."

    # Truncate texts to manage token limits
    cv_text_truncated = cv_text[:4000]  # Adjust as needed
    job_description_truncated = job_description[:2000]

    prompt = f"""You are an expert ATS (Applicant Tracking System) evaluator.
Compare the following resume and job description with a critical and constructive approach.

RESUME:
{cv_text_truncated}

JOB DESCRIPTION:
{job_description_truncated}

Provide a comprehensive analysis with the following structure:

1. STRENGTHS 🟢
- Highlight the top 5 strengths of the resume
- Explain how these strengths align with the job description

2. WEAKNESSES 🔴
- Identify up to 5 key weaknesses or missing elements
- Suggest specific improvements for each weakness

3. KEYWORD ANALYSIS 🔍
- Top 10 matching keywords
- Top 5 missing keywords
- Recommendations for incorporating missing keywords

4. OVERALL MATCH 📊
- Provide an estimated percentage match
- Detailed reasoning behind the match percentage

5. IMPROVEMENT SUGGESTIONS 🚀
- Concrete, actionable recommendations to enhance resume
- Specific edits to better align with job description

6. CAREER DEVELOPMENT ROADMAP 🚀
- Personalized skill gap analysis
- Comprehensive learning strategy
- Technical and soft skill development
- Career positioning guidance
- Actionable recommendations

Maintain a professional, constructive tone. Focus on helping the candidate improve their resume."""

    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are an expert ATS evaluator providing detailed, constructive resume analysis."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1500
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Error from DeepSeek API: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error using DeepSeek for analysis: {str(e)}"

def get_improvement_roadmap(cv_text, job_description):
    """Generate a comprehensive improvement roadmap using DeepSeek."""
    if not DEEPSEEK_API_KEY:
        return "DeepSeek API key is not configured. Please add it to the environment variables."

    # Truncate texts to manage token limits
    cv_text_truncated = cv_text[:3000]
    job_description_truncated = job_description[:1500]

    prompt = f"""You are an expert career development advisor and AI system architect.
Analyze the following resume and job description to provide a comprehensive, strategic improvement roadmap.

RESUME:
{cv_text_truncated}

JOB DESCRIPTION:
{job_description_truncated}

Please provide a detailed analysis with the following structure:

1. SKILL GAP ANALYSIS 🔍
- Identify critical skills missing from the current resume
- Compare current skills with job requirements
- Rank skills by importance and difficulty to acquire

2. LEARNING ROADMAP 📚
- Recommended courses and certifications
- Suggested learning platforms
- Estimated time to skill proficiency
- Specific resources for each skill gap

3. CAREER DEVELOPMENT STRATEGY 🚀
- Short-term (3-6 months) skill development plan
- Medium-term (6-12 months) career positioning
- Long-term career trajectory alignment

4. TECHNICAL SKILL ENHANCEMENT 💻
- Specific programming languages/tools to learn
- Recommended projects to build practical experience
- Industry-recognized certifications

5. SOFT SKILLS DEVELOPMENT 🤝
- Communication and interpersonal skill improvements
- Leadership and collaboration skill enhancement
- Emotional intelligence and adaptability training

Provide actionable, specific, and motivational guidance that transforms the current skill set into a competitive, future-ready professional profile."""

    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are an expert career development strategist providing comprehensive, personalized improvement guidance."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1500
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Error from DeepSeek API: {response.status_code} - {response.text}"
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