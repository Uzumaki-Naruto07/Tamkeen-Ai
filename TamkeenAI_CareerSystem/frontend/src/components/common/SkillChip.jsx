import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { TrendingUp, CheckCircle, Engineering, School } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * SkillChip component for displaying skills with optional indicators
 * 
 * Props:
 * - skill: string or object (with name, level, trending, verified properties)
 * - variant: string ('filled', 'outlined', etc.) - default 'outlined'
 * - size: string ('small', 'medium') - default 'small'
 * - color: string (MUI color or custom) - default 'primary'
 * - showLevel: boolean - whether to show the skill level - default false
 * - onClick: function - click handler
 */
const SkillChip = ({ 
  skill, 
  variant = 'outlined', 
  size = 'small', 
  color = 'primary', 
  showLevel = false,
  onClick,
  ...props 
}) => {
  // If skill is not provided, return null
  if (!skill) return null;
  
  // If skill is just a string, convert to object
  const skillData = typeof skill === 'string' 
    ? { name: skill } 
    : skill;
  
  // If skillData has no name property, use a default or return null
  if (!skillData.name) {
    return null;
  }
  
  // Define the icon to display
  const getSkillIcon = () => {
    if (skillData.trending) {
      return <TrendingUp fontSize="small" />;
    }
    if (skillData.verified) {
      return <CheckCircle fontSize="small" />;
    }
    if (skillData.category === 'technical') {
      return <Engineering fontSize="small" />;
    }
    if (skillData.category === 'education') {
      return <School fontSize="small" />;
    }
    return null;
  };
  
  // Get the skill label
  const getLabel = () => {
    if (showLevel && skillData.level) {
      return `${skillData.name} (${skillData.level})`;
    }
    if (showLevel && skillData.proficiency) {
      return `${skillData.name} (${skillData.proficiency})`;
    }
    if (showLevel && skillData.userLevel) {
      return `${skillData.name} (${skillData.userLevel})`;
    }
    return skillData.name;
  };
  
  // Generate color based on skill level
  const getColor = () => {
    const level = skillData.level || skillData.proficiency || skillData.userLevel;
    if (level) {
      if (level >= 4) return 'success';
      if (level >= 3) return 'info';
      if (level >= 2) return 'warning';
      return 'default';
    }
    return color;
  };
  
  const chipContent = (
    <Chip
      label={getLabel()}
      size={size}
      variant={variant}
      color={getColor()}
      icon={getSkillIcon()}
      onClick={onClick}
      {...props}
    />
  );
  
  // Add tooltip if there's any additional information
  if (skillData.description) {
    return (
      <Tooltip title={skillData.description} arrow>
        {chipContent}
      </Tooltip>
    );
  }
  
  return chipContent;
};

export default SkillChip; 