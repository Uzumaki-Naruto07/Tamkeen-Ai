"""
Text Preprocessing Module

This module provides utilities for preprocessing and analyzing text for the
Tamkeen AI Career Intelligence System, with a focus on resume and career-related content.
"""

import re
import string
from typing import List, Dict, Any, Set, Optional, Tuple
import logging

# Setup logger
logger = logging.getLogger(__name__)

# Try importing NLP libraries
try:
    import nltk
    from nltk.tokenize import word_tokenize, sent_tokenize
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    
    # Initialize NLTK resources
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
    logger.warning("NLTK not available. Install with: pip install nltk")

# Try importing spaCy
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
        SPACY_AVAILABLE = True
    except OSError:
        logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")
        SPACY_AVAILABLE = False
except ImportError:
    SPACY_AVAILABLE = False
    logger.warning("spaCy not available. Install with: pip install spacy")


def clean_text(text: str) -> str:
    """
    Clean text by removing non-printable characters, excess whitespace, etc.
    
    Args:
        text: Input text
        
    Returns:
        str: Cleaned text
    """
    if not text:
        return ""
    
    # Replace multiple newlines with a single one
    text = re.sub(r'\n+', '\n', text)
    
    # Replace tabs with spaces
    text = text.replace('\t', ' ')
    
    # Replace multiple spaces with a single one
    text = re.sub(r' +', ' ', text)
    
    # Remove non-printable characters
    text = ''.join(c for c in text if c.isprintable() or c == '\n')
    
    # Remove specific ASCII artifacts often found in parsed PDFs
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)
    
    return text.strip()


def tokenize_text(text: str) -> List[str]:
    """
    Tokenize text into words
    
    Args:
        text: Input text
        
    Returns:
        list: Tokenized words
    """
    if not text:
        return []
    
    if NLTK_AVAILABLE:
        return word_tokenize(text)
    
    # Simple tokenization if NLTK is not available
    # Remove punctuation and split by whitespace
    translator = str.maketrans('', '', string.punctuation)
    text = text.translate(translator)
    return text.split()


def remove_stopwords(tokens: List[str]) -> List[str]:
    """
    Remove stopwords from tokenized text
    
    Args:
        tokens: List of tokens
        
    Returns:
        list: Filtered tokens
    """
    if not tokens:
        return []
    
    if NLTK_AVAILABLE:
        return [token for token in tokens if token.lower() not in STOP_WORDS]
    
    # Use a small set of common stopwords if NLTK is not available
    common_stopwords = {
        'a', 'an', 'the', 'and', 'or', 'but', 'if', 'of', 'at', 'by', 'for', 
        'with', 'about', 'to', 'from', 'in', 'on', 'is', 'was', 'were', 'be', 
        'been', 'being', 'am', 'are', 'this', 'that', 'these', 'those', 'i', 
        'me', 'my', 'mine', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 
        'her', 'hers', 'it', 'its', 'we', 'us', 'our', 'ours', 'they', 'them', 
        'their', 'theirs'
    }
    
    return [token for token in tokens if token.lower() not in common_stopwords]


def lemmatize_tokens(tokens: List[str]) -> List[str]:
    """
    Lemmatize tokens (reduce to base form)
    
    Args:
        tokens: List of tokens
        
    Returns:
        list: Lemmatized tokens
    """
    if not tokens:
        return []
    
    if NLTK_AVAILABLE:
        return [LEMMATIZER.lemmatize(token) for token in tokens]
    
    # Return original tokens if NLTK is not available
    return tokens


def extract_entities(text: str) -> Dict[str, List[str]]:
    """
    Extract named entities from text
    
    Args:
        text: Input text
        
    Returns:
        dict: Dictionary of entity types and values
    """
    entities = {
        'person': [],
        'organization': [],
        'location': [],
        'date': [],
        'skill': [],
        'job_title': []
    }
    
    if not text:
        return entities
    
    # Use spaCy for entity extraction if available
    if SPACY_AVAILABLE:
        doc = nlp(text)
        
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                entities['person'].append(ent.text)
            elif ent.label_ == 'ORG':
                entities['organization'].append(ent.text)
            elif ent.label_ == 'GPE' or ent.label_ == 'LOC':
                entities['location'].append(ent.text)
            elif ent.label_ == 'DATE':
                entities['date'].append(ent.text)
        
        # Deduplicate entities
        for entity_type in entities:
            entities[entity_type] = list(set(entities[entity_type]))
    
    # Extract potential skills (requires a separate skill detection function)
    skills = extract_skills(text)
    if skills:
        entities['skill'] = skills
    
    # Extract potential job titles
    job_titles = extract_job_titles(text)
    if job_titles:
        entities['job_title'] = job_titles
    
    return entities


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted skills
    """
    # This is a simplified skill extraction method
    # A complete implementation would use a skills taxonomy/database
    
    # Common technical skills keywords
    tech_skills = {
        'python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift',
        'html', 'css', 'sql', 'nosql', 'react', 'angular', 'vue', 'node.js',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
        'machine learning', 'deep learning', 'ai', 'artificial intelligence',
        'data science', 'big data', 'hadoop', 'spark', 'tableau', 'power bi',
        'excel', 'word', 'powerpoint', 'photoshop', 'illustrator', 'figma'
    }
    
    # Common soft skills keywords
    soft_skills = {
        'leadership', 'communication', 'teamwork', 'problem solving',
        'critical thinking', 'time management', 'project management',
        'adaptability', 'creativity', 'collaboration', 'presentation',
        'negotiation', 'conflict resolution', 'customer service'
    }
    
    # Combine all skills
    all_skills = tech_skills.union(soft_skills)
    
    # Find skills in text
    found_skills = []
    text_lower = text.lower()
    
    for skill in all_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return found_skills


def extract_job_titles(text: str) -> List[str]:
    """
    Extract job titles from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted job titles
    """
    # Common job titles
    common_titles = {
        'software engineer', 'data scientist', 'product manager', 'project manager',
        'web developer', 'frontend developer', 'backend developer', 'full stack developer',
        'ux designer', 'ui designer', 'graphic designer', 'marketing manager',
        'sales manager', 'business analyst', 'data analyst', 'financial analyst',
        'accountant', 'hr manager', 'recruiter', 'operation manager', 'ceo', 'cto',
        'cfo', 'coo', 'director', 'team lead', 'supervisor', 'coordinator', 'specialist'
    }
    
    # Find job titles in text
    found_titles = []
    text_lower = text.lower()
    
    for title in common_titles:
        if title in text_lower:
            found_titles.append(title)
    
    return found_titles


def extract_dates(text: str) -> List[str]:
    """
    Extract dates from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted dates
    """
    # Simple pattern matching for common date formats
    date_patterns = [
        r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.\s]+\d{1,2}(?:[,.\s]+\d{2,4})?\b',
        r'\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b',
        r'\b\d{4}[/.-]\d{1,2}[/.-]\d{1,2}\b',
        r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.\s]+\d{4}\b',
        r'\b\d{4}\s*-\s*(?:present|current|now)\b',
        r'\b\d{4}\s*-\s*\d{4}\b'
    ]
    
    dates = []
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        dates.extend(matches)
    
    return dates


def extract_contact_info(text: str) -> Dict[str, str]:
    """
    Extract contact information from text
    
    Args:
        text: Input text
        
    Returns:
        dict: Contact information
    """
    contact_info = {
        'email': '',
        'phone': '',
        'linkedin': '',
        'website': '',
        'address': ''
    }
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_matches = re.findall(email_pattern, text)
    if email_matches:
        contact_info['email'] = email_matches[0]
    
    # Phone pattern
    phone_pattern = r'(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}'
    phone_matches = re.findall(phone_pattern, text)
    if phone_matches:
        contact_info['phone'] = phone_matches[0]
    
    # LinkedIn URL pattern
    linkedin_pattern = r'linkedin\.com/(?:in|company)/[A-Za-z0-9_-]+'
    linkedin_matches = re.findall(linkedin_pattern, text, re.IGNORECASE)
    if linkedin_matches:
        contact_info['linkedin'] = linkedin_matches[0]
    
    # Website pattern
    website_pattern = r'https?://(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:/[A-Za-z0-9._~:/?#[\]@!$&\'()*+,;=]*)?' 
    website_matches = re.findall(website_pattern, text)
    if website_matches:
        # Filter out LinkedIn URLs that were already captured
        websites = [w for w in website_matches if 'linkedin.com' not in w.lower()]
        if websites:
            contact_info['website'] = websites[0]
    
    # Try to extract address (simplified approach)
    # This is challenging and often needs more context
    address_patterns = [
        r'\b\d+\s+[A-Za-z0-9\s,.-]+\b(?:Avenue|Ave|Street|St|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Lane|Ln|Way)\b',
        r'\b[A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}\b'
    ]
    
    for pattern in address_patterns:
        address_matches = re.findall(pattern, text)
        if address_matches:
            contact_info['address'] = address_matches[0]
            break
    
    return contact_info


def extract_education(text: str) -> List[Dict[str, str]]:
    """
    Extract education information from text
    
    Args:
        text: Input text
        
    Returns:
        list: Education entries
    """
    # This is a simplified approach
    # Advanced implementation would use NER and pattern recognition for structure
    
    education_entries = []
    
    # Identify education section
    education_section = None
    
    # Common section headers for education
    education_headers = [
        'education', 'academic background', 'academic qualifications',
        'educational qualifications', 'academic history'
    ]
    
    # Try to find education section
    lines = text.split('\n')
    education_start = -1
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for header in education_headers:
            if header in line_lower:
                education_start = i
                break
        if education_start >= 0:
            break
    
    if education_start >= 0:
        # Extract all text from education section to next section or end
        education_text = '\n'.join(lines[education_start:])
        
        # Common degree keywords
        degree_keywords = [
            'bachelor', 'master', 'phd', 'doctorate', 'mba', 'bs', 'ba', 'ms', 'ma',
            'associate', 'diploma', 'certificate', 'degree'
        ]
        
        # Extract degree information
        for keyword in degree_keywords:
            # Find sentences containing degree keywords
            pattern = r'[^.!?]*(?:\b' + re.escape(keyword) + r'\b)[^.!?]*[.!?]'
            matches = re.findall(pattern, education_text, re.IGNORECASE)
            
            for match in matches:
                # Extract dates
                dates = extract_dates(match)
                year = ''
                if dates:
                    year = dates[0]
                
                # Try to identify institution
                # This is simplified - real implementation would be more robust
                institution = ''
                common_universities = ['university', 'college', 'institute', 'school']
                for univ in common_universities:
                    univ_pattern = r'\b[A-Z][A-Za-z\s]*\s' + re.escape(univ) + r'\b'
                    univ_matches = re.findall(univ_pattern, match)
                    if univ_matches:
                        institution = univ_matches[0]
                        break
                
                education_entries.append({
                    'degree': keyword.title(),
                    'institution': institution,
                    'year': year,
                    'description': match.strip()
                })
    
    return education_entries


def extract_experience(text: str) -> List[Dict[str, str]]:
    """
    Extract work experience information from text
    
    Args:
        text: Input text
        
    Returns:
        list: Experience entries
    """
    # This is a simplified approach
    # Advanced implementation would use NER and pattern recognition for structure
    
    experience_entries = []
    
    # Identify experience section
    experience_section = None
    
    # Common section headers for work experience
    experience_headers = [
        'experience', 'work experience', 'professional experience', 
        'employment history', 'work history', 'career history'
    ]
    
    # Try to find experience section
    lines = text.split('\n')
    experience_start = -1
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for header in experience_headers:
            if header in line_lower:
                experience_start = i
                break
        if experience_start >= 0:
            break
    
    if experience_start >= 0:
        # Extract all text from experience section to next section or end
        experience_text = '\n'.join(lines[experience_start:])
        
        # Try to split experience entries (simplified approach)
        # Typically separated by dates or company/job title headings
        
        # Look for date ranges as potential entry separators
        date_patterns = [
            r'\b\d{4}\s*-\s*(?:present|current|now|\d{4})\b',
            r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.\s]+\d{4}\s*-\s*(?:present|current|now|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.\s]+\d{4})\b'
        ]
        
        # Find potential job entries based on date ranges
        entries = []
        
        for pattern in date_patterns:
            matches = list(re.finditer(pattern, experience_text))
            
            for i, match in enumerate(matches):
                entry_start = match.start()
                
                # Determine entry end (start of next entry or end of text)
                if i < len(matches) - 1:
                    entry_end = matches[i+1].start()
                else:
                    entry_end = len(experience_text)
                
                entries.append(experience_text[entry_start:entry_end].strip())
        
        # Process each entry
        for entry in entries:
            # Extract dates
            dates = extract_dates(entry)
            date_range = ' - '.join(dates) if dates else ''
            
            # Try to extract company/organization
            company = ''
            
            # Look for organization entities if spaCy is available
            if SPACY_AVAILABLE:
                doc = nlp(entry)
                orgs = [ent.text for ent in doc.ents if ent.label_ == 'ORG']
                if orgs:
                    company = orgs[0]
            
            # Extract job title (simplified)
            job_title = ''
            titles = extract_job_titles(entry)
            if titles:
                job_title = titles[0]
            
            # Create an experience entry
            experience_entries.append({
                'title': job_title,
                'company': company,
                'date_range': date_range,
                'description': entry
            })
    
    return experience_entries


def extract_sentences(text: str) -> List[str]:
    """
    Split text into sentences
    
    Args:
        text: Input text
        
    Returns:
        list: List of sentences
    """
    if not text:
        return []
    
    if NLTK_AVAILABLE:
        return sent_tokenize(text)
    
    # Simple sentence splitting if NLTK is not available
    # This is a simplified approach and won't handle all cases correctly
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]


def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """
    Extract important keywords from text
    
    Args:
        text: Input text
        max_keywords: Maximum number of keywords to extract
        
    Returns:
        list: Extracted keywords
    """
    if not text:
        return []
    
    # Clean and normalize text
    text = clean_text(text)
    
    # Tokenize
    tokens = tokenize_text(text)
    
    # Remove stopwords
    tokens = remove_stopwords(tokens)
    
    # Use TF-IDF approach for keyword extraction if spaCy is available
    if SPACY_AVAILABLE:
        # Process with spaCy
        doc = nlp(text)
        
        # Get lemmatized tokens without stopwords and punctuation
        processed_tokens = [token.lemma_ for token in doc 
                         if not token.is_stop and not token.is_punct]
        
        # Create a basic frequency distribution
        word_freq = {}
        for token in processed_tokens:
            if len(token) > 1:  # Filter out single characters
                word_freq[token] = word_freq.get(token, 0) + 1
        
        # Sort by frequency
        keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        # Return top keywords
        return [word for word, freq in keywords[:max_keywords]]
    
    # Fall back to simple frequency counting if spaCy is not available
    word_freq = {}
    for token in tokens:
        if len(token) > 1:  # Filter out single characters
            word_freq[token.lower()] = word_freq.get(token.lower(), 0) + 1
    
    # Sort by frequency
    keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    # Return top keywords
    return [word for word, freq in keywords[:max_keywords]]


def extract_skills(text: str, skill_list: Optional[List[str]] = None) -> List[str]:
    """
    Extract skills from text
    
    Args:
        text: Input text
        skill_list: Optional list of known skills to match against
        
    Returns:
        list: Extracted skills
    """
    if not text:
        return []
    
    # If no skill list is provided, use a small set of common skills
    if skill_list is None:
        skill_list = [
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
    
    found_skills = []
    
    # Normalize text for matching
    text_lower = text.lower()
    
    # Sort skill list by length (longest first) to prioritize specific skills
    # over more general ones
    sorted_skills = sorted(skill_list, key=len, reverse=True)
    
    for skill in sorted_skills:
        # Use word boundary matching for more accurate results
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            # Use the original case from the skill list
            found_skills.append(skill)
    
    return found_skills


def extract_dates(text: str) -> List[str]:
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
                
                dates.append(date_str)
    
    return dates


def extract_phone_numbers(text: str) -> List[str]:
    """
    Extract phone numbers from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted phone numbers
    """
    if not text:
        return []
    
    # Various phone number patterns
    phone_patterns = [
        # US/Canada: (123) 456-7890
        r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        
        # International: +XX XXX XXX XXXX
        r'\+\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}',
        
        # Simple 10-digit: 1234567890
        r'\b\d{10}\b',
        
        # With country code: +1 1234567890
        r'\+\d{1,4}\s?\d{10}'
    ]
    
    phones = []
    
    for pattern in phone_patterns:
        matches = re.findall(pattern, text)
        phones.extend(matches)
    
    return phones


def extract_emails(text: str) -> List[str]:
    """
    Extract email addresses from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted email addresses
    """
    if not text:
        return []
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    
    # Find all matches
    emails = re.findall(email_pattern, text)
    
    return emails


def extract_urls(text: str) -> List[str]:
    """
    Extract URLs from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted URLs
    """
    if not text:
        return []
    
    # URL pattern
    url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*(?:\?\S+)?'
    
    # Also capture URLs without protocol
    domain_pattern = r'(?:www\.)?(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?:/[/\w\.-]*)*(?:\?\S+)?'
    
    # Find all matches
    urls = re.findall(url_pattern, text)
    domains = re.findall(domain_pattern, text)
    
    # Remove domains that are part of URLs already found
    filtered_domains = []
    for domain in domains:
        is_in_url = False
        for url in urls:
            if domain in url:
                is_in_url = True
                break
        if not is_in_url:
            filtered_domains.append(domain)
    
    return urls + filtered_domains


def extract_job_titles(text: str) -> List[str]:
    """
    Extract potential job titles from text
    
    Args:
        text: Input text
        
    Returns:
        list: Extracted job titles
    """
    if not text:
        return []
    
    # List of common job title keywords
    job_title_keywords = [
        "Engineer", "Developer", "Manager", "Director", "Analyst",
        "Specialist", "Consultant", "Coordinator", "Assistant", "Associate",
        "Executive", "Officer", "Supervisor", "Administrator", "Lead",
        "Head", "Chief", "President", "Vice President", "VP",
        "Architect", "Designer", "Writer", "Editor", "Producer",
        "Strategist", "Scientist", "Researcher", "Technician", "Support"
    ]
    
    titles = []
    
    # If spaCy is available, use NER
    if SPACY_AVAILABLE:
        doc = nlp(text)
        
        # Look for job title patterns based on capitalization and keywords
        for sent in doc.sents:
            # Check for patterns that might indicate job titles
            for chunk in sent.noun_chunks:
                for keyword in job_title_keywords:
                    if keyword.lower() in chunk.text.lower():
                        # Extend to include modifiers
                        extended_title = chunk.text
                        
                        # Look for preceding adjectives
                        if chunk.root.i > 0:
                            prev_token = doc[chunk.root.i - 1]
                            if prev_token.pos_ == "ADJ":
                                extended_title = f"{prev_token.text} {extended_title}"
                        
                        titles.append(extended_title)
                        break
        
        # Also look for title case phrases that might be job titles
        title_case_pattern = r'\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b'
        title_case_matches = re.findall(title_case_pattern, text)
        
        for match in title_case_matches:
            for keyword in job_title_keywords:
                if keyword.lower() in match.lower():
                    if match not in titles:
                        titles.append(match)
                    break
    else:
        # Simplified approach without spaCy
        # Look for capitalized phrases containing job keywords
        lines = text.split('\n')
        
        for line in lines:
            words = line.split()
            if len(words) >= 2 and len(words) <= 6:  # Likely job title length
                # Check if any job title keyword is in the line
                has_keyword = any(keyword.lower() in line.lower() for keyword in job_title_keywords)
                
                # Check if mostly title case
                is_title_case = sum(1 for word in words if word and word[0].isupper()) >= len(words) * 0.5
                
                if has_keyword and is_title_case:
                    titles.append(line.strip())
    
    return titles


def extract_education(text: str) -> List[Dict[str, str]]:
    """
    Extract education information from text
    
    Args:
        text: Input text
        
    Returns:
        list: Education entries
    """
    if not text:
        return []
    
    # Identify education section
    education_section = None
    
    # Common section headers for education
    education_headers = [
        'education', 'academic background', 'academic qualifications',
        'educational qualifications', 'academic history', 'qualifications'
    ]
    
    # Common degree keywords
    degree_keywords = [
        'PhD', 'Ph.D', 'Doctorate', 'Doctor of Philosophy',
        'Master', "Master's", 'MS', 'MSc', 'MA', 'MBA', 'M.S.', 'M.A.', 'M.B.A.',
        'Bachelor', "Bachelor's", 'BS', 'BSc', 'BA', 'B.S.', 'B.A.', 'B.Sc.',
        'Associate', 'Diploma', 'Certificate'
    ]
    
    # Try to find education section
    lines = text.split('\n')
    education_start = -1
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for header in education_headers:
            if header in line_lower:
                education_start = i
                break
        if education_start >= 0:
            break
    
    education_entries = []
    
    if education_start >= 0:
        # Extract all text from education section to next section or end
        education_text = '\n'.join(lines[education_start:])
        
        # Extract degree information
        for keyword in degree_keywords:
            # Find sentences containing degree keywords
            pattern = r'[^.!?]*(?:\b' + re.escape(keyword) + r'\b)[^.!?]*[.!?]'
            matches = re.findall(pattern, education_text, re.IGNORECASE)
            
            for match in matches:
                # Extract dates
                dates = extract_dates(match)
                year = ''
                if dates:
                    year = dates[0]
                
                # Try to identify institution
                # This is simplified - real implementation would be more robust
                institution = ''
                common_universities = ['university', 'college', 'institute', 'school']
                for univ in common_universities:
                    univ_pattern = r'\b[A-Z][A-Za-z\s]*\s' + re.escape(univ) + r'\b'
                    univ_matches = re.findall(univ_pattern, match)
                    if univ_matches:
                        institution = univ_matches[0]
                        break
                
                education_entries.append({
                    'degree': keyword.title(),
                    'institution': institution,
                    'year': year,
                    'description': match.strip()
                })
    
    return education_entries


def extract_experience(text: str) -> List[Dict[str, str]]:
    """
    Extract work experience information from text
    
    Args:
        text: Input text
        
    Returns:
        list: Experience entries
    """
    # This is a simplified approach
    # Advanced implementation would use NER and pattern recognition for structure
    
    experience_entries = []
    
    # Identify experience section
    experience_section = None
    
    # Common section headers for work experience
    experience_headers = [
        'experience', 'work experience', 'professional experience', 
        'employment history', 'work history', 'career history'
    ]
    
    # Try to find experience section
    lines = text.split('\n')
    experience_start = -1
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        for header in experience_headers:
            if header in line_lower:
                experience_start = i
                break
        if experience_start >= 0:
            break
    
    if experience_start >= 0:
        # Extract all text from experience section to next section or end
        experience_text = '\n'.join(lines[experience_start:])
        
        # Try to split experience entries (simplified approach)
        # Typically separated by dates or company/job title headings
        
        # Look for date ranges as potential entry separators
        date_patterns = [
            r'\b\d{4}\s*-\s*(?:present|current|now|\d{4})\b',
            r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.\s]+\d{4}\s*-\s*(?:present|current|now|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,.\s]+\d{4})\b'
        ]
        
        # Find potential job entries based on date ranges
        entries = []
        
        for pattern in date_patterns:
            matches = list(re.finditer(pattern, experience_text))
            
            for i, match in enumerate(matches):
                entry_start = match.start()
                
                # Determine entry end (start of next entry or end of text)
                if i < len(matches) - 1:
                    entry_end = matches[i+1].start()
                else:
                    entry_end = len(experience_text)
                
                entries.append(experience_text[entry_start:entry_end].strip())
        
        # Process each entry
        for entry in entries:
            # Extract dates
            dates = extract_dates(entry)
            date_range = ' - '.join(dates) if dates else ''
            
            # Try to extract company/organization
            company = ''
            
            # Look for organization entities if spaCy is available
            if SPACY_AVAILABLE:
                doc = nlp(entry)
                orgs = [ent.text for ent in doc.ents if ent.label_ == 'ORG']
                if orgs:
                    company = orgs[0]
            
            # Extract job title (simplified)
            job_title = ''
            titles = extract_job_titles(entry)
            if titles:
                job_title = titles[0]
            
            # Create an experience entry
            experience_entries.append({
                'title': job_title,
                'company': company,
                'date_range': date_range,
                'description': entry
            })
    
    return experience_entries


def extract_personal_info(text: str) -> Dict[str, str]:
    """
    Extract personal information from text
    
    Args:
        text: Input text
        
    Returns:
        dict: Personal information
    """
    personal_info = {
        'name': '',
        'phone': '',
        'email': '',
        'location': '',
        'linkedin': '',
        'website': ''
    }
    
    # Extract name (simplified - assumes name is at the beginning of the resume)
    lines = text.split('\n')
    for line in lines[:5]:  # Check first few lines
        # Name is likely a short line with title case and no special characters
        if 2 <= len(line.split()) <= 4 and all(word[0].isupper() for word in line.split() if word):
            # Avoid lines that look like section headers or titles
            low_line = line.lower()
            if not any(header in low_line for header in ['summary', 'profile', 'objective', 'resume']):
                personal_info['name'] = line.strip()
                break
    
    # Extract phone numbers
    phones = extract_phone_numbers(text)
    if phones:
        personal_info['phone'] = phones[0]
    
    # Extract emails
    emails = extract_emails(text)
    if emails:
        personal_info['email'] = emails[0]
    
    # Extract URLs
    urls = extract_urls(text)
    for url in urls:
        if 'linkedin.com' in url.lower():
            personal_info['linkedin'] = url
        else:
            personal_info['website'] = url
    
    # Extract location (simplified approach)
    # Look for address patterns or location keywords
    location_patterns = [
        r'\b[A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*[\s,]+[A-Z]{2}[\s,]+\d{5}(?:-\d{4})?\b',  # City, State ZIP
        r'\b[A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*[\s,]+[A-Z]{2}\b',  # City, State
    ]
    
    for pattern in location_patterns:
        matches = re.findall(pattern, text)
        if matches:
            personal_info['location'] = matches[0]
            break
    
    return personal_info


def analyze_text_statistics(text: str) -> Dict[str, Any]:
    """
    Analyze statistical properties of text
    
    Args:
        text: Input text
        
    Returns:
        dict: Text statistics
    """
    if not text:
        return {
            'char_count': 0,
            'word_count': 0,
            'sentence_count': 0,
            'avg_word_length': 0,
            'avg_sentence_length': 0
        }
    
    # Count characters (excluding whitespace)
    char_count = sum(1 for c in text if not c.isspace())
    
    # Tokenize text
    words = tokenize_text(text)
    word_count = len(words)
    
    # Get sentences
    sentences = extract_sentences(text)
    sentence_count = len(sentences)
    
    # Calculate averages
    avg_word_length = char_count / word_count if word_count > 0 else 0
    avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
    
    return {
        'char_count': char_count,
        'word_count': word_count,
        'sentence_count': sentence_count,
        'avg_word_length': round(avg_word_length, 2),
        'avg_sentence_length': round(avg_sentence_length, 2)
    }


def get_readability_score(text: str) -> Dict[str, float]:
    """
    Calculate readability scores for text
    
    Args:
        text: Input text
        
    Returns:
        dict: Readability scores
    """
    if not text:
        return {
            'flesch_reading_ease': 0,
            'flesch_kincaid_grade': 0,
            'smog_index': 0
        }
    
    # Get text statistics
    sentences = extract_sentences(text)
    sentence_count = len(sentences)
    
    words = tokenize_text(text)
    word_count = len(words)
    
    # Count syllables (simplified approach)
    def count_syllables(word):
        word = word.lower()
        if len(word) <= 3:
            return 1
        
        # Count vowel groups
        vowels = "aeiouy"
        count = 0
        prev_is_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_is_vowel:
                count += 1
            prev_is_vowel = is_vowel
        
        # Adjust for common patterns
        if word.endswith('e'):
            count -= 1
        if word.endswith('le'):
            count += 1
        if count == 0:
            count = 1
        
        return count
    
    syllable_count = sum(count_syllables(word) for word in words)
    
    # Count complex words (3+ syllables)
    complex_word_count = sum(1 for word in words if count_syllables(word) >= 3)
    
    # Calculate Flesch Reading Ease
    if word_count > 0 and sentence_count > 0:
        flesch_reading_ease = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
    else:
        flesch_reading_ease = 0
    
    # Calculate Flesch-Kincaid Grade Level
    if word_count > 0 and sentence_count > 0:
        flesch_kincaid_grade = 0.39 * (word_count / sentence_count) + 11.8 * (syllable_count / word_count) - 15.59
    else:
        flesch_kincaid_grade = 0
    
    # Calculate SMOG Index
    if sentence_count >= 30:
        smog_index = 1.043 * ((complex_word_count * (30 / sentence_count)) ** 0.5) + 3.1291
    else:
        # Approximation for shorter texts
        smog_index = 0.9 * ((complex_word_count * (30 / max(1, sentence_count))) ** 0.5) + 3
    
    return {
        'flesch_reading_ease': round(flesch_reading_ease, 2),
        'flesch_kincaid_grade': round(flesch_kincaid_grade, 2),
        'smog_index': round(smog_index, 2)
    }