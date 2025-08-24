/**
 * Utility functions for handling authentication and API errors
 */

import toast from 'react-hot-toast';

/**
 * Handle authentication errors with appropriate user messages
 * @param {Error} error - The error object from API call
 * @param {string} defaultMessage - Default message to show if no specific error is found
 */
export const handleAuthError = (error, defaultMessage = 'Authentication failed') => {
  console.error('Auth Error:', error);
  
  // Extract error message from response if available
  const errorMessage = error.response?.data?.message || defaultMessage;
  
  // Show toast notification with error message
  toast.error(errorMessage);
  
  return { success: false, message: errorMessage };
};

/**
 * Format validation errors from the server
 * @param {Object} errors - Validation errors object
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) {
    return 'Validation failed';
  }
  
  return errors.map(err => err.msg).join(', ');
};

/**
 * Check if error is an authentication error (401 or 403)
 * @param {Error} error - The error object
 * @returns {boolean} True if it's an auth error
 */
export const isAuthError = (error) => {
  return error.response && (error.response.status === 401 || error.response.status === 403);
};