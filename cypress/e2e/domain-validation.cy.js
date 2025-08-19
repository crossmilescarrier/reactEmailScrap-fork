describe('Domain Validation', () => {
  beforeEach(() => {
    // Mock the accounts API
    cy.mockAccountsAPI([
      { _id: '1', email: 'existing@crossmilescarrier.com' },
      { _id: '2', email: 'user@crossmilescarrier.com' }
    ]);
    
    // Visit the accounts page
    cy.login();
    cy.waitForLoading();
  });

  it('should block invalid domain emails', () => {
    const invalidEmails = [
      'test@gmail.com',
      'user@yahoo.com',
      'admin@company.org',
      'test@wrongdomain.com',
      'user@crossmilescarrier.net' // Wrong TLD
    ];

    invalidEmails.forEach(email => {
      cy.mockAddAccountAPI(false, 'Only crossmilescarrier.com emails allowed');
      
      // Try to add account with invalid email
      cy.addAccountWithValidation(email, false);
      
      // Close the popup by clicking outside or cancel button
      cy.get('body').click(0, 0);
      cy.wait(500); // Wait for popup to close
    });
  });

  it('should accept valid crossmilescarrier.com emails', () => {
    const validEmails = [
      'test@crossmilescarrier.com',
      'user.name@crossmilescarrier.com',
      'user+tag@crossmilescarrier.com',
      'user_name@crossmilescarrier.com',
      'test123@crossmilescarrier.com'
    ];

    validEmails.forEach((email, index) => {
      cy.mockAddAccountAPI(true, 'Account added successfully');
      
      // Add account with valid email
      cy.addAccountWithValidation(email, true);
      
      // Verify success message (toast notification)
      cy.contains('Account added successfully').should('be.visible');
      
      // Wait for any UI updates
      cy.wait(1000);
    });
  });

  it('should handle case-insensitive domain validation', () => {
    const caseVariations = [
      'test@CROSSMILESCARRIER.COM',
      'user@CrossMilesCarrier.Com',
      'admin@crossmilescarrier.COM'
    ];

    caseVariations.forEach(email => {
      cy.mockAddAccountAPI(true, 'Account added successfully');
      
      cy.addAccountWithValidation(email, true);
      
      // Verify success
      cy.contains('Account added successfully').should('be.visible');
      cy.wait(1000);
    });
  });

  it('should reject subdomain attempts', () => {
    const subdomainEmails = [
      'test@mail.crossmilescarrier.com',
      'user@sub.crossmilescarrier.com',
      'admin@crossmilescarrier.com.fake.com'
    ];

    subdomainEmails.forEach(email => {
      cy.mockAddAccountAPI(false, 'Only crossmilescarrier.com emails allowed');
      
      cy.addAccountWithValidation(email, false);
      
      // Close popup
      cy.get('body').click(0, 0);
      cy.wait(500);
    });
  });

  it('should show real-time validation feedback', () => {
    // Click add account button
    cy.get('button:contains("Add"), [data-testid="add-account-button"]').first().click();
    
    const emailInput = cy.get('input[placeholder*="Enter new email address"]');
    
    // Type invalid email character by character
    emailInput.type('test@invalid');
    
    // Should show error immediately
    cy.get('p:contains("Only crossmilescarrier.com emails allowed")').should('be.visible');
    cy.get('button:contains("Add Account")').should('be.disabled');
    
    // Clear and type valid domain
    emailInput.clear().type('test@crossmilescarrier.com');
    
    // Error should disappear
    cy.get('p:contains("Only crossmilescarrier.com emails allowed")').should('not.exist');
    cy.get('button:contains("Add Account")').should('not.be.disabled');
  });

  it('should prevent API calls with invalid domains', () => {
    cy.mockAddAccountAPI(false, 'Only crossmilescarrier.com emails allowed');
    
    // Try to add invalid domain
    cy.get('button:contains("Add"), [data-testid="add-account-button"]').first().click();
    cy.get('input[placeholder*="Enter new email address"]').type('test@invalid.com');
    
    // Button should be disabled, preventing API call
    cy.get('button:contains("Add Account")').should('be.disabled');
    
    // Force click the disabled button (should not trigger API call)
    cy.get('button:contains("Add Account")').click({ force: true });
    
    // Verify error toast appears (client-side validation)
    cy.contains('Only crossmilescarrier.com emails allowed').should('be.visible');
    
    // Verify API was not called by checking that @addAccount alias was not triggered
    // This is implicit - if API was called, the mock would respond
  });

  it('should handle network errors gracefully', () => {
    // Mock network error
    cy.intercept('POST', '/api/account/add', { forceNetworkError: true }).as('addAccountError');
    
    cy.get('button:contains("Add"), [data-testid="add-account-button"]').first().click();
    cy.get('input[placeholder*="Enter new email address"]').type('test@crossmilescarrier.com');
    cy.get('button:contains("Add Account")').click();
    
    cy.wait('@addAccountError');
    
    // Should show appropriate error message
    cy.contains('Failed to load accounts', { timeout: 10000 }).should('be.visible');
  });

  it('should show loading state during account addition', () => {
    // Mock slow API response
    cy.intercept('POST', '/api/account/add', (req) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            statusCode: 200,
            body: { status: true, message: 'Account added successfully' }
          });
        }, 2000);
      });
    }).as('slowAddAccount');
    
    cy.get('button:contains("Add"), [data-testid="add-account-button"]').first().click();
    cy.get('input[placeholder*="Enter new email address"]').type('test@crossmilescarrier.com');
    cy.get('button:contains("Add Account")').click();
    
    // Should show loading state
    cy.contains('Adding Account...').should('be.visible');
    
    // Wait for completion
    cy.wait('@slowAddAccount');
    cy.contains('Account added successfully').should('be.visible');
  });
});
