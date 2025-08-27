
import React from 'react';

interface DoneButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const DoneButton: React.FC<DoneButtonProps> = ({ 
  onClick,
  children = "Done",
  disabled = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior - could navigate or show success message
      console.log('Profile setup completed!');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="justify-center items-center flex min-h-[59px] w-[358px] max-w-full gap-4 text-[19px] text-white font-medium whitespace-nowrap text-center leading-none px-4 py-[17px] rounded-[18px] bg-[#EE6200] hover:bg-[#CC5500] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#EE6200] focus:ring-offset-2 focus:ring-offset-[#4D2309]"
      aria-label="Complete profile setup"
    >
      <span className="text-white self-stretch my-auto">
        {children}
      </span>
    </button>
  );
};

