from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.database import Base

class CareerProfile(Base):
    __tablename__ = "career_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100))
    email = Column(String(100))
    education_status = Column(String(255))
    linkedin_url = Column(String(255), nullable=True)
    skills = Column(Text)
    career_goals = Column(Text)
    experience_level = Column(String(100))
    industry_preference = Column(String(100))
    work_environment = Column(String(100))
    personality_assessment = Column(JSON)
    completion_percentage = Column(Integer, default=0)
    language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="career_profile")
    certifications = relationship("Certification", back_populates="career_profile")
    career_matches = relationship("CareerMatch", back_populates="career_profile")

class Certification(Base):
    __tablename__ = "certifications"
    
    id = Column(Integer, primary_key=True, index=True)
    career_profile_id = Column(Integer, ForeignKey("career_profiles.id"))
    name = Column(String(255))
    issuer = Column(String(255))
    date = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    career_profile = relationship("CareerProfile", back_populates="certifications")

class CareerMatch(Base):
    __tablename__ = "career_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    career_profile_id = Column(Integer, ForeignKey("career_profiles.id"))
    career_id = Column(String(100))
    title = Column(String(255))
    title_ar = Column(String(255))
    match_percentage = Column(Integer)
    skills_match = Column(Integer)
    education_match = Column(Integer)
    trait_match = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    career_profile = relationship("CareerProfile", back_populates="career_matches")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(Text)
    response = Column(Text)
    language = Column(String(10), default="en")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

class ATSAnalysis(Base):
    __tablename__ = "ats_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_title = Column(String(255))
    score = Column(Float)
    assessment = Column(Text)
    matching_keywords = Column(JSON)
    missing_keywords = Column(JSON)
    llm_analysis = Column(Text, nullable=True)
    improvement_roadmap = Column(Text, nullable=True)
    resume_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User") 