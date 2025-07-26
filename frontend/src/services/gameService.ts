import apiClient from './api';
import {
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
  Game,
  GameError,
} from '@/types/game';

class GameService {
  async createGame(data: CreateGameRequest): Promise<CreateGameResponse> {
    try {
      const response = await apiClient.post<CreateGameResponse>('/games', data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async joinGame(data: JoinGameRequest): Promise<JoinGameResponse> {
    try {
      const response = await apiClient.post<JoinGameResponse>('/games/join', data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGame(gameId: string): Promise<Game> {
    try {
      const response = await apiClient.get<Game>(`/games/${gameId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGameByRoomCode(roomCode: string): Promise<Game> {
    try {
      const response = await apiClient.get<Game>(`/games/room/${roomCode}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): GameError {
    if (error.message) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
      };
    }
    
    return {
      message: 'An unexpected error occurred',
    };
  }
}

export const gameService = new GameService();
export default gameService; 