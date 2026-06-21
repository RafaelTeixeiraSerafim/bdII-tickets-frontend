// In dev the Angular dev-server proxy (proxy.conf.json) forwards /api to the
// Go API at http://localhost:8085. In production, serve the API behind the
// same origin under /api (e.g. via nginx) or change this value.
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
