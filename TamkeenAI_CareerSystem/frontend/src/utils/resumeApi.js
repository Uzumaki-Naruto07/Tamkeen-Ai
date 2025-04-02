import axios from 'axios';
import { RESUME_ENDPOINTS } from './endpoints';
import { JOB_ENDPOINTS } from '../api/endpoints';
import { api } from './api';
import mockData from './app-mocks/mockDataIndex';

// Helper function for mock data fallback
const withMockFallback = (apiCall, mockResponse) => {
  return async (...args) => {
    try {
      // Check if backend is known to be unavailable
      if (typeof window !== 'undefined' && localStorage.getItem('backend-unavailable') === 'true') {
        console.log('Backend known to be unavailable, using mock data directly');
        return { data: mockResponse instanceof Function ? mockResponse(...args) : mockResponse };
      }

      const response = await apiCall(...args);
      // If response exists but data is null (from interceptor), use mock data
      if (response && (!response.data || response.status >= 400)) {
        console.log(`API call failed with status ${response.status}, using mock data`);
        return { data: mockResponse instanceof Function ? mockResponse(...args) : mockResponse };
      }
      return response;
    } catch (error) {
      console.error('API call error:', error);
      
      // Set flag for temporarily unavailable backend
      if (error.message && (
        error.message.includes('CORS') || 
        error.message.includes('NetworkError') ||
        error.message.includes('METHOD NOT ALLOWED') ||
        error.message.includes('Network Error')
      )) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('backend-unavailable', 'true');
          // Clear this flag after 1 minute to try again later
          setTimeout(() => {
            localStorage.removeItem('backend-unavailable');
          }, 60000);
        }
      }
      
      return { data: mockResponse instanceof Function ? mockResponse(...args) : mockResponse };
    }
  };
};

const resumeApi = {
  // Resume management
  getResumes: withMockFallback(
    () => api.get(RESUME_ENDPOINTS.GET_ALL),
    mockData.resumes
  ),

  getUserResumes: withMockFallback(
    (userId) => {
      // In case backend is known to be unavailable, reject immediately to use mock
      if (typeof window !== 'undefined' && localStorage.getItem('backend-unavailable') === 'true') {
        return Promise.reject(new Error('Backend known to be unavailable'));
      }
      
      // Try the primary endpoint
      return api.get(RESUME_ENDPOINTS.GET_USER_RESUMES(userId))
        .catch(error => {
          // If primary endpoint fails with 405, try a direct endpoint without userId
          if (error.response && error.response.status === 405) {
            console.log('Method not allowed for user resumes endpoint, trying alternative endpoint');
            return api.get(`/resume/user-resumes`);
          }
          console.log('Get user resumes API error:', error);
          return Promise.reject(error); // Let the withMockFallback handle this rejection
        });
    },
    mockData.userResumes
  ),

  getResumeById: withMockFallback(
    (resumeId) => api.get(RESUME_ENDPOINTS.GET_BY_ID(resumeId)),
    (resumeId) => mockData.resumes.find(r => r.id === resumeId) || mockData.resumes[0]
  ),

  uploadResume: withMockFallback(
    (formData) => api.post(RESUME_ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    { success: true, id: 'mock-resume-id', message: 'Resume uploaded (mock)' }
  ),

  createResume: withMockFallback(
    (resumeData) => api.post(RESUME_ENDPOINTS.CREATE_RESUME, resumeData),
    { success: true, id: 'mock-resume-id', message: 'Resume created (mock)' }
  ),

  updateResume: withMockFallback(
    (resumeId, resumeData) => api.put(RESUME_ENDPOINTS.UPDATE_RESUME(resumeId), resumeData),
    { success: true, message: 'Resume updated (mock)' }
  ),

  deleteResume: withMockFallback(
    (resumeId) => api.delete(RESUME_ENDPOINTS.DELETE(resumeId)),
    { success: true, message: 'Resume deleted (mock)' }
  ),

  // ATS analysis and optimization
  analyzeResume: withMockFallback(
    (resumeId, jobData) => {
      const formData = new FormData();
      formData.append('file', jobData.file);
      formData.append('job_title', jobData.title);
      formData.append('job_description', jobData.description);
      
      return api.post('/ats/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    mockData.atsAnalysis
  ),

  analyzeResumeWithVisuals: withMockFallback(
    (resumeId, jobData) => {
      const formData = new FormData();
      formData.append('file', jobData.file); 
      formData.append('job_title', jobData.title);
      formData.append('job_description', jobData.description);
      
      return api.post('/ats/analyze-with-visuals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    mockData.atsAnalysisWithVisuals
  ),

  analyzeResumeWithDeepSeek: withMockFallback(
    (resumeId, jobData) => {
      const formData = new FormData();
      formData.append('file', jobData.file);
      formData.append('job_title', jobData.title);
      formData.append('job_description', jobData.description);
      
      return api.post('/ats/analyze-with-deepseek', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    {
      score: 75,
      job_title: "Software Engineer",
      matching_keywords: ["JavaScript", "React", "API", "frontend", "development"],
      missing_keywords: ["TypeScript", "Node.js", "AWS", "CI/CD", "Docker"],
      assessment: "Good. Your resume matches the job requirements reasonably well.",
      llm_analysis: "## STRENGTHS 🟢\n\n1. Strong frontend experience with React.js\n2. Demonstrated ability to build responsive web applications\n3. Experience with RESTful API integration\n4. Excellent communication skills\n5. Team collaboration experience\n\n## WEAKNESSES 🔴\n\n1. Limited backend experience\n2. No mention of cloud technologies\n3. Missing containerization skills\n4. Limited testing methodology experience\n5. Could improve quantifiable achievements\n\n## RECOMMENDATIONS 🚀\n\n- Add specific metrics to your accomplishments\n- Highlight any Node.js experience you may have\n- Consider gaining experience with AWS or similar cloud platforms\n- Include information about testing methodologies you've used",
      improvement_roadmap: "# CAREER DEVELOPMENT ROADMAP\n\n## SKILL GAP ANALYSIS\n\n1. Cloud Technologies (AWS, Azure, GCP)\n2. Backend Development (Node.js, Python)\n3. Containerization (Docker, Kubernetes)\n4. Testing Frameworks (Jest, Cypress)\n\n## LEARNING PLAN\n\n1. Complete AWS Certified Developer Associate course (3 months)\n2. Build a full-stack application with Node.js backend (2 months)\n3. Learn Docker fundamentals and container orchestration (1 month)\n\n## CAREER POSITIONING\n\nWith these additional skills, you'll be positioned for Senior Developer roles with a full-stack focus."
    }
  ),

  getSampleJobs: withMockFallback(
    () => api.get('/ats/sample-jobs'),
    {
      jobs: [
        { 
          title: "Software Engineer", 
          description: "We're hiring a Software Engineer to develop high-quality applications. Requirements: Bachelor's degree in Computer Science or related field. 2+ years experience in software development. Proficiency in Java, Python, or C++. Experience with web frameworks and version control systems. Strong problem-solving skills."
        },
        { 
          title: "Data Scientist", 
          description: "We are looking for a Data Scientist to analyze large datasets and build predictive models. Requirements: Advanced degree in Statistics, Mathematics, Computer Science or related field. 3+ years experience with Python, R, SQL. Experience with machine learning algorithms. Knowledge of TensorFlow, PyTorch, scikit-learn. Strong background in statistical analysis and data visualization."
        },
        { 
          title: "Full Stack Developer", 
          description: "Join our team as a Full Stack Developer to work on both front-end and back-end systems. Requirements: Bachelor's degree in Computer Science or related field. Proficiency in HTML, CSS, JavaScript, and back-end languages like Python, Java, or Ruby. Experience with databases, APIs, and version control. Excellent problem-solving and communication skills."
        },
        { 
          title: "UI/UX Designer", 
          description: "We are seeking a creative UI/UX Designer to enhance our user experience. Requirements: Degree in Design, HCI, or a related field. Proficiency in design tools like Adobe XD, Sketch, or Figma. A strong portfolio demonstrating user-centered design. Excellent communication and collaboration skills."
        },
        { 
          title: "DevOps Engineer", 
          description: "Join our team as a DevOps Engineer to streamline our development and deployment processes. Requirements: Experience with continuous integration/delivery tools. Knowledge of cloud platforms and containerization (Docker, Kubernetes). Strong scripting and automation skills. Excellent communication and teamwork abilities."
        }
      ]
    }
  ),

  getAtsScore: withMockFallback(
    (resumeId) => api.get(`/ats/score/${resumeId}`),
    { score: 75 }
  ),

  optimizeResume: withMockFallback(
    (resumeText, jobTitle, jobDescription) => {
      const formData = new FormData();
      formData.append('resume_text', resumeText);
      formData.append('job_title', jobTitle);
      formData.append('job_description', jobDescription);
      
      return api.post('/ats/optimize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    { 
      optimization: [
        { title: "Add missing keywords", description: "Include relevant skills like TypeScript and GraphQL" },
        { title: "Quantify achievements", description: "Add metrics to your work experience" }
      ],
      atsScore: 78 
    }
  ),

  // Resume parsing and conversion
  parseResume: withMockFallback(
    (resumeId) => api.get(`${RESUME_ENDPOINTS.GET_BY_ID(resumeId)}/parse`),
    mockData.resumeParseResult
  ),

  exportResume: withMockFallback(
    async (resumeId, format) => {
      const response = await api.get(`${RESUME_ENDPOINTS.GET_BY_ID(resumeId)}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      // Create download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    },
    { success: true, message: 'Mock export completed' }
  ),

  // ATS history
  getAtsHistory: withMockFallback(
    () => api.get('/ats/history'),
    mockData.atsHistory
  ),

  getAtsAnalysisById: withMockFallback(
    (analysisId) => {
      // Try GET first
      return api.get(`/ats/history/${analysisId}`)
        .catch(error => {
          // If GET fails with METHOD NOT ALLOWED, try POST
          if (error.response && error.response.status === 405) {
            console.log('GET method not allowed for ATS analysis, trying POST...');
            return api.post(`/ats/history/${analysisId}`, {});
          }
          console.log('ATS analysis by ID API error, using mock fallback:', error);
          return { data: null };
        });
    },
    (analysisId) => mockData.atsHistory?.find(a => a.id === analysisId) || mockData.atsAnalysis
  )
};

export default resumeApi; 