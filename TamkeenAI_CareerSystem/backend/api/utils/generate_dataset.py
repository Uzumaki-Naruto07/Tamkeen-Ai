import pandas as pd
import numpy as np
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

def generate_software_engineer_dataset(num_samples: int = 100000) -> Optional[pd.DataFrame]:
    """
    Generate a synthetic Software Engineering interview dataset
    
    Args:
        num_samples: Number of samples to generate
        
    Returns:
        Synthetic DataFrame with interview data and scores
    """
    logger.info(f"Generating synthetic Software Engineering interview dataset with {num_samples} samples")
    
    # Define possible values for categorical features
    question_types = ['Technical', 'Problem Solving', 'System Design', 'Behavioral', 'Coding']
    topics = [
        'Algorithms', 'Data Structures', 'Object-Oriented Design', 'Database Systems',
        'Distributed Systems', 'Web Technologies', 'Programming Languages', 'Software Testing',
        'DevOps', 'Cloud Services', 'Security', 'Performance Optimization',
        'Concurrency', 'API Design', 'Microservices'
    ]
    difficulty_levels = ['Easy', 'Medium', 'Hard', 'Expert']
    
    # Templates for generating questions
    technical_templates = [
        "Explain the concept of {topic} and its applications.",
        "What are the key features of {topic}?",
        "Compare and contrast different approaches to {topic}.",
        "What are the best practices for implementing {topic}?",
        "How does {topic} affect system performance?"
    ]
    
    problem_solving_templates = [
        "How would you design a system for {topic}?",
        "Solve this problem related to {topic}.",
        "What's your approach to troubleshooting issues with {topic}?",
        "Design an algorithm to handle {topic} efficiently.",
        "How would you scale a system that uses {topic}?"
    ]
    
    behavioral_templates = [
        "Describe a time when you had to work with {topic} under pressure.",
        "How do you stay updated on developments in {topic}?",
        "Describe a challenging bug you encountered related to {topic} and how you solved it.",
        "How do you explain complex {topic} concepts to non-technical stakeholders?",
        "Describe a situation where you had to make a trade-off when implementing {topic}.",
        "How do you approach learning new technologies related to {topic}?"
    ]
    
    # Generate synthetic dataset
    data = []
    for i in range(num_samples):
        question_id = f"Q{i+1:05d}"
        question_type = np.random.choice(question_types, p=[0.4, 0.2, 0.2, 0.1, 0.1])
        topic = np.random.choice(topics)
        difficulty = np.random.choice(difficulty_levels, p=[0.2, 0.4, 0.3, 0.1])
        
        # Select template based on question type
        if question_type == 'Technical':
            template = np.random.choice(technical_templates)
        elif question_type in ['Problem Solving', 'System Design']:
            template = np.random.choice(problem_solving_templates)
        elif question_type == 'Behavioral':
            template = np.random.choice(behavioral_templates)
        elif question_type == 'Coding':
            template = "Write code to implement {topic}."
        else:
            template = "Explain {topic}."
            
        # Generate question
        question = template.format(topic=topic.lower())
        
        # Generate a plausible answer
        answer_length = np.random.randint(100, 500)
        answer = f"This is a synthetic answer about {topic} for the question type {question_type}. " + \
                f"The answer addresses key points relevant to {topic} with appropriate detail and clarity. " + \
                "It includes relevant examples and demonstrates understanding of core concepts."
        answer = answer.ljust(answer_length, ' ')
        
        # Add base entry
        entry = {
            'question_id': question_id,
            'question': question,
            'answer': answer,
            'question_type': question_type,
            'topic': topic,
            'difficulty_level': difficulty
        }
        
        # Add synthetic evaluation metrics based on difficulty and question type
        # More difficult questions tend to have lower scores
        difficulty_factor = {'Easy': 0.9, 'Medium': 0.8, 'Hard': 0.7, 'Expert': 0.6}
        
        # Base score with some randomness
        base_score = np.random.normal(difficulty_factor[difficulty] * 100, 10)
        base_score = np.clip(base_score, 50, 100)
        
        # Different question types emphasize different skills
        if question_type == 'Technical':
            technical = base_score + np.random.normal(5, 5)
            problem_solving = base_score + np.random.normal(-5, 10)
            communication = base_score + np.random.normal(-10, 15)
            cultural_fit = base_score + np.random.normal(-5, 15)
        elif question_type == 'Problem Solving':
            technical = base_score + np.random.normal(0, 10)
            problem_solving = base_score + np.random.normal(10, 5)
            communication = base_score + np.random.normal(-5, 15)
            cultural_fit = base_score + np.random.normal(-5, 15)
        elif question_type == 'Behavioral':
            technical = base_score + np.random.normal(-10, 15)
            problem_solving = base_score + np.random.normal(-5, 10)
            communication = base_score + np.random.normal(10, 5)
            cultural_fit = base_score + np.random.normal(10, 5)
        else:  # System Design, Coding, etc.
            technical = base_score + np.random.normal(5, 10)
            problem_solving = base_score + np.random.normal(5, 10)
            communication = base_score + np.random.normal(0, 15)
            cultural_fit = base_score + np.random.normal(0, 15)
            
        # Clip scores to valid range
        technical = np.clip(technical, 0, 100)
        problem_solving = np.clip(problem_solving, 0, 100)
        communication = np.clip(communication, 0, 100)
        cultural_fit = np.clip(cultural_fit, 0, 100)
        
        # Calculate overall score as weighted average
        overall = (0.4 * technical + 0.3 * problem_solving + 
                   0.2 * communication + 0.1 * cultural_fit)
        
        # Add evaluation metrics
        entry['technical'] = int(technical)
        entry['problem_solving'] = int(problem_solving)
        entry['communication'] = int(communication)
        entry['cultural_fit'] = int(cultural_fit)
        entry['overall'] = int(overall)
        
        # Generate random evaluation date within the last 2 years
        days_ago = np.random.randint(0, 730)  # 0-730 days ago (2 years)
        evaluation_date = pd.Timestamp.now() - pd.Timedelta(days=days_ago)
        entry['evaluation_date'] = evaluation_date.strftime('%Y-%m-%d')
        
        # Add candidate ID (synthetic)
        entry['candidate_id'] = f"C{np.random.randint(1, 1001):04d}"
        
        data.append(entry)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Save raw data
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/synthetic_se_interview_data.csv", index=False)
    
    logger.info(f"Generated synthetic dataset with {len(df)} samples")
    return df 