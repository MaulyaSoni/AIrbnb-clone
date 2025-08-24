import React from 'react';
import AuthTest from '../components/AuthTest';

const AuthTestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Testing</h1>
      <p className="mb-4 text-gray-700">
        This page is for testing the authentication flow. Use the panel below to test registration, login, and logout functionality.
      </p>
      <div className="max-w-md">
        <AuthTest />
      </div>
    </div>
  );
};

export default AuthTestPage;