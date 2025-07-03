const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.serverURL = this.baseURL.replace('/api', ''); // Remove /api for file URLs
    this.maxRetries = 3;
  }

  // Removed rate limiting queue system for better performance

  // Helper method to get full avatar URL
  getFullAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // If it's a relative path starting with /uploads, prepend server URL
    if (avatarPath.startsWith('/uploads')) {
      return `${this.serverURL}${avatarPath}`;
    }
    
    // If it's just a filename, assume it's in uploads/avatars
    return `${this.serverURL}/uploads/avatars/${avatarPath}`;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Helper method to get auth headers for file uploads
  getFileUploadHeaders() {
    const token = localStorage.getItem('token');
    return {
      ...(token && { Authorization: `Bearer ${token}` })
      // Don't set Content-Type for FormData, let browser set it with boundary
    };
  }

  // Retry logic with exponential backoff (network errors only)
  async retryRequest(requestFn, retries = 0) {
    try {
      return await requestFn();
    } catch (error) {
      if (retries < this.maxRetries && (
        error.message.includes('Network error')
      )) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Network error. Retrying in ${delay}ms... (attempt ${retries + 1}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retries + 1);
      }
      throw error;
    }
  }

  // Generic request method with better error handling and rate limiting
  async request(endpoint, options = {}) {
    const requestFn = async () => {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getAuthHeaders(),
        mode: 'cors',
        credentials: 'include',
        ...options
      };

      try {
        console.log(`Making request to: ${url}`);
        const response = await fetch(url, config);
        
        // Handle rate limiting - DISABLED
        // if (response.status === 429) {
        //   const retryAfter = response.headers.get('Retry-After');
        //   const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
        //   throw new Error(`Rate limited. Retry after ${delay}ms`);
        // }
        
        // Check if response is ok
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.warn('Could not parse error response as JSON');
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Process avatar URLs in the response
        this.processAvatarUrls(data);
        
        return data;
      } catch (error) {
        console.error('API Error:', error);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
        }
        
        // Handle CORS errors
        if (error.message.includes('CORS')) {
          throw new Error('CORS error: Please check server configuration.');
        }
        
        throw error;
      }
    };

    // Direct request execution without rate limiting
    return this.retryRequest(requestFn);
  }

  // Helper method to process avatar URLs in API responses
  processAvatarUrls(data) {
    if (data.data) {
      // Handle user data
      if (data.data.user && data.data.user.avatar) {
        data.data.user.avatar = this.getFullAvatarUrl(data.data.user.avatar);
      }
      
      // Handle avatar upload response
      if (data.data.avatarUrl) {
        data.data.avatarUrl = this.getFullAvatarUrl(data.data.avatarUrl);
      }
      
      // Handle arrays of users (for admin user management)
      if (Array.isArray(data.data.users)) {
        data.data.users.forEach(user => {
          if (user.avatar) {
            user.avatar = this.getFullAvatarUrl(user.avatar);
          }
        });
      }
    }
  }

  // File upload method with rate limiting
  async uploadFile(endpoint, file, additionalData = {}) {
    const requestFn = async () => {
      const url = `${this.baseURL}${endpoint}`;
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Add any additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      try {
        console.log(`Uploading file to: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: this.getFileUploadHeaders(),
          body: formData,
          mode: 'cors',
          credentials: 'include'
        });

        // Rate limiting check - DISABLED
        // if (response.status === 429) {
        //   const retryAfter = response.headers.get('Retry-After');
        //   const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
        //   throw new Error(`Rate limited. Retry after ${delay}ms`);
        // }

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.warn('Could not parse error response as JSON');
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Process avatar URLs in upload response
        this.processAvatarUrls(data);
        
        return data;
      } catch (error) {
        console.error('File Upload Error:', error);
        throw error;
      }
    };

    return this.retryRequest(requestFn);
  }

  // Test connection method
  async testConnection() {
    try {
      const response = await this.request('/health');
      console.log('API connection test successful:', response);
      return response;
    } catch (error) {
      console.error('API connection test failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(userData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // Avatar upload method
  async uploadAvatar(file) {
    return this.uploadFile('/auth/upload-avatar', file);
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return this.request('/products/featured');
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  async addProductReview(id, reviewData) {
    return this.request(`/products/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async getProductStats() {
    return this.request('/products/admin/stats');
  }

  // New method for updating all stock statuses
  async updateAllStockStatuses() {
    return this.request('/products/admin/update-stock-statuses', {
      method: 'POST'
    });
  }

  // Order methods
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getUserOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/my-orders${queryString ? `?${queryString}` : ''}`);
  }

  async updateOrderStatus(id, statusData) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  async updateOrderTracking(id, trackingData) {
    return this.request(`/orders/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify(trackingData)
    });
  }

  async getOrderStats() {
    return this.request('/orders/admin/stats');
  }

  // Order tracking method (public - no auth required)
  async trackOrder(trackingNumber) {
    return this.request('/orders/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header needed for public tracking
      },
      body: JSON.stringify({ trackingNumber })
    });
  }

  // New methods for user order editing and canceling
  async editUserOrder(id, orderData) {
    return this.request(`/orders/${id}/edit`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    });
  }

  async cancelUserOrder(id, reason = '') {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  // Request methods
  async getRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/requests${queryString ? `?${queryString}` : ''}`);
  }

  async getRequest(id) {
    return this.request(`/requests/${id}`);
  }

  async createRequest(requestData) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async getUserRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/requests/my-requests${queryString ? `?${queryString}` : ''}`);
  }

  async updateRequestStatus(id, statusData) {
    return this.request(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  async updateRequestTracking(id, trackingData) {
    return this.request(`/requests/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify(trackingData)
    });
  }

  async getRequestStats() {
    return this.request('/requests/admin/stats');
  }

  // New methods for user request editing and canceling
  async editUserRequest(id, requestData) {
    return this.request(`/requests/${id}/edit`, {
      method: 'PUT',
      body: JSON.stringify(requestData)
    });
  }

  async cancelUserRequest(id, reason = '') {
    return this.request(`/requests/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  // Update and delete product request methods
  async updateProductRequest(id, requestData) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData)
    });
  }

  // User management methods (Admin only)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();