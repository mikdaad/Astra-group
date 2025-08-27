'use client'

import React from 'react'
import { BankAccountCard } from './bankaccountcard'

// Demo component to showcase all color palettes
const colorPalettes = [
  // Original Orange - matches the original card design  
  { paint0: "#2A0E16", paint1: "#EE6200", paint2: "#EE6200", paint3: "#EE6200", paint4: "#CA5002", paint5: "#1C0D07" },
  // Deep Blue - navy and ocean blues
  { paint0: "#1F2A44", paint1: "#4A90E2", paint2: "#357ABD", paint3: "#357ABD", paint4: "#2C5AA0", paint5: "#141E34" },
  // Golden Bronze - warm golds and browns  
  { paint0: "#47340E", paint1: "#FFB347", paint2: "#E6A035", paint3: "#E6A035", paint4: "#CC8A00", paint5: "#2A1D09" },
  // Emerald Green - rich greens
  { paint0: "#0C3D1E", paint1: "#50C878", paint2: "#40A368", paint3: "#40A368", paint4: "#2E7D32", paint5: "#0F3F20" },
  // Royal Purple - deep purples
  { paint0: "#2D1B38", paint1: "#9C27B0", paint2: "#8E24AA", paint3: "#8E24AA", paint4: "#7B1FA2", paint5: "#1A0E2E" },
];

const paletteNames = [
  "Original Orange",
  "Deep Ocean Blue",  
  "Golden Sunset",
  "Emerald Forest",
  "Royal Purple"
];

export const DemoCards: React.FC = () => {
  React.useEffect(() => {
    console.log('🎨 Demo Cards - Color Palettes:');
    colorPalettes.forEach((palette, index) => {
      console.log(`${paletteNames[index]} (${index}):`, palette);
    });
  }, []);

  return (
    <div className="p-8 bg-[#1a120c] min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Dynamic Card Color Palettes Demo
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {colorPalettes.map((palette, index) => (
          <div key={index} className="flex flex-col items-center space-y-4">
            <h3 className="text-xl text-white font-semibold">
              {paletteNames[index]}
            </h3>
            
            <BankAccountCard
              userName="Taylor"
              balance="₹12,500"
              phoneNumber="+916464646464"
              userId="demo-user"
              fillColors={palette}
            />
            
            {/* Color palette preview */}
            <div className="flex space-x-2 mt-4">
              {Object.entries(palette).map(([key, color]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded-full border-2 border-white/30"
                  style={{ backgroundColor: color }}
                  title={`${key}: ${color}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-white/70 text-sm">
          Each card uses a different color palette from the colorPalettes array.
          <br />
          The CardBackground component dynamically applies these colors to create unique gradients.
        </p>
      </div>
    </div>
  );
};