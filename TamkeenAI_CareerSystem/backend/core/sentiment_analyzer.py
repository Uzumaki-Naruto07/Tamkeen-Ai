import os
import re
import json
import logging
import numpy as np
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import hashlib
import time
import functools

# Optional dependencies - allow graceful fallback if not available
try:
    from nltk.sentiment import SentimentIntensityAnalyzer
    import nltk
    NLTK_AVAILABLE = True
    try:
        nltk.data.find('sentiment/vader_lexicon.zip')
    except LookupError:
        nltk.download('vader_lexicon', quiet=True)
except ImportError:
    NLTK_AVAILABLE = False

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch.nn.functional as F
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

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


class SentimentAnalyzer:
    """
    Provides sentiment analysis and emotion detection for text using
    multiple approaches (rule-based, ML, transformers) with fallbacks.
    
    Key features:
    - Sentiment scoring (positive/neutral/negative)
    - Emotion detection (joy, sadness, fear, anger, etc.)
    - Confidence analysis for professional contexts
    - Domain-specific analysis for career/interview content
    """
    
    def __init__(self, 
                model_path: Optional[str] = None,
                cache_dir: Optional[str] = None,
                cache_ttl: int = 3600,
                domain: str = "career"):
        """
        Initialize the sentiment analyzer
        
        Args:
            model_path: Path to pre-trained sentiment models
            cache_dir: Directory to cache sentiment results
            cache_ttl: How long to cache results in seconds
            domain: Domain context for sentiment (career, interview, general)
        """
        self.logger = logging.getLogger(__name__)
        self.domain = domain
        self.cache_ttl = cache_ttl
        
        # Set up cache
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = None
            
        # Initialize available engines
        self.available_engines = []
        self.engine_weights = {}
        
        # Try to initialize NLTK VADER
        if NLTK_AVAILABLE:
            try:
                self.sia = SentimentIntensityAnalyzer()
                self.available_engines.append("vader")
                self.engine_weights["vader"] = 0.3
                self.logger.info("NLTK VADER sentiment analyzer initialized")
            except Exception as e:
                self.logger.warning(f"Failed to initialize NLTK VADER: {str(e)}")
        
        # Try to initialize TextBlob
        if TEXTBLOB_AVAILABLE:
            self.available_engines.append("textblob")
            self.engine_weights["textblob"] = 0.2
            self.logger.info("TextBlob sentiment analyzer initialized")
            
        # Try to initialize transformers
        if TRANSFORMERS_AVAILABLE:
            # Default model for sentiment
            model_name = "distilbert-base-uncased-finetuned-sst-2-english"
            
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
                self.available_engines.append("transformers")
                self.engine_weights["transformers"] = 0.5
                self.logger.info(f"Transformer model {model_name} initialized")
            except Exception as e:
                self.logger.warning(f"Failed to initialize transformer model: {str(e)}")
                
            # Try to load emotion model if available
            try:
                emotion_model = "joeddav/distilbert-base-uncased-go-emotions-student"
                self.emotion_tokenizer = AutoTokenizer.from_pretrained(emotion_model)
                self.emotion_model = AutoModelForSequenceClassification.from_pretrained(emotion_model)
                self.available_engines.append("emotion_transformer")
                self.logger.info(f"Emotion transformer model initialized")
                
                # Map of emotion indices to emotion names
                self.emotion_mapping = {
                    0: "admiration", 1: "amusement", 2: "anger", 3: "annoyance", 
                    4: "approval", 5: "caring", 6: "confusion", 7: "curiosity", 
                    8: "desire", 9: "disappointment", 10: "disapproval", 11: "disgust", 
                    12: "embarrassment", 13: "excitement", 14: "fear", 15: "gratitude", 
                    16: "grief", 17: "joy", 18: "love", 19: "nervousness", 
                    20: "optimism", 21: "pride", 22: "realization", 23: "relief", 
                    24: "remorse", 25: "sadness", 26: "surprise", 27: "neutral"
                }
            except Exception as e:
                self.logger.warning(f"Failed to initialize emotion model: {str(e)}")
        
        # Initialize spaCy for career-specific term detection
        if SPACY_AVAILABLE:
            self.career_terms = self._load_career_terms()
            self.career_term_patterns = self._create_career_term_patterns()
            
            # Add career terms to entity ruler if available
            if nlp and "entity_ruler" not in nlp.pipe_names:
                ruler = nlp.add_pipe("entity_ruler")
                ruler.add_patterns(self.career_term_patterns)
                
        # Domain-specific adaptation
        self._init_domain_specific_resources()
        
        self.logger.info(f"Sentiment analyzer initialized with engines: {', '.join(self.available_engines)}")
    
    def _load_career_terms(self) -> Dict[str, List[str]]:
        """Load career-specific terminology for context-aware sentiment"""
        # Default career terms dictionary
        career_terms = {
            "positive_indicators": [
                "qualified", "experienced", "skilled", "proficient", "expert",
                "accomplished", "successful", "achieved", "excelled", "outstanding",
                "excellent", "exceptional", "strong", "impressive", "extensive"
            ],
            "negative_indicators": [
                "lacking", "limited", "insufficient", "inadequate", "poor",
                "weak", "minimal", "deficient", "incomplete", "missing",
                "underdeveloped", "subpar", "mediocre", "unqualified", "inexperienced"
            ],
            "neutral_indicators": [
                "developing", "working on", "learning", "improving", "progressing",
                "building", "growing", "pursuing", "studying", "practicing"
            ],
            "interview_negative": [
                "nervous", "unsure", "hesitant", "uncertain", "unclear",
                "confused", "disorganized", "rambling", "unprepared", "scattered"
            ],
            "interview_positive": [
                "confident", "articulate", "clear", "thoughtful", "organized",
                "prepared", "concise", "insightful", "knowledgeable", "precise"
            ],
            "feedback_keywords": [
                "improve", "develop", "enhance", "strengthen", "build",
                "focus on", "work on", "consider", "try", "practice"
            ]
        }
        
        return career_terms
    
    def _create_career_term_patterns(self) -> List[Dict[str, Any]]:
        """Create entity patterns for career terms"""
        patterns = []
        
        for category, terms in self.career_terms.items():
            for term in terms:
                patterns.append({
                    "label": f"CAREER_{category.upper()}",
                    "pattern": term
                })
                
        return patterns
    
    def _init_domain_specific_resources(self):
        """Initialize domain-specific resources based on domain setting"""
        if self.domain == "career":
            # Adjust weights for career-specific sentiment
            if "vader" in self.engine_weights:
                self.engine_weights["vader"] = 0.25
            if "textblob" in self.engine_weights:
                self.engine_weights["textblob"] = 0.15  
            if "transformers" in self.engine_weights:
                self.engine_weights["transformers"] = 0.6
                
            # Career-specific sentiment modifiers
            self.domain_modifiers = {
                "positive_boost": [
                    "experience", "skill", "qualification", "degree", "certified",
                    "professional", "trained", "proficient", "expert", "specialized"
                ],
                "negative_boost": [
                    "lack", "limited", "without", "missing", "gap",
                    "need", "require", "must have", "necessary", "essential"
                ]
            }
            
        elif self.domain == "interview":
            # Adjust weights for interview-specific sentiment
            if "vader" in self.engine_weights:
                self.engine_weights["vader"] = 0.2
            if "textblob" in self.engine_weights:
                self.engine_weights["textblob"] = 0.1  
            if "transformers" in self.engine_weights:
                self.engine_weights["transformers"] = 0.7
                
            # Interview-specific sentiment modifiers
            self.domain_modifiers = {
                "positive_boost": [
                    "confident", "clear", "articulate", "specific", "example",
                    "detailed", "precise", "relevant", "concise", "organized"
                ],
                "negative_boost": [
                    "um", "uh", "like", "you know", "sort of", "kind of",
                    "maybe", "probably", "I guess", "I think", "not sure"
                ]
            }
        
    @functools.lru_cache(maxsize=128)
    def analyze_sentiment(self, text: str, 
                        include_emotions: bool = False) -> Dict[str, Any]:
        """
        Analyze sentiment of text using available engines
        
        Args:
            text: The text to analyze
            include_emotions: Whether to include detailed emotion analysis
            
        Returns:
            Dictionary with sentiment scores and analysis
        """
        if not text or not isinstance(text, str):
            return {
                "sentiment": "neutral",
                "score": 0.0,
                "compound": 0.0,
                "positive": 0.0,
                "negative": 0.0,
                "neutral": 1.0,
                "confidence": 0.0
            }
        
        # Check cache first
        cache_key = f"{hashlib.md5(text.encode()).hexdigest()}_{include_emotions}"
        cached_result = self._check_cache(cache_key)
        if cached_result:
            return cached_result
            
        results = {}
        
        # Run each available engine
        if "vader" in self.available_engines:
            vader_result = self._analyze_with_vader(text)
            results["vader"] = vader_result
            
        if "textblob" in self.available_engines:
            textblob_result = self._analyze_with_textblob(text)
            results["textblob"] = textblob_result
            
        if "transformers" in self.available_engines:
            transformer_result = self._analyze_with_transformers(text)
            results["transformers"] = transformer_result
            
        # Combine results from different engines
        combined_result = self._combine_results(results)
        
        # Add domain-specific context
        combined_result = self._apply_domain_context(text, combined_result)
        
        # Add emotions if requested
        if include_emotions and "emotion_transformer" in self.available_engines:
            emotions = self._analyze_emotions(text)
            combined_result["emotions"] = emotions
        
        # Cache the result
        self._cache_result(cache_key, combined_result)
        
        return combined_result
    
    def _analyze_with_vader(self, text: str) -> Dict[str, float]:
        """Analyze text sentiment using NLTK VADER"""
        try:
            scores = self.sia.polarity_scores(text)
            return {
                "compound": scores["compound"],
                "positive": scores["pos"],
                "negative": scores["neg"],
                "neutral": scores["neu"],
                "sentiment": self._get_sentiment_label(scores["compound"]),
                "confidence": abs(scores["compound"])
            }
        except Exception as e:
            self.logger.error(f"Error in VADER analysis: {str(e)}")
            return {
                "compound": 0.0,
                "positive": 0.0,
                "negative": 0.0,
                "neutral": 1.0,
                "sentiment": "neutral",
                "confidence": 0.0
            }
    
    def _analyze_with_textblob(self, text: str) -> Dict[str, float]:
        """Analyze text sentiment using TextBlob"""
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            # Convert TextBlob polarity (-1 to 1) to VADER-like compound
            compound = polarity
            
            # Convert polarity to positive/negative/neutral scores
            if polarity > 0:
                positive = polarity
                negative = 0.0
                neutral = 1.0 - positive
            elif polarity < 0:
                positive = 0.0
                negative = abs(polarity)
                neutral = 1.0 - negative
            else:
                positive = 0.0
                negative = 0.0
                neutral = 1.0
                
            return {
                "compound": compound,
                "positive": positive,
                "negative": negative,
                "neutral": neutral,
                "subjectivity": subjectivity,
                "sentiment": self._get_sentiment_label(compound),
                "confidence": abs(compound) * subjectivity
            }
        except Exception as e:
            self.logger.error(f"Error in TextBlob analysis: {str(e)}")
            return {
                "compound": 0.0,
                "positive": 0.0,
                "negative": 0.0,
                "neutral": 1.0,
                "subjectivity": 0.0,
                "sentiment": "neutral",
                "confidence": 0.0
            }
    
    def _analyze_with_transformers(self, text: str) -> Dict[str, float]:
        """Analyze text sentiment using transformer models"""
        try:
            # Truncate text if needed
            if len(text) > 512:
                text = text[:512]
                
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            # Get probabilities
            probs = F.softmax(outputs.logits, dim=1)
            
            # For distilbert-sst2: [negative, positive]
            neg_prob = probs[0][0].item()
            pos_prob = probs[0][1].item()
            
            # Convert to compound score (-1 to 1)
            compound = pos_prob - neg_prob
            
            # Calculate neutral score
            neutral = 1.0 - (pos_prob + neg_prob) / 2
            
            return {
                "compound": compound,
                "positive": pos_prob,
                "negative": neg_prob,
                "neutral": neutral,
                "sentiment": self._get_sentiment_label(compound),
                "confidence": max(pos_prob, neg_prob)
            }
        except Exception as e:
            self.logger.error(f"Error in transformer analysis: {str(e)}")
            return {
                "compound": 0.0,
                "positive": 0.0,
                "negative": 0.0,
                "neutral": 1.0,
                "sentiment": "neutral",
                "confidence": 0.0
            }
    
    def _analyze_emotions(self, text: str) -> Dict[str, float]:
        """Analyze emotions in text using transformer models"""
        try:
            # Truncate text if needed
            if len(text) > 512:
                text = text[:512]
                
            inputs = self.emotion_tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            with torch.no_grad():
                outputs = self.emotion_model(**inputs)
                
            # Get probabilities
            probs = F.softmax(outputs.logits, dim=1)[0]
            
            # Get top emotions
            top_emotions = {}
            for i in range(len(probs)):
                emotion_name = self.emotion_mapping.get(i, f"emotion_{i}")
                emotion_score = probs[i].item()
                
                # Only include emotions with non-negligible scores
                if emotion_score > 0.05:
                    top_emotions[emotion_name] = emotion_score
            
            # Sort emotions by score
            sorted_emotions = {k: v for k, v in sorted(
                top_emotions.items(), key=lambda item: item[1], reverse=True
            )}
            
            # Simplify to primary emotion categories for easier use
            simplified_emotions = self._simplify_emotions(sorted_emotions)
            
            return {
                "detailed": sorted_emotions,
                "primary": simplified_emotions
            }
        except Exception as e:
            self.logger.error(f"Error in emotion analysis: {str(e)}")
            return {
                "detailed": {"neutral": 1.0},
                "primary": {"neutral": 1.0}
            }
    
    def _simplify_emotions(self, emotions: Dict[str, float]) -> Dict[str, float]:
        """Simplify detailed emotions into primary categories"""
        # Map of detailed emotions to primary categories
        emotion_mapping = {
            "joy": ["joy", "amusement", "approval", "excitement", "gratitude", 
                   "love", "optimism", "relief", "pride", "admiration"],
            "sadness": ["sadness", "disappointment", "grief", "remorse"],
            "anger": ["anger", "annoyance", "disapproval", "disgust"],
            "fear": ["fear", "nervousness", "embarrassment"],
            "surprise": ["surprise", "realization", "confusion", "curiosity"],
            "neutral": ["neutral"]
        }
        
        # Initialize primary emotions
        primary = {
            "joy": 0.0,
            "sadness": 0.0,
            "anger": 0.0,
            "fear": 0.0,
            "surprise": 0.0,
            "neutral": 0.0
        }
        
        # Aggregate detailed emotions into primary categories
        for emotion, score in emotions.items():
            for primary_emotion, detailed_list in emotion_mapping.items():
                if emotion in detailed_list:
                    primary[primary_emotion] += score
                    break
        
        # Normalize so values sum to 1
        total = sum(primary.values())
        if total > 0:
            primary = {k: v/total for k, v in primary.items()}
            
        # Only include non-negligible emotions
        primary = {k: v for k, v in primary.items() if v > 0.05}
        
        # Sort by score
        primary = {k: v for k, v in sorted(
            primary.items(), key=lambda item: item[1], reverse=True
        )}
        
        return primary
    
    def _combine_results(self, results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Combine results from multiple engines using weighted average"""
        if not results:
            return {
                "sentiment": "neutral",
                "score": 0.0,
                "compound": 0.0,
                "positive": 0.0,
                "negative": 0.0,
                "neutral": 1.0,
                "confidence": 0.0
            }
            
        # Initialize combined scores
        combined = {
            "compound": 0.0,
            "positive": 0.0,
            "negative": 0.0,
            "neutral": 0.0,
            "confidence": 0.0
        }
        
        # Calculate total weight
        total_weight = 0.0
        for engine in results:
            if engine in self.engine_weights:
                total_weight += self.engine_weights[engine]
        
        if total_weight == 0:
            total_weight = len(results)
            
        # Combine scores with weights
        for engine, result in results.items():
            weight = self.engine_weights.get(engine, 1.0) / total_weight
            
            combined["compound"] += result["compound"] * weight
            combined["positive"] += result["positive"] * weight
            combined["negative"] += result["negative"] * weight
            combined["neutral"] += result["neutral"] * weight
            combined["confidence"] += result.get("confidence", abs(result["compound"])) * weight
        
        # Add derived fields
        combined["score"] = combined["compound"]
        combined["sentiment"] = self._get_sentiment_label(combined["compound"])
        
        # Add sources
        combined["sources"] = list(results.keys())
        
        return combined
    
    def _apply_domain_context(self, text: str, result: Dict[str, Any]) -> Dict[str, Any]:
        """Apply domain-specific context to sentiment results"""
        # Skip if no domain modifiers
        if not hasattr(self, 'domain_modifiers'):
            return result
            
        # Count domain-specific terms
        positive_terms = 0
        negative_terms = 0
        
        for term in self.domain_modifiers.get("positive_boost", []):
            positive_terms += len(re.findall(r'\b' + re.escape(term) + r'\b', text.lower()))
            
        for term in self.domain_modifiers.get("negative_boost", []):
            negative_terms += len(re.findall(r'\b' + re.escape(term) + r'\b', text.lower()))
        
        # Apply domain adjustments
        if positive_terms > 0 or negative_terms > 0:
            # Calculate adjustment factor based on term density
            text_length = len(text.split())
            term_density = (positive_terms - negative_terms) / max(text_length, 1)
            
            # Adjust compound score (max adjustment ±0.2)
            adjustment = min(max(term_density * 2, -0.2), 0.2)
            result["compound"] = min(max(result["compound"] + adjustment, -1.0), 1.0)
            
            # Recalculate sentiment and score
            result["score"] = result["compound"]
            result["sentiment"] = self._get_sentiment_label(result["compound"])
            
            # Note the adjustment
            result["domain_adjusted"] = True
            result["domain_adjustment"] = adjustment
            
        return result
    
    def _get_sentiment_label(self, compound: float) -> str:
        """Convert compound score to sentiment label"""
        if compound >= 0.05:
            return "positive"
        elif compound <= -0.05:
            return "negative"
        else:
            return "neutral"
    
    def _check_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Check if result is in cache"""
        if not self.cache_dir:
            return None
            
        cache_file = os.path.join(self.cache_dir, f"sentiment_{cache_key}.json")
        
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r') as f:
                    cached = json.load(f)
                    
                # Check if cache has expired
                if time.time() - cached.get("timestamp", 0) < self.cache_ttl:
                    return cached.get("result")
            except Exception as e:
                self.logger.error(f"Error reading cache: {str(e)}")
                
        return None
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]):
        """Cache sentiment analysis result"""
        if not self.cache_dir:
            return
            
        cache_file = os.path.join(self.cache_dir, f"sentiment_{cache_key}.json")
        
        try:
            with open(cache_file, 'w') as f:
                json.dump({
                    "timestamp": time.time(),
                    "result": result
                }, f)
        except Exception as e:
            self.logger.error(f"Error writing cache: {str(e)}")
            
    def analyze_confidence(self, text: str) -> Dict[str, Any]:
        """
        Analyze text for confidence markers
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with confidence analysis
        """
        # Confidence weakeners (hedging language)
        weakeners = [
            r'\bI think\b', r'\bperhaps\b', r'\bmaybe\b', r'\bpossibly\b',
            r'\bprobably\b', r'\bmight\b', r'\bcould\b', r'\bsort of\b',
            r'\bkind of\b', r'\ba bit\b', r'\bsomewhat\b', r'\bseems\b',
            r'\bappears\b', r'\bI guess\b', r'\bI suppose\b', r'\bnot sure\b'
        ]
        
        # Confidence strengtheners (assertive language)
        strengtheners = [
            r'\bdefinitely\b', r'\babsolutely\b', r'\bcertainly\b',
            r'\bwithout doubt\b', r'\bI know\b', r'\bI am confident\b',
            r'\bproven\b', r'\bdemonstrated\b', r'\bclearly\b', r'\bsurely\b',
            r'\bexactly\b', r'\bprecisely\b', r'\bundoubtedly\b', r'\balways\b'
        ]
        
        # Hesitation markers
        hesitations = [
            r'\bum\b', r'\buh\b', r'\ber\b', r'\bhmm\b', r'\byou know\b',
            r'\blike\b', r'\bso\b', r'\bactually\b', r'\bbasically\b'
        ]
        
        # Count markers
        weakener_count = sum(len(re.findall(pattern, text, re.IGNORECASE)) for pattern in weakeners)
        strengthener_count = sum(len(re.findall(pattern, text, re.IGNORECASE)) for pattern in strengtheners)
        hesitation_count = sum(len(re.findall(pattern, text, re.IGNORECASE)) for pattern in hesitations)
        
        # Calculate words and sentence length
        words = text.split()
        word_count = len(words)
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
        
        # Average sentence length
        avg_sentence_length = word_count / max(len(sentences), 1)
        
        # Confidence score calculation
        # Base score from 0.5
        confidence_score = 0.5
        
        # Adjust for markers (normalize by text length)
        if word_count > 0:
            # Weakeners reduce confidence
            confidence_score -= (weakener_count / word_count) * 0.3
            
            # Strengtheners increase confidence
            confidence_score += (strengthener_count / word_count) * 0.3
            
            # Hesitations reduce confidence
            confidence_score -= (hesitation_count / word_count) * 0.2
            
            # Very short or very long sentences tend to indicate less confidence
            ideal_length = 15  # words
            sentence_factor = max(0, 1 - abs(avg_sentence_length - ideal_length) / 10) * 0.1
            confidence_score += sentence_factor
        
        # Ensure score is between 0 and 1
        confidence_score = max(0.0, min(1.0, confidence_score))
        
        # Determine confidence level
        if confidence_score >= 0.8:
            confidence_level = "high"
        elif confidence_score >= 0.5:
            confidence_level = "moderate"
        elif confidence_score >= 0.3:
            confidence_level = "low"
        else:
            confidence_level = "very low"
            
        return {
            "score": confidence_score,
            "level": confidence_level,
            "weakeners": weakener_count,
            "strengtheners": strengthener_count,
            "hesitations": hesitation_count,
            "markers": {
                "weakeners": [w for w in weakeners if re.search(w, text, re.IGNORECASE)],
                "strengtheners": [s for s in strengtheners if re.search(s, text, re.IGNORECASE)],
                "hesitations": [h for h in hesitations if re.search(h, text, re.IGNORECASE)]
            }
        }
    
    def analyze_career_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze career-specific text (resume, cover letter, interview)
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with comprehensive analysis including sentiment,
            confidence, career-specific markers, and recommendations
        """
        # Basic sentiment analysis
        sentiment = self.analyze_sentiment(text, include_emotions=True)
        
        # Confidence analysis
        confidence = self.analyze_confidence(text)
        
        # Career-specific analysis
        career_markers = self._detect_career_markers(text)
        
        # Combine all analysis 
        result = {
            "sentiment": sentiment,
            "confidence": confidence,
            "career_markers": career_markers,
            "recommendations": self._generate_recommendations(sentiment, confidence, career_markers)
        }
        
        return result
    
    def _detect_career_markers(self, text: str) -> Dict[str, Any]:
        """Detect career-specific language markers"""
        if not SPACY_AVAILABLE or not nlp:
            # Fallback to regex if spaCy not available
            return self._detect_career_markers_regex(text)
            
        try:
            doc = nlp(text)
            
            # Count entity occurrences
            entities = {}
            for ent in doc.ents:
                if ent.label_.startswith("CAREER_"):
                    category = ent.label_.replace("CAREER_", "").lower()
                    if category not in entities:
                        entities[category] = []
                    entities[category].append(ent.text)
            
            # Convert to counts and unique terms
            markers = {}
            for category, terms in entities.items():
                markers[category] = {
                    "count": len(terms),
                    "terms": list(set(terms))
                }
                
            return markers
            
        except Exception as e:
            self.logger.error(f"Error in career marker detection: {str(e)}")
            return self._detect_career_markers_regex(text)
    
    def _detect_career_markers_regex(self, text: str) -> Dict[str, Any]:
        """Detect career markers using regex (fallback method)"""
        markers = {}
        
        for category, terms in self.career_terms.items():
            found_terms = []
            for term in terms:
                if re.search(r'\b' + re.escape(term) + r'\b', text, re.IGNORECASE):
                    found_terms.append(term)
                    
            if found_terms:
                markers[category] = {
                    "count": len(found_terms),
                    "terms": found_terms
                }
                
        return markers
    
    def _generate_recommendations(self, 
                               sentiment: Dict[str, Any],
                               confidence: Dict[str, Any],
                               markers: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        # Sentiment-based recommendations
        if sentiment["sentiment"] == "negative":
            recommendations.append("Consider using more positive language to describe your career achievements and skills.")
            
        if sentiment["sentiment"] == "neutral" and sentiment["score"] < 0.02:
            recommendations.append("Your language is very neutral. Try adding more enthusiastic or descriptive terms.")
            
        # Confidence-based recommendations
        if confidence["level"] == "low" or confidence["level"] == "very low":
            recommendations.append("Use more confident language by reducing hesitations and hedging phrases.")
            
            if confidence["hesitations"] > 2:
                recommendations.append("Reduce filler words like 'um', 'uh', and 'you know'.")
                
            if confidence["weakeners"] > 2:
                recommendations.append("Replace uncertain phrases ('I think', 'maybe', 'sort of') with more assertive language.")
        
        # Career marker recommendations
        positive_markers = markers.get("positive_indicators", {}).get("count", 0)
        negative_markers = markers.get("negative_indicators", {}).get("count", 0)
        
        if negative_markers > positive_markers:
            recommendations.append("Replace negative descriptors with more positive skill and achievement language.")
            
        if markers.get("interview_negative", {}).get("count", 0) > 2:
            recommendations.append("Your language suggests interview nervousness. Practice responding with more confident phrasing.")
            
        # Emotion-based recommendations
        if "emotions" in sentiment:
            primary_emotions = sentiment["emotions"]["primary"]
            
            if primary_emotions.get("sadness", 0) > 0.3:
                recommendations.append("Your tone conveys sadness or disappointment. Focus on optimistic career perspectives.")
                
            if primary_emotions.get("fear", 0) > 0.3:
                recommendations.append("Your language indicates anxiety. Frame challenges as opportunities for growth.")
                
            if primary_emotions.get("anger", 0) > 0.2:
                recommendations.append("Consider softening negative expressions about past experiences to maintain professionalism.")
        
        return recommendations
