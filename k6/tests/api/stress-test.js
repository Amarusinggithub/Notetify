/**
 * Stress Test
 * Push the API beyond normal load to find breaking points
 * Run: k6 run k6/tests/api/stress-test.js
 */
import { check, sleep } from 'k6';
import { login } from '../../lib/auth.js';
import { ApiClient } from '../../lib/api-client.js';
import { generateNote, thinkTime, parseJson } from '../../lib/helpers.js';

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('../../env/remote/config.js').config
    : require('../../env/local/config.js').config;

export const options = {
    stages: [
        { duration: '2m', target: 20 },   // Ramp up to 20 users
        { duration: '5m', target: 20 },   // Stay at 20 users
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '5m', target: 0 },    // Ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000', 'p(99)<2000'],
        http_req_failed: ['rate<0.05'],
        errors: ['rate<0.1'],
    },
};

export function setup() {
    const auth = login(config.api.baseUrl, config.testUsers.default.email, config.testUsers.default.password);
    return { auth };
}

export default function (data) {
    const { auth } = data;

    if (!auth.success) {
        sleep(1);
        return;
    }

    const client = new ApiClient(config.api.baseUrl, auth.token, auth.xsrfToken);

    // High-frequency operations
    const operations = [
        () => {
            const res = client.getNotes({ page: 1, per_page: 20 });
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
        () => {
            const res = client.getTags();
            check(res, { 'get tags': (r) => r.status === 200 });
        },
    ];

    // Run random operations
    for (let i = 0; i < 3; i++) {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        operation();
        thinkTime(0.2, 0.5);
    }

    sleep(0.5);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/stress-test-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
