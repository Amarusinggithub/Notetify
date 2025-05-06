# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim AS builder

WORKDIR /app

# 1. system deps only once (cacheable)
#RUN apt-get update && apt-get install -y --no-install-recommends \
   #     build-essential gcc pkg-config libmariadb-dev && \
  #  rm -rf /var/lib/apt/lists/*

    RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        gcc \
        libssl-dev \
        pkg-config && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    # Make Cargo available in subsequent layers
    echo 'source $HOME/.cargo/env' >> /etc/profile.d/cargo.sh && \
    # Reduce image size
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
    
# 2. copy requirement manifest & install
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip wheel --no-cache-dir --no-deps -r requirements.txt

FROM python:${PYTHON_VERSION}-slim

# security: create non‑root user
RUN useradd -m -r appuser

WORKDIR /app

# install runtime deps (no build-essential, no rust)
COPY --from=builder /usr/app /usr/app        
RUN pip install --no-cache-dir /usr/app/*.whl && rm -rf /usr/app

# copy project source
COPY --chown=appuser:appuser . .

# collect static at build time (optional)
RUN python manage.py collectstatic --noinput

USER appuser

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=notetify_backend.settings

EXPOSE 8000

# health check (adjust URL/path)
HEALTHCHECK --interval=30s --timeout=3s CMD \
  curl --fail http://localhost:8000/healthz || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "notetify_backend.wsgi:application"]
