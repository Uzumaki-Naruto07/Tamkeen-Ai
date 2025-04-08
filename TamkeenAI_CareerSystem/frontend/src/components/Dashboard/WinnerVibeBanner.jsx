import React, { useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const WinnerVibeBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';
  const controls = useAnimation();

  // Animation variants for background - different colors for dark/light modes
  const backgroundVariants = {
    animate: {
      background: isDarkMode 
        ? [
            'linear-gradient(135deg, #1a2151 0%, #0d1b3e 50%, #263570 100%)',
            'linear-gradient(135deg, #263570 0%, #1a2151 50%, #0d1b3e 100%)',
            'linear-gradient(135deg, #0d1b3e 0%, #263570 50%, #1a2151 100%)',
            'linear-gradient(135deg, #1a2151 0%, #0d1b3e 50%, #263570 100%)'
          ]
        : [
            'linear-gradient(135deg, #0a2e5c 0%, #041e42 50%, #0a3875 100%)',
            'linear-gradient(135deg, #0a3875 0%, #0a2e5c 50%, #041e42 100%)',
            'linear-gradient(135deg, #041e42 0%, #0a3875 50%, #0a2e5c 100%)',
            'linear-gradient(135deg, #0a2e5c 0%, #041e42 50%, #0a3875 100%)'
          ],
      transition: {
        duration: 15,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  // Define more vibrant colorful circle backgrounds - adjusted for both modes
  const circleColors = [
    'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', // Gold to Orange
    'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', // Green
    'linear-gradient(135deg, #F44336 0%, #E91E63 100%)', // Red to Pink
    'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)', // Blue
    'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', // Purple
    'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)'  // Orange to Deep Orange
  ];

  // Animation for floating particles
  const particleVariants = {
    animate: (i) => ({
      y: [0, -10, 0],
      x: [0, i % 2 === 0 ? 5 : -5, 0],
      opacity: [0.5, 0.9, 0.5], // Increased opacity for better visibility
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1], // Increased scale
      transition: {
        duration: 4 + (i * 0.5),
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
        delay: i * 0.2
      }
    })
  };

  // Trophy animation - enhanced with pulse effect
  const trophyVariants = {
    animate: {
      rotate: [-5, 5, -5],
      scale: [1, 1.08, 1],
      filter: [
        'drop-shadow(0 0 12px rgba(255,215,0,0.6))',
        'drop-shadow(0 0 18px rgba(255,215,0,0.8))',
        'drop-shadow(0 0 12px rgba(255,215,0,0.6))'
      ],
      transition: {
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  // Staggered entry animation for the content
  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.5 
      }
    }));
  }, [controls]);

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={3}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        background: isDarkMode ? '#1a2151' : '#0a2e5c', // Dark blue in light mode
        color: '#fff', // Always white text for better contrast
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        height: 'auto',
        minHeight: { xs: '180px', sm: '200px', md: '220px', lg: '240px' },
        // Add max-height to prevent banner from becoming too tall on large screens
        maxHeight: { xs: '350px', sm: '300px', md: '280px', lg: '300px' },
        boxShadow: isDarkMode 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 20, 50, 0.3)'
      }}
    >
      {/* Animated background */}
      <Box
        component={motion.div}
        variants={backgroundVariants}
        animate="animate"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}
      />
      
      {/* Animated particles - now with enhanced gradient colors and glow effects */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          custom={i}
          variants={particleVariants}
          animate="animate"
          sx={{
            position: 'absolute',
            width: theme.spacing(i % 3 === 0 ? 3 : i % 3 === 1 ? 4 : 2.5),
            height: theme.spacing(i % 3 === 0 ? 3 : i % 3 === 1 ? 4 : 2.5),
            borderRadius: '50%',
            background: circleColors[i % circleColors.length],
            boxShadow: `0 0 15px ${circleColors[i % circleColors.length].split(' ')[2].replace('100%)', '70%)')}`,
            top: `${10 + (i * 10)}%`,
            left: `${5 + (i * 10)}%`,
            zIndex: 1,
            filter: 'blur(0px)', // Removed blur for sharper circles
            opacity: 0.85, // Increased base opacity
            transform: 'translateZ(0)' // Performance optimization
          }}
        />
      ))}

      {/* Trophy with enhanced golden color and animation */}
      <Box 
        component={motion.div}
        variants={trophyVariants}
        animate="animate"
        sx={{ 
          position: 'absolute', 
          top: { xs: '-20px', sm: '-25px', md: '-30px' }, 
          right: { xs: '-20px', sm: '-25px', md: '-30px' }, 
          fontSize: { xs: '140px', sm: '170px', md: '200px', lg: '220px' }, 
          opacity: 0.6, // Increased opacity
          zIndex: 1,
          transformOrigin: 'center'
        }}
      >
        <EmojiEventsIcon 
          fontSize="inherit" 
          sx={{ 
            color: '#FFD700', // Pure gold color
            background: 'linear-gradient(135deg, #FFD700 10%, #F4A460 50%, #DAA520 100%)', // Gold gradient
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))' // Strong golden glow
          }} 
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        justifyContent: 'space-between',
        gap: { xs: 2, sm: 3 },
        height: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <Box 
          component={motion.div}
          custom={0}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          sx={{ 
            flex: 1, 
            mr: isMobile ? 0 : 3, 
            mb: isMobile ? 2 : 0,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: '#FFD700', // Gold color for Winner Vibe text
              display: 'flex',
              alignItems: 'center',
              fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.9rem', lg: '2.1rem' },
              textShadow: '0 2px 8px rgba(0,0,0,0.4)', // Enhanced shadow
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', // Gold gradient
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            <FormatQuoteIcon 
              sx={{ 
                mr: 1, 
                transform: 'rotate(180deg)', 
                color: '#FFA500',
                animation: 'pulse 2s infinite alternate',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7, transform: 'scale(0.95) rotate(180deg)' },
                  '100%': { opacity: 1, transform: 'scale(1.05) rotate(180deg)' }
                }
              }} 
            />
            Winner Vibe
            <FormatQuoteIcon 
              sx={{ 
                ml: 1, 
                color: '#FFA500',
                animation: 'pulse 2s infinite alternate',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7, transform: 'scale(0.95)' },
                  '100%': { opacity: 1, transform: 'scale(1.05)' }
                }
              }} 
            />
          </Typography>

          <Box 
            component={motion.div}
            custom={1}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            sx={{ mb: 2 }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold',
                color: '#fff',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem', lg: '1.3rem' },
                fontStyle: 'italic',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}
            >
              "We, as Emiratis, do not accept anything less than first place."
            </Typography>
            <Typography 
              variant="body2" 
              color="rgba(255, 255, 255, 0.85)"
              sx={{ fontSize: { xs: '0.8rem', md: '0.9rem', lg: '1rem' } }}
            >
              — H.H. Sheikh Mohammed bin Rashid Al Maktoum
            </Typography>
          </Box>

          <Divider sx={{ 
            my: 1.5,
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }} />

          <Box 
            component={motion.div}
            custom={2}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            sx={{ 
              mt: 2, 
              textAlign: 'right',
              display: { xs: isTablet ? 'none' : 'block', md: 'block' } // Hide on very small screens
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold', 
                fontFamily: 'Noto Kufi Arabic, Arial',
                color: '#fff',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' },
                fontStyle: 'italic',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}
            >
              "نحن كإماراتيين، لا نقبل بأقل من المركز الأول."
            </Typography>
            <Typography 
              variant="body2" 
              color="rgba(255, 255, 255, 0.85)" 
              sx={{ 
                fontFamily: 'Noto Kufi Arabic, Arial',
                fontSize: { xs: '0.75rem', md: '0.875rem', lg: '0.95rem' }
              }}
            >
              — صاحب السمو الشيخ محمد بن راشد آل مكتوم
            </Typography>
          </Box>
        </Box>

        <Box 
          component={motion.div}
          custom={3}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          sx={{ 
            flex: isMobile ? 1 : 0.3, 
            p: { xs: 1.5, sm: 2 },
            bgcolor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.3)', // Subtle border
            position: 'relative',
            zIndex: 2,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '100%', sm: '280px', md: '320px', lg: '360px' },
            backdropFilter: 'blur(8px)',
            transform: 'translateZ(0)', // Hardware acceleration
            animation: 'shine 6s infinite',
            '@keyframes shine': {
              '0%': { boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
              '50%': { boxShadow: '0 4px 25px rgba(255,215,0,0.3)' },
              '100%': { boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }
            }
          }}
        >
          <Typography 
            variant="body1" 
            paragraph 
            mb={1}
            sx={{ 
              color: '#fff',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' },
              fontWeight: 'medium',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            <Box component="span" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #FFF 0%, #E6E6E6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none'
            }}>
              Tamkeen AI
            </Box> represents the future of career empowerment in the UAE.
          </Typography>
          <Typography 
            variant="body2" 
            color="rgba(255, 255, 255, 0.85)" 
            sx={{ 
              fontFamily: 'Noto Kufi Arabic, Arial', 
              textAlign: 'right',
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem', lg: '0.95rem' }
            }}
          >
            تمكين للذكاء الاصطناعي يمثل مستقبل التمكين الوظيفي في دولة الإمارات العربية المتحدة
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WinnerVibeBanner; 