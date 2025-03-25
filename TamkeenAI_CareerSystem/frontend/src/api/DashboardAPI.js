import axios from 'axios';
import { API_BASE_URL } from '../config';

const DashboardAPI = {
  /**
   * Get complete dashboard data for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - Dashboard data
   */
  getDashboardData: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
  
  /**
   * Update skill progress
   * @param {string} userId - The user ID
   * @param {Object} skillData - Skill update data
   * @returns {Promise<Object>} - Updated skill data
   */
  updateSkillProgress: async (userId, skillData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/dashboard/${userId}/skills`,
        skillData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating skill progress:', error);
      throw error;
    }
  },
  
  /**
   * Track user activity on dashboard
   * @param {string} userId - The user ID
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} - Response data
   */
  trackUserActivity: async (userId, activityData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/dashboard/${userId}/activity`,
        activityData
      );
      return response.data;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw error;
    }
  },
  
  /**
   * Update dashboard stats
   * @param {string} userId - The user ID
   * @param {Object} statsData - Dashboard stats data
   * @returns {Promise<Object>} - Updated stats data
   */
  updateDashboardStats: async (userId, statsData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/dashboard/${userId}/stats`,
        statsData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
      throw error;
    }
  }
};

export default DashboardAPI; 