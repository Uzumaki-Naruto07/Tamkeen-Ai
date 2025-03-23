import os
import json
import logging
import uuid
import time
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import importlib
import traceback
import threading
from functools import wraps

# Define all possible component names
COMPONENT_NAMES = [
    "resume_analyzer",
    "sentiment_analyzer", 
    "skill_gap_predictor",
    "enhanced_interview",
    "feedback_generator",
    "dashboard_data_engine",
    "analytics_engine",
    "resume_manager",
    "job_recommendation_engine"
]

class CareerSystem:
    """
    Central coordinator for the Tamkeen AI Career System.
    
    This class integrates all core components and provides a unified interface
    for accessing the system's capabilities. It handles component initialization,
    error management, caching, and cross-component operations.
    
    Key features:
    - Dynamic component loading and initialization
    - Component dependency management
    - Unified error handling and logging
    - User session and data management
    - System-level diagnostics and monitoring
    - Configuration management
    - Cache coordination across components
    """
    
    def __init__(self, 
                config_path: Optional[str] = None,
                data_dir: Optional[str] = None,
                component_overrides: Optional[Dict[str, Any]] = None,
                cache_enabled: bool = True,
                debug_mode: bool = False):
        """
        Initialize the career system
        
        Args:
            config_path: Path to configuration file
            data_dir: Root directory for all data storage
            component_overrides: Override specific component instances
            cache_enabled: Enable system-wide caching
            debug_mode: Enable debug logging and features
        """
        # Configure logging
        self.logger = logging.getLogger(__name__)
        self.debug_mode = debug_mode
        
        if debug_mode:
            logging.basicConfig(level=logging.DEBUG)
        else:
            logging.basicConfig(level=logging.INFO)
            
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Set up data directory
        if data_dir:
            self.data_dir = data_dir
        else:
            self.data_dir = self.config.get("data_dir", os.path.join(os.getcwd(), "tamkeen_data"))
        
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Create directories for each component
        for component in COMPONENT_NAMES:
            component_dir = os.path.join(self.data_dir, component)
            os.makedirs(component_dir, exist_ok=True)
        
        # User data directory
        self.user_data_dir = os.path.join(self.data_dir, "user_data")
        os.makedirs(self.user_data_dir, exist_ok=True)
        
        # Set up caching
        self.cache_enabled = cache_enabled
        self.cache = {}
        self.cache_ttl = self.config.get("cache_ttl", 3600)  # Default 1 hour
        
        # Component initialization
        self.components = {}
        self.component_overrides = component_overrides or {}
        
        # System status tracking
        self.status = {
            "initialized": False,
            "start_time": datetime.now().isoformat(),
            "component_status": {},
            "errors": []
        }
        
        # Locks for thread safety
        self.locks = {
            "cache": threading.RLock(),
            "components": threading.RLock()
        }
        
        # Default session handler - can be replaced
        self._session_handler = self._default_session_handler
        
        # Initialize components
        self._initialize_components()
        
        self.status["initialized"] = True
        self.logger.info("Tamkeen AI Career System initialized")
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Load configuration from file or use defaults"""
        default_config = {
            "data_dir": os.path.join(os.getcwd(), "tamkeen_data"),
            "cache_ttl": 3600,
            "components": {
                comp: {"enabled": True} for comp in COMPONENT_NAMES
            },
            "api": {
                "rate_limit": 100,
                "timeout": 30
            },
            "system": {
                "thread_pool_size": 10,
                "max_retries": 3
            }
        }
        
        if not config_path or not os.path.exists(config_path):
            self.logger.warning("No config file found, using defaults")
            return default_config
            
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                
            # Merge with defaults for any missing keys
            merged_config = default_config.copy()
            
            # Helper function for recursive dict update
            def update_dict(d, u):
                for k, v in u.items():
                    if isinstance(v, dict) and k in d and isinstance(d[k], dict):
                        d[k] = update_dict(d[k], v)
                    else:
                        d[k] = v
                return d
                
            merged_config = update_dict(merged_config, config)
            return merged_config
            
        except Exception as e:
            self.logger.error(f"Error loading config file: {str(e)}")
            return default_config
    
    def _initialize_components(self) -> None:
        """Initialize all enabled components"""
        components_config = self.config.get("components", {})
        
        # Define dependency order
        dependency_order = [
            "resume_analyzer",
            "sentiment_analyzer",
            "skill_gap_predictor",
            "resume_manager",
            "enhanced_interview",
            "job_recommendation_engine",
            "feedback_generator", 
            "dashboard_data_engine",
            "analytics_engine"
        ]
        
        # Initialize in dependency order
        for component_name in dependency_order:
            component_config = components_config.get(component_name, {})
            
            # Skip if component explicitly disabled in config
            if not component_config.get("enabled", True):
                self.logger.info(f"Component {component_name} is disabled in config")
                self.status["component_status"][component_name] = "disabled"
                continue
                
            # Use override if provided
            if component_name in self.component_overrides:
                self.components[component_name] = self.component_overrides[component_name]
                self.logger.info(f"Using override for component {component_name}")
                self.status["component_status"][component_name] = "override"
                continue
                
            # Otherwise initialize normally
            try:
                component_instance = self._init_component(component_name, component_config)
                if component_instance:
                    with self.locks["components"]:
                        self.components[component_name] = component_instance
                    self.status["component_status"][component_name] = "ok"
                    self.logger.info(f"Component {component_name} initialized")
                else:
                    self.status["component_status"][component_name] = "failed"
                    self.logger.error(f"Failed to initialize component {component_name}")
            except Exception as e:
                self.status["component_status"][component_name] = "error"
                error_details = {
                    "component": component_name,
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                    "timestamp": datetime.now().isoformat()
                }
                self.status["errors"].append(error_details)
                self.logger.error(f"Error initializing {component_name}: {str(e)}")
    
    def _init_component(self, 
                       component_name: str, 
                       component_config: Dict[str, Any]) -> Optional[Any]:
        """Initialize a specific component"""
        # Component class naming convention (convert snake_case to CamelCase)
        parts = component_name.split('_')
        class_name = ''.join(part.capitalize() for part in parts)
        
        # Component-specific initialization
        component_data_dir = os.path.join(self.data_dir, component_name)
        
        try:
            # Import the module
            module_name = f"TamkeenAI_CareerSystem.backend.core.{component_name}"
            module = importlib.import_module(module_name)
            
            # Get the class
            ComponentClass = getattr(module, class_name)
            
            # Initialize with appropriate parameters
            if component_name == "resume_analyzer":
                return ComponentClass(
                    data_dir=component_data_dir,
                    cache_ttl=component_config.get("cache_ttl", self.cache_ttl)
                )
            elif component_name == "sentiment_analyzer":
                return ComponentClass(
                    data_dir=component_data_dir,
                    model_name=component_config.get("model_name", "default")
                )
            elif component_name == "skill_gap_predictor":
                return ComponentClass(
                    data_dir=component_data_dir,
                    skills_db_path=component_config.get("skills_db_path")
                )
            elif component_name == "enhanced_interview":
                return ComponentClass(
                    data_dir=component_data_dir,
                    question_bank_path=component_config.get("question_bank_path"),
                    sentiment_analyzer=self.components.get("sentiment_analyzer")
                )
            elif component_name == "feedback_generator":
                return ComponentClass(
                    data_dir=component_data_dir
                )
            elif component_name == "dashboard_data_engine":
                return ComponentClass(
                    data_dir=component_data_dir,
                    cache_ttl=component_config.get("cache_ttl", self.cache_ttl)
                )
            elif component_name == "analytics_engine":
                return ComponentClass(
                    data_dir=component_data_dir,
                    admin_mode=component_config.get("admin_mode", False)
                )
            elif component_name == "resume_manager":
                return ComponentClass(
                    storage_dir=component_data_dir,
                    max_versions=component_config.get("max_versions", 10)
                )
            elif component_name == "job_recommendation_engine":
                return ComponentClass(
                    data_dir=component_data_dir,
                    job_data_sources=component_config.get("job_data_sources")
                )
            else:
                # Generic initialization for other components
                return ComponentClass(
                    data_dir=component_data_dir
                )
        except ImportError as e:
            self.logger.error(f"Component module {component_name} not found: {str(e)}")
            return None
        except AttributeError as e:
            self.logger.error(f"Component class {class_name} not found: {str(e)}")
            return None
        except Exception as e:
            self.logger.error(f"Error initializing component {component_name}: {str(e)}")
            return None
    
    def _default_session_handler(self, 
                               user_id: str, 
                               session_id: Optional[str] = None, 
                               session_data: Optional[Dict[str, Any]] = None) -> str:
        """Default session management handler"""
        session_dir = os.path.join(self.user_data_dir, user_id, "sessions")
        os.makedirs(session_dir, exist_ok=True)
        
        # If no session ID provided, create new session
        if not session_id:
            session_id = str(uuid.uuid4())
            if not session_data:
                session_data = {}
                
            session_data.update({
                "session_id": session_id,
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat(),
                "status": "active"
            })
            
            # Write session data
            with open(os.path.join(session_dir, f"{session_id}.json"), 'w') as f:
                json.dump(session_data, f, indent=2)
                
            return session_id
            
        # Otherwise update existing session
        else:
            session_file = os.path.join(session_dir, f"{session_id}.json")
            
            if os.path.exists(session_file):
                try:
                    with open(session_file, 'r') as f:
                        existing_data = json.load(f)
                        
                    if session_data:
                        existing_data.update(session_data)
                        
                    existing_data["last_updated"] = datetime.now().isoformat()
                    
                    with open(session_file, 'w') as f:
                        json.dump(existing_data, f, indent=2)
                        
                    return session_id
                    
                except Exception as e:
                    self.logger.error(f"Error updating session {session_id}: {str(e)}")
                    return session_id
            else:
                # Session doesn't exist, create it
                return self._default_session_handler(user_id, None, session_data)
    
    def get_component(self, component_name: str) -> Optional[Any]:
        """Get a component instance by name"""
        return self.components.get(component_name)
    
    def cache_result(self, key: str, data: Any, ttl: Optional[int] = None) -> None:
        """Cache a result with a time-to-live"""
        if not self.cache_enabled:
            return
            
        with self.locks["cache"]:
            self.cache[key] = {
                "data": data,
                "timestamp": time.time(),
                "ttl": ttl or self.cache_ttl
            }
    
    def get_cached_result(self, key: str) -> Optional[Any]:
        """Get a cached result if valid"""
        if not self.cache_enabled or key not in self.cache:
            return None
            
        with self.locks["cache"]:
            cache_entry = self.cache.get(key)
            if not cache_entry:
                return None
                
            # Check if cache is still valid
            age = time.time() - cache_entry["timestamp"]
            if age > cache_entry["ttl"]:
                # Cache expired
                del self.cache[key]
                return None
                
            return cache_entry["data"]
    
    def analyze_resume(self, 
                      user_id: str,
                      file_path: str,
                      session_id: Optional[str] = None,
                      options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze a resume file"""
        try:
            # Get required components
            resume_analyzer = self.get_component("resume_analyzer")
            resume_manager = self.get_component("resume_manager")
            
            if not resume_analyzer:
                return {"error": "Resume analyzer component not available"}
                
            # Generate cache key
            cache_key = f"resume_analysis_{user_id}_{os.path.basename(file_path)}_{hash(json.dumps(options or {}))}"
            
            # Check cache
            cached = self.get_cached_result(cache_key)
            if cached:
                return cached
                
            # Store resume first if resume manager is available
            resume_data = None
            if resume_manager:
                storage_result = resume_manager.store_resume(
                    user_id=user_id,
                    file_path=file_path,
                    metadata={"source": "resume_analysis"}
                )
                
                if storage_result.get("success"):
                    # Get the stored resume data
                    resume_data = resume_manager.get_resume_version(
                        user_id=user_id,
                        version_id=storage_result.get("version_id")
                    )
            
            # Analyze the resume
            analysis_result = resume_analyzer.analyze_resume(
                file_path=file_path,
                options=options
            )
            
            # Combine resume data and analysis
            if resume_data and not "error" in analysis_result:
                # Update resume data with analysis
                if resume_manager:
                    resume_manager.update_resume_metadata(
                        user_id=user_id,
                        version_id=resume_data.get("version_id"),
                        metadata={
                            "analysis": analysis_result,
                            "analyzed_at": datetime.now().isoformat()
                        }
                    )
                
                # Combine the results
                result = {
                    "resume_id": resume_data.get("version_id"),
                    "analysis": analysis_result,
                    "storage": {
                        "version_id": resume_data.get("version_id"),
                        "version_name": resume_data.get("version_name"),
                        "created_at": resume_data.get("created_at")
                    }
                }
            else:
                # Just return the analysis
                result = analysis_result
            
            # Update session if provided
            if session_id:
                session_data = {
                    "last_activity": "resume_analysis",
                    "resume_analysis": {
                        "timestamp": datetime.now().isoformat(),
                        "resume_id": resume_data.get("version_id") if resume_data else None
                    }
                }
                self._session_handler(user_id, session_id, session_data)
            
            # Cache the result
            self.cache_result(cache_key, result)
            
            return result
            
        except Exception as e:
            error_details = {
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            self.logger.error(f"Error in analyze_resume: {str(e)}")
            return {"error": str(e), "details": error_details if self.debug_mode else None}
    
    def predict_skill_gaps(self,
                         user_id: str,
                         target_job: str,
                         resume_data: Optional[Dict[str, Any]] = None,
                         resume_id: Optional[str] = None,
                         session_id: Optional[str] = None,
                         options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Predict skill gaps for a target job"""
        try:
            # Get required components
            skill_gap_predictor = self.get_component("skill_gap_predictor")
            resume_manager = self.get_component("resume_manager")
            
            if not skill_gap_predictor:
                return {"error": "Skill gap predictor component not available"}
                
            # Load resume data if resume_id provided but not resume_data
            if resume_id and not resume_data and resume_manager:
                resume_data = resume_manager.get_resume_version(
                    user_id=user_id,
                    version_id=resume_id
                )
            
            # Generate cache key
            cache_key = f"skill_gap_{user_id}_{target_job}_{hash(json.dumps(options or {}))}"
            if resume_id:
                cache_key += f"_{resume_id}"
                
            # Check cache
            cached = self.get_cached_result(cache_key)
            if cached:
                return cached
                
            # Predict skill gaps
            prediction_result = skill_gap_predictor.predict_skill_gaps(
                target_job=target_job,
                resume_data=resume_data,
                options=options
            )
            
            # Update session if provided
            if session_id:
                session_data = {
                    "last_activity": "skill_gap_prediction",
                    "skill_gap_prediction": {
                        "timestamp": datetime.now().isoformat(),
                        "target_job": target_job,
                        "resume_id": resume_id
                    }
                }
                self._session_handler(user_id, session_id, session_data)
            
            # Cache the result
            self.cache_result(cache_key, prediction_result)
            
            return prediction_result
            
        except Exception as e:
            error_details = {
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            self.logger.error(f"Error in predict_skill_gaps: {str(e)}")
            return {"error": str(e), "details": error_details if self.debug_mode else None}
    
    def simulate_interview(self,
                         user_id: str,
                         job_title: str,
                         session_id: Optional[str] = None,
                         resume_id: Optional[str] = None,
                         options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Start or continue an interview simulation"""
        try:
            # Get required components
            interview = self.get_component("enhanced_interview")
            
            if not interview:
                return {"error": "Interview component not available"}
            
            # Get resume if needed
            resume_data = None
            if resume_id:
                resume_manager = self.get_component("resume_manager")
                if resume_manager:
                    resume_data = resume_manager.get_resume_version(
                        user_id=user_id,
                        version_id=resume_id
                    )
            
            # Handle interview action
            action = options.get("action", "start")
            interview_id = options.get("interview_id")
            
            if action == "start":
                # Start new interview
                result = interview.start_interview(
                    job_title=job_title,
                    user_id=user_id,
                    resume_data=resume_data,
                    options=options
                )
                
                # Update session
                if session_id:
                    session_data = {
                        "last_activity": "interview_start",
                        "interview": {
                            "timestamp": datetime.now().isoformat(),
                            "interview_id": result.get("interview_id"),
                            "job_title": job_title
                        }
                    }
                    self._session_handler(user_id, session_id, session_data)
                    
            elif action == "answer":
                # Process answer
                result = interview.process_answer(
                    interview_id=interview_id,
                    answer=options.get("answer", ""),
                    options=options
                )
                
                # Update session
                if session_id:
                    session_data = {
                        "last_activity": "interview_answer",
                        "interview": {
                            "timestamp": datetime.now().isoformat(),
                            "interview_id": interview_id,
                            "current_question": result.get("current_question_index")
                        }
                    }
                    self._session_handler(user_id, session_id, session_data)
                    
            elif action == "end":
                # End interview
                result = interview.end_interview(
                    interview_id=interview_id,
                    options=options
                )
                
                # Update session
                if session_id:
                    session_data = {
                        "last_activity": "interview_end",
                        "interview": {
                            "timestamp": datetime.now().isoformat(),
                            "interview_id": interview_id,
                            "completed": True,
                            "overall_score": result.get("overall_score")
                        }
                    }
                    self._session_handler(user_id, session_id, session_data)
                    
                # Generate feedback if feedback generator is available
                feedback_generator = self.get_component("feedback_generator")
                if feedback_generator and "results" in result:
                    feedback = feedback_generator.generate_interview_feedback(
                        user_id=user_id,
                        interview_results=result["results"],
                        job_title=job_title
                    )
                    result["feedback"] = feedback
                    
            else:
                return {"error": f"Unknown interview action: {action}"}
            
            return result
            
        except Exception as e:
            error_details = {
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            self.logger.error(f"Error in simulate_interview: {str(e)}")
            return {"error": str(e), "details": error_details if self.debug_mode else None}
    
    def get_job_recommendations(self,
                              user_id: str,
                              session_id: Optional[str] = None,
                              resume_id: Optional[str] = None,
                              skill_data: Optional[Dict[str, Any]] = None,
                              preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get personalized job recommendations"""
        try:
            # Get required components
            job_engine = self.get_component("job_recommendation_engine")
            
            if not job_engine:
                return {"error": "Job recommendation engine not available"}
            
            # Load resume data if needed
            resume_data = None
            if resume_id:
                resume_manager = self.get_component("resume_manager")
                if resume_manager:
                    resume_data = resume_manager.get_resume_version(
                        user_id=user_id,
                        version_id=resume_id
                    )
            
            # Generate cache key
            prefs_hash = hash(json.dumps(preferences or {})) if preferences else "none"
            skills_hash = hash(json.dumps(skill_data or {})) if skill_data else "none"
            
            cache_key = f"job_rec_{user_id}_{resume_id or 'none'}_{skills_hash}_{prefs_hash}"
            
            # Check cache
            cached = self.get_cached_result(cache_key)
            if cached:
                return cached
            
            # Get job history if analytics engine is available
            job_history = None
            analytics = self.get_component("analytics_engine")
            if analytics:
                job_history = analytics.get_user_job_history(user_id)
            
            # Get recommendations
            recommendations = job_engine.get_personalized_recommendations(
                user_id=user_id,
                resume_data=resume_data,
                skill_data=skill_data,
                user_preferences=preferences,
                job_history=job_history
            )
            
            # Update session if provided
            if session_id:
                session_data = {
                    "last_activity": "job_recommendations",
                    "job_recommendations": {
                        "timestamp": datetime.now().isoformat(),
                        "count": len(recommendations.get("recommended_jobs", [])),
                        "resume_id": resume_id
                    }
                }
                self._session_handler(user_id, session_id, session_data)
            
            # Cache the result
            self.cache_result(cache_key, recommendations, ttl=1800)  # 30 minute cache
            
            return recommendations
            
        except Exception as e:
            error_details = {
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            self.logger.error(f"Error in get_job_recommendations: {str(e)}")
            return {"error": str(e), "details": error_details if self.debug_mode else None}
    
    def get_dashboard_data(self,
                         user_id: str,
                         session_id: Optional[str] = None,
                         components: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get data for user dashboard"""
        try:
            # Get required components
            dashboard_engine = self.get_component("dashboard_data_engine")
            
            if not dashboard_engine:
                return {"error": "Dashboard data engine not available"}
            
            # Default to all dashboard components if not specified
            if not components:
                components = ["overview", "resume", "skills", "interviews", "jobs", "learning"]
            
            # Generate cache key
            components_str = "_".join(sorted(components))
            cache_key = f"dashboard_{user_id}_{components_str}"
            
            # Check cache (with shorter TTL for dashboard data)
            cached = self.get_cached_result(cache_key)
            if cached:
                return cached
            
            # Get data from various components
            resume_data = None
            skill_data = None
            interview_data = None
            job_data = None
            learning_data = None
            
            # Get resume data if needed
            if "resume" in components or "overview" in components:
                resume_manager = self.get_component("resume_manager")
                if resume_manager:
                    # Get latest resume
                    versions = resume_manager.get_resume_versions(user_id)
                    if versions and versions.get("versions"):
                        latest_id = versions["versions"][0].get("version_id")
                        resume_data = resume_manager.get_resume_version(
                            user_id=user_id,
                            version_id=latest_id
                        )
            
            # Get other component data as needed
            analytics = self.get_component("analytics_engine")
            if analytics:
                if "skills" in components or "overview" in components:
                    skill_data = analytics.get_user_skill_data(user_id)
                    
                if "interviews" in components or "overview" in components:
                    interview_data = analytics.get_user_interview_data(user_id)
                    
                if "jobs" in components or "overview" in components:
                    job_data = analytics.get_user_job_data(user_id)
                    
                if "learning" in components or "overview" in components:
                    learning_data = analytics.get_user_learning_data(user_id)
            
            # Generate dashboard data
            dashboard_data = dashboard_engine.generate_dashboard_data(
                user_id=user_id,
                resume_data=resume_data,
                skill_data=skill_data,
                interview_data=interview_data,
                job_data=job_data,
                learning_data=learning_data,
                components=components
            )
            
            # Update session if provided
            if session_id:
                session_data = {
                    "last_activity": "dashboard_view",
                    "dashboard": {
                        "timestamp": datetime.now().isoformat(),
                        "components": components
                    }
                }
                self._session_handler(user_id, session_id, session_data)
            
            # Cache the result with shorter TTL
            self.cache_result(cache_key, dashboard_data, ttl=300)  # 5 minute cache
            
            return dashboard_data
            
        except Exception as e:
            error_details = {
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            self.logger.error(f"Error in get_dashboard_data: {str(e)}")
            return {"error": str(e), "details": error_details if self.debug_mode else None}
    
    def generate_feedback(self,
                        user_id: str,
                        feedback_type: str,
                        data: Dict[str, Any],
                        session_id: Optional[str] = None,
                        format_type: str = "text") -> Dict[str, Any]:
        """Generate feedback based on user data"""
        try:
            # Get feedback generator component
            feedback_generator = self.get_component("feedback_generator")
            
            if not feedback_generator:
                return {"error": "Feedback generator component not available"}
            
            # Handle different feedback types
            if feedback_type == "resume":
                feedback = feedback_generator.generate_resume_feedback(
                    user_id=user_id,
                    resume_data=data,
                    format_type=format_type
                )
            elif feedback_type == "interview":
                feedback = feedback_generator.generate_interview_feedback(
                    user_id=user_id,
                    interview_results=data,
                    job_title=data.get("job_title", ""),
                    format_type=format_type
                )
            elif feedback_type == "skill_gap":
                feedback = feedback_generator.generate_skill_gap_feedback(
                    user_id=user_id,
                    skill_gap_data=data,
                    format_type=format_type
                )
            elif feedback_type == "job_application":
                feedback = feedback_generator.generate_job_application_feedback(
                    user_id=user_id,
                    application_data=data,
                    format_type=format_type
                )
            elif feedback_type == "overall":
                # Pull data from analytics engine if available
                analytics = self.get_component("analytics_engine")
                career_data = {}
                
                if analytics:
                    career_data = {
                        "resume_data": analytics.get_user_resume_data(user_id),
                        "skill_data": analytics.get_user_skill_data(user_id),
                        "interview_data": analytics.get_user_interview_data(user_id),
                        "job_data": analytics.get_user_job_data(user_id)
                    }
                
                # Merge with provided data
                career_data.update(data)
                
                feedback = feedback_generator.generate_overall_feedback(
                    user_id=user_id,
                    career_data=career_data,
                    format_type=format_type
                )
            else:
                return {"error": f"Unsupported feedback type: {feedback_type}"}
            
            # Update session if provided
            if session_id:
                session_data = {
                    "last_activity": f"feedback_{feedback_type}",
                    "feedback": {
                        "timestamp": datetime.now().isoformat(),
                        "type": feedback_type,
                        "format": format_type
                    }
                }
                self._session_handler(user_id, session_id, session_data)
            
            return {
                "feedback_type": feedback_type,
                "format": format_type,
                "feedback": feedback,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            error_details = {
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            self.logger.error(f"Error in generate_feedback: {str(e)}")
            return {"error": str(e), "details": error_details if self.debug_mode else None}
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get system status information"""
        # Update current status
        self.status["uptime_seconds"] = (datetime.now() - 
                                       datetime.fromisoformat(self.status["start_time"])).total_seconds()
        
        self.status["current_time"] = datetime.now().isoformat()
        self.status["cache_size"] = len(self.cache)
        
        # Get component-specific status
        updated_component_status = {}
        
        for name, component in self.components.items():
            if hasattr(component, "get_status"):
                try:
                    component_status = component.get_status()
                    updated_component_status[name] = component_status
                except Exception as e:
                    updated_component_status[name] = {
                        "error": str(e),
                        "status": "error"
                    }
            else:
                updated_component_status[name] = self.status["component_status"].get(name, "unknown")
                
        self.status["component_status"] = updated_component_status
        
        # Remove detailed error information for non-debug mode
        if not self.debug_mode:
            sanitized_status = self.status.copy()
            if "errors" in sanitized_status:
                sanitized_errors = []
                for error in sanitized_status["errors"]:
                    sanitized_error = {k: v for k, v in error.items() if k != "traceback"}
                    sanitized_errors.append(sanitized_error)
                sanitized_status["errors"] = sanitized_errors
            return sanitized_status
            
        return self.status
    
    def create_user_session(self, user_id: str, initial_data: Optional[Dict[str, Any]] = None) -> str:
        """Create a new user session"""
        return self._session_handler(user_id, None, initial_data)
    
    def update_user_session(self, user_id: str, session_id: str, 
                          session_data: Dict[str, Any]) -> str:
        """Update an existing user session"""
        return self._session_handler(user_id, session_id, session_data) 