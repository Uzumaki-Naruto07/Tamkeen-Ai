import logging
import time
import random
from typing import Dict, List, Any, Optional
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logger = logging.getLogger(__name__)

class JobApplicationAutomation:
    """
    Class to automate job applications across multiple platforms.
    NOTE: LinkedIn automation is for DEMONSTRATION PURPOSES ONLY and
    should not be made public or used in production environments.
    """
    
    def __init__(self, cv_text: str, user_profile: Dict[str, Any], settings: Dict[str, Any]):
        self.cv_text = cv_text
        self.user_profile = user_profile
        self.settings = settings
        self.chrome_options = Options()
        
        # Set up headless browser for production
        if not settings.get("debug_mode", False):
            self.chrome_options.add_argument("--headless")
        
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--window-size=1920,1080")
        
    def multi_platform_application(self, platform_credentials: Dict[str, Dict[str, str]]) -> Dict[str, Any]:
        """
        Apply to jobs across multiple platforms
        """
        results = {
            "success": True,
            "applications": [],
            "application_strategy": {},
            "total_applications": 0,
            "platforms_accessed": []
        }
        
        # Apply on each platform if credentials are provided
        if "bayt" in platform_credentials:
            bayt_results = self._apply_on_bayt(platform_credentials["bayt"])
            results["applications"].extend(bayt_results["applications"])
            results["platforms_accessed"].append("bayt")
            results["total_applications"] += len(bayt_results["applications"])
            results["application_strategy"]["bayt"] = bayt_results["strategy"]
        
        if "gulftalent" in platform_credentials:
            gulftalent_results = self._apply_on_gulftalent(platform_credentials["gulftalent"])
            results["applications"].extend(gulftalent_results["applications"])
            results["platforms_accessed"].append("gulftalent")
            results["total_applications"] += len(gulftalent_results["applications"])
            results["application_strategy"]["gulftalent"] = gulftalent_results["strategy"]
        
        if "indeed" in platform_credentials:
            indeed_results = self._apply_on_indeed(platform_credentials["indeed"])
            results["applications"].extend(indeed_results["applications"])
            results["platforms_accessed"].append("indeed")
            results["total_applications"] += len(indeed_results["applications"])
            results["application_strategy"]["indeed"] = indeed_results["strategy"]
        
        # DEMONSTRATION PURPOSES ONLY - LinkedIn automation
        if "linkedin" in platform_credentials:
            linkedin_results = self._apply_on_linkedin(platform_credentials["linkedin"])
            results["applications"].extend(linkedin_results["applications"])
            results["platforms_accessed"].append("linkedin")
            results["total_applications"] += len(linkedin_results["applications"])
            results["application_strategy"]["linkedin"] = linkedin_results["strategy"]
        
        # Additional UAE platforms
        if "naukrigulf" in platform_credentials:
            naukrigulf_results = self._apply_on_naukrigulf(platform_credentials["naukrigulf"])
            results["applications"].extend(naukrigulf_results["applications"])
            results["platforms_accessed"].append("naukrigulf")
            results["total_applications"] += len(naukrigulf_results["applications"])
            results["application_strategy"]["naukrigulf"] = naukrigulf_results["strategy"]
            
        if "monstergulf" in platform_credentials:
            monstergulf_results = self._apply_on_monstergulf(platform_credentials["monstergulf"])
            results["applications"].extend(monstergulf_results["applications"])
            results["platforms_accessed"].append("monstergulf")
            results["total_applications"] += len(monstergulf_results["applications"])
            results["application_strategy"]["monstergulf"] = monstergulf_results["strategy"]
        
        return results
    
    def _apply_on_bayt(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        """Apply to jobs on Bayt.com"""
        logger.info("Starting job applications on Bayt.com")
        
        results = {
            "applications": [],
            "strategy": "Focused on UAE-based positions in tech and business sectors."
        }
        
        try:
            driver = webdriver.Chrome(options=self.chrome_options)
            
            # Login to Bayt
            driver.get("https://www.bayt.com/en/login/")
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "LoginForm_username"))
            )
            
            # Fill login form
            driver.find_element(By.ID, "LoginForm_username").send_keys(credentials.get("username"))
            driver.find_element(By.ID, "LoginForm_password").send_keys(credentials.get("password"))
            driver.find_element(By.ID, "login-button").click()
            
            # Wait for successful login
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "m0"))
            )
            
            # Search for jobs based on user settings
            search_keywords = self.settings.get("job_keywords", ["software developer", "data analyst"])
            location = self.settings.get("job_location", "Dubai")
            
            for keyword in search_keywords:
                job_search_url = f"https://www.bayt.com/en/uae/jobs/?keyword={keyword}&location={location}"
                driver.get(job_search_url)
                
                # Wait for search results to load
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "has-pointer-d"))
                )
                
                # Get job listings
                job_listings = driver.find_elements(By.CSS_SELECTOR, ".has-pointer-d")[:5]  # Limit to first 5 jobs
                
                for job in job_listings:
                    job_title = job.find_element(By.CSS_SELECTOR, "h2.m0").text
                    company = job.find_element(By.CSS_SELECTOR, ".is-black").text
                    
                    # Click on job to view details
                    job.click()
                    
                    # Wait for job details to load
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".apply-button"))
                    )
                    
                    # Click apply button if it exists and not already applied
                    apply_button = driver.find_element(By.CSS_SELECTOR, ".apply-button")
                    if "Applied" not in apply_button.text:
                        apply_button.click()
                        
                        # Handle application modal if it appears
                        try:
                            WebDriverWait(driver, 5).until(
                                EC.presence_of_element_located((By.ID, "applicationForm"))
                            )
                            
                            # Fill application form if needed
                            # This is simplified - actual form may have more fields
                            driver.find_element(By.ID, "coverLetter").send_keys(
                                f"Dear Hiring Manager,\n\nI am excited to apply for the {job_title} position at {company}. "
                                f"My skills and experience align well with this role.\n\nBest regards,\n{self.user_profile.get('first_name')} {self.user_profile.get('last_name')}"
                            )
                            
                            # Submit application
                            driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()
                            time.sleep(2)  # Wait for submission to complete
                            
                            # Add to results
                            results["applications"].append({
                                "platform": "bayt",
                                "job_title": job_title,
                                "company": company,
                                "status": "applied",
                                "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
                                "location": location
                            })
                            
                            logger.info(f"Successfully applied to {job_title} at {company} on Bayt.com")
                        except TimeoutException:
                            # No modal appeared, might be a direct application
                            results["applications"].append({
                                "platform": "bayt",
                                "job_title": job_title,
                                "company": company,
                                "status": "applied",
                                "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
                                "location": location
                            })
                    else:
                        # Already applied
                        results["applications"].append({
                            "platform": "bayt",
                            "job_title": job_title,
                            "company": company,
                            "status": "already_applied",
                            "date_applied": "unknown",
                            "location": location
                        })
                
                # Random delay between searches to avoid detection
                time.sleep(random.uniform(2, 5))
                
        except Exception as e:
            logger.error(f"Error applying on Bayt: {str(e)}")
        finally:
            if 'driver' in locals():
                driver.quit()
                
        return results
    
    def _apply_on_gulftalent(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        """Apply to jobs on GulfTalent"""
        logger.info("Starting job applications on GulfTalent")
        
        results = {
            "applications": [],
            "strategy": "Targeted executive and management positions in UAE."
        }
        
        # Placeholder for demo - similar implementation as Bayt would follow
        # For demo purposes adding mock data
        results["applications"].append({
            "platform": "gulftalent",
            "job_title": "Senior Software Developer",
            "company": "Tech Solutions LLC",
            "status": "applied",
            "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": "Dubai, UAE"
        })
        
        results["applications"].append({
            "platform": "gulftalent",
            "job_title": "Project Manager",
            "company": "Global Systems",
            "status": "applied",
            "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": "Abu Dhabi, UAE"
        })
        
        return results
    
    def _apply_on_indeed(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        """Apply to jobs on Indeed UAE"""
        logger.info("Starting job applications on Indeed UAE")
        
        results = {
            "applications": [],
            "strategy": "Applied to entry and mid-level positions with high match scores."
        }
        
        # Placeholder for demo - similar implementation as Bayt would follow
        # For demo purposes adding mock data
        results["applications"].append({
            "platform": "indeed",
            "job_title": "Data Analyst",
            "company": "Analytics Pro",
            "status": "applied",
            "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": "Dubai, UAE"
        })
        
        return results
    
    def _apply_on_naukrigulf(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        """Apply to jobs on Naukrigulf"""
        logger.info("Starting job applications on Naukrigulf")
        
        results = {
            "applications": [],
            "strategy": "Focused on IT and engineering roles with matching skills."
        }
        
        # Placeholder for demo - similar implementation as Bayt would follow
        # For demo purposes adding mock data
        results["applications"].append({
            "platform": "naukrigulf",
            "job_title": "Frontend Developer",
            "company": "Digital Solutions FZ",
            "status": "applied",
            "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": "Dubai Internet City, UAE"
        })
        
        return results
    
    def _apply_on_monstergulf(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        """Apply to jobs on Monster Gulf"""
        logger.info("Starting job applications on Monster Gulf")
        
        results = {
            "applications": [],
            "strategy": "Applied to recently posted jobs matching experience level."
        }
        
        # Placeholder for demo - similar implementation as Bayt would follow
        # For demo purposes adding mock data
        results["applications"].append({
            "platform": "monstergulf",
            "job_title": "DevOps Engineer",
            "company": "Cloud Systems LLC",
            "status": "applied",
            "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": "Sharjah, UAE"
        })
        
        return results
    
    def _apply_on_linkedin(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        """
        Apply to jobs on LinkedIn
        NOTE: FOR DEMONSTRATION PURPOSES ONLY
        This implementation is for a private competition demo and not
        intended for public use or production environments.
        """
        logger.info("Starting job applications on LinkedIn (DEMO ONLY)")
        
        results = {
            "applications": [],
            "strategy": "Selective applications to jobs with 'Easy Apply' option."
        }
        
        try:
            driver = webdriver.Chrome(options=self.chrome_options)
            
            # Login to LinkedIn
            driver.get("https://www.linkedin.com/login")
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            
            # Fill login form
            driver.find_element(By.ID, "username").send_keys(credentials.get("username"))
            driver.find_element(By.ID, "password").send_keys(credentials.get("password"))
            driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            
            # Wait for successful login
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.ID, "global-nav"))
            )
            
            # Navigate to Jobs
            driver.get("https://www.linkedin.com/jobs/")
            
            # Search for jobs based on user settings
            search_keywords = self.settings.get("job_keywords", ["software developer", "data analyst"])
            location = self.settings.get("job_location", "Dubai, United Arab Emirates")
            
            for keyword in search_keywords[:1]:  # Limit to one keyword for demo
                # Navigate to job search
                driver.get(f"https://www.linkedin.com/jobs/search/?keywords={keyword}&location={location}")
                
                # Wait for search results
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "jobs-search-results__list"))
                )
                
                # Get job listings with Easy Apply
                job_cards = driver.find_elements(By.CSS_SELECTOR, ".job-card-container")[:3]  # Limit to first 3
                
                for job_card in job_cards:
                    try:
                        # Click on job card to view details
                        job_card.click()
                        time.sleep(2)  # Wait for job details to load
                        
                        # Get job details
                        job_title_elem = WebDriverWait(driver, 5).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, ".jobs-unified-top-card__job-title"))
                        )
                        job_title = job_title_elem.text
                        
                        company_elem = driver.find_element(By.CSS_SELECTOR, ".jobs-unified-top-card__company-name")
                        company = company_elem.text
                        
                        # Look for Easy Apply button
                        try:
                            easy_apply_button = driver.find_element(By.CSS_SELECTOR, ".jobs-apply-button")
                            if "Easy Apply" in easy_apply_button.text:
                                # Click Easy Apply
                                easy_apply_button.click()
                                
                                # Wait for application form
                                WebDriverWait(driver, 5).until(
                                    EC.presence_of_element_located((By.CSS_SELECTOR, ".jobs-easy-apply-content"))
                                )
                                
                                # Fill out application forms - this is simplified
                                # In reality, this would need to handle multi-step forms
                                
                                # Check if there's a next button
                                next_buttons = driver.find_elements(By.CSS_SELECTOR, "button[aria-label='Continue to next step']")
                                if next_buttons:
                                    # Multi-step form
                                    for _ in range(3):  # Assume max 3 steps for demo
                                        try:
                                            # Try to find any input fields and fill them
                                            phone_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='tel']")
                                            for phone_input in phone_inputs:
                                                if phone_input.get_attribute("value") == "":
                                                    phone_input.send_keys(self.user_profile.get("phone", "0501234567"))
                                            
                                            # Look for dropdowns and select first option
                                            dropdowns = driver.find_elements(By.CSS_SELECTOR, "select")
                                            for dropdown in dropdowns:
                                                options = dropdown.find_elements(By.CSS_SELECTOR, "option")
                                                if len(options) > 1:  # Skip if only has default option
                                                    options[1].click()  # Select first non-default option
                                            
                                            # Click next or submit
                                            next_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Continue to next step']")
                                            if next_button.is_displayed():
                                                next_button.click()
                                                time.sleep(1)
                                            else:
                                                # Try to find submit button
                                                submit_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Submit application']")
                                                if submit_button.is_displayed():
                                                    submit_button.click()
                                                    break
                                        except NoSuchElementException:
                                            # Try to find submit button
                                            try:
                                                submit_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Submit application']")
                                                if submit_button.is_displayed():
                                                    submit_button.click()
                                                    break
                                            except NoSuchElementException:
                                                # No submit button yet, continue
                                                pass
                                else:
                                    # Single-step form, look for submit
                                    submit_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Submit application']")
                                    submit_button.click()
                                
                                # Wait for confirmation or next step
                                time.sleep(2)
                                
                                # Add to results
                                results["applications"].append({
                                    "platform": "linkedin",
                                    "job_title": job_title,
                                    "company": company,
                                    "status": "applied",
                                    "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
                                    "location": location
                                })
                                
                                logger.info(f"Successfully applied to {job_title} at {company} on LinkedIn (DEMO)")
                            else:
                                # Not Easy Apply job
                                results["applications"].append({
                                    "platform": "linkedin",
                                    "job_title": job_title,
                                    "company": company,
                                    "status": "skipped_not_easy_apply",
                                    "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
                                    "location": location
                                })
                        except NoSuchElementException:
                            # No apply button or already applied
                            results["applications"].append({
                                "platform": "linkedin",
                                "job_title": job_title,
                                "company": company,
                                "status": "skipped_no_apply_button",
                                "date_applied": time.strftime("%Y-%m-%d %H:%M:%S"),
                                "location": location
                            })
                    
                    except Exception as job_error:
                        logger.error(f"Error processing LinkedIn job: {str(job_error)}")
                        continue
                
                # Random delay between job applications
                time.sleep(random.uniform(3, 7))
                
        except Exception as e:
            logger.error(f"Error applying on LinkedIn (DEMO): {str(e)}")
        finally:
            if 'driver' in locals():
                driver.quit()
                
        return results 