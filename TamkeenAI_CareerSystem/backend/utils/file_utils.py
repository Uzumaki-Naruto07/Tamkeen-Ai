"""
File Utility Module

This module provides utility functions for file handling and management.
"""

import os
import uuid
import shutil
from typing import Optional, Tuple, List
from datetime import datetime
from werkzeug.utils import secure_filename

# Import settings
from backend.config.settings import UPLOAD_FOLDER, BASE_DIR

# Define allowed file extensions
ALLOWED_EXTENSIONS = {
    'resume': {'pdf', 'doc', 'docx', 'txt', 'rtf'},
    'image': {'png', 'jpg', 'jpeg', 'gif'},
    'report': {'pdf', 'xlsx', 'csv'},
    'data': {'json', 'csv', 'xml'}
}


def allowed_file(filename: str, file_type: str = 'resume') -> bool:
    """
    Check if file extension is allowed
    
    Args:
        filename: Name of file to check
        file_type: Type of file ('resume', 'image', etc.)
        
    Returns:
        bool: True if extension is allowed
    """
    if '.' not in filename:
        return False
    
    extension = filename.rsplit('.', 1)[1].lower()
    allowed = ALLOWED_EXTENSIONS.get(file_type, {'pdf'})
    
    return extension in allowed


def get_file_extension(filename: str) -> str:
    """
    Get file extension
    
    Args:
        filename: Name of file
        
    Returns:
        str: File extension
    """
    if '.' not in filename:
        return ''
    
    return filename.rsplit('.', 1)[1].lower()


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename with UUID
    
    Args:
        original_filename: Original file name
        
    Returns:
        str: Unique filename
    """
    extension = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    return f"{timestamp}_{unique_id}.{extension}"


def create_user_upload_folder(user_id: str) -> str:
    """
    Create upload folder for user
    
    Args:
        user_id: User ID
        
    Returns:
        str: Path to user's upload folder
    """
    user_folder = os.path.join(UPLOAD_FOLDER, str(user_id))
    os.makedirs(user_folder, exist_ok=True)
    
    return user_folder


def save_uploaded_file(file, user_id: str, file_type: str = 'resume') -> Tuple[bool, str, str]:
    """
    Save uploaded file to user's folder
    
    Args:
        file: File object from request
        user_id: User ID
        file_type: Type of file
        
    Returns:
        tuple: (success, filename, filepath)
    """
    if file and allowed_file(file.filename, file_type):
        # Create user folder
        user_folder = create_user_upload_folder(user_id)
        
        # Generate safe filename
        original_filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(original_filename)
        
        # Save file
        file_path = os.path.join(user_folder, unique_filename)
        file.save(file_path)
        
        return True, original_filename, file_path
    
    return False, "", ""


def delete_file(file_path: str) -> bool:
    """
    Delete a file
    
    Args:
        file_path: Path to file
        
    Returns:
        bool: True if successful
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    return False


def get_file_size(file_path: str) -> int:
    """
    Get file size in bytes
    
    Args:
        file_path: Path to file
        
    Returns:
        int: File size in bytes
    """
    try:
        if os.path.exists(file_path):
            return os.path.getsize(file_path)
    except Exception as e:
        print(f"Error getting file size: {e}")
    
    return 0


def is_file_empty(file_path: str) -> bool:
    """
    Check if file is empty
    
    Args:
        file_path: Path to file
        
    Returns:
        bool: True if file is empty
    """
    return get_file_size(file_path) == 0


def list_user_files(user_id: str, file_type: Optional[str] = None) -> List[dict]:
    """
    List all files for a user
    
    Args:
        user_id: User ID
        file_type: Optional filter by file extension
        
    Returns:
        list: List of file information dictionaries
    """
    user_folder = os.path.join(UPLOAD_FOLDER, str(user_id))
    
    if not os.path.exists(user_folder):
        return []
    
    files = []
    for filename in os.listdir(user_folder):
        file_path = os.path.join(user_folder, filename)
        
        # Skip directories
        if os.path.isdir(file_path):
            continue
        
        # Filter by extension if needed
        if file_type and not filename.lower().endswith(f'.{file_type}'):
            continue
        
        # Get file stats
        stat = os.stat(file_path)
        
        files.append({
            'filename': filename,
            'path': file_path,
            'size': stat.st_size,
            'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
            'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            'extension': get_file_extension(filename)
        })
    
    # Sort by modified date (newest first)
    return sorted(files, key=lambda x: x['modified'], reverse=True)


def create_temp_file(content: str, prefix: str = 'temp_', suffix: str = '.txt') -> str:
    """
    Create a temporary file with content
    
    Args:
        content: Content to write to file
        prefix: Filename prefix
        suffix: Filename suffix/extension
        
    Returns:
        str: Path to temporary file
    """
    import tempfile
    
    temp_file = tempfile.NamedTemporaryFile(prefix=prefix, suffix=suffix, delete=False)
    temp_file.write(content.encode('utf-8'))
    temp_file.close()
    
    return temp_file.name


def copy_file(source_path: str, target_path: str) -> bool:
    """
    Copy a file
    
    Args:
        source_path: Source file path
        target_path: Target file path
        
    Returns:
        bool: True if successful
    """
    try:
        if os.path.exists(source_path):
            # Create target directory if it doesn't exist
            target_dir = os.path.dirname(target_path)
            os.makedirs(target_dir, exist_ok=True)
            
            # Copy the file
            shutil.copy2(source_path, target_path)
            return True
    except Exception as e:
        print(f"Error copying file: {e}")
    
    return False 