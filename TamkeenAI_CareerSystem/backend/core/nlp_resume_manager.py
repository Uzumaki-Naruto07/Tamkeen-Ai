import os
import json
import logging
import hashlib
import uuid
import shutil
import time
import difflib
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import re
from collections import defaultdict

# Optional dependencies - allow graceful fallback if not available
try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    from PyPDF2 import PdfReader
    PDF_AVAILABLE = True
except ImportError:
    try:
        from PyPDF2 import PdfFileReader as PdfReader
        PDF_AVAILABLE = True
    except ImportError:
        PDF_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False


class ResumeManager:
    """
    Manages resume versions, storage, and updates.
    
    Key features:
    - Resume version control with history tracking
    - Format conversion between PDF, DOCX, TXT, JSON
    - Change tracking between versions
    - Automated updates based on recommendations
    - Resume content extraction and normalization
    - Resume tagging and organization
    """
    
    def __init__(self, 
                storage_dir: Optional[str] = None,
                backup_dir: Optional[str] = None,
                max_versions: int = 10,
                auto_backup: bool = True):
        """
        Initialize the resume manager
        
        Args:
            storage_dir: Directory for storing resume files
            backup_dir: Directory for backup resume files
            max_versions: Maximum number of versions to keep
            auto_backup: Automatically backup resumes on update
        """
        self.logger = logging.getLogger(__name__)
        
        # Set up storage directory
        if storage_dir:
            os.makedirs(storage_dir, exist_ok=True)
            self.storage_dir = storage_dir
        else:
            self.storage_dir = os.path.join(os.getcwd(), "resume_storage")
            os.makedirs(self.storage_dir, exist_ok=True)
            
        # Set up backup directory
        if backup_dir:
            os.makedirs(backup_dir, exist_ok=True)
            self.backup_dir = backup_dir
        else:
            self.backup_dir = os.path.join(self.storage_dir, "backups")
            os.makedirs(self.backup_dir, exist_ok=True)
        
        self.max_versions = max_versions
        self.auto_backup = auto_backup
        
        # Initialize in-memory resume cache
        self.resume_cache = {}
        
        self.logger.info("Resume manager initialized")
    
    def store_resume(self, 
                   user_id: str,
                   file_path: str,
                   metadata: Optional[Dict[str, Any]] = None,
                   version_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Store a new resume file
        
        Args:
            user_id: User identifier
            file_path: Path to resume file
            metadata: Additional metadata about the resume
            version_name: Custom name for this version
            
        Returns:
            Dictionary with storage result
        """
        try:
            # Create user directory if it doesn't exist
            user_dir = os.path.join(self.storage_dir, str(user_id))
            os.makedirs(user_dir, exist_ok=True)
            
            # Get file info
            file_name = os.path.basename(file_path)
            file_ext = os.path.splitext(file_name)[1].lower()
            file_size = os.path.getsize(file_path)
            file_hash = self._calculate_file_hash(file_path)
            
            # Check if this exact file already exists
            version_info = self._get_user_resume_versions(user_id)
            for existing_version in version_info:
                if existing_version.get("file_hash") == file_hash:
                    return {
                        "success": False,
                        "error": "duplicate_file",
                        "message": "This exact resume file already exists",
                        "version_id": existing_version.get("version_id")
                    }
            
            # Generate version ID and details
            version_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            if not version_name:
                version_name = f"Version {len(version_info) + 1}"
            
            # Copy file to storage location
            storage_filename = f"{version_id}{file_ext}"
            storage_path = os.path.join(user_dir, storage_filename)
            shutil.copy2(file_path, storage_path)
            
            # Extract text content
            text_content = self._extract_text(file_path)
            
            # Extract resume structure if possible
            resume_structure = self._extract_resume_structure(file_path, text_content)
            
            # Generate JSON version for easy access
            json_path = os.path.join(user_dir, f"{version_id}.json")
            
            version_data = {
                "version_id": version_id,
                "user_id": user_id,
                "original_filename": file_name,
                "storage_filename": storage_filename,
                "storage_path": storage_path,
                "file_size": file_size,
                "file_type": file_ext.replace(".", ""),
                "file_hash": file_hash,
                "version_name": version_name,
                "created_at": timestamp,
                "text_content": text_content,
                "structure": resume_structure,
                "metadata": metadata or {}
            }
            
            # Save JSON version
            with open(json_path, 'w') as f:
                json.dump(version_data, f, indent=2)
            
            # Update version index
            self._update_version_index(user_id, version_data)
            
            # Clean up old versions if needed
            if len(version_info) + 1 > self.max_versions:
                self._clean_old_versions(user_id)
            
            return {
                "success": True,
                "version_id": version_id,
                "message": "Resume stored successfully",
                "storage_path": storage_path,
                "version_name": version_name
            }
            
        except Exception as e:
            self.logger.error(f"Error storing resume: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to store resume"
            }
    
    def get_resume(self, 
                 user_id: str,
                 version_id: Optional[str] = None,
                 format: str = "json") -> Dict[str, Any]:
        """
        Get a specific resume or the latest version
        
        Args:
            user_id: User identifier
            version_id: Version identifier (if None, returns latest)
            format: Requested format ('json', 'text', 'file_path')
            
        Returns:
            Dictionary with resume data
        """
        try:
            # Get all user versions
            versions = self._get_user_resume_versions(user_id)
            if not versions:
                return {
                    "success": False,
                    "error": "no_resume",
                    "message": "No resume found for this user"
                }
            
            # Find requested version or use latest
            target_version = None
            if version_id:
                for version in versions:
                    if version.get("version_id") == version_id:
                        target_version = version
                        break
                
                if not target_version:
                    return {
                        "success": False,
                        "error": "version_not_found",
                        "message": f"Resume version {version_id} not found"
                    }
            else:
                # Get latest version (sorted by created_at)
                versions.sort(key=lambda x: x.get("created_at", ""), reverse=True)
                target_version = versions[0]
            
            # Check if we have full data or need to load it
            if "text_content" not in target_version:
                # Load from JSON file
                json_path = os.path.join(
                    self.storage_dir, 
                    str(user_id), 
                    f"{target_version['version_id']}.json"
                )
                
                if os.path.exists(json_path):
                    with open(json_path, 'r') as f:
                        target_version = json.load(f)
                else:
                    # Reconstruct missing data
                    storage_path = os.path.join(
                        self.storage_dir,
                        str(user_id),
                        target_version.get("storage_filename", f"{target_version['version_id']}.json")
                    )
                    
                    if os.path.exists(storage_path):
                        text_content = self._extract_text(storage_path)
                        structure = self._extract_resume_structure(storage_path, text_content)
                        
                        target_version["text_content"] = text_content
                        target_version["structure"] = structure
            
            # Return in requested format
            if format == "json":
                return {
                    "success": True,
                    "resume": target_version
                }
            elif format == "text":
                return {
                    "success": True,
                    "resume_text": target_version.get("text_content", ""),
                    "version_id": target_version.get("version_id")
                }
            elif format == "file_path":
                return {
                    "success": True,
                    "file_path": target_version.get("storage_path"),
                    "file_type": target_version.get("file_type"),
                    "version_id": target_version.get("version_id")
                }
            else:
                return {
                    "success": False,
                    "error": "invalid_format",
                    "message": f"Unsupported format: {format}"
                }
            
        except Exception as e:
            self.logger.error(f"Error retrieving resume: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to retrieve resume"
            }
    
    def update_resume(self,
                    user_id: str,
                    version_id: str,
                    updates: Dict[str, Any],
                    create_new_version: bool = True,
                    version_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Update an existing resume with changes
        
        Args:
            user_id: User identifier
            version_id: Version to update
            updates: Changes to apply (can be sections or full content)
            create_new_version: Whether to create a new version or overwrite
            version_name: Name for the new version
            
        Returns:
            Dictionary with update result
        """
        try:
            # Get the existing resume
            result = self.get_resume(user_id, version_id)
            if not result.get("success"):
                return result
            
            existing_resume = result.get("resume")
            
            # Backup if needed
            if self.auto_backup:
                self._backup_resume(user_id, existing_resume)
            
            # Apply updates
            updated_resume = self._apply_updates(existing_resume, updates)
            
            if create_new_version:
                # Generate new version
                new_version_id = str(uuid.uuid4())
                timestamp = datetime.now().isoformat()
                
                if not version_name:
                    versions = self._get_user_resume_versions(user_id)
                    version_name = f"Version {len(versions) + 1}"
                
                # Copy existing file to new name
                user_dir = os.path.join(self.storage_dir, str(user_id))
                file_ext = f".{existing_resume.get('file_type', 'txt')}"
                
                old_path = existing_resume.get("storage_path")
                new_filename = f"{new_version_id}{file_ext}"
                new_path = os.path.join(user_dir, new_filename)
                
                # Copy file if source exists
                if old_path and os.path.exists(old_path):
                    shutil.copy2(old_path, new_path)
                
                # Update version details
                updated_resume["version_id"] = new_version_id
                updated_resume["previous_version_id"] = version_id
                updated_resume["storage_filename"] = new_filename
                updated_resume["storage_path"] = new_path
                updated_resume["version_name"] = version_name
                updated_resume["created_at"] = timestamp
                updated_resume["updated_at"] = timestamp
                
                # Calculate changes from previous version
                changes = self._calculate_changes(existing_resume, updated_resume)
                updated_resume["changes"] = changes
                
                # Save JSON version
                json_path = os.path.join(user_dir, f"{new_version_id}.json")
                
                with open(json_path, 'w') as f:
                    json.dump(updated_resume, f, indent=2)
                
                # Update version index
                self._update_version_index(user_id, updated_resume)
                
                # Clean up old versions if needed
                versions = self._get_user_resume_versions(user_id)
                if len(versions) > self.max_versions:
                    self._clean_old_versions(user_id)
                
                return {
                    "success": True,
                    "version_id": new_version_id,
                    "message": "Resume updated successfully",
                    "changes": changes
                }
            else:
                # Update in place
                updated_resume["updated_at"] = datetime.now().isoformat()
                
                # Calculate changes
                changes = self._calculate_changes(existing_resume, updated_resume)
                updated_resume["changes"] = changes
                
                # Save JSON version
                json_path = os.path.join(
                    self.storage_dir, 
                    str(user_id), 
                    f"{version_id}.json"
                )
                
                with open(json_path, 'w') as f:
                    json.dump(updated_resume, f, indent=2)
                
                # Update version index
                self._update_version_index(user_id, updated_resume)
                
                return {
                    "success": True,
                    "version_id": version_id,
                    "message": "Resume updated in place",
                    "changes": changes
                }
            
        except Exception as e:
            self.logger.error(f"Error updating resume: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to update resume"
            }
    
    def delete_resume(self,
                     user_id: str,
                     version_id: str,
                     preserve_backup: bool = True) -> Dict[str, Any]:
        """
        Delete a resume version
        
        Args:
            user_id: User identifier
            version_id: Version to delete
            preserve_backup: Whether to keep a backup
            
        Returns:
            Dictionary with deletion result
        """
        try:
            # Get the resume
            result = self.get_resume(user_id, version_id)
            if not result.get("success"):
                return result
            
            resume = result.get("resume")
            
            # Create backup if requested
            if preserve_backup:
                self._backup_resume(user_id, resume)
            
            # Delete files
            user_dir = os.path.join(self.storage_dir, str(user_id))
            
            # Delete main file
            storage_path = resume.get("storage_path")
            if storage_path and os.path.exists(storage_path):
                os.remove(storage_path)
            
            # Delete JSON file
            json_path = os.path.join(user_dir, f"{version_id}.json")
            if os.path.exists(json_path):
                os.remove(json_path)
            
            # Update version index to remove this version
            self._remove_from_version_index(user_id, version_id)
            
            return {
                "success": True,
                "message": "Resume deleted successfully"
            }
            
        except Exception as e:
            self.logger.error(f"Error deleting resume: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to delete resume"
            }
    
    def list_resume_versions(self, user_id: str) -> Dict[str, Any]:
        """
        List all resume versions for a user
        
        Args:
            user_id: User identifier
            
        Returns:
            Dictionary with list of versions
        """
        try:
            versions = self._get_user_resume_versions(user_id)
            
            # Sort by created_at (newest first)
            versions.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            
            # Clean up data for response
            clean_versions = []
            for version in versions:
                clean_versions.append({
                    "version_id": version.get("version_id"),
                    "version_name": version.get("version_name"),
                    "created_at": version.get("created_at"),
                    "file_type": version.get("file_type"),
                    "original_filename": version.get("original_filename"),
                    "file_size": version.get("file_size"),
                    "has_changes": "changes" in version and bool(version.get("changes"))
                })
            
            return {
                "success": True,
                "versions": clean_versions,
                "count": len(clean_versions)
            }
            
        except Exception as e:
            self.logger.error(f"Error listing resume versions: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to list resume versions"
            }
    
    def get_version_diff(self,
                        user_id: str,
                        version_id1: str,
                        version_id2: str) -> Dict[str, Any]:
        """
        Get differences between two resume versions
        
        Args:
            user_id: User identifier
            version_id1: First version
            version_id2: Second version
            
        Returns:
            Dictionary with differences
        """
        try:
            # Get both resumes
            result1 = self.get_resume(user_id, version_id1)
            if not result1.get("success"):
                return result1
            
            result2 = self.get_resume(user_id, version_id2)
            if not result2.get("success"):
                return result2
            
            resume1 = result1.get("resume")
            resume2 = result2.get("resume")
            
            # Calculate differences
            differences = self._calculate_detailed_diff(resume1, resume2)
            
            return {
                "success": True,
                "differences": differences,
                "from_version": {
                    "version_id": version_id1,
                    "version_name": resume1.get("version_name")
                },
                "to_version": {
                    "version_id": version_id2,
                    "version_name": resume2.get("version_name")
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating version diff: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to calculate version differences"
            }
    
    def export_resume(self,
                     user_id: str,
                     version_id: Optional[str] = None,
                     export_format: str = "pdf",
                     output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Export a resume in specified format
        
        Args:
            user_id: User identifier
            version_id: Version to export (latest if None)
            export_format: Format to export to ('pdf', 'docx', 'txt', 'json')
            output_path: Path to save exported file
            
        Returns:
            Dictionary with export result
        """
        try:
            # Get the resume
            result = self.get_resume(user_id, version_id)
            if not result.get("success"):
                return result
            
            resume = result.get("resume")
            version_id = resume.get("version_id")
            
            # Determine output path if not provided
            if not output_path:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"resume_{user_id}_{version_id[:8]}_{timestamp}"
                output_path = os.path.join(os.getcwd(), f"{filename}.{export_format}")
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            
            # Handle different export formats
            if export_format == "json":
                # Export as JSON
                with open(output_path, 'w') as f:
                    json.dump(resume, f, indent=2)
                    
            elif export_format == "txt":
                # Export as plain text
                with open(output_path, 'w') as f:
                    f.write(resume.get("text_content", ""))
                    
            elif export_format == "docx":
                # Export as DOCX
                if not DOCX_AVAILABLE:
                    return {
                        "success": False,
                        "error": "docx_not_supported",
                        "message": "DOCX export requires python-docx package"
                    }
                
                # Check if we can simply copy an existing DOCX
                if resume.get("file_type") == "docx" and os.path.exists(resume.get("storage_path", "")):
                    shutil.copy2(resume["storage_path"], output_path)
                else:
                    # Create new DOCX from structure
                    self._create_docx_from_resume(resume, output_path)
                
            elif export_format == "pdf":
                # Export as PDF
                # Note: Full PDF creation would require additional libraries
                # For now, we'll just copy an existing PDF if available
                
                if resume.get("file_type") == "pdf" and os.path.exists(resume.get("storage_path", "")):
                    shutil.copy2(resume["storage_path"], output_path)
                else:
                    return {
                        "success": False,
                        "error": "pdf_generation_not_implemented",
                        "message": "Direct PDF generation not implemented; try exporting to DOCX first"
                    }
            else:
                return {
                    "success": False,
                    "error": "unsupported_format",
                    "message": f"Export format not supported: {export_format}"
                }
            
            return {
                "success": True,
                "export_path": output_path,
                "format": export_format,
                "message": f"Resume exported successfully to {export_format}"
            }
            
        except Exception as e:
            self.logger.error(f"Error exporting resume: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to export resume"
            }
    
    def apply_recommendations(self,
                            user_id: str,
                            version_id: str,
                            recommendations: List[Dict[str, Any]],
                            create_new_version: bool = True,
                            version_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Apply recommended changes to a resume
        
        Args:
            user_id: User identifier
            version_id: Version to update
            recommendations: List of recommended changes
            create_new_version: Whether to create a new version
            version_name: Name for the new version
            
        Returns:
            Dictionary with update result
        """
        try:
            # Get the resume
            result = self.get_resume(user_id, version_id)
            if not result.get("success"):
                return result
            
            resume = result.get("resume")
            
            # Process recommendations into updates
            updates = self._process_recommendations(resume, recommendations)
            
            # Apply updates
            return self.update_resume(
                user_id, 
                version_id, 
                updates, 
                create_new_version, 
                version_name or "Recommended Improvements"
            )
            
        except Exception as e:
            self.logger.error(f"Error applying recommendations: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to apply recommendations"
            }
    
    def generate_resume_stats(self, user_id: str, version_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate statistics for a resume
        
        Args:
            user_id: User identifier
            version_id: Version to analyze (latest if None)
            
        Returns:
            Dictionary with resume statistics
        """
        try:
            # Get the resume
            result = self.get_resume(user_id, version_id)
            if not result.get("success"):
                return result
            
            resume = result.get("resume")
            text_content = resume.get("text_content", "")
            structure = resume.get("structure", {})
            
            # Calculate statistics
            stats = {}
            
            # Basic text stats
            total_chars = len(text_content)
            total_words = len(text_content.split())
            sentences = re.split(r'[.!?]+', text_content)
            total_sentences = len([s for s in sentences if s.strip()])
            
            stats["text_stats"] = {
                "total_characters": total_chars,
                "total_words": total_words,
                "total_sentences": total_sentences,
                "avg_words_per_sentence": round(total_words / max(1, total_sentences), 1)
            }
            
            # Section stats
            if structure and "sections" in structure:
                section_stats = {}
                for section in structure["sections"]:
                    section_name = section.get("name", "Unnamed")
                    section_content = section.get("content", "")
                    
                    section_stats[section_name] = {
                        "word_count": len(section_content.split()),
                        "character_count": len(section_content),
                        "percentage_of_resume": round(len(section_content) / max(1, total_chars) * 100, 1)
                    }
                
                stats["section_stats"] = section_stats
            
            # Keyword frequency
            word_pattern = re.compile(r'\b[a-zA-Z]{3,}\b')
            words = word_pattern.findall(text_content.lower())
            
            # Remove common stop words
            stop_words = {'the', 'and', 'a', 'to', 'of', 'in', 'with', 'for', 'on', 'at', 'from', 'by'}
            words = [word for word in words if word not in stop_words]
            
            word_freq = {}
            for word in words:
                if word in word_freq:
                    word_freq[word] += 1
                else:
                    word_freq[word] = 1
            
            # Get top keywords
            sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            stats["keyword_frequency"] = {k: v for k, v in sorted_keywords[:15]}
            
            # Version history stats
            versions = self._get_user_resume_versions(user_id)
            version_history = []
            
            for v in versions:
                v_id = v.get("version_id")
                if v_id:
                    version_history.append({
                        "version_id": v_id,
                        "version_name": v.get("version_name"),
                        "created_at": v.get("created_at"),
                        "changes": bool(v.get("changes"))
                    })
            
            stats["version_history"] = sorted(
                version_history, 
                key=lambda x: x.get("created_at", ""), 
                reverse=True
            )
            
            return {
                "success": True,
                "stats": stats,
                "version_id": resume.get("version_id"),
                "version_name": resume.get("version_name")
            }
            
        except Exception as e:
            self.logger.error(f"Error generating resume stats: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate resume statistics"
            }
    
    # Internal helper methods
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA256 hash of a file"""
        hash_obj = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()
    
    def _extract_text(self, file_path: str) -> str:
        """Extract text content from different file types"""
        file_ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_ext == '.txt':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
                    
            elif file_ext == '.docx':
                if not DOCX_AVAILABLE:
                    return "DOCX text extraction not available (python-docx not installed)"
                    
                doc = docx.Document(file_path)
                full_text = []
                for para in doc.paragraphs:
                    full_text.append(para.text)
                return '\n'.join(full_text)
                
            elif file_ext == '.pdf':
                if not PDF_AVAILABLE:
                    return "PDF text extraction not available (PyPDF2 not installed)"
                    
                reader = PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
                
            elif file_ext in ['.json', '.txt', '.html', '.rtf']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    if file_ext == '.json':
                        try:
                            data = json.load(f)
                            if isinstance(data, dict) and "text_content" in data:
                                return data["text_content"]
                            return json.dumps(data)
                        except:
                            return f.read()
                    else:
                        return f.read()
            else:
                return f"Unsupported file type: {file_ext}"
                
        except Exception as e:
            self.logger.error(f"Error extracting text: {str(e)}")
            return f"Error extracting text: {str(e)}"
    
    def _extract_resume_structure(self, file_path: str, text_content: str) -> Dict[str, Any]:
        """Extract structured information from resume"""
        structure = {
            "sections": []
        }
        
        # Simple section detection using common resume section headers
        section_patterns = [
            (r'EDUCATION|ACADEMIC BACKGROUND', "Education"),
            (r'EXPERIENCE|WORK HISTORY|EMPLOYMENT|PROFESSIONAL EXPERIENCE', "Experience"),
            (r'SKILLS|TECHNICAL SKILLS|COMPETENCIES|CAPABILITIES', "Skills"),
            (r'PROJECTS|PROJECT EXPERIENCE', "Projects"),
            (r'CERTIFICATIONS|CERTIFICATES|ACCREDITATIONS', "Certifications"),
            (r'SUMMARY|PROFILE|OBJECTIVE|PROFESSIONAL SUMMARY', "Summary"),
            (r'AWARDS|HONORS|ACHIEVEMENTS', "Awards"),
            (r'LANGUAGES|LANGUAGE PROFICIENCY', "Languages"),
            (r'VOLUNTEER|COMMUNITY SERVICE', "Volunteer"),
            (r'PUBLICATIONS|PAPERS|RESEARCH', "Publications"),
            (r'INTERESTS|HOBBIES', "Interests"),
            (r'REFERENCES', "References")
        ]
        
        # Split text into lines
        lines = text_content.split('\n')
        
        current_section = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_content:
                    current_content.append("")  # Keep paragraph breaks
                continue
                
            # Check if this line is a section header
            is_header = False
            for pattern, section_name in section_patterns:
                if re.match(f"^({pattern})[:\\s]*$", line, re.IGNORECASE):
                    # Save previous section if exists
                    if current_section:
                        structure["sections"].append({
                            "name": current_section,
                            "content": '\n'.join(current_content).strip()
                        })
                    
                    # Start new section
                    current_section = section_name
                    current_content = []
                    is_header = True
                    break
                    
            if not is_header:
                # Add line to current section content
                if current_section:
                    current_content.append(line)
                else:
                    # No section detected yet, assume it's the header/contact info
                    if not structure.get("contact_info"):
                        structure["contact_info"] = line
                    else:
                        structure["contact_info"] += "\n" + line
        
        # Add final section
        if current_section:
            structure["sections"].append({
                "name": current_section,
                "content": '\n'.join(current_content).strip()
            })
        
        # Try to extract contact information
        contact_info = {}
        if "contact_info" in structure:
            contact_text = structure["contact_info"]
            
            # Email
            email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', contact_text)
            if email_match:
                contact_info["email"] = email_match.group(0)
            
            # Phone
            phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', contact_text)
            if phone_match:
                contact_info["phone"] = phone_match.group(0)
            
            # Name (assume first line might be the name)
            first_line = contact_text.split('\n')[0].strip()
            if len(first_line) < 40:  # Assume name isn't too long
                contact_info["name"] = first_line
            
            structure["contact_info"] = contact_info
        
        return structure
    
    def _get_user_resume_versions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all resume versions for a user"""
        index_file = os.path.join(self.storage_dir, str(user_id), "resume_index.json")
        
        if os.path.exists(index_file):
            try:
                with open(index_file, 'r') as f:
                    return json.load(f).get("versions", [])
            except Exception as e:
                self.logger.error(f"Error reading resume index: {str(e)}")
                return []
        
        # If no index exists, scan directory for resume files
        user_dir = os.path.join(self.storage_dir, str(user_id))
        if not os.path.exists(user_dir):
            return []
            
        versions = []
        for filename in os.listdir(user_dir):
            if filename.endswith('.json') and not filename == "resume_index.json":
                try:
                    file_path = os.path.join(user_dir, filename)
                    with open(file_path, 'r') as f:
                        resume_data = json.load(f)
                        if "version_id" in resume_data:
                            # Add only essential version info to the index
                            versions.append({
                                "version_id": resume_data.get("version_id"),
                                "version_name": resume_data.get("version_name"),
                                "created_at": resume_data.get("created_at"),
                                "file_type": resume_data.get("file_type"),
                                "original_filename": resume_data.get("original_filename"),
                                "storage_filename": resume_data.get("storage_filename"),
                                "file_size": resume_data.get("file_size"),
                                "file_hash": resume_data.get("file_hash")
                            })
                except Exception as e:
                    self.logger.error(f"Error reading resume file {filename}: {str(e)}")
        
        # Create index file
        self._update_version_index(user_id, None, versions)
        
        return versions
    
    def _update_version_index(self, 
                            user_id: str, 
                            new_version: Optional[Dict[str, Any]] = None,
                            all_versions: Optional[List[Dict[str, Any]]] = None) -> None:
        """Update the resume version index"""
        index_file = os.path.join(self.storage_dir, str(user_id), "resume_index.json")
        
        # Create user directory if it doesn't exist
        user_dir = os.path.dirname(index_file)
        os.makedirs(user_dir, exist_ok=True)
        
        # Read existing index
        versions = []
        if os.path.exists(index_file):
            try:
                with open(index_file, 'r') as f:
                    data = json.load(f)
                    versions = data.get("versions", [])
            except Exception as e:
                self.logger.error(f"Error reading resume index: {str(e)}")
        
        # Use provided versions list if available
        if all_versions is not None:
            versions = all_versions
        # Otherwise update with new version
        elif new_version and "version_id" in new_version:
            # Check if version already exists
            version_exists = False
            for i, version in enumerate(versions):
                if version.get("version_id") == new_version["version_id"]:
                    # Update existing version
                    versions[i] = {
                        "version_id": new_version.get("version_id"),
                        "version_name": new_version.get("version_name"),
                        "created_at": new_version.get("created_at"),
                        "file_type": new_version.get("file_type"),
                        "original_filename": new_version.get("original_filename"),
                        "storage_filename": new_version.get("storage_filename"),
                        "file_size": new_version.get("file_size"),
                        "file_hash": new_version.get("file_hash")
                    }
                    version_exists = True
                    break
                    
            if not version_exists:
                # Add new version
                versions.append({
                    "version_id": new_version.get("version_id"),
                    "version_name": new_version.get("version_name"),
                    "created_at": new_version.get("created_at"),
                    "file_type": new_version.get("file_type"),
                    "original_filename": new_version.get("original_filename"),
                    "storage_filename": new_version.get("storage_filename"),
                    "file_size": new_version.get("file_size"),
                    "file_hash": new_version.get("file_hash")
                })
        
        # Sort versions by creation date (newest first)
        versions.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        # Write updated index
        try:
            with open(index_file, 'w') as f:
                json.dump({
                    "user_id": user_id,
                    "last_updated": datetime.now().isoformat(),
                    "versions": versions
                }, f, indent=2)
        except Exception as e:
            self.logger.error(f"Error writing resume index: {str(e)}")
    
    def _clean_old_versions(self, user_id: str) -> None:
        """Remove old resume versions to stay within max_versions limit"""
        versions = self._get_user_resume_versions(user_id)
        
        if len(versions) <= self.max_versions:
            return
            
        # Sort by creation date (oldest first)
        versions.sort(key=lambda x: x.get("created_at", ""))
        
        # Calculate how many to remove
        to_remove = len(versions) - self.max_versions
        
        # Remove oldest versions
        user_dir = os.path.join(self.storage_dir, str(user_id))
        for i in range(to_remove):
            version = versions[i]
            version_id = version.get("version_id")
            
            # Backup if auto_backup enabled
            if self.auto_backup:
                self._backup_version(user_id, version_id)
            
            # Remove files
            for ext in ['.json', '.pdf', '.docx', '.txt', version.get("file_type", "")]:
                if not ext.startswith('.'):
                    ext = f".{ext}"
                    
                file_path = os.path.join(user_dir, f"{version_id}{ext}")
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        self.logger.error(f"Error removing file {file_path}: {str(e)}")
                        
            # If storage_filename is different from version_id
            storage_filename = version.get("storage_filename")
            if storage_filename and storage_filename != f"{version_id}.{version.get('file_type', '')}":
                storage_path = os.path.join(user_dir, storage_filename)
                if os.path.exists(storage_path):
                    try:
                        os.remove(storage_path)
                    except Exception as e:
                        self.logger.error(f"Error removing file {storage_path}: {str(e)}")
        
        # Update index without the removed versions
        remaining_versions = versions[to_remove:]
        self._update_version_index(user_id, None, remaining_versions)
    
    def _backup_version(self, user_id: str, version_id: str) -> bool:
        """Backup a resume version"""
        user_dir = os.path.join(self.storage_dir, str(user_id))
        backup_user_dir = os.path.join(self.backup_dir, str(user_id))
        os.makedirs(backup_user_dir, exist_ok=True)
        
        # Get version details
        versions = self._get_user_resume_versions(user_id)
        version = next((v for v in versions if v.get("version_id") == version_id), None)
        
        if not version:
            self.logger.error(f"Version {version_id} not found for backup")
            return False
        
        try:
            # Backup JSON metadata
            json_path = os.path.join(user_dir, f"{version_id}.json")
            backup_json_path = os.path.join(backup_user_dir, f"{version_id}.json")
            
            if os.path.exists(json_path):
                shutil.copy2(json_path, backup_json_path)
            
            # Backup resume file
            storage_filename = version.get("storage_filename")
            if storage_filename:
                file_path = os.path.join(user_dir, storage_filename)
                backup_file_path = os.path.join(backup_user_dir, storage_filename)
                
                if os.path.exists(file_path):
                    shutil.copy2(file_path, backup_file_path)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error backing up version {version_id}: {str(e)}")
            return False
    
    def generate_resume_from_template(self,
                                    user_id: str,
                                    template_id: str,
                                    resume_data: Dict[str, Any],
                                    output_format: str = "docx") -> Dict[str, Any]:
        """
        Generate a new resume from a template
        
        Args:
            user_id: User identifier
            template_id: Template identifier
            resume_data: Resume content data
            output_format: Output format (pdf, docx, txt)
            
        Returns:
            Dictionary with generation result
        """
        try:
            # This is a placeholder for a template-based resume generator
            # A real implementation would:
            # 1. Load a template file (DOCX, LaTeX, HTML, etc.)
            # 2. Populate it with resume_data
            # 3. Generate the output file in the requested format
            
            # For now, we'll create a simple text version
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_dir = os.path.join(self.storage_dir, str(user_id), "generated")
            os.makedirs(output_dir, exist_ok=True)
            
            output_filename = f"resume_{template_id}_{timestamp}.txt"
            output_path = os.path.join(output_dir, output_filename)
            
            # Generate a simple text resume
            with open(output_path, 'w') as f:
                # Contact info
                contact = resume_data.get("contact_info", {})
                f.write(f"{contact.get('name', 'Full Name')}\n")
                f.write(f"{contact.get('email', 'email@example.com')} | {contact.get('phone', '123-456-7890')}\n")
                f.write(f"{contact.get('location', 'City, State')} | {contact.get('linkedin', 'LinkedIn URL')}\n\n")
                
                # Summary
                summary = resume_data.get("summary", "")
                if summary:
                    f.write("SUMMARY\n")
                    f.write(f"{summary}\n\n")
                
                # Experience
                experience = resume_data.get("experience", [])
                if experience:
                    f.write("EXPERIENCE\n")
                    for job in experience:
                        f.write(f"{job.get('title', 'Job Title')} | {job.get('company', 'Company')}\n")
                        f.write(f"{job.get('start_date', 'Start Date')} - {job.get('end_date', 'Present')}\n")
                        for desc in job.get("description", []):
                            f.write(f"• {desc}\n")
                        f.write("\n")
                
                # Education
                education = resume_data.get("education", [])
                if education:
                    f.write("EDUCATION\n")
                    for edu in education:
                        f.write(f"{edu.get('degree', 'Degree')} in {edu.get('field', 'Field')}\n")
                        f.write(f"{edu.get('institution', 'Institution')} | {edu.get('location', 'Location')}\n")
                        f.write(f"{edu.get('graduation_date', 'Graduation Date')}\n\n")
                
                # Skills
                skills = resume_data.get("skills", [])
                if skills:
                    f.write("SKILLS\n")
                    skill_groups = defaultdict(list)
                    
                    for skill in skills:
                        category = skill.get("category", "Technical")
                        skill_groups[category].append(skill.get("name", ""))
                    
                    for category, skill_list in skill_groups.items():
                        f.write(f"{category}: {', '.join(skill_list)}\n")
            
            # Store as a new resume version
            result = self.store_resume(
                user_id=user_id,
                file_path=output_path,
                metadata={
                    "generated": True,
                    "template_id": template_id,
                    "generation_timestamp": timestamp
                },
                version_name=f"Generated from template {template_id}"
            )
            
            # Clean up temporary file
            try:
                os.remove(output_path)
            except:
                pass
                
            return result
            
        except Exception as e:
            self.logger.error(f"Error generating resume from template: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate resume from template"
            }
    
    def update_resume_section(self,
                            user_id: str,
                            version_id: str,
                            section_name: str,
                            new_content: str) -> Dict[str, Any]:
        """
        Update a specific section in a resume
        
        Args:
            user_id: User identifier
            version_id: Resume version identifier
            section_name: Section name to update
            new_content: New section content
            
        Returns:
            Dictionary with update result
        """
        try:
            # Get resume data
            resume_data = self.get_resume_version(user_id, version_id)
            if not resume_data or "success" in resume_data and not resume_data["success"]:
                return {
                    "success": False,
                    "error": "version_not_found",
                    "message": f"Resume version {version_id} not found"
                }
            
            # Update section
            section_updated = False
            if "structure" in resume_data and "sections" in resume_data["structure"]:
                for i, section in enumerate(resume_data["structure"]["sections"]):
                    if section["name"].lower() == section_name.lower():
                        resume_data["structure"]["sections"][i]["content"] = new_content
                        section_updated = True
                        break
            
            if not section_updated:
                # Add new section if it doesn't exist
                if "structure" not in resume_data:
                    resume_data["structure"] = {"sections": []}
                elif "sections" not in resume_data["structure"]:
                    resume_data["structure"]["sections"] = []
                
                resume_data["structure"]["sections"].append({
                    "name": section_name,
                    "content": new_content
                })
            
            # Update text content
            text_content = ""
            if "structure" in resume_data:
                if "contact_info" in resume_data["structure"]:
                    contact_info = resume_data["structure"]["contact_info"]
                    if isinstance(contact_info, dict):
                        text_content += "\n".join(v for k, v in contact_info.items() if v) + "\n\n"
                    else:
                        text_content += contact_info + "\n\n"
                
                for section in resume_data["structure"]["sections"]:
                    text_content += section["name"].upper() + "\n"
                    text_content += section["content"] + "\n\n"
            
            resume_data["text_content"] = text_content
            
            # Create a new version
            json_path = os.path.join(self.storage_dir, str(user_id), f"{version_id}.json")
            with open(json_path, 'w') as f:
                json.dump(resume_data, f, indent=2)
            
            # Create text version for convenience
            txt_path = os.path.join(self.storage_dir, str(user_id), f"{version_id}.txt")
            with open(txt_path, 'w') as f:
                f.write(text_content)
            
            # TODO: Update PDF/DOCX versions if they exist
            
            return {
                "success": True,
                "message": f"Resume section '{section_name}' updated successfully",
                "version_id": version_id
            }
            
        except Exception as e:
            self.logger.error(f"Error updating resume section: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to update resume section"
            }
    
    def apply_recommendation(self,
                           user_id: str,
                           version_id: str,
                           recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply a recommended change to a resume
        
        Args:
            user_id: User identifier
            version_id: Resume version identifier
            recommendation: Recommendation details
            
        Returns:
            Dictionary with update result
        """
        try:
            rec_type = recommendation.get("type", "unknown")
            section = recommendation.get("section", "")
            
            # Get current resume
            resume_data = self.get_resume_version(user_id, version_id)
            if not resume_data or "success" in resume_data and not resume_data["success"]:
                return {
                    "success": False,
                    "error": "version_not_found",
                    "message": f"Resume version {version_id} not found"
                }
            
            # Create a new version with a new ID
            new_version_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            # Clone the resume data
            new_resume_data = resume_data.copy()
            new_resume_data["version_id"] = new_version_id
            new_resume_data["created_at"] = timestamp
            new_resume_data["version_name"] = f"Updated ({rec_type})"
            new_resume_data["parent_version_id"] = version_id
            
            # Add metadata about the applied recommendation
            if "metadata" not in new_resume_data:
                new_resume_data["metadata"] = {}
            
            if "applied_recommendations" not in new_resume_data["metadata"]:
                new_resume_data["metadata"]["applied_recommendations"] = []
                
            new_resume_data["metadata"]["applied_recommendations"].append({
                "type": rec_type,
                "section": section,
                "timestamp": timestamp,
                "recommendation_id": recommendation.get("id", ""),
                "details": recommendation.get("details", "")
            })
            
            # Apply changes based on recommendation type
            if rec_type == "bullet_point":
                # Update a bullet point
                self._apply_bullet_point_recommendation(new_resume_data, recommendation)
                
            elif rec_type == "keyword":
                # Add missing keywords
                self._apply_keyword_recommendation(new_resume_data, recommendation)
                
            elif rec_type == "section_order":
                # Reorder sections
                self._apply_section_order_recommendation(new_resume_data, recommendation)
                
            elif rec_type == "format":
                # Format changes
                self._apply_format_recommendation(new_resume_data, recommendation)
                
            else:
                # Generic section content update
                self._apply_generic_recommendation(new_resume_data, recommendation)
            
            # Save the new version
            user_dir = os.path.join(self.storage_dir, str(user_id))
            json_path = os.path.join(user_dir, f"{new_version_id}.json")
            
            with open(json_path, 'w') as f:
                json.dump(new_resume_data, f, indent=2)
                
            # Update text content file
            if "text_content" in new_resume_data:
                txt_path = os.path.join(user_dir, f"{new_version_id}.txt")
                with open(txt_path, 'w') as f:
                    f.write(new_resume_data["text_content"])
            
            # Update version index
            self._update_version_index(user_id, new_resume_data)
            
            return {
                "success": True,
                "message": f"Recommendation applied successfully",
                "old_version_id": version_id,
                "new_version_id": new_version_id
            }
            
        except Exception as e:
            self.logger.error(f"Error applying recommendation: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to apply recommendation"
            }