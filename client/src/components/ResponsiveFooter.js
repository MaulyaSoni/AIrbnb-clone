import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaHeart, FaHome } from 'react-icons/fa';
import { fadeIn } from '../utils/animations';

const ResponsiveFooter = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: <FaFacebook />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <FaTwitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <FaInstagram />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <FaLinkedin />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <FaGithub />, url: 'https://github.com', label: 'GitHub' }
  ];

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', url: '/about' },
        { name: 'Careers', url: '/careers' },
        { name: 'Press', url: '/press' },
        { name: 'Blog', url: '/blog' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', url: '/help' },
        { name: 'Safety Center', url: '/safety' },
        { name: 'Community Guidelines', url: '/guidelines' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', url: '/terms' },
        { name: 'Privacy Policy', url: '/privacy' },
        { name: 'Cookie Policy', url: '/cookies' },
      ]
    },
  ];

  return (
    <motion.footer 
      className="bg-gray-900 text-white pt-12 pb-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="flex items-center">
                <div className="bg-airbnb-red p-2 rounded-lg mr-2">
                  <FaHome className="text-white text-xl" />
                </div>
                <span className="font-bold text-airbnb-red text-lg">Airbnb Clone</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-4 text-sm">
              Find the perfect place to stay at an amazing price in over 191 countries. 
              Browse vacation home rentals, apartments, villas, cabins, and unique homes.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.url} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Mobile App Links */}
        <div className="border-t border-gray-800 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-semibold mb-2">Get the App</h4>
              <div className="flex space-x-3">
                <motion.a 
                  href="#" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-xs flex items-center transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5,2H8.5C6.6,2,5,3.6,5,5.5v13C5,20.4,6.6,22,8.5,22h9c1.9,0,3.5-1.6,3.5-3.5v-13C21,3.6,19.4,2,17.5,2z M13,20.5h-2v-1h2V20.5z M18,17.5H8V5h10V17.5z"/>
                  </svg>
                  App Store
                </motion.a>
                <motion.a 
                  href="#" 
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-xs flex items-center transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.7,3.7,2,4.5,2h15C20.3,2,21,2.7,21,3.5v17c0,0.8-0.7,1.5-1.5,1.5h-15C3.7,22,3,21.3,3,20.5z M7.7,14.7l-1.4,1.4L12,21l5.7-4.9l-1.4-1.4L12,18.3L7.7,14.7z M12,3l-5.7,4.9l1.4,1.4L12,5.7l4.3,3.7l1.4-1.4L12,3z"/>
                  </svg>
                  Google Play
                </motion.a>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p>© {currentYear} Airbnb Clone. All rights reserved.</p>
              <p className="mt-1 flex items-center">
                Made with <FaHeart className="text-airbnb-red mx-1" /> by Your Name
              </p>
            </div>
          </div>
        </div>
        
        {/* Language and Currency Selector (Mobile-friendly) */}
        <div className="border-t border-gray-800 pt-6 mt-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
            <select className="bg-gray-800 text-gray-300 rounded-md py-2 px-3 mb-3 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-airbnb-red text-sm">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
            
            <select className="bg-gray-800 text-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-airbnb-red text-sm">
              <option value="usd">$ USD</option>
              <option value="eur">€ EUR</option>
              <option value="gbp">£ GBP</option>
              <option value="jpy">¥ JPY</option>
            </select>
          </div>
          
          <div className="text-xs text-gray-500">
            <Link to="/sitemap" className="hover:text-gray-300 transition-colors duration-200">Sitemap</Link>
            <span className="mx-2">·</span>
            <Link to="/accessibility" className="hover:text-gray-300 transition-colors duration-200">Accessibility</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default ResponsiveFooter;