import Api from './Api';

class AuthApi {
  // Get current user profile
  static async getProfile() {
    try {
      const response = await Api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update user profile (name and email)
  static async updateProfile(profileData) {
    try {
      const response = await Api.put('/user/profile/update', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Change password
  static async changePassword(passwordData) {
    try {
      const response = await Api.put('/user/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Login user
  static async login(credentials) {
    try {
      const response = await Api.post('/user/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Logout user
  static async logout() {
    try {
      const response = await Api.get('/user/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default AuthApi;
