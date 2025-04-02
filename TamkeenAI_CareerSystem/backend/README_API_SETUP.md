# DeepSeek API Setup Guide

## Why Configure DeepSeek API?

The TamkeenAI Career System uses DeepSeek, a powerful AI model, to provide accurate resume analysis and job matching. Without a valid API key, the system falls back to basic keyword matching and simulated results.

## Steps to Configure DeepSeek API

1. **Register for an API Key**:
   - Go to [OpenRouter.ai](https://openrouter.ai/)
   - Create an account and navigate to the API Keys section
   - Generate a new API key

2. **Set Up the Environment Variable**:
   
   ### Option 1: Using .env file (Recommended for development)
   Create a `.env` file in the backend directory:
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```

   ### Option 2: Direct environment variable
   - **Linux/Mac**:
     ```bash
     export DEEPSEEK_API_KEY=your_api_key_here
     python app.py
     ```
   
   - **Windows Command Prompt**:
     ```cmd
     set DEEPSEEK_API_KEY=your_api_key_here
     python app.py
     ```
   
   - **Windows PowerShell**:
     ```powershell
     $env:DEEPSEEK_API_KEY="your_api_key_here"
     python app.py
     ```

3. **Restart the Backend Server**:
   - Stop any running instances of the backend server
   - Start the server again to apply the new configuration

## Verifying Setup

After configuring the API key, you can verify it's working by:

1. Uploading a resume and checking for the "Using simulated data" warning - it should no longer appear
2. Checking the backend logs for calls to the DeepSeek API

## Troubleshooting

If you see the "Using simulated data" warning after configuring the API key:

1. Verify the environment variable is set correctly
2. Check the backend logs for any API connection errors
3. Ensure your API key is valid and has not exceeded usage limits
4. Try clearing your browser cache and local storage
5. Restart both the frontend and backend applications

For further assistance, please contact support.
