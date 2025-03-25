# train_interview_models.py
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import random

# Create a function to generate synthetic interview response data
def generate_synthetic_data(n_samples=1000):
    """Generate synthetic data for training interview evaluation models"""
    print("Generating synthetic interview data...")

    data = []
    categories = ["Weak", "Average", "Strong"]

    for _ in range(n_samples):
        # Generate random features representing text analysis results
        word_count = max(5, np.random.normal(80, 40))  # Word count
        char_count = word_count * np.random.normal(5, 1)  # Character count
        avg_word_length = np.random.normal(5, 1)  # Average word length
        sentence_count = max(1, word_count / np.random.normal(15, 5))  # Sentence count

        # Technical keywords found
        tech_count = max(0, np.random.normal(word_count/20, word_count/40))

        # Communication keywords found
        comm_count = max(0, np.random.normal(word_count/25, word_count/50))

        # Problem solving keywords found
        prob_count = max(0, np.random.normal(word_count/22, word_count/45))

        # Cultural fit keywords found
        cult_count = max(0, np.random.normal(word_count/20, word_count/40))

        # Confidence score
        confidence_score = min(100, max(0, np.random.normal(60, 20)))

        # Keyword ratio
        keyword_ratio = min(100, max(0, np.random.normal(25, 10)))

        # Sentiment score
        sentiment_score = np.random.normal(0.6, 0.2)

        # Create target scores
        base_quality = np.random.normal(0.5, 0.25)  # Base quality factor

        # Actual scores influenced by the features
        technical_score = min(100, max(10, (
            base_quality * 30 +
            word_count * 0.3 +
            tech_count * 3 +
            prob_count * 2 +
            confidence_score * 0.2
        )))

        communication_score = min(100, max(10, (
            base_quality * 30 +
            sentence_count * 2 +
            comm_count * 3 +
            confidence_score * 0.3 +
            sentiment_score * 20
        )))

        problem_solving_score = min(100, max(10, (
            base_quality * 30 +
            prob_count * 3 +
            tech_count * 1 +
            confidence_score * 0.2
        )))

        cultural_fit_score = min(100, max(10, (
            base_quality * 30 +
            cult_count * 3 +
            comm_count * 1.5 +
            confidence_score * 0.1 +
            sentiment_score * 25
        )))

        # Overall score is weighted average of individual scores
        overall_score = (
            technical_score * 0.25 +
            communication_score * 0.25 +
            problem_solving_score * 0.25 +
            cultural_fit_score * 0.25
        )

        # Determine category
        if overall_score >= 75:
            category = "Strong"
        elif overall_score >= 45:
            category = "Average"
        else:
            category = "Weak"

        # Add some noise to make it more realistic
        if random.random() < 0.1:  # 10% chance to assign a random category
            category = random.choice(categories)

        # Add to dataset
        data.append({
            'feature_0': word_count,
            'feature_1': char_count,
            'feature_2': avg_word_length,
            'feature_3': sentence_count,
            'feature_4': tech_count,
            'feature_5': comm_count,
            'feature_6': prob_count,
            'feature_7': cult_count,
            'feature_8': confidence_score,
            'feature_9': keyword_ratio,
            'feature_10': sentiment_score,
            'technical': technical_score,
            'communication': communication_score,
            'problem_solving': problem_solving_score,
            'cultural_fit': cultural_fit_score,
            'overall': overall_score,
            'category': category
        })

    # Convert to DataFrame
    df = pd.DataFrame(data)
    return df

def train_interview_models(data):
    """Train models on the generated data"""
    print("Training interview evaluation models...")

    # Define feature columns
    feature_columns = [f'feature_{i}' for i in range(11)]

    # Define target columns
    regression_targets = ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall']
    classification_target = 'category'

    # Create and train models
    models = {}

    # Scale features
    scaler = StandardScaler()
    X = data[feature_columns].copy()
    scaler.fit(X)
    X_scaled = scaler.transform(X)

    # Train regression models
    for target in regression_targets:
        print(f"Training model for {target}...")
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X_scaled, data[target])
        models[target] = model

    # Train classification model
    print("Training classification model...")

    # Convert category to numeric
    category_mapping = {"Weak": 0, "Average": 1, "Strong": 2}
    y_class = data[classification_target].map(category_mapping)

    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_scaled, y_class)
    models['classifier'] = model
    models['classifier_type'] = 'sklearn'

    # Create package of models
    model_package = {
        'models': models,
        'scaler': scaler,
        'feature_columns': feature_columns
    }

    return model_package

def main():
    """Main function to generate data and train models"""
    print("Starting interview evaluation model training...")

    # Generate synthetic data
    data = generate_synthetic_data(n_samples=2000)

    # Train models
    model_package = train_interview_models(data)

    # Save models
    print("Saving models to 'interview_evaluation_models.pkl'...")
    joblib.dump(model_package, "interview_evaluation_models.pkl")

    print("Model training complete! You can now use the interview evaluation system.")

if __name__ == "__main__":
    main()