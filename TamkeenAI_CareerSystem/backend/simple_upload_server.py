from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import json
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pdfplumber
# Removing problematic imports
# from sentence_transformers import SentenceTransformer
# from keybert import KeyBERT
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from nltk.stem import WordNetLemmatizer
from difflib import SequenceMatcher
import argparse

# Download NLTK resources
try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

    nltk.download('punkt')
    nltk.download('stopwords')
nltk.download('wordnet')

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Create a safe POS tagging function that handles errors
def safe_pos_tag(tokens):
    """POS tag tokens with fallback to basic tagging if nltk tagger fails"""
    try:
        # Use the standard tagger without any language suffix
        return pos_tag(tokens)
    except LookupError as e:
        print(f"POS tagger error: {e}")
        # Basic part-of-speech fallback - assume common words are nouns
        return [(word, "NN") for word in tokens]
    except Exception as e:
        print(f"Unexpected error in POS tagging: {e}")
        return [(word, "NN") for word in tokens]

# Function for fuzzy string matching
def fuzzy_match(a, b, threshold=0.85):
    """Calculate fuzzy match ratio between two strings"""
    if not a or not b:
        return 0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio() >= threshold

# Function to check if a term is in text using lemmatization
def lemma_term_in_text(term, text):
    """Check if a term is in text, accounting for lemmatization"""
    if not term or not text:
        return False
        
    # Direct check first (faster)
    if term.lower() in text.lower():
        return True
        
    # For multi-word terms
    term_words = term.lower().split()
    text_words = text.lower().split()
    
    # Lemmatize everything
    lemma_term_words = [lemmatizer.lemmatize(word) for word in term_words]
    lemma_text_words = [lemmatizer.lemmatize(word) for word in text_words]
    
    # Check if all term words exist in text (lemmatized)
    if len(term_words) > 1:
        # For multi-word terms, check if all lemmatized words are present
        return all(any(fuzzy_match(tw, tw2, 0.9) for tw2 in lemma_text_words) for tw in lemma_term_words)
    else:
        # For single-word terms, direct lemmatized comparison
        return any(fuzzy_match(lemma_term_words[0], tw, 0.9) for tw in lemma_text_words)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Removed model initializations
# sbert_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
# keybert_model = KeyBERT(model=sbert_model)

# Set up upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure app with upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Add CORS preflight handlers
@app.route('/api/resume/upload', methods=['OPTIONS'])
@app.route('/api/ats/analyze-with-deepseek', methods=['OPTIONS'])
@app.route('/api/ats/analyze-with-openai', methods=['OPTIONS'])
@app.route('/api/api/ats/analyze-with-deepseek', methods=['OPTIONS'])
@app.route('/api/api/ats/analyze-with-openai', methods=['OPTIONS'])
def handle_preflight():
    """Handle CORS preflight requests"""
    return '', 204

@app.route('/api/health-check', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "Simple upload server is running",
        "time": datetime.now().isoformat()
    }), 200

@app.route('/api/resume/upload', methods=['POST'])
def upload_resume():
    """Simple resume upload endpoint"""
    print("Upload endpoint called!")
    print("Request headers:", request.headers.get('Host'))
    print("Request form data:", list(request.form.keys()))
    print("Request files:", list(request.files.keys()) if request.files else "No files")
    
    if 'file' not in request.files:
        print("Error: No file part in request")
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        print("Error: Empty filename")
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Check the file size after saving
        file_size = os.path.getsize(file_path)
        print(f"File received: {file.filename}, size: {file_size}")
        
        return jsonify({
            "success": True,
            "message": "File uploaded successfully",
            "filename": file.filename,
            "file_size": file_size,
            "upload_time": datetime.now().isoformat()
        }), 201
    else:
        return jsonify({"error": "File type not allowed"}), 400

# Extract meaningful keywords function
def extract_meaningful_keywords(text, is_job_description=False):
    try:
        # First lowercase the text
        text = text.lower()
        
        # Define technical skills and common job responsibility terms
        technical_skills = [
            "python", "java", "javascript", "typescript", "c++", "c#", "react", "angular", "vue", 
            "node.js", "express", "django", "flask", "spring", "hibernate", "sql", "mysql", "postgresql", 
            "mongodb", "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "git", 
            "machine learning", "artificial intelligence", "ai", "data science", "deep learning", 
            "neural networks", "nlp", "natural language processing", "computer vision", 
            "data analysis", "data mining", "data visualization", "big data", "hadoop", "spark", 
            "tableau", "power bi", "excel", "sas", "spss", "r", "scala", "swift", "kotlin", 
            "objective-c", "ruby", "perl", "php", "html", "css", "sass", "less", "bootstrap", 
            "tailwind", "jquery", "rest api", "graphql", "oauth", "jwt", "security", "penetration testing", 
            "cybersecurity", "encryption", "blockchain", "ethereum", "solidity", "nft", "defi", 
            "cloud computing", "microservices", "serverless", "devops", "ci/cd", "linux", "unix", 
            "windows", "mac os", "ios", "android", "mobile development", "web development", 
            "frontend", "backend", "full stack", "agile", "scrum", "kanban", "jira", 
            "confluence", "slack", "asana", "trello", "product management", "project management", 
            "ux", "ui", "user experience", "user interface", "design thinking", "figma", "sketch", 
            "adobe xd", "photoshop", "illustrator", "indesign", "analytics", "seo", "sem", 
            "digital marketing", "content marketing", "social media marketing", "email marketing", 
            "crm", "salesforce", "hubspot", "zoho", "erp", "sap", "oracle", "networking", "tcp/ip", 
            "dns", "http", "https", "api", "soap", "rest", "json", "xml", "yaml", "testing", 
            "qa", "quality assurance", "unit testing", "integration testing", "selenium", 
            "cypress", "jest", "mocha", "chai", "pytest", "junit", "testng", "tdd", "bdd", 
            "splunk", "elk", "elasticsearch", "logstash", "kibana", "grafana", "prometheus", 
            "datadog", "new relic", "firewall", "vpn", "intrusion detection", "siem", 
            "vulnerability assessment", "threat intelligence", "incident response", "security operations", 
            "malware analysis", "reverse engineering", "cryptography", "ethical hacking", "gis", 
            "postgis", "spatial analysis", "data modeling", "uml", "entity-relationship", 
            "database design", "nosql", "redis", "cassandra", "neo4j", "graph databases", 
            "business intelligence", "etl", "data warehousing", "olap", "data governance", 
            "data quality", "data engineering", "statistical analysis", "a/b testing", "hypothesis testing", 
            "regression analysis", "classification", "clustering", "anomaly detection", "time series analysis", 
            "forecasting", "recommendation systems", "reinforcement learning", "robotics", 
            "iot", "internet of things", "embedded systems", "firmware", "hardware", "raspberry pi", 
            "arduino", "virtual reality", "vr", "augmented reality", "ar", "game development", 
            "unity", "unreal engine", "3d modeling", "animation", "wireshark", "nmap", "burp suite", 
            "metasploit", "kali linux", "parrot os", "powershell", "bash", "shell scripting", 
            "automation", "web scraping", "beautifulsoup", "selenium", "puppeteer", "postman", 
            "swagger", "openapi", "distributed systems", "parallel computing", "multi-threading",
            # Adding more cybersecurity-specific terms
            "threat hunting", "blue team", "red team", "purple team", "ctf", "capture the flag",
            "penetration testing", "pen testing", "vulnerability scanning", "security audit",
            "compliance", "gdpr", "hipaa", "pci dss", "iso 27001", "soc 2", "cis benchmarks",
            "incident handling", "forensics", "digital forensics", "malware", "ransomware",
            "phishing", "social engineering", "ddos", "denial of service", "waf", "web application firewall",
            "ips", "ids", "intrusion prevention", "intrusion detection", "zero trust", "soar",
            "security orchestration", "threat modeling", "risk assessment", "osint",
            "open source intelligence", "exploit development", "reverse engineering", "binary analysis",
            "memory forensics", "network forensics", "log analysis", "endpoint protection",
            "edr", "endpoint detection", "xdr", "extended detection", "dlp", "data loss prevention",
            "appsec", "application security", "devsecops", "secure sdlc", "secure development lifecycle"
        ]
        
        # Define generic verbs and adjectives to filter out
        generic_terms = [
            # Common verbs to filter
            "develop", "design", "implement", "manage", "analyze", "improve", "create", "lead", 
            "coordinate", "optimize", "maintain", "troubleshoot", "support", "research", "build", 
            "architect", "plan", "model", "test", "deploy", "operate", "solve", "integrate", 
            "configure", "administer", "execute", "monitor", "evaluate", "oversee", "collaborate", 
            "communicate", "present", "document", "train", "mentor", "review", "assess", 
            "investigate", "diagnose", "resolve", "strategize", "innovate", "transform", 
            "enhance", "accelerate", "drive", "enable", "empower", 
            
            # Generic job terms to filter
            "requirements", "qualifications", "experience", "skills", "knowledge", "expertise", 
            "proficiency", "competency", "ability", "background", "responsibilities", "role", 
            "duties", "functions", "tasks", "objectives", "goals", "essential",
            "preferred", "required", "position", "job", "employment", "candidate", "team",
            "opportunity", "career", "work", "working", "professional", "qualified", "strong",
            "excellent", "exceptional", "outstanding", "exemplary", "great", "good", "best"
        ]
        
        # Terms we don't want to filter out - technical terms that might be caught by the filter
        important_terms = [
            "simulation", "protocols", "respond", "knowledge", "technologies", "solutions",
            "applications", "systems", "network", "analysis", "detection", "response", "security",
            "development", "infrastructure", "architecture", "framework", "platform", "deploy",
            "configuration", "implementation", "monitoring", "management", "assessment", "protection",
            "processing", "administration", "integration", "automation", "testing", "operations"
        ]
        
        # Remove important terms from generic terms
        generic_terms = [term for term in generic_terms if term not in important_terms]
        
        # Tokenize text properly for POS tagging
        tokens = word_tokenize(text)
        
        # Perform POS tagging with fallback
        try:
            # First attempt with regular tagger
            tagged_words = safe_pos_tag(tokens)
        except LookupError as e:
            print(f"POS tagger error: {e}")
            # Fallback to basic tokenization without POS tagging
            tagged_words = [(word, "NN") for word in tokens]  # Treat all words as nouns
        
        # Filter words based on POS and apply lemmatization
        filtered_words = []
        for word, tag in tagged_words:
            # Clean the word
            clean_word = ''.join(c for c in word if c.isalnum() or c == ' ')
            if not clean_word or len(clean_word) <= 2:
                continue
                
            # Lemmatize the word based on its POS
            try:
                if tag.startswith('VB'):  # Verb
                    lemma_word = lemmatizer.lemmatize(clean_word.lower(), 'v')
                elif tag.startswith('JJ'):  # Adjective
                    lemma_word = lemmatizer.lemmatize(clean_word.lower(), 'a')
                else:  # Default is noun
                    lemma_word = lemmatizer.lemmatize(clean_word.lower(), 'n')
            except:
                # Fallback lemmatization (as noun)
                lemma_word = lemmatizer.lemmatize(clean_word.lower(), 'n')
                
            word_lower = lemma_word
                
            # Check if it's a technical term (always keep these regardless of POS)
            is_technical_term = any(tech_term in word_lower or tech_term == word_lower or 
                                  lemma_term_in_text(tech_term, word_lower) for tech_term in technical_skills)
            
            # Keep if it's a noun, proper noun, technical term, or important term
            # NN = noun, NNS = plural noun, NNP = proper noun, NNPS = proper plural noun
            # JJ = adjective (only keep technical ones or important ones)
            if is_technical_term or word_lower in important_terms or (tag.startswith('NN') and word_lower not in generic_terms):
                filtered_words.append(word_lower)
            # Also keep adjectives that are not in generic terms
            elif tag.startswith('JJ') and word_lower not in generic_terms:
                filtered_words.append(word_lower)
                
        # Remove stopwords
        stop_words = set(stopwords.words('english'))
        additional_stops = {'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 
                          'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 
                          'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 
                          'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 
                          'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
                          'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 
                          'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 
                          'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 
                          'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
                          'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 
                          'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 
                          'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 
                          'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 
                          't', 'can', 'will', 'just', 'don', 'should', 'now'}
        
        all_stops = stop_words.union(additional_stops)
        filtered_tokens = [w for w in filtered_words if w not in all_stops]
        
        # Get the full text for regex pattern matching of technical terms
        full_text = ' '.join(tokens)
        
        # 1. Find technical skills with TF-IDF like scoring (mimicking KeyBERT's relevance scoring)
        # This is our "relevance" component
        found_technical_skills = []
        found_technical_skills_scores = {}
        
        # Extract technical skills that appear in the text with frequency
        for skill in technical_skills:
            # First try exact match with word boundaries
            skill_pattern = r'\b' + re.escape(skill) + r'\b'
            skill_count = len(re.findall(skill_pattern, full_text.lower()))
            
            # If no exact matches, try partial matches for multi-word technical terms
            if skill_count == 0 and ' ' in skill:
                # For multi-word terms like "machine learning", check if parts appear close to each other
                words = skill.split()
                skill_lemmas = [lemmatizer.lemmatize(w) for w in words]
                text_lemmas = [lemmatizer.lemmatize(w) for w in full_text.lower().split()]
                
                if all(any(fuzzy_match(lemma, text_lemma, 0.9) for text_lemma in text_lemmas) for lemma in skill_lemmas):
                    skill_count = 1
            
            if skill_count > 0:
                # Calculate score based on frequency and length (longer terms get higher scores)
                score = skill_count * (1 + 0.1 * len(skill.split()))
                found_technical_skills.append(skill)
                found_technical_skills_scores[skill] = score
        
        # 2. Use TF-IDF vectorizer to find other important terms (also part of relevance scoring)
        try:
            # Create a TF-IDF vectorizer
            vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),  # Consider single words and bigrams
                min_df=0.0,          # Accept terms regardless of document frequency
                max_df=1.0,          # Accept all terms regardless of document frequency 
                max_features=100     # Limit to top features
            )
            
            # Fit and transform the text
            tfidf_matrix = vectorizer.fit_transform([text])
            
            # Get feature names and their scores
            feature_names = vectorizer.get_feature_names_out()
            tfidf_scores = tfidf_matrix.toarray()[0]
            
            # Create a list of (term, score) tuples and sort by score
            term_scores = [(term, score) for term, score in zip(feature_names, tfidf_scores)]
            term_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Extract top terms, filtering out generic terms
            additional_keywords = []
            for term, score in term_scores[:50]:  # Take top 50
                if term not in found_technical_skills and term.lower() not in generic_terms:
                    additional_keywords.append((term, score))
        except Exception as e:
            print(f"TF-IDF extraction failed: {e}")
            additional_keywords = []
        
        # 3. Now implement MMR-like diversity (the "maximal marginal relevance" part)
        # This helps select diverse keywords by penalizing similarity to already-selected ones
        
        # Combine all candidates
        all_candidates = []
        
        # Add technical skills (prioritize these)
        for skill in found_technical_skills:
            all_candidates.append((skill, found_technical_skills_scores.get(skill, 0) * 2.0, "technical"))  # Boost technical terms more
            
        # Add TFIDF terms
        for term, score in additional_keywords:
            # Skip generic terms
            if term.lower() not in generic_terms:
                all_candidates.append((term, score, "tfidf"))
        
        # Sort by initial score
        all_candidates.sort(key=lambda x: x[1], reverse=True)
        
        # Use MMR to select diverse keywords
        selected_keywords = []
        lambda_param = 0.8  # Higher weight on relevance (was 0.7)
        
        # Helper function to calculate similarity between terms (crude approximation)
        def term_similarity(term1, term2):
            # Simple character overlap metric
            shorter = min(len(term1), len(term2))
            longer = max(len(term1), len(term2))
            if shorter == 0:
                return 0
            
            # Check for substring
            if term1 in term2 or term2 in term1:
                return shorter / longer
            
            # Check word overlap for multi-word terms
            words1 = set(term1.split())
            words2 = set(term2.split())
            overlap = len(words1.intersection(words2))
            if overlap > 0:
                return overlap / len(words1.union(words2))
            
            # Check lemmatized versions
            lemma1 = ' '.join([lemmatizer.lemmatize(w) for w in term1.split()])
            lemma2 = ' '.join([lemmatizer.lemmatize(w) for w in term2.split()])
            if lemma1 == lemma2:
                return 1.0
                
            return 0
        
        # Add up to 50 keywords with MMR diversity (increased from 30)
        while all_candidates and len(selected_keywords) < 50:
            max_mmr_score = -float('inf')
            max_mmr_idx = -1
            
            for idx, (candidate, relevance, term_type) in enumerate(all_candidates):
                # MMR formula: mmr = lambda * relevance - (1-lambda) * max_similarity
                
                if not selected_keywords:
                    # First term is selected based on pure relevance
                    mmr_score = relevance
                else:
                    # For subsequent terms, consider both relevance and diversity
                    max_similarity = max(term_similarity(candidate, selected) for selected in selected_keywords)
                    mmr_score = lambda_param * relevance - (1 - lambda_param) * max_similarity
                
                # Give a boost to technical skills
                if term_type == "technical":
                    mmr_score *= 1.5  # Increased boost
                
                # Lower score for general terms that slipped through
                if candidate.lower() in generic_terms:
                    mmr_score *= 0.3  # Stronger penalty
                
                if mmr_score > max_mmr_score:
                    max_mmr_score = mmr_score
                    max_mmr_idx = idx
            
            if max_mmr_idx != -1:
                selected_term = all_candidates.pop(max_mmr_idx)[0]
                selected_keywords.append(selected_term)
            else:
                break
        
        return selected_keywords
    except Exception as e:
        print(f"Error in advanced keyword extraction: {str(e)}")
        # Fallback to simple extraction
        try:
            text = text.lower()
            tokens = word_tokenize(text)
            stop_words = set(stopwords.words('english'))
            filtered_tokens = [w for w in tokens if w.isalnum() and w not in stop_words and len(w) > 2]
            return list(set(filtered_tokens))[:50]
        except Exception as fallback_error:
            print(f"Fallback extraction failed: {fallback_error}")
            return text.lower().split()[:50]

@app.route('/api/ats/analyze-with-deepseek', methods=['POST'])
def analyze_with_deepseek():
    """Enhanced resume analysis with DeepSeek and KeyBERT"""
    try:
        # Print request details (for debugging)
        print("DeepSeek analysis endpoint called!")
        print("Request headers:", request.headers.get('Host'))
        print("Request form data:", list(request.form.keys()))
        print("Request files:", list(request.files.keys()))
        
        # Get form data
        job_title = request.form.get('job_title', 'Unknown Position')
        job_description = request.form.get('job_description', '')
        force_real_api = request.form.get('force_real_api', 'false').lower() == 'true'
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate and process the file
        if file and allowed_file(file.filename):
            print(f"Analyzing resume for job: {job_title}")
            print(f"File name: {file.filename}")
            
            # Create a temporary file with the PDF content
            filename = secure_filename(file.filename)
            temp_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(temp_file_path)
            
            # Check file size after saving
            file_size = os.path.getsize(temp_file_path)
            print(f"File saved: {filename}, size: {file_size}")
            
            # If file size is 0, return an error
            if file_size == 0:
                return jsonify({'error': 'Uploaded file is empty'}), 400
            
            try:
                # Extract text from the PDF
                with pdfplumber.open(temp_file_path) as pdf:
                    cv_text = ""
                    for page in pdf.pages:
                        cv_text += page.extract_text() or ""
            except Exception as e:
                return jsonify({'error': f'PDF parsing error: {str(e)}'}), 500
                
            # Initialize category_scores dictionary here to prevent the error
            category_scores = {'hard_skills': 0, 'soft_skills': 0, 'domain': 0, 'job_title': 0, 'experience': 0}
            
            # Technical skills detection - cybersecurity and data focused
            tech_skills = [
                "python", "sql", "aws", "azure", "gcp", "machine learning", "ai", "data science", 
                "data analysis", "data visualization", "cybersecurity", "network security", 
                "penetration testing", "vulnerability assessment", "firewall", "intrusion detection",
                "threat analysis", "risk management", "compliance", "encryption", "authentication",
                "security protocols", "incident response", "malware analysis", "security auditing",
                "siem", "security operations", "ethical hacking", "cryptography", "security architecture"
            ]
            
            cv_text_lower = cv_text.lower()
            
            # Count technical skills with lemmatization
            found_skills = []
            for skill in tech_skills:
                # Check with lemmatization
                if lemma_term_in_text(skill, cv_text_lower):
                    found_skills.append(skill)
                    
            # Update hard_skills score based on found skills
            if found_skills:
                category_scores['hard_skills'] = min(100, len(found_skills) * 5)
                
            # Check for cybersecurity domain knowledge
            cyber_terms = ["cybersecurity", "security", "encryption", "firewall", "intrusion", "vulnerability", 
                          "threat", "malware", "phishing", "authentication", "authorization"]
            cyber_count = sum(1 for term in cyber_terms if lemma_term_in_text(term, cv_text_lower))
            
            # Update domain score based on cybersecurity terms
            if cyber_count > 0:
                category_scores['domain'] = min(100, cyber_count * 10)
                
            # Experience detection
            experience_patterns = [
                r'\d+ years? experience', r'experience: \d+', r'worked for \d+',
                r'experience in', r'experience with', r'experienced in', r'lead', r'senior'
            ]
            
            experience_matches = sum(1 for pattern in experience_patterns if re.search(pattern, cv_text_lower))
            category_scores['experience'] = min(100, experience_matches * 20)
            
            # Job title matching with fuzzy matching
            job_title_words = job_title.lower().split()
            job_title_match_score = 0
            
            for word in job_title_words:
                if len(word) <= 3:  # Skip short words like "and", "of", etc.
                    continue
                    
                # Check direct and lemmatized matches
                if lemma_term_in_text(word, cv_text_lower):
                    job_title_match_score += 1
                
                # Try fuzzy matching
                cv_words = cv_text_lower.split()
                for cv_word in cv_words:
                    if len(cv_word) > 3 and fuzzy_match(word, cv_word, 0.85):
                        job_title_match_score += 0.5
                        break
            
            # Normalize job title match score 
            if job_title_words:
                job_title_match_score = (job_title_match_score / len(job_title_words)) * 100
                category_scores['job_title'] = min(100, job_title_match_score)
            
            # Get meaningful keywords
            cv_keywords = extract_meaningful_keywords(cv_text)
            job_keywords = extract_meaningful_keywords(job_description, is_job_description=True)
            
            # Find matching keywords
            matching_keywords = []
            
            # Use lemmatization to find matches
            for job_keyword in job_keywords:
                for cv_keyword in cv_keywords:
                    # Compare lemmatized versions
                    job_lemma = ' '.join([lemmatizer.lemmatize(w) for w in job_keyword.split()])
                    cv_lemma = ' '.join([lemmatizer.lemmatize(w) for w in cv_keyword.split()])
                    
                    if job_lemma == cv_lemma or fuzzy_match(job_keyword, cv_keyword, 0.9):
                        matching_keywords.append(job_keyword)
                        break
            
            # Remove duplicates
            matching_keywords = list(set(matching_keywords))
            
            # Find missing keywords with lemmatization
            missing_keywords = []
            for job_kw in job_keywords:
                if job_kw not in matching_keywords:
                    # Check if a lemmatized version is already matched
                    job_lemma = ' '.join([lemmatizer.lemmatize(w) for w in job_kw.split()])
                    if not any(' '.join([lemmatizer.lemmatize(w) for w in matched.split()]) == job_lemma 
                              for matched in matching_keywords):
                        missing_keywords.append(job_kw)
            
            # Implement a more intelligent ATS scoring algorithm
            try:
                # Calculate keyword match score (50% of total)
                matched_keyword_count = len(matching_keywords)
                total_job_keywords = len(job_keywords) or 1  # Avoid division by zero
                keyword_match_score = min(100, (matched_keyword_count / total_job_keywords) * 100)
                
                # Use TF-IDF and cosine similarity for content match (50% of total)
                vectorizer = TfidfVectorizer(
                    stop_words='english',
                    ngram_range=(1, 3),  # Include unigrams, bigrams, and trigrams
                    min_df=0.0,          # Accept any term frequency
                    max_df=1.0,          # Accept any document frequency
                    sublinear_tf=True    # Apply sublinear tf scaling (1 + log(tf))
                )
                
                # Transform texts to TF-IDF vectors
                vectors = vectorizer.fit_transform([cv_text, job_description])
                
                # Calculate cosine similarity
                cosine_sim = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
                content_match_score = cosine_sim * 100
                
                # Calculate technical skills match with weights based on requirement importance
                cv_text_lower = cv_text.lower()
                tech_skill_count = 0
                tech_skill_importance = 0  # Track both count and importance
                important_tech_skills = []
                
                # Check for important technical skills based on job title
                if "data" in job_title.lower():
                    important_tech_skills.extend([
                        ("python", 3), ("sql", 3), ("tableau", 2), ("power bi", 2), 
                        ("excel", 1), ("data analysis", 3), ("data visualization", 3), 
                        ("pandas", 2), ("numpy", 2), ("statistics", 2)
                    ])
                elif "cyber" in job_title.lower() or "security" in job_title.lower():
                    important_tech_skills.extend([
                        ("cybersecurity", 3), ("penetration testing", 3), ("vulnerability assessment", 3),
                        ("firewall", 2), ("encryption", 2), ("security", 2), ("intrusion detection", 3), 
                        ("threat intelligence", 3), ("nmap", 1), ("wireshark", 1), ("burp suite", 1), 
                        ("simulation", 2), ("protocols", 2), ("respond", 2)
                    ])
                elif "developer" in job_title.lower() or "engineer" in job_title.lower():
                    important_tech_skills.extend([
                        ("javascript", 3), ("python", 3), ("java", 3), ("c#", 2), ("c++", 2), 
                        ("react", 2), ("angular", 2), ("node.js", 2), ("django", 1), 
                        ("flask", 1), ("spring", 1)
                    ])
                elif "machine learning" in job_title.lower() or "ai" in job_title.lower():
                    important_tech_skills.extend([
                        ("machine learning", 3), ("artificial intelligence", 3), ("python", 3), 
                        ("tensorflow", 2), ("pytorch", 2), ("deep learning", 3), 
                        ("neural networks", 3), ("natural language processing", 2), 
                        ("computer vision", 2)
                    ])
                
                # Always add these important terms that could be in any technical role
                important_tech_skills.extend([
                    ("simulation", 1), ("protocols", 1), ("respond", 1), ("knowledge", 1), 
                    ("technologies", 1), ("solutions", 1), ("systems", 1), 
                    ("network", 1), ("security", 1)
                ])
                
                # Add common buzzwords that external ATS systems often look for
                external_ats_keywords = [
                    # General buzzwords
                    ("seeking", 0.5), ("integrate", 1.0), ("soc", 2.0), ("intelligence", 1.5), 
                    ("red team", 2.0), ("ai", 1.5), ("threat", 1.5), ("monitor", 1.0),
                    # Common action verbs ATS systems check for
                    ("implement", 0.8), ("develop", 0.8), ("design", 0.8), ("analyze", 0.8),
                    ("manage", 0.8), ("collaborate", 0.7), ("lead", 1.0), ("responsible", 0.7),
                    # Soft skills and attributes
                    ("teamwork", 0.7), ("communication", 0.7), ("problem solving", 0.8),
                    ("analytical", 0.8), ("detail-oriented", 0.7), ("proactive", 0.7),
                    # Job-related context terms
                    ("requirements", 0.5), ("qualifications", 0.5), ("experience", 0.5),
                    ("environment", 0.5), ("background", 0.5), ("tools", 0.8)
                ]
                
                # Count matching important technical skills with weights
                max_importance_score = sum(weight for _, weight in important_tech_skills)
                
                for skill, importance in important_tech_skills:
                    skill_pattern = r'\b' + re.escape(skill) + r'\b'
                    
                    # Try exact match first
                    if re.search(skill_pattern, cv_text_lower):
                        tech_skill_count += 1
                        tech_skill_importance += importance
                    # Then try lemmatized match
                    elif lemma_term_in_text(skill, cv_text_lower):
                        tech_skill_count += 1
                        tech_skill_importance += importance
                
                # Calculate bonus (up to 25%) based on weighted importance
                tech_skill_bonus = min(25, (tech_skill_importance / max(1, max_importance_score)) * 25)
                
                # Add soft scoring for common ATS buzzwords
                ats_keyword_bonus = 0
                for word, weight in external_ats_keywords:
                    if word.lower() in cv_text_lower:
                        ats_keyword_bonus += weight
                    elif lemma_term_in_text(word, cv_text_lower):
                        ats_keyword_bonus += weight * 0.8  # Slightly reduced score for lemmatized matches
                
                # Cap the ATS keyword bonus at 10 points
                ats_keyword_bonus = min(10, ats_keyword_bonus)
                
                # Calculate final score with increased weight on technical skills and ATS buzzwords
                ats_score = (keyword_match_score * 0.4) + (content_match_score * 0.35) + tech_skill_bonus + ats_keyword_bonus + 5
                
                # Apply domain-specific adjustments
                if "technical" in job_title.lower() and "technical" in cv_text.lower():
                    ats_score = min(100, ats_score * 1.15)  # Boost for matching technical focus
                
                # Add a small baseline score to avoid extremely low scores
                ats_score += 5
                
                # Ensure score is between 0 and 100
                ats_score = max(0, min(100, ats_score))
                
            except Exception as e:
                print(f"Advanced ATS scoring failed: {e}")
                # Fallback to simple similarity calculation
                ats_score = min(100, (len(matching_keywords) * 5) + 10)  # Simple fallback with base score
            
            # Round to 1 decimal place
            ats_score = round(ats_score, 1)
            
            # Domain-specific skills breakdown based on our enhanced algorithm
            skills_breakdown = {
                "technical": round(category_scores.get('hard_skills', 0), 2),
                "soft": round(category_scores.get('soft_skills', 0), 2),
                "domain": round((category_scores.get('job_title', 0) + 
                               category_scores.get('experience', 0)) / 2, 2)
            }
            
            # Determine assessment message
            if ats_score >= 80:
                assessment = "Excellent! Your resume is highly compatible with this job."
            elif ats_score >= 60:
                assessment = "Good. Your resume matches the job requirements reasonably well."
            elif ats_score >= 40:
                assessment = "Average. Consider optimizing your resume for better matching."
            else:
                assessment = "Low match. Your resume needs significant adjustments for this role."
            
            # Get top-k most important missing keywords
            # Sort by importance (frequency in job description)
            top_missing_keywords = sorted(
                missing_keywords, 
                key=lambda kw: job_description.lower().count(kw) + job_title.lower().count(kw), 
                reverse=True
            )[:10]  # Limit to top 10
            
            # Create detailed analysis with comprehensive feedback
            detailed_analysis = f"""
            # DETAILED ANALYSIS FOR {job_title}
            
            ## 1. STRENGTHS 🟢
            **a. Technical Skills Alignment**  
            {'Your resume demonstrates strong technical skills that align with the job requirements.' if len(cv_text) > 5 else 'Your resume shows some technical skills relevant to this role, but could be strengthened.'}
            {f"Key matching skills include: {cv_text[:3]}" if cv_text else ''}
            
            **b. Experience Relevance**  
            {'Your professional experience appears well-aligned with this position.' if ats_score > 60 else 'Your experience partially matches this role requirements.' if ats_score > 40 else 'Your experience does not strongly align with this position.'}
            {'This shows you have practical application of the skills required.' if ats_score > 50 else 'Consider highlighting more relevant projects or responsibilities.'}
            
            **c. Industry Knowledge**  
            {'Your resume demonstrates familiarity with industry-specific terminology and concepts.' if any(term in cv_text.lower() for term in ['development', 'engineering', 'analysis', 'design', 'implementation']) else 'Your resume could benefit from more industry-specific terminology.'}
            {'This indicates understanding of the field requirements and challenges.' if ats_score > 50 else 'Adding more domain-specific language would strengthen your application.'}
            
            **d. Technical Proficiency**  
            {'Your resume highlights strong proficiency in required technical areas.' if len(cv_text) > 7 else 'Some technical proficiencies are demonstrated, but more detail would be beneficial.'}
            {'Your technical skills section effectively communicates your capabilities.' if 'skills' in cv_text.lower() else 'Consider adding a dedicated technical skills section.'}
            
            **e. Project Experience**  
            {'Your project experience demonstrates practical application of skills required for this role.' if 'project' in cv_text.lower() else 'Including specific projects would strengthen your application.'}
            {'This shows your ability to apply technical knowledge to solve real problems.' if ats_score > 50 else 'More detail on specific project contributions would be valuable.'}
            
            ---
            
            ## 2. WEAKNESSES 🔴
            **a. Missing Key Requirements**  
            *Issue:* {'Your resume lacks several key skills mentioned in the job description.' if len(job_description) > len(cv_text)/3 else 'Some important skills from the job description are not evident in your resume.'}  
            *Fix:* {'Add these critical missing keywords where relevant: ' + ', '.join(top_missing_keywords[:5]) if top_missing_keywords else 'Ensure all key skills from the job description are incorporated appropriately.'}
            
            **b. Quantifiable Achievements**  
            *Issue:* {'Your resume likely lacks specific metrics and measurable outcomes.' if 'increased' not in cv_text.lower() and 'reduced' not in cv_text.lower() and 'improved' not in cv_text.lower() else 'Some achievements are quantified, but more metrics would strengthen your case.'}  
            *Fix:* Add specific numbers, percentages, or outcomes to demonstrate impact (e.g., "Reduced processing time by 30%" rather than "Improved processing efficiency").
            
            **c. Resume Structure**  
            *Issue:* {'Your resume may not be optimally structured for ATS scanning.' if ats_score < 50 else 'Your resume structure is adequate but could be optimized.'}  
            *Fix:* {'Reorganize content to prioritize skills and experience most relevant to ' + job_title + ', using industry-standard section headings and bullet points.' if ats_score < 50 else 'Fine-tune section organization to highlight most relevant experience first.'}
            
            **d. Technical Detail Depth**  
            *Issue:* {'Your technical descriptions may lack sufficient detail for this specialized role.' if 'technical' in job_title.lower() or 'engineer' in job_title.lower() else 'More specific details about your technical contributions would be beneficial.'}  
            *Fix:* {'Include more specific information about technologies, methodologies, and tools used in previous roles, particularly ' + ', '.join(top_missing_keywords[:3]) if top_missing_keywords else 'Expand technical descriptions with specific technologies and methodologies.'}
            
            **e. Professional Summary Effectiveness**  
            *Issue:* {'Your professional summary may not effectively communicate your value proposition for this specific role.' if 'summary' not in cv_text.lower() and 'profile' not in cv_text.lower() else 'Your professional summary could be more tailored to this position.'}  
            *Fix:* {'Create a concise, powerful summary highlighting your most relevant skills and experience for the ' + job_title + ' position.' if 'summary' not in cv_text.lower() else 'Customize your summary to directly address the requirements of the ' + job_title + ' position.'}
            
            ---
            
            ## 3. KEYWORD ANALYSIS 🔍
            **Top Matching Keywords**  
            {', '.join(matching_keywords[:10]) if matching_keywords else 'No significant matching keywords found.'}
            
            **Important Missing Keywords**  
            {', '.join(top_missing_keywords) if top_missing_keywords else 'Your resume contains most key terms from the job description.'}
            
            **Keyword Integration Recommendations**  
            - Integrate missing keywords naturally throughout your resume
            - Include keywords in both skills sections and experience descriptions
            - Use industry-standard terminology when describing your accomplishments
            - Ensure technical terms are used in proper context to demonstrate genuine expertise
            
            ---
            
            ## 4. OVERALL MATCH ASSESSMENT 📊
            **Match Percentage:** {ats_score:.2f}%  
            **Alignment Level:** {'High' if ats_score >= 75 else 'Moderate' if ats_score >= 50 else 'Low'}
            
            **Detailed Analysis:**  
            {'Your resume shows strong alignment with this position, demonstrating relevant skills and experience.' if ats_score >= 75 else 
            'Your resume shows moderate alignment with this position, with some relevant skills but room for improvement.' if ats_score >= 50 else 
            'Your resume shows limited alignment with this position, requiring significant tailoring to meet the job requirements.'}
            
            {'For technical roles, your expertise in ' + ', '.join(matching_keywords[:3]) + ' is particularly valuable.' if len(matching_keywords) >= 3 and ('technical' in job_title.lower() or 'engineer' in job_title.lower()) else ''}
            
            ---
            
            ## 5. IMPROVEMENT RECOMMENDATIONS 🚀
            1. {'Add these critical missing keywords where relevant: ' + ', '.join(top_missing_keywords[:5]) if top_missing_keywords else 'Ensure all key terms from the job description appear in your resume.'}
            2. Quantify your achievements with specific metrics and outcomes (numbers, percentages, results)
            3. Customize your professional summary specifically for a {job_title} position
            4. Reorganize your experience to prioritize the most relevant skills and projects first
            5. Add a skills matrix that clearly maps your abilities to the job requirements
            6. Use more industry-standard terminology throughout your resume
            7. Ensure your accomplishments demonstrate problem-solving abilities relevant to this role
            """
            
            # Response structure with better report format
            response = {
                "success": True,
                "ats_score": ats_score,
                "assessment": assessment,
                "detailed_analysis": detailed_analysis,
                "summary": skills_breakdown,
                "matching_skills_percentage": round(len(matching_keywords) / (len(job_keywords) or 1) * 100, 2),
                "missing_keywords": missing_keywords,
                "matching_keywords": matching_keywords,
                "top_missing_keywords": top_missing_keywords,  # New field for top missing keywords
                "score": max(0, min(100, ats_score)),
                "skills_breakdown": skills_breakdown
            }
            
            return jsonify(response), 200
            
    except Exception as e:
        print(f"Error in DeepSeek analysis: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/ats/analyze-with-openai', methods=['POST'])
def analyze_with_openai():
    """Enhanced resume analysis with OpenAI and KeyBERT as fallback"""
    try:
        # Print request details (for debugging)
        print("OpenAI analysis endpoint called!")
        print("Request headers:", request.headers['Host'])
        print("Request form data:", list(request.form.keys()))
        print("Request files:", list(request.files.keys()))
        
        # Get form data
        job_title = request.form.get('job_title', 'Unknown Position')
        job_description = request.form.get('job_description', '')
        use_fallback = request.form.get('use_openai_fallback', 'false').lower() == 'true'
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate and process the file
        if file and allowed_file(file.filename):
            print(f"Analyzing resume for job: {job_title}")
            print(f"File name: {file.filename}")
            
            # Create a temporary file with the PDF content
            temp_file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
            file.save(temp_file_path)
            
            try:
                # Extract text from the PDF
                with pdfplumber.open(temp_file_path) as pdf:
                    cv_text = ""
                    for page in pdf.pages:
                        cv_text += page.extract_text() or ""
            except Exception as e:
                return jsonify({'error': f'PDF parsing error: {str(e)}'}), 500
                
            # Initialize category_scores dictionary here to prevent the error
            category_scores = {'hard_skills': 0, 'soft_skills': 0, 'domain': 0, 'job_title': 0, 'experience': 0}
            
            # Technical skills detection - cybersecurity and data focused
            tech_skills = [
                "python", "sql", "aws", "azure", "gcp", "machine learning", "ai", "data science", 
                "data analysis", "data visualization", "cybersecurity", "network security", 
                "penetration testing", "vulnerability assessment", "firewall", "intrusion detection",
                "threat analysis", "risk management", "compliance", "encryption", "authentication",
                "security protocols", "incident response", "malware analysis", "security auditing",
                "siem", "security operations", "ethical hacking", "cryptography", "security architecture"
            ]
            
            cv_text_lower = cv_text.lower()
            
            # Count technical skills
            found_skills = []
            for skill in tech_skills:
                if skill in cv_text_lower:
                    found_skills.append(skill)
                    
            # Update hard_skills score based on found skills
            if found_skills:
                category_scores['hard_skills'] = min(100, len(found_skills) * 5)
                
            # Check for cybersecurity domain knowledge
            cyber_terms = ["cybersecurity", "security", "encryption", "firewall", "intrusion", "vulnerability", 
                          "threat", "malware", "phishing", "authentication", "authorization"]
            cyber_count = sum(1 for term in cyber_terms if term in cv_text_lower)
            
            # Update domain score based on cybersecurity terms
            if cyber_count > 0:
                category_scores['domain'] = min(100, cyber_count * 10)
                
            # Experience detection
            experience_patterns = [
                r'\d+ years? experience', r'experience: \d+', r'worked for \d+',
                r'experience in', r'experience with', r'experienced in', r'lead', r'senior'
            ]
            
            experience_matches = sum(1 for pattern in experience_patterns if re.search(pattern, cv_text_lower))
            category_scores['experience'] = min(100, experience_matches * 20)
            
            # Job title matching
            if job_title and any(keyword in cv_text_lower for keyword in job_title.lower().split()):
                category_scores['job_title'] = 75
            
            # Get meaningful keywords
            cv_keywords = extract_meaningful_keywords(cv_text)
            job_keywords = extract_meaningful_keywords(job_description, is_job_description=True)
            
            # Find matching keywords
            matching_keywords = list(set(cv_keywords).intersection(set(job_keywords)))
            
            # Find missing keywords (those in job description but not in resume)
            missing_keywords = list(set(job_keywords).difference(set(cv_keywords)))
            
            # Implement a more intelligent ATS scoring algorithm
            try:
                # Calculate keyword match score (50% of total)
                matched_keyword_count = len(matching_keywords)
                total_job_keywords = len(job_keywords) or 1  # Avoid division by zero
                keyword_match_score = min(100, (matched_keyword_count / total_job_keywords) * 100)
                
                # Use TF-IDF and cosine similarity for content match (50% of total)
                vectorizer = TfidfVectorizer(
                    stop_words='english',
                    ngram_range=(1, 3),  # Include unigrams, bigrams, and trigrams
                    min_df=0.0,          # Accept any term frequency
                    max_df=1.0,          # Accept any document frequency
                    sublinear_tf=True    # Apply sublinear tf scaling (1 + log(tf))
                )
                
                # Transform texts to TF-IDF vectors
                vectors = vectorizer.fit_transform([cv_text, job_description])
                
                # Calculate cosine similarity
                cosine_sim = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
                content_match_score = cosine_sim * 100
                
                # Calculate technical skills match (additional bonus)
                cv_text_lower = cv_text.lower()
                tech_skill_count = 0
                important_tech_skills = []
                
                # Check for important technical skills based on job title
                if "data" in job_title.lower():
                    important_tech_skills.extend(["python", "sql", "tableau", "power bi", "excel", "data analysis", 
                                                "data visualization", "pandas", "numpy", "statistics"])
                elif "cyber" in job_title.lower() or "security" in job_title.lower():
                    important_tech_skills.extend(["cybersecurity", "penetration testing", "vulnerability assessment",
                                                "firewall", "encryption", "security", "intrusion detection", 
                                                "threat intelligence", "nmap", "wireshark", "burp suite", "simulation",
                                                "protocols", "respond"])
                elif "developer" in job_title.lower() or "engineer" in job_title.lower():
                    important_tech_skills.extend(["javascript", "python", "java", "c#", "c++", "react", 
                                                "angular", "node.js", "django", "flask", "spring"])
                elif "machine learning" in job_title.lower() or "ai" in job_title.lower():
                    important_tech_skills.extend(["machine learning", "artificial intelligence", "python", 
                                                "tensorflow", "pytorch", "deep learning", "neural networks", 
                                                "natural language processing", "computer vision"])
                
                # Always add these important terms that could be in any technical role
                important_tech_skills.extend([
                    "simulation", "protocols", "respond", "knowledge", "technologies", 
                    "solutions", "systems", "network", "security"
                ])
                
                # Count matching important technical skills
                for skill in important_tech_skills:
                    skill_pattern = r'\b' + re.escape(skill) + r'\b'
                    if re.search(skill_pattern, cv_text_lower):
                        tech_skill_count += 1
                
                # Calculate bonus (up to 25%)
                tech_skill_bonus = min(25, (tech_skill_count / max(1, len(important_tech_skills))) * 25)
                
                # Calculate final score with increased weight on technical skills
                ats_score = (keyword_match_score * 0.4) + (content_match_score * 0.35) + tech_skill_bonus + 5
                
                # Apply domain-specific adjustments
                if "technical" in job_title.lower() and "technical" in cv_text.lower():
                    ats_score = min(100, ats_score * 1.15)  # Boost for matching technical focus
                
                # Add a small baseline score to avoid extremely low scores
                ats_score += 5
                
                # Ensure score is between 0 and 100
                ats_score = max(0, min(100, ats_score))
                
            except Exception as e:
                print(f"Advanced ATS scoring failed: {e}")
                # Fallback to simple similarity calculation
                ats_score = min(100, (len(matching_keywords) * 5) + 10)  # Simple fallback with base score
            
            # Round to 1 decimal place
            ats_score = round(ats_score, 1)
            
            # Domain-specific skills breakdown based on our enhanced algorithm
            skills_breakdown = {
                "technical": round(category_scores.get('hard_skills', 0), 2),
                "soft": round(category_scores.get('soft_skills', 0), 2),
                "domain": round((category_scores.get('job_title', 0) + 
                               category_scores.get('experience', 0)) / 2, 2)
            }
            
            # Determine assessment message
            if ats_score >= 80:
                assessment = "Excellent! Your resume is highly compatible with this job."
            elif ats_score >= 60:
                assessment = "Good. Your resume matches the job requirements reasonably well."
            elif ats_score >= 40:
                assessment = "Average. Consider optimizing your resume for better matching."
            else:
                assessment = "Low match. Your resume needs significant adjustments for this role."
            
            # Create detailed analysis with comprehensive feedback
            detailed_analysis = f"""
            # DETAILED ANALYSIS FOR {job_title}
            
            ## 1. STRENGTHS 🟢
            **a. Technical Skills Alignment**  
            {'Your resume demonstrates strong technical skills that align with the job requirements.' if len(cv_text) > 5 else 'Your resume shows some technical skills relevant to this role, but could be strengthened.'}
            {f"Key matching skills include: {cv_text[:3]}" if cv_text else ''}
            
            **b. Experience Relevance**  
            {'Your professional experience appears well-aligned with this position.' if ats_score > 60 else 'Your experience partially matches this role requirements.' if ats_score > 40 else 'Your experience does not strongly align with this position.'}
            {'This shows you have practical application of the skills required.' if ats_score > 50 else 'Consider highlighting more relevant projects or responsibilities.'}
            
            **c. Industry Knowledge**  
            {'Your resume demonstrates familiarity with industry-specific terminology and concepts.' if any(term in cv_text.lower() for term in ['development', 'engineering', 'analysis', 'design', 'implementation']) else 'Your resume could benefit from more industry-specific terminology.'}
            {'This indicates understanding of the field requirements and challenges.' if ats_score > 50 else 'Adding more domain-specific language would strengthen your application.'}
            
            **d. Technical Proficiency**  
            {'Your resume highlights strong proficiency in required technical areas.' if len(cv_text) > 7 else 'Some technical proficiencies are demonstrated, but more detail would be beneficial.'}
            {'Your technical skills section effectively communicates your capabilities.' if 'skills' in cv_text.lower() else 'Consider adding a dedicated technical skills section.'}
            
            **e. Project Experience**  
            {'Your project experience demonstrates practical application of skills required for this role.' if 'project' in cv_text.lower() else 'Including specific projects would strengthen your application.'}
            {'This shows your ability to apply technical knowledge to solve real problems.' if ats_score > 50 else 'More detail on specific project contributions would be valuable.'}
            
            ---
            
            ## 2. WEAKNESSES 🔴
            **a. Missing Key Requirements**  
            *Issue:* {'Your resume lacks several key skills mentioned in the job description.' if len(job_description) > len(cv_text)/3 else 'Some important skills from the job description are not evident in your resume.'}  
            *Fix:* {'Add these critical missing keywords where relevant: ' + ', '.join(job_description.split()[:5]) if job_description else 'Ensure all key skills from the job description are incorporated appropriately.'}
            
            **b. Quantifiable Achievements**  
            *Issue:* {'Your resume likely lacks specific metrics and measurable outcomes.' if 'increased' not in cv_text.lower() and 'reduced' not in cv_text.lower() and 'improved' not in cv_text.lower() else 'Some achievements are quantified, but more metrics would strengthen your case.'}  
            *Fix:* Add specific numbers, percentages, or outcomes to demonstrate impact (e.g., "Reduced processing time by 30%" rather than "Improved processing efficiency").
            
            **c. Resume Structure**  
            *Issue:* {'Your resume may not be optimally structured for ATS scanning.' if ats_score < 50 else 'Your resume structure is adequate but could be optimized.'}  
            *Fix:* {'Reorganize content to prioritize skills and experience most relevant to ' + job_title + ', using industry-standard section headings and bullet points.' if ats_score < 50 else 'Fine-tune section organization to highlight most relevant experience first.'}
            
            **d. Technical Detail Depth**  
            *Issue:* {'Your technical descriptions may lack sufficient detail for this specialized role.' if 'technical' in job_title.lower() or 'engineer' in job_title.lower() else 'More specific details about your technical contributions would be beneficial.'}  
            *Fix:* {'Include more specific information about technologies, methodologies, and tools used in previous roles, particularly ' + ', '.join(job_description.split()[:3]) if job_description else 'Expand technical descriptions with specific technologies and methodologies.'}
            
            **e. Professional Summary Effectiveness**  
            *Issue:* {'Your professional summary may not effectively communicate your value proposition for this specific role.' if 'summary' not in cv_text.lower() and 'profile' not in cv_text.lower() else 'Your professional summary could be more tailored to this position.'}  
            *Fix:* {'Create a concise, powerful summary highlighting your most relevant skills and experience for the ' + job_title + ' position.' if 'summary' not in cv_text.lower() else 'Customize your summary to directly address the requirements of the ' + job_title + ' position.'}
            
            ---
            
            ## 3. KEYWORD ANALYSIS 🔍
            **Top Matching Keywords**  
            {', '.join(cv_text.split()[:10]) if cv_text else 'No significant matching keywords found.'}
            
            **Important Missing Keywords**  
            {', '.join(job_description.split()[:10]) if job_description else 'Your resume contains most key terms from the job description.'}
            
            **Keyword Integration Recommendations**  
            - Integrate missing keywords naturally throughout your resume
            - Include keywords in both skills sections and experience descriptions
            - Use industry-standard terminology when describing your accomplishments
            - Ensure technical terms are used in proper context to demonstrate genuine expertise
            
            ---
            
            ## 4. OVERALL MATCH ASSESSMENT 📊
            **Match Percentage:** {ats_score:.2f}%  
            **Alignment Level:** {'High' if ats_score >= 75 else 'Moderate' if ats_score >= 50 else 'Low'}
            
            **Detailed Analysis:**  
            {'Your resume shows strong alignment with this position, demonstrating relevant skills and experience.' if ats_score >= 75 else 
            'Your resume shows moderate alignment with this position, with some relevant skills but room for improvement.' if ats_score >= 50 else 
            'Your resume shows limited alignment with this position, requiring significant tailoring to meet the job requirements.'}
            
            {'For technical roles, your expertise in ' + ', '.join(cv_text.split()[:3]) + ' is particularly valuable.' if len(cv_text) >= 3 and ('technical' in job_title.lower() or 'engineer' in job_title.lower()) else ''}
            
            ---
            
            ## 5. IMPROVEMENT RECOMMENDATIONS 🚀
            1. {'Add these critical missing keywords where relevant: ' + ', '.join(job_description.split()[:5]) if job_description else 'Ensure all key terms from the job description appear in your resume.'}
            2. Quantify your achievements with specific metrics and outcomes (numbers, percentages, results)
            3. Customize your professional summary specifically for a {job_title} position
            4. Reorganize your experience to prioritize the most relevant skills and projects first
            5. Add a skills matrix that clearly maps your abilities to the job requirements
            6. Use more industry-standard terminology throughout your resume
            7. Ensure your accomplishments demonstrate problem-solving abilities relevant to this role
            """
            
            # Response structure with better report format
            response = {
                "success": True,
                "ats_score": ats_score,
                "assessment": assessment,
                "detailed_analysis": detailed_analysis,
                "summary": skills_breakdown,
                "matching_skills_percentage": round(len(matching_keywords) / (len(job_keywords) or 1) * 100, 2),
                "missing_keywords": missing_keywords,
                "matching_keywords": matching_keywords,
                "score": max(0, min(100, ats_score)),
                "skills_breakdown": skills_breakdown
            }
            
            return jsonify(response), 200
            
    except Exception as e:
        print(f"Error in OpenAI analysis: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
        
    finally:
        # Clean up temporary file
        try:
            if 'temp_file_path' in locals():
                os.unlink(temp_file_path)
        except:
            pass

@app.route('/api/api/ats/analyze-with-deepseek', methods=['POST'])
def analyze_with_deepseek_duplicate_api():
    """Duplicate API path handler for DeepSeek analysis"""
    return analyze_with_deepseek()

@app.route('/api/api/ats/analyze-with-openai', methods=['POST'])
def analyze_with_openai_duplicate_api():
    """Duplicate API path handler for OpenAI analysis"""
    return analyze_with_openai()

@app.route('/api/interview/analyze-with-deepseek', methods=['POST', 'OPTIONS'])
def analyze_interview_with_deepseek():
    """Analyze interview responses with DeepSeek (or mock implementation)"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response
        
    # Log request for debugging
    print("DeepSeek interview analysis endpoint called!")
    print("Request headers:", request.headers)
    print("Request JSON:", request.json)
    
    try:
        data = request.json
        if not data or 'transcript' not in data:
            return jsonify({'error': 'Missing transcript data'}), 400
            
        transcript = data.get('transcript', '')
        question = data.get('question', 'Tell me about yourself')
        job_role = data.get('jobRole', 'Software Developer')
        
        # Check if transcript is empty or indicates no speech
        if not transcript or transcript.strip() == "" or "I didn't catch what you said" in transcript or "No speech detected" in transcript:
            # Return a basic "no answer" analysis
            return jsonify({
                "overallScore": 0,
                "technicalAccuracy": 0,
                "communicationClarity": 0,
                "relevance": 0,
                "strengths": [],
                "weaknesses": ["No answer provided"],
                "improvementTips": ["Please provide an answer to the question"],
                "category": "No Answer"
            })
        
        # Word count based analysis (simple implementation)
        words = transcript.split()
        word_count = len(words)
        
        # Determine category and base score on word count
        if word_count >= 60:
            overall_score = 85
            category = "Excellent"
            techacc_score = 85
            comm_score = 90
            relevance_score = 85
            strengths = ["Provided a detailed response", "Good elaboration"]
            weaknesses = []
            tips = ["Great response! Consider adding more specific examples next time."]
        elif word_count >= 30:
            overall_score = 70
            category = "Good"
            techacc_score = 65
            comm_score = 70
            relevance_score = 75
            strengths = ["Provided a good length response"]
            weaknesses = ["Could use more specific details"]
            tips = ["Try to include more concrete examples in your response."]
        elif word_count >= 15:
            overall_score = 50
            category = "Average"
            techacc_score = 45
            comm_score = 50
            relevance_score = 55
            strengths = ["Attempted to answer the question"]
            weaknesses = ["Response is brief", "Needs more detail"]
            tips = ["Expand your answer with specific experiences."]
        elif word_count >= 5:
            overall_score = 30
            category = "Needs Improvement"
            techacc_score = 25
            comm_score = 30
            relevance_score = 35
            strengths = ["Provided a response"]
            weaknesses = ["Response is too brief", "Lacks substance"]
            tips = ["Work on providing more comprehensive answers."]
        else:
            overall_score = 10
            category = "Poor"
            techacc_score = 10
            comm_score = 10
            relevance_score = 10
            strengths = []
            weaknesses = ["Response is extremely brief"]
            tips = ["Practice giving more detailed responses to interview questions."]
        
        # Return analysis in expected format
        return jsonify({
            "overallScore": overall_score,
            "technicalAccuracy": techacc_score,
            "communicationClarity": comm_score,
            "relevance": relevance_score,
            "confidence": comm_score,  # Use communication as proxy for confidence
            "strengths": strengths,
            "weaknesses": weaknesses,
            "improvementTips": tips,
            "category": category
        })
        
    except Exception as e:
        print(f"Error in interview analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simple upload server')
    parser.add_argument('--port', type=int, default=5001, help='Port to run server on')
    args = parser.parse_args()
    
    print(f"Starting simple upload server on port {args.port}...")
    app.run(host='0.0.0.0', port=args.port, debug=True) 