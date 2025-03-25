import matplotlib.pyplot as plt
import io
import base64
from wordcloud import WordCloud
import numpy as np

def generate_word_cloud_base64(text, title="Word Cloud", width=800, height=400, max_words=100):
    """Generate a word cloud image and return as base64 string"""
    # Create word cloud
    wordcloud = WordCloud(
        width=width, 
        height=height, 
        background_color='white',
        max_words=max_words, 
        contour_width=3, 
        contour_color='steelblue'
    ).generate(text)
    
    # Create image
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title(title)
    plt.tight_layout(pad=0)
    
    # Save to bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    
    # Convert to base64
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    
    return img_str

def create_comparison_chart_base64(score, width=800, height=400):
    """Create a bar chart showing ATS compatibility score"""
    plt.figure(figsize=(10, 6))
    plt.barh(["Compatibility Score"], [score], color='steelblue')
    plt.xlim(0, 100)
    plt.text(score + 1, 0, f"{score:.1f}%", va='center')
    plt.title(f"ATS Compatibility Score")
    plt.tight_layout()
    
    # Save to bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    
    # Convert to base64
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    
    return img_str 