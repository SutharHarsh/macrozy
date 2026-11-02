
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL =
  __ENV.BASE_URL ||
  'https://api.minibet.live/engagement/api/promo/redeem';

const TOKEN = __ENV.API_TOKEN || '';

export const options = {
  // 100 total requests, one at a time.
  vus: 1,
  iterations: 100,

  // Initial performance targets; adjust to your API's SLA.
  thresholds: {
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add this only if your endpoint requires Bearer authentication.
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  // Replace {} with the actual request payload required by the API.
  const payload = JSON.stringify({});

  const response = http.post(BASE_URL, payload, {
    headers,
    timeout: '10s',
  });

  check(response, {
    'response received': (r) => r.status > 0,
    'not a server error': (r) => r.status < 500,
    'not rate limited': (r) => r.status !== 429,
  });

  console.log(
    `Request ${__ITER + 1}: status=${response.status}, ` +
    `duration=${response.timings.duration.toFixed(2)}ms`
  );

  // Avoid hammering the service between requests.
  sleep(0.2);
}
