import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import InfoIcon from '@mui/icons-material/Info';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DashboardReportExporter = ({ userData }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [insightPreviewOpen, setInsightPreviewOpen] = useState(false);

  // Report sections that can be included
  const [selectedSections, setSelectedSections] = useState({
    skillProgress: true,
    careerPath: true,
    jobApplications: true,
    learningRoadmap: true,
    skillGaps: true,
    marketInsights: false,
    aiRecommendations: true
  });

  // AI-generated insights for demonstration
  const aiInsights = {
    skillProgress: "You've shown consistent improvement in Python and Data Analysis skills over the last 3 months, with a 32% increase in proficiency scores. Recommendation: Continue focusing on Deep Learning to complement these skills.",
    careerPath: "Based on your skill progression and market trends, your career trajectory aligns well with Data Scientist and ML Engineer roles. Your networking activities should target professionals in these domains.",
    jobApplications: "Your application success rate is 15%, above the average of 12% for similar profiles. Applications highlighting your practical projects receive 40% more responses.",
    learningRoadmap: "You're ahead of schedule on your Machine Learning roadmap but could benefit from additional focus on MLOps and model deployment skills based on your target roles.",
    skillGaps: "Key skill gaps for your target AI Engineer position: Docker/Kubernetes (critical), Cloud Deployment, and Enterprise ML Frameworks. Focus on these to increase employment opportunities by 45%.",
    marketInsights: "The UAE tech sector shows a 22% growth in AI-related roles this quarter, with highest demand in Dubai and Abu Dhabi. Fintech and healthcare sectors are particularly seeking AI talent.",
    aiRecommendations: "Your profile shows strong theoretical knowledge but would benefit from more practical implementation experience. We recommend 3 specific projects that could strengthen your portfolio."
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFormatSelect = (format) => {
    setExportFormat(format);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSectionToggle = (section) => {
    setSelectedSections({
      ...selectedSections,
      [section]: !selectedSections[section]
    });
  };

  const handleExport = () => {
    setLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setLoading(false);
      setDialogOpen(false);
      
      setSnackbarMessage(`${exportFormat === 'pdf' ? 'PDF' : 'CSV'} report exported successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // In a real implementation, this would generate and download the file
      // window.open('/api/reports/download?format=' + exportFormat, '_blank');
    }, 2000);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-5px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          {t('dashboardReport.title', 'Dashboard Report')}
        </Typography>
        <Box>
          <Tooltip title={t('dashboardReport.previewInsights', 'Preview AI insights')}>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<InfoIcon />} 
              sx={{ mr: 1 }}
              onClick={() => setInsightPreviewOpen(true)}
            >
              {t('dashboardReport.previewInsightsButton', 'Preview Insights')}
            </Button>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleExportClick}
          >
            {t('dashboardReport.exportReport', 'Export Report')}
          </Button>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('dashboardReport.exportDescription', 'Export your career progress report to share with mentors or employers.')}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => handleFormatSelect('pdf')}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <PictureAsPdfIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            </motion.div>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>PDF Report</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Complete report with visualizations and AI insights
            </Typography>
          </Paper>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => handleFormatSelect('csv')}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <TableChartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            </motion.div>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>CSV Export</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Raw data for custom analysis or integration
            </Typography>
          </Paper>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
            <SummarizeIcon fontSize="small" sx={{ mr: 1 }} />
            {t('dashboardReport.availableSections', 'Available Report Sections')}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(selectedSections).map(([key, value]) => (
              <Tooltip 
                key={key} 
                title={`${value ? 'Will be included' : 'Click to include'} in your report`}
                arrow
              >
                <Box 
                  sx={{ 
                    px: 1.5, 
                    py: 0.7, 
                    bgcolor: value ? 'primary.light' : 'action.selected', 
                    color: value ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: value ? 'primary.main' : 'action.hover',
                    }
                  }}
                  onClick={() => handleSectionToggle(key)}
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </Box>
      
      {/* Export Format Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleFormatSelect('pdf')}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFormatSelect('csv')}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Export Configuration Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('dashboardReport.configureReport', 'Configure Report Export')}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" paragraph>
            {t('dashboardReport.selectSections', 'Select sections to include in your report:')}
          </Typography>
          
          <FormGroup>
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={selectedSections.skillProgress} 
                  onChange={() => handleSectionToggle('skillProgress')} 
                />
              } 
              label="Skill Progress Analysis" 
            />
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={selectedSections.careerPath} 
                  onChange={() => handleSectionToggle('careerPath')} 
                />
              } 
              label="Career Path Projections" 
            />
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={selectedSections.jobApplications} 
                  onChange={() => handleSectionToggle('jobApplications')} 
                />
              } 
              label="Job Application Performance" 
            />
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={selectedSections.learningRoadmap} 
                  onChange={() => handleSectionToggle('learningRoadmap')} 
                />
              } 
              label="Learning Roadmap Progress" 
            />
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={selectedSections.skillGaps} 
                  onChange={() => handleSectionToggle('skillGaps')} 
                />
              } 
              label="Skill Gap Analysis" 
            />
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={selectedSections.marketInsights} 
                  onChange={() => handleSectionToggle('marketInsights')} 
                />
              } 
              label="UAE Market Insights" 
            />
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={selectedSections.aiRecommendations} 
                  onChange={() => handleSectionToggle('aiRecommendations')} 
                />
              } 
              label="AI Personalized Recommendations" 
            />
          </FormGroup>
          
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>AI-powered insights</strong> are included in all reports, providing tailored analysis based on your data.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleExport} 
            disabled={loading || !Object.values(selectedSections).some(v => v)}
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {loading ? 'Generating...' : `Export ${exportFormat === 'pdf' ? 'PDF' : 'CSV'}`}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* AI Insights Preview Dialog */}
      <Dialog open={insightPreviewOpen} onClose={() => setInsightPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} color="primary" />
            AI-Generated Insights Preview
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" paragraph>
            These insights will be included in your exported report, providing personalized analysis of your career data:
          </Typography>
          
          {Object.entries(aiInsights).map(([key, value]) => (
            <Paper key={key} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {key.replace(/([A-Z])/g, ' $1').trim()} Analysis
              </Typography>
              <Typography variant="body2">{value}</Typography>
            </Paper>
          ))}
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Summary Recommendation
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Focus on MLOps skills (Docker/Kubernetes) and practical implementations of your AI knowledge to maximize employability. Your Python and Data Analysis skills are strong foundations - building more complex projects that demonstrate practical application will differentiate your profile in the UAE tech market.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInsightPreviewOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setInsightPreviewOpen(false);
              handleFormatSelect('pdf');
            }}
            startIcon={<DownloadIcon />}
          >
            Generate Full Report
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Notification */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DashboardReportExporter; 