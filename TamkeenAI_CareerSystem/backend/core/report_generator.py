"""
Report Generator Module

This module creates customized PDF reports of career assessments, resume analyses,
and other insights for users of the Tamkeen AI Career Intelligence System.
"""

import os
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import uuid

# Import settings
from config.settings import BASE_DIR, REPORT_FOLDER

# Try importing PDF generation libraries
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
    from reportlab.pdfgen import canvas
    from reportlab.graphics.shapes import Drawing
    from reportlab.graphics.charts.barcharts import VerticalBarChart
    from reportlab.graphics.charts.piecharts import Pie
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("Warning: ReportLab not available. Install with: pip install reportlab")

# Try importing matplotlib for chart generation
try:
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import matplotlib.pyplot as plt
    import numpy as np
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    print("Warning: matplotlib not available. Install with: pip install matplotlib")


class ReportGenerator:
    """Class for generating PDF reports"""
    
    def __init__(self, user_id: Optional[str] = None):
        """
        Initialize report generator
        
        Args:
            user_id: Optional user ID for personalization
        """
        self.user_id = user_id
        self.report_folder = REPORT_FOLDER
        os.makedirs(self.report_folder, exist_ok=True)
        
        # Create user folder if user_id provided
        if user_id:
            self.user_report_folder = os.path.join(self.report_folder, user_id)
            os.makedirs(self.user_report_folder, exist_ok=True)
        else:
            self.user_report_folder = self.report_folder
        
        # Initialize reportlab resources if available
        if REPORTLAB_AVAILABLE:
            self.styles = getSampleStyleSheet()
            
            # Add custom styles
            self.styles.add(ParagraphStyle(
                name='Title',
                parent=self.styles['Heading1'],
                fontSize=18,
                spaceAfter=12,
                textColor=colors.darkblue
            ))
            
            self.styles.add(ParagraphStyle(
                name='Subtitle',
                parent=self.styles['Heading2'],
                fontSize=14,
                spaceAfter=10,
                textColor=colors.darkblue
            ))
            
            self.styles.add(ParagraphStyle(
                name='SectionTitle',
                parent=self.styles['Heading3'],
                fontSize=12,
                spaceAfter=6,
                textColor=colors.darkblue
            ))
            
            self.styles.add(ParagraphStyle(
                name='BodyText',
                parent=self.styles['Normal'],
                fontSize=10,
                spaceAfter=6
            ))
            
            self.styles.add(ParagraphStyle(
                name='Bullet',
                parent=self.styles['Normal'],
                fontSize=10,
                leftIndent=20,
                firstLineIndent=-15,
                spaceBefore=2,
                spaceAfter=2
            ))
    
    def generate_chart_image(self, chart_data: Dict[str, Any], chart_type: str, 
                           filename: str = "chart.png") -> Optional[str]:
        """
        Generate chart image using matplotlib
        
        Args:
            chart_data: Data for chart
            chart_type: Type of chart (bar, pie, radar, etc.)
            filename: Output filename
            
        Returns:
            str or None: Path to generated image, or None if failed
        """
        if not MATPLOTLIB_AVAILABLE:
            return None
        
        try:
            plt.figure(figsize=(6, 4))
            
            if chart_type == "bar":
                labels = chart_data.get("labels", [])
                values = chart_data.get("values", [])
                
                if not labels or not values or len(labels) != len(values):
                    return None
                
                plt.bar(labels, values, color=chart_data.get("colors", "skyblue"))
                plt.xlabel(chart_data.get("x_label", ""))
                plt.ylabel(chart_data.get("y_label", ""))
                plt.title(chart_data.get("title", ""))
                plt.xticks(rotation=45, ha="right")
                plt.tight_layout()
                
            elif chart_type == "pie":
                labels = chart_data.get("labels", [])
                values = chart_data.get("values", [])
                
                if not labels or not values or len(labels) != len(values):
                    return None
                
                plt.pie(values, labels=labels, autopct='%1.1f%%', startangle=90,
                       colors=chart_data.get("colors", None))
                plt.axis('equal')
                plt.title(chart_data.get("title", ""))
                
            elif chart_type == "radar":
                categories = chart_data.get("categories", [])
                values = chart_data.get("values", [])
                
                if not categories or not values or len(categories) != len(values):
                    return None
                
                # Number of variables
                N = len(categories)
                
                # What will be the angle of each axis in the plot
                angles = [n / float(N) * 2 * np.pi for n in range(N)]
                angles += angles[:1]  # Close the loop
                
                # Add values for plot
                values += values[:1]  # Close the loop
                
                # Create radar plot
                ax = plt.subplot(111, polar=True)
                plt.xticks(angles[:-1], categories, color='grey', size=10)
                ax.set_rlabel_position(0)
                plt.yticks([20, 40, 60, 80, 100], ["20", "40", "60", "80", "100"], color="grey", size=8)
                plt.ylim(0, 100)
                
                # Plot data
                ax.plot(angles, values, linewidth=1, linestyle='solid')
                ax.fill(angles, values, 'skyblue', alpha=0.4)
                
                # Add title
                plt.title(chart_data.get("title", ""), size=15, y=1.1)
            
            else:
                return None
            
            # Save image
            temp_dir = os.path.join(self.report_folder, 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            image_path = os.path.join(temp_dir, filename)
            plt.savefig(image_path, dpi=100, bbox_inches='tight')
            plt.close()
            
            return image_path
            
        except Exception as e:
            print(f"Error generating chart: {e}")
            return None
    
    def generate_resume_analysis_report(self, analysis_data: Dict[str, Any], 
                                      job_title: Optional[str] = None) -> Optional[str]:
        """
        Generate PDF report for resume analysis
        
        Args:
            analysis_data: Resume analysis data
            job_title: Optional job title for context
            
        Returns:
            str or None: Path to generated PDF, or None if failed
        """
        if not REPORTLAB_AVAILABLE:
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_name = f"resume_analysis_{timestamp}.pdf"
        report_path = os.path.join(self.user_report_folder, report_name)
        
        # Create document
        doc = SimpleDocTemplate(report_path, pagesize=letter,
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=72)
        
        # Container for elements
        elements = []
        
        # Add title
        title = "Resume Analysis Report"
        if job_title:
            title += f" for {job_title} Position"
        elements.append(Paragraph(title, self.styles['Title']))
        
        # Add date
        date_str = datetime.now().strftime("%B %d, %Y")
        elements.append(Paragraph(f"Generated on: {date_str}", self.styles['BodyText']))
        elements.append(Spacer(1, 12))
        
        # Overall score
        if "overall_score" in analysis_data:
            score = analysis_data["overall_score"]
            score_color = "green"
            if score < 40:
                score_color = "red"
            elif score < 70:
                score_color = "orange"
                
            score_text = f"<font color='{score_color}'>Overall Score: {score}/100</font>"
            elements.append(Paragraph(score_text, self.styles['Subtitle']))
            elements.append(Spacer(1, 12))
        
        # Format Analysis
        if "analysis" in analysis_data and "format" in analysis_data["analysis"]:
            format_data = analysis_data["analysis"]["format"]
            
            elements.append(Paragraph("Format Analysis", self.styles['Subtitle']))
            
            format_score = format_data.get("format_score", 0)
            format_score_text = f"<font color='{score_color}'>Format Score: {format_score}/100</font>"
            elements.append(Paragraph(format_score_text, self.styles['BodyText']))
            
            # Format details
            if "detected_format" in format_data:
                elements.append(Paragraph(f"File Format: {format_data['detected_format']}", self.styles['BodyText']))
            
            if "file_format_compatible" in format_data:
                compat_text = "Yes" if format_data["file_format_compatible"] else "No"
                elements.append(Paragraph(f"ATS Compatible Format: {compat_text}", self.styles['BodyText']))
            
            # Format issues
            if "format_issues" in format_data and format_data["format_issues"]:
                elements.append(Paragraph("Format Issues:", self.styles['SectionTitle']))
                for issue in format_data["format_issues"]:
                    elements.append(Paragraph(f"• {issue}", self.styles['Bullet']))
            
            elements.append(Spacer(1, 12))
        
        # Content Analysis
        if "analysis" in analysis_data and "content" in analysis_data["analysis"]:
            content_data = analysis_data["analysis"]["content"]
            
            elements.append(Paragraph("Content Analysis", self.styles['Subtitle']))
            
            # Detected sections
            if "sections" in content_data:
                elements.append(Paragraph("Detected Sections:", self.styles['SectionTitle']))
                sections_text = ", ".join(content_data["sections"])
                elements.append(Paragraph(sections_text, self.styles['BodyText']))
            
            # Skills
            if "detected_skills" in content_data and content_data["detected_skills"]:
                elements.append(Paragraph("Detected Skills:", self.styles['SectionTitle']))
                skills_text = ", ".join(content_data["detected_skills"][:15])  # Limit to 15 skills
                if len(content_data["detected_skills"]) > 15:
                    skills_text += ", and more..."
                elements.append(Paragraph(skills_text, self.styles['BodyText']))
            
            # Keyword density chart
            if "keyword_density" in content_data and content_data["keyword_density"]:
                elements.append(Paragraph("Keyword Analysis", self.styles['SectionTitle']))
                
                # Create chart data
                keywords = list(content_data["keyword_density"].keys())[:8]  # Limit to top 8
                densities = [content_data["keyword_density"][k]["density"] for k in keywords]
                
                chart_data = {
                    "labels": keywords,
                    "values": densities,
                    "title": "Keyword Density (%)",
                    "colors": "skyblue"
                }
                
                chart_path = self.generate_chart_image(chart_data, "bar", f"kw_density_{timestamp}.png")
                if chart_path:
                    elements.append(Image(chart_path, width=400, height=300))
                    elements.append(Spacer(1, 6))
            
            # Content recommendations
            if "content_recommendations" in content_data and content_data["content_recommendations"]:
                elements.append(Paragraph("Content Recommendations:", self.styles['SectionTitle']))
                for rec in content_data["content_recommendations"]:
                    elements.append(Paragraph(f"• {rec}", self.styles['Bullet']))
            
            elements.append(Spacer(1, 12))
        
        # Job Match Analysis
        if "analysis" in analysis_data and "job_match" in analysis_data["analysis"]:
            job_match = analysis_data["analysis"]["job_match"]
            
            elements.append(Paragraph("Job Match Analysis", self.styles['Subtitle']))
            
            # Match score
            match_score = job_match.get("match_score", 0)
            match_color = "green"
            if match_score < 40:
                match_color = "red"
            elif match_score < 70:
                match_color = "orange"
            
            match_text = f"<font color='{match_color}'>Match Score: {match_score}/100</font>"
            elements.append(Paragraph(match_text, self.styles['BodyText']))
            
            if "keyword_match_percent" in job_match:
                elements.append(Paragraph(
                    f"Keyword Match: {job_match['keyword_match_percent']}%", 
                    self.styles['BodyText']
                ))
            
            # Matched keywords
            if "keyword_matches" in job_match and job_match["keyword_matches"]:
                elements.append(Paragraph("Matched Keywords:", self.styles['SectionTitle']))
                
                # Create a two-column table for matched keywords
                keyword_rows = []
                row = []
                for i, kw in enumerate(job_match["keyword_matches"]):
                    if isinstance(kw, dict) and "keyword" in kw:
                        row.append(kw["keyword"])
                    else:
                        row.append(str(kw))
                    
                    if len(row) == 2 or i == len(job_match["keyword_matches"]) - 1:
                        while len(row) < 2:
                            row.append("")
                        keyword_rows.append(row)
                        row = []
                
                if keyword_rows:
                    table = Table(keyword_rows, colWidths=[180, 180])
                    table.setStyle(TableStyle([
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
                        ('PADDING', (0, 0), (-1, -1), 4),
                    ]))
                    elements.append(table)
                    elements.append(Spacer(1, 6))
            
            # Missing keywords
            if "missing_keywords" in job_match and job_match["missing_keywords"]:
                elements.append(Paragraph("Missing Keywords:", self.styles['SectionTitle']))
                for kw in job_match["missing_keywords"][:10]:  # Limit to top 10
                    if isinstance(kw, dict) and "keyword" in kw:
                        importance = round(kw.get("importance", 0) * 100)
                        elements.append(Paragraph(
                            f"• {kw['keyword']} (Importance: {importance}%)", 
                            self.styles['Bullet']
                        ))
                    else:
                        elements.append(Paragraph(f"• {kw}", self.styles['Bullet']))
            
            # Job match recommendations
            if "match_recommendations" in job_match and job_match["match_recommendations"]:
                elements.append(Paragraph("Job Match Recommendations:", self.styles['SectionTitle']))
                for rec in job_match["match_recommendations"]:
                    elements.append(Paragraph(f"• {rec}", self.styles['Bullet']))
            
            elements.append(Spacer(1, 12))
        
        # Overall recommendations
        if "recommendations" in analysis_data and analysis_data["recommendations"]:
            elements.append(Paragraph("Key Recommendations", self.styles['Subtitle']))
            for rec in analysis_data["recommendations"]:
                elements.append(Paragraph(f"• {rec}", self.styles['Bullet']))
        
        # Add footer with page numbers
        def add_page_number(canvas, doc):
            canvas.saveState()
            canvas.setFont('Helvetica', 9)
            page_num_text = f"Page {canvas.getPageNumber()}"
            canvas.drawRightString(letter[0] - 30, 30, page_num_text)
            canvas.drawString(30, 30, "Tamkeen AI Career Intelligence System")
            canvas.restoreState()
        
        # Build PDF
        doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
        
        return report_path
    
    def generate_career_assessment_report(self, assessment_data: Dict[str, Any],
                                        user_profile: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Generate PDF report for career assessment
        
        Args:
            assessment_data: Career assessment data
            user_profile: Optional user profile data
            
        Returns:
            str or None: Path to generated PDF, or None if failed
        """
        if not REPORTLAB_AVAILABLE:
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_name = f"career_assessment_{timestamp}.pdf"
        report_path = os.path.join(self.user_report_folder, report_name)
        
        # Create document
        doc = SimpleDocTemplate(report_path, pagesize=letter,
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=72)
        
        # Container for elements
        elements = []
        
        # Add title
        elements.append(Paragraph("Career Assessment Report", self.styles['Title']))
        
        # Add date
        date_str = datetime.now().strftime("%B %d, %Y")
        elements.append(Paragraph(f"Generated on: {date_str}", self.styles['BodyText']))
        
        # User info if available
        if user_profile:
            user_name = user_profile.get("name", "")
            if user_name:
                elements.append(Paragraph(f"Prepared for: {user_name}", self.styles['BodyText']))
        
        elements.append(Spacer(1, 12))
        
        # Career Readiness Score
        if "career_readiness" in assessment_data:
            readiness = assessment_data["career_readiness"]
            readiness_score = readiness.get("overall_score", 0)
            
            score_color = "green"
            if readiness_score < 40:
                score_color = "red"
            elif readiness_score < 70:
                score_color = "orange"
            
            score_text = f"<font color='{score_color}'>Career Readiness Score: {readiness_score}/100</font>"
            elements.append(Paragraph(score_text, self.styles['Subtitle']))
            
            elements.append(Spacer(1, 6))
            
            # Readiness summary
            if "summary" in readiness:
                elements.append(Paragraph("Summary:", self.styles['SectionTitle']))
                elements.append(Paragraph(readiness["summary"], self.styles['BodyText']))
            
            # Readiness chart
            if "category_scores" in readiness and readiness["category_scores"]:
                categories = []
                scores = []
                
                for category, score in readiness["category_scores"].items():
                    # Format category name
                    category_name = category.replace("_", " ").title()
                    categories.append(category_name)
                    scores.append(score)
                
                chart_data = {
                    "categories": categories,
                    "values": scores,
                    "title": "Career Readiness by Category"
                }
                
                chart_path = self.generate_chart_image(chart_data, "radar", f"readiness_{timestamp}.png")
                if chart_path:
                    elements.append(Image(chart_path, width=400, height=300))
                    
            elements.append(Spacer(1, 12))
            
            # Detailed category analysis
            if "category_scores" in readiness:
                elements.append(Paragraph("Category Analysis", self.styles['Subtitle']))
                
                for category, score in readiness["category_scores"].items():
                    # Skip if no commentary available
                    if f"{category}_commentary" not in readiness:
                        continue
                    
                    # Format category name
                    category_name = category.replace("_", " ").title()
                    
                    # Get color based on score
                    cat_color = "green"
                    if score < 40:
                        cat_color = "red"
                    elif score < 70:
                        cat_color = "orange"
                    
                    cat_title = f"{category_name}: <font color='{cat_color}'>{score}/100</font>"
                    elements.append(Paragraph(cat_title, self.styles['SectionTitle']))
                    
                    # Add commentary
                    commentary = readiness.get(f"{category}_commentary", "")
                    elements.append(Paragraph(commentary, self.styles['BodyText']))
                    
                    # Add recommendations if available
                    if f"{category}_recommendations" in readiness:
                        elements.append(Paragraph("Recommendations:", self.styles['SectionTitle']))
                        recommendations = readiness[f"{category}_recommendations"]
                        
                        if isinstance(recommendations, list):
                            for rec in recommendations:
                                elements.append(Paragraph(f"• {rec}", self.styles['Bullet']))
                        else:
                            elements.append(Paragraph(recommendations, self.styles['BodyText']))
                    
                    elements.append(Spacer(1, 6))
            
            # Add page break before skills gap analysis
            elements.append(PageBreak())
        
        # Skills Gap Analysis
        if "skills_gap" in assessment_data:
            skills_gap = assessment_data["skills_gap"]
            
            elements.append(Paragraph("Skills Gap Analysis", self.styles['Subtitle']))
            
            # Summary
            if "summary" in skills_gap:
                elements.append(Paragraph(skills_gap["summary"], self.styles['BodyText']))
                elements.append(Spacer(1, 6))
            
            # Target role
            if "target_role" in skills_gap:
                elements.append(Paragraph(f"Target Role: {skills_gap['target_role']}", self.styles['SectionTitle']))
                elements.append(Spacer(1, 6))
            
            # Missing critical skills
            if "missing_critical_skills" in skills_gap and skills_gap["missing_critical_skills"]:
                elements.append(Paragraph("Critical Skills to Develop:", self.styles['SectionTitle']))
                for skill in skills_gap["missing_critical_skills"]:
                    elements.append(Paragraph(f"• {skill}", self.styles['Bullet']))
                elements.append(Spacer(1, 6))
            
            # Missing nice-to-have skills
            if "missing_nice_to_have_skills" in skills_gap and skills_gap["missing_nice_to_have_skills"]:
                elements.append(Paragraph("Recommended Skills to Develop:", self.styles['SectionTitle']))
                for skill in skills_gap["missing_nice_to_have_skills"]:
                    elements.append(Paragraph(f"• {skill}", self.styles['Bullet']))
                elements.append(Spacer(1, 6))
            
            # Learning resources
            if "learning_resources" in skills_gap and skills_gap["learning_resources"]:
                elements.append(Paragraph("Learning Resources", self.styles['SectionTitle']))
                
                resources = skills_gap["learning_resources"]
                if isinstance(resources, dict):
                    for skill, resource_list in resources.items():
                        elements.append(Paragraph(f"Resources for {skill}:", self.styles['BodyText']))
                        for resource in resource_list:
                            if isinstance(resource, dict):
                                title = resource.get("title", "")
                                url = resource.get("url", "")
                                description = resource.get("description", "")
                                
                                resource_text = f"• {title}"
                                if url:
                                    resource_text += f" - <a href='{url}'>{url}</a>"
                                elements.append(Paragraph(resource_text, self.styles['Bullet']))
                                
                                if description:
                                    elements.append(Paragraph(description, self.styles['BodyText']))
                            else:
                                elements.append(Paragraph(f"• {resource}", self.styles['Bullet']))
                elif isinstance(resources, list):
                    for resource in resources:
                        if isinstance(resource, dict):
                            title = resource.get("title", "")
                            url = resource.get("url", "")
                            
                            resource_text = f"• {title}"
                            if url:
                                resource_text += f" - <a href='{url}'>{url}</a>"
                            elements.append(Paragraph(resource_text, self.styles['Bullet']))
                        else:
                            elements.append(Paragraph(f"• {resource}", self.styles['Bullet']))
            
            elements.append(Spacer(1, 12))
        
        # Career Path Recommendations
        if "career_paths" in assessment_data:
            elements.append(PageBreak())
            career_paths = assessment_data["career_paths"]
            
            elements.append(Paragraph("Career Path Recommendations", self.styles['Subtitle']))
            
            # Introduction
            if "introduction" in career_paths:
                elements.append(Paragraph(career_paths["introduction"], self.styles['BodyText']))
                elements.append(Spacer(1, 6))
            
            # Paths
            if "paths" in career_paths and career_paths["paths"]:
                for i, path in enumerate(career_paths["paths"]):
                    path_name = path.get("name", f"Career Path {i+1}")
                    fit_score = path.get("fit_score", 0)
                    
                    # Get color based on fit score
                    fit_color = "green"
                    if fit_score < 40:
                        fit_color = "red"
                    elif fit_score < 70:
                        fit_color = "orange"
                    
                    path_title = f"{path_name} <font color='{fit_color}'>(Fit: {fit_score}%)</font>"
                    elements.append(Paragraph(path_title, self.styles['SectionTitle']))
                    
                    # Description
                    if "description" in path:
                        elements.append(Paragraph(path["description"], self.styles['BodyText']))
                    
                    # Requirements
                    if "requirements" in path:
                        elements.append(Paragraph("Requirements:", self.styles['BodyText']))
                        for req in path["requirements"]:
                            elements.append(Paragraph(f"• {req}", self.styles['Bullet']))
                    
                    # Progression steps
                    if "progression" in path and path["progression"]:
                        elements.append(Paragraph("Career Progression:", self.styles['BodyText']))
                        for step in path["progression"]:
                            step_title = step.get("title", "")
                            step_years = step.get("experience_years", "")
                            step_text = f"• {step_title}"
                            if step_years:
                                step_text += f" ({step_years} years)"
                            elements.append(Paragraph(step_text, self.styles['Bullet']))
                    
                    elements.append(Spacer(1, 6))
            
            # Next steps
            if "next_steps" in career_paths:
                elements.append(Paragraph("Recommended Next Steps:", self.styles['SectionTitle']))
                for step in career_paths["next_steps"]:
                    elements.append(Paragraph(f"• {step}", self.styles['Bullet']))
        
        # Add footer with page numbers
        def add_page_number(canvas, doc):
            canvas.saveState()
            canvas.setFont('Helvetica', 9)
            page_num_text = f"Page {canvas.getPageNumber()}"
            canvas.drawRightString(letter[0] - 30, 30, page_num_text)
            canvas.drawString(30, 30, "Tamkeen AI Career Intelligence System")
            canvas.restoreState()
        
        # Build PDF
        doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
        
        return report_path
    
    def generate_custom_report(self, report_data: Dict[str, Any], 
                             report_title: str = "Custom Report") -> Optional[str]:
        """
        Generate a custom PDF report with specified data
        
        Args:
            report_data: Custom report data
            report_title: Title for the report
            
        Returns:
            str or None: Path to generated PDF, or None if failed
        """
        if not REPORTLAB_AVAILABLE:
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_name = f"custom_report_{timestamp}.pdf"
        report_path = os.path.join(self.user_report_folder, report_name)
        
        # Create document
        doc = SimpleDocTemplate(report_path, pagesize=letter,
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=72)
        
        # Container for elements
        elements = []
        
        # Add title
        elements.append(Paragraph(report_title, self.styles['Title']))
        
        # Add date
        date_str = datetime.now().strftime("%B %d, %Y")
        elements.append(Paragraph(f"Generated on: {date_str}", self.styles['BodyText']))
        elements.append(Spacer(1, 12))
        
        # Loop through sections
        for section_title, section_data in report_data.items():
            elements.append(Paragraph(section_title, self.styles['Subtitle']))
            
            # Handle different section types
            if isinstance(section_data, str):
                # Simple text section
                elements.append(Paragraph(section_data, self.styles['BodyText']))
                
            elif isinstance(section_data, list):
                # List of items
                for item in section_data:
                    if isinstance(item, dict) and "title" in item and "content" in item:
                        # Item with title and content
                        elements.append(Paragraph(item["title"], self.styles['SectionTitle']))
                        
                        if isinstance(item["content"], str):
                            elements.append(Paragraph(item["content"], self.styles['BodyText']))
                        elif isinstance(item["content"], list):
                            for point in item["content"]:
                                elements.append(Paragraph(f"• {point}", self.styles['Bullet']))
                    else:
                        # Simple bullet point
                        elements.append(Paragraph(f"• {item}", self.styles['Bullet']))
            
            elif isinstance(section_data, dict):
                # Dictionary section
                if "chart" in section_data:
                    # Chart data
                    chart_type = section_data.get("chart_type", "bar")
                    chart_path = self.generate_chart_image(
                        section_data["chart"], 
                        chart_type, 
                        f"chart_{section_title.lower().replace(' ', '_')}_{timestamp}.png"
                    )
                    if chart_path:
                        elements.append(Image(chart_path, width=400, height=300))
                
                elif "table" in section_data:
                    # Table data
                    table_data = section_data["table"]
                    if table_data and isinstance(table_data, list):
                        # Get column widths
                        col_count = max(len(row) if isinstance(row, list) else 0 for row in table_data)
                        col_width = 400 / col_count if col_count > 0 else 400
                        
                        table = Table(table_data, colWidths=[col_width] * col_count)
                        
                        # Add styles
                        style = [
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                            ('PADDING', (0, 0), (-1, -1), 4),
                        ]
                        table.setStyle(TableStyle(style))
                        elements.append(table)
                
                elif "text" in section_data:
                    # Text with optional title
                    if "subtitle" in section_data:
                        elements.append(Paragraph(section_data["subtitle"], self.styles['SectionTitle']))
                    
                    elements.append(Paragraph(section_data["text"], self.styles['BodyText']))
                
                elif "bullets" in section_data:
                    # Bullet points with optional title
                    if "subtitle" in section_data:
                        elements.append(Paragraph(section_data["subtitle"], self.styles['SectionTitle']))
                    
                    for bullet in section_data["bullets"]:
                        elements.append(Paragraph(f"• {bullet}", self.styles['Bullet']))
                
                else:
                    # Generic key-value section
                    for key, value in section_data.items():
                        if isinstance(value, list):
                            elements.append(Paragraph(key, self.styles['SectionTitle']))
                            for item in value:
                                elements.append(Paragraph(f"• {item}", self.styles['Bullet']))
                        else:
                            elements.append(Paragraph(f"{key}: {value}", self.styles['BodyText']))
            
            elements.append(Spacer(1, 12))
        
        # Add footer with page numbers
        def add_page_number(canvas, doc):
            canvas.saveState()
            canvas.setFont('Helvetica', 9)
            page_num_text = f"Page {canvas.getPageNumber()}"
            canvas.drawRightString(letter[0] - 30, 30, page_num_text)
            canvas.drawString(30, 30, "Tamkeen AI Career Intelligence System")
            canvas.restoreState()
        
        # Build PDF
        doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
        
        return report_path


# Standalone functions for report generation

def generate_resume_analysis_report(user_id: str, analysis_data: Dict[str, Any],
                                  job_title: Optional[str] = None) -> Optional[str]:
    """
    Generate PDF report for resume analysis
    
    Args:
        user_id: User ID
        analysis_data: Resume analysis data
        job_title: Optional job title
        
    Returns:
        str or None: Path to generated PDF, or None if failed
    """
    generator = ReportGenerator(user_id)
    return generator.generate_resume_analysis_report(analysis_data, job_title)


def generate_career_assessment_report(user_id: str, assessment_data: Dict[str, Any],
                                    user_profile: Optional[Dict[str, Any]] = None) -> Optional[str]:
    """
    Generate PDF report for career assessment
    
    Args:
        user_id: User ID
        assessment_data: Career assessment data
        user_profile: Optional user profile data
        
    Returns:
        str or None: Path to generated PDF, or None if failed
    """
    generator = ReportGenerator(user_id)
    return generator.generate_career_assessment_report(assessment_data, user_profile)


def generate_custom_report(user_id: str, report_data: Dict[str, Any],
                         report_title: str = "Custom Report") -> Optional[str]:
    """
    Generate a custom PDF report
    
    Args:
        user_id: User ID
        report_data: Custom report data
        report_title: Report title
        
    Returns:
        str or None: Path to generated PDF, or None if failed
    """
    generator = ReportGenerator(user_id)
    return generator.generate_custom_report(report_data, report_title)
