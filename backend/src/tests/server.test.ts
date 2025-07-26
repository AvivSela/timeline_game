import request from 'supertest';
import express from 'express';

// Mock Prisma before importing the app
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    game: {
      create: jest.fn().mockResolvedValue({
        id: 'mock-game-id',
        roomCode: 'MOCK123',
        maxPlayers: 4,
        phase: 'WAITING',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'mock-game-id',
        roomCode: 'MOCK123',
        maxPlayers: 4,
        phase: 'WAITING',
        players: [],
      }),
    },
    player: {
      create: jest.fn().mockResolvedValue({
        id: 'mock-player-id',
        name: 'TestPlayer',
        gameId: 'mock-game-id',
      }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Import the app after mocking
const { default: app } = require('../index');

describe('Server API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('Game Creation', () => {
    it('should create a game with valid data', async () => {
      const gameData = {
        playerName: 'TestPlayer',
        maxPlayers: 4
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(200);

      expect(response.body).toHaveProperty('game');
      expect(response.body).toHaveProperty('player');
      expect(response.body.game).toHaveProperty('roomCode');
      expect(response.body.game).toHaveProperty('maxPlayers', 4);
      expect(response.body.player).toHaveProperty('name', 'TestPlayer');
    });

    it('should return 400 when player name is missing', async () => {
      const gameData = {
        maxPlayers: 4
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Player name is required');
    });

    it('should use default maxPlayers when not provided', async () => {
      const gameData = {
        playerName: 'TestPlayer'
      };

      const response = await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(200);

      expect(response.body.game).toHaveProperty('maxPlayers', 8);
    });
  });

  describe('Game Joining', () => {
    it('should allow player to join existing game', async () => {
      // First create a game
      const createResponse = await request(app)
        .post('/api/games')
        .send({
          playerName: 'HostPlayer',
          maxPlayers: 4
        })
        .expect(200);

      const roomCode = createResponse.body.game.roomCode;

      // Then join the game
      const joinData = {
        roomCode,
        playerName: 'JoinPlayer'
      };

      const response = await request(app)
        .post('/api/games/join')
        .send(joinData)
        .expect(200);

      expect(response.body).toHaveProperty('game');
      expect(response.body).toHaveProperty('player');
      expect(response.body.player).toHaveProperty('name', 'JoinPlayer');
    });

    it('should return 404 for non-existent game', async () => {
      const joinData = {
        roomCode: 'NONEXIST',
        playerName: 'TestPlayer'
      };

      const response = await request(app)
        .post('/api/games/join')
        .send(joinData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Game not found');
    });

    it('should return 400 when room code is missing', async () => {
      const joinData = {
        playerName: 'TestPlayer'
      };

      const response = await request(app)
        .post('/api/games/join')
        .send(joinData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Room code and player name are required');
    });

    it('should return 400 when player name is missing', async () => {
      const joinData = {
        roomCode: 'TEST123'
      };

      const response = await request(app)
        .post('/api/games/join')
        .send(joinData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Room code and player name are required');
    });
  });

  describe('Game Retrieval', () => {
    it('should return game by room code', async () => {
      // First create a game
      const createResponse = await request(app)
        .post('/api/games')
        .send({
          playerName: 'TestPlayer',
          maxPlayers: 4
        })
        .expect(200);

      const roomCode = createResponse.body.game.roomCode;

      // Then retrieve the game
      const response = await request(app)
        .get(`/api/games/${roomCode}`)
        .expect(200);

      expect(response.body).toHaveProperty('game');
      expect(response.body.game).toHaveProperty('roomCode', roomCode);
    });

    it('should return 404 for non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/NONEXIST')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Game not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Test with invalid JSON
      const response = await request(app)
        .post('/api/games')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });
}); 