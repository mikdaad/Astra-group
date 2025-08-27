import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
// Import the library functions
import { Country, State, City } from 'country-state-city';
import { ProgressBar } from '../numberpage/progressbar';

// --- Helper Types ---
interface ILocation {
  name: string;
  isoCode?: string;
  countryCode?: string;
  stateCode?: string;
}

interface Selection {
  country: ILocation | null;
  state: ILocation | null;
  district: ILocation | null;
}

interface Csdprops {
  setstep: (step: number) => void;
  step: number;
  isLoading?: boolean;
}

// --- Main Component ---
const Csdselect: React.FC<Csdprops> = ({step,
  setstep,
  isLoading = false   
}) => { 
  // --- State Initialization ---
  const [data, setData] = useState<{ countries: ILocation[], states: ILocation[], districts: ILocation[] }>({
    countries: [],
    states: [],
    districts: [],
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize state with no default selections for profile setup
  const [selection, setSelection] = useState<Selection>({
    country: null,
    state: null,
    district: null,
  });

  // --- Data Fetching Effects ---
  useEffect(() => {
    setData(prev => ({ ...prev, countries: Country.getAllCountries() }));
  }, []);

  useEffect(() => {
    if (selection.country?.isoCode) {
      const states = State.getStatesOfCountry(selection.country.isoCode);
      setData(prev => ({ ...prev, states, districts: [] }));
    }
  }, [selection.country]);

  useEffect(() => {
    if (selection.country?.isoCode && selection.state?.isoCode) {
      const districts = City.getCitiesOfState(selection.country.isoCode, selection.state.isoCode);
      setData(prev => ({ ...prev, districts }));
    }
  }, [selection.state, selection.country]);

  // --- Event Handlers ---
  const handleCountryChange = (country: ILocation) => {
    setSelection({ country, state: null, district: null });
  };

  const handleStateChange = (state: ILocation) => {
    setSelection(prev => ({ ...prev, state, district: null }));
  };

  const handleDistrictChange = (district: ILocation) => {
    setSelection(prev => ({ ...prev, district }));
  };
  
  // --- Derived State for Sorted Lists ---
  const sortedCountries = useMemo(() => {
    const india = data.countries.find(c => c.isoCode === 'IN');
    const others = data.countries
        .filter(c => c.isoCode !== 'IN')
        .sort((a, b) => a.name.localeCompare(b.name));
    return india ? [india, ...others] : others;
  }, [data.countries]);

  const sortedStates = useMemo(() => {
    if (!selection.state) {
        return data.states.sort((a, b) => a.name.localeCompare(b.name));
    }
    const otherStates = data.states.filter(s => s.isoCode !== selection.state?.isoCode);
    return [selection.state, ...otherStates.sort((a, b) => a.name.localeCompare(b.name))];
  }, [data.states, selection.state]);

  const sortedDistricts = useMemo(() => {
    if (!selection.district) {
        return data.districts.sort((a, b) => a.name.localeCompare(b.name));
    }
    const otherDistricts = data.districts.filter(d => d.name !== selection.district?.name);
    return [selection.district, ...otherDistricts.sort((a, b) => a.name.localeCompare(b.name))];
  }, [data.districts, selection.district]);


  // --- UI Components ---
  const LocationItemCard = ({ checked, onChange, name, disabled }: { checked: boolean; onChange: () => void; name: string; disabled?: boolean; }) => (
    <div
      onClick={!disabled ? onChange : undefined}
      className={`bg-[#1f0d0540] rounded-lg h-[52px] flex-shrink-0 flex items-center justify-between px-4 mb-2 transition-all duration-200
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#1f0d0580]'}
                  ${checked ? 'border border-transparent' : 'border border-transparent'}`}
    >
      <span className={`text-white select-none ${!disabled ? 'cursor-pointer' : ''}`}>
        {name}
      </span>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          checked 
            ? 'border-orange-500 bg-orange-500' 
            : `border-white bg-transparent`
        }`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  );

  const isNextDisabled = !selection.country || !selection.state || !selection.district || isLoading || isProcessing;

  return (
    <div className="min-h-screen  text-white" 
     style={{ 
    backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
  }}>
      {/* Custom CSS to hide scrollbars */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-8">
        <div className="flex-1 text-center">
          <h1 className="text-lg md:text-xl font-normal text-white">Complete Your Profile</h1>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 md:px-6 py-4 ">
        {step > 0 ? (
          <button className="text-white hover:text-orange-200 transition-colors" onClick={() => setstep(step - 1)}>
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-6 h-6" /> // Placeholder to maintain layout
        )}
        <div className="flex-1 hidden md:grid grid-cols-3 gap-4 md:ml-8">
          <div className="text-white font-medium text-center">Country / Region</div>
          <div className="text-white font-medium text-center">State</div>
          <div className="text-white font-medium text-center">District</div>
        </div>
      </div>
              <ProgressBar progress={((step + 1) / 4) * 100} />

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Countries */}
          <div className="space-y-1 max-h-[50vh] md:h-[60vh] overflow-y-auto no-scrollbar">
            <div className="md:hidden text-white font-medium text-sm mb-2">Country / Region</div>
            {sortedCountries.map((country) => (
              <LocationItemCard
                key={country.isoCode}
                name={country.name}
                checked={selection.country?.isoCode === country.isoCode}
                onChange={() => handleCountryChange(country)}
              />
            ))}
          </div>

          {/* States */}
          <div className="space-y-1 max-h-[50vh] md:h-[60vh] overflow-y-auto no-scrollbar">
            <div className="md:hidden text-white font-medium text-sm mb-2">State</div>
            {sortedStates.map((state) => (
              <LocationItemCard
                key={state.isoCode}
                name={state.name}
                checked={selection.state?.isoCode === state.isoCode}
                onChange={() => handleStateChange(state)}
              />
            ))}
          </div>

          {/* Districts */}
          <div className="space-y-1 max-h-[50vh] md:h-[60vh] overflow-y-auto no-scrollbar">
            <div className="md:hidden text-white font-medium text-sm mb-2">District</div>
            {sortedDistricts.map((district) => (
              <LocationItemCard
                key={district.name}
                name={district.name}
                checked={selection.district?.name === district.name}
                onChange={() => handleDistrictChange(district)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="px-4 md:px-6 py-6 md:py-8 flex justify-center">
        <button
          disabled={isNextDisabled}
          className="bg-gradient-to-b from-orange-600 to-amber-800
 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-6 md:px-20 py-3 rounded-lg shadow-lg transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          onClick={async () => {
            setIsProcessing(true);
            try {
              // Update cached profile with location data
              try {
                const { userProfileStorage } = await import('@/utils/storage/profileStorage');
                userProfileStorage.updateProfile({ 
                  country: selection.country?.name,
                  state: selection.state?.name, 
                  district: selection.district?.name 
                });
              } catch (error) {
                console.warn('Failed to update cached profile with location:', error);
              }
              
              // Send location data to backend
              try {
                const response = await fetch('/api/profile/update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    country: selection.country?.name,
                    state: selection.state?.name,
                    district: selection.district?.name
                  }),
                });
                
                if (!response.ok) {
                  console.warn('Failed to save location to backend:', await response.text());
                } else {
                  console.log('Location data saved to backend successfully');
                }
              } catch (error) {
                console.warn('Error saving location to backend:', error);
              }
              
              try {
                const { profileSetupStorage } = await import('@/utils/storage/profileStorage');
                profileSetupStorage.markStepDone('location');
              } catch {}
              
              console.log('Selected:', { 
                country: selection.country?.name, 
                state: selection.state?.name, 
                district: selection.district?.name 
              });
              
              setstep(step + 1);
            } catch (error) {
              console.error('Error processing location selection:', error);
            } finally {
              setIsProcessing(false);
            }
          }}
        >
          {isProcessing || isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>Next</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default Csdselect;