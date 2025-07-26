# Database Setup & ORM Configuration Plan

## Overview

This document provides a detailed step-by-step guide for setting up the PostgreSQL database and Prisma ORM for the Timeline Educational Card Game POC. This task is part of Sprint 1.1 and establishes the foundation for all database operations.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Yarn package manager (as per project requirements)
- Git repository initialized

## Task Breakdown

### Phase 1: Environment Setup (30 minutes)

#### 1.1 Install Dependencies
```bash
yarn add prisma @prisma/client
yarn add -D @types/node
```

#### 1.2 Initialize Prisma
```bash
npx prisma init
```

**Creates:**
- `prisma/` directory
- `prisma/schema.prisma` file
- `.env` file with database URL

#### 1.3 Configure Environment Variables
**Required environment variables in `.env`:**
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection (for migrations)
- `REDIS_URL` - Redis connection string
- `NODE_ENV` - Environment (development/production)
- `PORT` - Application port

### Phase 2: Database Schema Design (45 minutes)

#### 2.1 Create Prisma Schema
**Core Models to implement:**
- **Game**: Game sessions with room codes and state management
- **Card**: Historical events with chronological values and difficulty levels
- **Player**: Players with hand management and turn tracking
- **TimelineCard**: Placed cards with position tracking

**Key Features:**
- Proper relationships and foreign keys
- Indexes for performance optimization
- Enums for GamePhase and Difficulty
- JSON fields for flexible state storage

#### 2.2 Generate Prisma Client
```bash
npx prisma generate
```

### Phase 3: Database Creation & Migration (30 minutes)

#### 3.1 Create Database
```bash
createdb timeline_game_dev
```

#### 3.2 Run Initial Migration
```bash
npx prisma migrate dev --name init
```

#### 3.3 Verify Database Setup
```bash
npx prisma studio
```

### Phase 4: Seed Data Creation (60 minutes)

#### 4.1 Create Seed Script
**File:** `prisma/seed.ts`

**Historical Events to include (30+ events):**
- **Ancient History**: Great Pyramid, Roman Empire, Jesus Christ
- **Middle Ages**: Crusades, Magna Carta, Black Death
- **Renaissance**: Gutenberg Bible, Columbus, Mona Lisa
- **Industrial Revolution**: Steam Engine, American Revolution, French Revolution
- **19th Century**: Locomotive, Darwin, Civil War, Telephone, Light Bulb
- **20th Century**: Flight, World Wars, Moon Landing, Berlin Wall
- **21st Century**: iPhone, Obama, COVID-19

**Seed Script Features:**
- Clear existing data
- Create historical event cards
- Create sample game for testing
- Proper error handling and logging

#### 4.2 Configure Package.json for Seeding
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

#### 4.3 Run Seed Script
```bash
yarn add -D ts-node
npx prisma db seed
```

### Phase 5: Database Service Layer (45 minutes)

#### 5.1 Create Database Service
**File:** `src/services/DatabaseService.ts`

**Core Methods to implement:**
- **Game Operations**: createGame, findGameByRoomCode, updateGameState
- **Player Operations**: addPlayerToGame, updatePlayerHand, setCurrentTurn
- **Card Operations**: getRandomCards, getCardById
- **Timeline Operations**: addCardToTimeline, getTimelineForGame
- **Utility Operations**: getGameWithPlayers, cleanupInactiveGames

**Features:**
- Type-safe Prisma client usage
- Proper error handling
- Connection management
- Query optimization with includes

#### 5.2 Create Type Definitions
**File:** `src/types/database.ts`

**Types to define:**
- Extended types with relations (GameWithPlayers, PlayerWithGame)
- Game state interface
- API response types
- Import Prisma-generated types

### Phase 6: Redis Setup (30 minutes)

#### 6.1 Install Redis Dependencies
```bash
yarn add redis
yarn add -D @types/redis
```

#### 6.2 Create Redis Service
**File:** `src/services/RedisService.ts`

**Core Functionality:**
- Game state caching with TTL
- Player session management
- Room code management
- Rate limiting support
- Connection management

### Phase 7: Testing & Validation (30 minutes)

#### 7.1 Create Database Tests
**File:** `src/tests/database.test.ts`

**Test Cases:**
- Game creation and retrieval
- Player management
- Card operations
- Timeline operations
- Error handling scenarios

#### 7.2 Run Tests
```bash
yarn add -D jest @types/jest ts-jest
yarn test database.test.ts
```

### Phase 8: Documentation & Verification (15 minutes)

#### 8.1 Create Database Documentation
**File:** `docs/Database Schema Documentation.md`

**Documentation Sections:**
- Model overview and relationships
- Index strategy for performance
- Data flow patterns
- Best practices and conventions

#### 8.2 Verify Setup
```bash
npx prisma studio
npx prisma db seed
```

## Database Schema Overview

### Core Models
- **Game**: `id`, `roomCode`, `state`, `phase`, `maxPlayers`, timestamps
- **Card**: `id`, `name`, `description`, `chronologicalValue`, `difficulty`, `category`
- **Player**: `id`, `name`, `gameId`, `handCards`, `isCurrentTurn`, `score`
- **TimelineCard**: `id`, `gameId`, `cardId`, `position`, `placedAt`

### Key Relationships
- Game → Player (one-to-many)
- Game → TimelineCard (one-to-many)
- Card → TimelineCard (one-to-many)
- Player → Game (many-to-one)

### Performance Optimizations
- Indexes on frequently queried fields
- Connection pooling configuration
- Query optimization with proper includes
- Redis caching for frequently accessed data

## Acceptance Criteria Checklist

- [ ] PostgreSQL database is running and accessible
- [ ] Prisma schema is defined with all required models
- [ ] Database migrations run successfully
- [ ] Seed data is loaded with 30+ historical events
- [ ] Prisma client is generated with TypeScript types
- [ ] Database service layer is implemented
- [ ] Redis service is configured for caching
- [ ] Basic tests pass
- [ ] Prisma Studio can connect and display data
- [ ] Environment variables are properly configured

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Migration Errors**
   - Reset database: `npx prisma migrate reset`
   - Check schema syntax
   - Verify PostgreSQL version compatibility

3. **Seed Data Issues**
   - Check TypeScript compilation
   - Verify database permissions
   - Review seed script syntax

4. **Redis Connection Issues**
   - Verify Redis is running
   - Check REDIS_URL in .env
   - Test connection manually

### Performance Optimization
- Database indexes are included in schema
- Connection pooling is configured in Prisma client
- Query optimization uses includes for relations
- Redis caching strategy for frequently accessed data

## Next Steps

After completing this task, the next steps are:
1. **Sprint 1.2**: Basic Backend Services with ORM Integration
2. **Sprint 1.3**: Basic Frontend Setup
3. **Sprint 2**: Core Gameplay & UI

The database foundation is now ready for the application development phase.

## Acceptance Criteria Checklist

- [ ] PostgreSQL database is running and accessible
- [ ] Prisma schema is defined with all required models
- [ ] Database migrations run successfully
- [ ] Seed data is loaded with 30+ historical events
- [ ] Prisma client is generated with TypeScript types
- [ ] Database service layer is implemented
- [ ] Redis service is configured for caching
- [ ] Basic tests pass
- [ ] Prisma Studio can connect and display data
- [ ] Environment variables are properly configured

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Migration Errors**
   - Reset database: `npx prisma migrate reset`
   - Check schema syntax
   - Verify PostgreSQL version compatibility

3. **Seed Data Issues**
   - Check TypeScript compilation
   - Verify database permissions
   - Review seed script syntax

4. **Redis Connection Issues**
   - Verify Redis is running
   - Check REDIS_URL in .env
   - Test connection manually

### Performance Optimization

1. **Database Indexes**: Already included in schema
2. **Connection Pooling**: Configured in Prisma client
3. **Query Optimization**: Use includes for relations
4. **Caching Strategy**: Redis for frequently accessed data

## Next Steps

After completing this task, the next steps are:
1. **Sprint 1.2**: Basic Backend Services with ORM Integration
2. **Sprint 1.3**: Basic Frontend Setup
3. **Sprint 2**: Core Gameplay & UI

The database foundation is now ready for the application development phase. 