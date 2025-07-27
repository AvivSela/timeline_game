import { DatabaseService } from '../services/DatabaseService';
import { PrismaClient, GamePhase, Difficulty } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    game: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    player: {
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    card: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    timelineCard: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    GamePhase: {
      WAITING: 'WAITING',
      PLAYING: 'PLAYING',
      FINISHED: 'FINISHED',
    },
    Difficulty: {
      EASY: 'EASY',
      MEDIUM: 'MEDIUM',
      HARD: 'HARD',
    },
  };
});

// Suppress console output during tests
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dbService = new DatabaseService();
    mockPrisma = dbService.prisma;
  });

  describe('Game Management', () => {
    it('should create a new game', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 4,
        phase: GamePhase.WAITING,
        state: { currentTurn: 0, round: 1, maxRounds: 5 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.game.create.mockResolvedValue(mockGame);

      const result = await dbService.createGame('TEST456', 4);
      
      expect(mockPrisma.game.create).toHaveBeenCalledWith({
        data: {
          roomCode: 'TEST456',
          maxPlayers: 4,
          state: {
            currentTurn: 0,
            round: 1,
            maxRounds: 5
          },
          phase: GamePhase.WAITING
        }
      });
      expect(result).toEqual(mockGame);
    });

    it('should create a game with default maxPlayers', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 8,
        phase: GamePhase.WAITING,
        state: { currentTurn: 0, round: 1, maxRounds: 5 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.game.create.mockResolvedValue(mockGame);

      const result = await dbService.createGame('TEST456');
      
      expect(mockPrisma.game.create).toHaveBeenCalledWith({
        data: {
          roomCode: 'TEST456',
          maxPlayers: 8,
          state: {
            currentTurn: 0,
            round: 1,
            maxRounds: 5
          },
          phase: GamePhase.WAITING
        }
      });
      expect(result).toEqual(mockGame);
    });

    it('should find a game by room code', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 4,
        phase: GamePhase.WAITING,
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);

      const result = await dbService.findGameByRoomCode('TEST456');
      
      expect(mockPrisma.game.findUnique).toHaveBeenCalledWith({
        where: { roomCode: 'TEST456' }
      });
      expect(result).toEqual(mockGame);
    });

    it('should return null for non-existent game', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(null);

      const result = await dbService.findGameByRoomCode('NONEXIST');
      
      expect(result).toBeNull();
    });

    it('should get game with players', async () => {
      const mockGameWithPlayers = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 4,
        players: [
          { id: 'player1', name: 'Player1', gameId: 'mock-game-id' },
          { id: 'player2', name: 'Player2', gameId: 'mock-game-id' },
        ]
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGameWithPlayers);

      const result = await dbService.getGameWithPlayers('TEST456');
      
      expect(mockPrisma.game.findUnique).toHaveBeenCalledWith({
        where: { roomCode: 'TEST456' },
        include: { players: true }
      });
      expect(result).toEqual(mockGameWithPlayers);
    });

    it('should update game state', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        state: { currentTurn: 1, round: 2, maxRounds: 5 },
      };

      const updatedState = {
        currentTurn: 1,
        round: 2,
        maxRounds: 5
      };

      mockPrisma.game.update.mockResolvedValue(mockGame);

      const result = await dbService.updateGameState('TEST456', updatedState);
      
      expect(mockPrisma.game.update).toHaveBeenCalledWith({
        where: { id: 'TEST456' },
        data: { state: updatedState }
      });
      expect(result).toEqual(mockGame);
    });

    it('should update game phase', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        phase: GamePhase.PLAYING,
      };

      mockPrisma.game.update.mockResolvedValue(mockGame);

      const result = await dbService.updateGamePhase('TEST456', GamePhase.PLAYING);
      
      expect(mockPrisma.game.update).toHaveBeenCalledWith({
        where: { roomCode: 'TEST456' },
        data: { phase: GamePhase.PLAYING }
      });
      expect(result).toEqual(mockGame);
    });
  });

  describe('Player Management', () => {
    it('should add a player to a game', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 4,
      };

      const mockPlayer = {
        id: 'mock-player-id',
        name: 'TestPlayer',
        gameId: 'mock-game-id',
        isCurrentTurn: true,
        score: 0,
        handCards: [],
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.player.count.mockResolvedValue(0);
      mockPrisma.player.create.mockResolvedValue(mockPlayer);

      const result = await dbService.addPlayerToGame('TEST456', 'TestPlayer');
      
      expect(mockPrisma.game.findUnique).toHaveBeenCalledWith({
        where: { roomCode: 'TEST456' }
      });
      expect(mockPrisma.player.count).toHaveBeenCalledWith({
        where: { gameId: 'mock-game-id' }
      });
      expect(mockPrisma.player.create).toHaveBeenCalledWith({
        data: {
          name: 'TestPlayer',
          gameId: 'mock-game-id',
          handCards: [],
          isCurrentTurn: true,
          score: 0
        }
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should throw error when game not found', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(null);

      await expect(dbService.addPlayerToGame('NONEXIST', 'TestPlayer'))
        .rejects.toThrow('Game not found');
    });

    it('should throw error when game is full', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 2,
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.player.count.mockResolvedValue(2);

      await expect(dbService.addPlayerToGame('TEST456', 'TestPlayer'))
        .rejects.toThrow('Game is full');
    });

    it('should set second player as not current turn', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 4,
      };

      const mockPlayer = {
        id: 'mock-player-id',
        name: 'TestPlayer',
        gameId: 'mock-game-id',
        isCurrentTurn: false,
        score: 0,
        handCards: [],
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.player.count.mockResolvedValue(1);
      mockPrisma.player.create.mockResolvedValue(mockPlayer);

      const result = await dbService.addPlayerToGame('TEST456', 'TestPlayer');
      
      expect(mockPrisma.player.create).toHaveBeenCalledWith({
        data: {
          name: 'TestPlayer',
          gameId: 'mock-game-id',
          handCards: [],
          isCurrentTurn: false,
          score: 0
        }
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should update player hand', async () => {
      const mockPlayer = {
        id: 'mock-player-id',
        name: 'TestPlayer',
        handCards: [1, 2, 3],
      };

      mockPrisma.player.update.mockResolvedValue(mockPlayer);

      const result = await dbService.updatePlayerHand('mock-player-id', ['1', '2', '3']);
      
      expect(mockPrisma.player.update).toHaveBeenCalledWith({
        where: { id: 'mock-player-id' },
        data: { handCards: ['1', '2', '3'] }
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should set current turn', async () => {
      const mockPlayer = {
        id: 'mock-player-id',
        name: 'TestPlayer',
        gameId: 'mock-game-id',
        isCurrentTurn: true,
      };

      mockPrisma.player.findUnique.mockResolvedValue({
        ...mockPlayer,
        game: { id: 'mock-game-id' }
      });
      mockPrisma.player.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.player.update.mockResolvedValue(mockPlayer);

      const result = await dbService.setCurrentTurn('mock-player-id');
      
      expect(mockPrisma.player.findUnique).toHaveBeenCalledWith({
        where: { id: 'mock-player-id' },
        include: { game: true }
      });
      expect(mockPrisma.player.updateMany).toHaveBeenCalledWith({
        where: { gameId: 'mock-game-id' },
        data: { isCurrentTurn: false }
      });
      expect(mockPrisma.player.update).toHaveBeenCalledWith({
        where: { id: 'mock-player-id' },
        data: { isCurrentTurn: true }
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should throw error when player not found for setCurrentTurn', async () => {
      mockPrisma.player.findUnique.mockResolvedValue(null);

      await expect(dbService.setCurrentTurn('non-existent-player'))
        .rejects.toThrow('Player not found');
    });

    it('should update player score', async () => {
      const mockPlayer = {
        id: 'mock-player-id',
        name: 'TestPlayer',
        score: 100,
      };

      mockPrisma.player.update.mockResolvedValue(mockPlayer);

      const result = await dbService.updatePlayerScore('mock-player-id', 100);
      
      expect(mockPrisma.player.update).toHaveBeenCalledWith({
        where: { id: 'mock-player-id' },
        data: { score: 100 }
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should get player count', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.player.count.mockResolvedValue(3);

      const result = await dbService.getPlayerCount('TEST456');
      
      expect(mockPrisma.game.findUnique).toHaveBeenCalledWith({
        where: { roomCode: 'TEST456' }
      });
      expect(mockPrisma.player.count).toHaveBeenCalledWith({
        where: { gameId: 'mock-game-id' }
      });
      expect(result).toBe(3);
    });

    it('should return 0 player count for non-existent game', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(null);

      const result = await dbService.getPlayerCount('NONEXIST');
      
      expect(result).toBe(0);
    });

    it('should check if game is full', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        maxPlayers: 2,
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.player.count.mockResolvedValue(2);

      const result = await dbService.isGameFull('TEST456');
      
      expect(result).toBe(true);
    });

    it('should return false for non-existent game', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(null);

      const result = await dbService.isGameFull('NONEXIST');
      
      expect(result).toBe(false);
    });
  });

  describe('Card Operations', () => {
    it('should get random cards without difficulty filter', async () => {
      const mockCards = [
        { id: 'card1', name: 'Card 1', difficulty: Difficulty.EASY },
        { id: 'card2', name: 'Card 2', difficulty: Difficulty.MEDIUM },
      ];

      mockPrisma.card.findMany.mockResolvedValue(mockCards);

      const result = await dbService.getRandomCards(5);
      
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith({
        where: {},
        take: 5
      });
      expect(result).toEqual(mockCards);
    });

    it('should get random cards with difficulty filter', async () => {
      const mockCards = [
        { id: 'card1', name: 'Card 1', difficulty: Difficulty.EASY },
      ];

      mockPrisma.card.findMany.mockResolvedValue(mockCards);

      const result = await dbService.getRandomCards(3, Difficulty.EASY);
      
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith({
        where: { difficulty: Difficulty.EASY },
        take: 3
      });
      expect(result).toEqual(mockCards);
    });

    it('should get card by id', async () => {
      const mockCard = {
        id: 'card1',
        name: 'Test Card',
        description: 'Test Description',
        chronologicalValue: 1000,
        difficulty: Difficulty.MEDIUM,
        category: 'History',
      };

      mockPrisma.card.findUnique.mockResolvedValue(mockCard);

      const result = await dbService.getCardById('card1');
      
      expect(mockPrisma.card.findUnique).toHaveBeenCalledWith({
        where: { id: 'card1' }
      });
      expect(result).toEqual(mockCard);
    });

    it('should get cards by category', async () => {
      const mockCards = [
        { id: 'card1', name: 'Card 1', category: 'History', chronologicalValue: 1000 },
        { id: 'card2', name: 'Card 2', category: 'History', chronologicalValue: 2000 },
      ];

      mockPrisma.card.findMany.mockResolvedValue(mockCards);

      const result = await dbService.getCardsByCategory('History');
      
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith({
        where: { category: 'History' },
        orderBy: { chronologicalValue: 'asc' }
      });
      expect(result).toEqual(mockCards);
    });
  });

  describe('Timeline Operations', () => {
    it('should add card to timeline', async () => {
      const mockTimelineCard = {
        id: 'timeline1',
        gameId: 'mock-game-id',
        cardId: 'card1',
        position: 0,
        placedAt: new Date(),
      };

      mockPrisma.timelineCard.create.mockResolvedValue(mockTimelineCard);

      const result = await dbService.addCardToTimeline('mock-game-id', 'card1', 0);
      
      expect(mockPrisma.timelineCard.create).toHaveBeenCalledWith({
        data: {
          gameId: 'mock-game-id',
          cardId: 'card1',
          position: 0
        }
      });
      expect(result).toEqual(mockTimelineCard);
    });

    it('should get timeline for game', async () => {
      const mockGame = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
      };

      const mockTimelineCards = [
        { id: 'timeline1', gameId: 'mock-game-id', cardId: 'card1', position: 0, card: { id: 'card1', name: 'Card 1' } },
        { id: 'timeline2', gameId: 'mock-game-id', cardId: 'card2', position: 1, card: { id: 'card2', name: 'Card 2' } },
      ];

      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.timelineCard.findMany.mockResolvedValue(mockTimelineCards);

      const result = await dbService.getTimelineForGame('TEST456');
      
      expect(mockPrisma.game.findUnique).toHaveBeenCalledWith({
        where: { roomCode: 'TEST456' }
      });
      expect(mockPrisma.timelineCard.findMany).toHaveBeenCalledWith({
        where: { gameId: 'mock-game-id' },
        include: { card: true },
        orderBy: { position: 'asc' }
      });
      expect(result).toEqual(mockTimelineCards);
    });

    it('should throw error when game not found for timeline', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(null);

      await expect(dbService.getTimelineForGame('NONEXIST'))
        .rejects.toThrow('Game not found');
    });

    it('should remove card from timeline', async () => {
      mockPrisma.timelineCard.delete.mockResolvedValue({ id: 'timeline1' });

      await dbService.removeCardFromTimeline('timeline1');
      
      expect(mockPrisma.timelineCard.delete).toHaveBeenCalledWith({
        where: { id: 'timeline1' }
      });
    });
  });

  describe('Utility Operations', () => {
    it('should get game with players and timeline', async () => {
      const mockGameWithPlayersAndTimeline = {
        id: 'mock-game-id',
        roomCode: 'TEST456',
        players: [
          { id: 'player1', name: 'Player1' },
        ],
        timelineCards: [
          { id: 'timeline1', position: 0, card: { id: 'card1', name: 'Card 1' } },
        ]
      };

      mockPrisma.game.findUnique.mockResolvedValue(mockGameWithPlayersAndTimeline);

      const result = await dbService.getGameWithPlayersAndTimeline('TEST456');
      
      expect(mockPrisma.game.findUnique).toHaveBeenCalledWith({
        where: { roomCode: 'TEST456' },
        include: {
          players: true,
          timelineCards: {
            include: { card: true },
            orderBy: { position: 'asc' }
          }
        }
      });
      expect(result).toEqual(mockGameWithPlayersAndTimeline);
    });

    it('should cleanup inactive games', async () => {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      mockPrisma.game.deleteMany.mockResolvedValue({ count: 5 });

      const result = await dbService.cleanupInactiveGames(24);
      
      expect(mockPrisma.game.deleteMany).toHaveBeenCalledWith({
        where: {
          updatedAt: {
            lt: expect.any(Date)
          },
          phase: {
            in: [GamePhase.WAITING, GamePhase.FINISHED]
          }
        }
      });
      expect(result).toBe(5);
    });

    it('should cleanup inactive games with default hours', async () => {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      mockPrisma.game.deleteMany.mockResolvedValue({ count: 3 });

      const result = await dbService.cleanupInactiveGames();
      
      expect(mockPrisma.game.deleteMany).toHaveBeenCalledWith({
        where: {
          updatedAt: {
            lt: expect.any(Date)
          },
          phase: {
            in: [GamePhase.WAITING, GamePhase.FINISHED]
          }
        }
      });
      expect(result).toBe(3);
    });
  });

  describe('Connection Management', () => {
    it('should disconnect from database', async () => {
      mockPrisma.$disconnect.mockResolvedValue(undefined);

      await dbService.disconnect();
      
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});