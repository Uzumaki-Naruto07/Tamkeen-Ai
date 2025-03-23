import os
import re
import json
import logging
import uuid
import random
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import time
from collections import defaultdict

# Optional dependencies - allow graceful fallback if not available
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import matplotlib.pyplot as plt
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

try:
    from jinja2 import Template
    JINJA2_AVAILABLE = True
except ImportError:
    JINJA2_AVAILABLE = False


class FeedbackGenerator:
    """
    Generates comprehensive, personalized feedback based on career assessment results.
    
    Key features:
    - Multi-component feedback (resume, skills, interview, etc.)
    - Personalized recommendations based on career goals
    - Progress tracking over time
    - Different feedback formats (detailed, summary, visual)
    - Custom templates for different feedback contexts
    """
    
    def __init__(self, 
                template_dir: Optional[str] = None,
                output_dir: Optional[str] = None,
                resources_dir: Optional[str] = None,
                feedback_styles: Optional[Dict[str, Dict[str, Any]]] = None):
        """
        Initialize the feedback generator
        
        Args:
            template_dir: Directory containing feedback templates
            output_dir: Directory for feedback output files
            resources_dir: Directory for feedback resources (images, etc.)
            feedback_styles: Custom feedback styles configuration
        """
        self.logger = logging.getLogger(__name__)
        
        # Set up output directory
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            self.output_dir = output_dir
        else:
            self.output_dir = os.path.join(os.getcwd(), "feedback_output")
            os.makedirs(self.output_dir, exist_ok=True)
            
        # Set up template directory
        self.template_dir = template_dir
        if not self.template_dir or not os.path.exists(self.template_dir):
            # Look for templates in standard locations
            possible_dirs = [
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates", "feedback"),
                os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates", "feedback"),
                os.path.join(os.path.expanduser("~"), ".tamkeen", "templates", "feedback")
            ]
            
            for dir_path in possible_dirs:
                if os.path.exists(dir_path):
                    self.template_dir = dir_path
                    break
                    
        # Resources directory
        self.resources_dir = resources_dir or os.path.join(os.path.dirname(os.path.abspath(__file__)), "resources")
        os.makedirs(self.resources_dir, exist_ok=True)
        
        # Set up feedback styles
        self.feedback_styles = feedback_styles or self._get_default_feedback_styles()
        
        # Initialize templates
        self.templates = self._load_templates()
        
        # Cache for previously generated feedback
        self.feedback_cache = {}
        
        self.logger.info("Feedback generator initialized")
    
    def _get_default_feedback_styles(self) -> Dict[str, Dict[str, Any]]:
        """Get default feedback styles"""
        return {
            "professional": {
                "tone": "formal",
                "detail_level": "high",
                "structure": "comprehensive",
                "language": "precise",
                "color_scheme": ["#1F497D", "#4F81BD", "#C0504D", "#9BBB59", "#8064A2"]
            },
            "supportive": {
                "tone": "encouraging",
                "detail_level": "medium",
                "structure": "progressive",
                "language": "accessible",
                "color_scheme": ["#4CAF50", "#2196F3", "#FFC107", "#9C27B0", "#FF5722"]
            },
            "direct": {
                "tone": "straightforward",
                "detail_level": "concise",
                "structure": "prioritized",
                "language": "clear",
                "color_scheme": ["#212121", "#757575", "#BDBDBD", "#616161", "#424242"]
            },
            "growth": {
                "tone": "developmental",
                "detail_level": "high",
                "structure": "opportunity-focused",
                "language": "growth-oriented",
                "color_scheme": ["#00796B", "#00ACC1", "#26A69A", "#80CBC4", "#4DB6AC"]
            }
        }
    
    def _load_templates(self) -> Dict[str, Any]:
        """Load templates for different feedback types"""
        templates = {}
        
        # Default templates as strings (will be used if template files not available)
        default_templates = {
            "resume": """
# Resume Feedback

## Overview
{{ overview }}

## Strengths
{% for strength in strengths %}
- {{ strength }}
{% endfor %}

## Areas for Improvement
{% for area in improvements %}
- {{ area }}
{% endfor %}

## Recommendations
{% for rec in recommendations %}
- {{ rec }}
{% endfor %}
            """,
            "skill_gap": """
# Skill Gap Analysis

## Career Readiness: {{ readiness.level }} ({{ readiness.score }}%)

## Current Skills
{% for skill in current_skills %}
- {{ skill }}
{% endfor %}

## Skills to Develop
{% for skill in skills_to_develop %}
- {{ skill }}
{% endfor %}

## Learning Recommendations
{% for rec in learning_recommendations %}
- {{ rec.skill }}: {{ rec.resource }}
{% endfor %}
            """,
            "interview": """
# Interview Performance Feedback

## Overall Score: {{ overall_score }}%

## Strengths
{% for strength in strengths %}
- {{ strength }}
{% endfor %}

## Areas for Improvement
{% for area in improvements %}
- {{ area }}
{% endfor %}

## Question-by-Question Feedback
{% for q in questions %}
Question: {{ q.question }}
Score: {{ q.score }}%
Feedback: {{ q.feedback }}

{% endfor %}
            """,
            "comprehensive": """
# Career Development Feedback

## Summary
{{ summary }}

## Resume Assessment
{{ resume_assessment }}

## Skills Analysis
{{ skills_analysis }}

## Interview Readiness
{{ interview_readiness }}

## Career Path Recommendations
{% for rec in career_recommendations %}
- {{ rec }}
{% endfor %}

## Next Steps
{% for step in next_steps %}
1. {{ step }}
{% endfor %}
            """
        }
        
        # Try to load templates from files
        if self.template_dir and os.path.exists(self.template_dir):
            for template_name, default_content in default_templates.items():
                template_path = os.path.join(self.template_dir, f"{template_name}_template.md")
                html_template_path = os.path.join(self.template_dir, f"{template_name}_template.html")
                
                if os.path.exists(template_path):
                    try:
                        with open(template_path, 'r') as f:
                            templates[template_name] = f.read()
                    except Exception as e:
                        self.logger.warning(f"Error loading template {template_name}: {str(e)}")
                        templates[template_name] = default_content
                elif os.path.exists(html_template_path):
                    try:
                        with open(html_template_path, 'r') as f:
                            templates[f"{template_name}_html"] = f.read()
                    except Exception as e:
                        self.logger.warning(f"Error loading HTML template {template_name}: {str(e)}")
                else:
                    templates[template_name] = default_content
        else:
            # Use default templates
            templates = default_templates
            
        return templates
    
    def generate_resume_feedback(self, 
                               resume_analysis: Dict[str, Any],
                               style: str = "professional",
                               format: str = "text",
                               user_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate feedback based on resume analysis
        
        Args:
            resume_analysis: Analysis results from resume analyzer
            style: Feedback style (professional, supportive, direct, growth)
            format: Output format (text, html, json)
            user_info: Optional user information for personalization
            
        Returns:
            Dictionary with feedback content and metadata
        """
        try:
            # Extract key information from resume analysis
            ats_score = resume_analysis.get("ats_score", {}).get("score", 0)
            format_score = resume_analysis.get("format_score", {}).get("score", 0)
            content_score = resume_analysis.get("content_score", {}).get("score", 0)
            keyword_match = resume_analysis.get("keyword_match", {}).get("score", 0)
            
            # Calculate overall score
            overall_score = (ats_score * 0.3 + format_score * 0.2 + 
                           content_score * 0.3 + keyword_match * 0.2)
            
            # Extract strengths and weaknesses
            strengths = []
            improvements = []
            
            # ATS feedback
            if ats_score >= 80:
                strengths.append("Your resume is well-optimized for Applicant Tracking Systems.")
            elif ats_score < 60:
                improvements.append("Your resume needs better ATS optimization. Consider using a cleaner format with standard section headings.")
            
            # Format feedback
            if format_score >= 80:
                strengths.append("Your resume format is clean, professional, and easy to read.")
            elif format_score < 60:
                improvements.append("The formatting of your resume could be improved for better readability and professionalism.")
            
            # Content feedback
            if content_score >= 80:
                strengths.append("Your resume contains strong content with impactful achievements.")
            elif content_score < 60:
                improvements.append("Your resume content needs stronger achievement statements with measurable results.")
            
            # Keyword feedback
            if keyword_match >= 80:
                strengths.append("Excellent use of relevant keywords that match job requirements.")
            elif keyword_match < 60:
                improvements.append("Your resume lacks important keywords related to your target roles.")
            
            # Extract specific markers
            action_verbs = resume_analysis.get("content_analysis", {}).get("action_verbs_count", {}).get("value", 0)
            if action_verbs < 5:
                improvements.append("Use more action verbs to make your accomplishments stand out.")
            elif action_verbs >= 10:
                strengths.append("Good use of action verbs that highlight your accomplishments.")
                
            bullets = resume_analysis.get("content_analysis", {}).get("bullets_count", {}).get("value", 0)
            if bullets < 10:
                improvements.append("Consider using more bullet points to make your resume easier to scan.")
            elif bullets > 30:
                improvements.append("Your resume has too many bullet points. Focus on your most significant achievements.")
                
            # Generate recommendations
            recommendations = self._generate_resume_recommendations(
                resume_analysis, 
                style,
                improvements,
                user_info
            )
            
            # Determine strength level based on overall score
            if overall_score >= 90:
                strength_level = "excellent"
                overview = "Your resume is excellent and presents your qualifications effectively."
            elif overall_score >= 75:
                strength_level = "strong"
                overview = "Your resume is strong with some minor areas for improvement."
            elif overall_score >= 60:
                strength_level = "moderate"
                overview = "Your resume is adequate but has several areas that need improvement."
            else:
                strength_level = "needs work"
                overview = "Your resume needs significant improvement to effectively showcase your qualifications."
            
            # Prepare template data
            template_data = {
                "overview": overview,
                "strengths": strengths,
                "improvements": improvements,
                "recommendations": recommendations,
                "scores": {
                    "overall": round(overall_score, 1),
                    "ats": round(ats_score, 1),
                    "format": round(format_score, 1),
                    "content": round(content_score, 1),
                    "keyword_match": round(keyword_match, 1)
                },
                "strength_level": strength_level,
                "user_info": user_info or {}
            }
            
            # Generate feedback content
            content = self._render_template("resume", template_data, format)
            
            return {
                "feedback_type": "resume",
                "style": style,
                "format": format,
                "content": content,
                "overview": overview,
                "strength_level": strength_level,
                "scores": template_data["scores"],
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating resume feedback: {str(e)}")
            return {
                "feedback_type": "resume",
                "style": style,
                "format": format,
                "content": "An error occurred while generating resume feedback.",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_skill_gap_feedback(self,
                                  skill_analysis: Dict[str, Any],
                                  style: str = "professional",
                                  format: str = "text",
                                  user_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate feedback based on skill gap analysis
        
        Args:
            skill_analysis: Analysis results from skill gap predictor
            style: Feedback style (professional, supportive, direct, growth)
            format: Output format (text, html, json)
            user_info: Optional user information for personalization
            
        Returns:
            Dictionary with feedback content and metadata
        """
        try:
            # Extract key information
            readiness = skill_analysis.get("readiness", {})
            readiness_score = readiness.get("score", 0)
            readiness_level = readiness.get("level", "Not Ready")
            
            current_skills = skill_analysis.get("matched_skills", [])
            missing_skills = skill_analysis.get("missing_skills", [])
            learning_paths = skill_analysis.get("learning_paths", [])
            
            # Sort skills to develop by priority
            skills_to_develop = missing_skills[:10]  # Focus on top 10 skills
            
            # Extract insights
            insights = skill_analysis.get("insights", [])
            
            # Prepare learning recommendations
            learning_recommendations = []
            for skill in skills_to_develop[:5]:  # Top 5 skills to learn
                skill_resources = skill_analysis.get("learning_resources", {}).get(skill, [])
                if skill_resources:
                    for resource in skill_resources[:2]:  # Top 2 resources per skill
                        learning_recommendations.append({
                            "skill": skill,
                            "resource": resource.get("title", ""),
                            "url": resource.get("url", ""),
                            "type": resource.get("type", "")
                        })
            
            # Generate template data
            template_data = {
                "readiness": {
                    "score": readiness_score,
                    "level": readiness_level
                },
                "current_skills": current_skills,
                "skills_to_develop": skills_to_develop,
                "learning_recommendations": learning_recommendations,
                "insights": insights,
                "user_info": user_info or {}
            }
            
            # Generate feedback content
            content = self._render_template("skill_gap", template_data, format)
            
            # Create summary
            if readiness_score >= 90:
                summary = "You have an excellent skill match for your target role."
            elif readiness_score >= 75:
                summary = "You have a strong skill foundation with a few gaps to address."
            elif readiness_score >= 60:
                summary = "You have a moderate skill match with several important skills to develop."
            else:
                summary = "You need significant skill development for your target role."
            
            return {
                "feedback_type": "skill_gap",
                "style": style,
                "format": format,
                "content": content,
                "summary": summary,
                "readiness": template_data["readiness"],
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating skill gap feedback: {str(e)}")
            return {
                "feedback_type": "skill_gap",
                "style": style,
                "format": format,
                "content": "An error occurred while generating skill gap feedback.",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_interview_feedback(self,
                                  interview_results: Dict[str, Any],
                                  style: str = "supportive",
                                  format: str = "text",
                                  user_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate feedback based on interview simulation results
        
        Args:
            interview_results: Results from interview simulation
            style: Feedback style (professional, supportive, direct, growth)
            format: Output format (text, html, json)
            user_info: Optional user information for personalization
            
        Returns:
            Dictionary with feedback content and metadata
        """
        try:
            # Extract key information
            overall_score = interview_results.get("overall_score", 0)
            question_responses = interview_results.get("responses", [])
            
            # Extract sentiment data if available
            sentiment_data = interview_results.get("sentiment_analysis", {})
            confidence_score = sentiment_data.get("confidence", {}).get("score", 0) if sentiment_data else 0
            
            # Extract insights if available
            insights = interview_results.get("insights", {})
            strengths = insights.get("strengths", [])
            improvements = insights.get("areas_to_improve", [])
            
            # If no strengths provided, generate basic ones based on scores
            if not strengths and question_responses:
                for response in question_responses:
                    score = response.get("score", 0)
                    category = response.get("category", "")
                    if score >= 80:
                        strengths.append(f"Strong performance on {category} questions.")
                        break
                
                # Add confidence strength if available and high
                if confidence_score >= 0.7:
                    strengths.append("You demonstrated good confidence in your responses.")
                    
            # If no improvements provided, generate basic ones based on scores
            if not improvements and question_responses:
                for response in question_responses:
                    score = response.get("score", 0)
                    category = response.get("category", "")
                    if score <= 60:
                        improvements.append(f"Need to improve responses to {category} questions.")
                        break
                        
                # Add confidence improvement if available and low
                if confidence_score <= 0.4:
                    improvements.append("Work on building more confidence in your interview responses.")
            
            # Ensure we have at least some feedback
            if not strengths:
                strengths = ["You completed the interview simulation successfully."]
            if not improvements:
                improvements = ["Continue practicing to improve your interview responses."]
            
            # Prepare question-by-question feedback
            questions_feedback = []
            for response in question_responses:
                question = response.get("question", "")
                score = response.get("score", 0)
                feedback = response.get("feedback", "")
                category = response.get("category", "")
                
                questions_feedback.append({
                    "question": question,
                    "score": score,
                    "feedback": feedback,
                    "category": category
                })
            
            # Generate template data
            template_data = {
                "overall_score": round(overall_score, 1),
                "strengths": strengths,
                "improvements": improvements,
                "questions": questions_feedback,
                "confidence_score": round(confidence_score * 100, 1) if confidence_score else None,
                "user_info": user_info or {}
            }
            
            # Generate feedback content
            content = self._render_template("interview", template_data, format)
            
            # Create summary
            if overall_score >= 90:
                summary = "Excellent interview performance. You're well-prepared for actual interviews."
            elif overall_score >= 75:
                summary = "Strong interview performance with some areas for improvement."
            elif overall_score >= 60:
                summary = "Moderate interview performance. More practice would be beneficial."
            else:
                summary = "Needs significant improvement. Consider additional interview preparation."
            
            return {
                "feedback_type": "interview",
                "style": style,
                "format": format,
                "content": content,
                "summary": summary,
                "overall_score": round(overall_score, 1),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating interview feedback: {str(e)}")
            return {
                "feedback_type": "interview",
                "style": style,
                "format": format,
                "content": "An error occurred while generating interview feedback.",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_comprehensive_feedback(self,
                                      resume_analysis: Optional[Dict[str, Any]] = None,
                                      skill_analysis: Optional[Dict[str, Any]] = None,
                                      interview_results: Optional[Dict[str, Any]] = None,
                                      career_path: Optional[Dict[str, Any]] = None,
                                      style: str = "professional",
                                      format: str = "text",
                                      user_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate comprehensive feedback integrating multiple analysis components
        
        Args:
            resume_analysis: Results from resume analyzer
            skill_analysis: Results from skill gap predictor
            interview_results: Results from interview simulation
            career_path: Career path information
            style: Feedback style (professional, supportive, direct, growth)
            format: Output format (text, html, json)
            user_info: User information for personalization
            
        Returns:
            Dictionary with comprehensive feedback content and metadata
        """
        try:
            # Generate individual feedback components if data is provided
            resume_feedback = {}
            skill_feedback = {}
            interview_feedback = {}
            
            if resume_analysis:
                resume_feedback = self.generate_resume_feedback(
                    resume_analysis, style, "text", user_info)
            
            if skill_analysis:
                skill_feedback = self.generate_skill_gap_feedback(
                    skill_analysis, style, "text", user_info)
            
            if interview_results:
                interview_feedback = self.generate_interview_feedback(
                    interview_results, style, "text", user_info)
            
            # Calculate overall career readiness score
            scores = []
            weights = []
            
            if resume_feedback.get("scores", {}).get("overall"):
                scores.append(resume_feedback["scores"]["overall"])
                weights.append(0.3)
                
            if skill_feedback.get("readiness", {}).get("score"):
                scores.append(skill_feedback["readiness"]["score"])
                weights.append(0.4)
                
            if interview_feedback.get("overall_score"):
                scores.append(interview_feedback["overall_score"])
                weights.append(0.3)
                
            if scores and weights:
                overall_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
            else:
                overall_score = 0
            
            # Generate career recommendations based on all analyses
            career_recommendations = self._generate_career_recommendations(
                resume_analysis, skill_analysis, interview_results, career_path, user_info)
            
            # Generate next steps
            next_steps = self._generate_next_steps(
                resume_analysis, skill_analysis, interview_results, career_path, user_info)
            
            # Create summary based on overall score
            if overall_score >= 90:
                summary = "You're exceptionally well-prepared for your career goals."
            elif overall_score >= 75:
                summary = "You're well-positioned for your target career with some areas to improve."
            elif overall_score >= 60:
                summary = "You have a solid foundation but need targeted improvements to reach your career goals."
            else:
                summary = "You need significant development in several areas to achieve your career objectives."
            
            # Prepare comprehensive template data
            template_data = {
                "summary": summary,
                "resume_assessment": resume_feedback.get("content", "Resume analysis not available."),
                "skills_analysis": skill_feedback.get("content", "Skill gap analysis not available."),
                "interview_readiness": interview_feedback.get("content", "Interview analysis not available."),
                "career_recommendations": career_recommendations,
                "next_steps": next_steps,
                "overall_score": round(overall_score, 1),
                "user_info": user_info or {}
            }
            
            # Generate comprehensive feedback content
            content = self._render_template("comprehensive", template_data, format)
            
            return {
                "feedback_type": "comprehensive",
                "style": style,
                "format": format,
                "content": content,
                "summary": summary,
                "overall_score": round(overall_score, 1),
                "recommendations": career_recommendations,
                "next_steps": next_steps,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating comprehensive feedback: {str(e)}")
            return {
                "feedback_type": "comprehensive",
                "style": style,
                "format": format,
                "content": "An error occurred while generating comprehensive feedback.",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _render_template(self, template_name: str, data: Dict[str, Any], 
                       format: str = "text") -> str:
        """Render feedback using template"""
        if not JINJA2_AVAILABLE:
            # Simple template rendering fallback if Jinja2 is not available
            content = self.templates.get(template_name, "")
            
            # Basic variable substitution
            for key, value in data.items():
                if isinstance(value, str):
                    content = content.replace("{{ " + key + " }}", value)
            
            return content
        
        # Use Jinja2 for proper template rendering
        template_content = self.templates.get(template_name, "")
        if format == "html" and template_name + "_html" in self.templates:
            template_content = self.templates[template_name + "_html"]
            
        template = Template(template_content)
        return template.render(**data)
    
    def _generate_resume_recommendations(self, 
                                       resume_analysis: Dict[str, Any],
                                       style: str,
                                       improvements: List[str],
                                       user_info: Optional[Dict[str, Any]] = None) -> List[str]:
        """Generate specific recommendations for resume improvement"""
        recommendations = []
        
        # Base recommendations on existing improvement areas
        for improvement in improvements:
            if "action verbs" in improvement.lower():
                recommendations.append("Replace passive language with strong action verbs like 'achieved,' 'implemented,' 'led,' or 'managed.'")
            elif "bullet points" in improvement.lower():
                if "more" in improvement.lower():
                    recommendations.append("Convert paragraph text to concise bullet points that highlight specific achievements.")
                else:
                    recommendations.append("Focus on your most significant achievements and limit to 3-5 bullet points per position.")
            elif "ats" in improvement.lower():
                recommendations.append("Use a standard resume format with clear section headings (Experience, Education, Skills).")
            elif "keywords" in improvement.lower():
                recommendations.append("Analyze job descriptions for your target roles and incorporate relevant keywords throughout your resume.")
            elif "achievement" in improvement.lower():
                recommendations.append("Quantify your achievements with specific metrics (%, $, time saved) to demonstrate impact.")
        
        # Add general recommendations based on analysis scores
        format_score = resume_analysis.get("format_score", {}).get("score", 0)
        if format_score < 70:
            recommendations.append("Ensure consistent formatting throughout your resume (fonts, spacing, alignment).")
            
        content_score = resume_analysis.get("content_score", {}).get("score", 0)
        if content_score < 70:
            recommendations.append("Focus on your accomplishments rather than just listing responsibilities.")
            
        # Add personalized recommendations based on user info if available
        if user_info:
            career_level = user_info.get("career_level", "")
            if career_level == "Entry Level":
                recommendations.append("Highlight relevant coursework, projects, and internships to compensate for limited work experience.")
            elif career_level in ["Senior", "Lead"]:
                recommendations.append("Emphasize leadership experience, strategic initiatives, and business impact in your resume.")
        
        return recommendations
    
    def _generate_career_recommendations(self,
                                       resume_analysis: Optional[Dict[str, Any]] = None,
                                       skill_analysis: Optional[Dict[str, Any]] = None,
                                       interview_results: Optional[Dict[str, Any]] = None,
                                       career_path: Optional[Dict[str, Any]] = None,
                                       user_info: Optional[Dict[str, Any]] = None) -> List[str]:
        """Generate integrated career recommendations based on all analyses"""
        recommendations = []
        
        # Extract career level and target job
        career_level = "Entry Level"
        target_job = "Unknown"
        
        if user_info:
            career_level = user_info.get("career_level", career_level)
            target_job = user_info.get("target_job", target_job)
        
        # Resume-based recommendations
        if resume_analysis:
            ats_score = resume_analysis.get("ats_score", {}).get("score", 0)
            if ats_score < 70:
                recommendations.append(f"Optimize your resume for ATS systems to increase chances of getting interviews for {target_job} positions.")
            
        # Skill-based recommendations
        if skill_analysis:
            readiness = skill_analysis.get("readiness", {})
            readiness_score = readiness.get("score", 0)
            
            if readiness_score < 70:
                recommendations.append(f"Focus on developing the critical skills identified in the skill gap analysis for {target_job} roles.")
                
            # Add specific skill recommendations
            missing_skills = skill_analysis.get("missing_skills", [])
            if missing_skills:
                top_skills = missing_skills[:3]
                recommendations.append(f"Prioritize learning {', '.join(top_skills)} to increase your marketability for {target_job} positions.")
        
        # Interview-based recommendations
        if interview_results:
            overall_score = interview_results.get("overall_score", 0)
            
            if overall_score < 70:
                recommendations.append("Continue practicing interview responses for common questions in your field.")
                
            # Check for confidence issues
            sentiment_data = interview_results.get("sentiment_analysis", {})
            confidence_score = sentiment_data.get("confidence", {}).get("score", 0) if sentiment_data else 0
            
            if confidence_score < 0.5:
                recommendations.append("Work on building interview confidence through practice sessions and mock interviews.")
        
        # Career path recommendations
        if career_path:
            next_role = career_path.get("next_role", "")
            if next_role:
                recommendations.append(f"Position yourself for advancement to {next_role} by taking on projects that demonstrate relevant capabilities.")
        
        # Level-specific recommendations
        if career_level == "Entry Level":
            recommendations.append("Build a portfolio of projects that demonstrate your technical skills and problem-solving abilities.")
        elif career_level == "Mid Level":
            recommendations.append("Seek opportunities to lead projects or mentor junior team members to build leadership experience.")
        elif career_level in ["Senior", "Lead"]:
            recommendations.append("Focus on strategic initiatives and cross-functional projects that demonstrate business impact.")
        
        # Ensure we have reasonable number of recommendations
        if len(recommendations) == 0:
            recommendations = ["Continue developing your skills and experience to advance your career."]
        elif len(recommendations) > 5:
            recommendations = recommendations[:5]
            
        return recommendations
    
    def _generate_next_steps(self,
                           resume_analysis: Optional[Dict[str, Any]] = None,
                           skill_analysis: Optional[Dict[str, Any]] = None,
                           interview_results: Optional[Dict[str, Any]] = None,
                           career_path: Optional[Dict[str, Any]] = None,
                           user_info: Optional[Dict[str, Any]] = None) -> List[str]:
        """Generate actionable next steps based on all analyses"""
        next_steps = []
        
        # Resume next steps
        if resume_analysis:
            ats_score = resume_analysis.get("ats_score", {}).get("score", 0)
            if ats_score < 70:
                next_steps.append("Revise your resume format based on the feedback provided.")
                
        # Skill next steps
        if skill_analysis:
            missing_skills = skill_analysis.get("missing_skills", [])
            if missing_skills:
                next_steps.append(f"Start a learning plan for {missing_skills[0]} using the recommended resources.")
                
        # Interview next steps
        if interview_results:
            overall_score = interview_results.get("overall_score", 0)
            if overall_score < 70:
                next_steps.append("Schedule three mock interview sessions to practice your responses.")
                
        # Add general next steps if needed
        if len(next_steps) < 3:
            general_steps = [
                "Update your LinkedIn profile to align with your revised resume.",
                "Research companies in your target industry and identify potential opportunities.",
                "Connect with professionals in your field for informational interviews.",
                "Join professional groups or communities related to your career interests.",
                "Create a 30-60-90 day plan for your job search or career development."
            ]
            
            # Add general steps until we have at least 3
            for step in general_steps:
                if step not in next_steps:
                    next_steps.append(step)
                    if len(next_steps) >= 3:
                        break
        
        return next_steps
    
    def save_feedback(self, feedback: Dict[str, Any], 
                    filename: Optional[str] = None, 
                    user_id: Optional[str] = None) -> str:
        """Save feedback to file and return file path"""
        # Generate filename if not provided
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            feedback_type = feedback.get("feedback_type", "feedback")
            user_suffix = f"_{user_id}" if user_id else ""
            filename = f"{feedback_type}{user_suffix}_{timestamp}.json"
            
        file_path = os.path.join(self.output_dir, filename)
        
        try:
            with open(file_path, 'w') as f:
                json.dump(feedback, f, indent=2)
            
            return file_path
        except Exception as e:
            self.logger.error(f"Error saving feedback: {str(e)}")
            return ""
    
    def load_feedback(self, file_path: str) -> Dict[str, Any]:
        """Load feedback from file"""
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error loading feedback: {str(e)}")
            return {}
    
    def generate_progress_report(self, 
                               feedback_history: List[Dict[str, Any]],
                               user_info: Optional[Dict[str, Any]] = None,
                               format: str = "text") -> Dict[str, Any]:
        """
        Generate a progress report based on feedback history
        
        Args:
            feedback_history: List of previous feedback results
            user_info: User information for personalization
            format: Output format (text, html, json)
            
        Returns:
            Dictionary with progress report content and metadata
        """
        try:
            if not feedback_history:
                return {
                    "feedback_type": "progress",
                    "format": format,
                    "content": "No feedback history available for progress analysis.",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Group feedback by type
            feedback_by_type = defaultdict(list)
            for feedback in feedback_history:
                feedback_type = feedback.get("feedback_type", "unknown")
                feedback_by_type[feedback_type].append(feedback)
            
            # Analyze progress for each feedback type
            progress_data = {}
            
            # Resume progress
            if "resume" in feedback_by_type:
                resume_feedback = sorted(feedback_by_type["resume"], 
                                       key=lambda x: x.get("timestamp", ""))
                
                if len(resume_feedback) >= 2:
                    first = resume_feedback[0]
                    last = resume_feedback[-1]
                    
                    first_score = first.get("scores", {}).get("overall", 0)
                    last_score = last.get("scores", {}).get("overall", 0)
                    
                    progress_data["resume"] = {
                        "first_score": first_score,
                        "last_score": last_score,
                        "change": last_score - first_score,
                        "change_percent": round((last_score - first_score) / max(1, first_score) * 100, 1),
                        "count": len(resume_feedback)
                    }
            
            # Skill progress
            if "skill_gap" in feedback_by_type:
                skill_feedback = sorted(feedback_by_type["skill_gap"], 
                                      key=lambda x: x.get("timestamp", ""))
                
                if len(skill_feedback) >= 2:
                    first = skill_feedback[0]
                    last = skill_feedback[-1]
                    
                    first_readiness = first.get("readiness", {}).get("score", 0)
                    last_readiness = last.get("readiness", {}).get("score", 0)
                    
                    # Track skill acquisition
                    first_skills = set(first.get("current_skills", []))
                    last_skills = set(last.get("current_skills", []))
                    new_skills = last_skills - first_skills
                    
                    progress_data["skill_gap"] = {
                        "first_readiness": first_readiness,
                        "last_readiness": last_readiness,
                        "readiness_change": last_readiness - first_readiness,
                        "readiness_change_percent": round((last_readiness - first_readiness) / max(1, first_readiness) * 100, 1),
                        "new_skills": list(new_skills),
                        "new_skills_count": len(new_skills),
                        "count": len(skill_feedback)
                    }
            
            # Interview progress
            if "interview" in feedback_by_type:
                interview_feedback = sorted(feedback_by_type["interview"], 
                                          key=lambda x: x.get("timestamp", ""))
                
                if len(interview_feedback) >= 2:
                    first = interview_feedback[0]
                    last = interview_feedback[-1]
                    
                    first_score = first.get("overall_score", 0)
                    last_score = last.get("overall_score", 0)
                    
                    # Track specific dimensions
                    dimensions = ["relevance", "structure", "confidence", "technical"]
                    dimension_progress = {}
                    
                    for dim in dimensions:
                        first_dim = first.get("dimensions", {}).get(dim, 0)
                        last_dim = last.get("dimensions", {}).get(dim, 0)
                        
                        dimension_progress[dim] = {
                            "first": first_dim,
                            "last": last_dim,
                            "change": last_dim - first_dim
                        }
                    
                    progress_data["interview"] = {
                        "first_score": first_score,
                        "last_score": last_score,
                        "change": last_score - first_score,
                        "change_percent": round((last_score - first_score) / max(1, first_score) * 100, 1),
                        "dimensions": dimension_progress,
                        "count": len(interview_feedback)
                    }
            
            # Overall progress
            latest_scores = {}
            for feedback_type, feedbacks in feedback_by_type.items():
                if feedbacks:
                    latest = sorted(feedbacks, key=lambda x: x.get("timestamp", ""))[-1]
                    if feedback_type == "resume":
                        latest_scores[feedback_type] = latest.get("scores", {}).get("overall", 0)
                    elif feedback_type == "skill_gap":
                        latest_scores[feedback_type] = latest.get("readiness", {}).get("score", 0)
                    elif feedback_type == "interview":
                        latest_scores[feedback_type] = latest.get("overall_score", 0)
            
            # Calculate overall career readiness score
            weights = {
                "resume": 0.3,
                "skill_gap": 0.4,
                "interview": 0.3
            }
            
            overall_score = 0
            total_weight = 0
            
            for feedback_type, score in latest_scores.items():
                if feedback_type in weights:
                    overall_score += score * weights[feedback_type]
                    total_weight += weights[feedback_type]
            
            if total_weight > 0:
                overall_score /= total_weight
            
            # Generate insights based on progress
            insights = []
            
            if "resume" in progress_data and progress_data["resume"]["change"] > 5:
                insights.append(f"Your resume quality has improved by {progress_data['resume']['change_percent']}% since your first assessment.")
                
            if "skill_gap" in progress_data:
                new_skills_count = progress_data["skill_gap"]["new_skills_count"]
                if new_skills_count > 0:
                    insights.append(f"You've acquired {new_skills_count} new relevant skills since your first assessment.")
                    
                if progress_data["skill_gap"]["readiness_change"] > 5:
                    insights.append(f"Your career readiness has improved by {progress_data['skill_gap']['readiness_change_percent']}%.")
                    
            if "interview" in progress_data:
                if progress_data["interview"]["change"] > 5:
                    insights.append(f"Your interview performance has improved by {progress_data['interview']['change_percent']}%.")
                    
                # Check dimensions with most improvement
                dimensions = progress_data["interview"]["dimensions"]
                max_improvement = 0
                max_dimension = ""
                
                for dim, values in dimensions.items():
                    if values["change"] > max_improvement:
                        max_improvement = values["change"]
                        max_dimension = dim
                        
                if max_dimension and max_improvement > 10:
                    readable_dim = max_dimension.replace("_", " ").title()
                    insights.append(f"Your biggest interview improvement is in {readable_dim} ({max_improvement} points higher).")
            
            # Format output based on requested format
            if format == "text":
                content = self._format_progress_text(progress_data, insights, overall_score)
            elif format == "html":
                content = self._format_progress_html(progress_data, insights, overall_score)
            else:  # json
                content = {
                    "progress_data": progress_data,
                    "insights": insights,
                    "overall_score": overall_score
                }
                
            return {
                "feedback_type": "progress",
                "format": format,
                "content": content,
                "timestamp": datetime.now().isoformat(),
                "progress_data": progress_data,
                "insights": insights,
                "overall_score": round(overall_score, 1)
            }
            
        except Exception as e:
            self.logger.error(f"Error generating progress report: {str(e)}")
            return {
                "feedback_type": "progress",
                "format": format,
                "content": "Error generating progress report.",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _format_progress_text(self, progress_data: Dict[str, Any], 
                            insights: List[str], 
                            overall_score: float) -> str:
        """Format progress report as text"""
        lines = []
        
        # Header
        lines.append("# CAREER PROGRESS REPORT")
        lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        lines.append("")
        
        # Overall score
        lines.append(f"## Overall Career Readiness: {round(overall_score, 1)}%")
        lines.append("")
        
        # Key insights
        lines.append("## Key Insights")
        for insight in insights:
            lines.append(f"- {insight}")
        lines.append("")
        
        # Resume progress
        if "resume" in progress_data:
            resume = progress_data["resume"]
            lines.append("## Resume Progress")
            lines.append(f"Initial Score: {resume['first_score']}%")
            lines.append(f"Current Score: {resume['last_score']}%")
            change_symbol = "+" if resume['change'] >= 0 else ""
            lines.append(f"Change: {change_symbol}{resume['change']}% ({change_symbol}{resume['change_percent']}%)")
            lines.append(f"Assessments: {resume['count']}")
            lines.append("")
        
        # Skill progress
        if "skill_gap" in progress_data:
            skill = progress_data["skill_gap"]
            lines.append("## Skill Progress")
            lines.append(f"Initial Readiness: {skill['first_readiness']}%")
            lines.append(f"Current Readiness: {skill['last_readiness']}%")
            change_symbol = "+" if skill['readiness_change'] >= 0 else ""
            lines.append(f"Change: {change_symbol}{skill['readiness_change']}% ({change_symbol}{skill['readiness_change_percent']}%)")
            
            if skill['new_skills_count'] > 0:
                lines.append(f"New Skills Acquired: {skill['new_skills_count']}")
                for skill_name in skill['new_skills'][:5]:  # Show at most 5
                    lines.append(f"  - {skill_name}")
                if skill['new_skills_count'] > 5:
                    lines.append(f"  - ...and {skill['new_skills_count'] - 5} more")
                    
            lines.append(f"Assessments: {skill['count']}")
            lines.append("")
        
        # Interview progress
        if "interview" in progress_data:
            interview = progress_data["interview"]
            lines.append("## Interview Progress")
            lines.append(f"Initial Score: {interview['first_score']}%")
            lines.append(f"Current Score: {interview['last_score']}%")
            change_symbol = "+" if interview['change'] >= 0 else ""
            lines.append(f"Change: {change_symbol}{interview['change']}% ({change_symbol}{interview['change_percent']}%)")
            
            # Dimension breakdown
            lines.append("Dimension Changes:")
            for dim, values in interview['dimensions'].items():
                readable_dim = dim.replace("_", " ").title()
                change_symbol = "+" if values['change'] >= 0 else ""
                lines.append(f"  - {readable_dim}: {change_symbol}{values['change']} points")
                
            lines.append(f"Assessments: {interview['count']}")
            
        return "\n".join(lines)
    
    def _format_progress_html(self, progress_data: Dict[str, Any],
                           insights: List[str],
                           overall_score: float) -> str:
        """Format progress report as HTML"""
        if not JINJA2_AVAILABLE:
            return f"<h1>Progress Report</h1><p>Overall Score: {round(overall_score, 1)}%</p>"
            
        # Basic HTML template
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Career Progress Report</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                h2 { color: #2980b9; margin-top: 30px; }
                .score { font-size: 24px; font-weight: bold; color: #27ae60; }
                .insights { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin-bottom: 20px; }
                .progress-section { margin-bottom: 30px; }
                .change-positive { color: #27ae60; }
                .change-negative { color: #e74c3c; }
                .new-skills { margin-left: 20px; }
            </style>
        </head>
        <body>
            <h1>Career Progress Report</h1>
            <p>Generated: {{ timestamp }}</p>
            
            <div class="progress-section">
                <h2>Overall Career Readiness</h2>
                <div class="score">{{ overall_score }}%</div>
            </div>
            
            <div class="progress-section">
                <h2>Key Insights</h2>
                <div class="insights">
                    <ul>
                    {% for insight in insights %}
                        <li>{{ insight }}</li>
                    {% endfor %}
                    </ul>
                </div>
            </div>
            
            {% if resume %}
            <div class="progress-section">
                <h2>Resume Progress</h2>
                <p>Initial Score: {{ resume.first_score }}%</p>
                <p>Current Score: {{ resume.last_score }}%</p>
                <p>Change: <span class="{{ 'change-positive' if resume.change >= 0 else 'change-negative' }}">
                    {{ '+' if resume.change >= 0 else '' }}{{ resume.change }}% 
                    ({{ '+' if resume.change_percent >= 0 else '' }}{{ resume.change_percent }}%)
                </span></p>
                <p>Assessments: {{ resume.count }}</p>
            </div>
            {% endif %}
            
            {% if skill_gap %}
            <div class="progress-section">
                <h2>Skill Progress</h2>
                <p>Initial Readiness: {{ skill_gap.first_readiness }}%</p>
                <p>Current Readiness: {{ skill_gap.last_readiness }}%</p>
                <p>Change: <span class="{{ 'change-positive' if skill_gap.readiness_change >= 0 else 'change-negative' }}">
                    {{ '+' if skill_gap.readiness_change >= 0 else '' }}{{ skill_gap.readiness_change }}% 
                    ({{ '+' if skill_gap.readiness_change_percent >= 0 else '' }}{{ skill_gap.readiness_change_percent }}%)
                </span></p>
                
                {% if skill_gap.new_skills_count > 0 %}
                <p>New Skills Acquired: {{ skill_gap.new_skills_count }}</p>
                <ul class="new-skills">
                    {% for skill in skill_gap.new_skills[:5] %}
                    <li>{{ skill }}</li>
                    {% endfor %}
                    {% if skill_gap.new_skills_count > 5 %}
                    <li>...and {{ skill_gap.new_skills_count - 5 }} more</li>
                    {% endif %}
                </ul>
                {% endif %}
                
                <p>Assessments: {{ skill_gap.count }}</p>
            </div>
            {% endif %}
            
            {% if interview %}
            <div class="progress-section">
                <h2>Interview Progress</h2>
                <p>Initial Score: {{ interview.first_score }}%</p>
                <p>Current Score: {{ interview.last_score }}%</p>
                <p>Change: <span class="{{ 'change-positive' if interview.change >= 0 else 'change-negative' }}">
                    {{ '+' if interview.change >= 0 else '' }}{{ interview.change }}% 
                    ({{ '+' if interview.change_percent >= 0 else '' }}{{ interview.change_percent }}%)
                </span></p>
                
                <h3>Dimension Changes:</h3>
                <ul>
                    {% for dim, values in interview.dimensions.items() %}
                    <li>{{ dim|replace('_', ' ')|title }}: 
                        <span class="{{ 'change-positive' if values.change >= 0 else 'change-negative' }}">
                            {{ '+' if values.change >= 0 else '' }}{{ values.change }} points
                        </span>
                    </li>
                    {% endfor %}
                </ul>
                
                <p>Assessments: {{ interview.count }}</p>
            </div>
            {% endif %}
            
        </body>
        </html>
        """
        
        try:
            template = Template(template_str)
            return template.render(
                timestamp=datetime.now().strftime('%Y-%m-%d %H:%M'),
                overall_score=round(overall_score, 1),
                insights=insights,
                resume=progress_data.get("resume"),
                skill_gap=progress_data.get("skill_gap"),
                interview=progress_data.get("interview")
            )
        except Exception as e:
            self.logger.error(f"Error formatting HTML progress report: {str(e)}")
            return f"<h1>Progress Report</h1><p>Overall Score: {round(overall_score, 1)}%</p><p>Error formatting full report.</p>"