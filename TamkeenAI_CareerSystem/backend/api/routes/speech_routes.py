from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from typing import Optional, Dict, Any
from ..services.speech_service import SpeechService
from ..services.auth_service import get_current_user
from ..db.database import get_db
from sqlalchemy.orm import Session
from ..models.user_models import User
from ..config.speech_config import SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE
from pydantic import BaseModel
import os
import io
import uuid
import logging
import asyncio
import base64
import tempfile
import wave
import speech_recognition as sr
from gtts import gTTS
from pydub import AudioSegment
import numpy as np

router = APIRouter(
    prefix="/speech",
    tags=["speech"]
)

logger = logging.getLogger(__name__)
temp_dir = "temp_audio"
os.makedirs(temp_dir, exist_ok=True)

# Initialize recognizer
recognizer = sr.Recognizer()

# WebSocket connection manager for real-time audio
class AudioConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.audio_buffers: Dict[str, bytes] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.audio_buffers[client_id] = b''

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.audio_buffers:
            del self.audio_buffers[client_id]

    def add_audio_chunk(self, client_id: str, chunk: bytes):
        if client_id in self.audio_buffers:
            self.audio_buffers[client_id] += chunk

    def get_audio_buffer(self, client_id: str) -> bytes:
        return self.audio_buffers.get(client_id, b'')

    def reset_audio_buffer(self, client_id: str):
        if client_id in self.audio_buffers:
            self.audio_buffers[client_id] = b''

audio_manager = AudioConnectionManager()

class TextToSpeechRequest(BaseModel):
    """Request model for text-to-speech"""
    text: str
    language: Optional[str] = DEFAULT_LANGUAGE

@router.post("/text-to-speech")
async def text_to_speech(text: str = Form(...), language: str = Form("en")):
    """
    Convert text to speech audio file
    
    Args:
        text: Text to convert to speech
        language: Language code (en, ar, etc.)
    
    Returns:
        Audio file stream
    """
    try:
        # Generate a unique filename
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(temp_dir, filename)
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang=language, slow=False)
        tts.save(filepath)
        
        # Return the audio file
        return FileResponse(
            path=filepath,
            media_type="audio/mpeg",
            filename=filename,
            background=None  # Let FastAPI handle cleanup
        )
    
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """Get audio file by filename"""
    try:
        from ..config.speech_config import TEMP_DIR
        
        file_path = os.path.join(TEMP_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        return FileResponse(
            file_path,
            media_type="audio/mpeg",
            filename=filename
        )
    
    except HTTPException:
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving audio file: {str(e)}"
        )

@router.post("/speech-to-text")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    language: str = Form("en")
):
    """
    Convert speech audio file to text
    
    Args:
        audio_file: Audio file upload
        language: Language code (en, ar, etc.)
    
    Returns:
        Recognized text
    """
    try:
        # Save the uploaded file temporarily
        temp_file = os.path.join(temp_dir, f"{uuid.uuid4()}.wav")
        
        with open(temp_file, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        # Recognize speech using speech_recognition
        with sr.AudioFile(temp_file) as source:
            audio_data = recognizer.record(source)
            
            if language == "ar":
                text = recognizer.recognize_google(audio_data, language="ar-SA")
            else:
                text = recognizer.recognize_google(audio_data)
        
        # Clean up the temporary file
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        return {"text": text, "language": language}
    
    except sr.UnknownValueError:
        return {"text": "", "error": "Speech could not be understood"}
    except sr.RequestError as e:
        return {"text": "", "error": f"Could not request results; {str(e)}"}
    except Exception as e:
        logger.error(f"Speech recognition error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speech recognition error: {str(e)}")

@router.websocket("/ws/microphone/{client_id}")
async def websocket_microphone(websocket: WebSocket, client_id: str):
    await audio_manager.connect(websocket, client_id)
    
    try:
        while True:
            message = await websocket.receive_json()
            message_type = message.get("type")
            
            if message_type == "audio_data":
                # Process incoming audio chunk
                audio_chunk = base64.b64decode(message.get("data", ""))
                audio_manager.add_audio_chunk(client_id, audio_chunk)
            
            elif message_type == "finish_recording":
                language = message.get("language", "en")
                
                # Get the complete audio buffer
                audio_buffer = audio_manager.get_audio_buffer(client_id)
                
                if not audio_buffer:
                    await websocket.send_json({"type": "error", "message": "No audio data received"})
                    continue
                
                # Save the audio buffer to a temporary WAV file
                temp_file = os.path.join(temp_dir, f"{uuid.uuid4()}.wav")
                
                try:
                    # Create WAV file from the raw audio buffer
                    with wave.open(temp_file, "wb") as wav_file:
                        wav_file.setnchannels(1)  # Mono
                        wav_file.setsampwidth(2)  # 16-bit
                        wav_file.setframerate(16000)  # 16kHz
                        wav_file.writeframes(audio_buffer)
                    
                    # Recognize speech
                    with sr.AudioFile(temp_file) as source:
                        audio_data = recognizer.record(source)
                        
                        if language == "ar":
                            text = recognizer.recognize_google(audio_data, language="ar-SA")
                        else:
                            text = recognizer.recognize_google(audio_data)
                    
                    # Send result back to client
                    await websocket.send_json({
                        "type": "recognition_result",
                        "text": text,
                        "language": language
                    })
                
                except sr.UnknownValueError:
                    await websocket.send_json({
                        "type": "recognition_result", 
                        "text": "", 
                        "error": "Speech could not be understood"
                    })
                except sr.RequestError as e:
                    await websocket.send_json({
                        "type": "recognition_result", 
                        "text": "", 
                        "error": f"Could not request results; {str(e)}"
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "error", 
                        "message": f"Error processing audio: {str(e)}"
                    })
                
                finally:
                    # Clean up
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
                    
                    # Reset buffer for next recording
                    audio_manager.reset_audio_buffer(client_id)
            
            elif message_type == "read_aloud":
                text = message.get("text", "")
                language = message.get("language", "en")
                
                if not text:
                    await websocket.send_json({"type": "error", "message": "No text provided"})
                    continue
                
                try:
                    # Generate a unique filename
                    filename = f"{uuid.uuid4()}.mp3"
                    filepath = os.path.join(temp_dir, filename)
                    
                    # Generate speech
                    tts = gTTS(text=text, lang=language, slow=False)
                    tts.save(filepath)
                    
                    # Read the file and encode it to base64
                    with open(filepath, "rb") as audio_file:
                        audio_data = base64.b64encode(audio_file.read()).decode("utf-8")
                    
                    # Send the audio data back to the client
                    await websocket.send_json({
                        "type": "audio_data",
                        "format": "mp3",
                        "data": audio_data
                    })
                    
                    # Clean up
                    if os.path.exists(filepath):
                        os.remove(filepath)
                
                except Exception as e:
                    await websocket.send_json({
                        "type": "error", 
                        "message": f"Error generating speech: {str(e)}"
                    })
    
    except WebSocketDisconnect:
        audio_manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        audio_manager.disconnect(client_id)

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported languages for speech services"""
    return {
        "languages": SUPPORTED_LANGUAGES,
        "default_language": DEFAULT_LANGUAGE
    }

@router.post("/clean-temp-files")
async def clean_temporary_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean up temporary audio files (admin only)"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can clean temporary files"
        )
    
    try:
        speech_service = SpeechService()
        speech_service.clean_temp_files()
        
        return {
            "success": True,
            "message": "Temporary audio files cleaned successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cleaning temporary files: {str(e)}"
        ) 