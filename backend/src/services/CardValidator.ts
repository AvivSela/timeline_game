import { IDatabaseService } from './IDatabaseService';
import { TimelineCard, Card } from '@prisma/client';

export interface ValidationResult {
  isValid: boolean;
  correctPosition: number;
  actualPosition: number;
  message: string;
  cardName: string;
  cardDate?: number;
}

export interface TimelinePosition {
  position: number;
  cardId: string;
  chronologicalValue: number;
}

export class CardValidator {
  private dbService: IDatabaseService;

  constructor(dbService: IDatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Validate a card placement on the timeline
   */
  async validateCardPlacement(
    gameId: string, 
    cardId: string, 
    position: number
  ): Promise<ValidationResult> {
    try {
      // Get the card being placed
      const card = await this.dbService.getCardById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      // Get current timeline
      const timelineCards = await this.dbService.getTimelineCardsByGameId(gameId);
      
      // Create timeline with the new card at the specified position
      const newTimeline = this.insertCardAtPosition(timelineCards as any[], card, position);
      
      // Validate chronological order
      const validation = this.validateChronologicalOrder(newTimeline);
      
      return {
        isValid: validation.isValid,
        correctPosition: validation.correctPosition,
        actualPosition: position,
        message: validation.message,
        cardName: card.name,
        cardDate: card.chronologicalValue
      };
    } catch (error) {
      console.error('Error validating card placement:', error);
      throw new Error('Failed to validate card placement');
    }
  }

  /**
   * Find the correct position for a card in chronological order
   */
  private findCorrectPosition(
    cardChronologicalValue: number,
    timeline: TimelinePosition[],
    skipCardId?: string
  ): number {
    let correctPosition = 0;
    for (let i = 0; i < timeline.length; i++) {
      const timelineCard = timeline[i];
      if (skipCardId && timelineCard.cardId === skipCardId) {
        continue; // Skip the specified card
      }
      if (cardChronologicalValue < timelineCard.chronologicalValue) {
        break;
      }
      correctPosition = i + 1;
    }
    return correctPosition;
  }

  /**
   * Get the correct position for a card based on chronological order
   */
  async getCorrectPosition(gameId: string, cardId: string): Promise<number> {
    try {
      const card = await this.dbService.getCardById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      const timelineCards = await this.dbService.getTimelineCardsByGameId(gameId);
      
      // Convert to TimelinePosition format
      const timeline: TimelinePosition[] = timelineCards.map(tc => ({
        position: tc.position,
        cardId: tc.cardId,
        chronologicalValue: tc.card.chronologicalValue
      }));
      
      // Find the correct position for the card
      return this.findCorrectPosition(card.chronologicalValue, timeline);
    } catch (error) {
      console.error('Error getting correct position:', error);
      throw new Error('Failed to get correct position');
    }
  }

  /**
   * Check if a timeline is in correct chronological order
   */
  private validateChronologicalOrder(timeline: TimelinePosition[]): {
    isValid: boolean;
    correctPosition: number;
    message: string;
  } {
    if (timeline.length <= 1) {
      return {
        isValid: true,
        correctPosition: 0,
        message: 'Timeline is in correct order'
      };
    }

    // Check if timeline is in chronological order
    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].chronologicalValue < timeline[i - 1].chronologicalValue) {
        // Find the correct position for the misplaced card
        const misplacedCard = timeline[i];
        const correctPosition = this.findCorrectPosition(
          misplacedCard.chronologicalValue, 
          timeline, 
          misplacedCard.cardId
        );
        
        return {
          isValid: false,
          correctPosition,
          message: `Card "${misplacedCard.cardId}" is in the wrong position. It should be placed earlier in the timeline.`
        };
      }
    }

    return {
      isValid: true,
      correctPosition: timeline.length - 1,
      message: 'Timeline is in correct order'
    };
  }

  /**
   * Insert a card at a specific position in the timeline
   */
  private insertCardAtPosition(
    timelineCards: any[], 
    card: Card, 
    position: number
  ): TimelinePosition[] {
    const timeline: TimelinePosition[] = timelineCards.map(tc => ({
      position: tc.position,
      cardId: tc.cardId,
      chronologicalValue: tc.card.chronologicalValue
    }));

    // Insert the new card at the specified position
    timeline.splice(position, 0, {
      position,
      cardId: card.id,
      chronologicalValue: card.chronologicalValue
    });

    // Update positions for cards after the insertion
    for (let i = position + 1; i < timeline.length; i++) {
      timeline[i].position = i;
    }

    return timeline;
  }

  /**
   * Get timeline statistics for a game
   */
  async getTimelineStats(gameId: string): Promise<{
    totalCards: number;
    correctPlacements: number;
    incorrectPlacements: number;
    accuracy: number;
  }> {
    try {
      const timelineCards = await this.dbService.getTimelineCardsByGameId(gameId);
      
      if (timelineCards.length === 0) {
        return {
          totalCards: 0,
          correctPlacements: 0,
          incorrectPlacements: 0,
          accuracy: 0
        };
      }

      // Check chronological order
      let correctPlacements = 0;
      for (let i = 1; i < timelineCards.length; i++) {
        if (timelineCards[i].card.chronologicalValue >= timelineCards[i - 1].card.chronologicalValue) {
          correctPlacements++;
        }
      }

      const totalPlacements = timelineCards.length - 1; // First card has no previous card
      const incorrectPlacements = totalPlacements - correctPlacements;
      const accuracy = totalPlacements > 0 ? (correctPlacements / totalPlacements) * 100 : 100;

      return {
        totalCards: timelineCards.length,
        correctPlacements,
        incorrectPlacements,
        accuracy: Math.round(accuracy * 100) / 100
      };
    } catch (error) {
      console.error('Error getting timeline stats:', error);
      return {
        totalCards: 0,
        correctPlacements: 0,
        incorrectPlacements: 0,
        accuracy: 0
      };
    }
  }

  /**
   * Get hints for a card placement (for educational purposes)
   */
  async getCardHint(cardId: string): Promise<{
    hint: string;
  }> {
    try {
      const card = await this.dbService.getCardById(cardId);
      if (!card) {
        throw new Error('Card not found');
      }

      // Convert chronological value to a readable date format
      const date = new Date(card.chronologicalValue);
      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const hint = `The event "${card.name}" happened on ${formattedDate}`;
      
      return { hint };
    } catch (error) {
      console.error('Error getting card hint:', error);
      return {
        hint: 'Try to place this card in chronological order with the other events.'
      };
    }
  }
} 