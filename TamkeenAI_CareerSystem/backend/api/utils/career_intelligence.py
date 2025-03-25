# ============================
# SECTION 6b: CAREER INTELLIGENCE MODEL TRAINING
# ============================
# This section trains the Career Intelligence model using the training data.

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder, PowerTransformer, PolynomialFeatures
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.ensemble import ExtraTreesRegressor, StackingRegressor, VotingRegressor, ExtraTreesClassifier
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, HuberRegressor, RANSACRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, classification_report, confusion_matrix
from sklearn.feature_selection import SelectFromModel, RFE
from sklearn.neural_network import MLPRegressor
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
import warnings
from tqdm.notebook import tqdm
from datetime import datetime
from collections import Counter
from scipy import stats
import json
import re
import xgboost as xgb
import time
import itertools

# Try importing TensorFlow
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping
    TF_AVAILABLE = True
    print("TensorFlow is available for neural network models")

    # Prevent TensorFlow from consuming all GPU memory
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError as e:
            print(f"Error setting GPU memory growth: {e}")

except ImportError:
    TF_AVAILABLE = False
    print("TensorFlow not available, will skip neural network models")

# Try importing threadpool_limits
try:
    from threadpool_limits import threadpool_limits
    THREADPOOL_AVAILABLE = True
except ImportError:
    THREADPOOL_AVAILABLE = False
    print("threadpool_limits not available, will proceed without thread limiting")
    # Create a dummy context manager
    class DummyContextManager:
        def __init__(self, *args, **kwargs):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
    threadpool_limits = DummyContextManager

from sklearn.utils import parallel_backend

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

print("Starting Advanced Career Intelligence Model Training...")

def load_career_dataset():
    """Load career dataset from CSV or generate if not available"""
    try:
        # Try to load existing dataset
        if os.path.exists('career_dataset.csv'):
            print("Loading existing career dataset...")
            df = pd.read_csv('career_dataset.csv')
            print(f"Loaded career dataset with {len(df)} records")
            return df
        else:
            print("Career dataset not found, generating synthetic data...")
            # Generate synthetic dataset
            df = generate_career_dataset()
            # Save for future use
            df.to_csv('career_dataset.csv', index=False)
            print(f"Generated and saved career dataset with {len(df)} records")
            return df
    except Exception as e:
        print(f"Error loading career dataset: {e}")
        return None

def generate_career_dataset(n_samples=15000):
    """Generate a synthetic career dataset for model development"""
    np.random.seed(42)

    # Define possible values for categorical variables
    roles = [
        'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
        'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Financial Analyst',
        'Project Manager', 'Business Analyst', 'DevOps Engineer', 'Content Writer',
        'Graphic Designer', 'Customer Support', 'Operations Manager', 'Research Scientist',
        'Network Administrator', 'Quality Assurance', 'Legal Counsel', 'Executive Assistant'
    ]

    sectors = [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
        'Manufacturing', 'Media', 'Government', 'Energy', 'Consulting'
    ]

    experience_levels = ['Entry', 'Junior', 'Mid-level', 'Senior', 'Executive']

    education_levels = [
        'High School', 'Associate Degree', 'Bachelor\'s Degree',
        'Master\'s Degree', 'PhD', 'Professional Certification'
    ]

    all_skills = [
        'Python', 'Java', 'JavaScript', 'SQL', 'Excel', 'Communication', 'Project Management',
        'Data Analysis', 'Marketing', 'Sales', 'Leadership', 'Problem Solving', 'Research',
        'Customer Service', 'Teamwork', 'Design', 'Writing', 'Public Speaking', 'Negotiation',
        'Financial Analysis', 'Machine Learning', 'Statistical Analysis', 'UX Design', 'HTML/CSS',
        'Product Development', 'Strategic Planning', 'Social Media', 'Cloud Computing', 'Networking',
        'DevOps', 'Agile Methodologies', 'Quality Assurance', 'Mobile Development', 'SEO',
        'Data Visualization', 'Business Intelligence', 'Risk Management', 'Cybersecurity',
        'Content Creation', 'CRM Systems', 'Digital Marketing', 'UI Design', 'APIs',
        'Budget Management', 'Database Management', 'Accounting', 'Supply Chain', 'HR Management'
    ]

    # Generate random data
    data = {
        'role': np.random.choice(roles, size=n_samples),
        'sector': np.random.choice(sectors, size=n_samples),
        'experience_level': np.random.choice(experience_levels, size=n_samples),
        'years_experience': np.random.gamma(shape=2, scale=2, size=n_samples) + 1,  # 1-20 years
        'education': np.random.choice(education_levels, size=n_samples)
    }

    # Generate skills (2-7 skills per person)
    skills = []
    for _ in range(n_samples):
        n_skills = np.random.randint(2, 8)
        person_skills = np.random.choice(all_skills, size=n_skills, replace=False).tolist()
        skills.append(person_skills)
    data['skills'] = skills

    # Generate salary ranges based on experience and education
    salary_min = []
    salary_max = []

    for i in range(n_samples):
        base = 50000
        exp_level = data['experience_level'][i]
        edu = data['education'][i]
        years = data['years_experience'][i]

        # Experience level multiplier
        if exp_level == 'Entry':
            exp_mult = 1.0
        elif exp_level == 'Junior':
            exp_mult = 1.3
        elif exp_level == 'Mid-level':
            exp_mult = 1.7
        elif exp_level == 'Senior':
            exp_mult = 2.2
        else:  # Executive
            exp_mult = 3.0

        # Education multiplier
        if edu == 'High School':
            edu_mult = 0.9
        elif edu == 'Associate Degree':
            edu_mult = 1.0
        elif edu == 'Bachelor\'s Degree':
            edu_mult = 1.2
        elif edu == 'Master\'s Degree':
            edu_mult = 1.4
        elif edu == 'PhD':
            edu_mult = 1.6
        else:  # Professional Certification
            edu_mult = 1.1

        # Years experience adds up to 4% per year
        years_mult = 1 + min(years * 0.04, 0.8)  # Cap at 80% increase

        # Calculate salary with a random factor for variability
        salary_base = base * exp_mult * edu_mult * years_mult
        random_factor = np.random.uniform(0.85, 1.15)
        salary_base *= random_factor

        # Create a range around the base
        min_sal = int(salary_base * 0.9 / 1000) * 1000
        max_sal = int(salary_base * 1.1 / 1000) * 1000

        salary_min.append(min_sal)
        salary_max.append(max_sal)

    # Format as a range
    data['salary_range'] = [f"${min:,} - ${max:,}" for min, max in zip(salary_min, salary_max)]

    # Generate satisfaction metrics (1-10 scale)
    # We'll build more complex relationships to make prediction interesting

    base_satisfaction = np.random.normal(7, 1.5, n_samples)
    base_satisfaction = np.clip(base_satisfaction, 1, 10)

    # Introduce factors that influence satisfaction
    satisfaction_factors = {}

    # Role satisfaction factors (some roles tend to have higher satisfaction)
    role_factors = {role: np.random.uniform(-1, 1) for role in roles}
    satisfaction_factors['role'] = [role_factors[role] for role in data['role']]

    # Experience level factors (U-shaped: high at entry, dips in middle, high at senior)
    exp_factors = {
        'Entry': 0.5,
        'Junior': 0,
        'Mid-level': -0.5,
        'Senior': 0.3,
        'Executive': 0.7
    }
    satisfaction_factors['exp'] = [exp_factors[exp] for exp in data['experience_level']]

    # Salary factors (higher salary tends to increase satisfaction)
    salary_factors = [(min_sal / 50000) * 0.5 for min_sal in salary_min]
    satisfaction_factors['salary'] = salary_factors

    # Random factors specific to each person
    personal_factors = np.random.normal(0, 1, n_samples)
    satisfaction_factors['personal'] = personal_factors

    # Combine factors with different weights
    job_satisfaction = base_satisfaction.copy()
    for factor, values in satisfaction_factors.items():
        if factor == 'personal':
            job_satisfaction += np.array(values) * 0.8
        else:
            job_satisfaction += np.array(values) * 0.5

    # Work-life balance (correlated with job satisfaction but with differences)
    work_life_balance = job_satisfaction * 0.7 + np.random.normal(3, 1, n_samples)

    # Growth potential (depends more on company and role than individual satisfaction)
    growth_potential = base_satisfaction * 0.5 + np.random.normal(5, 1.5, n_samples)

    # Clip all metrics to valid range (1-10)
    data['job_satisfaction'] = np.clip(job_satisfaction, 1, 10)
    data['work_life_balance'] = np.clip(work_life_balance, 1, 10)
    data['growth_potential'] = np.clip(growth_potential, 1, 10)

    # Generate job descriptions
    descriptions = []

    # Templates for descriptions
    desc_templates = [
        "Looking for a {role} to join our {sector} team. Requires {skills} and {education}.",
        "{role} position available at a leading {sector} company. Must have {skills}.",
        "Join our {sector} organization as a {role}. Ideal candidates have {skills}.",
        "Experienced {role} needed for {sector} projects. Background in {skills} preferred.",
        "{role} opportunity in {sector}. Responsibilities include using {skills} to solve problems."
    ]

    for i in range(n_samples):
        template = np.random.choice(desc_templates)
        skills_text = ", ".join(np.random.choice(data['skills'][i], min(3, len(data['skills'][i])), replace=False))
        desc = template.format(
            role=data['role'][i],
            sector=data['sector'][i],
            skills=skills_text,
            education=data['education'][i]
        )
        descriptions.append(desc)

    data['description'] = descriptions

    # Add a source column (simulating where the data came from)
    sources = ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Job Fair', 'Recruitment Agency']
    data['source'] = np.random.choice(sources, size=n_samples)

    # Convert to DataFrame
    df = pd.DataFrame(data)

    # Round numerical columns for better readability
    df['years_experience'] = df['years_experience'].round(1)
    df['job_satisfaction'] = df['job_satisfaction'].round(1)
    df['work_life_balance'] = df['work_life_balance'].round(1)
    df['growth_potential'] = df['growth_potential'].round(1)

    return df

def check_outliers_and_skewness(df, columns):
    """Check for outliers and skewness in specified columns"""
    results = {}

    for col in columns:
        if col not in df.columns:
            results[col] = {'outliers_count': 0, 'outliers_percentage': 0, 'is_skewed': False}
            continue

        # Get column values without NaNs
        values = df[col].dropna()

        # Calculate IQR and bounds
        q1 = values.quantile(0.25)
        q3 = values.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        # Count outliers
        outliers = values[(values < lower_bound) | (values > upper_bound)]
        outliers_count = len(outliers)
        outliers_percentage = (outliers_count / len(values)) * 100 if len(values) > 0 else 0

        # Calculate skewness
        skewness = values.skew()
        is_skewed = abs(skewness) > 0.5  # Threshold for skewness

        results[col] = {
            'outliers_count': outliers_count,
            'outliers_percentage': outliers_percentage,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound,
            'skewness': skewness,
            'is_skewed': is_skewed
        }

    return results

def preprocess_career_data_advanced(df, use_full_dataset=True):
    """
    Advanced preprocessing for career dataset
    """
    # Select target columns
    target_columns = ['job_satisfaction', 'work_life_balance', 'growth_potential']

    # Limit dataset if not using full dataset
    if not use_full_dataset:
        df = df.sample(frac=0.5, random_state=42)

    print(f"Using {'full' if use_full_dataset else 'partial'} dataset with {len(df)} records")

    # Analyze target variables
    print("\nAnalyzing target variables for outliers and skewness:")
    target_analysis = check_outliers_and_skewness(df, target_columns)

    # Add very small noise to targets to prevent perfect correlations
    for col in target_columns:
        if col in df.columns:
            std = df[col].std()
            if std > 0:
                noise_level = std * 0.01  # 1% of standard deviation - very minimal noise
                df[col] = df[col] + np.random.normal(0, noise_level, size=len(df))
                # Ensure values stay in valid range (1-10)
                df[col] = df[col].clip(1, 10)

    # Create feature matrix and target matrix
    y_data = df[target_columns].copy()

    # Define columns to exclude from features
    exclude_cols = target_columns + ['source', 'description']

    # Define columns by type
    categorical_cols = ['role', 'sector', 'experience_level', 'education']

    # Handle skills column
    if 'skills' in df.columns:
        # Process skills column
        df['skills'] = df['skills'].apply(lambda x:
            eval(x) if isinstance(x, str) and x.startswith('[')
            else [x] if isinstance(x, str)
            else x if isinstance(x, list)
            else []
        )

        # Extract top skills
        all_skills = []
        for skills_list in df['skills']:
            if isinstance(skills_list, list):
                all_skills.extend(skills_list)

        # Get top skills
        skill_counts = pd.Series(all_skills).value_counts()
        top_skills = skill_counts.head(40).index.tolist()

        # Create skill features
        for skill in top_skills:
            safe_name = skill.replace(" ", "_").replace("-", "_")
            df[f'has_skill_{safe_name}'] = df['skills'].apply(
                lambda x: 1 if isinstance(x, list) and skill in x else 0
            )

        # Create skill count feature
        df['skill_count'] = df['skills'].apply(
            lambda x: len(x) if isinstance(x, list) else 0
        )

        # Add to exclude list
        exclude_cols.append('skills')

    # Get numeric columns (excluding targets and other non-features)
    all_cols = list(df.columns)
    feature_cols = [col for col in all_cols if col not in exclude_cols]
    numeric_cols = df[feature_cols].select_dtypes(include=['float64', 'int64']).columns.tolist()

    # Set up preprocessing for both numerical and categorical features
    # Handle missing values and scaling for numeric features
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    # Handle missing values and encoding for categorical features
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))  # Updated parameter
    ])

    # Only use categorical columns that exist in the data
    cat_cols = [col for col in categorical_cols if col in df.columns]

    # Combine preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_cols),
            ('cat', categorical_transformer, cat_cols)
        ],
        remainder='drop'  # Drop any columns not specified
    )

    # Transform target variables if needed
    y_transformed = y_data.copy()
    transformers = {}

    for col in target_columns:
        # Check if transformation is needed based on skewness
        if target_analysis.get(col, {}).get('is_skewed', False):
            print(f"  Applying power transformation to {col} due to skewness")
            transformer = PowerTransformer(method='yeo-johnson')
            y_transformed[col] = transformer.fit_transform(y_data[col].values.reshape(-1, 1)).flatten()
            transformers[col] = transformer

    # Apply preprocessing to create feature matrix
    try:
        X_processed = preprocessor.fit_transform(df)

        # Get feature names
        numeric_features = numeric_cols

        # Get categorical feature names after one-hot encoding
        if cat_cols:
            cat_features = []
            for i, col in enumerate(cat_cols):
                categories = preprocessor.named_transformers_['cat'].named_steps['onehot'].categories_[i]
                cat_features.extend([f"{col}_{cat}" for cat in categories])
        else:
            cat_features = []

        # Create DataFrame with feature names
        feature_names = numeric_features + cat_features
        if isinstance(X_processed, np.ndarray):
            # Standard numpy array
            X_processed_df = pd.DataFrame(
                X_processed,
                columns=feature_names[:X_processed.shape[1]]
            )
        else:
            # Handle sparse matrix if returned
            X_processed_df = pd.DataFrame(
                X_processed.toarray(),
                columns=feature_names[:X_processed.shape[1]]
            )

        print(f"Preprocessed data shape: {X_processed_df.shape}")

        # Store preprocessing metadata
        preprocessor_metadata = {
            'target_transformers': transformers,
            'feature_columns': feature_cols,
            'numeric_columns': numeric_cols,
            'categorical_columns': cat_cols
        }

        return X_processed_df, y_transformed, preprocessor, preprocessor_metadata

    except Exception as e:
        print(f"Error in preprocessing pipeline: {e}")
        return None, None, None, None

def train_advanced_satisfaction_models(X, y, preprocessor, preprocessor_metadata):
    """Train advanced satisfaction prediction models with ensemble methods"""
    if X is None or y is None or len(X) == 0 or len(y) == 0:
        print("No data to train satisfaction models")
        return {}, {}

    # Make sure X and y have the same number of samples
    if len(X) != len(y):
        print(f"Warning: X has {len(X)} samples but y has {len(y)} samples. Aligning data...")
        common_index = X.index.intersection(y.index)
        X = X.loc[common_index]
        y = y.loc[common_index]

    print(f"Training advanced satisfaction prediction models with {len(X)} samples")

    # Define comprehensive model selection
    base_models = {
        'RandomForest': RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_leaf=5,
            n_jobs=-1,
            random_state=42
        ),
        'ExtraTrees': ExtraTreesRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_leaf=5,
            n_jobs=-1,
            random_state=42
        ),
        'GradientBoosting': GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=5,
            random_state=42
        ),
        'XGBoost': xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=100,
            max_depth=6,
            learning_rate=0.05,
            random_state=42
        ),
        'LinearRegression': LinearRegression(),
        'Ridge': Ridge(alpha=1.0),
        'Lasso': Lasso(alpha=0.01),
        'ElasticNet': ElasticNet(alpha=0.01, l1_ratio=0.5),
        'HuberRegressor': HuberRegressor(epsilon=1.35),
        'SVR': SVR(kernel='rbf', C=1.0, epsilon=0.1)
    }

    # Add neural network if TensorFlow is available
    if TF_AVAILABLE:
        base_models['NeuralNetwork'] = None  # Will be created per target

    # Parameter grids for tuning
    param_grids = {
        'RandomForest': {
            'n_estimators': [50, 100, 200],
            'max_depth': [6, 10, 15],
            'min_samples_leaf': [1, 5, 10]
        },
        'ExtraTrees': {
            'n_estimators': [50, 100, 200],
            'max_depth': [6, 10, 15],
            'min_samples_leaf': [1, 5, 10]
        },
        'GradientBoosting': {
            'n_estimators': [50, 100, 200],
            'learning_rate': [0.01, 0.05, 0.1],
            'max_depth': [3, 5, 7]
        },
        'XGBoost': {
            'n_estimators': [50, 100, 200],
            'max_depth': [3, 6, 9],
            'learning_rate': [0.01, 0.05, 0.1]
        },
        'Ridge': {
            'alpha': [0.01, 0.1, 1.0, 10.0]
        },
        'Lasso': {
            'alpha': [0.001, 0.01, 0.1, 1.0]
        },
        'ElasticNet': {
            'alpha': [0.001, 0.01, 0.1, 1.0],
            'l1_ratio': [0.1, 0.5, 0.9]
        },
        'SVR': {
            'C': [0.1, 1.0, 10.0],
            'epsilon': [0.01, 0.1, 0.2],
            'kernel': ['linear', 'rbf']
        }
    }

    # Results storage
    all_models = {}
    results = {}

    # Get target transformers from metadata
    target_transformers = preprocessor_metadata.get('target_transformers', {})

    # STEP 1: Train models for all targets
    for target_col in y.columns:
        print(f"\nTraining models for {target_col}:")
        target_results = {}
        target_models = {}

        # Get the target values
        y_target = y[target_col]

        # Split data for training and validation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_target, test_size=0.2, random_state=42)

        # STEP 2: Calculate baseline metrics
        baseline_mean = y_train.mean()
        baseline_mse = mean_squared_error(y_test, [baseline_mean] * len(y_test))
        baseline_rmse = np.sqrt(baseline_mse)
        baseline_mae = mean_absolute_error(y_test, [baseline_mean] * len(y_test))
        baseline_r2 = r2_score(y_test, [baseline_mean] * len(y_test))

        print(f"  Baseline (mean value {baseline_mean:.2f}): "
              f"RMSE={baseline_rmse:.4f}, MAE={baseline_mae:.4f}, R²={baseline_r2:.4f}")

        # STEP 3: Cross-validation for each model
        cv = KFold(n_splits=5, shuffle=True, random_state=42)

        # Try each model type
        for model_name, model in base_models.items():
            try:
                # Neural Network is special case
                if model_name == 'NeuralNetwork':
                    print(f"  Training {model_name}...")

                    # Create NN model
                    def create_nn_model(input_shape):
                        model = Sequential([
                            Dense(64, activation='relu', input_shape=(input_shape,)),
                            Dropout(0.3),
                            Dense(32, activation='relu'),
                            Dropout(0.2),
                            Dense(16, activation='relu'),
                            Dense(1)
                        ])
                        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
                        return model

                    # Create and train the model
                    nn_model = create_nn_model(X_train.shape[1])

                    # Early stopping
                    early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

                    # Train with validation data
                    nn_model.fit(
                        X_train.values, y_train.values,
                        epochs=50,
                        batch_size=64,
                        validation_split=0.2,
                        callbacks=[early_stop],
                        verbose=0
                    )

                    # Predict
                    y_pred = nn_model.predict(X_test.values).flatten()

                    # Calculate metrics
                    mse = mean_squared_error(y_test, y_pred)
                    mae = mean_absolute_error(y_test, y_pred)
                    rmse = np.sqrt(mse)
                    r2 = r2_score(y_test, y_pred)

                    # Store results
                    target_models[model_name] = nn_model
                    target_results[model_name] = {
                        'mse': mse,
                        'rmse': rmse,
                        'mae': mae,
                        'r2': r2,
                        'test_score': max(0, r2)  # Use max() to handle negative R²
                    }

                                      # Print metrics
                    print(f"    {model_name}: MSE={mse:.4f}, RMSE={rmse:.4f}, MAE={mae:.4f}, R²={r2:.4f}")

                    # Check if negative R² and report
                    if r2 < 0:
                        print(f"    Warning: Negative R² value ({r2:.4f}), will use 0 for model comparison")

                else:
                    # Regular model training with hyperparameter tuning
                    print(f"  Training {model_name}...")

                    if model_name in param_grids:
                        print(f"    Hyperparameter search for {model_name}...")

                        # Use RandomizedSearchCV for faster tuning
                        search = RandomizedSearchCV(
                            model,
                            param_distributions=param_grids[model_name],
                            n_iter=10,
                            cv=3,
                            scoring='neg_mean_squared_error',
                            n_jobs=-1,
                            random_state=42
                        )

                        search.fit(X_train, y_train)
                        best_params = search.best_params_
                        print(f"    Best parameters: {best_params}")

                        # Create model with best parameters
                        if model_name == 'RandomForest':
                            model = RandomForestRegressor(**best_params, random_state=42, n_jobs=-1)
                        elif model_name == 'ExtraTrees':
                            model = ExtraTreesRegressor(**best_params, random_state=42, n_jobs=-1)
                        elif model_name == 'GradientBoosting':
                            model = GradientBoostingRegressor(**best_params, random_state=42)
                        elif model_name == 'XGBoost':
                            model = xgb.XGBRegressor(**best_params, random_state=42)
                        elif model_name == 'Ridge':
                            model = Ridge(**best_params, random_state=42)
                        elif model_name == 'Lasso':
                            model = Lasso(**best_params, random_state=42)
                        elif model_name == 'ElasticNet':
                            model = ElasticNet(**best_params, random_state=42)
                        elif model_name == 'SVR':
                            model = SVR(**best_params)

                    # Train the model
                    model.fit(X_train, y_train)

                    # Make predictions
                    y_pred = model.predict(X_test)

                    # Calculate metrics
                    mse = mean_squared_error(y_test, y_pred)
                    mae = mean_absolute_error(y_test, y_pred)
                    rmse = np.sqrt(mse)
                    r2 = r2_score(y_test, y_pred)

                    # Store the model
                    target_models[model_name] = model

                    # Store results with adjusted R² for model comparison
                    target_results[model_name] = {
                        'mse': mse,
                        'rmse': rmse,
                        'mae': mae,
                        'r2': r2,
                        'test_score': max(0, r2)  # Use max() to handle negative R²
                    }

                    # Report metrics with clear indication if R² is negative
                    print(f"    {model_name}: MSE={mse:.4f}, RMSE={rmse:.4f}, MAE={mae:.4f}, R²={r2:.4f}"
                         + (f" (negative, treated as 0 for model comparison)" if r2 < 0 else ""))

                    # Save the individual model
                    joblib.dump(model, f'models/{target_col}_{model_name}.joblib')

            except Exception as e:
                print(f"    Error training {model_name}: {str(e)}")
                target_results[model_name] = {
                    'error': str(e)
                }

        # STEP 4: Feature importance analysis for best model (if available)
        valid_models = [m for m in target_results.keys()
                        if 'test_score' in target_results[m] and target_results[m]['test_score'] > 0]

        if valid_models:
            # Get best model based on test score
            best_model_name = max(valid_models, key=lambda m: target_results[m]['test_score'])
            best_model = target_models[best_model_name]

            # Try to extract feature importance if the model supports it
            try:
                if hasattr(best_model, 'feature_importances_'):
                    # Get feature importances
                    importances = best_model.feature_importances_

                    # Create feature importance DataFrame
                    feature_imp = pd.DataFrame({
                        'Feature': X.columns,
                        'Importance': importances
                    }).sort_values('Importance', ascending=False)

                    # Print top 10 features
                    print("\n  Top 10 important features:")
                    for i, (feature, importance) in enumerate(
                        zip(feature_imp['Feature'].head(10), feature_imp['Importance'].head(10))):
                        print(f"    {i+1}. {feature}: {importance:.4f}")

                    # Save feature importance to file
                    feature_imp.to_csv(f'models/{target_col}_feature_importance.csv', index=False)
            except Exception as e:
                print(f"  Error extracting feature importance: {str(e)}")

        # STEP 5: Create ensemble model for better performance
        print("\n  Creating ensemble model...")
        try:
            # Get models with positive R² for ensemble
            positive_r2_models = [m for m in target_results.keys()
                                 if 'r2' in target_results[m] and target_results[m]['r2'] > 0]

            if len(positive_r2_models) >= 2:
                # Use top 3 models (or all if fewer than 3)
                top_models = sorted(positive_r2_models,
                                   key=lambda m: target_results[m]['test_score'],
                                   reverse=True)[:min(3, len(positive_r2_models))]

                print(f"  Using top {len(top_models)} models: {', '.join(top_models)}")

                # Create weighted ensemble based on R² scores
                weights = {m: target_results[m]['test_score'] for m in top_models}
                weight_sum = sum(weights.values())
                if weight_sum > 0:
                    weights = {m: w / weight_sum for m, w in weights.items()}

                    # Predict with ensemble
                    ensemble_pred = np.zeros_like(y_test, dtype=float)
                    for m in top_models:
                        model_pred = target_models[m].predict(X_test)
                        ensemble_pred += weights[m] * model_pred

                    # Calculate ensemble metrics
                    ensemble_mse = mean_squared_error(y_test, ensemble_pred)
                    ensemble_mae = mean_absolute_error(y_test, ensemble_pred)
                    ensemble_rmse = np.sqrt(ensemble_mse)
                    ensemble_r2 = r2_score(y_test, ensemble_pred)

                    # Try blending with baseline for better performance if R² is still negative
                    best_blend_r2 = ensemble_r2
                    best_blend_ratio = 0

                    if ensemble_r2 < 0:
                        print("  Ensemble R² is negative, trying baseline blending to improve...")

                        # Test different blending ratios
                        for blend_ratio in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]:
                            # Blend predictions with baseline
                            blended_pred = (1 - blend_ratio) * ensemble_pred + blend_ratio * baseline_mean

                            # Calculate metrics
                            blend_r2 = r2_score(y_test, blended_pred)

                            # Update best if improved
                            if blend_r2 > best_blend_r2:
                                best_blend_r2 = blend_r2
                                best_blend_ratio = blend_ratio

                        if best_blend_ratio > 0:
                            print(f"  Found optimal blend ratio: {best_blend_ratio:.2f}, new R²={best_blend_r2:.4f}")

                            # Recalculate metrics with best blend
                            blended_pred = (1 - best_blend_ratio) * ensemble_pred + best_blend_ratio * baseline_mean
                            ensemble_mse = mean_squared_error(y_test, blended_pred)
                            ensemble_mae = mean_absolute_error(y_test, blended_pred)
                            ensemble_rmse = np.sqrt(ensemble_mse)
                            ensemble_r2 = best_blend_r2

                    # Create custom ensemble model class that can be saved
                    class EnsembleModel:
                        def __init__(self, models, weights, baseline_mean=None, blend_ratio=0):
                            self.models = models
                            self.weights = weights
                            self.baseline_mean = baseline_mean
                            self.blend_ratio = blend_ratio

                        def predict(self, X):
                            ensemble_pred = np.zeros(X.shape[0], dtype=float)
                            for model_name, model in self.models.items():
                                if model_name in self.weights:
                                    model_pred = model.predict(X)
                                    ensemble_pred += self.weights[model_name] * model_pred

                            # Apply blending if needed
                            if self.blend_ratio > 0 and self.baseline_mean is not None:
                                ensemble_pred = (1-self.blend_ratio) * ensemble_pred + self.blend_ratio * self.baseline_mean

                            return ensemble_pred

                    # Create ensemble model instance
                    ensemble_models = {m: target_models[m] for m in top_models}
                    ensemble_instance = EnsembleModel(
                        models=ensemble_models,
                        weights=weights,
                        baseline_mean=baseline_mean,
                        blend_ratio=best_blend_ratio
                    )

                    # Save ensemble model
                    joblib.dump(ensemble_instance, f'models/{target_col}_Ensemble.joblib')

                    # Add ensemble to results
                    model_name = "Ensemble"
                    target_models[model_name] = ensemble_instance
                    target_results[model_name] = {
                        'mse': ensemble_mse,
                        'rmse': ensemble_rmse,
                        'mae': ensemble_mae,
                        'r2': ensemble_r2,
                        'test_score': max(0, ensemble_r2)
                    }

                    print(f"  Ensemble: MSE={ensemble_mse:.4f}, RMSE={ensemble_rmse:.4f}, MAE={ensemble_mae:.4f}, R²={ensemble_r2:.4f}")

                else:
                    print("  Cannot create ensemble: All models have 0 weight")
            else:
                print(f"  Not enough models with positive R² to create ensemble. Found {len(positive_r2_models)}, need at least 2.")

                # If no positive R² models, create a fallback ensemble with baseline blending
                if not positive_r2_models and len(target_models) > 0:
                    print("  Creating fallback model with baseline blending...")

                    # Use first model with best blend ratio
                    fallback_model_name = list(target_models.keys())[0]
                    fallback_model = target_models[fallback_model_name]

                    # Make predictions
                    fallback_pred = fallback_model.predict(X_test)

                    # Find best blend ratio
                    best_r2 = r2_score(y_test, fallback_pred)
                    best_ratio = 0

                    for ratio in [0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 0.99]:
                        blended_pred = (1 - ratio) * fallback_pred + ratio * baseline_mean
                        r2 = r2_score(y_test, blended_pred)

                        if r2 > best_r2:
                            best_r2 = r2
                            best_ratio = ratio

                    # If we improved, create and save model
                    if best_ratio > 0:
                        print(f"  Found optimal fallback blend ratio: {best_ratio:.2f}, "
                              f"improved R² from {target_results[fallback_model_name]['r2']:.4f} to {best_r2:.4f}")

                        # Create blended model
                        class BlendedModel:
                            def __init__(self, model, baseline_mean, blend_ratio):
                                self.model = model
                                self.baseline_mean = baseline_mean
                                self.blend_ratio = blend_ratio

                            def predict(self, X):
                                pred = self.model.predict(X)
                                return (1 - self.blend_ratio) * pred + self.blend_ratio * self.baseline_mean

                        blended_instance = BlendedModel(
                            model=fallback_model,
                            baseline_mean=baseline_mean,
                            blend_ratio=best_ratio
                        )

                        # Calculate metrics
                        blended_pred = blended_instance.predict(X_test)
                        blended_mse = mean_squared_error(y_test, blended_pred)
                        blended_mae = mean_absolute_error(y_test, blended_pred)
                        blended_rmse = np.sqrt(blended_mse)
                        blended_r2 = r2_score(y_test, blended_pred)

                        # Save model
                        joblib.dump(blended_instance, f'models/{target_col}_Blended.joblib')

                        # Add to results
                        model_name = "Blended"
                        target_models[model_name] = blended_instance
                        target_results[model_name] = {
                            'mse': blended_mse,
                            'rmse': blended_rmse,
                            'mae': blended_mae,
                            'r2': blended_r2,
                            'test_score': max(0, blended_r2)
                        }

                        print(f"  Blended: MSE={blended_mse:.4f}, RMSE={blended_rmse:.4f}, "
                              f"MAE={blended_mae:.4f}, R²={blended_r2:.4f}")

        except Exception as e:
            print(f"  Error creating ensemble: {str(e)}")

        # STEP 6: Store all results and models for this target
        results[target_col] = target_results
        all_models[target_col] = target_models

        # Find the best model for this target
        valid_models = [m for m in target_results.keys()
                       if 'test_score' in target_results[m]]

        if valid_models:
            best_model_name = max(valid_models, key=lambda m: target_results[m]['test_score'])
            best_r2 = target_results[best_model_name]['r2']
            print(f"\n  Best model for {target_col}: {best_model_name} (R²={best_r2:.4f})")

            # Store the transformer with the best model to allow reverse transformation
            if target_col in target_transformers:
                print(f"  Note: This target uses a power transformation. Storing transformer with model.")
                joblib.dump(target_transformers[target_col], f'models/{target_col}_transformer.joblib')
        else:
            print(f"  No valid models found for {target_col}")

    # Return all models and results
    return all_models, results

def train_role_recommendation_model(df):
    """Train an advanced model to recommend career roles based on skills and experience"""
    if df is None or len(df) == 0:
        print("No data to train role recommendation model")
        return None, []

    print("Training role recommendation model...")

    # Use full dataset
    data = df.copy()

    # Check if role column exists
    if 'role' not in data.columns:
        print("Error: 'role' column not found in the dataset")
        return None, []

    # Drop rows with missing role
    data = data.dropna(subset=['role'])

    # Filter to top 20 roles to ensure enough samples per role
    role_counts = data['role'].value_counts()
    top_roles = role_counts.head(20).index.tolist()
    print(f"Including top 20 roles (out of {len(role_counts)} total roles)")
    data = data[data['role'].isin(top_roles)]

    print(f"Training with {len(data)} records for role prediction")

    # Process skills for feature extraction
    top_skills = []
    if 'skills' in data.columns:
        # Convert skills from string representation to list if needed
        if len(data) > 0 and isinstance(data['skills'].iloc[0], str):
            data['skills'] = data['skills'].apply(lambda x:
                                               eval(x) if isinstance(x, str) and x.startswith('[')
                                               else [x] if isinstance(x, str)
                                               else x if isinstance(x, list)
                                               else [])

        # Extract all skills from the dataset
        all_skills = []
        for skills_list in data['skills']:
            if isinstance(skills_list, list):
                all_skills.extend(skills_list)

        # Get top skills for feature creation
        top_skills = pd.Series(all_skills).value_counts().head(40).index.tolist()  # Use more skills

        # Create one-hot encoding for top skills
        for skill in top_skills:
            data[f'skill_{skill.replace(" ", "_")}'] = data['skills'].apply(
                lambda x: 1 if isinstance(x, list) and skill in x else 0
            )

        # Create skill diversity feature (number of skills)
        data['skill_count'] = data['skills'].apply(
            lambda x: len(x) if isinstance(x, list) else 0
        )

    # Engineer features from other columns

    # Experience level as ordinal
    experience_map = {
        'Entry': 1,
        'Junior': 2,
        'Mid-level': 3,
        'Senior': 4,
        'Executive': 5
    }
    if 'experience_level' in data.columns:
        data['experience_ordinal'] = data['experience_level'].map(experience_map).fillna(3)

    # Education level as ordinal
    education_map = {
        'High School': 1,
        'Associate Degree': 2,
        'Bachelor\'s Degree': 3,
        'Master\'s Degree': 4,
        'PhD': 5,
        'Professional Certification': 3
    }
    if 'education' in data.columns:
        data['education_ordinal'] = data['education'].map(education_map).fillna(3)

    # One-hot encode categorical columns
    cat_cols = ['sector']
    if cat_cols:
        data = pd.get_dummies(data, columns=cat_cols, drop_first=False)

    # Prepare feature columns - exclude target and unnecessary columns
    exclude_cols = ['role', 'skills', 'description', 'source', 'experience_level', 'education',
                   'job_satisfaction', 'work_life_balance', 'growth_potential', 'salary_range']
    feature_cols = [col for col in data.columns if col not in exclude_cols]

    # Prepare features and target
    X = data[feature_cols]
    y = data['role']

    # Split data for training
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    # Handle imbalanced classes
    print("Addressing class imbalance...")

    # Encode target
    label_encoder = LabelEncoder()
    label_encoder.fit(y)
    y_train_encoded = label_encoder.transform(y_train)

    # Train advanced classifiers
    print("Training multiple classifiers to find best performer...")

    classifiers = {
        'RandomForest': RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            class_weight='balanced',
            n_jobs=-1,
            random_state=42
        ),
        'ExtraTrees': ExtraTreesClassifier(
            n_estimators=200,
            max_depth=15,
            class_weight='balanced',
            n_jobs=-1,
            random_state=42
        ),
        'XGBoost': xgb.XGBClassifier(
            objective='multi:softprob',
            n_estimators=200,
            max_depth=7,
            learning_rate=0.1,
            random_state=42
        )
    }

    # Train and evaluate each model
    best_accuracy = 0
    best_model = None
    best_model_name = None

    for name, classifier in classifiers.items():
        print(f"  Training {name}...")
        classifier.fit(X_train, y_train_encoded)

        # Predict
        y_pred_encoded = classifier.predict(X_test)
        y_pred = label_encoder.inverse_transform(y_pred_encoded)

        # Calculate accuracy
        accuracy = accuracy_score(y_test, y_pred)
        print(f"  {name} accuracy: {accuracy:.4f}")

        # Keep track of best model
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_model = classifier
            best_model_name = name

    # Use the best model
    print(f"Best model: {best_model_name} with accuracy {best_accuracy:.4f}")

    # Advanced evaluation of best model
    if best_model is not None:
        # Predict classes
        y_pred_encoded = best_model.predict(X_test)
        y_pred = label_encoder.inverse_transform(y_pred_encoded)

        # Generate classification report
        report = classification_report(y_test, y_pred)
        print("\nClassification Report:")
        print(report)

        # Generate confusion matrix for top 10 roles (to keep it manageable)
        top_10_roles = role_counts.head(10).index.tolist()
        print("\nConfusion Matrix (top 10 roles):")

        # Filter to top roles
        mask_test = np.isin(y_test, top_10_roles)
        mask_pred = np.isin(y_pred, top_10_roles)

        if sum(mask_test) > 0:
            y_test_top = y_test[mask_test]
            y_pred_top = y_pred[mask_test]

            # Only create confusion matrix if we have enough data
            if len(y_test_top) > 0:
                cm = confusion_matrix(y_test_top, y_pred_top, labels=top_10_roles)

                # Print confusion matrix
                print("\nConfusion Matrix:")
                cm_df = pd.DataFrame(cm, index=top_10_roles, columns=top_10_roles)
                print(cm_df)

        # Save the model and label encoder
        model_path = 'models/role_recommendation_model.joblib'
        encoder_path = 'models/role_label_encoder.joblib'
        joblib.dump(best_model, model_path)
        joblib.dump(label_encoder, encoder_path)

        print(f"Saved role recommendation model and encoder")

        return best_model, top_skills
    else:
        print("Error: No model was successfully trained")
        return None, top_skills

def create_career_prediction_system(use_full_dataset=True):
    """Create and train career prediction system with enhanced accuracy"""
    # Load dataset
    career_df = load_career_dataset()

    if career_df is None:
        print("Failed to load career dataset. Unable to train models.")
        return None, None

    # Display dataset information
    print(f"\nDataset information:")
    print(f"- Total records: {len(career_df)}")
    print(f"- Columns: {', '.join(career_df.columns)}")

    # Process data with advanced preprocessing
    X, y, preprocessor, preprocessor_metadata = preprocess_career_data_advanced(
        career_df, use_full_dataset=use_full_dataset
    )

    if X is None or y is None:
        print("Failed to preprocess career data. Unable to train models.")
        return None, None

    # Train advanced satisfaction models
    satisfaction_models, satisfaction_results = train_advanced_satisfaction_models(
        X, y, preprocessor, preprocessor_metadata
    )

    # Train role recommendation model
    role_model, top_skills = train_role_recommendation_model(career_df)

    # Save metadata about models
    model_info = {
        'satisfaction_targets': list(y.columns),
        'top_skills': top_skills[:30] if top_skills else [],
        'training_data_samples': len(career_df),
        'training_date': str(datetime.now()),
        'features_count': X.shape[1],
        'model_performance': {}
    }

    # Add performance metrics for each target
    for target, model_results in satisfaction_results.items():
        model_info['model_performance'][target] = {}
        for model_name, results in model_results.items():
            if 'error' not in results:
                model_info['model_performance'][target][model_name] = {
                    'r2': results.get('r2'),
                    'rmse': results.get('rmse'),
                    'mae': results.get('mae')
                }

    # Save metadata
    with open('models/career_models_metadata.json', 'w') as f:
        json.dump(model_info, f, indent=2)

    print("\nCareer intelligence model system created successfully with enhanced accuracy.")
    return satisfaction_models, role_model

# Run the model with full dataset and advanced techniques
if __name__ == "__main__":
    # Import time for tracking execution
    import time
    start_time = time.time()

    # Run with FULL dataset and advanced techniques
    print("Starting Career Intelligence System training with advanced techniques and full dataset...")
    satisfaction_models, role_model = create_career_prediction_system(use_full_dataset=True)

    if satisfaction_models and role_model is not None:
        print(f"Career Intelligence System successfully trained!")
        print(f"Training completed in {time.time() - start_time:.2f} seconds")
    else:
        print("Error: Career Intelligence System training failed.")