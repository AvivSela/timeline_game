import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import GameBoard from '@/components/game/GameBoard';
import PlayerHand from '@/components/game/PlayerHand';
import PlayerList from '@/components/game/PlayerList';
import GameEvents from '@/components/game/GameEvents';
import { CardData, TimelineCard, Player, TurnInfo } from '@/types/game';
import { gameService } from '@/services/gameService';
import Loading from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

interface GameEvent {
  id: string;
  type: 'card_placed' | 'turn_changed' | 'game_started' | 'game_ended' | 'player_joined' | 'player_left';
  message: string;
  timestamp: string;
  playerName?: string;
  cardName?: string;
}

const GameRoom: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [timeline, setTimeline] = useState<TimelineCard[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [turnInfo, setTurnInfo] = useState<TurnInfo | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const [isCurrentTurn, setIsCurrentTurn] = useState(false);

  // Get current player ID from localStorage
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Load current player ID from localStorage
    const storedPlayerId = localStorage.getItem('currentPlayerId');
    
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId);
    }
    
    if (gameId) {
      initializeGame();
    }
  }, [gameId]);

  const loadGameState = useCallback(async (gameRoomCode?: string) => {
    try {
      const codeToUse = gameRoomCode || roomCode;
      if (!codeToUse) {
        console.error('Room code not available');
        return;
      }

      if (!currentPlayerId) {
        console.error('Current player ID not available');
        setError('Player session not found. Please join the game again.');
        return;
      }

      // Load player hand
      const handResponse = await gameService.getPlayerHand(codeToUse, currentPlayerId);
      setPlayerHand(handResponse.hand);

      // Load timeline
      const timelineResponse = await gameService.getTimeline(codeToUse);
      setTimeline(timelineResponse.timeline);

      // Load turn info
      const turnResponse = await gameService.getTurnInfo(codeToUse);
      setTurnInfo(turnResponse.turnInfo);
      setIsCurrentTurn(turnResponse.turnInfo.currentPlayer?.id === currentPlayerId);

      // Load players (refresh)
      const gameResponse = await gameService.getGame(gameId!);
      setPlayers(gameResponse.players);
    } catch (err) {
      console.error('Load game state error:', err);
    }
  }, [roomCode, currentPlayerId, gameId]);

  // Set up polling for game updates
  useEffect(() => {
    if (!roomCode || !currentPlayerId) {
      return;
    }

    const interval = setInterval(loadGameState, 2000);
    return () => clearInterval(interval);
  }, [roomCode, currentPlayerId, loadGameState]);

  const initializeGame = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get game details
      const gameResponse = await gameService.getGame(gameId!);
      setPlayers(gameResponse.players);
      setRoomCode(gameResponse.roomCode);

      // Start the game if not already started
      if (gameResponse.status === 'waiting') {
        await startGame(gameResponse.roomCode);
      } else {
        await loadGameState(gameResponse.roomCode);
      }
    } catch (err) {
      setError('Failed to initialize game');
      console.error('Game initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async (gameRoomCode?: string) => {
    try {
      const codeToUse = gameRoomCode || roomCode;
      if (!codeToUse) {
        throw new Error('Room code not available');
      }
      await gameService.startGame(codeToUse);
      addEvent('game_started', 'Game started!');
      await loadGameState(codeToUse);
    } catch (err) {
      setError('Failed to start game');
      console.error('Start game error:', err);
    }
  };



  const handleCardDrop = async (cardId: string, position: number) => {
    try {
      if (!roomCode) {
        throw new Error('Room code not available');
      }
      if (!currentPlayerId) {
        throw new Error('Current player ID not available');
      }
      const response = await gameService.placeCard(roomCode, {
        playerId: currentPlayerId,
        cardId,
        position
      });

      if (response.success) {
        addEvent('card_placed', `${response.validation.cardName} placed correctly!`);
        
        if (response.gameOver) {
          addEvent('game_ended', 'Game Over! A player has won!');
        } else {
          addEvent('turn_changed', `Turn changed to ${response.newTurnState.currentPlayerName}`);
        }
      } else {
        addEvent('card_placed', `${response.validation.cardName} placed incorrectly. Drawing new card.`);
      }

      // Reload game state
      await loadGameState(roomCode);
    } catch (err) {
      setError('Failed to place card');
      console.error('Place card error:', err);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, card: CardData) => {
    if (!isCurrentTurn) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const addEvent = (type: GameEvent['type'], message: string) => {
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Timeline Game</h1>
          <p className="text-gray-600">Room: {gameId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Game Board */}
            <GameBoard
              timeline={timeline}
              onCardDrop={handleCardDrop}
              isCurrentTurn={isCurrentTurn}
            />

            {/* Player Hand */}
            <PlayerHand
              cards={playerHand}
              isCurrentTurn={isCurrentTurn}
              onCardDragStart={handleCardDragStart}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player List */}
            <PlayerList
              players={players}
              currentPlayerId={turnInfo?.currentPlayer?.id || null}
              currentPlayerName={turnInfo?.currentPlayer?.name || null}
              turnNumber={turnInfo?.turnNumber || 1}
            />

            {/* Game Events */}
            <GameEvents events={events} />
          </div>
        </div>

        {/* Game Status */}
        {turnInfo?.isGameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Game Over!</h2>
              <p className="text-lg mb-4">A player has won the game!</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoom; 