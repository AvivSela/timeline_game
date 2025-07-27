import React from 'react';
import { CardData } from '@/types/game';

interface PlayerHandProps {
  cards: CardData[];
  isCurrentTurn: boolean;
  onCardDragStart: (e: React.DragEvent, card: CardData) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards, isCurrentTurn, onCardDragStart }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">
        Your Hand ({cards.length} cards)
        {isCurrentTurn && (
          <span className="ml-2 text-sm text-green-600 font-medium">
            • Your turn
          </span>
        )}
      </h3>
      
      {cards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">No cards in hand</p>
          <p className="text-sm">You've placed all your cards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cards.map((card) => (
            <div
              key={card.id}
              draggable={isCurrentTurn}
              onDragStart={(e) => onCardDragStart(e, card)}
              className={`
                bg-white rounded-lg p-4 shadow-md border-2 cursor-pointer
                transition-all duration-200 hover:shadow-lg
                ${isCurrentTurn 
                  ? 'border-blue-300 hover:border-blue-500 cursor-grab active:cursor-grabbing' 
                  : 'border-gray-200 cursor-not-allowed opacity-75'
                }
              `}
            >
              <div className="mb-2">
                <span className={`
                  inline-block px-2 py-1 text-xs font-medium rounded-full
                  ${card.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    card.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}
                `}>
                  {card.difficulty}
                </span>
              </div>
              
              <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                {card.name}
              </h4>
              
              <p className="text-xs text-gray-600 line-clamp-3">
                {card.description}
              </p>
              
              <div className="mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {card.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isCurrentTurn && cards.length > 0 && (
        <p className="text-center text-gray-500 mt-3 text-sm">
          Wait for your turn to place cards
        </p>
      )}
    </div>
  );
};

export default PlayerHand; 