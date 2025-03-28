"""
Date utilities for TamkeenAI API.
"""

from datetime import datetime, timedelta


def now():
    """
    Get the current datetime as an ISO formatted string.
    """
    return datetime.now().isoformat()


def format_date(date_obj, format_str="%Y-%m-%d"):
    """
    Format a datetime object to a string using the specified format.
    """
    if isinstance(date_obj, str):
        try:
            date_obj = datetime.fromisoformat(date_obj)
        except ValueError:
            try:
                date_obj = datetime.strptime(date_obj, "%Y-%m-%d")
            except ValueError:
                return date_obj
    
    if isinstance(date_obj, datetime):
        return date_obj.strftime(format_str)
    
    return str(date_obj)


def parse_date(date_str, format_str="%Y-%m-%d"):
    """
    Parse a date string to a datetime object.
    """
    try:
        return datetime.strptime(date_str, format_str)
    except ValueError:
        try:
            return datetime.fromisoformat(date_str)
        except ValueError:
            return None


def get_date_range(range_type='week', start_date=None, end_date=None):
    """
    Get a date range based on the provided range type or custom range.
    
    Args:
        range_type: Type of range (day, week, month, year, custom)
        start_date: Start date for custom range (optional)
        end_date: End date for custom range (optional)
        
    Returns:
        Tuple of (start_date, end_date) as datetime objects
    """
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    if range_type == 'custom' and start_date and end_date:
        # Parse custom date range
        if isinstance(start_date, str):
            start_date = parse_date(start_date)
        if isinstance(end_date, str):
            end_date = parse_date(end_date)
        return start_date, end_date
    
    if range_type == 'day':
        return today, today + timedelta(days=1) - timedelta(microseconds=1)
    
    if range_type == 'week':
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=7) - timedelta(microseconds=1)
        return start, end
    
    if range_type == 'month':
        start = today.replace(day=1)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1) - timedelta(microseconds=1)
        else:
            end = start.replace(month=start.month + 1) - timedelta(microseconds=1)
        return start, end
    
    if range_type == 'year':
        start = today.replace(month=1, day=1)
        end = start.replace(year=start.year + 1) - timedelta(microseconds=1)
        return start, end
    
    # Default to week if invalid range type
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=7) - timedelta(microseconds=1)
    return start, end 