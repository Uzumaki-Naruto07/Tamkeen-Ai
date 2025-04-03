import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * PageHeader Component
 * 
 * A consistent header component for page titles with optional subtitle and icon
 * 
 * @param {Object} props
 * @param {string} props.title - The main title for the page
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.icon - Optional icon to display next to the title
 * @param {Object} props.action - Optional action component (e.g., button) to display on the right
 */
const PageHeader = ({ title, subtitle, icon, action }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3,
        mb: 4, 
        borderRadius: 2,
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: action ? 2 : 0, sm: 0 } }}>
        {icon && (
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom={Boolean(subtitle)} 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              lineHeight: 1.2,
              m: 0
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ 
                mt: 0.5,
                maxWidth: '800px' 
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {action && (
        <Box sx={{ mt: { xs: 2, sm: 0 } }}>
          {action}
        </Box>
      )}
    </Paper>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  action: PropTypes.node
};

export default PageHeader; 