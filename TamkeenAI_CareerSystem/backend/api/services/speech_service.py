import os
import tempfile
import uuid
from pathlib import Path
import logging
from typing import Optional, Tuple, BinaryIO
import speech_recognition as sr
from gtts import gTTS
from fastapi import UploadFile
from ..config.speech_config import SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, AUDIO_FORMAT, TTS_SPEED, TEMP_DIR

logger = logging.getLogger(__name__)

# Create temp directory if it doesn't exist
os.makedirs(TEMP_DIR, exist_ok=True)

class SpeechService:
    """Service for text-to-speech and speech recognition"""
    
    def __init__(self):
        """Initialize speech service"""
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check if required dependencies are available"""
        try:
            from gtts import gTTS
            self.tts_available = True
        except ImportError:
            logger.warning("gTTS not available. Text-to-speech functionality will be limited.")
            self.tts_available = False
        
        try:
            import speech_recognition as sr
            self.speech_recognition_available = True
        except ImportError:
            logger.warning("SpeechRecognition not available. Speech recognition functionality will be limited.")
            self.speech_recognition_available = False
    
    def text_to_speech(self, 
                      text: str, 
                      lang: str = DEFAULT_LANGUAGE, 
                      save_path: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """
        Convert text to speech using gTTS
        
        Args:
            text: Text to convert to speech
            lang: Language code (e.g., 'en', 'ar')
            save_path: Optional path to save the audio file. If None, a temp file is created.
            
        Returns:
            Tuple of (success, file_path)
        """
        if not self.tts_available:
            logger.error("Text-to-speech not available. Cannot convert text to speech.")
            return False, None
        
        try:
            # Check for valid language
            if lang not in SUPPORTED_LANGUAGES:
                logger.warning(f"Language '{lang}' not supported. Defaulting to {DEFAULT_LANGUAGE}.")
                lang = DEFAULT_LANGUAGE
            
            # Generate filename if not provided
            if not save_path:
                filename = f"{uuid.uuid4()}.{AUDIO_FORMAT}"
                save_path = os.path.join(TEMP_DIR, filename)
            
            # Generate speech
            tts = gTTS(text=text, lang=lang, slow=(TTS_SPEED == 'slow'))
            tts.save(save_path)
            
            logger.info(f"Text-to-speech generated successfully: {save_path}")
            return True, save_path
        
        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}")
            return False, None
    
    def get_audio_file(self, file_path: str) -> Optional[BinaryIO]:
        """
        Get audio file as binary data
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Binary file data or None if file not found
        """
        try:
            return open(file_path, 'rb')
        except Exception as e:
            logger.error(f"Error opening audio file: {str(e)}")
            return None
    
    def speech_to_text(self, 
                      audio_file: UploadFile, 
                      lang: str = DEFAULT_LANGUAGE) -> Tuple[bool, Optional[str]]:
        """
        Convert speech to text using SpeechRecognition
        
        Args:
            audio_file: Uploaded audio file
            lang: Language code (e.g., 'en', 'ar')
            
        Returns:
            Tuple of (success, recognized_text)
        """
        if not self.speech_recognition_available:
            logger.error("Speech recognition not available. Cannot convert speech to text.")
            return False, "Speech recognition service unavailable"
        
        try:
            # Check for valid language
            if lang not in SUPPORTED_LANGUAGES:
                logger.warning(f"Language '{lang}' not supported. Defaulting to {DEFAULT_LANGUAGE}.")
                lang = DEFAULT_LANGUAGE
            
            # Map language codes to recognition language
            lang_map = {'en': 'en-US', 'ar': 'ar-SA'}
            recognition_lang = lang_map.get(lang, 'en-US')
            
            # Save the uploaded file to a temporary location
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_filename = temp_file.name
            
            with open(temp_filename, 'wb') as f:
                content = audio_file.file.read()
                f.write(content)
            
            # Recognize speech
            recognizer = sr.Recognizer()
            with sr.AudioFile(temp_filename) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data, language=recognition_lang)
            
            # Clean up temporary file
            try:
                os.unlink(temp_filename)
            except Exception as e:
                logger.warning(f"Could not delete temporary file: {str(e)}")
            
            logger.info(f"Speech recognition successful: {text}")
            return True, text
        
        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand audio")
            return False, "Could not understand audio"
        
        except sr.RequestError as e:
            logger.error(f"Could not request results from speech recognition service: {str(e)}")
            return False, "Speech recognition service error"
        
        except Exception as e:
            logger.error(f"Error in speech recognition: {str(e)}")
            return False, f"Error: {str(e)}"
    
    def clean_temp_files(self, max_age_hours: int = 24):
        """
        Clean up temporary audio files older than specified hours
        
        Args:
            max_age_hours: Maximum age of files in hours
        """
        try:
            import time
            
            now = time.time()
            count = 0
            
            for filename in os.listdir(TEMP_DIR):
                file_path = os.path.join(TEMP_DIR, filename)
                
                # Check if the file is too old
                if os.path.isfile(file_path):
                    file_age = now - os.path.getmtime(file_path)
                    if file_age > (max_age_hours * 3600):
                        os.remove(file_path)
                        count += 1
            
            logger.info(f"Cleaned up {count} temporary audio files")
        
        except Exception as e:
            logger.error(f"Error cleaning temporary files: {str(e)}") 