import React from 'react';
import { Player } from '@/types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
  currentPlayerName: string | null;
  turnNumber: number;
}

const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  currentPlayerId, 
  currentPlayerName, 
  turnNumber 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Players ({players.length})</h3>
        <div className="text-sm text-gray-600">
          Turn {turnNumber}
        </div>
      </div>
      
      <div className="space-y-2">
        {players.map((player) => {
          const isCurrentTurn = player.id === currentPlayerId;
          const isCurrentUser = player.id === currentPlayerId; // This would be set from context/auth
          
          return (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-3 rounded-lg border-2
                ${isCurrentTurn 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
                }
                ${isCurrentUser ? 'ring-2 ring-blue-300' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  w-3 h-3 rounded-full
                  ${isCurrentTurn ? 'bg-green-500' : 'bg-gray-400'}
                `} />
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {player.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                    {isCurrentTurn && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Current Turn
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {player.isHost ? 'Host' : 'Player'}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">
                  Score: {player.score || 0}
                </div>
                <div className="text-xs text-gray-500">
                  {player.isReady ? 'Ready' : 'Not Ready'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {currentPlayerName && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Current Turn:</span> {currentPlayerName}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList; 