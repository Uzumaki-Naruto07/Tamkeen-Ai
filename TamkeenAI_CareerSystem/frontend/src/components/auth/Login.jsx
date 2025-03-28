import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Apple as AppleIcon,
  GitHub as GitHubIcon,
  Person as GuestIcon,
  Face as FaceIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  AccessibilityNew as AccessibilityIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UAEBackground from './UAEBackground';
import AIAssistant from './AIAssistant';

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const LogoContainer = styled(motion.div)({
  marginBottom: '2rem',
  textAlign: 'center',
});

const Logo = styled('img')({
  width: '120px',
  height: 'auto',
  marginBottom: '1rem',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px',
  position: 'relative',
  zIndex: 1,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#E2C275',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00754A',
      boxShadow: '0 0 0 2px rgba(0, 117, 74, 0.2)',
    },
  },
  marginBottom: theme.spacing(2),
  width: '100%',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #00754A 30%, #00A36C 90%)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  width: '100%',
  marginBottom: theme.spacing(2),
  '&:hover': {
    background: 'linear-gradient(45deg, #00A36C 30%, #00754A 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 117, 74, 0.3)',
  },
}));

const OAuthButton = styled(Button)(({ theme, variant }) => ({
  width: '100%',
  marginBottom: theme.spacing(1),
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 16px',
  ...(variant === 'outlined' && {
    borderColor: '#00754A',
    color: '#00754A',
    '&:hover': {
      borderColor: '#00A36C',
      backgroundColor: 'rgba(0, 117, 74, 0.04)',
    },
  }),
}));

const LanguageToggle = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.95)',
  },
}));

const QuoteContainer = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(4),
  textAlign: 'center',
  color: '#242424',
  maxWidth: '600px',
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '8px',
  backdropFilter: 'blur(5px)',
}));

const BackgroundAnimation = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  overflow: 'hidden',
});

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    // Auto-detect language
    const userLang = navigator.language;
    if (userLang.startsWith('ar')) {
      i18n.changeLanguage('ar');
      setIsRTL(true);
    }
  }, [i18n]);

  const handleLanguageToggle = () => {
    const newLang = isRTL ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    setIsRTL(!isRTL);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Implement login logic here
    navigate('/dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <StyledContainer>
      <UAEBackground />
      
      <LanguageToggle onClick={handleLanguageToggle}>
        <FlagIcon sx={{ color: isRTL ? '#00754A' : '#E2C275' }} />
      </LanguageToggle>

      <LogoContainer
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Logo src="/logo.png" alt="Tamkeen AI" />
        <Typography variant="h4" component="h1" gutterBottom>
          {isRTL ? 'تمكين' : 'Tamkeen AI'}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {isRTL
            ? 'منصة الذكاء الوظيفي'
            : 'Empowering Emirati Talent with AI'}
        </Typography>
      </LogoContainer>

      <StyledPaper
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ width: '100%' }}
        >
          <motion.div variants={itemVariants}>
            <StyledTextField
              label={isRTL ? 'البريد الإلكتروني' : 'Email'}
              variant="outlined"
              fullWidth
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StyledTextField
              label={isRTL ? 'كلمة المرور' : 'Password'}
              type="password"
              variant="outlined"
              fullWidth
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
            >
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </StyledButton>
          </motion.div>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {isRTL ? 'أو' : 'or'}
            </Typography>
          </Divider>

          <motion.div variants={itemVariants}>
            <OAuthButton
              startIcon={<GoogleIcon />}
              variant="outlined"
              fullWidth
            >
              {isRTL ? 'المتابعة مع جوجل' : 'Continue with Google'}
            </OAuthButton>
          </motion.div>

          <motion.div variants={itemVariants}>
            <OAuthButton
              startIcon={<AppleIcon />}
              variant="outlined"
              fullWidth
            >
              {isRTL ? 'المتابعة مع أبل' : 'Continue with Apple'}
            </OAuthButton>
          </motion.div>

          <motion.div variants={itemVariants}>
            <OAuthButton
              startIcon={<GitHubIcon />}
              variant="outlined"
              fullWidth
            >
              {isRTL ? 'المتابعة مع جيثب' : 'Continue with GitHub'}
            </OAuthButton>
          </motion.div>

          <motion.div variants={itemVariants}>
            <OAuthButton
              startIcon={<GuestIcon />}
              variant="outlined"
              fullWidth
              onClick={() => navigate('/onboarding')}
            >
              {isRTL ? 'المتابعة كضيف' : 'Continue as Guest'}
            </OAuthButton>
          </motion.div>
        </Box>
      </StyledPaper>

      <QuoteContainer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Typography variant="body1" gutterBottom>
          {isRTL
            ? 'نحن شعب لا نرضى إلا بالمركز الأول.'
            : 'We are a people who do not settle for anything but first place.'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {isRTL ? 'محمد بن راشد آل مكتوم' : 'Mohammed bin Rashid Al Maktoum'}
        </Typography>
      </QuoteContainer>

      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          gap: 1,
        }}
      >
        <IconButton
          onClick={() => setIsHighContrast(!isHighContrast)}
          sx={{ background: 'rgba(255, 255, 255, 0.9)' }}
        >
          <AccessibilityIcon />
        </IconButton>
        <IconButton
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          sx={{ background: 'rgba(255, 255, 255, 0.9)' }}
        >
          {isAudioEnabled ? <VolumeIcon /> : <VolumeOffIcon />}
        </IconButton>
      </Box>

      <AIAssistant />
    </StyledContainer>
  );
};

export default Login; 