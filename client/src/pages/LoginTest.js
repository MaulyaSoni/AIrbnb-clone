import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';

const LoginTest = () => {
  const [formData, setFormData] = useState({
    email: 'testuser@example.com',
    password: 'password123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDirectApiCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo(null);

    try {
      // Log the request details
      console.log('Making direct API call to:', '/auth/login');
      console.log('With data:', { email: formData.email, password: formData.password });
      
      // Make direct API call
      const response = await api.post('/auth/login', { 
        email: formData.email, 
        password: formData.password 
      });
      
      // Log the response
      console.log('API Response:', response);
      
      setDebugInfo({
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      });
      
      toast.success('Direct API call successful!');
    } catch (error) {
      console.error('Direct API call error:', error);
      
      setDebugInfo({
        success: false,
        error: {
          message: error.message,
          response: error.response ? {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers
          } : null
        }
      });
      
      toast.error(`Direct API call failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo(null);

    try {
      console.log('Attempting login with:', { email: formData.email, password: formData.password });
      const result = await login(formData.email, formData.password);
      
      console.log('Login result:', result);
      setDebugInfo({ loginResult: result });
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setDebugInfo({ error: error.toString() });
      toast.error('An error occurred during login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-airbnb-pink">
            airbnb
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Login Test Page
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This page is for testing login functionality
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in (Context)'}
              </button>
              
              <button
                type="button"
                onClick={handleDirectApiCall}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing...' : 'Test Direct API'}
              </button>
            </div>
          </form>

          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-100 rounded overflow-auto max-h-96">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Debug Information</h3>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginTest;