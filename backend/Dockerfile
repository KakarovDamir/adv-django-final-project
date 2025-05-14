FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1
ENV PYTHONPATH=/app:/app/cartoonix
ENV DJANGO_SETTINGS_MODULE=cartoonix.settings

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libpq-dev \
    gcc \
    g++ \
    ffmpeg \
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libxrender1 \
    libtbb-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip setuptools wheel

# Install Django, Channels, Daphne, Celery and Redis explicitly first
RUN pip install Django==5.1.3 celery==5.4.0 redis==5.2.0 channels==4.0.0 daphne==4.0.0

# Install Python dependencies
COPY requirements.txt .
COPY healthcheck_django.py /healthcheck_django.py
# Install dependencies excluding tbb package which causes issues
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create necessary directories for logs
RUN mkdir -p /app/cartoonix/logs && \
    touch /app/cartoonix/logs/api_access.log && \
    touch /app/cartoonix/logs/debug.log && \
    touch /app/cartoonix/logs/error.log

# Make sure the Django management command is executable
RUN chmod +x cartoonix/manage.py

# Run as non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Command will be specified in docker-compose.yml
