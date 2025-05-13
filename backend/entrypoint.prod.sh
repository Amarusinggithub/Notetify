#!/bin/sh

# Fail on any error
set -e

python manage.py makemigrations
# Run Django migrations
python manage.py migrate --noinput


exec gunicorn  backend.asgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker