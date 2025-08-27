import React from 'react';
import { ProfileHeader } from './profileheader';
import { SuccessIllustration } from './success';
import { DoneButton } from './donebutton';

interface ProfileCompleteProps {
  title?: string;
  description?: string;
  onComplete?: () => void;
}

export const ProfileComplete: React.FC<ProfileCompleteProps> = ({
  title = "You're all set!",
  description = "Your profile is ready to go. Let's grow your business together.",
  onComplete
}) => {
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    // Could add additional logic here like analytics tracking
  };

  return (
    <main className="flex flex-col overflow-hidden items-center py-[91px] min-h-screen "
    style={{ 
    backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
  }}>
      <ProfileHeader />
      
      <section className="flex flex-col items-center mt-36 max-md:mt-10">
        <SuccessIllustration />
        
        <div className="text-center mt-[17px]">
          <h2 className="text-white text-xl font-semibold leading-[1.2] tracking-[0.2px]">
            {title}
          </h2>
          
          <p className="text-white text-base font-medium leading-6 tracking-[0.2px] text-center w-[266px] mt-4">
            {description}
          </p>
        </div>
        
        <div className="mt-[98px] max-md:mt-10">
          <DoneButton onClick={handleComplete} />
        </div>
      </section>
    </main>
  );
};
