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
WORKDIR /app

RUN apt-get update \
&& apt-get install -y --no-install-recommends netcat-openbsd \
&& rm -rf /var/lib/apt/lists/*

COPY --from=builder /src/*.whl /app/
RUN pip install --no-cache-dir /app/*.whl \
 && rm -rf /app/*.whl

COPY entrypoint.dev.sh /app/
RUN chmod +x entrypoint.dev.sh

EXPOSE 8000
COPY . .
ENTRYPOINT ["sh", "./entrypoint.dev.sh"]



# production stage
FROM python:${PYTHON_VERSION}-slim AS production
WORKDIR /app

RUN apt-get update \
&& apt-get install -y --no-install-recommends netcat-openbsd \
&& rm -rf /var/lib/apt/lists/*


COPY --from=builder /src/*.whl /app/
RUN pip install --no-cache-dir /app/*.whl \
 && rm -rf /app/*.whl

COPY entrypoint.prod.sh /app/
COPY . /app/
RUN chmod +x entrypoint.prod.sh

RUN useradd -m appuser \
 && chown -R appuser /app
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl --fail http://localhost:8000/healthz || exit 1

ENTRYPOINT ["sh", "entrypoint.prod.sh"]


