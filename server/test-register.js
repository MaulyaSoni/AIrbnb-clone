const axios = require('axios');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  phone: '1234567890'
};

console.log('Starting registration test script...');

// Function to test registration
async function testRegister() {
  try {
    console.log('Attempting to register user with data:', testUser);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    return null;
  }
}

// Function to test login with the newly registered user
async function testLogin() {
  try {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    console.log('\nAttempting to login with:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Login failed!');
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    return null;
  }
}

// Run the tests
async function runTests() {
  try {
    // First register
    const registrationResult = await testRegister();
    
    // Then try to login if registration was successful
    if (registrationResult && registrationResult.token) {
      await testLogin();
    }
  } catch (err) {
    console.error('Unexpected error during tests:', err);
  }
}

runTests();