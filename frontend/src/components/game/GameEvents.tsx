import React from 'react';

interface GameEvent {
  id: string;
  type: 'card_placed' | 'turn_changed' | 'game_started' | 'game_ended' | 'player_joined' | 'player_left';
  message: string;
  timestamp: string;
  playerName?: string;
  cardName?: string;
}

interface GameEventsProps {
  events: GameEvent[];
  maxEvents?: number;
}

const GameEvents: React.FC<GameEventsProps> = ({ events, maxEvents = 10 }) => {
  const recentEvents = events.slice(-maxEvents);

  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'card_placed':
        return '🎴';
      case 'turn_changed':
        return '🔄';
      case 'game_started':
        return '🎮';
      case 'game_ended':
        return '🏆';
      case 'player_joined':
        return '👋';
      case 'player_left':
        return '👋';
      default:
        return '📢';
    }
  };

  const getEventColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'card_placed':
        return 'text-blue-600 bg-blue-50';
      case 'turn_changed':
        return 'text-green-600 bg-green-50';
      case 'game_started':
        return 'text-purple-600 bg-purple-50';
      case 'game_ended':
        return 'text-yellow-600 bg-yellow-50';
      case 'player_joined':
        return 'text-green-600 bg-green-50';
      case 'player_left':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">Game Events</h3>
      
      {recentEvents.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No events yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className={`
                flex items-start space-x-3 p-3 rounded-lg border
                ${getEventColor(event.type)}
              `}
            >
              <div className="text-lg flex-shrink-0">
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {event.message}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {events.length > maxEvents && (
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            Showing last {maxEvents} events
          </p>
        </div>
      )}
    </div>
  );
};

export default GameEvents; 