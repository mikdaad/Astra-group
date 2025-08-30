# Golden Diamond Investment Loading States Implementation Guide

## Overview
This guide describes the comprehensive loading state implementation across the Golden Diamond Investment application using the branded loading components.

## Components Created

### 1. PageLoader Component (`/app/components/general/PageLoader.tsx`)
Main loading component with two variants:
- **PageLoader**: Full-screen loading with background
- **PageLoaderOverlay**: Overlay loading for existing pages

#### Props:
- `text?: string` - Text to display (default: "A S T R A")
- `duration?: number` - Animation duration (default: 1.5s)
- `className?: string` - Additional CSS classes
- `showBackground?: boolean` - Show gradient background (PageLoader only)

#### Usage Examples:
```tsx
// Full-screen loading
<PageLoader text="I N V E S T M E N T" duration={1.5} />

// Overlay loading
<PageLoaderOverlay text="G O L D   &   D I A M O N D S" duration={2.0} />
```

## Loading Pages Added

### Route-Level Loading (`loading.tsx` files):
- `/dashboard/loading.tsx` - "D A S H B O A R D"
- `/cards/loading.tsx` - "C A R D S" 
- `/program/loading.tsx` - "P R  "
- `/admin/loading.tsx` - "A D M I N"
- `/wallet/loading.tsx` - "W A L L E T"
- `/transactionhistory/loading.tsx` - "T R A N S A C T I O N S"
- `/profile/loading.tsx` - "P R O F I L E"
- `/(home)/login/loading.tsx` - "L O G I N"
- `/(home)/profile-setup/loading.tsx` - "G O L D   I N V E S T M E N T"

## Component-Level Loading States

### 1. Homepage Component (`/app/components/homepage/Homepage.tsx`)
- Initial loading simulation (2 seconds)
- Tab change loading (800ms)
- Loading overlay during data fetching
- Disabled tab navigation during loading

### 2. Admin Dashboard (`/app/admin/page.tsx`)
- Replaced skeleton loading with ASTRA PageLoader
- "A D M I N" text with gradient background
- Maintains existing loading logic

### 3. Cards Page (`/app/cards/page.tsx`)
- Initial loading state (1.5 seconds)
- Combined loading for cards and transactions
- "C A R D S" text with overlay
- Loading states for async operations

### 4. program Page (`/app/program/page.tsx`)
- Initial loading with 2-second delay
- "L U C K Y   D R A W" text
- Enhanced loading for card data fetching

### 5. Wallet Page (`/app/wallet/page.tsx`)
- 2-second loading simulation
- "W A L L E T" text
- Overlay loading for wallet data

### 6. Profile Setup Components
Enhanced with consistent loading states:
- **Csdselect**: Country/State/District selection
- **LocationPage**: Address detection  
- **ProfileForm**: Profile submission
- **IssuingCard**: Card issuance process
- **RegistrationFee**: Payment processing
- **CongratsIndex**: Setup completion

## Loading State Features

### 🎨 Visual Design
- Consistent ASTRA branding across all loading states
- Gradient backgrounds matching app theme
- Smooth fade-in/fade-out animations
- Responsive design for all screen sizes

### ⚡ Performance
- GPU-accelerated animations using transform and opacity
- Proper cleanup of timers and animations
- Memory-efficient state management

### 🔧 Functionality
- Button disabling during loading
- Form field disabling during async operations
- Loading spinners with descriptive text
- Error handling with loading state cleanup

### 📱 UX Enhancements
- Descriptive loading messages
- Smooth transitions between states
- Consistent timing across components
- Accessibility-friendly implementations

## Animation Specifications

### Timing:
- Standard loading: 1.5 seconds
- Extended loading: 2.0 seconds
- Tab changes: 0.8 seconds
- Step transitions: 0.5 seconds

### Easing:
- Entry animations: ease-out
- Exit animations: ease-in
- Spinner rotation: linear

### Properties:
- Primary: transform, opacity (GPU accelerated)
- Secondary: background-color for state changes

## Implementation Patterns

### 1. Route-Level Loading
```tsx
// loading.tsx
import PageLoader from '../components/general/PageLoader';

export default function LoadingFile() {
  return <PageLoader text="P A G E   N A M E" duration={1.5} />;
}
```

### 2. Component-Level Loading
```tsx
const [isLoading, setIsLoading] = useState(true);

return (
  <div className="relative">
    {isLoading && (
      <PageLoaderOverlay text="C O M P O N E N T" duration={1.5} />
    )}
    {/* Component content */}
  </div>
);
```

### 3. Button Loading States
```tsx
<button disabled={isLoading || isProcessing}>
  {isLoading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span>Processing...</span>
    </>
  ) : (
    <span>Submit</span>
  )}
</button>
```

## Best Practices

1. **Consistent Timing**: Use standardized durations across similar operations
2. **Descriptive Messages**: Provide clear feedback about what's loading
3. **Progressive Enhancement**: Enhance existing loading without breaking functionality
4. **Error Handling**: Always cleanup loading states in error scenarios
5. **Accessibility**: Ensure loading states are announced to screen readers
6. **Performance**: Use efficient animation techniques and proper cleanup

## Future Enhancements

- Skeleton loading states for specific content areas
- Progress indicators for long-running operations
- Animated transitions between different loading states
- Custom loading animations for specific business actions