"""
User Information Module

This module handles the collection, validation, and storage of user profile data
and career goals for the Tamkeen AI Career Intelligence System.
"""

import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Union

# Import settings
from config.settings import BASE_DIR

# Define path for user data storage
USER_DATA_DIR = os.path.join(BASE_DIR, 'data', 'users')
os.makedirs(USER_DATA_DIR, exist_ok=True)

class UserProfile:
    """Class to handle user profile information and operations"""
    
    def __init__(self, user_id: Optional[str] = None):
        """
        Initialize user profile with optional existing user ID
        
        Args:
            user_id: Existing user ID, or None to create a new user
        """
        if user_id:
            self.user_id = user_id
        else:
            self.user_id = str(uuid.uuid4())
        
        self.profile_data = {
            "user_id": self.user_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "personal_info": {},
            "education": [],
            "experience": [],
            "skills": [],
            "certifications": [],
            "career_goals": {},
            "personality_assessment": {},
            "preferences": {
                "language": "en",
                "work_environment": "",
                "industry": ""
            },
            "gamification": {
                "level": 1,
                "xp": 0,
                "badges": []
            }
        }
        
        # Try to load existing data if user_id was provided
        if user_id:
            self.load_profile()
    
    def load_profile(self) -> bool:
        """
        Load user profile from storage
        
        Returns:
            bool: True if profile was loaded successfully, False otherwise
        """
        profile_path = os.path.join(USER_DATA_DIR, f"{self.user_id}.json")
        
        if os.path.exists(profile_path):
            try:
                with open(profile_path, 'r', encoding='utf-8') as file:
                    self.profile_data = json.load(file)
                return True
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading profile: {e}")
                return False
        return False
    
    def save_profile(self) -> bool:
        """
        Save user profile to storage
        
        Returns:
            bool: True if profile was saved successfully, False otherwise
        """
        # Update the last modified timestamp
        self.profile_data["updated_at"] = datetime.now().isoformat()
        
        profile_path = os.path.join(USER_DATA_DIR, f"{self.user_id}.json")
        
        try:
            with open(profile_path, 'w', encoding='utf-8') as file:
                json.dump(self.profile_data, file, indent=2, ensure_ascii=False)
            return True
        except IOError as e:
            print(f"Error saving profile: {e}")
            return False
    
    def update_personal_info(self, data: Dict[str, str]) -> bool:
        """
        Update personal information
        
        Args:
            data: Dictionary containing personal information fields
            
        Returns:
            bool: True if update was successful
        """
        # Validate required fields
        required_fields = ['name', 'email']
        for field in required_fields:
            if field in data and not data[field]:
                return False
        
        # Update personal info
        self.profile_data["personal_info"].update(data)
        return self.save_profile()
    
    def add_education(self, education_data: Dict[str, str]) -> bool:
        """
        Add education entry
        
        Args:
            education_data: Dictionary containing education information
            
        Returns:
            bool: True if addition was successful
        """
        # Validate required fields
        required_fields = ['degree', 'institution']
        for field in required_fields:
            if field not in education_data or not education_data[field]:
                return False
        
        # Add unique ID to education entry
        education_data['id'] = str(uuid.uuid4())
        
        # Add education entry
        self.profile_data["education"].append(education_data)
        return self.save_profile()
    
    def add_experience(self, experience_data: Dict[str, str]) -> bool:
        """
        Add work experience entry
        
        Args:
            experience_data: Dictionary containing experience information
            
        Returns:
            bool: True if addition was successful
        """
        # Validate required fields
        required_fields = ['title', 'company', 'start_date']
        for field in required_fields:
            if field not in experience_data or not experience_data[field]:
                return False
        
        # Add unique ID to experience entry
        experience_data['id'] = str(uuid.uuid4())
        
        # Add experience entry
        self.profile_data["experience"].append(experience_data)
        return self.save_profile()
    
    def update_skills(self, skills: List[Dict[str, Union[str, int]]]) -> bool:
        """
        Update skills list
        
        Args:
            skills: List of skills with name and proficiency level
            
        Returns:
            bool: True if update was successful
        """
        if not isinstance(skills, list):
            return False
        
        # Validate each skill entry
        for skill in skills:
            if not isinstance(skill, dict) or 'name' not in skill:
                return False
            
            # Ensure proficiency is an integer between 1-5 if provided
            if 'proficiency' in skill:
                try:
                    proficiency = int(skill['proficiency'])
                    if proficiency < 1 or proficiency > 5:
                        skill['proficiency'] = 3  # Default to medium if out of range
                except (ValueError, TypeError):
                    skill['proficiency'] = 3  # Default to medium if invalid
        
        # Update skills
        self.profile_data["skills"] = skills
        return self.save_profile()
    
    def add_certification(self, cert_data: Dict[str, str]) -> bool:
        """
        Add certification entry
        
        Args:
            cert_data: Dictionary containing certification information
            
        Returns:
            bool: True if addition was successful
        """
        # Validate required fields
        required_fields = ['name', 'issuer']
        for field in required_fields:
            if field not in cert_data or not cert_data[field]:
                return False
        
        # Add unique ID to certification entry
        cert_data['id'] = str(uuid.uuid4())
        
        # Add certification entry
        self.profile_data["certifications"].append(cert_data)
        return self.save_profile()
    
    def update_career_goals(self, goals_data: Dict[str, Any]) -> bool:
        """
        Update career goals
        
        Args:
            goals_data: Dictionary containing career goals information
            
        Returns:
            bool: True if update was successful
        """
        self.profile_data["career_goals"].update(goals_data)
        return self.save_profile()
    
    def update_personality_assessment(self, assessment_data: Dict[str, Any]) -> bool:
        """
        Update personality assessment results
        
        Args:
            assessment_data: Dictionary containing personality assessment results
            
        Returns:
            bool: True if update was successful
        """
        self.profile_data["personality_assessment"].update(assessment_data)
        return self.save_profile()
    
    def update_preferences(self, preferences: Dict[str, str]) -> bool:
        """
        Update user preferences
        
        Args:
            preferences: Dictionary containing user preferences
            
        Returns:
            bool: True if update was successful
        """
        self.profile_data["preferences"].update(preferences)
        return self.save_profile()
    
    def add_xp(self, points: int) -> int:
        """
        Add experience points and handle level progression
        
        Args:
            points: Number of XP points to add
            
        Returns:
            int: New user level after adding XP
        """
        # Current gamification data
        gamification = self.profile_data["gamification"]
        current_xp = gamification["xp"]
        current_level = gamification["level"]
        
        # Add XP
        new_xp = current_xp + points
        gamification["xp"] = new_xp
        
        # Calculate new level (simple formula: level up every 1000 XP)
        new_level = 1 + (new_xp // 1000)
        
        # Check if user leveled up
        level_up = new_level > current_level
        if level_up:
            gamification["level"] = new_level
        
        # Save changes
        self.save_profile()
        
        return new_level
    
    def add_badge(self, badge_id: str, badge_name: str, description: str) -> bool:
        """
        Award a badge to the user
        
        Args:
            badge_id: Unique identifier for the badge
            badge_name: Display name of the badge
            description: Description of the badge achievement
            
        Returns:
            bool: True if badge was added, False if already exists
        """
        # Check if badge already exists
        existing_badges = self.profile_data["gamification"]["badges"]
        if any(badge["id"] == badge_id for badge in existing_badges):
            return False
        
        # Add new badge
        badge_data = {
            "id": badge_id,
            "name": badge_name,
            "description": description,
            "awarded_at": datetime.now().isoformat()
        }
        
        self.profile_data["gamification"]["badges"].append(badge_data)
        return self.save_profile()
    
    def get_profile(self) -> Dict[str, Any]:
        """
        Get complete user profile
        
        Returns:
            dict: Complete user profile data
        """
        return self.profile_data
    
    def get_career_readiness_score(self) -> int:
        """
        Calculate career readiness score based on profile completeness
        
        Returns:
            int: Career readiness score (0-100)
        """
        score = 0
        
        # Personal info completeness (20%)
        personal_info = self.profile_data["personal_info"]
        required_personal = ['name', 'email']
        optional_personal = ['phone', 'location', 'linkedin', 'website']
        
        personal_score = 0
        for field in required_personal:
            if field in personal_info and personal_info[field]:
                personal_score += 10
        
        for field in optional_personal:
            if field in personal_info and personal_info[field]:
                personal_score += 2.5
        
        score += min(20, personal_score)
        
        # Education (15%)
        if len(self.profile_data["education"]) > 0:
            score += 15
        
        # Experience (20%)
        experience_count = len(self.profile_data["experience"])
        if experience_count > 0:
            experience_score = min(20, experience_count * 7)
            score += experience_score
        
        # Skills (20%)
        skill_count = len(self.profile_data["skills"])
        if skill_count > 0:
            skill_score = min(20, skill_count * 2)
            score += skill_score
        
        # Certifications (10%)
        cert_count = len(self.profile_data["certifications"])
        if cert_count > 0:
            cert_score = min(10, cert_count * 3)
            score += cert_score
        
        # Career goals (10%)
        if self.profile_data["career_goals"] and len(self.profile_data["career_goals"]) > 0:
            score += 10
        
        # Personality assessment (5%)
        if self.profile_data["personality_assessment"] and len(self.profile_data["personality_assessment"]) > 0:
            score += 5
        
        return int(score)


def create_new_user() -> str:
    """
    Create a new user profile
    
    Returns:
        str: New user ID
    """
    user = UserProfile()
    user.save_profile()
    return user.user_id


def get_user_by_id(user_id: str) -> Optional[UserProfile]:
    """
    Get user profile by ID
    
    Args:
        user_id: User ID to retrieve
        
    Returns:
        UserProfile or None: User profile if found, None otherwise
    """
    user = UserProfile(user_id)
    if user.load_profile():
        return user
    return None


def get_user_by_email(email: str) -> Optional[UserProfile]:
    """
    Get user profile by email
    
    Args:
        email: User email to search for
        
    Returns:
        UserProfile or None: User profile if found, None otherwise
    """
    # This is inefficient for large systems - would use a database in production
    for filename in os.listdir(USER_DATA_DIR):
        if filename.endswith(".json"):
            file_path = os.path.join(USER_DATA_DIR, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    if data.get("personal_info", {}).get("email") == email:
                        return UserProfile(data["user_id"])
            except (json.JSONDecodeError, IOError):
                continue
    return None


def validate_profile_data(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Validate profile data and return errors if any
    
    Args:
        data: User profile data to validate
        
    Returns:
        dict: Dictionary of validation errors by field
    """
    errors = {}
    
    # Validate personal info
    if 'personal_info' in data:
        personal_info = data['personal_info']
        
        # Name validation
        if 'name' in personal_info:
            name = personal_info['name']
            if not name or len(name) < 2:
                errors.setdefault('personal_info', {}).setdefault('name', []).append(
                    "Name must be at least 2 characters long")
        
        # Email validation
        if 'email' in personal_info:
            email = personal_info['email']
            import re
            email_pattern = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")
            if not email or not email_pattern.match(email):
                errors.setdefault('personal_info', {}).setdefault('email', []).append(
                    "Please provide a valid email address")
    
    # Validate skills
    if 'skills' in data:
        skills = data['skills']
        if not isinstance(skills, list):
            errors.setdefault('skills', []).append("Skills must be a list")
        else:
            for i, skill in enumerate(skills):
                if not isinstance(skill, dict) or 'name' not in skill:
                    errors.setdefault('skills', []).append(
                        f"Skill at position {i} must have a name")
    
    # Return validation errors
    return errors 