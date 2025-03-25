# ============================
# SECTION 6a: CAREER DATA GENERATION AND RETRIEVAL
# ============================

import random
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any, Optional
import traceback

try:
    from datasets import load_dataset
    DATASETS_AVAILABLE = True
except ImportError:
    DATASETS_AVAILABLE = False
    logging.warning("Hugging Face datasets library not available")

try:
    import spacy
    import nltk
    from nltk.corpus import stopwords
    from sklearn.feature_extraction.text import TfidfVectorizer
    from transformers import pipeline
    from collections import Counter
    NLP_AVAILABLE = True
except ImportError:
    NLP_AVAILABLE = False
    logging.warning("NLP libraries not available. Advanced text processing will be limited.")

print("Initializing Career Data Generation and Retrieval...")

# Comprehensive list of supported roles for interview generation
roles = [
    "AI Engineer", "Cybersecurity Analyst", "Data Analyst", "Full Stack Developer",
    "UI/UX Designer", "HR Business Partner", "Cloud Solutions Architect", "Software Tester",
    "Machine Learning Engineer", "DevOps Engineer", "Front-End Developer", "Back-End Developer",
    "Database Administrator", "IT Support Specialist", "Data Scientist", "Product Manager",
    "Business Intelligence Analyst", "IT Project Manager", "Digital Marketing Specialist",
    "Network Security Engineer", "Penetration Tester (Ethical Hacker)", "Computer Vision Engineer",
    "NLP Engineer", "Scrum Master", "Mobile App Developer", "Blockchain Developer",
    "Robotics Engineer", "Technical Support Engineer", "Systems Administrator", "IT Auditor",
    "Finance Manager", "Project Manager"
]

print(f"Initialized {len(roles)} career roles for the Tamkeen AI Career Intelligence System")

# Define industry sectors
sectors = [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
    "Retail", "Government", "Energy", "Telecommunications", "Transportation",
    "Entertainment", "Agriculture", "Construction", "Hospitality", "Consulting"
]

# Map roles to likely sectors (for synthetic data generation)
role_sector_mapping = {
    "AI Engineer": ["Technology", "Finance", "Healthcare", "Energy"],
    "Cybersecurity Analyst": ["Technology", "Finance", "Government", "Healthcare"],
    "Data Analyst": ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"],
    "Full Stack Developer": ["Technology", "Telecommunications", "Finance", "Entertainment"],
    "UI/UX Designer": ["Technology", "Retail", "Entertainment", "Consulting"],
    "HR Business Partner": ["Technology", "Healthcare", "Finance", "Manufacturing", "Retail"],
    "Cloud Solutions Architect": ["Technology", "Finance", "Healthcare", "Telecommunications"],
    "Software Tester": ["Technology", "Finance", "Healthcare", "Manufacturing"],
    "Machine Learning Engineer": ["Technology", "Finance", "Healthcare", "Manufacturing"],
    "DevOps Engineer": ["Technology", "Finance", "Telecommunications", "Retail"],
    "Front-End Developer": ["Technology", "Entertainment", "Retail", "Finance"],
    "Back-End Developer": ["Technology", "Finance", "Telecommunications", "Retail"],
    "Database Administrator": ["Technology", "Finance", "Healthcare", "Government"],
    "IT Support Specialist": ["Technology", "Healthcare", "Education", "Finance"],
    "Data Scientist": ["Technology", "Finance", "Healthcare", "Energy", "Manufacturing"],
    "Product Manager": ["Technology", "Retail", "Finance", "Telecommunications"],
    "Business Intelligence Analyst": ["Finance", "Retail", "Technology", "Healthcare"],
    "IT Project Manager": ["Technology", "Finance", "Healthcare", "Manufacturing"],
    "Digital Marketing Specialist": ["Retail", "Technology", "Entertainment", "Hospitality"],
    "Network Security Engineer": ["Technology", "Finance", "Government", "Telecommunications"],
    "Penetration Tester (Ethical Hacker)": ["Technology", "Finance", "Government", "Energy"],
    "Computer Vision Engineer": ["Technology", "Healthcare", "Manufacturing", "Transportation"],
    "NLP Engineer": ["Technology", "Healthcare", "Finance", "Telecommunications"],
    "Scrum Master": ["Technology", "Finance", "Healthcare", "Manufacturing"],
    "Mobile App Developer": ["Technology", "Retail", "Entertainment", "Finance"],
    "Blockchain Developer": ["Finance", "Technology", "Government", "Energy"],
    "Robotics Engineer": ["Manufacturing", "Technology", "Healthcare", "Transportation"],
    "Technical Support Engineer": ["Technology", "Telecommunications", "Healthcare", "Education"],
    "Systems Administrator": ["Technology", "Finance", "Government", "Education"],
    "IT Auditor": ["Finance", "Technology", "Government", "Healthcare"],
    "Finance Manager": ["Finance", "Technology", "Healthcare", "Manufacturing", "Retail"],
    "Project Manager": ["Technology", "Construction", "Manufacturing", "Finance", "Healthcare"]
}

# Define skills for each role (for synthetic data generation)
role_skills_mapping = {
    "AI Engineer": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Deep Learning", "Computer Vision", "NLP", "Data Structures", "Algorithms", "Cloud Computing"],
    "Cybersecurity Analyst": ["Network Security", "Penetration Testing", "Vulnerability Assessment", "SIEM", "Security Auditing", "Linux", "Incident Response", "Firewall Management", "Risk Assessment", "Security Compliance"],
    "Data Analyst": ["SQL", "Python", "Data Visualization", "Statistical Analysis", "Excel", "Power BI", "Tableau", "Data Cleaning", "Reporting", "Database Management"],
    "Full Stack Developer": ["JavaScript", "React", "Node.js", "HTML/CSS", "SQL", "RESTful APIs", "Git", "MongoDB", "AWS", "Docker"],
    "UI/UX Designer": ["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Information Architecture", "Usability Testing", "Visual Design", "Responsive Design", "Interaction Design"],
    "HR Business Partner": ["Talent Management", "Employee Relations", "HR Metrics", "Organizational Development", "Change Management", "Performance Management", "HRIS", "Compensation & Benefits", "Recruitment", "Labor Laws"],
    "Cloud Solutions Architect": ["AWS", "Azure", "Google Cloud", "IaaS", "PaaS", "Serverless", "Microservices", "Cloud Security", "Containerization", "Infrastructure as Code"],
    "Software Tester": ["Test Planning", "Manual Testing", "Automated Testing", "Selenium", "API Testing", "Test Case Design", "Regression Testing", "JIRA", "QA Methodologies", "Performance Testing"],
    "Machine Learning Engineer": ["Python", "Scikit-learn", "TensorFlow", "Deep Learning", "Computer Vision", "NLP", "Data Preprocessing", "Feature Engineering", "Model Deployment", "MLOps"],
    "DevOps Engineer": ["CI/CD", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "AWS", "Monitoring", "Linux", "Git"],
    "Front-End Developer": ["HTML/CSS", "JavaScript", "React", "Angular", "Vue.js", "Responsive Design", "SASS/LESS", "Webpack", "Jest", "TypeScript"],
    "Back-End Developer": ["Node.js", "Python", "Java", "C#", "SQL", "NoSQL", "RESTful APIs", "GraphQL", "Microservices", "Authentication/Authorization"],
    "Database Administrator": ["SQL", "Oracle", "MySQL", "PostgreSQL", "Database Design", "Performance Tuning", "Backup & Recovery", "Data Migration", "Database Security", "Query Optimization"],
    "IT Support Specialist": ["Troubleshooting", "Windows", "Mac OS", "Active Directory", "Network Support", "Hardware Support", "Customer Service", "Ticketing Systems", "Remote Support", "IT Documentation"],
    "Data Scientist": ["Python", "R", "Machine Learning", "Statistical Analysis", "Data Visualization", "SQL", "Big Data", "Hypothesis Testing", "A/B Testing", "Data Mining"],
    "Product Manager": ["Product Strategy", "Market Research", "User Stories", "Roadmapping", "Agile Methodologies", "Stakeholder Management", "Competitive Analysis", "Product Lifecycle", "Prioritization", "Analytics"],
    "Business Intelligence Analyst": ["SQL", "Data Visualization", "ETL", "Dimensional Modeling", "Reporting", "Power BI", "Tableau", "Data Warehousing", "Business Requirements", "KPI Tracking"],
    "IT Project Manager": ["Project Planning", "SDLC", "Budget Management", "Risk Management", "Team Leadership", "JIRA", "Agile", "Waterfall", "Stakeholder Management", "Project Documentation"],
    "Digital Marketing Specialist": ["SEO", "SEM", "Social Media Marketing", "Content Marketing", "Email Marketing", "Google Analytics", "PPC", "Marketing Automation", "CRM", "Marketing Strategy"],
    "Network Security Engineer": ["Firewall Management", "VPN", "IDS/IPS", "Network Protocols", "Security Auditing", "SIEM", "Threat Intelligence", "Vulnerability Management", "Zero Trust", "Identity Management"],
    "Penetration Tester (Ethical Hacker)": ["Ethical Hacking", "Vulnerability Assessment", "Burp Suite", "Kali Linux", "OWASP", "Social Engineering", "Metasploit", "Network Security", "Web Application Security", "Security Reporting"],
    "Computer Vision Engineer": ["OpenCV", "Deep Learning", "Image Processing", "Object Detection", "TensorFlow", "PyTorch", "Python", "Feature Extraction", "Image Classification", "Computer Vision Algorithms"],
    "NLP Engineer": ["Natural Language Processing", "Machine Learning", "Deep Learning", "NLTK", "spaCy", "Word Embeddings", "Sentiment Analysis", "Text Classification", "Python", "Transformers"],
    "Scrum Master": ["Agile Methodologies", "Scrum", "Kanban", "Sprint Planning", "Retrospectives", "Team Facilitation", "Coaching", "Impediment Removal", "JIRA", "Stakeholder Management"],
    "Mobile App Developer": ["Android", "iOS", "React Native", "Swift", "Kotlin", "Mobile UI/UX", "API Integration", "Firebase", "App Store Deployment", "Mobile Testing"],
    "Blockchain Developer": ["Blockchain", "Smart Contracts", "Solidity", "Ethereum", "Bitcoin", "Consensus Algorithms", "Cryptography", "Web3.js", "DApps", "Tokenomics"],
    "Robotics Engineer": ["Robotics", "Control Systems", "ROS", "Mechanics", "Sensor Integration", "Computer Vision", "Path Planning", "Embedded Systems", "C++", "MATLAB"],
    "Technical Support Engineer": ["Technical Troubleshooting", "Customer Service", "Product Knowledge", "Remote Support", "Documentation", "Escalation Management", "SLAs", "Ticketing Systems", "Knowledge Base", "Problem Resolution"],
    "Systems Administrator": ["Windows Server", "Linux", "Active Directory", "DNS", "DHCP", "System Monitoring", "Virtualization", "Backup & Recovery", "Patch Management", "PowerShell"],
    "IT Auditor": ["IT Governance", "Risk Assessment", "Compliance", "Audit Methodologies", "SOX", "GDPR", "HIPAA", "Internal Controls", "Documentation", "Reporting"],
    "Finance Manager": ["Financial Planning", "Budgeting", "Forecasting", "Financial Analysis", "Accounting", "Tax Planning", "Cash Flow Management", "Financial Reporting", "Risk Management", "Regulatory Compliance"],
    "Project Manager": ["Project Planning", "Scope Management", "Resource Allocation", "Risk Management", "Stakeholder Communication", "Budgeting", "Timeline Management", "PRINCE2", "PMP", "Agile Methodologies"]
}

# Load external dataset
print("Loading recruitment job descriptions dataset...")
recruitment_ds = None
try:
    if DATASETS_AVAILABLE:
        recruitment_ds = load_dataset("lang-uk/recruitment-dataset-job-descriptions-english")
        print(f"Successfully loaded recruitment dataset with {len(recruitment_ds['train'])} job descriptions")
    else:
        print("Hugging Face datasets not available. Skipping external dataset loading.")
except Exception as e:
    print(f"Error loading recruitment dataset: {e}")
    print("Will fall back to synthetic data generation")

def find_matching_external_data(role, dataset=None):
    """Find matching job descriptions from external dataset based on role"""
    if dataset is None or 'train' not in dataset:
        return []

    # Convert role to lowercase for matching
    role_lower = role.lower()
    matching_data = []

    # Check each record in the dataset
    for item in dataset['train']:
        title = item.get('title', '').lower()
        description = item.get('description', '').lower()

        # Check if role matches title or is mentioned in description
        if (role_lower in title or
            role_lower.replace(' ', '') in title.replace(' ', '') or
            role_lower in description):
            matching_data.append(item)

    return matching_data

def generate_synthetic_career_profile(role):
    """Generate a synthetic career profile for a given role"""
    # Select a random sector appropriate for this role
    if role in role_sector_mapping:
        sector = random.choice(role_sector_mapping[role])
    else:
        sector = random.choice(sectors)

    # Generate experience level
    experience_levels = ["Entry Level", "Mid Level", "Senior Level", "Expert"]
    experience_weights = [0.2, 0.4, 0.3, 0.1]  # More mid-level than others
    experience = random.choices(experience_levels, weights=experience_weights)[0]

    # Generate years of experience based on level
    if experience == "Entry Level":
        years = random.randint(0, 2)
    elif experience == "Mid Level":
        years = random.randint(3, 5)
    elif experience == "Senior Level":
        years = random.randint(6, 10)
    else:  # Expert
        years = random.randint(10, 20)

    # Generate salary range based on experience
    base_salary = {
        "Entry Level": random.randint(40000, 60000),
        "Mid Level": random.randint(60000, 90000),
        "Senior Level": random.randint(90000, 130000),
        "Expert": random.randint(130000, 200000)
    }

    # Adjust for role premium/discount
    role_premium = {
        "AI Engineer": 1.3,
        "Cybersecurity Analyst": 1.2,
        "Data Scientist": 1.25,
        "DevOps Engineer": 1.15,
        "Cloud Solutions Architect": 1.3,
        "Machine Learning Engineer": 1.3,
        "Blockchain Developer": 1.2,
        "Computer Vision Engineer": 1.25,
        "NLP Engineer": 1.25,
        "IT Support Specialist": 0.8,
        "Technical Support Engineer": 0.85
    }

    salary_multiplier = role_premium.get(role, 1.0)
    salary = int(base_salary[experience] * salary_multiplier)
    salary_range = f"${salary - 10000} - ${salary + 10000}"

    # Select relevant skills for this role
    if role in role_skills_mapping:
        all_skills = role_skills_mapping[role]
        # For entry/mid level, fewer skills; for senior/expert, more skills
        if experience in ["Entry Level", "Mid Level"]:
            num_skills = random.randint(4, 7)
        else:
            num_skills = random.randint(7, 10)
        skills = random.sample(all_skills, num_skills)
    else:
        # Generic skills if role not in mapping
        generic_skills = ["Communication", "Problem Solving", "Teamwork", "Analytical Skills", "Time Management"]
        skills = random.sample(generic_skills, 3)

    # Generate education level
    education_levels = ["High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD"]
    education_weights = [0.05, 0.15, 0.5, 0.25, 0.05]  # Bachelor's most common
    education = random.choices(education_levels, weights=education_weights)[0]

    # Generate job satisfaction score
    satisfaction = random.randint(1, 10)

    # Generate work-life balance rating
    work_life = random.randint(1, 10)

    # Generate job growth potential
    growth_potential = random.randint(1, 10)

    # Generate job description (placeholder - could use LLM in the future)
    description = f"Professional {role} with {years} years of experience in the {sector} sector. Skilled in {', '.join(skills[:-1])} and {skills[-1]}."

    # Generate career profile
    profile = {
        "role": role,
        "sector": sector,
        "experience_level": experience,
        "years_experience": years,
        "skills": skills,
        "education": education,
        "salary_range": salary_range,
        "job_satisfaction": satisfaction,
        "work_life_balance": work_life,
        "growth_potential": growth_potential,
        "description": description,
        "source": "synthetic"
    }

    return profile

def generate_synthetic_career_profiles(num_profiles=100):
    """Generate multiple synthetic career profiles"""
    profiles = []

    print(f"Generating {num_profiles} synthetic career profiles...")
    for _ in range(num_profiles):
        # Select a random role
        role = random.choice(roles)
        profile = generate_synthetic_career_profile(role)
        profiles.append(profile)

    print(f"Generated {len(profiles)} synthetic career profiles")
    return profiles

def prepare_career_dataset(use_external=True, min_profiles=1000):
    """Prepare a comprehensive dataset combining external and synthetic data"""
    combined_dataset = []
    external_count = 0
    synthetic_count = 0

    # First try to use external data if available
    if use_external and recruitment_ds is not None:
        print("Processing external recruitment dataset...")

        # Extract and process each role
        for role in roles:
            matching_data = find_matching_external_data(role, recruitment_ds)
            print(f"Found {len(matching_data)} external listings for {role}")

            for item in matching_data:
                processed_item = {
                    "role": role,
                    "sector": item.get('industry', 'Technology'),  # Default to Technology if not specified
                    "description": item.get('description', ''),
                    "skills": item.get('skills', []),
                    "experience_level": "Not Specified",
                    "years_experience": 0,  # Default value
                    "education": "Not Specified",
                    "salary_range": item.get('salary', 'Not Specified'),
                    "job_satisfaction": None,
                    "work_life_balance": None,
                    "growth_potential": None,
                    "source": "external"
                }
                combined_dataset.append(processed_item)
                external_count += 1

    # Calculate how many synthetic profiles we need
    synthetic_needed = max(0, min_profiles - len(combined_dataset))

    if synthetic_needed > 0:
        print(f"Generating {synthetic_needed} synthetic profiles to reach minimum threshold...")
        synthetic_profiles = generate_synthetic_career_profiles(synthetic_needed)
        combined_dataset.extend(synthetic_profiles)
        synthetic_count = len(synthetic_profiles)

    # Convert to DataFrame for easier processing
    df = pd.DataFrame(combined_dataset)

    print(f"Final career dataset prepared with {len(df)} profiles:")
    print(f"- {external_count} from external sources")
    print(f"- {synthetic_count} synthetically generated")

    # Save to CSV for future use
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/career_profiles_dataset.csv", index=False)
    print("Dataset saved to 'data/career_profiles_dataset.csv'")

    return df

# Function to get job requirements for a specific role
def get_job_requirements(role):
    """Get job requirements for a specific role from the dataset"""
    # Try to load existing dataset first
    try:
        df = pd.read_csv("data/career_profiles_dataset.csv")
        role_data = df[df['role'] == role]

        if len(role_data) > 0:
            # Aggregate skills from all matching profiles
            all_skills = []
            for skills in role_data['skills']:
                if isinstance(skills, str):
                    # Handle skills stored as string representations of lists
                    try:
                        # Try parsing as JSON first
                        skills_list = json.loads(skills.replace("'", "\""))
                        all_skills.extend(skills_list)
                    except:
                        # Fallback parsing
                        skills_parts = skills.strip('[]').split(',')
                        all_skills.extend([s.strip().strip("'\"") for s in skills_parts])

            # Get most common skills
            if all_skills:
                skill_counts = Counter(all_skills)
                common_skills = [skill for skill, count in skill_counts.most_common(10)]
            else:
                # Fallback to predefined skills
                common_skills = role_skills_mapping.get(role, ["Communication", "Problem Solving"])

            # Get average salary range and experience
            try:
                avg_experience = role_data['years_experience'].mean()
            except:
                avg_experience = 3  # Default

            return {
                "role": role,
                "skills": common_skills,
                "avg_experience": avg_experience
            }

    except (FileNotFoundError, KeyError) as e:
        print(f"Error loading career dataset: {e}")

    # Fallback to predefined mappings if dataset approach fails
    if role in role_skills_mapping:
        return {
            "role": role,
            "skills": role_skills_mapping[role][:10],
            "avg_experience": 3  # Default value
        }
    else:
        return {
            "role": role,
            "skills": ["Communication", "Problem Solving", "Teamwork"],
            "avg_experience": 3
        }

# Initialize the dataset if needed
def init_career_dataset():
    """Initialize or load the career dataset"""
    if not os.path.exists("data/career_profiles_dataset.csv"):
        print("No existing career profiles dataset found. Generating initial dataset...")
        career_dataset = prepare_career_dataset(use_external=True, min_profiles=500)
    else:
        print("Existing career profiles dataset found.")
        try:
            career_dataset = pd.read_csv("data/career_profiles_dataset.csv")
            print(f"Loaded {len(career_dataset)} career profiles from existing dataset")
        except Exception as e:
            print(f"Error loading existing dataset: {e}")
            print("Generating new dataset...")
            career_dataset = prepare_career_dataset(use_external=True, min_profiles=500)
    
    return career_dataset

class CareerDataEnhancer:
    def __init__(self):
        """
        Initialize advanced career data generation tools
        """
        # Load NLP models
        try:
            if NLP_AVAILABLE:
                try:
                    self.nlp = spacy.load('en_core_web_sm')
                except OSError:
                    print("Downloading spaCy English model...")
                    import subprocess
                    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
                    self.nlp = spacy.load('en_core_web_sm')

                # Initialize skill extraction pipeline
                self.skill_extractor = pipeline('ner', model='dslim/bert-base-NER')

                # Stopwords for cleaning
                try:
                    nltk.data.find('corpora/stopwords')
                except LookupError:
                    nltk.download('stopwords')
                    nltk.download('punkt')

                self.stop_words = set(stopwords.words('english'))
            else:
                self.nlp = None
                self.skill_extractor = None
                self.stop_words = set()
                print("NLP libraries not available. Using fallback methods.")
        except Exception as e:
            print(f"Error initializing NLP components: {e}")
            self.nlp = None
            self.skill_extractor = None
            self.stop_words = set()

        # Advanced skill mapping
        self.skill_synonyms = {
            "Python": ["python programming", "python dev", "python developer"],
            "Machine Learning": ["ml", "machine learning engineer", "ai"],
            "Data Science": ["data scientist", "data analysis", "data analytics"]
        }

    def extract_advanced_skills(self, text, role):
        """
        Advanced skill extraction using multiple techniques
        """
        # Predefined role skills
        base_skills = role_skills_mapping.get(role, [])

        if not NLP_AVAILABLE or self.nlp is None:
            return base_skills[:10]

        # NER-based skill extraction
        ner_skills = self._extract_skills_with_ner(text)

        # TF-IDF based skill extraction
        tfidf_skills = self._extract_skills_with_tfidf(text)

        # Combine and deduplicate skills
        combined_skills = list(set(
            base_skills +
            ner_skills +
            tfidf_skills
        ))

        return combined_skills[:10]

    def _extract_skills_with_ner(self, text):
        """
        Use BERT NER for skill extraction
        """
        if not NLP_AVAILABLE or self.skill_extractor is None:
            return []

        try:
            ner_results = self.skill_extractor(text)
            skills = [
                entity['word']
                for entity in ner_results
                if entity['entity'] in ['B-SKILL', 'I-SKILL']
            ]
            return skills
        except Exception as e:
            print(f"NER Skill Extraction Error: {e}")
            return []

    def _extract_skills_with_tfidf(self, text, top_n=5):
        """
        Use TF-IDF to extract potential skills
        """
        if not NLP_AVAILABLE or self.nlp is None:
            return []

        try:
            # Preprocess text
            doc = self.nlp(text.lower())
            cleaned_text = ' '.join([
                token.lemma_
                for token in doc
                if token.text not in self.stop_words
                and token.is_alpha
            ])

            # Create TF-IDF vectorizer
            vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),
                max_features=100
            )

            # Fit and extract top skills
            tfidf_matrix = vectorizer.fit_transform([cleaned_text])
            feature_names = vectorizer.get_feature_names_out()

            # Get top skills by TF-IDF score
            top_indices = tfidf_matrix.toarray()[0].argsort()[-top_n:][::-1]
            return [feature_names[i] for i in top_indices]
        except Exception as e:
            print(f"TF-IDF Skill Extraction Error: {e}")
            return []

    def generate_comprehensive_profile(self, role):
        """
        Generate a comprehensive career profile with advanced enrichment
        """
        # Base synthetic profile generation
        base_profile = generate_synthetic_career_profile(role)

        # Advanced skill enrichment
        if 'description' in base_profile:
            advanced_skills = self.extract_advanced_skills(
                base_profile['description'],
                role
            )
            base_profile['extracted_skills'] = advanced_skills

        # Career trajectory prediction
        base_profile['potential_career_paths'] = self._predict_career_paths(role)

        # Salary trend analysis
        base_profile['salary_trend'] = self._analyze_salary_trend(
            base_profile['salary_range'],
            base_profile['years_experience']
        )

        return base_profile

    def _predict_career_paths(self, role):
        """
        Predict potential career progression paths
        """
        career_progression = {
            "AI Engineer": [
                "Senior AI Engineer",
                "AI Research Scientist",
                "Chief AI Officer",
                "AI Product Manager"
            ],
            "Data Scientist": [
                "Senior Data Scientist",
                "Data Science Manager",
                "Chief Data Officer",
                "AI/ML Specialist"
            ],
            # Add more roles and progression paths
            "default": [
                "Senior " + role,
                "Lead " + role,
                "Principal " + role
            ]
        }

        return career_progression.get(role, career_progression['default'])

    def _analyze_salary_trend(self, salary_range, years_experience):
        """
        Predict salary trends based on experience
        """
        try:
            # Extract numeric salary values
            min_salary, max_salary = map(
                lambda x: int(x.replace('$', '').replace(',', '')),
                salary_range.split(' - ')
            )

            # Simple linear projection
            growth_rate = 0.05 * years_experience
            projected_min = int(min_salary * (1 + growth_rate))
            projected_max = int(max_salary * (1 + growth_rate))

            return {
                'current_range': salary_range,
                'projected_range': f'${projected_min} - ${projected_max}',
                'annual_growth_rate': f'{growth_rate * 100:.2f}%'
            }
        except Exception as e:
            print(f"Salary trend analysis error: {e}")
            return None

def enhanced_career_dataset_generation(num_profiles=15000):
    """
    Generate an enhanced career dataset with advanced techniques
    """
    enhancer = CareerDataEnhancer()
    enhanced_profiles = []

    print("Generating enhanced career profiles...")
    profiles_per_role = num_profiles // len(roles)
    for role in roles:
        # Generate multiple profiles for each role
        for _ in range(profiles_per_role):
            profile = enhancer.generate_comprehensive_profile(role)
            enhanced_profiles.append(profile)

    # Convert to DataFrame
    df = pd.DataFrame(enhanced_profiles)

    # Save enhanced dataset
    os.makedirs("data", exist_ok=True)
    df.to_csv('data/enhanced_career_profiles.csv', index=False)
    print(f"Generated {len(enhanced_profiles)} enhanced career profiles")

    return df

# Code to run when this module is executed directly
if __name__ == "__main__":
    # Initialize the dataset
    career_dataset = init_career_dataset()
    
    # Sample code to demonstrate usage
    sample_role = "Data Scientist"
    requirements = get_job_requirements(sample_role)
    print(f"\nSample requirements for {sample_role}:")
    print(f"- Top skills: {', '.join(requirements['skills'][:5])}")
    print(f"- Avg. experience: {requirements['avg_experience']:.1f} years")
    
    print("\nSection 6a complete: Career data generation and retrieval finished.\n")
    
    # Force regeneration of career dataset with 15,000 profiles
    # First remove the existing dataset if it exists
    if os.path.exists("data/career_profiles_dataset.csv"):
        print("Removing existing dataset file...")
        os.remove("data/career_profiles_dataset.csv")

    # Generate a new, much larger dataset
    print("Generating a new dataset with 15,000 profiles...")
    career_dataset = prepare_career_dataset(use_external=True, min_profiles=15000)

    # Verify the size of the new dataset
    print(f"New dataset contains {len(career_dataset)} career profiles")

    # Execute enhanced dataset generation if requested
    try:
        print("Generating an enhanced dataset with profiles for each role...")
        enhanced_career_dataset = enhanced_career_dataset_generation(15000)
        print(f"Generated {len(enhanced_career_dataset)} enhanced career profiles")
    except Exception as e:
        print(f"Enhanced dataset generation failed: {e}")
        traceback.print_exc() 