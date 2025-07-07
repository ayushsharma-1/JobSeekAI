from fastapi import FastAPI
from .db import get_jobs
from .scraper import scrape_jobs
from pydantic import BaseModel
import uvicorn
import asyncio

app = FastAPI()

class FilterRequest(BaseModel):
    title: str = None
    platform: str = None
    page: int = 1
    limit: int = 50

@app.get("/jobs")
async def list_jobs(page: int = 1, limit: int = 50, title: str = None, platform: str = None):
    skip = (page - 1) * limit
    filters = {}
    if title:
        filters["title"] = title
    if platform:
        filters["platform"] = platform
    jobs = get_jobs(limit, skip, filters)
    return {"jobs": jobs, "total": len(jobs)}

@app.post("/scrape")
async def trigger_scrape():
    try:
        loop = asyncio.get_event_loop()
        loop.run_in_executor(None, scrape_jobs)
        return {"message": "Scraping triggered successfully"}
    except Exception as e:
        return {"message": f"Failed to trigger scrape: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)