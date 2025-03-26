import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { PDFViewer, PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { useAppContext } from '../../context/AppContext';
import logoLight from '../../assets/logo-light.png';

// Create styles for PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerText: {
    fontSize: 10,
    color: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0EA5E9', // primary-500
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    color: '#0369A1', // primary-700
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#1F2937',
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  tableCol: {
    width: '33.33%',
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
  },
  tableHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  chart: {
    marginVertical: 10,
    width: "100%",
    height: 200,
  }
});

// Resume PDF Document Component
const ResumePDF = ({ resumeData, user }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with logo and date */}
      <View style={styles.header}>
        <Image src={logoLight} style={styles.logo} />
        <Text style={styles.headerText}>Generated on: {new Date().toLocaleDateString()}</Text>
      </View>
      
      {/* Title */}
      <Text style={styles.title}>Professional Resume</Text>
      
      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Personal Information</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Name: </Text>
          {resumeData.personalInfo?.name || user?.name || 'Not specified'}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Email: </Text>
          {resumeData.personalInfo?.email || user?.email || 'Not specified'}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Phone: </Text>
          {resumeData.personalInfo?.phone || user?.phone || 'Not specified'}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Location: </Text>
          {resumeData.personalInfo?.location || 'Not specified'}
        </Text>
      </View>
      
      {/* Professional Summary */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Professional Summary</Text>
        <Text style={styles.text}>{resumeData.summary || 'No professional summary provided.'}</Text>
      </View>
      
      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Skills</Text>
        {resumeData.skills && resumeData.skills.length > 0 ? (
          resumeData.skills.map((skill, index) => (
            <Text key={index} style={styles.text}>• {skill}</Text>
          ))
        ) : (
          <Text style={styles.text}>No skills listed.</Text>
        )}
      </View>
      
      {/* Work Experience */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Work Experience</Text>
        {resumeData.experience && resumeData.experience.length > 0 ? (
          resumeData.experience.map((exp, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={[styles.text, styles.bold]}>{exp.title} at {exp.company}</Text>
              <Text style={styles.text}>{exp.startDate} - {exp.endDate || 'Present'}</Text>
              <Text style={styles.text}>{exp.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No work experience listed.</Text>
        )}
      </View>
      
      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Education</Text>
        {resumeData.education && resumeData.education.length > 0 ? (
          resumeData.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={[styles.text, styles.bold]}>{edu.degree} - {edu.institution}</Text>
              <Text style={styles.text}>{edu.startDate} - {edu.endDate || 'Present'}</Text>
              <Text style={styles.text}>{edu.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No education listed.</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text>Generated by Tamkeen AI Career Intelligence System</Text>
        <Text>© {new Date().getFullYear()} Tamkeen AI</Text>
      </View>
    </Page>
  </Document>
);

// Application Report PDF Document Component
const ApplicationReportPDF = ({ reportData, user }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with logo and date */}
      <View style={styles.header}>
        <Image src={logoLight} style={styles.logo} />
        <Text style={styles.headerText}>Generated on: {new Date().toLocaleDateString()}</Text>
      </View>
      
      {/* Title */}
      <Text style={styles.title}>Job Application Report</Text>
      
      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.text}>
          <Text style={styles.bold}>Name: </Text>
          {user?.name || 'Not specified'}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Period: </Text>
          {reportData.period || 'All time'}
        </Text>
      </View>
      
      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Application Summary</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Total Applications: </Text>
          {reportData.totalApplications || 0}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Responses Received: </Text>
          {reportData.responses || 0} ({reportData.responseRate || '0%'})
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Interviews: </Text>
          {reportData.interviews || 0} ({reportData.interviewRate || '0%'})
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Offers: </Text>
          {reportData.offers || 0} ({reportData.offerRate || '0%'})
        </Text>
      </View>
      
      {/* Application Status Table */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Application Status Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeader}>Status</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeader}>Count</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeader}>Percentage</Text>
            </View>
          </View>
          
          {reportData.statusBreakdown && reportData.statusBreakdown.length > 0 ? (
            reportData.statusBreakdown.map((status, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{status.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{status.count}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{status.percentage}%</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%' }]}>
                <Text style={styles.tableCell}>No data available</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      
      {/* Top Job Categories */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Top Job Categories</Text>
        {reportData.topJobCategories && reportData.topJobCategories.length > 0 ? (
          reportData.topJobCategories.map((category, index) => (
            <Text key={index} style={styles.text}>
              • {category.name}: {category.count} applications
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No job category data available.</Text>
        )}
      </View>
      
      {/* Time Analysis */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Time Analysis</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Average Response Time: </Text>
          {reportData.avgResponseTime || 'N/A'} days
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Average Time to Interview: </Text>
          {reportData.avgTimeToInterview || 'N/A'} days
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Average Time to Offer: </Text>
          {reportData.avgTimeToOffer || 'N/A'} days
        </Text>
      </View>
      
      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>AI Recommendations</Text>
        {reportData.recommendations && reportData.recommendations.length > 0 ? (
          reportData.recommendations.map((recommendation, index) => (
            <Text key={index} style={styles.text}>
              • {recommendation}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No recommendations available.</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text>Generated by Tamkeen AI Career Intelligence System</Text>
        <Text>© {new Date().getFullYear()} Tamkeen AI</Text>
      </View>
    </Page>
  </Document>
);

// Interview Results PDF Document Component
const InterviewResultsPDF = ({ interviewData, user }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with logo and date */}
      <View style={styles.header}>
        <Image src={logoLight} style={styles.logo} />
        <Text style={styles.headerText}>Generated on: {new Date().toLocaleDateString()}</Text>
      </View>
      
      {/* Title */}
      <Text style={styles.title}>Interview Performance Report</Text>
      
      {/* Interview Info */}
      <View style={styles.section}>
        <Text style={styles.text}>
          <Text style={styles.bold}>Candidate: </Text>
          {user?.name || 'Not specified'}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Position: </Text>
          {interviewData.position || 'Not specified'}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Date: </Text>
          {interviewData.date || new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Overall Score: </Text>
          {interviewData.overallScore || 'N/A'}/100
        </Text>
      </View>
      
      {/* Performance by Category */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Performance by Category</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeader}>Category</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeader}>Score</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeader}>Comments</Text>
            </View>
          </View>
          
          {interviewData.categories && interviewData.categories.length > 0 ? (
            interviewData.categories.map((category, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{category.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{category.score}/100</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{category.comments || 'No comments'}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '100%' }]}>
                <Text style={styles.tableCell}>No data available</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      
      {/* Strengths */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Strengths</Text>
        {interviewData.strengths && interviewData.strengths.length > 0 ? (
          interviewData.strengths.map((strength, index) => (
            <Text key={index} style={styles.text}>• {strength}</Text>
          ))
        ) : (
          <Text style={styles.text}>No specific strengths identified.</Text>
        )}
      </View>
      
      {/* Areas for Improvement */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Areas for Improvement</Text>
        {interviewData.improvements && interviewData.improvements.length > 0 ? (
          interviewData.improvements.map((improvement, index) => (
            <Text key={index} style={styles.text}>• {improvement}</Text>
          ))
        ) : (
          <Text style={styles.text}>No specific areas for improvement identified.</Text>
        )}
      </View>
      
      {/* AI Recommendations */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>AI Recommendations</Text>
        <Text style={styles.text}>{interviewData.recommendations || 'No recommendations available.'}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text>Generated by Tamkeen AI Career Intelligence System</Text>
        <Text>© {new Date().getFullYear()} Tamkeen AI</Text>
      </View>
    </Page>
  </Document>
);

// Main PDF Generator Component
const PDFGenerator = ({ 
  documentType = 'resume',  // Options: 'resume', 'application-report', 'interview-results'
  data,
  fileName = 'document.pdf',
  showDownloadButton = true,
  showPrintButton = true,
  showPreview = true,
  previewHeight = 600
}) => {
  const { user } = useAppContext();
  const componentRef = useRef();
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  
  // Select the appropriate document component based on type
  const renderDocument = () => {
    switch(documentType) {
      case 'resume':
        return <ResumePDF resumeData={data} user={user} />;
      case 'application-report':
        return <ApplicationReportPDF reportData={data} user={user} />;
      case 'interview-results':
        return <InterviewResultsPDF interviewData={data} user={user} />;
      default:
        return <ResumePDF resumeData={data} user={user} />;
    }
  };
  
  // Generate document title
  const getDocumentTitle = () => {
    switch(documentType) {
      case 'resume':
        return 'Resume';
      case 'application-report':
        return 'Application Report';
      case 'interview-results':
        return 'Interview Results';
      default:
        return 'Document';
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Buttons row */}
      <div className="flex gap-4 mb-4 justify-end">
        {showDownloadButton && (
          <PDFDownloadLink 
            document={renderDocument()} 
            fileName={fileName}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Loading document...' : `Download ${getDocumentTitle()}`
            }
          </PDFDownloadLink>
        )}
        
        {showPrintButton && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
          >
            Print {getDocumentTitle()}
          </button>
        )}
      </div>
      
      {/* PDF Preview */}
      {showPreview && (
        <div className="w-full border border-gray-300 rounded-md overflow-hidden" style={{ height: previewHeight }}>
          <PDFViewer width="100%" height="100%" className="w-full h-full">
            {renderDocument()}
          </PDFViewer>
        </div>
      )}
      
      {/* Hidden component for printing */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>
          <PDFViewer>
            {renderDocument()}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator; 