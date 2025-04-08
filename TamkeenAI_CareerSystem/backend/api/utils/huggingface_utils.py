import os
from typing import Optional
from huggingface_hub import login
from ..config.env import HF_TOKEN

def setup_huggingface_api(api_token: Optional[str] = None) -> str:
    """
    Set up the Hugging Face API for use in the application
    
    Args:
        api_token: Optional API token to use. If not provided, will use the one from environment
        
    Returns:
        The API token that was used for login
    """
    # Add debug prints
    print("DEBUG: Trying to setup Hugging Face API")
    print(f"DEBUG: api_token provided: {api_token is not None}")
    print(f"DEBUG: HF_TOKEN from env module: {HF_TOKEN}")
    print(f"DEBUG: HF_TOKEN from os.environ: {os.environ.get('HF_TOKEN')}")
    
    # Use provided token or get from environment
    hf_token = api_token or HF_TOKEN or os.environ.get("HF_TOKEN")
    print(f"DEBUG: Final hf_token: {hf_token is not None}")
    
    if not hf_token:
        raise ValueError(
            "No Hugging Face API token found. Please provide a token or set the HF_TOKEN environment variable."
        )
    
    # Log in to Hugging Face
    login(token=hf_token)
    
    return hf_token 