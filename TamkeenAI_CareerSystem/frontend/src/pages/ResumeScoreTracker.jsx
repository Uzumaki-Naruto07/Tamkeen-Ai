import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Tooltip,
  TextField, InputAdornment, Badge, Tab, Tabs, Collapse
} from '@mui/material';
import {
  Timeline as TimelineIcon, BarChart, Assessment, TrendingUp, TrendingDown,
  History, CompareArrows, Download, Visibility, VisibilityOff, Print,
  FilterList, DateRange, Share, CloudDownload, Info, Star, StarBorder,
  CheckCircle, MoreVert, ArrowUpward, ArrowDownward, Error as ErrorIcon,
  Warning, WbIncandescent, Assignment, Compare, Delete, Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, subDays, parseISO } from 'date-fns';

// Charts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, ReferenceLine, Area,
  AreaChart, Scatter, ScatterChart, ZAxis, Cell, Radar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Custom Components
import SkillChip from '../components/SkillChip';
import ScoreGauge from '../components/ScoreGauge';
import TimelineComponent from '../components/TimelineComponent';

const ResumeScoreTracker = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareResumeId, setCompareResumeId] = useState(null);
  const [compareResume, setCompareResume] = useState(null);
  const [visibleMetrics, setVisibleMetrics] = useState({
    atsScore: true,
    keywordMatch: true,
    formatScore: true,
    contentScore: true,
    relevanceScore: true
  });
  const [dateRange, setDateRange] = useState('6month'); // all, 1month, 3month, 6month, 1year
  const [activeTab, setActiveTab] = useState(0); // 0: Timeline, 1: Metrics, 2: Versions
  const [currentResumeVersions, setCurrentResumeVersions] = useState([]);
  const [improvementTipsOpen, setImprovementTipsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Load score history
  useEffect(() => {
    const loadScoreHistory = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.resumes.getScoreHistory(profile.id);
        
        // Ensure scores are sorted by date
        const sortedScores = response.data.sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        setScoreHistory(sortedScores);
        
        // Set the most recent resume as selected by default
        if (sortedScores.length > 0) {
          const mostRecent = sortedScores[sortedScores.length - 1];
          setSelectedResumeId(mostRecent.id);
          setSelectedResume(mostRecent);
          
          // Load versions for this resume
          const versionsResponse = await apiEndpoints.resumes.getVersions(mostRecent.id);
          setCurrentResumeVersions(versionsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading resume score history:', err);
        setError('Failed to load resume score history. Please try again later.');
        setLoading(false);
      }
    };
    
    loadScoreHistory();
  }, [profile?.id]);
  
  // Filter data based on date range
  const getFilteredScoreHistory = () => {
    if (dateRange === 'all') return scoreHistory;
    
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case '1month':
        startDate = subDays(now, 30);
        break;
      case '3month':
        startDate = subDays(now, 90);
        break;
      case '6month':
        startDate = subDays(now, 180);
        break;
      case '1year':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 180); // Default to 6 months
    }
    
    return scoreHistory.filter(item => new Date(item.date) >= startDate);
  };
  
  // Handle resume selection
  const handleResumeSelect = async (id) => {
    if (comparisonMode) {
      setCompareResumeId(id);
      const selectedForComparison = scoreHistory.find(item => item.id === id);
      setCompareResume(selectedForComparison);
    } else {
      setSelectedResumeId(id);
      const selected = scoreHistory.find(item => item.id === id);
      setSelectedResume(selected);
      
      // Load versions for this resume
      try {
        const versionsResponse = await apiEndpoints.resumes.getVersions(id);
        setCurrentResumeVersions(versionsResponse.data);
      } catch (err) {
        console.error('Error loading resume versions:', err);
      }
    }
  };
  
  // Toggle comparison mode
  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      // When enabling comparison mode, default the comparison resume to the one before selected
      const currentIndex = scoreHistory.findIndex(item => item.id === selectedResumeId);
      if (currentIndex > 0) {
        const prevResume = scoreHistory[currentIndex - 1];
        setCompareResumeId(prevResume.id);
        setCompareResume(prevResume);
      } else {
        setCompareResumeId(null);
        setCompareResume(null);
      }
    } else {
      // When disabling comparison mode
      setCompareResumeId(null);
      setCompareResume(null);
    }
  };
  
  // Toggle metric visibility
  const toggleMetricVisibility = (metric) => {
    setVisibleMetrics({
      ...visibleMetrics,
      [metric]: !visibleMetrics[metric]
    });
  };
  
  // Handle date range change
  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };
  
  // Calculate improvement percentage
  const calculateImprovement = (currentScore, previousScore) => {
    if (!previousScore) return { value: 0, isPositive: true };
    const diff = currentScore - previousScore;
    return {
      value: Math.abs(diff),
      isPositive: diff >= 0
    };
  };
  
  // Get improvement text and color
  const getImprovementDetails = (metricName) => {
    if (!selectedResume || !compareResume) {
      const firstScore = scoreHistory[0]?.[metricName];
      const latestScore = selectedResume?.[metricName];
      
      if (firstScore !== undefined && latestScore !== undefined) {
        const improvement = calculateImprovement(latestScore, firstScore);
        return {
          text: `${improvement.isPositive ? '+' : '-'}${improvement.value.toFixed(1)}%`,
          color: improvement.isPositive ? 'success.main' : 'error.main',
          icon: improvement.isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />
        };
      }
      
      return { text: 'N/A', color: 'text.secondary', icon: null };
    }
    
    const improvement = calculateImprovement(
      selectedResume[metricName],
      compareResume[metricName]
    );
    
    return {
      text: `${improvement.isPositive ? '+' : '-'}${improvement.value.toFixed(1)}%`,
      color: improvement.isPositive ? 'success.main' : 'error.main',
      icon: improvement.isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />
    };
  };
  
  // Format version date
  const formatVersionDate = (dateString) => {
    return format(parseISO(dateString), 'MMM dd, yyyy h:mm a');
  };
  
  // Handle version selection for details view
  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
    setDetailsOpen(true);
  };
  
  // Render timeline chart
  const renderTimelineChart = () => {
    const filteredData = getFilteredScoreHistory();
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
          />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip 
            formatter={(value, name) => [`${value}%`, name]}
            labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
          />
          <Legend />
          
          {visibleMetrics.atsScore && (
            <Line 
              type="monotone" 
              dataKey="atsScore" 
              name="ATS Score" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          )}
          
          {visibleMetrics.keywordMatch && (
            <Line 
              type="monotone" 
              dataKey="keywordMatch" 
              name="Keyword Match" 
              stroke="#82ca9d" 
            />
          )}
          
          {visibleMetrics.formatScore && (
            <Line 
              type="monotone" 
              dataKey="formatScore" 
              name="Format Score" 
              stroke="#ffc658" 
            />
          )}
          
          {visibleMetrics.contentScore && (
            <Line 
              type="monotone" 
              dataKey="contentScore" 
              name="Content Score" 
              stroke="#ff8042" 
            />
          )}
          
          {visibleMetrics.relevanceScore && (
            <Line 
              type="monotone" 
              dataKey="relevanceScore" 
              name="Relevance Score" 
              stroke="#0088fe" 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Render bar chart
  const renderBarChart = () => {
    const filteredData = getFilteredScoreHistory();
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
          />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip 
            formatter={(value, name) => [`${value}%`, name]}
            labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
          />
          <Legend />
          <ReferenceLine y={70} stroke="#ff0000" strokeDasharray="3 3" />
          
          {visibleMetrics.atsScore && (
            <Bar dataKey="atsScore" name="ATS Score" fill="#8884d8" />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render radar chart for comparison
  const renderRadarChart = () => {
    if (!selectedResume) return null;
    
    const compareData = [
      {
        subject: 'ATS Score',
        A: selectedResume.atsScore,
        B: compareResume?.atsScore || 0,
        fullMark: 100,
      },
      {
        subject: 'Keywords',
        A: selectedResume.keywordMatch,
        B: compareResume?.keywordMatch || 0,
        fullMark: 100,
      },
      {
        subject: 'Format',
        A: selectedResume.formatScore,
        B: compareResume?.formatScore || 0,
        fullMark: 100,
      },
      {
        subject: 'Content',
        A: selectedResume.contentScore,
        B: compareResume?.contentScore || 0,
        fullMark: 100,
      },
      {
        subject: 'Relevance',
        A: selectedResume.relevanceScore,
        B: compareResume?.relevanceScore || 0,
        fullMark: 100,
      },
    ];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={compareData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name={selectedResume.title || "Current Resume"}
            dataKey="A"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          {compareResume && (
            <Radar
              name={compareResume.title || "Comparison Resume"}
              dataKey="B"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
          )}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Resume Score Tracker
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={() => {/* Handle export */}}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              startIcon={comparisonMode ? <CompareArrows color="primary" /> : <CompareArrows />}
              onClick={toggleComparisonMode}
              color={comparisonMode ? "primary" : "inherit"}
            >
              {comparisonMode ? "Comparing" : "Compare"}
            </Button>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={handleDateRangeChange}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="1month">Last Month</MenuItem>
                <MenuItem value="3month">Last 3 Months</MenuItem>
                <MenuItem value="6month">Last 6 Months</MenuItem>
                <MenuItem value="1year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <LoadingSpinner message="Loading score history..." />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : scoreHistory.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No resume score history found. Upload your resume to get started.
          </Alert>
        ) : (
          <>
            {/* Score Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Latest ATS Score
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScoreGauge 
                        value={selectedResume?.atsScore || 0} 
                        size={80} 
                        thickness={8}
                      />
                      
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h4" component="div">
                          {selectedResume?.atsScore || 0}%
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {getImprovementDetails('atsScore').icon}
                          <Typography 
                            variant="body2" 
                            color={getImprovementDetails('atsScore').color}
                            sx={{ ml: 0.5 }}
                          >
                            {getImprovementDetails('atsScore').text} {comparisonMode ? 'vs comparison' : 'since first version'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {selectedResume?.date ? `Last updated: ${format(new Date(selectedResume.date), 'MMM dd, yyyy')}` : ''}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<WbIncandescent />}
                      onClick={() => setImprovementTipsOpen(true)}
                    >
                      Improvement Tips
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Score Breakdown
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Keywords
                          </Typography>
                          <Typography variant="h6">
                            {selectedResume?.keywordMatch || 0}%
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getImprovementDetails('keywordMatch').icon}
                            <Typography 
                              variant="caption" 
                              color={getImprovementDetails('keywordMatch').color}
                              noWrap
                            >
                              {getImprovementDetails('keywordMatch').text}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Format
                          </Typography>
                          <Typography variant="h6">
                            {selectedResume?.formatScore || 0}%
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getImprovementDetails('formatScore').icon}
                            <Typography 
                              variant="caption" 
                              color={getImprovementDetails('formatScore').color}
                              noWrap
                            >
                              {getImprovementDetails('formatScore').text}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Content
                          </Typography>
                          <Typography variant="h6">
                            {selectedResume?.contentScore || 0}%
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getImprovementDetails('contentScore').icon}
                            <Typography 
                              variant="caption" 
                              color={getImprovementDetails('contentScore').color}
                              noWrap
                            >
                              {getImprovementDetails('contentScore').text}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Relevance
                          </Typography>
                          <Typography variant="h6">
                            {selectedResume?.relevanceScore || 0}%
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getImprovementDetails('relevanceScore').icon}
                            <Typography 
                              variant="caption" 
                              color={getImprovementDetails('relevanceScore').color}
                              noWrap
                            >
                              {getImprovementDetails('relevanceScore').text}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Chart Display Options */}
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab icon={<TimelineIcon />} iconPosition="start" label="Score Timeline" />
                <Tab icon={<BarChart />} iconPosition="start" label="Score Comparison" />
                <Tab icon={<History />} iconPosition="start" label="Version History" />
              </Tabs>
            </Box>
            
            {/* Chart Content */}
            <Box sx={{ mb: 3 }}>
              {activeTab === 0 && (
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                    <Tooltip title="ATS Score">
                      <Chip
                        label="ATS Score"
                        color={visibleMetrics.atsScore ? "primary" : "default"}
                        onClick={() => toggleMetricVisibility('atsScore')}
                        variant={visibleMetrics.atsScore ? "filled" : "outlined"}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Keyword Match">
                      <Chip
                        label="Keywords"
                        color={visibleMetrics.keywordMatch ? "success" : "default"}
                        onClick={() => toggleMetricVisibility('keywordMatch')}
                        variant={visibleMetrics.keywordMatch ? "filled" : "outlined"}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Format Score">
                      <Chip
                        label="Format"
                        color={visibleMetrics.formatScore ? "secondary" : "default"}
                        onClick={() => toggleMetricVisibility('formatScore')}
                        variant={visibleMetrics.formatScore ? "filled" : "outlined"}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Content Score">
                      <Chip
                        label="Content"
                        color={visibleMetrics.contentScore ? "warning" : "default"}
                        onClick={() => toggleMetricVisibility('contentScore')}
                        variant={visibleMetrics.contentScore ? "filled" : "outlined"}
                      />
                    </Tooltip>
                    
                    <Tooltip title="Relevance Score">
                      <Chip
                        label="Relevance"
                        color={visibleMetrics.relevanceScore ? "info" : "default"}
                        onClick={() => toggleMetricVisibility('relevanceScore')}
                        variant={visibleMetrics.relevanceScore ? "filled" : "outlined"}
                      />
                    </Tooltip>
                  </Box>
                  
                  {renderTimelineChart()}
                </Paper>
              )}
              
              {activeTab === 1 && (
                <Paper sx={{ p: 3 }}>
                  {comparisonMode ? (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Comparing{' '}
                        <Chip 
                          size="small" 
                          label={selectedResume?.title || 'Current'} 
                          color="primary"
                        />{' '}
                        with{' '}
                        <Chip 
                          size="small" 
                          label={compareResume?.title || 'Select a resume'} 
                          color="secondary"
                        />
                      </Typography>
                      
                      {compareResume ? (
                        renderRadarChart()
                      ) : (
                        <Alert severity="info">
                          Please select a resume to compare with from the version history.
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    renderBarChart()
                  )}
                </Paper>
              )}
              
              {activeTab === 2 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Version History
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Version</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>ATS Score</TableCell>
                          <TableCell>Change</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentResumeVersions.map((version, index) => (
                          <TableRow 
                            key={version.id}
                            selected={selectedResumeId === version.id || compareResumeId === version.id}
                            hover
                          >
                            <TableCell>v{version.versionNumber}</TableCell>
                            <TableCell>{formatVersionDate(version.date)}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography>{version.atsScore}%</Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={version.atsScore} 
                                  sx={{ ml: 1, width: 100 }}
                                  color={version.atsScore >= 70 ? "success" : version.atsScore >= 50 ? "warning" : "error"}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              {index < currentResumeVersions.length - 1 ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {version.atsScore > currentResumeVersions[index + 1].atsScore ? (
                                    <>
                                      <ArrowUpward fontSize="small" color="success" />
                                      <Typography variant="body2" color="success.main">
                                        +{(version.atsScore - currentResumeVersions[index + 1].atsScore).toFixed(1)}%
                                      </Typography>
                                    </>
                                  ) : version.atsScore < currentResumeVersions[index + 1].atsScore ? (
                                    <>
                                      <ArrowDownward fontSize="small" color="error" />
                                      <Typography variant="body2" color="error.main">
                                        {(version.atsScore - currentResumeVersions[index + 1].atsScore).toFixed(1)}%
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No change
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Base version
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleVersionSelect(version)}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title={comparisonMode ? "Select for Comparison" : "Select"}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleResumeSelect(version.id)}
                                    color={(selectedResumeId === version.id || compareResumeId === version.id) ? "primary" : "default"}
                                  >
                                    {comparisonMode ? (
                                      compareResumeId === version.id ? <CheckCircle fontSize="small" /> : <Compare fontSize="small" />
                                    ) : (
                                      selectedResumeId === version.id ? <CheckCircle fontSize="small" /> : <Assignment fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          </>
        )}
      </Paper>
      
      {/* Improvement Tips Dialog */}
      <Dialog
        open={improvementTipsOpen}
        onClose={() => setImprovementTipsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Improvement Tips
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedResume && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Based on your current ATS score of {selectedResume.atsScore}%, here are some areas to improve:
              </Typography>
              
              <List>
                {selectedResume.keywordMatch < 70 && (
                  <ListItem>
                    <ListItemIcon>
                      <WbIncandescent color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Keyword Optimization"
                      secondary="Your resume is missing key terms relevant to your target job. Try to incorporate more industry-specific keywords."
                    />
                  </ListItem>
                )}
                
                {selectedResume.formatScore < 70 && (
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Improve Formatting"
                      secondary="Your resume format may be difficult for ATS systems to parse. Use a simpler layout with clear section headers."
                    />
                  </ListItem>
                )}
                
                {selectedResume.contentScore < 70 && (
                  <ListItem>
                    <ListItemIcon>
                      <ErrorIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Enhance Content Quality"
                      secondary="Try to quantify your achievements and use action verbs to make your experience more impactful."
                    />
                  </ListItem>
                )}
                
                {selectedResume.relevanceScore < 70 && (
                  <ListItem>
                    <ListItemIcon>
                      <Info color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Increase Relevance"
                      secondary="Your resume content doesn't strongly align with job requirements. Tailor your experience to highlight relevant skills."
                    />
                  </ListItem>
                )}
                
                {(selectedResume.keywordMatch >= 70 && 
                 selectedResume.formatScore >= 70 && 
                 selectedResume.contentScore >= 70 && 
                 selectedResume.relevanceScore >= 70) && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Great Job!"
                      secondary="Your resume is well-optimized for ATS systems. Continue updating it to stay relevant to your target roles."
                    />
                  </ListItem>
                )}
              </List>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Top Missing Keywords:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                {selectedResume.missingKeywords?.map((keyword, index) => (
                  <Chip 
                    key={index} 
                    label={keyword} 
                    variant="outlined" 
                    color="error"
                    size="small"
                  />
                ))}
                
                {!selectedResume.missingKeywords?.length && (
                  <Typography variant="body2" color="text.secondary">
                    No critical keywords missing.
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImprovementTipsOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setImprovementTipsOpen(false);
              navigate('/resume-builder');
            }}
          >
            Edit Resume
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Resume Version Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Resume Version Details
        </DialogTitle>
        <DialogContent>
          {selectedVersion && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Basic Information
                </Typography>
                <Typography variant="body2">
                  <strong>Version:</strong> v{selectedVersion.versionNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {formatVersionDate(selectedVersion.date)}
                </Typography>
                <Typography variant="body2">
                  <strong>Title:</strong> {selectedVersion.title || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>ATS Score:</strong> {selectedVersion.atsScore}%
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Score Breakdown
                </Typography>
                <Typography variant="body2">
                  <strong>Keyword Match:</strong> {selectedVersion.keywordMatch}%
                </Typography>
                <Typography variant="body2">
                  <strong>Format Score:</strong> {selectedVersion.formatScore}%
                </Typography>
                <Typography variant="body2">
                  <strong>Content Score:</strong> {selectedVersion.contentScore}%
                </Typography>
                <Typography variant="body2">
                  <strong>Relevance Score:</strong> {selectedVersion.relevanceScore}%
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Changes from Previous Version
                </Typography>
                
                {selectedVersion.changes ? (
                  <List>
                    {selectedVersion.changes.map((change, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {change.type === 'added' ? (
                            <Add color="success" />
                          ) : change.type === 'removed' ? (
                            <Delete color="error" />
                          ) : (
                            <Edit color="info" />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={change.description} 
                          secondary={change.section} 
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific changes recorded for this version.
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    Preview
                  </Typography>
                  <Button
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownloadResume(selectedVersion.id)}
                  >
                    Download PDF
                  </Button>
                </Box>
                
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 1,
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {selectedVersion.previewImage ? (
                    <Box 
                      component="img" 
                      src={selectedVersion.previewImage}
                      alt="Resume Preview"
                      sx={{ 
                        width: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
                      Preview not available for this version
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              navigate(`/resume-builder?version=${selectedVersion.id}`);
              setDetailsOpen(false);
            }}
          >
            Edit This Version
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeScoreTracker;