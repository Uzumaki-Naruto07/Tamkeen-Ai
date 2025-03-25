"""
Gamification Module

This module implements the gamification features of the Tamkeen AI Career Intelligence System,
including XP tracking, badges, levels, and achievements.
"""

import os
import json
import math
import time
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import settings
from config.settings import BASE_DIR

# Define paths for gamification data
BADGES_DIR = os.path.join(BASE_DIR, 'data', 'gamification', 'badges')
LEVELS_DIR = os.path.join(BASE_DIR, 'data', 'gamification', 'levels')
os.makedirs(BADGES_DIR, exist_ok=True)
os.makedirs(LEVELS_DIR, exist_ok=True)


class GamificationEngine:
    """Main class for managing gamification features"""
    
    def __init__(self, user_id: str):
        """
        Initialize the gamification engine for a specific user
        
        Args:
            user_id: User ID for tracking progress
        """
        self.user_id = user_id
        self.xp_data = self._load_xp_data()
        self.badges = self._load_badges()
        self.levels = self._load_levels()
    
    def _load_xp_data(self) -> Dict[str, Any]:
        """Load user XP data from storage"""
        xp_data = {
            "total_xp": 0,
            "current_level": 1,
            "xp_to_next_level": 100,
            "xp_history": [],
            "last_updated": datetime.now().isoformat()
        }
        
        xp_file = os.path.join(BASE_DIR, 'data', 'users', f"{self.user_id}_xp.json")
        try:
            if os.path.exists(xp_file):
                with open(xp_file, 'r', encoding='utf-8') as f:
                    xp_data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading XP data: {e}")
        
        return xp_data
    
    def _save_xp_data(self) -> bool:
        """Save user XP data to storage"""
        xp_file = os.path.join(BASE_DIR, 'data', 'users', f"{self.user_id}_xp.json")
        os.makedirs(os.path.dirname(xp_file), exist_ok=True)
        
        try:
            with open(xp_file, 'w', encoding='utf-8') as f:
                json.dump(self.xp_data, f, indent=2)
            return True
        except IOError as e:
            print(f"Error saving XP data: {e}")
            return False
    
    def _load_badges(self) -> Dict[str, Dict[str, Any]]:
        """Load badge definitions and user's earned badges"""
        badges = {}
        user_badges = {}
        
        # Load all badge definitions
        try:
            for filename in os.listdir(BADGES_DIR):
                if filename.endswith('.json'):
                    badge_id = os.path.splitext(filename)[0]
                    with open(os.path.join(BADGES_DIR, filename), 'r', encoding='utf-8') as f:
                        badges[badge_id] = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading badges: {e}")
            
            # Create default badges if none exist
            badges = {
                "profile_complete": {
                    "id": "profile_complete",
                    "name": "Profile Master",
                    "description": "Completed your profile with all information",
                    "icon": "profile_complete_icon.png",
                    "xp_reward": 50,
                    "category": "profile",
                    "tier": "bronze"
                },
                "resume_uploaded": {
                    "id": "resume_uploaded",
                    "name": "Resume Ready",
                    "description": "Uploaded your first resume",
                    "icon": "resume_uploaded_icon.png",
                    "xp_reward": 30,
                    "category": "resume",
                    "tier": "bronze"
                },
                "job_match_70": {
                    "id": "job_match_70",
                    "name": "Job Matcher",
                    "description": "Achieved a 70% match with a job description",
                    "icon": "job_matcher_icon.png",
                    "xp_reward": 100,
                    "category": "job",
                    "tier": "silver"
                },
                "skill_master": {
                    "id": "skill_master",
                    "name": "Skill Master",
                    "description": "Added 10 or more skills to your profile",
                    "icon": "skill_master_icon.png",
                    "xp_reward": 80,
                    "category": "skill",
                    "tier": "silver"
                },
                "interview_ace": {
                    "id": "interview_ace",
                    "name": "Interview Ace",
                    "description": "Scored 80% or higher on an interview assessment",
                    "icon": "interview_ace_icon.png",
                    "xp_reward": 150,
                    "category": "interview",
                    "tier": "gold"
                },
                "career_planner": {
                    "id": "career_planner",
                    "name": "Career Planner",
                    "description": "Created a 5-year career development plan",
                    "icon": "career_planner_icon.png",
                    "xp_reward": 120,
                    "category": "planning",
                    "tier": "gold"
                },
                "feedback_guru": {
                    "id": "feedback_guru",
                    "name": "Feedback Guru",
                    "description": "Provided feedback on 5 different system features",
                    "icon": "feedback_guru_icon.png",
                    "xp_reward": 60,
                    "category": "engagement",
                    "tier": "bronze"
                },
                "career_explorer": {
                    "id": "career_explorer",
                    "name": "Career Explorer",
                    "description": "Explored 10 different career paths",
                    "icon": "career_explorer_icon.png",
                    "xp_reward": 90,
                    "category": "exploration",
                    "tier": "silver"
                },
                # Add dashboard-specific badges for system integration
                "dashboard_explorer": {
                    "id": "dashboard_explorer",
                    "name": "Dashboard Explorer",
                    "description": "Used all main features of the career dashboard",
                    "icon": "dashboard_explorer_icon.png",
                    "xp_reward": 50,
                    "category": "engagement",
                    "tier": "bronze"
                },
                "insight_seeker": {
                    "id": "insight_seeker",
                    "name": "Insight Seeker",
                    "description": "Viewed advanced analytics and career insights",
                    "icon": "insight_seeker_icon.png",
                    "xp_reward": 40,
                    "category": "engagement",
                    "tier": "bronze"
                },
                "progress_tracker": {
                    "id": "progress_tracker",
                    "name": "Progress Tracker",
                    "description": "Tracked skill development over 30 days",
                    "icon": "progress_tracker_icon.png",
                    "xp_reward": 60,
                    "category": "engagement",
                    "tier": "silver"
                },
                "data_driven": {
                    "id": "data_driven", 
                    "name": "Data Driven",
                    "description": "Made career decisions based on dashboard analytics",
                    "icon": "data_driven_icon.png",
                    "xp_reward": 75,
                    "category": "engagement",
                    "tier": "silver"
                }
            }
        
        # Load user's earned badges
        user_badges_file = os.path.join(BASE_DIR, 'data', 'users', f"{self.user_id}_badges.json")
        try:
            if os.path.exists(user_badges_file):
                with open(user_badges_file, 'r', encoding='utf-8') as f:
                    user_badges = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading user badges: {e}")
            user_badges = {
                "earned_badges": [],
                "last_updated": datetime.now().isoformat()
            }
        
        # Combine badge definitions with user's earned status
        for badge_id, badge in badges.items():
            badge["earned"] = badge_id in user_badges.get("earned_badges", [])
            badge["earned_date"] = next((item["earned_date"] for item in user_badges.get("earned_details", []) 
                                        if item["badge_id"] == badge_id), None)
        
        return badges
    
    def _load_levels(self) -> Dict[int, Dict[str, Any]]:
        """Load level definitions"""
        levels = {}
        
        try:
            levels_file = os.path.join(LEVELS_DIR, 'levels.json')
            if os.path.exists(levels_file):
                with open(levels_file, 'r', encoding='utf-8') as f:
                    levels = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading levels: {e}")
            
            # Create default level progression if none exists
            levels = {
                "1": {"name": "Beginner", "xp_required": 0, "icon": "level1_icon.png", "benefits": ["Access to basic resume analysis"]},
                "2": {"name": "Explorer", "xp_required": 100, "icon": "level2_icon.png", "benefits": ["Access to job matching"]},
                "3": {"name": "Pathfinder", "xp_required": 250, "icon": "level3_icon.png", "benefits": ["Access to career path recommendations"]},
                "4": {"name": "Achiever", "xp_required": 500, "icon": "level4_icon.png", "benefits": ["Access to interview practice"]},
                "5": {"name": "Strategist", "xp_required": 1000, "icon": "level5_icon.png", "benefits": ["Access to detailed analytics"]},
                "6": {"name": "Mentor", "xp_required": 2000, "icon": "level6_icon.png", "benefits": ["Access to extended visualizations"]},
                "7": {"name": "Expert", "xp_required": 3500, "icon": "level7_icon.png", "benefits": ["Access to expert mode features"]},
                "8": {"name": "Visionary", "xp_required": 5000, "icon": "level8_icon.png", "benefits": ["Access to advanced simulations"]},
                "9": {"name": "Master", "xp_required": 7500, "icon": "level9_icon.png", "benefits": ["Access to mastery features"]},
                "10": {"name": "Career Guru", "xp_required": 10000, "icon": "level10_icon.png", "benefits": ["Access to all premium features"]}
            }
            
            # Save default levels
            os.makedirs(LEVELS_DIR, exist_ok=True)
            try:
                with open(levels_file, 'w', encoding='utf-8') as f:
                    json.dump(levels, f, indent=2)
            except IOError:
                pass
        
        return levels
    
    def _save_user_badges(self, earned_badges: List[Dict[str, Any]]) -> bool:
        """Save user's earned badges to storage"""
        user_badges_file = os.path.join(BASE_DIR, 'data', 'users', f"{self.user_id}_badges.json")
        os.makedirs(os.path.dirname(user_badges_file), exist_ok=True)
        
        # Extract just the badge IDs for the simple list
        badge_ids = [badge["badge_id"] for badge in earned_badges]
        
        data = {
            "earned_badges": badge_ids,
            "earned_details": earned_badges,
            "last_updated": datetime.now().isoformat()
        }
        
        try:
            with open(user_badges_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            return True
        except IOError as e:
            print(f"Error saving user badges: {e}")
            return False
    
    def add_xp(self, amount: int, source: str, details: Optional[str] = None) -> Dict[str, Any]:
        """
        Add XP to the user's account and check for level changes
        
        Args:
            amount: Amount of XP to add
            source: Source of the XP (e.g., "resume_upload", "interview_completion")
            details: Additional details about the XP gain
            
        Returns:
            dict: Updated XP information including level changes
        """
        if amount <= 0:
            return {"success": False, "error": "XP amount must be positive"}
        
        # Record current level
        old_level = self.xp_data["current_level"]
        
        # Add XP to total
        self.xp_data["total_xp"] += amount
        
        # Add to history
        history_entry = {
            "amount": amount,
            "source": source,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.xp_data["xp_history"].append(history_entry)
        
        # Check for level changes
        self._update_level()
        
        # Determine if level up occurred
        new_level = self.xp_data["current_level"]
        level_up = new_level > old_level
        
        # Update last updated time
        self.xp_data["last_updated"] = datetime.now().isoformat()
        
        # Save XP data
        self._save_xp_data()
        
        # Return updated information
        result = {
            "success": True,
            "total_xp": self.xp_data["total_xp"],
            "level": self.xp_data["current_level"],
            "level_up": level_up,
            "xp_to_next_level": self.xp_data["xp_to_next_level"],
            "xp_added": amount
        }
        
        # Add level up information if occurred
        if level_up:
            result["levels_gained"] = new_level - old_level
            result["new_level_name"] = self.levels.get(str(new_level), {}).get("name", f"Level {new_level}")
            result["new_benefits"] = self.levels.get(str(new_level), {}).get("benefits", [])
        
        return result
    
    def _update_level(self) -> int:
        """
        Update the user's level based on their XP
        
        Returns:
            int: The updated level
        """
        current_xp = self.xp_data["total_xp"]
        current_level = 1
        
        # Find the highest level that the user has enough XP for
        for level_id, level_data in sorted(self.levels.items(), key=lambda x: int(x[0])):
            if current_xp >= level_data["xp_required"]:
                current_level = int(level_id)
            else:
                break
        
        # Update level information
        self.xp_data["current_level"] = current_level
        
        # Calculate XP to next level
        next_level = str(current_level + 1)
        if next_level in self.levels:
            next_level_xp = self.levels[next_level]["xp_required"]
            self.xp_data["xp_to_next_level"] = next_level_xp - current_xp
        else:
            # Max level reached
            self.xp_data["xp_to_next_level"] = 0
        
        return current_level
    
    def award_badge(self, badge_id: str) -> Dict[str, Any]:
        """
        Award a badge to the user
        
        Args:
            badge_id: ID of the badge to award
            
        Returns:
            dict: Result of the badge award operation
        """
        # Check if badge exists
        if badge_id not in self.badges:
            return {
                "success": False,
                "error": f"Badge {badge_id} does not exist"
            }
        
        # Check if already earned
        if self.badges[badge_id].get("earned", False):
            return {
                "success": False,
                "error": f"Badge {badge_id} already earned",
                "badge_info": self.badges[badge_id]
            }
        
        # Award badge
        self.badges[badge_id]["earned"] = True
        earned_date = datetime.now().isoformat()
        self.badges[badge_id]["earned_date"] = earned_date
        
        # Get badge details
        badge_info = self.badges[badge_id].copy()
        
        # Create list of earned badges for saving
        earned_badges = []
        for b_id, badge in self.badges.items():
            if badge.get("earned", False):
                earned_badges.append({
                    "badge_id": b_id,
                    "earned_date": badge.get("earned_date", earned_date)
                })
        
        # Save badges
        self._save_user_badges(earned_badges)
        
        # Award XP if applicable
        xp_reward = badge_info.get("xp_reward", 0)
        xp_result = {}
        if xp_reward > 0:
            xp_result = self.add_xp(
                amount=xp_reward,
                source="badge_earned",
                details=f"Earned badge: {badge_info['name']}"
            )
        
        return {
            "success": True,
            "badge_info": badge_info,
            "xp_awarded": xp_reward,
            "xp_result": xp_result
        }
    
    def check_badge_eligibility(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Check if user is eligible for any unearned badges
        
        Args:
            user_data: User profile and activity data
            
        Returns:
            list: List of badges that the user is now eligible for
        """
        eligible_badges = []
        
        # Example badge eligibility checks - implement your own logic based on your data
        # Profile completeness badge
        if (badge_id := "profile_complete") in self.badges and not self.badges[badge_id].get("earned", False):
            if user_data.get("profile_completeness", 0) >= 90:
                eligible_badges.append(self.badges[badge_id])
        
        # Resume upload badge
        if (badge_id := "resume_uploaded") in self.badges and not self.badges[badge_id].get("earned", False):
            if user_data.get("has_resume", False):
                eligible_badges.append(self.badges[badge_id])
        
        # Job match badge
        if (badge_id := "job_match_70") in self.badges and not self.badges[badge_id].get("earned", False):
            if user_data.get("highest_job_match", 0) >= 70:
                eligible_badges.append(self.badges[badge_id])
        
        # Skill master badge
        if (badge_id := "skill_master") in self.badges and not self.badges[badge_id].get("earned", False):
            if len(user_data.get("skills", [])) >= 10:
                eligible_badges.append(self.badges[badge_id])
        
        # Interview ace badge
        if (badge_id := "interview_ace") in self.badges and not self.badges[badge_id].get("earned", False):
            if user_data.get("highest_interview_score", 0) >= 80:
                eligible_badges.append(self.badges[badge_id])
        
        return eligible_badges
    
    def get_user_progress(self) -> Dict[str, Any]:
        """
        Get comprehensive user progress information
        
        Returns:
            dict: User progress information
        """
        # Get earned badges
        earned_badges = [badge for badge in self.badges.values() if badge.get("earned", False)]
        earned_count = len(earned_badges)
        total_count = len(self.badges)
        
        # Get level information
        current_level = self.xp_data["current_level"]
        current_level_data = self.levels.get(str(current_level), {"name": f"Level {current_level}", "xp_required": 0})
        next_level = str(current_level + 1)
        next_level_data = self.levels.get(next_level, None)
        
        # Calculate level progress percentage
        level_progress = 0
        if next_level_data:
            current_level_xp = current_level_data.get("xp_required", 0)
            next_level_xp = next_level_data.get("xp_required", 0)
            xp_for_this_level = next_level_xp - current_level_xp
            if xp_for_this_level > 0:  # Avoid division by zero
                level_progress = ((self.xp_data["total_xp"] - current_level_xp) / xp_for_this_level) * 100
                level_progress = min(100, max(0, level_progress))  # Ensure between 0-100
        
        # Build progress information
        progress = {
            "user_id": self.user_id,
            "xp": {
                "total": self.xp_data["total_xp"],
                "to_next_level": self.xp_data["xp_to_next_level"],
                "recent_activity": self.xp_data.get("xp_history", [])[-5:] if self.xp_data.get("xp_history") else []
            },
            "level": {
                "current": current_level,
                "name": current_level_data.get("name", f"Level {current_level}"),
                "progress_percent": round(level_progress, 1),
                "icon": current_level_data.get("icon", "default_level_icon.png"),
                "benefits": current_level_data.get("benefits", [])
            },
            "badges": {
                "earned": earned_count,
                "total": total_count,
                "completion_percentage": round((earned_count / total_count) * 100 if total_count > 0 else 0, 1),
                "recent_earned": sorted(earned_badges, key=lambda b: b.get("earned_date", ""), reverse=True)[:3]
            },
            "last_updated": datetime.now().isoformat()
        }
        
        return progress
    
    def get_leaderboard(self, count: int = 10) -> List[Dict[str, Any]]:
        """
        Get leaderboard of users with highest XP (mock implementation)
        
        Args:
            count: Number of users to include
            
        Returns:
            list: Leaderboard entries
        """
        # In a real implementation, this would query the database for top users
        # This is a mock implementation with fake data
        
        leaderboard = [
            {"user_id": self.user_id, "username": "Current User", "xp": self.xp_data["total_xp"], 
             "level": self.xp_data["current_level"], "badges": len([b for b in self.badges.values() if b.get("earned", False)])}
        ]
        
        # Add mock users if current user's XP is not enough to populate leaderboard
        mock_users = [
            {"user_id": "u123", "username": "CareerMaster", "xp": 9800, "level": 9, "badges": 15},
            {"user_id": "u456", "username": "ResumeWizard", "xp": 8500, "level": 9, "badges": 12},
            {"user_id": "u789", "username": "JobHunterPro", "xp": 7200, "level": 8, "badges": 14},
            {"user_id": "u101", "username": "SkillsGuru", "xp": 6500, "level": 8, "badges": 10},
            {"user_id": "u202", "username": "InterviewAce", "xp": 5800, "level": 7, "badges": 9},
            {"user_id": "u303", "username": "TechTalent", "xp": 4900, "level": 7, "badges": 8},
            {"user_id": "u404", "username": "CareerClimber", "xp": 4200, "level": 6, "badges": 7},
            {"user_id": "u505", "username": "PathFinder", "xp": 3600, "level": 6, "badges": 6},
            {"user_id": "u606", "username": "AchievementHunter", "xp": 3000, "level": 5, "badges": 8},
            {"user_id": "u707", "username": "ProgressPro", "xp": 2500, "level": 5, "badges": 5},
            {"user_id": "u808", "username": "GoalSetter", "xp": 2000, "level": 4, "badges": 4},
            {"user_id": "u909", "username": "FutureFocus", "xp": 1500, "level": 4, "badges": 3},
            {"user_id": "u111", "username": "CareerExplorer", "xp": 1000, "level": 3, "badges": 3},
            {"user_id": "u222", "username": "NewGraduate", "xp": 500, "level": 2, "badges": 2}
        ]
        
        # Add mock users to leaderboard
        for user in mock_users:
            leaderboard.append(user)
        
        # Sort by XP descending
        leaderboard = sorted(leaderboard, key=lambda u: u["xp"], reverse=True)
        
        # Add rank
        for i, entry in enumerate(leaderboard):
            entry["rank"] = i + 1
        
        # Return limited number of top users
        return leaderboard[:count]

    def get_dashboard_badges(self, user_id):
        """Get all dashboard-related badges for display in career dashboard"""
        try:
            all_badges = self.badges
            dashboard_badges = []
            
            # Get user's earned badges
            earned_badges = [badge for badge in all_badges.values() if badge.get("earned", False)]
            earned_badge_ids = {badge["id"] for badge in earned_badges}
            
            # Format all badges for dashboard display
            for badge_id, badge_data in all_badges.items():
                earned = badge_id in earned_badge_ids
                
                # Find the earned date if badge is earned
                earned_date = None
                if earned:
                    for eb in earned_badges:
                        if eb["id"] == badge_id:
                            earned_date = eb.get("earned_date")
                            break
                
                # Map backend tier to dashboard rarity
                rarity_map = {
                    "bronze": "common",
                    "silver": "uncommon", 
                    "gold": "rare",
                    "platinum": "epic",
                    "diamond": "legendary"
                }
                
                dashboard_badge = {
                    "name": badge_data["name"],
                    "description": badge_data["description"],
                    "earned": earned,
                    "date": earned_date,
                    "rarity": rarity_map.get(badge_data["tier"], "common"),
                    "xp": badge_data["xp_reward"],
                    "category": badge_data["category"],
                    "icon": badge_data["icon"]
                }
                
                dashboard_badges.append(dashboard_badge)
                
            return dashboard_badges
            
        except Exception as e:
            print(f"Error getting dashboard badges: {e}")
            return []
            
    def check_dashboard_achievements(self, user_id, dashboard_data):
        """Check if user has earned any dashboard-related badges"""
        try:
            # Check for Dashboard Explorer badge
            if dashboard_data.get("features_used", 0) >= 5:
                self.award_badge(user_id, "dashboard_explorer")
                
            # Check for Insight Seeker badge  
            if dashboard_data.get("insights_viewed", False):
                self.award_badge(user_id, "insight_seeker")
                
            # Check for Progress Tracker badge
            if dashboard_data.get("skill_tracking_days", 0) >= 30:
                self.award_badge(user_id, "progress_tracker")
                
            # Check for Data Driven badge
            if dashboard_data.get("analytics_based_decisions", 0) >= 3:
                self.award_badge(user_id, "data_driven")
                
        except Exception as e:
            print(f"Error checking dashboard achievements: {e}")
            
    def update_dashboard_activity(self, user_id, activity_data):
        """Record dashboard activity for gamification purposes"""
        try:
            # Update user XP based on dashboard activity
            activity_type = activity_data.get("activity_type", "")
            xp_values = {
                "view_dashboard": 5,
                "use_feature": 10,
                "complete_assessment": 25,
                "update_profile": 15,
                "share_insights": 20
            }
            
            # Award XP if activity type has a defined XP value
            if activity_type in xp_values:
                self.add_xp(user_id, xp_values[activity_type], 
                          f"Dashboard: {activity_data.get('description', activity_type)}")
                
            # Check for dashboard achievements
            dashboard_stats = activity_data.get("dashboard_stats", {})
            if dashboard_stats:
                self.check_dashboard_achievements(user_id, dashboard_stats)
                
            return True
            
        except Exception as e:
            print(f"Error updating dashboard activity: {e}")
            return False


# Standalone functions that use GamificationEngine

def award_xp_for_action(user_id: str, action: str, xp_amount: int = None) -> Dict[str, Any]:
    """
    Award XP to a user for completing an action
    
    Args:
        user_id: User ID to award XP to
        action: Action type (e.g., "resume_upload", "interview_complete")
        xp_amount: Override default XP amount for the action
        
    Returns:
        dict: Result of the XP award operation
    """
    # Define default XP values for various actions
    xp_values = {
        "resume_upload": 30,
        "job_match_run": 20,
        "profile_update": 15,
        "career_assessment": 25,
        "interview_complete": 50,
        "skill_added": 5,
        "feedback_given": 10,
        "daily_login": 5,
        "career_path_explore": 15,
        "report_download": 10
    }
    
    # Use provided XP amount or default for the action
    amount = xp_amount if xp_amount is not None else xp_values.get(action, 10)
    
    # Create gamification engine for user
    engine = GamificationEngine(user_id)
    
    # Award XP
    result = engine.add_xp(amount, action)
    
    return result


def check_and_award_badges(user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check for and award any badges that the user is eligible for
    
    Args:
        user_id: User ID to check badges for
        user_data: User profile and activity data
        
    Returns:
        dict: Results of badge checks
    """
    # Create gamification engine for user
    engine = GamificationEngine(user_id)
    
    # Check eligibility
    eligible_badges = engine.check_badge_eligibility(user_data)
    
    # Award all eligible badges
    results = []
    for badge in eligible_badges:
        result = engine.award_badge(badge["id"])
        results.append(result)
    
    return {
        "badges_checked": len(engine.badges),
        "badges_awarded": len(results),
        "results": results
    }


def get_user_gamification_status(user_id: str) -> Dict[str, Any]:
    """
    Get comprehensive gamification status for a user
    
    Args:
        user_id: User ID to get status for
        
    Returns:
        dict: User gamification status
    """
    # Create gamification engine for user
    engine = GamificationEngine(user_id)
    
    # Get progress data
    progress = engine.get_user_progress()
    
    # Get badges by category
    badges_by_category = {}
    for badge in engine.badges.values():
        category = badge.get("category", "other")
        if category not in badges_by_category:
            badges_by_category[category] = {
                "total": 0,
                "earned": 0,
                "badges": []
            }
        
        badges_by_category[category]["total"] += 1
        badges_by_category[category]["badges"].append(badge)
        if badge.get("earned", False):
            badges_by_category[category]["earned"] += 1
    
    # Get leaderboard position
    leaderboard = engine.get_leaderboard(count=100)  # Get extended leaderboard
    user_position = next((entry["rank"] for entry in leaderboard if entry["user_id"] == user_id), None)
    
    # Add additional data to progress
    progress["badges_by_category"] = badges_by_category
    progress["leaderboard_position"] = user_position
    progress["all_badges"] = sorted(engine.badges.values(), key=lambda b: (not b.get("earned", False), b.get("name", "")))
    
    return progress
