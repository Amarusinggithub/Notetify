#!/bin/bash

cat << 'EOF'
Notetify Production Scripts
============================

Setup (run once):
  ./scripts/setup.sh                   Initialize project structure

Local Testing:
  ./scripts/start-local-prod.sh        Start with self-signed certs
  https://localhost                    Access application

Real Production:
  ./scripts/start-real-prod.sh \
    -d yourdomain.com \
    -e your@email.com                  First-time setup with Let's Encrypt

  cd /path/to/project && \
  docker compose -f docker-compose.prod.yaml \
    --env-file .env.production \
    --profile production up -d         Subsequent starts

Management:
  ./scripts/stop-prod.sh               Stop all containers
  ./scripts/logs.sh [service]          View logs (all or specific service)
  ./scripts/check-cert.sh [domain]     Check SSL certificate
  ./scripts/cleanup.sh                 Remove all containers and data

Let's Encrypt:
  ./scripts/init-letsencrypt.sh \
    -d domain.com -e email@domain.com  Setup SSL certificates

  ./scripts/init-letsencrypt.sh \
    -d domain.com -e email@domain.com -s  Test with staging server

Services:
  - api_prod        Laravel API
  - client_prod     React Frontend
  - db_prod         PostgreSQL Database
  - redis_prod      Redis Cache
  - certbot         SSL Certificate Auto-renewal

Examples:
  ./scripts/logs.sh api_prod           View API logs
  ./scripts/logs.sh client_prod        View client logs
  ./scripts/check-cert.sh localhost    Check local cert
  ./scripts/check-cert.sh yourdomain.com  Check production cert

Directory Structure:
  Notetify/
  ├── scripts/          All management scripts
  ├── api/              Laravel backend
  ├── client/           React frontend
  ├── certbot/          SSL certificates
  └── db/               Database files

EOF
