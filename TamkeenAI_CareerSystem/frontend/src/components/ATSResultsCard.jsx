import React, { useState } from 'react';
import axios from 'axios';
import { Progress, Card, Button } from 'your-ui-library'; // Replace with your actual UI components

const ATSResultsCard = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const submitForAnalysis = async (resumeFile, jobDescription, jobTitle) => {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);
    formData.append('job_title', jobTitle);
    
    try {
      const response = await axios.post('/api/ats-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <h2>ATS Compatibility Analysis</h2>
      {loading && <p>Analyzing your resume...</p>}
      {error && <p className="error">{error}</p>}
      
      {results && (
        <div>
          <h3>Overall Score: {results.report.score.toFixed(1)}%</h3>
          <Progress value={results.report.score} max={100} />
          
          <h4>Feedback</h4>
          <p>{results.report.feedback}</p>
          
          {results.report.recommendations.length > 0 && (
            <div>
              <h4>Recommendations</h4>
              <ul>
                {results.report.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          <h4>Missing Keywords</h4>
          <div className="keyword-chips">
            {results.report.missing_keywords.map((keyword, index) => (
              <span key={index} className="keyword-chip">{keyword}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ATSResultsCard;