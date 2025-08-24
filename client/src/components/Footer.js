import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-airbnb-pink mb-4 block">
              airbnb
            </Link>
            <p className="text-gray-600 mb-4 max-w-md">
              Find unique places to stay with local hosts in 191+ countries. 
              Feel at home anywhere you go in the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-airbnb-pink transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-airbnb-pink transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-airbnb-pink transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-airbnb-pink transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/properties" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Places to stay
                </Link>
              </li>
              <li>
                <Link to="/add-property" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Host your home
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Experiences
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Online Experiences
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Safety information
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Cancellation options
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors">
                  Our COVID-19 Response
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-airbnb-pink transition-colors text-sm">
                Sitemap
              </a>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 Airbnb Clone. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
