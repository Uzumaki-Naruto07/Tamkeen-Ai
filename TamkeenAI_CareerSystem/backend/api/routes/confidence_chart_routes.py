from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from ..database.connector import get_collection
from ..models.confidence_models import generate_confidence_prediction

logger = logging.getLogger(__name__)

confidence_charts = Blueprint('confidence_charts', __name__, url_prefix='/api/confidence')

@confidence_charts.route('/prediction', methods=['POST'])
@jwt_required()
def get_confidence_prediction():
    """
    Generate confidence prediction based on user's past interview performance
    
    Request JSON:
    {
        "interview_data": []  # Optional past interview data, if not provided will use from DB
        "timeframe": "30d"    # Optional timeframe (7d, 30d, 90d, all)
    }
    
    Returns:
        JSON with confidence prediction data for charting
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        timeframe = data.get('timeframe', '30d')
        interview_data = data.get('interview_data')
        
        # If interview data not provided, retrieve from database
        if not interview_data:
            # Set date filter based on timeframe
            date_filter = None
            if timeframe != 'all':
                days = int(timeframe.replace('d', ''))
                date_filter = (datetime.now() - timedelta(days=days)).isoformat()
            
            # Get interview data
            query = {"user_id": user_id}
            if date_filter:
                query["timestamp"] = {"$gte": date_filter}
                
            interview_collection = get_collection('interview_sessions')
            emotion_collection = get_collection('emotion_analysis')
            
            # Get interview sessions
            interview_docs = list(interview_collection.find(query))
            
            # Get emotion analysis data
            emotion_docs = []
            if interview_docs:
                session_ids = [doc.get('session_id') for doc in interview_docs]
                emotion_docs = list(emotion_collection.find({"session_id": {"$in": session_ids}}))
            
            # Combine data
            interview_data = {
                "sessions": interview_docs,
                "emotions": emotion_docs
            }
        
        # Generate confidence prediction
        prediction_data = generate_confidence_prediction(user_id, interview_data)
        
        return jsonify({
            "success": True,
            "prediction_data": prediction_data
        })
        
    except Exception as e:
        logger.error(f"Error generating confidence prediction: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@confidence_charts.route('/trends', methods=['GET'])
@jwt_required()
def get_confidence_trends():
    """
    Get confidence trends over time for visualization
    
    Query parameters:
    - timeframe: 7d, 30d, 90d, all (default: 30d)
    - metrics: comma-separated list of metrics to include (default: all)
    
    Returns:
        JSON with trends data for charting
    """
    try:
        user_id = get_jwt_identity()
        timeframe = request.args.get('timeframe', '30d')
        metrics = request.args.get('metrics', 'all')
        
        if metrics != 'all':
            metrics = metrics.split(',')
        
        # Set date filter based on timeframe
        date_filter = None
        if timeframe != 'all':
            days = int(timeframe.replace('d', ''))
            date_filter = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Query confidence metrics collection
        query = {"user_id": user_id}
        if date_filter:
            query["timestamp"] = {"$gte": date_filter}
            
        metrics_collection = get_collection('confidence_metrics')
        metrics_docs = list(metrics_collection.find(query))
        
        # Process data for charts
        chart_data = {
            "timestamps": [],
            "metrics": {}
        }
        
        # Initialize metrics
        available_metrics = [
            "verbal_confidence", 
            "nonverbal_confidence",
            "technical_confidence", 
            "overall_confidence",
            "predicted_interview_success"
        ]
        
        for metric in available_metrics:
            chart_data["metrics"][metric] = []
        
        # Populate data
        for doc in metrics_docs:
            # Add timestamp
            timestamp = doc.get("timestamp", "")
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            chart_data["timestamps"].append(timestamp.isoformat())
            
            # Add metrics
            for metric in available_metrics:
                if metrics == 'all' or metric in metrics:
                    chart_data["metrics"][metric].append(doc.get(metric, 0))
        
        # Generate the trend line (simple moving average)
        if len(chart_data["timestamps"]) > 1:
            for metric in chart_data["metrics"]:
                values = chart_data["metrics"][metric]
                window_size = min(3, len(values))
                
                # Apply moving average for smoothing
                if window_size > 1:
                    smoothed = []
                    for i in range(len(values)):
                        window_start = max(0, i - window_size + 1)
                        window = values[window_start:i+1]
                        smoothed.append(sum(window) / len(window))
                    
                    chart_data["metrics"][f"{metric}_trend"] = smoothed
        
        return jsonify({
            "success": True,
            "chart_data": chart_data
        })
        
    except Exception as e:
        logger.error(f"Error retrieving confidence trends: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@confidence_charts.route('/breakdown', methods=['GET'])
@jwt_required()
def get_confidence_breakdown():
    """
    Get confidence breakdown by category for radar/spider charts
    
    Returns:
        JSON with confidence breakdown data
    """
    try:
        user_id = get_jwt_identity()
        
        # Get latest confidence metrics
        metrics_collection = get_collection('confidence_metrics')
        latest_metrics = metrics_collection.find_one(
            {"user_id": user_id},
            sort=[("timestamp", -1)]
        )
        
        if not latest_metrics:
            # Generate default metrics if none exist
            breakdown = {
                "verbal_confidence": 60,
                "nonverbal_confidence": 60,
                "technical_confidence": 60,
                "stress_management": 60,
                "problem_solving": 60,
                "communication_skills": 60,
                "adaptability": 60,
                "overall_confidence": 60
            }
        else:
            # Extract metrics from document
            breakdown = {
                "verbal_confidence": latest_metrics.get("verbal_confidence", 60),
                "nonverbal_confidence": latest_metrics.get("nonverbal_confidence", 60),
                "technical_confidence": latest_metrics.get("technical_confidence", 60),
                "stress_management": latest_metrics.get("stress_management", 60),
                "problem_solving": latest_metrics.get("problem_solving", 60),
                "communication_skills": latest_metrics.get("communication_skills", 60),
                "adaptability": latest_metrics.get("adaptability", 60),
                "overall_confidence": latest_metrics.get("overall_confidence", 60)
            }
        
        return jsonify({
            "success": True,
            "breakdown": breakdown
        })
        
    except Exception as e:
        logger.error(f"Error retrieving confidence breakdown: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@confidence_charts.route('/compare', methods=['POST'])
@jwt_required()
def compare_confidence():
    """
    Compare confidence with industry average or specific job requirements
    
    Request JSON:
    {
        "compare_type": "industry" or "job",
        "industry": "technology" or other industry name (required if compare_type is industry),
        "job_id": job ID (required if compare_type is job)
    }
    
    Returns:
        JSON with comparison data for visualization
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        compare_type = data.get('compare_type', 'industry')
        industry = data.get('industry')
        job_id = data.get('job_id')
        
        # Validate request
        if compare_type == 'industry' and not industry:
            return jsonify({
                "success": False,
                "error": "Industry name is required for industry comparison"
            }), 400
            
        if compare_type == 'job' and not job_id:
            return jsonify({
                "success": False,
                "error": "Job ID is required for job comparison"
            }), 400
        
        # Get user's confidence metrics
        metrics_collection = get_collection('confidence_metrics')
        latest_metrics = metrics_collection.find_one(
            {"user_id": user_id},
            sort=[("timestamp", -1)]
        )
        
        if not latest_metrics:
            # Generate default metrics if none exist
            user_metrics = {
                "verbal_confidence": 60,
                "nonverbal_confidence": 60,
                "technical_confidence": 60,
                "stress_management": 60,
                "problem_solving": 60,
                "communication_skills": 60,
                "overall_confidence": 60
            }
        else:
            # Extract metrics from document
            user_metrics = {
                "verbal_confidence": latest_metrics.get("verbal_confidence", 60),
                "nonverbal_confidence": latest_metrics.get("nonverbal_confidence", 60),
                "technical_confidence": latest_metrics.get("technical_confidence", 60),
                "stress_management": latest_metrics.get("stress_management", 60),
                "problem_solving": latest_metrics.get("problem_solving", 60),
                "communication_skills": latest_metrics.get("communication_skills", 60),
                "overall_confidence": latest_metrics.get("overall_confidence", 60)
            }
        
        # Get comparison data
        comparison_data = {}
        
        if compare_type == 'industry':
            # Get industry average metrics
            industry_metrics = get_industry_averages(industry)
            comparison_data = {
                "type": "industry",
                "name": industry,
                "user_metrics": user_metrics,
                "comparison_metrics": industry_metrics
            }
        else:
            # Get job requirements metrics
            job_collection = get_collection('jobs')
            job = job_collection.find_one({"_id": job_id})
            
            if not job:
                return jsonify({
                    "success": False,
                    "error": f"Job with ID {job_id} not found"
                }), 404
                
            job_metrics = get_job_confidence_requirements(job)
            comparison_data = {
                "type": "job",
                "name": job.get("title", ""),
                "user_metrics": user_metrics,
                "comparison_metrics": job_metrics
            }
        
        return jsonify({
            "success": True,
            "comparison_data": comparison_data
        })
        
    except Exception as e:
        logger.error(f"Error comparing confidence metrics: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Helper functions

def get_industry_averages(industry):
    """Get average confidence metrics for an industry"""
    # In a real application, this would come from a database
    # For demonstration, we'll return mock data
    industry_averages = {
        "technology": {
            "verbal_confidence": 75,
            "nonverbal_confidence": 65,
            "technical_confidence": 85,
            "stress_management": 70,
            "problem_solving": 80,
            "communication_skills": 75,
            "overall_confidence": 75
        },
        "healthcare": {
            "verbal_confidence": 80,
            "nonverbal_confidence": 75,
            "technical_confidence": 70,
            "stress_management": 85,
            "problem_solving": 75,
            "communication_skills": 85,
            "overall_confidence": 80
        },
        "finance": {
            "verbal_confidence": 85,
            "nonverbal_confidence": 80,
            "technical_confidence": 75,
            "stress_management": 70,
            "problem_solving": 85,
            "communication_skills": 80,
            "overall_confidence": 80
        }
    }
    
    # Default industry if not found
    return industry_averages.get(industry.lower(), {
        "verbal_confidence": 70,
        "nonverbal_confidence": 70,
        "technical_confidence": 70,
        "stress_management": 70,
        "problem_solving": 70,
        "communication_skills": 70,
        "overall_confidence": 70
    })

def get_job_confidence_requirements(job):
    """Extract confidence requirements from job details"""
    # In a real application, this would be derived from the job data
    # For demonstration, we'll use a simple mapping based on seniority
    seniority = job.get("seniority", "").lower()
    
    requirements = {
        "entry": {
            "verbal_confidence": 60,
            "nonverbal_confidence": 60,
            "technical_confidence": 65,
            "stress_management": 60,
            "problem_solving": 65,
            "communication_skills": 70,
            "overall_confidence": 65
        },
        "mid": {
            "verbal_confidence": 70,
            "nonverbal_confidence": 70,
            "technical_confidence": 75,
            "stress_management": 70,
            "problem_solving": 75,
            "communication_skills": 75,
            "overall_confidence": 75
        },
        "senior": {
            "verbal_confidence": 80,
            "nonverbal_confidence": 75,
            "technical_confidence": 85,
            "stress_management": 80,
            "problem_solving": 85,
            "communication_skills": 80,
            "overall_confidence": 85
        },
        "executive": {
            "verbal_confidence": 90,
            "nonverbal_confidence": 85,
            "technical_confidence": 80,
            "stress_management": 90,
            "problem_solving": 90,
            "communication_skills": 90,
            "overall_confidence": 90
        }
    }
    
    # Default to mid-level if not specified
    level = "mid"
    if "entry" in seniority or "junior" in seniority:
        level = "entry"
    elif "senior" in seniority or "lead" in seniority:
        level = "senior"
    elif "executive" in seniority or "director" in seniority or "chief" in seniority:
        level = "executive"
        
    return requirements.get(level) 