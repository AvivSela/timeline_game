import { Game, Player, Card, TimelineCard, GamePhase, Difficulty } from '@prisma/client';

export interface IDatabaseService {
  // Game Operations
  createGame(roomCode: string, maxPlayers?: number): Promise<Game>;
  findGameByRoomCode(roomCode: string): Promise<Game | null>;
  getGameById(gameId: string): Promise<Game | null>;
  getGameWithPlayers(roomCode: string): Promise<(Game & { players: Player[] }) | null>;
  getGameWithPlayersById(gameId: string): Promise<(Game & { players: Player[] }) | null>;
  updateGameState(identifier: string, state: any): Promise<Game>;
  updateGamePhase(roomCode: string, phase: GamePhase): Promise<Game>;

  // Player Operations
  addPlayerToGame(roomCode: string, playerName: string): Promise<Player>;
  updatePlayerHand(playerId: string, handCards: string[]): Promise<Player>;
  setCurrentTurn(playerId: string): Promise<Player>;
  updatePlayerScore(playerId: string, score: number): Promise<Player>;
  getPlayerById(playerId: string): Promise<Player | null>;
  getPlayersByGameId(gameId: string): Promise<Player[]>;

  // Card Operations
  getRandomCards(count: number, difficulty?: Difficulty): Promise<Card[]>;
  getCardById(cardId: string): Promise<Card | null>;
  getCardsByCategory(category: string): Promise<Card[]>;
  getAllCards(): Promise<Card[]>;
  getCardsByIds(cardIds: string[]): Promise<Card[]>;

  // Timeline Operations
  addCardToTimeline(gameId: string, cardId: string, position: number): Promise<TimelineCard>;
  getTimelineForGame(roomCode: string): Promise<(TimelineCard & { card: Card })[]>;
  getTimelineCardsByGameId(gameId: string): Promise<(TimelineCard & { card: Card })[]>;
  removeCardFromTimeline(timelineCardId: string): Promise<void>;

  // Utility Operations
  getGameWithPlayersAndTimeline(roomCode: string): Promise<any>;
  cleanupInactiveGames(hoursOld?: number): Promise<number>;
  getPlayerCount(roomCode: string): Promise<number>;
  isGameFull(roomCode: string): Promise<boolean>;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
} 