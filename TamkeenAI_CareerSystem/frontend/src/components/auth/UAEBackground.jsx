import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const BackgroundContainer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: 0,
});

const Sky = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '100%',
  background: 'linear-gradient(180deg, #1a237e 0%, #4a148c 50%, #880e4f 100%)',
  opacity: 0.8,
});

const Stars = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0))',
  backgroundRepeat: 'repeat',
  backgroundSize: '200px 200px',
  opacity: 0.5,
});

const SkylineContainer = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '40%',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap: '2rem',
  padding: '0 2rem',
});

const Building = styled(motion.div)(({ height, width, color }) => ({
  width: width,
  height: height,
  background: color,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
  },
}));

const Dunes = styled(motion.div)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '20%',
  background: '#E2C275',
  clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 100%)',
  opacity: 0.8,
});

const UAEBackground = () => {
  const starsVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const buildingVariants = {
    initial: { y: 100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: 'easeOut',
      },
    },
  };

  const dunesVariants = {
    initial: { y: 100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 0.8,
      transition: {
        duration: 1,
        delay: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <BackgroundContainer>
      <Sky />
      <Stars variants={starsVariants} animate="animate" />
      
      <SkylineContainer>
        {/* Burj Khalifa */}
        <Building
          height="60%"
          width="40px"
          color="#242424"
          variants={buildingVariants}
          initial="initial"
          animate="animate"
        />
        
        {/* Museum of the Future */}
        <Building
          height="40%"
          width="60px"
          color="#00754A"
          variants={buildingVariants}
          initial="initial"
          animate="animate"
        />
        
        {/* Other buildings */}
        <Building
          height="35%"
          width="30px"
          color="#242424"
          variants={buildingVariants}
          initial="initial"
          animate="animate"
        />
        <Building
          height="45%"
          width="35px"
          color="#00754A"
          variants={buildingVariants}
          initial="initial"
          animate="animate"
        />
      </SkylineContainer>
      
      <Dunes
        variants={dunesVariants}
        initial="initial"
        animate="animate"
      />
    </BackgroundContainer>
  );
};

export default UAEBackground; 