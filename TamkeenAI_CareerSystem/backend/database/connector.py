"""
Database Connector Module

This module provides database connection and interaction functionality
for the Tamkeen AI Career System.
"""

import os
import json
import logging
import sqlite3
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import settings
from backend.config.settings import DB_CONFIG, DB_TYPE

# Setup logger
logger = logging.getLogger(__name__)

# Database connection
_db_connection = None


class DatabaseError(Exception):
    """Database error exception"""
    pass


def get_db():
    """
    Get database connection
    
    Returns:
        Database: Database connection
    """
    global _db_connection
    
    if _db_connection is None:
        _db_connection = Database()
    
    return _db_connection


class Database:
    """Database interface"""
    
    def __init__(self):
        """Initialize database connection"""
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to database"""
        try:
            if DB_TYPE == 'sqlite':
                db_file = DB_CONFIG.get('db_file', 'database.db')
                self.connection = sqlite3.connect(db_file, check_same_thread=False)
                self.connection.row_factory = sqlite3.Row
                
                # Enable foreign keys
                self.connection.execute('PRAGMA foreign_keys = ON')
            else:
                raise DatabaseError(f"Unsupported database type: {DB_TYPE}")
            
            # Create tables if they don't exist
            self._create_tables()
            
            return True
        except Exception as e:
            logger.error(f"Error connecting to database: {str(e)}")
            raise DatabaseError(f"Error connecting to database: {str(e)}")
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def _create_tables(self):
        """Create database tables if they don't exist"""
        try:
            # Define tables
            tables = [
                # Users table
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    status TEXT DEFAULT 'active',
                    profile TEXT,
                    settings TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """,
                
                # User activity table
                """
                CREATE TABLE IF NOT EXISTS user_activity (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    activity_type TEXT NOT NULL,
                    activity_data TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
                """,
                
                # Resumes table
                """
                CREATE TABLE IF NOT EXISTS resumes (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    content TEXT,
                    parsed_data TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
                """,
                
                # Jobs table
                """
                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    company TEXT NOT NULL,
                    location TEXT,
                    description TEXT,
                    requirements TEXT,
                    responsibilities TEXT,
                    skills TEXT,
                    salary_range TEXT,
                    job_type TEXT,
                    status TEXT DEFAULT 'active',
                    external_id TEXT,
                    external_url TEXT,
                    source TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """,
                
                # Job applications table
                """
                CREATE TABLE IF NOT EXISTS job_applications (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    job_id TEXT NOT NULL,
                    resume_id TEXT,
                    status TEXT DEFAULT 'applied',
                    application_data TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (job_id) REFERENCES jobs (id),
                    FOREIGN KEY (resume_id) REFERENCES resumes (id)
                )
                """,
                
                # Job bookmarks table
                """
                CREATE TABLE IF NOT EXISTS job_bookmarks (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    job_id TEXT NOT NULL,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (job_id) REFERENCES jobs (id)
                )
                """,
                
                # Career paths table
                """
                CREATE TABLE IF NOT EXISTS career_paths (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    path_data TEXT NOT NULL,
                    status TEXT DEFAULT 'active',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
                """,
                
                # Skills table
                """
                CREATE TABLE IF NOT EXISTS skills (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT,
                    type TEXT,
                    description TEXT,
                    related_skills TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """,
                
                # User skills table
                """
                CREATE TABLE IF NOT EXISTS user_skills (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    skill_id TEXT NOT NULL,
                    proficiency_level TEXT,
                    experience_years REAL,
                    last_used TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (skill_id) REFERENCES skills (id)
                )
                """,
                
                # Job market data table
                """
                CREATE TABLE IF NOT EXISTS job_market_data (
                    id TEXT PRIMARY KEY,
                    data_type TEXT NOT NULL,
                    location TEXT,
                    industry TEXT,
                    data_value TEXT,
                    source TEXT,
                    timestamp TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """,
                
                # Job market queries table
                """
                CREATE TABLE IF NOT EXISTS job_market_queries (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    query_type TEXT NOT NULL,
                    query_params TEXT,
                    results_summary TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
                """,
                
                # Cache table
                """
                CREATE TABLE IF NOT EXISTS cache (
                    cache_key TEXT PRIMARY KEY,
                    data_value TEXT,
                    expiry TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            ]
            
            # Create each table
            cursor = self.connection.cursor()
            for table in tables:
                cursor.execute(table)
            
            self.connection.commit()
            cursor.close()
            
        except Exception as e:
            logger.error(f"Error creating tables: {str(e)}")
            raise DatabaseError(f"Error creating tables: {str(e)}")
    
    def execute(self, query, params=None):
        """
        Execute SQL query
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            list: Query results
        """
        try:
            if not self.connection:
                self.connect()
            
            cursor = self.connection.cursor()
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if query.strip().upper().startswith(('SELECT', 'PRAGMA')):
                # Fetch results for SELECT queries
                results = [dict(row) for row in cursor.fetchall()]
                cursor.close()
                return results
            else:
                # Commit for non-SELECT queries
                self.connection.commit()
                last_id = cursor.lastrowid
                cursor.close()
                return last_id
            
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            raise DatabaseError(f"Error executing query: {str(e)}")
    
    def find(self, table, conditions=None, limit=None, order_by=None):
        """
        Find records in table
        
        Args:
            table: Table name
            conditions: Optional conditions dict
            limit: Optional result limit
            order_by: Optional sort field and direction
            
        Returns:
            list: Query results
        """
        try:
            query = f"SELECT * FROM {table}"
            params = []
            
            # Add conditions
            if conditions:
                where_clauses = []
                for key, value in conditions.items():
                    where_clauses.append(f"{key} = ?")
                    params.append(value)
                
                if where_clauses:
                    query += " WHERE " + " AND ".join(where_clauses)
            
            # Add order by
            if order_by:
                query += f" ORDER BY {order_by}"
            
            # Add limit
            if limit:
                query += f" LIMIT {int(limit)}"
            
            # Execute query
            return self.execute(query, params)
            
        except Exception as e:
            logger.error(f"Error finding records: {str(e)}")
            raise DatabaseError(f"Error finding records: {str(e)}")
    
    def find_by_id(self, table, id_value, id_field='id'):
        """
        Find record by ID
        
        Args:
            table: Table name
            id_value: ID value
            id_field: ID field name
            
        Returns:
            dict: Record or None
        """
        try:
            results = self.find(table, {id_field: id_value}, 1)
            if results:
                return results[0]
            return None
            
        except Exception as e:
            logger.error(f"Error finding record by ID: {str(e)}")
            raise DatabaseError(f"Error finding record by ID: {str(e)}")
    
    def insert(self, table, data):
        """
        Insert record
        
        Args:
            table: Table name
            data: Record data
            
        Returns:
            int: Last row ID
        """
        try:
            # Build query
            fields = ', '.join(data.keys())
            placeholders = ', '.join(['?'] * len(data))
            query = f"INSERT INTO {table} ({fields}) VALUES ({placeholders})"
            
            # Execute query
            return self.execute(query, list(data.values()))
            
        except Exception as e:
            logger.error(f"Error inserting record: {str(e)}")
            raise DatabaseError(f"Error inserting record: {str(e)}")
    
    def update(self, table, id_value, data, id_field='id'):
        """
        Update record
        
        Args:
            table: Table name
            id_value: ID value
            data: Record data
            id_field: ID field name
            
        Returns:
            bool: Success status
        """
        try:
            # Build query
            set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
            query = f"UPDATE {table} SET {set_clause} WHERE {id_field} = ?"
            
            # Execute query
            params = list(data.values()) + [id_value]
            self.execute(query, params)
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating record: {str(e)}")
            raise DatabaseError(f"Error updating record: {str(e)}")
    
    def delete(self, table, id_value, id_field='id'):
        """
        Delete record
        
        Args:
            table: Table name
            id_value: ID value
            id_field: ID field name
            
        Returns:
            bool: Success status
        """
        try:
            # Build query
            query = f"DELETE FROM {table} WHERE {id_field} = ?"
            
            # Execute query
            self.execute(query, [id_value])
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting record: {str(e)}")
            raise DatabaseError(f"Error deleting record: {str(e)}") 