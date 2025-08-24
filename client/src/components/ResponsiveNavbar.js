import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSearch, FaUserCircle, FaHome, FaHeart, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { fadeIn, slideIn } from '../utils/animations';

const ResponsiveNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`;

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      },
      transitionEnd: {
        display: 'none'
      }
    },
    open: {
      opacity: 1,
      y: 0,
      display: 'block',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <div className="bg-airbnb-red p-2 rounded-lg mr-2">
                <FaHome className="text-white text-xl" />
              </div>
              <span className="font-bold text-airbnb-red text-lg">Airbnb Clone</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/properties" className="text-gray-800 hover:text-airbnb-red px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Properties
            </Link>
            {user ? (
              <>
                <Link to="/favorites" className="text-gray-800 hover:text-airbnb-red px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Favorites
                </Link>
                <Link to="/bookings" className="text-gray-800 hover:text-airbnb-red px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Bookings
                </Link>
                <div className="relative ml-3">
                  <motion.button
                    className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full py-1.5 px-3 hover:shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaUserCircle className="text-gray-500" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button 
                    className="text-gray-800 hover:text-airbnb-red px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Log in
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button 
                    className="bg-airbnb-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-airbnb-dark transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign up
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-airbnb-red focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                to="/properties" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-airbnb-red transition-colors duration-200"
              >
                <div className="flex items-center">
                  <FaHome className="mr-3" /> Properties
                </div>
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/favorites" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-airbnb-red transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <FaHeart className="mr-3" /> Favorites
                    </div>
                  </Link>
                  
                  <Link 
                    to="/bookings" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-airbnb-red transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-3" /> Bookings
                    </div>
                  </Link>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  <div className="px-3 py-2">
                    <div className="flex items-center mb-3">
                      <FaUserCircle className="text-gray-500 mr-3" size={24} />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    
                    <button 
                      onClick={logout}
                      className="w-full bg-airbnb-red text-white py-2 px-4 rounded-lg font-medium hover:bg-airbnb-dark transition-colors duration-200"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-airbnb-red transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  
                  <Link 
                    to="/signup" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-airbnb-red transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default ResponsiveNavbar;