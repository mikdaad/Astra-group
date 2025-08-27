
import React from 'react';

interface FormSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '' 
}) => {
  return (
    <section
      className={`inline-flex flex-col items-start gap-8 absolute w-[358px] left-[50px] top-[186px] max-md:w-[calc(100%_-_48px)] max-md:max-w-[500px] max-md:left-6 max-md:top-[140px] max-sm:w-[calc(100%_-_32px)] max-sm:gap-6 max-sm:left-4 max-sm:top-[110px] ${className}`}
    >
      <header className="flex w-[358px] flex-col items-start gap-4 px-1 py-0 max-sm:w-full max-sm:p-0">
        <h1 className="self-stretch text-[#F9F8F8] text-2xl font-medium leading-7 max-sm:text-[22px] max-sm:leading-[26px]">
          {title}
        </h1>
        <p className="self-stretch text-[#F9F8F8] text-base font-normal leading-6 tracking-[0.2px] max-sm:text-[15px] max-sm:leading-[22px]">
          {subtitle}
        </p>
      </header>
      <div className="flex w-[358px] flex-col items-start gap-6 max-sm:w-full max-sm:gap-5">
        {children}
      </div>
      
    </section>
  );
};

