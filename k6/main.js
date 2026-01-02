/**
 * K6 Main Entry Point
 * Runs both API and browser tests in parallel
 *
 * Usage:
 *   Local:  k6 run k6/main.js
 *   Remote: k6 run -e K6_ENV=remote k6/main.js
 *
 * For individual tests, run them directly:
 *   k6 run k6/tests/api/load-test.js
 *   k6 run k6/tests/browser/user-journey.js
 */
import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import http from 'k6/http';
import { login } from './lib/auth.js';
import { ApiClient } from './lib/api-client.js';
import { thinkTime, parseJson } from './lib/helpers.js';

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('./env/remote/config.js').config
    : require('./env/local/config.js').config;

export const options = {
    scenarios: {
        // API Load Test Scenario
        api_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 10 },
                { duration: '1m', target: 10 },
                { duration: '30s', target: 20 },
                { duration: '1m', target: 20 },
                { duration: '30s', target: 0 },
            ],
            exec: 'apiTest',
            tags: { test_type: 'api' },
        },
        // Browser Test Scenario
        browser_test: {
            executor: 'shared-iterations',
            vus: 2,
            iterations: 3,
            options: {
                browser: {
                    type: 'chromium',
                },
            },
            exec: 'browserTest',
            tags: { test_type: 'browser' },
        },
    },
    thresholds: {
        // API thresholds
        'http_req_duration{test_type:api}': ['p(95)<500', 'p(99)<1000'],
        'http_req_failed{test_type:api}': ['rate<0.01'],
        // Browser thresholds
        'browser_web_vital_lcp{test_type:browser}': ['p(95)<2500'],
        'browser_web_vital_fcp{test_type:browser}': ['p(95)<1500'],
    },
};

// Shared setup data
let authData = null;

export function setup() {
    console.log(`Running tests against ${ENV} environment`);
    console.log(`API Base URL: ${config.api.baseUrl}`);
    console.log(`Client Base URL: ${config.client.baseUrl}`);

    // Login for API tests
    const auth = login(config.api.baseUrl, config.testUsers.default.email, config.testUsers.default.password);

    if (!auth.success) {
        console.warn('Warning: Login failed during setup. Some tests may fail.');
    }

    return { auth };
}

// API Test Function
export function apiTest(data) {
    const { auth } = data;

    if (!auth || !auth.success) {
        console.error('No valid auth - skipping API test iteration');
        sleep(1);
        return;
    }

    const client = new ApiClient(config.api.baseUrl, auth.token, auth.xsrfToken);

    // Randomly select an operation
    const operations = [
        () => {
            const res = client.getNotes();
            check(res, { 'get notes': (r) => r.status === 200 });
        },
        () => {
            const res = client.getNotebooks();
            check(res, { 'get notebooks': (r) => r.status === 200 });
        },
        () => {
            const res = client.getTasks();
            check(res, { 'get tasks': (r) => r.status === 200 });
        },
        () => {
            const res = client.getSpaces();
            check(res, { 'get spaces': (r) => r.status === 200 });
        },
    ];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    operation();

    thinkTime(0.5, 1.5);
}

// Browser Test Function
export async function browserTest() {
    const page = await browser.newPage();
    const baseUrl = config.client.baseUrl;
    const testUser = config.testUsers.default;

    try {
        // Navigate to login page
        await page.goto(`${baseUrl}/login`);
        await page.waitForLoadState('networkidle');

        check(page, {
            'login page loaded': () => page.url().includes('/login'),
        });

        // Fill login form
        const emailInput = page.locator('input[name="email"], input[type="email"]');
        const passwordInput = page.locator('input[name="password"], input[type="password"]');

        if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
            await emailInput.fill(testUser.email);
            await passwordInput.fill(testUser.password);

            sleep(0.5);

            const submitButton = page.locator('button[type="submit"]');
            if ((await submitButton.count()) > 0) {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle' }),
                    submitButton.click(),
                ]);

                check(page, {
                    'login successful': () => !page.url().includes('/login'),
                });
            }
        }

        sleep(2);

    } catch (error) {
        console.error(`Browser test error: ${error.message}`);
    } finally {
        await page.close();
    }
}

export function teardown(data) {
    console.log('Test run completed');
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/combined-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
