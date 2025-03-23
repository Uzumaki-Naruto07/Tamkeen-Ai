import os
import json
import time
import logging
import hashlib
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import random
import math
import copy
import base64
import io

# Optional dependencies
try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False
    
try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

try:
    import plotly.graph_objects as go
    import plotly.utils
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False


class CareerPathVisualizer:
    """
    Visualizes career paths, progression options, and skill relationships.
    Creates interactive diagrams showing career growth opportunities.
    """
    
    def __init__(self, 
               data_path: Optional[str] = None,
               output_dir: Optional[str] = None,
               color_scheme: Optional[Dict[str, str]] = None):
        """
        Initialize the career path visualizer
        
        Args:
            data_path: Path to career path data JSON
            output_dir: Directory to save visualization outputs
            color_scheme: Custom color scheme for visualizations
        """
        self.logger = logging.getLogger(__name__)
        
        # Determine visualization capabilities
        self.visualization_options = []
        if NETWORKX_AVAILABLE and MATPLOTLIB_AVAILABLE:
            self.visualization_options.append("network_matplotlib")
        if PLOTLY_AVAILABLE:
            self.visualization_options.append("network_plotly")
            self.visualization_options.append("sunburst")
            self.visualization_options.append("sankey")
            self.visualization_options.append("timeline")
        
        if not self.visualization_options:
            self.logger.warning("No visualization libraries available. Please install networkx, matplotlib, and/or plotly.")
        
        # Set up output directory
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            self.output_dir = output_dir
        else:
            self.output_dir = None
        
        # Set up color scheme
        self.color_scheme = color_scheme or {
            "primary": "#3498db",  # Blue
            "secondary": "#2ecc71",  # Green
            "accent": "#e74c3c",  # Red
            "neutral": "#95a5a6",  # Gray
            "highlight": "#f39c12",  # Orange
            "background": "#ecf0f1",  # Light Gray
            "text": "#2c3e50"  # Dark Blue
        }
        
        # Load career paths data
        self.career_data = self._load_career_data(data_path)
    
    def _load_career_data(self, data_path: Optional[str]) -> Dict[str, Any]:
        """Load career path data from JSON file"""
        career_data = {}
        
        # Define possible data file locations
        data_files = [
            data_path,
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "career_paths.json"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "career_paths.json"),
            os.path.join(os.path.expanduser("~"), ".tamkeen", "data", "career_paths.json")
        ]
        
        # Filter out None values
        data_files = [f for f in data_files if f]
        
        # Try to load from each location
        for file_path in data_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        career_data = json.load(f)
                    self.logger.info(f"Loaded career path data from {file_path}")
                    break
                except Exception as e:
                    self.logger.error(f"Error loading career data from {file_path}: {str(e)}")
        
        # If no data found, use built-in minimal dataset
        if not career_data:
            self.logger.warning("No career path data found, using built-in minimal dataset")
            career_data = self._get_builtin_career_data()
            
        return career_data
    
    def _get_builtin_career_data(self) -> Dict[str, Any]:
        """Return built-in minimal career path dataset"""
        # Basic tech career paths
        return {
            "domains": {
                "software_development": {
                    "name": "Software Development",
                    "paths": ["frontend", "backend", "fullstack", "mobile", "devops"],
                    "color": "#3498db"
                },
                "data_science": {
                    "name": "Data Science",
                    "paths": ["data_analyst", "data_scientist", "machine_learning"],
                    "color": "#2ecc71"
                },
                "design": {
                    "name": "Design",
                    "paths": ["ux_designer", "ui_designer", "product_designer"],
                    "color": "#e74c3c"
                },
                "product": {
                    "name": "Product",
                    "paths": ["product_manager", "product_owner"],
                    "color": "#f39c12"
                }
            },
            "paths": {
                "frontend": {
                    "name": "Frontend Development",
                    "roles": ["junior_frontend", "frontend_developer", "senior_frontend", "frontend_lead", "frontend_architect"],
                    "domain": "software_development"
                },
                "backend": {
                    "name": "Backend Development",
                    "roles": ["junior_backend", "backend_developer", "senior_backend", "backend_lead", "backend_architect"],
                    "domain": "software_development"
                },
                "fullstack": {
                    "name": "Full Stack Development",
                    "roles": ["junior_fullstack", "fullstack_developer", "senior_fullstack", "fullstack_lead", "fullstack_architect"],
                    "domain": "software_development"
                },
                "data_analyst": {
                    "name": "Data Analysis",
                    "roles": ["junior_data_analyst", "data_analyst", "senior_data_analyst", "lead_data_analyst"],
                    "domain": "data_science"
                },
                "data_scientist": {
                    "name": "Data Science",
                    "roles": ["junior_data_scientist", "data_scientist", "senior_data_scientist", "lead_data_scientist"],
                    "domain": "data_science"
                },
                "product_manager": {
                    "name": "Product Management",
                    "roles": ["associate_product_manager", "product_manager", "senior_product_manager", "director_of_product"],
                    "domain": "product"
                }
            },
            "roles": {
                "junior_frontend": {
                    "name": "Junior Frontend Developer",
                    "level": 1,
                    "skills": ["html", "css", "javascript", "react_basics"],
                    "experience_years": "0-2",
                    "education": "Bachelor's in CS or equivalent",
                    "transitions": ["frontend_developer", "junior_fullstack"]
                },
                "frontend_developer": {
                    "name": "Frontend Developer",
                    "level": 2,
                    "skills": ["html", "css", "javascript", "react", "typescript", "responsive_design"],
                    "experience_years": "2-4",
                    "transitions": ["senior_frontend", "fullstack_developer", "ux_designer"]
                },
                "senior_frontend": {
                    "name": "Senior Frontend Developer",
                    "level": 3,
                    "skills": ["html", "css", "javascript", "react", "typescript", "responsive_design"],
                    "experience_years": "4-6",
                    "transitions": ["frontend_lead", "fullstack_architect"]
                },
                "junior_backend": {
                    "name": "Junior Backend Developer",
                    "level": 1,
                    "skills": ["java", "spring", "sql", "rest_api"],
                    "experience_years": "0-2",
                    "education": "Bachelor's in CS or equivalent",
                    "transitions": ["backend_developer", "junior_fullstack"]
                },
                "backend_developer": {
                    "name": "Backend Developer",
                    "level": 2,
                    "skills": ["java", "spring", "sql", "rest_api"],
                    "experience_years": "2-4",
                    "transitions": ["senior_backend", "fullstack_developer"]
                },
                "senior_backend": {
                    "name": "Senior Backend Developer",
                    "level": 3,
                    "skills": ["java", "spring", "sql", "rest_api"],
                    "experience_years": "4-6",
                    "transitions": ["backend_lead", "fullstack_architect"]
                },
                "junior_fullstack": {
                    "name": "Junior Full Stack Developer",
                    "level": 1,
                    "skills": ["html", "css", "javascript", "react_basics", "java", "spring"],
                    "experience_years": "0-2",
                    "education": "Bachelor's in CS or equivalent",
                    "transitions": ["frontend_developer", "backend_developer", "fullstack_developer"]
                },
                "fullstack_developer": {
                    "name": "Full Stack Developer",
                    "level": 2,
                    "skills": ["html", "css", "javascript", "react", "typescript", "responsive_design", "java", "spring"],
                    "experience_years": "2-4",
                    "transitions": ["senior_frontend", "senior_backend", "fullstack_lead"]
                },
                "senior_fullstack": {
                    "name": "Senior Full Stack Developer",
                    "level": 3,
                    "skills": ["html", "css", "javascript", "react", "typescript", "responsive_design", "java", "spring"],
                    "experience_years": "4-6",
                    "transitions": ["fullstack_lead", "fullstack_architect"]
                },
                "junior_data_analyst": {
                    "name": "Junior Data Analyst",
                    "level": 1,
                    "skills": ["sql", "python", "pandas", "data_visualization"],
                    "experience_years": "0-2",
                    "education": "Bachelor's in CS or equivalent",
                    "transitions": ["data_analyst", "data_scientist"]
                },
                "data_analyst": {
                    "name": "Data Analyst",
                    "level": 2,
                    "skills": ["sql", "python", "pandas", "data_visualization"],
                    "experience_years": "2-4",
                    "transitions": ["senior_data_analyst", "lead_data_analyst"]
                },
                "senior_data_analyst": {
                    "name": "Senior Data Analyst",
                    "level": 3,
                    "skills": ["sql", "python", "pandas", "data_visualization"],
                    "experience_years": "4-6",
                    "transitions": ["lead_data_analyst"]
                },
                "lead_data_analyst": {
                    "name": "Lead Data Analyst",
                    "level": 4,
                    "skills": ["sql", "python", "pandas", "data_visualization"],
                    "experience_years": "6-8",
                    "transitions": []
                },
                "junior_data_scientist": {
                    "name": "Junior Data Scientist",
                    "level": 1,
                    "skills": ["python", "pandas", "machine_learning", "data_visualization"],
                    "experience_years": "0-2",
                    "education": "Bachelor's in CS or equivalent",
                    "transitions": ["data_scientist"]
                },
                "data_scientist": {
                    "name": "Data Scientist",
                    "level": 2,
                    "skills": ["python", "pandas", "machine_learning", "data_visualization"],
                    "experience_years": "2-4",
                    "transitions": ["senior_data_scientist"]
                },
                "senior_data_scientist": {
                    "name": "Senior Data Scientist",
                    "level": 3,
                    "skills": ["python", "pandas", "machine_learning", "data_visualization"],
                    "experience_years": "4-6",
                    "transitions": []
                },
                "lead_data_scientist": {
                    "name": "Lead Data Scientist",
                    "level": 4,
                    "skills": ["python", "pandas", "machine_learning", "data_visualization"],
                    "experience_years": "6-8",
                    "transitions": []
                },
                "junior_product_manager": {
                    "name": "Junior Product Manager",
                    "level": 1,
                    "skills": ["product_management", "marketing", "business_analysis"],
                    "experience_years": "0-2",
                    "education": "Bachelor's in Business or equivalent",
                    "transitions": ["product_manager"]
                },
                "product_manager": {
                    "name": "Product Manager",
                    "level": 2,
                    "skills": ["product_management", "marketing", "business_analysis"],
                    "experience_years": "2-4",
                    "transitions": ["senior_product_manager"]
                },
                "senior_product_manager": {
                    "name": "Senior Product Manager",
                    "level": 3,
                    "skills": ["product_management", "marketing", "business_analysis"],
                    "experience_years": "4-6",
                    "transitions": []
                },
                "director_of_product": {
                    "name": "Director of Product",
                    "level": 4,
                    "skills": ["product_management", "marketing", "business_analysis"],
                    "experience_years": "6-8",
                    "transitions": []
                }
            }
        }
        
    def _get_legend_data(self) -> List[Dict[str, Any]]:
        """Get legend data for visualizations"""
        legend_items = []
        
        # Add domains to legend
        for domain_id, domain_data in self.career_data.get("domains", {}).items():
            legend_items.append({
                "label": domain_data.get("name", domain_id),
                "color": domain_data.get("color", self.color_scheme["neutral"])
            })
            
        return legend_items
        
    def _find_path_for_role(self, role_id: str) -> Optional[str]:
        """Find the career path that contains a specific role"""
        for path_id, path_data in self.career_data.get("paths", {}).items():
            if "roles" in path_data and role_id in path_data["roles"]:
                return path_id
        return None
        
    def _save_visualization(self, 
                        figure, 
                        format_type: str, 
                        filename: Optional[str] = None,
                        return_data: bool = False) -> Optional[Union[str, bytes]]:
        """Save or return visualization data"""
        if not filename and not return_data:
            if self.output_dir:
                filename = os.path.join(self.output_dir, f"career_viz_{int(time.time())}.{format_type}")
            else:
                # If no filename and no output_dir, default to return_data
                return_data = True
        
        # Process based on format and return type
        if format_type == 'html' and hasattr(figure, 'to_html'):
            html_content = figure.to_html(include_plotlyjs='cdn')
            if filename:
                with open(filename, 'w') as f:
                    f.write(html_content)
            if return_data:
                return html_content
                
        elif format_type == 'json' and hasattr(figure, 'to_json'):
            json_content = figure.to_json()
            if filename:
                with open(filename, 'w') as f:
                    f.write(json_content)
            if return_data:
                return json_content
                
        elif format_type in ('png', 'jpg', 'svg'):
            if hasattr(figure, 'write_image'):
                # Plotly figure
                if filename:
                    figure.write_image(filename)
                if return_data:
                    img_bytes = figure.to_image(format=format_type)
                    if format_type == 'svg':
                        return img_bytes.decode('utf-8')
                    else:
                        return base64.b64encode(img_bytes).decode('utf-8')
            else:
                # Matplotlib figure
                if filename:
                    figure.savefig(filename, format=format_type, bbox_inches='tight')
                if return_data:
                    buf = io.BytesIO()
                    figure.savefig(buf, format=format_type, bbox_inches='tight')
                    buf.seek(0)
                    if format_type == 'svg':
                        return buf.getvalue().decode('utf-8')
                    else:
                        return base64.b64encode(buf.getvalue()).decode('utf-8')
        
        if filename:
            return filename
        return None
