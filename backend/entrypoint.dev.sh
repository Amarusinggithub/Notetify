#!/bin/sh

# Fail on any error
set -e

# Optional: wait for the DB to be ready (for local dev only)
# echo "Waiting for database..."
# while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
#   sleep 0.1
# done
# echo "Database is up."
python manage.py makemigrations
# Run Django migrations
python3 manage.py migrate --noinput

# Collect static files (only for production if needed)
# python3 manage.py collectstatic --noinput

# Start Django dev server
exec python3 manage.py runserver 0.0.0.0:8000
