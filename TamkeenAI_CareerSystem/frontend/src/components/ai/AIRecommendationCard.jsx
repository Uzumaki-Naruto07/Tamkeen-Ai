import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Send as SendIcon, Settings as SettingsIcon, Info as InfoIcon } from '@mui/icons-material';
import { sendMessageWithProvider } from '../../api/chatgpt';

/**
 * AI Recommendation Card Component
 * 
 * Displays an AI-powered recommendation card with multiple provider options
 * (OpenAI, DeepSeek, Llama3, etc) and allows users to get AI-generated recommendations
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.context - Additional context to provide to AI
 * @param {string} props.type - Type of recommendation (career, resume, general)
 * @param {function} props.onResult - Callback when results are received
 * @returns {JSX.Element} - Rendered component
 */
const AIRecommendationCard = ({ 
  title = "AI Recommendations", 
  description = "Get AI-powered recommendations",
  placeholder = "Ask a question or describe what you need help with...",
  context = "",
  type = "general",
  onResult = null
}) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState(() => {
    return localStorage.getItem('ai_provider') || 'openai';
  });
  const [model, setModel] = useState(() => {
    return localStorage.getItem(`ai_model_${localStorage.getItem('ai_provider') || 'openai'}`) || '';
  });
  
  // Map of provider to available models
  const providerModels = {
    openai: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
    ],
    deepseek: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' }
    ],
    llama3: [
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 (8B)' },
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 (70B)' }
    ],
    groq: [
      { id: 'llama3-8b-8192', name: 'Llama 3 (8B) via Groq' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral via Groq' }
    ],
    local: [
      { id: 'local-model', name: 'Local LLM' }
    ]
  };
  
  // Reset model when provider changes
  useEffect(() => {
    // Set default model for provider
    if (providerModels[provider] && providerModels[provider].length > 0) {
      // Get stored model for this provider or use default
      const storedModel = localStorage.getItem(`ai_model_${provider}`);
      if (storedModel && providerModels[provider].some(m => m.id === storedModel)) {
        setModel(storedModel);
      } else {
        setModel(providerModels[provider][0].id);
      }
    } else {
      setModel('');
    }
    
    // Save provider to localStorage
    localStorage.setItem('ai_provider', provider);
  }, [provider]);
  
  // Save model to localStorage when it changes
  useEffect(() => {
    if (model) {
      localStorage.setItem(`ai_model_${provider}`, model);
    }
  }, [model, provider]);
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      // Use the multi-provider sendMessage function
      const result = await sendMessageWithProvider(
        message,
        context,
        type,
        provider,
        model || null
      );
      
      // Update state with response
      setResponse(result.response);
      
      // Call onResult callback if provided
      if (onResult && typeof onResult === 'function') {
        onResult(result);
      }
      
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setResponse('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            {title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setShowSettings(!showSettings)}
            color={showSettings ? "primary" : "default"}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        
        {showSettings && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              AI Provider Settings
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2, mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Provider</InputLabel>
                <Select
                  value={provider}
                  label="Provider"
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <MenuItem value="openai">OpenAI</MenuItem>
                  <MenuItem value="deepseek">DeepSeek</MenuItem>
                  <MenuItem value="llama3">Llama 3 (via OpenRouter)</MenuItem>
                  <MenuItem value="groq">Groq (Fast)</MenuItem>
                  <MenuItem value="local">Local LLM</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Model</InputLabel>
                <Select
                  value={model}
                  label="Model"
                  onChange={(e) => setModel(e.target.value)}
                  disabled={!providerModels[provider] || providerModels[provider].length === 0}
                >
                  {providerModels[provider]?.map(model => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Different AI providers may have different strengths, response times, and token limits.
              </Typography>
            </Box>
          </Box>
        )}
        
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          onClick={handleSend}
          disabled={loading || !message.trim()}
          sx={{ mb: 2 }}
        >
          {loading ? 'Processing...' : 'Get Recommendations'}
        </Button>
        
        {response && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
                  AI Response
                </Typography>
                <Chip 
                  label={provider.charAt(0).toUpperCase() + provider.slice(1)} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {response}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationCard; 