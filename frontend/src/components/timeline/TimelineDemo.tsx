import React from 'react';
import { useTimelineState } from '../../hooks/useTimelineState';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { CardData } from '../../types/game';
import {
  TimelineContainer,
  TimelineBackbone,
  TimelineCard,
  CardSourceArea,
  InsertionZone,
} from './index';

// Sample cards for demonstration
const sampleCards: CardData[] = [
  {
    id: 'card-1',
    name: 'Invention of the Printing Press',
    description: 'Johannes Gutenberg invents the printing press in Europe',
    chronologicalValue: 1440,
    difficulty: 'EASY',
    category: 'Technology',
  },
  {
    id: 'card-2',
    name: 'Discovery of America',
    description: 'Christopher Columbus reaches the Americas',
    chronologicalValue: 1492,
    difficulty: 'EASY',
    category: 'Exploration',
  },
  {
    id: 'card-3',
    name: 'French Revolution',
    description: 'The French Revolution begins with the storming of the Bastille',
    chronologicalValue: 1789,
    difficulty: 'MEDIUM',
    category: 'History',
  },
  {
    id: 'card-4',
    name: 'Industrial Revolution',
    description: 'The Industrial Revolution transforms manufacturing and society',
    chronologicalValue: 1760,
    difficulty: 'MEDIUM',
    category: 'Technology',
  },
  {
    id: 'card-5',
    name: 'World War I',
    description: 'The First World War begins in Europe',
    chronologicalValue: 1914,
    difficulty: 'HARD',
    category: 'History',
  },
];

const TimelineDemo: React.FC = () => {
  const { state, actions, timelineStats, validateTimeline } = useTimelineState(sampleCards);
  const { dragState, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useDragAndDrop();

  const handleCardDragStart = (card: CardData, event: React.DragEvent<HTMLDivElement>) => {
    handleDragStart(card, event as unknown as DragEvent);
    actions.updateDragState({
      isDragging: true,
      draggedCard: card,
    });
  };

  const handleCardDragEnd = (card: CardData, event: React.DragEvent<HTMLDivElement>) => {
    handleDragEnd(event as unknown as DragEvent);
    actions.updateDragState({
      isDragging: false,
      draggedCard: null,
    });
  };

  const handleZoneDrop = (card: CardData, position: number) => {
    actions.placeCard(card, position);
  };

  const handleCardClick = (card: CardData) => {
    console.log('Card clicked:', card.name);
  };

  const handleReset = () => {
    // Reset timeline by clearing placed cards and restoring available cards
    state.placedCards.forEach(card => {
      actions.removeCard(card.id);
    });
  };

  const validation = validateTimeline();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Timeline Game - Epic 1.3 Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Basic Drag & Drop functionality with timeline state management
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{timelineStats.totalCards}</div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{timelineStats.placedCards}</div>
              <div className="text-sm text-gray-600">Placed Cards</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{timelineStats.availableCards}</div>
              <div className="text-sm text-gray-600">Available Cards</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(timelineStats.completionPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset Timeline
            </button>
            <div className="px-4 py-2 bg-gray-200 rounded-lg">
              <span className="font-medium">Validation: </span>
              <span className={validation.isValid ? 'text-green-600' : 'text-red-600'}>
                {validation.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
          </div>

          {/* Validation Errors */}
          {!validation.isValid && validation.errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Timeline Errors:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Source Area */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Cards</h2>
            <CardSourceArea
              cards={state.availableCards}
              onCardDragStart={(card, event) => handleCardDragStart(card, event as React.DragEvent<HTMLDivElement>)}
              onCardDragEnd={(card, event) => handleCardDragEnd(card, event as React.DragEvent<HTMLDivElement>)}
            />
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
            <TimelineContainer className="bg-white rounded-lg shadow-lg p-6">
              <TimelineBackbone
                width={Math.max(800, state.placedCards.length * 300)}
                height={200}
                isVisible={true}
              />
              
              {/* Timeline Content */}
              <div className="relative mt-4">
                {/* Placed Cards */}
                <div className="flex gap-4 mb-4">
                  {state.placedCards.map((timelineCard, index) => (
                    <div key={timelineCard.id} className="flex-shrink-0">
                      <TimelineCard
                        card={timelineCard.card}
                        isPlaced={true}
                        isDragging={dragState.isDragging && dragState.draggedCard?.id === timelineCard.id}
                        onClick={handleCardClick}
                        onDragStart={(event) => handleCardDragStart(timelineCard.card, event)}
                        onDragEnd={(event) => handleCardDragEnd(timelineCard.card, event)}
                      />
                    </div>
                  ))}
                </div>

                                 {/* Insertion Zones */}
                 <div className="flex gap-4">
                   {state.insertionZones.map((zone) => (
                     <div key={zone.position} className="flex-shrink-0">
                       <InsertionZone
                         position={zone.position}
                         isValid={zone.isValid}
                         helperText={zone.helperText}
                         onDrop={handleZoneDrop}
                         onDragOver={(event) => handleDragOver(event as unknown as DragEvent)}
                       />
                     </div>
                   ))}
                 </div>
              </div>
            </TimelineContainer>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use:</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Drag cards from the "Available Cards" area to the timeline</li>
            <li>• Drop cards in the insertion zones between placed cards</li>
            <li>• Try to place cards in chronological order (earliest to latest)</li>
            <li>• The timeline will validate your placement</li>
            <li>• Use the "Reset Timeline" button to start over</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimelineDemo; 