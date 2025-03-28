/**
 * Mock Data Index
 * 
 * This file exports all mock data from a single location for easy imports
 */

import mockDashboardData from './dashboardData';
import mockChatMessages from './chatMessages';
import mockJobsData from './jobsData';
import mockSkillsData from './skillsData';
import mockResumeData from './resumeData';

export {
  mockDashboardData,
  mockDashboardData as dashboardData,
  mockChatMessages,
  mockJobsData,
  mockSkillsData,
  mockResumeData
};

/**
 * Example usage:
 * 
 * import { mockDashboardData, mockJobsData } from 'utils/mockData/mockDataIndex';
 * 
 * // Use mock data in components
 * const jobs = mockJobsData.jobs;
 * const userProgress = mockDashboardData.userProgress;
 */ 