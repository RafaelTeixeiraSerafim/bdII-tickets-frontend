// Starts the Angular dev server on the port given by FRONTEND_PORT (default 4200).
// The proxy target (BACKEND_URL) is resolved by proxy.conf.js, referenced from
// angular.json. Used by the `start` npm script.
const { spawnSync } = require('child_process');

try {
  require('dotenv').config({ quiet: true });
} catch {
  /* dotenv is optional */
}

const port = process.env.FRONTEND_PORT || '4200';

const result = spawnSync('npx', ['ng', 'serve', '--port', port], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 0);
