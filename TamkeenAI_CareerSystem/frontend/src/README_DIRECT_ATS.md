# Direct ATS Analysis Feature

This feature enables direct connection to the DeepSeek API for resume analysis, bypassing the mock data system.

## Usage

1. Make sure your backend has the DeepSeek API key configured:
   ```bash
   # In your backend directory
   export DEEPSEEK_API_KEY=your_api_key_here
   python app.py
   ```

2. In the Resume Analysis page, you'll now see a "Force DeepSeek" button that will:
   - Clear all mock data flags in local storage
   - Send a direct request to the DeepSeek API
   - Bypass the mock data fallback system
   - Show the real AI analysis results

3. If you're still getting mock data:
   - Check your backend logs for API connection errors
   - Make sure your DeepSeek API key is valid and set properly
   - Test the connection using the "Test Connection" button in settings

## How It Works

The direct ATS feature uses a dedicated utility (ATS.js) that:
1. Sends custom headers to the backend (`X-Force-Real-API` and `X-Skip-Mock`)
2. Makes direct fetch calls instead of using the axios-based API client
3. Explicitly marks requests to avoid the mock data fallback system

This approach ensures a direct connection to the DeepSeek API even when the regular fallback system would normally use mock data. 