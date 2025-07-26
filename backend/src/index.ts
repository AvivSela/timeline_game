import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();

// Optional Prisma connection
let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.warn('Prisma not available, using mock data');
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
    database: prisma ? 'connected' : 'mock'
  });
});

// Mock data for development when database is not available
const mockGames = new Map();
const mockPlayers = new Map();

// API Routes
app.post('/api/games', async (req, res) => {
  try {
    const { playerName, maxPlayers = 8 } = req.body;
    
    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    // Generate a random 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (prisma) {
      // Use real database
      const game = await prisma.game.create({
        data: {
          roomCode,
          maxPlayers,
          state: {
            players: [],
            currentTurn: null,
            timeline: []
          }
        }
      });

      const player = await prisma.player.create({
        data: {
          name: playerName,
          gameId: game.id,
          isCurrentTurn: true
        }
      });

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
    } else {
      // Use mock data
      const gameId = `game_${Date.now()}`;
      const playerId = `player_${Date.now()}`;
      
      const game = {
        id: gameId,
        roomCode,
        maxPlayers,
        phase: 'WAITING'
      };
      
      const player = {
        id: playerId,
        name: playerName
      };
      
      mockGames.set(roomCode, game);
      mockPlayers.set(playerId, player);
      
      return res.json({ game, player });
    }
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

    if (prisma) {
      // Use real database
      const game = await prisma.game.findUnique({
        where: { roomCode },
        include: { players: true }
      });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      if (game.players.length >= game.maxPlayers) {
        return res.status(400).json({ error: 'Game is full' });
      }

      const existingPlayer = game.players.find(p => p.name === playerName);
      if (existingPlayer) {
        return res.status(400).json({ error: 'Player name is already taken' });
      }

      const player = await prisma.player.create({
        data: {
          name: playerName,
          gameId: game.id
        }
      });

      return res.json({
        game: {
          id: game.id,
          roomCode: game.roomCode,
          maxPlayers: game.maxPlayers,
          phase: game.phase,
          players: game.players.map(p => ({ id: p.id, name: p.name }))
        },
        player: {
          id: player.id,
          name: player.name
        }
      });
    } else {
      // Use mock data
      const game = mockGames.get(roomCode);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      const playerId = `player_${Date.now()}`;
      const player = { id: playerId, name: playerName };
      mockPlayers.set(playerId, player);
      
      return res.json({
        game: {
          id: game.id,
          roomCode: game.roomCode,
          maxPlayers: game.maxPlayers,
          phase: game.phase,
          players: [player]
        },
        player
      });
    }
  } catch (error) {
    console.error('Error joining game:', error);
    return res.status(500).json({ error: 'Failed to join game' });
  }
});

app.get('/api/games/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    if (prisma) {
      // Use real database
      const game = await prisma.game.findUnique({
        where: { roomCode },
        include: { players: true }
      });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      return res.json({
        game: {
          id: game.id,
          roomCode: game.roomCode,
          maxPlayers: game.maxPlayers,
          phase: game.phase,
          players: game.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
        }
      });
    } else {
      // Use mock data
      const game = mockGames.get(roomCode);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      return res.json({
        game: {
          id: game.id,
          roomCode: game.roomCode,
          maxPlayers: game.maxPlayers,
          phase: game.phase,
          players: []
        }
      });
    }
  } catch (error) {
    console.error('Error fetching game:', error);
    return res.status(500).json({ error: 'Failed to fetch game' });
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
    // Try to connect to database if available
    if (prisma) {
      try {
        await prisma.$connect();
        console.log('Connected to database');
      } catch (error) {
        console.warn('Failed to connect to database, using mock data');
        prisma = null;
      }
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database: ${prisma ? 'Connected' : 'Mock mode'}`);
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
  if (prisma) {
    await prisma.$disconnect();
  }
  process.exit(0);
});

// Export the app for testing
export default app; 