import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

/**
 * Pie chart for visualizing job application statuses
 */
const ApplicationStatusChart = ({ data, height = 400, className = '' }) => {
  const { theme } = useAppContext();
  
  // Color scheme based on application status
  const COLORS = theme === 'dark' 
    ? ['#4F46E5', '#10B981', '#F97316', '#EC4899', '#8B5CF6', '#6B7280']
    : ['#4338CA', '#059669', '#EA580C', '#DB2777', '#7C3AED', '#4B5563'];
  
  // Format for easier visualization
  const formattedData = data.map(item => ({
    name: item.status,
    value: item.count,
    percentage: ((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)
  }));

  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border rounded shadow-lg`}>
          <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p>{`${payload[0].payload.percentage}% of applications`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percentage }) => `${name} (${percentage}%)`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ApplicationStatusChart; 