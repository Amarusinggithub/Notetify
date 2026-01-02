import http from 'k6/http';
import { check } from 'k6';
import { getHeaders, parseJson, successfulLogins, errorRate } from './helpers.js';

/**
 * Login and get auth token/cookies
 */
export function login(baseUrl, email, password) {
    // First, get CSRF cookie (for Laravel Sanctum)
    const csrfRes = http.get(`${baseUrl}/sanctum/csrf-cookie`, {
        headers: { 'Accept': 'application/json' },
    });

    // Extract XSRF token from cookies
    const xsrfToken = csrfRes.cookies['XSRF-TOKEN']
        ? csrfRes.cookies['XSRF-TOKEN'][0].value
        : null;

    const headers = getHeaders();
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    const payload = JSON.stringify({ email, password });
    const res = http.post(`${baseUrl}/api/auth/login`, payload, { headers });

    const success = check(res, {
        'login successful': (r) => r.status === 200,
        'login returns user data': (r) => {
            const body = parseJson(r);
            return body && (body.user || body.data);
        },
    });

    if (success) {
        successfulLogins.add(1);
    } else {
        errorRate.add(1);
        console.error(`Login failed: ${res.status} - ${res.body}`);
    }

    const body = parseJson(res);
    return {
        success,
        token: body?.token || body?.access_token || null,
        user: body?.user || body?.data || null,
        cookies: res.cookies,
        xsrfToken,
    };
}

/**
 * Register a new user
 */
export function register(baseUrl, userData) {
    // Get CSRF cookie first
    const csrfRes = http.get(`${baseUrl}/sanctum/csrf-cookie`, {
        headers: { 'Accept': 'application/json' },
    });

    const xsrfToken = csrfRes.cookies['XSRF-TOKEN']
        ? csrfRes.cookies['XSRF-TOKEN'][0].value
        : null;

    const headers = getHeaders();
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    const payload = JSON.stringify(userData);
    const res = http.post(`${baseUrl}/api/auth/register`, payload, { headers });

    const success = check(res, {
        'registration successful': (r) => r.status === 201 || r.status === 200,
    });

    if (!success) {
        errorRate.add(1);
        console.error(`Registration failed: ${res.status} - ${res.body}`);
    }

    const body = parseJson(res);
    return {
        success,
        token: body?.token || body?.access_token || null,
        user: body?.user || body?.data || null,
        cookies: res.cookies,
        xsrfToken,
    };
}

/**
 * Logout user
 */
export function logout(baseUrl, token = null, xsrfToken = null) {
    const headers = getHeaders(token);
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    const res = http.post(`${baseUrl}/api/auth/logout`, null, { headers });

    check(res, {
        'logout successful': (r) => r.status === 200 || r.status === 204,
    });

    return res.status === 200 || res.status === 204;
}

/**
 * Get authenticated user
 */
export function getUser(baseUrl, token = null, xsrfToken = null) {
    const headers = getHeaders(token);
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    const res = http.get(`${baseUrl}/api/user`, { headers });

    check(res, {
        'get user successful': (r) => r.status === 200,
    });

    return parseJson(res);
}

export default {
    login,
    register,
    logout,
    getUser,
};
