#!/bin/bash

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker and Docker Compose..."
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose
  sudo systemctl start docker
  sudo systemctl enable docker
fi

# Start Docker Compose
echo "Starting application with Docker Compose..."
docker-compose up -d

echo "Application started. Backend at http://localhost:8000, Frontend at http://localhost:3000"