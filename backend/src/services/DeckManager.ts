import { IDatabaseService } from './IDatabaseService';
import { Card, Player } from '@prisma/client';

export interface CardData {
  id: string;
  name: string;
  description: string;
  chronologicalValue: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  imageUrl?: string;
}

export interface PlayerHand {
  playerId: string;
  cards: CardData[];
}

export class DeckManager {
  private dbService: IDatabaseService;

  constructor(dbService: IDatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Deal initial cards to all players in a game
   */
  async dealInitialCards(gameId: string, cardsPerPlayer: number = 4): Promise<void> {
    try {
      // Get all players in the game
      const players = await this.dbService.getPlayersByGameId(gameId);
      
      // Get all available cards
      const allCards = await this.dbService.getAllCards();
      
      // Shuffle cards
      const shuffledCards = this.shuffleCards([...allCards]);
      
      // Deal cards to each player
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const startIndex = i * cardsPerPlayer;
        const playerCards = shuffledCards.slice(startIndex, startIndex + cardsPerPlayer);
        
        // Update player's hand
        await this.dbService.updatePlayerHand(player.id, playerCards.map((card: Card) => card.id));
      }
    } catch (error) {
      console.error('Error dealing initial cards:', error);
      throw new Error('Failed to deal initial cards');
    }
  }

  /**
   * Draw a new card for a player (when placement is incorrect)
   */
  async drawCardForPlayer(playerId: string): Promise<CardData | null> {
    try {
      // Get player's current hand
      const player = await this.dbService.getPlayerById(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      // Get all cards
      const allCards = await this.dbService.getAllCards();
      
      // Get cards already in player's hand
      const currentHand = Array.isArray(player.handCards) ? player.handCards as string[] : [];
      
      // Find available cards (not in hand and not on timeline)
      const game = await this.dbService.getGameById(player.gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      const timelineCards = await this.dbService.getTimelineCardsByGameId(game.id);
      const usedCardIds = new Set([
        ...currentHand,
        ...timelineCards.map((tc: any) => tc.cardId)
      ]);

      const availableCards = allCards.filter((card: Card) => !usedCardIds.has(card.id));
      
      if (availableCards.length === 0) {
        return null; // No more cards available
      }

      // Select a random card
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      
      // Add card to player's hand
      const newHand = [...currentHand, randomCard.id];
      await this.dbService.updatePlayerHand(playerId, newHand);

      return {
        id: randomCard.id,
        name: randomCard.name,
        description: randomCard.description,
        chronologicalValue: randomCard.chronologicalValue,
        difficulty: randomCard.difficulty,
        category: randomCard.category,
        imageUrl: randomCard.imageUrl || undefined
      };
    } catch (error) {
      console.error('Error drawing card for player:', error);
      throw new Error('Failed to draw card for player');
    }
  }

  /**
   * Get player's current hand
   */
  async getPlayerHand(playerId: string): Promise<CardData[]> {
    try {
      const player = await this.dbService.getPlayerById(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      const handCardIds = Array.isArray(player.handCards) ? player.handCards as string[] : [];
      
      if (handCardIds.length === 0) {
        return [];
      }

      // Get card details for each card in hand
      const cards = await this.dbService.getCardsByIds(handCardIds);
      
      return cards.map(card => ({
        id: card.id,
        name: card.name,
        description: card.description,
        chronologicalValue: card.chronologicalValue,
        difficulty: card.difficulty,
        category: card.category,
        imageUrl: card.imageUrl || undefined
      }));
    } catch (error) {
      console.error('Error getting player hand:', error);
      throw new Error('Failed to get player hand');
    }
  }

  /**
   * Remove a card from player's hand
   */
  async removeCardFromHand(playerId: string, cardId: string): Promise<void> {
    try {
      const player = await this.dbService.getPlayerById(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      const currentHand = Array.isArray(player.handCards) ? player.handCards as string[] : [];
      const newHand = currentHand.filter((id: string) => id !== cardId);
      
      await this.dbService.updatePlayerHand(playerId, newHand);
    } catch (error) {
      console.error('Error removing card from hand:', error);
      throw new Error('Failed to remove card from hand');
    }
  }

  /**
   * Check if a player has won (empty hand)
   */
  async hasPlayerWon(playerId: string): Promise<boolean> {
    try {
      const player = await this.dbService.getPlayerById(playerId);
      if (!player) {
        return false;
      }

      const handCardIds = Array.isArray(player.handCards) ? player.handCards as string[] : [];
      return handCardIds.length === 0;
    } catch (error) {
      console.error('Error checking if player has won:', error);
      return false;
    }
  }

  /**
   * Get remaining cards count for a game
   */
  async getRemainingCardsCount(gameId: string): Promise<number> {
    try {
      const allCards = await this.dbService.getAllCards();
      const totalCards = allCards.length;

      // Get used cards (in hands and on timeline)
      const players = await this.dbService.getPlayersByGameId(gameId);
      const timelineCards = await this.dbService.getTimelineCardsByGameId(gameId);
      
      const usedCardIds = new Set<string>();
      
      // Add cards in players' hands
      players.forEach(player => {
        const handCards = Array.isArray(player.handCards) ? player.handCards as string[] : [];
        handCards.forEach((cardId: string) => usedCardIds.add(cardId));
      });
      
      // Add cards on timeline
      timelineCards.forEach((tc: any) => usedCardIds.add(tc.cardId));
      
      return totalCards - usedCardIds.size;
    } catch (error) {
      console.error('Error getting remaining cards count:', error);
      return 0;
    }
  }

  /**
   * Shuffle an array of cards using Fisher-Yates algorithm
   */
  private shuffleCards(cards: Card[]): Card[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 