"""
Database Connector Module

This module provides a unified interface for connecting to different database systems
and performing database operations.
"""

import os
import json
import logging
import sqlite3
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import settings
from backend.config.settings import DB_TYPE, DB_CONFIG

# Setup logger
logger = logging.getLogger(__name__)

# Try to import optional dependencies
try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False
    logger.warning("MySQL Connector not installed. Install with: pip install mysql-connector-python")

try:
    import psycopg2
    POSTGRESQL_AVAILABLE = True
except ImportError:
    POSTGRESQL_AVAILABLE = False
    logger.warning("psycopg2 not installed. Install with: pip install psycopg2-binary")

try:
    import pymongo
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    logger.warning("pymongo not installed. Install with: pip install pymongo")


class DatabaseError(Exception):
    """Database error exception"""
    pass


class Database:
    """Database interface class"""
    
    def __init__(self, db_type: str, config: Dict[str, Any]):
        """
        Initialize database connection
        
        Args:
            db_type: Database type (sqlite, mysql, postgresql, mongodb)
            config: Database configuration
        """
        self.db_type = db_type.lower()
        self.config = config
        self.connection = None
        self.is_connected = False
        
        # Attempt to connect
        self.connect()
    
    def connect(self) -> bool:
        """
        Connect to database
        
        Returns:
            bool: Connection success
        """
        try:
            if self.db_type == 'sqlite':
                db_path = self.config.get('path', 'tamkeen.db')
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
                
                self.connection = sqlite3.connect(db_path, check_same_thread=False)
                self.connection.row_factory = sqlite3.Row
                
                # Enable foreign keys
                self.connection.execute("PRAGMA foreign_keys = ON")
                
                self.is_connected = True
                logger.info(f"Connected to SQLite database: {db_path}")
            
            elif self.db_type == 'mysql':
                if not MYSQL_AVAILABLE:
                    raise DatabaseError("MySQL connector not installed")
                
                self.connection = mysql.connector.connect(
                    host=self.config.get('host', 'localhost'),
                    port=self.config.get('port', 3306),
                    user=self.config.get('user', 'root'),
                    password=self.config.get('password', ''),
                    database=self.config.get('database', 'tamkeen')
                )
                
                self.is_connected = True
                logger.info(f"Connected to MySQL database: {self.config.get('host')}/{self.config.get('database')}")
            
            elif self.db_type == 'postgresql':
                if not POSTGRESQL_AVAILABLE:
                    raise DatabaseError("PostgreSQL connector not installed")
                
                self.connection = psycopg2.connect(
                    host=self.config.get('host', 'localhost'),
                    port=self.config.get('port', 5432),
                    user=self.config.get('user', 'postgres'),
                    password=self.config.get('password', ''),
                    dbname=self.config.get('database', 'tamkeen')
                )
                
                self.is_connected = True
                logger.info(f"Connected to PostgreSQL database: {self.config.get('host')}/{self.config.get('database')}")
            
            elif self.db_type == 'mongodb':
                if not MONGODB_AVAILABLE:
                    raise DatabaseError("MongoDB connector not installed")
                
                client = pymongo.MongoClient(
                    host=self.config.get('host', 'localhost'),
                    port=self.config.get('port', 27017),
                    username=self.config.get('user', None),
                    password=self.config.get('password', None)
                )
                
                self.connection = client[self.config.get('database', 'tamkeen')]
                
                self.is_connected = True
                logger.info(f"Connected to MongoDB database: {self.config.get('host')}/{self.config.get('database')}")
            
            else:
                raise DatabaseError(f"Unsupported database type: {self.db_type}")
            
            return True
        
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            self.is_connected = False
            self.connection = None
            return False
    
    def disconnect(self) -> bool:
        """
        Disconnect from database
        
        Returns:
            bool: Success status
        """
        if not self.is_connected or self.connection is None:
            return True
        
        try:
            if self.db_type in ['sqlite', 'mysql', 'postgresql']:
                self.connection.close()
            elif self.db_type == 'mongodb':
                self.connection.client.close()
            
            self.is_connected = False
            self.connection = None
            
            logger.info(f"Disconnected from {self.db_type} database")
            return True
        
        except Exception as e:
            logger.error(f"Database disconnection error: {str(e)}")
            return False
    
    def reconnect(self) -> bool:
        """
        Reconnect to database
        
        Returns:
            bool: Success status
        """
        self.disconnect()
        return self.connect()
    
    def execute(self, query: str, params: Optional[Tuple] = None) -> bool:
        """
        Execute a query
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            bool: Success status
        """
        if not self.is_connected:
            if not self.reconnect():
                raise DatabaseError("Database not connected")
        
        try:
            if self.db_type == 'sqlite':
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                self.connection.commit()
                cursor.close()
                return True
            
            elif self.db_type == 'mysql':
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                self.connection.commit()
                cursor.close()
                return True
            
            elif self.db_type == 'postgresql':
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                self.connection.commit()
                cursor.close()
                return True
            
            elif self.db_type == 'mongodb':
                # MongoDB queries are handled differently
                raise DatabaseError("Use appropriate MongoDB methods for queries")
            
            return False
        
        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            logger.error(f"Query: {query}")
            logger.error(f"Params: {params}")
            
            # Try to reconnect on connection errors
            if "not connected" in str(e).lower() or "connection" in str(e).lower():
                self.reconnect()
            
            raise DatabaseError(f"Query error: {str(e)}")
    
    def fetch_one(self, query: str, params: Optional[Tuple] = None) -> Dict[str, Any]:
        """
        Fetch a single row
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            dict: Query result
        """
        if not self.is_connected:
            if not self.reconnect():
                raise DatabaseError("Database not connected")
        
        try:
            if self.db_type == 'sqlite':
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                row = cursor.fetchone()
                cursor.close()
                
                if row:
                    return dict(row)
                return {}
            
            elif self.db_type == 'mysql':
                cursor = self.connection.cursor(dictionary=True)
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                row = cursor.fetchone()
                cursor.close()
                
                if row:
                    return dict(row)
                return {}
            
            elif self.db_type == 'postgresql':
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                columns = [desc[0] for desc in cursor.description]
                row = cursor.fetchone()
                cursor.close()
                
                if row:
                    return dict(zip(columns, row))
                return {}
            
            elif self.db_type == 'mongodb':
                # Parse collection and filter from query
                # This is a simplified approach for demonstration
                parts = query.split('.')
                if len(parts) >= 2:
                    collection = parts[0].strip()
                    method = parts[1].strip()
                    
                    if method == 'find_one':
                        result = self.connection[collection].find_one(params or {})
                        if result:
                            return dict(result)
                
                return {}
            
            return {}
        
        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            logger.error(f"Query: {query}")
            logger.error(f"Params: {params}")
            
            # Try to reconnect on connection errors
            if "not connected" in str(e).lower() or "connection" in str(e).lower():
                self.reconnect()
            
            raise DatabaseError(f"Query error: {str(e)}")
    
    def fetch_all(self, query: str, params: Optional[Tuple] = None) -> List[Dict[str, Any]]:
        """
        Fetch all rows
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            list: Query results
        """
        if not self.is_connected:
            if not self.reconnect():
                raise DatabaseError("Database not connected")
        
        try:
            if self.db_type == 'sqlite':
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                rows = cursor.fetchall()
                cursor.close()
                
                return [dict(row) for row in rows]
            
            elif self.db_type == 'mysql':
                cursor = self.connection.cursor(dictionary=True)
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                rows = cursor.fetchall()
                cursor.close()
                
                return [dict(row) for row in rows]
            
            elif self.db_type == 'postgresql':
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                cursor.close()
                
                return [dict(zip(columns, row)) for row in rows]
            
            elif self.db_type == 'mongodb':
                # Parse collection and filter from query
                # This is a simplified approach for demonstration
                parts = query.split('.')
                if len(parts) >= 2:
                    collection = parts[0].strip()
                    method = parts[1].strip()
                    
                    if method == 'find':
                        results = self.connection[collection].find(params or {})
                        return [dict(result) for result in results]
                
                return []
            
            return []
        
        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            logger.error(f"Query: {query}")
            logger.error(f"Params: {params}")
            
            # Try to reconnect on connection errors
            if "not connected" in str(e).lower() or "connection" in str(e).lower():
                self.reconnect()
            
            raise DatabaseError(f"Query error: {str(e)}")
    
    def insert(self, table: str, data: Dict[str, Any]) -> bool:
        """
        Insert data into table
        
        Args:
            table: Table name
            data: Data to insert
            
        Returns:
            bool: Success status
        """
        if not self.is_connected:
            if not self.reconnect():
                raise DatabaseError("Database not connected")
        
        try:
            if self.db_type in ['sqlite', 'mysql', 'postgresql']:
                columns = list(data.keys())
                values = list(data.values())
                
                placeholders = ', '.join(['?' for _ in columns])
                
                if self.db_type == 'postgresql':
                    placeholders = ', '.join(['%s' for _ in columns])
                
                columns_str = ', '.join(columns)
                
                query = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
                
                return self.execute(query, tuple(values))
            
            elif self.db_type == 'mongodb':
                result = self.connection[table].insert_one(data)
                return result.acknowledged
            
            return False
        
        except Exception as e:
            logger.error(f"Insert error: {str(e)}")
            logger.error(f"Table: {table}")
            logger.error(f"Data: {data}")
            
            # Try to reconnect on connection errors
            if "not connected" in str(e).lower() or "connection" in str(e).lower():
                self.reconnect()
            
            raise DatabaseError(f"Insert error: {str(e)}")
    
    def update(self, table: str, data: Dict[str, Any], 
               condition: str, condition_params: Tuple) -> bool:
        """
        Update data in table
        
        Args:
            table: Table name
            data: Data to update
            condition: WHERE condition
            condition_params: Condition parameters
            
        Returns:
            bool: Success status
        """
        if not self.is_connected:
            if not self.reconnect():
                raise DatabaseError("Database not connected")
        
        try:
            if self.db_type in ['sqlite', 'mysql', 'postgresql']:
                set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
                
                if self.db_type == 'postgresql':
                    set_clause = ', '.join([f"{key} = %s" for key in data.keys()])
                
                query = f"UPDATE {table} SET {set_clause} WHERE {condition}"
                
                params = tuple(list(data.values()) + list(condition_params))
                
                return self.execute(query, params)
            
            elif self.db_type == 'mongodb':
                # Parse condition to MongoDB filter
                # This is a simplified approach
                filter_dict = {}
                for i, param in enumerate(condition_params):
                    filter_dict[f"param{i}"] = param
                
                result = self.connection[table].update_one(filter_dict, {"$set": data})
                return result.acknowledged
            
            return False
        
        except Exception as e:
            logger.error(f"Update error: {str(e)}")
            logger.error(f"Table: {table}")
            logger.error(f"Data: {data}")
            logger.error(f"Condition: {condition}")
            logger.error(f"Params: {condition_params}")
            
            # Try to reconnect on connection errors
            if "not connected" in str(e).lower() or "connection" in str(e).lower():
                self.reconnect()
            
            raise DatabaseError(f"Update error: {str(e)}")
    
    def delete(self, table: str, condition: str, condition_params: Tuple) -> bool:
        """
        Delete data from table
        
        Args:
            table: Table name
            condition: WHERE condition
            condition_params: Condition parameters
            
        Returns:
            bool: Success status
        """
        if not self.is_connected:
            if not self.reconnect():
                raise DatabaseError("Database not connected")
        
        try:
            if self.db_type in ['sqlite', 'mysql', 'postgresql']:
                query = f"DELETE FROM {table} WHERE {condition}"
                
                return self.execute(query, condition_params)
            
            elif self.db_type == 'mongodb':
                # Parse condition to MongoDB filter
                # This is a simplified approach
                filter_dict = {}
                for i, param in enumerate(condition_params):
                    filter_dict[f"param{i}"] = param
                
                result = self.connection[table].delete_one(filter_dict)
                return result.acknowledged
            
            return False
        
        except Exception as e:
            logger.error(f"Delete error: {str(e)}")
            logger.error(f"Table: {table}")
            logger.error(f"Condition: {condition}")
            logger.error(f"Params: {condition_params}")
            
            # Try to reconnect on connection errors
            if "not connected" in str(e).lower() or "connection" in str(e).lower():
                self.reconnect()
            
            raise DatabaseError(f"Delete error: {str(e)}")
    
    def create_tables(self) -> bool:
        """
        Create database tables
        
        Returns:
            bool: Success status
        """
        if not self.is_connected:
            if not self.reconnect():
                raise DatabaseError("Database not connected")
        
        try:
            if self.db_type == 'sqlite':
                with open(os.path.join(os.path.dirname(__file__), 'schema_sqlite.sql'), 'r') as f:
                    schema = f.read()
                    
                    # Split schema into individual statements
                    statements = schema.split(';')
                    
                    for statement in statements:
                        statement = statement.strip()
                        if statement:
                            self.execute(statement)
                
                return True
            
            elif self.db_type == 'mysql':
                with open(os.path.join(os.path.dirname(__file__), 'schema_mysql.sql'), 'r') as f:
                    schema = f.read()
                    
                    # Split schema into individual statements
                    statements = schema.split(';')
                    
                    for statement in statements:
                        statement = statement.strip()
                        if statement:
                            self.execute(statement)
                
                return True
            
            elif self.db_type == 'postgresql':
                with open(os.path.join(os.path.dirname(__file__), 'schema_postgresql.sql'), 'r') as f:
                    schema = f.read()
                    
                    # Split schema into individual statements
                    statements = schema.split(';')
                    
                    for statement in statements:
                        statement = statement.strip()
                        if statement:
                            self.execute(statement)
                
                return True
            
            elif self.db_type == 'mongodb':
                # MongoDB doesn't require schema creation in the same way
                # But we can create indexes or validate collections
                return True
            
            return False
        
        except Exception as e:
            logger.error(f"Create tables error: {str(e)}")
            return False


# Database instance
_db = None

def get_db() -> Database:
    """
    Get database instance
    
    Returns:
        Database: Database instance
    """
    global _db
    
    if _db is None:
        _db = Database(DB_TYPE, DB_CONFIG[DB_TYPE])
    
    return _db


def close_db() -> bool:
    """
    Close database connection
    
    Returns:
        bool: Success status
    """
    global _db
    
    if _db is not None:
        success = _db.disconnect()
        _db = None
        return success
    
    return True


def initialize_db() -> bool:
    """
    Initialize database (create tables)
    
    Returns:
        bool: Success status
    """
    db = get_db()
    return db.create_tables() 