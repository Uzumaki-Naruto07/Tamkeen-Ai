"""
Logger Utility Module

This module provides utility functions for logging across the application.
"""

import os
import logging
import json
from logging.handlers import RotatingFileHandler
from datetime import datetime
from typing import Dict, Any, Optional

# Import settings
from backend.config.settings import LOG_FOLDER, LOG_CONFIG


def setup_logger(name: str = None, level: int = logging.INFO) -> logging.Logger:
    """
    Set up and configure logger
    
    Args:
        name: Logger name
        level: Logging level
        
    Returns:
        Logger instance
    """
    # Use __name__ as the logger name if not provided
    if name is None:
        name = __name__
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Remove existing handlers to avoid duplicates
    if logger.handlers:
        logger.handlers = []
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create file handler
    log_path = os.path.join(LOG_FOLDER, f"{name.split('.')[-1]}.log")
    file_handler = RotatingFileHandler(
        log_path, 
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


def log_event(logger: logging.Logger, 
             event_type: str, 
             data: Dict[str, Any],
             level: int = logging.INFO) -> None:
    """
    Log a structured event
    
    Args:
        logger: Logger instance
        event_type: Type of event
        data: Event data
        level: Logging level
    """
    event = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "data": data
    }
    
    logger.log(level, json.dumps(event))


def log_exception(logger: logging.Logger, 
                 exception: Exception, 
                 context: Optional[Dict[str, Any]] = None) -> None:
    """
    Log an exception with context
    
    Args:
        logger: Logger instance
        exception: Exception object
        context: Additional context
    """
    if context is None:
        context = {}
    
    event = {
        "timestamp": datetime.now().isoformat(),
        "event_type": "exception",
        "exception": str(exception),
        "exception_type": exception.__class__.__name__,
        "context": context
    }
    
    logger.exception(json.dumps(event))


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get configured logger
    
    Args:
        name: Logger name
        
    Returns:
        Logger instance
    """
    return setup_logger(name) 