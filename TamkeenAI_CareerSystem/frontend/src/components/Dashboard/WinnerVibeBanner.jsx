import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const WinnerVibeBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={3}
      sx={{
        p: 3,
        background: 'linear-gradient(90deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          fontSize: '180px', 
          opacity: 0.05,
          color: '#000'
        }}
      >
        <EmojiEventsIcon fontSize="inherit" />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
        <Box sx={{ flex: 1, mr: isMobile ? 0 : 3, mb: isMobile ? 2 : 0 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FormatQuoteIcon sx={{ mr: 1, transform: 'rotate(180deg)' }} />
            Winner Vibe
            <FormatQuoteIcon sx={{ ml: 1 }} />
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              "We, as Emiratis, do not accept anything less than first place."
            </Typography>
            <Typography variant="body2" color="textSecondary">
              — H.H. Sheikh Mohammed bin Rashid Al Maktoum
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily: 'Noto Kufi Arabic, Arial' }}>
              "نحن كإماراتيين، لا نقبل بأقل من المركز الأول."
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Noto Kufi Arabic, Arial' }}>
              — صاحب السمو الشيخ محمد بن راشد آل مكتوم
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          flex: isMobile ? 1 : 0.3, 
          p: 1.5, 
          bgcolor: 'rgba(255, 255, 255, 0.8)', 
          borderRadius: 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="body1" paragraph mb={1}>
            <b>Tamkeen AI</b> represents the future of career empowerment in the UAE.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Noto Kufi Arabic, Arial', textAlign: 'right' }}>
            تمكين للذكاء الاصطناعي يمثل مستقبل التمكين الوظيفي في دولة الإمارات العربية المتحدة
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WinnerVibeBanner; 