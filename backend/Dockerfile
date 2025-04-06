# syntax=docker/dockerfile:1
FROM python:3.13  

# Environment variables for Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install essential OS dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install Rust (if required by Python dependencies)
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y --default-toolchain stable
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Python dependencies (explicit COPY)
COPY requirements.txt .

# Cache pip dependencies installation efficiently
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install -r requirements.txt


# Create non-root user with proper permissions
ARG UID=10001
RUN adduser --disabled-password --gecos "" --uid "${UID}" appuser

# Copy the source code and set permissions explicitly
COPY . /app
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose Django port
EXPOSE 8000

# Default command to start Django development server
CMD ["python", "manage.py", "runserver"]
