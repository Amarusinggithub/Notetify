import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const successfulLogins = new Counter('successful_logins');
export const apiRequestDuration = new Trend('api_request_duration');

/**
 * Generate random string for test data
 */
export function randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate random email
 */
export function randomEmail() {
    return `test_${randomString(8)}@example.com`;
}

/**
 * Generate a unique test note
 */
export function generateNote() {
    return {
        title: `Test Note ${randomString(6)}`,
        content: `This is test content created at ${new Date().toISOString()}`,
    };
}

/**
 * Generate a unique test notebook
 */
export function generateNotebook() {
    return {
        name: `Test Notebook ${randomString(6)}`,
    };
}

/**
 * Generate a unique test task
 */
export function generateTask() {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    return {
        title: `Test Task ${randomString(6)}`,
        description: 'Test task description',
        type: 'todo',
        priority: 'medium',
        due_at: dueDate.toISOString(),
    };
}

/**
 * Sleep with random jitter to simulate realistic user behavior
 */
export function thinkTime(min = 1, max = 3) {
    const duration = min + Math.random() * (max - min);
    sleep(duration);
}

/**
 * Get default headers for API requests
 */
export function getHeaders(token = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Check common response attributes
 */
export function checkResponse(res, expectedStatus = 200, name = 'request') {
    const checks = {};
    checks[`${name} status is ${expectedStatus}`] = (r) => r.status === expectedStatus;
    checks[`${name} has body`] = (r) => r.body && r.body.length > 0;

    const result = check(res, checks);
    errorRate.add(!result);

    return result;
}

/**
 * Parse JSON response safely
 */
export function parseJson(res) {
    try {
        return JSON.parse(res.body);
    } catch (e) {
        console.error('Failed to parse JSON response:', e.message);
        return null;
    }
}

export default {
    randomString,
    randomEmail,
    generateNote,
    generateNotebook,
    generateTask,
    thinkTime,
    getHeaders,
    checkResponse,
    parseJson,
    errorRate,
    successfulLogins,
    apiRequestDuration,
};
