import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AllAccounts from '../AllAccounts';
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

// Mock child components to focus on search functionality
jest.mock('../AccountItem', () => ({ account }) => (
  <div data-testid={`account-item-${account._id}`}>
    {account.email}
  </div>
));

jest.mock('../AddAccount', () => () => (
  <button data-testid="add-account">Add Account</button>
));

// Helper function to wrap component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AllAccounts Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAccounts = [
    { _id: '1', email: 'test1@crossmilescarrier.com' },
    { _id: '2', email: 'test2@crossmilescarrier.com' },
    { _id: '3', email: 'manager@crossmilescarrier.com' }
  ];

  it('should render search input field', async () => {
    AccountApi.getAllAccounts.mockResolvedValue({
      status: true,
      accounts: mockAccounts
    });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });
  });

  it('should display all accounts initially', async () => {
    AccountApi.getAllAccounts.mockResolvedValue({
      status: true,
      accounts: mockAccounts
    });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByText('All Email Accounts (3)')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-3')).toBeInTheDocument();
    });
  });

  it('should perform search when typing in search field', async () => {
    const searchResults = [
      { _id: '1', email: 'test1@crossmilescarrier.com' }
    ];

    AccountApi.getAllAccounts
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts })
      .mockResolvedValueOnce({ status: true, accounts: searchResults });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(searchInput, { target: { value: 'test1' } });

    // Wait for debounced search (300ms)
    await waitFor(() => {
      expect(AccountApi.getAllAccounts).toHaveBeenCalledWith('test1');
    }, { timeout: 1000 });
  });

  it('should handle case-insensitive search', async () => {
    const searchResults = [
      { _id: '3', email: 'manager@crossmilescarrier.com' }
    ];

    AccountApi.getAllAccounts
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts })
      .mockResolvedValueOnce({ status: true, accounts: searchResults });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(searchInput, { target: { value: 'MANAGER' } });

    await waitFor(() => {
      expect(AccountApi.getAllAccounts).toHaveBeenCalledWith('MANAGER');
    }, { timeout: 1000 });
  });

  it('should handle partial text search', async () => {
    const searchResults = [
      { _id: '1', email: 'test1@crossmilescarrier.com' },
      { _id: '2', email: 'test2@crossmilescarrier.com' }
    ];

    AccountApi.getAllAccounts
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts })
      .mockResolvedValueOnce({ status: true, accounts: searchResults });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(AccountApi.getAllAccounts).toHaveBeenCalledWith('test');
    }, { timeout: 1000 });
  });

  it('should clear search and reload all accounts', async () => {
    AccountApi.getAllAccounts
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts })
      .mockResolvedValueOnce({ status: true, accounts: [mockAccounts[0]] })
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    
    // Perform search
    fireEvent.change(searchInput, { target: { value: 'test1' } });
    
    await waitFor(() => {
      expect(AccountApi.getAllAccounts).toHaveBeenCalledWith('test1');
    }, { timeout: 1000 });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(AccountApi.getAllAccounts).toHaveBeenCalledWith();
    }, { timeout: 1000 });
  });

  it('should show loading state during search', async () => {
    AccountApi.getAllAccounts.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ status: true, accounts: [] }), 100))
    );

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByText('Loading accounts...')).toBeInTheDocument();
    });
  });

  it('should handle search API errors gracefully', async () => {
    AccountApi.getAllAccounts
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts })
      .mockRejectedValueOnce(new Error('Search failed'));

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(searchInput, { target: { value: 'search' } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load accounts');
    }, { timeout: 1000 });
  });

  it('should show "No accounts found" message when search returns empty results', async () => {
    AccountApi.getAllAccounts
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts })
      .mockResolvedValueOnce({ status: true, accounts: [] });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('📧 No email accounts found')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should handle special characters in search query', async () => {
    const searchTerm = '@crossmilescarrier.com';
    AccountApi.getAllAccounts
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts })
      .mockResolvedValueOnce({ status: true, accounts: mockAccounts });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    await waitFor(() => {
      expect(AccountApi.getAllAccounts).toHaveBeenCalledWith(searchTerm);
    }, { timeout: 1000 });
  });

  it('should debounce search queries to avoid excessive API calls', async () => {
    AccountApi.getAllAccounts.mockResolvedValue({ status: true, accounts: [] });

    renderWithRouter(<AllAccounts />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search accounts...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search accounts...');
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should only make one API call after debounce delay
    await waitFor(() => {
      expect(AccountApi.getAllAccounts).toHaveBeenCalledWith('test');
    }, { timeout: 1000 });

    // Verify it was not called with intermediate values
    expect(AccountApi.getAllAccounts).not.toHaveBeenCalledWith('t');
    expect(AccountApi.getAllAccounts).not.toHaveBeenCalledWith('te');
    expect(AccountApi.getAllAccounts).not.toHaveBeenCalledWith('tes');
  });
});
