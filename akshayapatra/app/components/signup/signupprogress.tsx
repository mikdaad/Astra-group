import React from "react";

interface CartProgressProps {
  currentStep: number;
}

const CartProgress: React.FC<CartProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Cart" },
    { id: 2, label: "Address" },
    { id: 3, label: "Payment" },
  ];

  // Define colors for easier use and consistency
  const activeColor = "#E8AF52"; // --Button-color variable equivalent
  const inactiveColor = "#D9D9D9"; // Original gray color
  const activeTextColor = "#000000"; // Black text for active steps
  const inactiveTextColor = "#bababa"; // A slightly muted gray for inactive step numbers
  const inactiveLabelColor = "text-gray-400"; // Dimmer text for inactive labels
  const activeLabelColor = "text-white"; // White text for active labels

  return (
    // Outer container: Vertical stack, responsive margin/padding, max-width
    <div className="flex flex-col w-full max-w-4xl mx-auto items-start gap-4 md:gap-6 my-8 md:my-12 px-4 font-blauer-nue">
      {/* Shopping Cart Title: Responsive text */}
      <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold leading-tight tracking-wide">
        Shopping Cart
      </div>

      {/* Progress Indicator Container: Full width, responsive gap */}
      <div className="flex items-start w-full gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isActive = currentStep >= step.id;
          // Connector line is active if the *next* step is active OR current step is beyond it
          const isConnectorActive = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Circle: Responsive size & inner font */}
                <div
                  className={`
                    rounded-full flex items-center justify-center font-semibold transition-colors duration-300
                    w-8 h-8 text-sm          // Mobile size
                    sm:w-10 sm:h-10 sm:text-base // SM size
                    md:w-12 md:h-12 md:text-lg // MD size
                    ${
                      isActive
                        ? `bg-[${activeColor}] text-[${activeTextColor}]`
                        : `bg-[${inactiveColor}] text-[${inactiveTextColor}]`
                    }
                  `}
                >
                  {step.id}
                </div>
                {/* Label: Responsive text & margin, conditional color */}
                <div
                  className={`
                    font-normal text-center whitespace-nowrap transition-colors duration-300
                    mt-1 text-[10px]         // Mobile size
                    sm:mt-1.5 sm:text-xs      // SM size
                    md:mt-2 md:text-sm        // MD size
                    ${isActive ? activeLabelColor : inactiveLabelColor}
                  `}
                >
                  {step.label}
                </div>
              </div>

              {/* Connector Line (if not last step) */}
              {index < steps.length - 1 && (
                // Use a div with height and growing width, conditional background
                <div
                  className={`
                    flex-grow h-px mt-4          // Position line vertically centered with circle approx.
                    sm:mt-5
                    md:mt-6
                    transition-colors duration-300
                    ${isConnectorActive ? `bg-[${activeColor}]` : `bg-[${inactiveColor}]`}
                  `}
                  // Add accessibility attributes if desired, e.g., role="separator"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Pricing Details Title: Responsive text and margin */}
      <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold leading-tight tracking-wide mt-4 md:mt-6">
        Pricing details
      </div>
    </div>
  );
};

export default CartProgress;