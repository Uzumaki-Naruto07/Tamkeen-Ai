import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

/**
 * Bar chart for showing job market trends and demand/growth by role
 */
const JobMarketTrendsChart = ({ data, height = 400, className = '' }) => {
  const { theme } = useAppContext();
  
  // Theme-based colors
  const colors = {
    demand: theme === 'dark' ? '#4F46E5' : '#4338CA', // indigo
    growth: theme === 'dark' ? '#10B981' : '#059669', // emerald
    salaryRange: theme === 'dark' ? '#F97316' : '#EA580C', // orange
    gridLine: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    text: theme === 'dark' ? '#D1D5DB' : '#4B5563',
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} />
          <XAxis 
            dataKey="role" 
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
          <Bar dataKey="demand" name="Current Demand" fill={colors.demand}>
            <LabelList dataKey="demand" position="top" fill={colors.text} />
          </Bar>
          <Bar dataKey="growth" name="Growth Rate (%)" fill={colors.growth}>
            <LabelList dataKey="growth" position="top" fill={colors.text} />
          </Bar>
          <Bar dataKey="avgSalary" name="Avg. Salary ($K)" fill={colors.salaryRange}>
            <LabelList dataKey="avgSalary" position="top" fill={colors.text} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobMarketTrendsChart; 