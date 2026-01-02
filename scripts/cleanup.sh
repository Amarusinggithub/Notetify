#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

echo "### WARNING: This will remove all containers, volumes, and data!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "### Cleanup cancelled."
    exit 0
fi

echo "### Stopping and removing containers..."
docker compose -f docker-compose.prod.yaml down -v

echo "### Removing generated certificates (optional)..."
read -p "Remove SSL certificates? (yes/no): " REMOVE_CERTS

if [ "$REMOVE_CERTS" = "yes" ]; then
    rm -rf certbot/conf/live
    rm -rf certbot/conf/archive
    rm -rf certbot/conf/renewal
    echo "### Certificates removed."
fi

echo "### Cleanup complete!"
