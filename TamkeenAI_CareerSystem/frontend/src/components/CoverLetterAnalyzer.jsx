import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

const CoverLetterAnalyzer = ({
  jobDescription = '',
  initialContent = '',
  onAnalyze,
  onGenerate,
  onSave,
  loading = false,
  results = null
}) => {
  const [content, setContent] = useState(initialContent);
  const [jobDescText, setJobDescText] = useState(jobDescription);
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [analyzedContent, setAnalyzedContent] = useState(null);
  const [improvementMode, setImprovementMode] = useState(false);
  const [generatingImprovedVersion, setGeneratingImprovedVersion] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  
  const fileInputRef = useRef(null);

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Update job description when it changes from props
  useEffect(() => {
    if (jobDescription) {
      setJobDescText(jobDescription);
    }
  }, [jobDescription]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  // Handle analyze click
  const handleAnalyze = () => {
    if (onAnalyze && content.trim() && jobDescText.trim()) {
      onAnalyze({
        coverLetter: content,
        jobDescription: jobDescText
      });
    }
  };

  // Handle generate click
  const handleGenerate = () => {
    if (onGenerate && jobDescText.trim()) {
      onGenerate({
        jobDescription: jobDescText,
        template: selectedTemplate
      });
    }
  };

  // Handle save click
  const handleSave = () => {
    if (onSave) {
      onSave({
        content: improvementMode && analyzedContent?.improvedVersion ? analyzedContent.improvedVersion : content,
        analysis: analyzedContent
      });
      setSavedSuccessfully(true);
      setTimeout(() => setSavedSuccessfully(false), 3000);
    }
  };

  // Handle download as .docx
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([improvementMode && analyzedContent?.improvedVersion ? analyzedContent.improvedVersion : content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName || 'cover-letter.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(improvementMode && analyzedContent?.improvedVersion ? analyzedContent.improvedVersion : content);
  };

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
    // If the template has sample content, use it
    if (template.sampleContent) {
      setContent(template.sampleContent);
    }
  };

  // Toggle improvement mode
  const handleToggleImprovementMode = () => {
    setImprovementMode(!improvementMode);
  };

  // Request improved version
  const handleRequestImprovement = () => {
    setGeneratingImprovedVersion(true);
    // Simulate generating improved version (in real app, this would call an API)
    setTimeout(() => {
      if (analyzedContent) {
        setAnalyzedContent({
          ...analyzedContent,
          improvedVersion: generateImprovedVersion(content, analyzedContent)
        });
      }
      setGeneratingImprovedVersion(false);
      setImprovementMode(true);
    }, 2000);
  };

  // Simulate improved version generation (in real app, this would be done by the AI model)
  const generateImprovedVersion = (originalContent, analysis) => {
    // This is a placeholder. In a real app, this would be replaced by actual AI-generated content
    return originalContent
      .replace(
        "I am writing to apply",
        "I am writing to express my strong interest in applying"
      )
      .replace(
        "I have experience",
        "I have extensive experience"
      )
      .replace(
        "I believe I am a good fit",
        "With my background and skills in " + analysis.relevantSkills?.join(", ") + ", I am confident that I am an excellent fit"
      );
  };

  // Sample templates (in real app, these might come from an API)
  const coverLetterTemplates = [
    {
      id: 1,
      name: "Standard Professional",
      description: "A classic, straightforward cover letter suitable for most industries",
      sampleContent: `Dear Hiring Manager,

I am writing to express my interest in the [Position] role at [Company]. With [X] years of experience in [Industry/Field], I am confident in my ability to contribute effectively to your team.

In my previous role at [Previous Company], I [key achievement or responsibility]. I also [another achievement or responsibility], which resulted in [positive outcome].

I am particularly drawn to [Company] because [specific reason]. Your company's commitment to [value or goal] aligns perfectly with my professional values.

I look forward to the opportunity to discuss how my skills and experience can benefit [Company]. Thank you for considering my application.

Sincerely,
[Your Name]`
    },
    {
      id: 2,
      name: "Creative/Design Industry",
      description: "A more expressive template for creative roles and design positions",
      sampleContent: `Hello [Recipient's Name],

When I discovered the [Position] opening at [Company], I knew it was the perfect opportunity to combine my passion for [skill/interest] with my expertise in [relevant field].

My creative journey includes [brief overview of relevant experience]. Most recently at [Current/Previous Company], I [specific achievement] that [positive outcome]. My portfolio, which I've attached, showcases my approach to [relevant skill or task].

What excites me most about [Company] is [specific aspect of company]. I admire how your team [something specific about their work or approach], and I'd love to contribute my unique perspective to your future projects.

I'm eager to discuss how my creative vision aligns with [Company]'s innovative approach. Thank you for considering my application.

Creatively yours,
[Your Name]`
    },
    {
      id: 3,
      name: "Technical/IT Position",
      description: "Focused on technical skills and accomplishments for IT and engineering roles",
      sampleContent: `Dear [Recipient's Name],

I am applying for the [Position] role at [Company] that I found on [job board/website]. With a [degree] in [field] and [X] years of experience in [specific technical area], I offer the technical expertise and problem-solving abilities this position requires.

My technical skills include:
• [Technical skill/language/tool]
• [Technical skill/language/tool]
• [Technical skill/language/tool]

At [Current/Previous Company], I [technical achievement] which [result, preferably with metrics]. I also collaborated with [teams/departments] to [another achievement].

I'm particularly interested in joining [Company] because of your work in [specific project or technology]. I've followed your developments in [industry area] and would be excited to contribute to innovations like [specific product or service].

I welcome the opportunity to discuss how my technical capabilities can help [Company] achieve its objectives.

Regards,
[Your Name]`
    }
  ];

  // Render template selection dialog
  const renderTemplateDialog = () => (
    <Dialog
      open={showTemplates}
      onClose={() => setShowTemplates(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Choose a Cover Letter Template</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {coverLetterTemplates.map(template => (
            <Grid item xs={12} md={4} key={template.id}>
              <Card
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  },
                  ...(selectedTemplate?.id === template.id ? {
                    borderColor: 'primary.main',
                    borderWidth: 2
                  } : {})
                }}
                onClick={() => handleSelectTemplate(template)}
              >
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                  <Button
                    size="small"
                    sx={{ mt: 2 }}
                    startIcon={<VisibilityIcon />}
                  >
                    Preview
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowTemplates(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );

  // Render tabs for editor and analysis
  const renderTabs = () => (
    <Tabs
      value={activeTab}
      onChange={(e, newValue) => setActiveTab(newValue)}
      sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
    >
      <Tab label="Editor" />
      <Tab label="Analysis" disabled={!analyzedContent} />
      {analyzedContent?.improvedVersion && (
        <Tab label="Comparison" />
      )}
    </Tabs>
  );

  // Render editor tab
  const renderEditorTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Job Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Paste the job description here to optimize your cover letter..."
            value={jobDescText}
            onChange={(e) => setJobDescText(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              Cover Letter
            </Typography>
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
              />
              <Tooltip title="Upload file">
                <IconButton size="small" onClick={triggerFileInput}>
                  <UploadFileIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Paste from clipboard">
                <IconButton size="small" onClick={handlePaste}>
                  <ContentPasteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Use a template">
                <IconButton size="small" onClick={() => setShowTemplates(true)}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={12}
            placeholder="Write or paste your cover letter here..."
            value={improvementMode && analyzedContent?.improvedVersion ? analyzedContent.improvedVersion : content}
            onChange={(e) => {
              if (improvementMode) {
                setAnalyzedContent({
                  ...analyzedContent,
                  improvedVersion: e.target.value
                });
              } else {
                setContent(e.target.value);
              }
            }}
            variant="outlined"
            size="small"
          />
          <FormControlLabel
            control={
              <Switch
                checked={improvementMode}
                onChange={handleToggleImprovementMode}
                disabled={!analyzedContent?.improvedVersion}
              />
            }
            label="Show improved version"
            sx={{ mt: 1 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Box>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={handleAnalyze}
            disabled={loading || !content.trim() || !jobDescText.trim()}
            sx={{ mr: 1 }}
          >
            Analyze
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoFixHighIcon />}
            onClick={handleRequestImprovement}
            disabled={loading || !analyzedContent || generatingImprovedVersion}
            sx={{ mr: 1 }}
          >
            {generatingImprovedVersion ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Improving...
              </>
            ) : (
              "Improve Letter"
            )}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TipsAndUpdatesIcon />}
            onClick={handleGenerate}
            disabled={loading || !jobDescText.trim()}
          >
            Generate New
          </Button>
        </Box>
        <Box>
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={handleCopyToClipboard} sx={{ mr: 1 }}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ mr: 1 }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            color={savedSuccessfully ? "success" : "primary"}
          >
            {savedSuccessfully ? (
              <>
                <CheckCircleIcon sx={{ mr: 1 }} />
                Saved
              </>
            ) : (
              "Save Letter"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // Render analysis tab
  const renderAnalysisTab = () => {
    if (!analyzedContent) return null;

    const {
      score,
      relevantSkills = [],
      missingSkills = [],
      relevanceScore,
      professionalism,
      lengthAssessment,
      tone,
      strengths = [],
      weaknesses = [],
      recommendations = []
    } = analyzedContent;

    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ATS Compatibility Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={score}
                      size={80}
                      thickness={4}
                      color={score > 75 ? "success" : score > 50 ? "warning" : "error"}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" component="div" color="text.secondary">
                        {score}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {score > 75
                        ? "Excellent! Your cover letter is highly optimized."
                        : score > 50
                        ? "Good start, but there's room for improvement."
                        : "Your cover letter needs significant improvement."}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Key Metrics:
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Relevance:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={relevanceScore}
                      color={relevanceScore > 75 ? "success" : relevanceScore > 50 ? "warning" : "error"}
                      sx={{ height: 8, borderRadius: 5, my: 0.5 }}
                    />
                    <Typography variant="body2" align="right">
                      {relevanceScore}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Professionalism:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={professionalism}
                      color={professionalism > 75 ? "success" : professionalism > 50 ? "warning" : "error"}
                      sx={{ height: 8, borderRadius: 5, my: 0.5 }}
                    />
                    <Typography variant="body2" align="right">
                      {professionalism}%
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={<FormatColorTextIcon />}
                    label={`Tone: ${tone || 'Professional'}`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<InfoOutlinedIcon />}
                    label={lengthAssessment || 'Good length'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Keyword Analysis
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Matched Keywords:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {relevantSkills.length > 0 ? (
                    relevantSkills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="success"
                        variant="outlined"
                        size="small"
                        icon={<CheckCircleIcon />}
                        sx={{ m: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No matching keywords found.
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Missing Keywords:
                </Typography>
                <Box>
                  {missingSkills.length > 0 ? (
                    missingSkills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="error"
                        variant="outlined"
                        size="small"
                        icon={<ErrorOutlineIcon />}
                        sx={{ m: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Great! You've covered all important keywords.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Strengths & Weaknesses
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <SentimentSatisfiedAltIcon sx={{ mr: 1 }} fontSize="small" />
                  Strengths:
                </Typography>
                <List dense disablePadding sx={{ mb: 2 }}>
                  {strengths.length > 0 ? (
                    strengths.map((strength, index) => (
                      <ListItem key={index} disablePadding sx={{ pl: 2 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={strength}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                      No specific strengths identified.
                    </Typography>
                  )}
                </List>
                
                <Typography variant="subtitle2" gutterBottom color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                  <SentimentVeryDissatisfiedIcon sx={{ mr: 1 }} fontSize="small" />
                  Weaknesses:
                </Typography>
                <List dense disablePadding>
                  {weaknesses.length > 0 ? (
                    weaknesses.map((weakness, index) => (
                      <ListItem key={index} disablePadding sx={{ pl: 2 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <ErrorOutlineIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={weakness}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                      No specific weaknesses identified.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TipsAndUpdatesIcon sx={{ mr: 1 }} />
                  Recommendations
                </Typography>
                
                <List dense disablePadding>
                  {recommendations.length > 0 ? (
                    recommendations.map((recommendation, index) => (
                      <ListItem key={index} disablePadding sx={{ pl: 2, mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <InfoOutlinedIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={recommendation}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No specific recommendations available.
                    </Typography>
                  )}
                </List>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleRequestImprovement}
                    disabled={generatingImprovedVersion}
                  >
                    {generatingImprovedVersion ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Generating Improved Version...
                      </>
                    ) : (
                      "Generate Improved Version"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Render comparison tab
  const renderComparisonTab = () => {
    if (!analyzedContent?.improvedVersion) return null;
    
    // In a real app, this would use a proper diff viewer component
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Original Version
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 2, height: '400px', overflow: 'auto', bgcolor: '#f5f5f5' }}
          >
            <Typography variant="body2" whiteSpace="pre-wrap">
              {content}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Improved Version
          </Typography>
          <Paper
            variant="outlined"
            sx={{ p: 2, height: '400px', overflow: 'auto', bgcolor: '#f8f8ff' }}
          >
            <Typography variant="body2" whiteSpace="pre-wrap">
              {analyzedContent.improvedVersion}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Cover Letter Analyzer & Optimizer
        </Typography>
        <Chip 
          icon={<PlaylistAddCheckIcon />} 
          label="AI-Powered Analysis" 
          color="primary" 
          variant="outlined" 
        />
      </Box>
      
      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}
      
      {renderTabs()}
      
      {activeTab === 0 && renderEditorTab()}
      {activeTab === 1 && renderAnalysisTab()}
      {activeTab === 2 && renderComparisonTab()}
      
      {renderTemplateDialog()}
    </Paper>
  );
};

export default CoverLetterAnalyzer; 