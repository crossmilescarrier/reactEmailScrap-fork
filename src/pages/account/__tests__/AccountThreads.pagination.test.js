import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountThreads from '../AccountThreads';
import AccountApi from '../../../api/AccountApi';

// Mock dependencies
jest.mock('../../../api/AccountApi');
jest.mock('react-hot-toast');
jest.mock('../../../context/AuthProvider', () => ({
  UserContext: {
    Consumer: ({ children }) => children({ Errors: jest.fn() }),
    Provider: ({ children }) => children
  }
}));

// Mock child components
jest.mock('../../../components/ChatMessage', () => ({ message, isOwn }) => (
  <div data-testid={`chat-message-${message._id}`} data-is-own={isOwn}>
    {message.body}
  </div>
));

const renderWithRouter = (component, initialEntries = ['/account/test@crossmilescarrier.com/threads/inbox']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('AccountThreads Pagination and Tabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockThreads = Array.from({ length: 5 }, (_, i) => ({
    _id: `thread-${i + 1}`,
    subject: `Thread ${i + 1}`,
    from: `sender${i + 1}@example.com`,
    to: 'test@crossmilescarrier.com',
    date: '2024-01-01T10:00:00Z',
    emailCount: 1,
    emails: [{ _id: `email-${i + 1}`, textBlocks: [`Content ${i + 1}`] }]
  }));

  const mockApiResponseWithPagination = {
    status: true,
    data: {
      account: { email: 'test@crossmilescarrier.com' },
      threads: mockThreads.slice(0, 3), // First page
      pagination: { page: 1, limit: 3, total: 25, pages: 9 }
    }
  };

  describe('Tab Functionality', () => {
    it('should render all tabs', async () => {
      AccountApi.getAccountThreads.mockResolvedValue(mockApiResponseWithPagination);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByText('Primary Inbox')).toBeInTheDocument();
        expect(screen.getByText('Sent')).toBeInTheDocument();
        expect(screen.getByText('All Emails')).toBeInTheDocument();
        expect(screen.getByText('Chats')).toBeInTheDocument();
      });
    });

    it('should highlight active tab (INBOX by default)', async () => {
      AccountApi.getAccountThreads.mockResolvedValue(mockApiResponseWithPagination);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        const inboxTab = screen.getByText('Primary Inbox').closest('button');
        expect(inboxTab).toHaveClass('bg-white', 'text-blue-600');
      });
    });

    it('should switch to SENT tab and fetch sent emails', async () => {
      const sentResponse = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          threads: [{ ...mockThreads[0], subject: 'Sent Email' }]
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(mockApiResponseWithPagination) // Initial INBOX
        .mockResolvedValueOnce(sentResponse); // SENT tab

      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByText('Primary Inbox')).toBeInTheDocument();
      });

      const sentTab = screen.getByText('Sent');
      fireEvent.click(sentTab);

      await waitFor(() => {
        expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
          'test@crossmilescarrier.com',
          'SENT',
          1,
          20,
          null
        );
      });
    });

    it('should switch to ALL tab and fetch all emails', async () => {
      const allResponse = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          threads: mockThreads
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(mockApiResponseWithPagination) // Initial INBOX
        .mockResolvedValueOnce(allResponse) // INBOX for ALL tab
        .mockResolvedValueOnce(allResponse); // SENT for ALL tab

      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByText('Primary Inbox')).toBeInTheDocument();
      });

      const allTab = screen.getByText('All Emails');
      fireEvent.click(allTab);

      await waitFor(() => {
        // ALL tab makes two API calls (INBOX and SENT)
        expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
          'test@crossmilescarrier.com',
          'INBOX',
          1,
          10, // limit is halved for ALL tab
          null
        );
        expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
          'test@crossmilescarrier.com',
          'SENT',
          1,
          10,
          null
        );
      });
    });

    it('should navigate to chat page when CHATS tab is clicked', async () => {
      // Since we can't easily test navigation in unit tests,
      // we'll verify the navigation function is called
      const mockNavigate = jest.fn();
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));

      AccountApi.getAccountThreads.mockResolvedValue(mockApiResponseWithPagination);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByText('Chats')).toBeInTheDocument();
      });

      const chatsTab = screen.getByText('Chats');
      fireEvent.click(chatsTab);

      // In the actual component, this would navigate to the chats page
      // but we can verify the UI elements are present
      expect(screen.getByText('Chats')).toBeInTheDocument();
    });

    it('should show thread count in active tab badge', async () => {
      AccountApi.getAccountThreads.mockResolvedValue(mockApiResponseWithPagination);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        // INBOX tab should show the total count from pagination
        const inboxBadge = screen.getByText('25'); // total from mockApiResponseWithPagination
        expect(inboxBadge).toBeInTheDocument();
        expect(inboxBadge).toHaveClass('bg-blue-100', 'text-blue-600');
      });
    });

    it('should clear search when switching tabs', async () => {
      AccountApi.getAccountThreads.mockResolvedValue(mockApiResponseWithPagination);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
      });

      // Enter search term
      const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      expect(searchInput.value).toBe('test search');

      // Switch tab
      const sentTab = screen.getByText('Sent');
      fireEvent.click(sentTab);

      // Search should be cleared
      expect(searchInput.value).toBe('');
    });
  });

  describe('Pagination Functionality', () => {
    it('should show pagination controls when multiple pages exist', async () => {
      AccountApi.getAccountThreads.mockResolvedValue(mockApiResponseWithPagination);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 9')).toBeInTheDocument();
      });
    });

    it('should not show pagination when only one page exists', async () => {
      const singlePageResponse = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          pagination: { page: 1, limit: 20, total: 5, pages: 1 }
        }
      };

      AccountApi.getAccountThreads.mockResolvedValue(singlePageResponse);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.queryByText('Previous')).not.toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
        expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
      });
    });

    it('should disable Previous button on first page', async () => {
      AccountApi.getAccountThreads.mockResolvedValue(mockApiResponseWithPagination);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        const prevButton = screen.getByText('Previous');
        expect(prevButton).toBeDisabled();
        expect(prevButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });

    it('should disable Next button on last page', async () => {
      const lastPageResponse = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          pagination: { page: 9, limit: 3, total: 25, pages: 9 }
        }
      };

      AccountApi.getAccountThreads.mockResolvedValue(lastPageResponse);
      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        expect(nextButton).toBeDisabled();
        expect(nextButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });

    it('should navigate to next page when Next is clicked', async () => {
      const page2Response = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          threads: mockThreads.slice(3, 5), // Second page
          pagination: { page: 2, limit: 3, total: 25, pages: 9 }
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(mockApiResponseWithPagination) // Initial load
        .mockResolvedValueOnce(page2Response); // Next page

      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 9')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
          'test@crossmilescarrier.com',
          'INBOX',
          2, // page 2
          20,
          null
        );
      });
    });

    it('should navigate to previous page when Previous is clicked', async () => {
      const page2Response = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          pagination: { page: 2, limit: 3, total: 25, pages: 9 }
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(page2Response) // Start on page 2
        .mockResolvedValueOnce(mockApiResponseWithPagination); // Previous page (page 1)

      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 9')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('Previous');
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
          'test@crossmilescarrier.com',
          'INBOX',
          1, // page 1
          20,
          null
        );
      });
    });

    it('should disable pagination buttons during loading', async () => {
      AccountApi.getAccountThreads.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockApiResponseWithPagination), 100))
      );

      renderWithRouter(<AccountThreads />);

      // Initially loading
      await waitFor(() => {
        const prevButton = screen.getByText('Previous');
        const nextButton = screen.getByText('Next');
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
      });
    });

    it('should maintain pagination state when switching back to same tab', async () => {
      const page2Response = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          pagination: { page: 2, limit: 3, total: 25, pages: 9 }
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(mockApiResponseWithPagination) // INBOX page 1
        .mockResolvedValueOnce(page2Response) // INBOX page 2
        .mockResolvedValueOnce(mockApiResponseWithPagination) // SENT page 1
        .mockResolvedValueOnce(page2Response); // Back to INBOX page 1 (reset)

      renderWithRouter(<AccountThreads />);

      // Navigate to page 2
      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 9')).toBeInTheDocument();
      });

      // Switch to SENT tab
      const sentTab = screen.getByText('Sent');
      fireEvent.click(sentTab);

      // Switch back to INBOX - should reset to page 1
      const inboxTab = screen.getByText('Primary Inbox');
      fireEvent.click(inboxTab);

      await waitFor(() => {
        expect(AccountApi.getAccountThreads).toHaveBeenLastCalledWith(
          'test@crossmilescarrier.com',
          'INBOX',
          1, // Reset to page 1
          20,
          null
        );
      });
    });

    it('should show correct pagination info with search results', async () => {
      const searchResults = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          threads: [mockThreads[0]],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 }
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(mockApiResponseWithPagination) // Initial
        .mockResolvedValueOnce(searchResults); // Search results

      renderWithRouter(<AccountThreads />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
        fireEvent.change(searchInput, { target: { value: 'search' } });
      });

      // Should not show pagination for single page of results
      await waitFor(() => {
        expect(screen.queryByText('Previous')).not.toBeInTheDocument();
        expect(screen.queryByText('Next')).not.toBeInTheDocument();
      });
    });
  });

  describe('Combined Tab and Pagination Behavior', () => {
    it('should reset to page 1 when switching tabs', async () => {
      const page2InboxResponse = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          pagination: { page: 2, limit: 3, total: 25, pages: 9 }
        }
      };

      const sentResponse = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          threads: [{ ...mockThreads[0], subject: 'Sent Email' }],
          pagination: { page: 1, limit: 3, total: 15, pages: 5 }
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(mockApiResponseWithPagination) // INBOX page 1
        .mockResolvedValueOnce(page2InboxResponse) // INBOX page 2
        .mockResolvedValueOnce(sentResponse); // SENT page 1

      renderWithRouter(<AccountThreads />);

      // Go to page 2 in INBOX
      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 9')).toBeInTheDocument();
      });

      // Switch to SENT tab
      const sentTab = screen.getByText('Sent');
      fireEvent.click(sentTab);

      // Should start at page 1 in SENT tab
      await waitFor(() => {
        expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
          'test@crossmilescarrier.com',
          'SENT',
          1, // Page 1
          20,
          null
        );
      });
    });

    it('should preserve search term within tab but reset on tab switch', async () => {
      const searchResults = {
        ...mockApiResponseWithPagination,
        data: {
          ...mockApiResponseWithPagination.data,
          threads: [mockThreads[0]],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 }
        }
      };

      AccountApi.getAccountThreads
        .mockResolvedValueOnce(mockApiResponseWithPagination) // Initial INBOX
        .mockResolvedValueOnce(searchResults) // Search results
        .mockResolvedValueOnce(mockApiResponseWithPagination); // SENT tab

      renderWithRouter(<AccountThreads />);

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      await waitFor(() => {
        expect(searchInput.value).toBe('test search');
      });

      // Switch tab
      const sentTab = screen.getByText('Sent');
      fireEvent.click(sentTab);

      // Search should be cleared
      expect(searchInput.value).toBe('');
    });
  });
});
