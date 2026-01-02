/**
 * Load Test
 * Simulates normal load on the API
 * Run: k6 run k6/tests/api/load-test.js
 */
import { check, sleep } from 'k6';
import { login } from '../../lib/auth.js';
import { ApiClient } from '../../lib/api-client.js';
import { generateNote, generateNotebook, generateTask, thinkTime, parseJson } from '../../lib/helpers.js';

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('../../env/remote/config.js').config
    : require('../../env/local/config.js').config;

export const options = {
    stages: [
        { duration: '1m', target: 10 },   // Ramp up to 10 users
        { duration: '3m', target: 10 },   // Stay at 10 users
        { duration: '1m', target: 20 },   // Ramp up to 20 users
        { duration: '3m', target: 20 },   // Stay at 20 users
        { duration: '1m', target: 0 },    // Ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        errors: ['rate<0.1'],
    },
};

export function setup() {
    // Login once and share token across VUs
    const auth = login(config.api.baseUrl, config.testUsers.default.email, config.testUsers.default.password);
    return { auth };
}

export default function (data) {
    const { auth } = data;

    if (!auth.success) {
        console.error('Setup failed - no valid auth');
        sleep(1);
        return;
    }

    const client = new ApiClient(config.api.baseUrl, auth.token, auth.xsrfToken);

    // Simulate user workflow
    const workflow = Math.random();

    if (workflow < 0.4) {
        // 40% - Browse notes
        browseNotes(client);
    } else if (workflow < 0.7) {
        // 30% - Create and edit note
        createAndEditNote(client);
    } else if (workflow < 0.9) {
        // 20% - Work with tasks
        workWithTasks(client);
    } else {
        // 10% - Browse notebooks
        browseNotebooks(client);
    }

    thinkTime(1, 3);
}

function browseNotes(client) {
    // Get list of notes
    const notesRes = client.getNotes({ page: 1, per_page: 10 });
    check(notesRes, { 'notes list loaded': (r) => r.status === 200 });

    const notes = parseJson(notesRes);
    if (notes?.data?.length > 0) {
        // View a random note
        const randomNote = notes.data[Math.floor(Math.random() * notes.data.length)];
        const noteRes = client.getNote(randomNote.id);
        check(noteRes, { 'note loaded': (r) => r.status === 200 });
    }

    thinkTime(1, 2);
}

function createAndEditNote(client) {
    // Create a new note
    const noteData = generateNote();
    const createRes = client.createNote(noteData);

    if (createRes.status === 201) {
        const created = parseJson(createRes);
        const noteId = created?.data?.id || created?.id;

        if (noteId) {
            thinkTime(1, 2);

            // Update the note
            const updateData = {
                title: `${noteData.title} (Updated)`,
                content: `${noteData.content}\n\nUpdated content.`,
            };
            client.updateNote(noteId, updateData);

            thinkTime(0.5, 1);

            // Clean up - delete the note
            client.deleteNote(noteId);
        }
    }
}

function workWithTasks(client) {
    // Get tasks
    const tasksRes = client.getTasks();
    check(tasksRes, { 'tasks loaded': (r) => r.status === 200 });

    // Create a task
    const taskData = generateTask();
    const createRes = client.createTask(taskData);

    if (createRes.status === 201) {
        const created = parseJson(createRes);
        const taskId = created?.data?.id || created?.id;

        if (taskId) {
            thinkTime(0.5, 1);

            // Complete the task
            client.completeTask(taskId);

            thinkTime(0.5, 1);

            // Delete the task
            client.deleteTask(taskId);
        }
    }
}

function browseNotebooks(client) {
    // Get notebooks
    const notebooksRes = client.getNotebooks();
    check(notebooksRes, { 'notebooks loaded': (r) => r.status === 200 });

    const notebooks = parseJson(notebooksRes);
    if (notebooks?.data?.length > 0) {
        // View a random notebook
        const randomNotebook = notebooks.data[Math.floor(Math.random() * notebooks.data.length)];
        const notebookRes = client.getNotebook(randomNotebook.id);
        check(notebookRes, { 'notebook loaded': (r) => r.status === 200 });
    }

    thinkTime(1, 2);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/load-test-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
