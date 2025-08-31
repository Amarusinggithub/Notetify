import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    stages: [
        { duration: "30s", target: 20 }, // ramp up to 20 users
        { duration: "1m", target: 20 }, // stay at 20 users
        { duration: "10s", target: 0 }, // ramp down to 0
    ],
    thresholds: {
        http_req_duration: ["p(95)<500"], // 95% of requests must complete below 500ms
    },
};

export default function () {
    // Replace with your actual API endpoints
    const postData = JSON.stringify({
        title: "My awesome post",
        body: "This is the content of the post.",
    });
    const params = {
        headers: { "Content-Type": "application/json" },
    };
    const res = http.post("http://localhost:8000/api/notes", postData, params);
    check(res, { "created successfully": (r) => r.status == 201 });
    sleep(1);
}
