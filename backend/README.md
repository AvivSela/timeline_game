# Timeline Game Backend

Backend server for the Timeline Educational Card Game, built with Node.js, TypeScript, Express, and Prisma ORM.

## Features

- RESTful API for game management
- Real-time game state management
- PostgreSQL database with Prisma ORM
- Redis caching for performance
- TypeScript for type safety
- WebSocket support for real-time updates

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Yarn package manager

## Quick Start

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database and Redis credentials
   ```

3. **Set up database:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start development server:**
   ```bash
   yarn dev
   ```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Data models
├── routes/          # API routes
├── middleware/      # Express middleware
├── utils/           # Utility functions
└── types/           # TypeScript type definitions

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Database seed script

tests/               # Test files
```

## Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn test` - Run tests
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues

## API Endpoints

### Games
- `POST /api/games` - Create a new game
- `GET /api/games/:roomCode` - Get game by room code
- `PUT /api/games/:roomCode/state` - Update game state

### Players
- `POST /api/games/:roomCode/players` - Add player to game
- `PUT /api/games/:roomCode/players/:playerId` - Update player

### Cards
- `GET /api/cards` - Get random cards for game
- `GET /api/cards/:id` - Get specific card

## Environment Variables

See `env.example` for all required environment variables.

### Database Modes

The application supports two database modes:

1. **Normal Mode** (default): Connects to PostgreSQL database
   - Requires valid `DATABASE_URL` and `DIRECT_URL` in `.env`
   - Application will **fail to start** if database connection fails
   - This ensures issues are caught early rather than silently falling back to mock data

2. **Mock Mode** (for testing): Uses in-memory mock data
   - Set `USE_MOCK_DB=true` environment variable
   - Useful for unit tests and development without database
   - Example: `USE_MOCK_DB=true yarn dev`

### Fail-Fast Behavior

The application implements a **fail-fast** approach:
- If database connection fails in normal mode, the application exits with error
- No silent fallback to mock data in production
- Tests must explicitly opt-in to mock database usage
- This prevents hidden issues and ensures database dependencies are properly configured

## Database Schema

The database uses Prisma ORM with the following main models:
- **Game**: Game sessions and state
- **Card**: Historical event cards
- **Player**: Game participants
- **TimelineCard**: Placed cards in timeline

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Use ESLint for code quality
4. Follow the established project structure

## License

MIT 