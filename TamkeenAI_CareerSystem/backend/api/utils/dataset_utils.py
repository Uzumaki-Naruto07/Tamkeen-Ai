import os
import logging
import pandas as pd
import numpy as np

# Try to import to_categorical from different sources, or use our own implementation
try:
    from keras.utils import to_categorical  # type: ignore
except ImportError:
    try:
        from tensorflow.keras.utils import to_categorical  # type: ignore
    except ImportError:
        # Fallback implementation of to_categorical
        def to_categorical(y, num_classes=None, dtype='float32'):
            """Converts a class vector (integers) to binary class matrix.
            
            This is a simplified version of Keras' to_categorical function.
            
            Args:
                y: Class vector to be converted into a matrix 
                   (integers from 0 to num_classes-1).
                num_classes: Total number of classes. If None, this is 
                             calculated from max value in y.
                dtype: The data type expected by the output array.
            
            Returns:
                A binary matrix representation of the input.
            """
            y = np.array(y, dtype='int')
            if not num_classes:
                num_classes = np.max(y) + 1
            n = y.shape[0]
            categorical = np.zeros((n, num_classes), dtype=dtype)
            categorical[np.arange(n), y] = 1
            return categorical

logger = logging.getLogger(__name__)

def load_emotion_dataset(dataset_path=None):
    """
    Load facial expression dataset from file or Hugging Face
    
    Args:
        dataset_path: Optional path to local dataset file
        
    Returns:
        DataFrame or None if loading fails
    """
    try:
        # Try loading from local file first if path provided
        if dataset_path and os.path.exists(dataset_path):
            logger.info(f"Loading emotion dataset from {dataset_path}")
            return pd.read_csv(dataset_path)
            
        # Check if we have the dataset locally in common locations
        local_paths = ['fer2013.csv', 'data/fer2013.csv', '../data/fer2013.csv']
        for path in local_paths:
            if os.path.exists(path):
                logger.info(f"Loading emotion dataset from local file: {path}")
                return pd.read_csv(path)
        
        # Try downloading from Hugging Face
        try:
            import kagglehub
            from kagglehub import KaggleDatasetAdapter
            
            logger.info("Downloading emotion dataset from Hugging Face...")
            dataset = kagglehub.load_dataset(
                KaggleDatasetAdapter.HUGGING_FACE,
                "ashishpatel26/facial-expression-recognitionferchallenge",
                ""  # Empty string for default version
            )
            
            logger.info("Dataset loaded successfully from Hugging Face")
            return dataset
            
        except ImportError:
            logger.warning("kagglehub not available. Cannot download dataset.")
            return None
            
    except Exception as e:
        logger.error(f"Error loading emotion dataset: {str(e)}")
        return None

def prepare_data_from_dataframe(df):
    """
    Prepare dataset from pandas DataFrame for training emotion detection model
    
    Args:
        df: DataFrame containing emotion data
        
    Returns:
        Tuple of (X_train, y_train, X_test, y_test) or (None, None, None, None) on error
    """
    try:
        logger.info("Preparing emotion detection dataset from DataFrame...")
        
        # Check dataframe structure
        logger.info(f"DataFrame columns: {df.columns}")
        
        # Split into train and test
        train_data = df[df['Usage'] == 'Training']
        test_data = df[df['Usage'] == 'PublicTest']
        
        logger.info(f"Training samples: {len(train_data)}")
        logger.info(f"Testing samples: {len(test_data)}")
        
        # Extract features and labels for training data
        X_train = []
        for pixel_string in train_data['pixels']:
            pixel_values = [int(p) for p in pixel_string.split()]
            img = np.array(pixel_values).reshape(48, 48) / 255.0  # Normalize
            X_train.append(img)
        
        X_train = np.array(X_train).reshape(-1, 48, 48, 1)
        y_train = to_categorical(train_data['emotion'], num_classes=7)
        
        # Extract features and labels for test data
        X_test = []
        for pixel_string in test_data['pixels']:
            pixel_values = [int(p) for p in pixel_string.split()]
            img = np.array(pixel_values).reshape(48, 48) / 255.0  # Normalize
            X_test.append(img)
        
        X_test = np.array(X_test).reshape(-1, 48, 48, 1)
        y_test = to_categorical(test_data['emotion'], num_classes=7)
        
        logger.info("Dataset preparation complete")
        return X_train, y_train, X_test, y_test
        
    except Exception as e:
        logger.error(f"Error preparing data from DataFrame: {str(e)}")
        return None, None, None, None 