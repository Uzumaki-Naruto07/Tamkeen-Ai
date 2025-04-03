import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Grid, Paper, Typography, Box, TextField,
  List, ListItem, Button, Avatar, Chip, CircularProgress,
  Divider, InputAdornment, Tabs, Tab
} from '@mui/material';
import {
  QuestionAnswer, School, Search, Category, FormatListBulleted,
  Shield, Explore, EmojiEvents, FlagCircle, Timer,
  BarChart, AddTask, TaskAlt, ExpandLess, VolumeUp,
  PeopleAlt, Code, Public, Face, Business, Chat, Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import OllamaDeepSeekChatbot from '../components/ai/OllamaDeepSeekChatbot';

function AIInterviewCoach() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  const selectedCoach = {
    name: 'Interview Coach',
    avatar: '/assets/coach-avatar.png',
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Sample suggested questions
  const suggestedQuestions = [
    "Tell me about yourself and your experience.",
    "What are your greatest strengths as a professional?",
    "What do you consider to be your weaknesses?",
    "Why are you interested in this position?",
    "Where do you see yourself in 5 years?",
  ];

  // Sample categorized questions with icons
const categorizedQuestions = [
    { category: 'Technical', icon: <Code fontSize="small" />, questions: [
      { text: "Explain the difference between REST and GraphQL." },
      { text: "What is your experience with cloud technologies?" },
      { text: "How do you approach debugging a complex issue?" },
    ]},
    { category: 'Behavioral', icon: <Face fontSize="small" />, questions: [
      { text: "Describe a challenging situation you faced at work and how you handled it." },
      { text: "How do you handle conflicts with team members?" },
      { text: "Tell me about a time you had to learn something quickly." },
    ]},
    { category: 'Leadership', icon: <PeopleAlt fontSize="small" />, questions: [
      { text: "How do you motivate your team members?" },
      { text: "Describe your leadership style." },
      { text: "How do you delegate responsibilities?" },
    ]},
    { category: 'Company', icon: <Business fontSize="small" />, questions: [
      { text: "What do you know about our company?" },
      { text: "Why do you want to work for us specifically?" },
      { text: "How do you see yourself contributing to our company culture?" },
    ]},
    { category: 'Adaptability', icon: <ExpandLess fontSize="small" />, questions: [
      { text: "Describe a time when you had to learn something entirely new in 24 hours." },
      { text: "Tell me about a situation when project priorities shifted unexpectedly." },
      { text: "As a team leader, how have you helped your team adapt to a major organizational change?" },
    ]},
    { category: 'Critical Thinking', icon: <TaskAlt fontSize="small" />, questions: [
      { text: "Share an example of a problem that required you to think critically." },
      { text: "Describe a complex work problem and how you analyzed it to find a solution." },
      { text: "Give an example of using data to change someone's mind or improve a decision." },
    ]},
    { category: 'Innovation', icon: <Explore fontSize="small" />, questions: [
      { text: "Describe a creative idea you suggested that improved a process." },
      { text: "Tell me about a product or process improvement you initiated at work." },
      { text: "What is the most innovative project you've led, and how did you foster creativity?" },
    ]},
    { category: 'Prioritization', icon: <Timer fontSize="small" />, questions: [
      { text: "How do you manage your time when facing multiple assignments or deadlines?" },
      { text: "Describe a time when conflicting priorities forced you to choose one task over another." },
      { text: "As a manager, how do you balance strategic initiatives with day-to-day operations?" },
    ]},
    { category: 'Communication', icon: <VolumeUp fontSize="small" />, questions: [
      { text: "How do you ensure your message is clear when explaining technical details to non-technical people?" },
      { text: "Describe how you handled a situation where a customer was frustrated by a product issue." },
      { text: "How do you adjust your communication style when working with an international team?" },
    ]},
    { category: 'Self-Awareness', icon: <Shield fontSize="small" />, questions: [
      { text: "What is one area you've identified for improvement, and what steps are you taking?" },
      { text: "Describe a failure you experienced and what you learned from it." },
      { text: "How do you proactively seek feedback, and how has it helped you improve?" },
    ]},
    { category: 'UAE', icon: <Public fontSize="small" />, questions: [
      { text: "How do your personal goals align with the UAE Vision 2030?" },
      { text: "What's your perspective on Emiratization, and how do you see yourself contributing?" },
      { text: "How would you use your skills to help the UAE achieve sustainability goals?" },
      { text: "UAE ranks high in innovation. How would you help sustain that position?" },
      { text: "How have UAE youth programs helped shape your career?" },
      { text: "How can technology help preserve Emirati heritage?" },
      { text: "What role does AI play in transforming UAE's education sector?" },
      { text: "How do you see yourself contributing to UAE's government digital transformation?" },
      { text: "What role should AI play in UAE's emergency response systems?" },
      { text: "How do you ensure ethical AI in the UAE context?" },
      { text: "How can the UAE encourage more women in AI and tech fields?" },
      { text: "How important is Arabic NLP for the UAE's tech future?" },
      { text: "What role can AI play in supporting UAE's smart transportation goals?" },
      { text: "How would you use AI to build a startup that serves UAE society?" },
      { text: "How can UAE ensure digital inclusion for all citizens?" },
      { text: "How could you use emerging technologies to enhance tourism in the UAE?" },
      { text: "What's your view on managing sensitive data in AI systems in the UAE?" },
      { text: "How can blockchain improve trust in public services?" },
      { text: "How should UAE prepare its digital infrastructure for the future of remote work?" },
      { text: "What is one AI solution you would deploy to solve a UAE-specific societal issue?" },
    ]},
  ];

  // Function to load questions from a specific category
  const loadCategoryQuestions = (category) => {
    const selectedCategoryData = categorizedQuestions.find(cat => cat.category === category);
    if (selectedCategoryData) {
      setCategoryQuestions(selectedCategoryData.questions);
      setSelectedCategory(category);
    }
  };

  // Function to send a predefined question
  const sendPredefinedQuestion = (questionText) => {
    if (isLoading) return;
    
    // Format current time for timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMessage = {
      type: 'user',
      text: questionText,
      timestamp
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
        const aiResponse = {
        type: 'ai',
        text: generateAIResponse(questionText),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
          setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };
  
  // Simulate AI response based on question
  const generateAIResponse = (question) => {
    // In a real app, this would be an API call to your AI service
    const responses = {
      "Tell me about yourself and your experience.": 
        "When answering this question, focus on sharing a brief professional summary followed by your most relevant accomplishments. Keep it concise (60-90 seconds) and tailor it to the position. Avoid reciting your entire resume or sharing overly personal information. Instead, highlight your unique value proposition and end with why you're excited about this opportunity.",
      
      "What are your greatest strengths as a professional?": 
        "When discussing your strengths, choose 2-3 that are directly relevant to the job. For each strength, provide a specific example that demonstrates how you've used it effectively. Focus on qualities that add value to the organization, and make sure they align with the job requirements. Be authentic but not arrogant, and avoid generic answers like 'I'm a hard worker.'",
      
      "What do you consider to be your weaknesses?": 
        "The best approach to this question is to mention a genuine weakness that isn't critical to the job, explain how you recognized it, and describe the specific steps you're taking to improve. Show self-awareness and a commitment to growth. Avoid the 'strengths disguised as weaknesses' approach (like 'I work too hard') or claiming you have no weaknesses.",
      
      "Why are you interested in this position?": 
        "Your answer should demonstrate that you've researched the company and understand the role. Explain how your skills and experience align with the position's requirements, and show enthusiasm for the company's mission, culture, or products. Be specific about what attracts you to this particular role and organization, rather than giving generic reasons that could apply anywhere.",
      
      "Where do you see yourself in 5 years?": 
        "When answering this question, show ambition while remaining realistic and relevant to the role. Discuss how you hope to grow and develop within the organization, taking on more responsibilities that align with both the company's needs and your career goals. Avoid mentioning goals that have nothing to do with the position or suggesting you plan to leave quickly.",
      
      // Adaptability questions
      "Describe a time when you had to learn something entirely new in 24 hours.": 
        "When answering this question, emphasize the urgency of the situation and your approach to rapid learning. Start by explaining the context—what you needed to learn and why the timeframe was so tight. Outline your prioritization strategy: how you identified the most critical aspects to focus on first. Describe your learning methods: what resources you used, how you practiced, and how you sought feedback. Include a specific example like: 'At my internship, I had to present a Power BI dashboard with only 24 hours to learn the tool. I focused first on understanding the data structure, then quickly learned essential charts through tutorials, avoiding complex customizations to save time. I delivered a clean dashboard that met all requirements, and my manager later asked me to document my process for other interns.'",
      
      "Tell me about a situation when project priorities shifted unexpectedly.": 
        "This question tests your flexibility and ability to re-prioritize under pressure. Begin by describing the original project and its priorities, then explain what caused the sudden shift. Detail your response: how you remained calm, reassessed tasks based on new priorities, and communicated changes to stakeholders. Focus on your methodical approach: how you reorganized resources, adjusted timelines, and maintained team focus during the transition. Include a specific outcome like: 'While coordinating a marketing campaign, our VP suddenly shifted focus to a new product launch. I immediately held a team meeting to realign priorities, reassigned roles based on strengths, and updated our project timeline. We successfully launched the product on time, and the team appreciated the clear communication during the change.'",
      
      "As a team leader, how have you helped your team adapt to a major organizational change?": 
        "This leadership question assesses your change management skills. Describe a significant organizational change (restructuring, new technology, merger) and its potential impact on your team. Focus on your proactive leadership: how you communicated transparently about the change, addressed concerns, and provided a clear vision of the future state. Detail your support strategies: how you offered additional training, created new processes, or adjusted goals to facilitate the transition. Include specific results: 'During a company-wide restructuring, I held regular forums to address concerns, organized training sessions for new systems, and redefined our team goals to align with the new organization. As a result, our team maintained productivity throughout the transition and even exceeded performance targets under the new structure.'",
      
      // Critical Thinking questions
      "Share an example of a problem that required you to think critically.": 
        "This question assesses your analytical approach to problem-solving. Select a meaningful problem that showcases your reasoning process. Describe the situation clearly, then walk through your systematic approach: how you gathered relevant information, identified potential causes, developed multiple solutions, evaluated options using clear criteria, and implemented your chosen solution. Focus on your thought process rather than just outcomes. Include measurable results: 'During a class project, our prototype wasn't functioning correctly. I systematically tested each component, identified a sensor calibration error through process of elimination, adjusted the settings based on manufacturer specifications, and got our device working perfectly. This methodical approach earned us the highest grade and taught me the value of breaking complex problems into testable components.'",
      
      "Describe a complex work problem and how you analyzed it to find a solution.": 
        "This question explores your structured analytical process in a professional context. Begin by clearly defining the complex problem and why standard approaches were insufficient. Detail your analytical methodology: how you gathered and organized relevant data, identified patterns or root causes, generated alternative solutions, and evaluated options against clear criteria. Focus on the systematic nature of your approach rather than intuition. Include specific metrics: 'As a supply chain analyst, I investigated recurring delivery delays by mapping the entire process and analyzing time data at each stage. This revealed that production scheduling was the primary bottleneck. I proposed adjusting inventory forecasts and implementing new scheduling protocols, which improved on-time deliveries by 30% within three months.'",
      
      "Give an example of using data to change someone's mind or improve a decision.": 
        "This question examines your ability to leverage data for persuasive purposes. Describe a situation where opinions or intuition were initially guiding a decision. Explain your data-driven approach: how you identified relevant metrics, collected and analyzed information, and presented compelling evidence. Focus on how you communicated your findings effectively to influence others, addressing potential objections. Include tangible results: 'At my previous company, I convinced management to refactor an underperforming software module by presenting performance benchmarks, error rate trends, and user feedback data. I created visualizations that clearly showed the performance issues and potential ROI of refactoring. After implementing the changes based on my data-driven recommendation, application speed improved by 20% and error rates dropped significantly.'",
      
      // Innovation questions
      "Describe a creative idea you suggested that improved a process.": 
        "This question examines your innovative thinking in practical situations. Begin by explaining the existing process and its limitations. Then describe your creative insight: what inspired it and why it was different from conventional approaches. Detail how you developed and presented your idea, addressing potential resistance or skepticism. Include specific improvements: 'At my internship, I noticed our team spent hours manually compiling social media analytics. I proposed using interactive polls to engage customers instead of just static posts, creating a dashboard that automatically aggregated results. This creative approach not only saved 5 hours weekly but also increased customer engagement by 40%. The department later adopted this method for all campaigns, showing how a fresh perspective can transform routine processes.'",
      
      "Tell me about a product or process improvement you initiated at work.": 
        "This question assesses your proactive approach to innovation. Start by identifying the product or process that needed improvement and how you recognized this opportunity. Explain your systematic approach: how you researched potential solutions, developed your improvement plan, and secured necessary support from stakeholders. Detail the implementation process, including how you overcame obstacles. Include measurable impact: 'As a logistics coordinator, I noticed our manual data entry process was error-prone and time-consuming. I researched options and designed a custom spreadsheet macro that automated the most repetitive tasks. After testing and refining the solution, I trained the team on the new system. This initiative reduced processing time by 20 hours weekly, improved data accuracy by 95%, and was subsequently adopted by other departments.'",
      
      "What is the most innovative project you've led, and how did you foster creativity?": 
        "This leadership question explores how you cultivate innovation in teams. Begin by describing the innovative project, explaining what made it unique or groundbreaking. Then focus on your leadership approach: how you created psychological safety for creative risk-taking, facilitated effective brainstorming, encouraged diverse perspectives, and balanced creativity with practical execution. Detail specific techniques you used to overcome creative blocks or resistance. Include tangible outcomes: 'As a product director, I led an AR app development that allowed customers to visualize products in their homes. To foster creativity, I organized cross-functional innovation workshops, implemented a 'no criticism' rule during ideation, and created a rapid prototyping process to test ideas quickly. I also established regular 'demo days' where team members could showcase experimental features. This approach not only resulted in a flagship product that increased customer engagement by 50% but also created a collaborative innovation culture that continued beyond the project.'",
      
      // Prioritization questions
      "How do you manage your time when facing multiple assignments or deadlines?": 
        "When managing multiple deadlines, focus on your systematic approach to prioritization. Explain how you assess tasks based on urgency, importance, and alignment with key goals. Describe your organizational tools and techniques, such as creating detailed to-do lists, using time-blocking in your calendar, or employing the Eisenhower Matrix to distinguish between urgent and important tasks. Include how you build in buffer time for unexpected issues and regularly reassess priorities as circumstances change. Provide a specific example of how this approach helped you successfully manage competing deadlines.",
      
      "Describe a time when conflicting priorities forced you to choose one task over another.": 
        "When answering this question, demonstrate your decision-making process under pressure. Describe a specific situation with genuinely competing priorities where you couldn't do both tasks. Explain the criteria you used to make your decision—such as business impact, stakeholder needs, resource requirements, and strategic importance. Detail how you communicated your decision to affected parties, managed expectations, and mitigated any negative consequences of the deprioritized task. Focus on showing that you made a thoughtful, well-reasoned choice rather than just picking the easier option.",
      
      "As a manager, how do you balance strategic initiatives with day-to-day operations?": 
        "This question tests your ability to manage both long-term vision and immediate needs. Explain your approach to time allocation, such as dedicating specific days or time blocks to strategic planning versus operational management. Describe your delegation strategy—how you develop team members' capabilities to handle routine operations while creating space for strategic thinking. Emphasize your communication methods for connecting daily activities to long-term objectives, so your team understands how their work contributes to the bigger picture. Include how you measure success in both areas to ensure neither is neglected.",
      
      // Communication questions
      "How do you ensure your message is clear when explaining technical details to non-technical people?": 
        "When explaining technical concepts to non-technical audiences, focus on using simple language, relevant analogies, and visual aids. Start by assessing your audience's baseline knowledge and adjust accordingly. Avoid jargon and acronyms, or define them clearly if necessary. Use concrete examples that relate to their experience, and check for understanding throughout your explanation. For instance, when explaining a complex database structure, you might compare it to an organized library system that the audience is familiar with.",
      
      "Describe how you handled a situation where a customer was frustrated by a product issue.": 
        "When handling a frustrated customer, demonstrate empathy, active listening, and problem-solving skills. Begin by acknowledging their frustration without becoming defensive. Ask clarifying questions to fully understand the issue, and maintain a calm, professional demeanor throughout. Clearly communicate the steps you'll take to resolve the problem, set realistic expectations about timeline and solutions, and follow up to ensure satisfaction. In your answer, include how you turned the negative situation into a positive customer experience.",
      
      "How do you adjust your communication style when working with an international team?": 
        "When working with international teams, demonstrate cultural awareness and communication flexibility. Explain how you use clear, simple language free of idioms and slang, provide written summaries after verbal discussions, and respect time zone differences when scheduling meetings. Mention how you research cultural communication norms before engaging with international colleagues and modify your approach accordingly. Include how these adaptations have led to more effective collaboration and stronger team relationships.",
      
      // Self-Awareness questions
      "What is one area you've identified for improvement, and what steps are you taking?": 
        "When discussing self-improvement, choose a genuine development area that's relevant but not critical to the job. Explain how you identified this improvement need—whether through feedback, self-assessment, or performance evaluation. Detail your specific action plan, including resources you're using, mentorship you've sought, or training you're undergoing. Describe how you're measuring progress and any improvements already achieved. Show that you view professional development as ongoing, and that you're proactive rather than waiting for others to highlight your weaknesses.",
      
      "Describe a failure you experienced and what you learned from it.": 
        "When discussing failure, choose a genuine professional setback and demonstrate accountability without making excuses. The focus should be on your response to the failure: how you analyzed what went wrong, the specific lessons you extracted, and most importantly, how you applied those insights to improve your future performance. End with a tangible example of how this learning experience made you more effective, showing that you view failures as growth opportunities. This demonstrates resilience, self-awareness, and a commitment to continuous improvement.",
      
      "How do you proactively seek feedback, and how has it helped you improve?": 
        "When answering this question, demonstrate your commitment to continuous improvement through external input. Describe your systematic approach to gathering feedback from diverse sources—managers, peers, direct reports, and clients. Explain how you create conditions where people feel comfortable giving honest feedback, such as asking specific questions rather than general ones. Detail your process for analyzing feedback patterns and distinguishing between actionable insights and outlier opinions. Include a specific example of how you implemented feedback to improve a skill or process, showing that you not only collect input but actually act on it.",
      
      // UAE questions
      "How do your personal goals align with the UAE Vision 2030?": 
        "This question assesses your knowledge of national priorities and your ability to connect personal ambitions with national progress. Start by demonstrating your understanding of key UAE Vision 2030 pillars—knowledge economy, sustainability, and innovation. Then articulate how your career goals contribute to these national objectives. Be specific about which aspect of the vision you're most passionate about, whether it's digital transformation, renewable energy, or cultural preservation. For example: 'My goal to become an AI engineer directly supports the UAE's vision of creating a knowledge-based economy. I'm currently developing smart city solutions that align with the Smart Government pillar of Vision 2030, helping create more efficient public services while reducing environmental impact.'",
      
      "What's your perspective on Emiratization, and how do you see yourself contributing?": 
        "This question explores your understanding of national workforce development priorities. Begin by acknowledging the importance of building local capacity and empowering Emirati talent. Describe specific ways you contribute or would contribute, such as mentoring, knowledge transfer, or skills development. Show that you view Emiratization as a strategic advantage rather than merely a quota. Include a concrete example like: 'I volunteered to lead workshops teaching coding basics to fellow Emiratis at my university. By raising digital literacy within local communities, I'm directly supporting Emiratization goals while helping build the technical foundation needed for our knowledge economy. I believe sustainable development requires cultivating expertise locally rather than relying indefinitely on imported talent.'",
      
      "How would you use your skills to help the UAE achieve sustainability goals?": 
        "This question tests your awareness of UAE's environmental commitments, particularly Net Zero 2050, and your ability to apply your expertise to sustainability challenges. Begin by acknowledging the UAE's leadership in sustainable development. Then propose a specific application of your skills to environmental goals—whether through green technology, optimizing resource consumption, or creating awareness. Include a practical example: 'As a data scientist, I would apply machine learning to optimize energy consumption in commercial buildings. I've already built a prototype sensor system for my university that reduced electricity usage by 15%. By scaling this approach across government buildings, we could significantly reduce carbon emissions while generating data to support the UAE's climate action commitments. This directly contributes to both Smart City initiatives and Net Zero 2050 targets.'",
      
      "UAE ranks high in innovation. How would you help sustain that position?": 
        "This question assesses your understanding of the UAE's innovation ecosystem and your potential contribution to it. Begin by acknowledging the UAE's achievements in global innovation rankings. Then focus on how your specific expertise can contribute to continued innovation leadership, whether through research, entrepreneurship, or process improvements. Reference relevant national innovation programs or hubs. Include a specific example: 'I would help maintain the UAE's innovation leadership by developing Arabic-language AI tools that fill regional technology gaps. My current project on Arabic text summarization addresses a specific need in the region's media and educational markets. By creating technology tailored to local requirements rather than importing solutions, we can establish the UAE as not just an adopter but a creator of cutting-edge technology, enhancing our position in global innovation indexes.'",
      
      "How have UAE youth programs helped shape your career?": 
        "This question explores your engagement with national talent development initiatives. Start by referencing specific UAE youth programs—whether the Arab Youth Center, Youth Hubs, or other government initiatives—that have influenced your development. Explain how these programs provided skills, networks, or opportunities that shaped your career trajectory. Show appreciation for the investment in youth while demonstrating how you've leveraged these opportunities meaningfully. Include a specific example: 'The Arab Youth Fellowship introduced me to the intersection of policy and technology, opening my eyes to career paths I hadn't considered. Through mentorship and hands-on projects, I developed an interest in AI ethics, which now forms the foundation of my research in responsible government AI systems. These programs don't just provide theoretical knowledge but create practical pathways for youth to contribute to national development.'",
      
      "How can technology help preserve Emirati heritage?": 
        "This question assesses your ability to bridge innovation with cultural preservation. Begin by acknowledging the importance of Emirati heritage and traditions to national identity. Then propose specific technological approaches that can document, digitize, or revitalize cultural elements—from language to crafts, architecture to oral traditions. Focus on both preservation and accessibility for future generations. Include a specific example: 'I'm working on developing an augmented reality application that allows users to virtually explore traditional pearl diving techniques or ancient craft-making. By digitizing these practices with input from cultural experts, we create an engaging way for younger generations to connect with their heritage. This technology doesn't replace traditional cultural transmission but complements it by making heritage accessible through platforms that youth already use daily.'",
      
      "What role does AI play in transforming UAE's education sector?": 
        "This question tests your understanding of AI applications in education and the UAE's education transformation goals. Begin by acknowledging national educational priorities like personalized learning, digital literacy, and future skills development. Then explain how AI can address specific educational challenges through adaptive learning, automated assessment, educational chatbots, or learning analytics. Reference relevant UAE educational initiatives when possible. Include a specific example: 'I've designed an AI-powered tutoring system that helps students practice mathematical concepts in both Arabic and English, providing immediate feedback and adapting difficulty based on performance. This aligns with the UAE's Smart Learning goals by providing personalized education that meets individual learner needs while respecting cultural and linguistic context. Such technology can help prepare students for a knowledge economy while improving educational outcomes across diverse learning needs.'",
      
      "How do you see yourself contributing to UAE's government digital transformation?": 
        "This question explores your understanding of UAE's smart government initiatives and your potential contribution. Begin by acknowledging key governmental digital transformation programs like TAMM, Dubai Now, or UAE Pass. Then outline specific ways your skills could enhance public service delivery, citizen engagement, or government efficiency. Show awareness of both technical considerations and user needs. Include a specific example: 'I would contribute to digital transformation by improving accessibility of government platforms like the UAE Pass. My background in natural language processing could help implement voice interfaces in Arabic dialects, making digital services accessible to elderly citizens or those with limited literacy. This advances the premise that digital government should be inclusive and available to all segments of society, aligning with the UAE's goal of achieving 100% digital government services.'",
      
      "What role should AI play in UAE's emergency response systems?": 
        "This question assesses your understanding of critical infrastructure and AI's potential in crisis management. Begin by acknowledging the UAE's investments in safety and security. Then explain how AI can enhance emergency preparedness, detection, response, or recovery through predictive analytics, real-time monitoring, resource optimization, or automated alerts. Balance technological possibilities with ethical considerations. Include a specific example: 'I would develop an AI system that integrates data from social media, weather forecasts, and IoT sensors to provide early warning of flooding in urban areas. The system would filter misinformation during emergencies and provide verified, localized alerts to residents. This supports the UAE's commitment to deploying technology for public safety while ensuring resilience against increasing climate-related events. The key is creating systems that augment human decision-making rather than replacing it during critical situations.'",
      
      "How do you ensure ethical AI in the UAE context?": 
        "This question tests your awareness of responsible AI practices in the local context. Begin by referencing UAE's AI ethics principles or relevant regulatory frameworks. Then outline specific approaches to building ethical AI systems—addressing fairness, transparency, privacy, and cultural context. Show understanding of both technical safeguards and governance structures. Include a specific example: 'I incorporate ethical considerations from the design phase by using SHAP (SHapley Additive exPlanations) in model testing to detect potential biases in features, particularly those that might affect different demographic groups in the UAE's diverse population. I would advocate for making this type of analysis mandatory for all government AI systems to ensure equitable decisions. Additionally, I believe in creating diverse development teams that include cultural and linguistic experts to ensure AI systems respect local cultural norms and values while serving all segments of society.'",
      
      "How can the UAE encourage more women in AI and tech fields?": 
        "This question explores your understanding of gender diversity in technology within the UAE context. Begin by acknowledging the UAE's progress in women's empowerment while recognizing remaining challenges in tech fields specifically. Then propose concrete strategies to increase women's participation—through education, mentorship, policy, workplace culture, or visibility initiatives. Balance institutional and grassroots approaches. Include a specific example: 'I volunteer with coding clubs for high school girls, helping create early technical foundation and confidence. For the UAE to lead in this area, we could implement mentorship programs connecting female university students with women already successful in tech roles, while ensuring tech companies adopt flexible policies that accommodate family responsibilities. Highlighting Emirati women already excelling in technology through media campaigns would create visible role models and change perceptions about who belongs in tech fields. These combined approaches would strengthen national talent development while advancing gender equality goals.'",
      
      "How important is Arabic NLP for the UAE's tech future?": 
        "This question tests your understanding of language technology in the local context. Begin by acknowledging the cultural and practical importance of Arabic language in the region. Then explain the strategic value of developing Arabic natural language processing capabilities—for digital sovereignty, accessibility, cultural preservation, and market opportunities. Balance technological aspects with social impact. Include a specific example: 'I've worked on fine-tuning an Arabic sentiment analysis model for local social media and news, achieving significantly better results than general-purpose models trained primarily on Western data. Developing robust Arabic NLP is critical for the UAE not just for practical applications like virtual assistants and customer service, but as a matter of digital sovereignty. It ensures we can build technology that truly serves our population without losing linguistic and cultural nuance. Leading in Arabic language AI also creates commercial opportunities across the MENA region's 400 million Arabic speakers, positioning the UAE as a key player in this specialized field.'",
      
      "What role can AI play in supporting UAE's smart transportation goals?": 
        "This question examines your understanding of mobility challenges and the UAE's smart transportation vision. Begin by referencing relevant UAE transportation initiatives like Dubai Autonomous Transportation Strategy or RTA smart mobility projects. Then explain how AI can enhance transportation through traffic optimization, safety improvements, maintenance prediction, or passenger experience enhancements. Balance innovation with practical implementation considerations. Include a specific example: 'I designed a predictive model that uses GPS data and historical patterns to forecast traffic congestion 30 minutes in advance with 85% accuracy. This could be integrated with RTA systems to dynamically reroute public buses and provide real-time guidance to drivers, potentially reducing commute times and emissions. As the UAE moves toward autonomous vehicles, such AI systems create the intelligent infrastructure layer needed for safe operation. The key is implementing these technologies to complement human needs rather than forcing behavioral changes—making transportation more intuitive, efficient, and accessible to all residents.'",
      
      "How would you use AI to build a startup that serves UAE society?": 
        "This question assesses your entrepreneurial thinking and social impact orientation. Begin by identifying a specific challenge or opportunity in UAE society that's suitable for an AI solution. Then outline your startup concept—the problem, solution, technology approach, and potential impact. Show awareness of market realities while emphasizing social benefit. Include a specific example: 'I would create an AI-powered platform that matches job seekers with training opportunities based on personalized skill gaps analysis and emerging industry needs. The platform would offer services in Arabic and English, analyzing both current job market data and future projections from economic planning documents to recommend specific educational paths. This addresses the national priority of workforce development while helping individuals make more informed career decisions. The business model would combine government partnerships for placement metrics with subscription services for continuous learning, creating sustainable impact while supporting Emiratization and economic diversification goals.'",
      
      "How can UAE ensure digital inclusion for all citizens?": 
        "This question explores your understanding of accessibility and equitable technology. Begin by acknowledging potential digital divides—whether related to age, ability, language, geography, or socioeconomic factors. Then propose specific approaches to ensure universal digital access through infrastructure, design, education, or policy interventions. Balance technological solutions with human-centered considerations. Include a specific example: 'I've worked on developing voice-enabled applications with Arabic dialect recognition to make digital government services accessible to elderly citizens and those with limited literacy or visual impairments. To achieve true digital inclusion, the UAE should focus on three areas: adaptive interfaces that accommodate diverse needs, digital literacy programs targeting underserved populations, and affordable connectivity solutions for remote regions. This human-centered approach ensures technology advancement benefits all segments of society rather than reinforcing existing advantages, supporting the UAE's commitment to leaving no one behind in its digital transformation.'",
      
      "How could you use emerging technologies to enhance tourism in the UAE?": 
        "This question assesses your creative application of technology to a major economic sector. Begin by acknowledging tourism's importance to the UAE economy and current technological trends. Then propose innovative applications of technologies like AR/VR, AI, blockchain, or IoT to enhance visitor experiences, cultural understanding, logistical efficiency, or personalization. Balance novelty with practical implementation considerations. Include a specific example: 'I would develop an immersive VR experience that allows virtual tours of historical sites like Al Fahidi district, with interactive elements explaining cultural significance in multiple languages. This technology could be deployed in museums, hotels, and tourism offices, while also being accessible remotely to potential visitors worldwide. The application would combine historical accuracy with engaging storytelling techniques, potentially increasing interest in cultural tourism and education while preserving digital records of heritage sites. By blending virtual and physical tourism experiences, we can create more memorable, accessible visitor journeys while encouraging deeper appreciation of Emirati culture.'",
      
      "What's your view on managing sensitive data in AI systems in the UAE?": 
        "This question tests your understanding of data privacy, sovereignty, and security in the local context. Begin by referencing relevant UAE data protection regulations and principles. Then explain your approach to responsible data management—addressing collection, storage, processing, sharing, and disposal considerations. Balance innovation needs with privacy and security imperatives. Include a specific example: 'I believe in applying privacy-by-design principles from the outset, particularly for health or financial applications. For example, I've implemented federated learning techniques for healthcare AI that allows model training across multiple hospitals without sharing sensitive patient data. For the UAE context, I advocate maintaining data sovereignty by hosting critical information within national borders while implementing strong encryption and access controls. This is particularly important as we build smart city infrastructure, where the volume of citizen data collected requires robust governance frameworks that reflect both international best practices and local cultural values regarding privacy.'",
      
      "How can blockchain improve trust in public services?": 
        "This question explores your understanding of blockchain applications beyond cryptocurrency. Begin by referencing relevant UAE blockchain initiatives like the Dubai Blockchain Strategy. Then explain how blockchain can enhance public services through immutable record-keeping, transparent processes, reduced intermediaries, or citizen ownership of data. Balance technological capabilities with implementation considerations. Include a specific example: 'I would implement blockchain for land registry and property transactions, creating an immutable, transparent record system that reduces disputes and simplifies verification. Citizens could access their property documents instantly through a secure digital identity, while government departments would have a single source of truth for property ownership. This aligns with Dubai's goal of becoming the first blockchain-powered government by increasing efficiency, reducing paper waste, and enhancing trust in fundamental services. The key to successful implementation is ensuring an intuitive user experience that makes the underlying technology invisible to citizens while delivering tangible benefits in transaction speed and security.'",
      
      "How should UAE prepare its digital infrastructure for the future of remote work?": 
        "This question assesses your understanding of digital transformation for workforce flexibility. Begin by acknowledging the acceleration of remote work trends and the UAE's positioning as a digital business hub. Then outline critical infrastructure components needed—from connectivity and cybersecurity to digital identity verification and collaboration tools. Balance technological needs with policy and cultural considerations. Include a specific example: 'I would prioritize implementing a robust digital identity framework that enables secure verification for remote onboarding and official processes. This would support both government services and private sector employment, allowing seamless authentication while maintaining appropriate security protocols. Additionally, investing in cybersecurity infrastructure with AI-powered threat detection is essential as more work moves online. The UAE has the opportunity to become a global leader in remote work infrastructure by creating digital free zones with specialized regulatory frameworks and technical support for distributed teams, attracting global talent while maintaining security standards appropriate for sensitive information.'",
      
      "What is one AI solution you would deploy to solve a UAE-specific societal issue?": 
        "This question tests your ability to apply AI to local challenges. Begin by identifying a specific challenge relevant to UAE society—whether related to healthcare, education, environment, or public services. Then propose a focused AI solution, explaining the approach, expected impact, and implementation considerations. Balance innovation with cultural sensitivity and practical constraints. Include a specific example: 'I would develop an AI system to predict and reduce food waste in hospitality and retail, a significant issue given the UAE's large tourism and service industry. The system would analyze historical sales data, upcoming events, and even weather patterns to optimize purchasing and identify surplus food for redistribution to food banks before it expires. This addresses both sustainability goals by reducing waste sent to landfills and supports community welfare initiatives. The solution could integrate with existing inventory systems and would require collaboration between technology providers, businesses, and non-profits to create the necessary redistribution network. This approach transforms an environmental challenge into a community benefit while supporting multiple national priorities.'",
    };
    
    return responses[question] || 
      "That's an excellent question. When preparing your answer, focus on being concise, authentic, and relevant to the position. Use the STAR method (Situation, Task, Action, Result) for behavioral questions, and provide specific examples from your experience. Tailor your response to highlight skills and qualities the employer is seeking, and practice your answer beforehand without memorizing it word-for-word.";
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

    return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        AI Interview Assistant
        </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          sx={{ '& .MuiTab-root': { fontWeight: 600 } }}
        >
          <Tab 
            label="Interview Coach" 
            icon={<School />} 
            iconPosition="start" 
            sx={{ mr: 2 }} 
          />
          <Tab 
            label="DeepSeek AI Chat" 
            icon={<QuestionAnswer />} 
            iconPosition="start" 
          />
          </Tabs>
          </Box>

      {activeTab === 0 ? (
        <>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Practice your interview skills with our AI-powered coach. Select from the suggested questions or categories to get started.
              </Typography>
              
          {/* Main layout */}
          <Grid container spacing={3}>
            {/* Left sidebar with question categories and suggested questions */}
            <Grid item xs={12} md={4}>
                  <Paper 
                elevation={3} 
                    sx={{
                      p: 2,
                      borderRadius: 2,
                  height: '100%',
                  background: 'linear-gradient(to bottom, rgba(245,248,255,0.8), rgba(240,245,255,0.9))'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                  <QuestionAnswer sx={{ mr: 1 }} color="primary" />
                  Interview Questions
                        </Typography>
                
        <TextField
          fullWidth
          placeholder="Search questions..."
                  variant="outlined"
          size="small"
                  sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                        <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
                />

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Category fontSize="small" sx={{ mr: 1 }} />
                  Categories
              </Typography>

                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {categorizedQuestions.map((category, index) => (
                  <Chip 
                  key={index} 
                      icon={category.icon}
                      label={category.category}
                      onClick={() => loadCategoryQuestions(category.category)}
                      color={selectedCategory === category.category ? "primary" : "default"}
                  sx={{ 
                        m: 0.5, 
                    '&:hover': {
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          bgcolor: 'primary.lighter' 
                        } 
                      }}
              />
              ))}
            </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ my: 1.5, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <FormatListBulleted fontSize="small" sx={{ mr: 1 }} />
                  Suggested Questions
      </Typography>

                <List sx={{ 
                  mt: 1, 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    },
                  },
                }}>
                  {suggestedQuestions.map((question, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding
                      sx={{ mb: 1.5 }}
                    >
              <Button 
            fullWidth
                variant="outlined" 
                color="primary"
                        onClick={() => sendPredefinedQuestion(question)}
            sx={{ 
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          p: 1.5,
                          borderRadius: 2,
                          borderWidth: '1px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            borderColor: 'primary.main',
                            borderWidth: '1px',
                            bgcolor: 'primary.lighter'
                          }
                        }}
                      >
                        {question}
                      </Button>
                    </ListItem>
                  ))}
                  
                  {categoryQuestions.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        {selectedCategory || "Category"} Questions
            </Typography>
            
                      {categoryQuestions.map((question, index) => (
                        <ListItem 
                          key={`category-${index}`} 
                          disablePadding
                          sx={{ mb: 1.5 }}
                        >
                          <Button 
                fullWidth
                          variant="outlined"
                          color="secondary"
                          onClick={() => sendPredefinedQuestion(question.text)}
                      sx={{ 
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                        p: 1.5, 
                            borderRadius: 2, 
                            borderWidth: '1px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              borderColor: 'secondary.main',
                              borderWidth: '1px',
                              bgcolor: 'secondary.lighter'
                            }
                          }}
                        >
                          {question.text}
                </Button>
                        </ListItem>
                      ))}
                    </>
              )}
            </List>
                    </Paper>
                  </Grid>
              
            {/* Main chat area */}
        <Grid item xs={12} md={8}>
          <Paper 
              elevation={3} 
            sx={{ 
                p: 0, 
                borderRadius: 2,
                height: '75vh',
                          display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
          >
            {/* Chat header */}
            <Box sx={{ 
              p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(to right, #f5f7ff, #eef2ff)'
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src={selectedCoach?.avatar || '/assets/coach-avatar.png'} sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {selectedCoach?.name || 'Interview Coach'} 
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AI-powered interview practice assistant
                        </Typography>
                      </Box>
                </Box>
                
                  <Chip 
                icon={<School fontSize="small" />} 
                label="Interview Coach" 
                    color="primary" 
                variant="outlined" 
                sx={{ fontWeight: 'medium' }} 
              />
            </Box>

            {/* Chat messages */}
            <Box 
              sx={{ 
                p: 2, 
                  flexGrow: 1, 
                  overflow: 'auto',
                display: 'flex', 
                flexDirection: 'column',
                  gap: 2,
                  bgcolor: '#f9fafd',
                  height: 'calc(75vh - 64px)'
                }}
                ref={messagesEndRef}
              >
                {messages.length === 0 && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      opacity: 0.8
                    }}
                  >
                    <QuestionAnswer sx={{ fontSize: 80, color: 'primary.light', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Welcome to your Interview Coach
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: '80%' }}>
                      Select a question from the sidebar to begin practicing your interview responses.
                      The AI will provide feedback and guidance to help you improve.
                    </Typography>
                </Box>
                )}

                {messages.map((message, index) => (
                      <Box 
                        key={index} 
                        sx={{
                      alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                        }}
                      >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      {message.type !== 'user' && (
                          <Avatar
                          src={selectedCoach?.avatar || '/assets/coach-avatar.png'}
                          sx={{ width: 36, height: 36 }}
                          />
                        )}
                        
                    <Box
                          sx={{
                            p: 2,
                        borderRadius: 2,
                        bgcolor: message.type === 'user' ? 'primary.main' : 'white',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: message.type !== 'user' ? '1px solid' : 'none',
                        borderColor: 'divider',
                        order: message.type === 'user' ? -1 : 1
                      }}
                    >
                      {message.loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="body2">Thinking...</Typography>
                        </Box>
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.text}
                          </Typography>
                          <Typography variant="caption" color={message.type === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                            {message.timestamp}
                            </Typography>
                        </>
                            )}
                          </Box>
                    
                    {message.type === 'user' && (
                      <Avatar 
                        sx={{ width: 36, height: 36, bgcolor: 'primary.dark' }}
                      >
                        <Person fontSize="small" />
                          </Avatar>
                        )}
                      </Box>
                    </Box>
                ))}
                
                {isLoading && (
                  <Box
                    sx={{ 
                      alignSelf: 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Avatar 
                        src={selectedCoach?.avatar || '/assets/coach-avatar.png'}
                        sx={{ width: 36, height: 36 }}
                      />
                      <Box
                      sx={{ 
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="body2">Typing a response...</Typography>
                    </Box>
            </Box>
                    </Box>
                  </Box>
                )}
            </Box>
          </Paper>
        </Grid>
        </Grid>
        </>
      ) : (
        <OllamaDeepSeekChatbot />
      )}
    </Container>
  );
}

export default AIInterviewCoach; 