"""
Database Models Module

This module defines the database models for the Tamkeen AI Career Intelligence System.
"""

import json
import uuid
import hashlib
import bcrypt
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import database connector
from backend.database.connector import get_db, DatabaseError


class BaseModel:
    """Base model with common functionality"""
    
    table_name = None
    
    def __init__(self, **kwargs):
        """Initialize model with attributes"""
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def save(self) -> bool:
        """
        Save model to database
        
        Returns:
            bool: Success status
        """
        if not self.table_name:
            raise ValueError("table_name must be specified")
        
        db = get_db()
        
        # Convert model to dictionary
        data = self.to_dict()
        
        # Check if record exists
        if hasattr(self, 'id') and self.id:
            existing = db.fetch_one(f"SELECT id FROM {self.table_name} WHERE id = ?", (self.id,))
            
            if existing:
                # Update existing record
                fields = [f"{key} = ?" for key in data.keys() if key != 'id']
                values = [value for key, value in data.items() if key != 'id']
                values.append(self.id)  # Add ID for WHERE clause
                
                query = f"UPDATE {self.table_name} SET {', '.join(fields)} WHERE id = ?"
                db.execute(query, tuple(values))
            else:
                # Insert new record
                fields = ', '.join(data.keys())
                placeholders = ', '.join(['?'] * len(data))
                values = tuple(data.values())
                
                query = f"INSERT INTO {self.table_name} ({fields}) VALUES ({placeholders})"
                db.execute(query, values)
        else:
            # Insert new record with generated ID
            if 'id' not in data:
                data['id'] = str(uuid.uuid4())
                self.id = data['id']
            
            fields = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            values = tuple(data.values())
            
            query = f"INSERT INTO {self.table_name} ({fields}) VALUES ({placeholders})"
            db.execute(query, values)
        
        db.commit()
        return True
    
    def delete(self) -> bool:
        """
        Delete model from database
        
        Returns:
            bool: Success status
        """
        if not self.table_name:
            raise ValueError("table_name must be specified")
        
        if not hasattr(self, 'id') or not self.id:
            raise ValueError("Model must have an id to delete")
        
        db = get_db()
        db.execute(f"DELETE FROM {self.table_name} WHERE id = ?", (self.id,))
        db.commit()
        
        return True
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to dictionary
        
        Returns:
            dict: Model attributes
        """
        result = {}
        
        for key, value in self.__dict__.items():
            if not key.startswith('_'):
                result[key] = value
        
        return result
    
    @classmethod
    def find_by_id(cls, id: str) -> Optional['BaseModel']:
        """
        Find model by ID
        
        Args:
            id: Model ID
            
        Returns:
            BaseModel or None: Found model or None
        """
        if not cls.table_name:
            raise ValueError("table_name must be specified")
        
        db = get_db()
        row = db.fetch_one(f"SELECT * FROM {cls.table_name} WHERE id = ?", (id,))
        
        if row:
            return cls(**row)
        
        return None
    
    @classmethod
    def find_all(cls) -> List['BaseModel']:
        """
        Find all models
        
        Returns:
            list: List of models
        """
        if not cls.table_name:
            raise ValueError("table_name must be specified")
        
        db = get_db()
        rows = db.fetch_all(f"SELECT * FROM {cls.table_name}")
        
        return [cls(**row) for row in rows]


class User(BaseModel):
    """User model"""
    
    table_name = 'users'
    
    def __init__(self, **kwargs):
        """Initialize user"""
        super().__init__(**kwargs)
        self._password = kwargs.get('password')
    
    def set_password(self, password: str):
        """
        Set hashed password
        
        Args:
            password: Plain text password
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode(), salt)
        self.password = hashed.decode()
    
    def check_password(self, password: str) -> bool:
        """
        Check password
        
        Args:
            password: Plain text password
            
        Returns:
            bool: Password matches
        """
        return bcrypt.checkpw(password.encode(), self.password.encode())
    
    @classmethod
    def find_by_email(cls, email: str) -> Optional['User']:
        """
        Find user by email
        
        Args:
            email: User email
            
        Returns:
            User or None: Found user or None
        """
        db = get_db()
        row = db.fetch_one(f"SELECT * FROM {cls.table_name} WHERE email = ?", (email,))
        
        if row:
            return cls(**row)
        
        return None
    
    @classmethod
    def find_by_username(cls, username: str) -> Optional['User']:
        """
        Find user by username
        
        Args:
            username: Username
            
        Returns:
            User or None: Found user or None
        """
        db = get_db()
        row = db.fetch_one(f"SELECT * FROM {cls.table_name} WHERE username = ?", (username,))
        
        if row:
            return cls(**row)
        
        return None
    
    @classmethod
    def find_by_reset_token(cls, token: str) -> List['User']:
        """
        Find user by reset token
        
        Args:
            token: Reset token
            
        Returns:
            list: Found users
        """
        db = get_db()
        rows = db.fetch_all(f"SELECT * FROM {cls.table_name} WHERE reset_token = ?", (token,))
        
        return [cls(**row) for row in rows]


class UserProfile(BaseModel):
    """User profile model"""
    
    table_name = 'user_profiles'
    
    def __init__(self, **kwargs):
        """Initialize user profile"""
        super().__init__(**kwargs)
    
    @classmethod
    def find_by_user_id(cls, user_id: str, limit: int = 20, offset: int = 0) -> List['UserActivity']:
        """
        Find activities by user ID
        
        Args:
            user_id: User ID
            limit: Maximum number of records
            offset: Offset for pagination
            
        Returns:
            list: User activities
        """
        db = get_db()
        rows = db.fetch_all(
            f"SELECT * FROM {cls.table_name} WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", 
            (user_id, limit, offset)
        )
        
        return [cls(**row) for row in rows]


class ReportTemplate(BaseModel):
    """Report template model"""
    
    table_name = 'report_templates'


class Report(BaseModel):
    """Report model"""
    
    table_name = 'reports'


# More models can be added as needed 