"""
Dashboard Models

This module defines the data models used for the dashboard API endpoints.
"""

from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime

# User activity models
class DashboardStats(BaseModel):
    """Dashboard usage statistics"""
    dashboard_views: Optional[int] = Field(None, description="Number of times the dashboard has been viewed")
    insights_viewed: Optional[bool] = Field(None, description="Whether market insights have been viewed")
    skill_tracking_days: Optional[int] = Field(None, description="Days of consecutive skill tracking")
    analytics_based_decisions: Optional[int] = Field(None, description="Number of decisions made using analytics")
    features_used: Optional[Dict[str, int]] = Field(None, description="Count of each feature's usage")
    career_paths_viewed: Optional[bool] = Field(None, description="Whether career paths have been viewed")
    
class UserActivityUpdate(BaseModel):
    """User activity data for dashboard interaction"""
    activity_type: str = Field(..., description="Type of activity (view_dashboard, use_feature, etc.)")
    description: str = Field(..., description="Description of the activity")
    timestamp: Optional[datetime] = Field(None, description="When the activity occurred")
    feature: Optional[str] = Field(None, description="Dashboard feature being used")
    time_spent: Optional[int] = Field(None, description="Time spent in seconds")
    dashboard_stats: Optional[DashboardStats] = Field(None, description="Dashboard usage statistics")

# Skill progress models
class SkillData(BaseModel):
    """Data for a single skill"""
    current: int = Field(..., description="Current skill level (0-100)")
    history: List[int] = Field(..., description="Historical skill levels")
    target: int = Field(..., description="Target skill level")
    
class SkillCategoryData(BaseModel):
    """Data for a skill category (e.g., Technical Skills)"""
    __root__: Dict[str, SkillData]

class SkillProgressUpdate(BaseModel):
    """Data for updating a skill's progress"""
    category: str = Field(..., description="Skill category (Technical Skills, Soft Skills, etc.)")
    skill_name: str = Field(..., description="Name of the skill being updated")
    new_level: int = Field(..., description="New skill level (0-100)")
    previous_level: Optional[int] = Field(None, description="Previous skill level")
    
# Resume models
class ResumeScore(BaseModel):
    """Single resume score entry"""
    date: Union[datetime, str] = Field(..., description="When the score was recorded")
    score: int = Field(..., description="Resume score (0-100)")
    version: int = Field(..., description="Resume version number")
    
class ResumeScoreResponse(BaseModel):
    """Complete resume score history"""
    scores: List[ResumeScore] = Field(..., description="List of resume scores")
    average_improvement: Optional[float] = Field(None, description="Average improvement per version")
    latest_score: Optional[int] = Field(None, description="Most recent score")
    total_versions: int = Field(..., description="Total number of resume versions")
    
# Badge models
class BadgeResponse(BaseModel):
    """Badge information"""
    id: str = Field(..., description="Unique badge ID")
    name: str = Field(..., description="Badge name")
    description: str = Field(..., description="Badge description")
    earned: bool = Field(..., description="Whether the badge has been earned")
    date: Optional[Union[datetime, str]] = Field(None, description="When the badge was earned")
    rarity: str = Field(..., description="Badge rarity (common, uncommon, rare, epic, legendary)")
    xp: int = Field(..., description="XP rewarded for earning the badge")
    category: str = Field(..., description="Badge category")
    
# Career path models
class CareerRole(BaseModel):
    """Career role information"""
    role: str = Field(..., description="Job title/role")
    description: Optional[str] = Field(None, description="Role description")
    required_skills: Optional[List[str]] = Field(None, description="Skills required for this role")
    
class CareerPath(BaseModel):
    """Career path information"""
    path_name: str = Field(..., description="Name of the career path")
    compatibility: int = Field(..., description="Path compatibility with user (0-100)")
    entry_roles: List[CareerRole] = Field(..., description="Entry-level roles")
    mid_roles: List[CareerRole] = Field(..., description="Mid-level roles")
    advanced_roles: List[CareerRole] = Field(..., description="Advanced/senior roles")
    
class CareerPathResponse(BaseModel):
    """Career paths response"""
    primary_path: CareerPath = Field(..., description="Primary recommended career path")
    alternative_paths: List[CareerPath] = Field(..., description="Alternative career paths")
    skill_gaps: Dict[str, List[str]] = Field(..., description="Skill gaps for each path")
    
# Market insight models
class SalaryData(BaseModel):
    """Salary information"""
    role: str = Field(..., description="Job title/role")
    median: int = Field(..., description="Median salary")
    range_low: int = Field(..., description="Lower salary range")
    range_high: int = Field(..., description="Upper salary range")
    experience_factor: float = Field(..., description="Experience multiplier")

class RegionalDemand(BaseModel):
    """Regional job demand information"""
    region: str = Field(..., description="Region name")
    demand_score: int = Field(..., description="Demand score (0-100)")
    growth_rate: float = Field(..., description="Annual growth rate")
    job_count: int = Field(..., description="Number of job postings")
    
class SkillDemand(BaseModel):
    """Skill demand information"""
    skill: str = Field(..., description="Skill name")
    demand_score: int = Field(..., description="Demand score (0-100)")
    growth_rate: float = Field(..., description="Annual growth rate")
    job_frequency: float = Field(..., description="Percentage of job postings requiring this skill")
    
class MarketInsightResponse(BaseModel):
    """Market insights response"""
    salary_data: List[SalaryData] = Field(..., description="Salary information for relevant roles")
    regional_demand: List[RegionalDemand] = Field(..., description="Job demand by region")
    skill_demand: List[SkillDemand] = Field(..., description="Demand for relevant skills")
    industry_trends: Dict[str, Any] = Field(..., description="Industry trends and insights")
    
# Leaderboard models
class LeaderboardEntry(BaseModel):
    """Single leaderboard entry"""
    rank: int = Field(..., description="Rank position")
    user_id: str = Field(..., description="User ID")
    display_name: str = Field(..., description="User display name")
    level: int = Field(..., description="User level")
    xp: int = Field(..., description="Total XP")
    badges_count: int = Field(..., description="Number of badges earned")
    
class LeaderboardResponse(BaseModel):
    """Leaderboard response"""
    entries: List[LeaderboardEntry] = Field(..., description="Leaderboard entries")
    total_users: int = Field(..., description="Total number of users")
    user_position: Optional[LeaderboardEntry] = Field(None, description="Requesting user's position")
    
# Career prediction models
class CareerPredictionRole(BaseModel):
    """Predicted career role"""
    role: str = Field(..., description="Job title/role")
    timeline: str = Field(..., description="When this role might be achieved")
    probability: int = Field(..., description="Probability percentage")
    skill_match: int = Field(..., description="Current skill match percentage")
    
class AlternatePath(BaseModel):
    """Alternative career path"""
    path: str = Field(..., description="Path name/title")
    compatibility: int = Field(..., description="Compatibility percentage")
    required_skills: List[str] = Field(..., description="Required skills for this path")
    
class CareerPredictionResponse(BaseModel):
    """Career prediction response"""
    predicted_roles: List[CareerPredictionRole] = Field(..., description="Predicted career progression")
    alternate_paths: List[AlternatePath] = Field(..., description="Alternative career paths")
    market_alignment: int = Field(..., description="Market alignment percentage")
    skill_gaps: List[str] = Field(..., description="Skills to develop")
    career_velocity: float = Field(..., description="Career progression speed (1-10)")
    
# Dashboard stats update model
class DashboardStatsUpdate(BaseModel):
    """Data for updating dashboard stats"""
    feature_used: Optional[str] = Field(None, description="Dashboard feature that was used")
    time_spent: Optional[int] = Field(None, description="Time spent on dashboard in seconds")
    sections_viewed: Optional[List[str]] = Field(None, description="Dashboard sections that were viewed")
    dashboard_opens: Optional[int] = Field(None, description="Times the dashboard has been opened")
    
# User progress response
class UserProgressResponse(BaseModel):
    """User progress data"""
    level: int = Field(..., description="Current user level")
    xp: int = Field(..., description="Total XP")
    xp_to_next_level: int = Field(..., description="XP needed for next level")
    badges_earned: int = Field(..., description="Number of badges earned")
    badges_total: int = Field(..., description="Total available badges")
    recent_achievements: List[Dict[str, Any]] = Field(..., description="Recent user achievements")
    skill_completion: Dict[str, int] = Field(..., description="Percentage completion for each skill category")
    
# Complete dashboard response
class DashboardResponse(BaseModel):
    """Complete dashboard data response"""
    user_progress: UserProgressResponse = Field(..., description="User progress data")
    resume_scores: ResumeScoreResponse = Field(..., description="Resume score history")
    badges: List[BadgeResponse] = Field(..., description="User badges")
    skill_progress: Dict[str, Dict[str, SkillData]] = Field(..., description="Skill progress data")
    career_paths: CareerPathResponse = Field(..., description="Career path recommendations")
    market_insights: MarketInsightResponse = Field(..., description="Market insights data")
    activity_log: List[Dict[str, Any]] = Field(..., description="User activity log")
    leaderboard_position: Optional[int] = Field(None, description="User position on leaderboard")
    career_prediction: CareerPredictionResponse = Field(..., description="AI career prediction") 