/**
 * Browser Page Load Performance Test
 * Tests page load performance for key pages
 * Run: k6 run k6/tests/browser/page-load-test.js
 */
import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Custom metrics for page load times
const homePageLoadTime = new Trend('home_page_load_time');
const loginPageLoadTime = new Trend('login_page_load_time');
const registerPageLoadTime = new Trend('register_page_load_time');

// Load config based on environment
const ENV = __ENV.K6_ENV || 'local';
const config = ENV === 'remote'
    ? require('../../env/remote/config.js').config
    : require('../../env/local/config.js').config;

export const options = {
    scenarios: {
        page_load: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 3,
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
    thresholds: {
        browser_web_vital_lcp: ['p(95)<2500'],
        browser_web_vital_fcp: ['p(95)<1500'],
        home_page_load_time: ['p(95)<3000'],
        login_page_load_time: ['p(95)<2500'],
        register_page_load_time: ['p(95)<2500'],
    },
};

export default async function () {
    const page = await browser.newPage();
    const baseUrl = config.client.baseUrl;

    try {
        // Test 1: Home page load
        console.log('Testing home page load...');
        let startTime = Date.now();
        await page.goto(baseUrl);
        await page.waitForLoadState('networkidle');
        let loadTime = Date.now() - startTime;
        homePageLoadTime.add(loadTime);

        check(page, {
            'home page loaded': () => page.url().includes(baseUrl),
            'home page has content': async () => {
                const body = page.locator('body');
                const text = await body.textContent();
                return text && text.length > 0;
            },
        });

        console.log(`Home page loaded in ${loadTime}ms`);
        sleep(1);

        // Test 2: Login page load
        console.log('Testing login page load...');
        startTime = Date.now();
        await page.goto(`${baseUrl}/login`);
        await page.waitForLoadState('networkidle');
        loadTime = Date.now() - startTime;
        loginPageLoadTime.add(loadTime);

        check(page, {
            'login page loaded': () => page.url().includes('/login'),
            'login form exists': async () => {
                const form = page.locator('form');
                return (await form.count()) > 0;
            },
        });

        console.log(`Login page loaded in ${loadTime}ms`);
        sleep(1);

        // Test 3: Register page load
        console.log('Testing register page load...');
        startTime = Date.now();
        await page.goto(`${baseUrl}/register`);
        await page.waitForLoadState('networkidle');
        loadTime = Date.now() - startTime;
        registerPageLoadTime.add(loadTime);

        check(page, {
            'register page loaded': () => page.url().includes('/register'),
            'register form exists': async () => {
                const form = page.locator('form');
                return (await form.count()) > 0;
            },
        });

        console.log(`Register page loaded in ${loadTime}ms`);
        sleep(1);

    } catch (error) {
        console.error(`Page load test error: ${error.message}`);
        throw error;
    } finally {
        await page.close();
    }
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/page-load-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
