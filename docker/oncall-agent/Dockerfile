FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY docker/oncall-agent/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy on-call agent source
COPY docker/oncall-agent/oncall_agent.py .

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

EXPOSE 8080

CMD ["python", "oncall_agent.py"]