# Local AI Chatbot with Ollama & DeepSeek

This component allows you to run a local AI chatbot powered by DeepSeek LLM via Ollama, providing a self-hosted AI assistant within the TamkeenAI Career System.

## Features

- Real-time chat with DeepSeek LLM
- 100% local execution - no external API calls
- Thinking & typing indicators
- Seamlessly integrated with MUI components
- Stream responses as they are generated

## Setup Instructions

### 1. Install Ollama

First, you need to install Ollama on your machine:

- **Mac**: Run `brew install ollama`
- **Windows**: Download from [ollama.com](https://ollama.com)
- **Linux**: Follow instructions on [ollama.com](https://ollama.com)

### 2. Pull & Run the DeepSeek Model

After installing Ollama, open a terminal/command prompt and run:

```bash
# Pull the DeepSeek model (approximately 1.8GB download)
ollama pull deepseek-r1:1.5b

# Start the Ollama server
ollama serve
```

This will make Ollama available at `http://127.0.0.1:11434/api/chat`

### 3. Usage in the Application

The local DeepSeek chatbot is now available in the AI Interview Coach. Simply:

1. Navigate to the AI Interview Coach page
2. Switch to the "Local DeepSeek Chatbot" tab
3. Start chatting with the local LLM

### 4. CORS Proxy Setup (If Needed)

If you encounter CORS errors when connecting to API endpoints, use our Express proxy server:

```bash
# Navigate to the frontend directory
cd TamkeenAI_CareerSystem/frontend

# Start the Express proxy server
npm run express-proxy
```

The proxy server will run on port 8000 and automatically forward requests to the backend API. For more details on CORS solutions, see the main README.md in the frontend directory.

## Troubleshooting

- **Connection Errors**: Make sure the Ollama server is running with `ollama serve`
- **Model Not Found**: Verify you have pulled the model with `ollama list`
- **Slow Responses**: DeepSeek-r1:1.5b is optimized for lower-spec machines, but still requires decent hardware
- **CORS Errors**: Run the Express proxy server with `npm run express-proxy`

## Advanced Configuration

To use a different model, edit the `OllamaDeepSeekChatbot.jsx` file and change the model parameter in the fetch request:

```jsx
body: JSON.stringify({
  model: "deepseek-r1:1.5b", // Change to any other Ollama model
  messages: [...messages, userMessage],
  stream: true,
}),
```

Available models include:
- llama3:8b
- gemma:2b
- mistral:7b
- phi3:mini

View all available models with `ollama list` or explore more at [ollama.com/library](https://ollama.com/library) 