import os
import time
import base64
import tempfile
from typing import Dict, List, Tuple, Any, Optional, Union
import json
import numpy as np
from datetime import datetime

# Optional dependencies - allow graceful fallback if not available
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False


class EmotionDetector:
    """
    Detects emotions and facial expressions from images or video streams
    Supports multiple methods: MediaPipe, DeepFace, or basic OpenCV
    """
    
    def __init__(self, detection_method: str = "auto", confidence_threshold: float = 0.65):
        """
        Initialize emotion detector with preferred detection method
        
        Args:
            detection_method: Detection backend - "mediapipe", "deepface", "opencv", or "auto"
            confidence_threshold: Minimum confidence level for reported emotions
        """
        self.detection_method = detection_method
        self.confidence_threshold = confidence_threshold
        self.available_methods = []
        self.initialized = False
        self.face_detection_model = None
        self.emotion_model = None
        
        # Check available methods
        if CV2_AVAILABLE:
            self.available_methods.append("opencv")
            
        if MEDIAPIPE_AVAILABLE:
            self.available_methods.append("mediapipe")
            
        if DEEPFACE_AVAILABLE:
            self.available_methods.append("deepface")
            
        # If no method is available, raise warning
        if not self.available_methods:
            print("WARNING: No emotion detection methods available. Please install at least one of: OpenCV, MediaPipe, or DeepFace.")
            return
            
        # Determine method to use based on what's available
        if detection_method == "auto":
            # Prefer methods in this order: deepface > mediapipe > opencv
            if "deepface" in self.available_methods:
                self.detection_method = "deepface"
            elif "mediapipe" in self.available_methods:
                self.detection_method = "mediapipe"
            else:
                self.detection_method = "opencv"
        elif detection_method not in self.available_methods:
            print(f"WARNING: Requested method '{detection_method}' is not available. Using '{self.available_methods[0]}' instead.")
            self.detection_method = self.available_methods[0]
        
        # Initialize the chosen detection method
        self._initialize_detector()
        
    def _initialize_detector(self):
        """Initialize the selected emotion detection method"""
        if self.detection_method == "mediapipe" and MEDIAPIPE_AVAILABLE:
            # Initialize MediaPipe Face Detection and FaceMesh
            mp_face_detection = mp.solutions.face_detection
            self.face_detection_model = mp_face_detection.FaceDetection(
                model_selection=1,  # 0=closer faces, 1=farther faces
                min_detection_confidence=0.5
            )
            
            # Prepare for landmark detection
            mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh_model = mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            self.initialized = True
            
        elif self.detection_method == "opencv" and CV2_AVAILABLE:
            # Load face detection model
            models_dir = os.path.join(os.path.dirname(__file__), "models")
            
            # Create models directory if it doesn't exist
            os.makedirs(models_dir, exist_ok=True)
            
            # Load face detection cascade
            try:
                face_cascade_path = os.path.join(models_dir, "haarcascade_frontalface_default.xml")
                
                # If file doesn't exist, use OpenCV's built-in cascades
                if not os.path.exists(face_cascade_path):
                    face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                    
                self.face_detection_model = cv2.CascadeClassifier(face_cascade_path)
                
                # Check if the cascade loaded successfully
                if self.face_detection_model.empty():
                    print("WARNING: Error loading face cascade. Face detection may not work.")
                    return
                    
                self.initialized = True
                
            except Exception as e:
                print(f"ERROR initializing OpenCV face detection: {str(e)}")
                self.initialized = False
                
        elif self.detection_method == "deepface" and DEEPFACE_AVAILABLE:
            # DeepFace doesn't need initialization, it loads models on demand
            self.initialized = True
            
    def detect_emotion_from_image(self, 
                               image_data: Union[str, bytes, np.ndarray], 
                               return_landmarks: bool = False) -> Dict[str, Any]:
        """
        Detect emotion from an image
        
        Args:
            image_data: Image as base64 string, bytes, file path, or numpy array
            return_landmarks: Whether to include facial landmarks in the result
            
        Returns:
            Dictionary with detected emotions and confidence scores
        """
        if not self.initialized:
            return {"error": "Emotion detection not initialized properly"}
            
        # Convert image to numpy array if needed
        try:
            image = self._load_image(image_data)
        except Exception as e:
            return {"error": f"Failed to load image: {str(e)}"}
        
        # Ensure we have a valid image
        if image is None or image.size == 0:
            return {"error": "Invalid or empty image"}
            
        # Process with selected method
        if self.detection_method == "mediapipe":
            return self._detect_with_mediapipe(image, return_landmarks)
        elif self.detection_method == "opencv":
            return self._detect_with_opencv(image, return_landmarks)
        elif self.detection_method == "deepface":
            return self._detect_with_deepface(image, return_landmarks)
        else:
            return {"error": f"Unknown detection method: {self.detection_method}"}
            
    def analyze_interview_emotions(self, 
                               image_sequence: List[Union[str, bytes, np.ndarray]], 
                               timestamps: Optional[List[float]] = None) -> Dict[str, Any]:
        """
        Analyze emotions across a sequence of images from an interview
        
        Args:
            image_sequence: List of images (can be paths, base64, bytes, or arrays)
            timestamps: Optional list of timestamps for each image
            
        Returns:
            Dictionary with emotion analysis over time and summary statistics
        """
        if not self.initialized:
            return {"error": "Emotion detection not initialized properly"}
            
        if not image_sequence:
            return {"error": "No images provided for analysis"}
            
        # Process each image
        results = []
        
        for i, image_data in enumerate(image_sequence):
            try:
                # Get timestamp if available
                timestamp = timestamps[i] if timestamps and i < len(timestamps) else i
                
                # Process image
                image = self._load_image(image_data)
                if image is None or image.size == 0:
                    continue
                    
                # Detect emotions
                detection = None
                if self.detection_method == "mediapipe":
                    detection = self._detect_with_mediapipe(image, False)
                elif self.detection_method == "opencv":
                    detection = self._detect_with_opencv(image, False)
                elif self.detection_method == "deepface":
                    detection = self._detect_with_deepface(image, False)
                    
                if detection and "error" not in detection:
                    detection["timestamp"] = timestamp
                    results.append(detection)
                    
            except Exception as e:
                print(f"Error processing image {i}: {str(e)}")
                continue
                
        # If no valid results, return error
        if not results:
            return {"error": "No valid emotion detections in the provided images"}
            
        # Analyze results
        analysis = self._analyze_emotion_sequence(results)
        
        return analysis
        
    def _analyze_emotion_sequence(self, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze a sequence of emotion detections to identify patterns"""
        if not detections:
            return {"error": "No detections to analyze"}
            
        # Extract emotions across time
        emotion_timeline = []
        dominant_emotions = []
        confidence_values = []
        
        for detection in detections:
            emotions = detection.get("emotions", {})
            if emotions:
                emotion_timeline.append({
                    "timestamp": detection.get("timestamp", 0),
                    "emotions": emotions
                })
                
                # Track dominant emotion for each frame
                dominant = detection.get("dominant_emotion", "")
                if dominant:
                    dominant_emotions.append(dominant)
                    
                # Track confidence values
                confidence = detection.get("confidence", 0)
                if confidence:
                    confidence_values.append(confidence)
        
        # Calculate statistics
        emotion_counts = {}
        for emotion in dominant_emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            
        # Find most frequent emotion
        most_frequent_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "unknown"
        
        # Calculate average confidence
        avg_confidence = sum(confidence_values) / len(confidence_values) if confidence_values else 0
        
        # Detect significant emotion changes (shifts in dominant emotion)
        emotion_shifts = []
        last_emotion = None
        
        for i, detection in enumerate(detections):
            current_emotion = detection.get("dominant_emotion", "")
            if current_emotion and current_emotion != last_emotion:
                if last_emotion is not None:  # Don't count the first detection as a shift
                    emotion_shifts.append({
                        "from": last_emotion,
                        "to": current_emotion,
                        "timestamp": detection.get("timestamp", i)
                    })
                last_emotion = current_emotion
                
        # Build analysis result
        analysis = {
            "summary": {
                "most_frequent_emotion": most_frequent_emotion,
                "emotion_distribution": emotion_counts,
                "average_confidence": avg_confidence,
                "total_frames": len(detections),
                "emotion_shifts": len(emotion_shifts),
                "dominant_emotion_stability": len(dominant_emotions) / (len(emotion_shifts) + 1) if len(emotion_shifts) > 0 else len(dominant_emotions)
            },
            "timeline": emotion_timeline,
            "emotion_shifts": emotion_shifts,
            "interview_feedback": self._generate_emotion_feedback(emotion_counts, emotion_shifts, avg_confidence)
        }
        
        return analysis
    
    def _generate_emotion_feedback(self, 
                               emotion_counts: Dict[str, int], 
                               emotion_shifts: List[Dict[str, Any]], 
                               avg_confidence: float) -> Dict[str, Any]:
        """Generate feedback based on emotion analysis"""
        total_frames = sum(emotion_counts.values())
        if total_frames == 0:
            return {"error": "Not enough data for feedback"}
            
        # Calculate percentages
        emotion_percentages = {emotion: (count / total_frames) * 100 
                               for emotion, count in emotion_counts.items()}
        
        # Prepare feedback
        feedback = {
            "overall_impression": "",
            "positive_aspects": [],
            "areas_for_improvement": [],
            "recommendations": []
        }
        
        # Generate overall impression
        if emotion_percentages.get("happy", 0) > 40:
            feedback["overall_impression"] = "You appeared generally positive and enthusiastic during the interview."
        elif emotion_percentages.get("neutral", 0) > 60:
            feedback["overall_impression"] = "You maintained a consistently neutral expression throughout the interview."
        elif emotion_percentages.get("sad", 0) > 30 or emotion_percentages.get("fear", 0) > 30:
            feedback["overall_impression"] = "You appeared somewhat anxious or uncomfortable during parts of the interview."
        elif emotion_percentages.get("angry", 0) > 20 or emotion_percentages.get("disgust", 0) > 20:
            feedback["overall_impression"] = "You showed signs of frustration or discomfort during parts of the interview."
        else:
            feedback["overall_impression"] = "Your facial expressions varied throughout the interview."
            
        # Positive aspects
        if emotion_percentages.get("happy", 0) > 20:
            feedback["positive_aspects"].append("You showed appropriate enthusiasm and positive energy")
            
        if emotion_percentages.get("neutral", 0) > 40:
            feedback["positive_aspects"].append("You maintained a professional composure")
            
        if len(emotion_shifts) < total_frames / 10:
            feedback["positive_aspects"].append("Your expressions were consistent and controlled")
            
        # Areas for improvement
        if emotion_percentages.get("neutral", 0) > 80:
            feedback["areas_for_improvement"].append("Your expressions could show more engagement and enthusiasm")
            
        if emotion_percentages.get("sad", 0) > 20 or emotion_percentages.get("fear", 0) > 20:
            feedback["areas_for_improvement"].append("You appeared anxious or uncomfortable at times")
            
        if emotion_percentages.get("angry", 0) > 10 or emotion_percentages.get("disgust", 0) > 10:
            feedback["areas_for_improvement"].append("You occasionally showed frustration or negative expressions")
            
        if len(emotion_shifts) > total_frames / 5:
            feedback["areas_for_improvement"].append("Your expressions changed frequently, which might appear inconsistent")
            
        # Generate recommendations
        if emotion_percentages.get("neutral", 0) > 80:
            feedback["recommendations"].append("Practice showing more engagement through appropriate smiling and expressions of interest")
            
        if emotion_percentages.get("sad", 0) > 20 or emotion_percentages.get("fear", 0) > 20:
            feedback["recommendations"].append("Work on relaxation techniques to appear more confident during interviews")
            
        if emotion_percentages.get("angry", 0) > 10 or emotion_percentages.get("disgust", 0) > 10:
            feedback["recommendations"].append("Practice maintaining a positive expression even when discussing challenging topics")
            
        if len(emotion_shifts) > total_frames / 5:
            feedback["recommendations"].append("Work on maintaining more consistent expressions, particularly when listening")
            
        # Add general recommendations if needed
        if len(feedback["recommendations"]) == 0:
            feedback["recommendations"] = [
                "Continue practicing interviews to build more confidence",
                "Consider recording yourself to become more aware of your expressions",
                "Remember to smile appropriately to build rapport"
            ]
            
        return feedback
    
    def _detect_with_mediapipe(self, image: np.ndarray, return_landmarks: bool) -> Dict[str, Any]:
        """Detect emotion using MediaPipe face mesh"""
        try:
            # Convert to RGB for MediaPipe
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect face
            face_detection_result = self.face_detection_model.process(image_rgb)
            
            # If no face detected, return error
            if not face_detection_result.detections:
                return {"error": "No face detected in image"}
                
            # Process with face mesh to get landmarks
            face_mesh_result = self.face_mesh_model.process(image_rgb)
            
            if not face_mesh_result.multi_face_landmarks:
                return {"error": "Failed to detect facial landmarks"}
                
            face_landmarks = face_mesh_result.multi_face_landmarks[0]
            
            # Extract emotion from landmarks
            emotions = self._extract_emotions_from_landmarks(face_landmarks, image.shape)
            
            # Determine dominant emotion
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
            confidence = emotions[dominant_emotion]
            
            # Build response
            response = {
                "timestamp": datetime.now().isoformat(),
                "face_detected": True,
                "dominant_emotion": dominant_emotion,
                "confidence": confidence,
                "emotions": emotions,
                "method": "mediapipe"
            }
            
            # Add landmarks if requested
            if return_landmarks:
                landmarks_dict = {}
                for i, landmark in enumerate(face_landmarks.landmark):
                    landmarks_dict[str(i)] = {
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z
                    }
                response["landmarks"] = landmarks_dict
                
            return response
            
        except Exception as e:
            return {"error": f"MediaPipe detection error: {str(e)}"}
            
    def _extract_emotions_from_landmarks(self, landmarks, image_shape) -> Dict[str, float]:
        """Extract emotion probabilities from facial landmarks"""
        # This is a simplified approach - in a real implementation, you would
        # use a trained model to classify emotions from landmarks
        
        # Default emotions with neutral being most likely
        emotions = {
            "neutral": 0.5,
            "happy": 0.1,
            "sad": 0.1,
            "angry": 0.1,
            "surprise": 0.1,
            "fear": 0.05,
            "disgust": 0.05
        }
        
        # Get relevant landmark indices
        # These indices are based on MediaPipe Face Mesh landmark map
        # https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
        
        # Extract key points (simplified)
        try:
            # Eye landmarks
            left_eye = [landmarks.landmark[33], landmarks.landmark[133]]
            right_eye = [landmarks.landmark[362], landmarks.landmark[263]]
            
            # Mouth landmarks
            mouth_left = landmarks.landmark[61]
            mouth_right = landmarks.landmark[291]
            mouth_top = landmarks.landmark[13]
            mouth_bottom = landmarks.landmark[14]
            
            # Eyebrow landmarks
            left_eyebrow = landmarks.landmark[107]
            right_eyebrow = landmarks.landmark[336]
            
            # Calculate eye openness
            left_eye_open = abs(left_eye[0].y - left_eye[1].y)
            right_eye_open = abs(right_eye[0].y - right_eye[1].y)
            eye_openness = (left_eye_open + right_eye_open) / 2
            
            # Calculate mouth openness
            mouth_width = abs(mouth_left.x - mouth_right.x)
            mouth_height = abs(mouth_top.y - mouth_bottom.y)
            mouth_ratio = mouth_height / mouth_width if mouth_width > 0 else 0
            
            # Calculate eyebrow position
            eyebrow_position = (left_eyebrow.y + right_eyebrow.y) / 2
            
            # Detect smile
            smile_ratio = mouth_width / (abs(mouth_left.y - mouth_right.y)) if abs(mouth_left.y - mouth_right.y) > 0 else 1
            
            # Simple emotion heuristics
            # These are simplified approximations and not accurate emotion detection
            
            # Happy: wide mouth, raised cheeks
            if smile_ratio > 1.5 and mouth_ratio < 0.2:
                emotions["happy"] = 0.7
                emotions["neutral"] = 0.2
                emotions["sad"] = 0.0
                emotions["angry"] = 0.0
                
            # Surprised: raised eyebrows, open mouth
            elif eyebrow_position < 0.2 and mouth_ratio > 0.3:
                emotions["surprise"] = 0.7
                emotions["neutral"] = 0.1
                emotions["fear"] = 0.2
                
            # Sad: drooping eyebrows, downturned mouth
            elif eyebrow_position > 0.3 and mouth_ratio < 0.1:
                emotions["sad"] = 0.6
                emotions["neutral"] = 0.3
                emotions["happy"] = 0.0
                
            # Angry: lowered eyebrows, tightened mouth
            elif eyebrow_position > 0.25 and mouth_width < 0.3:
                emotions["angry"] = 0.6
                emotions["disgust"] = 0.2
                emotions["neutral"] = 0.2
                
            # Default to more neutral if no strong patterns
            else:
                emotions["neutral"] = 0.6
            
        except Exception:
            # If landmark analysis fails, return mostly neutral
            emotions = {
                "neutral": 0.7,
                "happy": 0.1,
                "sad": 0.05,
                "angry": 0.05,
                "surprise": 0.05,
                "fear": 0.025,
                "disgust": 0.025
            }
            
        return emotions
            
    def _detect_with_opencv(self, image: np.ndarray, return_landmarks: bool) -> Dict[str, Any]:
        """Detect emotion using OpenCV basic face detection"""
        try:
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_detection_model.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            if len(faces) == 0:
                return {"error": "No face detected in image"}
                
            # Get largest face
            largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
            x, y, w, h = largest_face
            
            # With just OpenCV Haar cascades, we can't reliably detect emotions
            # so we'll return a simple response with neutral emotion
            # In a real implementation, you'd use a proper emotion classifier
            
            # Build response
            response = {
                "timestamp": datetime.now().isoformat(),
                "face_detected": True,
                "dominant_emotion": "neutral",  # Default with basic OpenCV
                "confidence": 0.6,
                "emotions": {
                    "neutral": 0.6,
                    "happy": 0.1,
                    "sad": 0.1,
                    "angry": 0.05,
                    "surprise": 0.05,
                    "fear": 0.05,
                    "disgust": 0.05
                },
                "method": "opencv"
            }
            
            # Add face region if landmarks requested
            if return_landmarks:
                response["landmarks"] = {
                    "face_region": {
                        "x": int(x),
                        "y": int(y),
                        "width": int(w),
                        "height": int(h)
                    }
                }
                
            return response
            
        except Exception as e:
            return {"error": f"OpenCV detection error: {str(e)}"}
            
    def _detect_with_deepface(self, image: np.ndarray, return_landmarks: bool) -> Dict[str, Any]:
        """Detect emotion using DeepFace models"""
        try:
            # Detect emotions with DeepFace
            result = DeepFace.analyze(
                img_path=image,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend='opencv'
            )
            
            # Handle result (DeepFace can return list or dict)
            if isinstance(result, list):
                if not result:
                    return {"error": "No faces detected"}
                result = result[0]  # Take first face if multiple detected
                
            # Extract emotions and convert to our format
            emotions = {}
            if 'emotion' in result:
                emotions = result['emotion']
                
            # Find dominant emotion
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0] if emotions else "neutral"
            confidence = emotions.get(dominant_emotion, 0)
            
            # Build response
            response = {
                "timestamp": datetime.now().isoformat(),
                "face_detected": True,
                "dominant_emotion": dominant_emotion,
                "confidence": confidence / 100 if confidence > 1 else confidence,  # DeepFace returns percentages
                "emotions": {k: v/100 if v > 1 else v for k, v in emotions.items()},  # Normalize to 0-1
                "method": "deepface"
            }
            
            # Add landmarks if requested
            if return_landmarks and 'region' in result:
                landmarks = {
                    "face_region": {
                        "x": result['region']['x'],
                        "y": result['region']['y'],
                        "w": result['region']['w'],
                        "h": result['region']['h']
                    }
                }
                response["landmarks"] = landmarks
                
            return response
            
        except Exception as e:
            return {"error": f"DeepFace detection error: {str(e)}"}
            
    def _load_image(self, image_data: Union[str, bytes, np.ndarray]) -> np.ndarray:
        """Load image from various input formats into a numpy array"""
        if isinstance(image_data, np.ndarray):
            # Already a numpy array
            return image_data
            
        elif isinstance(image_data, str):
            # Could be a file path or base64 string
            if os.path.isfile(image_data):
                # It's a file path
                return cv2.imread(image_data)
            else:
                # Assume it's a base64 string
                try:
                    # Check if the base64 string has a header (data:image/jpeg;base64,)
                    if ';base64,' in image_data:
                        image_data = image_data.split(';base64,')[1]
                        
                    # Decode base64 to bytes
                    image_bytes = base64.b64decode(image_data)
                    
                    # Convert bytes to numpy array
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    
                    # Decode the numpy array as an image
                    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                except Exception as e:
                    raise ValueError(f"Failed to decode base64 image: {str(e)}")
                    
        elif isinstance(image_data, bytes):
            # Raw image bytes
            try:
                nparr = np.frombuffer(image_data, np.uint8)
                return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as e:
                raise ValueError(f"Failed to decode image bytes: {str(e)}")
                
        else:
            raise ValueError(f"Unsupported image data type: {type(image_data)}")