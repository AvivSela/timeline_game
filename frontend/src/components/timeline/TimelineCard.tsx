import React, { useState, useRef, useEffect } from 'react';
import { TimelineCardProps, CardVisualState } from '../../types/timeline';

const TimelineCard: React.FC<TimelineCardProps> = ({
  card,
  isPlaced = false,
  isDragging = false,
  isError = false,
  onClick,
  onDragStart,
  onDragEnd,
  className = '',
}) => {
  const [visualState, setVisualState] = useState<CardVisualState>({
    isHovered: false,
    isFocused: false,
    isDragging,
    isPlaced,
    isError,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Update visual state when props change
  useEffect(() => {
    setVisualState(prev => ({
      ...prev,
      isDragging,
      isPlaced,
      isError,
    }));
  }, [isDragging, isPlaced, isError]);

  const handleMouseEnter = () => {
    setVisualState(prev => ({ ...prev, isHovered: true }));
  };

  const handleMouseLeave = () => {
    setVisualState(prev => ({ ...prev, isHovered: false }));
  };

  const handleFocus = () => {
    setVisualState(prev => ({ ...prev, isFocused: true }));
  };

  const handleBlur = () => {
    setVisualState(prev => ({ ...prev, isFocused: false }));
  };

  const handleClick = () => {
    onClick?.(card);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Generate CSS classes based on visual state
  const getCardClasses = () => {
    const baseClasses = `
      timeline-card
      relative
      flex
      flex-col
      justify-between
      bg-white
      border-2
      border-gray-200
      rounded-lg
      shadow-sm
      cursor-pointer
      transition-all
      duration-200
      ease-in-out
      select-none
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
      focus:ring-offset-2
      ${className}
    `;

    const sizeClasses = `
      w-48
      h-28
      md:w-56
      md:h-32
      lg:w-64
      lg:h-36
      xl:w-72
      xl:h-40
    `;

    const stateClasses = visualState.isHovered && !visualState.isDragging
      ? 'scale-105 shadow-lg'
      : visualState.isDragging
      ? 'scale-110 rotate-1 shadow-xl opacity-80'
      : visualState.isPlaced
      ? 'border-green-500 shadow-md'
      : visualState.isError
      ? 'border-red-500 shadow-md animate-shake'
      : '';

    return `${baseClasses} ${sizeClasses} ${stateClasses}`.trim();
  };

  // Generate content classes
  const getContentClasses = () => {
    return `
      flex
      flex-col
      justify-between
      h-full
      p-3
      md:p-4
      lg:p-5
    `;
  };

  // Generate title classes
  const getTitleClasses = () => {
    return `
      font-semibold
      text-gray-900
      text-sm
      md:text-base
      lg:text-lg
      leading-tight
      line-clamp-2
      ${visualState.isError ? 'text-red-700' : ''}
    `;
  };

  // Generate year classes
  const getYearClasses = () => {
    return `
      font-bold
      text-lg
      md:text-xl
      lg:text-2xl
      ${visualState.isPlaced ? 'text-green-600' : 'text-blue-600'}
      ${visualState.isError ? 'text-red-600' : ''}
    `;
  };

  // Generate status indicator classes
  const getStatusClasses = () => {
    if (visualState.isPlaced) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (visualState.isError) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div
      ref={cardRef}
      className={getCardClasses()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      aria-label={`Timeline card: ${card.name} from year ${card.chronologicalValue}`}
      aria-describedby={`card-description-${card.id}`}
      draggable={!visualState.isPlaced}
      data-testid="timeline-card"
      data-card-id={card.id}
      data-card-state={JSON.stringify(visualState)}
    >
      <div className={getContentClasses()}>
        {/* Header with title and status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={getTitleClasses()}>
            {card.name}
          </h3>
          
          {/* Status indicator */}
          <div className={`
            flex-shrink-0
            px-2
            py-1
            text-xs
            font-medium
            rounded-full
            border
            ${getStatusClasses()}
          `}>
            {visualState.isPlaced ? 'Placed' : visualState.isError ? 'Error' : card.difficulty}
          </div>
        </div>

        {/* Year display */}
        <div className="text-center">
          <span className={getYearClasses()}>
            {card.chronologicalValue}
          </span>
        </div>

        {/* Description (hidden on smaller screens) */}
        <p
          id={`card-description-${card.id}`}
          className="
            hidden
            lg:block
            text-xs
            text-gray-600
            line-clamp-2
            leading-tight
          "
        >
          {card.description}
        </p>
      </div>

      {/* Visual feedback for drag state */}
      {visualState.isDragging && (
        <div className="
          absolute
          inset-0
          bg-blue-500
          bg-opacity-10
          rounded-lg
          pointer-events-none
        " />
      )}

      {/* Success animation for placed cards */}
      {visualState.isPlaced && (
        <div className="
          absolute
          -top-1
          -right-1
          w-6
          h-6
          bg-green-500
          rounded-full
          flex
          items-center
          justify-center
          text-white
          text-xs
          font-bold
          animate-pulse
        ">
          ✓
        </div>
      )}

      {/* Error animation for incorrect cards */}
      {visualState.isError && (
        <div className="
          absolute
          -top-1
          -right-1
          w-6
          h-6
          bg-red-500
          rounded-full
          flex
          items-center
          justify-center
          text-white
          text-xs
          font-bold
          animate-pulse
        ">
          ✗
        </div>
      )}
    </div>
  );
};

export default TimelineCard; 