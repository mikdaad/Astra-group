
import React from 'react';
import { ExploreButton } from './explorebutton';

interface BannerContentProps {
  title?: string;
  subtitle?: string;
  onExploreClick?: () => void;
  className?: string;
}

export const BannerContent: React.FC<BannerContentProps> = ({
  title = "2nd Bumper Draw",
  subtitle = "Hyundai Creta",
  onExploreClick,
  className = ""
}) => {
  return (
    <div className={`w-[149px] h-[74px] shrink-0 absolute left-[15px] top-[51px] max-md:left-5 max-md:top-10 max-sm:w-[120px] max-sm:left-[15px] max-sm:top-[35px] ${className}`}>
      <header className="space-y-1">
        <h1 className="text-white text-base font-normal w-[149px] h-5 max-sm:text-sm max-sm:w-[120px]">
          {title}
        </h1>
        <h2 className="text-white text-xs font-normal w-[87px] h-[15px] max-sm:text-[11px]">
          {subtitle}
        </h2>
      </header>
      
      <div className="mt-[25px]">
        <ExploreButton onClick={onExploreClick} />
      </div>
    </div>
  );
};

