export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  joinedAt: string;
  score?: number;
}

export interface Game {
  id: string;
  roomCode: string;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameRequest {
  playerName: string;
  maxPlayers: number;
}

export interface CreateGameResponse {
  roomCode: string;
  gameId: string;
  game: Game;
}

export interface JoinGameRequest {
  roomCode: string;
  playerName: string;
}

export interface JoinGameResponse {
  game: Game;
  player: Player;
}

export interface GameError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface CardData {
  id: string;
  name: string;
  description: string;
  chronologicalValue: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  imageUrl?: string;
}

export interface TimelineCard {
  id: string;
  position: number;
  card: CardData;
}

export interface TurnState {
  currentPlayerId: string | null;
  currentPlayerName: string | null;
  turnOrder: string[];
  turnNumber: number;
}

export interface TurnInfo {
  currentPlayer: Player | null;
  turnOrder: Player[];
  turnNumber: number;
  isGameOver: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  correctPosition: number;
  actualPosition: number;
  message: string;
  cardName: string;
  cardDate?: number;
} 