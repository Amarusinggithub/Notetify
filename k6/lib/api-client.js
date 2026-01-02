import http from 'k6/http';
import { check } from 'k6';
import { getHeaders, parseJson, checkResponse, apiRequestDuration } from './helpers.js';

/**
 * API Client for Notetify endpoints
 */
export class ApiClient {
    constructor(baseUrl, token = null, xsrfToken = null) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.xsrfToken = xsrfToken;
    }

    getHeaders() {
        const headers = getHeaders(this.token);
        if (this.xsrfToken) {
            headers['X-XSRF-TOKEN'] = decodeURIComponent(this.xsrfToken);
        }
        return headers;
    }

    request(method, endpoint, body = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = { headers: this.getHeaders() };
        const start = Date.now();

        let res;
        switch (method.toUpperCase()) {
            case 'GET':
                res = http.get(url, options);
                break;
            case 'POST':
                res = http.post(url, body ? JSON.stringify(body) : null, options);
                break;
            case 'PUT':
                res = http.put(url, body ? JSON.stringify(body) : null, options);
                break;
            case 'PATCH':
                res = http.patch(url, body ? JSON.stringify(body) : null, options);
                break;
            case 'DELETE':
                res = http.del(url, null, options);
                break;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        apiRequestDuration.add(Date.now() - start);
        return res;
    }

    // Notes
    getNotes(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/api/notes?${query}` : '/api/notes';
        return this.request('GET', endpoint);
    }

    getNote(id) {
        return this.request('GET', `/api/notes/${id}`);
    }

    createNote(data) {
        const res = this.request('POST', '/api/notes', data);
        checkResponse(res, 201, 'create note');
        return res;
    }

    updateNote(id, data) {
        const res = this.request('PUT', `/api/notes/${id}`, data);
        checkResponse(res, 200, 'update note');
        return res;
    }

    deleteNote(id) {
        const res = this.request('DELETE', `/api/notes/${id}`);
        checkResponse(res, 200, 'delete note');
        return res;
    }

    // Notebooks
    getNotebooks(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/api/notebooks?${query}` : '/api/notebooks';
        return this.request('GET', endpoint);
    }

    getNotebook(id) {
        return this.request('GET', `/api/notebooks/${id}`);
    }

    createNotebook(data) {
        const res = this.request('POST', '/api/notebooks', data);
        checkResponse(res, 201, 'create notebook');
        return res;
    }

    updateNotebook(id, data) {
        const res = this.request('PUT', `/api/notebooks/${id}`, data);
        checkResponse(res, 200, 'update notebook');
        return res;
    }

    deleteNotebook(id) {
        const res = this.request('DELETE', `/api/notebooks/${id}`);
        checkResponse(res, 200, 'delete notebook');
        return res;
    }

    // Spaces
    getSpaces() {
        return this.request('GET', '/api/spaces');
    }

    createSpace(data) {
        const res = this.request('POST', '/api/spaces', data);
        checkResponse(res, 201, 'create space');
        return res;
    }

    updateSpace(id, data) {
        const res = this.request('PUT', `/api/spaces/${id}`, data);
        checkResponse(res, 200, 'update space');
        return res;
    }

    deleteSpace(id) {
        const res = this.request('DELETE', `/api/spaces/${id}`);
        checkResponse(res, 200, 'delete space');
        return res;
    }

    // Tasks
    getTasks(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/api/tasks?${query}` : '/api/tasks';
        return this.request('GET', endpoint);
    }

    createTask(data) {
        const res = this.request('POST', '/api/tasks', data);
        checkResponse(res, 201, 'create task');
        return res;
    }

    updateTask(id, data) {
        const res = this.request('PUT', `/api/tasks/${id}`, data);
        checkResponse(res, 200, 'update task');
        return res;
    }

    completeTask(id) {
        const res = this.request('PATCH', `/api/tasks/${id}/complete`);
        checkResponse(res, 200, 'complete task');
        return res;
    }

    deleteTask(id) {
        const res = this.request('DELETE', `/api/tasks/${id}`);
        checkResponse(res, 200, 'delete task');
        return res;
    }

    // Tags
    getTags() {
        return this.request('GET', '/api/tags');
    }

    createTag(data) {
        const res = this.request('POST', '/api/tags', data);
        checkResponse(res, 201, 'create tag');
        return res;
    }

    // Health check
    healthCheck() {
        const res = this.request('GET', '/api/health');
        return check(res, {
            'health check passed': (r) => r.status === 200,
        });
    }
}

export default ApiClient;
