import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

/**
 * Line chart for tracking career progress over time
 * Supports multiple metrics and goal tracking
 */
const CareerProgressChart = ({ 
  data, 
  metrics = ['salary', 'skillLevel', 'satisfaction'], 
  height = 400,
  showGoal = true,
  goalValue = 80000,
  goalLabel = 'Target Salary',
  className = ''
}) => {
  const { theme } = useAppContext();
  
  // Color mapping for different metrics
  const colors = {
    salary: theme === 'dark' ? '#4F46E5' : '#4338CA', // indigo
    skillLevel: theme === 'dark' ? '#10B981' : '#059669', // emerald
    satisfaction: theme === 'dark' ? '#F97316' : '#EA580C', // orange
    interviews: theme === 'dark' ? '#3B82F6' : '#2563EB', // blue
    applications: theme === 'dark' ? '#EC4899' : '#DB2777', // pink
    offers: theme === 'dark' ? '#8B5CF6' : '#7C3AED', // violet
    gridLine: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    text: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    goalLine: theme === 'dark' ? 'rgba(220, 38, 38, 0.8)' : 'rgba(220, 38, 38, 0.8)', // red
  };
  
  // Name mapping for more readable labels
  const metricNames = {
    salary: 'Salary',
    skillLevel: 'Skill Level',
    satisfaction: 'Job Satisfaction',
    interviews: 'Interviews',
    applications: 'Applications',
    offers: 'Job Offers'
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: colors.text, fontSize: 12 }}
            stroke={colors.gridLine}
          />
          <YAxis 
            tick={{ fill: colors.text, fontSize: 12 }}
            stroke={colors.gridLine}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1F2937' : 'white',
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              color: colors.text,
            }}
          />
          <Legend />
          
          {metrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              name={metricNames[metric] || metric}
              stroke={colors[metric] || '#8884d8'}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
          
          {showGoal && (
            <ReferenceLine 
              y={goalValue} 
              stroke={colors.goalLine} 
              strokeDasharray="3 3"
              label={{ 
                value: goalLabel, 
                position: 'insideBottomRight',
                fill: colors.goalLine
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CareerProgressChart; 