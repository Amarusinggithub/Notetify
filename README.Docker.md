# Notetify — Docker Guide

Everything you need to bring up Notetify in dev, test, or production with
Docker Compose. For the architectural picture (services, data flow, real-time
collab) see [docs/COLLABORATION.md](docs/COLLABORATION.md).

---

## Quick start (development)

```bash
# 1. One-time setup — creates .env.development and generates secrets
bash setup.sh

# 2. Bring up the full stack
docker compose -f docker-compose.dev.yaml up -d --build
```

That's it. Services come up with healthchecks; nothing requires further
config.

---

## Project layout

```
.
├── api/                          # Laravel backend
│   ├── docker/
│   │   ├── Dockerfile            # multi-stage: development | production
│   │   ├── entrypoint.dev.sh
│   │   ├── entrypoint.prod.sh
│   │   ├── nginx/
│   │   ├── php/
│   │   └── supervisor/
│   └── .dockerignore
├── client/                       # React + Vite frontend
│   ├── docker/
│   │   ├── Dockerfile            # multi-stage: development | production
│   │   └── entrypoint.sh
│   ├── nginx/                    # used only by the prod stage
│   └── .dockerignore
├── collab/                       # Hocuspocus (Yjs CRDT) — see docs/COLLABORATION.md
│   └── docker/Dockerfile
├── docker-compose.dev.yaml       # full local stack
├── docker-compose.test.yaml      # ephemeral test stack
├── docker-compose.prod.yaml      # AWS-ready production stack
└── setup.sh                      # one-shot env + secrets bootstrap
```

Build contexts in compose are `./api`, `./client`, `./collab` — each has its
own `.dockerignore` and the Dockerfile lives in `<context>/docker/Dockerfile`.

---

## Three stacks

| Stack | File | Purpose |
|---|---|---|
| **dev** | `docker-compose.dev.yaml` | Day-to-day local work. Hot-reload, full observability (Mailpit, Seq, Telescope, Pulse). |
| **test** | `docker-compose.test.yaml` | Ephemeral. Postgres on tmpfs, Redis no-persist, `MAIL_MAILER=array`. For PHPUnit/Pest + Cypress. |
| **prod** | `docker-compose.prod.yaml` | AWS deployment. TLS via certbot, internal-only services, resource limits, JSON-file logging suitable for CloudWatch. |

The three files share service names (`db`, `redis`, `api`, etc.) — namespace
them with `-p` when running multiple stacks on the same host:

```bash
docker compose -p notetify-dev  -f docker-compose.dev.yaml  up -d
docker compose -p notetify-test -f docker-compose.test.yaml up -d
docker compose -p notetify-prod -f docker-compose.prod.yaml up -d
```

---

## Development

### Bring up

```bash
docker compose -f docker-compose.dev.yaml up -d --build
```

### Service URLs

| Service | URL |
|---|---|
| Laravel API | http://localhost:8000 |
| React client | http://localhost:3000 |
| Mailpit (mail catcher) | http://localhost:8025 |
| Seq (log search) | http://localhost:5341 |
| RustFS console | http://localhost:9001 — login `rustfs` / `rustfs-secret` |
| Telescope | http://localhost:8000/telescope |
| Pulse | http://localhost:8000/pulse |

### Common operations

```bash
# Tail one service's logs
docker compose -f docker-compose.dev.yaml logs -f api

# Tail everything
docker compose -f docker-compose.dev.yaml logs -f

# Run an artisan command
docker compose -f docker-compose.dev.yaml exec api php artisan migrate

# Composer install (pcntl/posix work here, unlike on Windows host)
docker compose -f docker-compose.dev.yaml exec api composer require some/package

# Open a shell in the API container
docker compose -f docker-compose.dev.yaml exec api sh

# Stop without losing data
docker compose -f docker-compose.dev.yaml down

# Stop and wipe volumes (Postgres, Redis, RustFS data)
docker compose -f docker-compose.dev.yaml down -v
```

---

## Test

```bash
# Bring up the backend services
docker compose -p notetify-test -f docker-compose.test.yaml up -d --build db redis api

# Run the PHPUnit/Pest suite (one-shot, exits when done)
docker compose -p notetify-test -f docker-compose.test.yaml run --rm test

# End-to-end with Cypress
docker compose -p notetify-test -f docker-compose.test.yaml --profile e2e up

# Tear down (tmpfs is wiped automatically; -v also drops vendor cache)
docker compose -p notetify-test -f docker-compose.test.yaml down -v
```

Test config notes:
- DB lives on **tmpfs** (RAM) — every `up` starts from a blank schema.
- Ports are offset (5433 / 6380 / 8001 / 3001) so the test stack never
  collides with `dev`.
- `APP_ENV=testing` flips Laravel into in-memory cache/session, sync queue,
  array mailer.

---

## Production (AWS)

### Before first deploy

1. Run `bash setup.sh --env production` and read the list of required vars.
2. Fill them in `.env.production`. Compose will refuse to start if
   `DB_PASSWORD` / `RUSTFS_KEY` / `RUSTFS_SECRET` are blank.
3. Make sure the host has TLS certs at `./certbot/conf/...` (use
   `scripts/init-letsencrypt.sh` on first run).

### Deploy

```bash
docker compose -p notetify-prod -f docker-compose.prod.yaml \
  --env-file .env.production up -d --build
```

### What's published vs internal

Only `client` exposes ports (80 / 443). Everything else (`api`,
`pulse`, `collab`, `db`, `redis`, `rustfs`) is reachable only on the internal
Docker network. nginx in `client` reverse-proxies:

- `/api/*` → `api:80`
- `/collab` → `collab:1234` (with WebSocket Upgrade headers)

Lock down the EC2 security group to allow only 80/443 ingress.

### AWS-managed alternatives

The compose file works as-is on a single EC2 host, but for real load:

| Service in compose | Managed alternative | What to change |
|---|---|---|
| `db` | RDS Postgres | Delete service, set `DB_HOST` in `.env.production` to the RDS endpoint |
| `redis` | ElastiCache Redis | Delete service, set `REDIS_HOST` |
| `rustfs` | S3 | Switch `FILESYSTEM_DISK=s3`, set `AWS_*` env vars, delete service |
| `mail` (via SES) | already SES | `MAIL_MAILER=ses` + IAM creds |
| log driver `json-file` | CloudWatch | Either run the CloudWatch agent on the host, or set logging driver to `awslogs` in compose |

### Production operations

```bash
# Logs (per service)
docker compose -p notetify-prod -f docker-compose.prod.yaml logs -f api

# Migrate after a deploy
docker compose -p notetify-prod -f docker-compose.prod.yaml exec api \
  php artisan migrate --force

# Cache config / route / view (already done by entrypoint, but if you need
# to re-trigger after a hot env change)
docker compose -p notetify-prod -f docker-compose.prod.yaml exec api \
  php artisan config:cache

# Rolling restart of a single service (zero-ish downtime via healthcheck)
docker compose -p notetify-prod -f docker-compose.prod.yaml up -d --no-deps --build api
```

---

## PHP extensions

The Dockerfile (`api/docker/Dockerfile`) installs the extensions Laravel +
Pulse need:

```
bcmath  intl  opcache  pcntl  pdo_pgsql  posix  sockets  zip
+ pecl: redis
```

To add another, edit `docker-compose.dev.yaml`'s `api/docker/Dockerfile` —
look for the `docker-php-ext-install` block. Rebuild with:

```bash
docker compose -f docker-compose.dev.yaml build --no-cache api
```

---

## Cross-architecture builds

If you build on Apple Silicon and deploy to amd64 EC2:

```bash
docker buildx build --platform=linux/amd64 \
  -t notetify-api -f api/docker/Dockerfile --target production ./api
```

---

## Resetting everything

```bash
# Dev
docker compose -f docker-compose.dev.yaml down -v --remove-orphans

# Test
docker compose -p notetify-test -f docker-compose.test.yaml down -v

# Then rerun setup
bash setup.sh
docker compose -f docker-compose.dev.yaml up -d --build
```

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `pcntl` / `posix` extension missing | You're running PHP on the host (Windows). Run composer/artisan inside the container instead — see commands above. |
| Port already in use | Another stack is up. Either bring it down, or use `-p` to namespace this one. |
| `permission denied` on `storage/` | Entrypoint runs `chown` on each up, but if you bind-mount `./api` from a Windows host, file modes don't translate. Use WSL2's native filesystem (`~/dev/Notetify`) instead of `/mnt/c/...`. |
| Compose says `services.api: Additional property deploy is not allowed` | You're on Compose v1. Upgrade to Compose v2 (`docker compose` plugin). |
| `rustfs` healthcheck failing | The `/minio/health/live` path may differ across RustFS versions — check the image's docs or swap to `wget /` in the healthcheck. |
| Mail not arriving in dev | Make sure `MAIL_HOST=mailpit` in env, then check http://localhost:8025. |

For more, see [docs/COLLABORATION.md](docs/COLLABORATION.md) and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
