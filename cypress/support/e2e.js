// Import commands.js using ES2015 syntax
import './commands';

// Alternatively you can use CommonJS syntax
// require('./commands')

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', (win) => {
  // Disable service workers to avoid caching issues in tests
  delete win.navigator.__proto__.ServiceWorker;
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // You might want to be more specific about which errors to ignore
  if (err.message.includes('ResizeObserver loop limit exceeded') ||
      err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});
