import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Button,
  Divider,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const AskTamkeenWidget = ({ data }) => {
  // Mock leaderboard data if not provided
  const leaderboard = data?.leaderboard || [
    { id: 1, name: 'Fatima A.', points: 890 },
    { id: 2, name: 'Ahmed M.', points: 780 },
    { id: 3, name: 'Sara K.', points: 650 }
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with "Ask Tamkeen" and help icon */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1
      }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Ask Tamkeen
        </Typography>
        <IconButton size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
      
      {/* Chat interface */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'flex-start',
        mb: 2
      }}>
        {/* Assistant avatar and message */}
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar 
            src="/tamkeen-avatar.png"
            alt="Tamkeen"
            sx={{ 
              width: 36, 
              height: 36, 
              mr: 1,
              bgcolor: 'primary.main'
            }}
          >T</Avatar>
          <Paper
            sx={{
              p: 1.5,
              borderRadius: '4px 12px 12px 12px',
              bgcolor: '#f5f5f5',
              maxWidth: '85%'
            }}
          >
            <Typography variant="body2">
              How can I help you today?
            </Typography>
          </Paper>
        </Box>
        
        {/* Input field */}
        <Box sx={{ 
          display: 'flex', 
          width: '100%',
          mt: 'auto'
        }}>
          <TextField
            placeholder="Type a message..."
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                bgcolor: '#f5f5f5'
              }
            }}
          />
          <IconButton 
            color="primary" 
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Leaderboard section */}
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            label="Career Leaderboard" 
            size="small" 
            color="primary"
            sx={{ fontWeight: 'bold', mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            All Members
          </Typography>
        </Typography>
        
        <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1, mt: 1 }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            size="small"
            sx={{ mb: 1, borderRadius: '20px', textTransform: 'none' }}
          >
            Join the Leaderboard!
          </Button>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
            Climb the ranks to win rewards and gain recognition
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth
            size="small"
            sx={{ borderRadius: '20px', textTransform: 'none' }}
          >
            Start Earning Points
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AskTamkeenWidget; 