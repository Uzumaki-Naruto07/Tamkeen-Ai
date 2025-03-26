import React, { useState, useEffect } from 'react';
import { FiUsers, FiDatabase, FiActivity, FiAlertTriangle, FiSettings } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { getAdminStats, getSystemLogs, getActiveUsers } from '../api/admin';
import { BarChart, LineChart } from '../components/charts';
import AdminActionCard from '../components/admin/AdminActionCard';
import UserManagementTable from '../components/admin/UserManagementTable';
import SystemStatusCard from '../components/admin/SystemStatusCard';

const AdminDashboard = () => {
  const { user, hasRole } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const statsData = await getAdminStats();
        const logsData = await getSystemLogs();
        const usersData = await getActiveUsers();
        
        setStats(statsData);
        setLogs(logsData);
        setActiveUsers(usersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load administrative data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (hasRole && hasRole('admin')) {
      fetchAdminData();
    } else {
      setError('You do not have permission to access this page.');
    }
  }, [hasRole]);

  // Admin actions
  const adminActions = [
    {
      title: 'User Management',
      description: 'Add, modify, or remove user accounts',
      icon: <FiUsers className="h-6 w-6" />,
      color: 'bg-blue-500',
      action: () => setActiveTab('users')
    },
    {
      title: 'Content Management',
      description: 'Manage career resources and content',
      icon: <FiDatabase className="h-6 w-6" />,
      color: 'bg-green-500',
      action: () => setActiveTab('content')
    },
    {
      title: 'System Logs',
      description: 'View activity and error logs',
      icon: <FiActivity className="h-6 w-6" />,
      color: 'bg-yellow-500',
      action: () => setActiveTab('logs')
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: <FiSettings className="h-6 w-6" />,
      color: 'bg-purple-500',
      action: () => setActiveTab('settings')
    }
  ];

  // If not admin, show access denied
  if (error && !isLoading && (!hasRole || !hasRole('admin'))) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6">
            <div className="flex items-center text-red-600 dark:text-red-400">
              <FiAlertTriangle className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-medium">Access Denied</h2>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'overview' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'users' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'logs' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Logs
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'settings' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <SystemStatusCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                change={stats?.userGrowth || 0}
                icon={<FiUsers className="h-6 w-6" />}
                color="bg-blue-500"
              />
              <SystemStatusCard
                title="Active Sessions"
                value={stats?.activeSessions || 0}
                change={stats?.sessionChange || 0}
                icon={<FiActivity className="h-6 w-6" />}
                color="bg-green-500"
              />
              <SystemStatusCard
                title="Resume Uploads"
                value={stats?.resumeUploads || 0}
                change={stats?.uploadChange || 0}
                icon={<FiDatabase className="h-6 w-6" />}
                color="bg-yellow-500"
              />
              <SystemStatusCard
                title="System Health"
                value={`${stats?.systemHealth || 100}%`}
                change={0}
                icon={<FiActivity className="h-6 w-6" />}
                color="bg-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    User Registrations
                  </h3>
                  <div className="mt-5 h-64">
                    {/* Use LineChart component here */}
                    <LineChart 
                      data={stats?.userRegistrations || []}
                      xKey="date"
                      yKey="count"
                      color="#3B82F6"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Feature Usage
                  </h3>
                  <div className="mt-5 h-64">
                    {/* Use BarChart component here */}
                    <BarChart 
                      data={stats?.featureUsage || []}
                      xKey="feature"
                      yKey="usage"
                      color="#10B981"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {adminActions.map((action, index) => (
                    <AdminActionCard 
                      key={index}
                      title={action.title}
                      description={action.description}
                      icon={action.icon}
                      color={action.color}
                      onClick={action.action}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                User Management
              </h3>
              <UserManagementTable users={activeUsers} />
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                System Logs
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Source
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${log.level === 'ERROR' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                              log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.source}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                System Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">API Configuration</h4>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        API Key
                      </label>
                      <input
                        type="text"
                        name="api-key"
                        id="api-key"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Enter API key"
                      />
                    </div>
                    <div>
                      <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        API URL
                      </label>
                      <input
                        type="text"
                        name="api-url"
                        id="api-url"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Enter API URL"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Email Configuration</h4>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="smtp-server" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        SMTP Server
                      </label>
                      <input
                        type="text"
                        name="smtp-server"
                        id="smtp-server"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        name="smtp-port"
                        id="smtp-port"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="587"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">System Preferences</h4>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center"></div>