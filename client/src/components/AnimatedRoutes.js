import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

// Import pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import LoginTest from '../pages/LoginTest';
import Register from '../pages/Register';
import PropertyList from '../pages/PropertyList';
import PropertyDetail from '../pages/PropertyDetail';
import Profile from '../pages/Profile';
import AddProperty from '../pages/AddProperty';
import EditProperty from '../pages/EditProperty';
import Bookings from '../pages/Bookings';
import AuthTestPage from '../pages/AuthTestPage';
import PaymentSuccess from '../pages/PaymentSuccess';
import MyProperties from '../pages/MyProperties';
import ProtectedRoute from './ProtectedRoute';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        <Route path="/login-test" element={
          <PageTransition>
            <LoginTest />
          </PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition>
            <Register />
          </PageTransition>
        } />
        <Route path="/properties" element={
          <PageTransition>
            <PropertyList />
          </PageTransition>
        } />
        {/* <Route path="/property/:id" element={
          <PageTransition>
            <PropertyDetail />
          </PageTransition>
        } /> */}
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/auth-test" element={
          <PageTransition>
            <AuthTestPage />
          </PageTransition>
        } />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={
            <PageTransition>
              <Profile />
            </PageTransition>
          } />
          <Route path="/add-property" element={
            <PageTransition>
              <AddProperty />
            </PageTransition>
          } />
          <Route path="/bookings" element={
            <PageTransition>
              <Bookings />
            </PageTransition>
          } />
          <Route path="/payment/success" element={
            <PageTransition>
              <PaymentSuccess />
            </PageTransition>
          } />
          <Route path="/my-properties" element={
            <PageTransition>
              <MyProperties />
            </PageTransition>
          } />
          <Route path="/edit-property/:id" element={
            <PageTransition>
              <EditProperty />
            </PageTransition>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;