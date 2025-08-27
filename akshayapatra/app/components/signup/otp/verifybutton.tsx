import React from 'react';

interface VerifyButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const VerifyButton: React.FC<VerifyButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className="flex w-[358px] h-[59px] justify-center items-center gap-4 shrink-0 cursor-pointer p-4 rounded-[18px] bg-[#EE6200] hover:bg-[#d55600] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 max-md:-translate-x-2/4 max-md:left-2/4 max-sm:w-[calc(100%_-_40px)]"
      aria-label="Verify OTP code"
    >
      <span className="text-white text-center text-lg font-medium leading-6 max-sm:text-base">
        Verify
      </span>
    </button>
  );
};
