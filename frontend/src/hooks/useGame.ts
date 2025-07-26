import { useState, useCallback } from 'react';
import { Game, CreateGameRequest, JoinGameRequest, GameError } from '@/types/game';
import { gameService } from '@/services/gameService';

interface UseGameState {
  game: Game | null;
  loading: boolean;
  error: GameError | null;
}

interface UseGameActions {
  createGame: (data: CreateGameRequest) => Promise<Game | null>;
  joinGame: (data: JoinGameRequest) => Promise<Game | null>;
  clearError: () => void;
  resetGame: () => void;
}

export const useGame = (): UseGameState & UseGameActions => {
  const [state, setState] = useState<UseGameState>({
    game: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: GameError | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setGame = useCallback((game: Game | null) => {
    setState(prev => ({ ...prev, game, loading: false, error: null }));
  }, []);

  const createGame = useCallback(async (data: CreateGameRequest): Promise<Game | null> => {
    try {
      setLoading(true);
      const response = await gameService.createGame(data);
      setGame(response.game);
      return response.game;
    } catch (error) {
      const gameError = error as GameError;
      setError(gameError);
      return null;
    }
  }, [setLoading, setGame, setError]);

  const joinGame = useCallback(async (data: JoinGameRequest): Promise<Game | null> => {
    try {
      setLoading(true);
      const response = await gameService.joinGame(data);
      setGame(response.game);
      return response.game;
    } catch (error) {
      const gameError = error as GameError;
      setError(gameError);
      return null;
    }
  }, [setLoading, setGame, setError]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const resetGame = useCallback(() => {
    setState({
      game: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    createGame,
    joinGame,
    clearError,
    resetGame,
  };
}; 