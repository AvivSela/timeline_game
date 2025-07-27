import { CardValidator, ValidationResult, TimelinePosition } from '../services/CardValidator';
import { MockDatabaseService } from '../services/MockDatabaseService';
import { Card, TimelineCard, Difficulty } from '@prisma/client';

// Helper function to create test cards
const createTestCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'card_1',
  name: 'Test Event',
  description: 'A test event',
  chronologicalValue: new Date('2020-01-01').getTime(),
  category: 'test',
  difficulty: Difficulty.EASY,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// Helper function to create timeline cards
const createTimelineCard = (overrides: Partial<TimelineCard & { card: Card }> = {}): TimelineCard & { card: Card } => ({
  id: 'timeline_1',
  gameId: 'game_1',
  cardId: 'card_1',
  position: 0,
  placedAt: new Date(),
  card: createTestCard(),
  ...overrides
});

describe('CardValidator', () => {
  let cardValidator: CardValidator;
  let mockDbService: MockDatabaseService;

  beforeEach(() => {
    mockDbService = new MockDatabaseService();
    cardValidator = new CardValidator(mockDbService);
  });

  describe('validateCardPlacement', () => {
    let testCard: Card;
    let timelineCards: (TimelineCard & { card: Card })[];

    beforeEach(async () => {
      // Create a test card
      testCard = createTestCard({
        id: 'card_1',
        name: 'Test Event',
        chronologicalValue: new Date('2020-01-01').getTime()
      });

      // Create timeline cards
      timelineCards = [
        createTimelineCard({
          id: 'timeline_1',
          cardId: 'card_2',
          position: 0,
          card: createTestCard({
            id: 'card_2',
            name: 'Earlier Event',
            description: 'An earlier event',
            chronologicalValue: new Date('2019-01-01').getTime()
          })
        }),
        createTimelineCard({
          id: 'timeline_2',
          cardId: 'card_3',
          position: 1,
          card: createTestCard({
            id: 'card_3',
            name: 'Later Event',
            description: 'A later event',
            chronologicalValue: new Date('2021-01-01').getTime()
          })
        })
      ];

      // Mock the database service methods
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(testCard);
      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue(timelineCards);
    });

    it('should validate correct card placement', async () => {
      const result = await cardValidator.validateCardPlacement('game_1', 'card_1', 1);

      expect(result).toMatchObject({
        isValid: true,
        correctPosition: 2, // timeline.length - 1 = 3 - 1 = 2
        actualPosition: 1,
        cardName: 'Test Event',
        cardDate: new Date('2020-01-01').getTime()
      });
      expect(result.message).toContain('correct order');
    });

    it('should validate incorrect card placement', async () => {
      const result = await cardValidator.validateCardPlacement('game_1', 'card_1', 0);

      expect(result).toMatchObject({
        isValid: false,
        correctPosition: 0, // The misplaced card (2020) should go at position 0 before the 2019 card
        actualPosition: 0,
        cardName: 'Test Event',
        cardDate: new Date('2020-01-01').getTime()
      });
      expect(result.message).toContain('wrong position');
    });

    it('should handle card not found', async () => {
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(null);

      await expect(
        cardValidator.validateCardPlacement('game_1', 'nonexistent', 1)
      ).rejects.toThrow('Failed to validate card placement');
    });

    it('should handle database errors', async () => {
      jest.spyOn(mockDbService, 'getCardById').mockRejectedValue(new Error('DB Error'));

      await expect(
        cardValidator.validateCardPlacement('game_1', 'card_1', 1)
      ).rejects.toThrow('Failed to validate card placement');
    });

    it('should validate placement at the end of timeline', async () => {
      const result = await cardValidator.validateCardPlacement('game_1', 'card_1', 2);

      expect(result).toMatchObject({
        isValid: false, // Placing 2020 card after 2021 card is invalid
        correctPosition: 1, // Should go between 2019 and 2021
        actualPosition: 2
      });
    });

    it('should validate placement at the beginning of timeline', async () => {
      // Create a card that should go at the beginning
      const earlyCard = createTestCard({
        id: 'card_early',
        name: 'Early Event',
        description: 'Very early event',
        chronologicalValue: new Date('2018-01-01').getTime()
      });
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(earlyCard);

      const result = await cardValidator.validateCardPlacement('game_1', 'card_early', 0);

      expect(result).toMatchObject({
        isValid: true,
        correctPosition: 2, // timeline.length - 1 = 3 - 1 = 2
        actualPosition: 0
      });
    });
  });

  describe('getCorrectPosition', () => {
    let timelineCards: (TimelineCard & { card: Card })[];

    beforeEach(async () => {
      timelineCards = [
        createTimelineCard({
          id: 'timeline_1',
          cardId: 'card_1',
          position: 0,
          card: createTestCard({
            id: 'card_1',
            name: 'Event 1',
            chronologicalValue: new Date('2019-01-01').getTime()
          })
        }),
        createTimelineCard({
          id: 'timeline_2',
          cardId: 'card_2',
          position: 1,
          card: createTestCard({
            id: 'card_2',
            name: 'Event 2',
            chronologicalValue: new Date('2021-01-01').getTime()
          })
        })
      ];

      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue(timelineCards);
    });

    it('should find correct position for card that goes at the beginning', async () => {
      const earlyCard = createTestCard({
        id: 'card_early',
        name: 'Early Event',
        description: 'Very early event',
        chronologicalValue: new Date('2018-01-01').getTime()
      });
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(earlyCard);

      const position = await cardValidator.getCorrectPosition('game_1', 'card_early');

      expect(position).toBe(0);
    });

    it('should find correct position for card that goes in the middle', async () => {
      const middleCard = createTestCard({
        id: 'card_middle',
        name: 'Middle Event',
        description: 'Middle event',
        chronologicalValue: new Date('2020-01-01').getTime()
      });
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(middleCard);

      const position = await cardValidator.getCorrectPosition('game_1', 'card_middle');

      expect(position).toBe(1);
    });

    it('should find correct position for card that goes at the end', async () => {
      const lateCard = createTestCard({
        id: 'card_late',
        name: 'Late Event',
        description: 'Very late event',
        chronologicalValue: new Date('2022-01-01').getTime()
      });
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(lateCard);

      const position = await cardValidator.getCorrectPosition('game_1', 'card_late');

      expect(position).toBe(2);
    });

    it('should handle card not found', async () => {
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(null);

      await expect(
        cardValidator.getCorrectPosition('game_1', 'nonexistent')
      ).rejects.toThrow('Failed to get correct position');
    });

    it('should handle database errors', async () => {
      jest.spyOn(mockDbService, 'getCardById').mockRejectedValue(new Error('DB Error'));

      await expect(
        cardValidator.getCorrectPosition('game_1', 'card_1')
      ).rejects.toThrow('Failed to get correct position');
    });
  });

  describe('getTimelineStats', () => {
    it('should return correct stats for a valid timeline', async () => {
      const timelineCards = [
        createTimelineCard({
          id: 'timeline_1',
          cardId: 'card_1',
          position: 0,
          card: createTestCard({
            id: 'card_1',
            name: 'Event 1',
            chronologicalValue: new Date('2019-01-01').getTime()
          })
        }),
        createTimelineCard({
          id: 'timeline_2',
          cardId: 'card_2',
          position: 1,
          card: createTestCard({
            id: 'card_2',
            name: 'Event 2',
            chronologicalValue: new Date('2020-01-01').getTime()
          })
        }),
        createTimelineCard({
          id: 'timeline_3',
          cardId: 'card_3',
          position: 2,
          card: createTestCard({
            id: 'card_3',
            name: 'Event 3',
            chronologicalValue: new Date('2021-01-01').getTime()
          })
        })
      ];

      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue(timelineCards);

      const stats = await cardValidator.getTimelineStats('game_1');

      expect(stats).toMatchObject({
        totalCards: 3,
        correctPlacements: 2,
        incorrectPlacements: 0,
        accuracy: 100
      });
    });

    it('should return correct stats for an invalid timeline', async () => {
      const timelineCards = [
        createTimelineCard({
          id: 'timeline_1',
          cardId: 'card_1',
          position: 0,
          card: createTestCard({
            id: 'card_1',
            name: 'Event 1',
            chronologicalValue: new Date('2020-01-01').getTime()
          })
        }),
        createTimelineCard({
          id: 'timeline_2',
          cardId: 'card_2',
          position: 1,
          card: createTestCard({
            id: 'card_2',
            name: 'Event 2',
            chronologicalValue: new Date('2019-01-01').getTime() // Earlier than first
          })
        })
      ];

      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue(timelineCards);

      const stats = await cardValidator.getTimelineStats('game_1');

      expect(stats).toMatchObject({
        totalCards: 2,
        correctPlacements: 0,
        incorrectPlacements: 1,
        accuracy: 0
      });
    });

    it('should return correct stats for empty timeline', async () => {
      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue([]);

      const stats = await cardValidator.getTimelineStats('game_1');

      expect(stats).toMatchObject({
        totalCards: 0,
        correctPlacements: 0,
        incorrectPlacements: 0,
        accuracy: 0
      });
    });

    it('should return correct stats for single card timeline', async () => {
      const timelineCards = [
        createTimelineCard({
          id: 'timeline_1',
          cardId: 'card_1',
          position: 0,
          card: createTestCard({
            id: 'card_1',
            name: 'Event 1',
            chronologicalValue: new Date('2020-01-01').getTime()
          })
        })
      ];

      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue(timelineCards);

      const stats = await cardValidator.getTimelineStats('game_1');

      expect(stats).toMatchObject({
        totalCards: 1,
        correctPlacements: 0,
        incorrectPlacements: 0,
        accuracy: 100
      });
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockRejectedValue(new Error('DB Error'));

      const stats = await cardValidator.getTimelineStats('game_1');

      expect(stats).toMatchObject({
        totalCards: 0,
        correctPlacements: 0,
        incorrectPlacements: 0,
        accuracy: 0
      });
    });
  });

  describe('getCardHint', () => {
    it('should return a formatted hint for a valid card', async () => {
      const card = createTestCard({
        id: 'card_1',
        name: 'Test Event',
        chronologicalValue: new Date('2020-01-01').getTime()
      });

      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(card);

      const hint = await cardValidator.getCardHint('card_1');

      expect(hint.hint).toContain('Test Event');
      expect(hint.hint).toContain('01/01/2020');
    });

    it('should handle card not found', async () => {
      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(null);

      const hint = await cardValidator.getCardHint('nonexistent');

      expect(hint.hint).toContain('Try to place this card in chronological order');
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(mockDbService, 'getCardById').mockRejectedValue(new Error('DB Error'));

      const hint = await cardValidator.getCardHint('card_1');

      expect(hint.hint).toContain('Try to place this card in chronological order');
    });

    it('should format different dates correctly', async () => {
      const card = createTestCard({
        id: 'card_1',
        name: 'Christmas',
        description: 'Christmas day',
        chronologicalValue: new Date('2020-12-25').getTime()
      });

      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(card);

      const hint = await cardValidator.getCardHint('card_1');

      expect(hint.hint).toContain('Christmas');
      expect(hint.hint).toContain('25/12/2020');
    });
  });

  describe('Private methods (through public interface)', () => {
    it('should validate chronological order correctly', async () => {
      // Test through validateCardPlacement
      const timelineCards = [
        createTimelineCard({
          id: 'timeline_1',
          cardId: 'card_1',
          position: 0,
          card: createTestCard({
            id: 'card_1',
            name: 'Event 1',
            chronologicalValue: new Date('2020-01-01').getTime()
          })
        }),
        createTimelineCard({
          id: 'timeline_2',
          cardId: 'card_2',
          position: 1,
          card: createTestCard({
            id: 'card_2',
            name: 'Event 2',
            chronologicalValue: new Date('2019-01-01').getTime() // Out of order
          })
        })
      ];

      const testCard = createTestCard({
        id: 'card_3',
        name: 'Test Event',
        chronologicalValue: new Date('2021-01-01').getTime()
      });

      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(testCard);
      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue(timelineCards);

      const result = await cardValidator.validateCardPlacement('game_1', 'card_3', 2);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('wrong position');
    });

    it('should handle edge cases with empty timeline', async () => {
      const testCard = createTestCard({
        id: 'card_1',
        name: 'Test Event',
        chronologicalValue: new Date('2020-01-01').getTime()
      });

      jest.spyOn(mockDbService, 'getCardById').mockResolvedValue(testCard);
      jest.spyOn(mockDbService, 'getTimelineCardsByGameId').mockResolvedValue([]);

      const result = await cardValidator.validateCardPlacement('game_1', 'card_1', 0);

      expect(result.isValid).toBe(true);
      expect(result.correctPosition).toBe(0);
    });
  });
}); 