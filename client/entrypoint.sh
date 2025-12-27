#!/usr/bin/env sh
set -eu
#chown -R node:node /usr/src/app/

exec pnpm preview
