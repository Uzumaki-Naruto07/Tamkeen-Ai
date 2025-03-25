"""# Section 7: Model Training"""

# ==== SECTION 7: TRAINING ML MODELS ====
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

# Initialize GPU availability flag
use_gpu = False
GPU_AVAILABLE = False
TORCH_GPU_AVAILABLE = False

# Check for GPU availability
try:
    import tensorflow as tf
    print(f"TensorFlow version: {tf.__version__}")
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"GPU devices available: {len(gpus)}")
        print(f"GPU details: {gpus}")
        # Set memory growth to avoid taking all GPU memory
        for gpu in gpus:
            try:
                tf.config.experimental.set_memory_growth(gpu, True)
            except Exception as e:
                print(f"Error setting memory growth: {e}")
        GPU_AVAILABLE = True
        use_gpu = True  # Set the global use_gpu flag
    else:
        print("No GPU devices detected by TensorFlow")
        GPU_AVAILABLE = False

    # Also check if CUDA is available for PyTorch
    try:
        import torch
        TORCH_GPU_AVAILABLE = torch.cuda.is_available()
        if TORCH_GPU_AVAILABLE:
            print(f"PyTorch CUDA available: {TORCH_GPU_AVAILABLE}")
            print(f"CUDA device count: {torch.cuda.device_count()}")
            print(f"CUDA device name: {torch.cuda.get_device_name(0)}")
            use_gpu = True  # Set the global use_gpu flag
        else:
            print("PyTorch CUDA not available")
    except Exception as e:
        print(f"Error checking PyTorch CUDA: {e}")
        TORCH_GPU_AVAILABLE = False

except Exception as e:
    print(f"Error checking TensorFlow GPU: {e}")
    GPU_AVAILABLE = False
    TORCH_GPU_AVAILABLE = False
    use_gpu = False

# Try to import Optuna for hyperparameter optimization
try:
    import optuna
    optuna_available = True
    print("Optuna available for hyperparameter optimization")
except ImportError:
    optuna_available = False
    print("Optuna not available, will use RandomizedSearchCV instead")

# Try to import XGBoost for advanced modeling
try:
    import xgboost as xgb
    xgboost_available = True
    print("XGBoost available for advanced modeling")
except ImportError:
    xgboost_available = False
    print("XGBoost not available, will use RandomForest instead")

# ==== 6.1: TRAINING REGRESSION MODELS ====

def train_regression_models(X_train, X_test, y_train, y_test, target_name, use_gpu=False, verbose=True):
    """
    Train and evaluate multiple regression models for a specific target

    Args:
        X_train: Training features
        X_test: Testing features
        y_train: Training target values
        y_test: Testing target values
        target_name: Name of the target variable
        use_gpu: Whether to use GPU acceleration
        verbose: Whether to print progress info

    Returns:
        Best performing model and its metrics
    """
    models = {}
    results = {}

    if verbose:
        print(f"\nTraining regression models for {target_name}...")
        print(f"GPU acceleration: {'Enabled' if use_gpu and (GPU_AVAILABLE or TORCH_GPU_AVAILABLE) else 'Disabled'}")

    # 1. Random Forest Regressor
    if verbose:
        print("1. Training Random Forest Regressor...")
    rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    rf_mse = mean_squared_error(y_test, rf_pred)
    rf_mae = mean_absolute_error(y_test, rf_pred)
    rf_r2 = r2_score(y_test, rf_pred)

    models["random_forest"] = rf
    results["random_forest"] = {
        "mse": rf_mse,
        "mae": rf_mae,
        "r2": rf_r2
    }

    if verbose:
        print(f"   MSE: {rf_mse:.4f}, MAE: {rf_mae:.4f}, R²: {rf_r2:.4f}")

    # 2. Gradient Boosting Regressor
    if verbose:
        print("2. Training Gradient Boosting Regressor...")
    gb = GradientBoostingRegressor(n_estimators=100, random_state=42)
    gb.fit(X_train, y_train)
    gb_pred = gb.predict(X_test)
    gb_mse = mean_squared_error(y_test, gb_pred)
    gb_mae = mean_absolute_error(y_test, gb_pred)
    gb_r2 = r2_score(y_test, gb_pred)

    models["gradient_boosting"] = gb
    results["gradient_boosting"] = {
        "mse": gb_mse,
        "mae": gb_mae,
        "r2": gb_r2
    }

    if verbose:
        print(f"   MSE: {gb_mse:.4f}, MAE: {gb_mae:.4f}, R²: {gb_r2:.4f}")

    # 3. XGBoost Regressor (if available)
    if xgboost_available:
        if verbose:
            print("3. Training XGBoost Regressor...")

        # Set up XGBoost parameters with GPU support if available
        if use_gpu and (GPU_AVAILABLE or TORCH_GPU_AVAILABLE):
            params = {
                'objective': 'reg:squarederror',
                'eval_metric': 'rmse',
                'tree_method': 'gpu_hist',  # Use GPU acceleration
                'gpu_id': 0,
                'predictor': 'gpu_predictor',
                'learning_rate': 0.1,
                'max_depth': 6,
                'min_child_weight': 1,
                'n_estimators': 100,
                'early_stopping_rounds': 10,
                'verbosity': 1 if verbose else 0
            }
            if verbose:
                print("   Using GPU acceleration for XGBoost")
        else:
            params = {
                'objective': 'reg:squarederror',
                'eval_metric': 'rmse',
                'tree_method': 'hist',  # CPU-based histogram algorithm
                'learning_rate': 0.1,
                'max_depth': 6,
                'min_child_weight': 1,
                'n_estimators': 100,
                'early_stopping_rounds': 10,
                'verbosity': 1 if verbose else 0
            }

        # Create DMatrix for efficient training
        dtrain = xgb.DMatrix(X_train, label=y_train)
        dtest = xgb.DMatrix(X_test, label=y_test)

        # Train model
        xgb_model = xgb.train(
            params,
            dtrain,
            num_boost_round=100,
            evals=[(dtest, 'test')],
            early_stopping_rounds=10,
            verbose_eval=verbose
        )

        # Make predictions
        xgb_pred = xgb_model.predict(dtest)
        xgb_mse = mean_squared_error(y_test, xgb_pred)
        xgb_mae = mean_absolute_error(y_test, xgb_pred)
        xgb_r2 = r2_score(y_test, xgb_pred)

        models["xgboost"] = xgb_model
        results["xgboost"] = {
            "mse": xgb_mse,
            "mae": xgb_mae,
            "r2": xgb_r2
        }

        if verbose:
            print(f"   MSE: {xgb_mse:.4f}, MAE: {xgb_mae:.4f}, R²: {xgb_r2:.4f}")

    # Find the best model based on MSE
    best_model_name = min(results, key=lambda x: results[x]['mse'])
    best_model = models[best_model_name]
    best_metrics = results[best_model_name]

    if verbose:
        print(f"\nBest model for {target_name}: {best_model_name}")
        print(f"  MSE: {best_metrics['mse']:.4f}")
        print(f"  MAE: {best_metrics['mae']:.4f}")
        print(f"  R²: {best_metrics['r2']:.4f}")

    return best_model, best_metrics

def optimize_hyperparameters(X_train, y_train, model_type='xgboost', use_gpu=False,
                            is_classification=False, n_trials=50, verbose=True):
    """
    Optimize hyperparameters for a given model type

    Args:
        X_train: Training features
        y_train: Training target values
        model_type: Type of model to optimize ('xgboost', 'random_forest', etc.)
        use_gpu: Whether to use GPU acceleration
        is_classification: Whether this is a classification task
        n_trials: Number of optimization trials
        verbose: Whether to print progress

    Returns:
        Optimized model
    """
    if optuna_available:
        if verbose:
            print(f"Optimizing {model_type} hyperparameters with Optuna...")

        def objective(trial):
            if model_type == 'xgboost' and xgboost_available:
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 500),
                    'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
                    'max_depth': trial.suggest_int('max_depth', 3, 10),
                    'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                    'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
                    'random_state': 42
                }

                if use_gpu:
                    params['tree_method'] = 'gpu_hist'
                    params['gpu_id'] = 0

                if is_classification:
                    model = xgb.XGBClassifier(**params)
                else:
                    model = xgb.XGBRegressor(**params)

            elif model_type == 'random_forest':
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 500),
                    'max_depth': trial.suggest_int('max_depth', 5, 20),
                    'min_samples_split': trial.suggest_int('min_samples_split', 2, 10),
                    'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 5),
                    'random_state': 42
                }

                if is_classification:
                    model = RandomForestClassifier(**params)
                else:
                    model = RandomForestRegressor(**params)

            else:
                # Default to RandomForest if model_type is not supported
                params = {
                    'n_estimators': trial.suggest_int('n_estimators', 50, 500),
                    'max_depth': trial.suggest_int('max_depth', 5, 20),
                    'min_samples_split': trial.suggest_int('min_samples_split', 2, 10),
                    'random_state': 42
                }

                if is_classification:
                    model = RandomForestClassifier(**params)
                else:
                    model = RandomForestRegressor(**params)

            # Train and evaluate with cross-validation
            from sklearn.model_selection import cross_val_score

            if is_classification:
                score = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy').mean()
            else:
                # Use negative MSE for regression (Optuna minimizes the objective)
                score = -cross_val_score(model, X_train, y_train, cv=5, scoring='neg_mean_squared_error').mean()

            return score

        # Create and run the study
        if is_classification:
            direction = 'maximize'  # Maximize accuracy for classification
        else:
            direction = 'minimize'  # Minimize MSE for regression

        study = optuna.create_study(direction=direction)
        study.optimize(objective, n_trials=n_trials)

        # Get the best parameters
        best_params = study.best_params

        if verbose:
            print(f"Best parameters: {best_params}")

        # Create and return the best model
        if model_type == 'xgboost' and xgboost_available:
            if use_gpu:
                best_params['tree_method'] = 'gpu_hist'
                best_params['gpu_id'] = 0

            if is_classification:
                best_model = xgb.XGBClassifier(**best_params)
            else:
                best_model = xgb.XGBRegressor(**best_params)

        elif model_type == 'random_forest':
            if is_classification:
                best_model = RandomForestClassifier(**best_params)
            else:
                best_model = RandomForestRegressor(**best_params)

        else:
            if is_classification:
                best_model = RandomForestClassifier(**best_params)
            else:
                best_model = RandomForestRegressor(**best_params)

        # Train the final model
        best_model.fit(X_train, y_train)
        return best_model

    else:
        # Use RandomizedSearchCV if Optuna is not available
        if verbose:
            print(f"Optimizing {model_type} hyperparameters with RandomizedSearchCV...")

        if model_type == 'xgboost' and xgboost_available:
            param_grid = {
                'n_estimators': [50, 100, 200, 300],
                'learning_rate': [0.01, 0.05, 0.1, 0.2],
                'max_depth': [3, 5, 7, 9],
                'subsample': [0.6, 0.8, 1.0],
                'colsample_bytree': [0.6, 0.8, 1.0]
            }

            if is_classification:
                model = xgb.XGBClassifier(random_state=42)
            else:
                model = xgb.XGBRegressor(random_state=42)

            if use_gpu:
                model.set_params(tree_method='gpu_hist', gpu_id=0)

        elif model_type == 'random_forest':
            param_grid = {
                'n_estimators': [50, 100, 200, 300],
                'max_depth': [5, 10, 15, 20],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }

            if is_classification:
                model = RandomForestClassifier(random_state=42)
            else:
                model = RandomForestRegressor(random_state=42)

        else:
            # Default to RandomForest
            param_grid = {
                'n_estimators': [50, 100, 200, 300],
                'max_depth': [5, 10, 15, 20],
                'min_samples_split': [2, 5, 10]
            }

            if is_classification:
                model = RandomForestClassifier(random_state=42)
            else:
                model = RandomForestRegressor(random_state=42)

        # Create and run the search
        if is_classification:
            scoring = 'accuracy'
        else:
            scoring = 'neg_mean_squared_error'

        search = RandomizedSearchCV(
            model, param_grid, n_iter=10, cv=5,
            scoring=scoring, random_state=42, n_jobs=-1
        )

        search.fit(X_train, y_train)

        if verbose:
            print(f"Best parameters: {search.best_params_}")

        return search.best_estimator_

# ==== 6.2: TRAINING CLASSIFICATION MODELS ====

def train_classifier(X_train, X_test, y_train, y_test, use_gpu=False, verbose=True):
    """
    Train and evaluate a classifier for the Strong/Average/Weak categories

    Args:
        X_train: Training features
        X_test: Testing features
        y_train: Training target values (0: Weak, 1: Average, 2: Strong)
        y_test: Testing target values
        use_gpu: Whether to use GPU acceleration
        verbose: Whether to print progress

    Returns:
        Best performing classifier model
    """
    if verbose:
        print("\nTraining classifier for Strong/Average/Weak categories...")
        print(f"GPU acceleration: {'Enabled' if use_gpu and (GPU_AVAILABLE or TORCH_GPU_AVAILABLE) else 'Disabled'}")

    models = {}
    results = {}

    # 1. Random Forest Classifier
    if verbose:
        print("1. Training Random Forest Classifier...")
    rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf_classifier.fit(X_train, y_train)
    rf_preds = rf_classifier.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)

    models["random_forest"] = rf_classifier
    results["random_forest"] = {
        "accuracy": rf_acc
    }

    if verbose:
        print(f"   Accuracy: {rf_acc:.4f}")

    # 2. XGBoost Classifier (if available)
    if xgboost_available:
        if verbose:
            print("2. Training XGBoost Classifier...")

        # Set up XGBoost parameters with GPU support if available
        if use_gpu and (GPU_AVAILABLE or TORCH_GPU_AVAILABLE):
            params = {
                'objective': 'multi:softmax',
                'eval_metric': 'mlogloss',
                'num_class': 3,  # 0: Weak, 1: Average, 2: Strong
                'tree_method': 'gpu_hist',  # Use GPU acceleration
                'gpu_id': 0,
                'predictor': 'gpu_predictor',
                'learning_rate': 0.1,
                'max_depth': 6,
                'min_child_weight': 1,
                'verbosity': 1 if verbose else 0
            }
            if verbose:
                print("   Using GPU acceleration for XGBoost")
        else:
            params = {
                'objective': 'multi:softmax',
                'eval_metric': 'mlogloss',
                'num_class': 3,  # 0: Weak, 1: Average, 2: Strong
                'tree_method': 'hist',  # CPU-based histogram algorithm
                'learning_rate': 0.1,
                'max_depth': 6,
                'min_child_weight': 1,
                'verbosity': 1 if verbose else 0
            }

        # Create DMatrix for efficient training
        dtrain = xgb.DMatrix(X_train, label=y_train)
        dtest = xgb.DMatrix(X_test, label=y_test)

        # Train model
        xgb_model = xgb.train(
            params,
            dtrain,
            num_boost_round=100,
            evals=[(dtest, 'test')],
            early_stopping_rounds=10,
            verbose_eval=verbose
        )

        # Make predictions
        xgb_preds = xgb_model.predict(dtest)
        xgb_preds = xgb_preds.astype(int)  # Convert to integers
        xgb_acc = accuracy_score(y_test, xgb_preds)

        models["xgboost"] = xgb_model
        results["xgboost"] = {
            "accuracy": xgb_acc
        }

        if verbose:
            print(f"   Accuracy: {xgb_acc:.4f}")

    # Find the best model based on accuracy
    best_model_name = max(results, key=lambda x: results[x]['accuracy'])
    best_model = models[best_model_name]

    if verbose:
        print(f"\nBest classifier: {best_model_name} (Accuracy: {results[best_model_name]['accuracy']:.4f})")
        print("\nClassification Report:")
        if best_model_name == "xgboost":
            best_preds = best_model.predict(dtest).astype(int)
        else:
            best_preds = best_model.predict(X_test)
        print(classification_report(y_test, best_preds,
                                  target_names=['Weak', 'Average', 'Strong']))

    return best_model

def generate_minimal_sample_data(num_samples=100000):
    """
    Generate a very minimal dataset for emergency fallback purposes.

    Args:
        num_samples: Number of samples to generate

    Returns:
        DataFrame with basic feature and target columns
    """
    print(f"Generating minimal emergency dataset with {num_samples} samples...")

    # Import needed libraries
    import numpy as np
    import pandas as pd

    # Create empty dataframe
    data = pd.DataFrame()

    # Generate features
    for i in range(11):
        feature_name = f'feature_{i}'
        # Random values calibrated to reasonable ranges
        data[feature_name] = np.random.rand(num_samples) * (100 if i in [0, 1, 8] else 10)

    # Generate target variables - ensure good distribution
    categories = np.random.choice([0, 1, 2], size=num_samples, p=[0.25, 0.5, 0.25])

    # Add scores based on categories
    data['technical'] = np.where(categories == 0, np.random.uniform(10, 35, num_samples),
                       np.where(categories == 1, np.random.uniform(40, 70, num_samples),
                                np.random.uniform(75, 95, num_samples)))

    data['communication'] = np.where(categories == 0, np.random.uniform(10, 35, num_samples),
                           np.where(categories == 1, np.random.uniform(40, 70, num_samples),
                                    np.random.uniform(75, 95, num_samples)))

    data['problem_solving'] = np.where(categories == 0, np.random.uniform(10, 35, num_samples),
                              np.where(categories == 1, np.random.uniform(40, 70, num_samples),
                                      np.random.uniform(75, 95, num_samples)))

    data['cultural_fit'] = np.where(categories == 0, np.random.uniform(10, 35, num_samples),
                           np.where(categories == 1, np.random.uniform(40, 70, num_samples),
                                   np.random.uniform(75, 95, num_samples)))

    data['overall'] = np.where(categories == 0, np.random.uniform(10, 35, num_samples),
                      np.where(categories == 1, np.random.uniform(40, 70, num_samples),
                              np.random.uniform(75, 95, num_samples)))

    data['classifier'] = categories

    print(f"Minimal emergency dataset generated with {len(data)} rows and {len(data.columns)} columns")
    print(f"Category distribution: Weak: {sum(categories == 0)}, Average: {sum(categories == 1)}, Strong: {sum(categories == 2)}")

    return data

def train_evaluation_models(data=None, retrain=False, verbose=True, use_gpu=True):
    """
    Train and save regression models for interview evaluation.

    Args:
        data: DataFrame with features and targets
        retrain: Whether to retrain models even if they exist
        verbose: Whether to print progress information
        use_gpu: Whether to use GPU acceleration if available

    Returns:
        Dictionary with trained models and scaler
    """
    if verbose:
        print("\n==== INTERVIEW EVALUATION MODEL TRAINING ====")

    # Check if models already exist and we're not forced to retrain
    if os.path.exists("interview_evaluation_models.pkl") and not retrain:
        if verbose:
            print("Interview evaluation models already exist.")
            print("Use retrain=True to force retraining.")
        try:
            model_package = joblib.load("interview_evaluation_models.pkl")
            return model_package
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Will retrain models...")

    # Load data if not provided
    if data is None:
        if verbose:
            print("No data provided. Attempting to load interview data...")
        try:
            # Try to load existing processed data
            data = pd.read_csv("interview_data.csv")
            if verbose:
                print(f"Successfully loaded data with {len(data)} records")
        except Exception as e:
            if verbose:
                print(f"Error loading interview_data.csv: {e}")
                print("Generating sample data for demonstration...")

            try:
                # Import the necessary module for data generation
                import sys
                from pathlib import Path

                # Add parent directory to path if needed
                current_dir = Path(__file__).parent
                parent_dir = current_dir.parent
                if str(parent_dir) not in sys.path:
                    sys.path.append(str(parent_dir))

                # Import the data retrieval module
                try:
                    from section_5b_data_retrieval import get_interview_dataset

                    # Generate a moderate dataset for testing (5K samples)
                    num_samples = 50000  # Starting with 5K samples for initial testing
                    data = get_interview_dataset(num_samples=num_samples)

                    # Save the generated data for future use
                    data.to_csv(f"interview_data_sample_{num_samples}.csv", index=False)
                    if verbose:
                        print(f"Generated and saved sample data with {len(data)} records to interview_data_sample_{num_samples}.csv")
                except ImportError as e:
                    print(f"Error importing data retrieval module: {e}")
                    # Generate minimal sample data
                    data = generate_minimal_sample_data()
                    data.to_csv("interview_data_sample.csv", index=False)
                    if verbose:
                        print(f"Generated and saved minimal sample data with {len(data)} records to interview_data_sample.csv")
            except Exception as e:
                print(f"Error generating data: {e}")
                return None

    # Continue with the rest of the function for model training
    if verbose:
        print("Starting ML model training...")
        if use_gpu:
            print("Using GPU acceleration if available")

    # Check if models already exist and we don't want to retrain
    if not retrain and os.path.exists("interview_evaluation_models.pkl"):
        try:
            models = joblib.load("interview_evaluation_models.pkl")
            if verbose:
                print("Loaded existing models from interview_evaluation_models.pkl")
            return models
        except Exception as e:
            print(f"Error loading existing models: {e}")
            print("Will train new models instead")

    if data is None or len(data) == 0:
        print("No data available for training")
        return None

    if verbose:
        print(f"Training ML models on {len(data)} samples...")

    # Extract features and targets
    feature_columns = [col for col in data.columns if col.startswith('feature_')]
    target_columns = ['technical', 'communication', 'problem_solving', 'cultural_fit', 'overall']

    # Check which target columns are available
    available_targets = [col for col in target_columns if col in data.columns]

    if len(feature_columns) == 0:
        print("No feature columns found in data")
        return None

    if len(available_targets) == 0:
        print("No target columns found in data")
        return None

    if verbose:
        print(f"Using {len(feature_columns)} features for model training")
        print(f"Using {len(available_targets)} evaluation metrics as targets: {available_targets}")

    # Extract features
    X = data[feature_columns].copy()

    # Ensure all feature values are numeric
    for col in X.columns:
        if X[col].dtype == 'object':
            try:
                X[col] = pd.to_numeric(X[col], errors='coerce')
            except:
                print(f"Warning: Could not convert column {col} to numeric")
                # Drop the column if it can't be converted
                X = X.drop(columns=[col])

    # Fill NaN values with column means
    X = X.fillna(X.mean())

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_scaled, columns=X.columns, index=X.index)

    # Dictionary to store trained models
    trained_models = {}

    # Train regression models for each target
    for target_name in available_targets:
        if verbose:
            print(f"\n=== Training models for {target_name} ===")

        # Get target values, ensuring they're numeric
        y = data[target_name].copy()
        if y.dtype == 'object':
            try:
                y = pd.to_numeric(y, errors='coerce')
            except:
                print(f"Warning: Could not convert target {target_name} to numeric")
                continue

        # Drop rows with missing target values
        valid_mask = ~y.isna()
        X_target = X_scaled[valid_mask].copy()
        y_target = y[valid_mask].copy()

        if len(y_target) == 0:
            print(f"No valid data for target {target_name}")
            continue

        # Split data for training and testing
        X_train, X_test, y_train, y_test = train_test_split(
            X_target, y_target, test_size=0.2, random_state=42
        )

        if verbose:
            print(f"Train set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")

        # Train regression models
        best_model, _ = train_regression_models(
            X_train, X_test, y_train, y_test,
            target_name=target_name,
            use_gpu=use_gpu,
            verbose=verbose
        )

        # Store the best model
        trained_models[target_name] = best_model

    # Train classifier for Strong/Average/Weak if 'category' column exists
    if 'category' in data.columns:
        if verbose:
            print("\n=== Training classifier for Strong/Average/Weak categories ===")

        # Map categories to numerical values
        category_mapping = {'Strong': 2, 'Average': 1, 'Weak': 0}

        # Create a copy to avoid warnings
        data_for_class = data.copy()

        # Convert categories to numeric values
        if data_for_class['category'].dtype == 'object':
            # Map categorical values to numbers
            data_for_class['category_encoded'] = data_for_class['category'].map(category_mapping)

            # Check for invalid categories
            if data_for_class['category_encoded'].isna().any():
                invalid_cats = data_for_class.loc[data_for_class['category_encoded'].isna(), 'category'].unique()
                print(f"Warning: Found invalid categories: {invalid_cats}")
                print("These will be treated as missing values")
                # Fill NaN with a default value
                data_for_class = data_for_class.dropna(subset=['category_encoded'])

            # Ensure it's an integer
            data_for_class['category_encoded'] = data_for_class['category_encoded'].astype(int)

        # Use the same feature set as for regression
        X_class = X_scaled.loc[data_for_class.index].copy()
        y_class = data_for_class['category_encoded'].copy()

        # Train-test split
        X_train_class, X_test_class, y_train_class, y_test_class = train_test_split(
            X_class, y_class, test_size=0.2, random_state=42, stratify=y_class
        )

        # Train the classifier
        classifier_model = train_classifier(
            X_train_class, X_test_class, y_train_class, y_test_class,
            use_gpu=use_gpu,
            verbose=verbose
        )

        # Store the classifier
        trained_models['classifier'] = classifier_model
        # Also store the classifier type (for prediction handling)
        trained_models['classifier_type'] = 'xgboost' if isinstance(classifier_model, xgb.Booster) else 'sklearn'

    # ==== 6.3: EVALUATING ML MODELS ====

    if verbose:
        print("\n=== Evaluating models on full dataset ===")

    # Try to run predictions on the full dataset
    try:
        # Convert the full dataset to DMatrix for XGBoost models
        X_dmatrix = xgb.DMatrix(X_scaled)

        # Predict using all models
        predictions = {}

        for target_name, model in trained_models.items():
            if target_name == 'classifier_type':
                continue  # Skip the type indicator

            if target_name == 'classifier':
                # Handle classifier predictions based on type
                if trained_models['classifier_type'] == 'xgboost':
                    # For XGBoost Booster, use DMatrix
                    class_preds_num = model.predict(X_dmatrix).astype(int)
                    # Map back to labels
                    class_mapping = {0: 'Weak', 1: 'Average', 2: 'Strong'}
                    class_preds = [class_mapping[pred] for pred in class_preds_num]
                else:
                    # For sklearn models
                    class_preds_num = model.predict(X_scaled)
                    # Map back to labels
                    class_mapping = {0: 'Weak', 1: 'Average', 2: 'Strong'}
                    class_preds = [class_mapping[pred] for pred in class_preds_num]

                predictions['category'] = class_preds

                if verbose:
                    # Show distribution of predictions
                    counts = {label: class_preds.count(label) for label in set(class_preds)}
                    print(f"    Classification results: {counts}")
            else:
                # Handle regression model predictions
                if isinstance(model, xgb.Booster):
                    # For XGBoost Booster, use DMatrix
                    target_preds = model.predict(X_dmatrix)
                else:
                    # For sklearn models
                    target_preds = model.predict(X_scaled)

                predictions[target_name] = target_preds

                if verbose:
                    # Show summary statistics of predictions
                    pred_mean = np.mean(target_preds)
                    pred_min = np.min(target_preds)
                    pred_max = np.max(target_preds)
                    print(f"    Score range: {pred_min:.2f} to {pred_max:.2f}, average: {pred_mean:.2f}")

    except Exception as e:
        print(f"Warning: Error during evaluation: {e}")
        print("This won't affect the saved models, but you may want to investigate")

    # ==== 6.4: SAVING ML MODELS ====

    # Package models with scaler for deployment
    model_package = {
        'models': trained_models,
        'scaler': scaler,
        'feature_columns': feature_columns,
        'target_columns': available_targets
    }

    try:
        # Save the model package
        joblib.dump(model_package, "interview_evaluation_models.pkl")
        if verbose:
            print("\nAll models saved successfully to interview_evaluation_models.pkl")
    except Exception as e:
        print(f"Error saving models: {e}")

    return model_package

# Function to make predictions with the trained models
def predict_with_models(data, model_package=None, verbose=True):
    """
    Make predictions using trained models

    Args:
        data: DataFrame with features
        model_package: Dictionary with trained models and scaler
        verbose: Whether to print progress information

    Returns:
        Dictionary of predictions
    """
    if verbose:
        print("Starting prediction process...")

    # Load models if not provided
    if model_package is None:
        if verbose:
            print("No model package provided, attempting to load from file...")
        try:
            model_package = joblib.load("interview_evaluation_models.pkl")
            if verbose:
                print("Successfully loaded models from interview_evaluation_models.pkl")
        except Exception as e:
            print(f"Error loading models: {e}")
            return None

    # Extract components from the package
    models = model_package['models']
    scaler = model_package['scaler']
    feature_columns = model_package['feature_columns']

    # Ensure all needed features are present
    for col in feature_columns:
        if col not in data.columns:
            data[col] = 0  # Default value for missing features

    # Extract required features in the correct order
    X = data[feature_columns].copy()

    # Ensure all feature values are numeric
    for col in X.columns:
        if not np.issubdtype(X[col].dtype, np.number):
            X[col] = X[col].astype(float)

    # Scale features
    X_scaled = scaler.transform(X)

    # Import XGBoost if needed for predictions
    try:
        import xgboost as xgb
        xgboost_available = True
    except ImportError:
        xgboost_available = False

    # Create DMatrix for XGBoost models if needed
    needs_dmatrix = False
    for model_name, model in models.items():
        if model_name != 'classifier_type' and isinstance(model, xgb.Booster):
            needs_dmatrix = True
            break

    if needs_dmatrix and xgboost_available:
        X_dmatrix = xgb.DMatrix(X_scaled)

    # Make predictions with all models
    predictions = {}
    for target_name, model in models.items():
        if target_name == 'classifier_type':
            continue  # Skip the type indicator

        if verbose:
            print(f"Predicting {target_name}...")

        if target_name == 'classifier':
            # Check classifier type
            if 'classifier_type' in models and models['classifier_type'] == 'xgboost':
                # For XGBoost booster
                class_preds_num = model.predict(X_dmatrix).astype(int)
                # Map back to labels
                class_mapping = {0: 'Weak', 1: 'Average', 2: 'Strong'}
                class_preds = [class_mapping[pred] for pred in class_preds_num]
                predictions['category'] = class_preds
            else:
                # For sklearn classifiers
                class_preds_num = model.predict(X_scaled)
                # Map back to labels
                class_mapping = {0: 'Weak', 1: 'Average', 2: 'Strong'}
                class_preds = [class_mapping[pred] for pred in class_preds_num]
                predictions['category'] = class_preds
        else:
            # Regression predictions
            if isinstance(model, xgb.Booster):
                # For XGBoost booster
                target_preds = model.predict(X_dmatrix)
            else:
                # For sklearn models
                target_preds = model.predict(X_scaled)

            predictions[target_name] = target_preds

    # Apply additional sentiment-based adjustment
    # Penalize inappropriate responses more heavily based on sentiment
    if 'feature_10' in data.columns:  # Check if sentiment feature exists
        sentiment_score = data['feature_10'].values[0]
        minimal_words = data['feature_0'].values[0] < 5  # Check if response is too short

        # Detect extremely negative or inappropriate responses
        # Lower sentiment with few words indicates potential inappropriate response
        if minimal_words and sentiment_score < 0.4:
            # Apply stronger penalty to all scores
            penalty_factor = 0.3
            for key in predictions:
                if key != 'category':  # Don't penalize the category
                    predictions[key] = np.array([max(20, score * penalty_factor) for score in predictions[key]])

    # Ensure all scores are within valid range (0-100)
    for key in predictions:
        if key != 'category':  # Don't adjust the category
            predictions[key] = np.array([max(0, min(100, score)) for score in predictions[key]])

    return predictions

# Example usage:
if __name__ == "__main__":
    print("ML Model Training Module")
    print("Starting direct execution of model training...")

    try:
        # Attempt to load data
        print("\nAttempting to load interview data...")
        try:
            data = pd.read_csv("interview_data.csv")
            print(f"Successfully loaded data with {len(data)} samples")
        except Exception as e:
            print(f"Error loading interview_data.csv: {e}")
            print("Generating sample data for demonstration...")

            # Create sample data if file doesn't exist
            np.random.seed(42)
            n_samples = 100000
            n_features = 10

            # Generate features
            features = np.random.randn(n_samples, n_features)
            feature_cols = [f'feature_{i}' for i in range(n_features)]

            # Generate target values
            technical = 0.7 * features[:, 0] + 0.3 * features[:, 1] + np.random.randn(n_samples) * 0.2
            communication = 0.5 * features[:, 2] + 0.5 * features[:, 3] + np.random.randn(n_samples) * 0.2
            problem_solving = 0.6 * features[:, 4] + 0.4 * features[:, 5] + np.random.randn(n_samples) * 0.2
            cultural_fit = 0.4 * features[:, 6] + 0.6 * features[:, 7] + np.random.randn(n_samples) * 0.2
            overall = 0.25 * technical + 0.25 * communication + 0.25 * problem_solving + 0.25 * cultural_fit

            # Scale to 0-100 range
            def scale_to_range(arr, min_val=0, max_val=100):
                return ((arr - arr.min()) / (arr.max() - arr.min())) * (max_val - min_val) + min_val

            technical = scale_to_range(technical)
            communication = scale_to_range(communication)
            problem_solving = scale_to_range(problem_solving)
            cultural_fit = scale_to_range(cultural_fit)
            overall = scale_to_range(overall)

            # Generate categories based on overall score
            categories = []
            for score in overall:
                if score >= 70:
                    categories.append('Strong')
                elif score >= 40:
                    categories.append('Average')
                else:
                    categories.append('Weak')

            # Create DataFrame
            data = pd.DataFrame(features, columns=feature_cols)
            data['technical'] = technical
            data['communication'] = communication
            data['problem_solving'] = problem_solving
            data['cultural_fit'] = cultural_fit
            data['overall'] = overall
            data['category'] = categories

            # Save sample data for future use
            try:
                data.to_csv("interview_data_sample.csv", index=False)
                print(f"Generated and saved sample data with {len(data)} records to interview_data_sample.csv")
            except:
                print("Note: Could not save sample data to file")

        # Train models
        print("\nTraining models...")
        # The global use_gpu variable was defined at the top of the file
        # It is automatically set based on GPU detection
        model_package = train_evaluation_models(
            data=data,
            retrain=True,
            verbose=True,
            use_gpu=use_gpu  # Use the global variable defined at the top of the file
        )

        if model_package:
            print("\nModel training completed successfully!")

    except Exception as e:
        print(f"\nAn error occurred during execution: {str(e)}")
        import traceback
        traceback.print_exc()

    print("\nExecution complete!")