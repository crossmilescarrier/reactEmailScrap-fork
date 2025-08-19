describe('Pagination and Tabs Functionality', () => {
  const mockAccounts = [
    { _id: '1', email: 'test@crossmilescarrier.com' }
  ];

  const generateMockThreads = (count, startId = 1) => {
    return Array.from({ length: count }, (_, i) => ({
      _id: `thread-${startId + i}`,
      subject: `Email Thread ${startId + i}`,
      from: `sender${startId + i}@example.com`,
      to: 'test@crossmilescarrier.com',
      date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      emailCount: 1 + (i % 3),
      emails: [{ _id: `email-${startId + i}`, textBlocks: [`Content of email ${startId + i}`] }]
    }));
  };

  beforeEach(() => {
    cy.mockAccountsAPI(mockAccounts);
  });

  describe('Tab Functionality', () => {
    beforeEach(() => {
      const mockThreads = generateMockThreads(5);
      cy.mockAccountThreadsAPI(mockThreads, { page: 1, limit: 20, total: 5, pages: 1 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
    });

    it('should display all tab options', () => {
      cy.contains('Primary Inbox').should('be.visible');
      cy.contains('Sent').should('be.visible');
      cy.contains('All Emails').should('be.visible');
      cy.contains('Chats').should('be.visible');
    });

    it('should highlight the active tab', () => {
      // INBOX should be active by default
      cy.contains('Primary Inbox')
        .closest('button')
        .should('have.class', 'bg-white')
        .should('have.class', 'text-blue-600');
    });

    it('should switch to SENT tab', () => {
      const sentThreads = generateMockThreads(3);
      cy.mockAccountThreadsAPI(sentThreads, { page: 1, limit: 20, total: 3, pages: 1 });
      
      cy.contains('Sent').click();
      
      // Should highlight SENT tab
      cy.contains('Sent')
        .closest('button')
        .should('have.class', 'bg-white')
        .should('have.class', 'text-blue-600');
        
      // Should make API call for SENT emails
      cy.wait('@getAccountThreads');
      
      // URL should update
      cy.url().should('include', '/threads/sent');
    });

    it('should switch to ALL tab and fetch combined results', () => {
      const allThreads = generateMockThreads(8);
      cy.mockAccountThreadsAPI(allThreads, { page: 1, limit: 20, total: 8, pages: 1 });
      
      cy.contains('All Emails').click();
      
      // Should highlight ALL tab
      cy.contains('All Emails')
        .closest('button')
        .should('have.class', 'bg-white')
        .should('have.class', 'text-blue-600');
        
      // Should make multiple API calls for ALL emails (INBOX + SENT)
      cy.wait('@getAccountThreads');
      
      // URL should update
      cy.url().should('include', '/threads/all');
    });

    it('should show thread count in active tab badge', () => {
      // Should show the total count from pagination
      cy.contains('Primary Inbox')
        .parent()
        .contains('5') // Total from mock pagination
        .should('have.class', 'bg-blue-100')
        .should('have.class', 'text-blue-600');
    });

    it('should clear search when switching tabs', () => {
      // First perform a search
      cy.get('input[placeholder*="search by message-id"]').type('test search');
      
      // Switch to SENT tab
      const sentThreads = generateMockThreads(2);
      cy.mockAccountThreadsAPI(sentThreads, { page: 1, limit: 20, total: 2, pages: 1 });
      
      cy.contains('Sent').click();
      
      // Search input should be cleared
      cy.get('input[placeholder*="search by message-id"]').should('have.value', '');
    });

    it('should handle CHATS tab navigation', () => {
      // Mock chat data
      const mockChats = [
        {
          _id: 'chat1',
          subject: 'Team Discussion',
          from: 'John Doe <john@company.com>',
          to: 'test@crossmilescarrier.com',
          date: new Date().toISOString(),
          isChat: true,
          messages: [
            {
              _id: 'msg1',
              from: 'John Doe <john@company.com>',
              body: 'Hey team, how are we doing with the project?',
              date: new Date(Date.now() - 3600000).toISOString(),
              isOwn: false
            }
          ]
        }
      ];
      
      cy.mockAccountThreadsAPI(mockChats, { page: 1, limit: 20, total: 1, pages: 1 });
      
      cy.contains('Chats').click();
      
      // Should show chat interface
      cy.contains('Team Discussion').should('be.visible');
      cy.contains('💬').should('be.visible'); // Chat indicator
    });
  });

  describe('Pagination Functionality', () => {
    it('should show pagination controls for multiple pages', () => {
      const mockThreads = generateMockThreads(3); // Only 3 threads on page 1
      cy.mockAccountThreadsAPI(mockThreads, { page: 1, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      // Should show pagination
      cy.contains('Previous').should('be.visible');
      cy.contains('Next').should('be.visible');
      cy.contains('Page 1 of 9').should('be.visible');
    });

    it('should hide pagination for single page', () => {
      const mockThreads = generateMockThreads(5);
      cy.mockAccountThreadsAPI(mockThreads, { page: 1, limit: 20, total: 5, pages: 1 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      // Should not show pagination
      cy.contains('Previous').should('not.exist');
      cy.contains('Next').should('not.exist');
    });

    it('should disable Previous button on first page', () => {
      const mockThreads = generateMockThreads(3);
      cy.mockAccountThreadsAPI(mockThreads, { page: 1, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      cy.contains('Previous')
        .should('be.disabled')
        .should('have.class', 'opacity-50')
        .should('have.class', 'cursor-not-allowed');
    });

    it('should disable Next button on last page', () => {
      const mockThreads = generateMockThreads(3);
      cy.mockAccountThreadsAPI(mockThreads, { page: 9, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      cy.contains('Next')
        .should('be.disabled')
        .should('have.class', 'opacity-50')
        .should('have.class', 'cursor-not-allowed');
    });

    it('should navigate to next page', () => {
      // Mock page 1
      const page1Threads = generateMockThreads(3, 1);
      cy.mockAccountThreadsAPI(page1Threads, { page: 1, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      // Mock page 2
      const page2Threads = generateMockThreads(3, 4);
      cy.mockAccountThreadsAPI(page2Threads, { page: 2, limit: 3, total: 25, pages: 9 });
      
      cy.contains('Next').click();
      
      cy.wait('@getAccountThreads');
      
      // Should show page 2 info
      cy.contains('Page 2 of 9').should('be.visible');
      
      // Previous button should now be enabled
      cy.contains('Previous').should('not.be.disabled');
    });

    it('should navigate to previous page', () => {
      // Start on page 2
      const page2Threads = generateMockThreads(3, 4);
      cy.mockAccountThreadsAPI(page2Threads, { page: 2, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      // Mock page 1
      const page1Threads = generateMockThreads(3, 1);
      cy.mockAccountThreadsAPI(page1Threads, { page: 1, limit: 3, total: 25, pages: 9 });
      
      cy.contains('Previous').click();
      
      cy.wait('@getAccountThreads');
      
      // Should show page 1 info
      cy.contains('Page 1 of 9').should('be.visible');
      
      // Previous button should be disabled again
      cy.contains('Previous').should('be.disabled');
    });

    it('should disable pagination buttons during loading', () => {
      const mockThreads = generateMockThreads(3);
      
      // Mock slow API response
      cy.intercept('GET', '/api/account/*/threads*', (req) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              statusCode: 200,
              body: {
                status: true,
                data: {
                  account: { email: 'test@crossmilescarrier.com' },
                  threads: mockThreads,
                  pagination: { page: 1, limit: 3, total: 25, pages: 9 }
                }
              }
            });
          }, 2000);
        });
      }).as('slowGetThreads');
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      
      // During loading, buttons should be disabled
      cy.contains('Previous').should('be.disabled');
      cy.contains('Next').should('be.disabled');
      
      cy.wait('@slowGetThreads');
    });
  });

  describe('Combined Tab and Pagination Behavior', () => {
    it('should reset to page 1 when switching tabs', () => {
      // Start on page 2 of INBOX
      const page2Threads = generateMockThreads(3, 4);
      cy.mockAccountThreadsAPI(page2Threads, { page: 2, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      cy.contains('Page 2 of 9').should('be.visible');
      
      // Switch to SENT tab - should start at page 1
      const sentThreads = generateMockThreads(3);
      cy.mockAccountThreadsAPI(sentThreads, { page: 1, limit: 3, total: 15, pages: 5 });
      
      cy.contains('Sent').click();
      cy.wait('@getAccountThreads');
      
      // Should be on page 1 of SENT
      cy.contains('Page 1 of 5').should('be.visible');
    });

    it('should maintain pagination state within same tab', () => {
      // Go to page 2
      const page1Threads = generateMockThreads(3, 1);
      cy.mockAccountThreadsAPI(page1Threads, { page: 1, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      const page2Threads = generateMockThreads(3, 4);
      cy.mockAccountThreadsAPI(page2Threads, { page: 2, limit: 3, total: 25, pages: 9 });
      
      cy.contains('Next').click();
      cy.wait('@getAccountThreads');
      
      // Verify we're on page 2
      cy.contains('Page 2 of 9').should('be.visible');
      
      // Refresh the page or perform other actions that don't change tabs
      cy.reload();
      cy.waitForLoading();
      
      // Should maintain the same tab context
      cy.contains('Primary Inbox')
        .closest('button')
        .should('have.class', 'bg-white')
        .should('have.class', 'text-blue-600');
    });

    it('should handle search results pagination', () => {
      // Mock search results with pagination
      const searchResults = generateMockThreads(3, 1);
      cy.mockAccountThreadsAPI(searchResults, { page: 1, limit: 3, total: 10, pages: 4 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      // Perform search
      cy.get('input[placeholder*="search by message-id"]').type('test');
      cy.wait('@getAccountThreads');
      
      // Should show pagination for search results
      cy.contains('Page 1 of 4').should('be.visible');
      cy.contains('10 results found').should('be.visible');
      
      // Navigate to next page of search results
      const page2SearchResults = generateMockThreads(3, 4);
      cy.mockAccountThreadsAPI(page2SearchResults, { page: 2, limit: 3, total: 10, pages: 4 });
      
      cy.contains('Next').click();
      cy.wait('@getAccountThreads');
      
      cy.contains('Page 2 of 4').should('be.visible');
    });

    it('should clear search and reset pagination when switching tabs', () => {
      // Start with search results
      const searchResults = generateMockThreads(2);
      cy.mockAccountThreadsAPI(searchResults, { page: 1, limit: 3, total: 2, pages: 1 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      cy.get('input[placeholder*="search by message-id"]').type('search term');
      cy.wait('@getAccountThreads');
      
      cy.contains('2 results found').should('be.visible');
      
      // Switch tab
      const sentThreads = generateMockThreads(5);
      cy.mockAccountThreadsAPI(sentThreads, { page: 1, limit: 20, total: 5, pages: 1 });
      
      cy.contains('Sent').click();
      
      // Search should be cleared
      cy.get('input[placeholder*="search by message-id"]').should('have.value', '');
      
      // Should not show search results count
      cy.contains('results found').should('not.exist');
    });
  });

  describe('Pagination Error Handling', () => {
    it('should handle pagination API errors gracefully', () => {
      const mockThreads = generateMockThreads(3);
      cy.mockAccountThreadsAPI(mockThreads, { page: 1, limit: 3, total: 25, pages: 9 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      // Mock API error for next page
      cy.intercept('GET', '/api/account/*/threads*', { statusCode: 500, body: { error: 'Server error' } }).as('paginationError');
      
      cy.contains('Next').click();
      cy.wait('@paginationError');
      
      // Should show error message
      cy.contains('Failed to load threads').should('be.visible');
    });

    it('should handle empty pages gracefully', () => {
      // Mock empty page
      cy.mockAccountThreadsAPI([], { page: 1, limit: 20, total: 0, pages: 0 });
      
      cy.visit('/account/test@crossmilescarrier.com/threads/inbox');
      cy.waitForLoading();
      
      // Should show empty state
      cy.contains('No emails found').should('be.visible');
      
      // Should not show pagination
      cy.contains('Previous').should('not.exist');
      cy.contains('Next').should('not.exist');
    });
  });
});
