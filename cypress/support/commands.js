// Custom commands for the email application

// Command to intercept and mock API calls
Cypress.Commands.add('mockAccountsAPI', (accounts = []) => {
  cy.intercept('GET', '/api/accounts*', {
    statusCode: 200,
    body: {
      status: true,
      accounts: accounts
    }
  }).as('getAccounts');
});

Cypress.Commands.add('mockAccountThreadsAPI', (threads = [], pagination = {}) => {
  cy.intercept('GET', '/api/account/*/threads*', {
    statusCode: 200,
    body: {
      status: true,
      data: {
        account: { email: 'test@crossmilescarrier.com' },
        threads: threads,
        pagination: pagination
      }
    }
  }).as('getAccountThreads');
});

Cypress.Commands.add('mockAddAccountAPI', (success = true, message = 'Account added successfully') => {
  cy.intercept('POST', '/api/account/add', {
    statusCode: success ? 200 : 400,
    body: {
      status: success,
      message: message,
      account: success ? { _id: 'new-account-id', email: 'new@crossmilescarrier.com' } : null
    }
  }).as('addAccount');
});

Cypress.Commands.add('mockDeleteAccountAPI', (success = true) => {
  cy.intercept('DELETE', '/api/account/*', {
    statusCode: success ? 200 : 400,
    body: {
      status: success,
      message: success ? 'Account deleted successfully' : 'Cannot delete account'
    }
  }).as('deleteAccount');
});

Cypress.Commands.add('mockSyncAccountAPI', (success = true) => {
  cy.intercept('POST', '/api/account/*/sync', {
    statusCode: success ? 200 : 400,
    body: {
      status: success,
      message: success ? 'Sync completed' : 'Sync failed',
      data: success ? { total: 25 } : null
    }
  }).as('syncAccount');
});

// Command to simulate login (since the app requires authentication)
Cypress.Commands.add('login', () => {
  // This would depend on your authentication implementation
  // For now, we'll just visit the main page
  cy.visit('/accounts');
  
  // If there's a login form, fill it out
  // cy.get('[data-testid="email-input"]').type('test@crossmilescarrier.com');
  // cy.get('[data-testid="password-input"]').type('password123');
  // cy.get('[data-testid="login-button"]').click();
  
  // Wait for navigation to complete
  cy.url().should('include', '/accounts');
});

// Command to wait for loading to finish
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]').should('not.exist');
  cy.get('.loading').should('not.exist');
  // Wait for any spinner animations to finish
  cy.get('[class*="spinner"]').should('not.exist');
});

// Command to search for accounts
Cypress.Commands.add('searchAccounts', (searchTerm) => {
  cy.get('input[placeholder*="Search accounts"]').clear().type(searchTerm);
  cy.wait('@getAccounts');
});

// Command to search for threads
Cypress.Commands.add('searchThreads', (searchTerm) => {
  cy.get('input[placeholder*="search by message-id"]').clear().type(searchTerm);
  cy.wait('@getAccountThreads');
});

// Command to add account with domain validation
Cypress.Commands.add('addAccountWithValidation', (email, shouldSucceed = true) => {
  cy.get('[data-testid="add-account-button"], button:contains("Add")').first().click();
  cy.get('input[placeholder*="Enter new email address"]').type(email);
  
  if (!shouldSucceed) {
    cy.get('p:contains("Only crossmilescarrier.com emails allowed")').should('be.visible');
    cy.get('button:contains("Add Account")').should('be.disabled');
  } else {
    cy.get('p:contains("Only crossmilescarrier.com emails allowed")').should('not.exist');
    cy.get('button:contains("Add Account")').should('not.be.disabled');
    cy.get('button:contains("Add Account")').click();
    cy.wait('@addAccount');
  }
});

// Add cypress-testing-library commands
import '@testing-library/cypress/add-commands';
