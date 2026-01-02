#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

DOMAIN="${1:-localhost}"

echo "### Checking SSL certificate for $DOMAIN..."

if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "### Certificate not found for $DOMAIN"
    exit 1
fi

echo ""
echo "Certificate Details:"
echo "==================="
openssl x509 -in "certbot/conf/live/$DOMAIN/fullchain.pem" -noout -text | grep -E "(Issuer:|Subject:|Not Before|Not After)"

echo ""
echo "Certificate Expiry:"
echo "==================="
openssl x509 -in "certbot/conf/live/$DOMAIN/fullchain.pem" -noout -dates
