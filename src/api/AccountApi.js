import Api from './Api';

class AccountApi {
  // Add new account
  static async addAccount(email) {
    try {
      const response = await Api.post('/account/add', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get all accounts
  static async getAllAccounts() {
    try {
      const response = await Api.get('/accounts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get single account by ID
  static async getAccount(id) {
    try {
      const response = await Api.get(`/account/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update account
  static async editAccount(id, email) {
    try {
      const response = await Api.put(`/account/${id}`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete account
  static async deleteAccount(id) {
    try {
      const response = await Api.delete(`/account/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Sync single account
  static async syncAccount(id) {
    try {
      const response = await Api.post(`/account/${id}/sync`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Sync all accounts
  static async syncAllAccounts() {
    try {
      const response = await Api.post('/accounts/sync');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get account threads
  static async getAccountThreads(accountId, labelType = 'INBOX', page = 1, limit = 20) {
    try {
      const response = await Api.get(`/account/${accountId}/threads`, {
        params: { labelType, page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get single thread by ID
  static async getThread(threadId) {
    try {
      const response = await Api.get(`/thread/${threadId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get scheduler status
  static async getSchedulerStatus() {
    try {
      const response = await Api.get('/scheduler/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Toggle scheduler (start/stop)
  static async toggleScheduler(action) {
    try {
      const response = await Api.post('/scheduler/toggle', { action });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default AccountApi;
