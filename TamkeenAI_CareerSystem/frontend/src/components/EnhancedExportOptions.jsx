import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
  Tooltip,
  IconButton,
  TextField,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Switch
} from '@mui/material';
import {
  PictureAsPdf,
  Description,
  Image,
  ArrowDropDown,
  Palette,
  FormatSize,
  Style,
  ColorLens,
  Download,
  Close,
  Edit,
  CloudDownload,
  FileCopy,
  Share,
  Print,
  Preview,
  TouchApp,
  Settings,
  Save,
  Check,
  Cancel
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';

/**
 * Enhanced Export Options component for exporting resumes in various formats with customization options
 */
const EnhancedExportOptions = ({
  resumeId,
  resumeData,
  loading = false
}) => {
  const theme = useTheme();
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [exportSettings, setExportSettings] = useState({
    includePhoto: true,
    includeContact: true,
    includeLinks: true,
    colorScheme: 'professional',
    fontFamily: 'roboto',
    fontSize: 'medium',
    pageSize: 'a4',
    margins: 'normal',
    headerStyle: 'standard',
    showMetrics: false,
    includeQRCode: false,
    includeCoverLetter: false,
    customizeColors: false,
    customPrimaryColor: theme.palette.primary.main,
    customSecondaryColor: theme.palette.secondary.main,
    template: 'modern',
    letterHead: false
  });
  const [coverLetterText, setCoverLetterText] = useState('');
  const [templatePreview, setTemplatePreview] = useState(null);
  
  // Available templates
  const templates = [
    { id: 'modern', name: 'Modern', image: '/templates/modern.jpg' },
    { id: 'classic', name: 'Classic', image: '/templates/classic.jpg' },
    { id: 'minimal', name: 'Minimal', image: '/templates/minimal.jpg' },
    { id: 'creative', name: 'Creative', image: '/templates/creative.jpg' },
    { id: 'professional', name: 'Professional', image: '/templates/professional.jpg' },
    { id: 'executive', name: 'Executive', image: '/templates/executive.jpg' }
  ];
  
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleFormatSelect = (format) => {
    setExportFormat(format);
    setAnchorEl(null);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleCustomizeClick = () => {
    setCustomizeDialogOpen(true);
    handleCloseMenu();
  };
  
  const handleCustomizeClose = () => {
    setCustomizeDialogOpen(false);
  };
  
  const handlePreviewClick = () => {
    setPreviewDialogOpen(true);
    // Generate a mock preview
    generatePreview();
  };
  
  const handlePreviewClose = () => {
    setPreviewDialogOpen(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const handleSettingChange = (setting, value) => {
    setExportSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const handleCheckboxChange = (setting) => (event) => {
    handleSettingChange(setting, event.target.checked);
  };
  
  const handleSelectTemplate = (templateId) => {
    handleSettingChange('template', templateId);
  };
  
  const handleCoverLetterChange = (event) => {
    setCoverLetterText(event.target.value);
  };
  
  const generatePreview = async () => {
    setExportLoading(true);
    
    try {
      // In a real implementation, this would call the backend to generate a preview
      // For development, we'll just set a timeout to simulate loading
      setTimeout(() => {
        setTemplatePreview(`/templates/${exportSettings.template}_preview.jpg`);
        setExportLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Error generating preview:', err);
      setExportError('Failed to generate preview. Please try again.');
      setExportLoading(false);
    }
  };
  
  const handleExport = async () => {
    if (!resumeId) return;
    
    setExportLoading(true);
    setExportError(null);
    
    try {
      const response = await apiEndpoints.resumes.export({
        resumeId,
        format: exportFormat,
        settings: exportSettings,
        coverLetter: exportSettings.includeCoverLetter ? coverLetterText : null
      });
      
      // Handle successful export
      // This would typically trigger a file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${resumeId}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Close dialogs
      setCustomizeDialogOpen(false);
      setPreviewDialogOpen(false);
    } catch (err) {
      console.error('Error exporting resume:', err);
      setExportError('Failed to export resume. Please try again.');
      
      // Mock successful export for development
      setTimeout(() => {
        // Simulate successful export
        alert(`Resume would be exported as ${exportFormat.toUpperCase()} with the selected settings.`);
        
        // Close dialogs
        setCustomizeDialogOpen(false);
        setPreviewDialogOpen(false);
        setExportLoading(false);
      }, 2000);
    } finally {
      setExportLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CircularProgress size={30} thickness={4} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading export options...
        </Typography>
      </Box>
    );
  }
  
  if (!resumeId) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Please select a resume to export.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <Download sx={{ mr: 1, color: theme.palette.primary.main }} />
          Enhanced Export Options
        </Typography>
      </Box>
      
      {exportError && (
        <Box sx={{ my: 2 }}>
          <Typography color="error" variant="body2">
            {exportError}
          </Typography>
        </Box>
      )}
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={exportFormat === 'pdf' ? <PictureAsPdf /> : 
                         exportFormat === 'docx' ? <Description /> : 
                         exportFormat === 'png' ? <Image /> : <CloudDownload />}
              endIcon={<ArrowDropDown />}
              onClick={handleExportClick}
              disabled={exportLoading}
            >
              Export as {exportFormat.toUpperCase()}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => handleFormatSelect('pdf')}>
                <ListItemIcon>
                  <PictureAsPdf fontSize="small" />
                </ListItemIcon>
                <ListItemText>PDF Document</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleFormatSelect('docx')}>
                <ListItemIcon>
                  <Description fontSize="small" />
                </ListItemIcon>
                <ListItemText>Word Document (DOCX)</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleFormatSelect('png')}>
                <ListItemIcon>
                  <Image fontSize="small" />
                </ListItemIcon>
                <ListItemText>Image (PNG)</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleCustomizeClick}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Customize Export Settings</ListItemText>
              </MenuItem>
            </Menu>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Preview />}
              onClick={handlePreviewClick}
              disabled={exportLoading}
            >
              Preview
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-end' },
                gap: 1
              }}
            >
              <Tooltip title="Quick Print">
                <IconButton 
                  color="primary"
                  onClick={() => window.print()}
                >
                  <Print />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy Link">
                <IconButton 
                  color="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Resume link copied to clipboard!");
                  }}
                >
                  <FileCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share Resume">
                <IconButton color="primary">
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current Template: <Chip size="small" label={templates.find(t => t.id === exportSettings.template)?.name || 'Modern'} />
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Customize Dialog */}
      <Dialog
        open={customizeDialogOpen}
        onClose={handleCustomizeClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Customize Export Settings</Typography>
          <IconButton edge="end" onClick={handleCustomizeClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Format & Style" icon={<Style />} />
            <Tab label="Content" icon={<Description />} />
            <Tab label="Templates" icon={<Palette />} />
            {exportSettings.includeCoverLetter && (
              <Tab label="Cover Letter" icon={<Edit />} />
            )}
          </Tabs>
          
          {/* Format & Style Tab */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Page Size</FormLabel>
                  <RadioGroup
                    value={exportSettings.pageSize}
                    onChange={(e) => handleSettingChange('pageSize', e.target.value)}
                  >
                    <FormControlLabel value="a4" control={<Radio />} label="A4" />
                    <FormControlLabel value="letter" control={<Radio />} label="US Letter" />
                    <FormControlLabel value="legal" control={<Radio />} label="US Legal" />
                  </RadioGroup>
                </FormControl>
                
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Font Family</FormLabel>
                  <RadioGroup
                    value={exportSettings.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  >
                    <FormControlLabel value="roboto" control={<Radio />} label="Roboto (Sans-serif)" />
                    <FormControlLabel value="georgia" control={<Radio />} label="Georgia (Serif)" />
                    <FormControlLabel value="arial" control={<Radio />} label="Arial (Sans-serif)" />
                    <FormControlLabel value="times" control={<Radio />} label="Times New Roman (Serif)" />
                  </RadioGroup>
                </FormControl>
                
                <FormControl component="fieldset">
                  <FormLabel component="legend">Margins</FormLabel>
                  <RadioGroup
                    value={exportSettings.margins}
                    onChange={(e) => handleSettingChange('margins', e.target.value)}
                  >
                    <FormControlLabel value="narrow" control={<Radio />} label="Narrow" />
                    <FormControlLabel value="normal" control={<Radio />} label="Normal" />
                    <FormControlLabel value="wide" control={<Radio />} label="Wide" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Color Scheme</FormLabel>
                  <RadioGroup
                    value={exportSettings.colorScheme}
                    onChange={(e) => handleSettingChange('colorScheme', e.target.value)}
                  >
                    <FormControlLabel value="professional" control={<Radio />} label="Professional (Blue)" />
                    <FormControlLabel value="creative" control={<Radio />} label="Creative (Purple)" />
                    <FormControlLabel value="modern" control={<Radio />} label="Modern (Teal)" />
                    <FormControlLabel value="classic" control={<Radio />} label="Classic (Black)" />
                    <FormControlLabel value="vibrant" control={<Radio />} label="Vibrant (Orange)" />
                  </RadioGroup>
                </FormControl>
                
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Font Size</FormLabel>
                  <RadioGroup
                    value={exportSettings.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  >
                    <FormControlLabel value="small" control={<Radio />} label="Small" />
                    <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                    <FormControlLabel value="large" control={<Radio />} label="Large" />
                  </RadioGroup>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportSettings.customizeColors}
                      onChange={handleCheckboxChange('customizeColors')}
                    />
                  }
                  label="Customize Colors"
                />
                
                {exportSettings.customizeColors && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Primary Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: exportSettings.customPrimaryColor,
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        />
                        <TextField
                          size="small"
                          value={exportSettings.customPrimaryColor}
                          onChange={(e) => handleSettingChange('customPrimaryColor', e.target.value)}
                          sx={{ width: 120 }}
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Secondary Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: exportSettings.customSecondaryColor,
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        />
                        <TextField
                          size="small"
                          value={exportSettings.customSecondaryColor}
                          onChange={(e) => handleSettingChange('customSecondaryColor', e.target.value)}
                          sx={{ width: 120 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
          
          {/* Content Tab */}
          {currentTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TouchApp />
                    </ListItemIcon>
                    <ListItemText primary="Include Photo" />
                    <Switch
                      edge="end"
                      checked={exportSettings.includePhoto}
                      onChange={handleCheckboxChange('includePhoto')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TouchApp />
                    </ListItemIcon>
                    <ListItemText primary="Include Contact Information" />
                    <Switch
                      edge="end"
                      checked={exportSettings.includeContact}
                      onChange={handleCheckboxChange('includeContact')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TouchApp />
                    </ListItemIcon>
                    <ListItemText primary="Include Social Links" />
                    <Switch
                      edge="end"
                      checked={exportSettings.includeLinks}
                      onChange={handleCheckboxChange('includeLinks')}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TouchApp />
                    </ListItemIcon>
                    <ListItemText primary="Include QR Code" secondary="Add QR code linking to your online profile" />
                    <Switch
                      edge="end"
                      checked={exportSettings.includeQRCode}
                      onChange={handleCheckboxChange('includeQRCode')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TouchApp />
                    </ListItemIcon>
                    <ListItemText primary="Show Metrics" secondary="Include skills proficiency levels" />
                    <Switch
                      edge="end"
                      checked={exportSettings.showMetrics}
                      onChange={handleCheckboxChange('showMetrics')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TouchApp />
                    </ListItemIcon>
                    <ListItemText primary="Include Cover Letter" secondary="Add a customized cover letter" />
                    <Switch
                      edge="end"
                      checked={exportSettings.includeCoverLetter}
                      onChange={handleCheckboxChange('includeCoverLetter')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TouchApp />
                    </ListItemIcon>
                    <ListItemText primary="Use Letterhead" secondary="Include company letterhead" />
                    <Switch
                      edge="end"
                      checked={exportSettings.letterHead}
                      onChange={handleCheckboxChange('letterHead')}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
          
          {/* Templates Tab */}
          {currentTab === 2 && (
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: exportSettings.template === template.id ? 
                        `2px solid ${theme.palette.primary.main}` : 
                        `1px solid ${theme.palette.divider}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={template.image}
                      alt={template.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="subtitle1">{template.name}</Typography>
                        {exportSettings.template === template.id && (
                          <Check color="primary" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Cover Letter Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Customize Your Cover Letter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add a personalized cover letter to be included with your resume.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                placeholder="Enter your cover letter content here..."
                value={coverLetterText}
                onChange={handleCoverLetterChange}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCustomizeClose} 
            color="inherit"
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePreviewClick}
            startIcon={<Preview />}
            disabled={exportLoading}
          >
            Preview
          </Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
            disabled={exportLoading}
          >
            {exportLoading ? 'Processing...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={handlePreviewClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Export Preview</Typography>
          <IconButton edge="end" onClick={handlePreviewClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {exportLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body1" sx={{ mt: 3 }}>
                Generating preview...
              </Typography>
            </Box>
          ) : templatePreview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src={templatePreview} 
                alt="Resume Preview" 
                style={{ maxWidth: '100%', height: 'auto', boxShadow: theme.shadows[3] }} 
              />
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Preview not available. Please try again.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose} color="inherit">
            Close
          </Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
            disabled={exportLoading}
          >
            {exportLoading ? 'Processing...' : `Export as ${exportFormat.toUpperCase()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedExportOptions; 