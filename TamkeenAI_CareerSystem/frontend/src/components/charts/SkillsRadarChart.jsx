import React from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { Box, Paper, Typography, useTheme } from '@mui/material';
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
  
  // Use provided data or default
  const chartData = data && data.length > 0 ? data : defaultData;
  
  // Custom theme for the radar chart
  const chartTheme = {
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
  };
  
  // Group skills by category for color coding
  const categories = [...new Set(chartData.map(item => item.category))];
  
  // Generate colors based on the theme palette
  const getColor = (category) => {
    const colorMap = {
      [t('technical')]: theme.palette.primary.main,
      [t('soft_skills')]: theme.palette.secondary.main,
      [t('cognitive')]: theme.palette.success.main,
      [t('language')]: theme.palette.info.main,
      [t('domain')]: theme.palette.warning.main
    };
    
    return colorMap[category] || theme.palette.info.main;
  };

  return (
    <Box className={className} sx={{ 
      height: height || 400, 
      width: '100%',
      '& text': { fill: theme.palette.text.primary }
    }}>
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
        colors={({ data }) => getColor(data.category)}
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
      />
    </Box>
  );
};

export default SkillsRadarChart; 