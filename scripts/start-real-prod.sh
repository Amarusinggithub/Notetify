#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

# Usage function
usage() {
    echo "Usage: $0 -d DOMAIN -e EMAIL"
    echo "  -d DOMAIN    Your domain name (e.g., example.com)"
    echo "  -e EMAIL     Your email address"
    exit 1
}

# Parse arguments
while getopts "d:e:" opt; do
    case $opt in
        d) DOMAIN="$OPTARG" ;;
        e) EMAIL="$OPTARG" ;;
        *) usage ;;
    esac
done

# Check required arguments
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    usage
fi

echo "### Starting Notetify in REAL PRODUCTION mode..."

# Check if Let's Encrypt certs exist
if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "### Setting up Let's Encrypt SSL certificates..."
    "$SCRIPT_DIR/init-letsencrypt.sh" -d "$DOMAIN" -e "$EMAIL"
fi

# Start the stack with auto-renewal
echo "### Starting Docker containers with auto-renewal..."
docker compose -f docker-compose.prod.yaml --env-file .env.production --profile production up -d

echo ""
echo "### Notetify is running at https://$DOMAIN"
echo "### Certificate auto-renewal is enabled"
