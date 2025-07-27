import { TestDatabaseService } from '../services/TestDatabaseService';
import { GamePhase, Difficulty } from '@prisma/client';

// Load test environment
require('dotenv').config({ path: '.env.test' });

describe('Database Integration Tests', () => {
  let dbService: TestDatabaseService;
  const testRoomCode = 'TEST456';
  let databaseAvailable = false;

  beforeAll(async () => {
    dbService = new TestDatabaseService();
    
    // Test if database is available
    try {
      await dbService.connect();
      databaseAvailable = true;
      console.log('✅ Real database connection successful - running integration tests');
    } catch (error) {
      console.log('⚠️  Real database not available - skipping integration tests');
      console.log('   To enable real database tests:');
      console.log('   1. Ensure PostgreSQL is running on localhost:5433');
      console.log('   2. Create database: timeline_game_test');
      console.log('   3. Set up authentication for postgres user');
      console.log('   4. Run: yarn test:db:setup');
      databaseAvailable = false;
    }
  });

  afterAll(async () => {
    if (databaseAvailable) {
      await dbService.disconnect();
    }
  });

  beforeEach(async () => {
    if (!databaseAvailable) {
      return; // Skip tests if database is not available
    }
    // Clean up test data before each test
    await dbService.cleanupTestData();
    // Seed test data
    await dbService.seedTestData();
  });

  describe('Game Management', () => {
    it('should create a new game', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      const game = await dbService.createGame(testRoomCode, 4);
      
      expect(game).toBeDefined();
      expect(game.roomCode).toBe(testRoomCode);
      expect(game.maxPlayers).toBe(4);
      expect(game.phase).toBe(GamePhase.WAITING);
      expect(game.state).toEqual({
        currentTurn: 0,
        round: 1,
        maxRounds: 5
      });
    });

    it('should find a game by room code', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // First create a game
      await dbService.createGame(testRoomCode, 4);

      // Then find it
      const game = await dbService.findGameByRoomCode(testRoomCode);
      
      expect(game).toBeDefined();
      expect(game?.roomCode).toBe(testRoomCode);
      expect(game?.maxPlayers).toBe(4);
    });

    it('should return null for non-existent game', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      const game = await dbService.findGameByRoomCode('NONEXIST');
      expect(game).toBeNull();
    });

    it('should update game state', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game first
      await dbService.createGame(testRoomCode, 4);

      // Update the game state
      const updatedState = {
        currentTurn: 1,
        round: 2,
        maxRounds: 5
      };

      const updatedGame = await dbService.updateGameState(testRoomCode, updatedState);
      
      expect(updatedGame).toBeDefined();
      expect(updatedGame.state).toEqual(updatedState);
    });

    it('should update game phase', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game first
      await dbService.createGame(testRoomCode, 4);

      // Update phase
      const updatedGame = await dbService.updateGamePhase(testRoomCode, GamePhase.PLAYING);
      
      expect(updatedGame).toBeDefined();
      expect(updatedGame.phase).toBe(GamePhase.PLAYING);
    });
  });

  describe('Player Management', () => {
    it('should add a player to a game', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game first
      await dbService.createGame(testRoomCode, 4);

      // Add a player
      const player = await dbService.addPlayerToGame(testRoomCode, 'TestPlayer');
      
      expect(player).toBeDefined();
      expect(player.name).toBe('TestPlayer');
      expect(player.isCurrentTurn).toBe(true); // First player should be current turn
      expect(player.score).toBe(0);
      expect(player.handCards).toEqual([]);
    });

    it('should throw error when game not found', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      await expect(dbService.addPlayerToGame('NONEXIST', 'TestPlayer'))
        .rejects.toThrow('Game not found');
    });

    it('should throw error when game is full', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a small game
      await dbService.createGame(testRoomCode, 2);

      // Add players to fill the game
      await dbService.addPlayerToGame(testRoomCode, 'Player1');
      await dbService.addPlayerToGame(testRoomCode, 'Player2');

      // Try to add a third player
      await expect(dbService.addPlayerToGame(testRoomCode, 'Player3'))
        .rejects.toThrow('Game is full');
    });

    it('should get game with players', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game first
      await dbService.createGame(testRoomCode, 4);

      // Add players
      await dbService.addPlayerToGame(testRoomCode, 'Player1');
      await dbService.addPlayerToGame(testRoomCode, 'Player2');

      // Get game with players
      const gameWithPlayers = await dbService.getGameWithPlayers(testRoomCode);
      
      expect(gameWithPlayers).toBeDefined();
      expect(gameWithPlayers?.players).toHaveLength(2);
      expect(gameWithPlayers?.players[0].name).toBe('Player1');
      expect(gameWithPlayers?.players[1].name).toBe('Player2');
    });

    it('should update player score', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game first
      await dbService.createGame(testRoomCode, 4);

      // Add a player
      const player = await dbService.addPlayerToGame(testRoomCode, 'TestPlayer');

      // Update score
      const updatedPlayer = await dbService.updatePlayerScore(player.id, 100);
      
      expect(updatedPlayer).toBeDefined();
      expect(updatedPlayer.score).toBe(100);
    });

    it('should get player count', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game first
      await dbService.createGame(testRoomCode, 4);

      // Check initial count
      expect(await dbService.getPlayerCount(testRoomCode)).toBe(0);

      // Add a player
      await dbService.addPlayerToGame(testRoomCode, 'TestPlayer');

      // Check updated count
      expect(await dbService.getPlayerCount(testRoomCode)).toBe(1);
    });

    it('should check if game is full', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a small game
      await dbService.createGame(testRoomCode, 2);

      // Check initial state
      expect(await dbService.isGameFull(testRoomCode)).toBe(false);

      // Add players to fill the game
      await dbService.addPlayerToGame(testRoomCode, 'Player1');
      await dbService.addPlayerToGame(testRoomCode, 'Player2');

      // Check if full
      expect(await dbService.isGameFull(testRoomCode)).toBe(true);
    });
  });

  describe('Card Operations', () => {
    it('should get random cards', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      const cards = await dbService.getRandomCards(5);
      
      expect(cards).toBeDefined();
      expect(cards.length).toBeLessThanOrEqual(5);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should get cards by difficulty', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      const easyCards = await dbService.getRandomCards(3, Difficulty.EASY);
      
      expect(easyCards).toBeDefined();
      expect(easyCards.length).toBeLessThanOrEqual(3);
      easyCards.forEach(card => {
        expect(card.difficulty).toBe(Difficulty.EASY);
      });
    });

    it('should get cards by different difficulties', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      const mediumCards = await dbService.getRandomCards(3, Difficulty.MEDIUM);
      const hardCards = await dbService.getRandomCards(3, Difficulty.HARD);
      
      expect(mediumCards).toBeDefined();
      expect(hardCards).toBeDefined();
      
      mediumCards.forEach(card => {
        expect(card.difficulty).toBe(Difficulty.MEDIUM);
      });
      
      hardCards.forEach(card => {
        expect(card.difficulty).toBe(Difficulty.HARD);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game
      const game = await dbService.createGame(testRoomCode, 4);
      
      // Add a player
      const player = await dbService.addPlayerToGame(testRoomCode, 'TestPlayer');
      
      // Verify the player is linked to the game
      expect(player.gameId).toBe(game.id);
      
      // Get game with players and verify the relationship
      const gameWithPlayers = await dbService.getGameWithPlayers(testRoomCode);
      expect(gameWithPlayers?.players).toHaveLength(1);
      expect(gameWithPlayers?.players[0].id).toBe(player.id);
    });

    it('should handle concurrent operations', async () => {
      if (!databaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }

      // Create a game
      await dbService.createGame(testRoomCode, 4);
      
      // Add multiple players concurrently
      const promises = [
        dbService.addPlayerToGame(testRoomCode, 'Player1'),
        dbService.addPlayerToGame(testRoomCode, 'Player2'),
        dbService.addPlayerToGame(testRoomCode, 'Player3')
      ];
      
      const players = await Promise.all(promises);
      
      expect(players).toHaveLength(3);
      expect(await dbService.getPlayerCount(testRoomCode)).toBe(3);
    });
  });
}); 