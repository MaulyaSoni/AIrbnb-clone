import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * A component to test authentication functionality
 * This can be added to any page for testing purposes
 */
const AuthTest = () => {
  const { login, register, logout, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testEmail] = useState(`test${Date.now()}@example.com`);
  const [testPassword] = useState('password123');

  const handleTestRegister = async () => {
    setLoading(true);
    try {
      const result = await register({
        name: 'Test User',
        email: testEmail,
        password: testPassword,
        phone: '1234567890'
      });
      
      if (result.success) {
        toast.success('Test registration successful!');
      } else {
        toast.error(`Test registration failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Test registration error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      const result = await login(testEmail, testPassword);
      
      if (result.success) {
        toast.success('Test login successful!');
      } else {
        toast.error(`Test login failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Test login error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogout = () => {
    logout();
    toast.success('Test logout successful!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Authentication Test Panel</h2>
      
      <div className="mb-4">
        <p className="text-sm mb-2">Test Credentials:</p>
        <p className="text-xs text-gray-600">Email: {testEmail}</p>
        <p className="text-xs text-gray-600">Password: {testPassword}</p>
      </div>
      
      <div className="mb-4">
        <p className="text-sm mb-2">Current Status:</p>
        <p className="text-xs text-gray-600">
          {isAuthenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
        </p>
        {isAuthenticated && user && (
          <p className="text-xs text-gray-600">Logged in as: {user.name}</p>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleTestRegister}
          disabled={loading || isAuthenticated}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {loading ? 'Testing...' : 'Test Register'}
        </button>
        
        <button
          onClick={handleTestLogin}
          disabled={loading || isAuthenticated}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        
        <button
          onClick={handleTestLogout}
          disabled={loading || !isAuthenticated}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Test Logout
        </button>
      </div>
    </div>
  );
};

export default AuthTest;