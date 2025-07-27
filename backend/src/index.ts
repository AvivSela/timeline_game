import express from 'express';
import cors from 'cors';
import { IDatabaseService } from './services/IDatabaseService';
import { DatabaseServiceFactory } from './services/DatabaseServiceFactory';
import { DeckManager } from './services/DeckManager';
import { TurnController } from './services/TurnController';
import { CardValidator } from './services/CardValidator';

const app = express();

// Database service instance
let dbService: IDatabaseService;
let deckManager: DeckManager;
let turnController: TurnController;
let cardValidator: CardValidator;

// Initialize database connection
async function initializeDatabase() {
  try {
    dbService = DatabaseServiceFactory.create();
    await dbService.connect();
    
    // Initialize game services
    deckManager = new DeckManager(dbService);
    turnController = new TurnController(dbService);
    cardValidator = new CardValidator(dbService);
    
    console.log('Database service and game services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database service:', error);
    throw new Error('Database service initialization failed. Please check your database configuration.');
  }
}

// Initialize database service for testing
export async function initializeDatabaseForTesting(testDbService: IDatabaseService) {
  dbService = testDbService;
  await dbService.connect();
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbService ? 'connected' : 'disconnected'
  });
});

// API Routes
app.post('/api/games', async (req, res) => {
  try {
    const { playerName, maxPlayers = 8 } = req.body;
    
    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    // Generate a random 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create game using database service
    const game = await dbService.createGame(roomCode, maxPlayers);
    
    // Add player to game
    const player = await dbService.addPlayerToGame(roomCode, playerName);

    return res.json({
      game: {
        id: game.id,
        roomCode: game.roomCode,
        maxPlayers: game.maxPlayers,
        phase: game.phase
      },
      player: {
        id: player.id,
        name: player.name
      }
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return res.status(500).json({ error: 'Failed to create game' });
  }
});

app.post('/api/games/join', async (req, res) => {
  try {
    const { roomCode, playerName } = req.body;
    
    if (!roomCode || !playerName) {
      return res.status(400).json({ error: 'Room code and player name are required' });
    }

    // Check if game exists
    const game = await dbService.findGameByRoomCode(roomCode);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if game is full
    const isFull = await dbService.isGameFull(roomCode);
    if (isFull) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Get game with players to check for duplicate names
    const gameWithPlayers = await dbService.getGameWithPlayers(roomCode);
    if (gameWithPlayers) {
      const existingPlayer = gameWithPlayers.players.find((p: any) => p.name === playerName);
      if (existingPlayer) {
        return res.status(400).json({ error: 'Player name is already taken' });
      }
    }

    // Add player to game
    const player = await dbService.addPlayerToGame(roomCode, playerName);

    return res.json({
      game: {
        id: game.id,
        roomCode: game.roomCode,
        maxPlayers: game.maxPlayers,
        phase: game.phase,
        players: gameWithPlayers?.players.map((p: any) => ({ id: p.id, name: p.name })) || []
      },
      player: {
        id: player.id,
        name: player.name
      }
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return res.status(500).json({ error: 'Failed to join game' });
  }
});

app.get('/api/games/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    // Get game with players using database service
    const gameWithPlayers = await dbService.getGameWithPlayers(roomCode);
    
    if (!gameWithPlayers) {
      return res.status(404).json({ error: 'Game not found' });
    }

    return res.json({
      game: {
        id: gameWithPlayers.id,
        roomCode: gameWithPlayers.roomCode,
        maxPlayers: gameWithPlayers.maxPlayers,
        phase: gameWithPlayers.phase,
        players: gameWithPlayers.players.map((p: any) => ({ id: p.id, name: p.name, score: p.score }))
      }
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Sprint 2: Game Management Endpoints

// Start game and deal cards
app.post('/api/games/:roomCode/start', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    // Get game
    const game = await dbService.findGameByRoomCode(roomCode);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Deal initial cards
    await deckManager.dealInitialCards(game.id, 4);
    
    // Initialize turn order
    const turnState = await turnController.initializeTurnOrder(game.id);
    
    // Update game phase to PLAYING
    await dbService.updateGamePhase(roomCode, 'PLAYING');

    return res.json({
      message: 'Game started successfully',
      turnState
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return res.status(500).json({ error: 'Failed to start game' });
  }
});

// Get player's hand
app.get('/api/games/:roomCode/players/:playerId/hand', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const hand = await deckManager.getPlayerHand(playerId);
    
    return res.json({ hand });
  } catch (error) {
    console.error('Error getting player hand:', error);
    return res.status(500).json({ error: 'Failed to get player hand' });
  }
});

// Get turn information
app.get('/api/games/:roomCode/turn', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const game = await dbService.findGameByRoomCode(roomCode);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const turnInfo = await turnController.getTurnInfo(game.id);
    
    return res.json({ turnInfo });
  } catch (error) {
    console.error('Error getting turn info:', error);
    return res.status(500).json({ error: 'Failed to get turn info' });
  }
});

// Place card on timeline
app.post('/api/games/:roomCode/place-card', async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { playerId, cardId, position } = req.body;
    
    if (!playerId || !cardId || position === undefined) {
      return res.status(400).json({ error: 'Player ID, card ID, and position are required' });
    }

    const game = await dbService.findGameByRoomCode(roomCode);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if it's the player's turn
    const isPlayerTurn = await turnController.isPlayerTurn(playerId, game.id);
    if (!isPlayerTurn) {
      return res.status(400).json({ error: 'Not your turn' });
    }

    // Validate card placement
    const validation = await cardValidator.validateCardPlacement(game.id, cardId, position);
    
    if (validation.isValid) {
      // Add card to timeline
      await dbService.addCardToTimeline(game.id, cardId, position);
      
      // Remove card from player's hand
      await deckManager.removeCardFromHand(playerId, cardId);
      
      // Check if player has won
      const hasWon = await deckManager.hasPlayerWon(playerId);
      
      if (hasWon) {
        // Game over - this player won
        await dbService.updateGamePhase(roomCode, 'FINISHED');
        return res.json({
          success: true,
          message: 'Card placed correctly! You won the game!',
          validation,
          gameOver: true,
          winner: playerId
        });
      }
      
      // Advance to next turn
      const newTurnState = await turnController.nextTurn(game.id);
      
      return res.json({
        success: true,
        message: 'Card placed correctly!',
        validation,
        newTurnState
      });
    } else {
      // Incorrect placement - draw a new card
      const newCard = await deckManager.drawCardForPlayer(playerId);
      
      return res.json({
        success: false,
        message: 'Incorrect placement. You drew a new card.',
        validation,
        newCard
      });
    }
  } catch (error) {
    console.error('Error placing card:', error);
    return res.status(500).json({ error: 'Failed to place card' });
  }
});

// Get timeline
app.get('/api/games/:roomCode/timeline', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const timeline = await dbService.getTimelineForGame(roomCode);
    
    return res.json({ timeline });
  } catch (error) {
    console.error('Error getting timeline:', error);
    return res.status(500).json({ error: 'Failed to get timeline' });
  }
});

// Get game statistics
app.get('/api/games/:roomCode/stats', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const game = await dbService.findGameByRoomCode(roomCode);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const timelineStats = await cardValidator.getTimelineStats(game.id);
    const remainingCards = await deckManager.getRemainingCardsCount(game.id);
    
    return res.json({
      timelineStats,
      remainingCards
    });
  } catch (error) {
    console.error('Error getting game stats:', error);
    return res.status(500).json({ error: 'Failed to get game stats' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database service: ${dbService ? 'Initialized' : 'Not available'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start the server if this is the main module (not when imported for testing)
if (require.main === module) {
  startServer();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (dbService) {
    await dbService.disconnect();
  }
  process.exit(0);
});

// Export the app for testing
export default app; 