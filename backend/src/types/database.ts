import { Game, Player, Card, TimelineCard, GamePhase, Difficulty } from '@prisma/client';

// Extended types with relations
export interface GameWithPlayers extends Game {
  players: Player[];
}

export interface PlayerWithGame extends Player {
  game: Game;
}

export interface TimelineCardWithCard extends TimelineCard {
  card: Card;
}

export interface GameWithPlayersAndTimeline extends Game {
  players: Player[];
  timelineCards: TimelineCardWithCard[];
}

// Game state interface
export interface GameState {
  currentTurn: number;
  round: number;
  maxRounds: number;
  currentPlayerId?: string;
  gameStartTime?: Date;
  lastActionTime?: Date;
}

// API response types
export interface CreateGameResponse {
  success: boolean;
  game?: Game;
  error?: string;
}

export interface JoinGameResponse {
  success: boolean;
  player?: Player;
  game?: GameWithPlayers;
  error?: string;
}

export interface GetGameResponse {
  success: boolean;
  game?: GameWithPlayersAndTimeline;
  error?: string;
}

export interface PlaceCardResponse {
  success: boolean;
  timelineCard?: TimelineCardWithCard;
  isCorrect?: boolean;
  error?: string;
}

export interface PlayerHandResponse {
  success: boolean;
  cards?: Card[];
  error?: string;
}

// Game creation request
export interface CreateGameRequest {
  roomCode: string;
  maxPlayers?: number;
}

// Join game request
export interface JoinGameRequest {
  roomCode: string;
  playerName: string;
}

// Place card request
export interface PlaceCardRequest {
  roomCode: string;
  playerId: string;
  cardId: string;
  position: number;
}

// Game statistics
export interface GameStats {
  totalGames: number;
  activeGames: number;
  totalPlayers: number;
  averageGameDuration: number;
}

// Player statistics
export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  averageScore: number;
  bestScore: number;
}

// Card statistics
export interface CardStats {
  totalCards: number;
  cardsByDifficulty: Record<Difficulty, number>;
  cardsByCategory: Record<string, number>;
}

// Export Prisma types for convenience
export type { Game, Player, Card, TimelineCard, GamePhase, Difficulty }; 