import os
import json
import base64
import tempfile
from typing import Dict, List, Tuple, Any, Optional, Union
from datetime import datetime
import io

# Optional dependencies with graceful fallback
try:
    import jinja2
    JINJA2_AVAILABLE = True
except ImportError:
    JINJA2_AVAILABLE = False

try:
    import markdown
    MARKDOWN_AVAILABLE = True
except ImportError:
    MARKDOWN_AVAILABLE = False

try:
    import pdfkit
    PDFKIT_AVAILABLE = True
except ImportError:
    PDFKIT_AVAILABLE = False

try:
    import weasyprint
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False


class ReportGenerator:
    """
    Generates career assessment reports in HTML, PDF, or Markdown formats.
    Uses templates to create professional reports with visualization support.
    """
    
    def __init__(self, 
              template_dir: Optional[str] = None, 
              output_dir: Optional[str] = None,
              pdf_engine: str = "auto"):
        """
        Initialize the report generator
        
        Args:
            template_dir: Optional directory containing report templates
            output_dir: Optional directory for report output files
            pdf_engine: Engine for PDF generation ("weasyprint", "pdfkit", or "auto")
        """
        self.pdf_engine = pdf_engine
        self.available_pdf_engines = []
        self.initialized = False
        
        # Check available PDF engines
        if PDFKIT_AVAILABLE:
            self.available_pdf_engines.append("pdfkit")
            
        if WEASYPRINT_AVAILABLE:
            self.available_pdf_engines.append("weasyprint")
            
        # Determine PDF engine
        if pdf_engine == "auto":
            if "weasyprint" in self.available_pdf_engines:
                self.pdf_engine = "weasyprint"
            elif "pdfkit" in self.available_pdf_engines:
                self.pdf_engine = "pdfkit"
            else:
                self.pdf_engine = None
        elif pdf_engine not in self.available_pdf_engines:
            self.pdf_engine = None
        
        # Initialize template engine
        self.jinja_env = None
        if JINJA2_AVAILABLE:
            # Find template directory
            if template_dir is None or not os.path.exists(template_dir):
                # Check standard locations
                possible_dirs = [
                    os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates"),
                    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "templates"),
                    os.path.join(os.path.expanduser("~"), ".tamkeen", "templates")
                ]
                
                for d in possible_dirs:
                    if os.path.exists(d):
                        template_dir = d
                        break
            
            if template_dir and os.path.exists(template_dir):
                try:
                    self.jinja_env = jinja2.Environment(
                        loader=jinja2.FileSystemLoader(template_dir),
                        autoescape=jinja2.select_autoescape(['html', 'xml'])
                    )
                    # Register custom filters
                    self.jinja_env.filters['format_date'] = self._format_date
                    self.jinja_env.filters['format_percent'] = self._format_percent
                except Exception as e:
                    print(f"ERROR initializing Jinja2: {str(e)}")
        
        # Set output directory
        if output_dir is None:
            output_dir = os.path.join(tempfile.gettempdir(), "tamkeen_reports")
        
        os.makedirs(output_dir, exist_ok=True)
        self.output_dir = output_dir
        
        # Set initialized state
        self.initialized = JINJA2_AVAILABLE or MARKDOWN_AVAILABLE
        
    def generate_report(self, 
                      data: Dict[str, Any], 
                      report_type: str = "career_assessment",
                      output_format: str = "pdf", 
                      output_path: Optional[str] = None,
                      custom_template: Optional[str] = None) -> Union[str, bytes, None]:
        """
        Generate a report from the provided data
        
        Args:
            data: Dictionary containing the data for the report
            report_type: Type of report to generate
            output_format: Format of the report ("pdf", "html", or "markdown")
            output_path: Optional path to save the report
            custom_template: Optional custom template path to use
            
        Returns:
            Depending on output_format:
              - Path to the file if output_path provided
              - Bytes containing PDF data if output_format is "pdf"
              - String containing HTML or Markdown if other formats
              - None if generation fails
        """
        if not self.initialized:
            print("ERROR: Report generator not properly initialized")
            return None
            
        # Validate and prepare data
        if not data:
            print("ERROR: No data provided for report generation")
            return None
            
        # Add metadata
        report_data = data.copy()
        report_data.update({
            "generation_date": datetime.now(),
            "report_type": report_type,
        })
        
        # Generate report content
        if output_format == "markdown":
            content = self._generate_markdown(report_data, report_type, custom_template)
        else:  # HTML or PDF (both need HTML)
            content = self._generate_html(report_data, report_type, custom_template)
            
        if content is None:
            return None
            
        # Output handling
        if output_format == "pdf":
            return self._html_to_pdf(content, output_path)
        elif output_format == "html":
            if output_path:
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return output_path
            return content
        else:  # markdown
            if output_path:
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return output_path
            return content
            
    def _generate_html(self, 
                    data: Dict[str, Any], 
                    report_type: str, 
                    custom_template: Optional[str] = None) -> Optional[str]:
        """Generate HTML content from template and data"""
        if not JINJA2_AVAILABLE or not self.jinja_env:
            print("ERROR: Jinja2 not available for HTML template rendering")
            return None
            
        try:
            # Determine template
            template_name = custom_template if custom_template else f"{report_type}.html"
            
            # Try to load template
            try:
                template = self.jinja_env.get_template(template_name)
            except jinja2.exceptions.TemplateNotFound:
                # Fall back to default template
                template = self.jinja_env.get_template("default.html")
                
            # Render template with data
            html_content = template.render(**data)
            return html_content
            
        except Exception as e:
            print(f"ERROR generating HTML: {str(e)}")
            return None
            
    def _generate_markdown(self, 
                        data: Dict[str, Any], 
                        report_type: str,
                        custom_template: Optional[str] = None) -> Optional[str]:
        """Generate Markdown content from template and data"""
        if JINJA2_AVAILABLE and self.jinja_env:
            try:
                # Determine template
                template_name = custom_template if custom_template else f"{report_type}.md"
                
                # Try to load template
                try:
                    template = self.jinja_env.get_template(template_name)
                except jinja2.exceptions.TemplateNotFound:
                    # Fall back to default template
                    template = self.jinja_env.get_template("default.md")
                    
                # Render template with data
                md_content = template.render(**data)
                return md_content
                
            except Exception as e:
                print(f"ERROR generating Markdown: {str(e)}")
                
        # Fallback to basic markdown generation without templates
        return self._generate_basic_markdown(data, report_type)
            
    def _generate_basic_markdown(self, 
                              data: Dict[str, Any], 
                              report_type: str) -> str:
        """Generate basic markdown without templates"""
        md_lines = [
            f"# {self._get_report_title(report_type)}",
            f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            ""
        ]
        
        # Add user information if available
        if "user" in data:
            user = data["user"]
            md_lines.extend([
                "## User Information",
                f"- Name: {user.get('name', 'Not provided')}",
                f"- Email: {user.get('email', 'Not provided')}",
                ""
            ])
            
        # Add assessment results if available
        if "assessment" in data:
            assessment = data["assessment"]
            md_lines.extend([
                "## Assessment Results",
                ""
            ])
            
            # Add overall score if available
            if "overall_score" in assessment:
                md_lines.extend([
                    f"### Overall Score: {assessment['overall_score']}/100",
                    ""
                ])
                
            # Add category scores if available
            if "categories" in assessment:
                md_lines.append("### Category Scores")
                for category in assessment["categories"]:
                    md_lines.append(f"- {category['name']}: {category['score']}/100")
                md_lines.append("")
                
        # Add recommendations if available
        if "recommendations" in data:
            recommendations = data["recommendations"]
            md_lines.extend([
                "## Recommendations",
                ""
            ])
            
            for i, rec in enumerate(recommendations, 1):
                md_lines.extend([
                    f"### {i}. {rec.get('title', 'Recommendation')}",
                    f"{rec.get('description', '')}",
                    ""
                ])
                
                if "action_items" in rec:
                    md_lines.append("Action Items:")
                    for item in rec["action_items"]:
                        md_lines.append(f"- {item}")
                    md_lines.append("")
        
        # Join all lines
        return "\n".join(md_lines)
        
    def _html_to_pdf(self, 
                   html_content: str, 
                   output_path: Optional[str] = None) -> Union[bytes, str, None]:
        """Convert HTML content to PDF"""
        if not self.pdf_engine:
            print("ERROR: No PDF engine available")
            return None
            
        # Generate a temporary file path if none provided
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = os.path.join(
                self.output_dir, 
                f"report_{timestamp}.pdf"
            )
            
        try:
            if self.pdf_engine == "weasyprint":
                # Use WeasyPrint
                pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
                
                # Save to file if output_path provided
                if output_path:
                    with open(output_path, 'wb') as f:
                        f.write(pdf_bytes)
                    return output_path
                    
                return pdf_bytes
                
            elif self.pdf_engine == "pdfkit":
                # Use pdfkit (wkhtmltopdf)
                options = {
                    'encoding': 'UTF-8',
                    'page-size': 'A4',
                    'margin-top': '0.75in',
                    'margin-right': '0.75in',
                    'margin-bottom': '0.75in',
                    'margin-left': '0.75in',
                }
                
                # Generate PDF
                pdf_bytes = pdfkit.from_string(html_content, False, options=options)
                
                # Save to file if output_path provided
                if output_path:
                    with open(output_path, 'wb') as f:
                        f.write(pdf_bytes)
                    return output_path
                    
                return pdf_bytes
                
        except Exception as e:
            print(f"ERROR generating PDF: {str(e)}")
            return None
            
    def _get_report_title(self, report_type: str) -> str:
        """Generate appropriate title based on report type"""
        title_map = {
            "career_assessment": "Career Assessment Report",
            "resume_analysis": "Resume Analysis Report",
            "interview_feedback": "Interview Feedback Report",
            "skill_gap": "Skill Gap Analysis Report",
            "career_path": "Career Path Recommendations Report"
        }
        
        return title_map.get(report_type, "Tamkeen AI Career Report")
        
    # Custom Jinja2 filters
    def _format_date(self, value):
        """Format date for templates"""
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value)
            except:
                return value
                
        if isinstance(value, datetime):
            return value.strftime("%B %d, %Y")
            
        return value
        
    def _format_percent(self, value):
        """Format percentage for templates"""
        if isinstance(value, (int, float)):
            return f"{value:.1f}%"
        return value


class CareerReportGenerator(ReportGenerator):
    """
    Specialized report generator for career assessments with visualization capabilities
    and interactive elements for digital reports
    """
    
    def __init__(self, 
              template_dir: Optional[str] = None, 
              output_dir: Optional[str] = None,
              pdf_engine: str = "auto",
              include_visualizations: bool = True):
        """
        Initialize career report generator
        
        Args:
            template_dir: Optional directory containing report templates
            output_dir: Optional directory for report output files
            pdf_engine: Engine for PDF generation
            include_visualizations: Whether to include data visualizations
        """
        super().__init__(template_dir, output_dir, pdf_engine)
        self.include_visualizations = include_visualizations
        
        # Check for visualization dependencies
        self.visualization_available = False
        try:
            import matplotlib
            import matplotlib.pyplot as plt
            import seaborn as sns
            self.visualization_available = True
        except ImportError:
            pass
            
    def generate_assessment_report(self, 
                                assessment_data: Dict[str, Any],
                                user_data: Optional[Dict[str, Any]] = None,
                                output_format: str = "pdf",
                                output_path: Optional[str] = None) -> Union[str, bytes, None]:
        """
        Generate a comprehensive career assessment report
        
        Args:
            assessment_data: Career assessment data
            user_data: Optional user profile data
            output_format: Format of the report
            output_path: Optional path to save the report
            
        Returns:
            Report content or path depending on output_format
        """
        # Combine assessment and user data
        report_data = {
            "assessment": assessment_data,
            "generation_date": datetime.now()
        }
        
        if user_data:
            report_data["user"] = user_data
            
        # Add visualizations if enabled and available
        if self.include_visualizations and self.visualization_available:
            visualizations = self._generate_visualizations(assessment_data)
            report_data["visualizations"] = visualizations
            
        # Generate the report
        return self.generate_report(
            data=report_data,
            report_type="career_assessment",
            output_format=output_format,
            output_path=output_path
        )
        
    def generate_interview_report(self,
                               interview_data: Dict[str, Any],
                               user_data: Optional[Dict[str, Any]] = None,
                               output_format: str = "pdf",
                               output_path: Optional[str] = None) -> Union[str, bytes, None]:
        """
        Generate an interview feedback report
        
        Args:
            interview_data: Interview assessment data
            user_data: Optional user profile data
            output_format: Format of the report
            output_path: Optional path to save the report
            
        Returns:
            Report content or path depending on output_format
        """
        # Combine interview and user data
        report_data = {
            "interview": interview_data,
            "generation_date": datetime.now()
        }
        
        if user_data:
            report_data["user"] = user_data
            
        # Add visualizations for interview analytics
        if self.include_visualizations and self.visualization_available:
            visualizations = self._generate_interview_visualizations(interview_data)
            report_data["visualizations"] = visualizations
            
        # Generate the report
        return self.generate_report(
            data=report_data,
            report_type="interview_feedback",
            output_format=output_format,
            output_path=output_path
        )
        
    def _generate_visualizations(self, assessment_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate data visualizations for assessment reports"""
        if not self.visualization_available:
            return {}
            
        try:
            import matplotlib.pyplot as plt
            import seaborn as sns
            import io
            import base64
            
            visualizations = {}
            
            # Radar chart for skills alignment
            if "skills_alignment" in assessment_data:
                skills_data = assessment_data["skills_alignment"]
                if isinstance(skills_data, dict) and len(skills_data) > 0:
                    plt.figure(figsize=(8, 8))
                    categories = list(skills_data.keys())
                    values = list(skills_data.values())
                    
                    # Number of variables
                    N = len(categories)
                    
                    # Create angles for each category
                    angles = [n / float(N) * 2 * 3.14159 for n in range(N)]
                    angles += angles[:1]  # Close the loop
                    
                    # Add values (and close the loop)
                    values += values[:1]
                    
                    # Plot
                    ax = plt.subplot(111, polar=True)
                    plt.xticks(angles[:-1], categories, color='grey', size=10)
                    ax.plot(angles, values, linewidth=1, linestyle='solid')
                    ax.fill(angles, values, 'b', alpha=0.1)
                    
                    # Convert to base64
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png')
                    buf.seek(0)
                    img_str = base64.b64encode(buf.read()).decode('utf-8')
                    visualizations['skills_radar'] = f"data:image/png;base64,{img_str}"
                    plt.close()
            
            # Bar chart for category scores
            if "categories" in assessment_data:
                categories = assessment_data["categories"]
                if isinstance(categories, list) and len(categories) > 0:
                    plt.figure(figsize=(10, 6))
                    names = [c["name"] for c in categories]
                    scores = [c["score"] for c in categories]
                    
                    # Create bar chart
                    sns.barplot(x=scores, y=names)
                    plt.xlabel('Score')
                    plt.title('Category Performance')
                    
                    # Convert to base64
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png')
                    buf.seek(0)
                    img_str = base64.b64encode(buf.read()).decode('utf-8')
                    visualizations['categories_bar'] = f"data:image/png;base64,{img_str}"
                    plt.close()
                    
            return visualizations
            
        except Exception as e:
            print(f"ERROR generating visualizations: {str(e)}")
            return {}
            
    def _generate_interview_visualizations(self, interview_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate visualizations for interview reports"""
        if not self.visualization_available:
            return {}
            
        try:
            import matplotlib.pyplot as plt
            import seaborn as sns
            import numpy as np
            import io
            import base64
            
            visualizations = {}
            
            # Emotion timeline if available
            if "emotion_timeline" in interview_data:
                timeline = interview_data["emotion_timeline"]
                if isinstance(timeline, list) and len(timeline) > 0:
                    plt.figure(figsize=(12, 6))
                    
                    # Extract timestamps and emotions
                    timestamps = [t.get("timestamp", i) for i, t in enumerate(timeline)]
                    emotions = {}
                    
                    # Gather all emotion types
                    for point in timeline:
                        if "emotions" in point and isinstance(point["emotions"], dict):
                            for emotion, value in point["emotions"].items():
                                if emotion not in emotions:
                                    emotions[emotion] = []
                                emotions[emotion].append(value)
                    
                    # Plot each emotion line
                    for emotion, values in emotions.items():
                        if len(values) == len(timestamps):
                            plt.plot(timestamps, values, label=emotion)
                    
                    plt.legend()
                    plt.title('Emotion Timeline During Interview')
                    plt.xlabel('Time')
                    plt.ylabel('Emotion Intensity')
                    
                    # Convert to base64
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png')
                    buf.seek(0)
                    img_str = base64.b64encode(buf.read()).decode('utf-8')
                    visualizations['emotion_timeline'] = f"data:image/png;base64,{img_str}"
                    plt.close()
            
            # Feedback categories
            if "feedback_categories" in interview_data:
                categories = interview_data["feedback_categories"]
                if isinstance(categories, dict) and len(categories) > 0:
                    plt.figure(figsize=(10, 6))
                    names = list(categories.keys())
                    scores = list(categories.values())
                    
                    # Create bar chart
                    sns.barplot(x=scores, y=names)
                    plt.xlabel('Score')
                    plt.title('Interview Performance by Category')
                    
                    # Convert to base64
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png')
                    buf.seek(0)
                    img_str = base64.b64encode(buf.read()).decode('utf-8')
                    visualizations['feedback_categories'] = f"data:image/png;base64,{img_str}"
                    plt.close()
                    
            return visualizations
            
        except Exception as e:
            print(f"ERROR generating interview visualizations: {str(e)}")
            return {}
