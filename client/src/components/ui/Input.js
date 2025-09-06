import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const inputVariants = {
  focus: { scale: 1.02 },
  blur: { scale: 1 }
};

const Input = forwardRef(({ 
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  type = 'text',
  required = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseInputStyles = 'w-full px-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2';
  const validStyles = 'border-gray-300 focus:border-rose-500 focus:ring-rose-500/20';
  const errorStyles = 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50';
  const disabledStyles = 'bg-gray-100 cursor-not-allowed opacity-75';
  
  const inputStyles = `
    ${baseInputStyles}
    ${error ? errorStyles : validStyles}
    ${disabled ? disabledStyles : ''}
    ${className}
  `;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}

        <motion.input
          ref={ref}
          type={type}
          variants={inputVariants}
          whileFocus="focus"
          animate="blur"
          className={`
            ${inputStyles}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {(error || helper) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helper}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;