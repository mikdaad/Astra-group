
import React from 'react';

interface CardInfoItemProps {
  label: string;
  value: string;
  className?: string;
}

const CardInfoItem: React.FC<CardInfoItemProps> = ({ label, value, className = "" }) => {
  return (
    <div className={`flex flex-col items-start relative ${className}`}>
      <label className="self-stretch text-white text-[9px] font-normal relative max-md:text-[8px] max-sm:text-[7px]">
        {label}
      </label>
      <div className="self-stretch text-white text-xs font-bold relative max-md:text-[11px] max-sm:text-[9px]">
  {value && value.slice(-10)}
</div>
    </div>
  );
};

interface CardInfoProps {
  phoneNumber: string;
  userId: string;
  className?: string;
}

export const CardInfo: React.FC<CardInfoProps> = ({ 
  phoneNumber, 
  userId, 
  className = "" 
}) => {
  return (
    <section 
      className={`flex justify-between items-center self-stretch relative ${className}`}
      aria-label="Card information"
    >
      <CardInfoItem
        label="Phone number"
        value={phoneNumber}
        className="w-[81px] max-md:w-[75px] max-sm:w-[70px]"
      />
      <CardInfoItem
        label="User ID"
        value={userId}
      />
    </section>
  );
};

