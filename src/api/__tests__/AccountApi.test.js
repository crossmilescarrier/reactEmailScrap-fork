import AccountApi from '../AccountApi';
import Api from '../Api';

// Mock the Api module
jest.mock('../Api');

describe('AccountApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAccount', () => {
    it('should successfully add a new account with valid email', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Account added successfully',
          account: { email: 'test@crossmilescarrier.com', _id: '123' }
        }
      };
      Api.post.mockResolvedValue(mockResponse);

      const result = await AccountApi.addAccount('test@crossmilescarrier.com');

      expect(Api.post).toHaveBeenCalledWith('/account/add', { email: 'test@crossmilescarrier.com' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when adding account', async () => {
      const mockError = {
        response: {
          data: { status: false, message: 'Email already exists' }
        }
      };
      Api.post.mockRejectedValue(mockError);

      await expect(AccountApi.addAccount('existing@crossmilescarrier.com'))
        .rejects
        .toEqual(mockError.response.data);

      expect(Api.post).toHaveBeenCalledWith('/account/add', { email: 'existing@crossmilescarrier.com' });
    });

    it('should handle network errors when adding account', async () => {
      const mockError = new Error('Network Error');
      Api.post.mockRejectedValue(mockError);

      await expect(AccountApi.addAccount('test@crossmilescarrier.com'))
        .rejects
        .toEqual('Network Error');
    });
  });

  describe('getAllAccounts', () => {
    it('should fetch all accounts without search', async () => {
      const mockResponse = {
        data: {
          status: true,
          accounts: [
            { _id: '1', email: 'test1@crossmilescarrier.com' },
            { _id: '2', email: 'test2@crossmilescarrier.com' }
          ]
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      const result = await AccountApi.getAllAccounts();

      expect(Api.get).toHaveBeenCalledWith('/accounts', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch accounts with search parameter', async () => {
      const mockResponse = {
        data: {
          status: true,
          accounts: [
            { _id: '1', email: 'search@crossmilescarrier.com' }
          ]
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      const result = await AccountApi.getAllAccounts('search');

      expect(Api.get).toHaveBeenCalledWith('/accounts', { 
        params: { search: 'search' } 
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle search query with special characters', async () => {
      const mockResponse = {
        data: {
          status: true,
          accounts: []
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      const searchTerm = 'test@domain.com';
      const result = await AccountApi.getAllAccounts(searchTerm);

      expect(Api.get).toHaveBeenCalledWith('/accounts', { 
        params: { search: searchTerm } 
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAccountThreads', () => {
    it('should fetch threads with default parameters', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            threads: [
              { _id: '1', subject: 'Test thread', from: 'sender@example.com' }
            ],
            pagination: { page: 1, limit: 20, total: 1, pages: 1 }
          }
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      const result = await AccountApi.getAccountThreads('test@crossmilescarrier.com');

      expect(Api.get).toHaveBeenCalledWith('/account/test@crossmilescarrier.com/threads', {
        params: {
          labelType: 'INBOX',
          page: 1,
          limit: 20
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch threads with search query', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            threads: [
              { _id: '1', subject: 'Search result', from: 'sender@example.com' }
            ],
            pagination: { page: 1, limit: 20, total: 1, pages: 1 }
          }
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      const searchQuery = 'search result';
      const result = await AccountApi.getAccountThreads(
        'test@crossmilescarrier.com', 
        'INBOX', 
        1, 
        20, 
        searchQuery
      );

      expect(Api.get).toHaveBeenCalledWith('/account/test@crossmilescarrier.com/threads', {
        params: {
          labelType: 'INBOX',
          page: 1,
          limit: 20,
          q: searchQuery
        }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle different label types', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            threads: [],
            pagination: { page: 1, limit: 20, total: 0, pages: 0 }
          }
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      await AccountApi.getAccountThreads('test@crossmilescarrier.com', 'SENT', 2, 10);

      expect(Api.get).toHaveBeenCalledWith('/account/test@crossmilescarrier.com/threads', {
        params: {
          labelType: 'SENT',
          page: 2,
          limit: 10
        }
      });
    });

    it('should handle case-insensitive search', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            threads: [
              { _id: '1', subject: 'UPPERCASE RESULT', from: 'sender@example.com' }
            ],
            pagination: { page: 1, limit: 20, total: 1, pages: 1 }
          }
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      const result = await AccountApi.getAccountThreads(
        'test@crossmilescarrier.com', 
        'INBOX', 
        1, 
        20, 
        'uppercase'
      );

      expect(Api.get).toHaveBeenCalledWith('/account/test@crossmilescarrier.com/threads', {
        params: {
          labelType: 'INBOX',
          page: 1,
          limit: 20,
          q: 'uppercase'
        }
      });
    });

    it('should search by messageId', async () => {
      const mockResponse = {
        data: {
          status: true,
          data: {
            threads: [
              { _id: '1', messageId: '<123456@gmail.com>', subject: 'Message with ID' }
            ],
            pagination: { page: 1, limit: 20, total: 1, pages: 1 }
          }
        }
      };
      Api.get.mockResolvedValue(mockResponse);

      const messageId = '<123456@gmail.com>';
      const result = await AccountApi.getAccountThreads(
        'test@crossmilescarrier.com', 
        'INBOX', 
        1, 
        20, 
        messageId
      );

      expect(Api.get).toHaveBeenCalledWith('/account/test@crossmilescarrier.com/threads', {
        params: {
          labelType: 'INBOX',
          page: 1,
          limit: 20,
          q: messageId
        }
      });
    });
  });

  describe('editAccount', () => {
    it('should successfully edit an account', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Account updated successfully',
          account: { _id: '123', email: 'updated@crossmilescarrier.com' }
        }
      };
      Api.put.mockResolvedValue(mockResponse);

      const result = await AccountApi.editAccount('123', 'updated@crossmilescarrier.com');

      expect(Api.put).toHaveBeenCalledWith('/account/123', { email: 'updated@crossmilescarrier.com' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle edit account errors', async () => {
      const mockError = {
        response: {
          data: { status: false, message: 'Account not found' }
        }
      };
      Api.put.mockRejectedValue(mockError);

      await expect(AccountApi.editAccount('invalid-id', 'test@crossmilescarrier.com'))
        .rejects
        .toEqual(mockError.response.data);
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete an account', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Account deleted successfully'
        }
      };
      Api.delete.mockResolvedValue(mockResponse);

      const result = await AccountApi.deleteAccount('123');

      expect(Api.delete).toHaveBeenCalledWith('/account/123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle delete account errors', async () => {
      const mockError = {
        response: {
          data: { status: false, message: 'Cannot delete account with existing threads' }
        }
      };
      Api.delete.mockRejectedValue(mockError);

      await expect(AccountApi.deleteAccount('123'))
        .rejects
        .toEqual(mockError.response.data);
    });
  });

  describe('syncAccount', () => {
    it('should successfully sync an account', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Sync completed',
          data: { total: 25 }
        }
      };
      Api.post.mockResolvedValue(mockResponse);

      const result = await AccountApi.syncAccount('test@crossmilescarrier.com');

      expect(Api.post).toHaveBeenCalledWith('/account/test@crossmilescarrier.com/sync');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle sync errors', async () => {
      const mockError = {
        response: {
          data: { status: false, message: 'Gmail API quota exceeded' }
        }
      };
      Api.post.mockRejectedValue(mockError);

      await expect(AccountApi.syncAccount('test@crossmilescarrier.com'))
        .rejects
        .toEqual(mockError.response.data);
    });
  });
});
