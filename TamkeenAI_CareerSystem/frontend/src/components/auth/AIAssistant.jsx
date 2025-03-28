import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Fab,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const AssistantContainer = styled(motion.div)({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1000,
});

const ChatWindow = styled(motion(Paper))(({ theme }) => ({
  position: 'absolute',
  bottom: 80,
  right: 0,
  width: 300,
  height: 400,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(45deg, #00754A 30%, #00A36C 90%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const Message = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1, 2),
  borderRadius: '16px',
  background: isUser ? '#00754A' : '#f0f0f0',
  color: isUser ? 'white' : 'inherit',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1),
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
  },
}));

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const initialMessage = {
    text: isRTL
      ? 'مرحباً! أنا المساعد الذكي لتمكين. كيف يمكنني مساعدتك اليوم؟'
      : 'Hello! I\'m Tamkeen\'s AI Assistant. How can I help you today?',
    isUser: false,
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      // TODO: Implement actual API call to ChatGPT
      const response = await fetch('/api/chatgpt/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          language: isRTL ? 'ar' : 'en',
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { text: data.response, isUser: false },
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: isRTL
            ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
            : 'Sorry, an error occurred. Please try again.',
          isUser: false,
        },
      ]);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <AssistantContainer>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ChatHeader>
              <Avatar sx={{ bgcolor: 'white', color: '#00754A' }}>
                <AIIcon />
              </Avatar>
              <Typography variant="subtitle1">
                {isRTL ? 'المساعد الذكي' : 'AI Assistant'}
              </Typography>
              <IconButton
                size="small"
                sx={{ ml: 'auto', color: 'white' }}
                onClick={() => setIsOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </ChatHeader>

            <ChatMessages>
              {messages.length === 0 && (
                <Message isUser={false}>{initialMessage.text}</Message>
              )}
              {messages.map((message, index) => (
                <Message key={index} isUser={message.isUser}>
                  <Typography variant="body2">{message.text}</Typography>
                </Message>
              ))}
            </ChatMessages>

            <InputContainer>
              <StyledTextField
                fullWidth
                size="small"
                placeholder={
                  isRTL
                    ? 'اكتب رسالتك هنا...'
                    : 'Type your message here...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={4}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <SendIcon />
              </IconButton>
            </InputContainer>
          </ChatWindow>
        )}
      </AnimatePresence>

      <Fab
        color="primary"
        aria-label="AI Assistant"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          background: 'linear-gradient(45deg, #00754A 30%, #00A36C 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00A36C 30%, #00754A 90%)',
          },
        }}
      >
        <AIIcon />
      </Fab>
    </AssistantContainer>
  );
};

export default AIAssistant; 