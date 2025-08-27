
import React from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  src: string;
  alt: string;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  src,
  alt,
  onClick,
  isActive = false,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-square object-contain w-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg",
        isActive && "bg-gradient-to-b from-orange-600 to-amber-800 text-white hover:opacity-90",
        className
      )}
      aria-label={alt}
      type="button"
    >
      <img
        src={src}
        alt={alt}
        className="aspect-[1] object-contain w-full"
      />
    </button>
  );
};

