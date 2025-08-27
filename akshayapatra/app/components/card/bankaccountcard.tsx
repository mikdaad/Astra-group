
import React from 'react';
import { CardBackground } from './cardbackground';
import { CardLogo } from './cardlogo';
import { UserAvatar } from './useravatar';
import { CardInfo } from './cardinfo';

interface BankAccountCardProps {
  userName: string;
  balance: string;
  phoneNumber: string;
  userId: string;
  className?: string;
  fillColors?: {
    paint0?: string;
    paint1?: string;
    paint2?: string;
    paint3?: string;
    paint4?: string;
    paint5?: string;
  };
}

export const BankAccountCard: React.FC<BankAccountCardProps> = ({
  userName,
  balance,
  phoneNumber,
  userId,
  className = "",
  fillColors
}) => {
  return (
    <article
      className={`relative w-[260px] h-[148px] sm:w-[280px] sm:h-[160px] md:w-[299px] md:h-[171px] shrink-0 ${className}`}
      role="region"
      aria-label="Bank account card"
    >
      <CardBackground fillColors={fillColors} />
      
      <div className="absolute inset-0 p-2 sm:p-3">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserAvatar />
            <div className="flex justify-center items-center relative">
              <h2 className="font-normal text-base text-white max-md:text-sm max-sm:text-xs">
                {userName}
              </h2>
            </div>
          </div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 30 15"
				className="w-[45px] h-[21px] relative"
				aria-hidden
			>
				<path d="M10.8687 14.6833C9.11988 14.6833 8.16349 13.44 7.99954 10.9534H4.47457C4.20132 11.5819 3.96906 12.1694 3.77778 12.7159L3.24493 14.2734H0.375773L6.83138 0.747396H11.2376L12.0983 10.7075C12.235 12.1421 12.5765 13.0711 13.123 13.4947C12.7268 14.2871 11.9754 14.6833 10.8687 14.6833ZM5.10989 9.45735H7.93806L7.69213 4.19039V3.63705L6.23706 6.85461L5.10989 9.45735ZM14.1359 14.2734L16.4722 1.81308L16.6976 0.747396H21.0834L18.5011 14.2734H14.1359ZM26.8217 13.0643C26.4528 14.1436 25.5579 14.6833 24.137 14.6833C23.0849 14.6833 22.1969 14.0548 21.4727 12.7979C20.735 11.5409 20.2978 9.88772 20.1611 7.83832C21.664 5.09212 22.9347 3.15203 23.973 2.01802C24.9704 0.938673 25.9883 0.398998 27.0266 0.398998C27.5868 0.398998 28.065 0.549287 28.4612 0.849866C28.8711 1.15044 29.1238 1.53983 29.2195 2.01802C28.7549 2.2093 28.4134 2.38008 28.1948 2.53037C27.6483 2.94025 27.0061 3.60289 26.2683 4.51829L24.4034 6.75214C24.1028 7.10737 23.891 7.36696 23.7681 7.53091C23.973 8.67857 24.3829 9.81941 24.9977 10.9534C25.5852 12.0328 26.1932 12.7364 26.8217 13.0643Z" fill="#F9F8F8"/>
			</svg>
        </header>
        
        <main className="mt-2 flex flex-col gap-2">
          <section className="flex flex-col items-start relative">
            <label className="self-stretch text-white text-[9px] font-normal relative max-md:text-[8px] max-sm:text-[7px]">
              Total balance
            </label>
            <div className="w-[126px] text-white text-xl font-bold relative max-md:text-lg max-sm:text-base">
              {balance}
            </div>
          </section>
          
          <CardLogo />
          
          <CardInfo 
            phoneNumber={phoneNumber}
            userId={userId}
          />
        </main>
      </div>
    </article>
  );
};

