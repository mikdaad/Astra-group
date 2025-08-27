
import React from 'react';

interface BannerBackgroundProps {
  className?: string;
}

export const BannerBackground: React.FC<BannerBackgroundProps> = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      {/* Main background */}
      <div className="w-full h-full absolute bg-[#813200] rounded-3xl left-0 top-0 max-sm:rounded-2xl" />
      
      {/* Decorative mask overlay */}
      <div className="absolute left-0 top-[-1px] w-full h-[180px]">
        <svg 
          width="349" 
          height="179" 
          viewBox="0 0 349 179" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <mask id="mask0_banner_bg" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="0" y="-1" width="349" height="180">
            <rect y="-1" width="349" height="180" rx="24" fill="black" fillOpacity="0.3" />
          </mask>
          <g mask="url(#mask0_banner_bg)">
            <path 
              d="M334.958 -0.480232C258.782 117.552 362.879 197.654 424.449 222.951L394.38 222.951C191.628 176.191 149.531 54.5135 153.826 -0.480216L334.958 -0.480232Z" 
              fill="black" 
              fillOpacity="0.3"
            />
            <path 
              d="M144.314 288.621C122.017 168.558 -20.5193 135.474 -89 133.939L-64.4101 124.599C134.908 99.8055 256.538 186.105 292.439 232.354L144.314 288.621Z" 
              fill="black" 
              fillOpacity="0.3"
            />
            <path 
              d="M137.406 -8.00017C141.192 64.2086 55.3684 89.5231 11.9831 93.1543L11.9831 -8.00016L137.406 -8.00017Z" 
              fill="black" 
              fillOpacity="0.3"
            />
          </g>
        </svg>
      </div>

      {/* Gradient ellipse */}
      <div className="absolute right-0 top-0 w-[181px] h-[185px] overflow-hidden">
        <svg 
          width="181" 
          height="185" 
          viewBox="0 0 181 185" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <ellipse 
            cx="90.5" 
            cy="92.5" 
            rx="90.5" 
            ry="92.5" 
            transform="matrix(-1 0 0 1 181 0)" 
            fill="url(#paint0_linear_banner_gradient)"
          />
          <defs>
            <linearGradient 
              id="paint0_linear_banner_gradient" 
              x1="134.822" 
              y1="182.698" 
              x2="119.294" 
              y2="-4.35512" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#090300" />
              <stop offset="0.544052" stopColor="#351603" />
              <stop offset="0.783986" stopColor="#6E2B00" />
              <stop offset="1" stopColor="#CA5002" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

