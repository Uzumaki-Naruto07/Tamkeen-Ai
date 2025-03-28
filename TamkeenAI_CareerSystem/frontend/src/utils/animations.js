import { ANIMATION_DURATIONS } from './constants';

// Fade animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

// Slide animations
export const slideInLeft = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

export const slideInRight = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

// Scale animations
export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

export const scaleInUp = {
  initial: { scale: 0.9, y: 20, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1 },
  exit: { scale: 0.9, y: -20, opacity: 0 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

// Rotate animations
export const rotateIn = {
  initial: { rotate: -180, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

// Stagger animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

// Modal transitions
export const modalTransition = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL },
};

// List item transitions
export const listItemTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: ANIMATION_DURATIONS.FAST },
};

// Card hover animations
export const cardHover = {
  hover: {
    scale: 1.02,
    transition: { duration: ANIMATION_DURATIONS.FAST },
  },
};

// Button hover animations
export const buttonHover = {
  hover: {
    scale: 1.05,
    transition: { duration: ANIMATION_DURATIONS.FAST },
  },
  tap: {
    scale: 0.95,
    transition: { duration: ANIMATION_DURATIONS.FAST },
  },
};

// Loading animations
export const loadingPulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: ANIMATION_DURATIONS.NORMAL,
      repeat: Infinity,
    },
  },
};

// Success animations
export const successAnimation = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
  },
};

// Error animations
export const errorShake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: ANIMATION_DURATIONS.FAST,
    },
  },
};

// Custom animation creator
export const createAnimation = (type, duration = ANIMATION_DURATIONS.NORMAL) => {
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 },
    },
    scale: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
  };

  const animation = animations[type];
  if (!animation) return animations.fade;

  return {
    ...animation,
    transition: { duration },
  };
}; 