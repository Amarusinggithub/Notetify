#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

# Usage function
usage() {
    echo "Usage: $0 -d DOMAIN -e EMAIL [-s]"
    echo "  -d DOMAIN    Your domain name (e.g., example.com)"
    echo "  -e EMAIL     Your email address"
    echo "  -s           Use staging server (for testing)"
    exit 1
}

# Parse arguments
STAGING=0
while getopts "d:e:s" opt; do
    case $opt in
        d) DOMAIN="$OPTARG" ;;
        e) EMAIL="$OPTARG" ;;
        s) STAGING=1 ;;
        *) usage ;;
    esac
done

# Check required arguments
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    usage
fi

STAGING_ARG=""
if [ $STAGING -eq 1 ]; then
    STAGING_ARG="--staging"
    echo "### Using Let's Encrypt staging server"
fi

echo "### Setting up Let's Encrypt for $DOMAIN..."

# Create directories
echo "### Creating directories..."
mkdir -p certbot/conf
mkdir -p certbot/www

# Download TLS parameters if not exists
if [ ! -f "certbot/conf/options-ssl-nginx.conf" ]; then
    echo "### Downloading recommended TLS parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem
fi

# Create dummy certificate
echo "### Creating dummy certificate for $DOMAIN..."
mkdir -p "certbot/conf/live/$DOMAIN"
docker compose -f docker-compose.prod.yaml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

# Start nginx
echo "### Starting nginx..."
docker compose -f docker-compose.prod.yaml up --force-recreate -d client_prod

sleep 5

# Delete dummy certificate
echo "### Deleting dummy certificate for $DOMAIN..."
docker compose -f docker-compose.prod.yaml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# Request Let's Encrypt certificate
echo "### Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose -f docker-compose.prod.yaml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    $STAGING_ARG" certbot

# Reload nginx
echo "### Reloading nginx..."
docker compose -f docker-compose.prod.yaml exec client_prod nginx -s reload

echo "### Done! Your SSL certificate is ready."
