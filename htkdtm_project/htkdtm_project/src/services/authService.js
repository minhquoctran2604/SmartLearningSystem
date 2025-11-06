import api from './apiService.js';

// No more mock fallback for auth endpoints
// Auth must work with real API or fail properly

/**
 * Login với real API hoặc fallback to mock
 */
export const login = async (email, password) => {
  // FORCE REAL API - NO FALLBACK
  const response = await api.post('/api/auth/login', {
    email: email,
    password: password
  });
  
  console.log('🔍 Backend response:', response.data);
  
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    console.log('✅ Token saved successfully');
    return { success: true, user: response.data.user };
  }
  
  throw new Error('Login failed - no access_token in response');
};

/**
 * Register với real API - NO FALLBACK
 */
export const register = async (email, password, name) => {
  console.log('📤 Sending register request:', {
    email,
    password: '***',
    full_name: name,
    passwordLength: password?.length
  });

  try {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      full_name: name
    });
    
    console.log('✅ Register response:', response.data);
    
    // Save token if provided
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      console.log('✅ Token saved successfully');
    }
    
    return { success: true, user: response.data.user };
  } catch (error) {
    // Log detailed validation errors
    if (error.response?.status === 422) {
      console.error('❌ Validation failed:', error.response.data);
      throw new Error(error.response.data.detail || 'Validation failed');
    }
    
    console.error('❌ Register failed:', error.message);
    throw error;
  }
};

/**
 * Logout - xóa token và redirect
 */
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
