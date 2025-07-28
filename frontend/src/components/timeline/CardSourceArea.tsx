import React, { useState, useRef, useEffect } from 'react';
import { CardSourceAreaProps, SourceAreaState } from '../../types/timeline';
import TimelineCard from './TimelineCard';
import { CardData } from '../../types/game';

const CardSourceArea: React.FC<CardSourceAreaProps> = ({
  cards,
  onCardDragStart,
  onCardDragEnd,
  className = '',
}) => {
  const [state, setState] = useState<SourceAreaState>({
    draggedCard: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Update state when props change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedCard: null,
    }));
  }, [cards]);

  const handleDragStart = (card: CardData, event: React.DragEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    
    setState(prev => ({
      ...prev,
      draggedCard: card,
      isDragging: true,
      dragOffset: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    }));

    onCardDragStart?.(card, event as unknown as DragEvent);
  };

  const handleDragEnd = (card: CardData, event: React.DragEvent<HTMLDivElement>) => {
    setState(prev => ({
      ...prev,
      draggedCard: null,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    }));

    onCardDragEnd?.(card, event as unknown as DragEvent);
  };

  const handleCardClick = (card: CardData) => {
    // Optional: Handle card click for preview or selection
    console.log('Card clicked:', card.name);
  };

  // Generate container classes
  const getContainerClasses = () => {
    return `
      card-source-area
      bg-gray-50
      border-2
      border-dashed
      border-gray-300
      rounded-lg
      p-6
      transition-all
      duration-200
      ease-in-out
      ${state.isDragging ? 'border-blue-400 bg-blue-50' : ''}
      ${className}
    `;
  };

  // Generate grid classes
  const getGridClasses = () => {
    return `
      grid
      gap-4
      auto-rows-fr
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
      lg:grid-cols-5
      xl:grid-cols-6
    `;
  };

  // Generate empty state classes
  const getEmptyStateClasses = () => {
    return `
      flex
      flex-col
      items-center
      justify-center
      py-12
      text-center
      text-gray-500
    `;
  };

  // Generate header classes
  const getHeaderClasses = () => {
    return `
      mb-4
      text-lg
      font-semibold
      text-gray-700
      flex
      items-center
      gap-2
    `;
  };

  // Generate counter classes
  const getCounterClasses = () => {
    return `
      inline-flex
      items-center
      justify-center
      w-6
      h-6
      text-xs
      font-bold
      text-white
      bg-blue-500
      rounded-full
    `;
  };

  if (cards.length === 0) {
    return (
      <div 
        className={getContainerClasses()}
        data-testid="card-source-area"
        role="region"
        aria-label="Available cards for timeline"
      >
        <div className={getEmptyStateClasses()}>
          <div className="w-16 h-16 mb-4 text-gray-400">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Cards Available
          </h3>
          <p className="text-sm text-gray-500">
            Cards will appear here when the game starts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={getContainerClasses()}
      data-testid="card-source-area"
      role="region"
      aria-label="Available cards for timeline"
    >
      {/* Header with card count */}
      <div className={getHeaderClasses()}>
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <span>Available Cards</span>
        <span className={getCounterClasses()}>
          {cards.length}
        </span>
      </div>

      {/* Cards Grid */}
      <div className={getGridClasses()}>
        {cards.map((card) => (
          <div
            key={card.id}
            className="
              flex
              justify-center
              items-start
              min-h-0
              transition-transform
              duration-200
              ease-in-out
              hover:scale-105
            "
            data-testid={`source-card-${card.id}`}
          >
            <TimelineCard
              card={card}
              onClick={handleCardClick}
              className="
                w-full
                max-w-xs
                cursor-grab
                active:cursor-grabbing
                transition-all
                duration-200
                ease-in-out
                hover:shadow-lg
                active:shadow-xl
                active:scale-105
                active:rotate-1
              "
              onDragStart={(event) => handleDragStart(card, event)}
              onDragEnd={(event) => handleDragEnd(card, event)}
            />
          </div>
        ))}
      </div>

      {/* Drag feedback overlay */}
      {state.isDragging && state.draggedCard && (
        <div className="
          fixed
          inset-0
          pointer-events-none
          z-50
          flex
          items-center
          justify-center
        ">
          <div className="
            bg-blue-500
            bg-opacity-20
            text-blue-700
            px-4
            py-2
            rounded-lg
            font-medium
            shadow-lg
            backdrop-blur-sm
          ">
            Dragging: {state.draggedCard.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSourceArea; 