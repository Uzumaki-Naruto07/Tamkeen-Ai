import os
from typing import Dict, List, Any, Optional
import requests
from transformers import pipeline
from ..utils.huggingface_utils import setup_huggingface_api
from ..config.env import HF_TOKEN

class HuggingFaceService:
    """Service for interacting with Hugging Face models"""
    
    def __init__(self):
        # Initialize with API token setup
        self.api_token = setup_huggingface_api()
        self.api_url = "https://api-inference.huggingface.co/models"
    
    def query_model(self, model: str, inputs: Any, task: Optional[str] = None) -> Any:
        """
        Query a Hugging Face model through their inference API
        
        Args:
            model: Model name (e.g., "gpt2", "bert-base-uncased")
            inputs: Input data for the model
            task: Optional task type for inference
            
        Returns:
            The model's response
        """
        headers = {"Authorization": f"Bearer {self.api_token}"}
        
        payload = {
            "inputs": inputs,
        }
        
        if task:
            payload["task"] = task
        
        response = requests.post(
            f"{self.api_url}/{model}",
            headers=headers,
            json=payload
        )
        
        return response.json()
    
    def text_classification(self, text: str, model: str = "distilbert-base-uncased-finetuned-sst-2-english") -> List[Dict[str, Any]]:
        """
        Perform text classification using a Hugging Face model
        
        Args:
            text: Text to classify
            model: Model to use for classification
            
        Returns:
            List of classification results with labels and scores
        """
        return self.query_model(model, text, task="text-classification")
    
    def summarization(self, text: str, model: str = "facebook/bart-large-cnn") -> str:
        """
        Summarize text using a Hugging Face model
        
        Args:
            text: Text to summarize
            model: Model to use for summarization
            
        Returns:
            Summarized text
        """
        result = self.query_model(model, text, task="summarization")
        return result[0]["summary_text"] if result and isinstance(result, list) else ""
    
    def question_answering(self, question: str, context: str, model: str = "deepset/roberta-base-squad2") -> Dict[str, Any]:
        """
        Answer a question based on context using a Hugging Face model
        
        Args:
            question: Question to answer
            context: Context to use for answering
            model: Model to use for question answering
            
        Returns:
            Answer with start/end positions and score
        """
        return self.query_model(model, {"question": question, "context": context}, task="question-answering")
    
    def run_local_pipeline(self, task: str, model: str, inputs: Any) -> Any:
        """
        Run a local pipeline using Hugging Face transformers
        This is useful when you want to run inference locally instead of using the API
        
        Args:
            task: Task to perform (e.g., "sentiment-analysis", "summarization")
            model: Model to use
            inputs: Input data
            
        Returns:
            Pipeline results
        """
        pipe = pipeline(task, model=model)
        return pipe(inputs) 