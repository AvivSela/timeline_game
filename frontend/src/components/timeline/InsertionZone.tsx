import React, { useState, useEffect } from 'react';
import { InsertionZoneProps, ZoneState } from '../../types/timeline';
import { CardData } from '../../types/game';

const InsertionZone: React.FC<InsertionZoneProps> = ({
  position,
  isValid,
  helperText,
  onDrop,
  className = '',
}) => {
  const [zoneState, setZoneState] = useState<ZoneState>({
    isHighlighted: false,
    isActive: false,
    isValid,
  });

  // Update zone state when props change
  useEffect(() => {
    setZoneState(prev => ({
      ...prev,
      isValid,
    }));
  }, [isValid]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    setZoneState(prev => ({
      ...prev,
      isHighlighted: true,
      isActive: true,
    }));
  };

  const handleDragLeave = () => {
    setZoneState(prev => ({
      ...prev,
      isHighlighted: false,
      isActive: false,
    }));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    try {
      if (event.dataTransfer) {
        const cardData = JSON.parse(event.dataTransfer.getData('application/json')) as CardData;
        onDrop(cardData, position);
      }
    } catch (error) {
      console.error('Failed to parse dropped card data:', error);
    }

    setZoneState(prev => ({
      ...prev,
      isHighlighted: false,
      isActive: false,
    }));
  };

  // Generate container classes
  const getContainerClasses = () => {
    const baseClasses = `
      insertion-zone
      relative
      flex
      flex-col
      items-center
      justify-center
      min-h-32
      border-2
      border-dashed
      rounded-lg
      transition-all
      duration-200
      ease-in-out
      cursor-pointer
      group
      ${className}
    `;

    const stateClasses = zoneState.isActive
      ? zoneState.isValid
        ? 'border-green-400 bg-green-50 shadow-lg'
        : 'border-red-400 bg-red-50 shadow-lg'
      : zoneState.isHighlighted
      ? 'border-blue-400 bg-blue-50'
      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100';

    return `${baseClasses} ${stateClasses}`.trim();
  };

  // Generate icon classes
  const getIconClasses = () => {
    const baseClasses = `
      w-8
      h-8
      mb-2
      transition-all
      duration-200
      ease-in-out
    `;

    const stateClasses = zoneState.isActive
      ? zoneState.isValid
        ? 'text-green-600 scale-110'
        : 'text-red-600 scale-110'
      : zoneState.isHighlighted
      ? 'text-blue-600 scale-105'
      : 'text-gray-400 group-hover:text-gray-600';

    return `${baseClasses} ${stateClasses}`.trim();
  };

  // Generate text classes
  const getTextClasses = () => {
    const baseClasses = `
      text-sm
      font-medium
      text-center
      transition-all
      duration-200
      ease-in-out
    `;

    const stateClasses = zoneState.isActive
      ? zoneState.isValid
        ? 'text-green-700'
        : 'text-red-700'
      : zoneState.isHighlighted
      ? 'text-blue-700'
      : 'text-gray-600 group-hover:text-gray-700';

    return `${baseClasses} ${stateClasses}`.trim();
  };

  // Generate helper text classes
  const getHelperTextClasses = () => {
    return `
      text-xs
      text-gray-500
      text-center
      mt-1
      transition-opacity
      duration-200
      ease-in-out
      ${zoneState.isActive ? 'opacity-100' : 'opacity-70'}
    `;
  };

  // Generate pulse animation classes
  const getPulseClasses = () => {
    return zoneState.isActive
      ? zoneState.isValid
        ? 'animate-pulse bg-green-200'
        : 'animate-pulse bg-red-200'
      : '';
  };

  return (
    <div
      className={getContainerClasses()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label={`Insertion zone ${position}: ${helperText}`}
      data-testid={`insertion-zone-${position}`}
      data-position={position}
      data-is-valid={isValid}
      data-is-active={zoneState.isActive}
    >
      {/* Pulse animation overlay */}
      {zoneState.isActive && (
        <div className={`
          absolute
          inset-0
          rounded-lg
          opacity-30
          ${getPulseClasses()}
          pointer-events-none
        `} />
      )}

      {/* Icon */}
      <div className={getIconClasses()}>
        {zoneState.isActive ? (
          zoneState.isValid ? (
            // Checkmark icon for valid zones
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            // X icon for invalid zones
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )
        ) : (
          // Plus icon for inactive zones
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        )}
      </div>

      {/* Main text */}
      <div className={getTextClasses()}>
        {zoneState.isActive
          ? zoneState.isValid
            ? 'Drop here'
            : 'Invalid position'
          : 'Drop card here'}
      </div>

      {/* Helper text */}
      <div className={getHelperTextClasses()}>
        {helperText}
      </div>

      {/* Visual feedback for drag over */}
      {zoneState.isHighlighted && (
        <div className="
          absolute
          inset-0
          border-2
          border-blue-400
          rounded-lg
          pointer-events-none
          animate-pulse
        " />
      )}
    </div>
  );
};

export default InsertionZone; 