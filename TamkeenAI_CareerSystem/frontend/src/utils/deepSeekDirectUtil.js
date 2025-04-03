// DeepSeek Direct Utility
// This file provides direct access to DeepSeek API via OpenRouter when the backend is unavailable

// Base configuration - using OpenRouter as an intermediary for easier API access
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Send a message directly to DeepSeek API via OpenRouter
 * @param {string} message - User message to send
 * @param {string} systemPrompt - System instruction for the AI
 * @param {boolean} isInterviewMode - Whether this is for interview coaching
 * @returns {Promise<Object>} - Response from DeepSeek API or fallback
 */
const sendMessage = async (message, systemPrompt, isInterviewMode = false) => {
  try {
    // Get API key from localStorage
    const apiKey = localStorage.getItem('deepseekApiKey');
    if (!apiKey) {
      console.warn("DeepSeek API key not found. Using fallback response.");
      throw new Error("DeepSeek API key not found. Please add it in settings.");
    }
    
    // Prepare payload for OpenRouter (which supports DeepSeek models)
    const payload = {
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful AI assistant powered by DeepSeek. Answer questions accurately and completely."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: isInterviewMode ? 0.7 : 0.5,
      max_tokens: 1000,
      headers: {
        "HTTP-Referer": window.location.href,
        "X-Title": "TamkeenAI Interview Coach" // Add a title for OpenRouter tracking
      }
    };
    
    console.log("Attempting direct API call to OpenRouter with DeepSeek model");
    
    // Make direct API call via OpenRouter
    const response = await fetch(OPENROUTER_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href, // Required by OpenRouter
        "Origin": window.location.origin
      },
      body: JSON.stringify(payload)
    });
    
    // Handle response
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Successfully received response from DeepSeek via OpenRouter", data);
    
    // Format response to match backend format
    return {
      data: {
        message: data.choices[0].message.content,
        source: "openrouter-direct",
        model: "DeepSeek-AI",
        timestamp: new Date().toISOString()
      },
      status: 200,
      statusText: "OK (Direct API)"
    };
  } catch (error) {
    console.error("Direct API error:", error);
    
    // Provide appropriate fallback
    return {
      data: {
        message: isInterviewMode 
          ? "I apologize, but I'm having trouble connecting to my AI services. Let me provide some general interview advice: Prepare specific examples from your experience that demonstrate key skills, focus on the STAR method (Situation, Task, Action, Result) when answering behavioral questions, and research the company thoroughly before your interview."
          : "I apologize, but I'm having trouble connecting to my knowledge base right now. If you're seeing this message, there may be an issue with the API connection. Please check your API key in settings or try again later.",
        source: "fallback",
        model: "DeepSeek-AI (Offline)",
        timestamp: new Date().toISOString()
      },
      status: 200,
      statusText: "OK (Fallback)"
    };
  }
};

/**
 * Test the DeepSeek API connection via OpenRouter
 * @returns {Promise<Object>} Connection status and test response
 */
const testConnection = async () => {
  try {
    const apiKey = localStorage.getItem('deepseekApiKey');
    if (!apiKey) {
      return { connected: false, message: "API key not found. Please add it in settings." };
    }
    
    console.log("Testing DeepSeek connection via OpenRouter...");
    
    // Make a simple test call via OpenRouter
    const response = await fetch(OPENROUTER_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href,
        "Origin": window.location.origin
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "user", content: "Hello, this is a test message. Please respond with 'Connection successful'." }
        ],
        max_tokens: 20
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Test connection failed:", errorData);
      return { 
        connected: false, 
        message: `Connection failed: ${errorData.error?.message || response.statusText}` 
      };
    }
    
    const data = await response.json();
    console.log("Connection test successful:", data);
    return { 
      connected: true, 
      response: data.choices[0].message.content,
      model: data.model 
    };
  } catch (error) {
    console.error("Connection test error:", error);
    return { 
      connected: false, 
      message: `Connection error: ${error.message}` 
    };
  }
};

/**
 * Save API key to localStorage
 * @param {string} apiKey - The API key to save
 */
const saveApiKey = (apiKey) => {
  if (apiKey) {
    localStorage.setItem('deepseekApiKey', apiKey);
    console.log("DeepSeek API key saved to localStorage");
    return true;
  }
  return false;
};

/**
 * Get the saved API key
 * @returns {string|null} The saved API key or null
 */
const getApiKey = () => {
  return localStorage.getItem('deepseekApiKey');
};

// Export the functions
const DeepSeekDirectUtil = {
  sendMessage,
  testConnection,
  saveApiKey,
  getApiKey
};

export default DeepSeekDirectUtil; 