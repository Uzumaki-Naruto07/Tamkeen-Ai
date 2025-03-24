"""
Keyword Recommender Module

This module extracts important keywords from text, job descriptions, and user profiles,
and recommends relevant skills and keywords for career development and resume enhancement.
"""

import os
import re
import json
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime
import math
import logging

# Import settings
from config.settings import BASE_DIR

# Create logger
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

# Try importing scikit-learn for TF-IDF
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logger.warning("scikit-learn not available. Install with: pip install scikit-learn")


class KeywordRecommender:
    """Class for recommending and extracting keywords from text"""
    
    def __init__(self):
        """Initialize with necessary resources"""
        self.skill_data = self._load_skill_data()
        self.job_keywords = self._load_job_keywords()
        self.industry_keywords = self._load_industry_keywords()
    
    def _load_skill_data(self) -> Dict[str, Any]:
        """Load skill data from file or create default data"""
        skills_file = os.path.join(BASE_DIR, 'data', 'skills', 'skills_database.json')
        
        try:
            if os.path.exists(skills_file):
                with open(skills_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading skills database: {e}")
        
        # Default minimal skill data
        return {
            "technical_skills": {
                "programming_languages": [
                    "Python", "Java", "JavaScript", "C++", "C#", "PHP", "Swift", "Kotlin", "Ruby", "Go"
                ],
                "frameworks": [
                    "React", "Angular", "Vue.js", "Django", "Flask", "Spring", "ASP.NET", 
                    "Node.js", "Express.js", "TensorFlow", "PyTorch", "Bootstrap"
                ],
                "database": [
                    "SQL", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle", "Redis", 
                    "Cassandra", "DynamoDB", "Firebase"
                ],
                "devops": [
                    "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "CI/CD", "Jenkins",
                    "Git", "Ansible", "Terraform", "Linux", "Bash"
                ],
                "data_science": [
                    "Machine Learning", "Data Analysis", "Statistics", "Data Visualization",
                    "Pandas", "NumPy", "Scikit-learn", "R", "Tableau", "Power BI"
                ]
            },
            "soft_skills": [
                "Communication", "Teamwork", "Problem Solving", "Critical Thinking", 
                "Time Management", "Leadership", "Adaptability", "Creativity", 
                "Emotional Intelligence", "Conflict Resolution", "Negotiation"
            ],
            "skill_relationships": {
                "Python": ["Django", "Flask", "NumPy", "Pandas", "TensorFlow", "PyTorch", "Data Analysis"],
                "JavaScript": ["React", "Angular", "Vue.js", "Node.js", "Express.js"],
                "Data Analysis": ["Python", "R", "SQL", "Statistics", "Data Visualization", "Pandas", "NumPy"],
                "Machine Learning": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Statistics", "Data Analysis"]
            }
        }
    
    def _load_job_keywords(self) -> Dict[str, List[str]]:
        """Load job-specific keywords"""
        job_keywords_file = os.path.join(BASE_DIR, 'data', 'job_keywords', 'job_keywords.json')
        
        try:
            if os.path.exists(job_keywords_file):
                with open(job_keywords_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading job keywords: {e}")
        
        # Default minimal job keywords
        return {
            "software_engineer": [
                "algorithms", "software development", "object-oriented programming",
                "debugging", "testing", "version control", "API development"
            ],
            "data_scientist": [
                "machine learning", "statistical analysis", "data mining", "data cleaning",
                "feature engineering", "model validation", "data visualization"
            ],
            "web_developer": [
                "responsive design", "frontend", "backend", "full-stack", "UI/UX",
                "web services", "client-side", "server-side", "cross-browser compatibility"
            ],
            "project_manager": [
                "project planning", "resource allocation", "risk management", "stakeholder communication",
                "team leadership", "budget management", "timeline estimation"
            ],
            "marketing_specialist": [
                "campaign management", "market research", "social media marketing", "SEO",
                "content strategy", "brand awareness", "audience targeting", "analytics"
            ]
        }
    
    def _load_industry_keywords(self) -> Dict[str, List[str]]:
        """Load industry-specific keywords"""
        industry_keywords_file = os.path.join(BASE_DIR, 'data', 'keywords', 'industry_keywords.json')
        
        try:
            if os.path.exists(industry_keywords_file):
                with open(industry_keywords_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading industry keywords: {e}")
        
        # Default minimal industry keywords
        return {
            "technology": [
                "digital transformation", "innovation", "cloud computing", "cybersecurity",
                "artificial intelligence", "big data", "Internet of Things", "automation"
            ],
            "healthcare": [
                "patient care", "medical records", "healthcare management", "clinical",
                "patient outcomes", "telehealth", "healthcare compliance", "medical devices"
            ],
            "finance": [
                "financial analysis", "risk assessment", "compliance", "investment",
                "portfolio management", "financial reporting", "budgeting", "forecasting"
            ],
            "education": [
                "curriculum development", "student assessment", "e-learning", "instructional design",
                "educational technology", "student engagement", "learning outcomes"
            ],
            "retail": [
                "customer experience", "omnichannel", "inventory management", "merchandising",
                "point of sale", "supply chain", "retail operations", "consumer behavior"
            ]
        }
    
    def extract_keywords_with_tfidf(self, text: str, max_keywords: int = 15) -> List[Tuple[str, float]]:
        """
        Extract keywords using TF-IDF
        
        Args:
            text: Text to extract keywords from
            max_keywords: Maximum number of keywords to extract
            
        Returns:
            list: List of (keyword, score) tuples
        """
        if not SKLEARN_AVAILABLE:
            logger.warning("scikit-learn not available, using fallback keyword extraction")
            return self.extract_keywords_simple(text, max_keywords)
        
        try:
            # Preprocessing
            sentences = sent_tokenize(text)
            
            # Use TF-IDF to identify important terms
            vectorizer = TfidfVectorizer(
                max_features=100,
                stop_words='english',
                ngram_range=(1, 2)  # Consider unigrams and bigrams
            )
            
            # Fit transform on the sentences
            tfidf_matrix = vectorizer.fit_transform(sentences)
            
            # Get feature names
            feature_names = vectorizer.get_feature_names_out()
            
            # Calculate average TF-IDF score for each term
            scores = tfidf_matrix.sum(axis=0).A1
            
            # Create a list of (term, score) tuples and sort by score
            keywords = [(feature_names[i], scores[i]) for i in range(len(feature_names))]
            keywords.sort(key=lambda x: x[1], reverse=True)
            
            # Return top keywords
            return keywords[:max_keywords]
            
        except Exception as e:
            logger.error(f"Error in TF-IDF keyword extraction: {e}")
            return self.extract_keywords_simple(text, max_keywords)
    
    def extract_keywords_simple(self, text: str, max_keywords: int = 15) -> List[Tuple[str, float]]:
        """
        Simple keyword extraction fallback
        
        Args:
            text: Text to extract keywords from
            max_keywords: Maximum number of keywords to extract
            
        Returns:
            list: List of (keyword, score) tuples
        """
        # Preprocessing
        text = text.lower()
        
        # Tokenize and filter
        if NLTK_AVAILABLE:
            tokens = word_tokenize(text)
            filtered_tokens = [LEMMATIZER.lemmatize(token) for token in tokens 
                             if token.isalpha() and token not in STOP_WORDS and len(token) > 2]
        else:
            # Simple fallback tokenization and filtering
            tokens = re.findall(r'\b\w+\b', text)
            filtered_tokens = [token for token in tokens 
                             if len(token) > 2 and not token.isdigit()]
        
        # Count occurrences
        token_counts = {}
        for token in filtered_tokens:
            token_counts[token] = token_counts.get(token, 0) + 1
        
        # Create a list of (term, score) tuples and sort by frequency
        keywords = [(token, count / len(filtered_tokens)) for token, count in token_counts.items()]
        keywords.sort(key=lambda x: x[1], reverse=True)
        
        # Return top keywords
        return keywords[:max_keywords]
    
    def extract_keywords_with_spacy(self, text: str, max_keywords: int = 15) -> List[Tuple[str, float]]:
        """
        Extract keywords using spaCy
        
        Args:
            text: Text to extract keywords from
            max_keywords: Maximum number of keywords to extract
            
        Returns:
            list: List of (keyword, score) tuples
        """
        if not SPACY_AVAILABLE:
            logger.warning("spaCy not available, using fallback keyword extraction")
            return self.extract_keywords_with_tfidf(text, max_keywords)
        
        try:
            # Process the text
            doc = nlp(text)
            
            # Extract noun phrases as potential keywords
            noun_phrases = {}
            for chunk in doc.noun_chunks:
                phrase = chunk.text.lower()
                # Skip short or stop word only phrases
                if len(phrase) < 3 or all(token.is_stop for token in chunk):
                    continue
                noun_phrases[phrase] = noun_phrases.get(phrase, 0) + 1
            
            # Extract named entities
            entities = {}
            for ent in doc.ents:
                entity = ent.text.lower()
                if len(entity) > 2:
                    entities[entity] = entities.get(entity, 0) + 1
            
            # Combine noun phrases and entities, weighting entities higher
            keywords = []
            for phrase, count in noun_phrases.items():
                keywords.append((phrase, count / len(doc)))
            
            for entity, count in entities.items():
                # Weight entities higher
                keywords.append((entity, (count * 1.5) / len(doc)))
            
            # Sort and deduplicate
            seen = set()
            filtered_keywords = []
            for kw, score in sorted(keywords, key=lambda x: x[1], reverse=True):
                if kw not in seen:
                    seen.add(kw)
                    filtered_keywords.append((kw, score))
            
            return filtered_keywords[:max_keywords]
            
        except Exception as e:
            logger.error(f"Error in spaCy keyword extraction: {e}")
            return self.extract_keywords_with_tfidf(text, max_keywords)
    
    def recommend_skills_for_job(self, job_title: str, current_skills: List[str], 
                               count: int = 10) -> List[Dict[str, Any]]:
        """
        Recommend skills for a specific job
        
        Args:
            job_title: Job title to recommend skills for
            current_skills: User's current skills
            count: Number of skills to recommend
            
        Returns:
            list: List of recommended skills with relevance scores
        """
        # Normalize job title
        normalized_job = job_title.lower().replace(" ", "_")
        
        # Find best matching job in our database
        best_match = normalized_job
        best_score = 0
        
        for job in self.job_keywords:
            # Simple word overlap score
            words1 = set(normalized_job.split("_"))
            words2 = set(job.split("_"))
            overlap = len(words1.intersection(words2))
            total = len(words1.union(words2))
            score = overlap / total if total > 0 else 0
            
            if score > best_score:
                best_score = score
                best_match = job
        
        # Get relevant keywords for the job
        job_kws = self.job_keywords.get(best_match, [])
        
        # Flatten technical skills from skill_data
        all_tech_skills = []
        for category, skills in self.skill_data.get("technical_skills", {}).items():
            all_tech_skills.extend(skills)
        
        # Normalize current skills for comparison
        normalized_current = [skill.lower() for skill in current_skills]
        
        # Score potential skills
        skill_scores = []
        
        # Add technical skills
        for skill in all_tech_skills:
            # Skip if user already has this skill
            if skill.lower() in normalized_current:
                continue
            
            # Base score is 0.5
            score = 0.5
            
            # Boost score if it's in job keywords
            if skill.lower() in [kw.lower() for kw in job_kws]:
                score += 0.3
            
            # Check if it's related to skills the user already has
            for current_skill in current_skills:
                related_skills = self.skill_data.get("skill_relationships", {}).get(current_skill, [])
                if skill in related_skills:
                    score += 0.2
                    break
            
            skill_scores.append({
                "skill": skill,
                "relevance": round(score, 2),
                "category": self._get_skill_category(skill),
                "difficulty": self._estimate_skill_difficulty(skill)
            })
        
        # Sort by relevance and return top N
        skill_scores.sort(key=lambda x: x["relevance"], reverse=True)
        return skill_scores[:count]
    
    def _get_skill_category(self, skill: str) -> str:
        """Determine category for a skill"""
        for category, skills in self.skill_data.get("technical_skills", {}).items():
            if skill in skills:
                return category
        
        if skill in self.skill_data.get("soft_skills", []):
            return "soft_skills"
        
        return "other"
    
    def _estimate_skill_difficulty(self, skill: str) -> str:
        """Estimate difficulty level of a skill"""
        # This would ideally use a more sophisticated approach
        # For now, use a simple heuristic based on common knowledge
        advanced_skills = [
            "Machine Learning", "Data Science", "Artificial Intelligence", "Deep Learning",
            "Kubernetes", "Microservices", "System Architecture", "Distributed Systems",
            "Blockchain", "Quantum Computing", "Neural Networks", "Computer Vision"
        ]
        
        intermediate_skills = [
            "React", "Angular", "Node.js", "Django", "Flask", "Docker", "AWS",
            "Data Analysis", "SQL", "DevOps", "CI/CD", "API Development",
            "Unit Testing", "JavaScript Frameworks", "Cloud Computing"
        ]
        
        if any(skill.lower() in adv_skill.lower() for adv_skill in advanced_skills):
            return "advanced"
        elif any(skill.lower() in int_skill.lower() for int_skill in intermediate_skills):
            return "intermediate"
        
        return "beginner"
    
    def find_missing_keywords(self, text: str, job_description: str, count: int = 10) -> List[Dict[str, Any]]:
        """
        Find keywords in job description missing from text
        
        Args:
            text: Source text (e.g., resume)
            job_description: Target job description
            count: Number of keywords to return
            
        Returns:
            list: List of missing keywords with importance scores
        """
        # Extract keywords from job description
        job_keywords = self.extract_keywords_with_spacy(job_description, max_keywords=30)
        
        # Extract keywords from text
        text_keywords = self.extract_keywords_with_spacy(text, max_keywords=30)
        text_keyword_set = {kw.lower() for kw, _ in text_keywords}
        
        # Find missing keywords
        missing_kws = []
        for kw, score in job_keywords:
            if kw.lower() not in text_keyword_set:
                # Calculate importance based on score and position in job keywords
                importance = score
                missing_kws.append({
                    "keyword": kw,
                    "importance": round(importance, 2)
                })
        
        # Sort by importance
        missing_kws.sort(key=lambda x: x["importance"], reverse=True)
        return missing_kws[:count]
    
    def recommend_action_verbs(self, job_category: str, count: int = 10) -> List[str]:
        """
        Recommend action verbs for resume bullet points
        
        Args:
            job_category: Job category
            count: Number of verbs to recommend
            
        Returns:
            list: Recommended action verbs
        """
        # Define action verbs by category
        action_verbs = {
            "management": [
                "Led", "Managed", "Directed", "Coordinated", "Supervised", "Oversaw",
                "Administered", "Delegated", "Executed", "Headed", "Orchestrated",
                "Organized", "Planned", "Prioritized", "Produced", "Spearheaded"
            ],
            "technical": [
                "Programmed", "Developed", "Engineered", "Designed", "Debugged", "Implemented",
                "Optimized", "Coded", "Architected", "Deployed", "Integrated",
                "Maintained", "Tested", "Upgraded", "Built", "Troubleshot"
            ],
            "data_analysis": [
                "Analyzed", "Assessed", "Calculated", "Compiled", "Computed", "Estimated",
                "Evaluated", "Examined", "Forecasted", "Measured", "Modeled",
                "Predicted", "Projected", "Quantified", "Studied", "Surveyed"
            ],
            "communication": [
                "Presented", "Reported", "Authored", "Communicated", "Corresponded", "Documented",
                "Edited", "Facilitated", "Negotiated", "Persuaded", "Promoted",
                "Published", "Publicized", "Reconciled", "Translated", "Wrote"
            ],
            "creative": [
                "Created", "Conceptualized", "Customized", "Designed", "Devised", "Established",
                "Formulated", "Founded", "Generated", "Initiated", "Innovated",
                "Instituted", "Introduced", "Launched", "Originated", "Pioneered"
            ],
            "improvement": [
                "Improved", "Accelerated", "Enhanced", "Expanded", "Maximized", "Strengthened",
                "Transformed", "Upgraded", "Streamlined", "Resolved", "Restructured",
                "Revitalized", "Simplified", "Standardized", "Stimulated", "Revamped"
            ],
            "research": [
                "Researched", "Discovered", "Explored", "Gathered", "Identified", "Investigated",
                "Located", "Reviewed", "Searched", "Studied", "Surveyed",
                "Tested", "Detected", "Diagnosed", "Examined", "Inspected"
            ],
            "achievement": [
                "Achieved", "Attained", "Awarded", "Completed", "Demonstrated", "Earned",
                "Exceeded", "Outperformed", "Reduced", "Surpassed", "Delivered",
                "Increased", "Generated", "Saved", "Decreased", "Improved"
            ]
        }
        
        # Map job category to action verb categories
        category_map = {
            "software": ["technical", "improvement", "research"],
            "data_science": ["data_analysis", "technical", "research"],
            "management": ["management", "improvement", "achievement"],
            "marketing": ["communication", "creative", "achievement"],
            "finance": ["data_analysis", "achievement", "improvement"],
            "sales": ["achievement", "communication", "improvement"],
            "design": ["creative", "technical", "communication"],
            "research": ["research", "data_analysis", "technical"],
            "customer_service": ["communication", "improvement", "achievement"],
            "operations": ["management", "improvement", "achievement"]
        }
        
        # Normalize job category
        normalized_category = job_category.lower().replace(" ", "_")
        
        # Get relevant verb categories
        relevant_categories = category_map.get(normalized_category, ["technical", "achievement", "improvement"])
        
        # Collect verbs from relevant categories
        relevant_verbs = []
        for category in relevant_categories:
            relevant_verbs.extend(action_verbs.get(category, []))
        
        # Shuffle and return requested number
        import random
        random.shuffle(relevant_verbs)
        return relevant_verbs[:count]


# Standalone functions for direct usage

def extract_keywords(text: str, max_keywords: int = 15) -> List[Tuple[str, float]]:
    """
    Extract keywords from text
    
    Args:
        text: Text to extract keywords from
        max_keywords: Maximum number of keywords to extract
        
    Returns:
        list: List of (keyword, score) tuples
    """
    recommender = KeywordRecommender()
    
    # Try to use spaCy first, fall back to TF-IDF or simple if needed
    if SPACY_AVAILABLE:
        return recommender.extract_keywords_with_spacy(text, max_keywords)
    elif SKLEARN_AVAILABLE:
        return recommender.extract_keywords_with_tfidf(text, max_keywords)
    else:
        return recommender.extract_keywords_simple(text, max_keywords)


def find_matching_keywords(text: str, keywords: List[str]) -> List[str]:
    """
    Find keywords from a list that appear in text
    
    Args:
        text: Text to search in
        keywords: List of keywords to look for
        
    Returns:
        list: List of matching keywords
    """
    # Normalize text
    normalized_text = text.lower()
    
    # Find matches
    matches = []
    for keyword in keywords:
        if keyword.lower() in normalized_text:
            matches.append(keyword)
    
    return matches


def recommend_skills(job_title: str, current_skills: List[str], count: int = 10) -> List[Dict[str, Any]]:
    """
    Recommend skills for a job title
    
    Args:
        job_title: Job title
        current_skills: Current skills
        count: Number of skills to recommend
        
    Returns:
        list: List of recommended skills
    """
    recommender = KeywordRecommender()
    return recommender.recommend_skills_for_job(job_title, current_skills, count)


def get_missing_job_keywords(resume_text: str, job_description: str, count: int = 10) -> List[Dict[str, Any]]:
    """
    Find keywords in job description missing from resume
    
    Args:
        resume_text: Resume text
        job_description: Job description text
        count: Number of keywords to return
        
    Returns:
        list: List of missing keywords with importance scores
    """
    recommender = KeywordRecommender()
    return recommender.find_missing_keywords(resume_text, job_description, count)

            