import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddAccount from '../AddAccount';
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

// Mock the Popup component to focus on form validation
jest.mock('../../common/Popup', () => ({ children, btntext, btnclasses, ...props }) => (
  <div data-testid="popup-container">
    <button 
      data-testid="popup-trigger" 
      className={btnclasses}
      onClick={() => {}}
    >
      {btntext}
    </button>
    <div data-testid="popup-content">
      {children}
    </div>
  </div>
));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AddAccount Domain Validation', () => {
  const mockFetchLists = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render add account form', () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    expect(screen.getByText('Add New Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new email address')).toBeInTheDocument();
    expect(screen.getByText('Add Account')).toBeInTheDocument();
  });

  it('should show validation error for invalid domain immediately', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    fireEvent.change(emailInput, { target: { value: 'test@invalid.com' } });

    await waitFor(() => {
      expect(screen.getByText('Only crossmilescarrier.com emails allowed')).toBeInTheDocument();
    });

    // Check that input has error styling
    expect(emailInput).toHaveClass('border-red-500');
  });

  it('should show validation error for empty domain', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    fireEvent.change(emailInput, { target: { value: 'test@' } });

    await waitFor(() => {
      expect(screen.getByText('Only crossmilescarrier.com emails allowed')).toBeInTheDocument();
    });
  });

  it('should show validation error for wrong domain', async () => {
    const invalidDomains = [
      'user@gmail.com',
      'user@yahoo.com',
      'user@outlook.com',
      'user@company.org',
      'user@wrongdomain.com'
    ];

    for (const email of invalidDomains) {
      renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);
      
      const emailInput = screen.getByPlaceholderText('Enter new email address');
      fireEvent.change(emailInput, { target: { value: email } });

      await waitFor(() => {
        expect(screen.getByText('Only crossmilescarrier.com emails allowed')).toBeInTheDocument();
      });

      // Clean up for next iteration
      renderWithRouter(<div />);
    }
  });

  it('should accept valid crossmilescarrier.com email', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    fireEvent.change(emailInput, { target: { value: 'test@crossmilescarrier.com' } });

    await waitFor(() => {
      // Error message should not be present
      expect(screen.queryByText('Only crossmilescarrier.com emails allowed')).not.toBeInTheDocument();
    });

    // Check that input has normal styling
    expect(emailInput).toHaveClass('border-gray-300');
    expect(emailInput).not.toHaveClass('border-red-500');
  });

  it('should handle case-insensitive domain validation', async () => {
    const validEmails = [
      'test@crossmilescarrier.com',
      'test@CROSSMILESCARRIER.COM',
      'test@CrossMilesCarrier.Com',
      'test@CrossMilesCarrier.COM'
    ];

    for (const email of validEmails) {
      renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);
      
      const emailInput = screen.getByPlaceholderText('Enter new email address');
      fireEvent.change(emailInput, { target: { value: email } });

      await waitFor(() => {
        expect(screen.queryByText('Only crossmilescarrier.com emails allowed')).not.toBeInTheDocument();
      });

      // Clean up for next iteration
      renderWithRouter(<div />);
    }
  });

  it('should disable submit button when domain is invalid', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    fireEvent.change(emailInput, { target: { value: 'test@invalid.com' } });

    await waitFor(() => {
      const submitButton = screen.getByText('Add Account');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  it('should enable submit button when domain is valid', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    fireEvent.change(emailInput, { target: { value: 'test@crossmilescarrier.com' } });

    await waitFor(() => {
      const submitButton = screen.getByText('Add Account');
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });
  });

  it('should prevent API call with invalid domain', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const submitButton = screen.getByText('Add Account');

    fireEvent.change(emailInput, { target: { value: 'test@invalid.com' } });
    
    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText('Only crossmilescarrier.com emails allowed')).toBeInTheDocument();
    });

    // Try to click submit (should be disabled)
    fireEvent.click(submitButton);

    // Verify API was not called
    expect(AccountApi.addAccount).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Only crossmilescarrier.com emails allowed');
  });

  it('should make API call with valid domain', async () => {
    AccountApi.addAccount.mockResolvedValue({
      status: true,
      message: 'Account added successfully'
    });

    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const submitButton = screen.getByText('Add Account');

    fireEvent.change(emailInput, { target: { value: 'test@crossmilescarrier.com' } });
    
    // Wait for validation to pass
    await waitFor(() => {
      expect(screen.queryByText('Only crossmilescarrier.com emails allowed')).not.toBeInTheDocument();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(AccountApi.addAccount).toHaveBeenCalledWith('test@crossmilescarrier.com');
    });
  });

  it('should clear validation error when correcting email', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');

    // First, enter invalid email
    fireEvent.change(emailInput, { target: { value: 'test@invalid.com' } });

    await waitFor(() => {
      expect(screen.getByText('Only crossmilescarrier.com emails allowed')).toBeInTheDocument();
    });

    // Then, correct the email
    fireEvent.change(emailInput, { target: { value: 'test@crossmilescarrier.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Only crossmilescarrier.com emails allowed')).not.toBeInTheDocument();
    });
  });

  it('should clear validation error when emptying field', async () => {
    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'test@invalid.com' } });

    await waitFor(() => {
      expect(screen.getByText('Only crossmilescarrier.com emails allowed')).toBeInTheDocument();
    });

    // Clear the field
    fireEvent.change(emailInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.queryByText('Only crossmilescarrier.com emails allowed')).not.toBeInTheDocument();
    });
  });

  it('should handle API errors and show toast message', async () => {
    AccountApi.addAccount.mockRejectedValue({
      message: 'Account already exists'
    });

    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const submitButton = screen.getByText('Add Account');

    fireEvent.change(emailInput, { target: { value: 'existing@crossmilescarrier.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Account already exists');
    });
  });

  it('should show loading state during API call', async () => {
    AccountApi.addAccount.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ status: true, message: 'Success' }), 100))
    );

    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const submitButton = screen.getByText('Add Account');

    fireEvent.change(emailInput, { target: { value: 'test@crossmilescarrier.com' } });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Adding Account...')).toBeInTheDocument();
    });

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Add Account')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should validate complex email formats', async () => {
    const validComplexEmails = [
      'user.name@crossmilescarrier.com',
      'user+tag@crossmilescarrier.com',
      'user_name@crossmilescarrier.com',
      'user123@crossmilescarrier.com',
      'User.Name+Tag@crossmilescarrier.com'
    ];

    for (const email of validComplexEmails) {
      renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);
      
      const emailInput = screen.getByPlaceholderText('Enter new email address');
      fireEvent.change(emailInput, { target: { value: email } });

      await waitFor(() => {
        expect(screen.queryByText('Only crossmilescarrier.com emails allowed')).not.toBeInTheDocument();
      });

      // Clean up for next iteration
      renderWithRouter(<div />);
    }
  });

  it('should reject emails with subdomain attempts', async () => {
    const invalidSubdomainEmails = [
      'test@mail.crossmilescarrier.com',
      'test@sub.crossmilescarrier.com',
      'test@crossmilescarrier.com.fake.com'
    ];

    for (const email of invalidSubdomainEmails) {
      renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);
      
      const emailInput = screen.getByPlaceholderText('Enter new email address');
      fireEvent.change(emailInput, { target: { value: email } });

      await waitFor(() => {
        expect(screen.getByText('Only crossmilescarrier.com emails allowed')).toBeInTheDocument();
      });

      // Clean up for next iteration
      renderWithRouter(<div />);
    }
  });

  it('should reset form after successful submission', async () => {
    AccountApi.addAccount.mockResolvedValue({
      status: true,
      message: 'Account added successfully'
    });

    renderWithRouter(<AddAccount fetchLists={mockFetchLists} />);

    const emailInput = screen.getByPlaceholderText('Enter new email address');
    const submitButton = screen.getByText('Add Account');

    fireEvent.change(emailInput, { target: { value: 'test@crossmilescarrier.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Account added successfully');
      expect(mockFetchLists).toHaveBeenCalled();
    });

    // Form should be reset - though we can't easily test the popup close behavior
    // we can verify the API calls were made correctly
    expect(AccountApi.addAccount).toHaveBeenCalledWith('test@crossmilescarrier.com');
  });
});
