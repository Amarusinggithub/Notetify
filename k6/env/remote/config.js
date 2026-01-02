// Remote/Production environment configuration
export const config = {
    api: {
        baseUrl: __ENV.API_BASE_URL || 'https://api.notetify.com',
        endpoints: {
            health: '/api/health',
            login: '/api/auth/login',
            register: '/api/auth/register',
            logout: '/api/auth/logout',
            user: '/api/user',
            notes: '/api/notes',
            notebooks: '/api/notebooks',
            spaces: '/api/spaces',
            tasks: '/api/tasks',
            tags: '/api/tags',
            files: '/api/files',
        },
    },
    client: {
        baseUrl: __ENV.CLIENT_BASE_URL || 'https://notetify.com',
        pages: {
            home: '/',
            login: '/login',
            register: '/register',
            dashboard: '/dashboard',
            notes: '/notes',
            notebooks: '/notebooks',
            settings: '/settings',
        },
    },
    testUsers: {
        default: {
            email: __ENV.TEST_USER_EMAIL || 'loadtest@example.com',
            password: __ENV.TEST_USER_PASSWORD || 'loadtest123',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<800', 'p(99)<1500'],
        http_req_failed: ['rate<0.05'],
        browser_web_vital_lcp: ['p(95)<3000'],
        browser_web_vital_fcp: ['p(95)<2000'],
        browser_web_vital_cls: ['p(95)<0.15'],
    },
};

export default config;
