import { PrismaClient, Game, Player, Card, TimelineCard, GamePhase, Difficulty } from '@prisma/client';
import { IDatabaseService } from './IDatabaseService';

export class DatabaseService implements IDatabaseService {
  public prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Connection management
  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  // Game Operations
  async createGame(roomCode: string, maxPlayers: number = 8): Promise<Game> {
    return this.prisma.game.create({
      data: {
        roomCode,
        maxPlayers,
        state: {
          currentTurn: 0,
          round: 1,
          maxRounds: 5
        },
        phase: GamePhase.WAITING
      }
    });
  }

  async findGameByRoomCode(roomCode: string): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: { roomCode }
    });
  }

  async getGameWithPlayers(roomCode: string): Promise<Game & { players: Player[] } | null> {
    return this.prisma.game.findUnique({
      where: { roomCode },
      include: { players: true }
    });
  }

  async updateGameState(roomCode: string, state: any): Promise<Game> {
    return this.prisma.game.update({
      where: { roomCode },
      data: { state }
    });
  }

  async updateGamePhase(roomCode: string, phase: GamePhase): Promise<Game> {
    return this.prisma.game.update({
      where: { roomCode },
      data: { phase }
    });
  }

  // Player Operations
  async addPlayerToGame(roomCode: string, playerName: string): Promise<Player> {
    const game = await this.findGameByRoomCode(roomCode);
    if (!game) {
      throw new Error('Game not found');
    }

    const playerCount = await this.prisma.player.count({
      where: { gameId: game.id }
    });

    if (playerCount >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    return this.prisma.player.create({
      data: {
        name: playerName,
        gameId: game.id,
        handCards: [],
        isCurrentTurn: playerCount === 0, // First player gets first turn
        score: 0
      }
    });
  }

  async updatePlayerHand(playerId: string, handCards: number[]): Promise<Player> {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { handCards }
    });
  }

  async setCurrentTurn(playerId: string): Promise<Player> {
    // First, set all players in the game to not current turn
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { game: true }
    });

    if (!player) {
      throw new Error('Player not found');
    }

    await this.prisma.player.updateMany({
      where: { gameId: player.gameId },
      data: { isCurrentTurn: false }
    });

    // Then set the specified player as current turn
    return this.prisma.player.update({
      where: { id: playerId },
      data: { isCurrentTurn: true }
    });
  }

  async updatePlayerScore(playerId: string, score: number): Promise<Player> {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { score }
    });
  }

  // Card Operations
  async getRandomCards(count: number, difficulty?: Difficulty): Promise<Card[]> {
    const whereClause = difficulty ? { difficulty } : {};
    
    return this.prisma.card.findMany({
      where: whereClause,
      take: count
    });
  }

  async getCardById(cardId: string): Promise<Card | null> {
    return this.prisma.card.findUnique({
      where: { id: cardId }
    });
  }

  async getCardsByCategory(category: string): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: { category },
      orderBy: { chronologicalValue: 'asc' }
    });
  }

  // Timeline Operations
  async addCardToTimeline(gameId: string, cardId: string, position: number): Promise<TimelineCard> {
    return this.prisma.timelineCard.create({
      data: {
        gameId,
        cardId,
        position
      }
    });
  }

  async getTimelineForGame(roomCode: string): Promise<TimelineCard[]> {
    const game = await this.findGameByRoomCode(roomCode);
    if (!game) {
      throw new Error('Game not found');
    }

    return this.prisma.timelineCard.findMany({
      where: { gameId: game.id },
      include: { card: true },
      orderBy: { position: 'asc' }
    });
  }

  async removeCardFromTimeline(timelineCardId: string): Promise<void> {
    await this.prisma.timelineCard.delete({
      where: { id: timelineCardId }
    });
  }

  // Utility Operations
  async getGameWithPlayersAndTimeline(roomCode: string) {
    return this.prisma.game.findUnique({
      where: { roomCode },
      include: {
        players: true,
        timelineCards: {
          include: { card: true },
          orderBy: { position: 'asc' }
        }
      }
    });
  }

  async cleanupInactiveGames(hoursOld: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    
    const result = await this.prisma.game.deleteMany({
      where: {
        updatedAt: {
          lt: cutoffTime
        },
        phase: {
          in: [GamePhase.WAITING, GamePhase.FINISHED]
        }
      }
    });

    return result.count;
  }

  async getPlayerCount(roomCode: string): Promise<number> {
    const game = await this.findGameByRoomCode(roomCode);
    if (!game) {
      return 0;
    }

    return this.prisma.player.count({
      where: { gameId: game.id }
    });
  }

  async isGameFull(roomCode: string): Promise<boolean> {
    const game = await this.findGameByRoomCode(roomCode);
    if (!game) {
      return false;
    }

    const playerCount = await this.getPlayerCount(roomCode);
    return playerCount >= game.maxPlayers;
  }

  // Connection management
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService(); 