
import React from 'react';

interface NextButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  text?: string;
  className?: string;
}

export const NextButton: React.FC<NextButtonProps> = ({ 
  onClick, 
  disabled = false, 
  loading = false, 
  text = 'Next',
  className = '' 
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`flex w-[358px] h-[59px] justify-center items-center gap-4 absolute cursor-pointer p-4 rounded-[18px] left-[461px] top-[530px] max-md:w-[calc(100%_-_48px)] max-md:max-w-[500px] max-md:top-[480px] max-md:inset-x-6 max-sm:w-[calc(100%_-_32px)] max-sm:h-[52px] max-sm:px-4 max-sm:py-3.5 max-sm:top-[420px] max-sm:inset-x-4 transition-all duration-200 ${
        disabled || loading 
          ? 'bg-gray-600 cursor-not-allowed opacity-50' 
          : 'bg-[#EE6200] hover:bg-[#D55500] active:bg-[#C04D00]'
      } ${className}`}
      aria-label={loading ? 'Loading...' : text}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-center text-[19px] font-medium leading-[25px] max-sm:text-[17px]">
            Loading...
          </span>
        </div>
      ) : (
        <span className="text-white text-center text-[19px] font-medium leading-[25px] max-sm:text-[17px]">
          {text}
        </span>
      )}
    </button>
  );
};

