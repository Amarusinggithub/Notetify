#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

echo "### Starting Notetify in LOCAL PRODUCTION mode..."

# Check if local certs exist
if [ ! -f "certbot/conf/live/localhost/fullchain.pem" ]; then
    echo "### Generating local SSL certificates..."
    "$SCRIPT_DIR/generate-local-certs.sh"
fi

# Start the stack
echo "### Starting Docker containers..."
docker compose -f docker-compose.prod.yaml --env-file .env.production.local up --build

echo ""
echo "### Notetify is running at https://localhost"
echo "### (You'll see a browser warning - click 'Advanced' > 'Proceed to localhost')"
