#!/bin/sh
set -e

echo "Waiting for database at $DATABASE_HOST:$DATABASE_PORT…"
while ! nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  sleep 0.5
done
echo "Database is up!"


echo "Waiting for redis at $REDIS_HOST:$REDIS_PORT…"
while ! nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  sleep 0.5
done
echo "redis is up!"


python manage.py collectstatic --noinput
python manage.py makemigrations
python manage.py migrate --noinput


exec gunicorn  backend.asgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker