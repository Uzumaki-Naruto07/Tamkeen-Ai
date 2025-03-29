import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime
import logging
from ..utils.time_utils import get_timestamp_str

logger = logging.getLogger(__name__)

def generate_confidence_prediction(user_id, interview_data):
    """
    Generate confidence prediction based on user's interview performance
    
    Args:
        user_id: User ID
        interview_data: Dictionary with interview sessions and emotion analysis data
        
    Returns:
        Dictionary with prediction data for charting
    """
    try:
        # Extract data from interview sessions and emotions
        sessions = interview_data.get("sessions", [])
        emotions = interview_data.get("emotions", [])
        
        if not sessions:
            # Return default prediction if no data
            return generate_default_prediction()
            
        # Process sessions data
        processed_data = process_interview_data(sessions, emotions)
        
        # Generate predictions
        predictions = predict_confidence(processed_data)
        
        # Format data for frontend charts
        chart_data = format_prediction_for_charts(predictions)
        
        return chart_data
        
    except Exception as e:
        logger.error(f"Error generating confidence prediction: {str(e)}")
        # Return default prediction in case of error
        return generate_default_prediction()

def process_interview_data(sessions, emotions):
    """
    Process interview sessions and emotion data
    
    Args:
        sessions: List of interview session documents
        emotions: List of emotion analysis documents
        
    Returns:
        Processed data for prediction model
    """
    # Map emotions to sessions
    emotion_map = {}
    for emotion in emotions:
        session_id = emotion.get("session_id")
        if session_id:
            if session_id not in emotion_map:
                emotion_map[session_id] = []
            emotion_map[session_id].append(emotion)
    
    # Extract features from each session
    processed_data = []
    
    for session in sessions:
        session_id = session.get("session_id")
        session_emotions = emotion_map.get(session_id, [])
        
        # Basic session features
        role = session.get("role", "General")
        questions = session.get("questions", [])
        num_questions = len(questions)
        answers = session.get("answers", [])
        completed_questions = len(answers)
        
        # Calculate session completion rate
        completion_rate = completed_questions / max(1, num_questions)
        
        # Analyze emotion data
        avg_happiness = 0
        avg_sadness = 0
        avg_anger = 0
        avg_fear = 0
        avg_surprise = 0
        avg_disgust = 0
        avg_neutral = 0
        emotion_stability = 0
        
        if session_emotions:
            # Extract emotion metrics
            happiness_values = []
            sadness_values = []
            anger_values = []
            fear_values = []
            surprise_values = []
            disgust_values = []
            neutral_values = []
            
            for emotion in session_emotions:
                analysis = emotion.get("analysis", {})
                
                # Get emotion values
                happiness_values.append(analysis.get("happiness", 0))
                sadness_values.append(analysis.get("sadness", 0))
                anger_values.append(analysis.get("anger", 0))
                fear_values.append(analysis.get("fear", 0))
                surprise_values.append(analysis.get("surprise", 0))
                disgust_values.append(analysis.get("disgust", 0))
                neutral_values.append(analysis.get("neutral", 0))
            
            # Calculate averages
            if happiness_values:
                avg_happiness = sum(happiness_values) / len(happiness_values)
            if sadness_values:
                avg_sadness = sum(sadness_values) / len(sadness_values)
            if anger_values:
                avg_anger = sum(anger_values) / len(anger_values)
            if fear_values:
                avg_fear = sum(fear_values) / len(fear_values)
            if surprise_values:
                avg_surprise = sum(surprise_values) / len(surprise_values)
            if disgust_values:
                avg_disgust = sum(disgust_values) / len(disgust_values)
            if neutral_values:
                avg_neutral = sum(neutral_values) / len(neutral_values)
                
            # Calculate emotion stability (lower standard deviation = more stable)
            all_emotions = happiness_values + sadness_values + anger_values + fear_values + surprise_values + disgust_values + neutral_values
            if all_emotions:
                emotion_stability = 1.0 - min(1.0, np.std(all_emotions) / 0.3)  # Normalize to 0-1 scale
        
        # Text-based features from answers
        avg_answer_length = 0
        text_confidence = 0.5  # Default
        
        if answers:
            answer_texts = [answer.get("answer_text", "") for answer in answers]
            answer_lengths = [len(text.split()) for text in answer_texts if text]
            
            if answer_lengths:
                avg_answer_length = sum(answer_lengths) / len(answer_lengths)
                
                # Derive text confidence (longer answers generally indicate more confidence)
                text_confidence = min(1.0, avg_answer_length / 100)  # Normalize, cap at 1.0
        
        # Combine features
        session_data = {
            "session_id": session_id,
            "timestamp": session.get("timestamp", get_timestamp_str()),
            "role": role,
            "num_questions": num_questions,
            "completion_rate": completion_rate,
            "avg_answer_length": avg_answer_length,
            "text_confidence": text_confidence,
            "avg_happiness": avg_happiness,
            "avg_sadness": avg_sadness,
            "avg_anger": avg_anger,
            "avg_fear": avg_fear,
            "avg_surprise": avg_surprise,
            "avg_disgust": avg_disgust,
            "avg_neutral": avg_neutral,
            "emotion_stability": emotion_stability
        }
        
        processed_data.append(session_data)
    
    return processed_data

def predict_confidence(processed_data):
    """
    Generate confidence predictions using the processed interview data
    
    Args:
        processed_data: List of processed interview session data
        
    Returns:
        Dictionary with confidence predictions
    """
    # Convert to DataFrame for easier processing
    if not processed_data:
        return generate_default_prediction()
        
    df = pd.DataFrame(processed_data)
    
    # Create basic features for prediction
    features = df[['completion_rate', 'avg_answer_length', 'text_confidence', 
                  'avg_happiness', 'avg_sadness', 'avg_anger', 'avg_fear', 
                  'avg_surprise', 'avg_disgust', 'avg_neutral', 'emotion_stability']]
                  
    # Generate prediction using a simple rule-based model
    # (In a production app, you would use a properly trained ML model)
    
    # Verbal confidence: based on answer length and text confidence
    verbal_confidence = (0.6 * features['text_confidence'] + 
                        0.3 * np.clip(features['avg_answer_length'] / 150, 0, 1) +
                        0.1 * features['completion_rate'])
    
    # Nonverbal confidence: based on emotions
    nonverbal_confidence = (0.4 * features['avg_happiness'] + 
                           0.2 * features['emotion_stability'] +
                           0.2 * (1.0 - features['avg_fear']) +
                           0.2 * (1.0 - features['avg_sadness']))
    
    # Technical confidence: based on completion rate and answer quality
    technical_confidence = (0.5 * features['completion_rate'] +
                           0.3 * features['text_confidence'] +
                           0.2 * (1.0 - features['avg_surprise']))
    
    # Stress management: inverse of negative emotions
    stress_management = (0.4 * (1.0 - features['avg_fear']) +
                         0.3 * (1.0 - features['avg_anxiety'] if 'avg_anxiety' in features else 0.7) +
                         0.3 * features['emotion_stability'])
    
    # Problem solving: combination of technical and verbal
    problem_solving = (0.6 * technical_confidence +
                       0.4 * verbal_confidence)
    
    # Communication skills: combination of verbal and nonverbal
    communication_skills = (0.7 * verbal_confidence +
                           0.3 * nonverbal_confidence)
    
    # Adaptability: based on emotion stability and stress management
    adaptability = (0.5 * features['emotion_stability'] +
                   0.5 * stress_management)
    
    # Overall confidence: weighted average of all metrics
    overall_confidence = (0.3 * verbal_confidence +
                         0.3 * nonverbal_confidence +
                         0.2 * technical_confidence +
                         0.1 * stress_management +
                         0.1 * problem_solving)
    
    # Scale to 0-100 range
    verbal_confidence = verbal_confidence * 100
    nonverbal_confidence = nonverbal_confidence * 100
    technical_confidence = technical_confidence * 100
    stress_management = stress_management * 100
    problem_solving = problem_solving * 100
    communication_skills = communication_skills * 100
    adaptability = adaptability * 100
    overall_confidence = overall_confidence * 100
    
    # Interview success prediction: using overall confidence and other factors
    # Predict success probability (0-100%)
    interview_success = (0.4 * overall_confidence / 100 +
                        0.2 * verbal_confidence / 100 +
                        0.2 * technical_confidence / 100 +
                        0.1 * stress_management / 100 +
                        0.1 * communication_skills / 100) * 100
    
    # Return predictions
    predictions = {
        "verbal_confidence": verbal_confidence.to_list(),
        "nonverbal_confidence": nonverbal_confidence.to_list(),
        "technical_confidence": technical_confidence.to_list(),
        "stress_management": stress_management.to_list(),
        "problem_solving": problem_solving.to_list(),
        "communication_skills": communication_skills.to_list(),
        "adaptability": adaptability.to_list(),
        "overall_confidence": overall_confidence.to_list(),
        "predicted_interview_success": interview_success.to_list(),
        "timestamps": df['timestamp'].to_list(),
        "session_ids": df['session_id'].to_list()
    }
    
    return predictions

def format_prediction_for_charts(predictions):
    """
    Format prediction data for frontend charts
    
    Args:
        predictions: Dictionary with prediction metrics
        
    Returns:
        Formatted data for charts
    """
    # Prepare data for Line Chart
    line_chart_data = {
        "timestamps": predictions.get("timestamps", []),
        "metrics": {
            "verbal_confidence": predictions.get("verbal_confidence", []),
            "nonverbal_confidence": predictions.get("nonverbal_confidence", []),
            "technical_confidence": predictions.get("technical_confidence", []),
            "overall_confidence": predictions.get("overall_confidence", []),
            "predicted_interview_success": predictions.get("predicted_interview_success", [])
        }
    }
    
    # Prepare data for Radar Chart (latest values)
    radar_chart_data = {}
    for metric in ["verbal_confidence", "nonverbal_confidence", "technical_confidence", 
                  "stress_management", "problem_solving", "communication_skills", 
                  "adaptability", "overall_confidence"]:
        values = predictions.get(metric, [])
        if values:
            radar_chart_data[metric] = values[-1]  # Use the most recent value
        else:
            radar_chart_data[metric] = 60  # Default value
    
    # Prepare progress data (compare first and last values)
    progress_data = {}
    for metric in ["verbal_confidence", "nonverbal_confidence", "technical_confidence", 
                  "overall_confidence", "predicted_interview_success"]:
        values = predictions.get(metric, [])
        if len(values) >= 2:
            first_value = values[0]
            last_value = values[-1]
            change = last_value - first_value
            progress_data[metric] = {
                "first_value": first_value,
                "last_value": last_value,
                "change": change,
                "change_percent": (change / first_value) * 100 if first_value > 0 else 0
            }
        elif len(values) == 1:
            progress_data[metric] = {
                "first_value": values[0],
                "last_value": values[0],
                "change": 0,
                "change_percent": 0
            }
        else:
            progress_data[metric] = {
                "first_value": 60,
                "last_value": 60,
                "change": 0,
                "change_percent": 0
            }
    
    # Combine all chart data
    chart_data = {
        "line_chart": line_chart_data,
        "radar_chart": radar_chart_data,
        "progress": progress_data,
        "timestamps": predictions.get("timestamps", []),
        "session_ids": predictions.get("session_ids", [])
    }
    
    return chart_data

def generate_default_prediction():
    """Generate default prediction when no data is available"""
    # Get current timestamp
    timestamp = get_timestamp_str()
    
    # Default prediction values
    default_metrics = {
        "verbal_confidence": [60],
        "nonverbal_confidence": [60],
        "technical_confidence": [60],
        "stress_management": [60],
        "problem_solving": [60],
        "communication_skills": [60],
        "adaptability": [60],
        "overall_confidence": [60],
        "predicted_interview_success": [50],
        "timestamps": [timestamp],
        "session_ids": ["default"]
    }
    
    # Format for charts
    return format_prediction_for_charts(default_metrics) 