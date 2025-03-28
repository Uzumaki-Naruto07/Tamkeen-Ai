import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Card, Typography, Button, Chip, 
  IconButton, LinearProgress, Paper, Tooltip, 
  useTheme, useMediaQuery, Avatar
} from '@mui/material';
import styled from '@emotion/styled';
import SchoolIcon from '@mui/icons-material/School';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import { alpha } from '@mui/material/styles';

// Mock data - would come from API in production
const mockLearningPaths = [
  {
    id: 'path1',
    title: 'Frontend Development Mastery',
    description: 'Complete learning path to become a professional frontend developer',
    progress: 65,
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux'],
    nodes: [
      { id: 'n1', title: 'HTML & CSS Fundamentals', type: 'course', status: 'completed', x: 10, y: 20 },
      { id: 'n2', title: 'JavaScript Essentials', type: 'course', status: 'completed', x: 25, y: 10 },
      { id: 'n3', title: 'React Basics', type: 'course', status: 'completed', x: 40, y: 20 },
      { id: 'n4', title: 'State Management', type: 'skill', status: 'in-progress', x: 55, y: 10, children: ['n5', 'n6'] },
      { id: 'n5', title: 'Advanced React Patterns', type: 'project', status: 'locked', x: 70, y: 5 },
      { id: 'n6', title: 'Performance Optimization', type: 'skill', status: 'locked', x: 70, y: 25 },
      { id: 'n7', title: 'Testing with Jest', type: 'course', status: 'locked', x: 85, y: 20 },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' },
      { from: 'n4', to: 'n6' },
      { from: 'n5', to: 'n7' },
      { from: 'n6', to: 'n7' },
    ]
  },
  {
    id: 'path2',
    title: 'Data Science Specialization',
    description: 'Comprehensive data science curriculum with hands-on projects',
    progress: 30,
    skills: ['Python', 'Pandas', 'Machine Learning', 'Data Visualization', 'Statistics'],
    nodes: [
      { id: 'n1', title: 'Python Fundamentals', type: 'course', status: 'completed', x: 10, y: 20 },
      { id: 'n2', title: 'Data Analysis with Pandas', type: 'course', status: 'in-progress', x: 25, y: 30 },
      { id: 'n3', title: 'Data Visualization', type: 'skill', status: 'locked', x: 40, y: 20 },
      { id: 'n4', title: 'Statistical Methods', type: 'course', status: 'locked', x: 55, y: 10 },
      { id: 'n5', title: 'Machine Learning Basics', type: 'course', status: 'locked', x: 70, y: 20 },
      { id: 'n6', title: 'Deep Learning', type: 'skill', status: 'locked', x: 85, y: 30 },
    ],
    edges: [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3' },
      { from: 'n2', to: 'n4' },
      { from: 'n3', to: 'n5' },
      { from: 'n4', to: 'n5' },
      { from: 'n5', to: 'n6' },
    ]
  },
];

// Styled components
const RoadmapContainer = styled(Box)`
  position: relative;
  width: 100%;
  overflow-x: auto;
  padding: 20px;
  min-height: 500px;
`;

const PathHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const PathSelector = styled(Box)`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const PathCard = styled(Card)`
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const Node = styled(motion.div)`
  position: absolute;
  width: 180px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 2;
  backdrop-filter: blur(4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.05);
    z-index: 10;
  }
`;

const Edge = styled(motion.div)`
  position: absolute;
  height: 2px;
  background: ${props => props.theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
  z-index: 1;
  
  &:after {
    content: '';
    position: absolute;
    right: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-3px);
  }
`;

const NodeContent = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SkillTag = styled(Chip)`
  margin: 2px;
  font-size: 0.75rem;
`;

const IconWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
`;

const ResourceButton = styled(Button)`
  margin-top: 8px;
  font-size: 0.75rem;
  padding: 2px 8px;
`;

const LearningRoadmap = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedPath, setSelectedPath] = useState(mockLearningPaths[0]);
  const [expandedNode, setExpandedNode] = useState(null);
  const [animateNodes, setAnimateNodes] = useState(false);
  
  useEffect(() => {
    // Set animation flag after a small delay to trigger animations
    const timer = setTimeout(() => {
      setAnimateNodes(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedPath]);
  
  const handlePathSelect = (path) => {
    setAnimateNodes(false);
    setSelectedPath(path);
    setExpandedNode(null);
  };
  
  const handleNodeClick = (nodeId) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };
  
  const getNodeColor = (status, type) => {
    if (status === 'completed') return theme.palette.success.main;
    if (status === 'in-progress') return theme.palette.primary.main;
    return theme.palette.action.disabledBackground;
  };
  
  const getNodeIcon = (type, status) => {
    if (status === 'locked') return <LockIcon fontSize="small" />;
    if (status === 'completed') return <CheckCircleIcon fontSize="small" />;
    if (type === 'course') return <SchoolIcon fontSize="small" />;
    if (type === 'skill') return <StarIcon fontSize="small" />;
    return <TrendingUpIcon fontSize="small" />;
  };
  
  const renderNodeContent = (node) => {
    const isExpanded = expandedNode === node.id;
    const isLocked = node.status === 'locked';
    
    return (
      <NodeContent>
        <Box display="flex" alignItems="center">
          <IconWrapper sx={{ backgroundColor: getNodeColor(node.status, node.type) }}>
            {getNodeIcon(node.type, node.status)}
          </IconWrapper>
          <Typography variant="subtitle2" fontWeight={600} noWrap={!isExpanded}>
            {node.title}
          </Typography>
        </Box>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
              {isLocked ? 'Complete previous skills to unlock this node' : 
                `This ${node.type} will help you master key concepts in ${selectedPath.title}.`}
            </Typography>
            
            {!isLocked && (
              <Box mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={node.status === 'completed' ? 100 : node.status === 'in-progress' ? 45 : 0} 
                  sx={{ height: 6, borderRadius: 3, mb: 1 }}
                />
                <ResourceButton 
                  variant="outlined" 
                  size="small" 
                  fullWidth
                  startIcon={<SchoolIcon fontSize="small" />}
                >
                  {node.status === 'completed' ? 'Review Material' : 'Start Learning'}
                </ResourceButton>
              </Box>
            )}
          </motion.div>
        )}
        
        {!isExpanded && (
          <Chip 
            label={node.status === 'completed' ? 'Completed' : node.status === 'in-progress' ? 'In Progress' : 'Locked'}
            size="small"
            sx={{ 
              mt: 0.5, 
              fontSize: '0.7rem',
              backgroundColor: alpha(getNodeColor(node.status, node.type), 0.1),
              color: getNodeColor(node.status, node.type),
              border: `1px solid ${getNodeColor(node.status, node.type)}`
            }}
          />
        )}
      </NodeContent>
    );
  };
  
  return (
    <Card sx={{ p: 3, height: '100%', overflow: 'hidden' }}>
      <PathHeader>
        <Typography variant="h5" fontWeight={600}>
          Personalized Learning Roadmap
        </Typography>
        <Tooltip title="Your learning progress is automatically tracked and synced with your career goals">
          <Chip 
            icon={<SchoolIcon />}
            label={`${selectedPath.progress}% Complete`}
            color="primary"
            variant="outlined"
          />
        </Tooltip>
      </PathHeader>
      
      <PathSelector>
        {mockLearningPaths.map(path => (
          <PathCard 
            key={path.id}
            onClick={() => handlePathSelect(path)}
            sx={{ 
              borderColor: selectedPath.id === path.id ? theme.palette.primary.main : 'transparent',
              width: isMobile ? '100%' : '48%',
            }}
          >
            <Typography variant="h6">{path.title}</Typography>
            <LinearProgress 
              variant="determinate" 
              value={path.progress} 
              sx={{ mt: 1, mb: 1, height: 6, borderRadius: 3 }}
            />
            <Box display="flex" flexWrap="wrap" mt={1}>
              {path.skills.slice(0, 3).map(skill => (
                <SkillTag 
                  key={skill} 
                  label={skill}
                  size="small" 
                  variant="outlined"
                />
              ))}
              {path.skills.length > 3 && (
                <SkillTag 
                  label={`+${path.skills.length - 3} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </PathCard>
        ))}
      </PathSelector>
      
      <RoadmapContainer>
        <Paper 
          elevation={0}
          sx={{ 
            height: 400,
            width: '100%',
            position: 'relative',
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.background.paper, 0.7),
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Render edges first so they appear behind nodes */}
          {selectedPath.edges.map((edge, index) => {
            const fromNode = selectedPath.nodes.find(n => n.id === edge.from);
            const toNode = selectedPath.nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;
            
            // Calculate position and angle for edge
            const x1 = fromNode.x * 10;
            const y1 = fromNode.y * 10;
            const x2 = toNode.x * 10;
            const y2 = toNode.y * 10;
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            
            return (
              <Edge
                key={`edge-${index}`}
                theme={theme.palette.mode}
                sx={{
                  width: length,
                  left: x1,
                  top: y1,
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '0 0',
                  backgroundColor: fromNode.status === 'completed' ? 
                    theme.palette.success.main : 
                    theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: animateNodes ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            );
          })}
          
          {/* Render nodes */}
          {selectedPath.nodes.map((node, index) => (
            <Node
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{
                left: `${node.x * 10}px`,
                top: `${node.y * 10}px`,
                backgroundColor: alpha(getNodeColor(node.status, node.type), 0.1),
                borderLeft: `4px solid ${getNodeColor(node.status, node.type)}`,
                boxShadow: expandedNode === node.id ? 
                  `0 8px 16px ${alpha(getNodeColor(node.status, node.type), 0.2)}` : 
                  '0 2px 4px rgba(0, 0, 0, 0.05)',
                filter: node.status === 'locked' ? 'grayscale(1)' : 'none',
              }}
              initial={{ 
                opacity: 0,
                y: 20,
              }}
              animate={animateNodes ? { 
                opacity: 1,
                y: 0,
              } : {}}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1,
              }}
            >
              {renderNodeContent(node)}
            </Node>
          ))}
        </Paper>
      </RoadmapContainer>
      
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={<SchoolIcon />}
        >
          Explore More Learning Paths
        </Button>
      </Box>
    </Card>
  );
};

export default LearningRoadmap;