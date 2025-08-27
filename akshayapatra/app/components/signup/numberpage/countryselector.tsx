import React, { useState } from 'react';
// Import the data from the countries-list package
import { countries as countriesData } from 'countries-list';

// Define the structure for our country objects
interface Country {
  name: string;
  flag: string;
  code: string;
}

// --- Data Processing (runs only once when the module loads) ---

// 1. Transform the data from the package into the array format we need
const allCountries: Country[] = Object.entries(countriesData).map(([code, data]) => ({
  name: data.name,
  code: code,
  // Construct a consistent flag URL using the country code
  flag: `https://flagcdn.com/${code.toLowerCase()}.svg`,
  
}));

// 2. Find and extract the 'India' object
const india = allCountries.find(country => country.code === 'IN');

// 3. Filter out India and sort the rest alphabetically
const otherCountries = allCountries
  .filter(country => country.code !== 'IN')
  .sort((a, b) => a.name.localeCompare(b.name));

// 4. Create the final, sorted list with India at the top
const sortedCountries = india ? [india, ...otherCountries] : otherCountries;


// --- The Reusable Country Selector Dropdown Component ---
interface CountrySelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  selectedCountry, 
  onCountryChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* The main dropdown button */}
      <div
        className="flex h-[52px] cursor-pointer flex-col items-start gap-2 self-stretch rounded-lg border border-solid border-[#2A1203] bg-[#2D1206] px-4 py-2"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select country"
      >
        <div className="flex flex-[1_0_0] self-stretch items-center justify-between">
          <div className="flex flex-[1_0_0] items-center gap-4">
            <img
              src={selectedCountry.flag}
              alt={`${selectedCountry.name} flag`}
              className="h-[19px] w-5 object-cover rounded-sm"
              onError={(e) => { e.currentTarget.src = `https://placehold.co/20x19/2D1206/C9CCD8?text=${selectedCountry.code}`; }}
            />
            <div className="flex-[1_0_0] text-sm font-light leading-[22px] tracking-[0.2px] text-[#C9CCD8]">
              {selectedCountry.name}
            </div>
          </div>
          <div className={`flex h-6 w-6 items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 5L15.5 12L8.5 19" stroke="#C9CCD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* The dropdown list */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#2A1203] bg-[#2D1206] shadow-lg" role="listbox" aria-label="Country options">
          {sortedCountries.map((country) => (
            <div
              key={country.code}
              className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-[#3D1A06]"
              onClick={() => handleCountrySelect(country)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCountrySelect(country); }}
              role="option"
              aria-selected={selectedCountry.code === country.code}
              tabIndex={0}
            >
              <img
                src={country.flag}
                alt={`${country.name} flag`}
                className="h-[19px] w-5 object-cover rounded-sm"
                onError={(e) => { e.currentTarget.src = `https://placehold.co/20x19/2D1206/C9CCD8?text=${country.code}`; }}
              />
              <div className="text-sm font-light text-[#C9CCD8]">{country.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Main App Component to Demonstrate the CountrySelector ---
export default function App() {
  // Set the initial selected country to India
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: 'India',
    flag: 'https://flagcdn.com/in.svg',
    code: 'IN',
  });

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
  };

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md">
        <div className="p-6 text-center">
            <h1 className="text-3xl font-bold">Country Selector</h1>
            <p className="text-slate-400 mt-2">A reusable component using a local country package.</p>
        </div>
        <CountrySelector
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
        />
        <div className="mt-6 p-4 bg-slate-800 rounded-lg text-center">
            <p className="text-slate-400">You have selected:</p>
            <p className="text-xl font-semibold mt-1">{selectedCountry.name}</p>
        </div>
      </div>
    </div>
  );
}
