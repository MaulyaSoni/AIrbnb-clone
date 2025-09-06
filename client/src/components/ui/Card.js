import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  hover: {
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};

const Card = ({
  children,
  className = '',
  isInteractive = false,
  isLoading = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-sm overflow-hidden';
  const hoverStyles = isInteractive ? 'hover:shadow-xl transition-shadow duration-300' : '';
  
  if (isLoading) {
    return (
      <div className={`${baseStyles} ${className} animate-pulse`}>
        <div className="h-48 bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  const Component = isInteractive ? motion.div : 'div';
  const interactiveProps = isInteractive ? {
    variants: cardVariants,
    initial: 'hidden',
    animate: 'visible',
    whileHover: 'hover',
    onClick
  } : {};

  return (
    <Component
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...interactiveProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-b ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-t bg-gray-50 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;