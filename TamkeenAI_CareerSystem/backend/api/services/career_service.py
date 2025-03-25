from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from ..models.database_models import CareerProfile, Certification, CareerMatch, ChatHistory
from ..models.career_models import UserProfileCreate
from ..utils.career_utils import perform_career_matching, calculate_profile_completion

def create_or_update_career_profile(db: Session, profile_data: Dict[str, Any], user_id: int) -> CareerProfile:
    """Create or update a user's career profile"""
    # Check if profile already exists
    existing_profile = db.query(CareerProfile).filter(CareerProfile.user_id == user_id).first()
    
    if existing_profile:
        # Update existing profile
        for key, value in profile_data.items():
            if key != 'certifications' and key != 'user_id' and hasattr(existing_profile, key):
                setattr(existing_profile, key, value)
        
        # Update completion percentage
        existing_profile.completion_percentage = calculate_profile_completion(profile_data)
        
        db.commit()
        db.refresh(existing_profile)
        profile = existing_profile
    else:
        # Create new profile
        profile_data['completion_percentage'] = calculate_profile_completion(profile_data)
        profile_data['user_id'] = user_id
        
        # Remove certifications from main data
        certifications_data = profile_data.pop('certifications', [])
        
        # Create profile
        profile = CareerProfile(**profile_data)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Handle certifications
    if 'certifications' in profile_data and profile_data['certifications']:
        # Delete existing certifications
        db.query(Certification).filter(Certification.career_profile_id == profile.id).delete()
        
        # Add new certifications
        for cert_data in profile_data['certifications']:
            cert = Certification(
                career_profile_id=profile.id,
                name=cert_data['name'],
                issuer=cert_data['issuer'],
                date=cert_data['date']
            )
            db.add(cert)
        
        db.commit()
    
    return profile

def save_career_matches(db: Session, profile_id: int, matches: Dict[str, Any]) -> List[CareerMatch]:
    """Save career matches to the database"""
    # Delete existing matches
    db.query(CareerMatch).filter(CareerMatch.career_profile_id == profile_id).delete()
    
    # Add new matches
    saved_matches = []
    for career_id, match_data in matches.items():
        match = CareerMatch(
            career_profile_id=profile_id,
            career_id=career_id,
            title=match_data['title'],
            title_ar=match_data['title_ar'],
            match_percentage=match_data['match_percentage'],
            skills_match=match_data['skills_match'],
            education_match=match_data['education_match'],
            trait_match=match_data['trait_match']
        )
        db.add(match)
        saved_matches.append(match)
    
    db.commit()
    return saved_matches

def save_chat_history(db: Session, user_id: int, query: str, response: str, language: str = "en") -> ChatHistory:
    """Save chat history to the database"""
    chat_entry = ChatHistory(
        user_id=user_id,
        query=query,
        response=response,
        language=language
    )
    db.add(chat_entry)
    db.commit()
    db.refresh(chat_entry)
    return chat_entry

def get_career_profile(db: Session, user_id: int) -> Optional[CareerProfile]:
    """Get a user's career profile"""
    return db.query(CareerProfile).filter(CareerProfile.user_id == user_id).first()

def get_chat_history(db: Session, user_id: int, limit: int = 20) -> List[ChatHistory]:
    """Get a user's chat history"""
    return db.query(ChatHistory).filter(
        ChatHistory.user_id == user_id
    ).order_by(ChatHistory.timestamp.desc()).limit(limit).all() 