#!/bin/bash
set -e

echo "Starting Notetify API (Development)"

# Wait for database
echo "Waiting for database..."
until nc -z db_dev 5432; do
    sleep 1
done
echo "Database is ready!"

# Wait for Redis
echo "Waiting for Redis..."
until nc -z redis_dev 6379; do
    sleep 1
done
echo "Redis is ready!"

# Install/update dependencies if needed
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction
fi

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --no-interaction
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Clear and cache config for development
echo "Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Set permissions
echo "Setting permissions..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "Notetify API is ready!"

# Start supervisor
exec "$@"
