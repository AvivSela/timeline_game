export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  joinedAt: string;
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