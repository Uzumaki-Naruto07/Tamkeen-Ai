"""
Database models for TamkeenAI Career System.
"""

import uuid
from datetime import datetime
import logging

# Setup logger
logger = logging.getLogger(__name__)

class User:
    """
    User model class.
    
    Note: In a real application, this would be an ORM model (e.g., SQLAlchemy),
    but for now, we're using a simple class with class methods for mockup.
    """
    # Mock database of users
    _users = {
        "user1": {
            "id": "user1",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "user",
            "roles": ["user"],
            "active": True,
            "created_at": datetime.now().isoformat()
        },
        "user2": {
            "id": "user2",
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "role": "admin",
            "roles": ["user", "admin"],
            "active": True,
            "created_at": datetime.now().isoformat()
        }
    }
    
    def __init__(self, user_data):
        """
        Initialize a user instance.
        
        Args:
            user_data: User data dictionary
        """
        self.id = user_data.get("id")
        self.name = user_data.get("name")
        self.email = user_data.get("email")
        self.role = user_data.get("role", "user")
        self.roles = user_data.get("roles", ["user"])
        self.active = user_data.get("active", True)
        self.created_at = user_data.get("created_at")
        
    @classmethod
    def find_by_id(cls, user_id):
        """
        Find a user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User instance if found, None otherwise
        """
        user_data = cls._users.get(user_id)
        if user_data:
            return cls(user_data)
        return None
        
    @classmethod
    def find_by_email(cls, email):
        """
        Find a user by email.
        
        Args:
            email: User email
            
        Returns:
            User instance if found, None otherwise
        """
        for user_id, user_data in cls._users.items():
            if user_data.get("email") == email:
                return cls(user_data)
        return None
        
    def to_dict(self):
        """
        Convert user instance to dictionary.
        
        Returns:
            Dict representation of user
        """
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "roles": self.roles,
            "active": self.active,
            "created_at": self.created_at
        }


class UserActivity:
    """User activity model for tracking user actions and behavior."""
    
    def __init__(self, user_id=None, activity_type=None, activity_data=None,
                 ip_address=None, user_agent=None, created_at=None):
        """Initialize a user activity object."""
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.activity_type = activity_type  # login, view_job, apply_job, update_profile, etc.
        self.activity_data = activity_data or {}
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.created_at = created_at or datetime.now().isoformat()
    
    def to_dict(self):
        """Convert user activity to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'activity_data': self.activity_data,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at
        }
    
    @staticmethod
    def find_by_user(user_id, limit=None, activity_type=None):
        """Find activities by user ID with optional filtering."""
        # This is a placeholder for actual database query logic
        return []
    
    @staticmethod
    def find_by_id(activity_id):
        """Find a user activity by ID."""
        # This is a placeholder for actual database query logic
        return None
    
    def save(self):
        """Save the user activity to the database."""
        # This is a placeholder for actual database saving logic
        return True


class Resume:
    """Resume model for storing user resumes and CVs."""
    
    def __init__(self, user_id=None, title=None, content=None, 
                 skills=None, education=None, experience=None,
                 created_at=None, updated_at=None):
        """Initialize a resume object."""
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.title = title or 'My Resume'
        self.content = content or {}
        self.skills = skills or []
        self.education = education or []
        self.experience = experience or []
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def to_dict(self):
        """Convert resume to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'content': self.content,
            'skills': self.skills,
            'education': self.education,
            'experience': self.experience,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @staticmethod
    def find_by_user(user_id):
        """Find resumes by user ID."""
        # This is a placeholder for actual database query logic
        return []
    
    @staticmethod
    def find_by_id(resume_id):
        """Find a resume by ID."""
        # This is a placeholder for actual database query logic
        return None
    
    def save(self):
        """Save the resume to the database."""
        # This is a placeholder for actual database saving logic
        return True


class Job:
    """Job model for storing job listings."""
    
    def __init__(self, title=None, company=None, description=None, 
                 requirements=None, location=None, salary_range=None,
                 job_type=None, created_at=None, updated_at=None):
        """Initialize a job object."""
        self.id = str(uuid.uuid4())
        self.title = title
        self.company = company
        self.description = description
        self.requirements = requirements or []
        self.location = location
        self.salary_range = salary_range or {}
        self.job_type = job_type
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def to_dict(self):
        """Convert job to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'description': self.description,
            'requirements': self.requirements,
            'location': self.location,
            'salary_range': self.salary_range,
            'job_type': self.job_type,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @staticmethod
    def find_all():
        """Find all jobs."""
        # This is a placeholder for actual database query logic
        return []
    
    @staticmethod
    def find_by_id(job_id):
        """Find a job by ID."""
        # This is a placeholder for actual database query logic
        return None
    
    def save(self):
        """Save the job to the database."""
        # This is a placeholder for actual database saving logic
        return True


class JobApplication:
    """Job application model for tracking user job applications."""
    
    def __init__(self, user_id=None, job_id=None, resume_id=None,
                 status=None, cover_letter=None, application_date=None,
                 created_at=None, updated_at=None):
        """Initialize a job application object."""
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.job_id = job_id
        self.resume_id = resume_id
        self.status = status or 'pending'  # pending, interviewing, rejected, accepted
        self.cover_letter = cover_letter
        self.application_date = application_date or datetime.now().isoformat()
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()
    
    def to_dict(self):
        """Convert job application to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'resume_id': self.resume_id,
            'status': self.status,
            'cover_letter': self.cover_letter,
            'application_date': self.application_date,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @staticmethod
    def find_by_user(user_id):
        """Find job applications by user ID."""
        # This is a placeholder for actual database query logic
        return []
    
    @staticmethod
    def find_by_job(job_id):
        """Find job applications by job ID."""
        # This is a placeholder for actual database query logic
        return []
    
    @staticmethod
    def find_by_id(application_id):
        """Find a job application by ID."""
        # This is a placeholder for actual database query logic
        return None
    
    def save(self):
        """Save the job application to the database."""
        # This is a placeholder for actual database saving logic
        return True 