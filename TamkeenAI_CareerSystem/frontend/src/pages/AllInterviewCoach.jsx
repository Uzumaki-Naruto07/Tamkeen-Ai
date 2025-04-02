import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button,
  Chip,
  Box,
  Rating,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import VideocamIcon from '@mui/icons-material/Videocam';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from 'react-router-dom';

// Mock data for interview coaches
const mockCoaches = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Tech Recruiter",
    company: "Google",
    specialties: ["Software Engineering", "Technical Interviews", "Behavioral Questions"],
    experience: 8,
    rating: 4.9,
    reviews: 124,
    hourlyRate: 85,
    availability: "Next available: Tomorrow",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Former Google recruiter with 8+ years of experience hiring software engineers. I can help you prepare for technical and behavioral interviews at top tech companies."
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Career Coach & Former HR Director",
    company: "Microsoft",
    specialties: ["Leadership Roles", "Executive Interviews", "Salary Negotiation"],
    experience: 12,
    rating: 4.8,
    reviews: 98,
    hourlyRate: 95,
    availability: "Next available: Today",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "HR Director with experience at Microsoft and Amazon. I specialize in helping mid to senior-level professionals prepare for leadership interviews and negotiate offers."
  },
  {
    id: 3,
    name: "Priya Patel",
    title: "Data Science Interview Specialist",
    company: "Netflix",
    specialties: ["Data Science", "Machine Learning", "Technical Assessments"],
    experience: 6,
    rating: 4.7,
    reviews: 76,
    hourlyRate: 75,
    availability: "Next available: In 2 days",
    image: "https://randomuser.me/api/portraits/women/66.jpg",
    description: "Data Scientist at Netflix who has interviewed 100+ candidates. I can help you prepare for data science interviews, including technical questions and case studies."
  },
  {
    id: 4,
    name: "James Wilson",
    title: "Product Management Coach",
    company: "Facebook",
    specialties: ["Product Management", "Case Interviews", "Product Design"],
    experience: 9,
    rating: 4.9,
    reviews: 112,
    hourlyRate: 90,
    availability: "Next available: Tomorrow",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    description: "Product Manager at Facebook with experience interviewing PM candidates. I can help you prepare for product sense, analytical, and execution interviews."
  },
  {
    id: 5,
    name: "Elena Rodriguez",
    title: "UX/UI Interview Specialist",
    company: "Airbnb",
    specialties: ["UX Design", "Portfolio Reviews", "Design Challenges"],
    experience: 7,
    rating: 4.8,
    reviews: 89,
    hourlyRate: 80,
    availability: "Next available: Today",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    description: "UX Designer at Airbnb who has interviewed 50+ designers. I can help you prepare your portfolio, practice design challenges, and ace your UX/UI interviews."
  },
  {
    id: 6,
    name: "David Kim",
    title: "Marketing Interview Coach",
    company: "Spotify",
    specialties: ["Marketing Strategy", "Brand Management", "Growth Marketing"],
    experience: 10,
    rating: 4.7,
    reviews: 67,
    hourlyRate: 75,
    availability: "Next available: In 3 days",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    description: "Marketing Director at Spotify with experience hiring marketing professionals. I can help you prepare for marketing interviews, case studies, and presentations."
  }
];

// Mock data for interview packages
const mockPackages = [
  {
    id: 1,
    title: "Technical Interview Prep",
    description: "Comprehensive preparation for software engineering interviews, including data structures, algorithms, and system design.",
    price: 199,
    sessions: 3,
    duration: "1 month",
    features: ["Mock interviews with feedback", "Personalized improvement plan", "Resume review", "Coding challenge practice"]
  },
  {
    id: 2,
    title: "Behavioral Interview Mastery",
    description: "Learn how to effectively communicate your experience and skills using the STAR method and other proven techniques.",
    price: 149,
    sessions: 2,
    duration: "2 weeks",
    features: ["Situation-based practice", "Video recording analysis", "Custom response frameworks", "Follow-up question preparation"]
  },
  {
    id: 3,
    title: "Executive Interview Package",
    description: "Premium coaching for senior leadership and executive roles, focusing on strategic thinking and leadership vision.",
    price: 349,
    sessions: 4,
    duration: "6 weeks",
    features: ["Leadership scenario practice", "Executive presence coaching", "Strategic thinking exercises", "Salary negotiation strategy"]
  }
];

const AllInterviewCoach = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState([]);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call to fetch coaches and packages
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCoaches(mockCoaches);
        setPackages(mockPackages);
        setError('');
      } catch (err) {
        console.error('Error fetching interview coaches:', err);
        setError('Failed to load interview coaches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleBookSession = (coachId) => {
    // Instead of going directly to checkout, navigate to the coach profile with availability tab
    navigate(`/ai-coach/profile/${coachId}`, { state: { activeTab: 2 } }); // 2 is the index for the Availability tab
  };

  const handleViewProfile = (coachId) => {
    // Navigate to coach profile page with coach ID
    console.log(`Viewing profile of coach ID: ${coachId}`);
    navigate(`/ai-coach/profile/${coachId}`);
  };

  const handlePurchasePackage = (packageId) => {
    // Find the selected package
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    
    // Navigate to checkout with package details
    navigate('/ai-coach/checkout/package', {
      state: {
        packageDetails: {
          ...selectedPackage,
          price: selectedPackage.price * 3.67 // Convert to AED
        }
      }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
        Interview Coaching
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ mb: 4 }}>
        Get personalized coaching to ace your next interview
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name, specialty, company..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                  <IconButton>
                    <SortIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Interview Coaches" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Coaching Packages" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="AI Practice" icon={<MessageIcon />} iconPosition="start" />
          <Tab label="Mock Interviews" icon={<VideocamIcon />} iconPosition="start" />
          <Tab label="Booking Confirmation" icon={<EventAvailableIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && (
            <>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Expert Interview Coaches
              </Typography>
              
              <Grid container spacing={3}>
                {filteredCoaches.map(coach => (
                  <Grid item xs={12} md={6} lg={4} key={coach.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={coach.image}
                          alt={coach.name}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '10px'
                          }}
                        >
                          <Typography variant="h6">{coach.name}</Typography>
                          <Typography variant="body2">{coach.title}</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {coach.company}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating
                            value={coach.rating}
                            precision={0.1}
                            readOnly
                            size="small"
                            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {coach.rating} ({coach.reviews} reviews)
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {coach.description}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Experience:</strong> {coach.experience} years
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Rate:</strong> AED {coach.hourlyRate * 3.67}/hour
                        </Typography>
                        
                        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                          {coach.availability}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {coach.specialties.map((specialty, index) => (
                            <Chip
                              key={index}
                              label={specialty}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                      
                      <Divider />
                      
                      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleViewProfile(coach.id)}
                        >
                          View Profile
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleBookSession(coach.id)}
                        >
                          Book Session
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {tabValue === 1 && (
            <>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Interview Coaching Packages
              </Typography>
              
              <Grid container spacing={3}>
                {packages.map(pkg => (
                  <Grid item xs={12} md={4} key={pkg.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="div" gutterBottom>
                          {pkg.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                          <Typography variant="h4" component="span" color="primary">
                            AED {pkg.price * 3.67}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            for {pkg.sessions} sessions
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          {pkg.description}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Duration:</strong> {pkg.duration}
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>
                          What's included:
                        </Typography>
                        
                        <ul style={{ paddingLeft: '20px' }}>
                          {pkg.features.map((feature, index) => (
                            <li key={index}>
                              <Typography variant="body2">
                                {feature}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={() => handlePurchasePackage(pkg.id)}
                        >
                          Purchase Package
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {tabValue === 2 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" gutterBottom>
                AI Interview Practice
              </Typography>
              <Typography variant="body1" paragraph>
                Practice with our AI-powered interview simulator that provides real-time feedback.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/ai-coach/interview')}
                startIcon={<MessageIcon />}
              >
                Start AI Practice
              </Button>
            </Box>
          )}
          
          {tabValue === 3 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" gutterBottom>
                Mock Interviews
              </Typography>
              <Typography variant="body1" paragraph>
                Practice with our structured mock interviews led by professional interviewers.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<VideocamIcon />}
                onClick={() => navigate('/ai-coach/mock-interview')}
              >
                Schedule Mock Interview
              </Button>
            </Box>
          )}
          
          {tabValue === 4 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" gutterBottom>
                Booking Confirmation
              </Typography>
              <Typography variant="body1" paragraph>
                View and manage your upcoming interview coaching sessions.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/my-bookings')}
                startIcon={<EventAvailableIcon />}
              >
                My Bookings
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default AllInterviewCoach; 