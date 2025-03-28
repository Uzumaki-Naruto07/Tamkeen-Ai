import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Card, Typography, Tooltip, Button, 
  useTheme, Paper, CircularProgress, 
  Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { alpha } from '@mui/material/styles';

// Mock data for skill nodes
const mockSkillNodes = [
  // Core skills - center
  { id: 'html', name: 'HTML', level: 85, x: 50, y: 50, category: 'core', status: 'mastered', dependencies: [] },
  { id: 'css', name: 'CSS', level: 70, x: 44, y: 44, category: 'core', status: 'learning', dependencies: ['html'] },
  { id: 'js', name: 'JavaScript', level: 75, x: 56, y: 44, category: 'core', status: 'learning', dependencies: ['html'] },
  
  // Frontend frameworks
  { id: 'react', name: 'React', level: 65, x: 62, y: 50, category: 'frontend', status: 'learning', dependencies: ['js'] },
  { id: 'angular', name: 'Angular', level: 20, x: 58, y: 58, category: 'frontend', status: 'planned', dependencies: ['js', 'ts'] },
  { id: 'vue', name: 'Vue.js', level: 10, x: 66, y: 58, category: 'frontend', status: 'locked', dependencies: ['js'] },
  
  // CSS frameworks
  { id: 'bootstrap', name: 'Bootstrap', level: 60, x: 38, y: 50, category: 'styling', status: 'learning', dependencies: ['css'] },
  { id: 'tailwind', name: 'Tailwind', level: 40, x: 38, y: 58, category: 'styling', status: 'planned', dependencies: ['css'] },
  { id: 'sass', name: 'Sass', level: 50, x: 34, y: 44, category: 'styling', status: 'learning', dependencies: ['css'] },
  
  // JavaScript tools and extensions
  { id: 'ts', name: 'TypeScript', level: 45, x: 62, y: 38, category: 'languages', status: 'learning', dependencies: ['js'] },
  { id: 'redux', name: 'Redux', level: 30, x: 70, y: 44, category: 'state', status: 'planned', dependencies: ['react'] },
  { id: 'jest', name: 'Jest', level: 25, x: 70, y: 50, category: 'testing', status: 'planned', dependencies: ['js'] },
];

const categoryColors = {
  core: '#2196f3', // blue
  frontend: '#9c27b0', // purple
  styling: '#4caf50', // green
  languages: '#ff9800', // orange
  state: '#f44336', // red
  testing: '#607d8b', // blue grey
};

const statusColors = {
  mastered: '#4caf50', // green
  learning: '#2196f3', // blue
  planned: '#ff9800', // orange
  locked: '#9e9e9e', // grey
};

// Hexagon component for a skill node
const HexagonNode = ({ skill, onClick, scale }) => {
  const theme = useTheme();
  const size = 50 * scale; // Base size adjusted by scale
  
  // Function to generate hexagon points
  const generateHexPoints = (size) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };
  
  const getColor = () => {
    const baseColor = categoryColors[skill.category] || theme.palette.primary.main;
    if (skill.status === 'locked') return theme.palette.grey[300];
    return baseColor;
  };
  
  const getStatusIcon = () => {
    switch(skill.status) {
      case 'mastered': return <CheckCircleIcon fontSize="small" />;
      case 'learning': return <SchoolIcon fontSize="small" />;
      case 'planned': return <StarIcon fontSize="small" />;
      default: return null;
    }
  };
  
  return (
    <Tooltip 
      title={
        <React.Fragment>
          <Typography variant="subtitle2">{skill.name}</Typography>
          <Typography variant="body2">
            Level: {skill.level}%
          </Typography>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            Status: {skill.status}
          </Typography>
        </React.Fragment>
      }
      placement="top"
    >
      <motion.g
        onClick={() => onClick(skill)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ cursor: 'pointer' }}
      >
        {/* Shadow effect */}
        <polygon 
          points={generateHexPoints(size)}
          fill={alpha('#000', 0.1)}
          transform={`translate(${skill.x + 3}, ${skill.y + 3})`}
        />
        
        {/* Main hexagon */}
        <polygon 
          points={generateHexPoints(size)}
          fill={alpha(getColor(), skill.status === 'locked' ? 0.3 : 0.7)}
          stroke={getColor()}
          strokeWidth={2}
          transform={`translate(${skill.x}, ${skill.y})`}
        />
        
        {/* Level indicator */}
        <circle
          cx={skill.x}
          cy={skill.y}
          r={size * 0.6}
          fill="transparent"
          stroke={theme.palette.background.paper}
          strokeWidth={4}
          strokeDasharray={`${(skill.level / 100) * 2 * Math.PI * (size * 0.6)} ${2 * Math.PI * (size * 0.6)}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${skill.x} ${skill.y})`}
        />
        
        {/* Skill name */}
        <text
          x={skill.x}
          y={skill.y - 5}
          textAnchor="middle"
          fill={theme.palette.getContrastText(alpha(getColor(), 0.7))}
          style={{ fontSize: 10 * scale, fontWeight: 'bold' }}
        >
          {skill.name}
        </text>
        
        {/* Skill level */}
        <text
          x={skill.x}
          y={skill.y + 10}
          textAnchor="middle"
          fill={theme.palette.getContrastText(alpha(getColor(), 0.7))}
          style={{ fontSize: 9 * scale }}
        >
          {skill.level}%
        </text>
        
        {/* Status indicator */}
        <g transform={`translate(${skill.x + size * 0.5}, ${skill.y - size * 0.5})`}>
          <circle
            r={8 * scale}
            fill={statusColors[skill.status] || theme.palette.grey[500]}
            stroke={theme.palette.background.paper}
            strokeWidth={1}
          />
          <g transform={`scale(${scale * 0.8}) translate(-10, -10)`}>
            {getStatusIcon()}
          </g>
        </g>
      </motion.g>
    </Tooltip>
  );
};

const SkillMap = () => {
  const theme = useTheme();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const svgRef = useRef(null);
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setStartPan({ 
        x: e.clientX - pan.x, 
        y: e.clientY - pan.y 
      });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  // Generate lines connecting dependent skills
  const renderDependencyLines = () => {
    return mockSkillNodes.flatMap(node => {
      return node.dependencies.map(depId => {
        const depNode = mockSkillNodes.find(n => n.id === depId);
        if (!depNode) return null;
        
        return (
          <line
            key={`${node.id}-${depId}`}
            x1={node.x}
            y1={node.y}
            x2={depNode.x}
            y2={depNode.y}
            stroke={alpha(
              node.status === 'locked' ? theme.palette.grey[400] : theme.palette.primary.main, 
              0.4
            )}
            strokeWidth={2 * scale}
            strokeDasharray={node.status === 'locked' ? "5,5" : ""}
          />
        );
      });
    });
  };
  
  // Render skill details dialog
  const renderSkillDialog = () => {
    if (!selectedSkill) return null;
    
    const getRelatedSkills = () => {
      // Find skills that depend on this skill or that this skill depends on
      const relatedSkills = mockSkillNodes.filter(node => {
        return node.dependencies.includes(selectedSkill.id) || 
               selectedSkill.dependencies.includes(node.id);
      });
      return relatedSkills;
    };
    
    const relatedSkills = getRelatedSkills();
    
    return (
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: alpha(categoryColors[selectedSkill.category], 0.1),
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              bgcolor: categoryColors[selectedSkill.category],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <InfoIcon fontSize="small" sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6">{selectedSkill.name} Skill Details</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Current Proficiency
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={selectedSkill.level}
                  size={60}
                  thickness={4}
                  sx={{
                    color: categoryColors[selectedSkill.category] || theme.palette.primary.main,
                    bgcolor: theme.palette.grey[200],
                    borderRadius: '50%'
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" fontWeight="bold">
                    {selectedSkill.level}%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize', mb: 0.5 }}>
                  Status: {selectedSkill.status}
                </Typography>
                <Chip 
                  size="small"
                  label={selectedSkill.category}
                  sx={{ 
                    bgcolor: alpha(categoryColors[selectedSkill.category], 0.1),
                    color: categoryColors[selectedSkill.category],
                    borderRadius: 1,
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
            </Box>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Learning Resources
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recommended Courses
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Box component="li">
                <Typography variant="body2">
                  Advanced {selectedSkill.name} Techniques
                </Typography>
              </Box>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SchoolIcon />}
          >
            Start Learning
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Interactive Skill Map
        </Typography>
        <Box>
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box
        sx={{
          height: 'calc(100% - 60px)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: alpha(theme.palette.background.default, 0.6),
          cursor: isDragging ? 'grabbing' : 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: theme.palette.background.paper,
                zIndex: 10
              }}
            >
              <CircularProgress />
              <Typography variant="body1">Loading Skill Map...</Typography>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformOrigin: '0 0'
          }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
          >
            {/* Render lines first so they appear behind nodes */}
            {renderDependencyLines()}
            
            {/* Render skill nodes */}
            {mockSkillNodes.map((skill) => (
              <HexagonNode 
                key={skill.id}
                skill={skill}
                onClick={handleSkillClick}
                scale={scale}
              />
            ))}
          </svg>
        </motion.div>
        
        {renderSkillDialog()}
      </Box>
    </Card>
  );
};

export default SkillMap; 