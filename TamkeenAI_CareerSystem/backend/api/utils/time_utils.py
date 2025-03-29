import datetime

def get_timestamp_str():
    """
    Get current UTC timestamp as ISO format string
    
    Returns:
        ISO format timestamp string
    """
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def parse_timestamp(timestamp_str):
    """
    Parse ISO format timestamp string to datetime object
    
    Args:
        timestamp_str: ISO format timestamp string
    
    Returns:
        datetime object
    """
    if not timestamp_str:
        return datetime.datetime.now(datetime.timezone.utc)
        
    try:
        # Handle both formats with and without timezone
        if 'Z' in timestamp_str:
            timestamp_str = timestamp_str.replace('Z', '+00:00')
        
        # Parse ISO format timestamp
        return datetime.datetime.fromisoformat(timestamp_str)
    except ValueError:
        # Return current time if parsing fails
        return datetime.datetime.now(datetime.timezone.utc)

def format_relative_time(timestamp_str):
    """
    Convert timestamp to relative time (e.g., "2 days ago")
    
    Args:
        timestamp_str: ISO format timestamp string
    
    Returns:
        Relative time string
    """
    timestamp = parse_timestamp(timestamp_str)
    now = datetime.datetime.now(datetime.timezone.utc)
    
    diff = now - timestamp
    
    # Calculate the difference
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif seconds < 604800:
        days = int(seconds / 86400)
        return f"{days} day{'s' if days > 1 else ''} ago"
    elif seconds < 2592000:
        weeks = int(seconds / 604800)
        return f"{weeks} week{'s' if weeks > 1 else ''} ago"
    elif seconds < 31536000:
        months = int(seconds / 2592000)
        return f"{months} month{'s' if months > 1 else ''} ago"
    else:
        years = int(seconds / 31536000)
        return f"{years} year{'s' if years > 1 else ''} ago" 