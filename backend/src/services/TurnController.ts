import { IDatabaseService } from './IDatabaseService';
import { Player, Game } from '@prisma/client';

export interface TurnState {
  currentPlayerId: string | null;
  currentPlayerName: string | null;
  turnOrder: string[];
  turnNumber: number;
}

export class TurnController {
  private dbService: IDatabaseService;

  constructor(dbService: IDatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Initialize turn order for a game
   */
  async initializeTurnOrder(gameId: string): Promise<TurnState> {
    try {
      const players = await this.dbService.getPlayersByGameId(gameId);
      
      if (players.length === 0) {
        throw new Error('No players in game');
      }

      // Shuffle players for random turn order
      const shuffledPlayers = this.shufflePlayers([...players]);
      const turnOrder = shuffledPlayers.map(player => player.id);
      
      // Set first player as current turn
      const firstPlayerId = turnOrder[0];
      await this.dbService.setCurrentTurn(firstPlayerId);
      
      // Update game state with turn information
      const turnState: TurnState = {
        currentPlayerId: firstPlayerId,
        currentPlayerName: shuffledPlayers[0].name,
        turnOrder,
        turnNumber: 1
      };

      await this.dbService.updateGameState(gameId, { turnState });
      
      return turnState;
    } catch (error) {
      console.error('Error initializing turn order:', error);
      throw new Error('Failed to initialize turn order');
    }
  }

  /**
   * Get current turn state for a game
   */
  async getCurrentTurnState(gameId: string): Promise<TurnState | null> {
    try {
      const game = await this.dbService.getGameById(gameId);
      if (!game || !game.state) {
        return null;
      }

      const gameState = game.state as any;
      return gameState.turnState || null;
    } catch (error) {
      console.error('Error getting current turn state:', error);
      return null;
    }
  }

  /**
   * Get current player
   */
  async getCurrentPlayer(gameId: string): Promise<Player | null> {
    try {
      const players = await this.dbService.getPlayersByGameId(gameId);
      return players.find(player => player.isCurrentTurn) || null;
    } catch (error) {
      console.error('Error getting current player:', error);
      return null;
    }
  }

  /**
   * Advance to next turn
   */
  async nextTurn(gameId: string): Promise<TurnState> {
    try {
      const currentTurnState = await this.getCurrentTurnState(gameId);
      if (!currentTurnState) {
        throw new Error('No turn state found');
      }

      const { turnOrder, turnNumber } = currentTurnState;
      const currentPlayerIndex = turnOrder.findIndex(id => id === currentTurnState.currentPlayerId);
      
      if (currentPlayerIndex === -1) {
        throw new Error('Current player not found in turn order');
      }

      // Calculate next player index
      const nextPlayerIndex = (currentPlayerIndex + 1) % turnOrder.length;
      const nextPlayerId = turnOrder[nextPlayerIndex];
      
      // Update current turn player
      await this.dbService.setCurrentTurn(nextPlayerId);
      
      // Get next player details
      const nextPlayer = await this.dbService.getPlayerById(nextPlayerId);
      if (!nextPlayer) {
        throw new Error('Next player not found');
      }

      // Update turn state
      const newTurnState: TurnState = {
        currentPlayerId: nextPlayerId,
        currentPlayerName: nextPlayer.name,
        turnOrder,
        turnNumber: turnNumber + 1
      };

      await this.dbService.updateGameState(gameId, { turnState: newTurnState });
      
      return newTurnState;
    } catch (error) {
      console.error('Error advancing to next turn:', error);
      throw new Error('Failed to advance to next turn');
    }
  }

  /**
   * Check if it's a specific player's turn
   */
  async isPlayerTurn(playerId: string, gameId: string): Promise<boolean> {
    try {
      const currentPlayer = await this.getCurrentPlayer(gameId);
      return currentPlayer?.id === playerId;
    } catch (error) {
      console.error('Error checking if player turn:', error);
      return false;
    }
  }

  /**
   * Get turn order for a game
   */
  async getTurnOrder(gameId: string): Promise<Player[]> {
    try {
      const turnState = await this.getCurrentTurnState(gameId);
      if (!turnState) {
        return [];
      }

      const players = await this.dbService.getPlayersByGameId(gameId);
      const playerMap = new Map(players.map(player => [player.id, player]));
      
      return turnState.turnOrder
        .map(playerId => playerMap.get(playerId))
        .filter((player): player is Player => player !== undefined);
    } catch (error) {
      console.error('Error getting turn order:', error);
      return [];
    }
  }

  /**
   * Get turn information for display
   */
  async getTurnInfo(gameId: string): Promise<{
    currentPlayer: Player | null;
    turnOrder: Player[];
    turnNumber: number;
    isGameOver: boolean;
  }> {
    try {
      const currentPlayer = await this.getCurrentPlayer(gameId);
      const turnOrder = await this.getTurnOrder(gameId);
      const turnState = await this.getCurrentTurnState(gameId);
      
      // Check if game is over (all players have empty hands)
      const players = await this.dbService.getPlayersByGameId(gameId);
      const isGameOver = players.every(player => {
        const handCards = Array.isArray(player.handCards) ? player.handCards as string[] : [];
        return handCards.length === 0;
      });

      return {
        currentPlayer,
        turnOrder,
        turnNumber: turnState?.turnNumber || 1,
        isGameOver
      };
    } catch (error) {
      console.error('Error getting turn info:', error);
      return {
        currentPlayer: null,
        turnOrder: [],
        turnNumber: 1,
        isGameOver: false
      };
    }
  }

  /**
   * Reset turn order (useful for game restart)
   */
  async resetTurnOrder(gameId: string): Promise<TurnState> {
    try {
      return await this.initializeTurnOrder(gameId);
    } catch (error) {
      console.error('Error resetting turn order:', error);
      throw new Error('Failed to reset turn order');
    }
  }

  /**
   * Shuffle players for random turn order
   */
  private shufflePlayers(players: Player[]): Player[] {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 