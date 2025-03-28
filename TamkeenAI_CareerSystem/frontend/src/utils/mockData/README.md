# Mock Data Directory

This directory contains mock data structures for all major components of the TamkeenAI Career System. These mock data files are used for development, testing, and demonstration purposes, ensuring that UI components can be properly visualized without a running backend.

## Contents

The mock data is organized into the following files:

- **dashboardData.js**: Data for the main dashboard, including user progress, skills, recommendations, etc.
- **chatMessages.js**: Mock AI coach conversation history and message templates
- **jobsData.js**: Job listings, applications, and recommendations
- **skillsData.js**: User skills, skill assessments, and learning paths
- **resumeData.js**: Resume data, templates, and ATS analysis
- **mockDataIndex.js**: Central export point for easy importing of all mock data

## Usage

### Importing Mock Data

Import the mock data you need from the central index file:

```javascript
// Import specific mock data
import { mockDashboardData, mockJobsData } from 'utils/mockData/mockDataIndex';

// Use in your component
function Dashboard() {
  // Use the mock data
  const userProgress = mockDashboardData.userProgress;
  const recommendations = mockDashboardData.aiRecommendation;
  
  return (
    // Your component JSX
  );
}
```

### Simulating API Responses

You can use this mock data in conjunction with a mock API service to simulate backend responses:

```javascript
// In a mock API service file
import { mockJobsData } from 'utils/mockData/mockDataIndex';

export const getJobs = () => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockJobsData.jobs);
    }, 500);
  });
};

export const getJobById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const job = mockJobsData.jobs.find(job => job.id === Number(id));
      if (job) {
        resolve(job);
      } else {
        reject(new Error('Job not found'));
      }
    }, 500);
  });
};
```

## Guidelines for Using Mock Data

1. **Development Mode Only**: Use the mock data only in development mode to avoid shipping large JSON objects to production.

2. **Feature Flags**: Implement feature flags to switch between mock and real API data.

3. **Consistent Structure**: When creating or modifying API endpoints, ensure that the API responses match the structure of the mock data for seamless transition.

4. **Extending the Data**: Feel free to extend these mock objects with additional fields that might be required for new features.

## Updating Mock Data

When adding new components or features, please update the relevant mock data files or create new ones as needed. If creating a new mock data file, remember to:

1. Add it to the exports in `mockDataIndex.js`
2. Update this README.md with information about the new file
3. Follow the established patterns for data structure and naming conventions

## Transitioning to Real Data

When transitioning from mock data to real API data, you should:

1. Ensure your backend API returns data in the same format as the mock data
2. Create API client functions that return data in the same shape
3. Update components to use the API client instead of mock data
4. Use error handling to gracefully handle API failures

By following this approach, you can easily switch between mock and real data without major refactoring of your components. 