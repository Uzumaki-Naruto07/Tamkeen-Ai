/**
 * Mock data for jobs listings and recommendations
 */

// Define job categories
export const mockJobCategories = [
  "Software Development",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "IT Support"
];

// Define industries
export const mockIndustries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Media",
  "Telecommunications",
  "Energy",
  "Transportation"
];

// Define skills
export const mockSkills = [
  "JavaScript",
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "Java",
  "HTML/CSS",
  "SQL",
  "AWS",
  "Docker",
  "Git",
  "CI/CD",
  "Agile",
  "UI/UX Design",
  "Data Analysis",
  "Machine Learning"
];

// Calculate dates for jobs relative to today
const today = new Date();
const getDateString = (daysAgo) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const getDeadlineString = (daysFromNow) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

// Mock jobs data
export const mockJobs = [
  {
    id: "job-1",
      title: "Senior Frontend Developer",
    company: "TechCorp UAE",
    companyLogo: "https://via.placeholder.com/150?text=TechCorp",
    location: "Dubai, UAE",
    salary: "25,000 - 35,000 AED",
    salaryRange: "25K-35K AED",
      jobType: "Full-time",
    remote: false,
    description: "We are looking for an experienced Frontend Developer to join our team...",
    requirements: ["5+ years React experience", "TypeScript", "CSS/SASS"],
    skills: ["React", "TypeScript", "JavaScript", "CSS"],
    postedDate: "2025-03-26",
    deadline: getDeadlineString(25),
    matchScore: 87
  },
  {
    id: "job-2",
    title: "UX/UI Designer",
    company: "Creative Solutions",
    companyLogo: "https://via.placeholder.com/150?text=Creative",
    location: "Abu Dhabi, UAE",
    salary: "20,000 - 28,000 AED",
    salaryRange: "20K-28K AED",
      jobType: "Full-time",
    remote: true,
    description: "Looking for a talented UX/UI Designer to create stunning interfaces...",
    requirements: ["3+ years UX/UI design", "Figma", "User research"],
    skills: ["UI Design", "UX Research", "Figma", "Adobe XD"],
    postedDate: getDateString(10),
    deadline: getDeadlineString(20),
    matchScore: 92
  },
  {
    id: "job-3",
    title: "Full Stack Developer",
    company: "Digital Innovations",
    companyLogo: "https://via.placeholder.com/150?text=Digital",
    location: "Dubai, UAE",
    salary: "22,000 - 32,000 AED",
    salaryRange: "22K-32K AED",
      jobType: "Contract",
    remote: true,
    description: "Seeking a versatile Full Stack Developer for our growing team...",
    requirements: ["Node.js", "React", "MongoDB", "DevOps experience"],
    skills: ["Node.js", "React", "MongoDB", "Express", "AWS"],
    postedDate: getDateString(15),
    deadline: getDeadlineString(15),
    matchScore: 83
  },
  {
    id: "job-4",
      title: "React Native Developer",
    company: "MobileApp Solutions",
    companyLogo: "https://via.placeholder.com/150?text=Mobile",
    location: "Sharjah, UAE",
    salary: "18,000 - 26,000 AED",
    salaryRange: "18K-26K AED",
      jobType: "Full-time",
    remote: false,
    description: "Join our mobile app development team as a React Native expert...",
    requirements: ["2+ years React Native", "iOS/Android knowledge", "API integration"],
    skills: ["React Native", "JavaScript", "iOS", "Android", "API"],
    postedDate: getDateString(5),
    deadline: getDeadlineString(20),
    matchScore: 76
  },
  {
    id: "job-5",
    title: "DevOps Engineer",
    company: "Cloud Technologies",
    companyLogo: "https://via.placeholder.com/150?text=Cloud",
    location: "Dubai, UAE",
    salary: "28,000 - 38,000 AED",
    salaryRange: "28K-38K AED",
      jobType: "Full-time",
    remote: true,
    description: "We're looking for a DevOps Engineer to build and maintain our cloud infrastructure...",
    requirements: ["AWS", "Docker", "Kubernetes", "CI/CD pipelines", "Linux"],
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"],
    postedDate: getDateString(10),
    deadline: getDeadlineString(15),
    matchScore: 89
  },
  {
    id: "job-6",
    title: "Data Scientist",
    company: "Analytics Hub",
    companyLogo: "https://via.placeholder.com/150?text=Analytics",
    location: "Abu Dhabi, UAE",
    salary: "26,000 - 36,000 AED",
    salaryRange: "26K-36K AED",
    jobType: "Full-time",
    remote: false,
    description: "Join our data science team to analyze complex datasets and build predictive models...",
    requirements: ["Python", "Machine Learning", "Statistics", "Data visualization"],
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Tableau"],
    postedDate: getDateString(15),
    deadline: getDeadlineString(10),
    matchScore: 81
  },
  {
    id: "job-7",
    title: "Frontend Team Lead",
    company: "Digital Agency",
    companyLogo: "https://via.placeholder.com/150?text=Digital",
    location: "Dubai, UAE",
    salary: "35,000 - 45,000 AED",
    salaryRange: "35K-45K AED",
    jobType: "Full-time",
    remote: false,
    description: "Looking for a Frontend Team Lead to manage our developers and drive technical decisions...",
    requirements: ["7+ years frontend development", "3+ years team management", "Technical architecture"],
    skills: ["React", "JavaScript", "Team Leadership", "Technical Planning", "Code Reviews"],
    postedDate: getDateString(10),
    deadline: getDeadlineString(10),
    matchScore: 94
  },
  {
    id: "job-8",
    title: "Backend Developer",
    company: "FinTech Solutions",
    companyLogo: "https://via.placeholder.com/150?text=FinTech",
    location: "Dubai, UAE",
    salary: "22,000 - 30,000 AED",
    salaryRange: "22K-30K AED",
    jobType: "Full-time",
    remote: true,
    description: "Develop robust backend systems for our financial technology platform...",
    requirements: ["Java or Python", "RESTful APIs", "SQL/NoSQL databases", "Microservices"],
    skills: ["Java", "Spring Boot", "MySQL", "REST API", "Microservices"],
    postedDate: getDateString(5),
    deadline: getDeadlineString(5),
    matchScore: 85
  },
  {
    id: "job-9",
    title: "Product Designer",
    company: "User Experience Ltd",
    companyLogo: "https://via.placeholder.com/150?text=UX",
    location: "Abu Dhabi, UAE",
    salary: "18,000 - 28,000 AED",
    salaryRange: "18K-28K AED",
    jobType: "Full-time",
    remote: false,
    description: "Design intuitive and beautiful product experiences for our clients...",
    requirements: ["3+ years product design", "UI/UX principles", "Design systems"],
    skills: ["Product Design", "UI/UX", "Wireframing", "Prototyping", "User Research"],
    postedDate: getDateString(10),
    deadline: getDeadlineString(5),
    matchScore: 79
  },
  {
    id: "job-10",
    title: "AI Engineer",
    company: "AI Solutions",
    companyLogo: "https://via.placeholder.com/150?text=AI",
    location: "Dubai, UAE",
    salary: "30,000 - 40,000 AED",
    salaryRange: "30K-40K AED",
    jobType: "Full-time",
    remote: true,
    description: "Develop cutting-edge AI solutions for enterprise clients...",
    requirements: ["Machine Learning", "Deep Learning", "NLP", "Python", "AI frameworks"],
    skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision"],
    postedDate: getDateString(5),
    deadline: getDeadlineString(10),
    matchScore: 88
  }
];

// Default export includes all data
const mockJobsData = {
  jobs: mockJobs,
  categories: mockJobCategories,
  industries: mockIndustries,
  skills: mockSkills
};

export default mockJobsData; 