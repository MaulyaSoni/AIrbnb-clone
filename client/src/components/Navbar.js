// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaHome,
  FaCalendarAlt,
  FaHeart,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Shadow effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".menu-container")) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled
      ? "bg-white dark:bg-gray-800 shadow-md py-3"
      : "bg-white dark:bg-gray-800 py-3"
  }`;

  const menuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.2 }, transitionEnd: { display: "none" } },
    open: { opacity: 1, y: 0, display: "block", transition: { duration: 0.2 } },
  };

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <span className="text-2xl font-bold text-airbnb-pink">airbnb</span>
            </motion.div>
          </Link>

          {/* Search Bar (Desktop only) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Start your search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-airbnb-pink"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/properties" className="nav-link">Places to stay</Link>

            {isAuthenticated ? (
              <>
                <Link to="/add-property" className="nav-link">Host your home</Link>
                <Link to="/bookings" className="nav-link">My Bookings</Link>

                {/* Profile dropdown */}
                <div className="relative menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }}
                    className="flex items-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-1.5 px-3 hover:shadow-md transition-all duration-200"
                  >
                    <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name}</span>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-airbnb py-1 z-50 menu-container">
                      <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileMenuOpen(false)}>Profile</Link>
                      <Link to="/my-properties" className="dropdown-item" onClick={() => setIsProfileMenuOpen(false)}>My Properties</Link>
                      <button onClick={handleLogout} className="dropdown-item w-full text-left">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors duration-200">Register</Link>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-airbnb-pink"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-800 shadow-lg absolute top-full left-0 right-0"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/properties" className="mobile-link"><FaHome className="mr-3" /> Properties</Link>

              {isAuthenticated ? (
                <>
                  <Link to="/bookings" className="mobile-link"><FaCalendarAlt className="mr-3" /> Bookings</Link>
                  <Link to="/favorites" className="mobile-link"><FaHeart className="mr-3" /> Favorites</Link>

                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="px-3 py-2">
                    <div className="flex items-center mb-3">
                      <FaUser className="text-gray-500 mr-3" size={20} />
                      <span className="font-medium">{user?.name}</span>
                    </div>
                    <button onClick={handleLogout} className="w-full bg-airbnb-red text-white py-2 px-4 rounded-lg font-medium hover:bg-airbnb-dark">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-link">Log in</Link>
                  <Link to="/signup" className="mobile-link">Sign up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Common styles
const navLinkClasses = "text-gray-700 dark:text-gray-200 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
const dropdownItemClasses = "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200";
const mobileLinkClasses = "flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-colors duration-200";

// Attach styles globally
Object.assign(Navbar, {
  navLink: navLinkClasses,
  dropdownItem: dropdownItemClasses,
  mobileLink: mobileLinkClasses,
});

export default Navbar;
