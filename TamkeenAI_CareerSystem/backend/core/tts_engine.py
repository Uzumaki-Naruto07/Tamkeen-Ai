import os
import re
import json
import base64
import tempfile
import hashlib
from typing import Dict, List, Tuple, Any, Optional, Union, BinaryIO
from datetime import datetime
import logging
import io

# Optional dependencies - allow graceful fallback if not available
try:
    import gtts
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False

try:
    from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, ResultReason, AudioConfig
    from azure.cognitiveservices.speech.audio import AudioOutputConfig
    AZURE_TTS_AVAILABLE = True
except ImportError:
    AZURE_TTS_AVAILABLE = False


class TTSModule:
    """
    Text-to-Speech module with support for multiple engines
    Used to generate spoken guidance, interview questions, and feedback
    """
    
    def __init__(self, 
               engine: str = "auto", 
               voice: Optional[str] = None,
               rate: float = 1.0,
               pitch: float = 1.0,
               volume: float = 1.0,
               cache_dir: Optional[str] = None,
               api_keys: Optional[Dict[str, str]] = None):
        """
        Initialize the TTS module
        
        Args:
            engine: TTS engine to use ("azure", "gtts", "pyttsx3", or "auto")
            voice: Voice identifier (engine-specific)
            rate: Speech rate multiplier (0.5 to 2.0)
            pitch: Voice pitch multiplier (0.5 to 2.0)
            volume: Volume level (0.0 to 1.0)
            cache_dir: Optional directory for caching audio files
            api_keys: Optional dictionary of API keys for cloud TTS services
        """
        self.engine = engine
        self.voice = voice
        self.rate = rate
        self.pitch = pitch
        self.volume = volume
        self.available_engines = []
        self.tts_engine = None
        self.initialized = False
        self.api_keys = api_keys or {}
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        
        # Setup cache
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = os.path.join(tempfile.gettempdir(), "tamkeen_tts_cache")
            os.makedirs(self.cache_dir, exist_ok=True)
            
        # Check available engines
        if AZURE_TTS_AVAILABLE and "azure_speech_key" in self.api_keys and "azure_speech_region" in self.api_keys:
            self.available_engines.append("azure")
            
        if GTTS_AVAILABLE:
            self.available_engines.append("gtts")
            
        if PYTTSX3_AVAILABLE:
            self.available_engines.append("pyttsx3")
            
        # If no engine is available, raise warning
        if not self.available_engines:
            self.logger.warning("No TTS engines available. Please install at least one of: pyttsx3, gTTS, or azure-cognitiveservices-speech.")
            return
            
        # Determine engine to use based on what's available
        if engine == "auto":
            # Prefer engines in this order: azure > gtts > pyttsx3
            if "azure" in self.available_engines:
                self.engine = "azure"
            elif "gtts" in self.available_engines:
                self.engine = "gtts"
            else:
                self.engine = "pyttsx3"
        elif engine not in self.available_engines:
            self.logger.warning(f"Requested engine '{engine}' is not available. Using '{self.available_engines[0]}' instead.")
            self.engine = self.available_engines[0]
        
        # Initialize the selected engine
        self._initialize_engine()
        
    def _initialize_engine(self):
        """Initialize the selected TTS engine"""
        if self.engine == "azure" and AZURE_TTS_AVAILABLE:
            try:
                speech_key = self.api_keys.get("azure_speech_key")
                speech_region = self.api_keys.get("azure_speech_region")
                
                if not speech_key or not speech_region:
                    self.logger.error("Azure Speech credentials missing")
                    return
                    
                self.speech_config = SpeechConfig(subscription=speech_key, region=speech_region)
                
                # Set voice if specified
                if self.voice:
                    self.speech_config.speech_synthesis_voice_name = self.voice
                else:
                    # Default to neutral voice
                    self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
                    
                self.initialized = True
                
            except Exception as e:
                self.logger.error(f"Error initializing Azure TTS: {str(e)}")
                self.initialized = False
                
        elif self.engine == "gtts" and GTTS_AVAILABLE:
            # gTTS doesn't need initialization, but we'll set up some defaults
            self.gtts_lang = "en"
            self.gtts_tld = "com"  # Top-level domain for the Google TTS service
            
            # Limited voice customization available for gTTS, mainly through language selection
            if self.voice:
                if '-' in self.voice:
                    # Assume format like "en-us" or "fr-fr"
                    parts = self.voice.split('-')
                    if len(parts) >= 2:
                        self.gtts_lang = parts[0]
                        self.gtts_tld = parts[1]
                else:
                    # Just set the language
                    self.gtts_lang = self.voice
                    
            self.initialized = True
            
        elif self.engine == "pyttsx3" and PYTTSX3_AVAILABLE:
            try:
                self.tts_engine = pyttsx3.init()
                
                # Configure voice
                voices = self.tts_engine.getProperty('voices')
                
                if self.voice:
                    # Try to find matching voice
                    for voice in voices:
                        if self.voice.lower() in voice.id.lower() or self.voice.lower() in voice.name.lower():
                            self.tts_engine.setProperty('voice', voice.id)
                            break
                elif voices:
                    # Default to first available voice
                    self.tts_engine.setProperty('voice', voices[0].id)
                    
                # Set speech properties
                if self.rate:
                    # pyttsx3 rate is words per minute, typically 150-200
                    current_rate = self.tts_engine.getProperty('rate')
                    self.tts_engine.setProperty('rate', int(current_rate * self.rate))
                    
                if self.volume:
                    # pyttsx3 volume range is 0.0 to 1.0
                    self.tts_engine.setProperty('volume', self.volume)
                    
                self.initialized = True
                
            except Exception as e:
                self.logger.error(f"Error initializing pyttsx3: {str(e)}")
                self.initialized = False
        
    def text_to_speech(self, 
                     text: str, 
                     output_path: Optional[str] = None,
                     ssml: bool = False,
                     use_cache: bool = True) -> Union[bytes, str, None]:
        """
        Convert text to speech
        
        Args:
            text: Text or SSML to convert to speech
            output_path: Optional file path to save audio
            ssml: Whether the input is SSML markup
            use_cache: Whether to use cached audio if available
            
        Returns:
            Depending on parameters:
              - Audio data as bytes if no output_path is provided
              - Path to the saved audio file if output_path is provided
              - None if synthesis fails
        """
        if not self.initialized:
            self.logger.error("TTS engine not properly initialized")
            return None
            
        # Check for empty text
        if not text or not text.strip():
            self.logger.warning("Empty text provided for TTS")
            return None
            
        # Check cache if enabled
        cache_key = None
        if use_cache:
            cache_params = {
                'text': text,
                'engine': self.engine,
                'voice': self.voice,
                'rate': self.rate,
                'pitch': self.pitch,
                'volume': self.volume,
                'ssml': ssml
            }
            cache_key = self._get_cache_key(cache_params)
            cached_path = os.path.join(self.cache_dir, f"{cache_key}.mp3")
            
            if os.path.exists(cached_path):
                # Use cached audio
                if output_path:
                    # Copy to requested output path
                    with open(cached_path, 'rb') as src_file:
                        with open(output_path, 'wb') as dst_file:
                            dst_file.write(src_file.read())
                    return output_path
                else:
                    # Return bytes
                    with open(cached_path, 'rb') as f:
                        return f.read()
        
        # Generate speech based on selected engine
        audio_data = None
        
        try:
            if self.engine == "azure":
                audio_data = self._synthesize_azure(text, ssml)
            elif self.engine == "gtts":
                audio_data = self._synthesize_gtts(text)
            elif self.engine == "pyttsx3":
                audio_data = self._synthesize_pyttsx3(text)
                
            if audio_data is None:
                return None
                
            # Save to cache if enabled
            if use_cache and cache_key:
                cache_path = os.path.join(self.cache_dir, f"{cache_key}.mp3")
                with open(cache_path, 'wb') as f:
                    f.write(audio_data)
            
            # Save to output path if provided
            if output_path:
                with open(output_path, 'wb') as f:
                    f.write(audio_data)
                return output_path
                
            return audio_data
            
        except Exception as e:
            self.logger.error(f"Error synthesizing speech: {str(e)}")
            return None
            
    def _synthesize_azure(self, text: str, ssml: bool = False) -> Optional[bytes]:
        """Synthesize speech using Azure TTS"""
        try:
            # Create an output stream
            audio_stream = io.BytesIO()
            
            # Configure audio output stream
            audio_config = AudioConfig(filename=None)
            
            # Create synthesizer
            synthesizer = SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            # Synthesize speech
            if ssml:
                result = synthesizer.speak_ssml(text)
            else:
                result = synthesizer.speak_text(text)
                
            # Check result
            if result.reason == ResultReason.SynthesizingAudioCompleted:
                # Get audio data
                audio_data = result.audio_data
                return audio_data
            else:
                self.logger.error(f"Azure speech synthesis failed: {result.reason}")
                return None
                
        except Exception as e:
            self.logger.error(f"Azure TTS error: {str(e)}")
            return None
            
    def _synthesize_gtts(self, text: str) -> Optional[bytes]:
        """Synthesize speech using Google Text-to-Speech"""
        try:
            # Create a temporary file for audio
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_path = temp_file.name
                
            # Generate speech
            tts = gTTS(text=text, lang=self.gtts_lang, tld=self.gtts_tld, slow=False)
            tts.save(temp_path)
            
            # Read the file
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
                
            # Delete temporary file
            os.unlink(temp_path)
            
            return audio_data
            
        except Exception as e:
            self.logger.error(f"gTTS error: {str(e)}")
            return None
            
    def _synthesize_pyttsx3(self, text: str) -> Optional[bytes]:
        """Synthesize speech using pyttsx3"""
        try:
            # Create a temporary file for audio
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_path = temp_file.name
                
            # Generate speech to file
            self.tts_engine.save_to_file(text, temp_path)
            self.tts_engine.runAndWait()
            
            # Read the file
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
                
            # Delete temporary file
            os.unlink(temp_path)
            
            return audio_data
            
        except Exception as e:
            self.logger.error(f"pyttsx3 error: {str(e)}")
            return None
            
    def get_available_voices(self) -> List[Dict[str, str]]:
        """Get available voices for the current engine"""
        voices = []
        
        try:
            if self.engine == "pyttsx3" and self.tts_engine:
                for voice in self.tts_engine.getProperty('voices'):
                    voices.append({
                        'id': voice.id,
                        'name': voice.name,
                        'languages': voice.languages,
                        'gender': voice.gender,
                        'age': voice.age
                    })
            elif self.engine == "gtts":
                # gTTS uses language codes, provide some common ones
                languages = {
                    'en': 'English',
                    'fr': 'French',
                    'es': 'Spanish',
                    'de': 'German',
                    'it': 'Italian',
                    'ar': 'Arabic',
                    'zh-CN': 'Chinese (Simplified)',
                    'ja': 'Japanese',
                    'ko': 'Korean',
                    'ru': 'Russian'
                }
                
                for code, name in languages.items():
                    voices.append({
                        'id': code,
                        'name': name,
                        'languages': [code]
                    })
            elif self.engine == "azure":
                # Azure has many voices, but we need to call the API to list them
                # For now, provide a subset of common ones
                azure_voices = [
                    {'id': 'en-US-JennyNeural', 'name': 'Jenny (Neural)', 'gender': 'Female'},
                    {'id': 'en-US-GuyNeural', 'name': 'Guy (Neural)', 'gender': 'Male'},
                    {'id': 'en-GB-SoniaNeural', 'name': 'Sonia (Neural)', 'gender': 'Female'},
                    {'id': 'en-GB-RyanNeural', 'name': 'Ryan (Neural)', 'gender': 'Male'},
                    {'id': 'ar-SA-ZariyahNeural', 'name': 'Zariyah (Neural)', 'gender': 'Female'},
                    {'id': 'fr-FR-DeniseNeural', 'name': 'Denise (Neural)', 'gender': 'Female'},
                    {'id': 'es-ES-ElviraNeural', 'name': 'Elvira (Neural)', 'gender': 'Female'}
                ]
                voices.extend(azure_voices)
                
        except Exception as e:
            self.logger.error(f"Error getting voices: {str(e)}")
            
        return voices
        
    def _get_cache_key(self, params: Dict[str, Any]) -> str:
        """Generate a cache key from TTS parameters"""
        # Create a string representation of the parameters that affect the output
        param_str = json.dumps(params, sort_keys=True)
        
        # Generate a hash of the parameters
        return hashlib.md5(param_str.encode('utf-8')).hexdigest()
        
    def cleanup_cache(self, max_size_mb: int = 100, max_age_days: int = 30):
        """Clean up the cache directory to prevent it from growing too large"""
        if not self.cache_dir or not os.path.exists(self.cache_dir):
            return
            
        try:
            # Get all cache files with their size and modification time
            cache_files = []
            total_size = 0
            
            for filename in os.listdir(self.cache_dir):
                if not filename.endswith('.mp3'):
                    continue
                    
                file_path = os.path.join(self.cache_dir, filename)
                if not os.path.isfile(file_path):
                    continue
                    
                file_size = os.path.getsize(file_path)
                mod_time = os.path.getmtime(file_path)
                cache_files.append((file_path, file_size, mod_time))
                total_size += file_size
                
            # Convert max size to bytes
            max_size_bytes = max_size_mb * 1024 * 1024
            
            # Calculate cutoff time for old files
            now = datetime.now().timestamp()
            max_age_seconds = max_age_days * 24 * 60 * 60
            cutoff_time = now - max_age_seconds
            
            # First, remove files that are too old
            for file_path, _, mod_time in cache_files:
                if mod_time < cutoff_time:
                    try:
                        os.remove(file_path)
                        # Update total size
                        total_size -= file_size
                    except:
                        pass
                        
            # If still over max size, remove oldest files first
            if total_size > max_size_bytes:
                # Sort by modification time (oldest first)
                cache_files.sort(key=lambda x: x[2])
                
                for file_path, file_size, _ in cache_files:
                    if total_size <= max_size_bytes:
                        break
                        
                    try:
                        os.remove(file_path)
                        total_size -= file_size
                    except:
                        pass
                        
        except Exception as e:
            self.logger.error(f"Error cleaning cache: {str(e)}")
            
    def text_with_emotion(self, text: str, emotion: str = "neutral") -> str:
        """
        Add SSML tags to express emotion in speech
        
        Args:
            text: Text to speak
            emotion: Emotion to express (neutral, happy, sad, angry, excited)
            
        Returns:
            SSML-formatted text
        """
        # Only Azure supports proper emotion through SSML
        if self.engine != "azure":
            return text
            
        # Define SSML templates for different emotions
        emotion_settings = {
            "neutral": {
                "rate": "medium", 
                "pitch": "medium", 
                "style": "neutral"
            },
            "happy": {
                "rate": "medium", 
                "pitch": "high", 
                "style": "cheerful"
            },
            "sad": {
                "rate": "slow", 
                "pitch": "low", 
                "style": "sad"
            },
            "angry": {
                "rate": "fast", 
                "pitch": "high", 
                "style": "angry"
            },
            "excited": {
                "rate": "fast", 
                "pitch": "high", 
                "style": "excited"
            }
        }
        
        settings = emotion_settings.get(emotion.lower(), emotion_settings["neutral"])
        
        # Create SSML
        ssml = f"""
        <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0">
            <voice name="{self.speech_config.speech_synthesis_voice_name}">
                <prosody rate="{settings['rate']}" pitch="{settings['pitch']}">
                    <mstts:express-as style="{settings['style']}">
                        {text}
                    </mstts:express-as>
                </prosody>
            </voice>
        </speak>
        """
        
        return ssml.strip()
        
    def set_voice(self, voice: str):
        """Set the TTS voice"""
        self.voice = voice
        
        # Update engine with new voice
        if self.engine == "pyttsx3" and self.tts_engine:
            voices = self.tts_engine.getProperty('voices')
            for v in voices:
                if voice.lower() in v.id.lower() or voice.lower() in v.name.lower():
                    self.tts_engine.setProperty('voice', v.id)
                    break
        elif self.engine == "azure" and hasattr(self, 'speech_config'):
            self.speech_config.speech_synthesis_voice_name = voice
        elif self.engine == "gtts":
            if '-' in voice:
                parts = voice.split('-')
                if len(parts) >= 2:
                    self.gtts_lang = parts[0]
                    self.gtts_tld = parts[1]
            else:
                self.gtts_lang = voice