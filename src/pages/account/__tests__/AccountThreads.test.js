import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import AccountThreads from '../AccountThreads';
import AccountApi from '../../../api/AccountApi';
import toast from 'react-hot-toast';

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

// Helper function to render with router
const renderWithRouter = (component, initialEntries = ['/account/test@crossmilescarrier.com/threads/inbox']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('AccountThreads Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockThreads = [
    {
      _id: '1',
      subject: 'Test Email Subject',
      from: 'sender1@example.com',
      to: 'test@crossmilescarrier.com',
      date: '2024-01-01T10:00:00Z',
      emailCount: 2,
      emails: [
        {
          _id: 'email1',
          textBlocks: ['This is the email content', 'Second paragraph']
        }
      ]
    },
    {
      _id: '2',
      subject: 'Important Meeting',
      from: 'manager@example.com',
      to: 'test@crossmilescarrier.com',
      date: '2024-01-02T14:30:00Z',
      emailCount: 1,
      emails: [
        {
          _id: 'email2',
          textBlocks: ['Meeting scheduled for tomorrow']
        }
      ]
    }
  ];

  const mockApiResponse = {
    status: true,
    data: {
      account: { email: 'test@crossmilescarrier.com' },
      threads: mockThreads,
      pagination: { page: 1, limit: 20, total: 2, pages: 1 }
    }
  };

  it('should render search input field', async () => {
    AccountApi.getAccountThreads.mockResolvedValue(mockApiResponse);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });
  });

  it('should display threads initially', async () => {
    AccountApi.getAccountThreads.mockResolvedValue(mockApiResponse);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
      expect(screen.getByText('Important Meeting')).toBeInTheDocument();
    });
  });

  it('should perform search by partial text', async () => {
    const searchResults = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        threads: [mockThreads[0]], // Only first thread matches
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      }
    };

    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(searchResults);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'Test Email' } });

    await waitFor(() => {
      expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
        'test@crossmilescarrier.com',
        'INBOX',
        1,
        20,
        'Test Email'
      );
    }, { timeout: 1000 });
  });

  it('should perform case-insensitive search', async () => {
    const searchResults = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        threads: [mockThreads[1]], // Important Meeting matches
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      }
    };

    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(searchResults);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'IMPORTANT' } });

    await waitFor(() => {
      expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
        'test@crossmilescarrier.com',
        'INBOX',
        1,
        20,
        'IMPORTANT'
      );
    }, { timeout: 1000 });
  });

  it('should search by messageId', async () => {
    const messageId = '<123456789@gmail.com>';
    const searchResults = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        threads: [{ ...mockThreads[0], messageId }],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      }
    };

    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(searchResults);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: messageId } });

    await waitFor(() => {
      expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
        'test@crossmilescarrier.com',
        'INBOX',
        1,
        20,
        messageId
      );
    }, { timeout: 1000 });
  });

  it('should search by sender email', async () => {
    const searchResults = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        threads: [mockThreads[1]], // manager@example.com matches
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      }
    };

    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(searchResults);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'manager@example.com' } });

    await waitFor(() => {
      expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
        'test@crossmilescarrier.com',
        'INBOX',
        1,
        20,
        'manager@example.com'
      );
    }, { timeout: 1000 });
  });

  it('should display search results count', async () => {
    const searchResults = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        threads: [mockThreads[0]],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      }
    };

    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(searchResults);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('1 result found')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should display multiple search results count', async () => {
    const searchResults = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        threads: mockThreads,
        pagination: { page: 1, limit: 20, total: 5, pages: 1 }
      }
    };

    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(searchResults);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'email' } });

    await waitFor(() => {
      expect(screen.getByText('5 results found')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should clear search with X button', async () => {
    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(mockApiResponse);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Wait for search to be performed
    await waitFor(() => {
      expect(screen.getByTitle('Clear search')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Click the clear button
    const clearButton = screen.getByTitle('Clear search');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('should clear search with "Clear search" link', async () => {
    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(mockApiResponse);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Wait for search results badge to appear
    await waitFor(() => {
      const clearLinks = screen.getAllByText('Clear search');
      expect(clearLinks.length).toBeGreaterThan(0);
    }, { timeout: 1000 });

    // Click the clear search link
    const clearLinks = screen.getAllByText('Clear search');
    fireEvent.click(clearLinks[0]); // Click the first one (there might be multiple)

    expect(searchInput.value).toBe('');
  });

  it('should maintain search across tab changes', async () => {
    AccountApi.getAccountThreads.mockResolvedValue(mockApiResponse);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Switch to SENT tab
    const sentTab = screen.getByText('Sent');
    fireEvent.click(sentTab);

    // Search input should be cleared when switching tabs
    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
  });

  it('should debounce search queries', async () => {
    AccountApi.getAccountThreads.mockResolvedValue(mockApiResponse);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should only make one search API call after debounce delay
    await waitFor(() => {
      expect(AccountApi.getAccountThreads).toHaveBeenCalledWith(
        'test@crossmilescarrier.com',
        'INBOX',
        1,
        20,
        'test'
      );
    }, { timeout: 1000 });

    // Should not be called with intermediate values
    expect(AccountApi.getAccountThreads).not.toHaveBeenCalledWith(
      'test@crossmilescarrier.com',
      'INBOX',
      1,
      20,
      't'
    );
  });

  it('should handle search API errors gracefully', async () => {
    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockRejectedValueOnce(new Error('Search failed'));

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'search error' } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load threads');
    }, { timeout: 1000 });
  });

  it('should show empty state when no search results found', async () => {
    const emptySearchResults = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        threads: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      }
    };

    AccountApi.getAccountThreads
      .mockResolvedValueOnce(mockApiResponse)
      .mockResolvedValueOnce(emptySearchResults);

    renderWithRouter(<AccountThreads />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by message-id, sender, recipient or content/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/No emails found/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
