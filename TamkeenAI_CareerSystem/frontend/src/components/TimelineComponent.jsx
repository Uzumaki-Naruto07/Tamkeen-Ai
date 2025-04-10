import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { Paper, Typography, Box } from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  CompareArrows,
  History
} from '@mui/icons-material';

const TimelineComponent = ({ data }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'assessment':
        return <Assessment />;
      case 'improvement':
        return <TrendingUp />;
      case 'decline':
        return <TrendingDown />;
      case 'comparison':
        return <CompareArrows />;
      default:
        return <History />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'assessment':
        return 'primary';
      case 'improvement':
        return 'success';
      case 'decline':
        return 'error';
      case 'comparison':
        return 'info';
      default:
        return 'grey';
    }
  };

  return (
    <Timeline>
      {data.map((item, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color={getColor(item.type)}>
              {getIcon(item.type)}
            </TimelineDot>
            {index < data.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" component="h1">
                {item.title}
              </Typography>
              <Typography>{item.description}</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {item.date}
                </Typography>
              </Box>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default TimelineComponent; 