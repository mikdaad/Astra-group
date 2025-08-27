import React from 'react';

interface ProfileHeaderProps {
  title?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  title = "Profile" 
}) => {
  return (
    <header className="flex flex-col items-center">
      <div className="flex items-stretch gap-4 text-xl text-white font-normal whitespace-nowrap text-center ml-[50px] max-md:ml-2.5">
        <img
          src="https://api.builder.io/api/v1/image/assets/9e14ec760a13409cba0be5c570ba1763/2befcdced3af2ee5d59b87556ab80a0528b5a57c?placeholderIfAbsent=true"
          alt="Profile icon"
          className="aspect-[1] object-contain w-[18px] shrink-0 my-auto"
        />
        <h1 className="text-white text-ellipsis">
          {title}
        </h1>
      </div>
      <div className="self-stretch flex w-full flex-col bg-[#4D2309] mt-[7px] max-md:max-w-full max-md:pr-5">
        <div className="flex w-[1075px] shrink-0 max-w-full h-1 bg-[#EE6200]" role="separator" />
      </div>
    </header>
  );
};
