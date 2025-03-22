#!/bin/bash

# Create the root directory
mkdir -p TamkeenAI_CareerSystem

# Create main directories
mkdir -p TamkeenAI_CareerSystem/backend/core
mkdir -p TamkeenAI_CareerSystem/backend/utils
mkdir -p TamkeenAI_CareerSystem/backend/config
mkdir -p TamkeenAI_CareerSystem/frontend/public
mkdir -p TamkeenAI_CareerSystem/frontend/src/assets
mkdir -p TamkeenAI_CareerSystem/frontend/src/components
mkdir -p TamkeenAI_CareerSystem/frontend/src/pages
mkdir -p TamkeenAI_CareerSystem/frontend/src/utils

# Create backend core files
touch TamkeenAI_CareerSystem/backend/core/user_info.py
touch TamkeenAI_CareerSystem/backend/core/resume_parser.py
touch TamkeenAI_CareerSystem/backend/core/ats_matcher.py
touch TamkeenAI_CareerSystem/backend/core/job_workflow.py
touch TamkeenAI_CareerSystem/backend/core/tts_engine.py
touch TamkeenAI_CareerSystem/backend/core/face_expression.py
touch TamkeenAI_CareerSystem/backend/core/career_intelligence.py
touch TamkeenAI_CareerSystem/backend/core/career_assessment.py
touch TamkeenAI_CareerSystem/backend/core/nlp_resume_manager.py
touch TamkeenAI_CareerSystem/backend/core/enhanced_interview.py
touch TamkeenAI_CareerSystem/backend/core/gamification.py
touch TamkeenAI_CareerSystem/backend/core/analytics_engine.py
touch TamkeenAI_CareerSystem/backend/core/report_generator.py
touch TamkeenAI_CareerSystem/backend/core/dashboard_data.py
touch TamkeenAI_CareerSystem/backend/core/keyword_recommender.py
touch TamkeenAI_CareerSystem/backend/core/skill_gap_predictor.py
touch TamkeenAI_CareerSystem/backend/core/career_path_visualizer.py
touch TamkeenAI_CareerSystem/backend/core/sentiment_analyzer.py
touch TamkeenAI_CareerSystem/backend/core/feedback_generator.py

# Create backend utils files
touch TamkeenAI_CareerSystem/backend/utils/preprocess.py
touch TamkeenAI_CareerSystem/backend/utils/file_handler.py

# Create backend config file
touch TamkeenAI_CareerSystem/backend/config/settings.py

# Create backend root files
touch TamkeenAI_CareerSystem/backend/app.py
touch TamkeenAI_CareerSystem/backend/requirements.txt

# Create frontend component files
touch TamkeenAI_CareerSystem/frontend/src/components/UserInfoForm.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/ResumeUploader.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/JobDescriptionForm.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/ATSResultsCard.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/WordCloudVisualizer.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/EmotionScorePanel.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/GamificationBoard.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/CareerInsightsChart.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/SkillGapRadar.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/CareerPathTimeline.jsx
touch TamkeenAI_CareerSystem/frontend/src/components/PDFReportViewer.jsx

# Create frontend pages files
touch TamkeenAI_CareerSystem/frontend/src/pages/Dashboard.jsx
touch TamkeenAI_CareerSystem/frontend/src/pages/ResumeAnalysis.jsx
touch TamkeenAI_CareerSystem/frontend/src/pages/CareerAssessment.jsx
touch TamkeenAI_CareerSystem/frontend/src/pages/InterviewResults.jsx

# Create frontend utils files
touch TamkeenAI_CareerSystem/frontend/src/utils/api.js
touch TamkeenAI_CareerSystem/frontend/src/utils/constants.js

# Create remaining frontend files
touch TamkeenAI_CareerSystem/frontend/src/App.jsx
touch TamkeenAI_CareerSystem/frontend/src/index.js
touch TamkeenAI_CareerSystem/frontend/package.json

echo "TamkeenAI_CareerSystem directory structure has been created successfully!"
