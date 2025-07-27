import React, { useState, useRef } from 'react';
import { CardData } from '@/types/game';

interface TimelineCard {
  id: string;
  position: number;
  card: CardData;
}

interface GameBoardProps {
  timeline: TimelineCard[];
  onCardDrop: (cardId: string, position: number) => void;
  isCurrentTurn: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ timeline, onCardDrop, isCurrentTurn }) => {
  const [draggedCard, setDraggedCard] = useState<CardData | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);



  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.floor(x / (rect.width / (timeline.length + 1)));
    setDragOverPosition(Math.max(0, Math.min(position, timeline.length)));
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const position = dragOverPosition ?? timeline.length;
    
    if (cardId && isCurrentTurn) {
      onCardDrop(cardId, position);
    }
    
    setDraggedCard(null);
    setDragOverPosition(null);
  };

  const renderTimelineSlot = (index: number) => {
    const isDragOver = dragOverPosition === index;
    const hasCard = timeline.find(card => card.position === index);
    
    return (
      <div
        key={index}
        className={`
          relative flex-1 min-h-[120px] border-2 border-dashed rounded-lg p-2
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${hasCard ? 'border-solid border-green-500' : ''}
          transition-all duration-200
        `}
      >
        {hasCard && (
          <div className="bg-white rounded-lg p-3 shadow-md">
            <h3 className="font-semibold text-sm mb-1">{hasCard.card.name}</h3>
            <p className="text-xs text-gray-600">{hasCard.card.description}</p>
          </div>
        )}
        {isDragOver && draggedCard && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="bg-white rounded-lg p-3 shadow-lg">
              <h3 className="font-semibold text-sm mb-1">{draggedCard.name}</h3>
              <p className="text-xs text-gray-600">{draggedCard.description}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Timeline</h2>
      <div
        ref={timelineRef}
        className="flex gap-2 min-h-[140px] p-4 bg-gray-50 rounded-lg"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {Array.from({ length: Math.max(timeline.length + 1, 5) }, (_, index) =>
          renderTimelineSlot(index)
        )}
      </div>
      {!isCurrentTurn && (
        <p className="text-center text-gray-500 mt-2">
          Waiting for your turn...
        </p>
      )}
    </div>
  );
};

export default GameBoard; 