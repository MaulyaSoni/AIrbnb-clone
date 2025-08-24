/**
 * This is a utility file to help test the authentication flow
 * It can be imported and used in the browser console for testing
 */

import api from './api';

/**
 * Test the complete authentication flow
 */
export const testAuthFlow = async () => {
  console.log('Starting authentication flow test...');
  
  // Test variables
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    phone: '1234567890'
  };
  
  let token = null;
  
  try {
    // Step 1: Register a new user
    console.log('Step 1: Testing registration...');
    const registerResponse = await api.post('/auth/register', testUser);
    console.log('Registration successful:', registerResponse.data);
    token = registerResponse.data.token;
    
    // Step 2: Logout (clear token)
    console.log('Step 2: Testing logout...');
    localStorage.removeItem('token');
    console.log('Logout successful');
    
    // Step 3: Login with the new user
    console.log('Step 3: Testing login...');
    const loginResponse = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', loginResponse.data);
    token = loginResponse.data.token;
    
    // Step 4: Get user profile with token
    console.log('Step 4: Testing protected route access...');
    const userResponse = await api.get('/auth/me');
    console.log('User profile retrieved:', userResponse.data);
    
    console.log('Authentication flow test completed successfully!');
    return { success: true, message: 'All tests passed!' };
  } catch (error) {
    console.error('Authentication test failed:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Test failed', 
      error 
    };
  }
};

// Export the test function to make it available in the browser console
window.testAuthFlow = testAuthFlow;

export default testAuthFlow;