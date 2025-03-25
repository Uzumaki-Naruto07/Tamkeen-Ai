from typing import Dict, List, Any, Optional
import json
from ..models.assessment_models import (
    InterestArea, WorkValue, SkillLevel, PersonalityQuestion, 
    InterestQuestion, ValueQuestion, AssessmentResponse, AssessmentResult
)

# Sample questions for assessments
PERSONALITY_QUESTIONS = [
    {"id": "p1", "question": "I enjoy being the center of attention at social events", "trait": "extraversion"},
    {"id": "p2", "question": "I prefer to stick to a schedule", "trait": "conscientiousness"},
    {"id": "p3", "question": "I am interested in abstract ideas", "trait": "openness"},
    {"id": "p4", "question": "I sympathize with others' feelings", "trait": "agreeableness"},
    {"id": "p5", "question": "I get stressed out easily", "trait": "neuroticism", "reverse_scored": True},
    {"id": "p6", "question": "I start conversations with strangers easily", "trait": "extraversion"},
    {"id": "p7", "question": "I pay attention to details", "trait": "conscientiousness"},
    {"id": "p8", "question": "I have a vivid imagination", "trait": "openness"},
    {"id": "p9", "question": "I make people feel at ease", "trait": "agreeableness"},
    {"id": "p10", "question": "I worry about things", "trait": "neuroticism", "reverse_scored": True},
]

INTEREST_QUESTIONS = [
    {"id": "i1", "question": "I would enjoy repairing electronic devices", "interest_area": InterestArea.REALISTIC},
    {"id": "i2", "question": "I like solving complex problems", "interest_area": InterestArea.INVESTIGATIVE},
    {"id": "i3", "question": "I enjoy creative writing", "interest_area": InterestArea.ARTISTIC},
    {"id": "i4", "question": "I like teaching others", "interest_area": InterestArea.SOCIAL},
    {"id": "i5", "question": "I enjoy persuading people to my point of view", "interest_area": InterestArea.ENTERPRISING},
    {"id": "i6", "question": "I like working with detailed information", "interest_area": InterestArea.CONVENTIONAL},
    {"id": "i7", "question": "I would enjoy building things", "interest_area": InterestArea.REALISTIC},
    {"id": "i8", "question": "I enjoy analyzing data", "interest_area": InterestArea.INVESTIGATIVE},
    {"id": "i9", "question": "I like designing things", "interest_area": InterestArea.ARTISTIC},
    {"id": "i10", "question": "I enjoy helping others with their problems", "interest_area": InterestArea.SOCIAL},
    {"id": "i11", "question": "I like managing projects", "interest_area": InterestArea.ENTERPRISING},
    {"id": "i12", "question": "I enjoy organizing information", "interest_area": InterestArea.CONVENTIONAL},
]

VALUE_QUESTIONS = [
    {"id": "v1", "question": "It's important to me to see the results of my work", "work_value": WorkValue.ACHIEVEMENT},
    {"id": "v2", "question": "I prefer to make my own decisions at work", "work_value": WorkValue.INDEPENDENCE},
    {"id": "v3", "question": "I value being appreciated for my contributions", "work_value": WorkValue.RECOGNITION},
    {"id": "v4", "question": "Working with friendly colleagues is important to me", "work_value": WorkValue.RELATIONSHIPS},
    {"id": "v5", "question": "I value a supportive supervisor", "work_value": WorkValue.SUPPORT},
    {"id": "v6", "question": "Work-life balance is essential to me", "work_value": WorkValue.WORKING_CONDITIONS},
]

# Career data with Holland code matches (RIASEC model)
CAREER_HOLLAND_CODES = {
    "Software Developer": {"primary": InterestArea.INVESTIGATIVE, "secondary": InterestArea.REALISTIC, "tertiary": InterestArea.CONVENTIONAL},
    "Data Scientist": {"primary": InterestArea.INVESTIGATIVE, "secondary": InterestArea.CONVENTIONAL, "tertiary": InterestArea.REALISTIC},
    "UX Designer": {"primary": InterestArea.ARTISTIC, "secondary": InterestArea.INVESTIGATIVE, "tertiary": InterestArea.SOCIAL},
    "Marketing Manager": {"primary": InterestArea.ENTERPRISING, "secondary": InterestArea.SOCIAL, "tertiary": InterestArea.ARTISTIC},
    "Financial Analyst": {"primary": InterestArea.CONVENTIONAL, "secondary": InterestArea.INVESTIGATIVE, "tertiary": InterestArea.ENTERPRISING},
    "Teacher": {"primary": InterestArea.SOCIAL, "secondary": InterestArea.ARTISTIC, "tertiary": InterestArea.ENTERPRISING},
    "Mechanical Engineer": {"primary": InterestArea.REALISTIC, "secondary": InterestArea.INVESTIGATIVE, "tertiary": InterestArea.CONVENTIONAL},
    "HR Specialist": {"primary": InterestArea.SOCIAL, "secondary": InterestArea.ENTERPRISING, "tertiary": InterestArea.CONVENTIONAL},
    "Graphic Designer": {"primary": InterestArea.ARTISTIC, "secondary": InterestArea.REALISTIC, "tertiary": InterestArea.ENTERPRISING},
    "Project Manager": {"primary": InterestArea.ENTERPRISING, "secondary": InterestArea.CONVENTIONAL, "tertiary": InterestArea.SOCIAL},
}

def get_personality_questions() -> List[Dict[str, Any]]:
    """Get all personality assessment questions"""
    return PERSONALITY_QUESTIONS

def get_interest_questions() -> List[Dict[str, Any]]:
    """Get all interest assessment questions"""
    return INTEREST_QUESTIONS

def get_value_questions() -> List[Dict[str, Any]]:
    """Get all work value assessment questions"""
    return VALUE_QUESTIONS

def process_personality_assessment(responses: List[AssessmentResponse]) -> Dict[str, float]:
    """Process personality assessment responses into trait scores"""
    # Group questions by trait
    trait_questions = {}
    for question in PERSONALITY_QUESTIONS:
        trait = question["trait"]
        if trait not in trait_questions:
            trait_questions[trait] = []
        trait_questions[trait].append(question["id"])
    
    # Calculate average score for each trait
    trait_scores = {}
    for trait, question_ids in trait_questions.items():
        trait_responses = [r for r in responses if r.question_id in question_ids]
        
        if not trait_responses:
            trait_scores[trait] = 0
            continue
        
        # Adjust for reverse-scored questions
        adjusted_scores = []
        for response in trait_responses:
            question = next((q for q in PERSONALITY_QUESTIONS if q["id"] == response.question_id), None)
            if question and question.get("reverse_scored", False):
                # For 1-5 scale, reverse would be 6 - score
                adjusted_scores.append(6 - response.score)
            else:
                adjusted_scores.append(response.score)
        
        trait_scores[trait] = sum(adjusted_scores) / len(adjusted_scores)
    
    # Normalize to 0-1 range (assuming 1-5 scale)
    normalized_scores = {trait: score/5 for trait, score in trait_scores.items()}
    
    return normalized_scores

def process_interest_assessment(responses: List[AssessmentResponse]) -> Dict[str, float]:
    """Process interest assessment responses into RIASEC scores"""
    # Group questions by interest area
    interest_questions = {}
    for question in INTEREST_QUESTIONS:
        area = question["interest_area"]
        if area not in interest_questions:
            interest_questions[area] = []
        interest_questions[area].append(question["id"])
    
    # Calculate average score for each interest area
    interest_scores = {}
    for area, question_ids in interest_questions.items():
        area_responses = [r for r in responses if r.question_id in question_ids]
        
        if not area_responses:
            interest_scores[area] = 0
            continue
        
        interest_scores[area] = sum(r.score for r in area_responses) / len(area_responses)
    
    # Normalize to 0-1 range (assuming 1-5 scale)
    normalized_scores = {area: score/5 for area, score in interest_scores.items()}
    
    return normalized_scores

def process_value_assessment(responses: List[AssessmentResponse]) -> Dict[str, float]:
    """Process work value assessment responses into value scores"""
    # Group questions by work value
    value_questions = {}
    for question in VALUE_QUESTIONS:
        value = question["work_value"]
        if value not in value_questions:
            value_questions[value] = []
        value_questions[value].append(question["id"])
    
    # Calculate average score for each work value
    value_scores = {}
    for value, question_ids in value_questions.items():
        value_responses = [r for r in responses if r.question_id in question_ids]
        
        if not value_responses:
            value_scores[value] = 0
            continue
        
        value_scores[value] = sum(r.score for r in value_responses) / len(value_responses)
    
    # Normalize to 0-1 range (assuming 1-5 scale)
    normalized_scores = {value: score/5 for value, score in value_scores.items()}
    
    return normalized_scores

def match_careers_to_interests(interest_scores: Dict[str, float]) -> List[Dict[str, Any]]:
    """Match user interests to potential careers using Holland codes"""
    career_matches = []
    
    # Find primary, secondary, tertiary interest areas
    sorted_interests = sorted(interest_scores.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_interests[0][0] if len(sorted_interests) > 0 else None
    secondary = sorted_interests[1][0] if len(sorted_interests) > 1 else None
    tertiary = sorted_interests[2][0] if len(sorted_interests) > 2 else None
    
    # Calculate match score for each career
    for career, codes in CAREER_HOLLAND_CODES.items():
        match_score = 0
        reasons = []
        
        # Primary interest area match
        if codes["primary"] == primary:
            match_score += 0.6  # 60% weight for primary match
            reasons.append(f"Your primary interest area ({primary}) matches this career's primary requirement.")
        
        # Secondary interest area match
        if codes["secondary"] == secondary:
            match_score += 0.3  # 30% weight for secondary match
            reasons.append(f"Your secondary interest area ({secondary}) matches this career's secondary requirement.")
        
        # Tertiary interest area match
        if codes["tertiary"] == tertiary:
            match_score += 0.1  # 10% weight for tertiary match
            reasons.append(f"Your tertiary interest area ({tertiary}) matches this career's tertiary requirement.")
        
        # Add to career matches if there's any match
        if match_score > 0:
            career_matches.append({
                "career": career,
                "match_score": match_score * 100,  # Convert to percentage
                "reasons": reasons
            })
    
    # Sort by match score
    career_matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    return career_matches

def process_comprehensive_assessment(
    personality_responses: List[AssessmentResponse],
    interest_responses: List[AssessmentResponse],
    value_responses: List[AssessmentResponse]
) -> AssessmentResult:
    """Process all assessment responses and provide career recommendations"""
    
    # Get scores for each assessment type
    personality_traits = process_personality_assessment(personality_responses)
    interest_areas = process_interest_assessment(interest_responses)
    work_values = process_value_assessment(value_responses)
    
    # Match to careers based on interests (primary factor)
    recommended_careers = match_careers_to_interests(interest_areas)
    
    # Extract reasons for career alignment
    career_alignment_reasons = []
    for career_match in recommended_careers[:3]:  # Top 3 matches
        career = career_match["career"]
        reasons = career_match["reasons"]
        
        # Add personality alignment reasons
        if personality_traits.get("extraversion", 0) > 0.7:
            if career in ["Marketing Manager", "HR Specialist", "Project Manager"]:
                reasons.append(f"Your high extraversion aligns well with {career} roles.")
        
        # Add value alignment reasons
        if work_values.get(WorkValue.ACHIEVEMENT, 0) > 0.7:
            if career in ["Software Developer", "Data Scientist", "Project Manager"]:
                reasons.append(f"Your emphasis on achievement aligns with the results-oriented nature of {career} roles.")
        
        career_alignment_reasons.extend(reasons)
    
    return AssessmentResult(
        personality_traits=personality_traits,
        interest_areas=interest_areas,
        work_values=work_values,
        recommended_careers=recommended_careers[:5],  # Top 5 matches
        career_alignment_reasons=career_alignment_reasons
    ) 