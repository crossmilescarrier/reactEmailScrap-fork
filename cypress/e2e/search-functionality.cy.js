describe('Search Functionality', () => {
  const mockAccounts = [
    { _id: '1', email: 'john@crossmilescarrier.com' },
    { _id: '2', email: 'jane@crossmilescarrier.com' },
    { _id: '3', email: 'manager@crossmilescarrier.com' },
    { _id: '4', email: 'admin@crossmilescarrier.com' }
  ];

  const mockThreads = [
    {
      _id: 'thread1',
      subject: 'Important Meeting Agenda',
      from: 'john@example.com',
      to: 'test@crossmilescarrier.com',
      date: '2024-01-15T10:00:00Z',
      emailCount: 3,
      emails: [{ _id: 'email1', textBlocks: ['Meeting scheduled for tomorrow at 10 AM'] }]
    },
    {
      _id: 'thread2',
      subject: 'Project Update Status',
      from: 'manager@example.com',
      to: 'test@crossmilescarrier.com',
      date: '2024-01-14T15:30:00Z',
      emailCount: 2,
      emails: [{ _id: 'email2', textBlocks: ['Project is on track for delivery'] }]
    },
    {
      _id: 'thread3',
      subject: 'Weekly Report',
      from: 'admin@example.com',
      to: 'test@crossmilescarrier.com',
      date: '2024-01-13T09:15:00Z',
      messageId: '<weekly-report-123@gmail.com>',
      emailCount: 1,
      emails: [{ _id: 'email3', textBlocks: ['This weeks performance summary'] }]
    }
  ];

  describe('Account Search', () => {
    beforeEach(() => {
      cy.mockAccountsAPI(mockAccounts);
      cy.login();
      cy.waitForLoading();
    });

    it('should search accounts by partial text', () => {
      // Mock search results for 'john'
      cy.mockAccountsAPI([mockAccounts[0]]); // Only John's account
      
      cy.searchAccounts('john');
      
      // Should show only John's account
      cy.contains('john@crossmilescarrier.com').should('be.visible');
      cy.contains('jane@crossmilescarrier.com').should('not.exist');
      cy.contains('manager@crossmilescarrier.com').should('not.exist');
    });

    it('should handle case-insensitive search', () => {
      cy.mockAccountsAPI([mockAccounts[2]]); // Manager account
      
      cy.searchAccounts('MANAGER');
      
      cy.contains('manager@crossmilescarrier.com').should('be.visible');
      cy.contains('john@crossmilescarrier.com').should('not.exist');
    });

    it('should search by email domain', () => {
      cy.mockAccountsAPI(mockAccounts); // All accounts
      
      cy.searchAccounts('@crossmilescarrier.com');
      
      // Should show all accounts with that domain
      cy.contains('john@crossmilescarrier.com').should('be.visible');
      cy.contains('jane@crossmilescarrier.com').should('be.visible');
      cy.contains('manager@crossmilescarrier.com').should('be.visible');
    });

    it('should show no results message for non-existent search', () => {
      cy.mockAccountsAPI([]); // Empty results
      
      cy.searchAccounts('nonexistent');
      
      cy.contains('No email accounts found').should('be.visible');
    });

    it('should clear search and show all accounts', () => {
      // First search
      cy.mockAccountsAPI([mockAccounts[0]]);
      cy.searchAccounts('john');
      cy.contains('john@crossmilescarrier.com').should('be.visible');
      
      // Clear search
      cy.mockAccountsAPI(mockAccounts);
      cy.get('input[placeholder*="Search accounts"]').clear();
      cy.wait('@getAccounts');
      
      // Should show all accounts again
      cy.contains('john@crossmilescarrier.com').should('be.visible');
      cy.contains('jane@crossmilescarrier.com').should('be.visible');
      cy.contains('manager@crossmilescarrier.com').should('be.visible');
    });

    it('should debounce search queries', () => {
      const searchInput = cy.get('input[placeholder*="Search accounts"]');
      
      // Type multiple characters quickly
      searchInput.type('j');
      searchInput.type('o');
      searchInput.type('h');
      searchInput.type('n');
      
      // Should only make one API call after debounce delay
      cy.wait('@getAccounts', { timeout: 1000 });
      
      // Verify the final search term was used
      cy.get('@getAccounts').should('have.been.calledOnce');
    });
  });

  describe('Thread Search', () => {
    beforeEach(() => {
      cy.mockAccountsAPI(mockAccounts);
      cy.mockAccountThreadsAPI(mockThreads, { page: 1, limit: 20, total: 3, pages: 1 });
      
      // Visit a specific account's threads
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
    });

    it('should search threads by subject', () => {
      // Mock search results for 'meeting'
      cy.mockAccountThreadsAPI([mockThreads[0]], { page: 1, limit: 20, total: 1, pages: 1 });
      
      cy.searchThreads('meeting');
      
      cy.contains('Important Meeting Agenda').should('be.visible');
      cy.contains('Project Update Status').should('not.exist');
      cy.contains('Weekly Report').should('not.exist');
      
      // Should show search results count
      cy.contains('1 result found').should('be.visible');
    });

    it('should search threads by sender', () => {
      cy.mockAccountThreadsAPI([mockThreads[1]], { page: 1, limit: 20, total: 1, pages: 1 });
      
      cy.searchThreads('manager@example.com');
      
      cy.contains('Project Update Status').should('be.visible');
      cy.contains('manager@example.com').should('be.visible');
    });

    it('should search threads by message ID', () => {
      cy.mockAccountThreadsAPI([mockThreads[2]], { page: 1, limit: 20, total: 1, pages: 1 });
      
      cy.searchThreads('<weekly-report-123@gmail.com>');
      
      cy.contains('Weekly Report').should('be.visible');
    });

    it('should handle case-insensitive thread search', () => {
      cy.mockAccountThreadsAPI([mockThreads[0]], { page: 1, limit: 20, total: 1, pages: 1 });
      
      cy.searchThreads('IMPORTANT');
      
      cy.contains('Important Meeting Agenda').should('be.visible');
    });

    it('should show search results count', () => {
      cy.mockAccountThreadsAPI(mockThreads.slice(0, 2), { page: 1, limit: 20, total: 2, pages: 1 });
      
      cy.searchThreads('project');
      
      cy.contains('2 results found').should('be.visible');
    });

    it('should clear thread search with X button', () => {
      // First search
      cy.mockAccountThreadsAPI([mockThreads[0]], { page: 1, limit: 20, total: 1, pages: 1 });
      cy.searchThreads('meeting');
      
      // Click clear button
      cy.get('button[title="Clear search"]').click();
      
      // Should clear search input
      cy.get('input[placeholder*="search by message-id"]').should('have.value', '');
      
      // Mock all threads again
      cy.mockAccountThreadsAPI(mockThreads, { page: 1, limit: 20, total: 3, pages: 1 });
      cy.wait('@getAccountThreads');
    });

    it('should clear search results with "Clear search" link', () => {
      // First search
      cy.mockAccountThreadsAPI([mockThreads[0]], { page: 1, limit: 20, total: 1, pages: 1 });
      cy.searchThreads('meeting');
      
      // Should show search results badge with clear link
      cy.contains('1 result found').should('be.visible');
      cy.get('button:contains("Clear search")').click();
      
      // Should clear search
      cy.get('input[placeholder*="search by message-id"]').should('have.value', '');
    });

    it('should show no results message when no threads found', () => {
      cy.mockAccountThreadsAPI([], { page: 1, limit: 20, total: 0, pages: 0 });
      
      cy.searchThreads('nonexistent');
      
      cy.contains('No emails found').should('be.visible');
    });

    it('should maintain search within same tab', () => {
      // Search in INBOX
      cy.mockAccountThreadsAPI([mockThreads[0]], { page: 1, limit: 20, total: 1, pages: 1 });
      cy.searchThreads('meeting');
      
      // Verify search is active
      cy.get('input[placeholder*="search by message-id"]').should('have.value', 'meeting');
      cy.contains('Important Meeting Agenda').should('be.visible');
    });

    it('should clear search when switching tabs', () => {
      // Search in INBOX
      cy.searchThreads('meeting');
      cy.get('input[placeholder*="search by message-id"]').should('have.value', 'meeting');
      
      // Switch to SENT tab
      cy.mockAccountThreadsAPI([], { page: 1, limit: 20, total: 0, pages: 0 });
      cy.contains('Sent').click();
      
      // Search should be cleared
      cy.get('input[placeholder*="search by message-id"]').should('have.value', '');
    });
  });

  describe('Search Error Handling', () => {
    beforeEach(() => {
      cy.mockAccountsAPI(mockAccounts);
      cy.login();
      cy.waitForLoading();
    });

    it('should handle search API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/accounts*', { statusCode: 500, body: { error: 'Server error' } }).as('searchError');
      
      cy.get('input[placeholder*="Search accounts"]').type('search');
      cy.wait('@searchError');
      
      // Should show error message
      cy.contains('Failed to load accounts').should('be.visible');
    });

    it('should handle network errors during search', () => {
      cy.intercept('GET', '/api/accounts*', { forceNetworkError: true }).as('networkError');
      
      cy.get('input[placeholder*="Search accounts"]').type('search');
      cy.wait('@networkError');
      
      cy.contains('Failed to load accounts').should('be.visible');
    });

    it('should show loading state during search', () => {
      // Mock slow search API
      cy.intercept('GET', '/api/accounts*', (req) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              statusCode: 200,
              body: { status: true, accounts: [mockAccounts[0]] }
            });
          }, 2000);
        });
      }).as('slowSearch');
      
      cy.get('input[placeholder*="Search accounts"]').type('john');
      
      // Should show loading indicator
      cy.contains('Loading accounts').should('be.visible');
      
      cy.wait('@slowSearch');
      cy.contains('john@crossmilescarrier.com').should('be.visible');
    });
  });

  describe('Search Performance', () => {
    it('should handle large search results efficiently', () => {
      // Create many mock accounts
      const manyAccounts = Array.from({ length: 100 }, (_, i) => ({
        _id: `account-${i}`,
        email: `user${i}@crossmilescarrier.com`
      }));
      
      cy.mockAccountsAPI(manyAccounts);
      cy.login();
      
      // Search should still be responsive
      cy.searchAccounts('user1');
      
      // Should show filtered results
      cy.contains('user1@crossmilescarrier.com').should('be.visible');
      cy.contains('user10@crossmilescarrier.com').should('be.visible');
    });

    it('should handle special characters in search', () => {
      cy.mockAccountsAPI([mockAccounts[0]]);
      
      // Search with special characters
      const specialSearches = [
        '@crossmilescarrier.com',
        'user+tag@',
        'user.name@',
        'user_name'
      ];
      
      specialSearches.forEach(searchTerm => {
        cy.get('input[placeholder*="Search accounts"]').clear().type(searchTerm);
        cy.wait('@getAccounts');
        
        // Should handle gracefully without errors
        cy.get('body').should('be.visible'); // Basic check that page is still functional
      });
    });
  });
});
