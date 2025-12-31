#!/bin/sh
set -e

# Run any dev-specific setup here (like migrations if you want)
# php artisan migrate --force

echo "Waiting for services..."
# (You can add the nc wait loops here if you like, similar to prod)

echo "Starting Dev Server..."

# CRITICAL: Hand over control to Apache or Queue Worker
exec "$@"
