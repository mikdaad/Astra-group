import React, { useState, useRef } from 'react';
import { OTPInput } from './otpinput'
import { VerifyButton } from './verifybutton';

interface stepprops {
  setstep: (step: number) => void;
  step: number;
}

export const OTPForm: React.FC<stepprops> = ({step,
  setstep   
}) => {
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOTPChange = (index: number, value: string) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowRight' && index < 3) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleVerify = () => {
    const otpCode = otpValues.join('');
    if (otpCode.length === 4) {
      console.log('OTP Code:', otpCode);
      // Handle OTP verification logic here
    }
    setstep(step + 1); // Move to the next step after verification
  };

  const handleResendCode = () => {
    console.log('Resending code...');
    // Handle resend code logic here
  };

  const isComplete = otpValues.every(value => value !== '');

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleVerify();
      }}
      className="w-[358px] h-[216px] shrink-0 absolute left-[79px] top-[68px] max-md:-translate-x-2/4 max-md:left-2/4 max-sm:w-full max-sm:px-5 max-sm:py-0 max-sm:left-0"
    >
      <div className="flex w-[358px] flex-col items-start gap-8 absolute h-40 left-0 top-0 max-sm:w-full">
        <div className="flex flex-col items-start gap-4 self-stretch relative px-1 py-0">
          <h1 className="self-stretch text-[#F9F8F8] text-center text-2xl font-medium leading-7 relative max-sm:text-xl max-sm:leading-6">
            Enter OTP
          </h1>
          <p className="self-stretch text-[#F9F8F8] text-center text-base font-normal leading-6 tracking-[0.2px] relative max-sm:text-sm max-sm:leading-5">
            Code sent to +6528891231
          </p>
        </div>
        <div 
          className="flex w-[358px] justify-between items-end relative rounded-[18px] max-sm:w-full"
          role="group"
          aria-label="OTP input fields"
        >
          {otpValues.map((value, index) => (
            <OTPInput
              key={index}
              value={value}
              onChange={(newValue) => handleOTPChange(index, newValue)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              index={index}
              autoFocus={index === 0}
            />
          ))}
        </div>
      </div>
      <div className="flex w-[358px] flex-col items-start gap-2 absolute h-[22px] left-0 top-[194px] max-sm:w-full">
        <div className="flex justify-center items-center gap-2 self-stretch relative px-1 py-0">
          <p className="flex-[1_0_0] text-[#CBCAD4] text-center text-sm font-normal leading-[22px] tracking-[0.2px] relative max-sm:text-xs max-sm:leading-[18px]">
          Didn&apos;t receive code?{' '}

            <button
              type="button"
              onClick={handleResendCode}
              className="text-[#EE6200] hover:text-[#d55600] underline cursor-pointer bg-transparent border-none p-0 font-inherit"
            >
              Resend code
            </button>
          </p>
        </div>
        <div className=" max-md:-translate-x-2/4 max-md:left-2/4 max-sm:w-[calc(100%_-_40px)] max-sm:left-5 my-4">
        <VerifyButton onClick={handleVerify} disabled={!isComplete} />
      </div>
      </div>
      
    </form>
  );
};

