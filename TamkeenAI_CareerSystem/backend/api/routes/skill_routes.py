from flask import Blueprint, request, jsonify
import logging
from api.middleware.auth_middleware import token_required
from datetime import datetime, timedelta
import random
import json
import os
import uuid

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
skill_bp = Blueprint('skill', __name__)

# Mock data storage
USER_SKILLS = {}
SKILL_CATEGORIES = [
    {
        "id": "technical",
        "name": "Technical Skills",
        "description": "Skills related to programming, software tools, and other technical abilities"
    },
    {
        "id": "soft",
        "name": "Soft Skills",
        "description": "Interpersonal and communication skills essential for workplace success"
    },
    {
        "id": "industry",
        "name": "Industry Knowledge",
        "description": "Familiarity with industry-specific terminology, trends, and practices"
    },
    {
        "id": "tools",
        "name": "Tools & Platforms",
        "description": "Proficiency with specific software, platforms, and development tools"
    },
    {
        "id": "certifications",
        "name": "Certifications",
        "description": "Professional certifications and credentials"
    }
]

# Define a comprehensive list of skills for each category
SKILL_DATABASE = {
    "technical": [
        {"id": "javascript", "name": "JavaScript", "description": "Programming language for web development"},
        {"id": "python", "name": "Python", "description": "Versatile programming language for various applications"},
        {"id": "react", "name": "React.js", "description": "JavaScript library for building user interfaces"},
        {"id": "nodejs", "name": "Node.js", "description": "JavaScript runtime environment for server-side applications"},
        {"id": "html_css", "name": "HTML/CSS", "description": "Markup and styling languages for web development"},
        {"id": "sql", "name": "SQL", "description": "Language for database management and queries"},
        {"id": "java", "name": "Java", "description": "Object-oriented programming language"},
        {"id": "csharp", "name": "C#", "description": ".NET programming language"},
        {"id": "typescript", "name": "TypeScript", "description": "Typed superset of JavaScript"},
        {"id": "php", "name": "PHP", "description": "Server-side scripting language"},
        {"id": "swift", "name": "Swift", "description": "Programming language for iOS and macOS development"},
        {"id": "kotlin", "name": "Kotlin", "description": "Programming language for Android development"},
        {"id": "golang", "name": "Go", "description": "Statically typed, compiled language"},
        {"id": "ruby", "name": "Ruby", "description": "Dynamic, object-oriented language"},
        {"id": "rust", "name": "Rust", "description": "Systems programming language"},
        {"id": "angular", "name": "Angular", "description": "Platform for building web applications"},
        {"id": "vuejs", "name": "Vue.js", "description": "Progressive JavaScript framework"},
        {"id": "machine_learning", "name": "Machine Learning", "description": "Algorithms and statistical models for prediction"},
        {"id": "data_analysis", "name": "Data Analysis", "description": "Process of inspecting and modeling data"}
    ],
    "soft": [
        {"id": "communication", "name": "Communication", "description": "Effective verbal and written communication"},
        {"id": "teamwork", "name": "Teamwork", "description": "Ability to work effectively in a team"},
        {"id": "problem_solving", "name": "Problem Solving", "description": "Ability to identify and solve complex problems"},
        {"id": "critical_thinking", "name": "Critical Thinking", "description": "Objective analysis and evaluation of issues"},
        {"id": "leadership", "name": "Leadership", "description": "Ability to lead and motivate others"},
        {"id": "time_management", "name": "Time Management", "description": "Effective allocation of time to activities"},
        {"id": "adaptability", "name": "Adaptability", "description": "Ability to adjust to new conditions"},
        {"id": "creativity", "name": "Creativity", "description": "Ability to generate innovative ideas"},
        {"id": "emotional_intelligence", "name": "Emotional Intelligence", "description": "Ability to understand and manage emotions"},
        {"id": "negotiation", "name": "Negotiation", "description": "Discussion aimed at reaching an agreement"}
    ],
    "industry": [
        {"id": "agile", "name": "Agile Methodologies", "description": "Iterative approach to project management"},
        {"id": "product_management", "name": "Product Management", "description": "Organizational lifecycle management of a product"},
        {"id": "digital_marketing", "name": "Digital Marketing", "description": "Marketing using digital technologies"},
        {"id": "ux_design", "name": "UX Design", "description": "Design focused on user experience"},
        {"id": "data_science", "name": "Data Science", "description": "Extraction of knowledge from data"},
        {"id": "cloud_computing", "name": "Cloud Computing", "description": "Delivery of computing services over the internet"},
        {"id": "cybersecurity", "name": "Cybersecurity", "description": "Protection of computer systems and networks"},
        {"id": "blockchain", "name": "Blockchain", "description": "Distributed ledger technology"},
        {"id": "fintech", "name": "Fintech", "description": "Technology in financial services"},
        {"id": "devops", "name": "DevOps", "description": "Combination of development and operations"}
    ],
    "tools": [
        {"id": "git", "name": "Git", "description": "Version control system"},
        {"id": "docker", "name": "Docker", "description": "Platform for containerization"},
        {"id": "aws", "name": "AWS", "description": "Amazon Web Services cloud platform"},
        {"id": "azure", "name": "Azure", "description": "Microsoft cloud platform"},
        {"id": "gcp", "name": "Google Cloud", "description": "Google Cloud Platform"},
        {"id": "jira", "name": "Jira", "description": "Project management tool"},
        {"id": "figma", "name": "Figma", "description": "Design and prototyping tool"},
        {"id": "adobe_creative", "name": "Adobe Creative Suite", "description": "Collection of design apps"},
        {"id": "tensorflow", "name": "TensorFlow", "description": "Open-source machine learning framework"},
        {"id": "pytorch", "name": "PyTorch", "description": "Open-source machine learning library"},
        {"id": "tableau", "name": "Tableau", "description": "Data visualization software"},
        {"id": "power_bi", "name": "Power BI", "description": "Business analytics service"}
    ],
    "certifications": [
        {"id": "aws_cert", "name": "AWS Certified Solutions Architect", "description": "AWS certification for architects"},
        {"id": "azure_cert", "name": "Microsoft Azure Certified", "description": "Azure certification"},
        {"id": "scrum_master", "name": "Certified Scrum Master", "description": "Scrum certification"},
        {"id": "pmp", "name": "Project Management Professional (PMP)", "description": "Project management certification"},
        {"id": "cissp", "name": "CISSP", "description": "Cybersecurity certification"},
        {"id": "google_analytics", "name": "Google Analytics Certification", "description": "Analytics certification"},
        {"id": "comptia_a", "name": "CompTIA A+", "description": "IT fundamentals certification"},
        {"id": "google_cloud_cert", "name": "Google Cloud Certified", "description": "Google Cloud certification"}
    ]
}

# Achievement badges for skill progression
SKILL_BADGES = {
    "beginner": {
        "id": "beginner",
        "name": "Beginner",
        "description": "Started learning a new skill",
        "icon": "school",
        "level": 1,
        "xp": 10
    },
    "intermediate": {
        "id": "intermediate",
        "name": "Intermediate",
        "description": "Reached intermediate level in a skill",
        "icon": "trending_up",
        "level": 2,
        "xp": 30
    },
    "advanced": {
        "id": "advanced",
        "name": "Advanced",
        "description": "Achieved advanced proficiency in a skill",
        "icon": "star",
        "level": 3,
        "xp": 50
    },
    "expert": {
        "id": "expert",
        "name": "Expert",
        "description": "Reached expert level in a skill",
        "icon": "military_tech",
        "level": 4,
        "xp": 100
    },
    "skill_master": {
        "id": "skill_master",
        "name": "Skill Master",
        "description": "Mastered 5 skills at advanced level or higher",
        "icon": "emoji_events",
        "level": 5,
        "xp": 200
    },
    "well_rounded": {
        "id": "well_rounded",
        "name": "Well-Rounded",
        "description": "Achieved intermediate level in at least 3 different skill categories",
        "icon": "360",
        "level": 3,
        "xp": 100
    },
    "tech_guru": {
        "id": "tech_guru",
        "name": "Tech Guru",
        "description": "Reached advanced level in at least 5 technical skills",
        "icon": "code",
        "level": 4,
        "xp": 150
    },
    "soft_skills_expert": {
        "id": "soft_skills_expert",
        "name": "Soft Skills Expert",
        "description": "Achieved high proficiency in soft skills",
        "icon": "psychology",
        "level": 4,
        "xp": 150
    }
}

def get_skill_level_badge(level):
    """Get the appropriate badge based on skill level"""
    if level <= 20:
        return SKILL_BADGES["beginner"]
    elif level <= 50:
        return SKILL_BADGES["intermediate"]
    elif level <= 80:
        return SKILL_BADGES["advanced"]
    else:
        return SKILL_BADGES["expert"]

def calculate_industry_average(skill_id, role="general"):
    """Calculate industry average for a skill (mock data)"""
    # In a real application, this would be based on real data
    # Here, we'll generate random but consistent values for demonstration
    base_values = {
        "javascript": 75, "python": 68, "react": 65, "nodejs": 60, "html_css": 80,
        "sql": 72, "java": 65, "csharp": 60, "typescript": 55, "php": 50,
        "swift": 45, "kotlin": 45, "golang": 40, "ruby": 45, "rust": 35,
        "angular": 55, "vuejs": 50, "machine_learning": 40, "data_analysis": 55,
        "communication": 65, "teamwork": 70, "problem_solving": 68, "critical_thinking": 65,
        "leadership": 60, "time_management": 62, "adaptability": 65, "creativity": 60,
        "emotional_intelligence": 55, "negotiation": 58, "agile": 70, "product_management": 65,
        "digital_marketing": 60, "ux_design": 58, "data_science": 50, "cloud_computing": 55,
        "cybersecurity": 48, "blockchain": 35, "fintech": 45, "devops": 60,
        "git": 75, "docker": 60, "aws": 65, "azure": 60, "gcp": 55,
        "jira": 70, "figma": 55, "adobe_creative": 50, "tensorflow": 40, "pytorch": 38,
        "tableau": 58, "power_bi": 55
    }
    
    # Default value if skill not found
    base_value = base_values.get(skill_id, 50)
    
    # Adjust based on role (in a real app, this would be more sophisticated)
    role_adjustments = {
        "software_developer": {"javascript": 15, "python": 10, "react": 15, "nodejs": 15, "html_css": 10, "git": 15},
        "data_scientist": {"python": 20, "machine_learning": 25, "data_analysis": 25, "sql": 15, "tensorflow": 20, "pytorch": 20},
        "ux_designer": {"ux_design": 25, "figma": 25, "adobe_creative": 20, "html_css": 15, "creativity": 15},
        "product_manager": {"product_management": 25, "leadership": 15, "communication": 15, "agile": 15, "jira": 15}
    }
    
    adjustment = 0
    if role in role_adjustments and skill_id in role_adjustments[role]:
        adjustment = role_adjustments[role][skill_id]
    
    return min(base_value + adjustment, 95)  # Cap at 95

def calculate_top_performer_level(skill_id):
    """Calculate top performer level for a skill (mock data)"""
    # In a real application, this would be based on real data
    # Here, we'll generate values that are consistently above industry average
    industry_avg = calculate_industry_average(skill_id)
    return min(industry_avg + random.randint(10, 20), 95)  # Top performers are better but capped at 95

def get_skill_suggestions(user_skills, target_role=None):
    """Generate skill suggestions based on user's skills and target role"""
    if not user_skills:
        return []
    
    # Default suggestions
    suggestions = []
    
    # Role-based skill recommendations
    role_essential_skills = {
        "software_developer": ["javascript", "python", "react", "nodejs", "git", "sql"],
        "data_scientist": ["python", "machine_learning", "data_analysis", "sql", "tensorflow", "statistics"],
        "ux_designer": ["ux_design", "figma", "adobe_creative", "html_css", "user_research"],
        "product_manager": ["product_management", "agile", "communication", "leadership", "jira"],
        "devops_engineer": ["docker", "kubernetes", "aws", "azure", "git", "ci_cd", "linux"],
        "frontend_developer": ["javascript", "react", "html_css", "typescript", "responsive_design", "web_performance"],
        "backend_developer": ["nodejs", "python", "sql", "api_design", "database_design", "java"],
        "full_stack_developer": ["javascript", "nodejs", "react", "sql", "html_css", "git", "deployment"]
    }
    
    # Get current user skill IDs
    user_skill_ids = [s["skill_id"] for s in user_skills]
    
    # If target role is specified, recommend missing essential skills
    if target_role and target_role in role_essential_skills:
        essential_skills = role_essential_skills[target_role]
        missing_essential_skills = [s for s in essential_skills if s not in user_skill_ids]
        
        for skill_id in missing_essential_skills[:3]:  # Limit to 3 suggestions
            # Find the skill details
            for category, skills in SKILL_DATABASE.items():
                skill = next((s for s in skills if s["id"] == skill_id), None)
                if skill:
                    suggestions.append({
                        "skill_id": skill_id,
                        "name": skill["name"],
                        "category": category,
                        "reason": f"Essential skill for {target_role.replace('_', ' ').title()} role",
                        "importance": "high"
                    })
                    break
    
    # Add trending skills relevant to the user's existing skills
    trending_pairs = [
        ("javascript", "typescript"),
        ("react", "nextjs"),
        ("python", "machine_learning"),
        ("aws", "terraform"),
        ("docker", "kubernetes"),
        ("html_css", "tailwind"),
        ("ux_design", "figma"),
        ("sql", "nosql"),
        ("nodejs", "graphql")
    ]
    
    for skill1, skill2 in trending_pairs:
        if skill1 in user_skill_ids and skill2 not in user_skill_ids:
            # Find the skill details for skill2
            for category, skills in SKILL_DATABASE.items():
                skill = next((s for s in skills if s["id"] == skill2), None)
                if skill:
                    suggestions.append({
                        "skill_id": skill2,
                        "name": skill["name"],
                        "category": category,
                        "reason": f"Complements your knowledge of {skill1.replace('_', ' ').title()}",
                        "importance": "medium"
                    })
                    break
    
    # Remove duplicates and limit suggestions
    unique_suggestions = []
    suggestion_ids = set()
    
    for suggestion in suggestions:
        if suggestion["skill_id"] not in suggestion_ids:
            suggestion_ids.add(suggestion["skill_id"])
            unique_suggestions.append(suggestion)
    
    return unique_suggestions[:5]  # Limit to 5 suggestions

@skill_bp.route('/categories', methods=['GET'])
def get_skill_categories():
    """Get all skill categories"""
    return jsonify({
        "success": True,
        "categories": SKILL_CATEGORIES
    }), 200

@skill_bp.route('/list/<category_id>', methods=['GET'])
def get_skills_by_category(category_id):
    """Get skills by category"""
    if category_id not in SKILL_DATABASE:
        return jsonify({
            "success": False,
            "error": "Category not found"
        }), 404
    
    return jsonify({
        "success": True,
        "category_id": category_id,
        "skills": SKILL_DATABASE[category_id]
    }), 200

@skill_bp.route('/user/<user_id>', methods=['GET'])
def get_user_skills(user_id):
    """Get skills for a specific user"""
    user_skills = USER_SKILLS.get(user_id, [])
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "skills": user_skills
    }), 200

@skill_bp.route('/user/<user_id>', methods=['POST'])
def add_user_skill(user_id):
    """Add a skill to a user's profile"""
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    skill_id = data.get('skill_id')
    category_id = data.get('category_id')
    level = data.get('level', 1)
    
    if not skill_id or not category_id:
        return jsonify({"error": "Skill ID and category ID are required"}), 400
    
    # Validate category
    if category_id not in SKILL_DATABASE:
        return jsonify({"error": "Invalid category ID"}), 400
    
    # Validate skill
    skill = next((s for s in SKILL_DATABASE[category_id] if s["id"] == skill_id), None)
    if not skill:
        return jsonify({"error": "Invalid skill ID for the specified category"}), 400
    
    # Initialize user skills if not exists
    if user_id not in USER_SKILLS:
        USER_SKILLS[user_id] = []
    
    # Check if skill already exists
    existing_skill = next((s for s in USER_SKILLS[user_id] if s["skill_id"] == skill_id), None)
    
    if existing_skill:
        return jsonify({"error": "Skill already exists for this user"}), 400
    
    # Add new skill
    new_skill = {
        "id": str(uuid.uuid4()),
        "skill_id": skill_id,
        "name": skill["name"],
        "category_id": category_id,
        "level": level,
        "experience_points": 0,
        "progress_history": [
            {
                "date": datetime.now().isoformat(),
                "level": level
            }
        ],
        "added_date": datetime.now().isoformat(),
        "last_updated": datetime.now().isoformat()
    }
    
    USER_SKILLS[user_id].append(new_skill)
    
    # Check if earned any badges
    badge = get_skill_level_badge(level)
    
    return jsonify({
        "success": True,
        "message": "Skill added successfully",
        "skill": new_skill,
        "badge": badge
    }), 201

@skill_bp.route('/user/<user_id>/<skill_id>', methods=['PUT'])
def update_user_skill(user_id, skill_id):
    """Update a user's skill level"""
    if user_id not in USER_SKILLS:
        return jsonify({"error": "User not found"}), 404
    
    # Find the skill
    skill_index = next((i for i, s in enumerate(USER_SKILLS[user_id]) if s["skill_id"] == skill_id), None)
    
    if skill_index is None:
        return jsonify({"error": "Skill not found for this user"}), 404
    
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    new_level = data.get('level')
    
    if new_level is None:
        return jsonify({"error": "Level is required"}), 400
    
    # Get current skill
    current_skill = USER_SKILLS[user_id][skill_index]
    old_level = current_skill["level"]
    
    # Update skill
    USER_SKILLS[user_id][skill_index]["level"] = new_level
    USER_SKILLS[user_id][skill_index]["last_updated"] = datetime.now().isoformat()
    
    # Add to progress history
    USER_SKILLS[user_id][skill_index]["progress_history"].append({
        "date": datetime.now().isoformat(),
        "level": new_level
    })
    
    # Calculate XP gain
    xp_gain = 0
    if new_level > old_level:
        xp_gain = (new_level - old_level) * 10  # 10 XP per level increase
        USER_SKILLS[user_id][skill_index]["experience_points"] += xp_gain
    
    # Check for new badge
    badge = get_skill_level_badge(new_level)
    old_badge = get_skill_level_badge(old_level)
    badge_earned = badge["id"] != old_badge["id"]
    
    return jsonify({
        "success": True,
        "message": "Skill updated successfully",
        "skill": USER_SKILLS[user_id][skill_index],
        "xp_gained": xp_gain,
        "badge_earned": badge_earned,
        "badge": badge if badge_earned else None
    }), 200

@skill_bp.route('/user/<user_id>/<skill_id>', methods=['DELETE'])
def delete_user_skill(user_id, skill_id):
    """Remove a skill from a user's profile"""
    if user_id not in USER_SKILLS:
        return jsonify({"error": "User not found"}), 404
    
    # Find the skill
    skill_index = next((i for i, s in enumerate(USER_SKILLS[user_id]) if s["skill_id"] == skill_id), None)
    
    if skill_index is None:
        return jsonify({"error": "Skill not found for this user"}), 404
    
    # Remove skill
    removed_skill = USER_SKILLS[user_id].pop(skill_index)
    
    return jsonify({
        "success": True,
        "message": "Skill removed successfully",
        "removed_skill": removed_skill
    }), 200

@skill_bp.route('/radar/<user_id>', methods=['GET'])
def get_skill_radar(user_id):
    """Get radar chart data for user skills"""
    if user_id not in USER_SKILLS or not USER_SKILLS[user_id]:
        return jsonify({
            "success": False,
            "error": "No skills found for this user"
        }), 404
    
    # Get query parameters
    target_role = request.args.get('target_role', 'general')
    category = request.args.get('category', None)
    limit = int(request.args.get('limit', 8))  # Radar charts work best with 5-8 skills
    
    # Filter skills by category if specified
    user_skills = USER_SKILLS[user_id]
    if category:
        user_skills = [s for s in user_skills if s["category_id"] == category]
    
    # Sort by level (descending) and take top skills
    top_skills = sorted(user_skills, key=lambda s: s["level"], reverse=True)[:limit]
    
    # Prepare radar data
    radar_data = []
    
    for skill in top_skills:
        skill_id = skill["skill_id"]
        skill_name = skill["name"]
        
        # Get industry average and top performer data for comparison
        industry_avg = calculate_industry_average(skill_id, target_role)
        top_performer = calculate_top_performer_level(skill_id)
        
        radar_data.append({
            "skill": skill_name,
            "user": skill["level"],  # User's current level
            "industry_average": industry_avg,
            "top_performers": top_performer
        })
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "target_role": target_role,
        "radar_data": radar_data
    }), 200

@skill_bp.route('/gap-analysis/<user_id>', methods=['GET'])
def skill_gap_analysis(user_id):
    """Analyze skill gaps based on target role"""
    target_role = request.args.get('target_role')
    
    if not target_role:
        return jsonify({"error": "Target role is required"}), 400
    
    # Role-based required skills with importance ratings
    role_required_skills = {
        "software_developer": [
            {"id": "javascript", "name": "JavaScript", "importance": 4},
            {"id": "html_css", "name": "HTML/CSS", "importance": 4},
            {"id": "git", "name": "Git", "importance": 4},
            {"id": "react", "name": "React.js", "importance": 3},
            {"id": "nodejs", "name": "Node.js", "importance": 3},
            {"id": "sql", "name": "SQL", "importance": 3},
            {"id": "problem_solving", "name": "Problem Solving", "importance": 5},
            {"id": "teamwork", "name": "Teamwork", "importance": 4}
        ],
        "data_scientist": [
            {"id": "python", "name": "Python", "importance": 5},
            {"id": "machine_learning", "name": "Machine Learning", "importance": 5},
            {"id": "data_analysis", "name": "Data Analysis", "importance": 5},
            {"id": "sql", "name": "SQL", "importance": 4},
            {"id": "statistics", "name": "Statistics", "importance": 4},
            {"id": "tensorflow", "name": "TensorFlow", "importance": 3},
            {"id": "critical_thinking", "name": "Critical Thinking", "importance": 4},
            {"id": "problem_solving", "name": "Problem Solving", "importance": 4}
        ],
        "ux_designer": [
            {"id": "ux_design", "name": "UX Design", "importance": 5},
            {"id": "figma", "name": "Figma", "importance": 4},
            {"id": "adobe_creative", "name": "Adobe Creative Suite", "importance": 3},
            {"id": "html_css", "name": "HTML/CSS", "importance": 3},
            {"id": "user_research", "name": "User Research", "importance": 4},
            {"id": "communication", "name": "Communication", "importance": 4},
            {"id": "creativity", "name": "Creativity", "importance": 5},
            {"id": "teamwork", "name": "Teamwork", "importance": 3}
        ],
        "product_manager": [
            {"id": "product_management", "name": "Product Management", "importance": 5},
            {"id": "agile", "name": "Agile Methodologies", "importance": 4},
            {"id": "communication", "name": "Communication", "importance": 5},
            {"id": "leadership", "name": "Leadership", "importance": 4},
            {"id": "critical_thinking", "name": "Critical Thinking", "importance": 4},
            {"id": "negotiation", "name": "Negotiation", "importance": 3},
            {"id": "jira", "name": "Jira", "importance": 3},
            {"id": "data_analysis", "name": "Data Analysis", "importance": 3}
        ]
    }
    
    if target_role not in role_required_skills:
        return jsonify({"error": f"Target role '{target_role}' not supported for gap analysis"}), 400
    
    # Get user skills
    user_skills = USER_SKILLS.get(user_id, [])
    user_skill_map = {s["skill_id"]: s["level"] for s in user_skills}
    
    # Analyze gaps
    required_skills = role_required_skills[target_role]
    gaps = []
    strengths = []
    
    for skill in required_skills:
        skill_id = skill["id"]
        if skill_id in user_skill_map:
            user_level = user_skill_map[skill_id]
            industry_avg = calculate_industry_average(skill_id, target_role)
            
            # Determine if it's a strength or gap
            if user_level >= industry_avg:
                strengths.append({
                    "skill_id": skill_id,
                    "name": skill["name"],
                    "user_level": user_level,
                    "industry_average": industry_avg,
                    "difference": user_level - industry_avg,
                    "importance": skill["importance"]
                })
            else:
                gaps.append({
                    "skill_id": skill_id,
                    "name": skill["name"],
                    "user_level": user_level,
                    "industry_average": industry_avg,
                    "gap": industry_avg - user_level,
                    "importance": skill["importance"]
                })
        else:
            # Skill not present at all
            industry_avg = calculate_industry_average(skill_id, target_role)
            gaps.append({
                "skill_id": skill_id,
                "name": skill["name"],
                "user_level": 0,
                "industry_average": industry_avg,
                "gap": industry_avg,
                "importance": skill["importance"]
            })
    
    # Sort gaps by importance and gap size
    gaps.sort(key=lambda x: (x["importance"], x["gap"]), reverse=True)
    strengths.sort(key=lambda x: (x["importance"], x["difference"]), reverse=True)
    
    # Calculate overall match percentage
    total_importance = sum(s["importance"] for s in required_skills)
    weighted_gap_sum = sum(g["gap"] * g["importance"] for g in gaps)
    max_possible_gap = total_importance * 100  # Assuming max gap of 100 per skill
    
    match_percentage = 100 - (weighted_gap_sum / max_possible_gap) * 100 if max_possible_gap > 0 else 0
    match_percentage = max(0, min(100, match_percentage))  # Ensure between 0-100
    
    # Get training recommendations
    recommendations = []
    
    for gap in gaps[:3]:  # Top 3 gaps
        skill_id = gap["skill_id"]
        
        recommendations.append({
            "skill_id": skill_id,
            "name": gap["name"],
            "current_level": gap["user_level"],
            "target_level": gap["industry_average"],
            "importance": gap["importance"],
            "resources": [
                {
                    "title": f"Introduction to {gap['name']}",
                    "type": "course",
                    "platform": "Coursera",
                    "url": f"https://www.coursera.org/search?query={skill_id}"
                },
                {
                    "title": f"{gap['name']} for Professionals",
                    "type": "tutorial",
                    "platform": "Udemy",
                    "url": f"https://www.udemy.com/courses/search/?q={skill_id}"
                }
            ]
        })
    
    response = {
        "success": True,
        "user_id": user_id,
        "target_role": target_role,
        "match_percentage": round(match_percentage, 1),
        "gaps": gaps,
        "strengths": strengths,
        "recommendations": recommendations
    }
    
    return jsonify(response), 200

@skill_bp.route('/suggestions/<user_id>', methods=['GET'])
def get_skill_suggestions_route(user_id):
    """Get skill development suggestions for a user"""
    target_role = request.args.get('target_role')
    
    user_skills = USER_SKILLS.get(user_id, [])
    suggestions = get_skill_suggestions(user_skills, target_role)
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "target_role": target_role,
        "suggestions": suggestions
    }), 200

@skill_bp.route('/progress/<user_id>', methods=['GET'])
def get_skill_progress(user_id):
    """Get user's skill progress over time"""
    user_skills = USER_SKILLS.get(user_id, [])
    
    if not user_skills:
        return jsonify({
            "success": True,
            "user_id": user_id,
            "progress": []
        }), 200
    
    # Get progress data for visualization
    progress_data = []
    
    for skill in user_skills:
        history = skill.get("progress_history", [])
        
        if history:
            progress_data.append({
                "skill_id": skill["skill_id"],
                "name": skill["name"],
                "category": skill["category_id"],
                "current_level": skill["level"],
                "history": history
            })
    
    # Sort by most recently updated
    progress_data.sort(key=lambda x: datetime.fromisoformat(x["history"][-1]["date"]), reverse=True)
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "progress": progress_data
    }), 200

@skill_bp.route('/badges/<user_id>', methods=['GET'])
def get_user_skill_badges(user_id):
    """Get badges earned by user for skill development"""
    user_skills = USER_SKILLS.get(user_id, [])
    
    if not user_skills:
        return jsonify({
            "success": True,
            "user_id": user_id,
            "badges": []
        }), 200
    
    # Determine earned badges
    earned_badges = []
    
    # Individual skill level badges
    for skill in user_skills:
        level = skill["level"]
        badge = get_skill_level_badge(level)
        
        # Only add the highest badge for each skill
        if badge and badge["id"] != "beginner":  # Don't add beginner badges to avoid clutter
            earned_badge = badge.copy()
            earned_badge["skill_name"] = skill["name"]
            earned_badge["earned_date"] = skill["last_updated"]
            earned_badges.append(earned_badge)
    
    # Check for special badges
    advanced_skills = [s for s in user_skills if s["level"] >= 70]
    if len(advanced_skills) >= 5:
        skill_master = SKILL_BADGES["skill_master"].copy()
        skill_master["earned_date"] = datetime.now().isoformat()
        earned_badges.append(skill_master)
    
    # Check for well-rounded badge
    categories_at_intermediate = set()
    for skill in user_skills:
        if skill["level"] >= 40:  # Intermediate threshold
            categories_at_intermediate.add(skill["category_id"])
    
    if len(categories_at_intermediate) >= 3:
        well_rounded = SKILL_BADGES["well_rounded"].copy()
        well_rounded["earned_date"] = datetime.now().isoformat()
        earned_badges.append(well_rounded)
    
    # Check for tech guru badge
    tech_skills_advanced = [s for s in user_skills if s["category_id"] == "technical" and s["level"] >= 70]
    if len(tech_skills_advanced) >= 5:
        tech_guru = SKILL_BADGES["tech_guru"].copy()
        tech_guru["earned_date"] = datetime.now().isoformat()
        earned_badges.append(tech_guru)
    
    # Check for soft skills expert badge
    soft_skills_advanced = [s for s in user_skills if s["category_id"] == "soft" and s["level"] >= 70]
    if len(soft_skills_advanced) >= 3:
        soft_skills_expert = SKILL_BADGES["soft_skills_expert"].copy()
        soft_skills_expert["earned_date"] = datetime.now().isoformat()
        earned_badges.append(soft_skills_expert)
    
    # Remove duplicate badges
    unique_badges = []
    badge_ids = set()
    
    for badge in earned_badges:
        if badge["id"] not in badge_ids:
            badge_ids.add(badge["id"])
            unique_badges.append(badge)
    
    return jsonify({
        "success": True,
        "user_id": user_id,
        "badges": unique_badges
    }), 200
