'use client'

import React from 'react';

// Define the types for the component's props for better type safety.
interface ButtonProps {
  children: React.ReactNode; // Allows any valid React child
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; // Optional click handler
  type?: 'button' | 'submit' | 'reset'; // Restrict type to valid button types
  className?: string; // Optional custom classes for additional styling
  disabled?: boolean; // Optional disabled state
}

/**
 * A reusable button component with a consistent style.
 * @param {React.ReactNode} children - The content to be displayed inside the button.
 * @param {Function} onClick - The function to call when the button is clicked.
 * @param {string} type - The type of the button (e.g., 'button', 'submit').
 * @param {string} className - Additional CSS classes to apply to the button.
 * @param {boolean} disabled - Whether the button should be disabled.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) => {
  // Base classes for the button styling
  const baseClasses =
    'w-full rounded-xl bg-gradient-to-b from-orange-500 to-orange-700 py-3 text-lg font-medium text-white transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50';
  
  // Classes for the disabled state
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClasses : ''} ${className}`}
      aria-label="next"
      role="button"
      tabIndex={0}
    >
      {children}
    </button>
  );
};

export default Button;
