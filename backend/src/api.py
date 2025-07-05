from fastapi import FastAPI
from .db import get_jobs
from pydantic import BaseModel
import uvicorn

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)