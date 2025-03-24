"""
Database Connector Module

This module provides database connection and management utilities for different
database backends.
"""

import os
import json
import sqlite3
from typing import Dict, List, Any, Optional, Tuple, Union
import logging
from datetime import datetime

# Import settings
from backend.config.settings import DB_TYPE, DB_CONFIG

# Setup logger
logger = logging.getLogger(__name__)


class DatabaseError(Exception):
    """Database operation error"""
    pass


class Database:
    """
    Database connection and management class with support for multiple database backends
    """
    _instance = None
    
    @classmethod
    def get_instance(cls):
        """
        Get singleton database instance
        
        Returns:
            Database: Database instance
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        """Initialize database connection"""
        self.connection = None
        self.cursor = None
        self.db_type = DB_TYPE
        self.connect()
    
    def connect(self):
        """Connect to database based on configuration"""
        logger.info(f"Connecting to {self.db_type} database")
        
        if self.db_type == 'sqlite':
            self._connect_sqlite()
        elif self.db_type == 'mysql':
            self._connect_mysql()
        elif self.db_type == 'postgresql':
            self._connect_postgresql()
        elif self.db_type == 'mongodb':
            self._connect_mongodb()
        else:
            error_msg = f"Unsupported database type: {self.db_type}"
            logger.error(error_msg)
            raise ValueError(error_msg)
    
    def _connect_sqlite(self):
        """Connect to SQLite database"""
        try:
            db_path = os.path.join(os.getcwd(), DB_CONFIG['sqlite']['path'])
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            
            self.connection = sqlite3.connect(db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            self.cursor = self.connection.cursor()
            
            # Create tables if they don't exist
            self._create_sqlite_tables()
            
            logger.info(f"Connected to SQLite database at {db_path}")
        except Exception as e:
            error_msg = f"Error connecting to SQLite database: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
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
            
            self.cursor = self.connection.cursor(dictionary=True)
            
            # Create tables if they don't exist
            self._create_mysql_tables()
            
            logger.info(f"Connected to MySQL database at {DB_CONFIG['mysql']['host']}")
        except ImportError:
            error_msg = "mysql-connector-python not installed. Install with: pip install mysql-connector-python"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
        except Exception as e:
            error_msg = f"Error connecting to MySQL database: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
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
            
            self.cursor = self.connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
            
            # Create tables if they don't exist
            self._create_postgresql_tables()
            
            logger.info(f"Connected to PostgreSQL database at {DB_CONFIG['postgresql']['host']}")
        except ImportError:
            error_msg = "psycopg2 not installed. Install with: pip install psycopg2-binary"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
        except Exception as e:
            error_msg = f"Error connecting to PostgreSQL database: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def _connect_mongodb(self):
        """Connect to MongoDB database"""
        try:
            import pymongo
            
            client = pymongo.MongoClient(
                host=DB_CONFIG['mongodb']['host'],
                port=DB_CONFIG['mongodb']['port'],
                username=DB_CONFIG['mongodb']['user'] if DB_CONFIG['mongodb']['user'] else None,
                password=DB_CONFIG['mongodb']['password'] if DB_CONFIG['mongodb']['password'] else None
            )
            
            self.connection = client[DB_CONFIG['mongodb']['database']]
            
            logger.info(f"Connected to MongoDB database at {DB_CONFIG['mongodb']['host']}")
        except ImportError:
            error_msg = "pymongo not installed. Install with: pip install pymongo"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
        except Exception as e:
            error_msg = f"Error connecting to MongoDB database: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def _create_sqlite_tables(self):
        """Create tables for SQLite database"""
        try:
            # Users table
            self.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    first_name TEXT,
                    last_name TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    is_admin BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    reset_token TEXT,
                    reset_token_expiry TIMESTAMP,
                    profile_data TEXT
                )
            ''')
            
            # Resume profiles table
            self.execute('''
                CREATE TABLE IF NOT EXISTS resume_profiles (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    file_path TEXT,
                    parsed_data TEXT,
                    skills TEXT,
                    experience TEXT,
                    education TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Career assessments table
            self.execute('''
                CREATE TABLE IF NOT EXISTS career_assessments (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    assessment_type TEXT NOT NULL,
                    assessment_data TEXT,
                    results TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # User skills table
            self.execute('''
                CREATE TABLE IF NOT EXISTS user_skills (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    skill_name TEXT NOT NULL,
                    proficiency INTEGER DEFAULT 1,
                    verified BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    UNIQUE(user_id, skill_name)
                )
            ''')
            
            # User activities table
            self.execute('''
                CREATE TABLE IF NOT EXISTS user_activities (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    activity_type TEXT NOT NULL,
                    activity_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Career plans table
            self.execute('''
                CREATE TABLE IF NOT EXISTS career_plans (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    target_role TEXT NOT NULL,
                    plan_data TEXT,
                    timeframe INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Reports table
            self.execute('''
                CREATE TABLE IF NOT EXISTS reports (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    report_type TEXT NOT NULL,
                    file_path TEXT,
                    name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Commit the changes
            self.commit()
            
            logger.info("SQLite tables created successfully")
        except Exception as e:
            error_msg = f"Error creating SQLite tables: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def _create_mysql_tables(self):
        """Create tables for MySQL database"""
        # Similar to _create_sqlite_tables but with MySQL syntax
        pass
    
    def _create_postgresql_tables(self):
        """Create tables for PostgreSQL database"""
        # Similar to _create_sqlite_tables but with PostgreSQL syntax
        pass
    
    def execute(self, query: str, params: Optional[Tuple] = None):
        """
        Execute a database query
        
        Args:
            query: SQL query string
            params: Query parameters
        
        Returns:
            Database cursor
        """
        try:
            if params:
                return self.cursor.execute(query, params)
            else:
                return self.cursor.execute(query)
        except Exception as e:
            error_msg = f"Error executing query: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def fetch_one(self, query: str, params: Optional[Tuple] = None) -> Optional[Dict[str, Any]]:
        """
        Fetch one record from database
        
        Args:
            query: SQL query string
            params: Query parameters
        
        Returns:
            dict: Record as dictionary or None
        """
        try:
            self.execute(query, params)
            result = self.cursor.fetchone()
            
            if result:
                if self.db_type == 'sqlite':
                    return dict(result)
                return result
            
            return None
        except Exception as e:
            error_msg = f"Error fetching record: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def fetch_all(self, query: str, params: Optional[Tuple] = None) -> List[Dict[str, Any]]:
        """
        Fetch all records from database
        
        Args:
            query: SQL query string
            params: Query parameters
        
        Returns:
            list: List of records as dictionaries
        """
        try:
            self.execute(query, params)
            results = self.cursor.fetchall()
            
            if self.db_type == 'sqlite':
                return [dict(row) for row in results]
            
            return results
        except Exception as e:
            error_msg = f"Error fetching records: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def insert(self, table: str, data: Dict[str, Any]) -> Optional[str]:
        """
        Insert a record into the database
        
        Args:
            table: Table name
            data: Data to insert
        
        Returns:
            str: ID of inserted record or None
        """
        try:
            # Generate ID if not provided
            if 'id' not in data:
                import uuid
                data['id'] = str(uuid.uuid4())
            
            # Add timestamps if not provided
            if 'created_at' not in data:
                data['created_at'] = datetime.now().isoformat()
            
            if 'updated_at' not in data:
                data['updated_at'] = datetime.now().isoformat()
            
            # Build query
            placeholders = ', '.join(['?'] * len(data))
            columns = ', '.join(data.keys())
            
            query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
            
            # Execute query
            self.execute(query, tuple(data.values()))
            self.commit()
            
            return data['id']
        except Exception as e:
            self.rollback()
            error_msg = f"Error inserting record: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def update(self, table: str, data: Dict[str, Any], condition: str, params: Tuple) -> int:
        """
        Update records in the database
        
        Args:
            table: Table name
            data: Data to update
            condition: WHERE condition
            params: Condition parameters
        
        Returns:
            int: Number of affected rows
        """
        try:
            # Add updated_at timestamp
            if 'updated_at' not in data:
                data['updated_at'] = datetime.now().isoformat()
            
            # Build query
            set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
            query = f"UPDATE {table} SET {set_clause} WHERE {condition}"
            
            # Combine data values and condition parameters
            all_params = tuple(data.values()) + params
            
            # Execute query
            self.execute(query, all_params)
            self.commit()
            
            return self.cursor.rowcount
        except Exception as e:
            self.rollback()
            error_msg = f"Error updating records: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def delete(self, table: str, condition: str, params: Tuple) -> int:
        """
        Delete records from the database
        
        Args:
            table: Table name
            condition: WHERE condition
            params: Condition parameters
        
        Returns:
            int: Number of affected rows
        """
        try:
            query = f"DELETE FROM {table} WHERE {condition}"
            
            self.execute(query, params)
            self.commit()
            
            return self.cursor.rowcount
        except Exception as e:
            self.rollback()
            error_msg = f"Error deleting records: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def count(self, table: str, condition: Optional[str] = None, params: Optional[Tuple] = None) -> int:
        """
        Count records in the database
        
        Args:
            table: Table name
            condition: Optional WHERE condition
            params: Optional condition parameters
        
        Returns:
            int: Number of records
        """
        try:
            query = f"SELECT COUNT(*) as count FROM {table}"
            
            if condition:
                query += f" WHERE {condition}"
            
            result = self.fetch_one(query, params)
            
            return result['count'] if result else 0
        except Exception as e:
            error_msg = f"Error counting records: {str(e)}"
            logger.error(error_msg)
            raise DatabaseError(error_msg)
    
    def commit(self):
        """Commit transaction"""
        if self.connection and self.db_type != 'mongodb':
            self.connection.commit()
    
    def rollback(self):
        """Rollback transaction"""
        if self.connection and self.db_type != 'mongodb':
            self.connection.rollback()
    
    def close(self):
        """Close database connection"""
        if self.connection:
            if self.cursor and self.db_type != 'mongodb':
                self.cursor.close()
            
            if self.db_type != 'mongodb':
                self.connection.close()
            
            logger.info("Database connection closed")
    
    def __del__(self):
        """Destructor to close connection"""
        self.close()


# Singleton instance
def get_db():
    """
    Get database instance
    
    Returns:
        Database: Database instance
    """
    return Database.get_instance() 