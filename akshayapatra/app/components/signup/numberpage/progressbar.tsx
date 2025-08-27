
import React from 'react';

interface ProgressBarProps {
  progress: number; // Progress as a percentage (0-100)
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  const progressWidth = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full h-1 absolute left-0 top-[135px] max-md:top-[90px] max-sm:top-[70px] ${className}`}>
      <div className="w-full h-1 absolute bg-[#4D2309] left-0 top-0" />
      <div 
        className="h-1 absolute bg-[#EE6200] left-0 top-0 transition-all duration-300 ease-in-out"
        style={{ width: `${progressWidth}%` }}
        role="progressbar"
        aria-valuenow={progressWidth}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${progressWidth}%`}
      />
    </div>
  );
};

