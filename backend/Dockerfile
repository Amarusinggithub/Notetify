# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim AS builder

WORKDIR /src

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Install build dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        gcc \
        libssl-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and build wheels, caching pip downloads
ARG REQUIREMENTS_FILE

COPY ./requirements.txt ./

COPY ./$REQUIREMENTS_FILE ./

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip wheel --no-cache-dir --no-deps -r $REQUIREMENTS_FILE && \
    # Remove PyJWT wheel to avoid version conflict with djangorestframework-simplejwt
    rm -f PyJWT-*.whl



    
# development stage
FROM python:${PYTHON_VERSION}-slim AS development

# Create a non-root user and application directory
#RUN useradd -m -r appuser && \
 #   mkdir /app && \
  #  chown -R appuser:appuser /app

WORKDIR /app

# Install only the wheels built in the previous stage (PyJWT will be fetched at install time)
COPY --from=builder /src/*.whl /app/
RUN pip install --no-cache-dir /app/*.whl && \
    rm -rf /app/*.whl
  
COPY entrypoint.dev.sh .

RUN chmod +x entrypoint.dev.sh

# Copy application source code
#COPY --chown=appuser:appuser . .

COPY  . .


# Switch to non-root user
#USER appuser

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

CMD  ["sh", "entrypoint.dev.sh"]



# production stage
FROM python:${PYTHON_VERSION}-slim AS production

# Create a non-root user and application directory
#RUN useradd -m -r appuser && \
   # mkdir /app && \
   # chown -R appuser:appuser /app

WORKDIR /app

# Install only the wheels built in the previous stage (PyJWT will be fetched at install time)
COPY --from=builder /src/*.whl /app/
RUN pip install --no-cache-dir /app/*.whl && \
    rm -rf /app/*.whl

COPY entrypoint.prod.sh .

RUN chmod +x entrypoint.prod.sh

# Copy application source code
#COPY --chown=appuser:appuser . .
COPY  . .


# Switch to non-root user
#USER appuser

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Expose application port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl --fail http://localhost:8000/healthz || exit 1

CMD ["sh", "entrypoint.prod.sh"]

