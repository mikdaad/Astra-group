import React from 'react';

import { HeroSection } from './herosection';
import { OTPForm } from './otpform';
import { ChevronLeft } from 'lucide-react';
import { ProgressBar } from '../numberpage/progressbar';

interface stepprops {
  setstep: (step: number) => void;
  step: number;
}

const Otpindex: React.FC<stepprops> = ({
  step,
  setstep
}) => { 
  const handleBackClick = () => {
    console.log('Back button clicked');
    // Handle navigation back logic here
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <main className="w-screen h-screen relative overflow-hidden "
       style={{ 
    backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
  }}>
         <button className="text-white hover:text-orange-200 transition-colors" onClick={() => setstep(step - 1)}>
          <ChevronLeft className="w-6 h-6" />
        </button>
         <ProgressBar progress={step * 20} />
        
        <section className="w-[517px] h-[638px] shrink-0 absolute -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 max-md:w-[90%] max-md:max-w-[517px] max-md:-translate-x-2/4 max-md:-translate-y-2/4 max-md:left-2/4 max-md:top-2/4 max-sm:w-[95%] max-sm:px-5 max-sm:py-0">
          <HeroSection />
          
          
          <div className="w-[517px] h-[352px] shrink-0 absolute left-0 top-[156px] max-md:w-full">
            <div className="w-[517px] h-[452px] shrink-0 absolute bg-[rgba(0,0,0,0.15)] rounded-lg left-0 top-0 max-md:w-full backdrop-blur-sm" />
            <OTPForm 
             setstep={setstep}  
      step={step}/>
          </div>
        </section>
      </main>
    </>
  );
};

export default Otpindex;
