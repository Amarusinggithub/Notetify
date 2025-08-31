import { browser } from 'k6/experimental/browser';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    'browser_web_vital_lcp': ['p(95) < 2000'], // Largest Contentful Paint should be less than 2s for 95% of users
  },
};

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto('http://localhost:3000');

    // Example: Login
    page.locator('input[name="email"]').type('test@example.com');
    page.locator('input[name="password"]').type('password123');
    await Promise.all([
      page.waitForNavigation(),
      page.locator('button[type="submit"]').click(),
    ]);

    check(page, {
      'header': page.locator('h1').textContent() == 'Dashboard',
    });

    sleep(3); // Simulate user staying on the page
  } finally {
    page.close();
  }
}
