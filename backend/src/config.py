from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    CHROMEDRIVER_PATH = os.getenv("CHROMEDRIVER_PATH")
    JOB_TITLES = os.getenv("JOB_TITLES")
    KEYWORDS = os.getenv("KEYWORDS")