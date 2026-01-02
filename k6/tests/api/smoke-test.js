/**
 * Smoke Test
 * Quick sanity check to verify the API is working
 * Run: k6 run k6/tests/api/smoke-test.js
 */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { login } from '../../lib/auth.js';
import { ApiClient } from '../../lib/api-client.js';
import { thinkTime } from '../../lib/helpers.js';

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('../../env/remote/config.js').config
    : require('../../env/local/config.js').config;

export const options = {
    vus: 1,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.1'],
    },
};

export default function () {
    const baseUrl = config.api.baseUrl;

    // Test 1: Health check (unauthenticated)
    const healthRes = http.get(`${baseUrl}/api/health`);
    check(healthRes, {
        'health endpoint returns 200': (r) => r.status === 200,
    });
    thinkTime(0.5, 1);

    // Test 2: Login
    const auth = login(baseUrl, config.testUsers.default.email, config.testUsers.default.password);
    if (!auth.success) {
        console.error('Login failed, skipping authenticated tests');
        return;
    }
    thinkTime(0.5, 1);

    // Test 3: Authenticated requests
    const client = new ApiClient(baseUrl, auth.token, auth.xsrfToken);

    // Get notes
    const notesRes = client.getNotes();
    check(notesRes, {
        'get notes returns 200': (r) => r.status === 200,
    });
    thinkTime(0.5, 1);

    // Get notebooks
    const notebooksRes = client.getNotebooks();
    check(notebooksRes, {
        'get notebooks returns 200': (r) => r.status === 200,
    });
    thinkTime(0.5, 1);

    // Get tasks
    const tasksRes = client.getTasks();
    check(tasksRes, {
        'get tasks returns 200': (r) => r.status === 200,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
