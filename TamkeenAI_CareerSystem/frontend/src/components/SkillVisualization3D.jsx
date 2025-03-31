import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, CircularProgress, Chip, Tooltip, IconButton, Fade, Grow } from '@mui/material';
import { Star, ZoomIn, ZoomOut, Refresh, FilterList, Psychology, Code, Engineering } from '@mui/icons-material';

/**
 * SkillVisualization3D component
 * Visualizes skills in an interactive 3D-like map
 */
const SkillVisualization3D = ({ 
  skills = [], 
  jobSkills = null,
  height = 400,
  loading = false
}) => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  // Group skills by category for visualization
  const groupedSkills = skills.reduce((groups, skill) => {
    const category = skill.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(skill);
    return groups;
  }, {});
  
  // Define category colors and icons with improved visual design
  const categoryConfig = {
    technical: { 
      color: "#4285F4", 
      gradient: "linear-gradient(45deg, #4285F4, #5C9CFF)",
      label: "Technical Skills", 
      icon: <Code fontSize="small" />
    },
    soft: { 
      color: "#34A853", 
      gradient: "linear-gradient(45deg, #34A853, #5CB176)",
      label: "Soft Skills", 
      icon: <Psychology fontSize="small" />
    },
    industry: { 
      color: "#FBBC05", 
      gradient: "linear-gradient(45deg, #FBBC05, #FFD350)",
      label: "Industry Knowledge", 
      icon: <Engineering fontSize="small" />
    },
    tools: { 
      color: "#EA4335", 
      gradient: "linear-gradient(45deg, #EA4335, #FF6B6B)",
      label: "Tools & Software", 
      icon: <FilterList fontSize="small" />
    },
    language: { 
      color: "#8C44DB", 
      gradient: "linear-gradient(45deg, #8C44DB, #A673E8)",
      label: "Languages", 
      icon: <Star fontSize="small" />
    },
    other: { 
      color: "#9E9E9E", 
      gradient: "linear-gradient(45deg, #9E9E9E, #BDBDBD)",
      label: "Other Skills", 
      icon: <Star fontSize="small" />
    }
  };
  
  const handleCategoryClick = (category) => {
    setSelectedCategory(prevCategory => prevCategory === category ? 'all' : category);
    // Reset selected skill when changing categories
    setSelectedSkill(null);
  };
  
  const handleZoom = (direction) => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.max(0.5, Math.min(1.5, newZoom));
    });
  };
  
  const resetView = () => {
    setSelectedCategory('all');
    setZoomLevel(1);
    setSelectedSkill(null);
    setHoveredSkill(null);
  };
  
  const handleSkillClick = (skill) => {
    setSelectedSkill(prevSkill => prevSkill?.id === skill.id ? null : skill);
  };
  
  // Filter skills by selected category
  const filteredSkills = selectedCategory === 'all' 
    ? groupedSkills 
    : { [selectedCategory]: groupedSkills[selectedCategory] || [] };
  
  // Check if a skill matches with job requirements (for visual highlighting)
  const isMatchingSkill = (skill) => {
    if (!jobSkills) return false;
    return jobSkills.some(jobSkill => 
      jobSkill.name.toLowerCase() === skill.name.toLowerCase());
  };
  
  return (
    <Paper 
      elevation={4}
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        width: '100%',
        height,
        background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
        position: 'relative',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2.5, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f0f6ff, #ffffff)'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Engineering sx={{ color: 'primary.main' }} />
          Skills Map
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Zoom In" arrow>
            <IconButton 
              size="small" 
              onClick={() => handleZoom('in')}
              sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.15)',
                }
              }}
            >
              <ZoomIn fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom Out" arrow>
            <IconButton 
              size="small" 
              onClick={() => handleZoom('out')}
              sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.15)',
                }
              }}
            >
              <ZoomOut fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reset View" arrow>
            <IconButton 
              size="small" 
              onClick={resetView}
              sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.15)',
                }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          height: 'calc(100% - 68px)' 
        }}>
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{ 
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '50%',
              p: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }} 
          />
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
            Loading skills visualization...
          </Typography>
        </Box>
      ) : skills.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          height: 'calc(100% - 68px)',
          p: 3,
          textAlign: 'center'
        }}>
          <Engineering sx={{ 
            fontSize: 70, 
            color: 'action.disabled', 
            mb: 2,
            opacity: 0.6
          }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            No Skills Added Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
            Add skills to your resume to see them visualized in this interactive map.
            Different skill categories will be color-coded and organized for better insights.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: 'calc(100% - 68px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Category filters */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(0,0,0,0.01)'
          }}>
            <Chip
              label="All Skills"
              variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
              onClick={() => handleCategoryClick('all')}
              color={selectedCategory === 'all' ? 'primary' : 'default'}
              sx={{ 
                fontWeight: 500,
                '&:hover': { 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            />
            
            {Object.keys(groupedSkills).map(category => (
              <Chip
                key={category}
                label={categoryConfig[category]?.label || 'Other Skills'}
                icon={categoryConfig[category]?.icon}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                onClick={() => handleCategoryClick(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                sx={{ 
                  fontWeight: 500,
                  '&:hover': { 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Box>
          
          {/* Skills visualization */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              p: 3,
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.3s ease'
            }}
          >
            {Object.keys(filteredSkills).length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                flexDirection: 'column',
                p: 2
              }}>
                <FilterList sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  No skills in this category
                </Typography>
              </Box>
            ) : (
              Object.keys(filteredSkills).map((category, categoryIndex) => (
                <Grow
                  key={category}
                  in={true}
                  style={{ transformOrigin: '0 0 0' }}
                  timeout={300 + categoryIndex * 100}
                >
                  <Box sx={{ mb: 4 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px dashed',
                        borderColor: 'divider'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          background: categoryConfig[category]?.gradient || categoryConfig.other.gradient,
                          mr: 1,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600}
                        color={categoryConfig[category]?.color || categoryConfig.other.color}
                      >
                        {categoryConfig[category]?.label || 'Other Skills'}
                      </Typography>
                      
                      <Typography variant="caption" ml={1} color="text.secondary">
                        ({filteredSkills[category]?.length || 0} skills)
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1.5,
                      ml: 2
                    }}>
                      {filteredSkills[category]?.map((skill, index) => (
                        <Fade
                          key={skill.id || `${category}-${index}`}
                          in={true}
                          style={{ transformOrigin: 'center' }}
                          timeout={500 + index * 50}
                        >
                          <Tooltip 
                            title={skill.description || `Proficiency: ${skill.proficiency || 'N/A'}`}
                            arrow
                            placement="top"
                          >
                            <Chip
                              label={skill.name}
                              onClick={() => handleSkillClick(skill)}
                              onMouseEnter={() => setHoveredSkill(skill)}
                              onMouseLeave={() => setHoveredSkill(null)}
                              sx={{
                                background: hoveredSkill?.id === skill.id || selectedSkill?.id === skill.id
                                  ? categoryConfig[category]?.gradient || categoryConfig.other.gradient
                                  : 'white',
                                color: hoveredSkill?.id === skill.id || selectedSkill?.id === skill.id 
                                  ? 'white' 
                                  : 'text.primary',
                                border: '1px solid',
                                borderColor: categoryConfig[category]?.color || categoryConfig.other.color,
                                fontWeight: 500,
                                px: 1,
                                transition: 'all 0.2s ease',
                                transform: selectedSkill?.id === skill.id ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: selectedSkill?.id === skill.id 
                                  ? '0 4px 12px rgba(0,0,0,0.15)' 
                                  : hoveredSkill?.id === skill.id 
                                    ? '0 2px 8px rgba(0,0,0,0.1)' 
                                    : 'none',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  transform: 'translateY(-2px) scale(1.05)'
                                },
                                // Additional styles for job-matching skills
                                ...(isMatchingSkill(skill) && {
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -2,
                                    border: '2px solid',
                                    borderColor: categoryConfig[category]?.color || categoryConfig.other.color,
                                    borderRadius: '16px',
                                    animation: 'pulse 2s infinite',
                                    opacity: 0.6,
                                    zIndex: -1
                                  },
                                  '@keyframes pulse': {
                                    '0%': { opacity: 0.6, transform: 'scale(1)' },
                                    '50%': { opacity: 0.3, transform: 'scale(1.05)' },
                                    '100%': { opacity: 0.6, transform: 'scale(1)' }
                                  },
                                })
                              }}
                            />
                          </Tooltip>
                        </Fade>
                      ))}
                    </Box>
                  </Box>
                </Grow>
              ))
            )}
          </Box>
          
          {/* Selected skill details */}
          {selectedSkill && (
            <Fade in={!!selectedSkill}>
              <Box sx={{ 
                p: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'rgba(0, 0, 0, 0.02)'
              }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedSkill.name}
                  {isMatchingSkill(selectedSkill) && (
                    <Chip 
                      size="small" 
                      label="Job Match" 
                      color="success" 
                      sx={{ ml: 1, height: 24 }} 
                    />
                  )}
                </Typography>
                
                {selectedSkill.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedSkill.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  {selectedSkill.proficiency && (
                    <Typography variant="caption" color="text.secondary">
                      Proficiency: <strong>{selectedSkill.proficiency}</strong>
                    </Typography>
                  )}
                  
                  {selectedSkill.category && (
                    <Typography variant="caption" color="text.secondary">
                      Category: <strong>{categoryConfig[selectedSkill.category]?.label || selectedSkill.category}</strong>
                    </Typography>
                  )}
                </Box>
              </Box>
            </Fade>
          )}
        </Box>
      )}
    </Paper>
  );
};

SkillVisualization3D.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      level: PropTypes.number,
      category: PropTypes.string,
      description: PropTypes.string
    })
  ),
  jobSkills: PropTypes.array,
  height: PropTypes.number,
  loading: PropTypes.bool
};

export default SkillVisualization3D; 