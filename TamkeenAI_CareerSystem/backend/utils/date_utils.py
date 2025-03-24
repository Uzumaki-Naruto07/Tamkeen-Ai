"""
Date Utilities Module

This module provides utility functions for date and time operations.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Union

# Setup logger
logger = logging.getLogger(__name__)

# Date format constants
DEFAULT_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
ISO_DATE_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
SIMPLE_DATE_FORMAT = "%Y-%m-%d"
DISPLAY_DATE_FORMAT = "%b %d, %Y"
DISPLAY_DATETIME_FORMAT = "%b %d, %Y %I:%M %p"


def now() -> datetime:
    """
    Get current UTC datetime
    
    Returns:
        datetime: Current UTC datetime
    """
    return datetime.utcnow()


def format_date(dt: datetime, format_str: str = DEFAULT_DATE_FORMAT) -> str:
    """
    Format datetime as string
    
    Args:
        dt: Datetime to format
        format_str: Format string
        
    Returns:
        str: Formatted date string
    """
    if not dt:
        return ""
    
    try:
        return dt.strftime(format_str)
    except Exception as e:
        logger.error(f"Error formatting date: {str(e)}")
        return str(dt)


def parse_date(date_str: str, format_str: str = None) -> Optional[datetime]:
    """
    Parse date string to datetime
    
    Args:
        date_str: Date string
        format_str: Format string (optional)
        
    Returns:
        datetime: Parsed datetime or None
    """
    if not date_str:
        return None
    
    try:
        # Try with specified format
        if format_str:
            return datetime.strptime(date_str, format_str)
        
        # Try common formats
        formats = [
            DEFAULT_DATE_FORMAT,
            ISO_DATE_FORMAT,
            SIMPLE_DATE_FORMAT,
            DISPLAY_DATE_FORMAT,
            DISPLAY_DATETIME_FORMAT,
            "%Y-%m-%d %H:%M:%S.%f",
            "%Y/%m/%d",
            "%m/%d/%Y",
            "%d/%m/%Y",
            "%b %Y",
            "%B %Y"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except:
                continue
        
        # If all formats fail, try to parse ISO format
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    
    except Exception as e:
        logger.error(f"Error parsing date '{date_str}': {str(e)}")
        return None


def format_time_ago(dt: datetime) -> str:
    """
    Format datetime as time ago string
    
    Args:
        dt: Datetime
        
    Returns:
        str: Time ago string
    """
    if not dt:
        return ""
    
    try:
        now_dt = now()
        delta = now_dt - dt
        
        # Calculate time difference
        seconds = delta.total_seconds()
        minutes = seconds / 60
        hours = minutes / 60
        days = delta.days
        years = days / 365
        
        # Format time ago string
        if seconds < 60:
            return "just now"
        elif minutes < 60:
            return f"{int(minutes)} minute{'s' if int(minutes) != 1 else ''} ago"
        elif hours < 24:
            return f"{int(hours)} hour{'s' if int(hours) != 1 else ''} ago"
        elif days < 30:
            return f"{days} day{'s' if days != 1 else ''} ago"
        elif days < 365:
            months = days / 30
            return f"{int(months)} month{'s' if int(months) != 1 else ''} ago"
        else:
            return f"{int(years)} year{'s' if int(years) != 1 else ''} ago"
    
    except Exception as e:
        logger.error(f"Error formatting time ago: {str(e)}")
        return str(dt)


def get_date_range(range_type: str, end_date: datetime = None) -> Tuple[datetime, datetime]:
    """
    Get date range based on type
    
    Args:
        range_type: Range type (today, week, month, year, etc.)
        end_date: End date (default is now)
        
    Returns:
        tuple: (start_date, end_date)
    """
    if not end_date:
        end_date = now()
    
    try:
        # Calculate start date based on range type
        if range_type == 'today':
            start_date = datetime(end_date.year, end_date.month, end_date.day)
        elif range_type == 'yesterday':
            yesterday = end_date - timedelta(days=1)
            start_date = datetime(yesterday.year, yesterday.month, yesterday.day)
            end_date = datetime(yesterday.year, yesterday.month, yesterday.day, 23, 59, 59)
        elif range_type == 'this_week':
            # Start from Monday of current week
            start_date = end_date - timedelta(days=end_date.weekday())
            start_date = datetime(start_date.year, start_date.month, start_date.day)
        elif range_type == 'last_week':
            # Start from Monday of last week, end on Sunday
            start_date = end_date - timedelta(days=end_date.weekday() + 7)
            start_date = datetime(start_date.year, start_date.month, start_date.day)
            end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
        elif range_type == 'this_month':
            start_date = datetime(end_date.year, end_date.month, 1)
        elif range_type == 'last_month':
            if end_date.month == 1:
                start_date = datetime(end_date.year - 1, 12, 1)
                end_date = datetime(end_date.year, end_date.month, 1) - timedelta(seconds=1)
            else:
                start_date = datetime(end_date.year, end_date.month - 1, 1)
                end_date = datetime(end_date.year, end_date.month, 1) - timedelta(seconds=1)
        elif range_type == 'this_year':
            start_date = datetime(end_date.year, 1, 1)
        elif range_type == 'last_year':
            start_date = datetime(end_date.year - 1, 1, 1)
            end_date = datetime(end_date.year, 1, 1) - timedelta(seconds=1)
        elif range_type == '7_days':
            start_date = end_date - timedelta(days=7)
        elif range_type == '30_days':
            start_date = end_date - timedelta(days=30)
        elif range_type == '90_days':
            start_date = end_date - timedelta(days=90)
        elif range_type == '6_months':
            start_date = end_date - timedelta(days=180)
        elif range_type == '1_year':
            start_date = end_date - timedelta(days=365)
        else:
            # Default to 30 days
            start_date = end_date - timedelta(days=30)
        
        return start_date, end_date
    
    except Exception as e:
        logger.error(f"Error getting date range: {str(e)}")
        # Default to 30 days
        return end_date - timedelta(days=30), end_date


def calculate_duration(start_date: Union[str, datetime], 
                      end_date: Union[str, datetime, None] = None) -> str:
    """
    Calculate duration between two dates
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        str: Duration string
    """
    try:
        # Parse dates if they're strings
        if isinstance(start_date, str):
            start_date = parse_date(start_date)
        
        if isinstance(end_date, str):
            end_date = parse_date(end_date)
        
        # Use now if end_date is None
        if end_date is None:
            end_date = now()
        
        # Calculate duration
        delta = end_date - start_date
        days = delta.days
        
        if days < 0:
            return "Invalid duration"
        
        years = days // 365
        months = (days % 365) // 30
        remaining_days = days % 30
        
        # Format duration string
        parts = []
        if years > 0:
            parts.append(f"{years} year{'s' if years != 1 else ''}")
        if months > 0:
            parts.append(f"{months} month{'s' if months != 1 else ''}")
        if remaining_days > 0 and years == 0:  # Only show days if less than a year
            parts.append(f"{remaining_days} day{'s' if remaining_days != 1 else ''}")
        
        if not parts:
            if days == 0:
                hours = delta.seconds // 3600
                if hours > 0:
                    return f"{hours} hour{'s' if hours != 1 else ''}"
                else:
                    minutes = (delta.seconds % 3600) // 60
                    return f"{minutes} minute{'s' if minutes != 1 else ''}"
            else:
                return "0 days"
        
        return ", ".join(parts)
    
    except Exception as e:
        logger.error(f"Error calculating duration: {str(e)}")
        return "Unknown duration" 