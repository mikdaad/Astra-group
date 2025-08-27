import React from 'react';

interface SuccessIllustrationProps {
  className?: string;
}

export const SuccessIllustration: React.FC<SuccessIllustrationProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src="https://api.builder.io/api/v1/image/assets/9e14ec760a13409cba0be5c570ba1763/dbcba35c99684b1ca78e230d19d445d5aa2e18a8?placeholderIfAbsent=true"
        alt="Success illustration - profile setup complete"
        className="aspect-[1.38] object-contain w-[281px] max-w-full"
      />
    </div>
  );
};
