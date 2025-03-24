"""
Date and Time Utility Module

This module provides utilities for handling dates, times, durations, and calendar operations
for the Tamkeen AI Career Intelligence System.
"""

import re
import calendar
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, date, time, timedelta, timezone

# Setup logger
logger = logging.getLogger(__name__)


def now(tz: Optional[timezone] = None) -> datetime:
    """
    Get current datetime in specified timezone (UTC by default)
    
    Args:
        tz: Timezone (None for UTC)
        
    Returns:
        datetime: Current datetime
    """
    return datetime.now(tz or timezone.utc)


def today() -> date:
    """
    Get current date in UTC
    
    Returns:
        date: Current date
    """
    return now().date()


def format_date(dt: Union[datetime, date], format_str: str = "%Y-%m-%d") -> str:
    """
    Format datetime to string
    
    Args:
        dt: Datetime or date object
        format_str: Format string
        
    Returns:
        str: Formatted date
    """
    if dt is None:
        return ""
    
    try:
        return dt.strftime(format_str)
    except Exception as e:
        logger.error(f"Date formatting error: {str(e)}")
        return ""


def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format datetime with time to string
    
    Args:
        dt: Datetime object
        format_str: Format string
        
    Returns:
        str: Formatted datetime
    """
    return format_date(dt, format_str)


def format_time(t: Union[datetime, time], format_str: str = "%H:%M:%S") -> str:
    """
    Format time to string
    
    Args:
        t: Time or datetime object
        format_str: Format string
        
    Returns:
        str: Formatted time
    """
    if t is None:
        return ""
    
    try:
        return t.strftime(format_str)
    except Exception as e:
        logger.error(f"Time formatting error: {str(e)}")
        return ""


def format_relative(dt: datetime) -> str:
    """
    Format datetime as relative string (e.g., '2 days ago', '3 hours ago')
    
    Args:
        dt: Datetime object
        
    Returns:
        str: Relative time string
    """
    if dt is None:
        return ""
    
    try:
        delta = now() - dt
        
        # Convert to absolute delta for comparison
        abs_delta = abs(delta)
        seconds = abs_delta.total_seconds()
        
        if seconds < 60:
            return 'just now'
        
        # Time units
        units = [
            (60, 'minute', 'minutes'),
            (60*60, 'hour', 'hours'),
            (60*60*24, 'day', 'days'),
            (60*60*24*7, 'week', 'weeks'),
            (60*60*24*30, 'month', 'months'),
            (60*60*24*365, 'year', 'years')
        ]
        
        # Find appropriate unit
        for unit_seconds, unit_singular, unit_plural in units:
            if seconds < unit_seconds:
                break
            
            value = int(seconds / unit_seconds)
            unit = unit_singular if value == 1 else unit_plural
            
            if delta.total_seconds() < 0:
                return f'in {value} {unit}'
            else:
                return f'{value} {unit} ago'
        
        # Fallback
        return format_date(dt)
        
    except Exception as e:
        logger.error(f"Relative date formatting error: {str(e)}")
        return format_date(dt)


def parse_date(date_str: str, format_str: str = "%Y-%m-%d") -> Optional[datetime]:
    """
    Parse string to datetime using specific format
    
    Args:
        date_str: Date string
        format_str: Format string
        
    Returns:
        Optional[datetime]: Parsed datetime or None
    """
    if not date_str:
        return None
    
    try:
        return datetime.strptime(date_str, format_str)
    except Exception as e:
        logger.debug(f"Date parsing error with format {format_str}: {str(e)}")
        return None


def parse_date_flexible(date_str: str) -> Optional[datetime]:
    """
    Parse date string in various formats
    
    Args:
        date_str: Date string
        
    Returns:
        Optional[datetime]: Parsed datetime or None
    """
    if not date_str:
        return None
    
    # Try common formats
    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%m/%d/%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%b %d, %Y",
        "%B %d, %Y",
        "%d %b %Y",
        "%d %B %Y",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%fZ"
    ]
    
    for format_str in formats:
        result = parse_date(date_str, format_str)
        if result is not None:
            return result
    
    # Try to extract date with regex
    try:
        # Match patterns like "January 15, 2023" or "15 January 2023"
        month_pattern = r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)"
        patterns = [
            rf"{month_pattern}\s+(\d{{1,2}}),?\s+(\d{{4}})",  # Month DD, YYYY
            rf"(\d{{1,2}})\s+{month_pattern}\s+(\d{{4}})",   # DD Month YYYY
            r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})",           # YYYY-MM-DD or YYYY/MM/DD
            r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})"            # DD-MM-YYYY or MM-DD-YYYY or DD/MM/YYYY
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_str, re.IGNORECASE)
            if match:
                groups = match.groups()
                
                if len(groups) == 3:
                    # Check pattern type
                    if re.match(rf"{month_pattern}", groups[0], re.IGNORECASE):
                        # Month DD, YYYY
                        month = groups[0]
                        day = int(groups[1])
                        year = int(groups[2])
                        
                        # Convert month name to number
                        month_abbr = month[:3].lower()
                        month_map = {
                            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
                            'may': 5, 'jun': 6, 'jul': 7, 'aug': 8,
                            'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
                        }
                        month_num = month_map.get(month_abbr, 1)
                        
                        return datetime(year, month_num, day)
                    
                    elif re.match(r"\d{4}", groups[0]):
                        # YYYY-MM-DD or YYYY/MM/DD
                        year = int(groups[0])
                        month = int(groups[1])
                        day = int(groups[2])
                        
                        return datetime(year, month, day)
                    
                    else:
                        # DD-MM-YYYY or MM-DD-YYYY
                        # Assume DD-MM-YYYY for international format
                        day = int(groups[0])
                        month = int(groups[1])
                        year = int(groups[2])
                        
                        # Validate and swap if needed
                        if month > 12:
                            # Must be MM-DD-YYYY format
                            day, month = month, day
                        
                        return datetime(year, month, day)
        
        return None
    
    except Exception as e:
        logger.error(f"Flexible date parsing error: {str(e)}")
        return None


def is_valid_date(year: int, month: int, day: int) -> bool:
    """
    Check if a date is valid
    
    Args:
        year: Year
        month: Month (1-12)
        day: Day
        
    Returns:
        bool: True if valid date
    """
    try:
        datetime(year, month, day)
        return True
    except ValueError:
        return False


def is_leap_year(year: int) -> bool:
    """
    Check if a year is a leap year
    
    Args:
        year: Year to check
        
    Returns:
        bool: True if leap year
    """
    return calendar.isleap(year)


def date_diff(date1: datetime, date2: datetime) -> timedelta:
    """
    Calculate difference between dates
    
    Args:
        date1: First date
        date2: Second date
        
    Returns:
        timedelta: Date difference
    """
    if not date1 or not date2:
        raise ValueError("Both dates must be provided")
    
    return date1 - date2


def date_diff_in_days(date1: datetime, date2: datetime) -> int:
    """
    Calculate difference between dates in days
    
    Args:
        date1: First date
        date2: Second date
        
    Returns:
        int: Days difference
    """
    delta = date_diff(date1, date2)
    return abs(delta.days)


def date_diff_in_months(date1: datetime, date2: datetime) -> int:
    """
    Calculate approximate difference between dates in months
    
    Args:
        date1: First date
        date2: Second date
        
    Returns:
        int: Months difference
    """
    # Ensure date2 is the later date
    if date1 > date2:
        date1, date2 = date2, date1
    
    # Calculate years and months difference
    years_diff = date2.year - date1.year
    months_diff = date2.month - date1.month
    
    # Adjust for day
    if date2.day < date1.day:
        months_diff -= 1
    
    total_months = years_diff * 12 + months_diff
    
    return abs(total_months)


def date_diff_in_years(date1: datetime, date2: datetime) -> float:
    """
    Calculate approximate difference between dates in years
    
    Args:
        date1: First date
        date2: Second date
        
    Returns:
        float: Years difference
    """
    days_diff = date_diff_in_days(date1, date2)
    return round(days_diff / 365.25, 1)


def add_time(dt: datetime, 
            days: int = 0,
            hours: int = 0,
            minutes: int = 0,
            seconds: int = 0) -> datetime:
    """
    Add time to datetime
    
    Args:
        dt: Datetime
        days: Days to add
        hours: Hours to add
        minutes: Minutes to add
        seconds: Seconds to add
        
    Returns:
        datetime: New datetime
    """
    if dt is None:
        return None
    
    delta = timedelta(days=days, hours=hours, minutes=minutes, seconds=seconds)
    return dt + delta


def add_months(dt: datetime, months: int) -> datetime:
    """
    Add months to datetime
    
    Args:
        dt: Datetime
        months: Months to add
        
    Returns:
        datetime: New datetime
    """
    if dt is None:
        return None
    
    month = dt.month - 1 + months
    year = dt.year + month // 12
    month = month % 12 + 1
    
    # Keep day within new month's bounds
    day = min(dt.day, calendar.monthrange(year, month)[1])
    
    return dt.replace(year=year, month=month, day=day)


def add_years(dt: datetime, years: int) -> datetime:
    """
    Add years to datetime
    
    Args:
        dt: Datetime
        years: Years to add
        
    Returns:
        datetime: New datetime
    """
    if dt is None:
        return None
    
    # Handle leap year (February 29)
    try:
        return dt.replace(year=dt.year + years)
    except ValueError:
        # Must be February 29 on a leap year
        return dt.replace(year=dt.year + years, day=28)


def beginning_of_day(dt: datetime) -> datetime:
    """
    Get beginning of day (00:00:00)
    
    Args:
        dt: Datetime
        
    Returns:
        datetime: Beginning of day
    """
    if dt is None:
        return None
    
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def end_of_day(dt: datetime) -> datetime:
    """
    Get end of day (23:59:59)
    
    Args:
        dt: Datetime
        
    Returns:
        datetime: End of day
    """
    if dt is None:
        return None
    
    return dt.replace(hour=23, minute=59, second=59, microsecond=999999)


def beginning_of_month(dt: datetime) -> datetime:
    """
    Get beginning of month (first day, 00:00:00)
    
    Args:
        dt: Datetime
        
    Returns:
        datetime: Beginning of month
    """
    if dt is None:
        return None
    
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def end_of_month(dt: datetime) -> datetime:
    """
    Get end of month (last day, 23:59:59)
    
    Args:
        dt: Datetime
        
    Returns:
        datetime: End of month
    """
    if dt is None:
        return None
    
    # Get last day of month
    last_day = calendar.monthrange(dt.year, dt.month)[1]
    return dt.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)


def beginning_of_year(dt: datetime) -> datetime:
    """
    Get beginning of year (January 1, 00:00:00)
    
    Args:
        dt: Datetime
        
    Returns:
        datetime: Beginning of year
    """
    if dt is None:
        return None
    
    return dt.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)


def end_of_year(dt: datetime) -> datetime:
    """
    Get end of year (December 31, 23:59:59)
    
    Args:
        dt: Datetime
        
    Returns:
        datetime: End of year
    """
    if dt is None:
        return None
    
    return dt.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)


def date_range(start_date: datetime, end_date: datetime, step_days: int = 1) -> List[datetime]:
    """
    Generate a range of dates
    
    Args:
        start_date: Start date
        end_date: End date
        step_days: Step in days
        
    Returns:
        List[datetime]: List of dates
    """
    if not start_date or not end_date:
        return []
    
    if start_date > end_date:
        start_date, end_date = end_date, start_date
    
    result = []
    current_date = start_date
    
    while current_date <= end_date:
        result.append(current_date)
        current_date = add_time(current_date, days=step_days)
    
    return result


def get_age(birth_date: datetime) -> int:
    """
    Calculate age from birth date
    
    Args:
        birth_date: Birth date
        
    Returns:
        int: Age in years
    """
    if not birth_date:
        return 0
    
    today = now().date()
    birth = birth_date.date() if isinstance(birth_date, datetime) else birth_date
    
    age = today.year - birth.year
    
    # Adjust age if birthday hasn't occurred yet this year
    if (today.month, today.day) < (birth.month, birth.day):
        age -= 1
    
    return max(0, age)


def get_month_name(month: int, short: bool = False) -> str:
    """
    Get month name
    
    Args:
        month: Month number (1-12)
        short: Get short name (3 letters)
        
    Returns:
        str: Month name
    """
    if month < 1 or month > 12:
        return ""
    
    names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    
    month_name = names[month - 1]
    return month_name[:3] if short else month_name


def get_weekday_name(weekday: int, short: bool = False) -> str:
    """
    Get weekday name
    
    Args:
        weekday: Weekday number (0-6, Monday is 0)
        short: Get short name (3 letters)
        
    Returns:
        str: Weekday name
    """
    if weekday < 0 or weekday > 6:
        return ""
    
    names = [
        "Monday", "Tuesday", "Wednesday", "Thursday", 
        "Friday", "Saturday", "Sunday"
    ]
    
    day_name = names[weekday]
    return day_name[:3] if short else day_name


def iso_to_datetime(iso_str: str) -> Optional[datetime]:
    """
    Convert ISO format string to datetime
    
    Args:
        iso_str: ISO format date string
        
    Returns:
        Optional[datetime]: Datetime or None
    """
    if not iso_str:
        return None
    
    try:
        return datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
    except (ValueError, TypeError) as e:
        logger.error(f"ISO date parsing error: {str(e)}")
        return None


def timestamp_to_datetime(timestamp: int) -> Optional[datetime]:
    """
    Convert Unix timestamp to datetime
    
    Args:
        timestamp: Unix timestamp (seconds since epoch)
        
    Returns:
        Optional[datetime]: Datetime or None
    """
    if not timestamp:
        return None
    
    try:
        return datetime.fromtimestamp(timestamp, timezone.utc)
    except (ValueError, TypeError, OverflowError) as e:
        logger.error(f"Timestamp conversion error: {str(e)}")
        return None 