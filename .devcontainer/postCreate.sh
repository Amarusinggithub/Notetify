#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/Notetify

# Fix ownership of the pnpm store volume (created as root by Docker)
sudo chown -R vscode:vscode /home/vscode/.pnpm-store

# Keep the pnpm store inside the container, not the mounted workspace
pnpm config set store-dir /home/vscode/.pnpm-store

if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env created from .env.example — fill in any required secrets before starting the stack."
fi

echo "✓ Dev environment ready."
echo "  API:           http://localhost:8000"
echo "  Client:        http://localhost:5173"
echo "  Mailpit:       http://localhost:8025"
echo "  Seq:           http://localhost:5341"
echo "  RustFS:        http://localhost:9001"
