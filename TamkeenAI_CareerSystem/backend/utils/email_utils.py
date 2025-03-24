"""
Email Utility Module

This module provides functionality for sending emails and managing email templates.
"""

import os
import re
import json
import smtplib
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.utils import formatdate, formataddr
from datetime import datetime
from string import Template

# Import settings
from backend.config.settings import EMAIL_CONFIG

# Setup logger
logger = logging.getLogger(__name__)


class EmailSender:
    """Email sending and template management class"""
    
    def __init__(self):
        """Initialize email sender with configuration"""
        self.config = EMAIL_CONFIG
        self.template_dir = self.config.get('template_dir')
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Template]:
        """
        Load email templates from template directory
        
        Returns:
            dict: Email templates
        """
        templates = {}
        
        if not self.template_dir or not os.path.exists(self.template_dir):
            logger.warning(f"Email template directory not found: {self.template_dir}")
            return templates
        
        try:
            for filename in os.listdir(self.template_dir):
                if filename.endswith('.html') or filename.endswith('.txt'):
                    template_name = os.path.splitext(filename)[0]
                    file_path = os.path.join(self.template_dir, filename)
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        templates[template_name] = Template(f.read())
            
            logger.info(f"Loaded {len(templates)} email templates")
            
            return templates
        
        except Exception as e:
            logger.error(f"Error loading email templates: {str(e)}")
            return {}
    
    def send_email(self, to_email: str, subject: str, body: str, 
                  attachments: Optional[List[str]] = None, 
                  cc: Optional[List[str]] = None,
                  bcc: Optional[List[str]] = None,
                  is_html: bool = True) -> Tuple[bool, Optional[str]]:
        """
        Send email
        
        Args:
            to_email: Recipient email address or list of addresses
            subject: Email subject
            body: Email body
            attachments: Optional list of attachment file paths
            cc: Optional list of CC recipients
            bcc: Optional list of BCC recipients
            is_html: Whether the body is HTML
            
        Returns:
            tuple: (success, error_message)
        """
        if not self.config.get('enabled', False):
            logger.warning("Email sending is disabled in configuration")
            return False, "Email sending is disabled"
        
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = formataddr((self.config.get('from_name', ''), self.config.get('from_email', '')))
            
            # Handle multiple recipients
            if isinstance(to_email, list):
                msg['To'] = ', '.join(to_email)
            else:
                msg['To'] = to_email
            
            # Add CC recipients
            if cc:
                msg['Cc'] = ', '.join(cc)
            
            # Add BCC recipients (not shown in headers)
            if bcc:
                msg['Bcc'] = ', '.join(bcc)
            
            msg['Subject'] = subject
            msg['Date'] = formatdate(localtime=True)
            
            # Attach body
            if is_html:
                msg.attach(MIMEText(body, 'html', 'utf-8'))
            else:
                msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Attach files
            if attachments:
                for file_path in attachments:
                    if os.path.exists(file_path):
                        with open(file_path, 'rb') as f:
                            attachment = MIMEApplication(f.read())
                        
                        filename = os.path.basename(file_path)
                        attachment.add_header('Content-Disposition', 'attachment', filename=filename)
                        msg.attach(attachment)
                    else:
                        logger.warning(f"Attachment not found: {file_path}")
            
            # Determine all recipients for sending
            all_recipients = []
            
            if isinstance(to_email, list):
                all_recipients.extend(to_email)
            else:
                all_recipients.append(to_email)
            
            if cc:
                all_recipients.extend(cc)
            
            if bcc:
                all_recipients.extend(bcc)
            
            # Connect to SMTP server
            smtp_server = self.config.get('smtp_server')
            smtp_port = self.config.get('smtp_port')
            
            if self.config.get('use_ssl', False):
                server = smtplib.SMTP_SSL(smtp_server, smtp_port)
            else:
                server = smtplib.SMTP(smtp_server, smtp_port)
            
            if self.config.get('use_tls', True):
                server.starttls()
            
            # Login if credentials provided
            smtp_user = self.config.get('smtp_user')
            smtp_password = self.config.get('smtp_password')
            
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
            
            # Send email
            server.sendmail(
                self.config.get('from_email'), 
                all_recipients, 
                msg.as_string()
            )
            
            server.quit()
            
            logger.info(f"Email sent to {msg['To']} with subject: {subject}")
            
            return True, None
        
        except Exception as e:
            error_msg = f"Error sending email: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def send_template_email(self, to_email: str, template_name: str, 
                           context: Dict[str, Any], subject: str,
                           attachments: Optional[List[str]] = None, 
                           cc: Optional[List[str]] = None,
                           bcc: Optional[List[str]] = None) -> Tuple[bool, Optional[str]]:
        """
        Send email using template
        
        Args:
            to_email: Recipient email address
            template_name: Template name
            context: Template context variables
            subject: Email subject
            attachments: Optional list of attachment file paths
            cc: Optional list of CC recipients
            bcc: Optional list of BCC recipients
            
        Returns:
            tuple: (success, error_message)
        """
        if template_name not in self.templates:
            logger.error(f"Email template not found: {template_name}")
            return False, f"Email template not found: {template_name}"
        
        try:
            # Render template with context
            template = self.templates[template_name]
            body = template.safe_substitute(context)
            
            # Send email
            return self.send_email(
                to_email=to_email, 
                subject=subject, 
                body=body, 
                attachments=attachments,
                cc=cc,
                bcc=bcc,
                is_html=template_name.endswith('_html')
            )
        
        except Exception as e:
            error_msg = f"Error sending template email: {str(e)}"
            logger.error(error_msg)
            return False, error_msg


# Create singleton instance
_email_sender = None

def get_email_sender() -> EmailSender:
    """
    Get email sender instance
    
    Returns:
        EmailSender: Email sender instance
    """
    global _email_sender
    
    if _email_sender is None:
        _email_sender = EmailSender()
    
    return _email_sender


# Convenience functions

def send_email(to_email: str, subject: str, body: str, 
              attachments: Optional[List[str]] = None,
              cc: Optional[List[str]] = None,
              bcc: Optional[List[str]] = None,
              is_html: bool = True) -> Tuple[bool, Optional[str]]:
    """Send email"""
    sender = get_email_sender()
    return sender.send_email(to_email, subject, body, attachments, cc, bcc, is_html)


def send_template_email(to_email: str, template_name: str, 
                       context: Dict[str, Any], subject: str,
                       attachments: Optional[List[str]] = None,
                       cc: Optional[List[str]] = None,
                       bcc: Optional[List[str]] = None) -> Tuple[bool, Optional[str]]:
    """Send email using template"""
    sender = get_email_sender()
    return sender.send_template_email(to_email, template_name, context, subject, attachments, cc, bcc)


def send_welcome_email(user_email: str, username: str) -> Tuple[bool, Optional[str]]:
    """
    Send welcome email to new user
    
    Args:
        user_email: User email
        username: Username
        
    Returns:
        tuple: (success, error_message)
    """
    context = {
        'username': username,
        'app_name': "Tamkeen AI Career Intelligence System",
        'login_url': "https://tamkeen.ai/login",
        'current_year': datetime.now().year
    }
    
    return send_template_email(
        to_email=user_email,
        template_name='welcome_email_html',
        context=context,
        subject="Welcome to Tamkeen AI Career Intelligence System"
    )


def send_password_reset_email(user_email: str, username: str, reset_token: str) -> Tuple[bool, Optional[str]]:
    """
    Send password reset email
    
    Args:
        user_email: User email
        username: Username
        reset_token: Password reset token
        
    Returns:
        tuple: (success, error_message)
    """
    reset_url = f"https://tamkeen.ai/reset-password?token={reset_token}"
    
    context = {
        'username': username,
        'reset_url': reset_url,
        'expires_in': "24 hours",
        'app_name': "Tamkeen AI Career Intelligence System",
        'current_year': datetime.now().year
    }
    
    return send_template_email(
        to_email=user_email,
        template_name='password_reset_html',
        context=context,
        subject="Password Reset Request"
    )


def send_job_application_confirmation(user_email: str, username: str, 
                                     job_title: str, company: str) -> Tuple[bool, Optional[str]]:
    """
    Send job application confirmation email
    
    Args:
        user_email: User email
        username: Username
        job_title: Job title
        company: Company name
        
    Returns:
        tuple: (success, error_message)
    """
    context = {
        'username': username,
        'job_title': job_title,
        'company': company,
        'application_date': datetime.now().strftime('%B %d, %Y'),
        'dashboard_url': "https://tamkeen.ai/dashboard/applications",
        'app_name': "Tamkeen AI Career Intelligence System",
        'current_year': datetime.now().year
    }
    
    return send_template_email(
        to_email=user_email,
        template_name='job_application_html',
        context=context,
        subject=f"Job Application Confirmation: {job_title} at {company}"
    ) 