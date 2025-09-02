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
  static async getAllAccounts(search = null) {
    try {
      const params = {};
      if (search) {
        params.search = search;
      }
      
      const response = await Api.get('/accounts', { params });
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
  static async getAccountThreads(email, label = 'INBOX', page = 1, limit = 20, q = null) {
    try {
      const params = {
        labelType: label,
        page,
        limit
      };
      
      if (q) {
        params.q = q;
      }
      
      const response = await Api.get(`/account/${email}/threads`, {
        params
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

  // Get chats for account
  static async getChats(accountEmail, page = 1, limit = 20) {
    try {
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await Api.get(`/account/${accountEmail}/chats?page=${page}&limit=${limit}&_=${cacheBuster}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get messages for specific chat
  static async getChatMessages(accountEmail, chatId, page = 1, limit = 50) {
    try {
      const response = await Api.get(`/account/${accountEmail}/chats/${chatId}/messages?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Sync chats for account
  static async syncChats(accountEmail) {
    try {
      const response = await Api.post(`/account/${accountEmail}/sync-chats`);
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

  // Clear all emails for an account
  static async clearAllEmails(accountEmail) {
    try {
      const response = await Api.delete(`/account/${accountEmail}/clear-all-emails`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Clear all chats for an account
  static async clearAllChats(accountEmail) {
    try {
      const response = await Api.delete(`/account/${accountEmail}/clear-all-chats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default AccountApi;
