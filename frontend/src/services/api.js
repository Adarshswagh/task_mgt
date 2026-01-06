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

/**
 * Get all employees
 * @returns {Promise<object>} - Employees list
 */
export async function getEmployees() {
  return apiRequest('/employees', {
    method: 'GET',
  });
}

/**
 * Get single employee by ID
 * @param {number} id - Employee ID
 * @returns {Promise<object>} - Employee data
 */
export async function getEmployee(id) {
  return apiRequest(`/employees/${id}`, {
    method: 'GET',
  });
}

/**
 * Create new employee
 * @param {object} employeeData - Employee data
 * @param {File|null} document - Optional document file
 * @returns {Promise<object>} - Create response
 */
export async function createEmployee(employeeData, document = null) {
  const formData = new FormData();
  
  Object.keys(employeeData).forEach(key => {
    if (employeeData[key] !== null && employeeData[key] !== undefined && employeeData[key] !== '') {
      formData.append(key, employeeData[key]);
    }
  });
  
  if (document) {
    formData.append('document', document);
  }

  return apiRequest('/employees', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Update employee
 * @param {number} id - Employee ID
 * @param {object} employeeData - Employee data
 * @param {File|null} document - Optional document file
 * @returns {Promise<object>} - Update response
 */
export async function updateEmployee(id, employeeData, document = null) {
  const formData = new FormData();
  
  Object.keys(employeeData).forEach(key => {
    if (employeeData[key] !== null && employeeData[key] !== undefined && employeeData[key] !== '') {
      formData.append(key, employeeData[key]);
    }
  });
  
  if (document) {
    formData.append('document', document);
  }

  return apiRequest(`/employees/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

/**
 * Delete employee
 * @param {number} id - Employee ID
 * @returns {Promise<object>} - Delete response
 */
export async function deleteEmployee(id) {
  return apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all projects
 * @returns {Promise<object>} - Projects list
 */
export async function getProjects() {
  return apiRequest('/projects', {
    method: 'GET',
  });
}

/**
 * Get single project by ID
 * @param {number} id - Project ID
 * @returns {Promise<object>} - Project data
 */
export async function getProject(id) {
  return apiRequest(`/projects/${id}`, {
    method: 'GET',
  });
}

/**
 * Create new project
 * @param {object} projectData - Project data
 * @param {File[]} documents - Array of document files
 * @returns {Promise<object>} - Create response
 */
export async function createProject(projectData, documents = []) {
  const formData = new FormData();
  
  Object.keys(projectData).forEach(key => {
    if (projectData[key] !== null && projectData[key] !== undefined && projectData[key] !== '') {
      formData.append(key, projectData[key]);
    }
  });
  
  // Append multiple documents
  documents.forEach((file, index) => {
    formData.append('documents[]', file);
  });

  return apiRequest('/projects', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Update project
 * @param {number} id - Project ID
 * @param {object} projectData - Project data
 * @param {File[]} documents - Array of additional document files
 * @returns {Promise<object>} - Update response
 */
export async function updateProject(id, projectData, documents = []) {
  const formData = new FormData();
  
  Object.keys(projectData).forEach(key => {
    if (projectData[key] !== null && projectData[key] !== undefined && projectData[key] !== '') {
      formData.append(key, projectData[key]);
    }
  });
  
  // Append additional documents
  documents.forEach((file) => {
    formData.append('documents[]', file);
  });

  return apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

/**
 * Delete project
 * @param {number} id - Project ID
 * @returns {Promise<object>} - Delete response
 */
export async function deleteProject(id) {
  return apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Delete project document
 * @param {number} projectId - Project ID
 * @param {number} documentId - Document ID
 * @returns {Promise<object>} - Delete response
 */
export async function deleteProjectDocument(projectId, documentId) {
  return apiRequest(`/projects/${projectId}/documents/${documentId}`, {
    method: 'DELETE',
  });
}

export default {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  getBaseUrl,
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  deleteProjectDocument,
};

