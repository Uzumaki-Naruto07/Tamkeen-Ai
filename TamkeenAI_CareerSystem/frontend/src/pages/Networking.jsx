import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box,
  Tabs,
  Tab
} from '@mui/material';

// Import the actual networking components
import NetworkingPanel from './NetworkingPanel';
import NetworkingView from './NetworkingView';

const Networking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('/networking/view') ? 1 : 0
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      navigate('/networking');
    } else {
      navigate('/networking/view');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Professional Networking
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          centered
        >
          <Tab label="Networking Dashboard" />
          <Tab label="Network Connections" />
        </Tabs>
      </Box>
      
      {activeTab === 0 ? (
        <NetworkingPanel />
      ) : (
        <NetworkingView />
      )}
    </Container>
  );
};

export default Networking; 