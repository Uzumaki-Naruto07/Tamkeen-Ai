import os
import json
import logging
import hashlib
import time
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime, timedelta
import calendar
import math
from collections import defaultdict, Counter

# Optional dependencies - allow graceful fallback if not available
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False


class DashboardDataEngine:
    """
    Processes and prepares data for career development dashboards.
    
    Key features:
    - Aggregates data from multiple career assessment sources
    - Generates metrics and KPIs for dashboard widgets
    - Creates formatted datasets for visualizations
    - Provides insights summaries for quick dashboard views
    - Tracks progress and trends over time
    """
    
    def __init__(self, 
                data_dir: Optional[str] = None,
                cache_dir: Optional[str] = None,
                cache_ttl: int = 3600):
        """
        Initialize the dashboard data engine
        
        Args:
            data_dir: Directory for storing dashboard data
            cache_dir: Directory for caching processed results
            cache_ttl: Cache time-to-live in seconds
        """
        self.logger = logging.getLogger(__name__)
        
        # Set up data directory
        if data_dir:
            os.makedirs(data_dir, exist_ok=True)
            self.data_dir = data_dir
        else:
            self.data_dir = os.path.join(os.getcwd(), "dashboard_data")
            os.makedirs(self.data_dir, exist_ok=True)
            
        # Set up cache
        if cache_dir:
            os.makedirs(cache_dir, exist_ok=True)
            self.cache_dir = cache_dir
        else:
            self.cache_dir = os.path.join(self.data_dir, "cache")
            os.makedirs(self.cache_dir, exist_ok=True)
            
        self.cache_ttl = cache_ttl
        
        # Initialize data stores
        self.cached_data = {}
        
        self.logger.info("Dashboard data engine initialized")
    
    def generate_overview_data(self, 
                             user_id: str,
                             resume_data: Optional[Dict[str, Any]] = None,
                             skill_data: Optional[Dict[str, Any]] = None,
                             interview_data: Optional[Dict[str, Any]] = None,
                             job_data: Optional[Dict[str, Any]] = None,
                             all_feedback: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate overview dashboard data for a user
        
        Args:
            user_id: User identifier
            resume_data: Resume analysis results
            skill_data: Skill gap analysis results
            interview_data: Interview performance results
            job_data: Job application/tracking data
            all_feedback: All feedback history
            
        Returns:
            Dictionary with overview dashboard data
        """
        cache_key = f"overview_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Calculate primary metrics
            career_readiness = self._calculate_career_readiness(
                resume_data, skill_data, interview_data)
            
            # Get application funnel data
            application_funnel = self._get_application_funnel(job_data)
            
            # Get skill gap summary
            skill_gap_summary = self._get_skill_gap_summary(skill_data)
            
            # Get recent activity
            recent_activity = self._get_recent_activity(
                resume_data, skill_data, interview_data, job_data, all_feedback)
            
            # Get improvement metrics
            improvement_metrics = self._get_improvement_metrics(all_feedback)
            
            # Get recommended next actions
            next_actions = self._get_recommended_actions(
                resume_data, skill_data, interview_data, job_data, career_readiness)
            
            # Assemble complete overview data
            overview_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "career_readiness": career_readiness,
                "application_funnel": application_funnel,
                "skill_gap_summary": skill_gap_summary,
                "recent_activity": recent_activity,
                "improvement_metrics": improvement_metrics,
                "recommended_actions": next_actions
            }
            
            # Cache the result
            self._cache_result(cache_key, overview_data)
            
            return overview_data
            
        except Exception as e:
            self.logger.error(f"Error generating overview data: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def generate_resume_dashboard_data(self,
                                     user_id: str,
                                     resume_data: Dict[str, Any],
                                     resume_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate resume-specific dashboard data
        
        Args:
            user_id: User identifier
            resume_data: Current resume analysis results
            resume_history: Historical resume analysis results
            
        Returns:
            Dictionary with resume dashboard data
        """
        cache_key = f"resume_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Extract primary metrics
            ats_score = resume_data.get("ats_score", {}).get("score", 0)
            keyword_match = resume_data.get("keyword_match", {}).get("score", 0)
            format_score = resume_data.get("format_score", {}).get("score", 0)
            content_score = resume_data.get("content_score", {}).get("score", 0)
            
            # Get section scores
            section_scores = resume_data.get("section_scores", {})
            
            # Calculate historical trends if available
            historical_trends = {}
            if resume_history and len(resume_history) > 1:
                # Track metrics over time
                timestamps = []
                ats_scores = []
                keyword_scores = []
                
                for entry in sorted(resume_history, key=lambda x: x.get("timestamp", "")):
                    if "timestamp" in entry and "ats_score" in entry:
                        timestamps.append(entry["timestamp"])
                        ats_scores.append(entry["ats_score"].get("score", 0))
                        keyword_scores.append(entry.get("keyword_match", {}).get("score", 0))
                
                historical_trends = {
                    "timestamps": timestamps,
                    "ats_scores": ats_scores,
                    "keyword_scores": keyword_scores
                }
            
            # Get improvement suggestions
            improvement_areas = []
            if "improvement_areas" in resume_data:
                improvement_areas = resume_data["improvement_areas"]
            elif "recommendations" in resume_data:
                improvement_areas = resume_data["recommendations"]
            
            # Get keyword analysis
            keyword_analysis = resume_data.get("keyword_analysis", {})
            
            # Assemble resume dashboard data
            resume_dashboard_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "summary_metrics": {
                    "ats_score": ats_score,
                    "keyword_match": keyword_match,
                    "format_score": format_score,
                    "content_score": content_score,
                    "overall_score": resume_data.get("overall_score", 0)
                },
                "section_scores": section_scores,
                "historical_trends": historical_trends,
                "improvement_areas": improvement_areas,
                "keyword_analysis": keyword_analysis
            }
            
            # Cache the result
            self._cache_result(cache_key, resume_dashboard_data)
            
            return resume_dashboard_data
            
        except Exception as e:
            self.logger.error(f"Error generating resume dashboard data: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def generate_skill_dashboard_data(self,
                                    user_id: str,
                                    skill_data: Dict[str, Any],
                                    job_market_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate skill-specific dashboard data
        
        Args:
            user_id: User identifier
            skill_data: Skill gap analysis results
            job_market_data: Optional job market data for demand analysis
            
        Returns:
            Dictionary with skill dashboard data
        """
        cache_key = f"skill_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Extract primary data
            current_skills = skill_data.get("current_skills", [])
            missing_skills = skill_data.get("missing_skills", [])
            skill_categories = skill_data.get("skill_categories", {})
            readiness_score = skill_data.get("readiness", {}).get("score", 0)
            
            # Group skills by category
            skills_by_category = defaultdict(lambda: {"current": [], "missing": []})
            
            # Process current skills
            for skill in current_skills:
                category = "Other"
                for cat, skills in skill_categories.items():
                    if skill in skills:
                        category = cat
                        break
                skills_by_category[category]["current"].append(skill)
            
            # Process missing skills
            for skill in missing_skills:
                category = "Other"
                for cat, skills in skill_categories.items():
                    if skill in skills:
                        category = cat
                        break
                skills_by_category[category]["missing"].append(skill)
            
            # Calculate skill mastery by category
            category_mastery = {}
            for category, data in skills_by_category.items():
                total = len(data["current"]) + len(data["missing"])
                if total > 0:
                    mastery = (len(data["current"]) / total) * 100
                    category_mastery[category] = round(mastery, 1)
            
            # Calculate skill gap by priority
            skill_gap_by_priority = {
                "critical": [],
                "important": [],
                "beneficial": []
            }
            
            # Get priority assignments from skill data or assign based on demand
            for skill in missing_skills:
                priority = "beneficial"
                if "skill_priorities" in skill_data and skill in skill_data["skill_priorities"]:
                    priority = skill_data["skill_priorities"][skill]
                elif job_market_data and "skill_demand" in job_market_data:
                    demand = job_market_data["skill_demand"].get(skill, 0)
                    if demand > 0.7:
                        priority = "critical"
                    elif demand > 0.4:
                        priority = "important"
                
                skill_gap_by_priority[priority].append(skill)
            
            # Get learning resources if available
            learning_resources = {}
            if "learning_resources" in skill_data:
                learning_resources = skill_data["learning_resources"]
            
            # Assemble skill dashboard data
            skill_dashboard_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "summary_metrics": {
                    "total_skills": len(current_skills),
                    "missing_skills": len(missing_skills),
                    "readiness_score": readiness_score,
                    "skill_categories": len(skills_by_category)
                },
                "skills_by_category": dict(skills_by_category),
                "category_mastery": category_mastery,
                "skill_gap_by_priority": skill_gap_by_priority,
                "learning_resources": learning_resources
            }
            
            # Cache the result
            self._cache_result(cache_key, skill_dashboard_data)
            
            return skill_dashboard_data
            
        except Exception as e:
            self.logger.error(f"Error generating skill dashboard data: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def generate_interview_dashboard_data(self,
                                        user_id: str,
                                        interview_data: Dict[str, Any],
                                        interview_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate interview-specific dashboard data
        
        Args:
            user_id: User identifier
            interview_data: Current interview analysis results
            interview_history: Historical interview results
            
        Returns:
            Dictionary with interview dashboard data
        """
        cache_key = f"interview_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Extract primary metrics
            overall_score = interview_data.get("overall_score", 0)
            
            # Get dimension scores
            dimensions = interview_data.get("dimensions", {})
            
            # Get question performance
            questions = interview_data.get("questions", [])
            question_performance = []
            
            for q in questions:
                question_performance.append({
                    "question": q.get("question", ""),
                    "score": q.get("score", 0),
                    "type": q.get("type", "general"),
                    "strengths": q.get("strengths", []),
                    "weaknesses": q.get("weaknesses", [])
                })
            
            # Calculate question type performance
            question_type_scores = defaultdict(list)
            for q in questions:
                q_type = q.get("type", "general")
                q_score = q.get("score", 0)
                question_type_scores[q_type].append(q_score)
            
            type_performance = {}
            for q_type, scores in question_type_scores.items():
                if scores:
                    type_performance[q_type] = sum(scores) / len(scores)
            
            # Calculate historical trends if available
            historical_trends = {}
            if interview_history and len(interview_history) > 1:
                # Track metrics over time
                timestamps = []
                overall_scores = []
                dimension_history = defaultdict(list)
                
                for entry in sorted(interview_history, key=lambda x: x.get("timestamp", "")):
                    if "timestamp" in entry and "overall_score" in entry:
                        timestamps.append(entry["timestamp"])
                        overall_scores.append(entry["overall_score"])
                        
                        # Track dimensions
                        for dim, score in entry.get("dimensions", {}).items():
                            dimension_history[dim].append(score)
                
                historical_trends = {
                    "timestamps": timestamps,
                    "overall_scores": overall_scores,
                    "dimension_history": dict(dimension_history)
                }
            
            # Get confidence analysis if available
            confidence_analysis = interview_data.get("confidence_analysis", {})
            
            # Get improvement suggestions
            improvement_areas = []
            if "improvement_areas" in interview_data:
                improvement_areas = interview_data["improvement_areas"]
            elif "insights" in interview_data and "areas_to_improve" in interview_data["insights"]:
                improvement_areas = interview_data["insights"]["areas_to_improve"]
            
            # Assemble interview dashboard data
            interview_dashboard_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "summary_metrics": {
                    "overall_score": overall_score,
                    "dimensions": dimensions,
                    "question_count": len(questions),
                    "type_performance": type_performance
                },
                "question_performance": question_performance,
                "historical_trends": historical_trends,
                "confidence_analysis": confidence_analysis,
                "improvement_areas": improvement_areas
            }
            
            # Cache the result
            self._cache_result(cache_key, interview_dashboard_data)
            
            return interview_dashboard_data
            
        except Exception as e:
            self.logger.error(f"Error generating interview dashboard data: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def generate_job_dashboard_data(self,
                                  user_id: str,
                                  job_data: Dict[str, Any],
                                  application_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate job application dashboard data
        
        Args:
            user_id: User identifier
            job_data: Current job application data
            application_history: Historical job application data
            
        Returns:
            Dictionary with job application dashboard data
        """
        cache_key = f"job_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Extract application stats
            applications = job_data.get("applications", [])
            
            # Count applications by status
            status_counts = Counter([app.get("status", "unknown") for app in applications])
            
            # Applications by source
            source_counts = Counter([app.get("source", "other") for app in applications])
            
            # Calculate success rate
            total_apps = len(applications)
            interviews = sum(1 for app in applications if app.get("status") in ["interview", "offer", "accepted"])
            offers = sum(1 for app in applications if app.get("status") in ["offer", "accepted"])
            
            success_metrics = {
                "application_to_interview": (interviews / total_apps * 100) if total_apps > 0 else 0,
                "interview_to_offer": (offers / interviews * 100) if interviews > 0 else 0,
                "application_to_offer": (offers / total_apps * 100) if total_apps > 0 else 0
            }
            
            # Calculate time metrics
            time_metrics = {}
            if total_apps > 0:
                response_times = []
                interview_times = []
                
                for app in applications:
                    if "applied_date" in app and "response_date" in app:
                        applied = datetime.fromisoformat(app["applied_date"])
                        response = datetime.fromisoformat(app["response_date"])
                        response_times.append((response - applied).days)
                    
                    if "interview_date" in app and "decision_date" in app:
                        interview = datetime.fromisoformat(app["interview_date"])
                        decision = datetime.fromisoformat(app["decision_date"])
                        interview_times.append((decision - interview).days)
                
                if response_times:
                    time_metrics["avg_response_time"] = sum(response_times) / len(response_times)
                    
                if interview_times:
                    time_metrics["avg_decision_time"] = sum(interview_times) / len(interview_times)
            
            # Calculate application volume over time
            time_series = {}
            if application_history:
                # Group by month
                monthly_counts = defaultdict(int)
                
                for app in applications:
                    if "applied_date" in app:
                        date = datetime.fromisoformat(app["applied_date"])
                        month_key = f"{date.year}-{date.month:02d}"
                        monthly_counts[month_key] += 1
                
                # Sort by month
                time_series["months"] = sorted(monthly_counts.keys())
                time_series["counts"] = [monthly_counts[month] for month in time_series["months"]]
            
            # Get upcoming actions
            upcoming_actions = []
            for app in applications:
                if app.get("status") in ["applied", "interview"]:
                    action = {"job_title": app.get("job_title", "Unknown Position")}
                    
                    if app.get("status") == "interview" and "interview_date" in app:
                        action["type"] = "interview"
                        action["date"] = app["interview_date"]
                        action["company"] = app.get("company", "Unknown Company")
                        upcoming_actions.append(action)
                    elif app.get("status") == "applied" and "follow_up_date" in app:
                        action["type"] = "follow_up"
                        action["date"] = app["follow_up_date"]
                        action["company"] = app.get("company", "Unknown Company")
                        upcoming_actions.append(action)
            
            # Sort by date
            upcoming_actions.sort(key=lambda x: x.get("date", "9999-12-31"))
            
            # Assemble job dashboard data
            job_dashboard_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "summary_metrics": {
                    "total_applications": total_apps,
                    "active_applications": sum(1 for app in applications if app.get("status") in ["applied", "interview"]),
                    "interviews_secured": interviews,
                    "offers_received": offers,
                    "success_rate": success_metrics
                },
                "application_status": dict(status_counts),
                "application_sources": dict(source_counts),
                "time_metrics": time_metrics,
                "application_trends": time_series,
                "upcoming_actions": upcoming_actions
            }
            
            # Cache the result
            self._cache_result(cache_key, job_dashboard_data)
            
            return job_dashboard_data
            
        except Exception as e:
            self.logger.error(f"Error generating job dashboard data: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def generate_analytics_data(self,
                              user_id: str,
                              all_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive analytics data
        
        Args:
            user_id: User identifier
            all_data: All user data and history
            
        Returns:
            Dictionary with analytics dashboard data
        """
        cache_key = f"analytics_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Extract relevant data
            resume_data = all_data.get("resume_data", {})
            skill_data = all_data.get("skill_data", {})
            interview_data = all_data.get("interview_data", {})
            job_data = all_data.get("job_data", {})
            feedback_history = all_data.get("feedback_history", [])
            
            # Calculate primary metrics
            career_progress = self._calculate_career_progress(
                all_data.get("resume_history", []),
                all_data.get("skill_history", []),
                all_data.get("interview_history", [])
            )
            
            # Create correlation analysis
            correlation_data = self._analyze_correlations(all_data)
            
            # Create benchmark comparisons
            benchmark_data = self._create_benchmark_comparison(all_data)
            
            # Create prediction data
            prediction_data = self._create_predictions(all_data)
            
            # Create insights
            insights = self._generate_analytics_insights(all_data)
            
            # Assemble analytics dashboard data
            analytics_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "career_progress": career_progress,
                "correlations": correlation_data,
                "benchmarks": benchmark_data,
                "predictions": prediction_data,
                "insights": insights
            }
            
            # Cache the result
            self._cache_result(cache_key, analytics_data)
            
            return analytics_data
            
        except Exception as e:
            self.logger.error(f"Error generating analytics data: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def _calculate_career_readiness(self,
                                  resume_data: Optional[Dict[str, Any]] = None,
                                  skill_data: Optional[Dict[str, Any]] = None,
                                  interview_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Calculate overall career readiness from all data sources"""
        try:
            # Default scores
            resume_score = 0
            skill_score = 0
            interview_score = 0
            
            # Get component scores if available
            if resume_data:
                resume_score = resume_data.get("overall_score", 0)
                if not resume_score and "ats_score" in resume_data:
                    resume_score = resume_data["ats_score"].get("score", 0)
            
            if skill_data:
                skill_score = skill_data.get("readiness", {}).get("score", 0)
                
            if interview_data:
                interview_score = interview_data.get("overall_score", 0)
            
            # Calculate component weights based on availability
            weights = {}
            if resume_score > 0:
                weights["resume"] = 0.3
            if skill_score > 0:
                weights["skill"] = 0.4
            if interview_score > 0:
                weights["interview"] = 0.3
                
            # Adjust weights if some components are missing
            total_weight = sum(weights.values())
            if total_weight > 0:
                for key in weights:
                    weights[key] /= total_weight
            
            # Calculate overall score
            overall_score = 0
            if "resume" in weights:
                overall_score += resume_score * weights["resume"]
            if "skill" in weights:
                overall_score += skill_score * weights["skill"]
            if "interview" in weights:
                overall_score += interview_score * weights["interview"]
            
            # Determine readiness level
            level = "Not Started"
            if overall_score >= 90:
                level = "Expert"
            elif overall_score >= 80:
                level = "Advanced"
            elif overall_score >= 70:
                level = "Proficient"
            elif overall_score >= 60:
                level = "Competent"
            elif overall_score >= 40:
                level = "Developing"
            elif overall_score > 0:
                level = "Beginner"
            
            # Generate component breakdown
            components = {}
            if "resume" in weights:
                components["resume"] = {
                    "score": resume_score,
                    "weight": weights["resume"]
                }
            if "skill" in weights:
                components["skill"] = {
                    "score": skill_score,
                    "weight": weights["skill"]
                }
            if "interview" in weights:
                components["interview"] = {
                    "score": interview_score,
                    "weight": weights["interview"]
                }
            
            return {
                "overall_score": round(overall_score, 1),
                "level": level,
                "components": components
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating career readiness: {str(e)}")
            return {
                "overall_score": 0,
                "level": "Error",
                "error": str(e)
            }

    def _get_application_funnel(self, job_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get application funnel data for dashboard"""
        funnel = {
            "applications": 0,
            "responses": 0,
            "interviews": 0,
            "offers": 0,
            "accepted": 0
        }
        
        if not job_data or "applications" not in job_data:
            return funnel
            
        applications = job_data.get("applications", [])
        
        # Count applications by status
        funnel["applications"] = len(applications)
        funnel["responses"] = sum(1 for app in applications if app.get("status") != "applied")
        funnel["interviews"] = sum(1 for app in applications if app.get("status") in ["interview", "offer", "accepted"])
        funnel["offers"] = sum(1 for app in applications if app.get("status") in ["offer", "accepted"])
        funnel["accepted"] = sum(1 for app in applications if app.get("status") == "accepted")
        
        return funnel
    
    def _get_skill_gap_summary(self, skill_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get skill gap summary for dashboard"""
        summary = {
            "total_skills": 0,
            "acquired_skills": 0,
            "missing_skills": 0,
            "critical_gaps": 0,
            "readiness": 0
        }
        
        if not skill_data:
            return summary
        
        # Extract skill counts
        current_skills = skill_data.get("current_skills", [])
        missing_skills = skill_data.get("missing_skills", [])
        
        summary["acquired_skills"] = len(current_skills)
        summary["missing_skills"] = len(missing_skills)
        summary["total_skills"] = summary["acquired_skills"] + summary["missing_skills"]
        
        # Get readiness score
        if "readiness" in skill_data:
            summary["readiness"] = skill_data["readiness"].get("score", 0)
        
        # Count critical gaps
        if "skill_priorities" in skill_data:
            for skill in missing_skills:
                if skill_data["skill_priorities"].get(skill) == "critical":
                    summary["critical_gaps"] += 1
        
        return summary
    
    def _get_recent_activity(self,
                           resume_data: Optional[Dict[str, Any]] = None,
                           skill_data: Optional[Dict[str, Any]] = None,
                           interview_data: Optional[Dict[str, Any]] = None,
                           job_data: Optional[Dict[str, Any]] = None,
                           all_feedback: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Get recent activity for dashboard"""
        activities = []
        
        # Add resume activity
        if resume_data and "timestamp" in resume_data:
            activities.append({
                "type": "resume",
                "action": "Resume Analysis",
                "timestamp": resume_data["timestamp"],
                "details": f"Resume analyzed with score: {resume_data.get('overall_score', 0)}"
            })
        
        # Add skill activity
        if skill_data and "timestamp" in skill_data:
            activities.append({
                "type": "skill",
                "action": "Skill Gap Analysis",
                "timestamp": skill_data["timestamp"],
                "details": f"Skill analysis with {skill_data.get('missing_skills', []).__len__()} gaps identified"
            })
        
        # Add interview activity
        if interview_data and "timestamp" in interview_data:
            activities.append({
                "type": "interview",
                "action": "Interview Practice",
                "timestamp": interview_data["timestamp"],
                "details": f"Interview completed with score: {interview_data.get('overall_score', 0)}"
            })
        
        # Add job application activity
        if job_data and "applications" in job_data:
            for app in job_data["applications"][:5]:  # Get most recent 5
                if "applied_date" in app:
                    activities.append({
                        "type": "job",
                        "action": f"Applied to {app.get('company', 'Company')}",
                        "timestamp": app["applied_date"],
                        "details": f"Applied for {app.get('job_title', 'position')} at {app.get('company', 'Company')}"
                    })
        
        # Add feedback activity
        if all_feedback:
            for feedback in all_feedback[:5]:  # Get most recent 5
                if "timestamp" in feedback and "feedback_type" in feedback:
                    activities.append({
                        "type": "feedback",
                        "action": f"{feedback['feedback_type'].title()} Feedback",
                        "timestamp": feedback["timestamp"],
                        "details": f"Received feedback on {feedback['feedback_type']}"
                    })
        
        # Sort by timestamp (most recent first)
        activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        # Limit to 10 most recent activities
        return activities[:10]
    
    def _get_improvement_metrics(self, all_feedback: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Get improvement metrics from feedback history"""
        metrics = {
            "overall_improvement": 0,
            "resume_improvement": 0,
            "skill_improvement": 0,
            "interview_improvement": 0
        }
        
        if not all_feedback:
            return metrics
        
        # Group feedback by type
        feedback_by_type = defaultdict(list)
        for feedback in all_feedback:
            if "feedback_type" in feedback and "timestamp" in feedback:
                feedback_by_type[feedback["feedback_type"]].append(feedback)
        
        # Calculate resume improvement
        if "resume" in feedback_by_type and len(feedback_by_type["resume"]) >= 2:
            resume_feedback = sorted(feedback_by_type["resume"], key=lambda x: x["timestamp"])
            first = resume_feedback[0]
            last = resume_feedback[-1]
            
            first_score = first.get("scores", {}).get("overall", 0)
            last_score = last.get("scores", {}).get("overall", 0)
            
            if first_score > 0:
                metrics["resume_improvement"] = round((last_score - first_score) / first_score * 100, 1)
        
        # Calculate skill improvement
        if "skill_gap" in feedback_by_type and len(feedback_by_type["skill_gap"]) >= 2:
            skill_feedback = sorted(feedback_by_type["skill_gap"], key=lambda x: x["timestamp"])
            first = skill_feedback[0]
            last = skill_feedback[-1]
            
            first_score = first.get("readiness", {}).get("score", 0)
            last_score = last.get("readiness", {}).get("score", 0)
            
            if first_score > 0:
                metrics["skill_improvement"] = round((last_score - first_score) / first_score * 100, 1)
        
        # Calculate interview improvement
        if "interview" in feedback_by_type and len(feedback_by_type["interview"]) >= 2:
            interview_feedback = sorted(feedback_by_type["interview"], key=lambda x: x["timestamp"])
            first = interview_feedback[0]
            last = interview_feedback[-1]
            
            first_score = first.get("overall_score", 0)
            last_score = last.get("overall_score", 0)
            
            if first_score > 0:
                metrics["interview_improvement"] = round((last_score - first_score) / first_score * 100, 1)
        
        # Calculate overall improvement
        if metrics["resume_improvement"] or metrics["skill_improvement"] or metrics["interview_improvement"]:
            total = 0
            count = 0
            
            if metrics["resume_improvement"]:
                total += metrics["resume_improvement"]
                count += 1
            
            if metrics["skill_improvement"]:
                total += metrics["skill_improvement"]
                count += 1
            
            if metrics["interview_improvement"]:
                total += metrics["interview_improvement"]
                count += 1
            
            if count > 0:
                metrics["overall_improvement"] = round(total / count, 1)
        
        return metrics
    
    def _get_recommended_actions(self,
                               resume_data: Optional[Dict[str, Any]] = None,
                               skill_data: Optional[Dict[str, Any]] = None,
                               interview_data: Optional[Dict[str, Any]] = None,
                               job_data: Optional[Dict[str, Any]] = None,
                               career_readiness: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get recommended actions for dashboard"""
        actions = []
        
        # Resume actions
        if resume_data:
            ats_score = resume_data.get("ats_score", {}).get("score", 0)
            if ats_score < 70:
                actions.append({
                    "type": "resume",
                    "priority": "high" if ats_score < 50 else "medium",
                    "action": "Improve ATS Compatibility",
                    "description": "Update your resume to better match ATS requirements",
                    "link": "/resume/improve"
                })
        else:
            actions.append({
                "type": "resume",
                "priority": "high",
                "action": "Upload Your Resume",
                "description": "Upload your resume for ATS compatibility analysis",
                "link": "/resume/upload"
            })
        
        # Skill actions
        if skill_data:
            readiness = skill_data.get("readiness", {}).get("score", 0)
            missing_skills = skill_data.get("missing_skills", [])
            
            if missing_skills and readiness < 70:
                top_skill = missing_skills[0]
                actions.append({
                    "type": "skill",
                    "priority": "high" if readiness < 50 else "medium",
                    "action": f"Learn {top_skill}",
                    "description": f"Start learning {top_skill} to improve job readiness",
                    "link": f"/skills/learn/{top_skill.lower().replace(' ', '-')}"
                })
        else:
            actions.append({
                "type": "skill",
                "priority": "medium",
                "action": "Complete Skill Assessment",
                "description": "Identify skill gaps for your target career",
                "link": "/skills/assessment"
            })
        
        # Interview actions
        if interview_data:
            overall_score = interview_data.get("overall_score", 0)
            if overall_score < 70:
                weak_area = "general"
                min_score = 100
                
                for dimension, score in interview_data.get("dimensions", {}).items():
                    if score < min_score:
                        min_score = score
                        weak_area = dimension
                
                readable_area = weak_area.replace("_", " ").title()
                
                actions.append({
                    "type": "interview",
                    "priority": "high" if overall_score < 50 else "medium",
                    "action": f"Practice {readable_area} Responses",
                    "description": f"Improve your {readable_area.lower()} in interview responses",
                    "link": f"/interview/practice/{weak_area}"
                })
        else:
            actions.append({
                "type": "interview",
                "priority": "medium",
                "action": "Complete Practice Interview",
                "description": "Practice with AI-powered interview simulation",
                "link": "/interview/start"
            })
        
        # Job application actions
        if job_data:
            applications = job_data.get("applications", [])
            active_count = sum(1 for app in applications 
                             if app.get("status") not in ["rejected", "declined", "closed"])
            
            if active_count < 3:
                actions.append({
                    "type": "job",
                    "priority": "medium",
                    "action": "Apply to More Jobs",
                    "description": "Increase your chances by applying to more positions",
                    "link": "/jobs/search"
                })
            
            needs_followup = [app for app in applications 
                            if app.get("status") == "applied" 
                            and app.get("applied_date") 
                            and datetime.fromisoformat(app["applied_date"]) < datetime.now() - timedelta(days=7)]
            
            if needs_followup:
                company = needs_followup[0].get("company", "a company")
                actions.append({
                    "type": "job",
                    "priority": "medium",
                    "action": f"Follow Up with {company}",
                    "description": "Send a follow-up message for your application",
                    "link": f"/jobs/application/{needs_followup[0].get('id', '')}/followup"
                })
        else:
            actions.append({
                "type": "job",
                "priority": "low",
                "action": "Start Job Search",
                "description": "Begin tracking your job applications",
                "link": "/jobs/search"
            })
        
        # Career readiness actions
        if career_readiness:
            overall_score = career_readiness.get("overall_score", 0)
            if overall_score < 70:
                lowest_component = "general"
                min_score = 100
                
                for component, score in career_readiness.get("components", {}).items():
                    if score < min_score:
                        min_score = score
                        lowest_component = component
                
                readable_component = lowest_component.replace("_", " ").title()
                
                actions.append({
                    "type": "career",
                    "priority": "high",
                    "action": f"Focus on {readable_component}",
                    "description": f"Improve your {readable_component.lower()} to boost career readiness",
                    "link": f"/{lowest_component}/improve"
                })
        
        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        actions.sort(key=lambda x: priority_order.get(x.get("priority"), 99))
        
        # Limit to top 5 actions
        return actions[:5]
    
    def generate_job_search_dashboard(self,
                                   user_id: str,
                                   job_data: Dict[str, Any],
                                   resume_data: Optional[Dict[str, Any]] = None,
                                   skill_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate job search dashboard data
        
        Args:
            user_id: User identifier
            job_data: Job application tracking data
            resume_data: Resume analysis for job matching
            skill_data: Skill data for job matching
            
        Returns:
            Dictionary with job search dashboard data
        """
        cache_key = f"job_search_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Get application funnel
            application_funnel = self._get_application_funnel(job_data)
            
            # Get application timeline
            timeline_data = self._get_application_timeline(job_data)
            
            # Get status by company
            company_data = self._get_applications_by_company(job_data)
            
            # Get application-to-interview ratio
            app_interview_ratio = self._get_application_interview_ratio(job_data)
            
            # Get top matching jobs if resume and skill data available
            matching_jobs = []
            if resume_data and skill_data and "job_data" in job_data:
                matching_jobs = self._get_top_matching_jobs(
                    job_data.get("job_data", []), resume_data, skill_data)
            
            # Get job search insights
            insights = self._get_job_search_insights(job_data)
            
            # Assemble dashboard data
            dashboard_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "application_funnel": application_funnel,
                "timeline_data": timeline_data,
                "company_data": company_data,
                "application_interview_ratio": app_interview_ratio,
                "matching_jobs": matching_jobs,
                "insights": insights
            }
            
            # Cache the result
            self._cache_result(cache_key, dashboard_data)
            
            return dashboard_data
            
        except Exception as e:
            self.logger.error(f"Error generating job search dashboard: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def generate_skill_development_dashboard(self,
                                          user_id: str,
                                          skill_data: Dict[str, Any],
                                          skill_history: Optional[List[Dict[str, Any]]] = None,
                                          learning_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate skill development dashboard data
        
        Args:
            user_id: User identifier
            skill_data: Current skill assessment data
            skill_history: Historical skill assessment data
            learning_data: Learning progress data
            
        Returns:
            Dictionary with skill development dashboard data
        """
        cache_key = f"skill_dev_{user_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:8]}"
        
        try:
            # Get skill gap summary
            skill_gap_summary = self._get_skill_gap_summary(skill_data)
            
            # Get skill strength areas
            strength_areas = self._get_skill_strength_areas(skill_data)
            
            # Get skill progress over time
            skill_progress = self._get_skill_progress_over_time(skill_history)
            
            # Get learning progress
            learning_progress = self._get_learning_progress(learning_data)
            
            # Get recommended learning paths
            learning_paths = self._get_recommended_learning_paths(skill_data, learning_data)
            
            # Assemble dashboard data
            dashboard_data = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "skill_gap_summary": skill_gap_summary,
                "strength_areas": strength_areas,
                "skill_progress": skill_progress,
                "learning_progress": learning_progress,
                "learning_paths": learning_paths
            }
            
            # Cache the result
            self._cache_result(cache_key, dashboard_data)
            
            return dashboard_data
            
        except Exception as e:
            self.logger.error(f"Error generating skill development dashboard: {str(e)}")
            return {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    def _get_skill_strength_areas(self, skill_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract skill strength areas from skill data"""
        strengths = []
        
        if not skill_data:
            return strengths
        
        # Get current skills
        current_skills = skill_data.get("current_skills", [])
        
        # Get skill categories if available
        categories = {}
        if "skill_categories" in skill_data:
            categories = skill_data["skill_categories"]
        else:
            # Group skills by manually inferring categories
            common_categories = {
                "technical": ["programming", "coding", "software", "development", "engineering", 
                            "database", "api", "framework", "language", "algorithm", "data", 
                            "analysis", "cloud", "devops", "automation"],
                "soft": ["communication", "teamwork", "leadership", "problem-solving", 
                       "time management", "adaptability", "creativity", "critical thinking",
                       "collaboration", "interpersonal"],
                "domain": ["finance", "healthcare", "marketing", "sales", "retail", 
                         "manufacturing", "education", "legal", "hr", "accounting"],
            }
            
            for skill in current_skills:
                skill_lower = skill.lower()
                for category, keywords in common_categories.items():
                    if any(keyword in skill_lower for keyword in keywords):
                        if category not in categories:
                            categories[category] = []
                        categories[category].append(skill)
        
        # Format strength areas
        for category, skills in categories.items():
            if len(skills) >= 2:  # Only include if there are at least 2 skills
                # Calculate strength score (placeholder - real implementation would be more complex)
                strength_score = min(100, len(skills) * 10)
                
                strengths.append({
                    "category": category.title(),
                    "skills": skills[:5],  # Top 5 skills in this category
                    "skill_count": len(skills),
                    "strength_score": strength_score
                })
        
        # Sort by strength score (highest first)
        strengths.sort(key=lambda x: x["strength_score"], reverse=True)
        
        return strengths[:5]  # Return top 5 strength areas
    
    def _get_skill_progress_over_time(self, skill_history: Optional[List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Get skill progress over time from history"""
        result = {
            "timestamps": [],
            "readiness_scores": [],
            "skill_counts": [],
            "skill_acquisitions": []
        }
        
        if not skill_history:
            return result
        
        # Sort history by timestamp
        history = sorted(skill_history, key=lambda x: x.get("timestamp", ""))
        
        # Track unique skills and when they were first seen
        all_skills = set()
        skill_acquisitions = []
        
        for entry in history:
            timestamp = entry.get("timestamp", "")
            if not timestamp:
                continue
                
            readiness = entry.get("readiness", {}).get("score", 0)
            current_skills = set(entry.get("current_skills", []))
            
            # Find newly acquired skills
            new_skills = current_skills - all_skills
            all_skills.update(new_skills)
            
            # Add to result
            result["timestamps"].append(timestamp)
            result["readiness_scores"].append(readiness)
            result["skill_counts"].append(len(current_skills))
            
            # Track skill acquisitions
            for skill in new_skills:
                skill_acquisitions.append({
                    "skill": skill,
                    "timestamp": timestamp
                })
        
        # Add acquisitions to result
        result["skill_acquisitions"] = skill_acquisitions
        
        return result
    
    def _get_learning_progress(self, learning_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Get learning progress from learning data"""
        result = {
            "courses_in_progress": 0,
            "courses_completed": 0,
            "total_learning_time": 0,
            "recent_completions": []
        }
        
        if not learning_data:
            return result
        
        # Process courses
        courses = learning_data.get("courses", [])
        in_progress = 0
        completed = 0
        total_time = 0
        recent_completions = []
        
        for course in courses:
            status = course.get("status", "")
            if status == "in_progress":
                in_progress += 1
            elif status == "completed":
                completed += 1
                
                # Track recent completions
                if "completion_date" in course:
                    recent_completions.append({
                        "title": course.get("title", "Course"),
                        "provider": course.get("provider", ""),
                        "completion_date": course["completion_date"],
                        "skill": course.get("skill", "")
                    })
            
            # Add learning time
            if "learning_time" in course:
                total_time += course["learning_time"]
        
        # Sort recent completions by date (most recent first)
        recent_completions.sort(key=lambda x: x.get("completion_date", ""), reverse=True)
        
        # Update result
        result["courses_in_progress"] = in_progress
        result["courses_completed"] = completed
        result["total_learning_time"] = total_time
        result["recent_completions"] = recent_completions[:5]  # Most recent 5
        
        return result
    
    def _get_recommended_learning_paths(self, 
                                      skill_data: Dict[str, Any],
                                      learning_data: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get recommended learning paths based on skill gaps"""
        learning_paths = []
        
        if not skill_data:
            return learning_paths
        
        # Get missing skills
        missing_skills = skill_data.get("missing_skills", [])
        if not missing_skills:
            return learning_paths
        
        # Currently in-progress skills
        in_progress_skills = set()
        if learning_data and "courses" in learning_data:
            for course in learning_data["courses"]:
                if course.get("status") == "in_progress" and "skill" in course:
                    in_progress_skills.add(course["skill"])
        
        # Create learning paths for top missing skills
        for skill in missing_skills[:5]:
            # Skip if already learning this skill
            if skill in in_progress_skills:
                continue
                
            # Simple placeholder for learning resources
            # In a real implementation, this would query a learning resource database
            resources = [
                {
                    "type": "course",
                    "title": f"Introduction to {skill}",
                    "provider": "Coursera",
                    "url": f"https://coursera.org/learn/{skill.lower().replace(' ', '-')}",
                    "duration": "4 weeks"
                },
                {
                    "type": "tutorial",
                    "title": f"{skill} Fundamentals",
                    "provider": "Udemy",
                    "url": f"https://udemy.com/course/{skill.lower().replace(' ', '-')}",
                    "duration": "10 hours"
                }
            ]
            
            learning_paths.append({
                "skill": skill,
                "priority": "high" if skill == missing_skills[0] else "medium",
                "gap_impact": "high" if skill in missing_skills[:2] else "medium",
                "resources": resources
            })
        
        return learning_paths