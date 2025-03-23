import re
import string
from typing import Dict, List, Tuple, Any, Optional, Union
from collections import Counter
import math

# Try importing advanced NLP libraries, with graceful fallbacks
try:
    import spacy
    from spacy.lang.en.stop_words import STOP_WORDS as SPACY_STOP_WORDS
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    SPACY_STOP_WORDS = set()

try:
    from keybert import KeyBERT
    KEYBERT_AVAILABLE = True
except ImportError:
    KEYBERT_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class KeywordExtractor:
    """
    Extract keywords and key phrases from text using various NLP techniques.
    Provides specialized extraction for resumes and job descriptions.
    """
    
    def __init__(self, use_spacy: bool = True, use_keybert: bool = True):
        """
        Initialize the keyword extractor with selected NLP models
        
        Args:
            use_spacy: Whether to use spaCy for extraction
            use_keybert: Whether to use KeyBERT for extraction
        """
        # Track available models
        self.spacy_available = use_spacy and SPACY_AVAILABLE
        self.keybert_available = use_keybert and KEYBERT_AVAILABLE
        self.sklearn_available = SKLEARN_AVAILABLE
        
        # Initialize NLP models if available
        self.nlp = None
        self.keybert = None
        
        if self.spacy_available:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except:
                try:
                    # Try downloading if not found
                    from spacy.cli import download
                    download("en_core_web_sm")
                    self.nlp = spacy.load("en_core_web_sm")
                except:
                    print("Could not load spaCy model. Falling back to simpler extraction.")
                    self.spacy_available = False
        
        if self.keybert_available:
            try:
                self.keybert = KeyBERT()
            except:
                print("Could not initialize KeyBERT. Falling back to simpler extraction.")
                self.keybert_available = False
        
        # Expanded stop words combining multiple sources
        self.stop_words = set([
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "did", "do",
            "does", "doing", "don", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have",
            "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
            "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of",
            "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same",
            "she", "should", "so", "some", "such", "t", "than", "that", "the", "their", "theirs", "them", "themselves",
            "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very",
            "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with",
            "you", "your", "yours", "yourself", "yourselves",
            # Common resume/job words to exclude
            "resume", "cv", "curriculum", "vitae", "job", "work", "position", "role", "responsibility",
            "qualification", "requirement", "application", "candidate", "applicant", "employer", "company",
            "organization", "salary", "wage", "compensation", "benefit", "contact", "email", "phone"
        ])
        
        # Add spaCy stop words if available
        if SPACY_AVAILABLE:
            self.stop_words.update(SPACY_STOP_WORDS)
            
        # Domain-specific keyword dictionaries
        self._load_domain_dictionaries()

    def extract_keywords(self, 
                       text: str, 
                       method: str = "auto", 
                       max_keywords: int = 20, 
                       include_scores: bool = False) -> Union[List[str], List[Tuple[str, float]]]:
        """
        Extract keywords from text using specified method
        
        Args:
            text: Input text to extract keywords from
            method: Extraction method ('spacy', 'keybert', 'tfidf', or 'auto')
            max_keywords: Maximum number of keywords to return
            include_scores: Whether to include relevance scores
            
        Returns:
            List of keywords or list of (keyword, score) tuples if include_scores=True
        """
        if not text or len(text.strip()) < 10:
            return []
            
        # Clean the text
        cleaned_text = self._preprocess_text(text)
        
        # Select extraction method based on availability and preference
        if method == "auto":
            if self.keybert_available:
                method = "keybert"  # Prefer KeyBERT if available
            elif self.spacy_available:
                method = "spacy"
            elif self.sklearn_available:
                method = "tfidf"
            else:
                method = "frequency"
        
        # Extract keywords using the selected method
        if method == "keybert" and self.keybert_available:
            keywords = self._extract_with_keybert(cleaned_text, max_keywords)
        elif method == "spacy" and self.spacy_available:
            keywords = self._extract_with_spacy(cleaned_text, max_keywords)
        elif method == "tfidf" and self.sklearn_available:
            keywords = self._extract_with_tfidf(cleaned_text, max_keywords)
        else:
            # Fall back to frequency-based extraction
            keywords = self._extract_with_frequency(cleaned_text, max_keywords)
            
        # Return with or without scores
        if include_scores:
            return keywords
        else:
            return [kw for kw, _ in keywords]

    def extract_resume_skills(self, 
                            resume_text: str, 
                            skill_type: str = "all") -> Dict[str, List[str]]:
        """
        Extract skills specifically from resume text
        
        Args:
            resume_text: Resume content
            skill_type: Type of skills to extract ('technical', 'soft', or 'all')
            
        Returns:
            Dictionary of skill categories and extracted skills
        """
        if not resume_text or len(resume_text.strip()) < 50:
            return {"technical": [], "soft": [], "domain": []}
            
        cleaned_text = self._preprocess_text(resume_text)
        
        result = {
            "technical": [],
            "soft": [],
            "domain": []
        }
        
        # Extract skills based on type requested
        if skill_type in ["all", "technical"]:
            result["technical"] = self._extract_technical_skills(cleaned_text)
            
        if skill_type in ["all", "soft"]:
            result["soft"] = self._extract_soft_skills(cleaned_text)
            
        if skill_type in ["all", "domain"]:
            result["domain"] = self._extract_domain_specific_skills(cleaned_text)
            
        return result

    def extract_job_requirements(self, job_text: str) -> Dict[str, Any]:
        """
        Extract key requirements and qualifications from job descriptions
        
        Args:
            job_text: Job description content
            
        Returns:
            Dictionary with required skills, qualifications, and keywords
        """
        if not job_text or len(job_text.strip()) < 100:
            return {"required_skills": [], "preferred_skills": [], "qualifications": [], "keywords": []}
            
        cleaned_text = self._preprocess_text(job_text)
        
        # Extract general keywords
        general_keywords = self.extract_keywords(cleaned_text, max_keywords=15)
        if isinstance(general_keywords[0], tuple):
            general_keywords = [k for k, _ in general_keywords]
        
        # Find required vs preferred skills
        required_skills = self._extract_required_skills(cleaned_text)
        preferred_skills = self._extract_preferred_skills(cleaned_text)
        
        # Extract qualifications (education, experience)
        qualifications = self._extract_qualifications(cleaned_text)
        
        return {
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "qualifications": qualifications,
            "keywords": general_keywords
        }

    def extract_action_verbs(self, text: str, max_verbs: int = 10) -> List[str]:
        """
        Extract action verbs from text, useful for resume bullet points
        
        Args:
            text: Input text
            max_verbs: Maximum number of verbs to return
            
        Returns:
            List of action verbs found in the text
        """
        if not text or len(text.strip()) < 20:
            return []
            
        # Common resume action verbs
        action_verbs = [
            "achieved", "accomplished", "accelerated", "acquired", "adapted", "addressed", "administered", 
            "advanced", "advised", "advocated", "analyzed", "applied", "appointed", "appraised", "approved", 
            "architected", "arranged", "assembled", "assessed", "assigned", "attained", "authored", "automated",
            "balanced", "boosted", "briefed", "budgeted", "built", "calculated", "cataloged", "chaired", 
            "championed", "changed", "clarified", "classified", "coached", "collaborated", "collected", 
            "communicated", "compiled", "completed", "composed", "computed", "conceptualized", "conducted", 
            "consolidated", "constructed", "consulted", "contacted", "contained", "contracted", "contributed", 
            "controlled", "converted", "conveyed", "coordinated", "corrected", "corresponded", "counseled", 
            "created", "cultivated", "customized", "decreased", "defined", "delegated", "delivered", "demonstrated", 
            "derived", "designed", "detected", "determined", "developed", "devised", "diagnosed", "directed", 
            "discovered", "dispensed", "displayed", "disseminated", "distributed", "diversified", "documented", 
            "doubled", "drafted", "drove", "earned", "edited", "educated", "eliminated", "enabled", "encouraged", 
            "engineered", "enhanced", "enlarged", "enlisted", "ensured", "established", "estimated", "evaluated", 
            "examined", "exceeded", "executed", "expanded", "expedited", "experimented", "explained", "explored", 
            "expressed", "extracted", "facilitated", "finalized", "financed", "focused", "forecast", "formulated", 
            "founded", "gained", "gathered", "generated", "guided", "headed", "hired", "identified", "illustrated", 
            "implemented", "improved", "increased", "influenced", "informed", "initiated", "innovated", "inspected", 
            "inspired", "installed", "instituted", "instructed", "integrated", "interpreted", "interviewed", 
            "introduced", "invented", "investigated", "justified", "launched", "led", "leveraged", "licensed", 
            "maintained", "managed", "marketed", "maximized", "mediated", "mentored", "merged", "minimized", 
            "modeled", "modernized", "modified", "monitored", "motivated", "navigated", "negotiated", "operated", 
            "optimized", "orchestrated", "organized", "originated", "overhauled", "oversaw", "performed", 
            "persuaded", "pioneered", "planned", "prepared", "presented", "prioritized", "processed", "procured", 
            "produced", "programmed", "projected", "promoted", "proposed", "provided", "published", "purchased", 
            "recommended", "reconciled", "recorded", "recruited", "redesigned", "reduced", "reengineered", 
            "referenced", "refined", "reformed", "reinforced", "rejuvenated", "related", "reorganized", "repaired", 
            "replaced", "reported", "represented", "researched", "resolved", "restructured", "revamped", "reviewed", 
            "revised", "revitalized", "saved", "scheduled", "secured", "selected", "separated", "served", 
            "simplified", "simulated", "solved", "sorted", "spearheaded", "specialized", "specified", "standardized", 
            "stimulated", "streamlined", "strengthened", "structured", "studied", "submitted", "substantiated", 
            "succeeded", "suggested", "summarized", "supervised", "supported", "surpassed", "surveyed", 
            "synthesized", "systematized", "tabulated", "targeted", "taught", "tested", "trained", "translated", 
            "trimmed", "tripled", "troubleshot", "unified", "updated", "upgraded", "utilized", "validated", 
            "verified", "visualized", "won", "wrote"
        ]
        
        found_verbs = []
        
        # If spaCy is available, use POS tagging to identify verbs
        if self.spacy_available and self.nlp:
            doc = self.nlp(text)
            for token in doc:
                # Check if token is a verb and is a known action verb
                if token.pos_ == "VERB" and token.lemma_.lower() in action_verbs:
                    found_verbs.append(token.text.lower())
                    
            # If we didn't find enough, add some from our action verb list that appear in text
            if len(found_verbs) < max_verbs:
                text_lower = text.lower()
                for verb in action_verbs:
                    if verb in text_lower and verb not in found_verbs:
                        found_verbs.append(verb)
                        if len(found_verbs) >= max_verbs:
                            break
        else:
            # Fallback: look for action verbs in text
            text_lower = text.lower()
            for verb in action_verbs:
                # Use word boundaries to match whole words
                if re.search(r'\b' + verb + r'\b', text_lower):
                    found_verbs.append(verb)
                    if len(found_verbs) >= max_verbs:
                        break
        
        return found_verbs[:max_verbs]

    def highlight_keywords_in_text(self, 
                                 text: str, 
                                 keywords: List[str],
                                 html_format: bool = True) -> str:
        """
        Highlight keywords within text
        
        Args:
            text: Original text
            keywords: List of keywords to highlight
            html_format: Whether to return HTML with highlights
            
        Returns:
            Text with keywords highlighted
        """
        if not text or not keywords:
            return text
            
        result = text
        
        if html_format:
            # Escape HTML special characters
            result = result.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            
            # Sort keywords by length (longest first) to avoid partial replacements
            sorted_keywords = sorted(keywords, key=len, reverse=True)
            
            for keyword in sorted_keywords:
                # Case-insensitive replacement with HTML highlighting
                pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
                replacement = r'<span class="keyword-highlight">\g<0></span>'
                result = pattern.sub(replacement, result)
        else:
            # For plain text, use square brackets or asterisks
            sorted_keywords = sorted(keywords, key=len, reverse=True)
            
            for keyword in sorted_keywords:
                pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
                replacement = r'[[\g<0>]]'
                result = pattern.sub(replacement, result)
        
        return result

    def generate_word_cloud_data(self, text: str, max_words: int = 100) -> List[Dict[str, Any]]:
        """
        Generate data for word cloud visualization
        
        Args:
            text: Input text
            max_words: Maximum number of words to include
            
        Returns:
            List of word objects with text and value properties for visualization
        """
        if not text or len(text.strip()) < 50:
            return []
            
        # Clean text and remove stop words
        cleaned_text = self._preprocess_text(text)
        words = [word for word in cleaned_text.split() if word.lower() not in self.stop_words and len(word) > 2]
        
        # Count word frequencies
        word_counts = Counter(words)
        
        # Prepare data for visualization
        cloud_data = [
            {"text": word, "value": count}
            for word, count in word_counts.most_common(max_words)
        ]
        
        return cloud_data

    def _preprocess_text(self, text: str) -> str:
        """Clean and normalize text for processing"""
        if not text:
            return ""
            
        # Remove special characters except spaces and alphanumerics
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def _extract_with_keybert(self, text: str, max_keywords: int) -> List[Tuple[str, float]]:
        """Extract keywords using KeyBERT"""
        # Configure KeyBERT extraction
        keybert_keywords = self.keybert.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 2),  # Allow single words and bigrams
            stop_words=list(self.stop_words),
            use_mmr=True,  # Use Maximal Marginal Relevance for diversity
            diversity=0.5,
            top_n=max_keywords
        )
        
        # KeyBERT returns (keyword, score) tuples
        return keybert_keywords

    def _extract_with_spacy(self, text: str, max_keywords: int) -> List[Tuple[str, float]]:
        """Extract keywords using spaCy"""
        doc = self.nlp(text)
        
        # Extract noun phrases and named entities
        candidates = []
        
        # Add noun chunks (noun phrases)
        for chunk in doc.noun_chunks:
            # Clean the chunk text
            clean_chunk = ' '.join([token.text.lower() for token in chunk 
                                 if token.text.lower() not in self.stop_words and len(token.text) > 2])
            if clean_chunk:
                candidates.append(clean_chunk)
        
        # Add named entities
        for ent in doc.ents:
            # Clean the entity text
            clean_ent = ' '.join([token.text.lower() for token in ent 
                               if token.text.lower() not in self.stop_words and len(token.text) > 2])
            if clean_ent:
                candidates.append(clean_ent)
        
        # Add important single tokens (nouns, adjectives, verbs)
        for token in doc:
            if (token.pos_ in ["NOUN", "PROPN", "ADJ", "VERB"] and 
                token.text.lower() not in self.stop_words and 
                len(token.text) > 2):
                candidates.append(token.text.lower())
        
        # Count occurrences for scoring
        candidate_counts = Counter(candidates)
        
        # Calculate scores based on frequency and position
        scored_candidates = []
        max_count = max(candidate_counts.values()) if candidate_counts else 1
        
        for candidate, count in candidate_counts.items():
            # Score based on frequency (normalized to 0-1)
            freq_score = count / max_count
            
            # Position score (keywords appearing earlier get higher score)
            first_occur = text.lower().find(candidate.lower())
            pos_score = 1.0 - (first_occur / max(len(text), 1)) if first_occur != -1 else 0
            
            # Combined score (70% frequency, 30% position)
            score = (freq_score * 0.7) + (pos_score * 0.3)
            
            scored_candidates.append((candidate, score))
        
        # Sort by score and return top keywords
        top_keywords = sorted(scored_candidates, key=lambda x: x[1], reverse=True)[:max_keywords]
        
        return top_keywords

    def _extract_with_tfidf(self, text: str, max_keywords: int) -> List[Tuple[str, float]]:
        """Extract keywords using TF-IDF"""
        # Create small corpus by splitting text into sentences
        sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]
        
        if not sentences:
            return []
            
        # Configure TF-IDF
        tfidf_vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words=list(self.stop_words),
            ngram_range=(1, 2)  # Allow single words and bigrams
        )
        
        # Fit and transform
        try:
            tfidf_matrix = tfidf_vectorizer.fit_transform(sentences)
            feature_names = tfidf_vectorizer.get_feature_names_out()
            
            # Sum TF-IDF scores across all sentences for each term
            tfidf_scores = tfidf_matrix.sum(axis=0).A1
            
            # Create (term, score) pairs and sort
            term_scores = [(feature_names[i], score) for i, score in enumerate(tfidf_scores)]
            term_scores.sort(key=lambda x: x[1], reverse=True)
            
            return term_scores[:max_keywords]
        except:
            # Fall back to frequency-based extraction if TF-IDF fails
            return self._extract_with_frequency(text, max_keywords)

    def _extract_with_frequency(self, text: str, max_keywords: int) -> List[Tuple[str, float]]:
        """Extract keywords based on word frequency"""
        # Tokenize and remove stop words
        words = [word.lower() for word in text.split() 
               if word.lower() not in self.stop_words and len(word) > 2]
        
        # Count word frequencies
        word_counts = Counter(words)
        
        # Calculate TF (term frequency) for scoring
        total_words = len(words) if words else 1
        word_scores = [(word, count / total_words) for word, count in word_counts.items()]
        
        # Sort by score and return top keywords
        top_keywords = sorted(word_scores, key=lambda x: x[1], reverse=True)[:max_keywords]
        
        return top_keywords

    def _extract_technical_skills(self, text: str) -> List[str]:
        """Extract technical skills from text"""
        technical_skills = []
        text_lower = text.lower()
        
        # Check for common technical skills
        for skill in self.tech_skills_dict:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                technical_skills.append(skill)
        
        # Look for programming languages
        for lang in self.programming_languages:
            if re.search(r'\b' + re.escape(lang) + r'\b', text_lower):
                technical_skills.append(lang)
        
        # Look for tools and platforms
        for tool in self.tools_platforms:
            if re.search(r'\b' + re.escape(tool) + r'\b', text_lower):
                technical_skills.append(tool)
                
        # Remove duplicates
        return list(set(technical_skills))

    def _extract_soft_skills(self, text: str) -> List[str]:
        """Extract soft skills from text"""
        soft_skills = []
        text_lower = text.lower()
        
        # Check for common soft skills
        for skill in self.soft_skills_dict:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                soft_skills.append(skill)
                
        # Look for skill phrases
        skill_phrases = [
            (r'\bgood communication\b', "communication"),
            (r'\bteam player\b', "teamwork"),
            (r'\bteam collaboration\b', "collaboration"),
            (r'\bproblem.{1,20}solv(?:ing|e)\b', "problem solving"),
            (r'\bcritical.{1,10}think(?:ing|er)\b', "critical thinking"),
            (r'\badapt(?:able|ability)\b', "adaptability"),
            (r'\btime.{1,10}manage(?:ment|r)\b', "time management"),
            (r'\blead(?:ing|ership)\b', "leadership")
        ]
        
        for pattern, skill in skill_phrases:
            if re.search(pattern, text_lower):
                soft_skills.append(skill)
                
        # Remove duplicates
        return list(set(soft_skills))

    def _extract_domain_specific_skills(self, text: str) -> List[str]:
        """Extract domain-specific skills from text"""
        domain_skills = []
        text_lower = text.lower()
        
        # Check for skills in various domains
        for domain, skills in self.domain_skills.items():
            for skill in skills:
                if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                    domain_skills.append(skill)
        
        # Check for industry-specific keywords
        for industry, keywords in self.industry_keywords.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                    domain_skills.append(keyword)
                    
        # Remove duplicates
        return list(set(domain_skills))

    def _extract_required_skills(self, text: str) -> List[str]:
        """Extract required skills from job text"""
        # Look for skill mentions prefixed with required-indicating words
        required_patterns = [
            r'(?:required|necessary|must have|essential|needed)(?:\s+to\s+have|\s+skills?|\s+experience|\s+knowledge)?\s+(?:of|in|with)?\s+([\w\s,/-]+)',
            r'(?:proficiency|experience|expertise|knowledge)(?:\s+required|\s+needed|\s+essential)?\s+(?:of|in|with)\s+([\w\s,/-]+)',
            r'(?:demonstrate|possess|have)(?:\s+required|\s+essential)?\s+(?:skills?|abilities?|knowledge)\s+(?:of|in|with)\s+([\w\s,/-]+)'
        ]
        
        required_skills = []
        
        for pattern in required_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean up the match
                skills_text = match.lower().strip()
                # Split by common separators
                individual_skills = [s.strip() for s in re.split(r',|;|/|\band\b|\bor\b', skills_text)]
                # Filter out non-skills
                filtered_skills = [s for s in individual_skills if len(s) > 2 and s not in self.stop_words]
                required_skills.extend(filtered_skills)
        
        # Extract skills from lists that appear after "Requirements:" headers
        req_sections = re.findall(r'(?:requirements|required skills|qualifications)(?:\s*:|\.)\s*((?:.+\n)+)', 
                                 text, re.IGNORECASE)
        
        for section in req_sections:
            # Look for bullet points or numbered items
            bullets = re.findall(r'(?:•|\*|-|\d+\.)\s*([\w\s,/-]+)', section)
            for bullet in bullets:
                skill = bullet.lower().strip()
                if len(skill) > 2 and skill not in self.stop_words:
                    required_skills.append(skill)
        
        # Also check for technical and domain skills that appear in the text
        technical_skills = self._extract_technical_skills(text)
        required_skills.extend(technical_skills)
        
        # Remove duplicates and limit to reasonable length skills
        clean_skills = []
        for skill in required_skills:
            if 2 < len(skill) < 50:  # Reasonable skill name length
                clean_skills.append(skill)
                
        return list(set(clean_skills))

    def _extract_preferred_skills(self, text: str) -> List[str]:
        """Extract preferred/nice-to-have skills from job text"""
        # Patterns for preferred skills
        preferred_patterns = [
            r'(?:preferred|desirable|nice to have|plus|beneficial|advantageous)(?:\s+skills?|\s+experience|\s+knowledge)?\s+(?:of|in|with)?\s+([\w\s,/-]+)',
            r'(?:familiarity|experience|expertise|knowledge)(?:\s+preferred|\s+desirable)?\s+(?:of|in|with)\s+([\w\s,/-]+)',
            r'(?:the following|these|this)(?:\s+would\s+be|are|is)?\s+(?:a\s+plus|preferred|desirable|nice\s+to\s+have)(?::|\.)\s*([\w\s,/-]+)'
        ]
        
        preferred_skills = []
        
        for pattern in preferred_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean up the match
                skills_text = match.lower().strip()
                # Split by common separators
                individual_skills = [s.strip() for s in re.split(r',|;|/|\band\b|\bor\b', skills_text)]
                # Filter out non-skills
                filtered_skills = [s for s in individual_skills if len(s) > 2 and s not in self.stop_words]
                preferred_skills.extend(filtered_skills)
        
        # Extract skills from sections after "Preferred:" or "Nice to have:" headers
        pref_sections = re.findall(r'(?:preferred|nice to have|desirable)(?:\s*:|\.)\s*((?:.+\n)+)', 
                                  text, re.IGNORECASE)
        
        for section in pref_sections:
            # Look for bullet points or numbered items
            bullets = re.findall(r'(?:•|\*|-|\d+\.)\s*([\w\s,/-]+)', section)
            for bullet in bullets:
                skill = bullet.lower().strip()
                if len(skill) > 2 and skill not in self.stop_words:
                    preferred_skills.append(skill)
        
        # Remove duplicates and limit to reasonable length skills
        clean_skills = []
        for skill in preferred_skills:
            if 2 < len(skill) < 50:  # Reasonable skill name length
                clean_skills.append(skill)
                
        return list(set(clean_skills))

    def _extract_qualifications(self, text: str) -> List[str]:
        """Extract education/experience qualifications from job text"""
        qualifications = []
        
        # Patterns for education requirements
        edu_patterns = [
            r'(?:bachelor|master|phd|doctorate|graduate|undergraduate)(?:\'s)?(?:\s+degree)?\s+(?:in|of)\s+([\w\s,/-]+)',
            r'(?:degree|diploma|certification)\s+(?:in|of|from)\s+([\w\s,/-]+)',
            r'(?:education|background)\s+(?:in|of)\s+([\w\s,/-]+)'
        ]
        
        for pattern in edu_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                qualification = match.strip()
                if len(qualification) > 2:
                    qualifications.append(f"Education in {qualification}")
        
        # Patterns for experience requirements
        exp_patterns = [
            r'(\d+(?:\+|\s*\+|\s+or\s+more|\s+to\s+\d+)?)\s+(?:years?|yrs?)(?:\s+of)?\s+(?:experience|work|background)\s+(?:in|with)\s+([\w\s,/-]+)',
            r'(?:experience|background)(?:\s+of|\s+in|\s+with)?\s+(\d+(?:\+|\s*\+|\s+or\s+more|\s+to\s+\d+)?)\s+(?:years?|yrs?)\s+(?:in|with)?\s+([\w\s,/-]+)'
        ]
        
        for pattern in exp_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match) >= 2:  # Ensure we have both years and field
                    years = match[0].strip()
                    field = match[1].strip()
                    if years and field:
                        qualifications.append(f"{years} years experience in {field}")
        
        # Look for certification requirements
        cert_patterns = [
            r'(?:certification|certificate|certified)\s+(?:in|as|from)\s+([\w\s,/-]+)',
            r'([\w\s,/-]+)\s+certification',
            r'(?:certified|licensed)\s+([\w\s,/-]+)'
        ]
        
        for pattern in cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                cert = match.strip()
                if len(cert) > 2:
                    qualifications.append(f"Certification in {cert}")
        
        return qualifications

    def _load_domain_dictionaries(self):
        """Load dictionaries of domain-specific keywords"""
        # Programming languages
        self.programming_languages = [
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php", "swift", 
            "kotlin", "go", "golang", "rust", "scala", "r", "perl", "bash", "powershell", 
            "matlab", "sql", "assembly", "fortran", "ada", "cobol", "lisp", "haskell", "erlang"
        ]
        
        # Development tools and platforms
        self.tools_platforms = [
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "github", "gitlab", 
            "bitbucket", "jira", "confluence", "slack", "linux", "windows", "macos", "ios", "android",
            "vs code", "visual studio", "intellij", "eclipse", "jupyter", "tableau", "power bi",
            "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "react", "angular",
            "vue", "node.js", "django", "flask", "spring", "laravel", "wordpress", "shopify", "wix"
        ]
        
        # Technical skills dictionary
        self.tech_skills_dict = [
            # Database
            "sql", "mysql", "postgresql", "mongodb", "cassandra", "redis", "oracle", "db2", 
            "mariadb", "sqlite", "dynamodb", "cosmos db", "firebase", "neo4j", "couchbase",
            
            # Web Development
            "html", "css", "javascript", "dom", "react", "angular", "vue", "svelte", "jquery",
            "bootstrap", "sass", "less", "webpack", "babel", "typescript", "ajax", "json",
            "rest api", "graphql", "redux", "pwa", "material ui", "responsive design",
            
            # Backend
            "node.js", "express", "django", "flask", "spring", "asp.net", "laravel", "ruby on rails",
            "php", "fastapi", "microservices", "api", "soap", "middleware", "swagger",
            
            # DevOps
            "ci/cd", "jenkins", "github actions", "travis ci", "circle ci", "docker", "kubernetes",
            "terraform", "ansible", "puppet", "chef", "vagrant", "aws", "azure", "gcp", "openshift",
            "elasticsearch", "logstash", "kibana", "grafana", "prometheus", "sentry",
            
            # Data Science & ML
            "machine learning", "deep learning", "nlp", "neural networks", "data mining",
            "statistics", "data visualization", "big data", "hadoop", "spark", "tensorflow",
            "pytorch", "keras", "scikit-learn", "pandas", "numpy", "scipy", "matplotlib",
            "r", "data analysis", "ab testing", "feature engineering", "clustering",
            
            # Mobile
            "android", "ios", "swift", "kotlin", "objective-c", "react native", "flutter",
            "xamarin", "cordova", "ionic", "mobile development", "responsive design",
            
            # Security
            "cybersecurity", "encryption", "ssl", "tls", "oauth", "jwt", "authentication",
            "authorization", "penetration testing", "vulnerability assessment", "firewall",
            "intrusion detection", "security auditing", "ethical hacking", "cryptography",
            "malware analysis", "siem", "compliance", "gdpr", "hipaa", "pci dss",
            
            # Testing
            "unit testing", "integration testing", "automated testing", "e2e testing",
            "test driven development", "selenium", "cucumber", "jest", "pytest", "junit",
            "mocha", "jasmine", "quality assurance", "test cases", "regression testing",
            
            # Cloud
            "cloud computing", "serverless", "lambda", "ec2", "s3", "cloudfront", "route53",
            "iam", "azure functions", "app service", "virtual machines", "containers",
            "cloud architecture", "iaas", "paas", "saas", "hybrid cloud", "multi-cloud",
            
            # Project Management
            "agile", "scrum", "kanban", "waterfall", "sprint", "backlog", "user stories",
            "gantt chart", "project planning", "risk management", "stakeholder management",
            "prince2", "pmp", "program management", "project coordination",
            
            # Other Technical Areas
            "blockchain", "iot", "augmented reality", "virtual reality", "game development",
            "embedded systems", "robotics", "computer vision", "natural language processing",
            "networking", "tcp/ip", "dns", "dhcp", "load balancing", "cdn", "vpn", "sdn"
        ]
        
        # Soft skills dictionary
        self.soft_skills_dict = [
            "communication", "teamwork", "collaboration", "problem solving", "critical thinking",
            "creativity", "time management", "adaptability", "flexibility", "leadership",
            "organization", "attention to detail", "strategic thinking", "decision making",
            "conflict resolution", "emotional intelligence", "negotiation", "persuasion",
            "presentation", "public speaking", "mentoring", "coaching", "customer service",
            "interpersonal skills", "active listening", "written communication", "verbal communication",
            "multitasking", "prioritization", "self-motivation", "work ethic", "resilience",
            "patience", "cultural awareness", "innovation", "analytical thinking", "research",
            "planning", "delegation", "stress management", "accountability", "responsibility",
            "initiative", "integrity", "positivity", "self-reflection", "feedback giving",
            "feedback receiving", "resourcefulness", "persistence", "dependability"
        ]
        
        # Domain-specific skills by industry
        self.domain_skills = {
            "finance": [
                "financial analysis", "accounting", "budgeting", "forecasting", "financial modeling",
                "investment", "portfolio management", "risk assessment", "valuation", "audit",
                "financial reporting", "taxation", "corporate finance", "banking", "insurance",
                "capital markets", "wealth management", "financial planning", "cost accounting"
            ],
            "healthcare": [
                "patient care", "electronic health records", "medical coding", "healthcare compliance",
                "clinical research", "healthcare management", "medical terminology", "patient advocacy",
                "healthcare policy", "patient education", "medical records", "health informatics",
                "telemedicine", "healthcare analytics", "regulatory compliance", "clinical trials"
            ],
            "marketing": [
                "digital marketing", "social media marketing", "content marketing", "seo", "sem",
                "email marketing", "marketing automation", "market research", "brand management",
                "campaign management", "advertising", "public relations", "copywriting", "analytics",
                "customer acquisition", "lead generation", "crm", "customer segmentation"
            ],
            "legal": [
                "legal research", "contract law", "intellectual property", "corporate law", "litigation",
                "legal writing", "case management", "compliance", "regulatory affairs", "negotiation",
                "legal analysis", "due diligence", "contract review", "legal documentation", "mediation"
            ],
            "education": [
                "curriculum development", "instructional design", "teaching", "assessment", "e-learning",
                "student engagement", "classroom management", "educational technology", "student advising",
                "educational leadership", "special education", "pedagogy", "adult learning"
            ],
            "manufacturing": [
                "supply chain", "inventory management", "production planning", "quality control",
                "lean manufacturing", "six sigma", "process improvement", "industrial engineering",
                "operations management", "logistics", "procurement", "warehouse management",
                "production scheduling", "material requirements planning", "automation"
            ]
        }
        
        # Industry-specific terminology
        self.industry_keywords = {
            "technology": [
                "digital transformation", "saas", "internet of things", "big data", "artificial intelligence",
                "blockchain", "cloud computing", "cybersecurity", "automation", "virtual reality",
                "augmented reality", "machine learning", "edge computing", "quantum computing",
                "digital privacy", "5g", "robotics", "biometrics", "data analytics"
            ],
            "retail": [
                "merchandising", "retail operations", "inventory control", "point of sale", "sales management",
                "customer experience", "visual merchandising", "loss prevention", "e-commerce",
                "retail analytics", "category management", "omnichannel", "supply chain", "crm",
                "retail buying", "retail planning", "retail marketing", "retail technology"
            ],
            "construction": [
                "project management", "architecture", "structural engineering", "civil engineering",
                "construction management", "building codes", "permits", "safety compliance",
                "construction planning", "cost estimation", "site management", "quality control",
                "subcontractor management", "blueprint reading", "sustainable building"
            ],
            "government": [
                "public policy", "public administration", "legislative affairs", "regulatory compliance",
                "public sector", "government relations", "policy analysis", "government contracting",
                "public service", "urban planning", "community development", "international relations",
                "emergency management", "homeland security", "environmental policy"
            ]
        }

            