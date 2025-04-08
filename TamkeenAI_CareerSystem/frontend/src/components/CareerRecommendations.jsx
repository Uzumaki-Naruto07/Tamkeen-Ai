import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip
} from '@mui/material';
import { CheckCircle, Business, Work } from '@mui/icons-material';

/**
 * Component to display career recommendations based on assessment results
 */
const CareerRecommendations = ({ recommendedCareers = [] }) => {
  // If no careers are provided, show a placeholder message
  if (!recommendedCareers || recommendedCareers.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Career Recommendations</Typography>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            Complete the Career Prediction assessment to see your personalized career recommendations.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Your Career Recommendations</Typography>
      <Typography paragraph>
        Based on your personality traits, interests, values, and skills, here are your top career matches:
      </Typography>
      
      <Grid container spacing={3}>
        {recommendedCareers.map((career, index) => (
          <Grid item xs={12} md={4} key={`career-${index}`}>
            <Card 
              elevation={4} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderTop: '5px solid',
                borderColor: index === 0 ? 'success.main' : index === 1 ? 'primary.main' : 'secondary.main'
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: index === 0 ? 'success.main' : index === 1 ? 'primary.main' : 'secondary.main' }}>
                    {index === 0 ? <CheckCircle /> : <Business />}
                  </Avatar>
                }
                title={career.title}
                subheader={
                  <Chip 
                    label={`${career.match}% Match`} 
                    color={index === 0 ? 'success' : index === 1 ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {career.description || "This career matches your assessment profile based on your skills, interests, and values."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" color="primary">
          Next Steps
        </Typography>
        <Typography paragraph>
          To explore these career paths further:
        </Typography>
        <ul>
          <li>Research each career to understand daily responsibilities and required qualifications</li>
          <li>Connect with professionals in these fields through networking platforms</li>
          <li>Review the skill gaps identified in your assessment and create a development plan</li>
          <li>Consider job shadowing or informational interviews to gain firsthand insights</li>
        </ul>
      </Box>
    </Box>
  );
};

export default CareerRecommendations; 