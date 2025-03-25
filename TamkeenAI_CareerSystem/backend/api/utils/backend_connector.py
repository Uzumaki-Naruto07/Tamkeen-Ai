"""
Backend Connector

This module provides utilities for connecting the dashboard with backend data sources.
"""

from typing import Dict, List, Any, Optional, Union
import requests
import json
import os
from datetime import datetime

# Default local development configuration
DEFAULT_API_URL = "http://localhost:8000/api"

class BackendConnector:
    """Connector class to interact with Tamkeen AI Career System backend"""
    
    def __init__(self, base_url=None, api_key=None):
        self.base_url = base_url or os.environ.get('TAMKEEN_API_URL', DEFAULT_API_URL)
        self.api_key = api_key or os.environ.get('TAMKEEN_API_KEY', '')
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
    def get_user_data(self, user_id):
        """Fetch user data from backend"""
        try:
            response = self.session.get(f"{self.base_url}/users/{user_id}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch user data: {e}")
            return None
            
    def get_gamification_data(self, user_id):
        """Fetch gamification data from backend"""
        try:
            response = self.session.get(f"{self.base_url}/gamification/{user_id}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch gamification data: {e}")
            return None
            
    def update_xp(self, user_id, xp_amount, activity):
        """Update user XP in backend"""
        try:
            data = {
                "xp_amount": xp_amount,
                "activity": activity
            }
            response = self.session.post(f"{self.base_url}/gamification/{user_id}/xp", json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to update XP: {e}")
            return None
            
    def award_badge(self, user_id, badge_name):
        """Award badge to user in backend"""
        try:
            data = {
                "badge_name": badge_name
            }
            response = self.session.post(f"{self.base_url}/gamification/{user_id}/badges", json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to award badge: {e}")
            return None
    
    def get_market_insights(self):
        """Fetch market insights from backend"""
        try:
            response = self.session.get(f"{self.base_url}/market/insights")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch market insights: {e}")
            return None
    
    def get_resume_analysis(self, user_id):
        """Fetch resume analysis history from backend"""
        try:
            response = self.session.get(f"{self.base_url}/resumes/{user_id}/analysis")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch resume analysis: {e}")
            return None
    
    def sync_user_activity(self, user_id, activity_data):
        """Sync user activity with backend"""
        try:
            response = self.session.post(f"{self.base_url}/users/{user_id}/activity", json=activity_data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to sync user activity: {e}")
            return None
            
    def get_dashboard_data(self, user_id):
        """Fetch complete dashboard data from backend"""
        try:
            response = self.session.get(f"{self.base_url}/dashboard/{user_id}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch dashboard data: {e}")
            return None
    
    def update_dashboard_stats(self, user_id, stats_data):
        """Update dashboard usage statistics in backend"""
        try:
            response = self.session.post(f"{self.base_url}/dashboard/{user_id}/stats", json=stats_data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to update dashboard stats: {e}")
            return None 