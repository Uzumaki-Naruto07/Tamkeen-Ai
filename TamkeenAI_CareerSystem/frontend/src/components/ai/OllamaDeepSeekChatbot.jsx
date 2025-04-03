import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';

/**
 * OllamaDeepSeekChatbot - A component for chatting with a local Ollama DeepSeek model
 */
const OllamaDeepSeekChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const endOfMessagesRef = useRef(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: inputValue,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    
    try {
      // Create a placeholder for the AI response
      const placeholderId = Date.now().toString();
      setMessages((prev) => [...prev, { role: 'assistant', content: '', id: placeholderId }]);
      
      // Stream response from Ollama API
      const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b",
          messages: [...messages, userMessage],
          stream: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = '';
      
      setIsThinking(false);
      setIsTyping(true);
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const parsedLine = JSON.parse(line);
            if (parsedLine.message?.content) {
              aiResponseText += parsedLine.message.content;
              // Update the last message with the accumulated text
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === placeholderId 
                    ? { ...msg, content: aiResponseText } 
                    : msg
                )
              );
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }
      
      setIsTyping(false);
      
    } catch (err) {
      console.error("Error communicating with Ollama:", err);
      setError("Failed to connect to Ollama server. Make sure Ollama is running with the deepseek-r1:1.5b model.");
      setIsThinking(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: '#2575fc',
          textAlign: 'center'
        }}
      >
        Local DeepSeek Chatbot
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 3,
          textAlign: 'center',
          color: 'text.secondary'
        }}
      >
        Chat with DeepSeek LLM running 100% locally via Ollama
      </Typography>

      {error && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 2, 
            bgcolor: 'error.light', 
            color: 'error.dark',
            borderRadius: 2
          }}
        >
          {error}
        </Paper>
      )}

      {/* Chat messages container */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          height: "50vh", 
          overflowY: "auto",
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message, index) => (
          <Box 
            key={index} 
            sx={{
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              mb: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '80%',
                bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                color: message.role === 'user' ? 'white' : 'text.primary',
                borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              }}
            >
              {message.content || (
                <CircularProgress size={20} />
              )}
            </Paper>
          </Box>
        ))}
        
        {isThinking && (
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, alignSelf: 'flex-start' }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Thinking...
            </Typography>
          </Box>
        )}
        
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, alignSelf: 'flex-start' }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Typing...
            </Typography>
          </Box>
        )}
        
        <div ref={endOfMessagesRef} />
      </Paper>

      {/* Input area */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isThinking || isTyping}
            multiline
            maxRows={4}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!inputValue.trim() || isThinking || isTyping}
            onClick={sendMessage}
            startIcon={<Send />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OllamaDeepSeekChatbot; 