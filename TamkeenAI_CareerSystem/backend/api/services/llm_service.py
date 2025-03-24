import os
import requests
import json
from typing import Optional

# Get DeepSeek API key from environment variables
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')

def query_deepseek(query: str, lang: str = 'en') -> str:
    """Query the DeepSeek API for advanced career guidance"""
    # System prompts tailored to specific career guidance
    if lang == 'ar':
        system_msg = """أنت مستشار مهني خبير باللغة العربية يدعى حصة المازمي. قدم إجابات دقيقة ومفيدة عن المسارات المهنية والمهارات المطلوبة والتعليم.
        ركز على المعلومات العملية والمحددة. قدم نصائح ملموسة حول المهارات والشهادات والخبرات المطلوبة لمختلف المسارات المهنية.
        اجعل إجاباتك موجزة ومباشرة وفي نقاط إذا أمكن. أعط أمثلة محددة عن مسارات التقدم الوظيفي.
        قم بتخصيص نصائحك للسياق المحلي في الإمارات العربية المتحدة والشرق الأوسط عندما يكون ذلك مناسبًا."""
        user_prompt = f"السؤال عن المسار المهني: {query}. قدم إجابة مفصلة ومفيدة باللغة العربية."
    else:
        system_msg = """You are Hessa Almaazmi, an expert career advisor specializing in emerging technologies and traditional professions.
        Provide accurate, helpful answers about career paths, required skills, and education. Focus on practical, specific information.
        Give concrete advice about skills, certifications, and experiences needed for various career paths.
        Keep your answers concise, direct, and in bullet points when possible. Provide specific examples of career progression.
        Tailor your advice to the UAE and Middle Eastern context when appropriate.
        Include salary ranges, job outlook, and work-life balance information when relevant."""
        user_prompt = f"Career question: {query}. Provide a detailed and helpful answer focused on practical steps."

    # API endpoint
    url = "https://api.deepseek.com/v1/chat/completions"

    # Prepare the payload
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }

    # Set up headers with API key
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }

    try:
        # Make the API request
        response = requests.post(url, headers=headers, data=json.dumps(payload))

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the response
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            # Handle API errors
            if lang == 'en':
                return "I'm sorry, I couldn't retrieve detailed information about that career path at the moment. Let me provide some general guidance instead: The most important skills in any career are adaptability, continuous learning, and effective communication. Consider researching industry certifications, relevant online courses, and networking opportunities in your desired field."
            else:
                return "عذرًا، لم أتمكن من استرجاع معلومات مفصلة حول هذا المسار المهني في الوقت الحالي. دعني أقدم بعض الإرشادات العامة بدلاً من ذلك: أهم المهارات في أي مهنة هي القدرة على التكيف، والتعلم المستمر، والتواصل الفعال. ابحث عن الشهادات المهنية، والدورات الإلكترونية ذات الصلة، وفرص التواصل المهني في المجال الذي ترغب فيه."

    except Exception as e:
        # Handle exceptions
        if lang == 'en':
            return "I'm experiencing connectivity issues. Here's some general advice: 1) Research the specific skills and qualifications needed in your field, 2) Connect with professionals through LinkedIn and industry events, 3) Look for internships or volunteer opportunities to gain experience, 4) Consider relevant certifications or advanced degrees if applicable."
        else:
            return "أواجه مشاكل في الاتصال. إليك بعض النصائح العامة: 1) ابحث عن المهارات والمؤهلات المطلوبة في مجالك، 2) تواصل مع المحترفين من خلال LinkedIn والفعاليات المهنية، 3) ابحث عن فرص التدريب أو التطوع لاكتساب الخبرة، 4) فكر في الحصول على شهادات مهنية أو درجات علمية متقدمة إذا كان ذلك مناسبًا."

def get_chatbot_response(query: str, lang: str = 'en') -> str:
    """Enhanced career-aware chatbot function with DeepSeek fallback for ANY career field"""
    from ..utils.career_utils import career_knowledge_base
    
    query = query.lower().strip()

    # List of standard career fields we have predefined responses for
    standard_titles = [info['title'].lower() for info in career_knowledge_base.values()]

    # Define basic predefined responses
    if lang == 'en':
        # Check for form-related questions first
        if 'how to fill' in query or 'fill the info' in query or 'fill my info' in query:
            return "To complete your profile, enter your details in each field. Start with your name, email, and education status. Then list your skills relevant to your career field. For career goals, consider both short-term and long-term ambitions. Finally, the personality assessment helps us match you with suitable career paths."

        # Check if query contains specific career titles
        for idx, title in enumerate(standard_titles):
            if title in query:
                career_id = list(career_knowledge_base.keys())[idx]
                career = career_knowledge_base[career_id]
                return f"For a career as a {career['title']}, focus on developing skills such as {', '.join(career['skills'][:5])}. Education typically includes {', '.join(career['education'][:3])}. To stay competitive, consider developing expertise in {', '.join(career['growth_areas'][:3])}."

        # Important: Check if this is a career-related question
        career_keywords = ['career', 'job', 'profession', 'field', 'industry', 'work',
                          'occupation', 'employment', 'ai', 'artificial intelligence',
                          'blockchain', 'cybersecurity', 'robotics', 'architecture',
                          'become', 'how to', 'skills', 'education', 'degree', 'certification',
                          'salary', 'market', 'future', 'trends', 'path']

        # If we detect any career keyword, use DeepSeek
        if any(keyword in query for keyword in career_keywords):
            try:
                deepseek_response = query_deepseek(query, lang)
                return deepseek_response
            except Exception as e:
                # If DeepSeek fails, give a helpful response
                return f"I'd be happy to provide information about careers in {query}. To succeed in most emerging fields, focus on developing both technical skills specific to the domain and soft skills like communication, adaptability, and continuous learning. Consider relevant certifications and joining professional communities to build your network."

        # Default response if no matches
        available_fields = ", ".join([career_knowledge_base[k]['title'] for k in career_knowledge_base.keys()])
        return f"I'm here to help with your career profile! I can provide guidance on skills, education, and career paths for various fields including: {available_fields}, and many others. What specific career field are you interested in?"

    else:
        # Arabic version with similar logic
        # Check for form-related questions
        if 'كيف' in query and ('ملء' in query or 'تعبئة' in query):
            return "لإكمال ملفك الشخصي، أدخل تفاصيلك في كل حقل. ابدأ باسمك وبريدك الإلكتروني والحالة التعليمية. ثم اذكر مهاراتك ذات الصلة بمجال عملك. بالنسبة للأهداف المهنية، فكر في الطموحات قصيرة وطويلة المدى. أخيرًا، يساعدنا تقييم الشخصية على مطابقتك مع المسارات المهنية المناسبة."

        # Map between Arabic and English career names
        profession_ar_map = {}
        for career_id, career in career_knowledge_base.items():
            profession_ar_map[career.get('title_ar', '').lower()] = career_id

        # Check if query contains Arabic career names
        for ar_title, career_id in profession_ar_map.items():
            if ar_title and ar_title in query:
                career = career_knowledge_base[career_id]
                return f"للعمل كـ {career['title_ar']}، ركز على تطوير مهارات مثل {', '.join(career['skills'][:5])}. يتضمن التعليم عادةً {', '.join(career['education'][:3])}. للبقاء متنافسًا، فكر في تطوير خبرة في {', '.join(career['growth_areas'][:3])}."

        # Use DeepSeek for career-related Arabic queries
        career_keywords_ar = ['مهنة', 'وظيفة', 'مهارات', 'تعليم', 'مجال', 'عمل',
                             'مسار', 'احتراف', 'ذكاء اصطناعي', 'بلوكتشين', 'أمن سيبراني',
                             'تطوير', 'تصميم', 'هندسة', 'إدارة', 'خبرة']

        if any(keyword in query for keyword in career_keywords_ar):
            try:
                deepseek_response = query_deepseek(query, lang)
                return deepseek_response
            except:
                return f"يسعدني تقديم معلومات حول المسارات المهنية في {query}. للنجاح في معظم المجالات الناشئة، ركز على تطوير المهارات التقنية الخاصة بالمجال والمهارات الشخصية مثل التواصل والقدرة على التكيف والتعلم المستمر. فكر في الحصول على الشهادات ذات الصلة والانضمام إلى المجتمعات المهنية لبناء شبكة علاقاتك."

        # Default Arabic response if no matches
        available_fields = ", ".join([career_knowledge_base[k]['title_ar'] for k in career_knowledge_base.keys() if 'title_ar' in career_knowledge_base[k]])
        return f"أنا هنا للمساعدة في ملفك المهني! يمكنني تقديم إرشادات حول المهارات والتعليم والمسارات المهنية لمختلف المجالات بما في ذلك: {available_fields}، وغيرها الكثير. ما هو المجال المهني الذي تهتم به؟" 