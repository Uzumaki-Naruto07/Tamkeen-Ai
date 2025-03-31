import React, { useMemo } from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { Box, Paper, Typography, useTheme, Alert, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Skills Radar Chart Component using Nivo
 * Visualizes user skills in a radar/spider chart
 */
const SkillsRadarChart = ({ data, height = 400, className = '' }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  // Default data if none provided
  const defaultData = [
    { skill: t('problem_solving'), value: 9, category: t('cognitive') },
    { skill: t('communication'), value: 8, category: t('soft_skills') },
    { skill: t('javascript'), value: 7, category: t('technical') },
    { skill: t('python'), value: 6, category: t('technical') },
    { skill: t('data_analysis'), value: 8, category: t('technical') },
    { skill: t('leadership'), value: 7, category: t('soft_skills') },
    { skill: t('ux_design'), value: 5, category: t('technical') },
    { skill: t('critical_thinking'), value: 9, category: t('cognitive') }
  ];
  
  // Validate data and use provided data or default
  const isValidData = Array.isArray(data) && data.length > 0 && 
    data.every(item => item && typeof item === 'object' && 'skill' in item && 'value' in item);
  
  const chartData = useMemo(() => {
    if (!isValidData) return defaultData;
    
    // Ensure all data items have the required properties
    return data.map(item => ({
      skill: item.skill || 'Unnamed Skill',
      value: typeof item.value === 'number' ? item.value : 0,
      category: item.category || 'Uncategorized',
      requiredValue: typeof item.requiredValue === 'number' ? item.requiredValue : 0
    }));
  }, [data, isValidData, defaultData]);
  
  // Custom theme for the radar chart
  const chartTheme = useMemo(() => ({
    background: 'transparent',
    textColor: theme.palette.text.primary,
    fontSize: 12,
    axis: {
      domain: {
        line: {
          stroke: theme.palette.divider,
          strokeWidth: 1
        }
      },
      ticks: {
        line: {
          stroke: theme.palette.divider,
          strokeWidth: 1
        },
        text: {
          fill: theme.palette.text.secondary,
          fontSize: 10
        }
      }
    },
    grid: {
      line: {
        stroke: theme.palette.divider,
        strokeWidth: 1,
        strokeDasharray: '5 5'
      }
    },
    labels: {
      text: {
        fill: theme.palette.text.primary,
        fontSize: 12,
        fontWeight: 600
      }
    },
    tooltip: {
      container: {
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        fontSize: 12,
        borderRadius: 4,
        boxShadow: theme.shadows[3]
      }
    }
  }), [theme]);
  
  // Group skills by category for color coding
  const categories = useMemo(() => 
    [...new Set(chartData.map(item => item.category))],
    [chartData]
  );
  
  // Generate colors based on the theme palette
  const getColor = useMemo(() => (category) => {
    // Check if data or category is undefined
    if (!category) {
      return theme.palette.grey[500]; // Default color for undefined category
    }
    
    const colorMap = {
      [t('technical')]: theme.palette.primary.main,
      [t('soft_skills')]: theme.palette.secondary.main,
      [t('cognitive')]: theme.palette.success.main,
      [t('language')]: theme.palette.info.main,
      [t('domain')]: theme.palette.warning.main
    };
    
    return colorMap[category] || theme.palette.info.main;
  }, [theme, t]);

  // Handle error state
  if (!chartData || chartData.length === 0) {
    return (
      <Box className={className} sx={{ height: height || 400, width: '100%' }}>
        <Alert severity="warning">
          No skill data available to display the chart.
        </Alert>
      </Box>
    );
  }

  // Build an accessible description of the data for screen readers
  const accessibilityDescription = useMemo(() => {
    return `Radar chart displaying skill proficiency levels for: ${chartData.map(item => 
      `${item.skill} (${item.value}/10)`).join(', ')}`;
  }, [chartData]);

  return (
    <Box 
      className={className} 
      sx={{ 
        height: height || 400, 
        width: '100%',
        '& text': { fill: theme.palette.text.primary }
      }}
      role="img"
      aria-label="Skills Radar Chart"
    >
      <Typography variant="srOnly" id="skills-chart-description">
        {accessibilityDescription}
      </Typography>
      
      <ResponsiveRadar
        data={chartData}
        keys={['value']}
        indexBy="skill"
        maxValue={10}
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        borderWidth={2}
        borderColor={{ from: 'color' }}
        gridLabelOffset={36}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        dotBorderColor={{ from: 'color' }}
        enableDotLabel={true}
        dotLabel="value"
        dotLabelYOffset={-12}
        colors={({ data }) => data && data.category ? getColor(data.category) : theme.palette.grey[500]}
        fillOpacity={0.25}
        blendMode="multiply"
        animate={true}
        motionConfig="gentle"
        isInteractive={true}
        legends={[
          {
            anchor: 'top-left',
            direction: 'column',
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: theme.palette.text.secondary,
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: theme.palette.text.primary
                }
              }
            ]
          }
        ]}
        theme={chartTheme}
        role="application"
        ariaLabel="Skills radar chart"
        ariaDescribedBy="skills-chart-description"
      />
    </Box>
  );
};

export default SkillsRadarChart; 