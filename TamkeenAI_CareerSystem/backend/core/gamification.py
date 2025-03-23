from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timedelta
import json
import math
import random
import uuid

class GamificationSystem:
    """
    Implements gamification elements like XP points, levels, badges, streaks,
    achievements, and challenges to increase user engagement with the career system.
    """
    
    def __init__(self):
        """Initialize the gamification system"""
        # Load badge and achievement definitions
        self._load_gamification_data()
        
        # Level thresholds - XP needed to reach each level
        self.level_thresholds = [
            0,      # Level 1 (starting level)
            100,    # Level 2
            250,    # Level 3
            500,    # Level 4
            1000,   # Level 5
            1750,   # Level 6
            2750,   # Level 7
            4000,   # Level 8
            5500,   # Level 9
            7500,   # Level 10
            10000,  # Level 11
            13000,  # Level 12
            16500,  # Level 13
            20500,  # Level 14
            25000   # Level 15
        ]
        
    def initialize_user_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Initialize gamification progress for a new user
        
        Args:
            user_id: Unique identifier for the user
            
        Returns:
            Dictionary with initial progress data
        """
        # Create initial progress structure
        initial_progress = {
            "user_id": user_id,
            "xp": 0,
            "level": 1,
            "badges": [],
            "achievements": [],
            "streaks": {
                "current": 0,
                "longest": 0,
                "last_activity": datetime.now().isoformat()
            },
            "challenges": {
                "active": [],
                "completed": []
            },
            "progress": {
                "resume": 0,
                "profile": 0,
                "skills": 0,
                "interview": 0,
                "network": 0
            },
            "activity_history": [],
            "creation_date": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        # Assign initial challenges
        initial_challenges = self._get_starter_challenges()
        initial_progress["challenges"]["active"] = initial_challenges
        
        return initial_progress
        
    def track_activity(self, 
                     user_progress: Dict[str, Any], 
                     activity: str, 
                     details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Track user activity and update progress, XP, badges, etc.
        
        Args:
            user_progress: User's current gamification progress
            activity: Type of activity performed
            details: Optional details about the activity
            
        Returns:
            Updated progress data and notifications about new achievements
        """
        if not user_progress:
            raise ValueError("User progress data is required")
            
        # Initialize results and notifications
        result = {
            "updated_progress": user_progress.copy(),
            "notifications": {
                "xp_earned": 0,
                "level_up": False,
                "new_badges": [],
                "achievements_unlocked": [],
                "challenges_completed": [],
                "streak_updated": False
            }
        }
        
        # Get activity timestamp
        timestamp = datetime.now()
        
        # Calculate XP earned for this activity
        xp_earned = self._calculate_xp(activity, details)
        
        # Update user XP
        current_xp = user_progress.get("xp", 0)
        current_level = user_progress.get("level", 1)
        
        new_xp = current_xp + xp_earned
        result["updated_progress"]["xp"] = new_xp
        
        # Check for level up
        new_level = self._calculate_level(new_xp)
        if new_level > current_level:
            result["updated_progress"]["level"] = new_level
            result["notifications"]["level_up"] = True
            
            # Award level up badge if applicable
            level_badge = self._check_level_badge(new_level)
            if level_badge:
                self._award_badge(result["updated_progress"], level_badge)
                result["notifications"]["new_badges"].append(level_badge)
        
        # Update streak
        streak_updated = self._update_streak(result["updated_progress"], timestamp)
        result["notifications"]["streak_updated"] = streak_updated
        
        # Record activity
        activity_record = {
            "activity": activity,
            "timestamp": timestamp.isoformat(),
            "xp_earned": xp_earned
        }
        
        if details:
            activity_record["details"] = details
            
        result["updated_progress"]["activity_history"].append(activity_record)
        
        # Update section progress if applicable
        if activity in ["resume_upload", "resume_update", "ats_check"]:
            result["updated_progress"]["progress"]["resume"] = min(
                100, result["updated_progress"]["progress"].get("resume", 0) + 20
            )
        elif activity in ["profile_update", "goals_set"]:
            result["updated_progress"]["progress"]["profile"] = min(
                100, result["updated_progress"]["progress"].get("profile", 0) + 25
            )
        elif activity in ["skills_added", "skills_endorsed"]:
            result["updated_progress"]["progress"]["skills"] = min(
                100, result["updated_progress"]["progress"].get("skills", 0) + 15
            )
        elif activity in ["practice_interview", "interview_feedback"]:
            result["updated_progress"]["progress"]["interview"] = min(
                100, result["updated_progress"]["progress"].get("interview", 0) + 30
            )
        elif activity in ["connection_added", "endorsement_given"]:
            result["updated_progress"]["progress"]["network"] = min(
                100, result["updated_progress"]["progress"].get("network", 0) + 15
            )
        
        # Check for activity-specific badges
        new_badges = self._check_activity_badges(activity, details, user_progress)
        if new_badges:
            for badge in new_badges:
                self._award_badge(result["updated_progress"], badge)
                result["notifications"]["new_badges"].append(badge)
        
        # Check for achievements
        achievements = self._check_achievements(result["updated_progress"])
        if achievements:
            for achievement in achievements:
                self._award_achievement(result["updated_progress"], achievement)
                result["notifications"]["achievements_unlocked"].append(achievement)
        
        # Update challenges
        completed_challenges = self._update_challenges(
            result["updated_progress"], activity, details
        )
        
        if completed_challenges:
            result["notifications"]["challenges_completed"] = completed_challenges
            # Assign new challenges if needed
            if len(result["updated_progress"]["challenges"]["active"]) < 3:
                new_challenges = self._assign_new_challenges(
                    result["updated_progress"],
                    max(3 - len(result["updated_progress"]["challenges"]["active"]), 0)
                )
                result["updated_progress"]["challenges"]["active"].extend(new_challenges)
        
        # Update last_updated timestamp
        result["updated_progress"]["last_updated"] = timestamp.isoformat()
        
        result["notifications"]["xp_earned"] = xp_earned
        
        return result
        
    def get_progress_summary(self, user_progress: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a summary of user's gamification progress
        
        Args:
            user_progress: User's gamification progress data
            
        Returns:
            Dictionary with progress summary
        """
        if not user_progress:
            return {"error": "No progress data available"}
            
        # Calculate progress percentages for summary
        xp = user_progress.get("xp", 0)
        level = user_progress.get("level", 1)
        
        # Calculate progress to next level
        next_level_threshold = self.level_thresholds[level] if level < len(self.level_thresholds) else float('inf')
        prev_level_threshold = self.level_thresholds[level-1] if level > 0 else 0
        
        xp_for_current_level = xp - prev_level_threshold
        xp_needed_for_next = next_level_threshold - prev_level_threshold
        
        level_progress = min(100, int((xp_for_current_level / max(1, xp_needed_for_next)) * 100))
        
        # Count badges by category
        badges = user_progress.get("badges", [])
        badge_counts = {}
        
        for badge in badges:
            category = badge.get("category", "uncategorized")
            badge_counts[category] = badge_counts.get(category, 0) + 1
        
        # Generate summary
        summary = {
            "level": level,
            "xp": xp,
            "next_level_at": next_level_threshold,
            "level_progress": level_progress,
            "badge_count": len(badges),
            "badge_categories": badge_counts,
            "achievements_unlocked": len(user_progress.get("achievements", [])),
            "current_streak": user_progress.get("streaks", {}).get("current", 0),
            "longest_streak": user_progress.get("streaks", {}).get("longest", 0),
            "active_challenges": len(user_progress.get("challenges", {}).get("active", [])),
            "completed_challenges": len(user_progress.get("challenges", {}).get("completed", [])),
            "recent_badges": [b for b in badges[-3:]] if badges else [],
            "section_progress": user_progress.get("progress", {}),
            "overall_progress": self._calculate_overall_progress(user_progress)
        }
        
        return summary
        
    def get_leaderboard(self, 
                      user_progresses: List[Dict[str, Any]], 
                      user_id: str = None) -> Dict[str, Any]:
        """
        Generate leaderboard from multiple users' progress data
        
        Args:
            user_progresses: List of progress data for multiple users
            user_id: Optional current user's ID to highlight their position
            
        Returns:
            Dictionary with leaderboard data and current user's position
        """
        if not user_progresses:
            return {"error": "No user data available for leaderboard"}
            
        # Sort users by XP
        leaderboard = sorted(
            user_progresses,
            key=lambda u: (u.get("xp", 0), u.get("level", 1)), 
            reverse=True
        )
        
        # Prepare leaderboard entries
        entries = []
        current_user_position = None
        
        for position, user in enumerate(leaderboard, 1):
            entry = {
                "position": position,
                "user_id": user.get("user_id", "unknown"),
                "display_name": user.get("display_name", f"User {user.get('user_id', '')[-4:]}"),
                "level": user.get("level", 1),
                "xp": user.get("xp", 0),
                "badges": len(user.get("badges", [])),
                "achievements": len(user.get("achievements", []))
            }
            
            entries.append(entry)
            
            # Track current user's position
            if user_id and user.get("user_id") == user_id:
                current_user_position = position
        
        # Prepare final leaderboard structure
        result = {
            "leaderboard": entries[:10],  # Top 10 users
            "total_users": len(leaderboard),
            "current_user": {
                "position": current_user_position,
                "top_10": current_user_position is not None and current_user_position <= 10
            } if current_user_position else None
        }
        
        return result
        
    # Helper methods
    
    def _calculate_xp(self, activity: str, details: Optional[Dict[str, Any]] = None) -> int:
        """Calculate XP earned for a specific activity"""
        # Base XP values for different activities
        base_xp = {
            # Profile activities
            "profile_create": 50,
            "profile_update": 10,
            "goals_set": 25,
            
            # Resume activities
            "resume_upload": 75,
            "resume_update": 25,
            "ats_check": 40,
            
            # Skills activities
            "skills_added": 15,
            "skills_endorsed": 10,
            
            # Interview activities
            "practice_interview": 100,
            "interview_feedback": 50,
            
            # Networking activities
            "connection_added": 15,
            "endorsement_given": 10,
            "recommendation_received": 30,
            
            # Assessment activities
            "assessment_completed": 80,
            "career_path_explored": 30,
            
            # Learning activities
            "course_started": 20,
            "course_completed": 100,
            "certificate_earned": 150,
            
            # General engagement
            "daily_login": 25,
            "feedback_given": 15,
            "challenge_completed": 60
        }
        
        # Get base XP for this activity
        xp = base_xp.get(activity, 10)  # Default to 10 XP for unknown activities
        
        # Return the level for the given XP
        for level, threshold in enumerate(self.level_thresholds, 1):
            if xp < threshold:
                return level - 1
        
        # If XP exceeds all defined thresholds, return max level
        return len(self.level_thresholds)
        
    def _update_streak(self, user_progress: Dict[str, Any], timestamp: datetime) -> bool:
        """Update user's login/activity streak and return if it changed"""
        streaks = user_progress.get("streaks", {})
        
        # Get last activity timestamp
        last_activity_str = streaks.get("last_activity")
        if not last_activity_str:
            # Initialize streak if not present
            streaks["current"] = 1
            streaks["longest"] = 1
            streaks["last_activity"] = timestamp.isoformat()
            user_progress["streaks"] = streaks
            return True
            
        try:
            last_activity = datetime.fromisoformat(last_activity_str)
        except:
            # Handle invalid datetime format
            last_activity = timestamp - timedelta(days=2)
        
        # Get current streak
        current_streak = streaks.get("current", 0)
        longest_streak = streaks.get("longest", 0)
        
        # Calculate days since last activity
        days_diff = (timestamp.date() - last_activity.date()).days
        
        if days_diff == 0:
            # Same day, no streak change
            return False
        elif days_diff == 1:
            # Next day, streak continues
            current_streak += 1
            streaks["current"] = current_streak
            streaks["last_activity"] = timestamp.isoformat()
            
            # Update longest streak if current exceeds it
            if current_streak > longest_streak:
                streaks["longest"] = current_streak
                
            user_progress["streaks"] = streaks
            return True
        else:
            # Streak broken
            streaks["current"] = 1
            streaks["last_activity"] = timestamp.isoformat()
            user_progress["streaks"] = streaks
            return True
        
    def _calculate_overall_progress(self, user_progress: Dict[str, Any]) -> int:
        """Calculate overall career system progress percentage"""
        section_progress = user_progress.get("progress", {})
        
        # Define weights for different sections
        weights = {
            "resume": 0.3,
            "profile": 0.2,
            "skills": 0.2,
            "interview": 0.2,
            "network": 0.1
        }
        
        # Calculate weighted progress
        weighted_sum = 0
        weight_total = 0
        
        for section, weight in weights.items():
            if section in section_progress:
                weighted_sum += section_progress[section] * weight
                weight_total += weight
        
        # Prevent division by zero
        if weight_total == 0:
            return 0
            
        overall_progress = int(weighted_sum / weight_total)
        
        return min(100, overall_progress)  # Cap at 100%
