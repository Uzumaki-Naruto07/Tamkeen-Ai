# ========================================
# Robust NLP Resource Management and Analysis
# ========================================

import os
import sys
import requests
import subprocess
import time
import logging
import numpy as np
from pathlib import Path
from collections import Counter
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s'
)
logger = logging.getLogger("NLPResourceManager")

class NLPResourceManager:
    """Manages downloading and loading of NLP resources with robust error handling"""

    def __init__(self, cache_dir=None):
        # Setup cache directory
        self.cache_dir = cache_dir or Path.home() / ".nlp_resources"
        os.makedirs(self.cache_dir, exist_ok=True)

        # Setup robust session
        self.session = self._create_robust_session()

        logger.info(f"NLP Resource Manager initialized with cache: {self.cache_dir}")

    def _create_robust_session(self, retries=5, backoff_factor=0.5, timeout=60):
        """Create a requests session with retry mechanism"""
        retry_strategy = Retry(
            total=retries,
            backoff_factor=backoff_factor,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session = requests.Session()
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        session.timeout = timeout
        return session

    def download_file(self, url, local_path, chunk_size=8192):
        """Download a file with progress monitoring and robust error handling"""
        local_path = Path(local_path)

        # Check if file already exists in cache
        if local_path.exists():
            logger.info(f"File already exists: {local_path}")
            return local_path

        logger.info(f"Downloading {url} to {local_path}")

        # Create directory if it doesn't exist
        os.makedirs(local_path.parent, exist_ok=True)

        # Try different download methods
        download_methods = [
            self._download_with_requests,
            self._download_with_wget,
            self._download_with_curl
        ]

        for i, method in enumerate(download_methods):
            try:
                return method(url, local_path, chunk_size)
            except Exception as e:
                logger.warning(f"Download method {i+1} failed: {e}")
                if i == len(download_methods) - 1:
                    raise Exception(f"All download methods failed for {url}")
                logger.info("Trying next download method...")

        raise Exception("Unexpected download failure")

    def _download_with_requests(self, url, local_path, chunk_size):
        """Download using requests library"""
        start_time = time.time()
        temp_path = f"{local_path}.tmp"

        try:
            response = self.session.get(url, stream=True)
            response.raise_for_status()

            # Get file size if available
            total_size = int(response.headers.get('content-length', 0))

            # Download with progress tracking
            downloaded = 0
            with open(temp_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=chunk_size):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)

                        # Log progress
                        if total_size > 0 and downloaded % (5 * chunk_size) == 0:
                            percent = (downloaded / total_size) * 100
                            logger.info(f"Download progress: {percent:.1f}% ({downloaded/1024/1024:.1f}MB)")

            # Rename temp file to final name
            os.rename(temp_path, local_path)

            elapsed = time.time() - start_time
            logger.info(f"Download completed in {elapsed:.1f} seconds")
            return local_path

        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    def _download_with_wget(self, url, local_path, chunk_size):
        """Download using wget command"""
        temp_path = f"{local_path}.tmp"

        try:
            # Check if wget is available
            subprocess.run(['which', 'wget'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            logger.info("Using wget for download")
            subprocess.run([
                'wget', url,
                '-O', temp_path,
                '--tries=5',
                '--timeout=60',
                '--show-progress'
            ], check=True)

            os.rename(temp_path, local_path)
            return local_path

        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    def _download_with_curl(self, url, local_path, chunk_size):
        """Download using curl command"""
        temp_path = f"{local_path}.tmp"

        try:
            # Check if curl is available
            subprocess.run(['which', 'curl'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            logger.info("Using curl for download")
            subprocess.run([
                'curl', '-L', url,
                '-o', temp_path,
                '--retry', '5',
                '--retry-delay', '5',
                '--connect-timeout', '60',
                '--progress-bar'
            ], check=True)

            os.rename(temp_path, local_path)
            return local_path

        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    def install_spacy_model(self, model_name='en_core_web_sm', version='3.8.0'):
        """Install spaCy model with robust error handling and multiple strategies"""
        try:
            # First try to directly load the model (if already installed)
            import spacy
            try:
                nlp = spacy.load(model_name)
                logger.info(f"SpaCy model {model_name} already installed")
                return True
            except OSError:
                logger.info(f"SpaCy model {model_name} not installed, downloading...")

            # Strategy 1: Download via robust file download
            model_file = f"{model_name}-{version}-py3-none-any.whl"
            cache_path = Path(self.cache_dir) / "spacy_models" / model_file

            try:
                download_url = f"https://github.com/explosion/spacy-models/releases/download/{model_name}-{version}/{model_file}"
                self.download_file(download_url, cache_path)

                # Install from downloaded file
                subprocess.run([
                    sys.executable, '-m', 'pip', 'install',
                    str(cache_path), '--no-deps'
                ], check=True)

                logger.info(f"Successfully installed {model_name} from downloaded file")
                return True

            except Exception as e:
                logger.warning(f"Failed to install via direct download: {e}")

            # Strategy 2: Use spacy download command
            try:
                logger.info(f"Trying spacy download command...")
                subprocess.run([
                    sys.executable, '-m', 'spacy', 'download', model_name,
                    '--timeout', '300'
                ], check=True)

                logger.info(f"Successfully installed {model_name} via spacy download")
                return True

            except Exception as e:
                logger.warning(f"Failed to install via spacy download: {e}")

            # Strategy 3: Use pip install directly
            try:
                logger.info(f"Trying pip install...")
                model_package = f"{model_name}=={version}"
                subprocess.run([
                    sys.executable, '-m', 'pip', 'install',
                    model_package
                ], check=True)

                logger.info(f"Successfully installed {model_name} via pip")
                return True

            except Exception as e:
                logger.warning(f"Failed to install via pip: {e}")

            logger.error(f"All installation methods failed for {model_name}")
            return False

        except Exception as e:
            logger.error(f"SpaCy model installation error: {e}")
            return False

    def install_nltk_resources(self, resources=['punkt', 'stopwords', 'wordnet']):
        """Download NLTK resources with error handling"""
        try:
            import nltk

            success = True
            for resource in resources:
                try:
                    logger.info(f"Downloading NLTK resource: {resource}")
                    nltk.download(resource, quiet=True)
                except Exception as e:
                    logger.error(f"Failed to download NLTK resource {resource}: {e}")
                    success = False

            return success

        except Exception as e:
            logger.error(f"NLTK resource installation error: {e}")
            return False

    def initialize_transformers_model(self, model_name="distilbert-base-uncased-finetuned-sst-2-english"):
        """Initialize transformers model with error handling"""
        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

            # Create model directory
            model_dir = Path(self.cache_dir) / "transformers" / model_name.replace('/', '_')
            os.makedirs(model_dir, exist_ok=True)

            logger.info(f"Loading transformers model: {model_name}")

            # Attempt to load model
            try:
                tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=model_dir)
                model = AutoModelForSequenceClassification.from_pretrained(model_name, cache_dir=model_dir)
                nlp_pipeline = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

                logger.info(f"Successfully loaded transformers model")
                return nlp_pipeline
            except Exception as e:
                logger.error(f"Failed to load transformers model: {e}")
                return None

        except Exception as e:
            logger.error(f"Error initializing transformers: {e}")
            return None

    def initialize_nlp_pipeline(self):
        """Initialize all required NLP resources"""
        logger.info("Initializing NLP pipeline...")

        # Store resources in a dictionary
        resources = {}

        # Install NLTK resources
        nltk_success = self.install_nltk_resources()
        if nltk_success:
            # Initialize NLTK components
            try:
                import nltk
                from nltk.corpus import stopwords
                from nltk.tokenize import word_tokenize
                from nltk.stem import WordNetLemmatizer

                resources['nltk_tokenize'] = word_tokenize
                resources['nltk_stopwords'] = stopwords.words('english')
                resources['nltk_lemmatizer'] = WordNetLemmatizer()
                logger.info("NLTK components initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize NLTK components: {e}")

        # Install SpaCy model
        spacy_success = self.install_spacy_model()
        if spacy_success:
            import spacy
            try:
                nlp = spacy.load('en_core_web_sm')
                resources['spacy'] = nlp
                logger.info("SpaCy model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load spaCy model: {e}")
                resources['spacy'] = None

        # Initialize transformers model
        transformer_model = self.initialize_transformers_model()
        if transformer_model:
            resources['sentiment_analyzer'] = transformer_model

        # Initialize keyword lists for various aspects
        resources['technical_keywords'] = [
            "algorithm", "data", "code", "programming", "software", "development",
            "database", "api", "function", "framework", "library", "architecture",
            "test", "debug", "deploy", "cloud", "server", "client", "network",
            "solution", "system", "design", "implementation", "process", "git",
            "version control", "agile", "scrum", "devops", "infrastructure"
        ]

        resources['communication_keywords'] = [
            "communicate", "team", "collaborate", "explain", "present", "discuss",
            "share", "meetings", "documentation", "report", "clarity", "articulate",
            "express", "listen", "feedback", "understand", "convey", "message",
            "stakeholder", "client", "user", "requirements", "specification",
            "interactive", "engagement", "interpersonal"
        ]

        resources['problem_solving_keywords'] = [
            "solve", "solution", "analyze", "optimize", "improve", "debug", "troubleshoot",
            "fix", "enhance", "approach", "method", "strategy", "plan", "design",
            "implement", "test", "evaluate", "assess", "review", "challenge",
            "innovative", "creative", "critical", "logical", "reasoning", "complexity"
        ]

        resources['cultural_fit_keywords'] = [
            "team", "culture", "values", "mission", "collaborate", "work ethic",
            "adaptable", "flexible", "learn", "growth", "positive", "attitude",
            "initiative", "proactive", "responsible", "accountable", "passion",
            "diversity", "inclusion", "respect", "ethics", "integrity", "leadership"
        ]

        resources['positive_words'] = [
            "achieve", "success", "accomplish", "excel", "improve", "positive",
            "effective", "efficient", "reliable", "confident", "passionate",
            "innovative", "excellence", "exceptional", "strong", "robust", "proven"
        ]

        resources['negative_phrases'] = [
            "i don't know", "no idea", "not sure", "never heard", "no experience",
            "i haven't", "can't answer", "don't understand", "no clue", "not familiar",
            "never done", "i guess", "maybe", "probably not", "i'm confused"
        ]

        # Mark as initialized
        resources['initialized'] = True
        logger.info("NLP resources initialized successfully")

        return resources

# Global resource cache to avoid re-initialization
_nlp_resources = None

def initialize_nlp_resources():
    """Initialize all NLP resources with comprehensive error handling"""
    global _nlp_resources

    if _nlp_resources is not None and _nlp_resources.get('initialized', False):
        logger.info("Using cached NLP resources")
        return _nlp_resources

    try:
        manager = NLPResourceManager()
        _nlp_resources = manager.initialize_nlp_pipeline()
        return _nlp_resources
    except Exception as e:
        logger.error(f"NLP initialization failed: {e}")

        # Create minimal fallback resources
        _nlp_resources = {
            'initialized': True,
            'technical_keywords': ["algorithm", "data", "code", "programming", "software"],
            'communication_keywords': ["communicate", "team", "collaborate", "explain"],
            'problem_solving_keywords': ["solve", "solution", "analyze", "optimize"],
            'cultural_fit_keywords': ["team", "culture", "values", "mission"],
            'positive_words': ["achieve", "success", "accomplish"],
            'negative_phrases': ["i don't know", "no idea"]
        }

        return _nlp_resources

# Text Analysis Functions
def analyze_text_response(text, question=None, role=None, resources=None):
    """
    Comprehensive analysis of interview response text

    Args:
        text (str): Response text to analyze
        question (str, optional): The question being answered
        role (str, optional): The job role being interviewed for
        resources (dict, optional): Pre-loaded NLP resources

    Returns:
        dict: Analysis results with scores and feedback
    """
    # Initialize resources if not provided
    if resources is None:
        resources = initialize_nlp_resources()

    # Extract relevant keyword lists
    technical_keywords = resources.get('technical_keywords', [])
    communication_keywords = resources.get('communication_keywords', [])
    problem_solving_keywords = resources.get('problem_solving_keywords', [])
    cultural_fit_keywords = resources.get('cultural_fit_keywords', [])
    positive_words = resources.get('positive_words', [])
    negative_phrases = resources.get('negative_phrases', [])

    # Basic text statistics
    text = text.strip()
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    avg_word_length = sum(len(word) for word in words) / max(1, word_count)

    # Calculate keyword counts using lower case for case-insensitive matching
    text_lower = text.lower()
    technical_count = sum(1 for kw in technical_keywords if kw.lower() in text_lower)
    communication_count = sum(1 for kw in communication_keywords if kw.lower() in text_lower)
    problem_solving_count = sum(1 for kw in problem_solving_keywords if kw.lower() in text_lower)
    cultural_fit_count = sum(1 for kw in cultural_fit_keywords if kw.lower() in text_lower)

    # Calculate positive and negative phrase counts
    positive_count = sum(1 for kw in positive_words if kw.lower() in text_lower)
    negative_count = sum(1 for phrase in negative_phrases if phrase.lower() in text_lower)

    # Use SpaCy for more advanced analysis if available
    entities = []
    sentence_count = 0

    if 'spacy' in resources and resources['spacy']:
        try:
            nlp = resources['spacy']
            doc = nlp(text)

            # Count sentences
            sentence_count = len(list(doc.sents))

            # Extract entities
            entities = [ent.text for ent in doc.ents]

        except Exception as e:
            logger.warning(f"SpaCy analysis failed: {e}")
            # Fallback sentence count
            sentence_count = text.count('.') + text.count('!') + text.count('?')
            sentence_count = max(1, sentence_count)
    else:
        # Fallback sentence count if spaCy not available
        sentence_count = text.count('.') + text.count('!') + text.count('?')
        sentence_count = max(1, sentence_count)

    # Sentiment analysis
    sentiment_score = 0.5  # Neutral default

    if 'sentiment_analyzer' in resources and resources['sentiment_analyzer']:
        try:
            # Use transformers sentiment analyzer
            result = resources['sentiment_analyzer'](text[:512])  # Limit length for transformer models
            label = result[0]['label']
            confidence = result[0]['score']

            # Convert to 0-1 range where 1 is positive
            sentiment_score = confidence if label == 'POSITIVE' else 1 - confidence
        except Exception as e:
            logger.warning(f"Transformer sentiment analysis failed: {e}")
            # Basic sentiment fallback
            sentiment_score = (positive_count / max(1, word_count / 10)) - (negative_count / max(1, word_count / 20))
            sentiment_score = max(0, min(1, sentiment_score + 0.5))  # Scale to 0-1 range
    else:
        # Basic sentiment analysis fallback
        sentiment_score = (positive_count / max(1, word_count / 10)) - (negative_count / max(1, word_count / 20))
        sentiment_score = max(0, min(1, sentiment_score + 0.5))  # Scale to 0-1 range

    # Calculate response quality based on length, keywords, and structure
    length_score = min(100, word_count / 2)  # 200 words = 100 points
    keyword_density = (technical_count + communication_count + problem_solving_count + cultural_fit_count) / max(1, word_count) * 20  # Scale factor
    keyword_score = min(100, keyword_density * 100)
    structure_score = min(100, (sentence_count / max(1, word_count / 10)) * 50)  # Proper sentence structure

    # Adjust for role if specified
    role_boost = 0
    if role:
        role_lower = role.lower()
        if ('engineer' in role_lower or 'developer' in role_lower) and technical_count > communication_count:
            role_boost = 10
        elif ('manager' in role_lower or 'lead' in role_lower) and communication_count > technical_count:
            role_boost = 10
        elif 'data' in role_lower and technical_count > 0 and problem_solving_count > 0:
            role_boost = 10

    # Calculate normalized scores (0-100 scale)
    max_possible = max(10, word_count / 15)  # Scale with response length
    technical = min(100, (technical_count / max_possible) * 100 + role_boost)
    communication = min(100, (communication_count / max_possible) * 100 +
                      (sentence_count / max(1, word_count / 15)) * 20)
    problem_solving = min(100, (problem_solving_count / max_possible) * 100 +
                        (sentence_count / max(1, word_count / 15)) * 10)
    cultural_fit = min(100, (cultural_fit_count / max_possible) * 100 +
                     (sentiment_score * 30))  # Sentiment affects cultural fit score

    # Calculate overall score with weighted components
    overall = (
        technical * 0.3 +
        communication * 0.3 +
        problem_solving * 0.2 +
        cultural_fit * 0.2
    )

    # Determine category
    if overall >= 75:
        category = "Strong"
    elif overall >= 50:
        category = "Average"
    else:
        category = "Weak"

    # Generate specific feedback
    feedback = []

    if word_count < 50:
        feedback.append("Your response is quite brief. Providing more details would strengthen your answer.")
    elif word_count > 300:
        feedback.append("Your response is comprehensive, but consider being more concise in interview settings.")

    if technical < 40 and 'tech' in str(question).lower():
        feedback.append("Include more technical details relevant to the question.")

    if communication < 40:
        feedback.append("Try to articulate your thoughts more clearly and use more communication-oriented language.")

    if problem_solving < 40 and 'problem' in str(question).lower():
        feedback.append("Describe your problem-solving approach more explicitly.")

    if cultural_fit < 40:
        feedback.append("Incorporate more examples of teamwork and cultural alignment in your response.")

    if negative_count > 2:
        feedback.append("Avoid negative or uncertain phrases like 'I don't know' or 'I'm not sure'.")

    if sentence_count < 3:
        feedback.append("Structure your response with more distinct points or sentences.")

    # Prepare comprehensive results
    results = {
        # Primary scores
        "technical": technical,
        "communication": communication,
        "problem_solving": problem_solving,
        "cultural_fit": cultural_fit,
        "overall": overall,
        "category": category,

        # Detailed metrics
        "word_count": word_count,
        "sentence_count": sentence_count,
        "technical_keyword_count": technical_count,
        "communication_keyword_count": communication_count,
        "problem_solving_keyword_count": problem_solving_count,
        "cultural_fit_keyword_count": cultural_fit_count,
        "positive_word_count": positive_count,
        "negative_phrase_count": negative_count,
        "sentiment_score": sentiment_score * 100,  # Convert to percentage

        # Feedback
        "feedback": feedback,
        "entities": entities[:10]  # Limit to first 10 entities
    }

    return results

def extract_features_for_ml(text, resources=None):
    """
    Extract ML-ready features from text response

    Args:
        text (str): Text to analyze
        resources (dict, optional): NLP resources

    Returns:
        np.array: Feature vector for ML models
    """
    if resources is None:
        resources = initialize_nlp_resources()

    # Get text analysis
    analysis = analyze_text_response(text, resources=resources)

    # Create feature vector (normalized 0-1)
    features = np.array([
        analysis['word_count'] / 300,  # Normalize by expected max length
        analysis['sentence_count'] / 20,
        analysis['technical_keyword_count'] / 15,
        analysis['communication_keyword_count'] / 15,
        analysis['problem_solving_keyword_count'] / 15,
        analysis['cultural_fit_keyword_count'] / 15,
        analysis['positive_word_count'] / 10,
        analysis['negative_phrase_count'] / 5,
        analysis['sentiment_score'] / 100,
        analysis['technical'] / 100,
        analysis['communication'] / 100,
        analysis['problem_solving'] / 100,
        analysis['cultural_fit'] / 100
    ])

    return features

def create_fallback_text_analyzer():
    """Create a simple fallback analyzer when ML resources aren't available"""

    def analyze_function(text, question=None, role=None):
        resources = initialize_nlp_resources()
        return analyze_text_response(text, question, role, resources)

    return analyze_function

def process_text_response(response, question, role=None, model_package=None,
                         fallback_analyzer=None, use_deepseek=False,
                         deepseek_available=False, use_huggingface=False,
                         huggingface_available=False):
    """
    Process and evaluate an interview text response

    This is the main function to be called from the interview system.
    """
    # If external evaluation is available and enabled, use it
    if use_deepseek and deepseek_available:
        try:
            # Assume this function is defined elsewhere in the codebase
            from external_apis import evaluate_with_deepseek
            return evaluate_with_deepseek(response, question, role)
        except Exception as e:
            logger.warning(f"DeepSeek evaluation failed: {e}")
            # Continue with fallback

    if use_huggingface and huggingface_available:
        try:
            # Assume this function is defined elsewhere in the codebase
            from external_apis import evaluate_with_huggingface
            return evaluate_with_huggingface(response, question, role)
        except Exception as e:
            logger.warning(f"Hugging Face evaluation failed: {e}")
            # Continue with fallback

    # Use provided ML model package if available
    if model_package is not None:
        try:
            return model_package.analyze(response, question, role)
        except Exception as e:
            logger.warning(f"Model package analysis failed: {e}")
            # Continue with fallback

    # Use provided fallback analyzer if available
    if fallback_analyzer is not None:
        try:
            return fallback_analyzer(response, question, role)
        except Exception as e:
            logger.warning(f"Fallback analyzer failed: {e}")
            # Continue with last resort

    # Last resort: Use our basic text analyzer
    try:
        resources = initialize_nlp_resources()
        return analyze_text_response(response, question, role, resources)
    except Exception as e:
        logger.error(f"All text analysis methods failed: {e}")

        # Return minimal response with default values
        return {
            "technical": 50.0,
            "communication": 50.0,
            "problem_solving": 50.0,
            "cultural_fit": 50.0,
            "overall": 50.0,
            "category": "Average",
            "feedback": ["Unable to analyze response. Default scores assigned."]
        }

# Execute initialization
if __name__ == "__main__":
    nlp_resources = initialize_nlp_resources()
    if nlp_resources and nlp_resources.get('initialized', False):
        print("NLP resources successfully initialized!")

        # Test with a sample response
        test_response = """
        I have five years of experience as a software engineer, with expertise in Python and JavaScript.
        My last project involved developing a cloud-based solution that improved data processing efficiency by 40%.
        I implemented a robust microservices architecture using Docker and Kubernetes.
        I enjoy collaborating with cross-functional teams and believe good communication is essential to project success.
        """

        test_question = "Tell me about your experience with cloud technologies and your approach to teamwork."

        analysis = analyze_text_response(test_response, test_question, "Software Engineer", nlp_resources)

        print("\nAnalysis Results:")
        print(f"Overall Score: {analysis['overall']:.1f}/100")
        print(f"Category: {analysis['category']}")
        print("\nDimension Scores:")
        print(f"Technical: {analysis['technical']:.1f}/100")
        print(f"Communication: {analysis['communication']:.1f}/100")
        print(f"Problem Solving: {analysis['problem_solving']:.1f}/100")
        print(f"Cultural Fit: {analysis['cultural_fit']:.1f}/100")

        print("\nFeedback:")
        for item in analysis['feedback']:
            print(f"- {item}")
    else:
        print("Failed to initialize NLP resources.")