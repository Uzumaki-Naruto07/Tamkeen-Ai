import pandas as pd
import numpy as np
import os
import traceback
import logging
from typing import Optional, Dict, Any, List, Tuple
import time

logger = logging.getLogger(__name__)

# Create data directory
os.makedirs("data", exist_ok=True)

class DatasetGenerator:
    """Class for generating and processing Software Engineering interview datasets"""
    
    def __init__(self):
        """Initialize dataset generator with required dependencies check"""
        self.ml_available = self._check_ml_libraries()
    
    def _check_ml_libraries(self) -> bool:
        """Check if required ML libraries are available"""
        try:
            import pandas as pd
            import numpy as np
            from sklearn.preprocessing import StandardScaler
            from sklearn.model_selection import train_test_split
            return True
        except ImportError:
            logger.warning("Machine learning libraries not available.")
            return False
    
    def load_software_engineer_datasets(
        self, 
        use_huggingface: bool = True, 
        generate_if_missing: bool = False, 
        num_samples: int = 100000
    ) -> Optional[pd.DataFrame]:
        """
        Load Software Engineering interview datasets from Hugging Face or generate synthetic data
        
        Args:
            use_huggingface: Whether to try loading from Hugging Face first
            generate_if_missing: If True and datasets are missing, generate synthetic data
            num_samples: Number of samples to generate if needed
            
        Returns:
            DataFrame with processed Software Engineering interview data
        """
        if not self.ml_available:
            logger.error("Machine learning libraries not available. Cannot load and process datasets.")
            return None

        # First try loading from Hugging Face if requested
        if use_huggingface:
            try:
                logger.info("Attempting to load Software Engineering interview dataset from Hugging Face...")
                
                # Try to use datasets library first
                try:
                    from datasets import load_dataset
                    dataset = load_dataset("Vineeshsuiii/Software_Engineering_interview_datasets")
                    df = dataset["train"].to_pandas()
                except Exception as e:
                    logger.warning(f"Failed to load using datasets library: {e}")
                    
                    # Fall back to direct parquet loading
                    splits = {'train': 'data/train-00000-of-00001.parquet', 'test': 'data/test-00000-of-00001.parquet'}
                    df = pd.read_parquet("hf://datasets/Vineeshsuiii/Software_Engineering_interview_datasets/" + splits["train"])

                logger.info(f"Loaded {len(df)} records from Hugging Face dataset")

                # Generate synthetic scores for each record
                logger.info("Generating synthetic scores with controlled noise for realistic training...")
                df = self._add_synthetic_scores(df)
                
                # Process and save the dataset
                ml_dataset = self.process_dataset_for_ml(df)
                ml_dataset.to_csv("data/processed_se_interview_data.csv", index=False)
                logger.info(f"Processed dataset saved with {len(ml_dataset)} records")
                return ml_dataset

            except Exception as e:
                logger.error(f"Error loading from Hugging Face: {e}")
                logger.info("Falling back to local processed dataset or synthetic data generation...")

        # Then try to load local processed dataset
        try:
            ml_dataset = pd.read_csv("data/processed_se_interview_data.csv")
            logger.info(f"Loaded pre-processed Software Engineering dataset with {len(ml_dataset)} records")
            return ml_dataset
        except FileNotFoundError:
            logger.info("No processed Software Engineering dataset found, checking raw data files...")

        # Try loading from raw files
        try:
            # Load the datasets
            questions_df = pd.read_csv("data/se_interview_questions.csv")
            evaluations_df = pd.read_csv("data/se_evaluation_scores.csv")

            logger.info(f"Loaded datasets:")
            logger.info(f"- SE Interview Questions: {len(questions_df)} records")
            logger.info(f"- SE Evaluation Scores: {len(evaluations_df)} records")

            # Merge datasets
            merged_df = pd.merge(evaluations_df, questions_df, on='question_id', how='inner')
            logger.info(f"- Merged Dataset: {len(merged_df)} records after joining")

            # Check if we have enough data
            if len(merged_df) < 1000:
                logger.warning(f"Warning: Only {len(merged_df)} records available for training.")
                if generate_if_missing:
                    logger.info(f"Generating {num_samples} synthetic records as requested...")
                    return self.generate_software_engineer_dataset(num_samples)
                else:
                    logger.warning("Consider generating more data for better model training.")

            # Process for ML using the helper function
            ml_dataset = self.process_dataset_for_ml(merged_df)
            ml_dataset.to_csv("data/processed_se_interview_data.csv", index=False)

            return ml_dataset

        except FileNotFoundError as e:
            logger.error(f"Error: {e}")
            logger.error("Required dataset files not found.")

            if generate_if_missing:
                logger.info(f"Generating {num_samples} synthetic Software Engineer records...")
                return self.generate_software_engineer_dataset(num_samples)
            else:
                logger.info("To generate synthetic data, call with generate_if_missing=True")
                return None
        except Exception as e:
            logger.error(f"Error processing datasets: {e}")
            logger.error(traceback.format_exc())
            return None
    
    def _add_synthetic_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add synthetic scores to dataset with realistic correlations and noise
        
        Args:
            df: Input DataFrame with interview questions/answers
            
        Returns:
            DataFrame with added synthetic scores
        """
        # Function to add controlled noise to scores
        def add_noise(score, noise_level=0.15):
            noise = np.random.normal(0, noise_level * score, size=len(score))
            return np.clip(score + noise, 0, 100)

        # Generate initial scores based on text features
        def calculate_base_score(row):
            # Extract text features that might indicate question complexity
            question = str(row.get('question', ''))
            answer = str(row.get('answer', ''))

            # Simple complexity indicators
            complexity_indicators = ['complex', 'difficult', 'advanced', 'explain', 'design', 'implement']
            basic_indicators = ['basic', 'simple', 'describe', 'what is', 'define']

            # Calculate base score
            base = 75  # Start with average score

            # Adjust based on text length and complexity
            word_count = len(question.split())
            base += min(10, word_count / 20)  # Longer questions might be more complex

            # Adjust for complexity indicators
            complex_count = sum(1 for ind in complexity_indicators if ind in question.lower())
            basic_count = sum(1 for ind in basic_indicators if ind in question.lower())

            base += complex_count * 3
            base -= basic_count * 2

            # Add some randomness
            base += np.random.normal(0, 5)

            return np.clip(base, 50, 95)

        # Calculate initial scores based on question content
        df['base_score'] = df.apply(calculate_base_score, axis=1)

        # Generate component scores with realistic correlations and noise
        df['technical'] = add_noise(df['base_score'] + np.random.normal(0, 8, size=len(df)), noise_level=0.2)
        df['problem_solving'] = add_noise(df['base_score'] + np.random.normal(0, 7, size=len(df)), noise_level=0.18)
        df['communication'] = add_noise(df['base_score'] + np.random.normal(-2, 10, size=len(df)), noise_level=0.25)
        df['cultural_fit'] = add_noise(df['base_score'] + np.random.normal(-5, 12, size=len(df)), noise_level=0.3)

        # Introduce some outliers (about 5% of the data)
        outlier_mask = np.random.choice([True, False], size=len(df), p=[0.05, 0.95])
        for col in ['technical', 'problem_solving', 'communication', 'cultural_fit']:
            df.loc[outlier_mask, col] = np.random.choice([
                np.random.uniform(30, 50),  # Low outliers
                np.random.uniform(90, 100)  # High outliers
            ], size=sum(outlier_mask))

        # Calculate overall score with weighted average and additional noise
        df['overall'] = add_noise(
            0.4 * df['technical'] +
            0.3 * df['problem_solving'] +
            0.2 * df['communication'] +
            0.1 * df['cultural_fit'],
            noise_level=0.1
        )

        # Round all scores to integers
        score_columns = ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall']
        for col in score_columns:
            df[col] = df[col].round().astype(int)
            df[col] = df[col].clip(0, 100)  # Ensure within valid range

        # Drop the temporary base_score column
        df = df.drop('base_score', axis=1)

        # Log statistics
        logger.info("Generated synthetic scores with realistic noise and correlations")
        logger.info("Score statistics:")
        for col in score_columns:
            logger.info(f"- {col}:")
            logger.info(f"  Range: {df[col].min()}-{df[col].max()}")
            logger.info(f"  Mean: {df[col].mean():.1f}")
            logger.info(f"  Std: {df[col].std():.1f}")
            
        return df
    
    def process_dataset_for_ml(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Process a dataset to create ML-ready features for Software Engineering interviews.
        
        Args:
            data: Raw dataset with interview questions and evaluations
            
        Returns:
            Processed DataFrame ready for machine learning
        """
        logger.info("Processing dataset for machine learning...")
        processed_df = data.copy()
        feature_columns = []

        # Ensure we have the expected target columns
        required_targets = ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall']
        missing_targets = [target for target in required_targets if target not in processed_df.columns]

        if missing_targets:
            logger.info(f"Generating synthetic values for missing targets: {missing_targets}")

            # Generate base score if no score/overall exists
            if 'score' in processed_df.columns:
                base = processed_df['score']
            elif 'overall' in processed_df.columns:
                base = processed_df['overall']
            else:
                base = np.random.randint(60, 100, size=len(processed_df))

            # Generate missing targets with correlation to base score
            for target in missing_targets:
                processed_df[target] = np.clip(base + np.random.randint(-10, 11, size=len(processed_df)), 0, 100)
                logger.info(f"Generated synthetic values for {target}")

        # Basic numeric features
        if 'question_length' not in processed_df.columns and 'question' in processed_df.columns:
            processed_df['question_length'] = processed_df['question'].apply(lambda x: len(str(x)) if pd.notna(x) else 0)
            feature_columns.append('question_length')
        else:
            if 'question_length' in processed_df.columns:
                feature_columns.append('question_length')

        if 'word_count' not in processed_df.columns and 'question' in processed_df.columns:
            processed_df['word_count'] = processed_df['question'].apply(lambda x: len(str(x).split()) if pd.notna(x) else 0)
            feature_columns.append('word_count')
        else:
            if 'word_count' in processed_df.columns:
                feature_columns.append('word_count')

        # Answer-based features if available
        if 'answer' in processed_df.columns:
            if 'answer_length' not in processed_df.columns:
                processed_df['answer_length'] = processed_df['answer'].apply(lambda x: len(str(x)) if pd.notna(x) else 0)
            if 'answer_word_count' not in processed_df.columns:
                processed_df['answer_word_count'] = processed_df['answer'].apply(lambda x: len(str(x).split()) if pd.notna(x) else 0)

            feature_columns.extend(['answer_length', 'answer_word_count'])

        # Handle candidate_id if present
        if 'candidate_id' in processed_df.columns:
            feature_columns.append('candidate_id')

        # Date features
        if 'evaluation_date' in processed_df.columns:
            processed_df['evaluation_date'] = pd.to_datetime(processed_df['evaluation_date'])
            processed_df['month'] = processed_df['evaluation_date'].dt.month
            processed_df['year'] = processed_df['evaluation_date'].dt.year
            feature_columns.extend(['month', 'year'])

        # Handle categorical features - create dummies
        categorical_features = []

        if 'question_type' in processed_df.columns:
            question_type_dummies = pd.get_dummies(processed_df['question_type'], prefix='question_type')
            categorical_features.append(question_type_dummies)

        if 'difficulty_level' in processed_df.columns:
            difficulty_dummies = pd.get_dummies(processed_df['difficulty_level'], prefix='difficulty')
            categorical_features.append(difficulty_dummies)

        if 'topic' in processed_df.columns:
            topic_dummies = pd.get_dummies(processed_df['topic'], prefix='topic')
            categorical_features.append(topic_dummies)

        # Create the ML dataset
        ml_df = processed_df[feature_columns].copy() if feature_columns else pd.DataFrame()

        # Add categorical features
        for cat_feature in categorical_features:
            ml_df = pd.concat([ml_df, cat_feature], axis=1)

        # Add target variables (including the synthetic ones we generated)
        for target in required_targets:
            if target in processed_df.columns:
                ml_df[target] = processed_df[target]

        # Create recommendation classification if overall score is available
        if 'overall' in ml_df.columns:
            ml_df['recommendation'] = pd.cut(
                ml_df['overall'],
                bins=[0, 60, 80, 101],
                labels=['Not Recommended', 'Consider', 'Strongly Recommended']
            )

        # Keep original text columns for reference
        text_columns = ['question', 'answer', 'question_type', 'difficulty_level', 'topic']
        for col in text_columns:
            if col in processed_df.columns:
                ml_df[col + '_text'] = processed_df[col]

        logger.info(f"Dataset processed with {len(ml_df)} samples and {len(ml_df.columns)} features.")
        return ml_df
    
    def generate_software_engineer_dataset(self, num_samples: int = 10000) -> pd.DataFrame:
        """
        Generate a synthetic dataset of Software Engineering interview questions and evaluations
        
        Args:
            num_samples: Number of samples to generate
            
        Returns:
            DataFrame with synthetic interview data
        """
        logger.info(f"Generating synthetic Software Engineering interview dataset with {num_samples} samples...")
        
        # Define question types and topics
        question_types = ['Technical', 'Behavioral', 'Problem Solving', 'System Design', 'Coding']
        topics = [
            'Data Structures', 'Algorithms', 'Database', 'Web Development', 
            'Networking', 'Operating Systems', 'Object-Oriented Design',
            'System Architecture', 'API Design', 'Security', 'Performance',
            'Debugging', 'Testing', 'DevOps', 'Version Control', 'Agile Methodology'
        ]
        difficulty_levels = ['Easy', 'Medium', 'Hard', 'Expert']
        
        # Create basic templates for questions
        technical_templates = [
            "Explain {topic} and its applications in software engineering.",
            "What is {topic} and how does it work?",
            "Describe the key components of {topic}.",
            "How would you implement {topic} in a production environment?",
            "Compare and contrast {topic} with alternative approaches.",
            "What are the advantages and disadvantages of {topic}?",
            "How does {topic} scale in large applications?",
            "Describe a situation where you would use {topic}.",
            "What are common pitfalls when working with {topic}?"
        ]
        
        problem_solving_templates = [
            "How would you design a system for {topic}?",
            "Given a problem related to {topic}, how would you approach it?",
            "Optimize an algorithm for {topic}.",
            "Debug an issue in {topic}.",
            "Implement a solution for {topic}.",
            "How would you test a {topic} implementation?",
            "What metrics would you use to evaluate a {topic} solution?",
            "Design a scalable architecture for {topic}."
        ]
        
        behavioral_templates = [
            "Describe a time when you had to work with a difficult team member on a {topic} project.",
            "Tell me about a project where you used {topic}.",
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
            elif question_type == 'Problem Solving' or question_type == 'System Design':
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
        
        # Process the data for ML and save
        ml_dataset = self.process_dataset_for_ml(df)
        ml_dataset.to_csv("data/processed_se_interview_data.csv", index=False)
        
        logger.info(f"Generated and processed synthetic dataset with {len(df)} samples")
        return ml_dataset

# Initialize the dataset generator on module load
dataset_generator = DatasetGenerator()

def load_or_generate_datasets(
    use_huggingface: bool = True, 
    generate_if_missing: bool = True, 
    num_samples: int = 10000
) -> Optional[pd.DataFrame]:
    """
    Load or generate datasets for the application
    
    Args:
        use_huggingface: Whether to try loading from Hugging Face first
        generate_if_missing: Generate synthetic data if real datasets are missing
        num_samples: Number of samples to generate if needed
        
    Returns:
        Processed DataFrame ready for machine learning
    """
    return dataset_generator.load_software_engineer_datasets(
        use_huggingface=use_huggingface,
        generate_if_missing=generate_if_missing,
        num_samples=num_samples
    ) 