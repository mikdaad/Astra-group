
import React, { useState } from 'react';

interface ExploreButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const ExploreButton: React.FC<ExploreButtonProps> = ({ 
  onClick, 
  className = "",
  children = "Explore Now"
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action - could navigate or show more info
      console.log('Exploring Hyundai Creta...');
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`relative w-[89px] h-6 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#813200] ${
        isPressed ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'
      } ${className}`}
      aria-label="Explore Hyundai Creta details"
      type="button"
    >
      <svg 
        width="89" 
        height="24" 
        viewBox="0 0 89 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path 
          d="M0 6C0 2.68629 2.68629 0 6 0H83C86.3137 0 89 2.68629 89 6V18C89 21.3137 86.3137 24 83 24H6C2.68629 24 0 21.3137 0 18V6Z" 
          fill={isHovered ? "#E67332" : "#D56223"}
          className="transition-colors duration-200"
        />
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M76.2912 15.2473C76.2912 15.6101 76.5855 15.9045 76.9483 15.9045C77.3111 15.9045 77.6055 15.6101 77.6055 15.2473V7.79972C77.6055 7.43693 77.3111 7.14258 76.9483 7.14258L69.5007 7.14258C69.1379 7.14258 68.8436 7.43693 68.8436 7.79972C68.8436 8.1625 69.1379 8.45686 69.5007 8.45686H75.362L69.0361 14.7827C68.7794 15.0394 68.7794 15.4553 69.0361 15.712C69.2928 15.9687 69.7086 15.9687 69.9654 15.712L76.2912 9.3861L76.2912 15.2473Z" 
          fill="white"
          className={`transition-transform duration-200 ${isHovered ? 'translate-x-0.5' : ''}`}
        />
        <text 
          fill="white" 
          xmlSpace="preserve" 
          style={{whiteSpace: 'pre'}} 
          fontFamily="Montserrat" 
          fontSize="8" 
          fontWeight="600" 
          letterSpacing="0em"
        >
          <tspan x="9" y="14.868">{children}</tspan>
        </text>
      </svg>
    </button>
  );
};

