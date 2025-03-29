import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Tabs, Tab, LinearProgress, Slider, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import DashboardAPI from '../../api/DashboardAPI';

const SkillProgressSection = ({ skillProgress }) => {
  const [currentCategory, setCurrentCategory] = useState(Object.keys(skillProgress)[0] || '');
  const [editingSkill, setEditingSkill] = useState(null);
  const [newSkillValue, setNewSkillValue] = useState(0);
  const [learningResources, setLearningResources] = useState([]);
  const [industryBenchmarks, setIndustryBenchmarks] = useState(null);
  
  useEffect(() => {
    // Fetch learning resources and benchmarks
    const fetchData = async () => {
      try {
        const resources = await DashboardAPI.getLearningResources(currentCategory);
        const benchmarks = await DashboardAPI.getIndustryBenchmarks(currentCategory);
        setLearningResources(resources);
        setIndustryBenchmarks(benchmarks);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [currentCategory]);
  
  const handleCategoryChange = (event, newValue) => {
    setCurrentCategory(newValue);
    setEditingSkill(null);
  };
  
  const handleEditSkill = (skillName, currentValue) => {
    setEditingSkill(skillName);
    setNewSkillValue(currentValue);
  };
  
  const handleSkillValueChange = (event, newValue) => {
    setNewSkillValue(newValue);
  };
  
  const handleSaveSkill = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Or get from auth context
      
      await DashboardAPI.updateSkillProgress(userId, {
        category: currentCategory,
        skill_name: editingSkill,
        new_level: newSkillValue
      });
      
      // In a real app, you'd update local state or refetch data
      setEditingSkill(null);
      
      // Track activity
      await DashboardAPI.trackUserActivity(userId, {
        activity_type: 'update_skill',
        description: `Updated ${editingSkill} skill`,
        feature: 'skill_tracker'
      });
      
    } catch (error) {
      console.error('Error updating skill:', error);
      // Show error message
    }
  };
  
  const handleCancelEdit = () => {
    setEditingSkill(null);
  };
  
  const renderLearningResources = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Top Learning Resources</Typography>
      {learningResources.slice(0, 3).map((resource, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography variant="body2" component="a" href={resource.url} target="_blank" sx={{ textDecoration: 'none', color: 'primary.main' }}>
            {`${index + 1}. ${resource.title}`}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  const renderBenchmarkChart = () => {
    if (!industryBenchmarks) return null;
    
    const benchmarkData = Object.entries(currentSkills).map(([skill, data]) => ({
      skill,
      userScore: data.current,
      industryAvg: industryBenchmarks[skill] || 0,
    }));

    return (
      <Box sx={{ mt: 4, height: 300 }}>
        <Typography variant="h6" gutterBottom>Industry Benchmark Comparison</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={benchmarkData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis />
            <Radar name="Your Skills" dataKey="userScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Industry Average" dataKey="industryAvg" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <ChartTooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    );
  };
  
  if (!currentCategory || !skillProgress[currentCategory]) {
    return (
      <Card>
        <CardContent>
          <Typography>No skill data available</Typography>
        </CardContent>
      </Card>
    );
  }
  
  const categories = Object.keys(skillProgress);
  const currentSkills = skillProgress[currentCategory];
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Skill Progress</Typography>
        
        <Tabs
          value={currentCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {categories.map((category) => (
            <Tab key={category} label={category} value={category} />
          ))}
        </Tabs>
        
        <Box sx={{ mb: 4 }}>
          {Object.entries(currentSkills).map(([skillName, skillData]) => {
            const { current, target, history } = skillData;
            const progressPercent = Math.min(100, (current / target) * 100);
            
            // Format history data for chart
            const chartData = history.map((value, index) => ({
              name: `Point ${index + 1}`,
              value
            }));
            
            // Add current value to chart
            chartData.push({
              name: 'Current',
              value: current
            });
            
            return (
              <Box key={skillName} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1">{skillName}</Typography>
                  <Typography variant="body2">{current}/{target}</Typography>
                </Box>
                
                {editingSkill === skillName ? (
                  <Box sx={{ mb: 2 }}>
                    <Slider
                      value={newSkillValue}
                      onChange={handleSkillValueChange}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleCancelEdit} 
                        sx={{ mr: 1 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={handleSaveSkill}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressPercent} 
                      sx={{ height: 8, borderRadius: 4, mb: 1 }} 
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ width: '40%' }}>
                        <ResponsiveContainer width="100%" height={60}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              strokeWidth={2} 
                              dot={{ r: 3 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleEditSkill(skillName, current)}
                      >
                        Update
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Enhanced Skill Growth Chart */}
        <Box sx={{ mt: 4, height: 300 }}>
          <Typography variant="h6" gutterBottom>Skill Growth Over Time</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={Object.entries(currentSkills).flatMap(([skill, data]) => 
              data.history.map((value, index) => ({
                name: `Month ${index + 1}`,
                [skill]: value,
              }))
            )}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              {Object.keys(currentSkills).map((skill, index) => (
                <Line 
                  key={skill}
                  type="monotone"
                  dataKey={skill}
                  stroke={`hsl(${index * 360 / Object.keys(currentSkills).length}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Learning Resources Section */}
        {renderLearningResources()}

        {/* Benchmark Radar Chart */}
        {renderBenchmarkChart()}
      </CardContent>
    </Card>
  );
};

export default SkillProgressSection; 