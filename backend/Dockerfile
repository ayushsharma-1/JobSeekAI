# Build stage
FROM python:3.9-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m nltk.downloader punkt stopwords

# Runtime stage
# FROM python:3.9-slim
# WORKDIR /app
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     chromium \
#     chromium-driver \
#     && rm -rf /var/lib/apt/lists/*
# COPY --from=builder /root/nltk_data /root/nltk_data
# COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
# COPY src/ .
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]