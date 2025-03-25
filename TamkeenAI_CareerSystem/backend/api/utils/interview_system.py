# ========================================
# SECTION 8D: ENHANCED INTERVIEW PROCESS
# ========================================

import os
import sys
import time
import json
import threading
import re
from collections import Counter
import logging
from pathlib import Path

# Global variables for emotion detection
emotion_detection_active = False
emotion_results = []

# Check for transformers availability
try:
    import transformers
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

# Helper functions
def clear_screen():
    """Clear the terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def typing_effect(text, speed=0.05):
    """Display text with a typing effect."""
    for char in text:
        print(char, end='', flush=True)
        time.sleep(speed)
    print()

def get_score_emoji(score):
    """Return an emoji based on the score."""
    if score >= 85:
        return "🌟"
    elif score >= 70:
        return "✅"
    elif score >= 50:
        return "⚠️"
    else:
        return "❗"

def get_category_description(category):
    """Return a description for the category."""
    if category == "Strong":
        return "You demonstrated excellent skills that would impress most employers."
    elif category == "Average":
        return "You showed competence but have room for improvement in some areas."
    else:
        return "You need significant improvement to meet employer expectations."

def generate_interview_advice(role, overall_score, weakest_area, strongest_area):
    """Generate personalized interview advice."""
    advice = []
    
    # General advice based on score
    if overall_score < 50:
        advice.append("Practice answering common interview questions to build confidence.")
        advice.append("Research the STAR method (Situation, Task, Action, Result) for structured responses.")
    elif overall_score < 75:
        advice.append("Work on providing more concrete examples of your experience.")
        advice.append("Try to quantify your achievements with specific metrics when possible.")
    else:
        advice.append("Continue refining your storytelling to make your experiences memorable.")
        advice.append("Prepare questions that showcase your strategic thinking about the role.")
    
    # Area-specific advice
    if weakest_area == "Technical knowledge":
        advice.append("Review technical concepts relevant to the position and practice explaining them clearly.")
    elif weakest_area == "Communication skills":
        advice.append("Practice speaking more concisely and structuring your responses with clear beginnings and endings.")
    elif weakest_area == "Problem-solving approach":
        advice.append("Work on articulating your thought process when solving problems, highlighting methodology and reasoning.")
    elif weakest_area == "Team and culture fit":
        advice.append("Prepare more examples that demonstrate collaboration, adaptability, and alignment with company values.")
    
    return advice

def save_interview_results(results, filename):
    """Save interview results to a file."""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)

def generate_deepseek_interview_questions(role, num_questions=5):
    """Generate interview questions using DeepSeek API."""
    try:
        api_key = get_deepseek_api_key()
        if not api_key:
            raise ValueError("No DeepSeek API key available")
        
        from openai import OpenAI
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key
        )
        
        prompt = f"""Generate {num_questions} professional interview questions for a {role} position.
        The questions should test technical skills, problem-solving ability, communication skills, and cultural fit.
        Return only the numbered questions without any additional text."""
        
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[
                {"role": "system", "content": "You are an expert recruiter specializing in technical interviews."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        text = response.choices[0].message.content
        
        # Extract questions
        questions = []
        for line in text.split('\n'):
            line = line.strip()
            if re.match(r'^\d+\.?\s+', line) and len(line) > 10:
                questions.append(re.sub(r'^\d+\.?\s+', '', line))
        
        # If parsing failed, fallback to simple splitting
        if not questions or len(questions) < num_questions:
            questions = [q.strip() for q in text.split('\n') if len(q.strip()) > 10][:num_questions]
        
        # If still not enough questions, use default ones
        if len(questions) < num_questions:
            return generate_interview_questions(role, num_questions)
            
        return questions[:num_questions]
    
    except Exception as e:
        print(f"Error generating questions with DeepSeek: {e}")
        return generate_interview_questions(role, num_questions)

def generate_interview_questions(role=None, num_questions=5):
    """Generate generic interview questions with role customization."""
    general_questions = [
        "Tell me about yourself and your background.",
        "What are your greatest professional strengths?",
        "What do you consider to be your weaknesses?",
        "Where do you see yourself in five years?",
        "Why do you want to work for our company?",
        "Describe a challenging work situation and how you overcame it.",
        "How do you handle stress and pressure?",
        "What is your greatest professional achievement?",
        "How do you prioritize your work when handling multiple projects?",
        "Tell me about a time you demonstrated leadership skills."
    ]
    
    technical_questions = {
        "Software Engineer": [
            "Explain your approach to debugging a complex software issue.",
            "How do you ensure your code is maintainable and scalable?",
            "Describe a project where you had to learn a new technology quickly.",
            "How do you stay updated with the latest programming trends?",
            "Explain how you've used version control in your past projects."
        ],
        "Data Scientist": [
            "Describe a data analysis project you've worked on from start to finish.",
            "How do you handle missing or inconsistent data?",
            "Explain a complex machine learning concept in simple terms.",
            "How do you validate the accuracy of your models?",
            "Describe how you communicate technical findings to non-technical stakeholders."
        ],
        "UX Designer": [
            "Describe your design process from research to implementation.",
            "How do you incorporate user feedback into your designs?",
            "Tell me about a time when your design didn't work as expected and how you fixed it.",
            "How do you balance user needs with business requirements?",
            "Explain how you make design decisions based on data."
        ],
        "Project Manager": [
            "How do you handle scope changes in the middle of a project?",
            "Describe your approach to risk management in projects.",
            "How do you keep team members motivated throughout a project?",
            "Tell me about a time you had to resolve a conflict within your team.",
            "How do you ensure projects stay on budget and on schedule?"
        ],
        "Marketing Specialist": [
            "Describe a successful marketing campaign you developed.",
            "How do you measure the success of your marketing efforts?",
            "How do you stay updated with the latest marketing trends?",
            "Tell me about a time your marketing strategy didn't work as planned and how you adapted.",
            "How do you tailor marketing messages to different audiences?"
        ]
    }
    
    selected_questions = general_questions.copy()
    
    # Add role-specific questions if role is provided and exists in our database
    if role and role in technical_questions:
        role_questions = technical_questions[role]
        # Replace some general questions with role-specific ones
        replacement_count = min(len(role_questions), len(selected_questions) // 2)
        for i in range(replacement_count):
            selected_questions[i] = role_questions[i]
    
    # Shuffle questions for variety
    import random
    random.shuffle(selected_questions)
    
    return selected_questions[:num_questions]

def emotion_detection_thread(duration):
    """Run emotion detection in a separate thread."""
    global emotion_detection_active, emotion_results
    
    emotion_detection_active = True
    emotion_results = []
    
    try:
        import cv2
        from fer import FER
        
        # Initialize webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Could not open webcam")
            emotion_detection_active = False
            return
        
        # Initialize emotion detector
        detector = FER()
        
        # Set end time
        end_time = time.time() + duration
        
        while time.time() < end_time:
            # Capture frame
            ret, frame = cap.read()
            if not ret:
                continue
            
            # Detect emotions
            result = detector.detect_emotions(frame)
            if result and len(result) > 0:
                emotions = result[0]['emotions']
                # Get the dominant emotion
                dominant_emotion = max(emotions.items(), key=lambda x: x[1])
                emotion_results.append(dominant_emotion)
            
            # Display frame with emotions (optional)
            # cv2.imshow('Emotion Detection', frame)
            # if cv2.waitKey(1) == 27:  # ESC key
            #     break
            
            # Sleep to reduce CPU usage
            time.sleep(0.1)
        
        # Release webcam
        cap.release()
        # cv2.destroyAllWindows()
        
    except Exception as e:
        print(f"Error in emotion detection: {e}")
    
    finally:
        emotion_detection_active = False

def load_emotion_model():
    """Check if emotion detection libraries are available and load the model."""
    try:
        import cv2
        from fer import FER
        
        # Try initializing the detector
        detector = FER()
        
        # Try initializing the webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Could not open webcam")
            cap.release()
            return False
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            print("Could not read from webcam")
            return False
        
        # Try detecting on a sample frame
        detector.detect_emotions(frame)
        
        return True
    
    except Exception as e:
        print(f"Emotion detection not available: {e}")
        return False

def display_text_analysis(analysis, question):
    """Display text analysis results."""
    print("Response Analysis:")
    print(f"Technical Proficiency:  {analysis.get('technical', 0):.1f}/100 {get_score_emoji(analysis.get('technical', 0))}")
    print(f"Communication Skills:   {analysis.get('communication', 0):.1f}/100 {get_score_emoji(analysis.get('communication', 0))}")
    print(f"Problem-Solving:        {analysis.get('problem_solving', 0):.1f}/100 {get_score_emoji(analysis.get('problem_solving', 0))}")
    print(f"Cultural Fit:           {analysis.get('cultural_fit', 0):.1f}/100 {get_score_emoji(analysis.get('cultural_fit', 0))}")
    print(f"Overall Score:          {analysis.get('overall', 0):.1f}/100 {get_score_emoji(analysis.get('overall', 0))}")
    print(f"Category:               {analysis.get('category', 'N/A')}")
    
    # Display feedback
    if 'feedback' in analysis and analysis['feedback']:
        print("\nFeedback:")
        if isinstance(analysis['feedback'], list):
            for item in analysis['feedback']:
                print(f"• {item}")
        else:
            print(f"• {analysis['feedback']}")

def display_emotion_feedback(emotion_data):
    """Display emotion analysis feedback."""
    print("\nEmotion Analysis:")
    print(f"Dominant Emotion:  {emotion_data.get('dominant_emotion', 'Neutral')}")
    print(f"Engagement Score:  {emotion_data.get('engagement_score', 0)*100:.1f}%")
    print(f"Positive Ratio:    {emotion_data.get('positive_ratio', 0)*100:.1f}%")
    
    # Display emotion counts
    emotion_counts = emotion_data.get('emotion_counts', {})
    if emotion_counts:
        print("\nEmotion Distribution:")
        total = sum(emotion_counts.values())
        for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / total) * 100
            print(f"  {emotion}: {percentage:.1f}%")
    
    # Display feedback based on emotions
    print("\nEmotion Feedback:")
    dominant = emotion_data.get('dominant_emotion', 'Neutral')
    if dominant == 'Happy':
        print("• You appear confident and positive, which is excellent!")
    elif dominant == 'Neutral':
        print("• Try to show more engagement and enthusiasm in your responses.")
    elif dominant == 'Sad':
        print("• You appear somewhat downcast. Try to project more confidence.")
    elif dominant == 'Angry':
        print("• You may be coming across as tense. Try to relax your expression.")
    elif dominant == 'Surprise':
        print("• You appear very engaged, which can be positive if balanced with focus.")
    elif dominant == 'Fear':
        print("• You appear nervous. Take deep breaths and practice confidence.")
    
    engagement = emotion_data.get('engagement_score', 0)
    if engagement < 0.3:
        print("• Your facial expressions show low engagement. Try to be more expressive.")
    elif engagement > 0.7:
        print("• You show good facial engagement during the interview.")

# Define the nlp_resources module inline
def initialize_nlp_resources():
    """Initialize NLP resources for interview analysis."""
    import nltk
    import spacy
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from nltk.sentiment.vader import SentimentIntensityAnalyzer

    # Download necessary NLTK resources
    try:
        nltk.data.find('vader_lexicon')
    except LookupError:
        nltk.download('vader_lexicon', quiet=True)

    try:
        nltk.data.find('punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)

    try:
        nltk.data.find('stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)

    # Load spaCy model
    try:
        nlp = spacy.load('en_core_web_sm')
    except OSError:
        # If model isn't downloaded, download it
        import sys
        import subprocess
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        nlp = spacy.load('en_core_web_sm')

    # Initialize sentiment analyzer
    sentiment_analyzer = SentimentIntensityAnalyzer()

    # Create vectorizer for text analysis
    vectorizer = TfidfVectorizer(stop_words='english')

    # Setup text similarity function
    def calculate_similarity(text1, text2):
        try:
            vectors = vectorizer.fit_transform([text1, text2])
            return cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        except:
            return 0.5

    return {
        'nlp': nlp,
        'sentiment_analyzer': sentiment_analyzer,
        'vectorizer': vectorizer,
        'calculate_similarity': calculate_similarity
    }

# Fix DeepSeek API configuration for consistent secret handling
def get_deepseek_api_key():
    """Get the DeepSeek API key from available sources."""
    import os

    try:
        # First try to get from Colab userdata
        try:
            from google.colab import userdata
            api_key = userdata.get('DEEPSEEK_API_KEY')
            if api_key:
                return api_key
        except:
            pass

        # Then try environment variables
        api_key = os.environ.get('DEEPSEEK_API_KEY')
        if api_key:
            return api_key

        # Finally, prompt the user if needed
        from getpass import getpass
        print("DeepSeek API key not found. Please provide your API key:")
        api_key = getpass("Enter your DeepSeek API key: ")
        # Save for future use in this session
        os.environ['DEEPSEEK_API_KEY'] = api_key

        return api_key
    except Exception as e:
        print(f"Error accessing DeepSeek API key: {e}")
        return None

# Create a fallback text analyzer for when more advanced methods fail
def create_fallback_text_analyzer():
    """Create a simple rule-based text analyzer as fallback."""
    def analyze_text(text, question=None, role=None):
        # Very basic analysis
        words = text.split()
        word_count = len(words)

        # Set basic scores based on response length
        if word_count < 20:
            communication = 30.0
            overall = 40.0
            category = "Weak"
        elif word_count < 50:
            communication = 50.0
            overall = 55.0
            category = "Average"
        elif word_count < 100:
            communication = 70.0
            overall = 65.0
            category = "Average"
        else:
            communication = 80.0
            overall = 75.0
            category = "Strong"

        # Count technical terms (very simplified)
        tech_terms = ['implement', 'analyze', 'develop', 'solution', 'strategy',
                     'process', 'method', 'experience', 'skill', 'technology']
        tech_count = sum(1 for term in tech_terms if term.lower() in text.lower())
        technical = min(85, tech_count * 10 + 40)

        # Problem solving assessment (simplified)
        problem_terms = ['solve', 'approach', 'resolve', 'consider', 'think',
                        'plan', 'implement', 'decision', 'analyze', 'evaluate']
        problem_count = sum(1 for term in problem_terms if term.lower() in text.lower())
        problem_solving = min(85, problem_count * 10 + 40)

        # Cultural fit (simplified)
        culture_terms = ['team', 'collaborate', 'communicate', 'value', 'culture',
                        'together', 'support', 'colleague', 'help', 'share']
        culture_count = sum(1 for term in culture_terms if term.lower() in text.lower())
        cultural_fit = min(85, culture_count * 10 + 40)

        # Calculate overall score
        overall = (technical * 0.3 + communication * 0.3 +
                  problem_solving * 0.2 + cultural_fit * 0.2)

        # Determine category
        if overall >= 75:
            category = "Strong"
        elif overall >= 50:
            category = "Average"
        else:
            category = "Weak"

        return {
            'technical': technical,
            'communication': communication,
            'problem_solving': problem_solving,
            'cultural_fit': cultural_fit,
            'overall': overall,
            'category': category
        }

    return analyze_text

# Function to process text responses with available models
def process_text_response(response, question, role, model_package, fallback_analyzer,
                         use_deepseek=False, deepseek_available=False,
                         use_huggingface=False, huggingface_available=False):
    """Process and analyze text response using available language models."""
    # Initialize with default scores
    scores = {
        'technical': 50.0,
        'communication': 50.0,
        'problem_solving': 50.0,
        'cultural_fit': 50.0,
        'overall': 50.0,
        'category': 'Average',
        'feedback': 'Your response shows average understanding of the question.'
    }

    # Try to use DeepSeek for advanced analysis if available
    if use_deepseek and deepseek_available:
        try:
            # Call DeepSeek API for evaluation
            api_key = get_deepseek_api_key()
            if not api_key:
                raise ValueError("No DeepSeek API key available")

            # Create the API client
            from openai import OpenAI
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key
            )

            # Prepare prompt
            role_context = f" for a {role} position" if role else ""
            prompt = f"""Evaluate this interview response{role_context}:

            Question: {question}

            Response: {response}

            Please evaluate on:
            1. Technical knowledge (0-100)
            2. Communication clarity (0-100)
            3. Problem-solving approach (0-100)
            4. Cultural fit (0-100)

            Return a JSON object with these scores, an overall score (0-100),
            a category (Strong/Average/Weak), and brief feedback."""

            # Call API
            result = client.chat.completions.create(
                model="deepseek/deepseek-chat",  # Use available model
                messages=[
                    {"role": "system", "content": "You are an expert interview evaluator. Provide honest, constructive feedback."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )

            # Process response
            evaluation_text = result.choices[0].message.content

            # Try to extract JSON
            import json
            import re

            # Look for JSON-like structure in the response
            json_match = re.search(r'(\{.*\})', evaluation_text, re.DOTALL)
            if json_match:
                try:
                    evaluation = json.loads(json_match.group(1))

                    # Update scores with API response
                    for key in ['technical', 'communication', 'problem_solving',
                               'cultural_fit', 'overall', 'category', 'feedback']:
                        if key in evaluation:
                            scores[key] = evaluation[key]

                    # Ensure numerical values
                    for key in ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall']:
                        if key in scores:
                            # Handle percentage strings or other text
                            if isinstance(scores[key], str):
                                scores[key] = float(re.search(r'\d+', scores[key]).group())
                            scores[key] = float(scores[key])

                    scores['analysis_source'] = 'deepseek'
                    return scores

                except Exception as e:
                    print(f"Error parsing DeepSeek JSON: {e}")

            # If JSON extraction failed, try regex pattern matching
            technical_match = re.search(r'Technical.*?(\d+)', evaluation_text)
            communication_match = re.search(r'Communication.*?(\d+)', evaluation_text)
            problem_match = re.search(r'Problem.*?(\d+)', evaluation_text)
            cultural_match = re.search(r'Cultural.*?(\d+)', evaluation_text)
            overall_match = re.search(r'Overall.*?(\d+)', evaluation_text)

            if technical_match:
                scores['technical'] = float(technical_match.group(1))
            if communication_match:
                scores['communication'] = float(communication_match.group(1))
            if problem_match:
                scores['problem_solving'] = float(problem_match.group(1))
            if cultural_match:
                scores['cultural_fit'] = float(cultural_match.group(1))
            if overall_match:
                scores['overall'] = float(overall_match.group(1))

            # Extract feedback
            feedback_match = re.search(r'Feedback:?\s*(.*?)(?:\n\n|\Z)', evaluation_text, re.DOTALL)
            if feedback_match:
                scores['feedback'] = feedback_match.group(1).strip()

            # Determine category if not already set
            if 'category' not in scores or not scores['category']:
                if scores['overall'] >= 75:
                    scores['category'] = 'Strong'
                elif scores['overall'] >= 50:
                    scores['category'] = 'Average'
                else:
                    scores['category'] = 'Weak'

            scores['analysis_source'] = 'deepseek'
            return scores

        except Exception as e:
            print(f"DeepSeek analysis failed: {e}")
            # Fall back to other methods

    # Try to use Hugging Face for analysis if available
    if use_huggingface and huggingface_available:
        try:
            from transformers import pipeline

            print("Using Hugging Face for analysis...")
            # Use sentiment analysis
            sentiment_pipe = pipeline("sentiment-analysis")
            sentiment = sentiment_pipe(response)[0]

            # Adjust scores based on sentiment
            sentiment_score = sentiment['score']
            sentiment_label = sentiment['label']

            # Adjust communication score based on sentiment
            if sentiment_label == 'POSITIVE':
                scores['communication'] = min(85.0, 60.0 + sentiment_score * 20)
                scores['cultural_fit'] = min(90.0, 65.0 + sentiment_score * 25)
            else:
                scores['communication'] = max(40.0, 60.0 - sentiment_score * 15)
                scores['cultural_fit'] = max(35.0, 60.0 - sentiment_score * 20)

            # Generate text metrics based on length and structure
            words = response.split()
            word_count = len(words)

            # Adjust technical score based on response length and structure
            if word_count < 30:
                scores['technical'] = max(30.0, scores['technical'] - 15)
            elif word_count > 100:
                scores['technical'] = min(90.0, scores['technical'] + 10)

            # Adjust problem solving score
            problem_keywords = ['solve', 'approach', 'method', 'process', 'strategy', 'analyze']
            problem_keyword_count = sum(1 for word in problem_keywords if word in response.lower())
            scores['problem_solving'] = min(85.0, 50.0 + problem_keyword_count * 8)

            # Calculate overall score
            scores['overall'] = (
                scores['technical'] * 0.3 +
                scores['communication'] * 0.3 +
                scores['problem_solving'] * 0.2 +
                scores['cultural_fit'] * 0.2
            )

            # Determine category
            if scores['overall'] >= 75:
                scores['category'] = 'Strong'
            elif scores['overall'] >= 50:
                scores['category'] = 'Average'
            else:
                scores['category'] = 'Weak'

            scores['analysis_source'] = 'huggingface'
            return scores

        except Exception as e:
            print(f"Hugging Face analysis failed: {e}")

    # Use fallback analyzer if other methods failed
    try:
        if fallback_analyzer:
            fallback_scores = fallback_analyzer(response, question, role)
            scores.update(fallback_scores)
            scores['analysis_source'] = 'fallback'
            return scores
    except Exception as e:
        print(f"Fallback analysis error: {e}")

    # If all else fails, use very basic analysis
    words = response.split()
    word_count = len(words)

    # Set basic scores based on response length
    if word_count < 20:
        scores['communication'] = 30.0
        scores['overall'] = 40.0
        scores['category'] = "Weak"
        scores['feedback'] = "Your response is too brief. Consider providing more details and examples."
    elif word_count < 50:
        scores['communication'] = 50.0
        scores['overall'] = 55.0
        scores['category'] = "Average"
        scores['feedback'] = "Your response is adequate but could benefit from more depth and examples."
    elif word_count < 100:
        scores['communication'] = 70.0
        scores['overall'] = 65.0
        scores['category'] = "Average"
        scores['feedback'] = "Good response. Adding more specific details could strengthen it further."
    else:
        scores['communication'] = 80.0
        scores['overall'] = 75.0
        scores['category'] = "Strong"
        scores['feedback'] = "Comprehensive response that demonstrates good communication skills."

    scores['analysis_source'] = 'basic'
    return scores

# Function to start emotion detection in a separate thread
def start_emotion_detection(duration=10):
    """Start emotion detection in a separate thread."""
    global emotion_detection_active, emotion_results

    if emotion_detection_active:
        print("Emotion detection already active.")
        return False

    # Start emotion detection in a separate thread
    emotion_thread = threading.Thread(target=emotion_detection_thread, args=(duration,))
    emotion_thread.daemon = True
    emotion_thread.start()

    # Wait a bit to make sure it started
    time.sleep(1)

    return emotion_detection_active

# Function to analyze emotion detection results
def analyze_emotion_results(results):
    """Analyze emotion detection results and return metrics."""
    if not results:
        return None

    # Count emotions
    emotion_counts = {}
    confidence_sum = {}

    for emotion, confidence in results:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        confidence_sum[emotion] = confidence_sum.get(emotion, 0) + confidence

    # Find dominant emotion
    dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "Neutral"

    # Calculate average confidence for dominant emotion
    confidence_score = confidence_sum.get(dominant_emotion, 0) / emotion_counts.get(dominant_emotion, 1)

    # Calculate engagement score (non-neutral emotions)
    total_frames = len(results)
    non_neutral_frames = sum(1 for emotion, _ in results if emotion != 'Neutral')
    engagement_score = non_neutral_frames / total_frames if total_frames > 0 else 0.5

    # Calculate positive emotion ratio
    positive_frames = sum(1 for emotion, _ in results if emotion in ['Happy', 'Surprise'])
    positive_ratio = positive_frames / total_frames if total_frames > 0 else 0.0

    return {
        'dominant_emotion': dominant_emotion,
        'confidence_score': confidence_score,
        'engagement_score': engagement_score,
        'positive_ratio': positive_ratio,
        'emotion_counts': emotion_counts
    }

# Enhanced interview function
def integrated_interview_system(max_questions=5, role=None, emotion_analysis=True,
                                use_huggingface=False, use_deepseek=True):
    """
    Run the complete integrated interview system with both text and emotion analysis.

    Parameters:
    - max_questions: Number of questions to ask
    - role: Specific job role to generate questions for
    - emotion_analysis: Whether to perform facial expression analysis
    - use_huggingface: Whether to use Hugging Face models for analysis
    - use_deepseek: Whether to use DeepSeek API for analysis
    """
    global emotion_results, emotion_detection_active

    clear_screen()
    print("Initializing enhanced interview system...")

    # Initialize NLP resources
    try:
        nlp_resources = initialize_nlp_resources()
        print("NLP resources initialized successfully")
    except Exception as e:
        print(f"Error initializing NLP resources: {e}")
        nlp_resources = None

    # Create fallback text analyzer
    fallback_analyzer = create_fallback_text_analyzer()

    # Check advanced API availability
    deepseek_available = False
    huggingface_available = TRANSFORMERS_AVAILABLE

    if use_deepseek:
        print("Testing DeepSeek API connection...")
        try:
            api_key = get_deepseek_api_key()
            if api_key:
                # Quick test of API
                from openai import OpenAI
                client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=api_key
                )
                response = client.chat.completions.create(
                    model="deepseek/deepseek-chat",
                    messages=[{"role": "user", "content": "Hello, testing API connection"}],
                    max_tokens=10
                )
                deepseek_available = True
                print("DeepSeek API connection successful!")
            else:
                print("DeepSeek API key not found or invalid.")
        except Exception as e:
            print(f"DeepSeek API test failed: {e}")
            print("Will use alternative analysis methods.")

    if use_huggingface and huggingface_available:
        print("Hugging Face transformers available for analysis")

    # Generate questions
    if role and deepseek_available:
        print(f"Generating {max_questions} questions for {role} role using DeepSeek API...")
        questions = generate_deepseek_interview_questions(role, max_questions)
    else:
        print(f"Generating {max_questions} questions using built-in templates...")
        questions = generate_interview_questions(role, max_questions)

    # Display welcome message
    clear_screen()
    if role:
        typing_effect(f"\n🎯 TAMKEEN AI INTERVIEW PRACTICE: {role.upper()} 🎯\n", speed=0.01)
    else:
        typing_effect("\n🎯 TAMKEEN AI INTERVIEW PRACTICE 🎯\n", speed=0.01)

    print(f"This system will evaluate your responses to {len(questions)} interview questions.")
    if emotion_analysis:
        # Check if emotion detection is available
        emotion_available = load_emotion_model()
        if emotion_available:
            print("\nWe'll also analyze your facial expressions using your webcam.")
            print("Make sure your face is visible and well-lit.")
        else:
            emotion_analysis = False
            print("\nEmotion detection is not available. We'll focus on your verbal responses only.")

    print("\nTry to answer naturally as you would in a real interview.")
    input("Press Enter when you're ready to begin...")

    # Main interview loop
    all_results = []

    for i, question in enumerate(questions):
        clear_screen()
        print(f"Question {i+1}/{len(questions)}:")
        typing_effect(f"\n{question}\n", speed=0.03)

        # Get user's response
        print("\nYour answer (type your response and press Enter twice when finished):")
        response_lines = []
        while True:
            line = input()
            if line == "" and response_lines and response_lines[-1] == "":
                break
            response_lines.append(line)

        response = "\n".join(response_lines).strip()

        # Emotion analysis if enabled
        emotion_data = None
        if emotion_analysis:
            print("\nNow we'll analyze your facial expressions.")
            print("Please look at the camera naturally as if you were in an interview.")

            if start_emotion_detection():
                # Wait for emotion detection to complete
                while emotion_detection_active:
                    print(".", end="", flush=True)
                    time.sleep(1)
                print("\nAnalyzing facial expressions...")

                # Process emotion results
                emotion_data = analyze_emotion_results(emotion_results)
            else:
                print("Emotion detection unavailable or failed.")

        # Text analysis
        print("\nAnalyzing your response...")
        text_predictions = process_text_response(
            response, question, role,
            nlp_resources, fallback_analyzer,
            use_deepseek, deepseek_available,
            use_huggingface, huggingface_available
        )

        # Combine text and emotion analysis for integrated scoring
        integrated_score = {}

        # First copy text predictions
        for key in ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall', 'category', 'feedback']:
            if key in text_predictions:
                integrated_score[key] = text_predictions[key]

        # Adjust scores based on emotion data if available
        if emotion_data:
            # Adjust communication score based on engagement and confidence
            if 'communication' in integrated_score:
                engagement_factor = emotion_data['engagement_score'] * 100  # Convert to 0-100 scale
                confidence_factor = emotion_data['confidence_score'] * 100

                # Weighted adjustment (60% text, 40% emotion)
                integrated_score['communication'] = (
                    integrated_score['communication'] * 0.6 +
                    engagement_factor * 0.2 +
                    confidence_factor * 0.2
                )

            # Adjust cultural fit score based on positive emotions
            if 'cultural_fit' in integrated_score:
                positive_factor = emotion_data['positive_ratio'] * 100

                # Weighted adjustment (70% text, 30% emotion)
                integrated_score['cultural_fit'] = (
                    integrated_score['cultural_fit'] * 0.7 +
                    positive_factor * 0.3
                )

            # Recalculate overall score
            integrated_score['overall'] = (
                integrated_score.get('technical', 50.0) * 0.3 +
                integrated_score.get('communication', 50.0) * 0.3 +
                integrated_score.get('problem_solving', 50.0) * 0.2 +
                integrated_score.get('cultural_fit', 50.0) * 0.2
            )

            # Update category based on new overall score
            if integrated_score['overall'] >= 75:
                integrated_score['category'] = 'Strong'
            elif integrated_score['overall'] >= 50:
                integrated_score['category'] = 'Average'
            else:
                integrated_score['category'] = 'Weak'

        # Store the result
        result = {
            'question': question,
            'response': response,
            'text_analysis': text_predictions,
            'emotion_analysis': emotion_data,
            'integrated_score': integrated_score
        }
        all_results.append(result)

        # Display analysis results
        clear_screen()
        print(f"Question {i+1} Analysis:\n")
        print(f"Q: {question}\n")

        # Display text analysis
        display_text_analysis(text_predictions, question)

        # Display emotion analysis if available
        if emotion_data:
            display_emotion_feedback(emotion_data)

        # Pause before next question
        if i < len(questions) - 1:
            print("\nPress Enter to continue to the next question...")
            input()

    # Display final summary after all questions
    clear_screen()
    typing_effect("\n📊 INTERVIEW SUMMARY 📊", speed=0.01)
    print(f"\nYou completed {len(all_results)} questions for a {role if role else 'general'} position.")

    # Calculate average scores
    total_technical = 0
    total_communication = 0
    total_problem_solving = 0
    total_cultural_fit = 0
    total_overall = 0
    categories = []

    for result in all_results:
        scores = result.get('integrated_score', {})
        total_technical += scores.get('technical', 50.0)
        total_communication += scores.get('communication', 50.0)
        total_problem_solving += scores.get('problem_solving', 50.0)
        total_cultural_fit += scores.get('cultural_fit', 50.0)
        total_overall += scores.get('overall', 50.0)
        categories.append(scores.get('category', 'Average'))

    num_questions = len(all_results)
    avg_technical = total_technical / num_questions
    avg_communication = total_communication / num_questions
    avg_problem_solving = total_problem_solving / num_questions
    avg_cultural_fit = total_cultural_fit / num_questions
    avg_overall = total_overall / num_questions

    # Determine final category based on most common category
    from collections import Counter
    category_counts = Counter(categories)
    final_category = category_counts.most_common(1)[0][0]

    # Display overall scores
    print("\nYour overall interview performance:")
    print(f"Technical Proficiency:  {avg_technical:.1f}/100 {get_score_emoji(avg_technical)}")
    print(f"Communication Skills:   {avg_communication:.1f}/100 {get_score_emoji(avg_communication)}")
    print(f"Problem-Solving:        {avg_problem_solving:.1f}/100 {get_score_emoji(avg_problem_solving)}")
    print(f"Cultural Fit:           {avg_cultural_fit:.1f}/100 {get_score_emoji(avg_cultural_fit)}")
    print(f"Overall Score:          {avg_overall:.1f}/100 {get_score_emoji(avg_overall)}")

    # Display final category
    print("\nOverall Classification:")
    if final_category == "Strong":
        typing_effect(f"  ⭐ {final_category} ⭐", speed=0.02)
    elif final_category == "Average":
        typing_effect(f"  ✓ {final_category} ✓", speed=0.02)
    else:
        typing_effect(f"  △ {final_category} △", speed=0.02)

    print(f"  {get_category_description(final_category)}")

    # Find strengths and weaknesses
    scores_dict = {
        "Technical knowledge": avg_technical,
        "Communication skills": avg_communication,
        "Problem-solving approach": avg_problem_solving,
        "Team and culture fit": avg_cultural_fit
    }

    # Sort to find strongest and weakest areas
    sorted_areas = sorted(scores_dict.items(), key=lambda x: x[1])
    weakest_area = sorted_areas[0][0]
    strongest_area = sorted_areas[-1][0]

    # Display strengths and weaknesses
    print(f"\nYour strongest area: {strongest_area} ({sorted_areas[-1][1]:.1f}/100)")
    print(f"Your weakest area: {weakest_area} ({sorted_areas[0][1]:.1f}/100)")

    # Generate personalized career advice
    print("\nPersonalized Interview Advice:")
    career_advice = generate_interview_advice(role, avg_overall, weakest_area, strongest_area)
    for advice in career_advice:
        print(f"• {advice}")

    # Save results
    try:
        # Check if Google Drive is mounted
        if os.path.exists('/content/drive'):
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"/content/drive/MyDrive/interview_results_{role.replace(' ', '_') if role else 'general'}_{timestamp}.json"
            print(f"\nSaving results to Google Drive: {filename}")
        else:
            # Save locally
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"interview_results/interview_{role.replace(' ', '_') if role else 'general'}_{timestamp}.json"
            print(f"\nSaving results locally: {filename}")

        save_interview_results(all_results, filename)
    except Exception as e:
        print(f"Error saving results: {e}")
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"interview_results_{timestamp}.json"
        print(f"Attempting to save locally as: {filename}")
        save_interview_results(all_results, filename)

    print("\nInterview session complete. Press Enter to finish...")
    input()
    return all_results