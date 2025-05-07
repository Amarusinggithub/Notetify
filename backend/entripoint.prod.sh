#!/bin/sh

# Fail on any error
set -e

python manage.py makemigrations
# Run Django migrations
python3 manage.py migrate --noinput


exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --worker-class uvicorn.workers.UvicornWorker