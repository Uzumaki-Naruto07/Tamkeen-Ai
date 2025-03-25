"""
Emotion Detection Service

This module provides functionality for detecting emotions in text and speech,
which can be used for sentiment analysis during interviews.
"""

import os
import json
import numpy as np
import pandas as pd
import cv2
import logging
import base64
import time
from collections import Counter
from io import BytesIO
from PIL import Image
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import Conv2D, BatchNormalization, MaxPooling2D, Dense, Dropout, SpatialDropout2D, Flatten
from tensorflow.keras.regularizers import l1
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

from ..utils.dataset_utils import load_emotion_dataset, prepare_data_from_dataframe
from ..config.emotion_detection_config import EMOTION_LABELS, MODEL_PATH, MODEL_INPUT_SIZE

logger = logging.getLogger(__name__)

class EmotionDetectionService:
    """Service for emotion detection and analysis"""
    
    def __init__(self, model_path=MODEL_PATH):
        """
        Initialize the emotion detection service
        
        Args:
            model_path: Path to the pre-trained emotion model
        """
        self.model_path = model_path
        self.model = self._load_model()
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
    def _load_model(self):
        """Load the pre-trained emotion detection model"""
        if os.path.exists(self.model_path):
            logger.info(f"Loading pre-trained emotion model from {self.model_path}")
            try:
                model = load_model(self.model_path)
                return model
            except Exception as e:
                logger.error(f"Error loading model: {str(e)}")
        
        logger.warning(f"Pre-trained model not found at {self.model_path}")
        return None
    
    def create_emotion_model(self, model_type='deep'):
        """
        Create and return a face expression detection model
        
        Args:
            model_type: 'deep' or 'shallow'
            
        Returns:
            Compiled keras model
        """
        logger.info(f"Creating {model_type} emotion detection model")
        
        if model_type == 'shallow':
            model = Sequential()
            model.add(Conv2D(16, kernel_size=3, activation='relu', padding="same", input_shape=(48,48,1)))
            model.add(Conv2D(16, (3, 3), activation='relu', padding='same'))
            model.add(BatchNormalization())
            model.add(MaxPooling2D(pool_size=(2, 2)))
            
            model.add(SpatialDropout2D(0.5))
            
            model.add(Conv2D(64, (3, 3), activation='relu', padding='same'))
            model.add(Conv2D(64, (3, 3), activation='relu', padding='same'))
            model.add(BatchNormalization())
            model.add(MaxPooling2D(pool_size=(2, 2)))
            
            model.add(SpatialDropout2D(0.5))
            model.add(Flatten())
            
            model.add(Dense(128, activation='relu'))
            model.add(Dense(7, activation='softmax'))
            
        else:  # deep model
            model = Sequential()
            model.add(Conv2D(64, kernel_size=3, activation='relu', padding="same", input_shape=(48,48,1), kernel_regularizer=l1(1e-6)))
            model.add(BatchNormalization())
            model.add(Dropout(0.2))
            model.add(MaxPooling2D(pool_size=(2, 2)))
            
            model.add(Conv2D(128, (5, 5), activation='relu', padding='same', kernel_regularizer=l1(1e-6)))
            model.add(BatchNormalization())
            model.add(Dropout(0.4))
            model.add(MaxPooling2D(pool_size=(2, 2)))
            
            model.add(Conv2D(512, (3, 3), activation='relu', padding='same', kernel_regularizer=l1(1e-6)))
            model.add(BatchNormalization())
            model.add(Dropout(0.4))
            model.add(MaxPooling2D(pool_size=(2, 2)))
            
            model.add(Conv2D(512, (3, 3), activation='relu', padding='same', kernel_regularizer=l1(1e-6)))
            model.add(BatchNormalization())
            model.add(Dropout(0.4))
            model.add(MaxPooling2D(pool_size=(2, 2)))
            
            model.add(Flatten())
            
            model.add(Dense(256, activation='relu', kernel_regularizer=l1(1e-6)))
            model.add(BatchNormalization())
            model.add(Dropout(0.4))
            model.add(Dense(512, activation='relu', kernel_regularizer=l1(1e-6)))
            model.add(BatchNormalization())
            model.add(Dropout(0.4))
            
            model.add(Dense(7, activation='softmax'))
        
        # Compile the model
        model.compile(
            loss='categorical_crossentropy',
            optimizer=Adam(learning_rate=0.0001),
            metrics=['accuracy']
        )
        
        return model
    
    def train_emotion_model(self, force_train=False, model_type='deep', epochs=30, batch_size=64):
        """
        Train the emotion detection model
        
        Args:
            force_train: Whether to force training even if model exists
            model_type: 'deep' or 'shallow'
            epochs: Number of training epochs
            batch_size: Training batch size
            
        Returns:
            Trained model or None if training fails
        """
        # Check if pre-trained model exists and we're not forcing a retrain
        if os.path.exists(self.model_path) and not force_train:
            logger.info("Using existing pre-trained emotion detection model")
            return self._load_model()
        
        logger.info("Training new emotion detection model...")
        
        # Load dataset
        dataset = load_emotion_dataset()
        if dataset is None:
            logger.error("Failed to load dataset. Cannot train emotion detection model.")
            return None
        
        # Prepare dataset for training
        if hasattr(dataset, 'to_pandas'):
            dataset = dataset.to_pandas()
            
        if isinstance(dataset, pd.DataFrame):
            X_train, y_train, X_test, y_test = prepare_data_from_dataframe(dataset)
        else:
            logger.error("Unsupported dataset format")
            return None
        
        if X_train is None:
            logger.error("Failed to prepare training data.")
            return None
        
        # Create model
        model = self.create_emotion_model(model_type)
        
        # Callbacks for better training
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
            ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-6)
        ]
        
        # Train the model
        logger.info(f"Starting model training with {epochs} epochs and batch size {batch_size}")
        model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks
        )
        
        # Evaluate the model
        logger.info("Evaluating model performance...")
        loss, accuracy = model.evaluate(X_test, y_test)
        logger.info(f"Test accuracy: {accuracy:.4f}")
        
        # Save the model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        model.save(self.model_path)
        logger.info(f"Model saved to {self.model_path}")
        
        self.model = model
        return model
    
    def detect_emotion_from_image(self, image_data, return_faces=False):
        """
        Detect emotions in an image
        
        Args:
            image_data: Image data (numpy array, PIL image, file path, or base64 string)
            return_faces: Whether to return cropped face images
            
        Returns:
            List of dictionaries with detected emotions, and optionally face images
        """
        if self.model is None:
            logger.error("No emotion detection model available")
            return [] if not return_faces else ([], [])
        
        # Convert image data to numpy array
        img = self._load_image(image_data)
        if img is None:
            logger.error("Failed to load image")
            return [] if not return_faces else ([], [])
        
        # Convert to grayscale
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        results = []
        cropped_faces = []
        
        # Process each face
        for (x, y, w, h) in faces:
            # Extract face ROI
            face_roi = gray[y:y+h, x:x+w]
            
            # Resize to model input size
            resized_face = cv2.resize(face_roi, MODEL_INPUT_SIZE)
            
            # Normalize
            normalized_face = resized_face / 255.0
            
            # Reshape for model input
            input_face = normalized_face.reshape(1, MODEL_INPUT_SIZE[0], MODEL_INPUT_SIZE[1], 1)
            
            # Predict emotion
            preds = self.model.predict(input_face, verbose=0)[0]
            emotion_idx = np.argmax(preds)
            emotion = EMOTION_LABELS[emotion_idx]
            confidence = preds[emotion_idx]
            
            # Store result
            result = {
                'bbox': (x, y, w, h),
                'emotion': emotion,
                'confidence': float(confidence),
                'all_emotions': {EMOTION_LABELS[i]: float(preds[i]) for i in range(len(EMOTION_LABELS))}
            }
            results.append(result)
            
            if return_faces:
                cropped_faces.append(resized_face)
        
        if return_faces:
            return results, cropped_faces
        return results
    
    def _load_image(self, image_data):
        """
        Load image from various formats
        
        Args:
            image_data: Image data (numpy array, PIL image, file path, or base64 string)
            
        Returns:
            Numpy array image or None if loading fails
        """
        try:
            # If already numpy array
            if isinstance(image_data, np.ndarray):
                return image_data
            
            # If PIL Image
            if hasattr(image_data, 'convert'):
                img = np.array(image_data)
                return img
            
            # If file path
            if isinstance(image_data, str):
                if os.path.exists(image_data):
                    return cv2.imread(image_data)
                
                # If base64 string
                if image_data.startswith('data:image'):
                    # Extract the base64 part
                    base64_data = image_data.split(',')[1]
                    image_data = base64_data
                
                try:
                    # Decode base64
                    image_bytes = base64.b64decode(image_data)
                    img = Image.open(BytesIO(image_bytes))
                    return np.array(img)
                except:
                    logger.error("Failed to decode base64 image")
            
            # If bytes
            if isinstance(image_data, bytes):
                img = Image.open(BytesIO(image_data))
                return np.array(img)
            
            logger.error(f"Unsupported image data type: {type(image_data)}")
            return None
            
        except Exception as e:
            logger.error(f"Error loading image: {str(e)}")
            return None
    
    def analyze_video_emotions(self, video_frames, sampling_rate=1):
        """
        Analyze emotions in a video stream (series of frames)
        
        Args:
            video_frames: List of image frames (numpy arrays)
            sampling_rate: Process every Nth frame (for performance)
            
        Returns:
            Dictionary with emotion analysis results
        """
        if self.model is None:
            logger.error("No emotion detection model available")
            return None
        
        # Variables for statistics
        emotion_counts = Counter()
        frame_count = 0
        emotion_timeline = []
        processed_frames = []
        
        # Process frames
        for i, frame in enumerate(video_frames):
            # Skip frames based on sampling rate
            if i % sampling_rate != 0:
                continue
                
            # Detect emotions in this frame
            results = self.detect_emotion_from_image(frame)
            
            # Record timestamp and emotions
            frame_emotions = {r['emotion']: r['confidence'] for r in results} if results else {}
            emotion_timeline.append((frame_count, frame_emotions))
            
            # Count emotions
            for result in results:
                emotion_counts[result['emotion']] += 1
            
            # Keep track of frames with results
            if results:
                processed_frames.append(i)
            
            frame_count += 1
        
        # Calculate statistics
        total_detections = sum(emotion_counts.values())
        
        # Handle the case where no faces were detected
        if total_detections == 0:
            logger.warning("No faces were detected in any frames")
            return {
                'emotion_counts': {},
                'emotion_percentages': {},
                'dominant_emotion': None,
                'positive_ratio': 0,
                'negative_ratio': 0,
                'neutral_ratio': 0,
                'confidence_score': 0,
                'engagement_score': 0,
                'detection_rate': 0,
                'processed_frames': processed_frames,
                'insights': ["No face detected. Make sure you're visible to the camera."]
            }
        
        emotion_percentages = {emotion: count/total_detections for emotion, count in emotion_counts.items()}
        
        # Add summary stats
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "No face detected"
        
        # Group emotions into categories
        positive_emotions = emotion_percentages.get('Happy', 0) + emotion_percentages.get('Surprise', 0) * 0.5
        negative_emotions = (emotion_percentages.get('Angry', 0) +
                           emotion_percentages.get('Sad', 0) +
                           emotion_percentages.get('Fear', 0) +
                           emotion_percentages.get('Disgust', 0))
        neutral_emotions = emotion_percentages.get('Neutral', 0) + emotion_percentages.get('Surprise', 0) * 0.5
        
        # Detailed analysis results
        analysis_results = {
            'emotion_counts': dict(emotion_counts),
            'emotion_percentages': emotion_percentages,
            'dominant_emotion': dominant_emotion,
            'positive_ratio': positive_emotions,
            'negative_ratio': negative_emotions,
            'neutral_ratio': neutral_emotions,
            'confidence_score': min(1.0, max(0.0, positive_emotions * 1.2 - negative_emotions * 0.8 + 0.5)),
            'engagement_score': min(1.0, max(0.0, 1.0 - neutral_emotions * 1.5)),
            'detection_rate': len([t for t, e in emotion_timeline if e]) / len(emotion_timeline) if emotion_timeline else 0,
            'processed_frames': processed_frames
        }
        
        # Generate insights based on emotion patterns
        insights = []
        
        if analysis_results['detection_rate'] < 0.3:
            insights.append("Low face detection rate. Make sure you're visible to the camera.")
        
        if analysis_results['positive_ratio'] > 0.6:
            insights.append("You showed strong positive emotions, which is excellent for interview engagement.")
        elif analysis_results['positive_ratio'] < 0.2:
            insights.append("Consider showing more positive emotions like smiling during interviews.")
        
        if analysis_results['negative_ratio'] > 0.3:
            insights.append("You displayed significant negative emotions, which might impact interviewer perception.")
        
        if analysis_results['neutral_ratio'] > 0.7:
            insights.append("Your expression was mostly neutral. Consider showing more engagement and enthusiasm.")
        
        if dominant_emotion == 'Neutral':
            insights.append("Your dominant expression was neutral. Consider showing more emotional engagement.")
        elif dominant_emotion == 'Happy':
            insights.append("You primarily displayed happiness, which is generally positive in interviews.")
        elif dominant_emotion in ['Fear', 'Sad']:
            insights.append(f"Your primary emotion was {dominant_emotion.lower()}, which may be perceived as lack of confidence.")
        
        analysis_results['insights'] = insights
        
        return analysis_results 