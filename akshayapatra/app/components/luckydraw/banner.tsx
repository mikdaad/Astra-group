
import React, { useState } from 'react';
import { BannerBackground } from './bannerbackground';
import { BannerContent } from './bannercontent';
import Image from 'next/image';

interface BannerProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  onExploreClick?: () => void;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  title = "2nd Bumper Draw",
  subtitle = "Hyundai Creta",
  imageUrl = "/images/vehicles/car1.png",
  imageAlt = "Hyundai Creta 3D view",
  onExploreClick,
  className = ""
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleExploreClick = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      // Default behavior - could open a modal, navigate, etc.
      alert(`Exploring ${subtitle} - ${title}!`);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load banner image');
  };

  return (
    <section 
      className={`w-[349px] h-[179px] shrink-0 relative overflow-hidden rounded-3xl max-md:w-full max-md:max-w-[349px] max-md:mx-auto max-md:my-0 max-sm:w-full max-sm:h-[150px] max-sm:rounded-2xl ${className}`}
      aria-label={`${title} - ${subtitle} promotional banner`}
      role="banner"
    >
      {/* Background decorations */}
      <BannerBackground />
      
      {/* Main content */}
      <BannerContent 
        title={title}
        subtitle={subtitle}
        onExploreClick={handleExploreClick}
      />
      
      {/* Car image */}
      <div className="absolute right-0 top-8 w-[248px] h-[165px] max-md:w-[200px] max-md:h-[133px] max-md:right-[9px] max-md:top-[25px] max-sm:w-[180px] max-sm:h-[120px] max-sm:right-[19px] max-sm:top-5">
        {!imageError && (
          <Image
            width={248}
            height={165}
            src={imageUrl}
            alt={imageAlt}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Loading placeholder */}
        {!imageLoaded && !imageError && (
          <div className="w-full h-full bg-gradient-to-r from-orange-200 to-orange-300 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-orange-600 text-sm font-medium">Loading...</div>
          </div>
        )}
        
        {/* Error fallback */}
        {imageError && (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-2xl mb-2">🚗</div>
              <div className="text-xs">Image unavailable</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

