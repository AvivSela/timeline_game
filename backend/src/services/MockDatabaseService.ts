import { Game, Player, Card, TimelineCard, GamePhase, Difficulty } from '@prisma/client';
import { IDatabaseService } from './IDatabaseService';

export class MockDatabaseService implements IDatabaseService {
  private games = new Map<string, Game>();
  private players = new Map<string, Player>();
  private cards = new Map<string, Card>();
  private timelineCards = new Map<string, TimelineCard>();
  private gameCounter = 0;
  private playerCounter = 0;
  private timelineCounter = 0;

  // Connection management
  async connect(): Promise<void> {
    // No-op for mock service
  }

  async disconnect(): Promise<void> {
    // No-op for mock service
  }

  // Game Operations
  async createGame(roomCode: string, maxPlayers: number = 8): Promise<Game> {
    this.gameCounter++;
    const game: Game = {
      id: `game_${this.gameCounter}`,
      roomCode,
      maxPlayers,
      state: {
        currentTurn: 0,
        round: 1,
        maxRounds: 5
      },
      phase: GamePhase.WAITING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.games.set(roomCode, game);
    return game;
  }

  async findGameByRoomCode(roomCode: string): Promise<Game | null> {
    return this.games.get(roomCode) || null;
  }

  async getGameWithPlayers(roomCode: string): Promise<(Game & { players: Player[] }) | null> {
    const game = this.games.get(roomCode);
    if (!game) return null;

    const players = Array.from(this.players.values()).filter(p => p.gameId === game.id);
    return { ...game, players };
  }

  async updateGameState(roomCode: string, state: any): Promise<Game> {
    const game = this.games.get(roomCode);
    if (!game) throw new Error('Game not found');

    const updatedGame = { ...game, state, updatedAt: new Date() };
    this.games.set(roomCode, updatedGame);
    return updatedGame;
  }

  async updateGamePhase(roomCode: string, phase: GamePhase): Promise<Game> {
    const game = this.games.get(roomCode);
    if (!game) throw new Error('Game not found');

    const updatedGame = { ...game, phase, updatedAt: new Date() };
    this.games.set(roomCode, updatedGame);
    return updatedGame;
  }

  // Player Operations
  async addPlayerToGame(roomCode: string, playerName: string): Promise<Player> {
    const game = this.games.get(roomCode);
    if (!game) throw new Error('Game not found');

    const existingPlayers = Array.from(this.players.values()).filter(p => p.gameId === game.id);
    if (existingPlayers.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    this.playerCounter++;
    const player: Player = {
      id: `player_${this.playerCounter}`,
      name: playerName,
      gameId: game.id,
      handCards: [],
      isCurrentTurn: existingPlayers.length === 0, // First player gets first turn
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.players.set(player.id, player);
    return player;
  }

  async updatePlayerHand(playerId: string, handCards: number[]): Promise<Player> {
    const player = this.players.get(playerId);
    if (!player) throw new Error('Player not found');

    const updatedPlayer = { ...player, handCards, updatedAt: new Date() };
    this.players.set(playerId, updatedPlayer);
    return updatedPlayer;
  }

  async setCurrentTurn(playerId: string): Promise<Player> {
    const player = this.players.get(playerId);
    if (!player) throw new Error('Player not found');

    // Set all players in the game to not current turn
    Array.from(this.players.values())
      .filter(p => p.gameId === player.gameId)
      .forEach(p => {
        this.players.set(p.id, { ...p, isCurrentTurn: false, updatedAt: new Date() });
      });

    // Set the specified player as current turn
    const updatedPlayer = { ...player, isCurrentTurn: true, updatedAt: new Date() };
    this.players.set(playerId, updatedPlayer);
    return updatedPlayer;
  }

  async updatePlayerScore(playerId: string, score: number): Promise<Player> {
    const player = this.players.get(playerId);
    if (!player) throw new Error('Player not found');

    const updatedPlayer = { ...player, score, updatedAt: new Date() };
    this.players.set(playerId, updatedPlayer);
    return updatedPlayer;
  }

  // Card Operations
  async getRandomCards(count: number, difficulty?: Difficulty): Promise<Card[]> {
    // Return mock cards
    const mockCards: Card[] = [
      {
        id: 'card_1',
        name: 'Great Pyramid of Giza',
        description: 'Built around 2560 BCE',
        chronologicalValue: -2560,
        difficulty: Difficulty.EASY,
        category: 'Ancient History',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'card_2',
        name: 'Roman Empire',
        description: 'Founded in 27 BCE',
        chronologicalValue: -27,
        difficulty: Difficulty.MEDIUM,
        category: 'Ancient History',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return mockCards.slice(0, count);
  }

  async getCardById(cardId: string): Promise<Card | null> {
    return this.cards.get(cardId) || null;
  }

  async getCardsByCategory(category: string): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(card => card.category === category);
  }

  // Timeline Operations
  async addCardToTimeline(gameId: string, cardId: string, position: number): Promise<TimelineCard> {
    this.timelineCounter++;
    const timelineCard: TimelineCard = {
      id: `timeline_${this.timelineCounter}`,
      gameId,
      cardId,
      position,
      placedAt: new Date()
    };

    this.timelineCards.set(timelineCard.id, timelineCard);
    return timelineCard;
  }

  async getTimelineForGame(roomCode: string): Promise<TimelineCard[]> {
    const game = this.games.get(roomCode);
    if (!game) throw new Error('Game not found');

    return Array.from(this.timelineCards.values())
      .filter(tc => tc.gameId === game.id)
      .sort((a, b) => a.position - b.position);
  }

  async removeCardFromTimeline(timelineCardId: string): Promise<void> {
    this.timelineCards.delete(timelineCardId);
  }

  // Utility Operations
  async getGameWithPlayersAndTimeline(roomCode: string): Promise<any> {
    const game = this.games.get(roomCode);
    if (!game) return null;

    const players = Array.from(this.players.values()).filter(p => p.gameId === game.id);
    const timelineCards = Array.from(this.timelineCards.values())
      .filter(tc => tc.gameId === game.id)
      .sort((a, b) => a.position - b.position);

    return {
      ...game,
      players,
      timelineCards
    };
  }

  async cleanupInactiveGames(hoursOld: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [roomCode, game] of this.games.entries()) {
      if (game.updatedAt < cutoffTime && 
          (game.phase === GamePhase.WAITING || game.phase === GamePhase.FINISHED)) {
        this.games.delete(roomCode);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async getPlayerCount(roomCode: string): Promise<number> {
    const game = this.games.get(roomCode);
    if (!game) return 0;

    return Array.from(this.players.values()).filter(p => p.gameId === game.id).length;
  }

  async isGameFull(roomCode: string): Promise<boolean> {
    const game = this.games.get(roomCode);
    if (!game) return false;

    const playerCount = await this.getPlayerCount(roomCode);
    return playerCount >= game.maxPlayers;
  }
} 