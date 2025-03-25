"""
Dashboard Controller

This module provides API endpoints for the gamified dashboard, handling data retrieval and 
updates for all dashboard-related functionalities.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from fastapi.responses import JSONResponse

from ..models.dashboard_models import (
    DashboardResponse, 
    UserActivityUpdate,
    UserProgressResponse,
    MarketInsightResponse,
    CareerPathResponse,
    SkillProgressUpdate,
    ResumeScoreResponse,
    BadgeResponse,
    LeaderboardResponse,
    CareerPredictionResponse,
    DashboardStatsUpdate
)
from ..utils.auth import get_current_user
from ..services.dashboard_service import DashboardService
from ...core.gamification import GamificationEngine, get_user_gamification_status

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{user_id}", response_model=DashboardResponse)
async def get_dashboard_data(
    user_id: str = Path(..., description="User ID"),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get complete dashboard data for a user
    
    Returns all necessary data for rendering the user's dashboard, including:
    - Resume scores
    - Badges
    - Skills progress
    - Career paths
    - Activity logs
    - Market insights
    """
    # Verify permissions (user can only access their own data unless admin)
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this dashboard")
    
    dashboard_service = DashboardService()
    try:
        dashboard_data = dashboard_service.get_complete_dashboard(user_id)
        
        # Track dashboard view activity in gamification system
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "view_dashboard",
            "description": "Viewed career dashboard",
            "dashboard_stats": {"dashboard_views": 1}
        })
        
        return dashboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard: {str(e)}")

@router.post("/{user_id}/activity", response_model=UserProgressResponse)
async def update_user_activity(
    user_id: str = Path(..., description="User ID"),
    activity_data: UserActivityUpdate = Body(...),
    current_user: Dict = Depends(get_current_user)
):
    """
    Record user activity on the dashboard
    
    Used to track features used, pages viewed, time spent, etc.
    This data feeds into the gamification system for XP awards and badges.
    """
    # Verify permissions
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user's activity")
    
    dashboard_service = DashboardService()
    try:
        # Update user activity and get updated progress
        progress_data = dashboard_service.record_user_activity(user_id, activity_data.dict())
        
        # Update gamification data based on activity
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": activity_data.activity_type,
            "description": activity_data.description,
            "dashboard_stats": activity_data.dashboard_stats.dict() if activity_data.dashboard_stats else {}
        })
        
        return progress_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating activity: {str(e)}")

@router.get("/{user_id}/market-insights", response_model=MarketInsightResponse)
async def get_market_insights(
    user_id: str = Path(..., description="User ID"),
    region: str = Query(None, description="Filter insights by region"),
    industry: str = Query(None, description="Filter insights by industry"),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get market insights relevant to the user's profile
    
    Returns job market data, salary information, and skill demand metrics
    that are personalized to the user's career profile.
    """
    # Permission check
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this data")
    
    dashboard_service = DashboardService()
    try:
        market_data = dashboard_service.get_market_insights(user_id, region, industry)
        
        # Track activity
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "use_feature",
            "description": "Viewed market insights",
            "dashboard_stats": {"insights_viewed": True}
        })
        
        return market_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving market insights: {str(e)}")

@router.get("/{user_id}/career-paths", response_model=CareerPathResponse)
async def get_career_paths(
    user_id: str = Path(..., description="User ID"),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get recommended career paths for the user
    
    Returns primary and alternative career paths based on the user's
    skills, experience, and preferences.
    """
    # Permission check
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this data")
    
    dashboard_service = DashboardService()
    try:
        career_paths = dashboard_service.get_career_paths(user_id)
        
        # Track activity
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "use_feature",
            "description": "Viewed career paths",
            "dashboard_stats": {"career_paths_viewed": True}
        })
        
        return career_paths
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving career paths: {str(e)}")

@router.post("/{user_id}/skills", response_model=Dict[str, Any])
async def update_skill_progress(
    user_id: str = Path(..., description="User ID"),
    skill_data: SkillProgressUpdate = Body(...),
    current_user: Dict = Depends(get_current_user)
):
    """
    Update user skill progress
    
    Record new skill acquisition or skill level improvements.
    Used for skill tracking and visualization on the dashboard.
    """
    # Permission check
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user's skills")
    
    dashboard_service = DashboardService()
    try:
        updated_skills = dashboard_service.update_skill_progress(
            user_id, 
            skill_data.category,
            skill_data.skill_name,
            skill_data.new_level
        )
        
        # Award XP for skill improvement
        gamification = GamificationEngine(user_id)
        xp_amount = 25  # Base XP for skill improvement
        improvement = skill_data.new_level - skill_data.previous_level if skill_data.previous_level else skill_data.new_level
        
        # More XP for bigger improvements
        if improvement > 10:
            xp_amount = 50
        if improvement > 20:
            xp_amount = 100
            
        gamification.add_experience_points(
            user_id,
            xp_amount,
            f"Improved {skill_data.skill_name} skill by {improvement} points"
        )
        
        # Update tracking stats
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "update_profile",
            "description": f"Updated {skill_data.skill_name} skill",
            "dashboard_stats": {"skill_tracking_days": 1}  # Increment tracking days
        })
        
        return {"success": True, "updated_skills": updated_skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating skill progress: {str(e)}")

@router.get("/{user_id}/resume-scores", response_model=ResumeScoreResponse)
async def get_resume_scores(
    user_id: str = Path(..., description="User ID"),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get resume score history
    
    Returns the complete history of resume scores and analytics for
    displaying resume improvement over time on the dashboard.
    """
    # Permission check
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this data")
    
    dashboard_service = DashboardService()
    try:
        resume_data = dashboard_service.get_resume_scores(user_id)
        
        # Track activity
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "use_feature",
            "description": "Viewed resume score history",
            "dashboard_stats": {}
        })
        
        return resume_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resume scores: {str(e)}")

@router.get("/{user_id}/badges", response_model=List[BadgeResponse])
async def get_badges(
    user_id: str = Path(..., description="User ID"),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get all user badges
    
    Returns complete badge information for the user, including earned
    and available badges with their requirements and rewards.
    """
    # Permission check
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this data")
    
    try:
        # Use the gamification engine directly
        gamification = GamificationEngine(user_id)
        badges = gamification.get_dashboard_badges()
        
        return badges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving badges: {str(e)}")

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    count: int = Query(10, description="Number of users to include in leaderboard"),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get global leaderboard
    
    Returns the top users ranked by XP, level, or other metrics.
    Used for the competitive gamification elements of the dashboard.
    """
    dashboard_service = DashboardService()
    try:
        leaderboard_data = dashboard_service.get_leaderboard(count)
        return leaderboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving leaderboard: {str(e)}")

@router.get("/{user_id}/career-prediction", response_model=CareerPredictionResponse)
async def get_career_prediction(
    user_id: str = Path(..., description="User ID"),
    current_user: Dict = Depends(get_current_user)
):
    """
    Get AI-powered career prediction for the user
    
    Returns career forecasting data based on the user's current skills,
    experience, and market trends.
    """
    # Permission check
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this data")
    
    dashboard_service = DashboardService()
    try:
        prediction = dashboard_service.get_career_prediction(user_id)
        
        # Track activity and potentially award decision-making badges
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "use_feature",
            "description": "Viewed career prediction",
            "dashboard_stats": {"analytics_based_decisions": 1}  # Increment analytics decisions counter
        })
        
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving career prediction: {str(e)}")

@router.post("/{user_id}/stats", response_model=Dict[str, Any])
async def update_dashboard_stats(
    user_id: str = Path(..., description="User ID"),
    stats_data: DashboardStatsUpdate = Body(...),
    current_user: Dict = Depends(get_current_user)
):
    """
    Update dashboard usage statistics
    
    Records user interaction with dashboard features for gamification
    and personalization purposes.
    """
    # Permission check
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user's stats")
    
    dashboard_service = DashboardService()
    try:
        updated_stats = dashboard_service.update_dashboard_stats(user_id, stats_data.dict())
        
        # Update gamification system
        gamification = GamificationEngine(user_id)
        gamification.update_dashboard_activity(user_id, {
            "activity_type": "use_feature",
            "description": "Dashboard interaction",
            "dashboard_stats": stats_data.dict()
        })
        
        return {"success": True, "updated_stats": updated_stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating dashboard stats: {str(e)}") 