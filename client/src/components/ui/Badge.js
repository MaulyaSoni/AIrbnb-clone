import React from 'react';
import { motion } from 'framer-motion';

const badgeVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  },
  exit: { scale: 0.8, opacity: 0 }
};

const variants = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  primary: 'bg-rose-100 text-rose-800',
  secondary: 'bg-gray-100 text-gray-800'
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  isAnimated = true,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  const Component = isAnimated ? motion.span : 'span';
  const animationProps = isAnimated ? {
    variants: badgeVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit'
  } : {};

  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...animationProps}
      {...props}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </Component>
  );
};

export default Badge;