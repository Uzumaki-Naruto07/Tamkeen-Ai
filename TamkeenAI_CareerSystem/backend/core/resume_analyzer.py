import os
import re
import json
import logging
import hashlib
import tempfile
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import uuid

# Optional dependencies - allow graceful fallback if not available
try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        # Try to load a spaCy model
        nlp = spacy.load("en_core_web_sm")
    except:
        # If specific model not found, try to download it or use a basic one
        try:
            spacy.cli.download("en_core_web_sm")
            nlp = spacy.load("en_core_web_sm")
        except:
            # Fallback to blank model if downloads not allowed
            nlp = spacy.blank("en")
except ImportError:
    SPACY_AVAILABLE = False
    nlp = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    
try:
    import docx2txt
    DOCX2TXT_AVAILABLE = True
except ImportError:
    DOCX2TXT_AVAILABLE = False

try:
    import textract
    TEXTRACT_AVAILABLE = True
except ImportError:
    TEXTRACT_AVAILABLE = False


class ResumeAnalyzer:
    """
    Analyzes resumes to extract key information, score against job descriptions,
    and provide actionable feedback for improvement.
    """
    
    def __init__(self, 
               data_path: Optional[str] = None, 
               cache_dir: Optional[str] = None,
               ats_patterns: Optional[Dict[str, List[str]]] = None):
        """
        Initialize the resume analyzer
        
        Args:
            data_path: Path to skill/job taxonomy data
            cache_dir: Directory to cache parsed resumes
            ats_patterns: Custom ATS parsing patterns
        """
        self.logger = logging.getLogger(__name__)
        
        # Set up cache
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = None
        
        # Load skill/job taxonomy data
        self.taxonomy_data = self._load_taxonomy_data(data_path)
        
        # Configure ATS patterns
        self.ats_patterns = ats_patterns or self._get_default_ats_patterns()
        
        # Determine available text extraction methods
        self.extraction_methods = []
        if PDFPLUMBER_AVAILABLE:
            self.extraction_methods.append("pdfplumber")
        if DOCX2TXT_AVAILABLE:
            self.extraction_methods.append("docx2txt")
        if TEXTRACT_AVAILABLE:
            self.extraction_methods.append("textract")
            
        if not self.extraction_methods:
            self.logger.warning("No document extraction libraries available. Install pdfplumber, docx2txt, or textract.")
        
        # Initialize NLP components
        self.initialize_nlp()
        
    def initialize_nlp(self):
        """Initialize NLP components based on available libraries"""
        self.nlp_available = False
        
        if SPACY_AVAILABLE:
            # Register custom entity patterns
            if nlp.has_pipe("entity_ruler"):
                ruler = nlp.get_pipe("entity_ruler")
            else:
                ruler = nlp.add_pipe("entity_ruler")
                
            # Add skill patterns
            patterns = []
            for skill_category, skills in self.taxonomy_data.get("skills", {}).items():
                for skill in skills:
                    patterns.append({"label": "SKILL", "pattern": skill})
                    
            # Add job title patterns
            for job_category, jobs in self.taxonomy_data.get("job_titles", {}).items():
                for job in jobs:
                    patterns.append({"label": "JOB_TITLE", "pattern": job})
                    
            ruler.add_patterns(patterns)
            self.nlp_available = True
        
        # Initialize TF-IDF vectorizer if sklearn is available
        if SKLEARN_AVAILABLE:
            self.tfidf_vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),
                max_features=10000
            )
    
    def _load_taxonomy_data(self, data_path: Optional[str]) -> Dict[str, Any]:
        """Load skill/job taxonomy data from JSON file"""
        taxonomy_data = {}
        
        # Define possible data file locations
        data_files = [
            data_path,
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "career_taxonomy.json"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "career_taxonomy.json"),
            os.path.join(os.path.expanduser("~"), ".tamkeen", "data", "career_taxonomy.json")
        ]
        
        # Filter out None values
        data_files = [f for f in data_files if f]
        
        # Try to load from each location
        for file_path in data_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        taxonomy_data = json.load(f)
                    self.logger.info(f"Loaded taxonomy data from {file_path}")
                    break
                except Exception as e:
                    self.logger.error(f"Error loading taxonomy data from {file_path}: {str(e)}")
        
        # If no data found, use built-in minimal dataset
        if not taxonomy_data:
            self.logger.warning("No taxonomy data found, using built-in minimal dataset")
            taxonomy_data = self._get_builtin_taxonomy_data()
            
        return taxonomy_data
    
    def _get_default_ats_patterns(self) -> Dict[str, List[str]]:
        """Get default ATS parsing patterns"""
        return {
            "skills": ["skill", "ability", "competency", "expertise", "strength"],
            "job_titles": ["job title", "position", "role", "title"],
            "education": ["degree", "certificate", "diploma", "qualification", "education"],
            "experience": ["experience", "work", "employment", "career", "job"],
            "company": ["company", "organization", "corporation", "firm", "business"],
            "location": ["location", "city", "state", "country", "region"],
            "date": ["date", "year", "month", "day", "time", "period"],
            "action_verbs": ["action verb", "verb", "verb phrase", "action phrase"],
            "bullets": ["bullet", "point", "item", "task", "responsibility"],
            "achievements": ["achievement", "accomplishment", "success", "result", "outcome"],
            "skills_and_experience": ["skill and experience", "skill and job", "experience and skill", "job and skill"],
            "skills_and_education": ["skill and education", "education and skill", "skills and qualification", "qualification and skill"],
            "skills_and_achievements": ["skill and achievement", "achievement and skill", "skills and success", "success and skill"],
            "experience_and_achievements": ["experience and achievement", "achievement and experience", "experience and success", "success and experience"]
            # Removing the excessive repetitive patterns that were causing syntax issues
        }
    
    def _get_builtin_taxonomy_data(self) -> Dict[str, Any]:
        """Get built-in minimal dataset for skill/job taxonomy"""
        return {
            "skills": {
                "Software Development": ["Python", "Java", "C++", "JavaScript", "SQL"],
                "Data Analysis": ["Pandas", "NumPy", "Matplotlib", "Scikit-learn", "SQL"],
                "Machine Learning": ["TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "SQL"],
                "Web Development": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
                "Database Management": ["MySQL", "PostgreSQL", "MongoDB", "SQL Server", "Oracle"],
                "DevOps": ["Docker", "Kubernetes", "Jenkins", "Ansible", "Terraform"],
                "Cloud Computing": ["AWS", "Azure", "Google Cloud", "IBM Cloud", "Oracle Cloud"],
                "Cybersecurity": ["Ethical Hacking", "Network Security", "Cryptography", "Security Analysis", "Firewall Configuration"],
                "Project Management": ["Agile", "Scrum", "Kanban", "Waterfall", "PRINCE2"],
                "Communication": ["Public Speaking", "Presentation Skills", "Effective Communication", "Conflict Resolution", "Team Building"]
            },
            "job_titles": {
                "Software Developer": ["Software Engineer", "Full Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer"],
                "Data Scientist": ["Data Analyst", "Machine Learning Engineer", "Data Engineer", "Data Scientist", "Data Analyst"],
                "Machine Learning Engineer": ["Data Scientist", "Machine Learning Engineer", "AI Engineer", "Data Engineer", "Data Scientist"],
                "Web Developer": ["Frontend Developer", "Full Stack Developer", "Backend Developer", "Web Developer", "Frontend Developer"],
                "Database Administrator": ["Database Engineer", "Database Administrator", "Data Engineer", "Database Administrator", "Database Engineer"],
                "DevOps Engineer": ["DevOps Engineer", "DevOps Engineer", "DevOps Engineer", "DevOps Engineer", "DevOps Engineer"],
                "Cloud Engineer": ["Cloud Engineer", "Cloud Engineer", "Cloud Engineer", "Cloud Engineer", "Cloud Engineer"],
                "Cybersecurity Analyst": ["Cybersecurity Analyst", "Cybersecurity Analyst", "Cybersecurity Analyst", "Cybersecurity Analyst", "Cybersecurity Analyst"],
                "Project Manager": ["Project Manager", "Agile Project Manager", "Scrum Master", "Waterfall Project Manager", "PRINCE2 Project Manager"],
                "Communication Specialist": ["Communication Specialist", "Public Speaker", "Presentation Skills", "Effective Communicator", "Team Builder"]
            },
            "education": {
                "Bachelor's Degree": ["Computer Science", "Information Technology", "Software Engineering", "Data Science", "Cybersecurity"],
                "Master's Degree": ["Computer Science", "Information Technology", "Software Engineering", "Data Science", "Cybersecurity"],
                "PhD": ["Computer Science", "Information Technology", "Software Engineering", "Data Science", "Cybersecurity"],
                "Certification": ["AWS Certified Cloud Practitioner", "CCNA", "CompTIA A+", "CompTIA Network+", "CompTIA Security+"],
                "Diploma": ["Software Development", "Data Analysis", "Machine Learning", "Web Development", "Database Management"]
            },
            "experience": {
                "Entry Level": ["Internship", "Junior Developer", "Data Analyst", "Machine Learning Intern", "Cybersecurity Intern"],
                "Mid Level": ["Software Engineer", "Data Scientist", "Machine Learning Engineer", "Full Stack Developer", "DevOps Engineer"],
                "Senior Level": ["Software Architect", "Data Science Lead", "Machine Learning Lead", "Full Stack Architect", "DevOps Lead"],
                "Lead Level": ["Technical Lead", "Data Science Manager", "Machine Learning Manager", "Full Stack Manager", "DevOps Manager"],
                "Manager Level": ["Team Lead", "Data Science Team Lead", "Machine Learning Team Lead", "Full Stack Team Lead", "DevOps Team Lead"]
            },
            "company": {
                "Startup": ["Early Stage", "Seed Stage", "Series A", "Series B", "Series C"],
                "Mid-sized Company": ["Mid-sized", "Mid-sized", "Mid-sized", "Mid-sized", "Mid-sized"],
                "Large Corporation": ["Fortune 500", "Global 2000", "Global 1000", "Global 500", "Global 200"],
                "Government Agency": ["Federal", "State", "Local", "International", "Non-profit"],
                "Non-profit Organization": ["Non-profit", "Non-profit", "Non-profit", "Non-profit", "Non-profit"]
            },
            "location": {
                "City": ["New York", "London", "Tokyo", "Sydney", "Berlin"],
                "State": ["California", "Texas", "London", "Ontario", "Berlin"],
                "Country": ["USA", "UK", "Japan", "Australia", "Germany"],
                "Region": ["North America", "Europe", "Asia", "Oceania", "Australia"]
            },
            "date": {
                "Year": ["2015", "2016", "2017", "2018", "2019"],
                "Month": ["January", "February", "March", "April", "May"],
                "Day": ["1", "15", "28", "30", "31"],
                "Time": ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"],
                "Period": ["AM", "PM", "AM", "PM", "AM"]
            },
            "action_verbs": {
                "Action Verb": ["Achieved", "Developed", "Implemented", "Managed", "Lead"],
                "Verb": ["Worked", "Developed", "Managed", "Led", "Lead"],
                "Verb Phrase": ["Worked on", "Developed", "Managed", "Led", "Lead"],
                "Action Phrase": ["Achieved", "Developed", "Implemented", "Managed", "Led"]
            },
            "bullets": {
                "Bullet": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Point": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Item": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Task": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Responsibility": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"]
            },
            "achievements": {
                "Achievement": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Accomplishment": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Success": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Result": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"],
                "Outcome": ["Task", "Responsibility", "Achievement", "Accomplishment", "Success"]
            },
            "skills_and_experience": {
                "Skill and Experience": ["Skill and Job", "Experience and Skill", "Job and Skill", "Skill and Job"],
                "Skill and Education": ["Skill and Education", "Education and Skill", "Skills and Qualification", "Qualification and Skill"],
                "Skill and Achievement": ["Skill and Achievement", "Achievement and Skill", "Skills and Success", "Success and Skill"],
                "Experience and Achievement": ["Experience and Achievement", "Achievement and Experience", "Experience and Success", "Success and Experience"]
            },
            "skills_and_education": {
                "Skill and Education": ["Skill and Education", "Education and Skill", "Skills and Qualification", "Qualification and Skill"],
                "Education and Skill": ["Skill and Education", "Education and Skill", "Skills and Qualification", "Qualification and Skill"],
                "Skills and Qualification": ["Skill and Education", "Education and Skill", "Skills and Qualification", "Qualification and Skill"],
                "Qualification and Skill": ["Skill and Education", "Education and Skill", "Skills and Qualification", "Qualification and Skill"]
            },
            "skills_and_achievements": {
                "Skill and Achievement": ["Skill and Achievement", "Achievement and Skill", "Skills and Success", "Success and Skill"],
                "Achievement and Skill": ["Skill and Achievement", "Achievement and Skill", "Skills and Success", "Success and Skill"],
                "Skills and Success": ["Skill and Achievement", "Achievement and Skill", "Skills and Success", "Success and Skill"],
                "Success and Skill": ["Skill and Achievement", "Achievement and Skill", "Skills and Success", "Success and Skill"]
            },
            "experience_and_achievements": {
                "Experience and Achievement": ["Experience and Achievement", "Achievement and Experience", "Experience and Success", "Success and Experience"],
                "Achievement and Experience": ["Experience and Achievement", "Achievement and Experience", "Experience and Success", "Success and Experience"],
                "Experience and Success": ["Experience and Achievement", "Achievement and Experience", "Experience and Success", "Success and Experience"],
                "Success and Experience": ["Experience and Achievement", "Achievement and Experience", "Experience and Success", "Success and Experience"]
            }
        }
    
 