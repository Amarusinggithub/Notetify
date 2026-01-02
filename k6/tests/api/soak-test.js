/**
 * Soak Test (Endurance Test)
 * Test system stability over extended period
 * Run: k6 run k6/tests/api/soak-test.js
 * Note: This test runs for a long time (1+ hours)
 */
import { check, sleep } from 'k6';
import { login } from '../../lib/auth.js';
import { ApiClient } from '../../lib/api-client.js';
import { generateNote, generateTask, thinkTime, parseJson } from '../../lib/helpers.js';

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('../../env/remote/config.js').config
    : require('../../env/local/config.js').config;

export const options = {
    stages: [
        { duration: '5m', target: 20 },    // Ramp up
        { duration: '1h', target: 20 },    // Sustained load for 1 hour
        { duration: '5m', target: 0 },     // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        errors: ['rate<0.05'],
    },
};

export function setup() {
    const auth = login(config.api.baseUrl, config.testUsers.default.email, config.testUsers.default.password);
    return { auth };
}

export default function (data) {
    const { auth } = data;

    if (!auth.success) {
        sleep(5);
        return;
    }

    const client = new ApiClient(config.api.baseUrl, auth.token, auth.xsrfToken);

    // Simulate realistic user session over time
    const sessionType = Math.random();

    if (sessionType < 0.5) {
        // 50% - Read-heavy session
        readHeavySession(client);
    } else if (sessionType < 0.8) {
        // 30% - Write session
        writeSession(client);
    } else {
        // 20% - Mixed session
        mixedSession(client);
    }

    // Longer think time for soak test
    thinkTime(3, 10);
}

function readHeavySession(client) {
    // Multiple reads
    for (let i = 0; i < 5; i++) {
        const notesRes = client.getNotes({ page: i + 1, per_page: 10 });
        check(notesRes, { 'paginated notes': (r) => r.status === 200 });
        thinkTime(1, 2);
    }

    client.getNotebooks();
    thinkTime(0.5, 1);

    client.getTasks();
    thinkTime(0.5, 1);

    client.getSpaces();
}

function writeSession(client) {
    // Create note
    const noteData = generateNote();
    const createRes = client.createNote(noteData);

    if (createRes.status === 201) {
        const created = parseJson(createRes);
        const noteId = created?.data?.id || created?.id;

        if (noteId) {
            thinkTime(2, 5);

            // Multiple updates (simulating editing)
            for (let i = 0; i < 3; i++) {
                client.updateNote(noteId, {
                    content: `${noteData.content}\n\nEdit ${i + 1} at ${new Date().toISOString()}`,
                });
                thinkTime(1, 3);
            }

            // Clean up
            client.deleteNote(noteId);
        }
    }
}

function mixedSession(client) {
    // Read
    const notesRes = client.getNotes();
    check(notesRes, { 'get notes': (r) => r.status === 200 });
    thinkTime(1, 2);

    // Write
    const taskData = generateTask();
    const createRes = client.createTask(taskData);

    if (createRes.status === 201) {
        const created = parseJson(createRes);
        const taskId = created?.data?.id || created?.id;

        if (taskId) {
            thinkTime(1, 2);
            client.completeTask(taskId);
            thinkTime(0.5, 1);
            client.deleteTask(taskId);
        }
    }

    // More reads
    client.getNotebooks();
    thinkTime(1, 2);
    client.getSpaces();
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/soak-test-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
