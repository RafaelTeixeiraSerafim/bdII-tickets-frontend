// Dev-server proxy: forwards /api/* to the Go backend.
// The backend URL comes from the BACKEND_URL env var (loaded from .env if present).
try {
  require('dotenv').config({ quiet: true });
} catch {
  /* dotenv is optional */
}

const target = process.env.BACKEND_URL || 'http://localhost:8080';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: { '^/api': '' },
  },
};
