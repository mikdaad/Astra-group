// pages/location.tsx
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ProgressBar } from '../numberpage/progressbar';

interface stepprops {
  setstep: (step: number) => void;
  step: number;
  isLoading?: boolean;
}

export default function LocationPage({ setstep, step, isLoading = false }: stepprops) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lon}`);
      const data = await response.json();
      
      if (data.success && data.address) {
        return data.address.formatted_address;
      } else {
        console.error('Geocoding API error:', data.error);
        setError("Failed to get address from location.");
        return null;
      }
    } catch (err) {
      setError("Failed to reverse geocode location.");
      return null;
    }
  };

  const getLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userAddress = await fetchAddressFromCoords(latitude, longitude);
        if (userAddress) {
          setAddress(userAddress);
          
          // Update cached profile with street address
          try {
            const { userProfileStorage } = await import('@/utils/storage/profileStorage');
            userProfileStorage.updateProfile({ street_address: userAddress });
          } catch (error) {
            console.warn('Failed to update cached profile with address:', error);
          }
          
          // Send to backend
          try {
            const response = await fetch('/api/save-location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: userAddress }),
            });
            
            if (!response.ok) {
              console.warn('Failed to save address to backend:', await response.text());
            } else {
              console.log('Address saved to backend successfully');
            }
          } catch (error) {
            console.warn('Error saving address to backend:', error);
          }
        }
        setLoading(false);
      },
      () => {
        setError('Unable to retrieve your location.');
        setLoading(false);
      }
    );
  };

  const moveToNextStep = async () => {
    setIsProcessing(true);
    try {
      const { profileSetupStorage } = await import('@/utils/storage/profileStorage');
      profileSetupStorage.markStepDone('address');
      setstep(step + 1);
    } catch (error) {
      console.error('Error moving to next step:', error);
    } finally {
      setIsProcessing(false);
    }
  } 

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="min-h-screen text-white" 
     style={{ 
       backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)' 
     }}>
      {/* Header with back button */}
      <div className="flex items-center justify-between px-6 py-4">
        <button 
          className="text-white hover:text-orange-200 transition-colors" 
          onClick={() => setstep(step - 1)}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-normal">Set up your location</h1>
        </div>
      </div>
      
      <ProgressBar progress={((step + 1) / 4) * 100} />

      {/* Content */}
      <div className="flex flex-col justify-center items-center px-6 py-8 min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-md mb-8">
          <p className="text-sm text-gray-300">
            We use your location to enhance security, detect fraud, and offer region-specific services.
            Your data is secure and never shared without your permission.
          </p>
        </div>

        <div className="w-full max-w-md mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg h-40 flex items-center justify-center text-white border border-white/20">
            {loading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Detecting your location...</span>
              </div>
            ) : address ? (
              <span className="px-4 text-center text-sm">{address}</span>
            ) : (
              <span className="text-red-400 px-4 text-center text-sm">{error}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            className="bg-gradient-to-b from-orange-600 to-amber-800
 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            onClick={getLocation}
            disabled={loading || isLoading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Detecting...</span>
              </>
            ) : (
              <span>{address ? 'Refresh Location' : 'Try Again'}</span>
            )}
          </button>

          {address && (
            <button
              className="bg-gradient-to-b from-orange-600 to-amber-800
 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={moveToNextStep}
              disabled={isProcessing || isLoading}
            >
              {isProcessing || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
