#!/bin/bash
# Install system dependencies
sudo apt-get update
sudo apt-get install -y chromium-chromedriver

# Install Python dependencies
cd backend
pip install -r requirements.txt
python -m nltk.downloader punkt stopwords

# Install Node.js dependencies
cd ../frontend
npm install

# Start MongoDB, backend, and frontend
cd ..
docker-compose up -d

# Start scheduler in a separate process
cd backend
python -c "from src.scheduler import start_scheduler; start_scheduler(); import time; while True: time.sleep(60)"