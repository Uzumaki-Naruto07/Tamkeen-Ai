import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Autocomplete,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tooltip,
  IconButton,
  LinearProgress,
  Switch,
  FormControlLabel,
  Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

// Constants
const MATCH_LEVELS = {
  STRONG: 'strong',
  MODERATE: 'moderate',
  WEAK: 'weak',
  MISSING: 'missing'
};

const COLORS = {
  [MATCH_LEVELS.STRONG]: '#4caf50',
  [MATCH_LEVELS.MODERATE]: '#2196f3',
  [MATCH_LEVELS.WEAK]: '#ff9800',
  [MATCH_LEVELS.MISSING]: '#f44336'
};

const SkillsGapAnalyzer = ({
  userSkills = [],
  jobSkills = [],
  jobTitle = '',
  onAddSkill,
  onRemoveSkill,
  onAnalyze,
  loading = false,
  showAddSkill = true,
  suggestedSkills = [],
  matchScore = 0
}) => {
  const [skillInput, setSkillInput] = useState('');
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [expandedSection, setExpandedSection] = useState('analysis');
  
  // Calculated skill matches
  const [skillMatches, setSkillMatches] = useState([]);

  // Analyze skills on component mount or when skills change
  useEffect(() => {
    analyzeSkillGaps();
  }, [userSkills, jobSkills]);

  const analyzeSkillGaps = () => {
    // Create a map for quick lookup of user skills
    const userSkillsMap = new Map();
    userSkills.forEach(skill => {
      userSkillsMap.set(skill.name.toLowerCase(), skill.level || 0);
    });

    // Compare job skills with user skills to determine matches and gaps
    const matches = jobSkills.map(jobSkill => {
      const skillName = jobSkill.name.toLowerCase();
      const isMatch = userSkillsMap.has(skillName);
      const userLevel = userSkillsMap.get(skillName) || 0;
      const requiredLevel = jobSkill.level || 1;
      
      let matchLevel = MATCH_LEVELS.MISSING;
      
      if (isMatch) {
        const levelDifference = userLevel - requiredLevel;
        
        if (levelDifference >= 0) {
          matchLevel = MATCH_LEVELS.STRONG;
        } else if (levelDifference === -1) {
          matchLevel = MATCH_LEVELS.MODERATE;
        } else {
          matchLevel = MATCH_LEVELS.WEAK;
        }
      }
      
      return {
        name: jobSkill.name,
        matchLevel,
        userLevel,
        requiredLevel,
        isCritical: jobSkill.isCritical || false,
        category: jobSkill.category || 'General'
      };
    });
    
    setSkillMatches(matches);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && onAddSkill) {
      onAddSkill({
        name: skillInput.trim(),
        level: 3,  // Default to medium proficiency
        category: 'General'
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (onRemoveSkill) {
      onRemoveSkill(skillToRemove);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getMatchCount = (matchLevel) => {
    return skillMatches.filter(match => match.matchLevel === matchLevel).length;
  };

  const getFilteredSkills = () => {
    if (showMissingOnly) {
      return skillMatches.filter(skill => 
        skill.matchLevel === MATCH_LEVELS.MISSING || 
        (skill.matchLevel === MATCH_LEVELS.WEAK && skill.isCritical)
      );
    }
    return skillMatches;
  };

  // Group skills by category
  const groupedSkills = () => {
    const filtered = getFilteredSkills();
    const grouped = {};
    
    filtered.forEach(skill => {
      const category = skill.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    
    return grouped;
  };

  // Prepare data for radar chart
  const prepareRadarData = () => {
    if (!skillMatches.length) return [];
    
    const categories = [...new Set(skillMatches.map(skill => skill.category))];
    
    return categories.map(category => {
      const skills = skillMatches.filter(skill => skill.category === category);
      const matchingSkills = skills.filter(skill => 
        skill.matchLevel === MATCH_LEVELS.STRONG || 
        skill.matchLevel === MATCH_LEVELS.MODERATE
      );
      
      return {
        category,
        match: matchingSkills.length / skills.length * 100
      };
    });
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      {/* Rest of the component content */}
    </Paper>
  );
};

export default SkillsGapAnalyzer; 