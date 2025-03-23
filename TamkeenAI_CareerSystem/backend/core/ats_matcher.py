import re
import string
from collections import Counter
from typing import Dict, List, Tuple, Any, Optional
import math

# For enhanced NLP capabilities (optional)
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False

# For word similarity comparison (optional)
try:
    from nltk.corpus import wordnet
    import nltk
    NLTK_AVAILABLE = True
    try:
        nltk.data.find('corpora/wordnet')
    except LookupError:
        nltk.download('wordnet')
except ImportError:
    NLTK_AVAILABLE = False


class ATSMatcher:
    """
    Match resume content against job descriptions using ATS-like algorithms
    and provide scoring, keyword analysis, and improvement suggestions
    """
    
    def __init__(self, use_nlp: bool = True):
        """
        Initialize the ATS matcher
        
        Args:
            use_nlp: Whether to use NLP for enhanced matching (requires spaCy)
        """
        self.use_nlp = use_nlp and SPACY_AVAILABLE
        
        # Load NLP models if available
        self.nlp = None
        if self.use_nlp:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except:
                try:
                    # Try downloading if not found
                    from spacy.cli import download
                    download("en_core_web_sm")
                    self.nlp = spacy.load("en_core_web_sm")
                except:
                    print("Could not load spaCy model. Falling back to basic matching.")
                    self.use_nlp = False
        
        # Common stop words for filtering
        self.stop_words = set([
            "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "by",
            "is", "are", "was", "were", "be", "being", "been", "have", "has", "had",
            "do", "does", "did", "i", "you", "he", "she", "it", "we", "they",
            "this", "that", "these", "those", "in", "of", "from", "with", 
            "about", "against", "between", "into", "through", "during", "before",
            "after", "above", "below", "under", "over", "again", "further", "then",
            "once", "here", "there", "when", "where", "why", "how", "all", "any",
            "both", "each", "few", "more", "most", "other", "some", "such", "no",
            "not", "only", "own", "same", "so", "than", "too", "very", "can", "will",
            "just", "should", "now"
        ])

    def match_resume_to_job(self, 
                          resume_text: str, 
                          job_description: str,
                          job_title: str = "") -> Dict[str, Any]:
        """
        Match resume content against a job description
        
        Args:
            resume_text: Plain text content of the resume
            job_description: Plain text content of the job listing
            job_title: Title of the job (optional)
            
        Returns:
            Dictionary with matching scores and analysis
        """
        # Clean the input texts
        resume_text_clean = self._preprocess_text(resume_text)
        job_desc_clean = self._preprocess_text(job_description)
        
        # Extract important keywords from job description
        job_keywords = self._extract_keywords(job_desc_clean)
        
        # Count keyword matches
        keyword_matches = self._count_keyword_matches(resume_text_clean, job_keywords)
        
        # Calculate section-based scores
        hard_skills_score = self._calculate_skills_match(resume_text_clean, job_desc_clean, "hard")
        soft_skills_score = self._calculate_skills_match(resume_text_clean, job_desc_clean, "soft")
        
        # Calculate overall ATS score (0-100)
        keyword_weight = 0.5
        hard_skills_weight = 0.3
        soft_skills_weight = 0.2
        
        # Base score from keyword matches
        keyword_score = 0
        if job_keywords:
            keyword_score = (keyword_matches['found'] / len(job_keywords)) * 100
        
        # Calculate weighted score
        ats_score = (keyword_score * keyword_weight +
                    hard_skills_score * hard_skills_weight +
                    soft_skills_score * soft_skills_weight)
        
        # Round to integer
        ats_score = round(ats_score)
        
        # Identify missing keywords with high importance
        missing_keywords = [kw for kw in job_keywords if kw not in keyword_matches['matched_keywords']]
        
        # Generate improvement suggestions
        improvement_suggestions = self._generate_improvement_suggestions(
            missing_keywords, 
            keyword_matches['matched_keywords'],
            resume_text_clean,
            job_desc_clean,
            job_title
        )
        
        # Format results
        result = {
            "ats_score": ats_score,
            "keyword_score": round(keyword_score),
            "hard_skills_score": round(hard_skills_score),
            "soft_skills_score": round(soft_skills_score),
            "keyword_matches": {
                "found": keyword_matches['found'],
                "total": len(job_keywords),
                "percentage": round((keyword_matches['found'] / max(len(job_keywords), 1)) * 100, 1)
            },
            "matched_keywords": keyword_matches['matched_keywords'],
            "missing_keywords": missing_keywords,
            "improvement_suggestions": improvement_suggestions,
            "job_title_match": self._job_title_match(resume_text, job_title) if job_title else None,
            "format_analysis": self._analyze_resume_format(resume_text),
            "pass_threshold": ats_score >= 70
        }
        
        return result

    def get_job_description_analysis(self, job_description: str) -> Dict[str, Any]:
        """
        Analyze a job description to extract key requirements
        
        Args:
            job_description: Plain text content of the job listing
            
        Returns:
            Dictionary with job requirements analysis
        """
        clean_text = self._preprocess_text(job_description)
        
        # Extract different types of keywords
        keywords = self._extract_keywords(clean_text)
        hard_skills = self._extract_skills(clean_text, skill_type="hard")
        soft_skills = self._extract_skills(clean_text, skill_type="soft")
        
        # Extract education requirements
        education_req = self._extract_education_requirements(clean_text)
        
        # Extract experience requirements
        experience_req = self._extract_experience_requirements(clean_text)
        
        # Extract required certifications
        certifications = self._extract_certifications(clean_text)
        
        # Check if the job has technical requirements
        has_technical = any(term in clean_text.lower() for term in [
            "programming", "software", "code", "technical", "technology", 
            "engineering", "database", "algorithm"
        ])
        
        result = {
            "keywords": keywords,
            "hard_skills": hard_skills,
            "soft_skills": soft_skills,
            "education_requirements": education_req,
            "experience_requirements": experience_req,
            "required_certifications": certifications,
            "is_technical": has_technical,
            "keyword_density": self._calculate_keyword_density(clean_text)
        }
        
        return result

    def _preprocess_text(self, text: str) -> str:
        """Clean and normalize text for processing"""
        if not text:
            return ""
            
        # Convert to lowercase
        text = text.lower()
        
        # Remove punctuation
        translator = str.maketrans('', '', string.punctuation)
        text = text.translate(translator)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        if not text:
            return []
            
        # If NLP is available, use it for more accurate extraction
        if self.use_nlp and self.nlp:
            return self._extract_keywords_with_nlp(text)
        
        # Fallback to simpler approach
        words = text.split()
        # Filter out stop words and short words
        keywords = [word for word in words if word not in self.stop_words and len(word) > 2]
        
        # Count occurrences
        word_counts = Counter(keywords)
        
        # Return most common words as keywords
        top_keywords = [word for word, _ in word_counts.most_common(25)]
        return top_keywords

    def _extract_keywords_with_nlp(self, text: str) -> List[str]:
        """Use spaCy NLP to extract more meaningful keywords"""
        doc = self.nlp(text)
        
        # Extract nouns, proper nouns, and adjectives as potential keywords
        keywords = []
        for token in doc:
            if token.is_stop or token.is_punct or len(token.text) < 3:
                continue
                
            if token.pos_ in ["NOUN", "PROPN", "ADJ"] or token.ent_type_:
                keywords.append(token.text)
        
        # Add noun phrases (multi-word terms)
        for chunk in doc.noun_chunks:
            # Clean the chunk
            clean_chunk = ' '.join([token.text for token in chunk 
                                 if not token.is_stop and not token.is_punct and len(token.text) > 2])
            if clean_chunk and len(clean_chunk.split()) > 1:
                keywords.append(clean_chunk)
        
        # Count and select most frequent
        keyword_counts = Counter(keywords)
        top_keywords = [word for word, count in keyword_counts.most_common(30) if count > 1]
        
        return top_keywords

    def _count_keyword_matches(self, resume_text: str, job_keywords: List[str]) -> Dict[str, Any]:
        """Count how many job keywords match in the resume"""
        if not resume_text or not job_keywords:
            return {"found": 0, "matched_keywords": []}
            
        matched_keywords = []
        
        for keyword in job_keywords:
            # Check for exact matches
            if keyword in resume_text:
                matched_keywords.append(keyword)
                continue
                
            # If NLTK is available, check for synonym matches
            if NLTK_AVAILABLE:
                synonyms = self._get_synonyms(keyword)
                if any(synonym in resume_text for synonym in synonyms):
                    matched_keywords.append(keyword)
                    continue
        
        return {
            "found": len(matched_keywords),
            "matched_keywords": matched_keywords
        }

    def _get_synonyms(self, word: str) -> List[str]:
        """Get synonyms of a word using WordNet"""
        synonyms = []
        
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                synonym = lemma.name().replace('_', ' ')
                if synonym != word and synonym not in synonyms:
                    synonyms.append(synonym)
        
        return synonyms[:5]  # Limit to top 5 synonyms

    def _calculate_skills_match(self, resume_text: str, job_text: str, skill_type: str) -> float:
        """Calculate skill match score by type (hard/soft)"""
        if not resume_text or not job_text:
            return 0
            
        # Extract skills from both texts
        job_skills = self._extract_skills(job_text, skill_type)
        resume_skills = self._extract_skills(resume_text, skill_type)
        
        if not job_skills:
            return 100  # No required skills found, so technically a perfect match
            
        # Count matches
        matches = 0
        for skill in job_skills:
            if skill in resume_skills:
                matches += 1
                continue
                
            # Check for partial matches (e.g., "Python programming" matches "Python")
            if any(skill in resume_skill or resume_skill in skill for resume_skill in resume_skills):
                matches += 0.5  # Partial match
        
        # Calculate score (0-100)
        score = (matches / len(job_skills)) * 100
        return score

    def _extract_skills(self, text: str, skill_type: str = "hard") -> List[str]:
        """Extract skills of specific type from text"""
        skills = []
        
        if skill_type == "hard":
            # Technical/hard skills indicators
            skill_indicators = [
                # Programming Languages
                "python", "java", "javascript", "c\\+\\+", "c#", "ruby", "php", "swift", "golang",
                # Web Technologies
                "html", "css", "react", "angular", "vue", "node", "django", "flask", 
                # Databases
                "sql", "mysql", "postgresql", "mongodb", "oracle", "firebase", 
                # Tools & Platforms
                "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "jenkins",
                # Other Technical Skills
                "machine learning", "ai", "data science", "data analysis", "restful api", 
                "linux", "unix", "powershell", "bash", "excel", "tableau", "power bi"
            ]
            
            # Additional patterns for technical skills
            skill_patterns = [
                r'\b(?:familiarity|experience|proficiency|knowledge|expertise)\s+(?:with|in|of)\s+([\w\s]+)',
                r'\b([\w\s]+)\s+(?:developer|engineer|administrator|architect)\b',
                r'\b(?:using|utilizing|applying)\s+([\w\s]+)'
            ]
            
        else:  # soft skills
            skill_indicators = [
                "communication", "teamwork", "leadership", "problem solving", "critical thinking",
                "time management", "adaptability", "flexibility", "creativity", "work ethic",
                "interpersonal", "collaboration", "organization", "decision making", "conflict resolution",
                "emotional intelligence", "negotiation", "presentation", "customer service", 
                "attention to detail", "multi-tasking", "self-motivation", "reliability"
            ]
            
            skill_patterns = [
                r'\b(?:strong|excellent|effective)\s+([\w\s]+)\s+(?:skills|abilities)\b',
                r'\b(?:ability|capable)\s+to\s+([\w\s]+)',
                r'\b(?:demonstrate|demonstrated|showing)\s+([\w\s]+)'
            ]
        
        # Look for skill indicators
        for indicator in skill_indicators:
            pattern = r'\b' + indicator + r'(?:s|ing)?\b'
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                skills.append(match.lower())
        
        # Look for skill patterns
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Cleanup the match
                skill = match.lower().strip()
                # Only add if it seems like a proper skill (not too long or short)
                if 3 <= len(skill) <= 30 and skill not in self.stop_words:
                    skills.append(skill)
        
        # Remove duplicates
        unique_skills = list(set(skills))
        return unique_skills

    def _extract_education_requirements(self, text: str) -> Dict[str, Any]:
        """Extract education requirements from job description"""
        education_info = {
            "required": False,
            "preferred": False,
            "degree_level": None,
            "fields": []
        }
        
        # Check if education is required or preferred
        req_patterns = [
            r'\b(?:requires|required|must have|minimum|necessitates)\s+(?:a|an)?\s*(?:degree|education)\b',
            r'\b(?:degree|education)\s+(?:is|in)?\s*required\b'
        ]
        
        pref_patterns = [
            r'\b(?:prefer|preferred|ideally|desirable|nice to have)\s+(?:a|an)?\s*(?:degree|education)\b',
            r'\b(?:degree|education)\s+(?:is|in)?\s*preferred\b'
        ]
        
        for pattern in req_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                education_info["required"] = True
                break
                
        for pattern in pref_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                education_info["preferred"] = True
                break
        
        # Identify degree level
        degree_patterns = {
            "bachelor": r'\b(?:bachelor|bachelor\'s|bachelors|bs|ba|b\.s\.|b\.a\.|undergraduate)\b',
            "master": r'\b(?:master|master\'s|masters|ms|ma|m\.s\.|m\.a\.|graduate)\b',
            "phd": r'\b(?:phd|ph\.d|doctorate|doctoral)\b',
            "associate": r'\b(?:associate|associate\'s|associates|a\.a\.|a\.s\.|a\.a|a\.s)\b',
            "high school": r'\b(?:high school|secondary|diploma|ged)\b'
        }
        
        for level, pattern in degree_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                education_info["degree_level"] = level
                break
        
        # Identify fields of study
        field_pattern = r'(?:degree|education|background)\s+in\s+([\w\s,]+)'
        matches = re.findall(field_pattern, text, re.IGNORECASE)
        
        if matches:
            # Clean up and split fields
            fields_text = matches[0].lower()
            fields = [field.strip() for field in re.split(r',|\sor\s|\sand\s', fields_text)]
            # Filter out empty or very short fields
            education_info["fields"] = [field for field in fields if len(field) > 2]
        
        return education_info

    def _extract_experience_requirements(self, text: str) -> Dict[str, Any]:
        """Extract experience requirements from job description"""
        experience_info = {
            "required_years": 0,
            "preferred_years": 0,
            "required": False,
            "areas": []
        }
        
        # Extract years of experience
        year_patterns = [
            r'\b(\d+(?:\.\d+)?)\+?\s*(?:year|yr)s?\s+(?:of\s+)?(?:experience|work)\b',
            r'\b(\d+(?:\.\d+)?)\+?\s*(?:year|yr)s?\s+(?:of\s+)?(?:relevant|related)\s+(?:experience|work)\b',
            r'\bminimum\s+(?:of\s+)?(\d+(?:\.\d+)?)\+?\s*(?:year|yr)s?\b'
        ]
        
        for pattern in year_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    years = float(matches[0])
                    experience_info["required_years"] = years
                    experience_info["required"] = True
                    break
                except ValueError:
                    pass
        
        # Check for preferred experience years
        pref_year_patterns = [
            r'\b(?:prefer|preferred|ideally)\s+(?:candidates\s+with\s+)?(\d+(?:\.\d+)?)\+?\s*(?:year|yr)s?\b',
            r'\b(\d+(?:\.\d+)?)\+?\s*(?:year|yr)s?\s+(?:of\s+)?(?:experience|work)\s+(?:is\s+)?preferred\b'
        ]
        
        for pattern in pref_year_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    preferred_years = float(matches[0])
                    experience_info["preferred_years"] = preferred_years
                    break
                except ValueError:
                    pass
        
        # Extract areas of experience
        area_patterns = [
            r'experience\s+(?:in|with)\s+([\w\s,]+)',
            r'knowledge\s+of\s+([\w\s,]+)',
            r'familiarity\s+with\s+([\w\s,]+)',
            r'background\s+in\s+([\w\s,]+)'
        ]
        
        areas = []
        for pattern in area_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean up and split areas
                areas_text = match.lower()
                split_areas = [area.strip() for area in re.split(r',|\sor\s|\sand\s', areas_text)]
                # Add non-trivial areas
                areas.extend([area for area in split_areas if len(area) > 3])
        
        # Remove duplicates and limit to reasonable number
        if areas:
            experience_info["areas"] = list(set(areas))[:10]
        
        return experience_info

    def _extract_certifications(self, text: str) -> List[str]:
        """Extract required certifications from job description"""
        certifications = []
        
        # Common certification indicators
        cert_patterns = [
            r'(?:certification|certificate|certified|credentials)\s+(?:in|with|as)\s+([\w\s,]+)',
            r'(?:require|need|must have)\s+(?:a|an)?\s*(?:certification|certificate)\s+(?:in|with|as)?\s+([\w\s,]+)'
        ]
        
        # Common certification names
        common_certs = [
            "PMP", "CISSP", "AWS", "Azure", "MCSE", "CCNA", "CCNP",
            "CompTIA", "A\\+", "Network\\+", "Security\\+", "ITIL",
            "Six Sigma", "CISA", "CISM", "CSM", "CPA", "CFA",
            "PHR", "SPHR", "SHRM-CP", "SHRM-SCP"
        ]
        
        # Search for certification patterns
        for pattern in cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean up and split certifications
                certs_text = match.lower()
                split_certs = [cert.strip() for cert in re.split(r',|\sor\s|\sand\s', certs_text)]
                # Add non-trivial certifications
                certifications.extend([cert for cert in split_certs if len(cert) > 2])
        
        # Search for common certification names
        for cert in common_certs:
            pattern = r'\b' + cert + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                certifications.append(cert.lower())
        
        # Remove duplicates
        return list(set(certifications))

    def _job_title_match(self, resume_text: str, job_title: str) -> Dict[str, Any]:
        """Check if resume contains the job title or similar titles"""
        if not job_title or not resume_text:
            return {"match": False, "score": 0}
            
        # Clean job title
        job_title_clean = self._preprocess_text(job_title)
        resume_text_clean = self._preprocess_text(resume_text)
        
        # Direct match
        direct_match = job_title_clean in resume_text_clean
        
        # Generate similar titles
        similar_titles = self._generate_similar_titles(job_title_clean)
        
        # Check for similar title matches
        similar_matches = [title for title in similar_titles if title in resume_text_clean]
        
        # Calculate score based on matches
        match_score = 0
        if direct_match:
            match_score = 100
        elif similar_matches:
            match_score = 70
        
        return {
            "match": direct_match or len(similar_matches) > 0,
            "score": match_score,
            "direct_match": direct_match,
            "similar_matches": similar_matches
        }

    def _generate_similar_titles(self, job_title: str) -> List[str]:
        """Generate variations of a job title"""
        similar_titles = []
        
        # Split job title into components
        parts = job_title.split()
        
        # Common job title modifiers
        prefixes = ["senior", "junior", "lead", "head", "chief", "principal"]
        suffixes = ["specialist", "professional", "consultant", "analyst", "expert"]
        
        # Generate variations
        if len(parts) > 1:
            # Remove common modifiers for a base title
            base_title = " ".join([p for p in parts if p not in prefixes + suffixes])
            if base_title:
                similar_titles.append(base_title)
            
            # Variations with different prefixes
            for prefix in prefixes:
                if prefix not in parts:
                    similar_titles.append(f"{prefix} {base_title}")
        
        # Common substitutions
        substitutions = {
            "developer": ["engineer", "programmer", "coder"],
            "engineer": ["developer", "architect"],
            "manager": ["lead", "head", "supervisor", "coordinator"],
            "analyst": ["specialist", "consultant"],
            "administrator": ["admin", "manager"],
            "designer": ["creator", "architect"]
        }
        
        for old_term, new_terms in substitutions.items():
            if old_term in job_title:
                for new_term in new_terms:
                    similar_titles.append(job_title.replace(old_term, new_term))
        
        return list(set(similar_titles))

    def _analyze_resume_format(self, resume_text: str) -> Dict[str, Any]:
        """Analyze resume format and structure"""
        if not resume_text:
            return {"score": 0, "issues": ["Empty resume"]}
            
        lines = resume_text.splitlines()
        word_count = len(resume_text.split())
        
        issues = []
        score = 100  # Start with perfect score and deduct for issues
        
        # Check length
        if word_count < 200:
            issues.append("Resume is too short")
            score -= 20
        elif word_count > 1000:
            issues.append("Resume may be too long")
            score -= 10
        
        # Check for contact information
        has_email = bool(re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', resume_text))
        has_phone = bool(re.search(r'(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}', resume_text))
        
        if not has_email:
            issues.append("Missing email address")
            score -= 15
        if not has_phone:
            issues.append("Missing phone number")
            score -= 10
        
        # Check for bullet points
        has_bullets = any('•' in line or '-' in line or '*' in line for line in lines)
        if not has_bullets:
            issues.append("No bullet points detected - makes it harder to read")
            score -= 15
        
        # Check for sections
        common_sections = ["experience", "education", "skills", "summary", "profile"]
        found_sections = 0
        
        for section in common_sections:
            pattern = r'\b' + section + r'\b'
            if re.search(pattern, resume_text, re.IGNORECASE):
                found_sections += 1
        
        if found_sections < 3:
            issues.append("Missing standard resume sections")
            score -= 10 * (3 - found_sections)
        
        # Check for dates
        has_dates = bool(re.search(r'\b(19|20)\d{2}\b', resume_text))
        if not has_dates:
            issues.append("No dates found - timeline unclear")
            score -= 15
        
        return {
            "score": max(0, score),
            "issues": issues,
            "word_count": word_count,
            "has_email": has_email,
            "has_phone": has_phone,
            "has_bullets": has_bullets,
            "sections_found": found_sections
        }

    def _calculate_keyword_density(self, text: str) -> Dict[str, float]:
        """Calculate keyword density in the text"""
        if not text:
            return {}
            
        words = text.split()
        total_words = len(words)
        
        if total_words == 0:
            return {}
            
        # Count word frequencies
        word_counts = Counter(words)
        
        # Calculate density for words that aren't stop words and have reasonable length
        keyword_density = {
            word: (count / total_words) * 100
            for word, count in word_counts.items()
            if word not in self.stop_words and len(word) > 2
        }
        
        # Return top 20 keywords by density
        return dict(sorted(keyword_density.items(), key=lambda x: x[1], reverse=True)[:20])

    def _generate_improvement_suggestions(self, 
                                        missing_keywords: List[str],
                                        matched_keywords: List[str],
                                        resume_text: str,
                                        job_text: str,
                                        job_title: str) -> List[Dict[str, Any]]:
        """Generate actionable suggestions to improve resume"""
        suggestions = []
        
        # Priority missing keywords (focus on top ones)
        priority_missing = missing_keywords[:5]
        if priority_missing:
            keyword_suggestion = {
                "type": "keywords",
                "title": "Add Missing Keywords",
                "description": "Your resume is missing these important keywords:",
                "items": priority_missing,
                "impact": "high"
            }
            suggestions.append(keyword_suggestion)
        
        # Check for job title match
        if job_title:
            title_match = self._job_title_match(resume_text, job_title)
            if not title_match["match"]:
                title_suggestion = {
                    "type": "job_title",
                    "title": "Include Target Job Title",
                    "description": f"Consider adding the exact job title '{job_title}' to your resume",
                    "items": [],
                    "impact": "medium"
                }
                suggestions.append(title_suggestion)
        
        # Format issues
        format_analysis = self._analyze_resume_format(resume_text)
        if format_analysis["issues"]:
            format_suggestion = {
                "type": "format",
                "title": "Improve Resume Format",
                "description": "Fix these formatting issues:",
                "items": format_analysis["issues"][:3],  # Top 3 issues
                "impact": "medium"
            }
            suggestions.append(format_suggestion)
        
        # Check for experience match
        exp_req = self._extract_experience_requirements(job_text)
        if exp_req["required"] and exp_req["areas"]:
            # Check if experience areas are mentioned in resume
            missing_exp_areas = []
            for area in exp_req["areas"]:
                if area not in resume_text.lower():
                    missing_exp_areas.append(area)
            
            if missing_exp_areas:
                exp_suggestion = {
                    "type": "experience",
                    "title": "Highlight Relevant Experience",
                    "description": "Emphasize experience in these areas:",
                    "items": missing_exp_areas[:3],  # Top 3 missing areas
                    "impact": "high"
                }
                suggestions.append(exp_suggestion)
        
        # Education suggestions
        edu_req = self._extract_education_requirements(job_text)
        if edu_req["degree_level"] and edu_req["fields"]:
            # Check if education fields are mentioned
            missing_edu_fields = []
            for field in edu_req["fields"]:
                if field not in resume_text.lower():
                    missing_edu_fields.append(field)
            
            if missing_edu_fields:
                edu_suggestion = {
                    "type": "education",
                    "title": "Highlight Relevant Education",
                    "description": f"Emphasize education in {edu_req['degree_level']} level with focus on:",
                    "items": missing_edu_fields,
                    "impact": "medium"
                }
                suggestions.append(edu_suggestion)
        
        # Skills enhancement
        job_hard_skills = self._extract_skills(job_text, "hard")
        resume_hard_skills = self._extract_skills(resume_text, "hard")
        
        missing_skills = [skill for skill in job_hard_skills if skill not in resume_hard_skills]
        if missing_skills:
            skills_suggestion = {
                "type": "skills",
                "title": "Add Technical Skills",
                "description": "Include these technical skills if you have them:",
                "items": missing_skills[:5],  # Top 5 missing skills
                "impact": "high"
            }
            suggestions.append(skills_suggestion)
        
        # Quantification suggestion if resume lacks numbers
        numbers_in_resume = len(re.findall(r'\d+%|\d+\s*\+|\$\d+|\d+\s*years?|\d+\s*months?', resume_text))
        if numbers_in_resume < 3:
            quant_suggestion = {
                "type": "quantification",
                "title": "Add Measurable Achievements",
                "description": "Add numbers to quantify your achievements (%, $, time periods)",
                "items": ["Example: 'Increased sales by 20%'", 
                         "Example: 'Managed a team of 5'",
                         "Example: 'Reduced costs by $50,000'"],
                "impact": "medium"
            }
            suggestions.append(quant_suggestion)
        
        return suggestions
