// API base URL - must be set via VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/login')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include', // Important for session cookies
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // If body is FormData, don't set Content-Type (browser will set it with boundary)
  // If body is provided and it's an object (but not FormData), stringify it
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  } else if (config.body instanceof FormData) {
    // Remove Content-Type header for FormData to let browser set it with boundary
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (data.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors).flat().join(', ');
        throw new Error(errorMessages || data.message || 'Validation failed');
      }
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    // If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise, wrap it in an Error
    throw new Error(error.message || 'An error occurred');
  }
}

/**
 * Login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} remember - Remember me option
 * @returns {Promise<object>} - Login response
 */
export async function login(email, password, remember = false) {
  return apiRequest('/login', {
    method: 'POST',
    body: {
      email,
      password,
      remember,
    },
  });
}

/**
 * Register API call
 * @param {string} name - User full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (admin, employee, client)
 * @param {File|null} avatar - Optional profile image file
 * @returns {Promise<object>} - Register response
 */
export async function register(name, email, password, role, avatar = null) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('role', role);
  
  if (avatar) {
    formData.append('avatar', avatar);
  }

  return apiRequest('/register', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Logout API call
 * @returns {Promise<object>} - Logout response
 */
export async function logout() {
  return apiRequest('/logout', {
    method: 'POST',
  });
}

/**
 * Get current authenticated user
 * @returns {Promise<object>} - User data
 */
export async function getCurrentUser() {
  return apiRequest('/user');
}

/**
 * Update user profile
 * @param {string} name - User full name (optional)
 * @param {string} email - User email (optional)
 * @param {string} password - User password (optional)
 * @param {File|null} avatar - Optional profile image file
 * @returns {Promise<object>} - Update response
 */
export async function updateProfile(name = null, email = null, password = null, avatar = null) {
  const formData = new FormData();
  
  if (name !== null) {
    formData.append('name', name);
  }
  if (email !== null) {
    formData.append('email', email);
  }
  if (password !== null && password !== '') {
    formData.append('password', password);
  }
  if (avatar) {
    formData.append('avatar', avatar);
  }

  return apiRequest('/user/update', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Get the base URL for the backend (without /api)
 * Useful for constructing asset URLs like avatars
 * @returns {string} - Base URL
 */
export function getBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
  // Remove /api from the end if present to get base URL
  const baseUrl = apiBaseUrl.replace(/\/api$/, '');
  // If no environment variable is set, use relative path
  return baseUrl || '';
}

export default {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  getBaseUrl,
};

