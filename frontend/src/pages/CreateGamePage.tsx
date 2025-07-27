import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Container from '@/components/layout/Container';
import CreateGameForm from '@/components/forms/CreateGameForm';
import Button from '@/components/common/Button';
import { useGame } from '@/hooks/useGame';
import { CreateGameRequest } from '@/types/game';
import { SUCCESS_MESSAGES } from '@/utils/constants';

const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { createGame, loading, error } = useGame();
  const [success, setSuccess] = useState<{ roomCode: string; gameId: string } | null>(null);

  const handleSubmit = async (data: CreateGameRequest) => {
    try {
      const game = await createGame(data);
      if (game) {
        setSuccess({
          roomCode: game.roomCode,
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

  const handleCopyRoomCode = async () => {
    if (success?.roomCode) {
      try {
        await navigator.clipboard.writeText(success.roomCode);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy room code:', err);
      }
    }
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
                Game Created!
              </h2>
              <p className="text-gray-600 mb-6">
                {SUCCESS_MESSAGES.GAME_CREATED}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Share this room code with your friends:</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="text-2xl font-mono font-bold text-primary-600 bg-white px-4 py-2 rounded border">
                    {success.roomCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyRoomCode}
                  >
                    Copy
                  </Button>
                </div>
              </div>

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
              <CreateGameForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error?.message}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CreateGamePage; 