const axios = require('axios');

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

console.log('Starting login test script...');

// Function to test login
async function testLogin() {
  try {
    console.log('Testing login with credentials:', testCredentials);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', testCredentials);
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Login failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    return null;
  }
}

// Run the test
testLogin().then(() => {
  console.log('Test completed');
}).catch(err => {
  console.error('Unexpected error:', err);
});