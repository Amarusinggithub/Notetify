/**
 * Browser User Journey Test
 * Simulates a complete user journey through the application
 * Run: k6 run k6/tests/browser/user-journey.js
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
        ui: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
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
        browser_web_vital_cls: ['p(95)<0.1'],
        browser_web_vital_ttfb: ['p(95)<800'],
    },
};

export default async function () {
    const page = await browser.newPage();
    const baseUrl = config.client.baseUrl;
    const testUser = config.testUsers.default;

    try {
        // Step 1: Navigate to home page
        console.log('Step 1: Navigating to home page');
        await page.goto(baseUrl);
        await page.waitForLoadState('networkidle');

        check(page, {
            'home page loaded': () => page.url().includes(baseUrl),
        });

        sleep(1);

        // Step 2: Navigate to login page
        console.log('Step 2: Navigating to login page');
        await page.goto(`${baseUrl}/login`);
        await page.waitForLoadState('networkidle');

        check(page, {
            'login page loaded': () => page.url().includes('/login'),
        });

        sleep(1);

        // Step 3: Fill in login form
        console.log('Step 3: Filling login form');
        const emailInput = page.locator('input[name="email"], input[type="email"]');
        const passwordInput = page.locator('input[name="password"], input[type="password"]');

        await emailInput.fill(testUser.email);
        await passwordInput.fill(testUser.password);

        sleep(0.5);

        // Step 4: Submit login form
        console.log('Step 4: Submitting login form');
        const submitButton = page.locator('button[type="submit"]');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            submitButton.click(),
        ]);

        // Check if login was successful (should redirect to dashboard)
        check(page, {
            'logged in successfully': () =>
                page.url().includes('/dashboard') ||
                page.url().includes('/notes') ||
                !page.url().includes('/login'),
        });

        sleep(2);

        // Step 5: Navigate through the app
        console.log('Step 5: Exploring dashboard');

        // Try to find and click on notes link
        const notesLink = page.locator('a[href*="notes"], [data-testid="notes-link"]');
        if (await notesLink.count() > 0) {
            await notesLink.first().click();
            await page.waitForLoadState('networkidle');

            check(page, {
                'notes page loaded': () => page.url().includes('/notes'),
            });

            sleep(2);
        }

        // Step 6: Check for notebooks
        console.log('Step 6: Checking notebooks');
        const notebooksLink = page.locator('a[href*="notebooks"], [data-testid="notebooks-link"]');
        if (await notebooksLink.count() > 0) {
            await notebooksLink.first().click();
            await page.waitForLoadState('networkidle');

            check(page, {
                'notebooks page loaded': () => page.url().includes('/notebooks'),
            });

            sleep(2);
        }

        // Step 7: Logout
        console.log('Step 7: Logging out');
        const logoutButton = page.locator('[data-testid="logout"], button:has-text("Logout"), a:has-text("Logout")');
        if (await logoutButton.count() > 0) {
            await logoutButton.first().click();
            await page.waitForLoadState('networkidle');

            check(page, {
                'logged out successfully': () =>
                    page.url().includes('/login') || page.url() === baseUrl || page.url() === `${baseUrl}/`,
            });
        }

        console.log('User journey completed successfully');

    } catch (error) {
        console.error(`Error during user journey: ${error.message}`);
        // Take screenshot on error
        await page.screenshot({ path: 'k6/results/error-screenshot.png' });
        throw error;
    } finally {
        await page.close();
    }
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'k6/results/user-journey-summary.json': JSON.stringify(data),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
