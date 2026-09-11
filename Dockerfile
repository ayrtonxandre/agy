# ==============================================================================
# ATHX 2027 / AGY — Docker Container Definition
# ==============================================================================
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    TZ=Europe/Paris \
    PORT=8080 \
    AGY_DATA_DIR=/app/data

# Install lightweight system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    tzdata \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (leverages Docker layer caching)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . /app/

# Set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /app/athx 2>/dev/null || true

# Prepare seed directory for volume initialisation
RUN mkdir -p /app/seed /app/data && \
    cp -r *.csv *.json *.html garmin_tokens calendar_data hae_token.txt credentials.json* /app/seed/ 2>/dev/null || true

# Expose web service & webhook port
EXPOSE 8080

# Healthcheck for Docker & SWAG container monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["python3", "orchestrator.py", "serve"]
