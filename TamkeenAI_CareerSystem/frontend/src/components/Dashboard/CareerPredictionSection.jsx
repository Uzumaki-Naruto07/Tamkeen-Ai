import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Button,
  Grid
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import CodeIcon from '@mui/icons-material/Code';
import { useNavigate } from 'react-router-dom';

const CareerPredictionSection = ({ prediction }) => {
  const navigate = useNavigate();
  
  if (!prediction) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Career Prediction
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Complete your career assessment to see predictions
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/career-assessment')}
          >
            Take Assessment
          </Button>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Career Prediction
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Your Next Career Move
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WorkIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="span">
            {prediction.next_role}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TimelineIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Estimated timeline: {prediction.timeline}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Skills to Develop
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {prediction.key_skills_to_develop.map((skill, index) => (
            <Chip 
              key={index} 
              label={skill} 
              icon={<CodeIcon />} 
              variant="outlined" 
              color="primary"
              size="small"
              onClick={() => navigate(`/learning-resources?skill=${skill}`)}
            />
          ))}
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Potential Salary Increase
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon color="success" sx={{ mr: 0.5 }} />
              <Typography variant="h6" color="success.main">
                {prediction.potential_salary_increase}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Industry Outlook
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="info" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {prediction.industry_outlook}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/career-explorer')}
        >
          Explore Career Paths
        </Button>
      </Box>
    </Paper>
  );
};

export default CareerPredictionSection; 