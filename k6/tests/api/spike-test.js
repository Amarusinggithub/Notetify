/**
 * Spike Test
 * Test how the system handles sudden spikes in traffic
 * Run: k6 run k6/tests/api/spike-test.js
 */
import { check, sleep } from 'k6';
import { login } from '../../lib/auth.js';
import { ApiClient } from '../../lib/api-client.js';
import { thinkTime } from '../../lib/helpers.js';

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('../../env/remote/config.js').config
    : require('../../env/local/config.js').config;

export const options = {
    stages: [
        { duration: '1m', target: 10 },    // Warm up
        { duration: '30s', target: 100 },  // Spike to 100 users
        { duration: '1m', target: 100 },   // Stay at spike
        { duration: '30s', target: 10 },   // Scale down
        { duration: '2m', target: 10 },    // Recovery period
        { duration: '30s', target: 200 },  // Second spike to 200 users
        { duration: '1m', target: 200 },   // Stay at spike
        { duration: '1m', target: 0 },     // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.1'],
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

    // Simulate quick page loads
    const notesRes = client.getNotes();
    check(notesRes, { 'notes loaded during spike': (r) => r.status === 200 });

    thinkTime(0.1, 0.3);

    const notebooksRes = client.getNotebooks();
    check(notebooksRes, { 'notebooks loaded during spike': (r) => r.status === 200 });

    sleep(0.5);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/spike-test-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
