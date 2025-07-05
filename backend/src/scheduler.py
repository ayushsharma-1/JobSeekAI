from apscheduler.schedulers.background import BackgroundScheduler
from .scraper import scrape_jobs
import pytz

def start_scheduler():
    scheduler = BackgroundScheduler(timezone=pytz.timezone("Asia/Kolkata"))
    scheduler.add_job(scrape_jobs, 'cron', hour='10,16,22', minute=0)
    scheduler.start()
    return scheduler