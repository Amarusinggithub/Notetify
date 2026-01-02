# Notetify K6 Load Testing Suite

Performance and load testing suite for the Notetify application using [k6](https://k6.io/).

## Prerequisites

1. Install k6:
   ```bash
   # Windows (Chocolatey)
   choco install k6

   # Windows (winget)
   winget install k6

   # macOS
   brew install k6

   # Linux (Debian/Ubuntu)
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. For browser tests, k6 browser module is included (requires Chromium).

## Folder Structure

```
k6/
├── main.js                    # Main entry point (runs all tests)
├── package.json               # npm scripts for convenience
├── README.md                  # This file
├── env/
│   ├── local/
│   │   └── config.js          # Local environment configuration
│   └── remote/
│       └── config.js          # Remote/production configuration
├── lib/
│   ├── helpers.js             # Utility functions
│   ├── auth.js                # Authentication helpers
│   └── api-client.js          # API client wrapper
├── tests/
│   ├── api/
│   │   ├── smoke-test.js      # Quick sanity check
│   │   ├── load-test.js       # Normal load simulation
│   │   ├── stress-test.js     # Beyond normal load
│   │   ├── spike-test.js      # Sudden traffic spikes
│   │   └── soak-test.js       # Extended duration test
│   └── browser/
│       ├── user-journey.js    # Complete user workflow
│       ├── login-test.js      # Login performance
│       └── page-load-test.js  # Page load metrics
└── results/                   # Test results output
```

## Running Tests

### From the k6 folder

```bash
cd k6

# Run all tests (local)
npm test

# Run all tests (remote)
npm run test:remote
```

### Individual API Tests

```bash
# Smoke test - quick sanity check (30s)
npm run test:api:smoke

# Load test - normal load simulation (9 min)
npm run test:api:load

# Stress test - beyond normal load (26 min)
npm run test:api:stress

# Spike test - sudden traffic spikes (8 min)
npm run test:api:spike

# Soak test - extended duration (1+ hour)
npm run test:api:soak
```

### Individual Browser Tests

```bash
# User journey - complete workflow
npm run test:browser:journey

# Login test - login performance
npm run test:browser:login

# Page load test - page load metrics
npm run test:browser:pages
```

### Remote Environment

Add `:remote` suffix to run against remote/production:

```bash
npm run test:api:smoke:remote
npm run test:api:load:remote
npm run test:browser:journey:remote
```

### Direct k6 Commands

```bash
# Local environment
k6 run tests/api/load-test.js

# Remote environment
k6 run -e K6_ENV=remote tests/api/load-test.js

# With custom environment variables
k6 run -e K6_ENV=remote -e API_BASE_URL=https://api.example.com tests/api/load-test.js

# With more VUs
k6 run --vus 50 --duration 5m tests/api/smoke-test.js
```

## Test Types Explained

| Test Type | Purpose | Duration | VUs |
|-----------|---------|----------|-----|
| **Smoke** | Verify system works | 30s | 1 |
| **Load** | Normal traffic patterns | 9 min | 10-20 |
| **Stress** | Find breaking points | 26 min | 20-100 |
| **Spike** | Handle sudden spikes | 8 min | 10-200 |
| **Soak** | Long-term stability | 1+ hour | 20 |

## Configuration

### Local Configuration (`env/local/config.js`)

- API Base URL: `http://localhost:8000`
- Client Base URL: `http://localhost:5173`
- Test user credentials configured

### Remote Configuration (`env/remote/config.js`)

Uses environment variables:
- `API_BASE_URL` - API server URL
- `CLIENT_BASE_URL` - Frontend URL
- `TEST_USER_EMAIL` - Test user email
- `TEST_USER_PASSWORD` - Test user password

## Thresholds

Default thresholds are configured for each test:

- **API Response Time**: p(95) < 500ms, p(99) < 1000ms
- **Error Rate**: < 1%
- **Browser LCP**: p(95) < 2500ms
- **Browser FCP**: p(95) < 1500ms

## Results

Test results are saved to `k6/results/`:
- `*-summary.json` - JSON summary for CI/CD integration
- Console output includes detailed metrics

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Run k6 smoke tests
  run: |
    cd k6
    k6 run tests/api/smoke-test.js --out json=results/smoke.json

- name: Upload results
  uses: actions/upload-artifact@v3
  with:
    name: k6-results
    path: k6/results/
```

## Troubleshooting

### Browser tests not working
Ensure Chromium is available. k6 browser requires it.

### Connection refused
Make sure your local servers are running:
- API: `php artisan serve` (port 8000)
- Client: `pnpm dev` (port 5173)

### Auth failures
Check test user credentials in `env/local/config.js` match your database.
