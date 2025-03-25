import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from 'chart.js';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Register required Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const SkillGapRadar = ({ skillGapData, onAddSkill }) => {
  if (!skillGapData || !skillGapData.labels || !skillGapData.resumeScores || !skillGapData.jobScores) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No skill gap data available
        </Typography>
      </Paper>
    );
  }

  const { labels, resumeScores, jobScores, criticalSkills = [], recommendations = [] } = skillGapData;

  // Prepare data for radar chart
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Your Resume',
        data: resumeScores,
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(53, 162, 235, 1)',
        pointRadius: 4,
      },
      {
        label: 'Job Requirements',
        data: jobScores,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2,
          backdropColor: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            const datasetLabel = context.dataset.label;
            const value = context.raw;
            return `${datasetLabel}: ${value}/10`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Calculate skill gaps
  const skillGaps = labels.map((skill, index) => ({
    skill,
    resumeScore: resumeScores[index],
    jobScore: jobScores[index],
    gap: jobScores[index] - resumeScores[index],
    isCritical: criticalSkills.includes(skill),
  })).sort((a, b) => b.gap - a.gap);

  // Filter significant gaps (gap > 2)
  const significantGaps = skillGaps.filter(item => item.gap > 2);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Skill Gap Analysis
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 350, mb: 2 }}>
            <Radar data={chartData} options={chartOptions} />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Significant Skill Gaps
          </Typography>
          
          {significantGaps.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
              No significant skill gaps found
            </Typography>
          ) : (
            <List dense>
              {significantGaps.map((gap, index) => (
                <ListItem key={index} sx={{ 
                  mb: 1, 
                  p: 1, 
                  bgcolor: gap.isCritical ? 'rgba(255,0,0,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 1, 
                  border: gap.isCritical ? '1px solid rgba(255,0,0,0.1)' : 'none'
                }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {gap.isCritical ? (
                      <ErrorIcon color="error" fontSize="small" />
                    ) : (
                      <SchoolIcon color="primary" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={gap.isCritical ? 'bold' : 'normal'}>
                          {gap.skill}
                        </Typography>
                        {gap.isCritical && (
                          <Chip 
                            label="Critical" 
                            color="error" 
                            size="small" 
                            variant="outlined"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          Gap:
                        </Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-block',
                            width: `${Math.min(gap.gap * 10, 100)}%`, 
                            height: 4, 
                            bgcolor: gap.isCritical ? 'error.main' : 'warning.main',
                            borderRadius: 5,
                            mr: 1
                          }} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          {gap.gap.toFixed(1)} / 10
                        </Typography>
                      </Box>
                    }
                  />
                  {onAddSkill && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color={gap.isCritical ? "error" : "primary"}
                      onClick={() => onAddSkill(gap.skill)}
                      sx={{ ml: 1, minWidth: 0, px: 1 }}
                    >
                      Add
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Skill Development Recommendations
        </Typography>
        
        {recommendations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
            No recommendations available
          </Typography>
        ) : (
          <List>
            {recommendations.map((recommendation, index) => (
              <ListItem key={index} sx={{ px: 0, py: 1 }}>
                <ListItemIcon>
                  <WorkIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={recommendation.title}
                  secondary={recommendation.description}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      
      {/* Compare feature tag cloud */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Skills Comparison
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Strong Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skillGaps
                .filter(item => item.resumeScore >= item.jobScore || item.resumeScore >= 8)
                .map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill.skill}
                    icon={<CheckCircleIcon />}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                ))
              }
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Skills to Develop
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {significantGaps.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill.skill}
                  icon={<SchoolIcon />}
                  color={skill.isCritical ? "error" : "primary"}
                  size="small"
                  variant={skill.isCritical ? "default" : "outlined"}
                  onClick={onAddSkill ? () => onAddSkill(skill.skill) : undefined}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SkillGapRadar;
