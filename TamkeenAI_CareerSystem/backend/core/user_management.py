"""
User Management Module

This module provides functionality for user account management, including registration,
profile updates, and user data management.
"""

import os
import uuid
import json
from typing import Dict, Any, Optional, Tuple, List, Union
from datetime import datetime
import logging

# Import database models
from backend.database.models import User, UserProfile, UserActivity
from backend.database.connector import get_db, DatabaseError

# Import utilities
from backend.utils.auth import validate_password, validate_email
from backend.utils.file_utils import save_uploaded_file, delete_file
from backend.utils.security import sanitize_input

# Setup logger
logger = logging.getLogger(__name__)


class UserManager:
    """User account management class"""
    
    @staticmethod
    def register_user(data: Dict[str, Any]) -> Tuple[bool, Optional[User], Optional[str]]:
        """
        Register a new user
        
        Args:
            data: User registration data
        
        Returns:
            tuple: (success, user, message)
        """
        try:
            # Sanitize input
            data = sanitize_input(data)
            
            # Validate email
            email = data.get('email', '').strip()
            is_valid, error = validate_email(email)
            if not is_valid:
                return False, None, error
            
            # Check if email already exists
            existing_user = User.find_by_email(email)
            if existing_user:
                return False, None, "Email already in use"
            
            # Validate password
            password = data.get('password', '')
            is_valid, error = validate_password(password)
            if not is_valid:
                return False, None, error
            
            # Create user object
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                username=data.get('username', email.split('@')[0]),
                is_active=True,
                is_admin=False,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            
            # Set password (will be hashed)
            user.set_password(password)
            
            # Save user
            user.save()
            
            # Create user profile
            profile = UserProfile(
                id=str(uuid.uuid4()),
                user_id=user.id,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            
            # Save profile
            profile.save()
            
            logger.info(f"User registered: {email}")
            
            return True, user, None
        
        except Exception as e:
            error_msg = f"Error registering user: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    @staticmethod
    def update_profile(user_id: str, data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Update user profile
        
        Args:
            user_id: User ID
            data: Profile data
        
        Returns:
            tuple: (success, message)
        """
        try:
            # Sanitize input
            data = sanitize_input(data)
            
            # Find user
            user = User.find_by_id(user_id)
            if not user:
                return False, "User not found"
            
            # Find profile
            profile = UserProfile.find_by_user_id(user_id)
            if not profile:
                # Create profile if it doesn't exist
                profile = UserProfile(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    created_at=datetime.now().isoformat(),
                    updated_at=datetime.now().isoformat()
                )
            
            # Update profile fields
            updateable_fields = [
                'first_name', 'last_name', 'headline', 'summary', 'phone', 
                'address', 'city', 'state', 'country', 'postal_code', 
                'website', 'linkedin', 'github', 'twitter', 'facebook',
                'birth_date', 'gender', 'nationality'
            ]
            
            for field in updateable_fields:
                if field in data:
                    setattr(profile, field, data.get(field))
            
            # Update timestamp
            profile.updated_at = datetime.now().isoformat()
            
            # Save profile
            profile.save()
            
            logger.info(f"Profile updated for user: {user_id}")
            
            return True, None
        
        except Exception as e:
            error_msg = f"Error updating profile: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    @staticmethod
    def update_user_settings(user_id: str, data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Update user account settings
        
        Args:
            user_id: User ID
            data: Settings data
        
        Returns:
            tuple: (success, message)
        """
        try:
            # Sanitize input
            data = sanitize_input(data)
            
            # Find user
            user = User.find_by_id(user_id)
            if not user:
                return False, "User not found"
            
            # Update email if provided
            if 'email' in data:
                email = data.get('email', '').strip()
                
                # Validate email
                is_valid, error = validate_email(email)
                if not is_valid:
                    return False, error
                
                # Check if email already exists
                if email != user.email:
                    existing_user = User.find_by_email(email)
                    if existing_user:
                        return False, "Email already in use"
                    
                    user.email = email
            
            # Update username if provided
            if 'username' in data:
                username = data.get('username', '').strip()
                
                if not username:
                    return False, "Username cannot be empty"
                
                if username != user.username:
                    # Check if username already exists
                    existing_user = User.find_by_username(username)
                    if existing_user:
                        return False, "Username already in use"
                    
                    user.username = username
            
            # Update notification preferences
            if 'notification_preferences' in data:
                user.notification_preferences = json.dumps(data.get('notification_preferences', {}))
            
            # Update password if provided
            if 'password' in data and data.get('password'):
                password = data.get('password')
                current_password = data.get('current_password')
                
                # Verify current password
                if not user.check_password(current_password):
                    return False, "Current password is incorrect"
                
                # Validate new password
                is_valid, error = validate_password(password)
                if not is_valid:
                    return False, error
                
                # Set new password
                user.set_password(password)
            
            # Update timestamp
            user.updated_at = datetime.now().isoformat()
            
            # Save user
            user.save()
            
            logger.info(f"Settings updated for user: {user_id}")
            
            return True, None
        
        except Exception as e:
            error_msg = f"Error updating settings: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    @staticmethod
    def upload_profile_picture(user_id: str, file) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Upload user profile picture
        
        Args:
            user_id: User ID
            file: Uploaded file
        
        Returns:
            tuple: (success, file_path, message)
        """
        try:
            # Find user
            user = User.find_by_id(user_id)
            if not user:
                return False, None, "User not found"
            
            # Find profile
            profile = UserProfile.find_by_user_id(user_id)
            if not profile:
                return False, None, "User profile not found"
            
            # Delete old picture if exists
            if profile.profile_picture:
                delete_file(profile.profile_picture)
            
            # Save new picture
            allowed_types = {'jpg', 'jpeg', 'png', 'gif'}
            file_path = save_uploaded_file(file, f"profiles/{user_id}", allowed_types)
            
            if not file_path:
                return False, None, "Invalid file type"
            
            # Update profile
            profile.profile_picture = file_path
            profile.updated_at = datetime.now().isoformat()
            profile.save()
            
            logger.info(f"Profile picture uploaded for user: {user_id}")
            
            return True, file_path, None
        
        except Exception as e:
            error_msg = f"Error uploading profile picture: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    @staticmethod
    def get_user_data(user_id: str) -> Dict[str, Any]:
        """
        Get complete user data including profile and statistics
        
        Args:
            user_id: User ID
        
        Returns:
            dict: User data
        """
        try:
            # Find user
            user = User.find_by_id(user_id)
            if not user:
                return {}
            
            # Get user data
            user_data = user.to_dict()
            
            # Remove sensitive fields
            sensitive_fields = ['password_hash', 'reset_token', 'reset_token_expiry']
            for field in sensitive_fields:
                if field in user_data:
                    del user_data[field]
            
            # Find profile
            profile = UserProfile.find_by_user_id(user_id)
            if profile:
                user_data['profile'] = profile.to_dict()
            else:
                user_data['profile'] = {}
            
            # Get activity statistics
            db = get_db()
            
            # Resumes count
            resume_count = db.count('resumes', 'user_id = ?', (user_id,))
            user_data['resume_count'] = resume_count
            
            # Jobs applied count
            job_count = db.count('job_applications', 'user_id = ?', (user_id,))
            user_data['job_applications_count'] = job_count
            
            # Skills count
            skill_count = db.count('user_skills', 'user_id = ?', (user_id,))
            user_data['skill_count'] = skill_count
            
            # Recent login
            recent_login = db.fetch_one(
                "SELECT created_at FROM user_activities WHERE user_id = ? AND activity_type = 'login' ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            
            if recent_login:
                user_data['last_login'] = recent_login['created_at']
            
            return user_data
        
        except Exception as e:
            error_msg = f"Error retrieving user data: {str(e)}"
            logger.error(error_msg)
            return {}
    
    @staticmethod
    def delete_account(user_id: str) -> Tuple[bool, Optional[str]]:
        """
        Delete user account
        
        Args:
            user_id: User ID
        
        Returns:
            tuple: (success, message)
        """
        try:
            # Find user
            user = User.find_by_id(user_id)
            if not user:
                return False, "User not found"
            
            # Find profile
            profile = UserProfile.find_by_user_id(user_id)
            
            # Start transaction
            db = get_db()
            
            # Delete profile picture if exists
            if profile and profile.profile_picture:
                delete_file(profile.profile_picture)
            
            # Delete related records
            tables = [
                'user_profiles', 'resumes', 'resume_versions', 'user_skills', 
                'job_applications', 'user_activities', 'career_assessments',
                'career_plans', 'reports'
            ]
            
            for table in tables:
                db.delete(table, 'user_id = ?', (user_id,))
            
            # Delete user
            user.delete()
            
            logger.info(f"User account deleted: {user_id}")
            
            return True, None
        
        except Exception as e:
            error_msg = f"Error deleting account: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    @staticmethod
    def get_user_activity(user_id: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get user activity history
        
        Args:
            user_id: User ID
            limit: Maximum number of records to return
            offset: Number of records to skip
        
        Returns:
            list: Activity records
        """
        try:
            activities = UserActivity.find_by_user_id(user_id, limit, offset)
            
            return [activity.to_dict() for activity in activities]
        
        except Exception as e:
            error_msg = f"Error retrieving user activity: {str(e)}"
            logger.error(error_msg)
            return []


# Convenience functions

def register_user(data: Dict[str, Any]) -> Tuple[bool, Optional[User], Optional[str]]:
    """Register a new user"""
    return UserManager.register_user(data)


def update_profile(user_id: str, data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Update user profile"""
    return UserManager.update_profile(user_id, data)


def update_user_settings(user_id: str, data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Update user settings"""
    return UserManager.update_user_settings(user_id, data)


def get_user_data(user_id: str) -> Dict[str, Any]:
    """Get complete user data"""
    return UserManager.get_user_data(user_id)


def delete_account(user_id: str) -> Tuple[bool, Optional[str]]:
    """Delete user account"""
    return UserManager.delete_account(user_id) 