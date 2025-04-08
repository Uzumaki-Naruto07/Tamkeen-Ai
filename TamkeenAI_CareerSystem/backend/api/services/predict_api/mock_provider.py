"""
MockDataProvider - Generate realistic mock responses for API endpoints

This module provides mock responses for various API endpoints when
actual API keys are not available or when API calls fail.
"""

import random
import json
import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime

# Setup logger
logger = logging.getLogger(__name__)

class MockDataProvider:
    """
    Provides realistic mock data for API endpoints.
    
    This class generates mock responses that mimic the structure and content
    of real API responses, allowing development and testing to proceed
    without requiring actual API keys.
    """
    
    def __init__(self, provider: str = 'deepseek'):
        """
        Initialize the mock data provider.
        
        Args:
            provider: Provider name to mimic ('deepseek', 'openai', etc.)
        """
        self.provider = provider.lower()
        logger.info(f"Initialized mock data provider for {provider}")
        
        # Track usage metrics
        self.metrics = {
            'total_requests': 0,
            'requests_by_endpoint': {}
        }
    
    def get_mock_response(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get a mock response for a specific endpoint.
        
        Args:
            endpoint: Endpoint name ('chat', 'resume_analysis', etc.)
            data: Request data
            
        Returns:
            Dictionary with mock response data
        """
        # Update metrics
        self.metrics['total_requests'] += 1
        self.metrics['requests_by_endpoint'][endpoint] = self.metrics['requests_by_endpoint'].get(endpoint, 0) + 1
        
        # Log the mock request
        logger.debug(f"Mock request to {endpoint} endpoint with provider {self.provider}")
        
        # Dispatch to the appropriate mock handler
        if endpoint == 'chat':
            return self._mock_chat_completion(data)
        elif endpoint == 'resume_analysis':
            return self._mock_resume_analysis(data)
        elif endpoint == 'job_matching':
            return self._mock_job_matching(data)
        elif endpoint == 'interview_coaching':
            return self._mock_interview_coaching(data)
        elif endpoint == 'career_advice':
            return self._mock_career_advice(data)
        else:
            logger.warning(f"No mock handler for endpoint {endpoint}, using generic response")
            return self._mock_generic_response(endpoint, data)
    
    def _mock_chat_completion(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock chat completion response."""
        messages = data.get('messages', [])
        model = data.get('model', 'mock-model')
        
        # Extract the last user message
        last_message = None
        for message in reversed(messages):
            if message.get('role') == 'user':
                last_message = message.get('content', '')
                break
        
        # Generate appropriate response based on content
        if last_message:
            # Check for common question patterns
            response_content = self._generate_appropriate_chat_response(last_message)
        else:
            response_content = "I don't have enough context to provide a meaningful response. Could you please provide more details?"
        
        # Add small random delay to simulate API call
        time.sleep(random.uniform(0.5, 1.5))
        
        return {
            'content': response_content,
            'model': model,
            'provider': f"mock-{self.provider}",
            'created_at': datetime.now().isoformat(),
            'id': f"mock-{random.randint(1000000, 9999999)}",
            'response_time_ms': int(random.uniform(300, 800))
        }
    
    def _generate_appropriate_chat_response(self, message: str) -> str:
        """Generate an appropriate response based on the message content."""
        message_lower = message.lower()
        
        # Job search related
        if any(term in message_lower for term in ['job', 'career', 'work', 'employment']):
            return "Based on current job market trends, focusing on in-demand skills like data analysis, cloud computing, and digital marketing can improve your job prospects. Consider creating a targeted resume that highlights specific achievements relevant to each application."
        
        # Resume related
        elif any(term in message_lower for term in ['resume', 'cv', 'application']):
            return "Your resume should highlight quantifiable achievements rather than just listing responsibilities. Consider using a clean, professional format with clear section headings. Tailor your resume for each job application to match the specific requirements in the job description."
        
        # Interview related
        elif any(term in message_lower for term in ['interview', 'hiring', 'recruiter']):
            return "Prepare for interviews by researching the company, practicing common questions, and preparing examples of your achievements using the STAR method (Situation, Task, Action, Result). Remember to prepare thoughtful questions to ask the interviewer as well."
        
        # Skills related
        elif any(term in message_lower for term in ['skill', 'learn', 'training', 'course']):
            return "Continuous learning is essential in today's job market. Consider platforms like Coursera, LinkedIn Learning, or specialized bootcamps to develop in-demand skills. Focus on both technical and soft skills like communication and problem-solving."
        
        # Networking related
        elif any(term in message_lower for term in ['network', 'connection', 'linkedin']):
            return "Effective networking can open many opportunities. Maintain an updated LinkedIn profile, engage with industry content, and reach out to connections for informational interviews. Attend industry events and join professional groups relevant to your field."
        
        # General career advice
        else:
            return "Career development is both a marathon and a sprint. Focus on building valuable skills, maintaining a strong professional network, and staying adaptable to industry changes. Regular self-assessment and setting clear, achievable goals will help you progress steadily."
    
    def _mock_resume_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock resume analysis response."""
        # Simulated resume analysis results
        score = random.randint(65, 85)
        
        matching_keywords = [
            "project management", "team leadership", "agile methodology", 
            "stakeholder communication", "requirements gathering", 
            "data analysis", "problem solving", "strategic planning"
        ]
        
        missing_keywords = [
            "scrum master", "product roadmap", "budget management",
            "risk assessment", "PMP certification", "KPI tracking"
        ]
        
        # Randomize which keywords are included
        random.shuffle(matching_keywords)
        random.shuffle(missing_keywords)
        
        return {
            'score': score,
            'matching_keywords': matching_keywords[:random.randint(3, 6)],
            'missing_keywords': missing_keywords[:random.randint(2, 4)],
            'analysis': ("Your resume shows strong project management and leadership skills. "
                        "Consider adding more specific metrics and achievements. "
                        "The format is ATS-friendly, but you could improve keyword optimization."),
            'recommendations': [
                "Add more measurable achievements with specific numbers",
                "Include relevant certifications in a dedicated section",
                "Optimize with more industry-specific keywords",
                "Improve the professional summary to be more impactful"
            ],
            'sections_analysis': {
                'experience': {'score': random.randint(70, 90), 'feedback': "Well structured but could use more metrics"},
                'education': {'score': random.randint(80, 95), 'feedback': "Clearly presented and relevant"},
                'skills': {'score': random.randint(60, 80), 'feedback': "Add more technical skills relevant to the job"}
            }
        }
    
    def _mock_job_matching(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock job matching response."""
        # Sample job titles and companies
        job_titles = [
            "Senior Software Engineer", "Product Manager", "Data Scientist",
            "UX Designer", "Marketing Specialist", "Project Coordinator",
            "Business Analyst", "DevOps Engineer", "Financial Analyst"
        ]
        
        companies = [
            "TechInnovate", "GlobalSoft Solutions", "DataVision Analytics",
            "CreativeDesign Co", "MarketEdge", "ProjectFlow Inc",
            "AnalyticsPlus", "CloudOps Technologies", "FinancePro Services"
        ]
        
        # Generate random matches
        num_matches = random.randint(3, 7)
        matches = []
        
        for i in range(num_matches):
            match_score = random.randint(70, 95)
            matches.append({
                'job_id': f"job-{random.randint(1000, 9999)}",
                'title': random.choice(job_titles),
                'company': random.choice(companies),
                'location': random.choice(["Remote", "Dubai", "Abu Dhabi", "Sharjah", "Hybrid"]),
                'match_score': match_score,
                'salary_range': f"${random.randint(70, 150)}K - ${random.randint(150, 220)}K",
                'posted_date': (datetime.now().date().isoformat()),
                'matching_skills': random.randint(5, 12),
                'total_skills': random.randint(12, 18)
            })
        
        # Sort by match score
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return {
            'matches': matches,
            'total_matches': len(matches),
            'match_quality': "high" if matches[0]['match_score'] > 85 else "medium",
            'recommendations': [
                "Consider highlighting your Python skills for these roles",
                "Adding a project management certification could increase matches by 20%",
                "These roles typically require strong communication skills"
            ]
        }
    
    def _mock_interview_coaching(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock interview coaching response."""
        user_response = data.get('user_response', '')
        question = data.get('question', '')
        
        feedback_templates = [
            "Your answer effectively highlighted your experience, but could include more specific metrics to quantify your achievements.",
            "Good structure in your response. Consider using the STAR method more explicitly to frame your example.",
            "You communicated your skills clearly. To improve, add more context about how your work impacted the business goals.",
            "Your answer was concise, which is good, but adding a brief example would make it more compelling.",
            "Excellent use of specific examples. To enhance further, connect your experience more directly to the requirements of this role."
        ]
        
        strengths_templates = [
            "Clear communication of key points",
            "Good structure and logical flow",
            "Effective use of specific examples",
            "Demonstrates relevant expertise",
            "Shows problem-solving abilities",
            "Highlights teamwork and collaboration",
            "Conveys enthusiasm and motivation",
            "Addresses the question directly"
        ]
        
        improvements_templates = [
            "Include more quantifiable achievements",
            "Use the STAR method more explicitly",
            "Connect experiences to the job requirements",
            "Be more concise in your opening statement",
            "Elaborate more on your specific contributions",
            "Address potential concerns proactively",
            "Include more industry-specific terminology",
            "End with a stronger concluding statement"
        ]
        
        # Randomly select feedback elements
        feedback = random.choice(feedback_templates)
        strengths = random.sample(strengths_templates, k=random.randint(2, 4))
        improvements = random.sample(improvements_templates, k=random.randint(1, 3))
        
        return {
            'feedback': feedback,
            'strengths': strengths,
            'areas_for_improvement': improvements,
            'overall_score': random.randint(7, 9),
            'confidence_score': random.randint(65, 95),
            'relevance_score': random.randint(70, 95),
            'clarity_score': random.randint(75, 95),
            'suggested_answer': "A strong response would include a specific example of a challenge you faced, your approach to solving it, and the measurable results you achieved. Framing your experience in the context of the role you're applying for would make it even more impactful."
        }
    
    def _mock_career_advice(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock career advice response."""
        user_question = data.get('question', '')
        user_background = data.get('background', {})
        
        advice_templates = [
            {
                'title': "Transitioning to Data Science",
                'content': "Based on your background in analytics, transitioning to data science is achievable with focused upskilling. Consider developing your skills in Python, machine learning algorithms, and statistical analysis through online courses or bootcamps. Create portfolio projects that demonstrate your ability to solve real business problems with data. Networking with data scientists and contributing to open-source projects can also help you break into the field.",
                'resources': ["Coursera Machine Learning Specialization", "DataCamp", "Kaggle Competitions", "GitHub Portfolio"]
            },
            {
                'title': "Moving into Management",
                'content': "Your strong technical background provides a solid foundation for moving into management. Focus on developing leadership skills by taking on project lead roles or mentoring junior team members. Consider courses in people management, business communication, and strategic planning. A management certification like PMP could be valuable. Discuss your career goals with your current manager and seek opportunities to demonstrate leadership within your organization.",
                'resources': ["PMI Project Management Professional (PMP)", "LinkedIn Learning Leadership Courses", "Harvard Business Review Articles", "Toastmasters for Communication Skills"]
            },
            {
                'title': "Career Pivot to UX/UI Design",
                'content': "Transitioning to UX/UI design leverages your understanding of user needs while adding creative elements. Start by learning design fundamentals, user research methods, and industry-standard tools like Figma or Adobe XD. Create a portfolio showcasing your design process and solutions to real problems. Consider a specialized bootcamp or certificate program in UX design. Your existing technical knowledge will be valuable in collaborating with development teams.",
                'resources': ["Google UX Design Certificate", "Interaction Design Foundation Courses", "Figma Tutorials", "Behance for Portfolio Inspiration"]
            },
            {
                'title': "Freelancing and Independent Consulting",
                'content': "Your specialized skills create opportunities for freelancing or consulting. Start by defining your service offerings and target clientele. Build an online presence through a professional website and LinkedIn profile highlighting your expertise. Consider starting with smaller projects on platforms like Upwork or through your network while building a reputation. Focus on delivering exceptional value and gathering testimonials to grow your business.",
                'resources': ["Upwork", "Fiverr Professional", "Freelancers Union", "LinkedIn ProFinder", "Client Contract Templates"]
            }
        ]
        
        # Select a random advice template
        selected_advice = random.choice(advice_templates)
        
        return {
            'title': selected_advice['title'],
            'advice': selected_advice['content'],
            'recommended_resources': selected_advice['resources'],
            'suggested_skills_to_develop': ["Communication", "Strategic thinking", "Technical expertise in " + random.choice(["Python", "SQL", "JavaScript", "Cloud technologies", "UX research"])],
            'estimated_timeline': random.choice(["3-6 months", "6-12 months", "1-2 years"]),
            'industry_insights': "The job market is showing strong demand for professionals with combined technical and business skills. Remote work opportunities continue to expand, offering more flexibility in career choices."
        }
    
    def _mock_generic_response(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a generic mock response for any endpoint."""
        return {
            'status': 'success',
            'message': f"Mock response for {endpoint} endpoint",
            'provider': f"mock-{self.provider}",
            'mock_id': f"mock-{random.randint(1000000, 9999999)}",
            'timestamp': datetime.now().isoformat(),
            'data': {
                'result': "This is a generic mock response with simulated data.",
                'confidence': random.randint(70, 95),
                'processing_time_ms': int(random.uniform(200, 800))
            }
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get usage metrics for the mock provider."""
        return self.metrics 