"""
Database Models Module

This module provides data models for the Tamkeen AI Career Intelligence System.
"""

import os
import json
import logging
import uuid
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import database connector
from backend.database.connector import get_db, DatabaseError

# Import utilities
from backend.utils.auth import hash_password, verify_password
from backend.utils.date_utils import now, format_date, parse_date

# Setup logger
logger = logging.getLogger(__name__)


class BaseModel:
    """Base model with common functionality"""
    
    # Database table name
    table_name = None
    
    # Primary key field
    id_field = "id"
    
    def __init__(self, **kwargs):
        """Initialize model with data"""
        for key, value in kwargs.items():
            setattr(self, key, value)
        
        # Generate ID if not provided
        if not hasattr(self, self.id_field):
            setattr(self, self.id_field, str(uuid.uuid4()))
        
        # Set timestamps if not provided
        if not hasattr(self, "created_at"):
            self.created_at = now()
        
        if not hasattr(self, "updated_at"):
            self.updated_at = now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        data = {}
        
        for key, value in self.__dict__.items():
            # Skip private attributes
            if key.startswith("_"):
                continue
            
            # Convert datetime to string
            if isinstance(value, datetime):
                data[key] = format_date(value)
            # Convert JSON fields
            elif key in getattr(self, "json_fields", []):
                if value is None:
                    data[key] = {}
                elif isinstance(value, str):
                    try:
                        data[key] = json.loads(value)
                    except:
                        data[key] = value
                else:
                    data[key] = value
            else:
                data[key] = value
        
        return data
    
    def save(self) -> bool:
        """Save model to database"""
        try:
            # Update timestamp
            self.updated_at = now()
            
            # Get database connection
            db = get_db()
            
            # Convert to dict
            data = self.to_dict()
            
            # Convert datetime to string
            for key, value in data.items():
                if isinstance(value, datetime):
                    data[key] = format_date(value)
            
            # Convert JSON fields
            for field in getattr(self, "json_fields", []):
                if field in data and not isinstance(data[field], str):
                    data[field] = json.dumps(data[field])
            
            # Find existing record
            existing = self.find_by_id(getattr(self, self.id_field))
            
            if existing:
                # Update existing record
                db.update(self.table_name, self.id_field, getattr(self, self.id_field), data)
            else:
                # Insert new record
                db.insert(self.table_name, data)
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving {self.__class__.__name__}: {str(e)}")
            return False
    
    def delete(self) -> bool:
        """Delete model from database"""
        try:
            # Get database connection
            db = get_db()
            
            # Delete record
            db.delete(self.table_name, self.id_field, getattr(self, self.id_field))
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting {self.__class__.__name__}: {str(e)}")
            return False
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BaseModel':
        """Create model from dictionary"""
        instance = cls()
        
        for key, value in data.items():
            # Convert string to datetime
            if key in ["created_at", "updated_at"] and isinstance(value, str):
                setattr(instance, key, parse_date(value))
            # Convert JSON fields
            elif key in getattr(cls, "json_fields", []) and isinstance(value, str):
                try:
                    setattr(instance, key, json.loads(value))
                except:
                    setattr(instance, key, value)
            else:
                setattr(instance, key, value)
        
        return instance
    
    @classmethod
    def find_all(cls, limit: int = 1000, offset: int = 0, 
                sort_by: Optional[str] = None, sort_dir: str = "asc") -> List['BaseModel']:
        """Find all records"""
        try:
            # Get database connection
            db = get_db()
            
            # Get records
            records = db.find_all(cls.table_name, limit, offset, sort_by, sort_dir)
            
            # Convert to model instances
            return [cls.from_dict(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error finding all {cls.__name__}: {str(e)}")
            return []
    
    @classmethod
    def find_by_id(cls, id_value: Any) -> List['BaseModel']:
        """Find record by ID"""
        try:
            # Get database connection
            db = get_db()
            
            # Get record
            records = db.find_by_id(cls.table_name, cls.id_field, id_value)
            
            # Convert to model instances
            return [cls.from_dict(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error finding {cls.__name__} by ID: {str(e)}")
            return []
    
    @classmethod
    def find_by_field(cls, field: str, value: Any) -> List['BaseModel']:
        """Find records by field"""
        try:
            # Get database connection
            db = get_db()
            
            # Get records
            records = db.find_by_field(cls.table_name, field, value)
            
            # Convert to model instances
            return [cls.from_dict(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error finding {cls.__name__} by field: {str(e)}")
            return []
    
    @classmethod
    def find_by_fields(cls, fields: Dict[str, Any]) -> List['BaseModel']:
        """Find records by multiple fields"""
        try:
            # Get database connection
            db = get_db()
            
            # Get records
            records = db.find_by_fields(cls.table_name, fields)
            
            # Convert to model instances
            return [cls.from_dict(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error finding {cls.__name__} by fields: {str(e)}")
            return []
    
    @classmethod
    def delete_all(cls) -> bool:
        """Delete all records"""
        try:
            # Get database connection
            db = get_db()
            
            # Delete all records
            db.delete_all(cls.table_name)
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting all {cls.__name__}: {str(e)}")
            return False


class User(BaseModel):
    """User model"""
    
    # Database table name
    table_name = "users"
    
    # JSON fields
    json_fields = ["profile", "settings"]
    
    def __init__(self, **kwargs):
        """Initialize user with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "profile"):
            self.profile = {}
        
        if not hasattr(self, "settings"):
            self.settings = {}
        
        if not hasattr(self, "verified"):
            self.verified = False
        
        if not hasattr(self, "status"):
            self.status = "active"
    
    def set_password(self, password: str) -> None:
        """Set hashed password"""
        self.password = hash_password(password)
    
    def check_password(self, password: str) -> bool:
        """Check if password is correct"""
        return verify_password(password, self.password)
    
    @classmethod
    def find_by_email(cls, email: str) -> List['User']:
        """Find user by email"""
        return cls.find_by_field("email", email)
    
    @classmethod
    def find_active_users(cls) -> List['User']:
        """Find active users"""
        return cls.find_by_field("status", "active")


class Job(BaseModel):
    """Job model"""
    
    # Database table name
    table_name = "jobs"
    
    # JSON fields
    json_fields = ["company", "location", "requirements", "skills", "benefits", "metadata"]
    
    def __init__(self, **kwargs):
        """Initialize job with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "company"):
            self.company = {}
        
        if not hasattr(self, "location"):
            self.location = {}
        
        if not hasattr(self, "requirements"):
            self.requirements = {}
        
        if not hasattr(self, "skills"):
            self.skills = []
        
        if not hasattr(self, "benefits"):
            self.benefits = []
        
        if not hasattr(self, "metadata"):
            self.metadata = {}
        
        if not hasattr(self, "status"):
            self.status = "active"
    
    @classmethod
    def find_active_jobs(cls) -> List['Job']:
        """Find active jobs"""
        return cls.find_by_field("status", "active")
    
    @classmethod
    def find_by_company(cls, company_id: str) -> List['Job']:
        """Find jobs by company ID"""
        jobs = []
        all_jobs = cls.find_active_jobs()
        
        for job in all_jobs:
            if job.company and "id" in job.company and job.company["id"] == company_id:
                jobs.append(job)
        
        return jobs
    
    @classmethod
    def search(cls, query: str, filters: Dict[str, Any] = None, 
              limit: int = 100, offset: int = 0) -> List['Job']:
        """Search jobs"""
        try:
            # Get database connection
            db = get_db()
            
            # Prepare search fields
            search_fields = ["title", "description", "company", "location"]
            
            # Add filters
            filter_fields = {}
            
            if filters:
                # Process filters
                if "status" in filters:
                    filter_fields["status"] = filters["status"]
                
                # Additional filters (would be more complex in a real system)
                # ...
            
            # Execute search
            records = db.search(cls.table_name, search_fields, query, filter_fields, limit, offset)
            
            # Convert to model instances
            return [cls.from_dict(record) for record in records]
            
        except Exception as e:
            logger.error(f"Error searching jobs: {str(e)}")
            return []


class JobApplication(BaseModel):
    """Job application model"""
    
    # Database table name
    table_name = "job_applications"
    
    # JSON fields
    json_fields = ["resume", "cover_letter", "answers", "metadata"]
    
    def __init__(self, **kwargs):
        """Initialize job application with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "resume"):
            self.resume = {}
        
        if not hasattr(self, "cover_letter"):
            self.cover_letter = {}
        
        if not hasattr(self, "answers"):
            self.answers = {}
        
        if not hasattr(self, "metadata"):
            self.metadata = {}
        
        if not hasattr(self, "status"):
            self.status = "submitted"
    
    @classmethod
    def find_by_user(cls, user_id: str) -> List['JobApplication']:
        """Find applications by user ID"""
        return cls.find_by_field("user_id", user_id)
    
    @classmethod
    def find_by_job(cls, job_id: str) -> List['JobApplication']:
        """Find applications by job ID"""
        return cls.find_by_field("job_id", job_id)
    
    @classmethod
    def find_by_user_and_job(cls, user_id: str, job_id: str) -> List['JobApplication']:
        """Find applications by user ID and job ID"""
        return cls.find_by_fields({"user_id": user_id, "job_id": job_id})


class UserActivity(BaseModel):
    """User activity model"""
    
    # Database table name
    table_name = "user_activities"
    
    # JSON fields
    json_fields = ["activity_data"]
    
    def __init__(self, **kwargs):
        """Initialize user activity with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "activity_data"):
            self.activity_data = {}
    
    @classmethod
    def find_by_user_id(cls, user_id: str) -> List['UserActivity']:
        """Find activities by user ID"""
        return cls.find_by_field("user_id", user_id)
    
    @classmethod
    def find_by_activity_type(cls, activity_type: str) -> List['UserActivity']:
        """Find activities by type"""
        return cls.find_by_field("activity_type", activity_type)
    
    @classmethod
    def record_activity(cls, user_id: str, activity_type: str, 
                       activity_data: Dict[str, Any]) -> bool:
        """Record user activity"""
        try:
            # Create activity
            activity = cls(
                user_id=user_id,
                activity_type=activity_type,
                activity_data=activity_data
            )
            
            # Save activity
            return activity.save()
            
        except Exception as e:
            logger.error(f"Error recording user activity: {str(e)}")
            return False


class Resume(BaseModel):
    """Resume model"""
    
    # Database table name
    table_name = "resumes"
    
    # JSON fields
    json_fields = ["parsed_data", "original_text", "metadata"]
    
    def __init__(self, **kwargs):
        """Initialize resume with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "parsed_data"):
            self.parsed_data = {}
        
        if not hasattr(self, "original_text"):
            self.original_text = ""
        
        if not hasattr(self, "metadata"):
            self.metadata = {}
    
    @classmethod
    def find_by_user(cls, user_id: str) -> List['Resume']:
        """Find resumes by user ID"""
        return cls.find_by_field("user_id", user_id)
    
    @classmethod
    def find_latest_by_user(cls, user_id: str) -> Optional['Resume']:
        """Find latest resume by user ID"""
        resumes = cls.find_by_user(user_id)
        
        if not resumes:
            return None
        
        # Sort by created_at (newest first)
        resumes.sort(key=lambda r: r.created_at, reverse=True)
        
        return resumes[0]


class JobMarketData(BaseModel):
    """Job market data model"""
    
    # Database table name
    table_name = "job_market_data"
    
    # JSON fields
    json_fields = ["data_value"]
    
    def __init__(self, **kwargs):
        """Initialize job market data with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "data_value"):
            self.data_value = {}
    
    @classmethod
    def find_by_data_type(cls, data_type: str) -> List['JobMarketData']:
        """Find job market data by type"""
        return cls.find_by_field("data_type", data_type)
    
    @classmethod
    def find_latest_by_data_type(cls, data_type: str) -> Optional['JobMarketData']:
        """Find latest job market data by type"""
        data_items = cls.find_by_data_type(data_type)
        
        if not data_items:
            return None
        
        # Sort by created_at (newest first)
        data_items.sort(key=lambda d: d.created_at, reverse=True)
        
        return data_items[0]


class JobMarketQuery(BaseModel):
    """Job market query model (for tracking user queries)"""
    
    # Database table name
    table_name = "job_market_queries"
    
    # JSON fields
    json_fields = ["query_params", "results_summary"]
    
    def __init__(self, **kwargs):
        """Initialize job market query with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "query_params"):
            self.query_params = {}
        
        if not hasattr(self, "results_summary"):
            self.results_summary = {}
    
    @classmethod
    def find_by_user(cls, user_id: str) -> List['JobMarketQuery']:
        """Find job market queries by user ID"""
        return cls.find_by_field("user_id", user_id)


class Cache(BaseModel):
    """Cache model (for database caching)"""
    
    # Database table name
    table_name = "cache"
    
    # Primary key field
    id_field = "cache_key"
    
    # JSON fields
    json_fields = ["data_value"]
    
    def __init__(self, **kwargs):
        """Initialize cache with data"""
        super().__init__(**kwargs)
        
        # Set default values
        if not hasattr(self, "data_value"):
            self.data_value = {}
    
    @classmethod
    def find_by_key(cls, cache_key: str) -> List['Cache']:
        """Find cache entry by key"""
        return cls.find_by_id(cache_key) 