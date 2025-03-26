import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

/**
 * Radar chart for displaying skill proficiency across multiple categories
 * Useful for skill assessment and gap analysis
 */
const SkillRadarChart = ({ data, height = 400, className = '' }) => {
  const { theme } = useAppContext();
  
  // Default styling based on theme
  const colors = {
    userSkills: theme === 'dark' ? '#4F46E5' : '#4338CA', // indigo
    jobRequirements: theme === 'dark' ? '#F97316' : '#EA580C', // orange
    industryAverage: theme === 'dark' ? '#10B981' : '#059669', // emerald
    gridLine: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    text: theme === 'dark' ? '#D1D5DB' : '#4B5563',
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke={colors.gridLine} />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: colors.text, fontSize: 12 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: colors.text, fontSize: 10 }} 
          />
          
          <Radar
            name="Your Skills"
            dataKey="userValue"
            stroke={colors.userSkills}
            fill={colors.userSkills}
            fillOpacity={0.4}
          />
          
          <Radar
            name="Job Requirements"
            dataKey="requiredValue"
            stroke={colors.jobRequirements}
            fill={colors.jobRequirements}
            fillOpacity={0.4}
          />
          
          <Radar
            name="Industry Average"
            dataKey="industryValue"
            stroke={colors.industryAverage}
            fill={colors.industryAverage}
            fillOpacity={0.4}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1F2937' : 'white',
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              color: colors.text,
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart; 