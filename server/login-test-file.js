const fs = require('fs');
const axios = require('axios');

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

// Function to test login
async function testLogin() {
  const logFile = fs.createWriteStream('./login-test-results.txt', { flags: 'w' });
  
  logFile.write('Starting login test script...\n');
  
  try {
    logFile.write(`Testing login with credentials: ${JSON.stringify(testCredentials)}\n`);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', testCredentials);
    
    logFile.write('Login successful!\n');
    logFile.write(`Response status: ${response.status}\n`);
    logFile.write(`Response data: ${JSON.stringify(response.data, null, 2)}\n`);
    
    return response.data;
  } catch (error) {
    logFile.write('Login failed!\n');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logFile.write(`Response status: ${error.response.status}\n`);
      logFile.write(`Response data: ${JSON.stringify(error.response.data, null, 2)}\n`);
      logFile.write(`Response headers: ${JSON.stringify(error.response.headers, null, 2)}\n`);
    } else if (error.request) {
      // The request was made but no response was received
      logFile.write(`No response received: ${error.request}\n`);
    } else {
      // Something happened in setting up the request that triggered an Error
      logFile.write(`Error message: ${error.message}\n`);
    }
    
    return null;
  } finally {
    logFile.end();
  }
}

// Run the test
testLogin();