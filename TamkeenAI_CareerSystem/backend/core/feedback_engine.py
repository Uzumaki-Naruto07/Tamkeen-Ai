"""
Feedback Engine Module

This module generates personalized feedback, recommendations, and advice based on
resume analysis, career assessments, and other user data.
"""

import os
import json
import random
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

# Import other core modules if needed
from .ats_matcher import analyze_resume
from .career_assessment import CareerAssessment
from .career_guidance import CareerGuidance

# Import settings
from config.settings import BASE_DIR

# Define paths for feedback templates
FEEDBACK_TEMPLATES_DIR = os.path.join(BASE_DIR, 'data', 'templates', 'feedback')
os.makedirs(FEEDBACK_TEMPLATES_DIR, exist_ok=True)

# Try importing NLP libraries for more sophisticated text generation
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    print("Warning: spaCy not available. Text analysis features will be limited.")


class FeedbackEngine:
    """Class for generating personalized feedback and recommendations"""
    
    def __init__(self):
        """Initialize with feedback templates and resources"""
        self.templates = self._load_templates()
        self.career_guidance = CareerGuidance()
    
    def _load_templates(self) -> Dict[str, Dict[str, List[str]]]:
        """Load feedback template data"""
        templates = {
            "resume": {
                "general": [
                    "Your resume is {resume_quality}. {main_feedback}",
                    "Overall, your resume appears {resume_quality}. {main_feedback}",
                    "Based on my analysis, your resume is {resume_quality}. {main_feedback}"
                ],
                "skills": [
                    "Your skills section {skills_feedback}.",
                    "Regarding your technical abilities, {skills_feedback}.",
                    "When it comes to your skills, {skills_feedback}."
                ],
                "experience": [
                    "Your work experience {experience_feedback}.",
                    "Regarding your professional experience, {experience_feedback}.",
                    "Your job history {experience_feedback}."
                ],
                "education": [
                    "Your educational background {education_feedback}.",
                    "Regarding your education, {education_feedback}.",
                    "Your academic credentials {education_feedback}."
                ],
                "recommendations": [
                    "Here are some suggestions to improve your resume: {recommendations}",
                    "Consider these improvements for your resume: {recommendations}",
                    "To strengthen your resume, try the following: {recommendations}"
                ]
            },
            "career_development": {
                "general": [
                    "Based on your profile, {general_development_feedback}",
                    "For your career development, {general_development_feedback}",
                    "Looking at your career trajectory, {general_development_feedback}"
                ],
                "skills": [
                    "To advance in your career, focus on developing these skills: {skill_recommendations}",
                    "The following skills would strengthen your professional profile: {skill_recommendations}",
                    "Consider building competency in: {skill_recommendations}"
                ],
                "education": [
                    "For educational development, {education_recommendations}",
                    "To enhance your qualifications, {education_recommendations}",
                    "Consider these educational opportunities: {education_recommendations}"
                ],
                "industry": [
                    "Based on industry trends, {industry_recommendations}",
                    "Current industry developments suggest {industry_recommendations}",
                    "To stay competitive in your field, {industry_recommendations}"
                ],
                "networking": [
                    "For professional networking, {networking_recommendations}",
                    "To expand your professional connections, {networking_recommendations}",
                    "Consider these networking strategies: {networking_recommendations}"
                ]
            },
            "job_application": {
                "match": [
                    "Your profile matches {match_percentage}% of the requirements for this position. {match_feedback}",
                    "You meet {match_percentage}% of the criteria for this job. {match_feedback}",
                    "Your qualifications align with {match_percentage}% of the job requirements. {match_feedback}"
                ],
                "strengths": [
                    "Your key strengths for this position are: {strengths}",
                    "Your most relevant qualifications for this role include: {strengths}",
                    "For this job, your competitive advantages are: {strengths}"
                ],
                "weaknesses": [
                    "Areas where you could improve for this role: {weaknesses}",
                    "You may want to address these gaps for this position: {weaknesses}",
                    "Consider developing these areas for this job: {weaknesses}"
                ],
                "preparation": [
                    "To prepare for applying, {application_preparation}",
                    "Before submitting your application, {application_preparation}",
                    "To strengthen your candidacy, {application_preparation}"
                ],
                "interview": [
                    "In an interview, be prepared to discuss: {interview_preparation}",
                    "For the interview stage, be ready to address: {interview_preparation}",
                    "Interview preparation should focus on: {interview_preparation}"
                ]
            }
        }
        
        try:
            # Look for template JSON files
            for filename in os.listdir(FEEDBACK_TEMPLATES_DIR):
                if filename.endswith('.json'):
                    category = os.path.splitext(filename)[0]
                    file_path = os.path.join(FEEDBACK_TEMPLATES_DIR, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        templates[category] = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError, OSError) as e:
            print(f"Error loading templates: {e}")
            print("Using default templates instead.")
        
        return templates
    
    def generate_resume_feedback(self, resume_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized feedback based on resume analysis
        
        Args:
            resume_analysis: Analysis data from resume
            
        Returns:
            dict: Structured feedback and recommendations
        """
        feedback = {
            "timestamp": datetime.now().isoformat(),
            "overall_quality": None,
            "sections": {},
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
            "summary": ""
        }
        
        # Extract metrics from analysis
        match_percentage = resume_analysis.get("match_percentage", 0)
        content_score = resume_analysis.get("content_score", 0)
        
        # Determine overall quality
        if match_percentage >= 80:
            quality = "excellent"
        elif match_percentage >= 65:
            quality = "good"
        elif match_percentage >= 50:
            quality = "adequate"
        else:
            quality = "needs improvement"
        
        feedback["overall_quality"] = quality
        
        # Generate section-specific feedback
        sections = ["skills", "experience", "education", "summary"]
        for section in sections:
            section_score = resume_analysis.get(f"{section}_score", 0)
            section_feedback = self._generate_section_feedback(section, section_score)
            feedback["sections"][section] = section_feedback
        
        # Identify strengths and weaknesses
        strengths = resume_analysis.get("strengths", [])
        weaknesses = resume_analysis.get("weaknesses", [])
        feedback["strengths"] = strengths
        feedback["weaknesses"] = weaknesses
        
        # Generate recommendations
        recommendations = []
        
        # Missing keywords recommendation
        missing_keywords = resume_analysis.get("missing_keywords", [])
        if missing_keywords:
            keywords_to_add = ", ".join(missing_keywords[:5])
            recommendations.append(f"Add these keywords to your resume: {keywords_to_add}")
        
        # Section-specific recommendations
        for section, section_data in feedback["sections"].items():
            if section_data.get("score", 0) < 60:
                recommendations.append(section_data.get("recommendation", ""))
        
        # General improvements
        if content_score < 70:
            recommendations.append("Quantify your achievements with specific metrics and numbers")
        
        if not resume_analysis.get("has_summary", False):
            recommendations.append("Add a professional summary to highlight your value proposition")
        
        feedback["recommendations"] = recommendations
        
        # Generate overall summary using template
        general_templates = self.templates.get("resume", {}).get("general", [])
        if general_templates:
            template = random.choice(general_templates)
            main_feedback = "Focus on highlighting your key achievements and relevant skills"
            
            if match_percentage < 50:
                main_feedback = "Consider a significant revision to better showcase your qualifications"
            elif match_percentage < 70:
                main_feedback = "Some targeted improvements could significantly enhance your resume"
            
            summary = template.format(
                resume_quality=quality,
                main_feedback=main_feedback
            )
            feedback["summary"] = summary
        
        return feedback
    
    def _generate_section_feedback(self, section: str, score: float) -> Dict[str, Any]:
        """Generate feedback for a specific resume section"""
        section_feedback = {
            "score": score,
            "quality": None,
            "feedback": "",
            "recommendation": ""
        }
        
        # Determine quality level
        if score >= 80:
            quality = "strong"
        elif score >= 65:
            quality = "good"
        elif score >= 50:
            quality = "adequate"
        else:
            quality = "needs improvement"
        
        section_feedback["quality"] = quality
        
        # Generate feedback based on section type and score
        if section == "skills":
            if score < 50:
                feedback = "lacks specificity and relevance to your target positions"
                recommendation = "Add industry-specific technical skills and keywords"
            elif score < 70:
                feedback = "contains good skills but could be more targeted"
                recommendation = "Prioritize skills most relevant to your desired roles"
            else:
                feedback = "demonstrates strong relevant abilities for your target positions"
                recommendation = "Consider organizing skills by proficiency or category"
        
        elif section == "experience":
            if score < 50:
                feedback = "needs more specific accomplishments and metrics"
                recommendation = "Add measurable achievements and outcomes to each position"
            elif score < 70:
                feedback = "shows good experience but could highlight achievements better"
                recommendation = "Quantify your impact with numbers where possible"
            else:
                feedback = "effectively demonstrates your professional impact and growth"
                recommendation = "Consider tailoring experiences to directly match job descriptions"
        
        elif section == "education":
            if score < 50:
                feedback = "could be enhanced with relevant coursework or achievements"
                recommendation = "Add relevant courses, projects or academic accomplishments"
            elif score < 70:
                feedback = "provides good background but could be more focused"
                recommendation = "Highlight education elements most relevant to your target roles"
            else:
                feedback = "provides a strong foundation for your professional qualifications"
                recommendation = "Consider adding continuing education or certifications"
        
        elif section == "summary":
            if score < 50:
                feedback = "needs to more effectively communicate your value proposition"
                recommendation = "Create a compelling summary statement highlighting your unique value"
            elif score < 70:
                feedback = "introduces you well but could be more impactful"
                recommendation = "Focus your summary on key strengths most relevant to target positions"
            else:
                feedback = "effectively communicates your professional brand and value"
                recommendation = "Keep your summary updated with your most impressive achievements"
        
        else:
            feedback = "could use some refinement"
            recommendation = "Review this section for improvements"
        
        section_feedback["feedback"] = feedback
        section_feedback["recommendation"] = recommendation
        
        return section_feedback
    
    def generate_career_advice(self, user_profile: Dict[str, Any], 
                              assessment_results: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate career development advice based on user profile
        
        Args:
            user_profile: User profile data
            assessment_results: Optional career assessment results
            
        Returns:
            dict: Structured career advice
        """
        advice = {
            "timestamp": datetime.now().isoformat(),
            "short_term": {
                "goals": [],
                "actions": []
            },
            "medium_term": {
                "goals": [],
                "actions": []
            },
            "long_term": {
                "goals": [],
                "actions": []
            },
            "skill_development": [],
            "education": [],
            "industry_insights": [],
            "summary": ""
        }
        
        # Extract profile information
        skills = user_profile.get("skills", [])
        skill_names = [s.get("name") if isinstance(s, dict) else s for s in skills]
        
        experience = user_profile.get("experience", [])
        education = user_profile.get("education", [])
        career_goals = user_profile.get("career_goals", {})
        
        target_role = career_goals.get("target_role", "")
        target_industry = career_goals.get("target_industry", "")
        
        # Calculate experience years (rough estimate)
        total_years = 0
        for exp in experience:
            if isinstance(exp, dict):
                start_date = exp.get("start_date", "")
                end_date = exp.get("end_date", "present")
                
                # Very basic calculation - could be improved
                if start_date:
                    start_year = int(start_date.split("-")[0]) if "-" in start_date else 0
                    end_year = datetime.now().year if end_date == "present" else (
                        int(end_date.split("-")[0]) if "-" in end_date else 0
                    )
                    if start_year > 0 and end_year > 0:
                        total_years += end_year - start_year
        
        # Generate skill development recommendations
        if target_role:
            # Get skill recommendations for target role
            role_skills = self._get_skills_for_role(target_role)
            
            # Identify skill gaps
            skill_gaps = [s for s in role_skills if s.lower() not in [sk.lower() for sk in skill_names]]
            
            # Prioritize skills by importance
            priority_skills = skill_gaps[:3] if len(skill_gaps) > 3 else skill_gaps
            
            if priority_skills:
                advice["skill_development"] = [
                    f"Develop proficiency in {skill}" for skill in priority_skills
                ]
        
        # Short-term goals and actions (0-1 year)
        if total_years < 2:
            # Early career recommendations
            advice["short_term"]["goals"] = [
                "Build foundational skills in your current role",
                "Expand your professional network",
                "Establish performance metrics in your current position"
            ]
            
            advice["short_term"]["actions"] = [
                "Take on additional responsibilities to broaden your experience",
                "Attend industry meetups and connect with peers",
                "Document your achievements with specific metrics"
            ]
        else:
            # More experienced recommendations
            advice["short_term"]["goals"] = [
                "Identify opportunities for leadership in your current role",
                "Expand your influence within your organization",
                "Enhance specialized skills relevant to your career path"
            ]
            
            advice["short_term"]["actions"] = [
                "Lead a small project or initiative",
                "Mentor junior colleagues or new hires",
                "Pursue advanced training in your specialization"
            ]
        
        # Medium-term goals and actions (1-3 years)
        if target_role:
            advice["medium_term"]["goals"] = [
                f"Position yourself for progression toward {target_role}",
                "Build a reputation in your field through contributions",
                "Expand your professional network strategically"
            ]
            
            advice["medium_term"]["actions"] = [
                "Take on projects that align with skills needed for your target role",
                "Speak at industry events or publish articles in your field",
                "Join professional associations relevant to your target role"
            ]
        else:
            advice["medium_term"]["goals"] = [
                "Clarify your long-term career direction",
                "Develop transferable skills for career flexibility",
                "Explore adjacent roles to identify interests"
            ]
            
            advice["medium_term"]["actions"] = [
                "Conduct informational interviews with professionals in roles you admire",
                "Take on cross-functional projects to broaden your experience",
                "Request stretch assignments to test new skill areas"
            ]
        
        # Long-term goals and actions (3-5+ years)
        advice["long_term"]["goals"] = [
            f"Establish yourself as a {target_role}" if target_role else "Reach a senior position in your field",
            "Build a personal brand as an industry expert",
            "Create a sustainable work-life integration"
        ]
        
        advice["long_term"]["actions"] = [
            "Pursue advanced certifications or education in your specialization",
            "Contribute to your field through mentoring, teaching, or publishing",
            "Regularly reassess your career goals against personal priorities"
        ]
        
        # Education recommendations
        highest_education = self._get_highest_education(education)
        
        if highest_education == "high_school":
            advice["education"] = [
                "Consider pursuing an associate's or bachelor's degree in your field",
                "Explore certificate programs to build credentials quickly",
                "Take relevant online courses to fill knowledge gaps"
            ]
        elif highest_education == "associate":
            advice["education"] = [
                "Consider completing a bachelor's degree to open more career options",
                "Pursue industry certifications relevant to your field",
                "Take specialized courses in your area of interest"
            ]
        elif highest_education == "bachelor":
            advice["education"] = [
                "Pursue specialized certifications to deepen expertise",
                "Consider a master's degree if advancing to senior roles",
                "Take executive education courses for management skills"
            ]
        elif highest_education in ["master", "doctorate"]:
            advice["education"] = [
                "Stay current with industry developments through continuing education",
                "Consider specialized certifications for new technologies or methods",
                "Pursue executive education for leadership development"
            ]
        
        # Industry insights
        if target_industry:
            # Get industry trends
            industry_trends = self._get_industry_trends(target_industry)
            
            if industry_trends:
                advice["industry_insights"] = industry_trends
        
        # Generate summary
        general_templates = self.templates.get("career_development", {}).get("general", [])
        if general_templates:
            template = random.choice(general_templates)
            
            # Create general feedback based on career stage
            if total_years < 2:
                general_feedback = "focus on building a strong foundation of skills and professional relationships."
            elif total_years < 5:
                general_feedback = "look for opportunities to specialize and demonstrate leadership within your current role."
            else:
                general_feedback = "consider how to leverage your experience into strategic leadership positions and mentor others."
            
            summary = template.format(general_development_feedback=general_feedback)
            advice["summary"] = summary
        
        return advice
    
    def _get_skills_for_role(self, role_title: str) -> List[str]:
        """Get recommended skills for a specific role"""
        # Check if we have the role in our job data
        for job_id, job_data in self.career_guidance.job_roles.items():
            if job_data.get("title", "").lower() == role_title.lower():
                return job_data.get("required_skills", [])
        
        # Fallback for common roles
        common_skills = {
            "software engineer": ["programming", "software design", "algorithms", "testing", "version control"],
            "data scientist": ["machine learning", "statistics", "python", "data visualization", "sql"],
            "product manager": ["product strategy", "user research", "roadmapping", "stakeholder management", "agile"],
            "marketing manager": ["marketing strategy", "campaign management", "analytics", "content marketing", "social media"],
            "project manager": ["project planning", "risk management", "stakeholder communication", "budget management", "agile"]
        }
        
        for title, skills in common_skills.items():
            if title in role_title.lower():
                return skills
        
        # Generic skills
        return ["communication", "problem solving", "teamwork", "leadership", "time management"]
    
    def _get_highest_education(self, education: List[Dict[str, Any]]) -> str:
        """Determine highest level of education from profile"""
        education_levels = {
            "high_school": 1,
            "associate": 2,
            "bachelor": 3,
            "master": 4,
            "doctorate": 5
        }
        
        highest_level = "high_school"
        highest_value = 0
        
        for edu in education:
            if isinstance(edu, dict):
                degree = edu.get("degree", "").lower()
                
                # Try to determine level from degree
                level = None
                if any(x in degree for x in ["phd", "doctorate", "doctor"]):
                    level = "doctorate"
                elif any(x in degree for x in ["master", "mba", "ms", "ma"]):
                    level = "master"
                elif any(x in degree for x in ["bachelor", "bs", "ba", "bsc"]):
                    level = "bachelor"
                elif any(x in degree for x in ["associate", "aa", "as"]):
                    level = "associate"
                elif any(x in degree for x in ["high school", "diploma", "ged"]):
                    level = "high_school"
                
                # If we found a level and it's higher than current highest
                if level and education_levels.get(level, 0) > highest_value:
                    highest_level = level
                    highest_value = education_levels[level]
        
        return highest_level
    
    def _get_industry_trends(self, industry: str) -> List[str]:
        """Get industry trends and insights"""
        industry_trends = {
            "technology": [
                "AI and machine learning are transforming many technical roles",
                "Remote work continues to expand opportunities for tech professionals",
                "Cloud computing skills remain in high demand across the industry"
            ],
            "finance": [
                "Fintech is disrupting traditional financial services",
                "Data analytics is becoming essential for financial analysis",
                "Regulatory expertise is increasingly valued as compliance requirements grow"
            ],
            "healthcare": [
                "Telehealth is expanding rapidly and creating new roles",
                "Health informatics professionals are in growing demand",
                "Patient experience specialists are becoming essential in healthcare organizations"
            ],
            "marketing": [
                "Digital marketing analytics skills are increasingly essential",
                "Content marketing continues to expand in importance",
                "Marketing automation expertise is in high demand"
            ],
            "manufacturing": [
                "Industry 4.0 technologies are transforming production environments",
                "Sustainable manufacturing practices are becoming competitive advantages",
                "Supply chain expertise has increased in importance"
            ]
        }
        
        for ind, trends in industry_trends.items():
            if ind in industry.lower():
                return trends
        
        # Generic if no match
        return [
            "Digital transformation is affecting jobs across all industries",
            "Soft skills like adaptability and communication are increasingly valued",
            "Remote and flexible work arrangements are becoming more common"
        ]
    
    def generate_interview_prep(self, job_description: str, 
                               resume_analysis: Dict[str, Any],
                               job_title: str) -> Dict[str, Any]:
        """
        Generate interview preparation recommendations
        
        Args:
            job_description: Job description text
            resume_analysis: Analysis of user's resume
            job_title: Job title
            
        Returns:
            dict: Interview preparation suggestions
        """
        prep = {
            "common_questions": [],
            "technical_topics": [],
            "strengths_to_highlight": [],
            "challenges_to_address": [],
            "questions_to_ask": [],
            "research_suggestions": []
        }
        
        # Extract matching and missing keywords
        matching_keywords = resume_analysis.get("matching_keywords", [])
        missing_keywords = resume_analysis.get("missing_keywords", [])
        
        # Identify strengths and weaknesses
        strengths = matching_keywords[:5] if matching_keywords else []
        weaknesses = missing_keywords[:3] if missing_keywords else []
        
        # Generate common questions based on job title
        common_qs = self._get_common_questions(job_title)
        prep["common_questions"] = common_qs
        
        # Technical topics based on keywords
        all_keywords = matching_keywords + missing_keywords
        technical_topics = []
        for keyword in all_keywords:
            if keyword.lower() not in [t.lower() for t in technical_topics]:
                technical_topics.append(keyword)
        
        prep["technical_topics"] = technical_topics[:7]  # Limit to 7 topics
        
        # Strengths to highlight
        for strength in strengths:
            prep["strengths_to_highlight"].append(
                f"Your experience with {strength} - prepare specific examples"
            )
        
        # If we have few strengths, add some general ones
        if len(prep["strengths_to_highlight"]) < 3:
            prep["strengths_to_highlight"].extend([
                "Your ability to work effectively in teams - bring examples",
                "Your problem-solving approach - prepare a structured explanation",
                "Your communication skills - have examples of complex ideas you explained well"
            ])
        
        # Challenges to address
        for weakness in weaknesses:
            prep["challenges_to_address"].append(
                f"Limited experience with {weakness} - prepare to discuss related experience or learning plans"
            )
        
        # Questions to ask
        prep["questions_to_ask"] = [
            "What would success look like in this role after the first 90 days?",
            "Can you describe the team structure and how this role fits in?",
            "What are the biggest challenges facing this team/department currently?",
            "How would you describe the company culture?",
            "What opportunities are there for professional development?",
            "What is your timeline for making a decision about this position?"
        ]
        
        # Research suggestions
        prep["research_suggestions"] = [
            "Research the company's recent news, announcements, and press releases",
            "Review the company's products/services and understand their market position",
            "Look up your interviewers on LinkedIn to understand their backgrounds",
            "Research industry trends and challenges to discuss intelligently",
            "Review the company's mission, vision, and values from their website"
        ]
        
        return prep
    
    def _get_common_questions(self, job_title: str) -> List[str]:
        """Get common interview questions for a role"""
        # Generic questions for all roles
        generic_questions = [
            "Tell me about yourself and your experience.",
            "Why are you interested in this position?",
            "Why do you want to work for our company?",
            "What are your greatest strengths?",
            "What do you consider to be your weaknesses?",
            "Describe a challenging work situation and how you handled it.",
            "Where do you see yourself in five years?",
            "Why should we hire you?",
            "Tell me about a time you demonstrated leadership.",
            "How do you handle pressure and stress?"
        ]
        
        # Role-specific questions
        role_questions = {
            "software engineer": [
                "Explain your approach to debugging a complex issue.",
                "How do you ensure your code is maintainable and scalable?",
                "Describe your experience with code reviews.",
                "How do you stay current with new technologies and frameworks?",
                "Describe a project where you had to learn a new technology quickly."
            ],
            "data scientist": [
                "Explain a complex analysis to a non-technical stakeholder.",
                "How do you validate the accuracy of your models?",
                "Describe a project where you derived actionable insights from data.",
                "How do you handle missing or incomplete data?",
                "What metrics do you use to evaluate model performance?"
            ],
            "product manager": [
                "How do you prioritize features for a product?",
                "Describe how you gather and incorporate user feedback.",
                "Tell me about a product you successfully launched.",
                "How do you work with engineering teams to deliver features?",
                "How do you measure the success of a product or feature?"
            ],
            "marketing": [
                "Describe a successful marketing campaign you developed.",
                "How do you measure the ROI of marketing initiatives?",
                "How do you identify and target your audience?",
                "How do you keep up with changing marketing trends?",
                "Tell me about a marketing effort that didn't work and what you learned."
            ],
            "sales": [
                "Describe your sales process from prospect to close.",
                "How do you handle objections from potential clients?",
                "Tell me about your most significant sale.",
                "How do you build relationships with clients?",
                "What CRM systems are you familiar with?"
            ]
        }
        
        # Find matching role questions
        for role, questions in role_questions.items():
            if role in job_title.lower():
                return generic_questions + questions
        
        # Return generic if no match
        return generic_questions


# Standalone functions for feedback generation

def generate_resume_feedback(resume_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate feedback for a resume
    
    Args:
        resume_analysis: Analysis data from resume analysis
        
    Returns:
        dict: Feedback and recommendations
    """
    engine = FeedbackEngine()
    return engine.generate_resume_feedback(resume_analysis)


def generate_career_advice(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate career development advice
    
    Args:
        user_profile: User profile data
        
    Returns:
        dict: Career advice and recommendations
    """
    engine = FeedbackEngine()
    return engine.generate_career_advice(user_profile)


def generate_interview_preparation(job_description: str, 
                                  resume_analysis: Dict[str, Any],
                                  job_title: str) -> Dict[str, Any]:
    """
    Generate interview preparation guidance
    
    Args:
        job_description: Job description text
        resume_analysis: Analysis of user's resume
        job_title: Job title
        
    Returns:
        dict: Interview preparation suggestions
    """
    engine = FeedbackEngine()
    return engine.generate_interview_prep(job_description, resume_analysis, job_title) 