import request from 'supertest';
import app, { initializeDatabaseForTesting } from '../index';
import { IDatabaseService } from '../services/IDatabaseService';
import { MockDatabaseService } from '../services/MockDatabaseService';

describe('Server API', () => {
  let mockDbService: MockDatabaseService;

  beforeEach(async () => {
    mockDbService = new MockDatabaseService();
    await initializeDatabaseForTesting(mockDbService);
  });

  describe('Health Check', () => {
    it('should return health status with database connected', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('Game Creation', () => {
    it('should create a new game with database', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: 'TestPlayer', maxPlayers: 4 })
        .expect(200);

      expect(response.body).toHaveProperty('game');
      expect(response.body).toHaveProperty('roomCode');
      expect(response.body).toHaveProperty('gameId');
      expect(response.body.game.roomCode).toBeDefined();
      expect(response.body.game.players).toHaveLength(1);
      expect(response.body.game.players[0].name).toBe('TestPlayer');
    });

    it('should create a game with default maxPlayers', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: 'TestPlayer' })
        .expect(200);

      expect(response.body.game.maxPlayers).toBe(8);
    });

    it('should return 400 when player name is missing', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ maxPlayers: 4 })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Player name is required');
    });
  });

  describe('Game Joining', () => {
    beforeEach(async () => {
      // Create a fresh mock service and initialize it
      mockDbService = new MockDatabaseService();
      await initializeDatabaseForTesting(mockDbService);
      
      // Create a test game first
      await mockDbService.createGame('ABC123', 2);
      await mockDbService.addPlayerToGame('ABC123', 'Player1');
    });

    it('should allow player to join existing game', async () => {
      const response = await request(app)
        .post('/api/games/join')
        .send({ roomCode: 'ABC123', playerName: 'Player2' })
        .expect(200);

      expect(response.body).toHaveProperty('game');
      expect(response.body).toHaveProperty('player');
      expect(response.body.player.name).toBe('Player2');
    });

    it('should return 404 when game not found', async () => {
      const response = await request(app)
        .post('/api/games/join')
        .send({ roomCode: 'NONEXIST', playerName: 'Player1' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Game not found');
    });

    it('should return 400 when game is full', async () => {
      // Add another player to fill the game
      await mockDbService.addPlayerToGame('ABC123', 'Player2');

      const response = await request(app)
        .post('/api/games/join')
        .send({ roomCode: 'ABC123', playerName: 'Player3' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Game is full');
    });

    it('should return 400 when player name is already taken', async () => {
      const response = await request(app)
        .post('/api/games/join')
        .send({ roomCode: 'ABC123', playerName: 'Player1' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Player name is already taken');
    });

    it('should return 400 when room code is missing', async () => {
      const response = await request(app)
        .post('/api/games/join')
        .send({ playerName: 'Player1' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Room code and player name are required');
    });

    it('should return 400 when player name is missing', async () => {
      const response = await request(app)
        .post('/api/games/join')
        .send({ roomCode: 'ABC123' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Room code and player name are required');
    });
  });

  describe('Game Retrieval', () => {
    beforeEach(async () => {
      // Create a fresh mock service and initialize it
      mockDbService = new MockDatabaseService();
      await initializeDatabaseForTesting(mockDbService);
      
      // Create a test game with players
      await mockDbService.createGame('ABC123', 4);
      await mockDbService.addPlayerToGame('ABC123', 'Player1');
      await mockDbService.addPlayerToGame('ABC123', 'Player2');
    });

    it('should return game details', async () => {
      const response = await request(app)
        .get('/api/games/ABC123')
        .expect(200);

      expect(response.body).toHaveProperty('game');
      expect(response.body.game.roomCode).toBe('ABC123');
      expect(response.body.game.players).toHaveLength(2);
    });

    it('should return 404 when game not found', async () => {
      const response = await request(app)
        .get('/api/games/NONEXIST')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Game not found');
    });
  });
}); 