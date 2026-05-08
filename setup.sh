#!/usr/bin/env bash
# =============================================================================
# Notetify — Setup Wizard
# Run once before first `docker compose up -d` to prepare the environment.
#
# Usage:
#   bash setup.sh                       # defaults to development
#   bash setup.sh --env development
#   bash setup.sh --env production
#   bash setup.sh --env test
#
# What it does:
#   - Verifies docker, docker compose, and openssl are installed
#   - Creates the right .env file from .env.example if missing
#   - Auto-generates secrets for dev/test (APP_KEY, COLLAB_JWT_SECRET,
#     COLLAB_WEBHOOK_SECRET)
#   - Refuses to auto-generate prod secrets — prints the list to set manually
#   - Scans for unfilled placeholders and warns
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── Locate project root (the directory this script lives in) ────────────────
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# ── Parse arguments ─────────────────────────────────────────────────────────
ENV="development"

while [[ $# -gt 0 ]]; do
  case $1 in
    --env) ENV="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,18p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *) error "Unknown argument: $1"; exit 1 ;;
  esac
done

case "$ENV" in
  development) ENV_FILE=".env.development"; COMPOSE_FILE="docker-compose.dev.yaml" ;;
  production)  ENV_FILE=".env.production";  COMPOSE_FILE="docker-compose.prod.yaml" ;;
  test)        ENV_FILE=".env.testing";     COMPOSE_FILE="docker-compose.test.yaml" ;;
  *) error "Invalid --env. Use: development | production | test"; exit 1 ;;
esac

echo
echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  Notetify — Setup Wizard (${ENV})${NC}"
echo -e "${BLUE}=================================================${NC}"
echo

# ── Required tools ──────────────────────────────────────────────────────────
info "Checking required tools..."
MISSING=()
for tool in docker openssl; do
  command -v "$tool" &>/dev/null || MISSING+=("$tool")
done
if ! docker compose version &>/dev/null && ! command -v docker-compose &>/dev/null; then
  MISSING+=("docker-compose")
fi
if (( ${#MISSING[@]} > 0 )); then
  error "Missing required tools: ${MISSING[*]}"
  exit 1
fi
success "All required tools found."

# ── Env file ────────────────────────────────────────────────────────────────
info "Checking ${ENV_FILE}..."
if [[ -f "$ENV_FILE" ]]; then
  warn "${ENV_FILE} already exists — leaving it alone."
  warn "Delete it first if you want to regenerate from .env.example."
else
  if [[ ! -f ".env.example" ]]; then
    error ".env.example not found. Are you in the project root?"
    exit 1
  fi
  cp .env.example "$ENV_FILE"
  success "Created ${ENV_FILE} from .env.example."
fi

# ── Helper: replace a value in $ENV_FILE only if its current value is the
#    placeholder we expect. Avoids clobbering anything the user already set.
replace_if_placeholder() {
  local key="$1" placeholder="$2" new_value="$3"
  if grep -qE "^${key}=${placeholder}\$" "$ENV_FILE"; then
    # Use a sed delimiter that doesn't appear in base64/hex output
    sed -i.bak "s|^${key}=${placeholder}\$|${key}=${new_value}|" "$ENV_FILE"
    rm -f "${ENV_FILE}.bak"
    return 0
  fi
  return 1
}

# Same but blanks (KEY= with no value)
replace_if_blank() {
  local key="$1" new_value="$2"
  if grep -qE "^${key}=\$" "$ENV_FILE"; then
    sed -i.bak "s|^${key}=\$|${key}=${new_value}|" "$ENV_FILE"
    rm -f "${ENV_FILE}.bak"
    return 0
  fi
  return 1
}

# ── Auto-generate secrets (dev/test only) ───────────────────────────────────
if [[ "$ENV" != "production" ]]; then
  info "Generating secrets for ${ENV}..."

  # Laravel APP_KEY — base64-encoded 32 bytes, prefixed with "base64:"
  APP_KEY="base64:$(openssl rand -base64 32)"
  if replace_if_blank "APP_KEY" "$APP_KEY"; then
    success "Generated APP_KEY."
  elif grep -qE "^APP_KEY=base64:" "$ENV_FILE"; then
    success "APP_KEY already set."
  else
    warn "APP_KEY exists but isn't a base64 key — leaving it alone."
  fi

  # Collab JWT secret
  COLLAB_JWT=$(openssl rand -hex 32)
  if replace_if_placeholder "COLLAB_JWT_SECRET" "change-me-to-openssl-rand-hex-32" "$COLLAB_JWT" \
     || replace_if_blank "COLLAB_JWT_SECRET" "$COLLAB_JWT"; then
    success "Generated COLLAB_JWT_SECRET."
  else
    success "COLLAB_JWT_SECRET already set."
  fi

  # Collab webhook secret (Hocuspocus -> Laravel)
  COLLAB_WH=$(openssl rand -hex 32)
  if replace_if_placeholder "COLLAB_WEBHOOK_SECRET" "change-me-to-openssl-rand-hex-32" "$COLLAB_WH" \
     || replace_if_blank "COLLAB_WEBHOOK_SECRET" "$COLLAB_WH"; then
    success "Generated COLLAB_WEBHOOK_SECRET."
  else
    success "COLLAB_WEBHOOK_SECRET already set."
  fi

  # DB password — only fill if blank in dev/test
  if grep -qE "^DB_PASSWORD=\$" "$ENV_FILE"; then
    replace_if_blank "DB_PASSWORD" "postgres"
    success "Set DB_PASSWORD=postgres (dev default)."
  fi
fi

# ── Production: refuse to auto-generate, list required values ────────────────
if [[ "$ENV" == "production" ]]; then
  warn "Production secrets are NOT auto-generated. You MUST set the following"
  warn "in ${ENV_FILE} before bringing up the stack:"
  cat <<EOF

    APP_KEY                  # generate: php artisan key:generate --show
                             # or:      echo "base64:\$(openssl rand -base64 32)"
    DB_PASSWORD              # strong random — used by Postgres + Laravel
    COLLAB_JWT_SECRET        # openssl rand -hex 32
    COLLAB_WEBHOOK_SECRET    # openssl rand -hex 32
    RUSTFS_KEY               # S3-style access key for RustFS
    RUSTFS_SECRET            # openssl rand -hex 32
    APP_URL                  # https://your-domain.example
    CLIENT_BASE_URL          # https://your-domain.example/api/
    CLIENT_WS_ORIGIN         # wss://your-domain.example
    CLIENT_URL               # https://your-domain.example/
    SANCTUM_STATEFUL_DOMAINS # your-domain.example

    # Mail (SES is recommended on AWS):
    MAIL_MAILER=ses
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY
    AWS_DEFAULT_REGION
    MAIL_FROM_ADDRESS

EOF
fi

# ── Scan for leftover placeholders ───────────────────────────────────────────
info "Scanning ${ENV_FILE} for unfilled placeholders..."
PLACEHOLDERS=$(grep -nE "=(your-|change-me|example\.com|YOUR_|<.*>)" "$ENV_FILE" || true)
if [[ -n "$PLACEHOLDERS" ]]; then
  warn "Values still need attention:"
  echo "$PLACEHOLDERS" | while IFS= read -r line; do
    warn "  $line"
  done
else
  success "No obvious placeholders left."
fi

# ── Done ────────────────────────────────────────────────────────────────────
echo
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}=================================================${NC}"
echo

case "$ENV" in
  development)
    echo -e "  Start:  ${BLUE}docker compose -f ${COMPOSE_FILE} up -d --build${NC}"
    echo -e "  Logs:   ${BLUE}docker compose -f ${COMPOSE_FILE} logs -f${NC}"
    echo -e "  Stop:   ${BLUE}docker compose -f ${COMPOSE_FILE} down${NC}"
    echo
    echo -e "  Services:"
    echo -e "    API           http://localhost:8000"
    echo -e "    Client        http://localhost:3000"
    echo -e "    Mailpit UI    http://localhost:8025"
    echo -e "    Seq UI        http://localhost:5341"
    echo -e "    RustFS UI     http://localhost:9001"
    echo -e "    Telescope     http://localhost:8000/telescope"
    echo -e "    Pulse         http://localhost:8000/pulse"
    ;;
  production)
    echo -e "  Start:  ${BLUE}docker compose -p notetify-prod -f ${COMPOSE_FILE} --env-file ${ENV_FILE} up -d --build${NC}"
    echo -e "  Stop:   ${BLUE}docker compose -p notetify-prod -f ${COMPOSE_FILE} down${NC}"
    echo
    echo -e "  ${YELLOW}Reminder:${NC} fill in the production values listed above"
    echo -e "  ${YELLOW}before${NC} starting the stack — Compose will refuse to boot"
    echo -e "  with empty DB_PASSWORD / RUSTFS_KEY / RUSTFS_SECRET."
    ;;
  test)
    echo -e "  Backend tests:"
    echo -e "    ${BLUE}docker compose -p notetify-test -f ${COMPOSE_FILE} up -d --build db redis api${NC}"
    echo -e "    ${BLUE}docker compose -p notetify-test -f ${COMPOSE_FILE} run --rm test${NC}"
    echo
    echo -e "  E2E (Cypress):"
    echo -e "    ${BLUE}docker compose -p notetify-test -f ${COMPOSE_FILE} --profile e2e up${NC}"
    echo
    echo -e "  Tear down:"
    echo -e "    ${BLUE}docker compose -p notetify-test -f ${COMPOSE_FILE} down -v${NC}"
    ;;
esac
echo
