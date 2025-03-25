# Section 5b: Data Retrieval

import pandas as pd
import numpy as np
import random
import os
import re
import string
from datetime import datetime, timedelta
from datasets import load_dataset

# Import our hybrid dataset generator
try:
    from hybrid_dataset_generator import generate_hybrid_dataset
    HYBRID_GENERATOR_AVAILABLE = True
except ImportError:
    HYBRID_GENERATOR_AVAILABLE = False
    print("Hybrid dataset generator not available, will use standard methods")

def load_hf_dataset():
    """Load Software Engineering interview dataset from Hugging Face"""
    print("Loading Software Engineering interview dataset from Hugging Face...")

    try:
        # Load the dataset from Hugging Face
        splits = {'train': 'data/train-00000-of-00001.parquet', 'test': 'data/test-00000-of-00001.parquet'}
        df = pd.read_parquet("hf://datasets/Vineeshsuiii/Software_Engineering_interview_datasets/" + splits["train"])

        # Filter for Software Engineer roles only
        if 'profession' in df.columns:
            df = df[df['profession'] == 'Software Engineer']
            print(f"Filtered dataset to include only Software Engineer roles: {len(df)} records")
        else:
            print("Warning: 'profession' column not found in dataset. Using all data.")

        # Ensure we have all required target columns
        required_targets = ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall']
        missing_targets = [target for target in required_targets if target not in df.columns]

        if missing_targets:
            print(f"Warning: Missing target columns: {missing_targets}")
            print("Will generate synthetic values for missing targets")

            # Generate missing targets with some correlation to existing ones
            for target in missing_targets:
                if 'score' in df.columns:  # Use overall score as base if available
                    base = df['score']
                elif 'overall' in df.columns and target != 'overall':
                    base = df['overall']
                else:
                    base = np.random.randint(60, 100, size=len(df))

                # Add some random variation
                df[target] = np.clip(base + np.random.randint(-10, 11, size=len(df)), 0, 100)

        # Create any missing features that might be needed for modeling
        if 'question_length' not in df.columns and 'question' in df.columns:
            df['question_length'] = df['question'].apply(lambda x: len(str(x)) if pd.notna(x) else 0)

        if 'word_count' not in df.columns and 'question' in df.columns:
            df['word_count'] = df['question'].apply(lambda x: len(str(x).split()) if pd.notna(x) else 0)

        print(f"Dataset loaded successfully with {len(df)} records")
        return df

    except Exception as e:
        print(f"Error loading dataset from Hugging Face: {str(e)}")
        print("Falling back to synthetic data generation...")
        return None

def generate_software_engineer_dataset(num_samples=10000):
    """Generate a synthetic dataset focused only on Software Engineer roles"""
    print(f"Generating {num_samples} Software Engineer interview samples...")

    # Define data distributions for Software Engineer questions
    question_types = ["Technical", "Behavioral", "Problem-Solving", "Cultural Fit", "Leadership"]
    difficulty_levels = ["Easy", "Medium", "Hard"]

    # Software Engineer specific topics
    se_topics = [
        "Algorithms", "Data Structures", "Object-Oriented Programming",
        "System Design", "Database Design", "Web Development",
        "DevOps", "Cloud Infrastructure", "Testing", "Debugging",
        "Version Control", "API Design", "Microservices", "Security"
    ]

    # Ensure a more balanced distribution across categories
    # For a 100K dataset, aim for roughly 25K weak, 50K average, 25K strong
    weak_proportion = 0.25
    average_proportion = 0.5
    strong_proportion = 0.25

    # Calculate sample counts
    weak_count = int(num_samples * weak_proportion)
    average_count = int(num_samples * average_proportion)
    strong_count = num_samples - weak_count - average_count

    # Generate questions and evaluations
    questions_data = []
    evaluations_data = []

    # Track the current counts for each category
    current_weak = 0
    current_average = 0
    current_strong = 0

    # Generate short responses for some of the weak examples (minimal/poor answers)
    minimal_responses = [
        "I don't know.",
        "Not sure",
        "No idea",
        "idk",
        "Skip",
        "I have no experience with that",
        "Never done that before",
        "What do you mean?",
        "Can you explain the question?",
        "This isn't my area",
        "I'm not familiar with this",
        "I'd have to look that up",
        "I haven't worked on that",
        "I'll get back to you on that",
        "That's not in my skill set",
        "Haven't learned that yet",
        "I'm confused by your question",
        "Can we move to another question?",
        "I'm drawing a blank",
        "I'd need to ask someone else",
    ]

    for i in range(1, num_samples + 1):
        # Generate question
        question_id = i
        topic = random.choice(se_topics)
        question_type = random.choice(question_types)
        difficulty = random.choice(difficulty_levels)

        # Determine which category this sample should be (weak, average, strong)
        if current_weak < weak_count:
            target_category = "weak"
            current_weak += 1
        elif current_average < average_count:
            target_category = "average"
            current_average += 1
        else:
            target_category = "strong"
            current_strong += 1

        # Generate questions based on type
        if question_type == "Technical":
            question = f"Explain how you would implement {topic} in a real-world software project."
        elif question_type == "Behavioral":
            question = f"Describe a time when you had to collaborate with others to solve a {topic.lower()} challenge."
        elif question_type == "Problem-Solving":
            question = f"How would you approach debugging a complex issue related to {topic}?"
        elif question_type == "Cultural Fit":
            question = f"How do you stay up-to-date with the latest developments in {topic}?"
        else:  # Leadership
            question = f"Tell me about a time you led a project involving {topic}."

        # Add to questions data
        questions_data.append({
            "id": question_id,
            "question_text": question,
            "question_type": question_type,
            "topic": topic,
            "difficulty": difficulty
        })

        # Generate answer based on target category
        if target_category == "weak":
            # For weak responses, we'll have some minimal responses and some longer but low-quality ones
            if random.random() < 0.4:  # 40% chance of minimal response
                answer = random.choice(minimal_responses)
                answer_length = "Very Short"
                technical_accuracy = "Low"
                communication_clarity = "Low"
                problem_solving = "Weak"
                cultural_fit = "Poor"
            else:
                answer = f"I think {topic} is important but I'm not very familiar with it. I would probably need to do some research to understand how to apply it properly."
                answer_length = "Short"
                technical_accuracy = random.choices(["Low", "Medium"], weights=[0.8, 0.2])[0]
                communication_clarity = random.choices(["Low", "Medium"], weights=[0.7, 0.3])[0]
                problem_solving = random.choices(["Weak", "Adequate"], weights=[0.8, 0.2])[0]
                cultural_fit = random.choices(["Poor", "Neutral"], weights=[0.7, 0.3])[0]

            # Set scores in the appropriate range for weak responses
            technical_score = random.uniform(10, 35)
            communication_score = random.uniform(10, 35)
            problem_solving_score = random.uniform(10, 35)
            cultural_fit_score = random.uniform(10, 35)
            overall_score = (technical_score + communication_score + problem_solving_score + cultural_fit_score) / 4

        elif target_category == "average":
            answer = f"When working with {topic}, I try to follow best practices. I've used it in a few projects before. " \
                     f"For example, in one project, we implemented a {topic} solution that helped improve our process."

            answer_length = random.choices(["Medium", "Long"], weights=[0.7, 0.3])[0]
            technical_accuracy = random.choices(["Medium", "High"], weights=[0.8, 0.2])[0]
            communication_clarity = random.choices(["Medium", "High"], weights=[0.7, 0.3])[0]
            problem_solving = random.choices(["Adequate", "Strong"], weights=[0.7, 0.3])[0]
            cultural_fit = random.choices(["Neutral", "Good"], weights=[0.6, 0.4])[0]

            # Set scores in the appropriate range for average responses
            technical_score = random.uniform(40, 70)
            communication_score = random.uniform(40, 70)
            problem_solving_score = random.uniform(40, 70)
            cultural_fit_score = random.uniform(40, 70)
            overall_score = (technical_score + communication_score + problem_solving_score + cultural_fit_score) / 4

        else:  # strong
            answer = f"I have extensive experience with {topic}. In my previous role, I led the implementation of a " \
                     f"{topic} solution that resulted in a 30% improvement in performance. " \
                     f"I follow a systematic approach where I first analyze requirements, then design a solution " \
                     f"considering scalability and maintainability. I've also mentored junior engineers on best practices for {topic}."

            answer_length = "Long"
            technical_accuracy = "High"
            communication_clarity = random.choices(["Medium", "High"], weights=[0.2, 0.8])[0]
            problem_solving = "Strong"
            cultural_fit = random.choices(["Neutral", "Good"], weights=[0.1, 0.9])[0]

            # Set scores in the appropriate range for strong responses
            technical_score = random.uniform(75, 100)
            communication_score = random.uniform(75, 100)
            problem_solving_score = random.uniform(75, 100)
            cultural_fit_score = random.uniform(75, 100)
            overall_score = (technical_score + communication_score + problem_solving_score + cultural_fit_score) / 4

        # Add to evaluations data
        evaluations_data.append({
            "id": question_id,
            "answer_text": answer,
            "technical_score": technical_score,
            "communication_score": communication_score,
            "problem_solving_score": problem_solving_score,
            "cultural_fit_score": cultural_fit_score,
            "overall_score": overall_score,
            "answer_length": answer_length,
            "technical_accuracy": technical_accuracy,
            "communication_clarity": communication_clarity,
            "problem_solving": problem_solving,
            "cultural_fit": cultural_fit,
            "category": target_category.capitalize(),  # "Weak", "Average", or "Strong"
            "evaluation_date": datetime.now().strftime("%Y-%m-%d")  # Add today's date
        })

        # Show progress
        if i % 2000 == 0 or i == num_samples:
            print(f"Generated {i}/{num_samples} questions and {len(evaluations_data)} evaluations")

    # Create DataFrames
    questions_df = pd.DataFrame(questions_data)
    evaluations_df = pd.DataFrame(evaluations_data)

    # Merge the datasets
    merged_df = pd.merge(questions_df, evaluations_df, on="id")

    # Save to CSV
    print("Saving CSV files...")
    merged_df.to_csv("se_interview_questions.csv", index=False)

    print(f"Dataset generation complete!")
    print(f"- Questions dataset: {len(questions_df)} records")
    print(f"- Evaluations dataset: {len(evaluations_df)} records")

    # Now create a merged dataset for ML
    print("Creating merged ML dataset...")
    merged_df = pd.merge(evaluations_df, questions_df, on='id', how='inner')

    # Create dummy variables for categorical features
    question_type_dummies = pd.get_dummies(merged_df['question_type'], prefix='question_type')
    difficulty_dummies = pd.get_dummies(merged_df['difficulty'], prefix='difficulty')
    topic_dummies = pd.get_dummies(merged_df['topic'], prefix='topic')

    # Create date-related features
    try:
        merged_df['evaluation_date'] = pd.to_datetime(merged_df['evaluation_date'])
        merged_df['month'] = merged_df['evaluation_date'].dt.month
        merged_df['year'] = merged_df['evaluation_date'].dt.year
    except (KeyError, ValueError) as e:
        print(f"Warning: Error processing dates: {e}. Using default values.")
        # Use current date information if there's an issue
        current_date = datetime.now()
        merged_df['month'] = current_date.month
        merged_df['year'] = current_date.year

    # Text-based features from questions
    merged_df['question_length'] = merged_df['question_text'].apply(len)
    merged_df['word_count'] = merged_df['question_text'].apply(lambda x: len(str(x).split()))

    # Create the final feature dataset
    features = pd.concat([
        merged_df[['id', 'question_length', 'word_count', 'month', 'year']],
        question_type_dummies,
        difficulty_dummies,
        topic_dummies
    ], axis=1)

    # Create ML dataset
    ml_dataset = features.copy()
    ml_dataset['score'] = merged_df['overall_score']
    ml_dataset['overall'] = merged_df['overall_score']
    ml_dataset['technical'] = merged_df['technical_score']
    ml_dataset['communication'] = merged_df['communication_score']
    ml_dataset['problem_solving'] = merged_df['problem_solving_score']
    ml_dataset['cultural_fit'] = merged_df['cultural_fit_score']

    # Map recommendation categories
    def map_to_category(score):
        if score >= 75:
            return 2  # Strong
        elif score >= 40:
            return 1  # Average
        else:
            return 0  # Weak

    # Add classifier target that maps directly to the category field (Weak=0, Average=1, Strong=2)
    ml_dataset['classifier'] = merged_df['category'].map({'Weak': 0, 'Average': 1, 'Strong': 2})

    # Also calculate the classifier based on overall score (use this as a fallback)
    ml_dataset['classifier_score_based'] = ml_dataset['overall'].apply(map_to_category)

    # Store text fields for reference
    ml_dataset['question_text'] = merged_df['question_text']
    ml_dataset['question_type'] = merged_df['question_type']
    ml_dataset['difficulty_level'] = merged_df['difficulty']
    ml_dataset['topic'] = merged_df['topic']

    # Add the answer_text column that's required by process_dataset_for_ml
    if 'answer_text' not in ml_dataset.columns:
        # Create sample answers based on the category
        def generate_sample_answer(row):
            quality = "excellent" if row['classifier'] == 2 else "average" if row['classifier'] == 1 else "poor"
            question = row['question_text']
            topic = row['topic']

            if quality == "excellent":
                return f"This is a comprehensive answer to the {topic} question about '{question[:30]}...'. The answer demonstrates strong technical knowledge and detailed understanding."
            elif quality == "average":
                return f"This is a satisfactory answer to the {topic} question about '{question[:30]}...'. The answer shows basic understanding but lacks some details."
            else:
                return f"This is a basic answer to the {topic} question about '{question[:30]}...'. The answer has several gaps in understanding."

        ml_dataset['answer_text'] = ml_dataset.apply(generate_sample_answer, axis=1)
        print("Generated answer_text column required for processing")

    # Save processed dataset
    ml_dataset.to_csv("processed_se_interview_data.csv", index=False)
    print(f"Processed dataset saved with {len(ml_dataset)} records")

    return ml_dataset

def get_interview_dataset(num_samples=10000, use_huggingface=True, evaluation_method='hybrid'):
    """Main function to get software engineering interview dataset

    Args:
        num_samples: Number of samples to generate if needed
        use_huggingface: Whether to try using Hugging Face data
        evaluation_method: 'direct' to use scores from HF, 'hybrid' to generate scores from answer quality

    Returns:
        Processed dataset ready for ML training
    """

    # Try hybrid approach with answer evaluation
    if use_huggingface and evaluation_method == 'hybrid' and HYBRID_GENERATOR_AVAILABLE:
        print("Using hybrid approach with Hugging Face Q&A and generated evaluations...")
        hybrid_data = generate_hybrid_dataset(num_samples)
        if hybrid_data is not None:
            return hybrid_data

    # Direct Hugging Face approach
    if use_huggingface and evaluation_method == 'direct':
        hf_data = load_hf_dataset()
        if hf_data is not None:
            return hf_data

    # Fall back to synthetic data generation
    print(f"Generating synthetic interview dataset with {num_samples} samples...")
    raw_data = generate_software_engineer_dataset(num_samples)

    # Process the raw data into ML-ready format
    processed_data = process_dataset_for_ml(raw_data)

    if processed_data is not None:
        print(f"Successfully processed {len(processed_data)} records")
        return processed_data
    else:
        print("Warning: Data processing failed, returning raw data")
        # Check if raw_data already has essential ML columns
        if all(col in raw_data.columns for col in ['classifier', 'technical', 'communication', 'problem_solving', 'overall']):
            print("Raw data already contains essential ML columns, using as is")
        else:
            # Add minimal processing to ensure raw_data is usable
            print("Adding minimal processing to raw data")
            if 'classifier' not in raw_data.columns and 'overall' in raw_data.columns:
                raw_data['classifier'] = raw_data['overall'].apply(map_to_category)
        return raw_data

def load_sentiment_dataset():
    """Load multiclass sentiment analysis dataset from Hugging Face"""
    print("Loading sentiment analysis dataset from Hugging Face...")

    try:
        # Load the sentiment analysis dataset from Hugging Face
        sentiment_dataset = load_dataset("Sp1786/multiclass-sentiment-analysis-dataset")

        # Convert to DataFrame for easier processing
        df = pd.DataFrame({
            'text': sentiment_dataset['train']['text'],
            'sentiment_label': sentiment_dataset['train']['label'],
            'sentiment': sentiment_dataset['train']['sentiment']
        })

        print(f"Loaded {len(df)} records from sentiment analysis dataset")
        return df
    except Exception as e:
        print(f"Error loading sentiment dataset: {e}")
        return None

def process_dataset_for_ml(data):
    """
    Process raw data into a format suitable for ML modeling.
    This extracts features from interview responses and prepares the data for training.

    Args:
        data: Raw dataset with interview questions and responses

    Returns:
        Processed dataset with features and targets
    """
    if 'answer_text' not in data.columns:
        print("Warning: answer_text column not found.")

        # Try to create an answer_text column from existing data
        if 'response' in data.columns:
            print("Using 'response' column as answer_text")
            data['answer_text'] = data['response']
        elif 'answer' in data.columns:
            print("Using 'answer' column as answer_text")
            data['answer_text'] = data['answer']
        elif 'question_text' in data.columns and 'classifier' in data.columns:
            print("Generating sample answer_text from question_text and classifier")
            # Generate simple dummy answers based on the classification
            def generate_fallback_answer(row):
                quality = "excellent" if row['classifier'] == 2 else "average" if row['classifier'] == 1 else "poor"
                question = row['question_text'] if isinstance(row['question_text'], str) else "the question"
                question_prefix = question[:30] if len(question) > 30 else question

                if quality == "excellent":
                    return f"This is a detailed answer to {question_prefix}... demonstrating excellent knowledge."
                elif quality == "average":
                    return f"This is an adequate answer to {question_prefix}... with some correct information."
                else:
                    return f"This is a minimal answer to {question_prefix}... with several inaccuracies."

            data['answer_text'] = data.apply(generate_fallback_answer, axis=1)
        else:
            print("Cannot generate answer_text. Cannot process this dataset.")
            return None

    print("Processing dataset for ML...")

    try:
        # Try to import our feature extraction function
        import sys
        from pathlib import Path
        import os

        # Get current directory in a way that works in both scripts and notebooks
        try:
            # For regular Python scripts
            current_dir = Path(__file__).parent
        except NameError:
            # For Jupyter/Colab notebooks
            import os
            current_dir = Path(os.getcwd())

        parent_dir = current_dir.parent
        if str(parent_dir) not in sys.path:
            sys.path.append(str(parent_dir))

        # Import feature extraction
        try:
            from section_8_interview_process import extract_features_from_text
            FEATURE_EXTRACTOR_AVAILABLE = True
        except ImportError:
            FEATURE_EXTRACTOR_AVAILABLE = False
            print("Feature extractor not available, will use basic features")

        # Process each row to extract features
        processed_rows = []

        for idx, row in data.iterrows():
            if idx % 1000 == 0:
                print(f"Processing row {idx}/{len(data)}...")

            # Get the answer text
            answer = row['answer_text']

            # Extract features
            if FEATURE_EXTRACTOR_AVAILABLE:
                features = extract_features_from_text(answer)
            else:
                # Basic feature extraction
                word_count = len(answer.split())
                char_count = len(answer)

                # Detect minimal responses
                minimal_response = word_count <= 5
                minimal_response_penalty = 0.2 if minimal_response else 1.0

                # Calculate basic metrics
                avg_word_length = char_count / max(word_count, 1)
                sentence_count = answer.count('.') + answer.count('!') + answer.count('?')

                # Simple word-based sentiment approximation (very basic)
                positive_words = ["good", "great", "excellent", "amazing", "awesome", "yes"]
                negative_words = ["bad", "poor", "no", "don't", "cant", "idk", "not"]

                positive_count = sum(1 for word in positive_words if word in answer.lower())
                negative_count = sum(1 for word in negative_words if word in answer.lower())
                sentiment = 0.3 if minimal_response else (0.5 + (positive_count - negative_count) * 0.1)

                # Create feature dictionary
                features = {
                    'feature_0': float(word_count * minimal_response_penalty),  # Word count
                    'feature_1': float(char_count * minimal_response_penalty),  # Character count
                    'feature_2': float(avg_word_length),                        # Avg word length
                    'feature_3': float(sentence_count * minimal_response_penalty),  # Sentence count
                    'feature_4': float(0 if minimal_response else 2),           # Technical keywords
                    'feature_5': float(0 if minimal_response else 2),           # Communication keywords
                    'feature_6': float(0 if minimal_response else 2),           # Problem-solving keywords
                    'feature_7': float(0 if minimal_response else 2),           # Cultural fit keywords
                    'feature_8': float(30 if minimal_response else 60),         # Confidence score
                    'feature_9': float(0.1 if minimal_response else 0.5),       # Keyword ratio
                    'feature_10': float(sentiment)                              # Sentiment
                }

            # Add targets
            if 'technical_score' in row:
                features['technical'] = row['technical_score']
            if 'communication_score' in row:
                features['communication'] = row['communication_score']
            if 'problem_solving_score' in row:
                features['problem_solving'] = row['problem_solving_score']
            if 'cultural_fit_score' in row:
                features['cultural_fit'] = row['cultural_fit_score']
            if 'overall_score' in row:
                features['overall'] = row['overall_score']
            if 'category' in row:
                category_map = {'Weak': 0, 'Average': 1, 'Strong': 2}
                features['classifier'] = category_map.get(row['category'], 1)  # Default to Average if missing

            processed_rows.append(features)

        # Convert to DataFrame
        processed_df = pd.DataFrame(processed_rows)
        print(f"Processed {len(processed_df)} rows successfully")

        # Ensure we have all the required feature columns
        required_features = [f'feature_{i}' for i in range(11)]
        for feature in required_features:
            if feature not in processed_df.columns:
                processed_df[feature] = 0

        # Ensure we have all the required target columns
        required_targets = ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall', 'classifier']
        for target in required_targets:
            if target not in processed_df.columns:
                processed_df[target] = 50  # Default value (except for classifier)

        if 'classifier' not in processed_df.columns:
            processed_df['classifier'] = 1  # Default to Average

        return processed_df

    except Exception as e:
        print(f"Error processing dataset: {e}")
        import traceback
        traceback.print_exc()
        return None

    return None

def map_to_category(skill_name):
    """
    Maps a skill name to its appropriate category.
    
    Args:
        skill_name (str): The name of the skill to categorize
        
    Returns:
        str: The category name for the skill
    """
    # Define common skill categories
    technical_skills = [
        "python", "java", "javascript", "c++", "sql", "nosql", "r", "matlab",
        "machine learning", "deep learning", "data analysis", "data science",
        "ai", "artificial intelligence", "cloud computing", "aws", "azure",
        "gcp", "docker", "kubernetes", "devops", "database", "big data",
        "hadoop", "spark", "tableau", "power bi", "excel", "git", "tensorflow",
        "pytorch", "scikit-learn", "nlp", "computer vision", "statistics"
    ]
    
    soft_skills = [
        "communication", "teamwork", "leadership", "problem solving",
        "critical thinking", "time management", "adaptability", "creativity",
        "emotional intelligence", "conflict resolution", "negotiation",
        "presentation", "public speaking", "writing", "project management"
    ]
    
    business_skills = [
        "marketing", "sales", "finance", "accounting", "strategy",
        "business analysis", "product management", "operations",
        "business intelligence", "customer service", "entrepreneurship",
        "consulting", "risk management", "compliance", "market research"
    ]
    
    # Convert to lowercase for case-insensitive matching
    skill_lower = skill_name.lower()
    
    # Check which category the skill belongs to
    if any(tech_skill in skill_lower for tech_skill in technical_skills):
        return "Technical Skills"
    elif any(soft_skill in skill_lower for soft_skill in soft_skills):
        return "Soft Skills"
    elif any(business_skill in skill_lower for business_skill in business_skills):
        return "Business Skills"
    else:
        return "Other Skills"  # Default category for unrecognized skills

if __name__ == "__main__":
    # Generate hybrid dataset with answer evaluations by default
    get_interview_dataset(num_samples=100000, use_huggingface=True, evaluation_method='hybrid') 