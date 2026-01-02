#!/bin/bash

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

echo "### Notetify Production Setup Script"
echo "### ================================"
echo ""

# Create directory structure
echo "### Creating directory structure..."
mkdir -p certbot/conf/live
mkdir -p certbot/www
mkdir -p db
mkdir -p api/docker/{nginx,php,supervisor}
mkdir -p client/nginx

# Check if db password exists
if [ ! -f "db/password.txt" ]; then
    echo ""
    echo "### Generating database password..."
    tr -dc A-Za-z0-9 </dev/urandom | head -c 32 > db/password.txt
    echo ""
    echo "Database password generated and saved to db/password.txt"
else
    echo "### Database password already exists"
fi

# Set proper permissions
chmod 600 db/password.txt

# Make scripts executable
echo "### Making scripts executable..."
chmod +x "$SCRIPT_DIR"/*.sh

# Create .env files if they don't exist
if [ ! -f ".env.production.local" ]; then
    echo ""
    echo "### Creating .env.production.local..."
    cat > .env.production.local << 'EOF'
DOMAIN=localhost
CLIENT_BASE_URL=https://localhost/api/
CLIENT_WS_ORIGIN=wss://localhost
CLIENT_URL=https://localhost/

# Database
DB_CONNECTION=pgsql
DB_HOST=db_prod
DB_PORT=5432
DB_DATABASE=notetify
DB_USERNAME=postgres

# Redis
REDIS_HOST=redis_prod
REDIS_PORT=6379

# App
APP_NAME=Notetify
APP_ENV=production
APP_DEBUG=false
APP_KEY=
APP_URL=https://localhost
EOF
fi

if [ ! -f ".env.production" ]; then
    echo ""
    echo "### Creating .env.production..."
    cat > .env.production << 'EOF'
DOMAIN=notetify.com
CLIENT_BASE_URL=https://notetify.com/api/
CLIENT_WS_ORIGIN=wss://notetify.com
CLIENT_URL=https://notetify.com/

# Database
DB_CONNECTION=pgsql
DB_HOST=db_prod
DB_PORT=5432
DB_DATABASE=notetify
DB_USERNAME=postgres

# Redis
REDIS_HOST=redis_prod
REDIS_PORT=6379

# App
APP_NAME=Notetify
APP_ENV=production
APP_DEBUG=false
APP_KEY=
APP_URL=https://notetify.com
EOF
    echo "### Remember to edit .env.production with your domain!"
fi

echo ""
echo "### Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your actual domain"
echo "2. For local testing: ./scripts/start-local-prod.sh"
echo "3. For production: ./scripts/start-real-prod.sh -d yourdomain.com -e your@email.com"
echo ""
echo "Run './scripts/help.sh' for more commands"
