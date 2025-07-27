import apiClient from './api';
import {
  CreateGameRequest,
  CreateGameResponse,
  JoinGameRequest,
  JoinGameResponse,
  Game,
  GameError,
  CardData,
  TimelineCard,
  TurnInfo,
  ValidationResult,
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
      const response = await apiClient.get<{ game: Game }>(`/games/id/${gameId}`);
      return response.game;
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

  // Sprint 2: Game Management Methods

  async startGame(roomCode: string): Promise<{ message: string; turnState: any }> {
    try {
      const response = await apiClient.post<{ message: string; turnState: any }>(`/games/${roomCode}/start`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPlayerHand(roomCode: string, playerId: string): Promise<{ hand: CardData[] }> {
    try {
      const response = await apiClient.get<{ hand: CardData[] }>(`/games/${roomCode}/players/${playerId}/hand`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTurnInfo(roomCode: string): Promise<{ turnInfo: TurnInfo }> {
    try {
      const response = await apiClient.get<{ turnInfo: TurnInfo }>(`/games/${roomCode}/turn`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async placeCard(roomCode: string, data: { playerId: string; cardId: string; position: number }): Promise<{
    success: boolean;
    message: string;
    validation: ValidationResult;
    gameOver?: boolean;
    winner?: string;
    newTurnState?: any;
    newCard?: CardData;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        validation: ValidationResult;
        gameOver?: boolean;
        winner?: string;
        newTurnState?: any;
        newCard?: CardData;
      }>(`/games/${roomCode}/place-card`, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTimeline(roomCode: string): Promise<{ timeline: TimelineCard[] }> {
    try {
      const response = await apiClient.get<{ timeline: TimelineCard[] }>(`/games/${roomCode}/timeline`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGameStats(roomCode: string): Promise<{ timelineStats: any; remainingCards: number }> {
    try {
      const response = await apiClient.get<{ timelineStats: any; remainingCards: number }>(`/games/${roomCode}/stats`);
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