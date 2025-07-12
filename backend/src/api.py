from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import asyncio
import logging
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from scraper import scrape_jobs

# Load environment variables
load_dotenv()

# Configuration
class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    JOB_TITLES = os.getenv("JOB_TITLES", "").split(",")
    KEYWORDS = os.getenv("KEYWORDS", "").split(",")

# MongoDB Setup
client = MongoClient(Config.MONGO_URI, maxPoolSize=50)
db = client["JobSeekerDB"]
collection = db["jobs"]
collection.create_index([("url", 1), ("scraped_at", 1)], unique=True)

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware here
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FilterRequest(BaseModel):
    title: str | None = None
    platform: str | None = None
    page: int = 1
    limit: int = 50

def insert_job(job_data):
    try:
        if not collection.find_one({"url": job_data["url"], "scraped_at": job_data["scraped_at"]}):
            collection.insert_one(job_data)
            logger.info(f"Inserted job: {job_data['title']}")
        else:
            logger.info(f"Skipped duplicate: {job_data['title']}")
    except Exception as e:
        logger.error(f"Database error: {e}")

def get_jobs(limit=50, skip=0, filters=None):
    query = {}
    if filters:
        if "title" in filters:
            query["title"] = {"$regex": filters["title"], "$options": "i"}
        if "platform" in filters:
            query["platform"] = filters["platform"]
    return list(collection.find(query, {"_id": 0}).sort("scraped_at", -1).skip(skip).limit(limit))

@app.get("/jobs")
async def list_jobs(page: int = 1, limit: int = 50, title: str | None = None, platform: str | None = None):
    skip = (page - 1) * limit
    filters = {}
    if title:
        filters["title"] = title
    if platform:
        filters["platform"] = platform
    try:
        jobs = get_jobs(limit, skip, filters)
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        return {"error": f"Failed to fetch jobs: {str(e)}"}

@app.post("/scrape")
async def trigger_scrape():
    try:
        asyncio.create_task(scrape_jobs_async())
        return {"message": "Scraping triggered successfully"}
    except Exception as e:
        logger.error(f"Failed to trigger scrape: {e}")
        return {"message": f"Failed to trigger scrape: {str(e)}"}

async def scrape_jobs_async():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, scrape_jobs)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
