#!/bin/bash
set -e

echo "Starting Notetify API (Production)"

# Run migrations
echo "Running migrations..."
php artisan migrate --force --no-interaction

# Optimize for production
echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Set permissions
echo "Setting permissions..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "Notetify API is ready!"

# Start supervisor
exec "$@"
