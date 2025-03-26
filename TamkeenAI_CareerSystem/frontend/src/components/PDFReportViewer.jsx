import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Slider,
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Backdrop,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import CloseIcon from '@mui/icons-material/Close';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFReportViewer = ({ pdfUrl, title, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Handle fullscreen mode key events
    const handleKeyDown = (e) => {
      if (e.keyCode === 27 && isFullscreen) { // Escape key
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    // Create a link and click it to download the PDF
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title || 'career_report'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Report downloaded successfully!', 'success');
  };

  const handlePrint = () => {
    // Open the PDF in a new window and trigger print
    const printWindow = window.open(pdfUrl, '_blank');
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  const handleShareClick = (event) => {
    setShareAnchorEl(event.currentTarget);
  };
  
  const handleShareClose = () => {
    setShareAnchorEl(null);
  };
  
  const handleEmailDialogOpen = () => {
    handleShareClose();
    setEmailDialogOpen(true);
  };
  
  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
  };
  
  const handleShareViaSocial = (platform) => {
    handleShareClose();
    
    const shareText = `Check out my Career Development Report: ${title}`;
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification(`Shared on ${platform}!`, 'success');
  };
  
  const handleSendEmail = () => {
    // This would connect to a backend service to send the email
    console.log(`Sending PDF to: ${emailAddress}`);
    setEmailDialogOpen(false);
    showNotification(`Report sent to ${emailAddress}`, 'success');
  };
  
  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isFullscreen}
        onClick={toggleFullscreen}
      >
        <Paper 
          sx={{ 
            p: 2, 
            maxWidth: '95vw',
            maxHeight: '95vh',
            overflowY: 'auto',
            backgroundColor: 'white',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={e => e.stopPropagation()}
        >
          <IconButton 
            onClick={toggleFullscreen}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<CircularProgress />}
            error={<Typography color="error">Failed to load PDF</Typography>}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
            <IconButton onClick={handlePrevPage} disabled={pageNumber <= 1}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography>
              Page {pageNumber} of {numPages || '?'}
            </Typography>
            <IconButton onClick={handleNextPage} disabled={!numPages || pageNumber >= numPages}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Paper>
      </Backdrop>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title || 'Career Development Report'}</Typography>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Toolbar */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mb: 2, 
            pb: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}
        >
          {/* Zoom Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
            <Slider
              value={scale * 100}
              min={50}
              max={300}
              step={10}
              onChange={(_, value) => setScale(value / 100)}
              sx={{ width: 120 }}
              valueLabelDisplay="auto"
              valueLabelFormat={x => `${x}%`}
            />
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download PDF">
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={handleDownload}
                variant="outlined"
                size="small"
              >
                Download
              </Button>
            </Tooltip>
            
            <Tooltip title="Share Report">
              <Button 
                startIcon={<ShareIcon />} 
                onClick={handleShareClick}
                variant="outlined"
                size="small"
              >
                Share
              </Button>
            </Tooltip>
            
            <Tooltip title="Print Report">
              <IconButton onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Fullscreen">
              <IconButton onClick={toggleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
        
        {/* PDF Viewer */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            bgcolor: '#f5f5f5',
            minHeight: 400,
            overflow: 'auto'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<CircularProgress />}
              error={<Typography color="error">Failed to load PDF</Typography>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          )}
        </Box>
        
        {/* Page Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
          <IconButton onClick={handlePrevPage} disabled={pageNumber <= 1}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography>
            Page {pageNumber} of {numPages || '?'}
          </Typography>
          <IconButton onClick={handleNextPage} disabled={!numPages || pageNumber >= numPages}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Share Menu */}
      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
      >
        <MenuItem onClick={() => handleShareViaSocial('linkedin')}>
          <ListItemIcon>
            <LinkedInIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>LinkedIn</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareViaSocial('twitter')}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareViaSocial('facebook')}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareViaSocial('whatsapp')}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleEmailDialogOpen}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={handleEmailDialogClose}>
        <DialogTitle>Send Report via Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailDialogClose}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PDFReportViewer;
