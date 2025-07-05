JobSeekerAI
A production-ready AI agent to scrape job listings from 8 platforms, filter them by job titles and keywords, and display them in a React dashboard.
Setup

Prerequisites:

Docker and Docker Compose
Node.js 18+
Python 3.9+
ChromeDriver (/usr/bin/chromedriver)


Clone Repository:
git clone <your-repo-url>
cd JobSeekerAI


Configure Environment:

Copy backend/.env.example to backend/.env and update MONGO_URI, JOB_TITLES, KEYWORDS.
Copy frontend/.env.example to frontend/.env and update VITE_API_URL.


Run Application:
chmod +x scripts/run.sh
./scripts/run.sh


Access:

Dashboard: http://localhost:3000
API: http://localhost:8000



Deployment

AWS EC2:

Launch an EC2 instance (e.g., t3.medium, Ubuntu 22.04).
Install Docker and Docker Compose.
Clone repo, configure .env, and run scripts/run.sh.
Expose ports 3000 (frontend) and 8000 (backend).


Heroku:

Use heroku.yml with Docker support.
Push to Heroku and set environment variables.



Customization

Update JOB_TITLES and KEYWORDS in backend/.env.
Modify CSS selectors in scraper.py for platform-specific scraping.
Add more features to the dashboard in frontend/src.

Notes

Uses undetected-chromedriver to avoid CAPTCHAs.
Runs at 10 AM, 4 PM, 10 PM IST.
MongoDB Atlas is used for storage (JobSeekerDB).
