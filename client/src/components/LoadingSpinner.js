import React from 'react';
import { motion } from 'framer-motion';
import { shimmer } from '../utils/animations';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  // Size variants
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  // Spinner animation
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}
        style={{ borderTopColor: '#FF385C' }}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
      {text && (
        <motion.p 
          className="mt-3 text-gray-600 font-medium"
          variants={shimmer}
          initial="hidden"
          animate="animate"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;