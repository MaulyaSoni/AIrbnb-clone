import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ResponsiveNavbar from './components/ResponsiveNavbar';
import ResponsiveFooter from './components/ResponsiveFooter';
import AnimatedRoutes from './components/AnimatedRoutes';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <ResponsiveNavbar />
          <main className="pt-16">
            <AnimatedRoutes />
          </main>
          <ResponsiveFooter />
          <BackToTop />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
