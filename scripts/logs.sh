#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

SERVICE="${1:-}"

if [ -z "$SERVICE" ]; then
    echo "### Showing logs for all services..."
    docker compose -f docker-compose.prod.yaml logs -f
else
    echo "### Showing logs for $SERVICE..."
    docker compose -f docker-compose.prod.yaml logs -f "$SERVICE"
fi
