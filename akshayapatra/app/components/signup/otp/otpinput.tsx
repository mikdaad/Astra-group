import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  index: number;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ 
  value, 
  onChange, 
  onKeyDown, 
  index,
  autoFocus 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 1 && /^[0-9]*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex w-[60px] h-[60px] flex-col items-start gap-2 shrink-0 border relative bg-[#1F0D05] px-4 py-2 rounded-lg border-solid border-[#2A1203] max-sm:w-[50px] max-sm:h-[50px]">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        className="self-stretch text-[#C9CCD8] text-center text-[28px] font-bold bg-transparent border-none outline-none max-sm:text-2xl"
        aria-label={`OTP digit ${index + 1}`}
        autoComplete="one-time-code"
      />
      {!value && (
        <div className="self-stretch text-[#C9CCD8] text-center text-[28px] font-bold absolute inset-0 flex items-center justify-center pointer-events-none max-sm:text-2xl">
          •
        </div>
      )}
    </div>
  );
};