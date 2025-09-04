import Api from './Api';

class DomainApi {
  
  // Get all domains with optional filtering
  static async getAllDomains(type = null, search = null) {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (search) params.append('search', search);
      
      const queryString = params.toString();
      const response = await Api.get(`/api/domains${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch domains:', error);
      throw error;
    }
  }

  // Get allowed domains by type (for validation)
  static async getAllowedDomains(type = 'customer') {
    try {
      const response = await Api.get(`/api/domains/allowed/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch allowed ${type} domains:`, error);
      throw error;
    }
  }

  // Add new domain
  static async addDomain(domain, type = 'customer', description = '') {
    try {
      const response = await Api.post('/api/domains', {
        domain,
        type,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add domain:', error);
      throw error;
    }
  }

  // Update domain
  static async updateDomain(id, data) {
    try {
      const response = await Api.put(`/api/domains/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update domain:', error);
      throw error;
    }
  }

  // Delete domain
  static async deleteDomain(id) {
    try {
      const response = await Api.delete(`/api/domains/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete domain:', error);
      throw error;
    }
  }

  // Toggle domain status
  static async toggleDomainStatus(id) {
    try {
      const response = await Api.patch(`/api/domains/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Failed to toggle domain status:', error);
      throw error;
    }
  }

  // Initialize default domains
  static async initializeDefaultDomains() {
    try {
      const response = await Api.post('/api/domains/initialize');
      return response.data;
    } catch (error) {
      console.error('Failed to initialize default domains:', error);
      throw error;
    }
  }

  // Validate email against allowed domains
  static async validateEmail(email, type = 'customer') {
    try {
      const allowedDomains = await this.getAllowedDomains(type);
      const emailDomain = email.split('@')[1]?.toLowerCase();
      
      if (!emailDomain) {
        throw new Error('Invalid email format');
      }
      
      const isAllowed = allowedDomains.domains.includes(emailDomain);
      
      if (!isAllowed) {
        const domainsText = allowedDomains.domains.length > 0 
          ? allowedDomains.domains.map(d => `@${d}`).join(', ')
          : 'No domains configured';
        throw new Error(`Only ${type} domains are allowed: ${domainsText}`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

}

export default DomainApi;
