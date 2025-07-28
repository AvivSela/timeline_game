import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import JoinGameForm from '@/components/forms/JoinGameForm';
import Button from '@/components/common/Button';
import { useGame } from '@/hooks/useGame';
import { JoinGameRequest } from '@/types/game';
import { SUCCESS_MESSAGES } from '@/utils/constants';

const JoinGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinGame, loading, error } = useGame();
  const [success, setSuccess] = useState<{ gameId: string } | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  // Get room code from URL parameters
  useEffect(() => {
    const roomCode = searchParams.get('roomCode');
    if (roomCode) {
      setInitialRoomCode(roomCode);
    }
  }, [searchParams]);

  const handleSubmit = async (data: JoinGameRequest) => {
    try {
      const game = await joinGame(data);
      if (game) {
        // Store the current player ID in localStorage
        // We need to get the player ID from the game response
        // Since the useGame hook doesn't return the player data directly,
        // we'll need to extract it from the game data or make an additional call
        const currentPlayer = game.players.find(p => p.name === data.playerName);
        if (currentPlayer) {
          localStorage.setItem('currentPlayerId', currentPlayer.id);
          localStorage.setItem('currentPlayerName', currentPlayer.name);
        }
        
        setSuccess({
          gameId: game.id,
        });
      }
    } catch (error) {
      // Error is already handled by the useGame hook
      // The error state will be set automatically
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Container maxWidth="lg" className="py-12">
          <div className="card max-w-md mx-auto">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Successfully Joined!
              </h2>
              <p className="text-gray-600 mb-6">
                {SUCCESS_MESSAGES.GAME_JOINED}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/game/${success.gameId}`)}
                  className="w-full"
                >
                  Go to Game Room
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToHome}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container maxWidth="lg" className="py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="mb-4"
            >
              ← Back to Home
            </Button>
          </div>
          
          <div className="card">
            <div className="card-body">
              <JoinGameForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error?.message}
                initialRoomCode={initialRoomCode}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default JoinGamePage; 