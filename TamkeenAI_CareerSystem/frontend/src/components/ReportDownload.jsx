import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Skeleton,
  Paper,
  Chip,
  Badge,
  Collapse,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import PreviewIcon from '@mui/icons-material/Preview';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import StarIcon from '@mui/icons-material/Star';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Document, Page, pdfjs } from 'react-pdf';
import LoadingSpinner from './LoadingSpinner';
import { useUser } from './AppContext';
import apiEndpoints from '../utils/api';
import PDFReportViewer from './PDFReportViewer';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Report types with their details
const REPORT_TYPES = {
  STANDARD: {
    id: 'standard',
    title: 'Career Summary Report',
    description: 'A concise overview of your career profile, key strengths, and immediate improvement areas.',
    icon: <DescriptionIcon />,
    pages: 3,
    size: '1.2 MB',
    premium: false
  },
  DETAILED: {
    id: 'detailed',
    title: 'Detailed Career Analysis',
    description: 'Comprehensive analysis with personalized insights, skill assessments, and detailed recommendations.',
    icon: <InsightsIcon />,
    pages: 10,
    size: '3.5 MB',
    premium: true
  },
  ATS: {
    id: 'ats',
    title: 'ATS Optimization Report',
    description: 'Resume analysis against ATS systems with specific keyword and formatting recommendations.',
    icon: <CheckCircleIcon />,
    pages: 5,
    size: '2.1 MB',
    premium: true
  },
  MARKET: {
    id: 'market',
    title: 'Market Positioning Report',
    description: 'Industry trends, salary benchmarks, and your competitive positioning in the job market.',
    icon: <StarIcon />,
    pages: 7,
    size: '2.8 MB',
    premium: true
  }
};

const ReportDownload = ({
  userName = "User",
  userEmail = "",
  reportId = "",
  availableReports = ['standard', 'detailed', 'ats', 'market'],
  isPremiumUser = false,
  previewUrl = null,
  onDownloadStart = () => {},
  onDownloadComplete = () => {},
  onError = () => {},
  defaultReport = 'standard',
  reportType = 'resume_analysis',
  documentId,
  includeMetrics = true,
  includeSuggestions = true,
  includeVisuals = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedReport, setSelectedReport] = useState(defaultReport);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const downloadButtonRef = useRef(null);
  const { profile } = useUser();
  
  // Use context data if not provided directly
  const name = userName || (profile ? `${profile.firstName} ${profile.lastName}` : "User");
  const email = userEmail || (profile ? profile.email : "");
  
  // Filter available reports
  const filteredReports = availableReports
    .filter(reportId => Object.keys(REPORT_TYPES).some(key => 
      REPORT_TYPES[key].id === reportId))
    .map(reportId => {
      const reportKey = Object.keys(REPORT_TYPES).find(key => 
        REPORT_TYPES[key].id === reportId);
      return REPORT_TYPES[reportKey];
    })
    .filter(report => isPremiumUser || !report.premium);

  const [showPreview, setShowPreview] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [emailForm, setEmailForm] = useState({ 
    visible: false, 
    email: '', 
    message: '',
    sending: false,
    sent: false,
    error: null
  });
  
  useEffect(() => {
    // Reset states when report changes
    setError(null);
    setSuccess(false);
    setDownloadProgress(0);
  }, [selectedReport]);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleToggleOptions = () => {
    setShowOptions(prev => !prev);
  };

  const handleReportSelect = (reportId) => {
    setSelectedReport(reportId);
    handleMenuClose();
  };

  const handlePreviewOpen = async () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    
    try {
      // Simulating preview loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPreviewLoading(false);
    } catch (err) {
      setError("Failed to load preview. Please try again.");
      setPreviewLoading(false);
    }
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const handleEmailDialogOpen = () => {
    setEmailDialogOpen(true);
    handleMenuClose();
  };

  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
    setEmailSent(false);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    setEmailForm(prev => ({ ...prev, sending: true, error: null }));
    
    try {
      // This connects to report_generator.py email functionality
      await apiEndpoints.reports.sendByEmail({
        documentId,
        reportType,
        email: emailForm.email,
        message: emailForm.message,
        options: {
          includeMetrics,
          includeSuggestions,
          includeVisuals
        }
      });
      
      setEmailForm(prev => ({ 
        ...prev, 
        sending: false, 
        sent: true,
        visible: false
      }));
    } catch (err) {
      setEmailForm(prev => ({ 
        ...prev, 
        sending: false, 
        error: err.response?.data?.message || 'Failed to send email'
      }));
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const getSelectedReportDetails = () => {
    const reportKey = Object.keys(REPORT_TYPES).find(key => 
      REPORT_TYPES[key].id === selectedReport);
    return reportKey ? REPORT_TYPES[reportKey] : REPORT_TYPES.STANDARD;
  };

  const downloadReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setDownloadProgress(0);
    
    try {
      onDownloadStart(selectedReport);
      
      // Start progress simulation
      const progressInterval = simulateProgress();
      
      // Generate the report
      const response = await apiEndpoints.reports.generate(selectedReport, {
        userId: profile?.id,
        reportType: selectedReport,
        includeDetails: true
      });
      
      // Clear progress interval
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      // Create file download from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `TamkeenAI_${selectedReport}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
      onDownloadComplete(selectedReport);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  const renderReportOption = (report) => {
    const isSelected = selectedReport === report.id;
    const isPremium = report.premium && !isPremiumUser;
    
    return (
      <Card 
        variant={isSelected ? "outlined" : "elevation"}
        elevation={isSelected ? 0 : 1}
        sx={{
          mb: 2,
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
          position: 'relative',
          opacity: isPremium ? 0.7 : 1,
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ 
              color: isSelected ? 'primary.main' : 'text.secondary',
              mr: 1.5
            }}>
              {report.icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" component="div" fontWeight={isSelected ? 'bold' : 'medium'}>
                {report.title}
              </Typography>
              {report.premium && (
                <Chip 
                  size="small" 
                  color="secondary" 
                  label="Premium" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    mt: 0.5,
                    mb: 0.5
                  }} 
                />
              )}
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {report.description}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}>
            <Box component="span">
              {report.pages} pages
            </Box>
            <Box component="span">
              {report.size}
            </Box>
          </Box>
        </CardContent>
        
        {isPremium && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(1px)',
          }}>
            <Chip
              icon={<NewReleasesIcon />}
              label="Premium Feature"
              color="secondary"
              variant="filled"
            />
          </Box>
        )}
      </Card>
    );
  };

  // Helper function to create rgba from hex color
  const alpha = (color, opacity) => {
    return theme.palette.mode === 'light'
      ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`
      : `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`;
  };

  const handleGenerateReport = async (format = 'pdf', action = 'download') => {
    if (!documentId) {
      setError('No document ID provided for report generation');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This connects to report_generator.py backend
      const response = await apiEndpoints.reports.generate({
        documentId,
        reportType,
        format,
        options: {
          includeMetrics,
          includeSuggestions,
          includeVisuals
        }
      });
      
      const reportData = response.data;
      
      if (action === 'download') {
        // Create a download link
        const link = document.createElement('a');
        link.href = reportData.reportUrl;
        link.download = reportData.fileName || `${reportType}_report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (action === 'preview') {
        setReportUrl(reportData.reportUrl);
        setShowPreview(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Download Career Report
          </Typography>
          
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            disabled={loading || generating}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
            Report downloaded successfully!
          </Alert>
        )}
        
        {filteredReports.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={handleToggleOptions}
            >
              <Typography variant="subtitle2" color="primary">
                Report Options
              </Typography>
              <IconButton size="small">
                {showOptions ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={showOptions} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2 }}>
                {filteredReports.map(report => (
                  <Box 
                    key={report.id} 
                    onClick={() => handleReportSelect(report.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {renderReportOption(report)}
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          mb: 3,
        }}>
          <PictureAsPdfIcon 
            sx={{ 
              fontSize: 40, 
              color: theme.palette.error.main,
              mr: 2
            }} 
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {getSelectedReportDetails().title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ready for download {reportId ? `(ID: ${reportId})` : ''}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading || generating ? undefined : <DownloadIcon />}
            onClick={() => handleGenerateReport('pdf', 'download')}
            disabled={loading || generating}
            ref={downloadButtonRef}
            fullWidth={isMobile}
            sx={{ minWidth: 150 }}
          >
            {generating ? (
              <>
                <CircularProgress 
                  size={20} 
                  color="inherit" 
                  sx={{ mr: 1 }} 
                />
                Generating...
              </>
            ) : loading ? (
              <>
                <CircularProgress 
                  size={20} 
                  color="inherit" 
                  sx={{ mr: 1 }} 
                />
                Downloading...
              </>
            ) : (
              'Download Report'
            )}
          </Button>
          
          {!isMobile && (
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => handleGenerateReport('pdf', 'preview')}
              disabled={loading || generating}
            >
              Preview
            </Button>
          )}
        </Box>
        
        {(loading || generating) && downloadProgress > 0 && (
          <Box sx={{ mt: 2, width: '100%', position: 'relative' }}>
            <Box sx={{ position: 'relative', height: 10, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 5, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: theme.palette.primary.main,
                  width: `${downloadProgress}%`,
                  borderRadius: 5,
                  transition: 'width 0.5s ease-in-out'
                }} 
              />
            </Box>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
              {generating ? 'Generating report...' : 'Downloading...'} {Math.round(downloadProgress)}%
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handlePreviewOpen}>
          <ListItemIcon>
            <PreviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preview Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEmailDialogOpen}>
          <ListItemIcon>
            <MailOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Email Report</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Report</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Preview: {getSelectedReportDetails().title}
          <IconButton
            aria-label="close"
            onClick={handlePreviewClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Box sx={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <LoadingSpinner message="Loading preview..." />
            </Box>
          ) : previewUrl ? (
            <Document
              file={previewUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={<LoadingSpinner message="Loading PDF..." />}
            >
              <Page pageNumber={1} width={isMobile ? 300 : 600} />
              {numPages > 1 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing 1 of {numPages} pages. Download for full report.
                  </Typography>
                </Box>
              )}
            </Document>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Preview Not Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please download the report to view its contents.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => handleGenerateReport('pdf', 'download')}
          >
            Download Full Report
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={handleEmailDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Report via Email</DialogTitle>
        <DialogContent>
          {emailSent ? (
            <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}>
              Report sent successfully to {email}!
            </Alert>
          ) : (
            <>
              <Typography variant="body2" paragraph>
                We'll send "{getSelectedReportDetails().title}" to your email address:
              </Typography>
              <Typography variant="subtitle1" fontWeight="medium">
                {email || "No email available"}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailDialogClose}>
            {emailSent ? 'Close' : 'Cancel'}
          </Button>
          {!emailSent && (
            <Button
              variant="contained"
              startIcon={emailSending ? <CircularProgress size={20} color="inherit" /> : <MailOutlineIcon />}
              onClick={handleSendEmail}
              disabled={emailSending || !email}
            >
              {emailSending ? 'Sending...' : 'Send Email'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* PDF Viewer dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Preview</DialogTitle>
        <DialogContent>
          {reportUrl && (
            <PDFReportViewer url={reportUrl} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => handleGenerateReport('pdf', 'download')}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportDownload; 