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

// Mock cover letter response
const mockCoverLetter = {
  content: `[Your Name]
[Your Address]
[Your Email]
[Your Phone Number]
[Date]

[Recipient Name]
[Company Name]
[Company Address]
[City, State ZIP Code]

Dear [Recipient Name],

I am writing to express my interest in the [Job Title] position at [Company Name]. 

[COVER_LETTER_BODY]

Thank you for considering my application. I look forward to the opportunity to discuss how my experience and skills would benefit [Company Name].

Sincerely,
[Your Name]`
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

  analyzeResumeWithDeepSeek: async (resumeId, jobData) => {
    // Make sure we have the file
    if (!jobData.file) {
      console.error('No file provided for analysis');
      throw new Error('No file provided for analysis');
    }
    
    console.log('File to analyze:', jobData.file.name, 'Size:', jobData.file.size, 'Type:', jobData.file.type);
    
    try {
      // First try DeepSeek with a direct axios call that doesn't include auth headers
      console.log('Attempting analysis with DeepSeek...');
      // Remove '/api' from baseURL since we'll include it in the URL path
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Create a new FormData object
      const formData = new FormData();
      
      // Log the file object for debugging
      console.log('File object:', jobData.file);
      
      // Append file and job details to FormData
      formData.append('file', jobData.file);
      formData.append('job_title', jobData.title || 'Software Engineer');
      formData.append('job_description', jobData.description || 'A software engineering position');
      
      // Force use of actual AI API, not mock data
      formData.append('force_real_api', 'true');
      
      // For debugging
      for (let pair of formData.entries()) {
        console.log('FormData contains:', pair[0], pair[1] instanceof File ? pair[1].name : pair[1]);
      }
      
      // Log the URL being called - fix the double /api/ issue
      const deepSeekUrl = `${baseURL}/ats/analyze-with-deepseek`;
      console.log('Calling URL:', deepSeekUrl);
      
      const response = await axios({
        method: 'post',
        url: deepSeekUrl,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
          // Explicitly NOT including auth header to avoid CORS issues
        },
        timeout: 45000 // Increased timeout for LLM processing
      });
      
      if (response && response.data) {
        console.log('DeepSeek analysis successful');
        return response;
      }
      throw new Error('Empty response from DeepSeek');
    } catch (deepseekError) {
      console.error('DeepSeek analysis failed:', deepseekError);
      // Log more details about the error
      if (deepseekError.response) {
        console.error('Error status:', deepseekError.response.status);
        console.error('Error data:', deepseekError.response.data);
      } else if (deepseekError.request) {
        console.error('No response received');
      } else {
        console.error('Error setting up request:', deepseekError.message);
      }
      
      try {
        // If DeepSeek fails, try OpenAI as fallback with direct axios call
        console.log('Falling back to OpenAI...');
        
        // Create a new FormData for the OpenAI request
        const openaiFormData = new FormData();
        openaiFormData.append('file', jobData.file);
        openaiFormData.append('job_title', jobData.title || 'Software Engineer');
        openaiFormData.append('job_description', jobData.description || 'A software engineering position');
        openaiFormData.append('use_openai_fallback', 'true');
        
        // For debugging
        for (let pair of openaiFormData.entries()) {
          console.log('OpenAI FormData contains:', pair[0], pair[1] instanceof File ? pair[1].name : pair[1]);
        }
        
        // Remove '/api' from baseURL since we'll include it in the URL path
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        // Log the URL being called - fix the double /api/ issue
        const openaiUrl = `${baseURL}/ats/analyze-with-openai`;
        console.log('Calling URL:', openaiUrl);
        
        const openaiResponse = await axios({
          method: 'post',
          url: openaiUrl,
          data: openaiFormData,
          headers: {
            'Content-Type': 'multipart/form-data'
            // Explicitly NOT including auth header to avoid CORS issues
          },
          timeout: 45000
        });
        
        if (openaiResponse && openaiResponse.data) {
          console.log('OpenAI fallback successful');
          return openaiResponse;
        }
        throw new Error('Empty response from OpenAI');
      } catch (openaiError) {
        console.error('OpenAI fallback failed:', openaiError);
        // Log more details about the error
        if (openaiError.response) {
          console.error('Error status:', openaiError.response.status);
          console.error('Error data:', openaiError.response.data);
        } else if (openaiError.request) {
          console.error('No response received');
        } else {
          console.error('Error setting up request:', openaiError.message);
        }
        
        throw new Error('Both DeepSeek and OpenAI analysis failed. Please try again later.');
      }
    }
  },

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
  ),

  // Cover letter generation
  generateCoverLetter: withMockFallback(
    async (resumeFile, jobData, options = {}) => {
      try {
        console.log('Generating cover letter with options:', options);
        const formData = new FormData();
        
        // Add resume file if available
        if (resumeFile) {
          formData.append('file', resumeFile);
        }
        
        // Add job data
        if (jobData) {
          formData.append('job_title', jobData.title || '');
          formData.append('job_description', jobData.description || '');
        }
        
        // Add options for customization
        formData.append('company_name', options.companyName || '');
        formData.append('company_address', options.companyAddress || '');
        formData.append('company_industry', options.companyIndustry || '');
        formData.append('company_website', options.companyWebsite || '');
        formData.append('recipient_name', options.recipientName || '');
        formData.append('tone', options.tone || 'professional');
        
        // Add user personal details
        formData.append('user_name', options.userName || '');
        formData.append('user_email', options.userEmail || '');
        formData.append('user_address', options.userAddress || '');
        formData.append('user_phone', options.userPhone || '');
        
        // Add analysis data if available
        if (options.analysisData) {
          formData.append('analysis_data', JSON.stringify(options.analysisData));
        }
        
        // Call API
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const url = `${baseURL}/resume/generate-cover-letter`;
        
        return axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 45000
        });
      } catch (error) {
        console.error('Cover letter generation failed:', error);
        throw error;
      }
    },
    (resumeFile, jobData, options = {}) => {
      // Process the mock cover letter template with provided data
      let coverLetterContent = mockCoverLetter.content;
      
      // Use user-provided information instead of extracting from filename
      let userInfo = {
        name: options.userName || "Your Name",
        address: options.userAddress || "Your Address",
        email: options.userEmail || "your.email@example.com",
        phone: options.userPhone || ""
      };
      
      // Company information
      let companyInfo = {
        name: options.companyName || "Company Name",
        address: options.companyAddress || "Company Address",
        industry: options.companyIndustry || "",
        website: options.companyWebsite || ""
      };
      
      // Replace placeholders with user info
      coverLetterContent = coverLetterContent.replace(/\[Your Name\]/g, userInfo.name);
      coverLetterContent = coverLetterContent.replace(/\[Your Address\]/g, userInfo.address);
      coverLetterContent = coverLetterContent.replace(/\[Your Email\]/g, userInfo.email);
      
      // Handle missing phone number (don't include if empty)
      if (userInfo.phone && userInfo.phone.trim()) {
        coverLetterContent = coverLetterContent.replace(/\[Your Phone Number\]/g, userInfo.phone);
      } else {
        coverLetterContent = coverLetterContent.replace(/\[Your Phone Number\]\n/g, '');
      }
      
      coverLetterContent = coverLetterContent.replace(/\[City, State ZIP Code\]\n/g, '');
      
      // Replace company info
      coverLetterContent = coverLetterContent.replace(/\[Company Name\]/g, companyInfo.name);
      coverLetterContent = coverLetterContent.replace(/\[Company Address\]/g, companyInfo.address);
      
      if (options.recipientName) {
        coverLetterContent = coverLetterContent.replace(/\[Recipient Name\]/g, options.recipientName);
      }
      
      if (jobData && jobData.title) {
        coverLetterContent = coverLetterContent.replace(/\[Job Title\]/g, jobData.title);
      }
      
      // Add current date in a more formal format
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      coverLetterContent = coverLetterContent.replace(/\[Date\]/g, currentDate);
      
      // Generate dynamic cover letter body based on job description and resume analysis
      let coverLetterBody = '';
      
      if (options.analysisData) {
        const analysis = options.analysisData;
        const jobDesc = jobData?.description || '';
        
        // Extract matching skills from analysis
        let matchingSkills = [];
        if (analysis.matching_keywords && analysis.matching_keywords.length > 0) {
          matchingSkills = analysis.matching_keywords.slice(0, 5);
        }
        
        // Extract key strengths from analysis
        let strengths = [];
        if (analysis.strength_points && analysis.strength_points.length > 0) {
          strengths = analysis.strength_points.slice(0, 2);
        } else if (analysis.sections_analysis) {
          // Extract from sections analysis if available
          const sectionScores = Object.entries(analysis.sections_analysis)
            .sort((a, b) => b[1].score - a[1].score);
          
          if (sectionScores.length > 0) {
            strengths.push(`Strong background in ${sectionScores[0][0].toLowerCase()}`);
          }
          if (sectionScores.length > 1) {
            strengths.push(`Solid experience in ${sectionScores[1][0].toLowerCase()}`);
          }
        }
        
        // Generate first paragraph introducing candidate's background and key skills
        const topSkills = matchingSkills.slice(0, 3).join(', ');
        coverLetterBody += `After reviewing the ${jobData.title} position at ${companyInfo.name}, I am excited to apply with my experience in ${topSkills}${topSkills ? ' ' : ''}that aligns perfectly with your requirements. `;
        
        // Add industry-specific or role-specific context if available
        if (companyInfo.industry) {
          coverLetterBody += `With extensive experience in the ${companyInfo.industry} industry, I believe I can make immediate contributions to your team. `;
        } else {
          coverLetterBody += `My background makes me well-positioned to contribute to your team's success. `;
        }
        
        // Second paragraph highlighting specific qualifications and accomplishments
        coverLetterBody += `\n\nMy qualifications include:\n\n`;
        
        // Add bullet points of specific skills and strengths
        if (matchingSkills.length > 0) {
          // Create grouped skills for more natural reading
          let skillGroups = [];
          
          // Group technical skills
          const techSkills = matchingSkills.filter(skill => 
            /javascript|python|java|react|node|aws|cloud|database|sql|nosql|api|backend|frontend/i.test(skill)
          );
          
          if (techSkills.length > 0) {
            skillGroups.push(`• Strong technical abilities in ${techSkills.join(', ')}`);
          }
          
          // Group soft skills
          const softSkills = matchingSkills.filter(skill => 
            /communication|teamwork|leadership|management|problem.solving|analytical|creative/i.test(skill)
          );
          
          if (softSkills.length > 0) {
            skillGroups.push(`• Demonstrated ${softSkills.join(', ')} skills`);
          }
          
          // Add remaining skills
          const remainingSkills = matchingSkills.filter(skill => 
            !techSkills.includes(skill) && !softSkills.includes(skill)
          );
          
          if (remainingSkills.length > 0) {
            skillGroups.push(`• Experience with ${remainingSkills.join(', ')}`);
          }
          
          // Add strengths as additional bullet points
          if (strengths.length > 0) {
            strengths.forEach(strength => {
              skillGroups.push(`• ${strength}`);
            });
          }
          
          // Add achievement bullet points
          skillGroups.push(`• Proven track record of delivering high-quality results on time and within budget`);
          skillGroups.push(`• Adaptable professional who thrives in fast-paced, collaborative environments`);
          
          // Add the bullet points to the cover letter
          coverLetterBody += skillGroups.join('\n');
        } else {
          // If no matching skills were found, create generic bullet points
          coverLetterBody += `• Experience in developing and implementing effective solutions\n`;
          coverLetterBody += `• Strong analytical and problem-solving abilities\n`;
          coverLetterBody += `• Excellent communication and collaboration skills\n`;
          coverLetterBody += `• Proven track record of delivering high-quality results on time\n`;
          coverLetterBody += `• Adaptable professional who thrives in fast-paced environments`;
        }
        
        // Third paragraph explaining why the company is appealing
        coverLetterBody += `\n\nI am particularly drawn to ${companyInfo.name} because of your reputation for innovation and excellence in the industry. `;
        
        // Add specific details about the company
        if (companyInfo.website) {
          coverLetterBody += `After reviewing your website at ${companyInfo.website}, I'm impressed by your commitment to excellence and innovation. `;
        } else if (jobDesc) {
          // Look for mention of company culture, values, or technologies
          if (jobDesc.match(/culture|environment|values|mission|vision/i)) {
            coverLetterBody += `Your company culture and values align with my professional philosophy of continuous growth and collaborative innovation. `;
          }
          
          if (jobDesc.match(/cutting.edge|innovative|latest|modern|advanced|state.of.the.art/i)) {
            coverLetterBody += `The opportunity to work with cutting-edge technologies and contribute to innovative solutions is particularly exciting. `;
          }
        } else {
          coverLetterBody += `The opportunity to apply my skills in a dynamic and challenging environment is particularly exciting. `;
        }
        
        // Fourth paragraph with a personalized conclusion
        coverLetterBody += `\n\nI am confident that my combination of skills, experience, and enthusiasm makes me an excellent candidate for this role. I am eager to bring my unique perspective to your team and contribute to your continued success.`;
        
        // Add interview request
        coverLetterBody += ` I would welcome the opportunity to discuss my qualifications further in an interview and demonstrate how my expertise can benefit ${companyInfo.name}.`;
        
        // Replace the placeholder with our generated body
        coverLetterContent = coverLetterContent.replace(/\[COVER_LETTER_BODY\]/g, coverLetterBody);
      } else {
        // Fallback generic cover letter body if no analysis data
        const fallbackBody = `I am writing with great interest in the ${jobData?.title || '[Job Title]'} position at ${companyInfo.name}. With my relevant background and skills, I am confident in my ability to make valuable contributions to your team.

My experience has equipped me with the skills necessary for this role, including strong technical abilities, excellent problem-solving skills, and effective communication. I have consistently delivered high-quality results and thrive in collaborative, fast-paced environments.

I am particularly drawn to ${companyInfo.name} because of your reputation for excellence and innovation in the industry. ${companyInfo.website ? `After reviewing your website at ${companyInfo.website}, ` : ''}I'm impressed by your commitment to excellence and innovation. The opportunity to contribute to your organization's continued success is exciting, and I believe my skills and experience make me an ideal candidate for this role.

I would welcome the opportunity to discuss my qualifications further in an interview and demonstrate how my expertise can benefit ${companyInfo.name}.`;
        
        coverLetterContent = coverLetterContent.replace(/\[COVER_LETTER_BODY\]/g, fallbackBody);
      }
      
      return {
        success: true,
        content: coverLetterContent
      };
    }
  )
};

export default resumeApi; 