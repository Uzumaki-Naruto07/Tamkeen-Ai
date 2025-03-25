import os
import time
import base64
import tempfile
from typing import Dict, List, Tuple, Any, Optional, Union
import json
import math
import numpy as np
from datetime import datetime
import io

# Optional dependencies - allow graceful fallback if not available
try:
    import librosa
    import librosa.display
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

try:
    import soundfile as sf
    SOUNDFILE_AVAILABLE = True
except ImportError:
    SOUNDFILE_AVAILABLE = False

try:
    import speech_recognition as sr
    SPEECHRECOGNITION_AVAILABLE = True
except ImportError:
    SPEECHRECOGNITION_AVAILABLE = False

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


class VoiceEmotionAnalyzer:
    """
    Analyzes emotions, tone, and qualities from voice recordings
    Used for interview practice feedback and communication assessment
    """
    
    def __init__(self, analysis_method: str = "auto", model_path: Optional[str] = None):
        """
        Initialize voice emotion analyzer
        
        Args:
            analysis_method: Analysis method - "acoustic", "ml", "combined", or "auto"
            model_path: Optional path to custom model file
        """
        self.analysis_method = analysis_method
        self.available_methods = []
        self.initialized = False
        self.model = None
        self.recognizer = None
        
        # Check available methods
        if LIBROSA_AVAILABLE and SOUNDFILE_AVAILABLE:
            self.available_methods.append("acoustic")
            
        if TF_AVAILABLE and LIBROSA_AVAILABLE:
            self.available_methods.append("ml")
            
        if TF_AVAILABLE and LIBROSA_AVAILABLE and SOUNDFILE_AVAILABLE:
            self.available_methods.append("combined")
            
        # If no method is available, raise warning
        if not self.available_methods:
            print("WARNING: No voice analysis methods available. Please install librosa, soundfile, and tensorflow.")
            return
            
        # Determine method to use based on what's available
        if analysis_method == "auto":
            # Prefer methods in this order: combined > ml > acoustic
            if "combined" in self.available_methods:
                self.analysis_method = "combined"
            elif "ml" in self.available_methods:
                self.analysis_method = "ml"
            else:
                self.analysis_method = "acoustic"
        elif analysis_method not in self.available_methods:
            print(f"WARNING: Requested method '{analysis_method}' is not available. Using '{self.available_methods[0]}' instead.")
            self.analysis_method = self.available_methods[0]
        
        # Initialize speech recognizer if available
        if SPEECHRECOGNITION_AVAILABLE:
            try:
                if 'sr' in locals():
                    self.recognizer = sr.Recognizer()
                else:
                    self.recognizer = sr.Recognizer()
            except Exception as e:
                print(f"WARNING: Failed to initialize speech recognition: {str(e)}")
                self.recognizer = None
                
        # Initialize ML model if needed
        if self.analysis_method in ["ml", "combined"]:
            self._initialize_model(model_path)
        else:
            self.initialized = True
            
    def _initialize_model(self, model_path: Optional[str] = None):
        """Initialize emotion classification model"""
        if not TF_AVAILABLE:
            print("WARNING: TensorFlow not available, can't load ML model")
            return
            
        try:
            # If model path is provided, load from that path
            if model_path and os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                self.initialized = True
                return
                
            # Check for model in standard locations
            model_dirs = [
                os.path.join(os.path.dirname(__file__), "models"),
                os.path.join(os.path.expanduser("~"), ".tamkeen", "models")
            ]
            
            for model_dir in model_dirs:
                potential_path = os.path.join(model_dir, "voice_emotion_model.h5")
                if os.path.exists(potential_path):
                    self.model = tf.keras.models.load_model(potential_path)
                    self.initialized = True
                    return
                    
            # If no existing model found, use a simple model
            print("WARNING: No pre-trained emotion model found. Using fallback approach.")
            self.initialized = True
            
        except Exception as e:
            print(f"ERROR initializing emotion model: {str(e)}")
            self.initialized = False
            
    def analyze_voice(self, 
                   audio_data: Union[str, bytes, np.ndarray, io.BytesIO], 
                   sample_rate: Optional[int] = None) -> Dict[str, Any]:
        """
        Analyze voice emotion from audio data
        
        Args:
            audio_data: Audio as file path, bytes, numpy array, or BytesIO
            sample_rate: Optional sample rate for raw audio data
            
        Returns:
            Dictionary with emotion analysis, tone qualities, and speech metrics
        """
        if not self.initialized:
            return {"error": "Voice analysis not initialized properly"}
            
        # Load audio
        try:
            y, sr = self._load_audio(audio_data, sample_rate)
        except Exception as e:
            return {"error": f"Failed to load audio: {str(e)}"}
            
        # Ensure we have valid audio
        if y is None or len(y) == 0:
            return {"error": "Invalid or empty audio data"}
            
        # Get speech to text if recognizer is available
        transcript = ""
        if self.recognizer is not None:
            try:
                # Convert audio to format recognized by speech_recognition
                if SPEECHRECOGNITION_AVAILABLE:
                    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
                        if SOUNDFILE_AVAILABLE:
                            sf.write(tmp.name, y, sr)
                            with sr.AudioFile(tmp.name) as source:
                                audio = self.recognizer.record(source)
                                transcript = self.recognizer.recognize_google(audio)
                        else:
                            transcript = ""
            except Exception as e:
                print(f"Speech recognition failed: {str(e)}")
                transcript = ""
        
        # Process based on selected method
        if self.analysis_method == "acoustic":
            analysis = self._analyze_acoustic_features(y, sr, transcript)
        elif self.analysis_method == "ml":
            analysis = self._analyze_with_ml(y, sr, transcript)
        else:  # combined
            acoustic_analysis = self._analyze_acoustic_features(y, sr, transcript)
            ml_analysis = self._analyze_with_ml(y, sr, transcript)
            
            # Combine the results
            analysis = self._combine_analyses(acoustic_analysis, ml_analysis)
        
        # Add metadata
        analysis["timestamp"] = datetime.now().isoformat()
        analysis["audio_length"] = len(y) / sr if sr else 0
        analysis["sample_rate"] = sr
        
        if transcript:
            analysis["transcript"] = transcript
            analysis["word_count"] = len(transcript.split())
            analysis["speech_rate"] = analysis["word_count"] / (len(y) / sr) * 60 if sr else 0  # words per minute
            
        return analysis
        
    def analyze_interview_audio(self, 
                             audio_segments: List[Union[str, bytes, np.ndarray]], 
                             timestamps: Optional[List[float]] = None) -> Dict[str, Any]:
        """
        Analyze emotions across a sequence of audio segments from an interview
        
        Args:
            audio_segments: List of audio files or data
            timestamps: Optional list of timestamps for each segment
            
        Returns:
            Dictionary with emotional progression, patterns, and overall assessment
        """
        if not self.initialized:
            return {"error": "Voice analysis not initialized properly"}
            
        # Initialize results
        results = []
        
        # Process each audio segment
        for i, audio_data in enumerate(audio_segments):
            timestamp = timestamps[i] if timestamps and i < len(timestamps) else i
            
            try:
                # Analyze this segment
                result = self.analyze_voice(audio_data)
                
                # Add timestamp
                result["segment_index"] = i
                result["timestamp"] = timestamp
                
                results.append(result)
                
            except Exception as e:
                print(f"Error processing audio segment {i}: {str(e)}")
                continue
                
        # If no valid results, return error
        if not results:
            return {"error": "No valid voice analyses in the provided segments"}
            
        # Analyze results across the interview
        analysis = self._analyze_voice_sequence(results)
        
        return analysis
        
    def _analyze_voice_sequence(self, analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze a sequence of voice analyses to identify patterns"""
        if not analyses:
            return {"error": "No analyses to process"}
            
        # Extract emotions across time
        emotion_timeline = []
        confidence_values = []
        speech_rates = []
        pitch_values = []
        energy_values = []
        
        for analysis in analyses:
            emotions = analysis.get("emotions", {})
            if emotions:
                emotion_timeline.append({
                    "timestamp": analysis.get("timestamp", 0),
                    "emotions": emotions
                })
                
            # Track speech metrics
            if "speech_rate" in analysis:
                speech_rates.append(analysis["speech_rate"])
                
            if "confidence" in analysis:
                confidence_values.append(analysis["confidence"])
                
            if "pitch_stats" in analysis:
                pitch_values.append(analysis["pitch_stats"].get("mean", 0))
                
            if "energy" in analysis:
                energy_values.append(analysis["energy"])
        
        # Calculate emotion progression
        emotion_progression = {}
        emotion_keys = set()
        
        for point in emotion_timeline:
            for emotion, value in point["emotions"].items():
                emotion_keys.add(emotion)
                if emotion not in emotion_progression:
                    emotion_progression[emotion] = []
                emotion_progression[emotion].append({
                    "timestamp": point["timestamp"],
                    "value": value
                })
        
        # Calculate speech metric summaries
        speech_metrics = {}
        
        if speech_rates:
            speech_metrics["speech_rate"] = {
                "mean": sum(speech_rates) / len(speech_rates),
                "min": min(speech_rates),
                "max": max(speech_rates),
                "trend": self._calculate_trend(speech_rates)
            }
            
        if pitch_values:
            speech_metrics["pitch"] = {
                "mean": sum(pitch_values) / len(pitch_values),
                "trend": self._calculate_trend(pitch_values)
            }
            
        if energy_values:
            speech_metrics["energy"] = {
                "mean": sum(energy_values) / len(energy_values),
                "trend": self._calculate_trend(energy_values)
            }
            
        # Identify dominant emotion for the interview
        dominant_emotions = []
        for analysis in analyses:
            if "dominant_emotion" in analysis:
                dominant_emotions.append(analysis["dominant_emotion"])
                
        if dominant_emotions:
            emotion_counts = {}
            for emotion in dominant_emotions:
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                
            most_frequent_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "neutral"
        else:
            most_frequent_emotion = "neutral"
            
        # Generate feedback and insights
        insights = self._generate_voice_insights(analyses, most_frequent_emotion, speech_metrics)
        
        # Compile results
        return {
            "overall_dominant_emotion": most_frequent_emotion,
            "emotion_progression": emotion_progression,
            "speech_metrics": speech_metrics,
            "interview_segments_analyzed": len(analyses),
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }
        
    def _generate_voice_insights(self, 
                              analyses: List[Dict[str, Any]],
                              dominant_emotion: str,
                              speech_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate insights and feedback from voice analysis"""
        insights = []
        
        # Check speech rate
        if "speech_rate" in speech_metrics:
            rate = speech_metrics["speech_rate"]["mean"]
            if rate > 180:
                insights.append({
                    "type": "improvement",
                    "aspect": "speech_rate",
                    "insight": "Your speaking pace is quite fast, which may make it difficult for interviewers to follow.",
                    "suggestion": "Try to slow down your speaking pace slightly for better clarity."
                })
            elif rate < 120:
                insights.append({
                    "type": "improvement",
                    "aspect": "speech_rate",
                    "insight": "Your speaking pace is somewhat slow, which might affect engagement.",
                    "suggestion": "Try to increase your speaking pace slightly to maintain engagement."
                })
            else:
                insights.append({
                    "type": "strength",
                    "aspect": "speech_rate",
                    "insight": "Your speaking pace is well balanced, making it easy to follow your points."
                })
                
        # Check pitch variation
        if "pitch" in speech_metrics:
            pitch_trend = speech_metrics["pitch"]["trend"]
            if abs(pitch_trend) < 0.1:
                insights.append({
                    "type": "improvement",
                    "aspect": "vocal_variety",
                    "insight": "Your voice shows limited pitch variation, which can sound monotonous.",
                    "suggestion": "Try to add more vocal variety to emphasize key points and maintain interest."
                })
            else:
                insights.append({
                    "type": "strength",
                    "aspect": "vocal_variety",
                    "insight": "Your voice shows good pitch variation, helping to emphasize important points."
                })
                
        # Check energy level
        if "energy" in speech_metrics:
            energy = speech_metrics["energy"]["mean"]
            if energy < 0.3:
                insights.append({
                    "type": "improvement",
                    "aspect": "energy",
                    "insight": "Your energy level appears low, which might be perceived as lack of enthusiasm.",
                    "suggestion": "Try to speak with more energy and enthusiasm, especially when discussing your accomplishments."
                })
            elif energy > 0.7:
                insights.append({
                    "type": "neutral",
                    "aspect": "energy",
                    "insight": "Your energy level is high, which shows enthusiasm but ensure it's appropriate for the context."
                })
            else:
                insights.append({
                    "type": "strength",
                    "aspect": "energy",
                    "insight": "Your energy level is well balanced, showing appropriate enthusiasm."
                })
                
        # Check emotional tone
        if dominant_emotion == "neutral":
            insights.append({
                "type": "neutral",
                "aspect": "emotional_tone",
                "insight": "Your voice conveys a predominantly neutral emotional tone.",
                "suggestion": "Consider adding a bit more positive inflection when discussing achievements."
            })
        elif dominant_emotion == "happy" or dominant_emotion == "positive":
            insights.append({
                "type": "strength",
                "aspect": "emotional_tone",
                "insight": "Your voice conveys positive emotion, which helps build rapport."
            })
        elif dominant_emotion in ["sad", "angry", "negative"]:
            insights.append({
                "type": "improvement",
                "aspect": "emotional_tone",
                "insight": f"Your voice conveys a predominantly {dominant_emotion} tone, which may impact the interview atmosphere.",
                "suggestion": "Try to maintain a more positive or neutral tone, even when discussing challenges."
            })
            
        return insights
        
    def _analyze_acoustic_features(self, y: np.ndarray, sr: int, transcript: str = "") -> Dict[str, Any]:
        """Analyze acoustic features using librosa"""
        if not LIBROSA_AVAILABLE:
            return {"error": "Librosa not available for acoustic analysis"}
            
        try:
            # Calculate pitch (fundamental frequency) features
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            pitches = pitches[pitches > 0]
            pitch_stats = {}
            
            if len(pitches) > 0:
                pitch_stats = {
                    "mean": float(np.mean(pitches)),
                    "std": float(np.std(pitches)),
                    "min": float(np.min(pitches)),
                    "max": float(np.max(pitches))
                }
                
            # Calculate voice energy/volume
            rms = librosa.feature.rms(y=y)[0]
            energy = float(np.mean(rms))
            
            # Calculate speaking rate (based on detected onsets)
            onsets = librosa.onset.onset_detect(y=y, sr=sr)
            speaking_rate = len(onsets) / (len(y) / sr) if len(y) > 0 else 0
            
            # Calculate voice stability features
            spectral_bandwidth = np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
            spectral_contrast = np.mean(librosa.feature.spectral_contrast(y=y, sr=sr))
            
            # Calculate MFCC features for voice quality
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_means = np.mean(mfccs, axis=1).tolist()
            mfcc_vars = np.var(mfccs, axis=1).tolist()
            
            # Use MFCC features to estimate emotion - very simplified approach
            # This is a highly simplified model and should be replaced with proper ML
            if mfcc_means and len(mfcc_means) >= 2:
                # Extremely simplified emotion mapping based on first two MFCCs
                # This is not scientifically valid, just a placeholder
                mfcc1 = mfcc_means[0]
                mfcc2 = mfcc_means[1]
                
                emotions = {
                    "neutral": 0.5,
                    "happy": 0.1,
                    "sad": 0.1,
                    "angry": 0.1,
                    "fearful": 0.1,
                    "disgusted": 0.05,
                    "surprised": 0.05
                }
                
                # Adjust based on rough heuristics
                if mfcc1 > 0:
                    emotions["happy"] += 0.2
                    emotions["neutral"] -= 0.1
                    emotions["sad"] -= 0.1
                else:
                    emotions["sad"] += 0.2
                    emotions["neutral"] -= 0.1
                    emotions["happy"] -= 0.1
                    
                if energy > 0.5 and mfcc2 < 0:
                    emotions["angry"] += 0.2
                    emotions["neutral"] -= 0.1
                    emotions["sad"] -= 0.1
                    
                # Normalize to ensure sum is 1.0
                total = sum(emotions.values())
                emotions = {k: v/total for k, v in emotions.items()}
                
                # Determine dominant emotion
                dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
                confidence = emotions[dominant_emotion]
            else:
                emotions = {
                    "neutral": 0.7,
                    "happy": 0.1,
                    "sad": 0.05,
                    "angry": 0.05,
                    "fearful": 0.03,
                    "disgusted": 0.02,
                    "surprised": 0.05
                }
                dominant_emotion = "neutral"
                confidence = 0.7
                
            # Generate tone qualities
            tone_qualities = {
                "clarity": self._estimate_clarity(spectral_contrast),
                "warmth": self._estimate_warmth(mfcc_means if mfcc_means else [0]),
                "assertiveness": self._estimate_assertiveness(energy, pitch_stats.get("mean", 0)),
                "variability": self._estimate_variability(pitch_stats.get("std", 0), np.std(rms) if len(rms) > 0 else 0)
            }
            
            return {
                "emotions": emotions,
                "dominant_emotion": dominant_emotion,
                "confidence": confidence,
                "pitch_stats": pitch_stats,
                "energy": energy,
                "speaking_rate": speaking_rate,
                "tone_qualities": tone_qualities,
                "spectral_features": {
                    "bandwidth": float(spectral_bandwidth),
                    "contrast": float(spectral_contrast) if isinstance(spectral_contrast, (int, float)) else 0
                },
                "mfcc_features": {
                    "means": mfcc_means,
                    "variances": mfcc_vars
                },
                "method": "acoustic"
            }
            
        except Exception as e:
            return {"error": f"Acoustic analysis error: {str(e)}"}
            
    def _analyze_with_ml(self, y: np.ndarray, sr: int, transcript: str = "") -> Dict[str, Any]:
        """Analyze voice emotion using ML model"""
        # If no model is available, fall back to acoustic
        if self.model is None or not TF_AVAILABLE:
            return self._analyze_acoustic_features(y, sr, transcript)
            
        try:
            # Extract features for ML model
            features = self._extract_ml_features(y, sr)
            
            # Since we don't have an actual trained model here,
            # we'll return a placeholder result
            # In a real implementation, you'd load your model and get predictions
            emotions = {
                "neutral": 0.6,
                "happy": 0.2,
                "sad": 0.05,
                "angry": 0.05,
                "fearful": 0.05,
                "disgusted": 0.02,
                "surprised": 0.03
            }
            dominant_emotion = "neutral"
            confidence = 0.6
            
            # Use acoustic features for additional metrics
            acoustic_analysis = self._analyze_acoustic_features(y, sr, transcript)
            
            return {
                "emotions": emotions,
                "dominant_emotion": dominant_emotion,
                "confidence": confidence,
                "pitch_stats": acoustic_analysis.get("pitch_stats", {}),
                "energy": acoustic_analysis.get("energy", 0),
                "speaking_rate": acoustic_analysis.get("speaking_rate", 0),
                "tone_qualities": acoustic_analysis.get("tone_qualities", {}),
                "method": "ml"
            }
            
        except Exception as e:
            # Fall back to acoustic analysis on error
            print(f"ML analysis failed, falling back to acoustic: {str(e)}")
            return self._analyze_acoustic_features(y, sr, transcript)
    
    def _extract_ml_features(self, y: np.ndarray, sr: int) -> np.ndarray:
        """Extract features for ML model"""
        # This is a placeholder for feature extraction
        # In a real implementation, you'd extract proper features for your model
        
        # Get MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_means = np.mean(mfccs, axis=1)
        mfcc_vars = np.var(mfccs, axis=1)
        
        # Get chroma
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_means = np.mean(chroma, axis=1)
        
        # Get spectral features
        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        contrast_means = np.mean(spectral_contrast, axis=1)
        
        # Combine features
        features = np.concatenate([mfcc_means, mfcc_vars, chroma_means, contrast_means])
        
        return features
            
    def _combine_analyses(self, acoustic: Dict[str, Any], ml: Dict[str, Any]) -> Dict[str, Any]:
        """Combine acoustic and ML analyses with appropriate weighting"""
        # Handle error cases
        if "error" in acoustic:
            return ml
        if "error" in ml:
            return acoustic
            
        # Start with ML results, which are typically more accurate for emotions
        combined = ml.copy()
        
        # Weight emotions (favor ML but include acoustic)
        ml_emotions = ml.get("emotions", {})
        acoustic_emotions = acoustic.get("emotions", {})
        
        if ml_emotions and acoustic_emotions:
            combined_emotions = {}
            all_keys = set(ml_emotions.keys()).union(acoustic_emotions.keys())
            
            for key in all_keys:
                ml_value = ml_emotions.get(key, 0)
                acoustic_value = acoustic_emotions.get(key, 0)
                combined_emotions[key] = ml_value * 0.7 + acoustic_value * 0.3
                
            # Renormalize
            total = sum(combined_emotions.values())
            combined_emotions = {k: v/total for k, v in combined_emotions.items()}
            
            # Update dominant emotion
            dominant_emotion = max(combined_emotions.items(), key=lambda x: x[1])[0]
            confidence = combined_emotions[dominant_emotion]
            
            combined["emotions"] = combined_emotions
            combined["dominant_emotion"] = dominant_emotion
            combined["confidence"] = confidence
        
        # Take the best of acoustic features
        combined["method"] = "combined"
        
        return combined
        
    def _load_audio(self, 
                 audio_data: Union[str, bytes, np.ndarray, io.BytesIO], 
                 sample_rate: Optional[int] = None) -> Tuple[np.ndarray, int]:
        """Load audio data from various formats"""
        if not LIBROSA_AVAILABLE:
            raise ImportError("Librosa is required for audio loading")
            
        if isinstance(audio_data, np.ndarray):
            # Already a numpy array - must provide sample rate
            if sample_rate is None:
                raise ValueError("Sample rate must be provided with numpy array audio")
            return audio_data, sample_rate
            
        elif isinstance(audio_data, str):
            # File path
            return librosa.load(audio_data, sr=sample_rate)
            
        elif isinstance(audio_data, bytes):
            # Convert bytes to in-memory file
            with io.BytesIO(audio_data) as buf:
                return librosa.load(buf, sr=sample_rate)
                
        elif isinstance(audio_data, io.BytesIO):
            # Already an in-memory file
            return librosa.load(audio_data, sr=sample_rate)
            
        else:
            raise ValueError(f"Unsupported audio data type: {type(audio_data)}")
            
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate linear trend in a sequence of values"""
        if not values or len(values) < 2:
            return 0
            
        # Simple linear regression slope
        n = len(values)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(values) / n
        
        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        # Avoid division by zero
        if denominator == 0:
            return 0
            
        return numerator / denominator
        
    # Helper methods for acoustic feature interpretation
    
    def _estimate_clarity(self, contrast: float) -> float:
        """Estimate vocal clarity from spectral contrast"""
        # Higher spectral contrast often correlates with clearer articulation
        # Normalize to 0-1 range
        if isinstance(contrast, (int, float)):
            return min(1.0, max(0.0, contrast / 50.0))
        return 0.5
        
    def _estimate_warmth(self, mfccs: List[float]) -> float:
        """Estimate vocal warmth from MFCCs"""
        # Lower MFCCs often correlate with "warmer" voices
        # This is a simplified heuristic
        if len(mfccs) >= 3:
            warmth = 0.5 - (mfccs[1] * 0.2)
            return min(1.0, max(0.0, warmth))
        return 0.5
        
    def _estimate_assertiveness(self, energy: float, pitch_mean: float) -> float:
        """Estimate vocal assertiveness from energy and pitch"""
        # Higher energy and stable pitch can suggest assertiveness
        # This is a simplified heuristic
        assertiveness = energy * 0.7 + (min(pitch_mean, 300) / 300) * 0.3
        return min(1.0, max(0.0, assertiveness))
        
    def _estimate_variability(self, pitch_std: float, energy_std: float) -> float:
        """Estimate vocal variability from pitch and energy variation"""
        # Higher standard deviation in pitch and energy suggests more vocal variety
        # Normalize to 0-1 range with reasonable thresholds
        pitch_component = min(1.0, pitch_std / 50.0) if pitch_std else 0
        energy_component = min(1.0, energy_std * 10) if energy_std else 0
        
        return (pitch_component * 0.7 + energy_component * 0.3)