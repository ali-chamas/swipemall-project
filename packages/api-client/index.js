import axios from 'axios';

// Configuration
const DEFAULT_CONFIG = {
  baseURL: 'https://us-central1-your-project-id.cloudfunctions.net/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Local development URL (Firebase Emulator)
const DEV_CONFIG = {
  ...DEFAULT_CONFIG,
  baseURL: 'http://127.0.0.1:5001/swipemall/us-central1/api',
};

class SwipeMallAPI {
  constructor(config = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    
    this.client = axios.create(this.config);
    this.token = null;
    
    // Setup interceptors
    this.setupInterceptors();
  }

  // Setup request/response interceptors
  setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }
        
        const errorMessage = error.response?.data?.error || 
                           error.message || 
                           'An unexpected error occurred';
        
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  // Token management
  setToken(token) {
    this.token = token;
    // In React Native, you might want to store this in AsyncStorage
    // In web, you might want to store this in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('swipemall_token', token);
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('swipemall_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('swipemall_token');
    }
  }

  // Environment configuration
  setEnvironment(env) {
    if (env === 'development') {
      this.config = { ...this.config, ...DEV_CONFIG };
      this.client = axios.create(this.config);
      this.setupInterceptors();
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 1: Authentication APIs

  // Sign Up
  async signUp(userData) {
    try {
      const response = await this.client.post('/auth/signup', userData);
      
      if (response.success && response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Login
  async login(credentials) {
    try {
      const response = await this.client.post('/auth/login', credentials);
      
      if (response.success && response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      const response = await this.client.post('/auth/logout');
      this.clearToken();
      return response;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }

  // Request Password Reset
  async requestPasswordReset(phoneNumber) {
    try {
      const response = await this.client.post('/auth/reset-password', {
        phoneNumber,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Verify Reset Code and Update Password
  async verifyResetCode(phoneNumber, resetCode, newPassword) {
    try {
      const response = await this.client.post('/auth/verify-reset', {
        phoneNumber,
        resetCode,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get User Profile
  async getProfile() {
    try {
      const response = await this.client.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update User Profile
  async updateProfile(profileData) {
    try {
      const response = await this.client.put('/auth/profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Guest Session
  async createGuestSession() {
    try {
      const response = await this.client.post('/auth/guest-session');
      
      if (response.success && response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Convert Guest to User
  async convertGuestToUser(userData) {
    try {
      const response = await this.client.post('/auth/convert-guest', userData);
      
      if (response.success && response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Phase 2: Store Management APIs

  // Create Store (Admin only)
  async createStore(storeData) {
    try {
      const response = await this.client.post('/stores', storeData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get All Stores (Public)
  async getStores(params = {}) {
    try {
      const response = await this.client.get('/stores', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get Single Store (Public) - by slug or ID
  async getStore(storeSlug) {
    try {
      const response = await this.client.get(`/stores/${storeSlug}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update Store Profile (Store Owner or Admin) - by slug or ID
  async updateStore(storeSlug, updateData) {
    try {
      const response = await this.client.put(`/stores/${storeSlug}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Verify Store (Admin only) - by slug or ID
  async verifyStore(storeSlug, isVerified) {
    try {
      const response = await this.client.patch(`/stores/${storeSlug}/verify`, {
        isVerified,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get Store Analytics (Store Owner or Admin) - by slug or ID
  async getStoreAnalytics(storeSlug) {
    try {
      const response = await this.client.get(`/stores/${storeSlug}/analytics`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get Store Dashboard (Store Owner or Admin) - by slug or ID
  async getStoreDashboard(storeSlug) {
    try {
      const response = await this.client.get(`/stores/${storeSlug}/dashboard`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get Store Followers (Store Owner or Admin) - by slug or ID
  async getStoreFollowers(storeSlug, params = {}) {
    try {
      const response = await this.client.get(`/stores/${storeSlug}/followers`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 3: Product & Category Management APIs

  // Category Management APIs
  
  // Get All Categories (Public)
  async getCategories(params = {}) {
    try {
      const response = await this.client.get('/categories', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get Single Category (Public) - by slug or ID
  async getCategory(categorySlug) {
    try {
      const response = await this.client.get(`/categories/${categorySlug}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create Category (Admin only)
  async createCategory(categoryData) {
    try {
      const response = await this.client.post('/categories', categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update Category (Admin only) - by slug or ID
  async updateCategory(categorySlug, updateData) {
    try {
      const response = await this.client.put(`/categories/${categorySlug}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete Category (Admin only) - by slug or ID
  async deleteCategory(categorySlug) {
    try {
      const response = await this.client.delete(`/categories/${categorySlug}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Product Management APIs
  
  // Get All Products (Public with filters)
  async getProducts(params = {}) {
    try {
      const response = await this.client.get('/products', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get Single Product (Public)
  async getProduct(productId) {
    try {
      const response = await this.client.get(`/products/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create Product (Store Owner)
  async createProduct(productData) {
    try {
      const response = await this.client.post('/products', productData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update Product (Store Owner or Admin)
  async updateProduct(productId, updateData) {
    try {
      const response = await this.client.put(`/products/${productId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete Product (Store Owner or Admin)
  async deleteProduct(productId) {
    try {
      const response = await this.client.delete(`/products/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update Product Status (Store Owner or Admin)
  async updateProductStatus(productId, status) {
    try {
      const response = await this.client.patch(`/products/${productId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Product Approval APIs (Admin only)
  
  // Get Products Pending Approval (Admin only)
  async getPendingProducts(params = {}) {
    try {
      const response = await this.client.get('/admin/products/pending', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Approve Product (Admin only)
  async approveProduct(productId) {
    try {
      const response = await this.client.patch(`/admin/products/${productId}/approve`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Reject Product (Admin only)
  async rejectProduct(productId, rejectionReason) {
    try {
      const response = await this.client.patch(`/admin/products/${productId}/reject`, { rejectionReason });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 4: User Interactions & Swipe System APIs

  // Phase 4.1: User Product Swipe APIs
  
  // Record User Swipe
  async recordSwipe(swipeData) {
    try {
      const response = await this.client.post('/swipes', swipeData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get User Swipe History
  async getSwipeHistory(params = {}) {
    try {
      const response = await this.client.get('/swipes/history', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 4.2: Personalized Product Feed
  
  // Get Personalized Product Feed
  async getProductFeed(params = {}) {
    try {
      const response = await this.client.get('/feed', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 4.3: User Preferences Management
  
  // Get User Preferences
  async getUserPreferences() {
    try {
      const response = await this.client.get('/preferences');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update User Preferences
  async updateUserPreferences(preferences) {
    try {
      const response = await this.client.put('/preferences', preferences);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 4.4: Swipe Analytics
  
  // Get User Swipe Analytics
  async getSwipeAnalytics(params = {}) {
    try {
      const response = await this.client.get('/analytics/swipes', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 4.5: Search System APIs

  // Unified Search API
  async search(params = {}) {
    try {
      const response = await this.client.get('/search', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get User Search History
  async getSearchHistory(params = {}) {
    try {
      const response = await this.client.get('/search/history', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete Search History Item
  async deleteSearchHistoryItem(searchId) {
    try {
      const response = await this.client.delete(`/search/history/${searchId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Clear All Search History
  async clearSearchHistory() {
    try {
      const response = await this.client.delete('/search/history');
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 5: Social Features (User-Store Follow System) APIs

  // Phase 5.1: User-Store Follow/Unfollow APIs

  // Follow Store
  async followStore(storeSlug) {
    try {
      const response = await this.client.post('/stores/follow', { storeSlug });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Unfollow Store
  async unfollowStore(storeSlug) {
    try {
      const response = await this.client.delete('/stores/unfollow', { data: { storeSlug } });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check if Following Store
  async checkFollowingStore(storeSlug) {
    try {
      const response = await this.client.get(`/stores/${storeSlug}/following`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 5.2: User Following List APIs

  // Get User's Following List (Stores they follow)
  async getUserFollowing(params = {}) {
    try {
      const response = await this.client.get('/following', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 5.3: Store Followers APIs
  // Note: getStoreFollowers is already implemented in Phase 2

  // Phase 5.4: Following Activity Feed

  // Get Following Activity Feed
  async getFollowingFeed(params = {}) {
    try {
      const response = await this.client.get('/feed/following', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 5.5: Store Follow Analytics

  // Get Store Follow Analytics (Store Owner or Admin)
  async getStoreFollowAnalytics(storeSlug, params = {}) {
    try {
      const response = await this.client.get(`/stores/${storeSlug}/analytics/followers`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Phase 5.6: Follow Recommendations

  // Get Store Follow Recommendations
  async getStoreRecommendations(params = {}) {
    try {
      const response = await this.client.get('/recommendations/stores', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
const api = new SwipeMallAPI();

// Export class for custom instances
export { SwipeMallAPI };

// Export default instance
export default api;

// Named exports for convenience
export const {
  // Phase 1: Authentication
  signUp,
  login,
  logout,
  requestPasswordReset,
  verifyResetCode,
  getProfile,
  updateProfile,
  createGuestSession,
  convertGuestToUser,
  
  // Phase 2: Store Management
  createStore,
  getStores,
  getStore,
  updateStore,
  verifyStore,
  getStoreAnalytics,
  getStoreDashboard,
  getStoreFollowers,
  
  // Phase 3: Category Management
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Phase 3: Product Management
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  
  // Phase 3: Product Approval
  getPendingProducts,
  approveProduct,
  rejectProduct,
  
  // Phase 4: User Interactions & Swipe System
  recordSwipe,
  getSwipeHistory,
  getProductFeed,
  getUserPreferences,
  updateUserPreferences,
  getSwipeAnalytics,
  
  // Phase 4.5: Search System
  search,
  getSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
  
  // Phase 5: Social Features (User-Store Follow System)
  followStore,
  unfollowStore,
  checkFollowingStore,
  getUserFollowing,
  getFollowingFeed,
  getStoreFollowAnalytics,
  getStoreRecommendations,
  
  // Utilities
  healthCheck,
  isAuthenticated,
  setToken,
  clearToken,
  setEnvironment,
} = api; 