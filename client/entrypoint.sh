#!/bin/sh
set -e

echo "Starting Client in Development Mode..."

exec pnpm dev --host
