import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

/**
 * Radial bar chart for visualizing interview performance metrics
 */
const InterviewPerformanceChart = ({ data, height = 400, className = '' }) => {
  const { theme } = useAppContext();
  
  // Color scheme for different metrics
  const COLORS = theme === 'dark' 
    ? ['#4F46E5', '#10B981', '#F97316', '#EC4899', '#8B5CF6']
    : ['#4338CA', '#059669', '#EA580C', '#DB2777', '#7C3AED'];
  
  // Format data for RadialBarChart
  const formattedData = data.map((item, index) => ({
    name: item.category,
    value: item.score,
    fill: COLORS[index % COLORS.length]
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border rounded shadow-lg`}>
          <p className="font-semibold">{`${payload[0].payload.name}`}</p>
          <p>{`Score: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-col gap-1 mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {entry.value}: {formattedData.find(item => item.name === entry.value)?.value}/100
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="10%" 
          outerRadius="80%" 
          barSize={20} 
          data={formattedData}
        >
          <RadialBar
            label={{ position: 'insideStart', fill: theme === 'dark' ? '#fff' : '#000' }}
            background
            dataKey="value"
            minAngle={15}
            clockWise
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            content={<CustomLegend />}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InterviewPerformanceChart; 