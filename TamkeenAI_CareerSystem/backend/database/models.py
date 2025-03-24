"""
Database Models Module

This module defines the database models for the Tamkeen AI Career Intelligence System.
"""

import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

# Import database connector based on settings
from backend.config.settings import DB_TYPE, DB_CONFIG

# Import password hashing
from werkzeug.security import generate_password_hash, check_password_hash


class Database:
    """Database connection manager"""
    _instance = None
    
    @classmethod
    def get_instance(cls):
        """Get singleton database instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        """Initialize database connection"""
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to database based on configuration"""
        if DB_TYPE == 'sqlite':
            self._connect_sqlite()
        elif DB_TYPE == 'mysql':
            self._connect_mysql()
        elif DB_TYPE == 'postgresql':
            self._connect_postgresql()
        elif DB_TYPE == 'mongodb':
            self._connect_mongodb()
        else:
            raise ValueError(f"Unsupported database type: {DB_TYPE}")
    
    def _connect_sqlite(self):
        """Connect to SQLite database"""
        import sqlite3
        self.connection = sqlite3.connect(DB_CONFIG['sqlite']['path'])
        self.connection.row_factory = sqlite3.Row
        
        # Create tables if they don't exist
        self._create_sqlite_tables()
    
    def _connect_mysql(self):
        """Connect to MySQL database"""
        try:
            import mysql.connector
            self.connection = mysql.connector.connect(
                host=DB_CONFIG['mysql']['host'],
                port=DB_CONFIG['mysql']['port'],
                user=DB_CONFIG['mysql']['user'],
                password=DB_CONFIG['mysql']['password'],
                database=DB_CONFIG['mysql']['database']
            )
            
            # Create tables if they don't exist
            self._create_mysql_tables()
        except ImportError:
            raise ImportError("mysql-connector-python not installed. Install with: pip install mysql-connector-python")
    
    def _connect_postgresql(self):
        """Connect to PostgreSQL database"""
        try:
            import psycopg2
            import psycopg2.extras
            self.connection = psycopg2.connect(
                host=DB_CONFIG['postgresql']['host'],
                port=DB_CONFIG['postgresql']['port'],
                user=DB_CONFIG['postgresql']['user'],
                password=DB_CONFIG['postgresql']['password'],
                database=DB_CONFIG['postgresql']['database']
            )
            
            # Create tables if they don't exist
            self._create_postgresql_tables()
        except ImportError:
            raise ImportError("psycopg2 not installed. Install with: pip install psycopg2-binary")
    
    def _connect_mongodb(self):
        """Connect to MongoDB database"""
        try:
            import pymongo
            self.connection = pymongo.MongoClient(
                host=DB_CONFIG['mongodb']['host'],
                port=DB_CONFIG['mongodb']['port'],
                username=DB_CONFIG['mongodb']['user'],
                password=DB_CONFIG['mongodb']['password']
            )
            self.db = self.connection[DB_CONFIG['mongodb']['database']]
        except ImportError:
            raise ImportError("pymongo not installed. Install with: pip install pymongo")
    
    def _create_sqlite_tables(self):
        """Create SQLite tables if they don't exist"""
        cursor = self.connection.cursor()
        
        # Users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            job_title TEXT,
            industry TEXT,
            years_experience INTEGER,
            education_level TEXT,
            location TEXT,
            is_admin BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Resume profiles table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            name TEXT NOT NULL,
            parsed_data TEXT,
            file_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Career assessments table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS career_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            assessment_type TEXT NOT NULL,
            results TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # User skills table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            proficiency INTEGER NOT NULL,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # User activities table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            activity_type TEXT NOT NULL,
            activity_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Career plans table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS career_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            target_role TEXT NOT NULL,
            plan_data TEXT NOT NULL,
            timeframe INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Reports table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            report_type TEXT NOT NULL,
            file_path TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Commit changes
        self.connection.commit()
    
    def _create_mysql_tables(self):
        """Create MySQL tables if they don't exist"""
        # Implementation similar to SQLite but with MySQL syntax
        # (Not implemented fully in this example)
        pass
    
    def _create_postgresql_tables(self):
        """Create PostgreSQL tables if they don't exist"""
        # Implementation similar to SQLite but with PostgreSQL syntax
        # (Not implemented fully in this example)
        pass
    
    def execute_query(self, query, params=None):
        """Execute a database query"""
        cursor = self.connection.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        self.connection.commit()
        return cursor
    
    def fetch_one(self, query, params=None):
        """Execute a query and fetch one result"""
        cursor = self.execute_query(query, params)
        return cursor.fetchone()
    
    def fetch_all(self, query, params=None):
        """Execute a query and fetch all results"""
        cursor = self.execute_query(query, params)
        return cursor.fetchall()
    
    def insert(self, table, data):
        """Insert data into a table"""
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?'] * len(data))
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        
        cursor = self.execute_query(query, tuple(data.values()))
        return cursor.lastrowid
    
    def update(self, table, data, condition):
        """Update data in a table"""
        set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
        query = f"UPDATE {table} SET {set_clause} WHERE {condition}"
        
        self.execute_query(query, tuple(data.values()))
    
    def delete(self, table, condition):
        """Delete data from a table"""
        query = f"DELETE FROM {table} WHERE {condition}"
        self.execute_query(query)


class BaseModel:
    """Base model with common functionality"""
    table_name = None
    
    @classmethod
    def _get_db(cls):
        """Get database instance"""
        return Database.get_instance()
    
    @classmethod
    def find_by_id(cls, id):
        """Find a record by ID"""
        db = cls._get_db()
        result = db.fetch_one(f"SELECT * FROM {cls.table_name} WHERE id = ?", (id,))
        
        if result:
            return cls(**dict(result))
        return None
    
    def save(self):
        """Save the model (insert or update)"""
        db = self._get_db()
        
        if hasattr(self, 'id') and self.id:
            # Update existing record
            data = self.to_dict()
            id_value = data.pop('id')
            
            if 'updated_at' in data:
                data['updated_at'] = datetime.now()
            
            db.update(self.table_name, data, f"id = {id_value}")
        else:
            # Insert new record
            data = self.to_dict()
            if 'id' in data:
                data.pop('id')
                
            if 'created_at' in data and not data['created_at']:
                data['created_at'] = datetime.now()
                
            if 'updated_at' in data:
                data['updated_at'] = datetime.now()
                
            self.id = db.insert(self.table_name, data)
    
    def delete(self):
        """Delete the model"""
        if hasattr(self, 'id') and self.id:
            db = self._get_db()
            db.delete(self.table_name, f"id = {self.id}")
    
    def to_dict(self):
        """Convert model to dictionary"""
        result = {}
        for key, value in self.__dict__.items():
            if not key.startswith('_'):
                if isinstance(value, datetime):
                    result[key] = value.isoformat()
                else:
                    result[key] = value
        return result


class User(BaseModel):
    """User model"""
    table_name = 'users'
    
    def __init__(self, **kwargs):
        """Initialize user model"""
        self.id = kwargs.get('id')
        self.email = kwargs.get('email')
        self.password_hash = kwargs.get('password_hash')
        self.first_name = kwargs.get('first_name')
        self.last_name = kwargs.get('last_name')
        self.job_title = kwargs.get('job_title')
        self.industry = kwargs.get('industry')
        self.years_experience = kwargs.get('years_experience')
        self.education_level = kwargs.get('education_level')
        self.location = kwargs.get('location')
        self.is_admin = kwargs.get('is_admin', False)
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        db = cls._get_db()
        result = db.fetch_one(f"SELECT * FROM {cls.table_name} WHERE email = ?", (email,))
        
        if result:
            return cls(**dict(result))
        return None


class ResumeProfile(BaseModel):
    """Resume profile model"""
    table_name = 'resume_profiles'
    
    def __init__(self, **kwargs):
        """Initialize resume profile model"""
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.file_path = kwargs.get('file_path')
        self.name = kwargs.get('name')
        self.parsed_data = kwargs.get('parsed_data')
        self.file_type = kwargs.get('file_type')
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
    
    @property
    def parsed(self):
        """Get parsed data as dictionary"""
        if self.parsed_data:
            return json.loads(self.parsed_data)
        return {}
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all resume profiles for a user"""
        db = cls._get_db()
        results = db.fetch_all(
            f"SELECT * FROM {cls.table_name} WHERE user_id = ? ORDER BY created_at DESC", 
            (user_id,)
        )
        
        return [cls(**dict(result)) for result in results]


class CareerAssessment(BaseModel):
    """Career assessment model"""
    table_name = 'career_assessments'
    
    def __init__(self, **kwargs):
        """Initialize career assessment model"""
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.assessment_type = kwargs.get('assessment_type')
        self.results = kwargs.get('results')
        self.created_at = kwargs.get('created_at')
    
    @property
    def results_dict(self):
        """Get results as dictionary"""
        if self.results:
            return json.loads(self.results)
        return {}
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all assessments for a user"""
        db = cls._get_db()
        results = db.fetch_all(
            f"SELECT * FROM {cls.table_name} WHERE user_id = ? ORDER BY created_at DESC", 
            (user_id,)
        )
        
        return [cls(**dict(result)) for result in results]


class UserSkill(BaseModel):
    """User skill model"""
    table_name = 'user_skills'
    
    def __init__(self, **kwargs):
        """Initialize user skill model"""
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.name = kwargs.get('name')
        self.proficiency = kwargs.get('proficiency')
        self.category = kwargs.get('category')
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all skills for a user"""
        db = cls._get_db()
        results = db.fetch_all(
            f"SELECT * FROM {cls.table_name} WHERE user_id = ? ORDER BY name", 
            (user_id,)
        )
        
        return [cls(**dict(result)) for result in results]
    
    @classmethod
    def find_by_name_and_user(cls, name, user_id):
        """Find a skill by name and user"""
        db = cls._get_db()
        result = db.fetch_one(
            f"SELECT * FROM {cls.table_name} WHERE name = ? AND user_id = ?", 
            (name, user_id)
        )
        
        if result:
            return cls(**dict(result))
        return None


class UserActivity(BaseModel):
    """User activity model"""
    table_name = 'user_activities'
    
    def __init__(self, **kwargs):
        """Initialize user activity model"""
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.activity_type = kwargs.get('activity_type')
        self.activity_data = kwargs.get('activity_data')
        self.created_at = kwargs.get('created_at')
    
    @property
    def data(self):
        """Get activity data as dictionary"""
        if self.activity_data:
            return json.loads(self.activity_data)
        return {}
    
    @classmethod
    def find_by_user_id(cls, user_id, limit=50):
        """Find recent activities for a user"""
        db = cls._get_db()
        results = db.fetch_all(
            f"SELECT * FROM {cls.table_name} WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", 
            (user_id, limit)
        )
        
        return [cls(**dict(result)) for result in results]


class CareerPlan(BaseModel):
    """Career plan model"""
    table_name = 'career_plans'
    
    def __init__(self, **kwargs):
        """Initialize career plan model"""
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.target_role = kwargs.get('target_role')
        self.plan_data = kwargs.get('plan_data')
        self.timeframe = kwargs.get('timeframe')
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')
    
    @property
    def plan(self):
        """Get plan data as dictionary"""
        if self.plan_data:
            return json.loads(self.plan_data)
        return {}
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all career plans for a user"""
        db = cls._get_db()
        results = db.fetch_all(
            f"SELECT * FROM {cls.table_name} WHERE user_id = ? ORDER BY created_at DESC", 
            (user_id,)
        )
        
        return [cls(**dict(result)) for result in results]


class Report(BaseModel):
    """Report model"""
    table_name = 'reports'
    
    def __init__(self, **kwargs):
        """Initialize report model"""
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.report_type = kwargs.get('report_type')
        self.file_path = kwargs.get('file_path')
        self.name = kwargs.get('name')
        self.created_at = kwargs.get('created_at')
    
    @classmethod
    def find_by_user_id(cls, user_id):
        """Find all reports for a user"""
        db = cls._get_db()
        results = db.fetch_all(
            f"SELECT * FROM {cls.table_name} WHERE user_id = ? ORDER BY created_at DESC", 
            (user_id,)
        )
        
        return [cls(**dict(result)) for result in results] 