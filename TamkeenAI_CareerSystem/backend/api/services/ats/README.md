# Advanced ATS Analyzer Service

This module provides a comprehensive ATS (Applicant Tracking System) analysis service with advanced NLP, resume parsing, and job matching capabilities.

## Overview

The ATS analyzer service helps users optimize their resumes for applicant tracking systems by:

1. **Extracting text** from various resume formats (PDF, DOCX, TXT)
2. **Analyzing format** for ATS compatibility
3. **Identifying keywords** from both resumes and job descriptions
4. **Matching content** against job descriptions
5. **Providing recommendations** for improvement
6. **Generating visualizations** of results
7. **Integrating with DeepSeek AI** for advanced analysis (optional)

## Key Components

### 1. Resume Extractor

Extracts text and structure from resume files:
- Supports PDF, DOCX, and TXT formats
- Identifies resume sections (education, experience, skills, etc.)
- Handles preprocessing and cleaning

### 2. Keyword Extractor

Advanced keyword extraction using multiple techniques:
- TF-IDF based extraction
- KeyBERT semantic extraction (if available)
- spaCy NLP-based extraction
- Fallback extraction methods
- Matching against job descriptions

### 3. ATS Analyzer

Main analysis engine that:
- Evaluates resume format compatibility
- Scores resume against job requirements
- Analyzes section completeness and relevance
- Generates actionable recommendations
- Integrates with DeepSeek for AI-powered analysis (when API key is provided)

## API Endpoints

The system exposes several REST API endpoints:

### Basic Analysis
`POST /api/ats/analyze`
- Upload resume file and get basic ATS compatibility analysis

### Advanced Analysis with DeepSeek
`POST /api/ats/analyze-with-deepseek`
- Analyze resume with AI-powered insights from DeepSeek

### Visual Analysis
`POST /api/ats/analyze-with-visuals`
- Generate visualizations for resume analysis

### Keyword Extraction
`POST /api/ats/keywords`
- Extract and match keywords between resume and job description

### Resume Optimization
`POST /api/ats/optimize`
- Get specific optimization suggestions for a resume

### Sample Jobs
`GET /api/ats/sample-jobs`
- Get sample job descriptions for testing

## Setup

### Requirements
- Python 3.8+
- Required libraries (see requirements.txt)
- Optional: DeepSeek API key for AI-powered analysis

### Environment Variables
Set the following environment variables:
- `DEEPSEEK_API_KEY`: Your DeepSeek API key (optional)

### Installation
1. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Optional: Install advanced NLP libraries:
   ```
   python -m spacy download en_core_web_sm
   ```

## Usage Examples

### Basic Resume Analysis

```python
from api.services.ats.ats_analyzer import create_ats_analyzer

# Create analyzer
analyzer = create_ats_analyzer()

# Analyze resume
results = analyzer.analyze_resume(
    resume_path="path/to/resume.pdf",
    job_description="Software engineer with Python experience...",
    job_title="Software Engineer",
    use_semantic_matching=True,
    use_contextual_analysis=True
)

# Print results
print(f"ATS Score: {results['score']}")
print(f"Format Analysis: {results['format_analysis']}")
print(f"Recommendations: {results['recommendations']}")
```

### Advanced Analysis with DeepSeek AI

```python
from api.services.ats.ats_analyzer import create_ats_analyzer

# Create analyzer with API key
analyzer = create_ats_analyzer(api_key="your-deepseek-api-key")

# Analyze resume with DeepSeek
results = analyzer.analyze_resume(
    resume_path="path/to/resume.pdf",
    job_description="Software engineer with Python experience...",
    job_title="Software Engineer",
    use_deepseek=True
)

# Print AI insights
print(f"DeepSeek Analysis: {results['llm_analysis']}")
print(f"Improvement Roadmap: {results['improvement_roadmap']}")
```

## Best Practices

1. **Provide focused job descriptions** for more accurate matching
2. **Use machine-readable PDFs** for better text extraction
3. **Enable semantic matching** for more accurate keyword analysis
4. **Include a DeepSeek API key** for comprehensive AI analysis
5. **Consider section analysis** for targeted improvements

## Limitations

- PDF extraction may be limited for scanned or heavily formatted documents
- AI analysis requires a valid DeepSeek API key
- Performance depends on the quality of extracted text
- Some advanced features require additional libraries 