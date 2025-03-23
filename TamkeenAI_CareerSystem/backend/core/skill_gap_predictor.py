import os
import re
import json
import logging
import hashlib
import random
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import time
from collections import Counter

# Optional dependencies - allow graceful fallback if not available
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        try:
            spacy.cli.download("en_core_web_sm")
            nlp = spacy.load("en_core_web_sm")
        except:
            nlp = spacy.blank("en")
except ImportError:
    SPACY_AVAILABLE = False
    nlp = None


class SkillGapPredictor:
    """
    Analyzes skills from resumes against job requirements to identify
    gaps and provide recommendations for skill development.
    
    Key features:
    - Skill extraction from resumes and job descriptions
    - Gap analysis between current and required skills
    - Prioritized recommendations for skill acquisition
    - Learning resource suggestions for closing gaps
    - Career path-based skill progression analysis
    """
    
    def __init__(self, 
                taxonomy_path: Optional[str] = None, 
                cache_dir: Optional[str] = None,
                learning_resources_path: Optional[str] = None,
                model_path: Optional[str] = None):
        """
        Initialize the skill gap predictor
        
        Args:
            taxonomy_path: Path to skill taxonomy data
            cache_dir: Directory to cache skill analysis results
            learning_resources_path: Path to learning resource data
            model_path: Path to pre-trained skill extraction model
        """
        self.logger = logging.getLogger(__name__)
        
        # Set up cache
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = None
            
        # Load taxonomy data
        self.taxonomy_data = self._load_taxonomy_data(taxonomy_path)
        
        # Load learning resources
        self.learning_resources = self._load_learning_resources(learning_resources_path)
        
        # Initialize NLP components if available
        self.nlp_available = SPACY_AVAILABLE and nlp is not None
        
        # Initialize skill extraction model
        if self.nlp_available and model_path and os.path.exists(model_path):
            try:
                # Try to load custom model
                self.skill_model = spacy.load(model_path)
                self.logger.info(f"Loaded custom skill extraction model from {model_path}")
            except Exception as e:
                self.logger.warning(f"Failed to load custom model: {str(e)}")
                self.skill_model = nlp
        else:
            self.skill_model = nlp if self.nlp_available else None
            
        # Set up skill entity ruler if available
        if self.nlp_available and self.skill_model:
            # Add skill patterns to entity ruler
            self._add_skill_patterns_to_model()
        
        # Initialize TF-IDF for skill similarity if available
        self.tfidf_vectorizer = None
        if SKLEARN_AVAILABLE:
            self.tfidf_vectorizer = TfidfVectorizer(
                analyzer='word',
                min_df=0.0,
                max_df=1.0,
                ngram_range=(1, 2),
                stop_words='english'
            )
            
            # Pre-compute TF-IDF for known skills
            all_skills = [skill for category in self.taxonomy_data.get("skills", {}).values() 
                        for skill in category]
            if all_skills:
                try:
                    self.tfidf_vectorizer.fit([' '.join(all_skills)])
                except:
                    pass
        
        self.logger.info("Skill gap predictor initialized")
        
    def _load_taxonomy_data(self, file_path: Optional[str] = None) -> Dict[str, Any]:
        """Load skill taxonomy data from file or use default"""
        taxonomy_data = {}
        
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    taxonomy_data = json.load(f)
                self.logger.info(f"Loaded taxonomy data from {file_path}")
            except Exception as e:
                self.logger.error(f"Error loading taxonomy data: {str(e)}")
                taxonomy_data = self._get_default_taxonomy()
        else:
            taxonomy_data = self._get_default_taxonomy()
            
        return taxonomy_data
        
    def _load_learning_resources(self, file_path: Optional[str] = None) -> Dict[str, Any]:
        """Load learning resources data from file or use default"""
        learning_resources = {}
        
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    learning_resources = json.load(f)
                self.logger.info(f"Loaded learning resources from {file_path}")
            except Exception as e:
                self.logger.error(f"Error loading learning resources: {str(e)}")
                learning_resources = self._get_default_resources()
        else:
            learning_resources = self._get_default_resources()
            
        return learning_resources
    
    def _get_default_taxonomy(self) -> Dict[str, Any]:
        """Get default skill taxonomy when no file is available"""
        return {
            "skills": {
                "Programming": [
                    "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP", "Swift",
                    "Kotlin", "Go", "Rust", "TypeScript", "SQL", "R", "MATLAB"
                ],
                "Data Science": [
                    "Machine Learning", "Deep Learning", "Natural Language Processing",
                    "Computer Vision", "Data Mining", "Statistical Analysis", "Data Visualization",
                    "Big Data", "Predictive Modeling", "A/B Testing", "Data Warehousing"
                ],
                "Web Development": [
                    "HTML", "CSS", "React", "Angular", "Vue.js", "Node.js", "Django",
                    "Flask", "Ruby on Rails", "Express.js", "ASP.NET", "Spring Boot",
                    "RESTful APIs", "GraphQL", "Responsive Design"
                ],
                "Database": [
                    "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle", "SQL Server",
                    "Redis", "Cassandra", "Elasticsearch", "DynamoDB", "Neo4j"
                ],
                "DevOps": [
                    "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Jenkins",
                    "GitLab CI/CD", "Travis CI", "Ansible", "Terraform", "Prometheus",
                    "Grafana", "ELK Stack", "Infrastructure as Code"
                ],
                "Soft Skills": [
                    "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
                    "Time Management", "Leadership", "Adaptability", "Creativity",
                    "Emotional Intelligence", "Conflict Resolution", "Negotiation"
                ]
            },
            "job_roles": {
                "Software Engineer": {
                    "required_skills": ["Python", "Java", "SQL", "RESTful APIs", "Git"],
                    "preferred_skills": ["Docker", "Kubernetes", "AWS", "Microservices"]
                },
                "Data Scientist": {
                    "required_skills": ["Python", "Machine Learning", "Statistical Analysis", "SQL"],
                    "preferred_skills": ["Deep Learning", "Natural Language Processing", "Big Data"]
                },
                "Web Developer": {
                    "required_skills": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
                    "preferred_skills": ["TypeScript", "GraphQL", "Responsive Design"]
                },
                "DevOps Engineer": {
                    "required_skills": ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform"],
                    "preferred_skills": ["Python", "Ansible", "Prometheus", "ELK Stack"]
                },
                "Project Manager": {
                    "required_skills": ["Communication", "Leadership", "Time Management", "Problem Solving"],
                    "preferred_skills": ["Agile", "Scrum", "JIRA", "Confluence"]
                }
            },
            "skill_levels": ["Beginner", "Intermediate", "Advanced", "Expert"],
            "experience_levels": ["Entry Level", "Mid Level", "Senior", "Lead", "Principal"],
            "industry_domains": [
                "Technology", "Finance", "Healthcare", "Education", "Manufacturing",
                "Retail", "Media", "Government", "Non-profit", "Energy"
            ]
        }
    
    def _get_default_resources(self) -> Dict[str, List[Dict[str, str]]]:
        """Get default learning resources when no file is available"""
        return {
            "Python": [
                {
                    "title": "Python for Everybody",
                    "url": "https://www.py4e.com/",
                    "type": "Course",
                    "difficulty": "Beginner"
                },
                {
                    "title": "Automate the Boring Stuff with Python",
                    "url": "https://automatetheboringstuff.com/",
                    "type": "Book",
                    "difficulty": "Beginner"
                }
            ],
            "Machine Learning": [
                {
                    "title": "Machine Learning by Stanford University (Coursera)",
                    "url": "https://www.coursera.org/learn/machine-learning",
                    "type": "Course",
                    "difficulty": "Intermediate"
                },
                {
                    "title": "Hands-On Machine Learning with Scikit-Learn and TensorFlow",
                    "url": "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",
                    "type": "Book",
                    "difficulty": "Intermediate"
                }
            ],
            "JavaScript": [
                {
                    "title": "JavaScript.info",
                    "url": "https://javascript.info/",
                    "type": "Tutorial",
                    "difficulty": "Beginner"
                },
                {
                    "title": "Eloquent JavaScript",
                    "url": "https://eloquentjavascript.net/",
                    "type": "Book",
                    "difficulty": "Beginner to Intermediate"
                }
            ],
            "Communication": [
                {
                    "title": "Effective Communication Skills",
                    "url": "https://www.coursera.org/learn/effective-communication",
                    "type": "Course",
                    "difficulty": "Beginner"
                },
                {
                    "title": "Crucial Conversations: Tools for Talking When Stakes Are High",
                    "url": "https://crucialconversations.com/",
                    "type": "Book",
                    "difficulty": "Intermediate"
                }
            ],
            "Docker": [
                {
                    "title": "Docker for Beginners",
                    "url": "https://docker-curriculum.com/",
                    "type": "Tutorial",
                    "difficulty": "Beginner"
                },
                {
                    "title": "Docker Deep Dive",
                    "url": "https://www.pluralsight.com/courses/docker-deep-dive",
                    "type": "Course",
                    "difficulty": "Intermediate"
                }
            ]
        }
    
    def _add_skill_patterns_to_model(self):
        """Add skill patterns to spaCy entity ruler"""
        if not self.nlp_available or not self.skill_model:
            return
            
        try:
            # Create entity ruler if it doesn't exist
            if "entity_ruler" not in self.skill_model.pipe_names:
                ruler = self.skill_model.add_pipe("entity_ruler")
            else:
                ruler = self.skill_model.get_pipe("entity_ruler")
                
            # Add skill patterns
            patterns = []
            for category, skills in self.taxonomy_data.get("skills", {}).items():
                for skill in skills:
                    patterns.append({"label": "SKILL", "pattern": skill})
                    
            ruler.add_patterns(patterns)
            self.logger.info(f"Added {len(patterns)} skill patterns to entity ruler")
        except Exception as e:
            self.logger.error(f"Error adding skill patterns: {str(e)}")
    
    def predict_skill_gaps(self, 
                         user_skills: List[str], 
                         target_job: str = None,
                         job_description: str = None,
                         career_level: str = "Mid Level",
                         include_resources: bool = True) -> Dict[str, Any]:
        """
        Predict skill gaps based on user skills and target job
        
        Args:
            user_skills: List of user's current skills
            target_job: Target job role (if provided, job_description can be None)
            job_description: Job description text (alternative to target_job)
            career_level: Target career level
            include_resources: Whether to include learning resources
            
        Returns:
            Dictionary with skill gap analysis
        """
        # Cache key (if caching is enabled)
        cache_key = None
        if self.cache_dir:
            data_to_hash = f"{','.join(sorted(user_skills))}-{target_job}-{career_level}"
            if job_description:
                data_to_hash += f"-{hashlib.md5(job_description.encode()).hexdigest()}"
            cache_key = hashlib.md5(data_to_hash.encode()).hexdigest()
            cache_file = os.path.join(self.cache_dir, f"skill_gap_{cache_key}.json")
            
            # Check if analysis is cached
            if os.path.exists(cache_file):
                try:
                    with open(cache_file, 'r') as f:
                        cache_data = json.load(f)
                    cache_time = cache_data.get("timestamp", 0)
                    
                    # Cache valid for 24 hours (86400 seconds)
                    if time.time() - cache_time < 86400:
                        self.logger.info(f"Using cached skill gap analysis for {target_job}")
                        return cache_data.get("analysis", {})
                except Exception as e:
                    self.logger.error(f"Error reading cache: {str(e)}")
        
        # Extract job skills
        required_skills, preferred_skills = self._extract_job_skills(target_job, job_description)
        
        # Normalize user skills (handle case and variations)
        normalized_user_skills = self._normalize_skills(user_skills)
        
        # Find missing required skills
        missing_required = [skill for skill in required_skills 
                          if not any(self._skill_match(skill, user_skill) 
                                    for user_skill in normalized_user_skills)]
        
        # Find missing preferred skills
        missing_preferred = [skill for skill in preferred_skills 
                           if not any(self._skill_match(skill, user_skill) 
                                     for user_skill in normalized_user_skills)]
        
        # Calculate match percentages
        total_required = len(required_skills)
        total_preferred = len(preferred_skills)
        total_all = total_required + total_preferred
        
        required_match = (total_required - len(missing_required)) / max(1, total_required)
        preferred_match = (total_preferred - len(missing_preferred)) / max(1, total_preferred)
        overall_match = ((total_required - len(missing_required)) + 
                        (total_preferred - len(missing_preferred)) * 0.5) / max(1, (total_required + total_preferred * 0.5))
        
        # Prioritize missing skills
        prioritized_skills = self._prioritize_skills(missing_required, missing_preferred, target_job)
        
        # Prepare learning resources
        resources = {}
        if include_resources:
            for skill in prioritized_skills:
                skill_resources = self._get_learning_resources_for_skill(skill)
                if skill_resources:
                    resources[skill] = skill_resources
        
        # Create result object
        result = {
            "target_job": target_job,
            "career_level": career_level,
            "match_scores": {
                "required_skills": round(required_match * 100, 1),
                "preferred_skills": round(preferred_match * 100, 1),
                "overall": round(overall_match * 100, 1)
            },
            "required_skills": {
                "matched": [skill for skill in required_skills if skill not in missing_required],
                "missing": missing_required
            },
            "preferred_skills": {
                "matched": [skill for skill in preferred_skills if skill not in missing_preferred],
                "missing": missing_preferred
            },
            "prioritized_gaps": prioritized_skills,
            "career_readiness": self._calculate_career_readiness(required_match, preferred_match, career_level)
        }
        
        if include_resources:
            result["learning_resources"] = resources
            
        # Additional insights
        result["insights"] = self._generate_skill_insights(
            normalized_user_skills, required_skills, preferred_skills, target_job, career_level
        )
        
        # Cache the result if caching is enabled
        if self.cache_dir and cache_key:
            try:
                with open(cache_file, 'w') as f:
                    json.dump({
                        "timestamp": time.time(),
                        "analysis": result
                    }, f)
            except Exception as e:
                self.logger.error(f"Error writing cache: {str(e)}")
        
        return result
    
    def _extract_job_skills(self, target_job: Optional[str], job_description: Optional[str]) -> Tuple[List[str], List[str]]:
        """Extract required and preferred skills from job info"""
        required_skills = []
        preferred_skills = []
        
        # If target job is specified and in our taxonomy
        if target_job and target_job in self.taxonomy_data.get("job_roles", {}):
            job_data = self.taxonomy_data["job_roles"][target_job]
            required_skills = job_data.get("required_skills", [])
            preferred_skills = job_data.get("preferred_skills", [])
            
        # Extract from job description if provided
        if job_description:
            # Use NLP if available
            if self.nlp_available and self.skill_model:
                extracted_skills = self._extract_skills_with_nlp(job_description)
                
                # Classify required vs preferred
                for skill in extracted_skills:
                    # Look for signals of required vs preferred
                    skill_context = self._get_skill_context(job_description, skill)
                    
                    is_required = any(p in skill_context.lower() for p in [
                        "required", "must have", "essential", "needed", "necessary",
                        "requirement", "mandatory", "proficient in", "experience with"
                    ])
                    
                    is_preferred = any(p in skill_context.lower() for p in [
                        "preferred", "nice to have", "plus", "bonus", "desirable",
                        "advantageous", "beneficial", "helpful"
                    ])
                    
                    if is_required:
                        required_skills.append(skill)
                    elif is_preferred:
                        preferred_skills.append(skill)
                    else:
                        # Default to required if not specified
                        required_skills.append(skill)
            else:
                # Fallback to simple regex extraction
                skills = self._extract_skills_with_regex(job_description)
                
                # Try to classify based on surrounding text
                for skill in skills:
                    # Get surrounding context
                    skill_idx = job_description.lower().find(skill.lower())
                    start_idx = max(0, skill_idx - 50)
                    end_idx = min(len(job_description), skill_idx + len(skill) + 50)
                    context = job_description[start_idx:end_idx]
                    
                    is_preferred = any(p in context.lower() for p in [
                        "preferred", "nice to have", "plus", "bonus", "desirable"
                    ])
                    
                    if is_preferred:
                        preferred_skills.append(skill)
                    else:
                        required_skills.append(skill)
        
        # Remove duplicates
        required_skills = list(set(required_skills))
        preferred_skills = list(set(preferred_skills) - set(required_skills))  # Ensure no overlap
        
        return required_skills, preferred_skills
    
    def _extract_skills_with_nlp(self, text: str) -> List[str]:
        """Extract skills from text using NLP"""
        if not self.nlp_available or not self.skill_model:
            return []
            
        try:
            doc = self.skill_model(text)
            skills = []
            
            # Extract skills from entities
            for ent in doc.ents:
                if ent.label_ == "SKILL":
                    skills.append(ent.text)
                    
            # Extract skills based on known taxonomy
            for category, category_skills in self.taxonomy_data.get("skills", {}).items():
                for skill in category_skills:
                    if skill.lower() in text.lower():
                        skills.append(skill)
                        
            return list(set(skills))  # Remove duplicates
        except Exception as e:
            self.logger.error(f"Error extracting skills with NLP: {str(e)}")
            return []
    
    def _extract_skills_with_regex(self, text: str) -> List[str]:
        """Extract skills from text using regex patterns"""
        skills = []
        
        # Use known skills from taxonomy
        for category, category_skills in self.taxonomy_data.get("skills", {}).items():
            for skill in category_skills:
                # Look for the skill with word boundaries
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text, re.IGNORECASE):
                    skills.append(skill)
                    
        return list(set(skills))  # Remove duplicates
    
    def _get_skill_context(self, text: str, skill: str) -> str:
        """Get context surrounding a skill mention"""
        skill_idx = text.lower().find(skill.lower())
        if skill_idx == -1:
            return ""
            
        start_idx = max(0, skill_idx - 100)
        end_idx = min(len(text), skill_idx + len(skill) + 100)
        return text[start_idx:end_idx]
    
    def _normalize_skills(self, skills: List[str]) -> List[str]:
        """Normalize skills by handling case and variations"""
        normalized = []
        
        for skill in skills:
            # Convert to title case for consistency
            normalized.append(skill.strip())
            
            # Add common variations
            if skill.lower() == "javascript":
                normalized.append("JS")
            elif skill.lower() == "python":
                normalized.append("Python Programming")
            elif skill.lower() == "machine learning":
                normalized.append("ML")
            elif skill.lower() == "natural language processing":
                normalized.append("NLP")
                
        return normalized
    
    def _skill_match(self, skill1: str, skill2: str) -> bool:
        """Determine if two skills match (considering variations)"""
        # Exact match (case insensitive)
        if skill1.lower() == skill2.lower():
            return True
            
        # Acronym match (e.g., "JavaScript" matches "JS")
        acronym1 = ''.join(word[0] for word in skill1.split() if word)
        acronym2 = ''.join(word[0] for word in skill2.split() if word)
        if acronym1.lower() == skill2.lower() or acronym2.lower() == skill1.lower():
            return True
            
        # Substring match for multi-word skills
        if len(skill1.split()) > 1 and skill1.lower() in skill2.lower():
            return True
        if len(skill2.split()) > 1 and skill2.lower() in skill1.lower():
            return True
            
        # TF-IDF similarity if available
        if SKLEARN_AVAILABLE and self.tfidf_vectorizer:
            try:
                vectors = self.tfidf_vectorizer.transform([skill1, skill2])
                similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
                if similarity > 0.8:  # High similarity threshold
                    return True
            except:
                pass
                
        return False
    
    def _prioritize_skills(self, missing_required: List[str], 
                         missing_preferred: List[str],
                         target_job: Optional[str]) -> List[str]:
        """Prioritize missing skills based on importance"""
        prioritized = []
        
        # First add all required skills (in order of importance)
        if target_job and target_job in self.taxonomy_data.get("job_roles", {}):
            # Use predefined order if available
            required_skills = self.taxonomy_data["job_roles"][target_job].get("required_skills", [])
            prioritized.extend([skill for skill in required_skills if skill in missing_required])
            
            # Add any remaining required skills not in the predefined order
            remaining_required = [skill for skill in missing_required if skill not in prioritized]
            prioritized.extend(remaining_required)
        else:
            # No predefined order, just add all required skills
            prioritized.extend(missing_required)
        
        # Then add preferred skills (in order of importance)
        if target_job and target_job in self.taxonomy_data.get("job_roles", {}):
            # Use predefined order if available
            preferred_skills = self.taxonomy_data["job_roles"][target_job].get("preferred_skills", [])
            prioritized.extend([skill for skill in preferred_skills if skill in missing_preferred])
            
            # Add any remaining preferred skills not in the predefined order
            remaining_preferred = [skill for skill in missing_preferred if skill not in prioritized]
            prioritized.extend(remaining_preferred)
        else:
            # No predefined order, just add all preferred skills
            prioritized.extend(missing_preferred)
        
        return prioritized
    
    def _get_learning_resources_for_skill(self, skill: str) -> List[Dict[str, str]]:
        """Get learning resources for a skill"""
        # Check exact match
        if skill in self.learning_resources:
            return self.learning_resources[skill]
            
        # Check case-insensitive match
        for resource_skill, resources in self.learning_resources.items():
            if resource_skill.lower() == skill.lower():
                return resources
                
        # Check for partial matches
        for resource_skill, resources in self.learning_resources.items():
            if resource_skill.lower() in skill.lower() or skill.lower() in resource_skill.lower():
                return resources
                
        return []
    
    def _calculate_career_readiness(self, required_match: float, 
                                 preferred_match: float,
                                 career_level: str) -> Dict[str, Any]:
        """Calculate career readiness score and rating"""
        # Base score calculation
        base_score = required_match * 0.7 + preferred_match * 0.3
        
        # Adjust based on career level
        level_factors = {
            "Entry Level": 1.1,  # More forgiving for entry level
            "Mid Level": 1.0,    # Standard expectation
            "Senior": 0.9,       # Higher expectations
            "Lead": 0.85,        # Even higher expectations
            "Principal": 0.8     # Highest expectations
        }
        
        level_factor = level_factors.get(career_level, 1.0)
        adjusted_score = base_score * level_factor
        
        # Cap at 100%
        final_score = min(adjusted_score, 1.0)
        
        # Determine readiness level
        readiness_level = "Not Ready"
        if final_score >= 0.9:
            readiness_level = "Excellent"
        elif final_score >= 0.75:
            readiness_level = "Good"
        elif final_score >= 0.6:
            readiness_level = "Moderate"
        elif final_score >= 0.4:
            readiness_level = "Basic"
            
        return {
            "score": round(final_score * 100, 1),
            "level": readiness_level,
            "required_match": round(required_match * 100, 1),
            "preferred_match": round(preferred_match * 100, 1)
        }
    
    def _generate_skill_insights(self, user_skills: List[str],
                                required_skills: List[str],
                                preferred_skills: List[str],
                                target_job: Optional[str],
                                career_level: str) -> List[str]:
        """Generate insights based on skill analysis"""
        insights = []
        
        # Calculate metrics
        total_required = len(required_skills)
        required_matched = sum(1 for skill in required_skills 
                              if any(self._skill_match(skill, user_skill) 
                                   for user_skill in user_skills))
        required_match_pct = required_matched / max(1, total_required)
        
        total_preferred = len(preferred_skills)
        preferred_matched = sum(1 for skill in preferred_skills 
                               if any(self._skill_match(skill, user_skill) 
                                    for user_skill in user_skills))
        preferred_match_pct = preferred_matched / max(1, total_preferred)
        
        # Identify strengths and gaps
        if required_match_pct > 0.7:
            insights.append(f"You have a strong foundation of required skills for this role.")
        elif required_match_pct > 0.4:
            insights.append(f"You have some of the required skills, but significant gaps remain.")
        else:
            insights.append(f"You need substantial skill development to meet the requirements for this role.")
            
        if preferred_match_pct > 0.5:
            insights.append(f"You possess many preferred skills that give you a competitive edge.")
        
        # Skill category analysis
        skill_categories = {}
        for skill in user_skills + required_skills + preferred_skills:
            # Find which category this skill belongs to
            for category, cat_skills in self.taxonomy_data.get("skills", {}).items():
                if any(self._skill_match(skill, cat_skill) for cat_skill in cat_skills):
                    if category not in skill_categories:
                        skill_categories[category] = {
                            "user": [],
                            "required": [],
                            "preferred": []
                        }
                    
                    # Add skill to appropriate lists
                    if any(self._skill_match(skill, user_skill) for user_skill in user_skills):
                        skill_categories[category]["user"].append(skill)
                    
                    if any(self._skill_match(skill, req_skill) for req_skill in required_skills):
                        skill_categories[category]["required"].append(skill)
                    
                    if any(self._skill_match(skill, pref_skill) for pref_skill in preferred_skills):
                        skill_categories[category]["preferred"].append(skill)
        
        # Generate insights for each category
        for category, data in skill_categories.items():
            user_count = len(data["user"])
            required_count = len(data["required"])
            preferred_count = len(data["preferred"])
            
            if required_count > 0:
                match_pct = sum(1 for skill in data["required"] 
                              if any(self._skill_match(skill, user_skill) 
                                   for user_skill in data["user"])) / required_count
                
                if match_pct >= 0.8:
                    insights.append(f"Your {category} skills are a strong match for this role.")
                elif match_pct <= 0.2 and required_count >= 2:
                    insights.append(f"You need to develop your {category} skills to be competitive for this role.")
        
        # Career progression insights
        if career_level in ["Mid Level", "Senior", "Lead", "Principal"]:
            lower_levels = {
                "Mid Level": ["Entry Level"],
                "Senior": ["Entry Level", "Mid Level"],
                "Lead": ["Mid Level", "Senior"],
                "Principal": ["Senior", "Lead"]
            }
            
            # Get skills required for the lower level roles
            lower_level_skills = set()
            for level in lower_levels.get(career_level, []):
                # Simple approximation - fewer skills for lower levels
                if target_job:
                    lower_level_skills.update(required_skills[:max(1, len(required_skills) // 2)])
            
            # Check if user has skills for lower level positions
            lower_level_match = sum(1 for skill in lower_level_skills 
                                  if any(self._skill_match(skill, user_skill) 
                                       for user_skill in user_skills)) / max(1, len(lower_level_skills))
            
            if lower_level_match > 0.8 and required_match_pct < 0.6:
                insights.append(f"You're well qualified for a {lower_levels[career_level][-1]} position and on track for {career_level}.")
        
        return insights
