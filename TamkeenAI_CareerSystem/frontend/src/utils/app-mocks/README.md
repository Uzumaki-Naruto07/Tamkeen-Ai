# Mock Data for TamkeenAI Career System

This directory contains mock data files that provide realistic sample data for development and testing purposes. Using these files helps in:

1. Developing UI components without depending on a live backend
2. Testing features consistently with predictable data
3. Providing realistic data structures that match the expected API responses

## Available Mock Data Files

- **mockDataIndex.js** - General dashboard data including user progress, resume scores, etc.
- **skillTransitionMock.js** - Data for skill transition visualizations and career path mapping
- **jobApplicationMock.js** - Job application history and related statistics
- **automationSettingsMock.js** - Configuration data for the job application automation feature

## How to Use

### Option 1: Import from the centralized index file

```javascript
import { mockDashboardData, jobApplicationsMock } from '../../utils/app-mocks';
```

### Option 2: Import from the more convenient alias file

```javascript
import { mockDashboardData, jobApplicationsMock } from '../../utils/mockData';
```

### Example Usage

```javascript
import React, { useState, useEffect } from 'react';
import { mockDashboardData } from '../../utils/mockData';

const Dashboard = () => {
  const [data, setData] = useState(null);
  
  // Simulate fetching data from an API
  useEffect(() => {
    // In production, this would be replaced with an API call
    setTimeout(() => {
      setData(mockDashboardData);
    }, 500);
  }, []);
  
  if (!data) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome {data.userProgress.name}</h1>
      {/* Rest of component */}
    </div>
  );
};
```

## Structure

Each mock data file follows the expected API response structure, making it easy to switch between development and production without changing component logic.

## Notes

- These files should only be used in development and testing environments
- Data structures in these files should be kept in sync with any API changes 