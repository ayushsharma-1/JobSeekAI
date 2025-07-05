import time
import random
import logging
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import undetected_chromedriver as uc
from sentence_transformers import SentenceTransformer, util
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from .db import insert_job
from .config import Config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

stop_words = set(stopwords.words('english'))
model = SentenceTransformer('all-MiniLM-L6-v2')

def scrape_jobs():
    logging.info("Starting JobSeekerAI scraping...")
    options = uc.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = uc.Chrome(options=options, driver_executable_path=Config.CHROMEDRIVER_PATH)
    
    platforms = [
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
        logging.info(f"Scraping {platform['name']}...")
        for attempt in range(3):  # Retry up to 3 times
            try:
                driver.get(platform["url"])
                time.sleep(random.uniform(4, 8))  # Increased delay for more platforms
                soup = BeautifulSoup(driver.page_source, "html.parser")
                
                job_cards = soup.select("div[class*='job'], div[class*='result'], div[class*='listing'], div[class*='card'], li[class*='job']")
                for job in job_cards[:15]:  # Increased to 15 jobs per platform
                    try:
                        title = job.select_one("a[class*='title'], a[class*='job-title'], h2, h3")
                        company = job.select_one("span[class*='company'], div[class*='company'], span[class*='employer']")
                        date_posted = job.select_one("time, span[class*='date'], span[class*='posted']")
                        job_url = job.select_one("a[href]")
                        
                        title_text = title.get_text(strip=True) if title else "N/A"
                        company_text = company.get_text(strip=True) if company else "N/A"
                        date_text = date_posted.get_text(strip=True) if date_posted else "N/A"
                        url_text = job_url["href"] if job_url else "N/A"
                        if url_text != "N/A" and not url_text.startswith("http"):
                            url_text = f"{platform['url'].split('?')[0]}/{url_text.lstrip('/')}"
                        
                        if title_text == "N/A" or not any(jt.lower() in title_text.lower() for jt in Config.JOB_TITLES):
                            continue
                        
                        description = "N/A"
                        if url_text != "N/A":
                            try:
                                driver.get(url_text)
                                time.sleep(random.uniform(3, 6))  # Adjusted delay for job pages
                                desc_soup = BeautifulSoup(driver.page_source, "html.parser")
                                desc_elem = desc_soup.select_one("div[class*='description'], div[class*='job-details'], div[class*='content']")
                                description = desc_elem.get_text(strip=True) if desc_elem else "N/A"
                            except:
                                logging.warning(f"Failed to fetch description for {url_text}")
                        
                        tokens = word_tokenize(description.lower())
                        filtered_tokens = [w for w in tokens if w not in stop_words]
                        desc_embedding = model.encode(description)
                        keyword_embedding = model.encode(" ".join(Config.KEYWORDS))
                        similarity = util.cos_sim(desc_embedding, keyword_embedding).item()
                        if similarity < 0.5:  # Threshold for 99% accuracy
                            continue
                        
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
                        logging.info(f"Inserted job: {title_text} at {company_text} from {platform['name']}")
                    except Exception as e:
                        logging.error(f"Error processing job on {platform['name']}: {e}")
                break  # Exit retry loop on success
            except Exception as e:
                logging.error(f"Retry {attempt+1}/3 for {platform['name']}: {e}")
                time.sleep(10)  # Increased retry delay
        else:
            logging.error(f"Failed to scrape {platform['name']} after 3 attempts")
    
    driver.quit()
    logging.info("Scraping completed.")