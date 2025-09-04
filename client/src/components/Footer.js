// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaHeart,
  FaHome,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FaFacebook />, url: "https://facebook.com", label: "Facebook" },
    { icon: <FaTwitter />, url: "https://twitter.com", label: "Twitter" },
    { icon: <FaInstagram />, url: "https://instagram.com", label: "Instagram" },
    { icon: <FaLinkedin />, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: <FaGithub />, url: "https://github.com", label: "GitHub" },
  ];

  const footerLinks = [
    {
      title: "Community",
      links: [
        { name: "Places to stay", url: "/properties" },
        { name: "Host your home", url: "/add-property" },
        { name: "Experiences", url: "/experiences" },
        { name: "Online Experiences", url: "/online-experiences" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", url: "/help" },
        { name: "Safety information", url: "/safety" },
        { name: "Cancellation options", url: "/cancellations" },
        { name: "Our COVID-19 Response", url: "/covid" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", url: "/terms" },
        { name: "Privacy Policy", url: "/privacy" },
        { name: "Cookie Policy", url: "/cookies" },
      ],
    },
  ];

  return (
    <motion.footer
      className="bg-gray-900 text-white pt-12 pb-6 mt-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo + Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="bg-airbnb-red p-2 rounded-lg mr-2">
                <FaHome className="text-white text-xl" />
              </div>
              <span className="font-bold text-airbnb-red text-lg">
                Airbnb Clone
              </span>
            </Link>
            <p className="text-gray-400 mb-4 text-sm max-w-md">
              Find unique places to stay with local hosts in 191+ countries.
              Feel at home anywhere you go in the world.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Columns */}
          {footerLinks.map((col, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold mb-4">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      to={link.url}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <p className="mb-4 sm:mb-0">
            © {currentYear} Airbnb Clone. All rights reserved.
          </p>
          <p className="flex items-center">
            Made with <FaHeart className="text-airbnb-red mx-1" /> by Your Name
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
