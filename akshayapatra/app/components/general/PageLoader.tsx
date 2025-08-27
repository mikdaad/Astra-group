'use client';

import { TextShimmer } from "./loadingcomp";
import { motion } from "framer-motion";

interface PageLoaderProps {
  text?: string;
  duration?: number;
  className?: string;
  showBackground?: boolean;
}

export default function PageLoader({ 
  text = "A S T R A", 
  duration = 1.5, 
  className = "",
  showBackground = true 
}: PageLoaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 flex items-center justify-center min-h-screen ${
        showBackground ? 'bg-gradient-to-b from-[#090300] via-[#351603] to-[#6E2B00]' : ''
      } ${className}`}
    >
      <div className="text-center flex flex-col items-center justify-center">
        <TextShimmer className='font-glancyr text-3xl md:text-4xl lg:text-5xl text-white' duration={duration}>
          {text}
        </TextShimmer>
        
        {/* Optional subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-white/70 text-sm"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
}

// Overlay version for use within existing pages
export function PageLoaderOverlay({ 
  text = "A S T R A", 
  duration = 1.5, 
  className = "" 
}: Omit<PageLoaderProps, 'showBackground'>) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/50 backdrop-blur-sm ${className}`}
    >
      <div className="text-center bg-gradient-to-b from-[#090300] via-[#351603] to-[#6E2B00] p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
        <TextShimmer className='font-glancyr text-2xl md:text-3xl text-white' duration={duration}>
          {text}
        </TextShimmer>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-white/70 text-sm"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
}