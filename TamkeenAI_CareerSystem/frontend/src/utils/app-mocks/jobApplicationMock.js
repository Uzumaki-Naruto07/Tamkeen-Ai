/**
 * Mock data for job applications
 */

// Mock job applications data
const jobApplicationsMock = [
  {
    id: 'app-1',
    userId: 'user-1',
    jobId: 'job-1',
    company: 'TechCorp UAE',
    position: 'Senior Frontend Developer',
    status: 'applied',
    appliedDate: '2023-03-15T10:30:00Z',
    lastUpdated: '2023-03-15T10:30:00Z',
    resume: {
      id: 'resume-1',
      name: 'Tech Resume 2023',
      url: '/mock/resumes/resume-1.pdf'
    },
    coverLetter: 'I am excited to apply for the Senior Frontend Developer position at TechCorp UAE...',
    matchScore: 87,
    feedback: null,
    interviews: []
  },
  {
    id: 'app-2',
    userId: 'user-1',
    jobId: 'job-2',
    company: 'Financial Solutions DMCC',
    position: 'UX/UI Designer',
    status: 'interviewing',
    appliedDate: '2023-02-28T14:45:00Z',
    lastUpdated: '2023-03-10T09:15:00Z',
    resume: {
      id: 'resume-2',
      name: 'Design Resume 2023',
      url: '/mock/resumes/resume-2.pdf'
    },
    coverLetter: 'With my strong background in user-centered design and experience with financial applications...',
    matchScore: 92,
    feedback: 'Great portfolio. Moving to first interview round.',
    interviews: [
      {
        id: 'int-1',
        type: 'screening',
        date: '2023-03-10T09:00:00Z',
        location: 'Zoom',
        status: 'completed',
        notes: 'Candidate demonstrated strong knowledge of UX principles'
      },
      {
        id: 'int-2',
        type: 'technical',
        date: '2023-03-20T13:00:00Z',
        location: 'Dubai Office',
        status: 'scheduled',
        notes: null
      }
    ]
  },
  {
    id: 'app-3',
    userId: 'user-1',
    jobId: 'job-3',
    company: 'Global Healthcare Dubai',
    position: 'Mobile App Developer',
    status: 'rejected',
    appliedDate: '2023-02-10T08:20:00Z',
    lastUpdated: '2023-02-25T16:45:00Z',
    resume: {
      id: 'resume-1',
      name: 'Tech Resume 2023',
      url: '/mock/resumes/resume-1.pdf'
    },
    coverLetter: 'I am applying for the Mobile App Developer position at Global Healthcare Dubai...',
    matchScore: 68,
    feedback: 'We selected candidates with more healthcare industry experience.',
    interviews: [
      {
        id: 'int-3',
        type: 'screening',
        date: '2023-02-18T11:00:00Z',
        location: 'Phone',
        status: 'completed',
        notes: 'Good technical skills but limited healthcare domain knowledge'
      }
    ]
  },
  {
    id: 'app-4',
    userId: 'user-1',
    jobId: 'job-4',
    company: 'Emirates Digital Solutions',
    position: 'Full Stack Developer',
    status: 'offered',
    appliedDate: '2023-01-20T09:30:00Z',
    lastUpdated: '2023-03-05T14:20:00Z',
    resume: {
      id: 'resume-1',
      name: 'Tech Resume 2023',
      url: '/mock/resumes/resume-1.pdf'
    },
    coverLetter: 'As a Full Stack Developer with 5 years of experience in building enterprise applications...',
    matchScore: 95,
    feedback: 'Excellent fit for our team! Formal offer to follow.',
    interviews: [
      {
        id: 'int-4',
        type: 'screening',
        date: '2023-01-25T10:00:00Z',
        location: 'Zoom',
        status: 'completed',
        notes: 'Strong communication skills'
      },
      {
        id: 'int-5',
        type: 'technical',
        date: '2023-02-05T13:30:00Z',
        location: 'Dubai Office',
        status: 'completed',
        notes: 'Excellent problem-solving skills'
      },
      {
        id: 'int-6',
        type: 'final',
        date: '2023-02-20T15:00:00Z',
        location: 'Dubai Office',
        status: 'completed',
        notes: 'Met with CTO and team leads, unanimous approval'
      }
    ],
    offer: {
      salary: '25,000 AED per month',
      benefits: ['Health insurance', 'Annual bonus', 'Relocation assistance'],
      startDate: '2023-04-15T00:00:00Z',
      responseDeadline: '2023-03-15T00:00:00Z'
    }
  },
  {
    id: 'app-5',
    userId: 'user-1',
    jobId: 'job-5',
    company: 'Abu Dhabi Smart City',
    position: 'AI Engineer',
    status: 'accepted',
    appliedDate: '2023-01-05T11:20:00Z',
    lastUpdated: '2023-02-10T09:00:00Z',
    resume: {
      id: 'resume-3',
      name: 'AI Specialist Resume',
      url: '/mock/resumes/resume-3.pdf'
    },
    coverLetter: 'With my background in machine learning and computer vision...',
    matchScore: 91,
    feedback: 'Welcome to the team!',
    interviews: [
      {
        id: 'int-7',
        type: 'screening',
        date: '2023-01-10T14:00:00Z',
        location: 'Teams',
        status: 'completed',
        notes: 'Strong theoretical knowledge'
      },
      {
        id: 'int-8',
        type: 'technical',
        date: '2023-01-18T10:30:00Z',
        location: 'Abu Dhabi Office',
        status: 'completed',
        notes: 'Excellent technical assessment results'
      },
      {
        id: 'int-9',
        type: 'final',
        date: '2023-01-25T16:00:00Z',
        location: 'Abu Dhabi Office',
        status: 'completed',
        notes: 'Great cultural fit'
      }
    ],
    offer: {
      salary: '28,000 AED per month',
      benefits: ['Health insurance', 'Education allowance', 'Housing allowance'],
      startDate: '2023-03-01T00:00:00Z',
      responseDeadline: '2023-02-08T00:00:00Z',
      acceptedDate: '2023-02-05T12:30:00Z'
    }
  }
];

// Helper functions for job applications
const getJobApplicationsByUserId = (userId) => {
  return jobApplicationsMock.filter(app => app.userId === userId);
};

const getJobApplicationById = (applicationId) => {
  return jobApplicationsMock.find(app => app.id === applicationId);
};

const getJobApplicationsByStatus = (userId, status) => {
  return jobApplicationsMock.filter(app => app.userId === userId && app.status === status);
};

export {
  jobApplicationsMock,
  getJobApplicationsByUserId,
  getJobApplicationById,
  getJobApplicationsByStatus
};

export default jobApplicationsMock; 