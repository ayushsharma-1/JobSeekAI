import logging
import random
import time
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import undetected_chromedriver as uc
from sentence_transformers import SentenceTransformer, util
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configuration
class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    CHROMEDRIVER_PATH = os.getenv("CHROMEDRIVER_PATH", "/usr/bin/chromedriver")
    JOB_TITLES = os.getenv("JOB_TITLES", "").split(",")
    KEYWORDS = os.getenv("KEYWORDS", "").split(",")

# MongoDB Setup
client = MongoClient(Config.MONGO_URI, maxPoolSize=50)
db = client["JobSeekerDB"]
collection = db["jobs"]

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# NLP Tools
stop_words = set(stopwords.words('english'))
model = SentenceTransformer('all-MiniLM-L6-v2')

def insert_job(job_data):
    try:
        if not collection.find_one({"url": job_data["url"], "scraped_at": job_data["scraped_at"]}):
            collection.insert_one(job_data)
            logger.info(f"Inserted job: {job_data['title']}")
        else:
            logger.info(f"Skipped duplicate: {job_data['title']}")
    except Exception as e:
        logger.error(f"Database error: {e}")

def scrape_jobs():
    logger.info("Starting job scraping...")
    options = uc.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    try:
        driver = uc.Chrome(options=options, driver_executable_path=Config.CHROMEDRIVER_PATH)
    except Exception as e:
        logger.error(f"Failed to initialize Chrome driver: {e}")
        return

    platforms = [
        {"name": "LinkedIn", "url": "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=India"},
        {"name": "Indeed", "url": "https://www.indeed.com/jobs?q=software%20engineer&l=India"},
        {"name": "LinkedIn", "url": "https://www.linkedin.com/jobs/search/?keywords=software%20engineer%20intern%20full%20stack%20developer%20frontend%20developer%20devops%20backend%20engineer%20data%20analyst&location=India"},
        {"name": "Wellfound", "url": "https://www.wellfound.com/jobs?role=software-engineer&role=full-stack-developer&role=frontend-developer&role=devops&role=backend-engineer&role=data-analyst&location=india"},
        {"name": "Naukri", "url": "https://www.naukri.com/software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst-jobs-in-india"},
        {"name": "Indeed", "url": "https://www.indeed.com/jobs?q=software%20engineer%20intern%20full%20stack%20developer%20frontend%20developer%20devops%20backend%20engineer%20data%20analyst&l=India"},
        {"name": "Glassdoor", "url": "https://www.glassdoor.com/Job/india-software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst-jobs-SRCH_IL.0,5_IN.1_KO.6,77.htm"},
        {"name": "Monster", "url": "https://www.monster.com/jobs/search?q=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&l=india"},
        {"name": "SimplyHired", "url": "https://www.simplyhired.com/search?q=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&l=india"},
        {"name": "ZipRecruiter", "url": "https://www.ziprecruiter.com/jobs-search?search=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&location=India"},
        {"name": "Shine", "url": "https://www.shine.com/job-search/software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst-jobs-in-india"},
        {"name": "TimesJobs", "url": "https://www.timesjobs.com/jobs-in-india/software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst-jobs"},
        {"name": "CareerBuilder", "url": "https://www.careerbuilder.com/jobs?keywords=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&location=India"},
        {"name": "JobStreet", "url": "https://www.jobstreet.com/jobs?keywords=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&location=india"},
        {"name": "Foundit", "url": "https://www.foundit.in/search/software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst-jobs-in-india"},
        {"name": "Hirect", "url": "https://hirect.in/jobs?search=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&location=India"},
        {"name": "AngelList", "url": "https://www.angellist.com/jobs?keywords=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&location=India"},
        {"name": "Dice", "url": "https://www.dice.com/jobs?q=software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst&l=India"},
        {"name": "Jooble", "url": "https://in.jooble.org/jobs/software+engineer+intern+full+stack+developer+frontend+developer+devops+backend+engineer+data+analyst/India"},
        {"name": "Internshala", "url": "https://internshala.com/internships/software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst-internship-in-india"},
        {"name": "Freshersworld", "url": "https://www.freshersworld.com/jobs-in-india/software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst"},
        {"name": "WorkIndia", "url": "https://www.workindia.in/jobs/software-engineer-intern-full-stack-developer-frontend-developer-devops-backend-engineer-data-analyst-in-india"}
    ]

    for platform in platforms:
        logger.info(f"Scraping {platform['name']}...")
        for attempt in range(3):
            try:
                driver.get(platform["url"])
                time.sleep(random.uniform(4, 8))
                soup = BeautifulSoup(driver.page_source, "html.parser")
                
                job_cards = soup.select("div[class*='job'], li[class*='job']")
                for job in job_cards[:5]:  # Limit to 5 jobs per platform for testing
                    try:
                        title = job.select_one("a[class*='title'], h3") or "N/A"
                        company = job.select_one("span[class*='company']") or "N/A"
                        date_posted = job.select_one("time") or "N/A"
                        job_url = job.select_one("a[href]") or "N/A"
                        
                        title_text = title.get_text(strip=True) if title != "N/A" else "N/A"
                        company_text = company.get_text(strip=True) if company != "N/A" else "N/A"
                        date_text = date_posted.get_text(strip=True) if date_posted != "N/A" else "N/A"
                        url_text = job_url["href"] if job_url != "N/A" else "N/A"
                        if url_text != "N/A" and not url_text.startswith("http"):
                            url_text = f"{platform['url'].split('?')[0]}/{url_text.lstrip('/')}"
                        
                        if title_text == "N/A" or not any(jt.lower() in title_text.lower() for jt in Config.JOB_TITLES):
                            continue
                        
                        description = "N/A"
                        if url_text != "N/A":
                            try:
                                driver.get(url_text)
                                time.sleep(random.uniform(3, 6))
                                desc_soup = BeautifulSoup(driver.page_source, "html.parser")
                                desc_elem = desc_soup.select_one("div[class*='description']")
                                description = desc_elem.get_text(strip=True) if desc_elem else "N/A"
                            except Exception as e:
                                logger.warning(f"Failed to fetch description: {e}")
                        
                        job_data = {
                            "platform": platform["name"],
                            "company": company_text,
                            "title": title_text,
                            "url": url_text,
                            "date_posted": date_text,
                            "description": description,
                            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
                        }
                        insert_job(job_data)
                    except Exception as e:
                        logger.error(f"Error processing job: {e}")
                break
            except Exception as e:
                logger.error(f"Retry {attempt+1}/3 for {platform['name']}: {e}")
                time.sleep(10)
        else:
            logger.error(f"Failed to scrape {platform['name']} after 3 attempts")
    
    driver.quit()
    logger.info("Scraping completed.")

if __name__ == "__main__":
    scrape_jobs()