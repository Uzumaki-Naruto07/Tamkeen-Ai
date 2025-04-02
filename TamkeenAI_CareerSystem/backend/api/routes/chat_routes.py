"""
Chat Routes Module

This module provides API routes for integrating with ChatGPT and other language models.
"""

import os
import json
import logging
from flask import Blueprint, request, jsonify, g
from datetime import datetime
import re

# Import utilities
from api.utils.date_utils import now
from api.utils.api_utils import api_response, error_response, validate_request

# Import auth decorators
from api.utils.auth import auth_required, get_current_user

# Import services
from api.services.llm_service import query_deepseek, get_chatbot_response, query_llm_provider

# Setup logger
logger = logging.getLogger(__name__)

# Import OpenAI client
try:
    from ..utils.openai_config import get_openai_client
    # Get OpenAI client from centralized config
    client = get_openai_client()
    if not client:
        logger.warning("OpenAI client initialization failed - chatbot capabilities will be limited.")
except Exception as e:
    logger.warning(f"Error importing OpenAI client: {str(e)}")
    client = None

# Create blueprint
chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/ai/recommendation', methods=['POST'])
@auth_required
def ai_recommendation():
    """
    Multi-provider AI recommendation endpoint
    Supports different AI backends including OpenAI, DeepSeek, Llama3, and local models
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Invalid request data", 400)
        
        # Validate required fields
        required_fields = ['message']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}", 400)
        
        # Get fields from request
        message = data.get('message', '')
        context = data.get('context', '')
        provider = data.get('provider', 'openai')  # Default to OpenAI
        model = data.get('model', None)  # Model is optional, provider may have defaults
        type_request = data.get('type', 'general')
        language = data.get('language', 'en')
        temperature = data.get('temperature', 0.7)
        
        # Get user ID from token
        user_id = get_current_user()
        
        # Log the request
        logger.info(f"AI recommendation request from user {user_id} using provider {provider}")
        
        # Construct messages for the LLM
        system_message = ""
        
        # Set appropriate system message based on request type and language
        if language == 'ar':
            if type_request == 'career':
                system_message = """أنت مستشار مهني ذكي يتحدث اللغة العربية. قدم نصائح مهنية مفيدة وعملية. تتضمن نصائحك خطوات عملية للتقدم المهني والمهارات المطلوبة والشهادات المهنية والاتجاهات في سوق العمل. كن دقيقًا ومحددًا وغنيًا بالمعلومات."""
            elif type_request == 'resume':
                system_message = """أنت خبير في تحسين السيرة الذاتية يتحدث اللغة العربية. قدم نصائح عملية لتحسين السيرة الذاتية والتقدم المهني. اجعل اقتراحاتك محددة وقابلة للتنفيذ."""
            elif type_request == 'recommendation':
                system_message = """أنت مساعد ذكي يتحدث اللغة العربية. استجب بمعلومات مفيدة ودقيقة حول السؤال المطروح. اجعل إجابتك محددة ومناسبة للسياق المقدم."""
            else:
                system_message = """أنت مساعد ذكي يتحدث اللغة العربية. قدم استجابات مفيدة ومناسبة استنادًا إلى السؤال. كن محددًا وواضحًا في إجابتك."""
        else:
            if type_request == 'career':
                system_message = """You are an intelligent career advisor. Provide helpful and actionable career advice. Your advice includes practical steps for career advancement, required skills, professional certifications, and job market trends. Be precise, specific, and information-rich."""
            elif type_request == 'resume':
                system_message = """You are a resume improvement expert. Provide practical advice for resume enhancement and career progression. Make your suggestions specific and actionable."""
            elif type_request == 'recommendation':
                system_message = """You are an intelligent assistant. Respond with helpful and accurate information about the question at hand. Make your answer specific and appropriate to the context provided."""
            else:
                system_message = """You are an intelligent assistant. Provide helpful and relevant responses based on the question. Be specific and clear in your answer."""
        
        # Add context to system message if provided
        if context:
            system_message += f"\n\nContext: {context}"
        
        # Create messages array for the LLM
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": message}
        ]
        
        # Call the multi-provider LLM service
        result = query_llm_provider(
            messages=messages,
            provider=provider,
            model=model,
            temperature=temperature
        )
        
        # Check if the request was successful
        if result["success"]:
            # Return successful response
            return api_response({
                "response": result["content"],
                "provider": result["provider"],
                "model": result.get("model", ""),
                "timestamp": now()
            })
        else:
            logger.error(f"Error using AI provider: {result['error']}")
            
            # Fallback to local implementation if provider fails
            try:
                if type_request == 'career':
                    # Try our specialized career function
                    fallback_response = get_chatbot_response(message, language)
                else:
                    # Try DeepSeek as fallback option
                    fallback_response = query_deepseek(message, language)
                
                return api_response({
                    "response": fallback_response,
                    "provider": "fallback",
                    "timestamp": now(),
                    "fallback_used": True
                })
            except Exception as fallback_error:
                logger.error(f"Fallback also failed: {str(fallback_error)}")
                
                # Last resort fallback
                default_response = "I'm sorry, I couldn't process your request at this time. Please try again later."
                if language == 'ar':
                    default_response = "آسف، لم أتمكن من معالجة طلبك في هذا الوقت. يرجى المحاولة مرة أخرى لاحقًا."
                
                return api_response({
                    "response": default_response,
                    "provider": "error",
                    "timestamp": now(),
                    "error": str(result['error'])
                })
    
    except Exception as e:
        logger.error(f"Error in ai_recommendation: {str(e)}")
        return error_response(f"Failed to process message: {str(e)}", 500)


@chat_bp.route('/message', methods=['POST'])
@auth_required
def send_message():
    """Send a message to the chatbot and get a response"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Invalid request data", 400)
        
        # Validate required fields
        required_fields = ['message']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}", 400)
        
        # Get fields from request
        message = data['message']
        context = data.get('context', '')
        service_type = data.get('service_type', 'general')
        language = data.get('language', 'en')
        
        # Get user ID from token
        user_id = get_current_user()
        
        # Log the request
        logger.info(f"Chat request from user {user_id}: {message[:50]}...")
        
        # Choose the language model based on availability
        if os.getenv('ENABLE_DEEPSEEK', 'false').lower() == 'true' and os.getenv('DEEPSEEK_API_KEY'):
            # Use DeepSeek model
            response_text = query_deepseek(message, language)
        else:
            # Use fallback to get_chatbot_response
            response_text = get_chatbot_response(message, language)
        
        # Log the response
        logger.info(f"Chat response to user {user_id}: {response_text[:50]}...")
        
        # Save the conversation to database (would be implemented in a real app)
        # save_conversation(user_id, message, response_text, service_type)
        
        # Return response
        return api_response({
            "response": response_text,
            "timestamp": now()
        })
    
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}")
        return error_response(f"Failed to process message: {str(e)}", 500)


@chat_bp.route('/resume/improve', methods=['POST'])
@auth_required
def improve_resume():
    """Get resume improvement suggestions"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Invalid request data", 400)
        
        # Validate required fields
        required_fields = ['resume_content']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}", 400)
        
        # Get fields from request
        resume_content = data['resume_content']
        job_description = data.get('job_description', '')
        language = data.get('language', 'en')
        
        # Get user ID from token
        user_id = get_current_user()
        
        # Build the prompt for the model
        if language == 'ar':
            system_prompt = "أنت مستشار موارد بشرية ومتخصص في تحسين السيرة الذاتية. سيتم تقديم سيرة ذاتية وربما وصف وظيفي. قدم اقتراحات مفصلة لتحسين السيرة الذاتية. ركز على: 1) الكلمات المفتاحية المفقودة، 2) البنية والتنسيق، 3) التحسينات اللغوية، 4) المهارات الإضافية، 5) الإنجازات لإضافتها."
            user_prompt = f"قم بتحليل السيرة الذاتية التالية:\n\n{resume_content}\n\n"
            if job_description:
                user_prompt += f"مقابل وصف الوظيفة التالي:\n\n{job_description}\n\n"
            user_prompt += "قدم تحليلاً شاملاً واقتراحات للتحسين مقسمة حسب الأقسام."
        else:
            system_prompt = "You are an HR consultant and resume improvement specialist. You will be provided with a resume and possibly a job description. Provide detailed suggestions to improve the resume. Focus on: 1) missing keywords, 2) structure and formatting, 3) language improvements, 4) additional skills to highlight, 5) achievements to add."
            user_prompt = f"Analyze the following resume:\n\n{resume_content}\n\n"
            if job_description:
                user_prompt += f"Against the following job description:\n\n{job_description}\n\n"
            user_prompt += "Provide a comprehensive analysis and suggestions for improvement organized by sections."
        
        try:
            # Use OpenAI to analyze the resume
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            suggestions = response.choices[0].message.content
            
            # Parse the suggestions into structured format if possible
            structured_suggestions = parse_suggestions(suggestions)
            
            return api_response({
                "suggestions": structured_suggestions,
                "raw_suggestions": suggestions,
                "timestamp": now()
            })
        
        except Exception as e:
            logger.error(f"Error using OpenAI: {str(e)}")
            
            # Fallback to DeepSeek or basic suggestions
            if os.getenv('ENABLE_DEEPSEEK', 'false').lower() == 'true' and os.getenv('DEEPSEEK_API_KEY'):
                suggestions = query_deepseek(user_prompt, language)
                return api_response({
                    "suggestions": parse_suggestions(suggestions),
                    "raw_suggestions": suggestions,
                    "timestamp": now()
                })
            else:
                # Very basic fallback
                return api_response({
                    "suggestions": {
                        "general": [
                            "Make sure your resume is tailored to the specific job",
                            "Quantify your achievements with numbers when possible",
                            "Use action verbs and keywords from the job description"
                        ],
                        "structure": [
                            "Ensure consistent formatting throughout"
                        ],
                        "content": [
                            "Focus on achievements rather than just duties"
                        ]
                    },
                    "timestamp": now()
                })
    
    except Exception as e:
        logger.error(f"Error in improve_resume: {str(e)}")
        return error_response(f"Failed to analyze resume: {str(e)}", 500)


@chat_bp.route('/cover-letter/generate', methods=['POST'])
@auth_required
def generate_cover_letter():
    """Generate a cover letter based on user profile and job description"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Invalid request data", 400)
        
        # Validate required fields
        required_fields = ['user_profile', 'job_description']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}", 400)
        
        # Get fields from request
        user_profile = data['user_profile']
        job_description = data['job_description']
        company_name = data.get('company_name', 'the company')
        language = data.get('language', 'en')
        
        # Get user ID from token
        user_id = get_current_user()
        
        # Build the prompt for the model
        if language == 'ar':
            system_prompt = "أنت كاتب محترف متخصص في كتابة خطابات التغطية. ستحصل على معلومات من ملف المستخدم ووصف الوظيفة. اكتب خطاب تغطية مقنع ومخصص يظهر مدى ملاءمة المرشح للوظيفة."
            user_prompt = f"اكتب خطاب تغطية لـ {company_name} بناءً على ملف المستخدم التالي:\n\n{json.dumps(user_profile, ensure_ascii=False)}\n\nووصف الوظيفة التالي:\n\n{job_description}\n\nيجب أن يظهر الخطاب المهارات والخبرات ذات الصلة ويركز على تطابق المرشح مع متطلبات الوظيفة."
        else:
            system_prompt = "You are a professional writer specializing in cover letters. You will be given user profile information and a job description. Write a persuasive, personalized cover letter that demonstrates the candidate's fit for the position."
            user_prompt = f"Write a cover letter for {company_name} based on the following user profile:\n\n{json.dumps(user_profile)}\n\nAnd the following job description:\n\n{job_description}\n\nThe letter should highlight relevant skills and experiences and focus on the candidate's match with the job requirements."
        
        try:
            # Use OpenAI to generate the cover letter
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            cover_letter = response.choices[0].message.content
            
            return api_response({
                "cover_letter": cover_letter,
                "timestamp": now()
            })
                
        except Exception as e:
            logger.error(f"Error using OpenAI: {str(e)}")
            
            # Fallback to DeepSeek
            if os.getenv('ENABLE_DEEPSEEK', 'false').lower() == 'true' and os.getenv('DEEPSEEK_API_KEY'):
                cover_letter = query_deepseek(user_prompt, language)
                return api_response({
                    "cover_letter": cover_letter,
                    "timestamp": now()
                })
            return error_response("Failed to generate cover letter. AI service unavailable.", 503)
    
    except Exception as e:
        logger.error(f"Error in generate_cover_letter: {str(e)}")
        return error_response(f"Failed to generate cover letter: {str(e)}", 500)


@chat_bp.route('/interview/questions', methods=['POST'])
@auth_required
def get_interview_questions():
    """Get mock interview questions based on job title and skills"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Invalid request data", 400)
        
        # Validate required fields
        required_fields = ['job_title']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}", 400)
        
        # Get fields from request
        job_title = data['job_title']
        skills = data.get('skills', [])
        difficulty = data.get('difficulty', 'medium')
        count = data.get('count', 5)
        language = data.get('language', 'en')
        
        # Get user ID from token
        user_id = get_current_user()
        
        # Build the prompt for the model
        if language == 'ar':
            system_prompt = "أنت مدير توظيف ذو خبرة تقوم بإجراء مقابلات عمل. قم بإنشاء أسئلة مقابلة عمل واقعية استنادًا إلى المعلومات المقدمة."
            user_prompt = f"قم بإنشاء {count} أسئلة مقابلة عمل للمنصب: {job_title}.\n"
            if skills:
                skills_str = "، ".join(skills)
                user_prompt += f"المهارات المطلوبة: {skills_str}.\n"
            user_prompt += f"مستوى الصعوبة: {difficulty}.\n"
            user_prompt += "قم بتنظيم الأسئلة حسب الفئة (مثل: تقنية، سلوكية، إلخ) وتضمين الغرض من كل سؤال."
        else:
            system_prompt = "You are an experienced hiring manager conducting job interviews. Create realistic interview questions based on the provided information."
            user_prompt = f"Create {count} interview questions for the position: {job_title}.\n"
            if skills:
                skills_str = ", ".join(skills)
                user_prompt += f"Required skills: {skills_str}.\n"
            user_prompt += f"Difficulty level: {difficulty}.\n"
            user_prompt += "Organize the questions by category (e.g., technical, behavioral, etc.) and include the purpose of each question."
        
        try:
            # Use OpenAI to generate interview questions
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            questions_text = response.choices[0].message.content
            
            # Parse the questions into structured format
            structured_questions = parse_interview_questions(questions_text)
            
            return api_response({
                "questions": structured_questions,
                "raw_response": questions_text,
                "timestamp": now()
            })
        
        except Exception as e:
            logger.error(f"Error using OpenAI: {str(e)}")
            
            # Fallback to DeepSeek
            if os.getenv('ENABLE_DEEPSEEK', 'false').lower() == 'true' and os.getenv('DEEPSEEK_API_KEY'):
                questions_text = query_deepseek(user_prompt, language)
                return api_response({
                    "questions": parse_interview_questions(questions_text),
                    "raw_response": questions_text,
                    "timestamp": now()
                })
            return error_response("Failed to generate interview questions. AI service unavailable.", 503)
    
    except Exception as e:
        logger.error(f"Error in get_interview_questions: {str(e)}")
        return error_response(f"Failed to generate interview questions: {str(e)}", 500)


@chat_bp.route('/interview/feedback', methods=['POST'])
@auth_required
def get_answer_feedback():
    """Get feedback on interview answer"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Invalid request data", 400)
        
        # Validate required fields
        required_fields = ['question', 'answer']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}", 400)
        
        # Get fields from request
        question = data['question']
        answer = data['answer']
        job_title = data.get('job_title', '')
        language = data.get('language', 'en')
        
        # Get user ID from token
        user_id = get_current_user()
        
        # Build the prompt for the model
        if language == 'ar':
            system_prompt = "أنت مدرب مقابلات عمل ذو خبرة. ستحصل على سؤال مقابلة وإجابة المرشح. قدم تعليقات مفصلة وبناءة على الإجابة. حدد نقاط القوة والنقاط التي تحتاج إلى تحسين واقترح طرقًا لتحسين الإجابة."
            user_prompt = f"سؤال المقابلة: {question}\n\nإجابة المرشح: {answer}\n\n"
            if job_title:
                user_prompt += f"المنصب: {job_title}\n\n"
            user_prompt += "قدم تعليقات مفصلة وبناءة على هذه الإجابة. حدد نقاط القوة والضعف، واقترح تحسينات محددة. قيّم الإجابة على مقياس من 1 إلى 10."
        else:
            system_prompt = "You are an experienced interview coach. You will be given an interview question and a candidate's answer. Provide detailed, constructive feedback on the answer. Identify strengths, areas for improvement, and suggest ways to enhance the response."
            user_prompt = f"Interview question: {question}\n\nCandidate's answer: {answer}\n\n"
            if job_title:
                user_prompt += f"Position: {job_title}\n\n"
            user_prompt += "Provide detailed, constructive feedback on this answer. Identify strengths and weaknesses, and suggest specific improvements. Rate the answer on a scale of 1 to 10."
        
        try:
            # Use OpenAI to generate feedback
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            feedback_text = response.choices[0].message.content
            
            # Parse the feedback into structured format
            structured_feedback = parse_interview_feedback(feedback_text)
            
            return api_response({
                "feedback": structured_feedback,
                "raw_feedback": feedback_text,
                "timestamp": now()
            })
        
        except Exception as e:
            logger.error(f"Error using OpenAI: {str(e)}")
            
            # Fallback to DeepSeek
            if os.getenv('ENABLE_DEEPSEEK', 'false').lower() == 'true' and os.getenv('DEEPSEEK_API_KEY'):
                feedback_text = query_deepseek(user_prompt, language)
                return api_response({
                    "feedback": parse_interview_feedback(feedback_text),
                    "raw_feedback": feedback_text,
                    "timestamp": now()
                })
            return error_response("Failed to generate feedback. AI service unavailable.", 503)
    
    except Exception as e:
        logger.error(f"Error in get_answer_feedback: {str(e)}")
        return error_response(f"Failed to analyze answer: {str(e)}", 500)


# Helper functions

def parse_suggestions(text):
    """Parse resume improvement suggestions into structured format"""
    try:
        # Define categories to look for
        categories = ['general', 'structure', 'content', 'skills', 'achievements', 'education', 'experience']
        
        # Initialize structured suggestions
        structured = {}
        
        # Try to identify categories in the text
        current_category = 'general'
        structured[current_category] = []
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Check if this line is a category header
            is_header = False
            for category in categories:
                if category.lower() in line.lower() and (line.endswith(':') or line.upper() == category.upper()):
                    current_category = category.lower()
                    if current_category not in structured:
                        structured[current_category] = []
                    is_header = True
                    break
            
            # If not a header and not empty, add to current category
            if not is_header and line:
                # Remove bullet points and numbering
                if line.startswith('- '):
                    line = line[2:]
                elif line.startswith('• '):
                    line = line[2:]
                elif len(line) > 2 and line[0].isdigit() and line[1] == '.':
                    line = line[2:].strip()
                
                structured[current_category].append(line)
        
        return structured
    
    except Exception as e:
        logger.error(f"Error parsing suggestions: {str(e)}")
        # If parsing fails, return the whole text as general suggestions
        return {
            "general": [text]
        }


def parse_interview_questions(text):
    """Parse interview questions into structured format"""
    try:
        lines = text.split('\n')
        questions = []
        current_question = None
        current_category = "General"
        question_id = 1
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if this is a category header
            if line.endswith(':') and not line.startswith('Question') and not line.lower().startswith('purpose'):
                current_category = line.rstrip(':')
                continue
            
            # Check if this is a new question
            if line.startswith('Question') or line.startswith('Q') or (line[0].isdigit() and line[1] == '.'):
                # Save previous question if it exists
                if current_question:
                    questions.append(current_question)
                
                # Extract question text
                if line.startswith('Question') or line.startswith('Q'):
                    question_text = line.split(':', 1)[1].strip() if ':' in line else ""
                else:
                    question_text = line[2:].strip()  # Remove the number and dot
                
                current_question = {
                    "id": question_id,
                    "question": question_text,
                    "category": current_category,
                    "purpose": ""
                }
                question_id += 1
                continue
            
            # Check if this is a purpose line
            if current_question and (line.lower().startswith('purpose:') or line.lower().startswith('purpose -')):
                current_question["purpose"] = line.split(':', 1)[1].strip() if ':' in line else line.split('-', 1)[1].strip()
            # Otherwise, append to question text if it seems to be a continuation
            elif current_question and current_question["question"] and not current_question["purpose"]:
                current_question["question"] += " " + line
        
        # Add the last question
        if current_question:
            questions.append(current_question)
        
        return questions
    
    except Exception as e:
        logger.error(f"Error parsing interview questions: {str(e)}")
        # Return the whole text as a single question if parsing fails
        return [{
            "id": 1,
            "question": text,
            "category": "General",
            "purpose": "To assess candidate's qualifications"
        }]


def parse_interview_feedback(text):
    """Parse interview feedback into structured format"""
    try:
        # Initialize structured feedback
        feedback = {
            "strengths": [],
            "areas_for_improvement": [],
            "suggestions": [],
            "score": 5  # Default score
        }
        
        # Define sections to look for
        sections = {
            "strengths": ["positive", "strength", "good", "effective"],
            "areas_for_improvement": ["improve", "weakness", "area", "could be better"],
            "suggestions": ["suggest", "recommendation", "tip", "advise"]
        }
        
        current_section = None
        
        # Process each line
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Check if this is a section header
            is_header = False
            for section, keywords in sections.items():
                if any(keyword in line.lower() for keyword in keywords) and (line.endswith(':') or line.isupper()):
                    current_section = section
                    is_header = True
                    break
            
            # If this is a score line, extract the score
            if "score" in line.lower() and ":" in line:
                try:
                    score_text = line.split(":", 1)[1].strip()
                    # Extract first number from text
                    score_match = re.search(r'\d+', score_text)
                    if score_match:
                        score = int(score_match.group())
                        if 1 <= score <= 10:
                            feedback["score"] = score
                except Exception as e:
                    logger.warning(f"Error parsing score: {str(e)}")
            
            # If not a header and in a section, add the point
            if not is_header and current_section and line:
                # Remove bullet points and numbering
                if line.startswith('- '):
                    line = line[2:]
                elif line.startswith('• '):
                    line = line[2:]
                elif len(line) > 2 and line[0].isdigit() and line[1] == '.':
                    line = line[2:].strip()
                
                # Don't add if it looks like a header
                if not line.endswith(':'):
                    feedback[current_section].append(line)
        
        return feedback
    
    except Exception as e:
        logger.error(f"Error parsing interview feedback: {str(e)}")
        # Return basic structure with the whole text
        return {
            "strengths": ["Your answer contained relevant information"],
            "areas_for_improvement": ["Consider providing more specific examples"],
            "suggestions": ["Structure your answer using the STAR method"],
            "score": 5
        }
