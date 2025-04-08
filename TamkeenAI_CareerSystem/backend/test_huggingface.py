import os
from huggingface_hub import login, HfApi
from dotenv import load_dotenv

# Load environment variables
print("Loading environment variables...")
load_dotenv()

# Get the token
hf_token = os.environ.get('HF_TOKEN')
print(f"HF_TOKEN found: {hf_token is not None}")

if not hf_token:
    print("No HF_TOKEN found in environment variables")
    exit(1)

try:
    print("Attempting to login to HuggingFace Hub...")
    login(token=hf_token)
    print("Login successful!")

    # Test if we can actually use the API
    api = HfApi(token=hf_token)
    print("Checking connection by listing models...")
    models = api.list_models(limit=1)
    print(f"Successfully listed models: {models}")
    
    print("\nHuggingFace connection test successful!")
except Exception as e:
    print(f"Error connecting to HuggingFace: {str(e)}")
    print("\nHuggingFace connection test failed.") 