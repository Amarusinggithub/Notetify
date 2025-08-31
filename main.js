

import apiLoadTest from "./api/scenarios/load-test.js";
import frontendJourney from "./frontend/scenarios/user-journey.js";

// 2. Configure the scenarios to run in parallel
export const options = {
    scenarios: {
        // Scenario name for the API test
        api_load: {
            executor: "ramping-vus", // Use a ramping executor for the API test
            startVUs: 0,
            stages: [
                { duration: "30s", target: 20 },
                { duration: "1m", target: 20 },
                { duration: "10s", target: 0 },
            ],
            exec: "api", // Tells k6 to run the function exported as 'api'
        },
        // Scenario name for the frontend test
        frontend_ui: {
            executor: "shared-iterations", // A suitable executor for browser tests
            options: {
                browser: {
                    type: "chromium",
                },
            },
            vus: 2, // Number of concurrent browser instances
            iterations: 5, // Total number of times to run the journey
            exec: "browser", // Tells k6 to run the function exported as 'browser'
        },
    },
    thresholds: {
        "http_req_duration{scenario:api_load}": ["p(95)<500"], // Threshold for API test only
        "browser_web_vital_lcp{scenario:frontend_ui}": ["p(95) < 2000"], // Threshold for frontend test only
    },
};

// 3. Export the functions with names that match the 'exec' properties above
export function api() {
    apiLoadTest();
}

export async function browser() {
    await frontendJourney();
}
