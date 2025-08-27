
import React from 'react';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = "",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const responsiveSizeClasses = {
    sm: 'max-md:w-3 max-md:h-3 max-sm:w-3 max-sm:h-3',
    md: 'max-md:w-[18px] max-md:h-[18px] max-sm:w-4 max-sm:h-4',
    lg: 'max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${responsiveSizeClasses[size]} shrink-0 relative rounded-[804.776px] bg-gradient-to-br from-orange-400 to-orange-600 ${className}`}
      role="img"
      aria-label="User avatar"
    />
  );
};

