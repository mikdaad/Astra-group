
import React, { useState } from 'react';
import { BackButton } from  "./backbutton";
import { ProgressBar } from './progressbar';
import { CountrySelector } from './countryselector';
import { FormSection } from './formsection';
import { NextButton } from './nextbutton';
import { toast } from 'sonner';

interface Country {
  name: string;
  flag: string;
  code: string;
}

interface Indexprops {
  setstep: (step: number) => void;
  step: number;
}

const Index: React.FC<Indexprops> = ({
  step,
  setstep
}) => { 
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: 'India',
    flag: 'https://api.builder.io/api/v1/image/assets/TEMP/0dd97fd2c5b19c7d383df21e8d8b7ea297a02c2d?width=40',
    code: 'IN'
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    toast.success(`Country changed to ${country.name}`);
  };

  const handleBackClick = () => {
    toast.info('Going back to previous screen');
    // In a real app, this would navigate to the previous screen
    console.log('Navigate back');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (!phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Phone number verification sent to ${selectedCountry.name}`);
      console.log('Form submitted:', { 
        country: selectedCountry, 
        phoneNumber,
        agreedToTerms 
      });
    } catch (error) {
      toast.error('Failed to send verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextClick = () => {
    setstep(step + 1);
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions to continue');
      return;
    }
    
    const form = document.getElementById('country-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
   <div 
  className="min-h-screen w-full font-sans text-white" 
  style={{ 
    backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
  }}
>
      <BackButton onClick={handleBackClick} />
      
      <header className="text-white text-left text-xl font-normal absolute w-[235px] h-[30px] overflow-hidden text-ellipsis whitespace-nowrap left-[84px] top-[98px] max-md:text-lg max-md:left-[58px] max-md:top-[57px] max-sm:text-base max-sm:w-[calc(100%_-_66px)] max-sm:left-[50px] max-sm:top-[37px]">
        Select Country / Region
      </header>
      
      <ProgressBar progress={step * 20} />
      
      <form id="country-form" onSubmit={handleFormSubmit}>
        <FormSection
          title="Add your mobile number"
          subtitle="We'll need to confirm it by sending a text."
        >
          <div className="flex flex-col items-start gap-2 self-stretch">
            <label htmlFor="country-selector" className="sr-only">
              Select your country
            </label>
            <CountrySelector
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col items-start gap-2 self-stretch">
            <label htmlFor="phone-number" className="sr-only">
              Phone number
            </label>
            <input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter your phone number"
              className="flex h-[52px] w-full items-center gap-2 border bg-[#2D1206] px-4 py-2 rounded-lg border-solid border-[#2A1203] text-[#C9CCD8] text-sm font-light leading-[22px] tracking-[0.2px] max-sm:h-12 max-sm:px-3 max-sm:py-1.5 max-sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-[#EE6200] focus:border-transparent"
              aria-describedby="phone-help"
              maxLength={10}
            />
          </div>
          
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex justify-center items-start gap-2 self-stretch px-1 py-0">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#EE6200] bg-[#2D1206] border-[#2A1203] rounded focus:ring-[#EE6200] focus:ring-2"
                aria-describedby="terms-text"
              />
              <label htmlFor="terms-agreement" className="flex-[1_0_0] text-[#CBCAD4] text-sm font-normal leading-[22px] tracking-[0.2px] max-sm:text-[13px] max-sm:leading-5 cursor-pointer">
                By continuing, you confirm that you are authorized to use this
                phone number and agree to receive an SMS text. Carrier fees may
                apply
              </label>
            </div>
          </div>
        </FormSection>
      </form>
      
      <NextButton
        onClick={handleNextClick}
        disabled={!selectedCountry || !agreedToTerms}
        loading={isLoading}
        text="Next"
      />
    </div>
  );
};

export default Index;

