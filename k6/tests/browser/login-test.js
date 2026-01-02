/**
 * Browser Login Performance Test
 * Tests login page performance and functionality
 * Run: k6 run k6/tests/browser/login-test.js
 */
import { browser } from 'k6/browser';
import { check, sleep } from 'k6';

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('../../env/remote/config.js').config
    : require('../../env/local/config.js').config;

export const options = {
    scenarios: {
        login_test: {
            executor: 'shared-iterations',
            vus: 2,
            iterations: 5,
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
    thresholds: {
        browser_web_vital_lcp: ['p(95)<2000'],
        browser_web_vital_fcp: ['p(95)<1200'],
        checks: ['rate>0.9'],
    },
};

export default async function () {
    const page = await browser.newPage();
    const baseUrl = config.client.baseUrl;
    const testUser = config.testUsers.default;

    try {
        // Navigate to login page
        const startTime = Date.now();
        await page.goto(`${baseUrl}/login`);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        console.log(`Login page loaded in ${loadTime}ms`);

        check(page, {
            'login page loaded': () => page.url().includes('/login'),
            'login page loads under 3s': () => loadTime < 3000,
        });

        // Check form elements exist
        const emailInput = page.locator('input[name="email"], input[type="email"]');
        const passwordInput = page.locator('input[name="password"], input[type="password"]');
        const submitButton = page.locator('button[type="submit"]');

        check(page, {
            'email input exists': async () => (await emailInput.count()) > 0,
            'password input exists': async () => (await passwordInput.count()) > 0,
            'submit button exists': async () => (await submitButton.count()) > 0,
        });

        // Fill and submit form
        await emailInput.fill(testUser.email);
        await passwordInput.fill(testUser.password);

        sleep(0.5);

        const loginStartTime = Date.now();
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            submitButton.click(),
        ]);
        const loginTime = Date.now() - loginStartTime;

        console.log(`Login completed in ${loginTime}ms`);

        check(page, {
            'login successful': () => !page.url().includes('/login'),
            'login completes under 5s': () => loginTime < 5000,
        });

        sleep(1);

    } catch (error) {
        console.error(`Login test error: ${error.message}`);
        throw error;
    } finally {
        await page.close();
    }
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/login-test-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
