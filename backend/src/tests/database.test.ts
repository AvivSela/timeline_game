import { DatabaseService } from '../services/DatabaseService';
import { GamePhase, Difficulty } from '@prisma/client';

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  const testRoomCode = 'TEST456';

  beforeAll(async () => {
    dbService = new DatabaseService();
  });

  afterAll(async () => {
    await dbService.disconnect();
  });

  beforeEach(async () => {
    // Clean up any existing test data
    const existingGame = await dbService.findGameByRoomCode(testRoomCode);
    if (existingGame) {
      // Delete related data first
      await dbService.prisma.timelineCard.deleteMany({
        where: { gameId: existingGame.id }
      });
      await dbService.prisma.player.deleteMany({
        where: { gameId: existingGame.id }
      });
      await dbService.prisma.game.delete({
        where: { id: existingGame.id }
      });
    }
  });

  describe('Game Operations', () => {
    test('should create a new game', async () => {
      const game = await dbService.createGame(testRoomCode, 4);
      
      expect(game).toBeDefined();
      expect(game.roomCode).toBe(testRoomCode);
      expect(game.maxPlayers).toBe(4);
      expect(game.phase).toBe(GamePhase.WAITING);
      expect(game.state).toBeDefined();
    });

    test('should find game by room code', async () => {
      await dbService.createGame(testRoomCode, 4);
      const foundGame = await dbService.findGameByRoomCode(testRoomCode);
      
      expect(foundGame).toBeDefined();
      expect(foundGame?.roomCode).toBe(testRoomCode);
    });

    test('should update game phase', async () => {
      const game = await dbService.createGame(testRoomCode, 4);
      const updatedGame = await dbService.updateGamePhase(testRoomCode, GamePhase.PLAYING);
      
      expect(updatedGame.phase).toBe(GamePhase.PLAYING);
    });

    test('should return null for non-existent room code', async () => {
      const game = await dbService.findGameByRoomCode('NONEXISTENT');
      expect(game).toBeNull();
    });
  });

  describe('Player Operations', () => {
    beforeEach(async () => {
      await dbService.createGame(testRoomCode, 4);
    });

    test('should add player to game', async () => {
      const player = await dbService.addPlayerToGame(testRoomCode, 'TestPlayer');
      
      expect(player).toBeDefined();
      expect(player.name).toBe('TestPlayer');
      expect(player.isCurrentTurn).toBe(true); // First player should be current turn
      expect(player.score).toBe(0);
    });

    test('should not add player to non-existent game', async () => {
      await expect(
        dbService.addPlayerToGame('NONEXISTENT', 'TestPlayer')
      ).rejects.toThrow('Game not found');
    });

    test('should not add player when game is full', async () => {
      // Add 4 players to fill the game
      await dbService.addPlayerToGame(testRoomCode, 'Player1');
      await dbService.addPlayerToGame(testRoomCode, 'Player2');
      await dbService.addPlayerToGame(testRoomCode, 'Player3');
      await dbService.addPlayerToGame(testRoomCode, 'Player4');
      
      // Try to add a 5th player
      await expect(
        dbService.addPlayerToGame(testRoomCode, 'Player5')
      ).rejects.toThrow('Game is full');
    });

    test('should update player hand', async () => {
      const player = await dbService.addPlayerToGame(testRoomCode, 'TestPlayer');
      const updatedPlayer = await dbService.updatePlayerHand(player.id, [1, 2, 3]);
      
      expect(updatedPlayer.handCards).toEqual([1, 2, 3]);
    });

    test('should set current turn', async () => {
      const player1 = await dbService.addPlayerToGame(testRoomCode, 'Player1');
      const player2 = await dbService.addPlayerToGame(testRoomCode, 'Player2');
      
      // Set player2 as current turn
      const updatedPlayer = await dbService.setCurrentTurn(player2.id);
      
      expect(updatedPlayer.isCurrentTurn).toBe(true);
      
      // Check that player1 is no longer current turn
      const player1Updated = await dbService.prisma.player.findUnique({
        where: { id: player1.id }
      });
      expect(player1Updated?.isCurrentTurn).toBe(false);
    });
  });

  describe('Card Operations', () => {
    test('should get random cards', async () => {
      const cards = await dbService.getRandomCards(5);
      
      expect(cards).toBeDefined();
      expect(cards.length).toBeLessThanOrEqual(5);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('should get cards by difficulty', async () => {
      const easyCards = await dbService.getRandomCards(3, Difficulty.EASY);
      
      expect(easyCards).toBeDefined();
      expect(easyCards.length).toBeLessThanOrEqual(3);
      easyCards.forEach(card => {
        expect(card.difficulty).toBe(Difficulty.EASY);
      });
    });

    test('should get cards by category', async () => {
      const ancientHistoryCards = await dbService.getCardsByCategory('Ancient History');
      
      expect(ancientHistoryCards).toBeDefined();
      expect(ancientHistoryCards.length).toBeGreaterThan(0);
      ancientHistoryCards.forEach(card => {
        expect(card.category).toBe('Ancient History');
      });
    });

    test('should get card by ID', async () => {
      const allCards = await dbService.getRandomCards(1);
      if (allCards.length > 0) {
        const card = await dbService.getCardById(allCards[0].id);
        
        expect(card).toBeDefined();
        expect(card?.id).toBe(allCards[0].id);
      }
    });
  });

  describe('Timeline Operations', () => {
    let gameId: string;
    let cardId: string;

    beforeEach(async () => {
      const game = await dbService.createGame(testRoomCode, 4);
      gameId = game.id;
      
      const cards = await dbService.getRandomCards(1);
      cardId = cards[0].id;
    });

    test('should add card to timeline', async () => {
      const timelineCard = await dbService.addCardToTimeline(gameId, cardId, 0);
      
      expect(timelineCard).toBeDefined();
      expect(timelineCard.gameId).toBe(gameId);
      expect(timelineCard.cardId).toBe(cardId);
      expect(timelineCard.position).toBe(0);
    });

    test('should get timeline for game', async () => {
      await dbService.addCardToTimeline(gameId, cardId, 0);
      const timeline = await dbService.getTimelineForGame(testRoomCode);
      
      expect(timeline).toBeDefined();
      expect(timeline.length).toBeGreaterThan(0);
      // The timeline should include card data
      expect(timeline[0]).toHaveProperty('cardId');
    });

    test('should remove card from timeline', async () => {
      const timelineCard = await dbService.addCardToTimeline(gameId, cardId, 0);
      await dbService.removeCardFromTimeline(timelineCard.id);
      
      const timeline = await dbService.getTimelineForGame(testRoomCode);
      expect(timeline.length).toBe(0);
    });
  });

  describe('Utility Operations', () => {
    beforeEach(async () => {
      await dbService.createGame(testRoomCode, 4);
    });

    test('should get player count', async () => {
      expect(await dbService.getPlayerCount(testRoomCode)).toBe(0);
      
      await dbService.addPlayerToGame(testRoomCode, 'Player1');
      expect(await dbService.getPlayerCount(testRoomCode)).toBe(1);
      
      await dbService.addPlayerToGame(testRoomCode, 'Player2');
      expect(await dbService.getPlayerCount(testRoomCode)).toBe(2);
    });

    test('should check if game is full', async () => {
      expect(await dbService.isGameFull(testRoomCode)).toBe(false);
      
      // Add 4 players to fill the game
      await dbService.addPlayerToGame(testRoomCode, 'Player1');
      await dbService.addPlayerToGame(testRoomCode, 'Player2');
      await dbService.addPlayerToGame(testRoomCode, 'Player3');
      await dbService.addPlayerToGame(testRoomCode, 'Player4');
      
      expect(await dbService.isGameFull(testRoomCode)).toBe(true);
    });

    test('should get game with players and timeline', async () => {
      await dbService.addPlayerToGame(testRoomCode, 'Player1');
      
      const gameWithData = await dbService.getGameWithPlayersAndTimeline(testRoomCode);
      
      expect(gameWithData).toBeDefined();
      expect(gameWithData?.players).toBeDefined();
      expect(gameWithData?.players.length).toBe(1);
      expect(gameWithData?.timelineCards).toBeDefined();
    });
  });
}); 