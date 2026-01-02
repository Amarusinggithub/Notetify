#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

echo "### Generating self-signed certificates for local testing..."

# Create directories (now relative to project root after cd)
mkdir -p certbot/conf/live/localhost

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certbot/conf/live/localhost/privkey.pem \
  -out certbot/conf/live/localhost/fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Download recommended TLS parameters
echo "### Downloading TLS parameters..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem

echo "### Self-signed certificates generated successfully!"
echo "Location: certbot/conf/live/localhost/"
