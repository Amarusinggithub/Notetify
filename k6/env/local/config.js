// Local environment configuration
export const config = {
    api: {
        baseUrl: 'http://localhost:8000',
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
        baseUrl: 'http://localhost:5173',
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
            email: 'test@example.com',
            password: 'password123',
        },
        admin: {
            email: 'admin@example.com',
            password: 'admin123',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.01'],
        browser_web_vital_lcp: ['p(95)<2500'],
        browser_web_vital_fcp: ['p(95)<1500'],
        browser_web_vital_cls: ['p(95)<0.1'],
    },
};

export default config;
