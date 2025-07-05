from pymongo import MongoClient
from .config import Config
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

client = MongoClient(Config.MONGO_URI, maxPoolSize=50)
db = client["JobSeekerDB"]
collection = db["jobs"]
collection.create_index([("url", 1), ("scraped_at", 1)], unique=True)

def insert_job(job_data):
    try:
        if not collection.find_one({"url": job_data["url"], "scraped_at": job_data["scraped_at"]}):
            collection.insert_one(job_data)
            logging.info(f"Inserted job: {job_data['title']}")
        else:
            logging.info(f"Skipped duplicate: {job_data['title']}")
    except Exception as e:
        logging.error(f"Database error: {e}")

def get_jobs(limit=50, skip=0, filters=None):
    query = {}
    if filters:
        if "title" in filters:
            query["title"] = {"$regex": filters["title"], "$options": "i"}
        if "platform" in filters:
            query["platform"] = filters["platform"]
    return list(collection.find(query).sort("scraped_at", -1).skip(skip).limit(limit))