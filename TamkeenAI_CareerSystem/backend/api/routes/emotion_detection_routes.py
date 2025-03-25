from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import base64
import json
import uuid
import logging
import asyncio
import cv2
import numpy as np
from io import BytesIO
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..services.emotion_detection_service import EmotionDetectionService
from ..services.interview_service import InterviewService
from ..services.auth_service import get_current_user, get_user_from_token
from ..db.database import get_db
from ..models.user_models import User
from ..config.emotion_detection_config import ROLES, DEFAULT_NUM_QUESTIONS, DEFAULT_ANSWER_TIME

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/emotion",
    tags=["emotion detection"]
)

# Initialize services
emotion_service = EmotionDetectionService()
interview_service = InterviewService()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, str] = {}  # Maps user_id to session_id

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.user_sessions:
            del self.user_sessions[client_id]

    async def send_json(self, client_id: str, data: Dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(data)

    def register_session(self, user_id: str, session_id: str):
        self.user_sessions[user_id] = session_id

    def get_session(self, user_id: str) -> Optional[str]:
        return self.user_sessions.get(user_id)

manager = ConnectionManager()

# Request/Response models
class EmotionDetectionRequest(BaseModel):
    image_data: str  # Base64 encoded image

class EmotionDetectionResponse(BaseModel):
    results: List[Dict[str, Any]]

class StartInterviewRequest(BaseModel):
    role: str
    num_questions: Optional[int] = DEFAULT_NUM_QUESTIONS
    answer_time: Optional[int] = DEFAULT_ANSWER_TIME

class InterviewSessionResponse(BaseModel):
    session_id: str
    role: str
    questions: List[str]
    current_question: int
    total_questions: int

class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_index: int
    answer_text: Optional[str] = None
    emotion_analysis: Optional[Dict[str, Any]] = None

class AnswerResponse(BaseModel):
    session_id: str
    question_index: int
    emotion_analysis: Optional[Dict[str, Any]] = None
    next_question_index: Optional[int] = None

# Routes
@router.post("/detect", response_model=EmotionDetectionResponse)
async def detect_emotion(
    request: EmotionDetectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect emotions in an uploaded image
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_data)
        
        # Process the image
        results = emotion_service.detect_emotion_from_bytes(image_data)
        
        return {"results": results}
        
    except Exception as e:
        logger.error(f"Error in emotion detection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

# WebSocket for real-time camera processing
@router.websocket("/ws/camera/{client_id}")
async def websocket_camera_endpoint(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time camera processing
    """
    await manager.connect(websocket, client_id)
    try:
        # Initial setup
        session_id = None
        question_index = 0
        start_time = None
        emotion_timeline = []
        frame_count = 0
        
        while True:
            # Receive frame from client
            data = await websocket.receive_text()
            
            # Parse the JSON message
            message = json.loads(data)
            message_type = message.get("type")
            
            if message_type == "start_interview":
                # Start a new interview session
                token = message.get("token")
                user = await get_user_from_token(token)
                if not user:
                    await websocket.send_json({"type": "error", "message": "Authentication failed"})
                    continue
                
                role = message.get("role", "General")
                num_questions = message.get("num_questions", DEFAULT_NUM_QUESTIONS)
                
                session_id = interview_service.create_interview_session(
                    user.id, role, num_questions
                )
                
                manager.register_session(client_id, session_id)
                session_info = interview_service.get_session_info(session_id)
                
                await websocket.send_json({
                    "type": "session_started",
                    "session_id": session_id,
                    "questions": session_info["questions"],
                    "current_question": 0,
                    "total_questions": len(session_info["questions"])
                })
                
            elif message_type == "frame":
                # Process a camera frame
                if not session_id:
                    await websocket.send_json({"type": "error", "message": "No active session"})
                    continue
                
                # Get frame data
                image_data = message.get("image_data")
                if not image_data:
                    continue
                
                # Process the frame
                try:
                    # Decode base64 image
                    image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
                    
                    # Convert to OpenCV format
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    # Detect emotions
                    results = emotion_service.detect_emotion(frame)
                    
                    # Process results for this frame
                    frame_count += 1
                    current_time = None
                    
                    if start_time is None and results:
                        # First valid detection starts the timer
                        start_time = asyncio.get_event_loop().time()
                        current_time = 0
                    elif start_time is not None:
                        current_time = asyncio.get_event_loop().time() - start_time
                    
                    if current_time is not None:
                        # Record emotions for this frame
                        frame_emotions = {r['emotion']: r['confidence'] for r in results} if results else {}
                        emotion_timeline.append((current_time, frame_emotions))
                    
                    # Send results back to client
                    await websocket.send_json({
                        "type": "frame_processed",
                        "results": results,
                        "elapsed_time": current_time,
                        "frame_count": frame_count
                    })
                    
                except Exception as e:
                    logger.error(f"Error processing frame: {str(e)}")
                    await websocket.send_json({"type": "error", "message": f"Error processing frame: {str(e)}"})
            
            elif message_type == "end_question":
                # End the current question and analyze results
                if not session_id or not emotion_timeline:
                    await websocket.send_json({"type": "error", "message": "No active question or no data collected"})
                    continue
                
                # Get additional data
                answer_text = message.get("answer_text", "")
                
                # Generate emotion analysis
                analysis = emotion_service.analyze_emotion_timeline(emotion_timeline)
                
                # Save the answer and analysis
                interview_service.submit_answer(
                    session_id,
                    question_index,
                    answer_text,
                    analysis
                )
                
                # Send analysis back to client
                await websocket.send_json({
                    "type": "question_completed",
                    "question_index": question_index,
                    "emotion_analysis": analysis,
                    "next_question_index": question_index + 1
                })
                
                # Reset for next question
                question_index += 1
                start_time = None
                emotion_timeline = []
                frame_count = 0
                
            elif message_type == "end_interview":
                # Complete the interview and generate overall analysis
                if not session_id:
                    await websocket.send_json({"type": "error", "message": "No active session"})
                    continue
                
                # Generate complete analysis
                analysis = interview_service.generate_interview_analysis(session_id)
                
                # Send final analysis
                await websocket.send_json({
                    "type": "interview_completed",
                    "session_id": session_id,
                    "analysis": analysis
                })
                
                # Reset session
                session_id = None
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({"type": "error", "message": f"Error: {str(e)}"})
        except:
            pass
        manager.disconnect(client_id)

@router.post("/interview/start", response_model=InterviewSessionResponse)
async def start_interview(
    request: StartInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new interview session
    """
    try:
        # Create a new interview session
        session_id = interview_service.create_interview_session(
            current_user.id,
            request.role,
            request.num_questions,
            request.answer_time
        )
        
        # Get session info
        session_info = interview_service.get_session_info(session_id)
        
        return {
            "session_id": session_id,
            "role": session_info["role"],
            "questions": session_info["questions"],
            "current_question": 0,
            "total_questions": len(session_info["questions"])
        }
        
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting interview: {str(e)}"
        )

@router.post("/interview/submit_answer", response_model=AnswerResponse)
async def submit_answer(
    request: SubmitAnswerRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit an answer to an interview question and analyze emotions
    """
    try:
        # Check if session exists and belongs to user
        session = interview_service.get_session_info(request.session_id)
        if not session or session.get("user_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found"
            )
        
        # Check if question index is valid
        if request.question_index < 0 or request.question_index >= len(session["questions"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid question index"
            )
        
        # Process answer text
        answer_result = interview_service.submit_answer(
            session_id=request.session_id,
            question_index=request.question_index,
            answer_text=request.answer_text
        )
        
        # Process emotion if image was provided
        emotion_analysis = None
        if request.emotion_analysis:
            # Process in background to avoid blocking
            # For now, we'll do it synchronously for simplicity
            try:
                emotion_analysis = request.emotion_analysis
                
                # Store emotion analysis
                background_tasks.add_task(
                    interview_service.add_emotion_analysis,
                    request.session_id,
                    request.question_index,
                    emotion_analysis
                )
            except Exception as e:
                logger.error(f"Error analyzing emotions: {str(e)}")
                emotion_analysis = {"error": str(e)}
        
        # Determine next question
        next_question_index = request.question_index + 1
        if next_question_index >= len(session["questions"]):
            next_question_index = None
        
        return {
            "session_id": request.session_id,
            "question_index": request.question_index,
            "emotion_analysis": emotion_analysis,
            "next_question_index": next_question_index
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting answer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting answer: {str(e)}"
        )

@router.get("/interview/analyze/{session_id}")
async def analyze_interview(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete analysis for an interview session
    """
    try:
        # Check if session exists and belongs to user
        session = interview_service.get_session_info(session_id)
        if not session or session.get("user_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found"
            )
        
        # Generate analysis
        analysis = interview_service.generate_interview_analysis(session_id)
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing interview: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing interview: {str(e)}"
        )

@router.get("/interview/sessions")
async def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all interview sessions for the current user
    """
    try:
        sessions = interview_service.list_interview_sessions(current_user.id)
        return {"sessions": sessions}
        
    except Exception as e:
        logger.error(f"Error listing interview sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing interview sessions: {str(e)}"
        )

@router.post("/train_model")
async def train_emotion_model(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Train a new emotion detection model
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can train models"
        )
    
    try:
        # Start training in the background
        background_tasks.add_task(emotion_service.train_emotion_model)
        
        return {
            "message": "Emotion model training has been started. This may take some time.",
            "status": "training"
        }
        
    except Exception as e:
        logger.error(f"Error starting model training: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting model training: {str(e)}"
        ) 