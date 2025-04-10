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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

const WinnerVibeBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const controls = useAnimation();

  // Background animation with more colors
  const backgroundVariants = {
    animate: {
      background: [
        'linear-gradient(135deg, #3a8daa 0%, #60a5b9 50%, #86bac7 100%)',
        'linear-gradient(135deg, #4a7fa0 0%, #5ba3c2 50%, #7dcef4 100%)',
        'linear-gradient(135deg, #417693 0%, #69b8d6 50%, #97d4e8 100%)',
        'linear-gradient(135deg, #3a8daa 0%, #60a5b9 50%, #86bac7 100%)',
      ],
      transition: {
        duration: 10,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  // Colorful dot variants
  const dotColors = [
    'rgba(255, 255, 255, 0.4)',
    'rgba(255, 236, 179, 0.3)', // Light yellow
    'rgba(209, 233, 252, 0.4)', // Light blue
    'rgba(226, 245, 233, 0.35)', // Light green
    'rgba(252, 228, 236, 0.3)', // Light pink
    'rgba(225, 245, 254, 0.4)', // Sky blue
  ];

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
        p: { xs: 2.5, sm: 3, md: 3.5 },
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #3a8daa 0%, #60a5b9 50%, #86bac7 100%)',
        color: '#fff',
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        height: 'auto',
        minHeight: { xs: '240px', sm: '270px', md: '290px', lg: '320px' },
        maxHeight: { xs: '420px', sm: '390px', md: '370px', lg: '420px' },
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)'
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
      
      {/* Moving gradient overlay */}
      <Box
        component={motion.div}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          transition: {
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.5) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.5) 0%, transparent 50%)',
          backgroundSize: '100% 100%',
          zIndex: 0
        }}
      />
      
      {/* Background pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.07,
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
          backgroundSize: '100px 100px',
          zIndex: 1
        }}
      />
      
      {/* Animated light beam */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 360],
          scale: [0.8, 1.2, 0.8],
          transition: {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '300%',
          height: '200%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }}
      />
      
      {/* Animated corners */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          width: ['20px', '25px', '20px'],
          height: ['20px', '25px', '20px'],
          transition: { duration: 3, repeat: Infinity }
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          borderTop: '2px solid rgba(255,255,255,0.5)',
          borderLeft: '2px solid rgba(255,255,255,0.5)',
          zIndex: 1
        }}
      />
      <Box
        component={motion.div}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          width: ['20px', '25px', '20px'],
          height: ['20px', '25px', '20px'],
          transition: { duration: 3, repeat: Infinity, delay: 0.5 }
        }}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          borderTop: '2px solid rgba(255,255,255,0.5)',
          borderRight: '2px solid rgba(255,255,255,0.5)',
          zIndex: 1
        }}
      />
      <Box
        component={motion.div}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          width: ['20px', '25px', '20px'],
          height: ['20px', '25px', '20px'],
          transition: { duration: 3, repeat: Infinity, delay: 1 }
        }}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          borderBottom: '2px solid rgba(255,255,255,0.5)',
          borderLeft: '2px solid rgba(255,255,255,0.5)',
          zIndex: 1
        }}
      />
      <Box
        component={motion.div}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          width: ['20px', '25px', '20px'],
          height: ['20px', '25px', '20px'],
          transition: { duration: 3, repeat: Infinity, delay: 1.5 }
        }}
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          borderBottom: '2px solid rgba(255,255,255,0.5)',
          borderRight: '2px solid rgba(255,255,255,0.5)',
          zIndex: 1
        }}
      />
      
      {/* Rainbow accent at top with enhanced animation */}
      <Box
        component={motion.div}
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          height: ['3px', '4px', '3px'],
          opacity: [0.9, 1, 0.9],
          transition: { 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear",
            height: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            },
            opacity: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          background: 'linear-gradient(90deg, #f6d365, #fda085, #f5576c, #4dabf5, #43e97b, #f6d365)',
          backgroundSize: '400% 100%',
          zIndex: 1
        }}
      />
      
      {/* Pulsing light effect */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0, 0.1, 0],
          scale: [0.8, 1.2, 0.8],
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}
      />
      
      {/* Additional pulsing effect */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0, 0.1, 0],
          scale: [0.8, 1.2, 0.8],
          transition: {
            duration: 5,
            delay: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,181,246,0.3) 0%, rgba(100,181,246,0) 70%)',
          zIndex: 1
        }}
      />
      
      {/* Enhanced floating dots - more dots */}
      {[...Array(18)].map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          animate={{
            y: [0, i % 3 === 0 ? -18 : i % 3 === 1 ? -12 : -15, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
            opacity: [0.3, i % 2 === 0 ? 0.7 : 0.6, 0.3],
            scale: [1, 1.1, 1],
            filter: i % 3 === 0 ? ['blur(1px)', 'blur(1.5px)', 'blur(1px)'] : ['blur(1px)', 'blur(0.8px)', 'blur(1px)'],
            transition: {
              duration: 3 + (i % 4),
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.15
            }
          }}
          sx={{
            position: 'absolute',
            width: theme.spacing(i % 5 === 0 ? 2.2 : i % 5 === 1 ? 1.8 : i % 5 === 2 ? 1.2 : i % 5 === 3 ? 0.9 : 1.5),
            height: theme.spacing(i % 5 === 0 ? 2.2 : i % 5 === 1 ? 1.8 : i % 5 === 2 ? 1.2 : i % 5 === 3 ? 0.9 : 1.5),
            borderRadius: '50%',
            background: dotColors[i % dotColors.length],
            top: `${5 + (i * 5) % 90}%`,
            left: `${2 + (i * 6) % 95}%`,
            zIndex: 1
          }}
        />
      ))}
      
      {/* Enhanced rotating stars */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={`star-${i}`}
          component={motion.div}
          animate={{
            rotate: [0, 360],
            scale: [0.9, 1.2, 0.9],
            opacity: [0.5, 0.8, 0.5],
            filter: ['drop-shadow(0 0 2px rgba(255,215,0,0.3))', 'drop-shadow(0 0 4px rgba(255,215,0,0.5))', 'drop-shadow(0 0 2px rgba(255,215,0,0.3))'],
            transition: {
              rotate: { duration: 8 + i, repeat: Infinity, ease: "linear" },
              scale: { duration: 3 + (i % 2), repeat: Infinity, repeatType: "reverse" },
              opacity: { duration: 3 + (i % 2), repeat: Infinity, repeatType: "reverse" },
              filter: { duration: 3 + (i % 2), repeat: Infinity, repeatType: "reverse" }
            }
          }}
          sx={{
            position: 'absolute',
            fontSize: theme.spacing(i % 3 === 0 ? 1.4 : i % 3 === 1 ? 1.1 : 0.9),
            color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFC107' : '#FFECB3',
            top: `${15 + ((i * 15) % 75)}%`,
            right: `${5 + ((i * 3) % 30)}%`,
            zIndex: 1
          }}
        >
          <StarIcon fontSize="inherit" />
        </Box>
      ))}
      
      {/* Additional decorative icons */}
      <Box
        component={motion.div}
        animate={{
          rotate: [0, 10, -10, 0],
          y: [0, -5, 0],
          opacity: [0.4, 0.7, 0.4],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '1.2rem',
          zIndex: 1
        }}
      >
        <LightbulbIcon fontSize="inherit" />
      </Box>
      
      <Box
        component={motion.div}
        animate={{
          rotate: [0, -5, 5, 0],
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        sx={{
          position: 'absolute',
          top: '20%',
          left: '12%',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '1rem',
          zIndex: 1
        }}
      >
        <ElectricBoltIcon fontSize="inherit" />
      </Box>
      
      {/* Enhanced Trophy icon with pulse and movement */}
      <Box 
        component={motion.div}
        animate={{ 
          y: [0, -8, 4, -5, 0],
          x: [0, 3, -3, 3, 0],
          rotate: [0, 1.5, -1.5, 1.5, 0],
          scale: [1, 1.03, 0.97, 1.03, 1],
          filter: [
            'drop-shadow(0 0 8px rgba(255,215,0,0.5))',
            'drop-shadow(0 0 15px rgba(255,215,0,0.7))',
            'drop-shadow(0 0 10px rgba(255,215,0,0.6))',
            'drop-shadow(0 0 15px rgba(255,215,0,0.7))',
            'drop-shadow(0 0 8px rgba(255,215,0,0.5))',
          ],
          transition: { 
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
          }
        }}
        sx={{ 
          position: 'absolute', 
          top: { xs: '30%', sm: '25%', md: '22%' }, 
          right: { xs: '40%', sm: '35%', md: '38%' }, 
          fontSize: { xs: '160px', sm: '220px', md: '280px' }, 
          opacity: 0.25,
          zIndex: 1,
          transform: 'rotate(15deg)'
        }}
      >
        {/* Trophy glow effect */}
        <Box
          component={motion.div}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.85, 0.95, 0.85],
            transition: {
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.1) 60%, rgba(255,215,0,0) 80%)',
            filter: 'blur(8px)',
            zIndex: -1
          }}
        />
        
        <EmojiEventsIcon 
          fontSize="inherit" 
          sx={{ 
            color: '#FFD700',
            filter: 'contrast(1.1) brightness(1.05)'
          }} 
        />
        
        {/* Trophy sparkles */}
        {[...Array(4)].map((_, i) => (
          <Box
            key={`trophy-sparkle-${i}`}
            component={motion.div}
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.5, 1, 0.5],
              x: [0, (i % 2 === 0 ? 10 : -10) * Math.sin(i * Math.PI/2), 0],
              y: [0, -10 * Math.cos(i * Math.PI/2), 0],
              transition: {
                duration: 1.5 + (i % 2),
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }
            }}
            sx={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 0 8px #FFD700',
              zIndex: 2
            }}
          />
        ))}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 2,
        justifyContent: 'space-between',
        gap: { xs: 2, sm: 3 },
        height: '100%',
        maxWidth: '100%',
        overflow: 'visible'
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              position: 'relative'
            }}
          >
            {/* Enhanced sparkle icon */}
            <Box
              component={motion.div}
              animate={{
                rotate: [0, 20, -20, 0],
                scale: [1, 1.2, 0.9, 1],
                opacity: [0.7, 1, 0.7],
                filter: ['drop-shadow(0 0 2px rgba(255,215,0,0.5))', 'drop-shadow(0 0 5px rgba(255,215,0,0.8))', 'drop-shadow(0 0 2px rgba(255,215,0,0.5))'],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              sx={{
                position: 'absolute',
                left: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#FFD700',
                fontSize: '1.6rem',
                zIndex: 1
              }}
            >
              <AutoAwesomeIcon fontSize="inherit" />
            </Box>
            
            {/* Text with letter animation */}
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '1.2rem', sm: '1.35rem', md: '1.5rem', lg: '1.7rem' },
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                color: '#000',
                position: 'relative'
              }}
            >
              Winner Vibe
            </Typography>
          </Box>

          <Box 
            component={motion.div}
            custom={1}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            sx={{ mb: 2 }}
          >
            {/* Enhanced text animations */}
            <Typography 
              component={motion.p}
              animate={{
                y: [0, -3, 0],
                x: [0, 1, 0],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold',
                color: '#000',
                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
                fontStyle: 'italic',
                mb: 1,
                lineHeight: 1.5,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              "We are a nation that settles for nothing less than first place."
            </Typography>
            <Typography 
              component={motion.p}
              animate={{
                y: [0, -3, 0],
                x: [0, -1, 0],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }
              }}
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold',
                color: '#00264d',
                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
                fontStyle: 'italic',
                mb: 1,
                lineHeight: 1.5,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              "From Zayed and Rashid, we learned that glory belongs to those who pursue it, and the highest ranks are attained by those who accept nothing short of excellence."
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#000',
                fontSize: { xs: '0.7rem', md: '0.75rem', lg: '0.8rem' },
                mt: 0.5,
                textShadow: '0 1px 1px rgba(0,0,0,0.2)'
              }}
            >
              — H.H. Sheikh Mohammed bin Rashid Al Maktoum
            </Typography>
          </Box>

          {/* Enhanced divider with glow */}
          <Divider 
            component={motion.div}
            animate={{
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              boxShadow: [
                '0 0 5px rgba(255,255,255,0.3)',
                '0 0 10px rgba(255,255,255,0.5)',
                '0 0 5px rgba(255,255,255,0.3)'
              ],
              height: ['1px', '1.5px', '1px'],
              transition: {
                duration: 7,
                repeat: Infinity,
                ease: "linear",
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                },
                height: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }
            }}
            sx={{ 
              my: 1.5,
              borderColor: 'transparent',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 100%)',
              backgroundSize: '200% 100%'
            }} 
          />

          <Box 
            component={motion.div}
            custom={2}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            sx={{ 
              mt: 1.5, 
              textAlign: 'right',
              display: 'block'
            }}
          >
            <Typography 
              component={motion.p}
              animate={{
                y: [0, -3, 0],
                x: [0, 2, 0],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 2
                }
              }}
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold', 
                fontFamily: '"Amiri", "Noto Kufi Arabic", "Traditional Arabic", Arial',
                color: '#00264d',
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem', lg: '1.05rem' },
                mb: 1,
                lineHeight: 1.7,
                letterSpacing: '0.02em',
                direction: 'rtl',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                wordSpacing: '0.05em'
              }}
            >
              «نحن شعب لا يرضى بغير المركز الأول»، «وتعلمنا من زايد وراشد أن المجد لمن يطلبه، والمراكز الأولى لمن لا يرضى بغيرها».
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: '"Amiri", "Noto Kufi Arabic", "Traditional Arabic", Arial',
                color: '#000',
                fontSize: { xs: '0.75rem', md: '0.8rem', lg: '0.85rem' },
                direction: 'rtl',
                lineHeight: 1.6,
                fontWeight: 'bold',
                letterSpacing: '0.01em',
                textShadow: '0 1px 1px rgba(0,0,0,0.2)'
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
          whileHover={{ 
            scale: 1.03,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: { duration: 0.3 }
          }}
          sx={{ 
            flex: isMobile ? 1 : 0.3, 
            p: { xs: 1.5, sm: 2 },
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.15) 100%)',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.3)',
            position: 'relative',
            zIndex: 2,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '100%', sm: '260px', md: '290px', lg: '320px' },
            mt: isMobile ? 0 : 6,
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 2,
              padding: '1px',
              background: 'linear-gradient(90deg, #4dabf5 0%, #43e97b 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none'
            }
          }}
        >
          {/* Enhanced shine effect */}
          <Box
            component={motion.div}
            animate={{
              left: ['-100%', '200%'],
              width: ['40%', '60%', '40%'],
              opacity: [0.5, 0.7, 0.5],
              transition: {
                duration: 3,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
                width: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                },
                opacity: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transform: 'skewX(-20deg)',
              zIndex: 2
            }}
          />
          
          <Typography 
            variant="body1" 
            component={motion.p}
            animate={{
              y: [0, -2, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            paragraph 
            mb={1.5}
            sx={{ 
              color: '#00264d',
              fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem', lg: '0.95rem' },
              fontWeight: 'bold',
              lineHeight: 1.6,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            <Box 
              component="span"
              sx={{ 
                fontWeight: 'bold',
                color: '#00264d',
              }}
            >
              Tamkeen AI
            </Box> represents the future of career empowerment in the UAE.
          </Typography>
          <Typography 
            variant="body2" 
            component={motion.p}
            animate={{
              y: [0, -2, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }
            }}
            sx={{ 
              fontFamily: '"Amiri", "Noto Kufi Arabic", "Traditional Arabic", Arial',
              textAlign: 'right',
              color: '#000',
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem', lg: '0.9rem' },
              lineHeight: 1.6,
              direction: 'rtl',
              letterSpacing: '0.01em',
              fontWeight: 'bold',
              textShadow: '0 1px 1px rgba(0,0,0,0.2)'
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