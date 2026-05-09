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
docker compose -p notetify-dev  -f docker-compose.prod.local.yaml  up -d

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
| Horizon | http://localhost:8000/horizon |

Ports that are **not** browser-friendly (programmatic only — opening in a browser will look "broken"):

| Port | Protocol | Notes |
|---|---|---|
| 1025 | SMTP | Mailpit ingest. Use port 8025 for the UI. |
| 5432 | Postgres wire protocol | Connect with a SQL client, not a browser. |
| 6379 | Redis | `redis-cli`, not a browser. |
| 9000 | S3 API (RustFS) | Returns `<Error><Code>AccessDenied</Code>...</Error>` to unsigned requests — that's normal S3 behavior. Use port 9001 for the UI. |

### Common operations

```bash

# To seed database
docker compose -f docker-compose.dev.yaml exec api php artisan db:seed

# Tail one service's logs
docker compose -f docker-compose.dev.yaml logs -f api

# Tail everything
docker compose -f docker-compose.dev.yaml logs -f

# Run an artisan command
docker compose -f docker-compose.dev.yaml exec api php artisan migrate

#Run an artisan to view route list
docker compose -f docker-compose.dev.yaml exec api php artisan route:list

# Composer install (pcntl/posix work here, unlike on Windows host)
docker compose -f docker-compose.dev.yaml exec api composer require some/package

# Open a shell in the API container
docker compose -f docker-compose.dev.yaml exec api sh

# Restart a single service (after editing config or installing a provider)
docker compose -f docker-compose.dev.yaml restart api

# Rebuild + recreate one service after a Dockerfile change
docker compose -f docker-compose.dev.yaml up -d --build --force-recreate api

# Show container status + port mappings for one service
docker compose -f docker-compose.dev.yaml ps api

# Stop without losing data
docker compose -f docker-compose.dev.yaml down

# Stop and wipe volumes (Postgres, Redis, RustFS data)
docker compose -f docker-compose.dev.yaml down -v
```

### Adding a Laravel package (Telescope, Horizon, etc.)

Always run composer **inside the api container**. The Windows host PHP is a different version, missing `pcntl`/`posix`, and Windows Defender will lock files mid-install causing `Could not delete ...vendor/composer/...` errors. Inside the container, none of that applies.

```bash
# 1. Pull in the package
docker compose -f docker-compose.dev.yaml exec api composer require laravel/horizon

# 2. Run its publish command (publishes config, providers, migrations)
docker compose -f docker-compose.dev.yaml exec api php artisan horizon:install

# 3. Migrate (harmless if the package added no migrations)
docker compose -f docker-compose.dev.yaml exec api php artisan migrate

# 4. Restart api so the new service provider is picked up
docker compose -f docker-compose.dev.yaml restart api

```

If `composer require` ever fails with a PHP version constraint error (e.g. `requires php ^8.4 but your php version (8.2.x) does not satisfy`), the api Dockerfile's `ARG PHP_VERSION` is out of sync with `composer.json`'s `require.php` constraint. Bump the Dockerfile, then drop the `api_vendor` named volume so vendor reinstalls cleanly:

```bash
docker compose -f docker-compose.dev.yaml stop api
docker volume rm <project-prefix>_api_vendor   # find with `docker volume ls`
docker compose -f docker-compose.dev.yaml up -d --build api
```

### Worker services (pulse, horizon)

`pulse` and `horizon` reuse the `api` image but run a different `command:` — they're queue/aggregator workers, not HTTP services, so they don't publish ports. Their dashboards live on the api container at `/pulse` and `/horizon` respectively.

```bash
# Watch worker logs
docker compose -f docker-compose.dev.yaml logs -f horizon

# Restart a worker after editing its config
docker compose -f docker-compose.dev.yaml restart horizon
```

Horizon needs `SIGTERM` (not `SIGKILL`) to drain in-flight jobs cleanly — the compose file already sets `stop_signal: SIGTERM` and `stop_grace_period: 30s`. Don't `docker kill` it; use `docker compose stop horizon`.

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

## PHP version & extensions

The api runs **PHP 8.4** (matches `composer.json`'s `require.php` constraint). Pinned via `ARG PHP_VERSION=8.4` at the top of `api/docker/Dockerfile`. If you bump Laravel and the framework requires a newer PHP, bump this arg too — see the troubleshooting row above.

The Dockerfile installs the extensions Laravel + Pulse + Horizon need:

```
bcmath  intl  opcache  pcntl  pdo_pgsql  posix  sockets  zip
+ pecl: redis
```

To add another, edit `api/docker/Dockerfile` — look for the `docker-php-ext-install` block. Rebuild with:

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

| Symptom | Likely cause / fix |
|---|---|
| `pcntl` / `posix` extension missing | You're running PHP on the host (Windows). Run composer/artisan inside the container instead — see commands above. |
| `Could not delete ...vendor/composer/...` during `composer require` on host | Windows Defender / Search Indexer locked an extracted file mid-install. Either run composer **inside the container** (recommended), or add `C:\path\to\Notetify\api\vendor` as a Defender exclusion. |
| `composer require` fails with `requires php ^X.Y but your php version is ^Z.W` | `ARG PHP_VERSION` in `api/docker/Dockerfile` doesn't match `composer.json`'s `require.php`. Bump the arg, drop `<prefix>_api_vendor` volume, rebuild api. |
| `exec: "composer": executable file not found in $PATH` inside api container | The dev stage of `api/docker/Dockerfile` must include `COPY --from=composer:lts /usr/bin/composer /usr/local/bin/composer`. Production omits this on purpose. |
| `sh: can't open 'entrypoint.sh': No such file or directory` (loop on client) | The Dockerfile copied `entrypoint.sh` into the workdir, but the bind mount `./client:/usr/src/app` shadowed it. Fix: copy to `/usr/local/bin/entrypoint.sh` (outside the bind mount) and `ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]`. |
| Vite crashes with `EACCES: permission denied, open '...vite.config.ts.timestamp-*.mjs'` | Orphan timestamp file from a prior crash held by a Windows process (Defender, Search Indexer, VS Code). Stop the container, delete the `vite.config.ts.timestamp-*.mjs` files in `client/`, restart. Durable fix: move repo to WSL2 native filesystem (`~/dev/Notetify`). |
| Vite logs `Corepack is about to download pnpm-X.Y.Z.tgz` on every start | The Dockerfile's `RUN corepack enable` doesn't bake in a specific pnpm. Add `&& corepack prepare pnpm@<version> --activate` in the same RUN to download once at build time. |
| `localhost:3000` returns `ERR_EMPTY_RESPONSE` while the container is up | (a) Vite still starting — wait for `VITE vX.Y ready`. (b) `wslrelay.exe` is shadowing port 3000 because something inside a WSL distro is bound there. Run `wsl --shutdown` (Docker Desktop's WSL backend auto-restarts), or stop the offending process inside the distro. Verify with `Get-NetTCPConnection -LocalPort 3000 -State Listen`. |
| Seq fails to start: `No default admin password was supplied` | Set `SEQ_FIRSTRUN_NOAUTHENTICATION: "true"` (dev) or `SEQ_FIRSTRUN_ADMINPASSWORDHASH` (anywhere else) in the `seq` service env. The first-run vars only apply when `/data` is empty — wipe the `seq-data` volume after changing them. |
| Random `pensive_<name>` container appears alongside compose-managed ones | Docker Desktop's "play" button on an image starts an unmanaged container with no port mapping. `docker rm -f <name>` and bring up via compose instead. |
| Port already in use | Another stack is up, or a leftover unmanaged container is binding the port. Either bring it down, or use `-p` to namespace this stack. |
| `permission denied` on `storage/` | Entrypoint runs `chown` on each up, but if you bind-mount `./api` from a Windows host, file modes don't translate. Use WSL2's native filesystem (`~/dev/Notetify`) instead of `/mnt/c/...`. |
| Compose says `services.api: Additional property deploy is not allowed` | You're on Compose v1. Upgrade to Compose v2 (`docker compose` plugin). |
| `rustfs` healthcheck reports unhealthy / 9000 returns AccessDenied | RustFS doesn't expose `/minio/health/live` at all — the AccessDenied XML is an S3 fallthrough for any unknown path. Replace the healthcheck with one that hits a path RustFS actually serves, or do `wget --spider :9000` and accept any response. |
| Mail not arriving in dev | Make sure `MAIL_HOST=mailpit` in env, then check http://localhost:8025. Port 1025 is SMTP-only — opening it in a browser will show `ERR_INVALID_HTTP_RESPONSE`. |

For more, see [docs/COLLABORATION.md](docs/COLLABORATION.md) and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
