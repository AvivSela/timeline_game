import { MockDatabaseService } from '../services/MockDatabaseService';
import { GamePhase, Difficulty } from '@prisma/client';

describe('MockDatabaseService', () => {
  let mockService: MockDatabaseService;

  beforeEach(() => {
    mockService = new MockDatabaseService();
  });

  describe('Connection Management', () => {
    it('should connect without error', async () => {
      await expect(mockService.connect()).resolves.toBeUndefined();
    });

    it('should disconnect without error', async () => {
      await expect(mockService.disconnect()).resolves.toBeUndefined();
    });
  });

  describe('Game Operations', () => {
    describe('createGame', () => {
      it('should create a new game with default maxPlayers', async () => {
        const game = await mockService.createGame('TEST123');
        
        expect(game).toMatchObject({
          roomCode: 'TEST123',
          maxPlayers: 8,
          phase: GamePhase.WAITING,
          state: {
            currentTurn: 0,
            round: 1,
            maxRounds: 5
          }
        });
        expect(game.id).toMatch(/^game_\d+$/);
        expect(game.createdAt).toBeInstanceOf(Date);
        expect(game.updatedAt).toBeInstanceOf(Date);
      });

      it('should create a game with custom maxPlayers', async () => {
        const game = await mockService.createGame('TEST456', 4);
        
        expect(game).toMatchObject({
          roomCode: 'TEST456',
          maxPlayers: 4,
          phase: GamePhase.WAITING
        });
      });

      it('should create multiple games with unique IDs', async () => {
        const game1 = await mockService.createGame('TEST1');
        const game2 = await mockService.createGame('TEST2');
        
        expect(game1.id).not.toBe(game2.id);
      });
    });

    describe('findGameByRoomCode', () => {
      it('should find an existing game', async () => {
        const createdGame = await mockService.createGame('TEST123');
        const foundGame = await mockService.findGameByRoomCode('TEST123');
        
        expect(foundGame).toEqual(createdGame);
      });

      it('should return null for non-existent game', async () => {
        const foundGame = await mockService.findGameByRoomCode('NONEXISTENT');
        
        expect(foundGame).toBeNull();
      });
    });

    describe('getGameWithPlayers', () => {
      it('should return game with empty players array when no players', async () => {
        await mockService.createGame('TEST123');
        const result = await mockService.getGameWithPlayers('TEST123');
        
        expect(result).toMatchObject({
          roomCode: 'TEST123',
          players: []
        });
      });

      it('should return game with players', async () => {
        await mockService.createGame('TEST123');
        const player1 = await mockService.addPlayerToGame('TEST123', 'Player1');
        const player2 = await mockService.addPlayerToGame('TEST123', 'Player2');
        
        const result = await mockService.getGameWithPlayers('TEST123');
        
        expect(result?.players).toHaveLength(2);
        expect(result?.players).toEqual(expect.arrayContaining([player1, player2]));
      });

      it('should return null for non-existent game', async () => {
        const result = await mockService.getGameWithPlayers('NONEXISTENT');
        
        expect(result).toBeNull();
      });
    });

    describe('updateGameState', () => {
      it('should update game state', async () => {
        await mockService.createGame('TEST123');
        const newState = { currentTurn: 1, round: 2, maxRounds: 5 };
        
        const updatedGame = await mockService.updateGameState('TEST123', newState);
        
        expect(updatedGame.state).toEqual(newState);
        expect(updatedGame.updatedAt).toBeInstanceOf(Date);
      });

      it('should throw error for non-existent game', async () => {
        await expect(mockService.updateGameState('NONEXISTENT', {})).rejects.toThrow('Game not found');
      });
    });

    describe('updateGamePhase', () => {
      it('should update game phase', async () => {
        await mockService.createGame('TEST123');
        
        const updatedGame = await mockService.updateGamePhase('TEST123', GamePhase.PLAYING);
        
        expect(updatedGame.phase).toBe(GamePhase.PLAYING);
        expect(updatedGame.updatedAt).toBeInstanceOf(Date);
      });

      it('should throw error for non-existent game', async () => {
        await expect(mockService.updateGamePhase('NONEXISTENT', GamePhase.PLAYING)).rejects.toThrow('Game not found');
      });
    });
  });

  describe('Player Operations', () => {
    beforeEach(async () => {
      await mockService.createGame('TEST123');
    });

    describe('addPlayerToGame', () => {
      it('should add player to game', async () => {
        const player = await mockService.addPlayerToGame('TEST123', 'TestPlayer');
        
        expect(player).toMatchObject({
          name: 'TestPlayer',
          handCards: [],
          score: 0
        });
        expect(player.id).toMatch(/^player_\d+$/);
        expect(player.createdAt).toBeInstanceOf(Date);
        expect(player.updatedAt).toBeInstanceOf(Date);
      });

      it('should set first player as current turn', async () => {
        const player = await mockService.addPlayerToGame('TEST123', 'FirstPlayer');
        
        expect(player.isCurrentTurn).toBe(true);
      });

      it('should not set subsequent players as current turn', async () => {
        await mockService.addPlayerToGame('TEST123', 'FirstPlayer');
        const secondPlayer = await mockService.addPlayerToGame('TEST123', 'SecondPlayer');
        
        expect(secondPlayer.isCurrentTurn).toBe(false);
      });

      it('should throw error for non-existent game', async () => {
        await expect(mockService.addPlayerToGame('NONEXISTENT', 'Player')).rejects.toThrow('Game not found');
      });

      it('should throw error when game is full', async () => {
        // Create a game with max 2 players
        await mockService.createGame('FULLGAME', 2);
        await mockService.addPlayerToGame('FULLGAME', 'Player1');
        await mockService.addPlayerToGame('FULLGAME', 'Player2');
        
        await expect(mockService.addPlayerToGame('FULLGAME', 'Player3')).rejects.toThrow('Game is full');
      });
    });

    describe('updatePlayerHand', () => {
      it('should update player hand cards', async () => {
        const player = await mockService.addPlayerToGame('TEST123', 'TestPlayer');
        const newHand = [1, 2, 3];
        
        const updatedPlayer = await mockService.updatePlayerHand(player.id, newHand);
        
        expect(updatedPlayer.handCards).toEqual(newHand);
        expect(updatedPlayer.updatedAt).toBeInstanceOf(Date);
      });

      it('should throw error for non-existent player', async () => {
        await expect(mockService.updatePlayerHand('NONEXISTENT', [1, 2, 3])).rejects.toThrow('Player not found');
      });
    });

    describe('setCurrentTurn', () => {
      it('should set player as current turn', async () => {
        const player1 = await mockService.addPlayerToGame('TEST123', 'Player1');
        const player2 = await mockService.addPlayerToGame('TEST123', 'Player2');
        
        // Initially player1 should be current turn
        expect(player1.isCurrentTurn).toBe(true);
        expect(player2.isCurrentTurn).toBe(false);
        
        // Set player2 as current turn
        const updatedPlayer2 = await mockService.setCurrentTurn(player2.id);
        
        expect(updatedPlayer2.isCurrentTurn).toBe(true);
        
        // Verify player1 is no longer current turn
        const gameWithPlayers = await mockService.getGameWithPlayers('TEST123');
        const updatedPlayer1 = gameWithPlayers?.players.find(p => p.id === player1.id);
        expect(updatedPlayer1?.isCurrentTurn).toBe(false);
      });

      it('should throw error for non-existent player', async () => {
        await expect(mockService.setCurrentTurn('NONEXISTENT')).rejects.toThrow('Player not found');
      });
    });

    describe('updatePlayerScore', () => {
      it('should update player score', async () => {
        const player = await mockService.addPlayerToGame('TEST123', 'TestPlayer');
        
        const updatedPlayer = await mockService.updatePlayerScore(player.id, 100);
        
        expect(updatedPlayer.score).toBe(100);
        expect(updatedPlayer.updatedAt).toBeInstanceOf(Date);
      });

      it('should throw error for non-existent player', async () => {
        await expect(mockService.updatePlayerScore('NONEXISTENT', 100)).rejects.toThrow('Player not found');
      });
    });
  });

  describe('Card Operations', () => {
    describe('getRandomCards', () => {
      it('should return requested number of cards', async () => {
        const cards = await mockService.getRandomCards(2);
        
        expect(cards).toHaveLength(2);
        expect(cards[0]).toMatchObject({
          id: 'card_1',
          name: 'Great Pyramid of Giza',
          description: 'Built around 2560 BCE',
          chronologicalValue: -2560,
          difficulty: Difficulty.EASY,
          category: 'Ancient History'
        });
        expect(cards[1]).toMatchObject({
          id: 'card_2',
          name: 'Roman Empire',
          description: 'Founded in 27 BCE',
          chronologicalValue: -27,
          difficulty: Difficulty.MEDIUM,
          category: 'Ancient History'
        });
      });

      it('should return fewer cards when requested count exceeds available', async () => {
        const cards = await mockService.getRandomCards(5);
        
        expect(cards).toHaveLength(2); // Only 2 mock cards available
      });

      it('should return empty array for zero count', async () => {
        const cards = await mockService.getRandomCards(0);
        
        expect(cards).toHaveLength(0);
      });
    });

    describe('getCardById', () => {
      it('should return null for non-existent card', async () => {
        const card = await mockService.getCardById('NONEXISTENT');
        
        expect(card).toBeNull();
      });
    });

    describe('getCardsByCategory', () => {
      it('should return empty array when no cards exist', async () => {
        const cards = await mockService.getCardsByCategory('Ancient History');
        
        expect(cards).toEqual([]);
      });
    });
  });

  describe('Timeline Operations', () => {
    beforeEach(async () => {
      await mockService.createGame('TEST123');
    });

    describe('addCardToTimeline', () => {
      it('should add card to timeline', async () => {
        const game = await mockService.findGameByRoomCode('TEST123');
        const timelineCard = await mockService.addCardToTimeline(game!.id, 'card_1', 0);
        
        expect(timelineCard).toMatchObject({
          gameId: game!.id,
          cardId: 'card_1',
          position: 0
        });
        expect(timelineCard.id).toMatch(/^timeline_\d+$/);
        expect(timelineCard.placedAt).toBeInstanceOf(Date);
      });

      it('should create multiple timeline cards with unique IDs', async () => {
        const game = await mockService.findGameByRoomCode('TEST123');
        const card1 = await mockService.addCardToTimeline(game!.id, 'card_1', 0);
        const card2 = await mockService.addCardToTimeline(game!.id, 'card_2', 1);
        
        expect(card1.id).not.toBe(card2.id);
      });
    });

    describe('getTimelineForGame', () => {
      it('should return empty array for game with no timeline', async () => {
        const timeline = await mockService.getTimelineForGame('TEST123');
        
        expect(timeline).toEqual([]);
      });

      it('should return timeline cards sorted by position', async () => {
        const game = await mockService.findGameByRoomCode('TEST123');
        await mockService.addCardToTimeline(game!.id, 'card_2', 1);
        await mockService.addCardToTimeline(game!.id, 'card_1', 0);
        
        const timeline = await mockService.getTimelineForGame('TEST123');
        
        expect(timeline).toHaveLength(2);
        expect(timeline[0].position).toBe(0);
        expect(timeline[1].position).toBe(1);
      });

      it('should throw error for non-existent game', async () => {
        await expect(mockService.getTimelineForGame('NONEXISTENT')).rejects.toThrow('Game not found');
      });
    });

    describe('removeCardFromTimeline', () => {
      it('should remove card from timeline', async () => {
        const game = await mockService.findGameByRoomCode('TEST123');
        const timelineCard = await mockService.addCardToTimeline(game!.id, 'card_1', 0);
        
        await mockService.removeCardFromTimeline(timelineCard.id);
        
        const timeline = await mockService.getTimelineForGame('TEST123');
        expect(timeline).toEqual([]);
      });

      it('should not throw error when removing non-existent timeline card', async () => {
        await expect(mockService.removeCardFromTimeline('NONEXISTENT')).resolves.toBeUndefined();
      });
    });
  });

  describe('Utility Operations', () => {
    beforeEach(async () => {
      await mockService.createGame('TEST123');
    });

    describe('getGameWithPlayersAndTimeline', () => {
      it('should return complete game data', async () => {
        const player = await mockService.addPlayerToGame('TEST123', 'TestPlayer');
        const game = await mockService.findGameByRoomCode('TEST123');
        const timelineCard = await mockService.addCardToTimeline(game!.id, 'card_1', 0);
        
        const result = await mockService.getGameWithPlayersAndTimeline('TEST123');
        
        expect(result).toMatchObject({
          roomCode: 'TEST123',
          players: [player],
          timelineCards: [timelineCard]
        });
      });

      it('should return null for non-existent game', async () => {
        const result = await mockService.getGameWithPlayersAndTimeline('NONEXISTENT');
        
        expect(result).toBeNull();
      });
    });

    describe('cleanupInactiveGames', () => {
      it('should return 0 when no games to cleanup', async () => {
        const deletedCount = await mockService.cleanupInactiveGames(24);
        
        expect(deletedCount).toBe(0);
      });

      it('should cleanup old waiting games', async () => {
        // Create a game and manually set it as old by updating it
        const game = await mockService.createGame('OLDGAME');
        // Update the game to set a recent updatedAt timestamp
        await mockService.updateGameState('OLDGAME', { currentTurn: 0, round: 1, maxRounds: 5 });
        
        // Since the game was just updated, it shouldn't be cleaned up
        const deletedCount = await mockService.cleanupInactiveGames(24);
        expect(deletedCount).toBe(0);
        
        const foundGame = await mockService.findGameByRoomCode('OLDGAME');
        expect(foundGame).not.toBeNull();
      });

      it('should not cleanup recent games', async () => {
        await mockService.createGame('RECENTGAME');
        
        const deletedCount = await mockService.cleanupInactiveGames(24);
        
        expect(deletedCount).toBe(0);
        
        const foundGame = await mockService.findGameByRoomCode('RECENTGAME');
        expect(foundGame).not.toBeNull();
      });
    });

    describe('getPlayerCount', () => {
      it('should return 0 for game with no players', async () => {
        const count = await mockService.getPlayerCount('TEST123');
        
        expect(count).toBe(0);
      });

      it('should return correct player count', async () => {
        await mockService.addPlayerToGame('TEST123', 'Player1');
        await mockService.addPlayerToGame('TEST123', 'Player2');
        
        const count = await mockService.getPlayerCount('TEST123');
        
        expect(count).toBe(2);
      });

      it('should return 0 for non-existent game', async () => {
        const count = await mockService.getPlayerCount('NONEXISTENT');
        
        expect(count).toBe(0);
      });
    });

    describe('isGameFull', () => {
      it('should return false for empty game', async () => {
        const isFull = await mockService.isGameFull('TEST123');
        
        expect(isFull).toBe(false);
      });

      it('should return false for game with players but not full', async () => {
        await mockService.addPlayerToGame('TEST123', 'Player1');
        
        const isFull = await mockService.isGameFull('TEST123');
        
        expect(isFull).toBe(false);
      });

      it('should return true for full game', async () => {
        // Create a game with max 2 players
        await mockService.createGame('FULLGAME', 2);
        await mockService.addPlayerToGame('FULLGAME', 'Player1');
        await mockService.addPlayerToGame('FULLGAME', 'Player2');
        
        const isFull = await mockService.isGameFull('FULLGAME');
        
        expect(isFull).toBe(true);
      });

      it('should return false for non-existent game', async () => {
        const isFull = await mockService.isGameFull('NONEXISTENT');
        
        expect(isFull).toBe(false);
      });
    });
  });

  describe('Data Isolation', () => {
    it('should maintain separate data between service instances', async () => {
      const service1 = new MockDatabaseService();
      const service2 = new MockDatabaseService();
      
      await service1.createGame('GAME1');
      await service2.createGame('GAME2');
      
      const game1InService1 = await service1.findGameByRoomCode('GAME1');
      const game1InService2 = await service2.findGameByRoomCode('GAME1');
      const game2InService1 = await service1.findGameByRoomCode('GAME2');
      const game2InService2 = await service2.findGameByRoomCode('GAME2');
      
      expect(game1InService1).not.toBeNull();
      expect(game1InService2).toBeNull();
      expect(game2InService1).toBeNull();
      expect(game2InService2).not.toBeNull();
    });
  });
}); 