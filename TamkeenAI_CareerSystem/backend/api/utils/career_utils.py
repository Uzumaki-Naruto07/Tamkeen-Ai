import os
import json
import requests
from typing import Dict, List, Any

# Career knowledge base
career_knowledge_base = {
    'software_developer': {
        'title': 'Software Developer',
        'title_ar': 'مطور برمجيات',
        'skills': ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Git', 'problem-solving', 'collaboration'],
        'education': ['Computer Science', 'Software Engineering', 'Information Technology', 'Bootcamp'],
        'traits': [3, 5, 4, 4, 3],  # Team, Problem-solving, Detail, Adaptability, Structure (1-5 scale)
        'growth_areas': ['Cloud technologies (AWS/Azure/GCP)', 'DevOps and CI/CD pipelines', 'Mobile app development', 'Cybersecurity practices', 'AI/ML integration']
    },
    'data_scientist': {
        'title': 'Data Scientist',
        'title_ar': 'عالم بيانات',
        'skills': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization', 'pandas', 'TensorFlow'],
        'education': ['Data Science', 'Statistics', 'Mathematics', 'Computer Science', 'Physics'],
        'traits': [2, 5, 5, 3, 4],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Deep learning architectures', 'Natural Language Processing', 'Big Data technologies', 'Cloud-based ML platforms', 'Business intelligence tools']
    },
    'ux_designer': {
        'title': 'UX Designer',
        'title_ar': 'مصمم تجربة المستخدم',
        'skills': ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'Adobe XD', 'User Testing', 'empathy', 'UI design'],
        'education': ['Design', 'Human-Computer Interaction', 'Psychology', 'Fine Arts'],
        'traits': [4, 4, 5, 3, 3],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Design systems', 'Accessibility standards', '3D interface design', 'VR/AR experiences', 'Motion design']
    },
    'product_manager': {
        'title': 'Product Manager',
        'title_ar': 'مدير منتج',
        'skills': ['Product Strategy', 'Market Research', 'User Stories', 'Roadmapping', 'Stakeholder Management', 'Agile', 'communication'],
        'education': ['Business Administration', 'Product Management', 'Computer Science', 'Marketing'],
        'traits': [5, 4, 3, 5, 3],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Data-driven decision making', 'Technical product management', 'Growth hacking', 'Enterprise product management', 'Product marketing alignment']
    },
    'ai_engineer': {
        'title': 'AI Engineer',
        'title_ar': 'مهندس ذكاء اصطناعي',
        'skills': ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP', 'Deep Learning', 'MLOps', 'Mathematics'],
        'education': ['AI', 'Machine Learning', 'Computer Science', 'Mathematics', 'Data Science'],
        'traits': [3, 5, 4, 4, 3],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Reinforcement learning', 'Generative AI', 'AI ethics & governance', 'Edge AI deployment', 'Large language models']
    },
    'cybersecurity_analyst': {
        'title': 'Cybersecurity Analyst',
        'title_ar': 'محلل أمن سيبراني',
        'skills': ['Network Security', 'Penetration Testing', 'SIEM tools', 'Risk Assessment', 'Security Compliance', 'Threat Intelligence'],
        'education': ['Cybersecurity', 'Information Security', 'Computer Science', 'IT'],
        'traits': [3, 5, 5, 4, 4],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Cloud security', 'Zero trust architecture', 'OT/IoT security', 'Threat hunting', 'Security automation']
    },
    'cloud_architect': {
        'title': 'Cloud Architect',
        'title_ar': 'مهندس سحابة',
        'skills': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Networking', 'Security'],
        'education': ['Cloud Computing', 'Computer Science', 'IT Infrastructure', 'Systems Engineering'],
        'traits': [4, 5, 4, 4, 3],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Multi-cloud strategies', 'FinOps', 'Serverless architectures', 'Edge computing', 'AI-integrated cloud solutions']
    },
    'digital_marketer': {
        'title': 'Digital Marketer',
        'title_ar': 'مسوق رقمي',
        'skills': ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Analytics', 'Email Marketing', 'copywriting'],
        'education': ['Marketing', 'Digital Marketing', 'Business', 'Communications'],
        'traits': [4, 3, 4, 5, 2],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Marketing automation', 'Conversion rate optimization', 'Video marketing', 'Influencer marketing strategy', 'AI in marketing']
    },
    'data_engineer': {
        'title': 'Data Engineer',
        'title_ar': 'مهندس بيانات',
        'skills': ['SQL', 'Python', 'Spark', 'Hadoop', 'ETL', 'Data Warehousing', 'Airflow', 'Kafka'],
        'education': ['Computer Science', 'Data Engineering', 'Information Systems', 'Database Management'],
        'traits': [3, 4, 5, 3, 4],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Real-time data processing', 'Data mesh architecture', 'DataOps', 'Data governance', 'Streaming analytics']
    },
    'blockchain_developer': {
        'title': 'Blockchain Developer',
        'title_ar': 'مطور بلوكتشين',
        'skills': ['Solidity', 'Smart Contracts', 'Web3.js', 'Ethereum', 'Cryptography', 'JavaScript', 'Distributed Systems'],
        'education': ['Computer Science', 'Blockchain Technology', 'Cryptography', 'Security'],
        'traits': [2, 5, 5, 3, 3],  # Team, Problem-solving, Detail, Adaptability, Structure
        'growth_areas': ['Layer 2 scaling solutions', 'Cross-chain interoperability', 'Zero-knowledge proofs', 'DeFi protocols', 'Sustainable blockchain']
    }
}

# Translations dictionary
translations = {
    'en': {
        'experience_options': ['Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior Level (6-10 years)', 'Expert (10+ years)'],
        'industry_options': ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Creative', 'Public Sector', 'Other'],
        'work_env_options': ['Remote', 'Office-based', 'Hybrid', 'Field work', 'No preference'],
        'error_message': "I couldn't retrieve detailed information at the moment. The most important skills in any career are adaptability, continuous learning, and effective communication.",
        'fallback_response': "Here's some general advice: 1) Research the specific skills and qualifications needed in your field, 2) Connect with professionals through LinkedIn and industry events, 3) Look for internships or volunteer opportunities to gain experience, 4) Consider relevant certifications or advanced degrees if applicable."
    },
    'ar': {
        'experience_options': ['مستوى مبتدئ (0-2 سنوات)', 'مستوى متوسط (3-5 سنوات)', 'مستوى متقدم (6-10 سنوات)', 'خبير (أكثر من 10 سنوات)'],
        'industry_options': ['التكنولوجيا', 'التمويل', 'الرعاية الصحية', 'التعليم', 'التصنيع', 'المجال الإبداعي', 'القطاع العام', 'أخرى'],
        'work_env_options': ['عن بعد', 'في المكتب', 'مختلط', 'عمل ميداني', 'لا تفضيل'],
        'error_message': "عذرًا، لم أتمكن من استرجاع معلومات مفصلة في الوقت الحالي. أهم المهارات في أي مهنة هي القدرة على التكيف، والتعلم المستمر، والتواصل الفعال.",
        'fallback_response': "إليك بعض النصائح العامة: 1) ابحث عن المهارات والمؤهلات المطلوبة في مجالك، 2) تواصل مع المحترفين من خلال LinkedIn والفعاليات المهنية، 3) ابحث عن فرص التدريب أو التطوع لاكتساب الخبرة، 4) فكر في الحصول على شهادات مهنية أو درجات علمية متقدمة إذا كان ذلك مناسبًا."
    }
}

# DeepSeek API integration
def query_deepseek(query: str, lang: str = 'en') -> str:
    """Query the DeepSeek API for advanced career guidance"""
    # Get API key from environment variable
    DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')
    
    if not DEEPSEEK_API_KEY:
        return translations[lang]['error_message']
    
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
            return translations[lang]['error_message']

    except Exception:
        # Handle exceptions
        return translations[lang]['fallback_response']

def get_chatbot_response(query: str, lang: str = 'en') -> str:
    """Get career guidance response from the chatbot"""
    query = query.lower().strip()

    # List of standard career fields we have predefined responses for
    standard_fields = list(career_knowledge_base.keys())
    standard_titles = [info['title'].lower() for info in career_knowledge_base.values()]

    # Define the basic predefined responses
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

        # Important: Check if this is a career-related question but not about our standard fields
        # This is where we route to DeepSeek for AI and other specialized careers
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
        available_fields = ", ".join([career_knowledge_base[k]['title'] for k in standard_fields])
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

        # Default Arabic response
        available_fields = ", ".join([career_knowledge_base[k].get('title_ar', k) for k in standard_fields])
        return f"أنا هنا لمساعدتك في ملفك المهني! يمكنني تقديم إرشادات حول المهارات والتعليم والمسارات المهنية لمختلف المجالات بما في ذلك: {available_fields}. ما هو المجال الذي تهتم به؟"

def match_careers_to_profile(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate match percentages between user profile and career paths"""
    matches = {}

    # Extract user traits from form data
    personality_assessment = user_data.get('personality_assessment', {})
    personality_scores = [
        personality_assessment.get('team_orientation', 3),
        personality_assessment.get('problem_solving', 3),
        personality_assessment.get('detail_orientation', 3),
        personality_assessment.get('adaptability', 3),
        personality_assessment.get('structure_preference', 3)
    ]
    
    user_skills_text = user_data.get('skills', '').lower()
    user_skills = [skill.strip() for skill in user_skills_text.split(',')]
    education = user_data.get('education_status', '').lower()

    # Calculate match for each career
    for career_id, career in career_knowledge_base.items():
        # Skills match
        skill_score = 0
        for skill in career['skills']:
            if any(user_skill in skill.lower() or skill.lower() in user_skill for user_skill in user_skills):
                skill_score += 1
        skill_match = min(skill_score / max(len(career['skills']), 1) * 100, 100)

        # Education match
        education_match = 0
        for edu in career['education']:
            if edu.lower() in education:
                education_match = 100
                break
            elif any(common_term in edu.lower() and common_term in education 
                    for common_term in ['computer', 'science', 'engineering', 'data', 'design', 'business']):
                education_match = 50
                break
        
        # Personality trait match
        trait_match = 0
        for i in range(5):
            trait_diff = abs(career['traits'][i] - personality_scores[i])
            trait_match += (5 - trait_diff) / 5 * 100 / 5  # Average across 5 traits
            
        # Industry preference (use simple factors based on likely industry alignment)
        industry_pref = user_data.get('industry_preference', '').lower()
        industry_match = 0
        
        tech_careers = ['software_developer', 'data_scientist', 'ai_engineer', 'cybersecurity_analyst', 'cloud_architect', 'data_engineer', 'blockchain_developer']
        creative_careers = ['ux_designer', 'digital_marketer']
        business_careers = ['product_manager']
        
        if 'technology' in industry_pref and career_id in tech_careers:
            industry_match = 100
        elif 'creative' in industry_pref and career_id in creative_careers:
            industry_match = 100
        elif 'finance' in industry_pref and career_id in business_careers:
            industry_match = 100
        elif 'other' in industry_pref:
            industry_match = 50  # Neutral for 'other'
            
        # Calculate final match percentage (weighted)
        match_percentage = int(
            (skill_match * 0.4) +      # Skills are most important (40%)
            (education_match * 0.2) +  # Education matters (20%)
            (trait_match * 0.25) +     # Personality traits (25%)
            (industry_match * 0.15)    # Industry preference (15%)
        )
        
        # Store the career with match details
        matches[career_id] = {
            'title': career['title'],
            'title_ar': career['title_ar'],
            'match_percentage': match_percentage,
            'skills_match': int(skill_match),
            'education_match': int(education_match),
            'trait_match': int(trait_match),
            'growth_areas': career['growth_areas'][:3]  # Provide top 3 growth areas
        }
    
    # Sort matches by percentage (descending)
    return dict(sorted(matches.items(), key=lambda item: item[1]['match_percentage'], reverse=True))

def generate_career_timeline(career: Dict[str, Any], experience_level: str) -> List[Dict[str, Any]]:
    """Generate a career progression timeline based on top matched career"""
    # Determine starting point based on experience level
    if "entry" in experience_level.lower():
        start_year = 0
    elif "mid" in experience_level.lower():
        start_year = 3
    elif "senior" in experience_level.lower():
        start_year = 6
    else:  # Expert
        start_year = 10
    
    current_year = 2023
    timeline = []
    
    # Career titles based on progression (customized for each career path)
    if career['title'] == 'Software Developer':
        roles = ['Junior Developer', 'Software Developer', 'Senior Developer', 'Lead Developer', 'Software Architect']
    elif career['title'] == 'Data Scientist':
        roles = ['Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist', 'Chief Data Scientist']
    elif career['title'] == 'UX Designer':
        roles = ['Junior UX Designer', 'UX Designer', 'Senior UX Designer', 'UX Lead', 'UX Director']
    elif career['title'] == 'Product Manager':
        roles = ['Associate Product Manager', 'Product Manager', 'Senior Product Manager', 'Product Director', 'VP of Product']
    elif career['title'] == 'AI Engineer':
        roles = ['AI Developer', 'AI Engineer', 'Senior AI Engineer', 'AI Architect', 'AI Research Lead']
    elif career['title'] == 'Cybersecurity Analyst':
        roles = ['Security Analyst', 'Cybersecurity Specialist', 'Senior Security Analyst', 'Security Architect', 'CISO']
    elif career['title'] == 'Blockchain Developer':
        roles = ['Blockchain Developer', 'Blockchain Engineer', 'Senior Blockchain Engineer', 'Blockchain Architect', 'Blockchain Research Lead']
    elif career['title'] == 'Digital Marketer':
        roles = ['Digital Marketing Specialist', 'Digital Marketing Manager', 'Senior Digital Marketer', 'Marketing Director', 'CMO']
    else:
        # Generic progression for other careers
        roles = ['Junior Professional', 'Professional', 'Senior Professional', 'Lead Professional', 'Director/Executive']
    
    # Build the timeline
    current_role_idx = min(start_year // 3, len(roles) - 1)  # Determine current role based on experience
    
    # Past positions (if any)
    for i in range(current_role_idx):
        years_ago = start_year - (i * 3)
        timeline.append({
            'year': current_year - years_ago,
            'role': roles[i],
            'skills': f"Skills at this level included {', '.join(career.get('skills', [])[i:i+3])}",
            'growth_areas': f"Growth areas were {', '.join(career.get('growth_areas', [])[i:i+2])}"
        })
    
    # Current position
    timeline.append({
        'year': current_year,
        'role': roles[current_role_idx],
        'skills': f"Current skills include {', '.join(career.get('skills', [])[current_role_idx:current_role_idx+3])}",
        'growth_areas': f"Currently developing {', '.join(career.get('growth_areas', [])[0:2])}"
    })
    
    # Future positions
    for i in range(current_role_idx + 1, min(current_role_idx + 3, len(roles))):
        years_ahead = (i - current_role_idx) * 2  # Faster progression in the future
        timeline.append({
            'year': current_year + years_ahead,
            'role': roles[i],
            'skills': f"Will need to develop {', '.join(career.get('skills', [])[i:i+3])}",
            'growth_areas': f"Should focus on {', '.join(career.get('growth_areas', [])[i % len(career.get('growth_areas', []))])}"
        })
    
    # Sort timeline by year
    return sorted(timeline, key=lambda x: x['year'])

def generate_resume_preview(user_data: Dict[str, Any], top_career: Dict[str, Any]) -> str:
    """Generate a basic resume preview based on user data and top career match"""
    name = user_data.get('name', 'Your Name')
    email = user_data.get('email', 'your.email@example.com')
    education = user_data.get('education_status', '')
    linkedin = user_data.get('linkedin_url', '')
    skills_text = user_data.get('skills', '')
    skills = [skill.strip() for skill in skills_text.split(',') if skill.strip()]
    
    # Get certifications
    certifications = user_data.get('certifications', [])
    
    # Generate suggested skills based on career match
    career_title = top_career.get('title', '')
    suggested_skills = career_knowledge_base.get(list(career_knowledge_base.keys())[0], {}).get('skills', [])
    for career_id, career in career_knowledge_base.items():
        if career.get('title') == career_title:
            suggested_skills = career.get('skills', [])
            break
    
    # Filter out skills the user already has
    new_suggested_skills = [skill for skill in suggested_skills 
                          if not any(user_skill.lower() in skill.lower() 
                                    or skill.lower() in user_skill.lower() 
                                    for user_skill in skills)]
    
    # Build the HTML resume
    resume_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
        <h1 style="text-align: center; color: #2c3e50;">{name}</h1>
        <p style="text-align: center; color: #7f8c8d;">
            {email} | {linkedin or 'LinkedIn URL'}
        </p>
        
        <hr style="border: 1px solid #eee;">
        
        <h2 style="color: #2980b9;">Education</h2>
        <p>{education or 'Your education details'}</p>
        
        <h2 style="color: #2980b9;">Skills</h2>
        <ul>
    """
    
    # Add existing skills
    for skill in skills:
        resume_html += f"<li>{skill}</li>"
    
    # Add section for recommended skills
    if new_suggested_skills:
        resume_html += f"""
        </ul>
        
        <h2 style="color: #2980b9;">Recommended Skills for {career_title}</h2>
        <p><em>Consider developing these skills to advance in your career:</em></p>
        <ul>
        """
        
        for skill in new_suggested_skills[:5]:  # Limit to 5 recommended skills
            resume_html += f"<li>{skill}</li>"
    
    # Add certifications if any
    if certifications:
        resume_html += f"""
        </ul>
        
        <h2 style="color: #2980b9;">Certifications</h2>
        <ul>
        """
        
        for cert in certifications:
            resume_html += f"<li>{cert.get('name')} - {cert.get('issuer')} ({cert.get('date')})</li>"
    
    # Complete the HTML
    resume_html += """
        </ul>
        
        <h2 style="color: #2980b9;">Career Objective</h2>
        <p>Seeking a challenging position that allows me to leverage my skills and experience in my field of expertise.</p>
    </div>
    """
    
    return resume_html

def calculate_profile_completion(user_data: Dict[str, Any]) -> int:
    """Calculate the percentage of profile completion"""
    # Define required fields
    required_fields = ['name', 'email', 'education_status', 'skills', 'career_goals', 
                       'experience_level', 'industry_preference', 'work_environment',
                       'personality_assessment']
    
    # Count the number of fields that have values
    completed_fields = sum(1 for field in required_fields if user_data.get(field))
    
    # Personality assessment counts as 5 fields if all questions are answered
    if 'personality_assessment' in user_data and user_data['personality_assessment']:
        personality_fields = ['team_orientation', 'problem_solving', 'detail_orientation', 
                             'adaptability', 'structure_preference']
        # Replace the single personality_assessment count with actual filled personality fields
        completed_fields -= 1  # Remove the generic count first
        completed_fields += sum(1 for field in personality_fields 
                                if field in user_data['personality_assessment'] 
                                and user_data['personality_assessment'][field])
    
    # Certifications are a bonus (up to 10% extra)
    cert_bonus = min(len(user_data.get('certifications', [])) * 2, 10)
    
    # Calculate percentage (based on required fields + bonus)
    total_possible = len(required_fields) + 4  # Add 4 for potential certification bonus
    completion = (completed_fields / len(required_fields) * 90) + cert_bonus  # Base is 90% + up to 10% bonus
    
    return min(int(completion), 100)  # Cap at 100% 