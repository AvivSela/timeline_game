import { TurnController, TurnState } from '../services/TurnController';
import { IDatabaseService } from '../services/IDatabaseService';
import { Player, Game } from '@prisma/client';

// Mock data
const mockPlayers: Player[] = [
  {
    id: 'player1',
    name: 'Alice',
    gameId: 'game1',
    isCurrentTurn: false,
    handCards: ['card1', 'card2'],
    score: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'player2',
    name: 'Bob',
    gameId: 'game1',
    isCurrentTurn: false,
    handCards: ['card3'],
    score: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'player3',
    name: 'Charlie',
    gameId: 'game1',
    isCurrentTurn: false,
    handCards: [],
    score: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockGame: Game = {
  id: 'game1',
  roomCode: 'TEST123',
  state: {
    turnState: {
      currentPlayerId: 'player1',
      currentPlayerName: 'Alice',
      turnOrder: ['player1', 'player2', 'player3'],
      turnNumber: 1
    }
  },
  phase: 'PLAYING',
  maxPlayers: 8,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('TurnController', () => {
  let turnController: TurnController;
  let mockDbService: jest.Mocked<IDatabaseService>;

  beforeEach(() => {
    mockDbService = {
      getPlayersByGameId: jest.fn(),
      setCurrentTurn: jest.fn(),
      updateGameState: jest.fn(),
      getGameById: jest.fn(),
      getPlayerById: jest.fn(),
      createGame: jest.fn(),
      findGameByRoomCode: jest.fn(),
      getGameWithPlayers: jest.fn(),
      getGameWithPlayersById: jest.fn(),
      updateGamePhase: jest.fn(),
      addPlayerToGame: jest.fn(),
      updatePlayerHand: jest.fn(),
      updatePlayerScore: jest.fn(),
      getRandomCards: jest.fn(),
      getCardById: jest.fn(),
      getCardsByCategory: jest.fn(),
      getAllCards: jest.fn(),
      getCardsByIds: jest.fn(),
      addCardToTimeline: jest.fn(),
      getTimelineForGame: jest.fn(),
      getTimelineCardsByGameId: jest.fn(),
      removeCardFromTimeline: jest.fn(),
      getGameWithPlayersAndTimeline: jest.fn(),
      cleanupInactiveGames: jest.fn(),
      getPlayerCount: jest.fn(),
      isGameFull: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as jest.Mocked<IDatabaseService>;

    turnController = new TurnController(mockDbService);
  });

  describe('Constructor', () => {
    it('should initialize with database service', () => {
      expect(turnController).toBeDefined();
      expect(turnController).toBeInstanceOf(TurnController);
    });
  });

  describe('initializeTurnOrder', () => {
    it('should initialize turn order with shuffled players', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      const result = await turnController.initializeTurnOrder('game1');

      expect(mockDbService.getPlayersByGameId).toHaveBeenCalledWith('game1');
      expect(mockDbService.setCurrentTurn).toHaveBeenCalled();
      expect(mockDbService.updateGameState).toHaveBeenCalledWith('game1', {
        turnState: expect.objectContaining({
          currentPlayerId: expect.any(String),
          currentPlayerName: expect.any(String),
          turnOrder: expect.arrayContaining(['player1', 'player2', 'player3']),
          turnNumber: 1
        })
      });
      expect(result).toHaveProperty('currentPlayerId');
      expect(result).toHaveProperty('currentPlayerName');
      expect(result).toHaveProperty('turnOrder');
      expect(result).toHaveProperty('turnNumber', 1);
    });

    it('should set first player as current turn', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      await turnController.initializeTurnOrder('game1');

      expect(mockDbService.setCurrentTurn).toHaveBeenCalledWith(
        expect.stringMatching(/player[123]/)
      );
    });

    it('should update game state with turn information', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      await turnController.initializeTurnOrder('game1');

      expect(mockDbService.updateGameState).toHaveBeenCalledWith('game1', {
        turnState: expect.objectContaining({
          currentPlayerId: expect.any(String),
          currentPlayerName: expect.any(String),
          turnOrder: expect.any(Array),
          turnNumber: 1
        })
      });
    });

    it('should throw error when no players in game', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue([]);

      await expect(turnController.initializeTurnOrder('game1'))
        .rejects.toThrow('Failed to initialize turn order');
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getPlayersByGameId.mockRejectedValue(new Error('Database error'));

      await expect(turnController.initializeTurnOrder('game1'))
        .rejects.toThrow('Failed to initialize turn order');
    });

    it('should handle games with only one player', async () => {
      const singlePlayer = [mockPlayers[0]];
      mockDbService.getPlayersByGameId.mockResolvedValue(singlePlayer);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      const result = await turnController.initializeTurnOrder('game1');

      expect(result.turnOrder).toHaveLength(1);
      expect(result.currentPlayerId).toBe('player1');
    });

    it('should handle games with many players', async () => {
      const manyPlayers = Array.from({ length: 10 }, (_, i) => ({
        ...mockPlayers[0],
        id: `player${i + 1}`,
        name: `Player ${i + 1}`
      }));
      mockDbService.getPlayersByGameId.mockResolvedValue(manyPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      const result = await turnController.initializeTurnOrder('game1');

      expect(result.turnOrder).toHaveLength(10);
      expect(result.turnNumber).toBe(1);
    });
  });

  describe('getCurrentTurnState', () => {
    it('should return turn state when game exists', async () => {
      mockDbService.getGameById.mockResolvedValue(mockGame);

      const result = await turnController.getCurrentTurnState('game1');

      expect(mockDbService.getGameById).toHaveBeenCalledWith('game1');
      expect(result).toEqual({
        currentPlayerId: 'player1',
        currentPlayerName: 'Alice',
        turnOrder: ['player1', 'player2', 'player3'],
        turnNumber: 1
      });
    });

    it('should return null when game doesn\'t exist', async () => {
      mockDbService.getGameById.mockResolvedValue(null);

      const result = await turnController.getCurrentTurnState('game1');

      expect(result).toBeNull();
    });

    it('should return null when game has no state', async () => {
      const gameWithoutState = { ...mockGame, state: null };
      mockDbService.getGameById.mockResolvedValue(gameWithoutState);

      const result = await turnController.getCurrentTurnState('game1');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getGameById.mockRejectedValue(new Error('Database error'));

      const result = await turnController.getCurrentTurnState('game1');

      expect(result).toBeNull();
    });
  });

  describe('getCurrentPlayer', () => {
    it('should return current player when exists', async () => {
      const currentPlayer = { ...mockPlayers[0], isCurrentTurn: true };
      const playersWithCurrent = [currentPlayer, mockPlayers[1], mockPlayers[2]];
      mockDbService.getPlayersByGameId.mockResolvedValue(playersWithCurrent);

      const result = await turnController.getCurrentPlayer('game1');

      expect(mockDbService.getPlayersByGameId).toHaveBeenCalledWith('game1');
      expect(result).toEqual(currentPlayer);
    });

    it('should return null when no current player', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);

      const result = await turnController.getCurrentPlayer('game1');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getPlayersByGameId.mockRejectedValue(new Error('Database error'));

      const result = await turnController.getCurrentPlayer('game1');

      expect(result).toBeNull();
    });
  });

  describe('nextTurn', () => {
    const mockTurnState: TurnState = {
      currentPlayerId: 'player1',
      currentPlayerName: 'Alice',
      turnOrder: ['player1', 'player2', 'player3'],
      turnNumber: 1
    };

    beforeEach(() => {
      mockDbService.getGameById.mockResolvedValue(mockGame);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[1]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);
      mockDbService.getPlayerById.mockResolvedValue(mockPlayers[1]);
    });

    it('should advance to next player in turn order', async () => {
      const result = await turnController.nextTurn('game1');

      expect(mockDbService.setCurrentTurn).toHaveBeenCalledWith('player2');
      expect(result.currentPlayerId).toBe('player2');
      expect(result.currentPlayerName).toBe('Bob');
      expect(result.turnNumber).toBe(2);
    });

    it('should wrap around to first player after last player', async () => {
      const lastPlayerTurnState = {
        ...mockTurnState,
        currentPlayerId: 'player3',
        currentPlayerName: 'Charlie',
        turnNumber: 3
      };
      const gameWithLastPlayer = {
        ...mockGame,
        state: { turnState: lastPlayerTurnState }
      };
      mockDbService.getGameById.mockResolvedValue(gameWithLastPlayer);
      mockDbService.getPlayerById.mockResolvedValue(mockPlayers[0]);

      const result = await turnController.nextTurn('game1');

      expect(mockDbService.setCurrentTurn).toHaveBeenCalledWith('player1');
      expect(result.currentPlayerId).toBe('player1');
      expect(result.currentPlayerName).toBe('Alice');
      expect(result.turnNumber).toBe(4);
    });

    it('should increment turn number', async () => {
      const result = await turnController.nextTurn('game1');

      expect(result.turnNumber).toBe(2);
    });

    it('should update game state with new turn information', async () => {
      await turnController.nextTurn('game1');

      expect(mockDbService.updateGameState).toHaveBeenCalledWith('game1', {
        turnState: expect.objectContaining({
          currentPlayerId: 'player2',
          currentPlayerName: 'Bob',
          turnNumber: 2
        })
      });
    });

    it('should throw error when no turn state found', async () => {
      const gameWithoutTurnState = { ...mockGame, state: {} };
      mockDbService.getGameById.mockResolvedValue(gameWithoutTurnState);

      await expect(turnController.nextTurn('game1'))
        .rejects.toThrow('Failed to advance to next turn');
    });

    it('should throw error when current player not in turn order', async () => {
      const invalidTurnState = {
        ...mockTurnState,
        currentPlayerId: 'invalid-player'
      };
      const gameWithInvalidState = {
        ...mockGame,
        state: { turnState: invalidTurnState }
      };
      mockDbService.getGameById.mockResolvedValue(gameWithInvalidState);

      await expect(turnController.nextTurn('game1'))
        .rejects.toThrow('Failed to advance to next turn');
    });

    it('should throw error when next player not found', async () => {
      mockDbService.getPlayerById.mockResolvedValue(null);

      await expect(turnController.nextTurn('game1'))
        .rejects.toThrow('Failed to advance to next turn');
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getGameById.mockRejectedValue(new Error('Database error'));

      await expect(turnController.nextTurn('game1'))
        .rejects.toThrow('Failed to advance to next turn');
    });

    it('should maintain turn order consistency across multiple turns', async () => {
      // First turn
      let result = await turnController.nextTurn('game1');
      expect(result.currentPlayerId).toBe('player2');
      expect(result.turnNumber).toBe(2);

      // Second turn
      const secondTurnState = { ...mockTurnState, currentPlayerId: 'player2', turnNumber: 2 };
      const gameWithSecondTurn = { ...mockGame, state: { turnState: secondTurnState } };
      mockDbService.getGameById.mockResolvedValue(gameWithSecondTurn);
      mockDbService.getPlayerById.mockResolvedValue(mockPlayers[2]);

      result = await turnController.nextTurn('game1');
      expect(result.currentPlayerId).toBe('player3');
      expect(result.turnNumber).toBe(3);
    });
  });

  describe('isPlayerTurn', () => {
    it('should return true when it\'s player\'s turn', async () => {
      const currentPlayer = { ...mockPlayers[0], isCurrentTurn: true };
      const playersWithCurrent = [currentPlayer, mockPlayers[1], mockPlayers[2]];
      mockDbService.getPlayersByGameId.mockResolvedValue(playersWithCurrent);

      const result = await turnController.isPlayerTurn('player1', 'game1');

      expect(result).toBe(true);
    });

    it('should return false when it\'s not player\'s turn', async () => {
      const currentPlayer = { ...mockPlayers[0], isCurrentTurn: true };
      const playersWithCurrent = [currentPlayer, mockPlayers[1], mockPlayers[2]];
      mockDbService.getPlayersByGameId.mockResolvedValue(playersWithCurrent);

      const result = await turnController.isPlayerTurn('player2', 'game1');

      expect(result).toBe(false);
    });

    it('should return false when no current player', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);

      const result = await turnController.isPlayerTurn('player1', 'game1');

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getPlayersByGameId.mockRejectedValue(new Error('Database error'));

      const result = await turnController.isPlayerTurn('player1', 'game1');

      expect(result).toBe(false);
    });
  });

  describe('getTurnOrder', () => {
    it('should return players in correct turn order', async () => {
      mockDbService.getGameById.mockResolvedValue(mockGame);
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);

      const result = await turnController.getTurnOrder('game1');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('player1');
      expect(result[1].id).toBe('player2');
      expect(result[2].id).toBe('player3');
    });

    it('should return empty array when no turn state', async () => {
      const gameWithoutTurnState = { ...mockGame, state: {} };
      mockDbService.getGameById.mockResolvedValue(gameWithoutTurnState);

      const result = await turnController.getTurnOrder('game1');

      expect(result).toEqual([]);
    });

    it('should handle missing players gracefully', async () => {
      const turnStateWithMissingPlayer = {
        turnState: {
          currentPlayerId: 'player1',
          currentPlayerName: 'Alice',
          turnOrder: ['player1', 'missing-player', 'player3'],
          turnNumber: 1
        }
      };
      const gameWithMissingPlayer = { ...mockGame, state: turnStateWithMissingPlayer };
      mockDbService.getGameById.mockResolvedValue(gameWithMissingPlayer);
      mockDbService.getPlayersByGameId.mockResolvedValue([mockPlayers[0], mockPlayers[2]]);

      const result = await turnController.getTurnOrder('game1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('player1');
      expect(result[1].id).toBe('player3');
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getGameById.mockRejectedValue(new Error('Database error'));

      const result = await turnController.getTurnOrder('game1');

      expect(result).toEqual([]);
    });
  });

  describe('getTurnInfo', () => {
    beforeEach(() => {
      mockDbService.getGameById.mockResolvedValue(mockGame);
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
    });

    it('should return complete turn information', async () => {
      const currentPlayer = { ...mockPlayers[0], isCurrentTurn: true };
      const playersWithCurrent = [currentPlayer, mockPlayers[1], mockPlayers[2]];
      mockDbService.getPlayersByGameId.mockResolvedValue(playersWithCurrent);

      const result = await turnController.getTurnInfo('game1');

      expect(result).toEqual({
        currentPlayer,
        turnOrder: expect.any(Array),
        turnNumber: 1,
        isGameOver: false
      });
    });

    it('should detect game over when all players have empty hands', async () => {
      const playersWithEmptyHands = mockPlayers.map(player => ({
        ...player,
        handCards: []
      }));
      mockDbService.getPlayersByGameId.mockResolvedValue(playersWithEmptyHands);

      const result = await turnController.getTurnInfo('game1');

      expect(result.isGameOver).toBe(true);
    });

    it('should detect game not over when players have cards', async () => {
      const result = await turnController.getTurnInfo('game1');

      expect(result.isGameOver).toBe(false);
    });

    it('should handle missing turn state gracefully', async () => {
      const gameWithoutTurnState = { ...mockGame, state: {} };
      mockDbService.getGameById.mockResolvedValue(gameWithoutTurnState);

      const result = await turnController.getTurnInfo('game1');

      expect(result).toEqual({
        currentPlayer: null,
        turnOrder: [],
        turnNumber: 1,
        isGameOver: false
      });
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getGameById.mockRejectedValue(new Error('Database error'));

      const result = await turnController.getTurnInfo('game1');

      expect(result).toEqual({
        currentPlayer: null,
        turnOrder: [],
        turnNumber: 1,
        isGameOver: false
      });
    });

    it('should handle mixed hand card formats', async () => {
      const playersWithMixedFormats = [
        { ...mockPlayers[0], handCards: ['card1', 'card2'] },
        { ...mockPlayers[1], handCards: [] },
        { ...mockPlayers[2], handCards: null as any }
      ];
      mockDbService.getPlayersByGameId.mockResolvedValue(playersWithMixedFormats);

      const result = await turnController.getTurnInfo('game1');

      expect(result.isGameOver).toBe(false);
    });
  });

  describe('resetTurnOrder', () => {
    it('should reset and reinitialize turn order', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      const result = await turnController.resetTurnOrder('game1');

      expect(mockDbService.getPlayersByGameId).toHaveBeenCalledWith('game1');
      expect(mockDbService.setCurrentTurn).toHaveBeenCalled();
      expect(mockDbService.updateGameState).toHaveBeenCalled();
      expect(result).toHaveProperty('turnNumber', 1);
    });

    it('should handle database errors gracefully', async () => {
      mockDbService.getPlayersByGameId.mockRejectedValue(new Error('Database error'));

      await expect(turnController.resetTurnOrder('game1'))
        .rejects.toThrow('Failed to reset turn order');
    });
  });

  describe('shufflePlayers (private method)', () => {
    it('should shuffle players randomly', async () => {
      // Test that the shuffle method is called during initialization
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      const result1 = await turnController.initializeTurnOrder('game1');
      const result2 = await turnController.initializeTurnOrder('game1');

      // The turn order should contain all players but may be in different order
      expect(result1.turnOrder).toHaveLength(3);
      expect(result1.turnOrder).toContain('player1');
      expect(result1.turnOrder).toContain('player2');
      expect(result1.turnOrder).toContain('player3');
    });

    it('should preserve all players in result', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      const result = await turnController.initializeTurnOrder('game1');

      expect(result.turnOrder).toHaveLength(3);
      expect(result.turnOrder).toContain('player1');
      expect(result.turnOrder).toContain('player2');
      expect(result.turnOrder).toContain('player3');
    });

    it('should handle single player', async () => {
      const singlePlayer = [mockPlayers[0]];
      mockDbService.getPlayersByGameId.mockResolvedValue(singlePlayer);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      const result = await turnController.initializeTurnOrder('game1');

      expect(result.turnOrder).toEqual(['player1']);
    });

    it('should handle empty array', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue([]);

      await expect(turnController.initializeTurnOrder('game1'))
        .rejects.toThrow('Failed to initialize turn order');
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with different database service implementations', async () => {
      // Test with a different mock implementation
      const alternativeMockDbService: jest.Mocked<IDatabaseService> = {
        getPlayersByGameId: jest.fn().mockResolvedValue(mockPlayers),
        setCurrentTurn: jest.fn().mockResolvedValue(mockPlayers[0]),
        updateGameState: jest.fn().mockResolvedValue(mockGame),
        getGameById: jest.fn().mockResolvedValue(mockGame),
        getPlayerById: jest.fn().mockResolvedValue(mockPlayers[0]),
        createGame: jest.fn(),
        findGameByRoomCode: jest.fn(),
        getGameWithPlayers: jest.fn(),
        getGameWithPlayersById: jest.fn(),
        updateGamePhase: jest.fn(),
        addPlayerToGame: jest.fn(),
        updatePlayerHand: jest.fn(),
        updatePlayerScore: jest.fn(),
        getRandomCards: jest.fn(),
        getCardById: jest.fn(),
        getCardsByCategory: jest.fn(),
        getAllCards: jest.fn(),
        getCardsByIds: jest.fn(),
        addCardToTimeline: jest.fn(),
        getTimelineForGame: jest.fn(),
        getTimelineCardsByGameId: jest.fn(),
        removeCardFromTimeline: jest.fn(),
        getGameWithPlayersAndTimeline: jest.fn(),
        cleanupInactiveGames: jest.fn(),
        getPlayerCount: jest.fn(),
        isGameFull: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
      } as jest.Mocked<IDatabaseService>;

      const alternativeTurnController = new TurnController(alternativeMockDbService);
      const result = await alternativeTurnController.initializeTurnOrder('game1');

      expect(result).toBeDefined();
      expect(alternativeMockDbService.getPlayersByGameId).toHaveBeenCalled();
    });

    it('should handle state persistence correctly', async () => {
      mockDbService.getPlayersByGameId.mockResolvedValue(mockPlayers);
      mockDbService.setCurrentTurn.mockResolvedValue(mockPlayers[0]);
      mockDbService.updateGameState.mockResolvedValue(mockGame);

      // Initialize turn order
      await turnController.initializeTurnOrder('game1');

      // Verify state was persisted
      expect(mockDbService.updateGameState).toHaveBeenCalledWith('game1', {
        turnState: expect.objectContaining({
          currentPlayerId: expect.any(String),
          turnOrder: expect.any(Array),
          turnNumber: 1
        })
      });
    });

    it('should validate game ID format/validity', async () => {
      // Test with invalid game ID
      mockDbService.getPlayersByGameId.mockRejectedValue(new Error('Invalid game ID'));

      await expect(turnController.initializeTurnOrder('invalid-game-id'))
        .rejects.toThrow('Failed to initialize turn order');
    });
  });
}); 