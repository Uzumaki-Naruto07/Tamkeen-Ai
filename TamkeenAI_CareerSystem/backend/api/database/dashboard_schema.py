"""
Dashboard Database Schema

This module defines the database models for storing dashboard-related data.
"""

from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from . import Base

class DashboardStats(Base):
    """User dashboard usage statistics and preferences"""
    __tablename__ = "dashboard_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    dashboard_views = Column(Integer, default=0)
    last_visit = Column(DateTime, default=None)
    streak_days = Column(Integer, default=0)
    feature_usage = Column(JSON, default={})
    insights_viewed = Column(Boolean, default=False)
    career_paths_viewed = Column(Boolean, default=False)
    skill_tracking_days = Column(Integer, default=0)
    analytics_based_decisions = Column(Integer, default=0)
    dashboard_preferences = Column(JSON, default={})
    
    # Relationship
    user = relationship("User", back_populates="dashboard_stats")
    
class UserCareerPrediction(Base):
    """Stored career predictions for users"""
    __tablename__ = "user_career_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    predicted_roles = Column(JSON, default=[])
    alternate_paths = Column(JSON, default=[])
    market_alignment = Column(Integer)
    skill_gaps = Column(JSON, default=[])
    career_velocity = Column(Float)
    ai_generated = Column(Boolean, default=False)
    
    # Relationship
    user = relationship("User", back_populates="career_predictions")
    
class DashboardReport(Base):
    """Generated dashboard reports for users"""
    __tablename__ = "dashboard_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    report_type = Column(String)  # e.g., "monthly", "quarterly", "custom"
    report_data = Column(JSON)
    insights = Column(JSON, default=[])
    recommendations = Column(JSON, default=[])
    
    # Relationship
    user = relationship("User", back_populates="dashboard_reports") 