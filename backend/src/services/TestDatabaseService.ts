import { PrismaClient, GamePhase, Difficulty } from '@prisma/client';

export class TestDatabaseService {
  public prisma: PrismaClient;

  constructor() {
    // Use test database URL
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/timeline_game_test'
        }
      }
    });
  }

  // Game Operations
  async createGame(roomCode: string, maxPlayers: number = 8): Promise<any> {
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

  async findGameByRoomCode(roomCode: string): Promise<any | null> {
    return this.prisma.game.findUnique({
      where: { roomCode }
    });
  }

  async getGameWithPlayers(roomCode: string): Promise<any | null> {
    return this.prisma.game.findUnique({
      where: { roomCode },
      include: { players: true }
    });
  }

  async updateGameState(roomCode: string, state: any): Promise<any> {
    return this.prisma.game.update({
      where: { roomCode },
      data: { state }
    });
  }

  async updateGamePhase(roomCode: string, phase: GamePhase): Promise<any> {
    return this.prisma.game.update({
      where: { roomCode },
      data: { phase }
    });
  }

  // Player Operations
  async addPlayerToGame(roomCode: string, playerName: string): Promise<any> {
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

  async updatePlayerScore(playerId: string, score: number): Promise<any> {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { score }
    });
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

  // Card Operations
  async getRandomCards(count: number, difficulty?: Difficulty): Promise<any[]> {
    const whereClause = difficulty ? { difficulty } : {};
    
    return this.prisma.card.findMany({
      where: whereClause,
      take: count
    });
  }

  // Cleanup Operations
  async cleanupTestData(): Promise<void> {
    // Delete all test data
    await this.prisma.timelineCard.deleteMany();
    await this.prisma.player.deleteMany();
    await this.prisma.game.deleteMany();
    await this.prisma.card.deleteMany();
  }

  async seedTestData(): Promise<void> {
    // Create some test cards
    await this.prisma.card.createMany({
      data: [
        {
          name: 'Ancient Egypt',
          description: 'The civilization of Ancient Egypt',
          chronologicalValue: 3000,
          difficulty: Difficulty.EASY,
          category: 'Ancient History'
        },
        {
          name: 'Roman Empire',
          description: 'The rise and fall of the Roman Empire',
          chronologicalValue: 100,
          difficulty: Difficulty.MEDIUM,
          category: 'Ancient History'
        },
        {
          name: 'Industrial Revolution',
          description: 'The Industrial Revolution in Europe',
          chronologicalValue: 1800,
          difficulty: Difficulty.HARD,
          category: 'Modern History'
        }
      ],
      skipDuplicates: true
    });
  }

  // Connection management
  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
} 