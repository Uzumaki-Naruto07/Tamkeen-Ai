import json
import time
import random
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..models.job_application_models import ApplicationLog, PlatformCredentials, JobApplicationSettings

class JobApplicationAutomation:
    """
    Service for automating job applications across platforms
    Note: This is a simulation for the backend that would interact with Selenium in a real implementation
    """
    
    def __init__(self, cv_text: str, user_profile: Dict[str, Any], settings: JobApplicationSettings):
        self.cv_text = cv_text
        self.user_profile = user_profile
        self.settings = settings
        self.application_log = []
        
        # Platform metadata (for simulation purposes)
        self.platforms = {
            "linkedin": {
                "name": "LinkedIn",
                "url": "https://www.linkedin.com/jobs/",
                "success_rate": 0.85,
                "emirates_coverage": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Umm Al Quwain", "Fujairah"]
            },
            "bayt": {
                "name": "Bayt.com",
                "url": "https://www.bayt.com/en/uae/jobs/",
                "success_rate": 0.9,
                "emirates_coverage": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Umm Al Quwain", "Fujairah"]
            },
            "gulftalent": {
                "name": "GulfTalent",
                "url": "https://www.gulftalent.com/jobs/",
                "success_rate": 0.8,
                "emirates_coverage": ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah"]
            },
            "indeed": {
                "name": "Indeed UAE",
                "url": "https://ae.indeed.com/jobs",
                "success_rate": 0.75,
                "emirates_coverage": ["Dubai", "Abu Dhabi", "Sharjah"]
            },
            "naukrigulf": {
                "name": "Naukrigulf",
                "url": "https://www.naukrigulf.com/jobs-in-uae",
                "success_rate": 0.7,
                "emirates_coverage": ["Dubai", "Abu Dhabi"]
            },
            "monster": {
                "name": "Monster Gulf",
                "url": "https://www.monsterindia.com/jobs-in-gulf",
                "success_rate": 0.65,
                "emirates_coverage": ["Dubai", "Abu Dhabi", "Sharjah"]
            }
        }
    
    def _simulate_platform_login(self, platform: str, credentials: Optional[PlatformCredentials] = None) -> bool:
        """Simulate logging into a platform"""
        # In a real implementation, this would use Selenium to log in
        
        # Simulate login success/failure
        time.sleep(random.uniform(0.5, 1.5))  # Simulate network delay
        
        # 90% success rate for login simulation
        return random.random() < 0.9
    
    def _simulate_job_search(self, platform: str, job_title: str, emirate: str) -> List[Dict[str, Any]]:
        """Simulate searching for jobs on a platform"""
        # In a real implementation, this would use Selenium to search
        
        # Simulate search results
        time.sleep(random.uniform(1.0, 2.5))  # Simulate network delay
        
        # Generate 2-8 fake job listings
        num_listings = random.randint(2, 8)
        companies = ["Tech Solutions LLC", "Emirates Advanced Technologies", "Gulf Innovations", 
                    "UAE Digital Systems", "Dubai Smart Solutions", "Abu Dhabi Tech Corp"]
        
        job_listings = []
        for i in range(num_listings):
            company = random.choice(companies)
            job_listings.append({
                "id": f"job-{platform}-{i}",
                "title": job_title if random.random() < 0.7 else f"{job_title} {random.choice(['Senior', 'Junior', 'Lead'])}",
                "company": company,
                "location": f"{emirate}, UAE",
                "description": f"We are looking for a {job_title} to join our team...",
                "easy_apply": random.random() < 0.6  # 60% chance of easy apply
            })
        
        return job_listings
    
    def _simulate_job_application(self, platform: str, job: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate applying to a job"""
        # In a real implementation, this would use Selenium to apply
        
        # Simulate application process
        time.sleep(random.uniform(3.0, 7.0))  # Simulate form filling
        
        # Simulate success/failure based on platform success rate
        success_rate = self.platforms.get(platform, {}).get("success_rate", 0.5)
        success = random.random() < success_rate
        
        return {
            "job_id": job["id"],
            "job_title": job["title"],
            "company": job["company"],
            "platform": self.platforms.get(platform, {}).get("name", platform),
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "message": "Application submitted successfully" if success else random.choice([
                "Error submitting application", 
                "Connection timeout", 
                "Form validation failed"
            ])
        }
    
    def apply_on_linkedin(self, job_title: str, emirate: str, credentials: Optional[PlatformCredentials] = None) -> List[Dict[str, Any]]:
        """Simulate LinkedIn job application"""
        platform = "linkedin"
        results = []
        
        # Check if LinkedIn is enabled in settings and emirate is covered
        if (not self.settings.apply_through_linkedin or 
            emirate not in self.platforms.get(platform, {}).get("emirates_coverage", [])):
            return results
        
        # Simulate login
        if not self._simulate_platform_login(platform, credentials):
            self.application_log.append(ApplicationLog(
                platform=self.platforms.get(platform, {}).get("name", platform),
                job_title="N/A",
                company="N/A",
                status="Login Failed",
                application_date=datetime.now().isoformat(),
                notes="Failed to login to platform"
            ).dict())
            return results
        
        # Simulate job search
        job_listings = self._simulate_job_search(platform, job_title, emirate)
        
        # Simulate applying to jobs
        for job in job_listings:
            if job.get("easy_apply", False):  # Only apply to Easy Apply jobs
                result = self._simulate_job_application(platform, job)
                results.append(result)
                
                # Log application
                self.application_log.append(ApplicationLog(
                    platform=result["platform"],
                    job_title=result["job_title"],
                    company=result["company"],
                    status="Applied" if result["success"] else "Failed",
                    application_date=result["timestamp"],
                    notes=result["message"]
                ).dict())
        
        return results
    
    def apply_on_bayt(self, job_title: str, emirate: str, credentials: Optional[PlatformCredentials] = None) -> List[Dict[str, Any]]:
        """Simulate Bayt.com job application"""
        platform = "bayt"
        results = []
        
        # Check if Bayt is enabled in settings and emirate is covered
        if (not self.settings.apply_through_bayt or 
            emirate not in self.platforms.get(platform, {}).get("emirates_coverage", [])):
            return results
        
        # Simulate login
        if not self._simulate_platform_login(platform, credentials):
            self.application_log.append(ApplicationLog(
                platform=self.platforms.get(platform, {}).get("name", platform),
                job_title="N/A",
                company="N/A",
                status="Login Failed",
                application_date=datetime.now().isoformat(),
                notes="Failed to login to platform"
            ).dict())
            return results
        
        # Simulate job search and application (similar to LinkedIn)
        job_listings = self._simulate_job_search(platform, job_title, emirate)
        
        for job in job_listings:
            result = self._simulate_job_application(platform, job)
            results.append(result)
            
            # Log application
            self.application_log.append(ApplicationLog(
                platform=result["platform"],
                job_title=result["job_title"],
                company=result["company"],
                status="Applied" if result["success"] else "Failed",
                application_date=result["timestamp"],
                notes=result["message"]
            ).dict())
        
        return results
    
    # Similar methods for other platforms
    def apply_on_gulftalent(self, job_title: str, emirate: str, credentials: Optional[PlatformCredentials] = None) -> List[Dict[str, Any]]:
        """Simulate GulfTalent job application"""
        platform = "gulftalent"
        results = []
        
        if (not self.settings.apply_through_gulftalent or 
            emirate not in self.platforms.get(platform, {}).get("emirates_coverage", [])):
            return results
        
        # Simulate login, search, apply (implementation similar to above)
        if not self._simulate_platform_login(platform, credentials):
            self.application_log.append(ApplicationLog(
                platform=self.platforms.get(platform, {}).get("name", platform),
                job_title="N/A", company="N/A", status="Login Failed",
                application_date=datetime.now().isoformat(),
                notes="Failed to login to platform"
            ).dict())
            return results
        
        job_listings = self._simulate_job_search(platform, job_title, emirate)
        
        for job in job_listings:
            result = self._simulate_job_application(platform, job)
            results.append(result)
            self.application_log.append(ApplicationLog(
                platform=result["platform"], job_title=result["job_title"],
                company=result["company"], status="Applied" if result["success"] else "Failed",
                application_date=result["timestamp"], notes=result["message"]
            ).dict())
        
        return results
    
    def apply_on_indeed(self, job_title: str, emirate: str, credentials: Optional[PlatformCredentials] = None) -> List[Dict[str, Any]]:
        """Simulate Indeed UAE job application"""
        platform = "indeed"
        results = []
        
        if (not self.settings.apply_through_indeed or 
            emirate not in self.platforms.get(platform, {}).get("emirates_coverage", [])):
            return results
        
        # Implementation similar to previous methods
        if not self._simulate_platform_login(platform, credentials):
            self.application_log.append(ApplicationLog(
                platform=self.platforms.get(platform, {}).get("name", platform),
                job_title="N/A", company="N/A", status="Login Failed",
                application_date=datetime.now().isoformat(),
                notes="Failed to login to platform"
            ).dict())
            return results
        
        job_listings = self._simulate_job_search(platform, job_title, emirate)
        
        for job in job_listings:
            result = self._simulate_job_application(platform, job)
            results.append(result)
            self.application_log.append(ApplicationLog(
                platform=result["platform"], job_title=result["job_title"],
                company=result["company"], status="Applied" if result["success"] else "Failed",
                application_date=result["timestamp"], notes=result["message"]
            ).dict())
        
        return results
    
    def multi_platform_application(self, credentials: Optional[List[PlatformCredentials]] = None) -> Dict[str, Any]:
        """Execute applications across multiple platforms for selected roles and emirates"""
        all_results = []
        platform_stats = {}
        
        # Create credentials map for easier lookup
        cred_map = {}
        if credentials:
            for cred in credentials:
                cred_map[cred.platform] = cred
        
        # Process each job role and emirate combination
        for role in self.settings.selected_roles:
            for emirate in self.settings.selected_emirates:
                # Apply on each platform
                results = []
                
                # LinkedIn
                linkedin_results = self.apply_on_linkedin(role, emirate, cred_map.get("linkedin"))
                results.extend(linkedin_results)
                
                # Bayt
                bayt_results = self.apply_on_bayt(role, emirate, cred_map.get("bayt"))
                results.extend(bayt_results)
                
                # GulfTalent
                gulftalent_results = self.apply_on_gulftalent(role, emirate, cred_map.get("gulftalent"))
                results.extend(gulftalent_results)
                
                # Indeed
                indeed_results = self.apply_on_indeed(role, emirate, cred_map.get("indeed"))
                results.extend(indeed_results)
                
                # Add other platforms as needed
                
                # Collect results
                all_results.extend(results)
                
                # Update platform stats
                for result in results:
                    platform = result["platform"]
                    if platform not in platform_stats:
                        platform_stats[platform] = {"applied": 0, "successful": 0}
                    
                    platform_stats[platform]["applied"] += 1
                    if result["success"]:
                        platform_stats[platform]["successful"] += 1
        
        # Generate summary
        total_applications = len(all_results)
        successful_applications = sum(1 for result in all_results if result["success"])
        
        return {
            "total_applications": total_applications,
            "successful_applications": successful_applications,
            "success_rate": successful_applications / total_applications if total_applications > 0 else 0,
            "platform_stats": platform_stats,
            "application_log": self.application_log,
            "detailed_results": all_results
        } 