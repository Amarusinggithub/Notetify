#!/usr/bin/env sh
set -eu

exec pnpm dev --host 0.0.0.0 --port 3000
