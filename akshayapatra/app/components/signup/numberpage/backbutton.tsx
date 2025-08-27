
import React from 'react';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior - go back in history
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex w-[18px] h-[18px] justify-center items-center absolute left-[50px] top-[105px] max-md:left-6 max-md:top-[60px] max-sm:left-4 max-sm:top-10 cursor-pointer ${className}`}
      aria-label="Go back"
      type="button"
    >
      <div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="arrow-icon"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.27275 2.97725C8.49242 3.19692 8.49242 3.55308 8.27275 3.77275L3.60799 8.4375H15.75C16.0607 8.4375 16.3125 8.68934 16.3125 9C16.3125 9.31066 16.0607 9.5625 15.75 9.5625H3.60799L8.27275 14.2273C8.49242 14.4469 8.49242 14.8031 8.27275 15.0227C8.05308 15.2424 7.69692 15.2424 7.47725 15.0227L1.85225 9.39775C1.63258 9.17808 1.63258 8.82192 1.85225 8.60225L7.47725 2.97725C7.69692 2.75758 8.05308 2.75758 8.27275 2.97725Z"
            fill="white"
          />
        </svg>
      </div>
    </button>
  );
};

