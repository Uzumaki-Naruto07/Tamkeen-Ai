"""
Analytics Module

This module handles user activity tracking, system usage analytics, and insights generation
for the Tamkeen AI Career Intelligence System.
"""

import os
import json
import time
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta
import uuid

# Import settings
from config.settings import BASE_DIR

# Try importing data analysis libraries
try:
    import pandas as pd
    import numpy as np
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Warning: pandas not available. Advanced analytics features will be limited.")


class AnalyticsTracker:
    """Class for tracking and analyzing user activities and system usage"""
    
    def __init__(self, user_id: Optional[str] = None):
        """
        Initialize analytics tracker
        
        Args:
            user_id: Optional user ID for tracking
        """
        self.user_id = user_id
        self.analytics_dir = os.path.join(BASE_DIR, 'data', 'analytics')
        os.makedirs(self.analytics_dir, exist_ok=True)
        
        # Create subdirectories for different analytics
        for subdir in ['user_events', 'system_events', 'user_trends', 'usage_reports']:
            os.makedirs(os.path.join(self.analytics_dir, subdir), exist_ok=True)
    
    def track_event(self, event_type: str, event_data: Dict[str, Any]) -> bool:
        """
        Track a user or system event
        
        Args:
            event_type: Type of event
            event_data: Event data
            
        Returns:
            bool: Success status
        """
        event = {
            "timestamp": datetime.now().isoformat(),
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "data": event_data
        }
        
        if self.user_id:
            event["user_id"] = self.user_id
        
        # Determine directory based on event type
        if event_type.startswith("user_"):
            subdir = "user_events"
        else:
            subdir = "system_events"
        
        # Create the event file
        date_str = datetime.now().strftime("%Y%m%d")
        filename = f"{date_str}_{event_type}.jsonl"
        filepath = os.path.join(self.analytics_dir, subdir, filename)
        
        try:
            with open(filepath, 'a', encoding='utf-8') as f:
                f.write(json.dumps(event) + '\n')
            return True
        except IOError as e:
            print(f"Error tracking event: {e}")
            return False
    
    def get_user_activity(self, days: int = 30) -> Dict[str, Any]:
        """
        Get user activity data for a specified period
        
        Args:
            days: Number of days to look back
            
        Returns:
            dict: User activity summary
        """
        if not self.user_id:
            return {"error": "No user ID specified"}
        
        activity = {
            "user_id": self.user_id,
            "period_days": days,
            "start_date": (datetime.now() - timedelta(days=days)).isoformat(),
            "end_date": datetime.now().isoformat(),
            "total_events": 0,
            "event_counts": {},
            "usage_by_day": {},
            "most_used_features": [],
            "last_activity": None
        }
        
        # Look through user events directory
        events_dir = os.path.join(self.analytics_dir, 'user_events')
        cutoff_date = datetime.now() - timedelta(days=days)
        
        all_events = []
        try:
            for filename in os.listdir(events_dir):
                if not filename.endswith('.jsonl'):
                    continue
                
                file_date_str = filename.split('_')[0]
                try:
                    file_date = datetime.strptime(file_date_str, "%Y%m%d")
                    if file_date < cutoff_date:
                        continue
                except ValueError:
                    continue
                
                # Read events from file
                with open(os.path.join(events_dir, filename), 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            event = json.loads(line.strip())
                            if event.get("user_id") == self.user_id:
                                all_events.append(event)
                        except json.JSONDecodeError:
                            continue
        except (FileNotFoundError, OSError) as e:
            print(f"Error reading user events: {e}")
        
        # Process events
        if all_events:
            activity["total_events"] = len(all_events)
            
            # Count events by type
            for event in all_events:
                event_type = event.get("event_type", "unknown")
                activity["event_counts"][event_type] = activity["event_counts"].get(event_type, 0) + 1
            
            # Activity by day
            for event in all_events:
                try:
                    event_date = datetime.fromisoformat(event.get("timestamp", "")).strftime("%Y-%m-%d")
                    activity["usage_by_day"][event_date] = activity["usage_by_day"].get(event_date, 0) + 1
                except (ValueError, TypeError):
                    continue
            
            # Most used features
            activity["most_used_features"] = sorted(
                [{"feature": k, "count": v} for k, v in activity["event_counts"].items()],
                key=lambda x: x["count"],
                reverse=True
            )[:5]
            
            # Last activity timestamp
            timestamps = [event.get("timestamp") for event in all_events if "timestamp" in event]
            if timestamps:
                activity["last_activity"] = max(timestamps, key=lambda x: x)
        
        return activity
    
    def get_system_usage(self, days: int = 30) -> Dict[str, Any]:
        """
        Get system-wide usage data
        
        Args:
            days: Number of days to look back
            
        Returns:
            dict: System usage summary
        """
        usage = {
            "period_days": days,
            "start_date": (datetime.now() - timedelta(days=days)).isoformat(),
            "end_date": datetime.now().isoformat(),
            "total_events": 0,
            "unique_users": 0,
            "events_by_type": {},
            "events_by_day": {},
            "popular_features": [],
            "user_retention": {
                "active_1_day": 0,
                "active_7_days": 0,
                "active_30_days": 0
            }
        }
        
        # Go through both user and system event directories
        all_events = []
        unique_users = set()
        
        for subdir in ['user_events', 'system_events']:
            events_dir = os.path.join(self.analytics_dir, subdir)
            cutoff_date = datetime.now() - timedelta(days=days)
            
            try:
                for filename in os.listdir(events_dir):
                    if not filename.endswith('.jsonl'):
                        continue
                    
                    file_date_str = filename.split('_')[0]
                    try:
                        file_date = datetime.strptime(file_date_str, "%Y%m%d")
                        if file_date < cutoff_date:
                            continue
                    except ValueError:
                        continue
                    
                    # Read events from file
                    with open(os.path.join(events_dir, filename), 'r', encoding='utf-8') as f:
                        for line in f:
                            try:
                                event = json.loads(line.strip())
                                all_events.append(event)
                                if "user_id" in event:
                                    unique_users.add(event["user_id"])
                            except json.JSONDecodeError:
                                continue
            except (FileNotFoundError, OSError) as e:
                print(f"Error reading events from {subdir}: {e}")
        
        # Process events
        if all_events:
            usage["total_events"] = len(all_events)
            usage["unique_users"] = len(unique_users)
            
            # Events by type
            for event in all_events:
                event_type = event.get("event_type", "unknown")
                usage["events_by_type"][event_type] = usage["events_by_type"].get(event_type, 0) + 1
            
            # Events by day
            for event in all_events:
                try:
                    event_date = datetime.fromisoformat(event.get("timestamp", "")).strftime("%Y-%m-%d")
                    usage["events_by_day"][event_date] = usage["events_by_day"].get(event_date, 0) + 1
                except (ValueError, TypeError):
                    continue
            
            # Popular features (only count user events for features)
            user_features = {k: v for k, v in usage["events_by_type"].items() if k.startswith("user_")}
            usage["popular_features"] = sorted(
                [{"feature": k, "count": v} for k, v in user_features.items()],
                key=lambda x: x["count"],
                reverse=True
            )[:10]
            
            # User retention
            now = datetime.now()
            last_day = now - timedelta(days=1)
            last_week = now - timedelta(days=7)
            last_month = now - timedelta(days=30)
            
            active_users = {
                "1_day": set(),
                "7_days": set(),
                "30_days": set()
            }
            
            for event in all_events:
                if "user_id" not in event or "timestamp" not in event:
                    continue
                
                try:
                    event_time = datetime.fromisoformat(event["timestamp"])
                    user_id = event["user_id"]
                    
                    if event_time >= last_day:
                        active_users["1_day"].add(user_id)
                    
                    if event_time >= last_week:
                        active_users["7_days"].add(user_id)
                    
                    if event_time >= last_month:
                        active_users["30_days"].add(user_id)
                except (ValueError, TypeError):
                    continue
            
            usage["user_retention"] = {
                "active_1_day": len(active_users["1_day"]),
                "active_7_days": len(active_users["7_days"]),
                "active_30_days": len(active_users["30_days"])
            }
        
        return usage
    
    def generate_insights(self) -> Dict[str, Any]:
        """
        Generate insights from analytics data
        
        Returns:
            dict: Insights and recommendations
        """
        insights = {
            "timestamp": datetime.now().isoformat(),
            "user_insights": [],
            "system_insights": [],
            "recommendations": []
        }
        
        # Get recent user activity if user_id is provided
        if self.user_id:
            user_activity = self.get_user_activity(days=90)
            
            # Generate user-specific insights
            if user_activity.get("total_events", 0) > 0:
                # Check for engagement pattern
                total_days = 90
                active_days = len(user_activity.get("usage_by_day", {}))
                engagement_rate = active_days / total_days
                
                if engagement_rate < 0.1:
                    insights["user_insights"].append({
                        "type": "low_engagement",
                        "message": "You've been active on only a few days in the past three months. Regular engagement can help you progress faster."
                    })
                    insights["recommendations"].append({
                        "type": "engagement",
                        "message": "Try setting a weekly reminder to update your profile and check job matches."
                    })
                
                # Check for feature usage
                used_features = set(user_activity.get("event_counts", {}).keys())
                all_features = {
                    "user_resume_upload", "user_job_match", "user_profile_update", 
                    "user_career_assessment", "user_interview_practice", "user_skill_update"
                }
                unused_features = all_features - used_features
                
                if unused_features:
                    feature_names = {
                        "user_resume_upload": "Resume Upload",
                        "user_job_match": "Job Matching",
                        "user_profile_update": "Profile Updates",
                        "user_career_assessment": "Career Assessment",
                        "user_interview_practice": "Interview Practice",
                        "user_skill_update": "Skill Management"
                    }
                    
                    unused_names = [feature_names.get(f, f) for f in unused_features]
                    if len(unused_names) <= 3:
                        features_str = ", ".join(unused_names)
                        insights["user_insights"].append({
                            "type": "unused_features",
                            "message": f"You haven't tried these valuable features yet: {features_str}"
                        })
                        insights["recommendations"].append({
                            "type": "feature_discovery",
                            "message": f"Explore the {unused_names[0]} feature to enhance your career readiness."
                        })
        
        # Generate system-wide insights
        system_usage = self.get_system_usage(days=30)
        
        if system_usage.get("total_events", 0) > 0:
            # Check for trending features
            popular_features = system_usage.get("popular_features", [])
            if popular_features:
                top_feature = popular_features[0]["feature"]
                insights["system_insights"].append({
                    "type": "trending_feature",
                    "message": f"The {top_feature} feature is currently the most popular among users."
                })
            
            # Check for growth or decline
            prev_month_usage = self.get_system_usage(days=60)
            if prev_month_usage.get("total_events", 0) > 0:
                current_events = system_usage.get("total_events", 0)
                prev_events = prev_month_usage.get("total_events", 0) - current_events
                
                if prev_events > 0:
                    change_pct = ((current_events - prev_events) / prev_events) * 100
                    
                    if change_pct > 20:
                        insights["system_insights"].append({
                            "type": "growth",
                            "message": f"System usage has increased by {change_pct:.1f}% compared to the previous month."
                        })
                    elif change_pct < -20:
                        insights["system_insights"].append({
                            "type": "decline",
                            "message": f"System usage has decreased by {abs(change_pct):.1f}% compared to the previous month."
                        })
        
        return insights
    
    def create_usage_report(self, report_type: str = "system", 
                           time_period: str = "monthly") -> Dict[str, Any]:
        """
        Create usage report
        
        Args:
            report_type: Type of report (system, user, feature)
            time_period: Time period (daily, weekly, monthly)
            
        Returns:
            dict: Report data
        """
        if report_type == "user" and not self.user_id:
            return {"error": "User ID required for user reports"}
        
        report = {
            "report_id": str(uuid.uuid4()),
            "report_type": report_type,
            "time_period": time_period,
            "generated_at": datetime.now().isoformat(),
            "data": {}
        }
        
        # Set time range based on period
        if time_period == "daily":
            days = 1
        elif time_period == "weekly":
            days = 7
        else:  # monthly
            days = 30
        
        # Generate appropriate report
        if report_type == "system":
            usage_data = self.get_system_usage(days)
            report["data"] = usage_data
        elif report_type == "user":
            user_data = self.get_user_activity(days)
            report["data"] = user_data
        elif report_type == "feature":
            # Get system usage data
            usage_data = self.get_system_usage(days)
            
            # Extract feature-specific data
            features_data = {}
            for feature, count in usage_data.get("events_by_type", {}).items():
                if feature.startswith("user_"):
                    feature_name = feature.replace("user_", "")
                    features_data[feature_name] = {
                        "total_usage": count,
                        "percentage": (count / usage_data.get("total_events", 1)) * 100 if usage_data.get("total_events", 0) > 0 else 0
                    }
            
            report["data"] = {
                "features": features_data,
                "total_events": usage_data.get("total_events", 0),
                "period_days": days
            }
        
        # Save report
        report_dir = os.path.join(self.analytics_dir, 'usage_reports')
        date_str = datetime.now().strftime("%Y%m%d")
        filename = f"{date_str}_{report_type}_{time_period}_report.json"
        
        try:
            with open(os.path.join(report_dir, filename), 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2)
        except IOError as e:
            print(f"Error saving report: {e}")
        
        return report


# Standalone functions for analytics

def track_user_event(user_id: str, event_type: str, event_data: Dict[str, Any]) -> bool:
    """
    Track a user event
    
    Args:
        user_id: User ID
        event_type: Type of event (e.g., user_login, resume_upload)
        event_data: Event data
        
    Returns:
        bool: Success status
    """
    tracker = AnalyticsTracker(user_id)
    return tracker.track_event(f"user_{event_type}", event_data)


def track_system_event(event_type: str, event_data: Dict[str, Any]) -> bool:
    """
    Track a system event
    
    Args:
        event_type: Type of event (e.g., api_call, error)
        event_data: Event data
        
    Returns:
        bool: Success status
    """
    tracker = AnalyticsTracker()
    return tracker.track_event(f"system_{event_type}", event_data)


def get_user_activity_summary(user_id: str, days: int = 30) -> Dict[str, Any]:
    """
    Get summary of user activity
    
    Args:
        user_id: User ID
        days: Number of days to look back
        
    Returns:
        dict: User activity summary
    """
    tracker = AnalyticsTracker(user_id)
    return tracker.get_user_activity(days)


def get_system_usage_stats(days: int = 30) -> Dict[str, Any]:
    """
    Get system usage statistics
    
    Args:
        days: Number of days to look back
        
    Returns:
        dict: System usage statistics
    """
    tracker = AnalyticsTracker()
    return tracker.get_system_usage(days)


def generate_user_insights(user_id: str) -> Dict[str, Any]:
    """
    Generate insights for a specific user
    
    Args:
        user_id: User ID
        
    Returns:
        dict: User insights and recommendations
    """
    tracker = AnalyticsTracker(user_id)
    return tracker.generate_insights()


def create_usage_report(report_type: str = "system", 
                       time_period: str = "monthly", 
                       user_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a usage report
    
    Args:
        report_type: Type of report
        time_period: Time period
        user_id: Optional user ID for user reports
        
    Returns:
        dict: Report data
    """
    tracker = AnalyticsTracker(user_id)
    return tracker.create_usage_report(report_type, time_period)
