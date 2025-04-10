import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import { CheckCircle, Business, Work, WorkOutline, SchoolOutlined, TrendingUp, Grade, ArrowForward, ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Component to display career recommendations based on assessment results
 */
const CareerRecommendations = ({ recommendedCareers = [] }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  // If no careers are provided, show a placeholder message
  if (!recommendedCareers || recommendedCareers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          {i18n.language === 'ar' ? 'لم يتم تقديم توصيات مهنية' : 'No career recommendations provided'}
        </Typography>
        <Typography color="text.secondary">
          {i18n.language === 'ar' 
            ? 'يرجى إكمال التقييم للحصول على توصيات مهنية مخصصة' 
            : 'Please complete the assessment to get personalized career recommendations'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        {i18n.language === 'ar' ? 'توصيات المسار المهني بناءً على نتائج التقييم' : 'Career Recommendations Based on Assessment Results'}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        {i18n.language === 'ar' 
          ? 'بناءً على إجاباتك في التقييم، نعتقد أن المسارات المهنية التالية قد تكون مناسبة لمهاراتك واهتماماتك وقيمك. استكشف كل منها لمعرفة المزيد.' 
          : 'Based on your assessment responses, we believe the following career paths could be well-suited to your skills, interests, and values. Explore each one to learn more.'}
      </Typography>
      
      <Grid container spacing={3}>
        {recommendedCareers.slice(0, expanded ? recommendedCareers.length : 3).map((career, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 12px 20px -10px ${theme.palette.primary.main}40`,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {i18n.language === 'ar' ? career.titleAr || career.title : career.title}
                  </Typography>
                  <Chip 
                    label={career.match ? `${career.match}%` : '90%+'}
                    color="primary" 
                    size="small"
                    icon={<Grade fontSize="small" />}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {i18n.language === 'ar' ? career.descriptionAr || career.description : career.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {i18n.language === 'ar' ? 'المهارات الرئيسية:' : 'Key Skills:'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {career.skills?.map((skill, idx) => (
                      <Chip key={idx} label={i18n.language === 'ar' ? skill.nameAr || skill.name : skill.name} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WorkOutline fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {i18n.language === 'ar' ? 'مسار النمو:' : 'Growth Track:'} 
                      <span style={{ fontWeight: 500 }}> {i18n.language === 'ar' ? career.growthTrackAr || career.growthTrack : career.growthTrack}</span>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SchoolOutlined fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {i18n.language === 'ar' ? 'التعليم المطلوب:' : 'Required Education:'} 
                      <span style={{ fontWeight: 500 }}> {i18n.language === 'ar' ? career.educationAr || career.education : career.education}</span>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp fontSize="small" color="primary" />
                    <Typography variant="body2">
                      {i18n.language === 'ar' ? 'الطلب في السوق:' : 'Market Demand:'} 
                      <span style={{ fontWeight: 500 }}> {i18n.language === 'ar' ? career.demandAr || career.demand : career.demand}</span>
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Button 
                  variant="text" 
                  endIcon={i18n.language === 'ar' ? <ArrowBack /> : <ArrowForward />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {i18n.language === 'ar' ? 'استكشاف هذا المسار' : 'Explore this path'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {recommendedCareers.length > 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded 
              ? (i18n.language === 'ar' ? 'عرض أقل' : 'Show Less') 
              : (i18n.language === 'ar' ? `عرض ${recommendedCareers.length - 3} المزيد` : `Show ${recommendedCareers.length - 3} More`)}
          </Button>
        </Box>
      )}
      
      <Paper sx={{ mt: 6, p: 3, bgcolor: theme.palette.primary.main + '10' }}>
        <Typography variant="h6" gutterBottom>
          {i18n.language === 'ar' ? 'الخطوات التالية' : 'Next Steps'}
        </Typography>
        <Typography variant="body2" paragraph>
          {i18n.language === 'ar' 
            ? 'استكشف هذه المسارات المهنية الموصى بها واستخدم الموارد التالية للمضي قدمًا:' 
            : 'Explore these recommended career paths and use the following resources to move forward:'}
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body2">
              {i18n.language === 'ar' 
                ? 'استكشف صفحة "نصائح التقديم" للحصول على إرشادات حول كتابة السيرة الذاتية ومقابلات العمل' 
                : 'Explore the "Application Tips" page for guidance on resume writing and job interviews'}
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body2">
              {i18n.language === 'ar' 
                ? 'تصفح "الموارد التعليمية" المتعلقة بالمسارات المهنية التي تهمك' 
                : 'Browse "Learning Resources" related to career paths that interest you'}
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              {i18n.language === 'ar' 
                ? 'اتصل بمستشار مهني للحصول على إرشادات مخصصة' 
                : 'Connect with a career advisor for personalized guidance'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CareerRecommendations; 