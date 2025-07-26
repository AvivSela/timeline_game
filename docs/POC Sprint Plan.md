# Timeline Educational Card Game - POC Sprint Plan

## Overview

This sprint plan breaks down the POC features into 4 focused sprints over 30 days, following the MVP approach outlined in the development guide. Each sprint builds upon the previous one to deliver a working multiplayer timeline card game.

## 📊 Current Progress Summary

**Overall Progress: 25% Complete (1 of 4 sprints)**

### Sprint Status:
- **Sprint 1**: 🟢 **COMPLETED** (Foundation & Game Creation)
- **Sprint 2**: 🔴 **NOT STARTED** (Core Gameplay & UI)
- **Sprint 3**: 🔴 **NOT STARTED** (Real-time Multiplayer & Validation)
- **Sprint 4**: 🔴 **NOT STARTED** (Polish & Testing)

### Key Achievements:
- ✅ Database setup with Prisma ORM and PostgreSQL
- ✅ 35 historical event cards seeded
- ✅ Complete backend services with type-safe database operations
- ✅ Comprehensive test suite (28/28 tests passing)
- ✅ Redis caching service implemented
- ❌ Frontend implementation not started

## Sprint Structure

- **Sprint Duration**: 1 week (7 days)
- **Total POC Timeline**: 4 weeks (28 days)
- **Buffer Days**: 2 days for unexpected issues
- **Team Size**: 2-3 developers (1 frontend, 1 backend, 1 full-stack)
- **ORM**: Prisma (recommended) or TypeORM for database management

---

## Sprint 1: Foundation & Game Creation (Days 1-7)

### Sprint Goal
Establish the basic infrastructure and game creation/joining functionality.

### Features & User Stories

#### 1.1 Database Setup & ORM Configuration ✅ COMPLETED
**User Stories:**
- As a developer, I need a working database with ORM for type-safe data access
- As a system, I need to persist game state for reliability
- As a developer, I need automatic database migrations and seeding

**Technical Tasks:**
- [x] Set up PostgreSQL database
- [x] Install and configure Prisma ORM
- [x] Create Prisma schema with core models: `Game`, `Card`, `Player`, `TimelineCard`
- [x] Set up database connection and connection pooling
- [x] Create database migrations
- [x] Implement seed script for 35 historical event cards
- [x] Set up Redis for caching active game states
- [x] Create TypeScript types from Prisma schema

**Acceptance Criteria:**
- Database connects successfully via ORM
- Prisma schema defines all required models and relationships
- Migrations run without errors
- Seed data loads correctly
- TypeScript types are generated and available
- Redis cache responds to basic operations

#### 1.2 Basic Backend Services with ORM Integration ✅ COMPLETED
**User Stories:**
- As a player, I can create a new game and receive a room code
- As a player, I can join an existing game using a room code
- As a developer, I can use type-safe database operations

**Technical Tasks:**
- [x] Create Express.js server with basic routing
- [x] Set up Prisma client and database service layer
- [x] Implement GameManager service with ORM integration
- [x] Create room code generation system
- [x] Implement basic game creation endpoint using ORM
- [x] Implement game joining endpoint using ORM
- [x] Add basic input validation and error handling
- [x] Create database service utilities for common operations

**Acceptance Criteria:**
- POST `/api/games/create` creates game and returns room code
- POST `/api/games/join` allows joining with valid room code
- Invalid room codes return appropriate errors
- Game state is properly initialized and persisted
- All database operations use type-safe ORM methods
- Database transactions handle concurrent access properly

#### 1.3 Basic Frontend Setup ❌ NOT STARTED
**User Stories:**
- As a player, I can access the game through a web interface
- As a player, I can see a simple form to create or join games

**Technical Tasks:**
- [ ] Set up React 18 with TypeScript
- [ ] Configure Tailwind CSS for styling
- [ ] Create basic layout components
- [ ] Implement game creation form
- [ ] Implement game joining form
- [ ] Add basic form validation

**Acceptance Criteria:**
- React app loads without errors
- Forms are styled and responsive
- Form validation works correctly
- API calls to backend succeed

### Sprint 1 Deliverables
- ✅ Working database with Prisma ORM and seed data
- ✅ Basic backend API for game creation/joining with type-safe database operations
- ❌ Simple frontend with game creation/joining forms
- ✅ Basic error handling and validation
- ✅ Database migrations and schema management

---

## Sprint 2: Core Gameplay & UI (Days 8-14)

### Sprint Goal
Implement the core gameplay mechanics and basic user interface.

### Features & User Stories

#### 2.1 Card Distribution System with ORM
**User Stories:**
- As a player, I can see my hand of cards (without dates)
- As a player, I receive a new card when placement is incorrect
- As a system, I can efficiently manage card distribution using ORM

**Technical Tasks:**
- [ ] Implement DeckManager service with ORM integration
- [ ] Create card dealing logic using database transactions
- [ ] Implement hand management for players with ORM relationships
- [ ] Add card drawing when placement is wrong
- [ ] Create card data structure using Prisma models
- [ ] Implement efficient card querying and caching

**Acceptance Criteria:**
- Players receive initial hand of cards
- Cards show name and description (no dates)
- New cards are drawn after incorrect placements
- Hand size is properly managed
- Database operations are optimized and use proper relationships
- Card distribution is atomic and consistent

#### 2.2 Timeline Display & Drag-and-Drop
**User Stories:**
- As a player, I can clearly see the timeline
- As a player, I can drag and drop a card onto the timeline

**Technical Tasks:**
- [ ] Create GameBoard component
- [ ] Implement timeline display
- [ ] Add drag-and-drop functionality
- [ ] Create visual feedback for drag operations
- [ ] Implement drop zone validation

**Acceptance Criteria:**
- Timeline displays horizontally with clear zones
- Cards can be dragged from hand to timeline
- Visual feedback during drag operations
- Drop zones are clearly indicated

#### 2.3 Basic Game State Management
**User Stories:**
- As a player, I can only place cards during my turn
- As a player, I can see whose turn it is currently

**Technical Tasks:**
- [ ] Implement TurnController service (basic version)
- [ ] Create turn rotation system
- [ ] Add turn validation for card placement
- [ ] Implement turn indicator in UI
- [ ] Create basic game state updates

**Acceptance Criteria:**
- Turn order rotates correctly
- Players can only place cards on their turn
- Current player is clearly indicated
- Game state updates properly

#### 2.4 Player Management UI
**User Stories:**
- As a player, I can see other players who have joined the game
- As a player, I can see game status (whose turn, cards remaining)

**Technical Tasks:**
- [ ] Create PlayerList component
- [ ] Display connected players
- [ ] Show current turn player
- [ ] Display hand counts for each player
- [ ] Add basic player status indicators

**Acceptance Criteria:**
- Player list shows all connected players
- Current turn player is highlighted
- Hand counts are displayed
- Player connection status is shown

### Sprint 2 Deliverables
- Working card distribution system with ORM transactions
- Functional drag-and-drop timeline interface
- Turn-based gameplay mechanics with database persistence
- Player management interface
- Basic game state synchronization
- Optimized database queries and relationships

---

## Sprint 3: Real-time Multiplayer & Validation (Days 15-21)

### Sprint Goal
Implement real-time multiplayer functionality and server-side validation.

### Features & User Stories

#### 3.1 WebSocket Integration
**User Stories:**
- As a player, I can see other players' actions in real-time
- As a player, I can see the shared timeline update immediately

**Technical Tasks:**
- [ ] Set up Socket.io server
- [ ] Implement WebSocketManager service (basic version)
- [ ] Create WebSocket event handlers
- [ ] Add real-time game state broadcasting
- [ ] Implement connection/disconnection handling

**Acceptance Criteria:**
- WebSocket connections are established
- Game state updates are broadcast to all players
- Player actions are visible in real-time
- Disconnections are handled gracefully

#### 3.2 Server-side Validation
**User Stories:**
- As a player, I can see if my placement was correct or incorrect
- As a player, I can see the revealed date when placement is correct

**Technical Tasks:**
- [ ] Implement CardValidator service (basic version)
- [ ] Create chronological validation logic
- [ ] Add placement accuracy scoring
- [ ] Implement date revelation system
- [ ] Create validation feedback system

**Acceptance Criteria:**
- Card placements are validated against chronological order
- Correct placements reveal the date
- Incorrect placements return cards to hand
- Validation feedback is clear and immediate

#### 3.3 Real-time Game Events
**User Stories:**
- As a player, I can see when it's my turn
- As a player, I can see other players' actions in real-time

**Technical Tasks:**
- [ ] Create GameEvents component
- [ ] Implement real-time event broadcasting
- [ ] Add turn change notifications
- [ ] Create placement result notifications
- [ ] Add basic event feed

**Acceptance Criteria:**
- Turn changes are announced in real-time
- Card placements are shown to all players
- Event feed displays recent actions
- Notifications are clear and timely

#### 3.4 Game State Persistence with ORM
**User Stories:**
- As a player, my game state persists if I refresh
- As a player, I cannot cheat by modifying client code
- As a system, I can efficiently persist and recover game state

**Technical Tasks:**
- [ ] Implement server-authoritative game state
- [ ] Add game state persistence using ORM transactions
- [ ] Create state recovery on reconnection with ORM queries
- [ ] Implement client state validation
- [ ] Add basic anti-cheat measures
- [ ] Create efficient game state serialization/deserialization
- [ ] Implement database connection pooling and optimization

**Acceptance Criteria:**
- Game state is saved to database using ORM
- Refreshing page maintains game state
- Reconnections restore player state efficiently
- Client modifications are detected
- Database operations are optimized for performance
- Game state recovery is fast and reliable

### Sprint 3 Deliverables
- Real-time multiplayer functionality
- Server-side validation and anti-cheat
- Persistent game state with ORM optimization
- Real-time event system
- Connection management
- Database connection pooling and performance optimization

---

## Sprint 4: Polish & Testing (Days 22-28)

### Sprint Goal
Polish the user experience, add error handling, and ensure the POC is production-ready.

### Features & User Stories

#### 4.1 Enhanced UI/UX
**User Stories:**
- As a player, I can easily identify my cards
- As a player, I receive clear feedback on my actions
- As a player, I can see game status clearly

**Technical Tasks:**
- [ ] Improve visual design and styling
- [ ] Add animations for card placement
- [ ] Enhance feedback messages
- [ ] Improve responsive design
- [ ] Add loading states and indicators

**Acceptance Criteria:**
- UI is visually appealing and modern
- Animations provide clear feedback
- Messages are helpful and clear
- Design works on different screen sizes
- Loading states prevent confusion

#### 4.2 Win Condition & Game End
**User Stories:**
- As a player, I can see when I've won (empty hand)
- As a player, I can see the final timeline when the game ends

**Technical Tasks:**
- [ ] Implement win condition detection
- [ ] Create game end screen
- [ ] Display final timeline
- [ ] Add game statistics
- [ ] Implement game restart functionality

**Acceptance Criteria:**
- Win condition is properly detected
- Game end screen shows final results
- Final timeline is displayed correctly
- Game can be restarted easily

#### 4.3 Error Handling & Edge Cases
**User Stories:**
- As a player, I receive helpful error messages
- As a player, the game handles unexpected situations gracefully

**Technical Tasks:**
- [ ] Add comprehensive error handling
- [ ] Implement connection recovery
- [ ] Handle edge cases (disconnections, timeouts)
- [ ] Add input validation
- [ ] Create error logging system

**Acceptance Criteria:**
- Errors are handled gracefully
- Connection issues are resolved automatically
- Edge cases don't break the game
- Errors are logged for debugging

#### 4.4 Testing & Quality Assurance
**User Stories:**
- As a developer, I can verify the game works correctly
- As a user, the game is stable and reliable

**Technical Tasks:**
- [ ] Write unit tests for core services
- [ ] Create integration tests for API endpoints
- [ ] Perform manual testing of user flows
- [ ] Test multiplayer scenarios
- [ ] Performance testing and optimization

**Acceptance Criteria:**
- Core functionality is tested
- API endpoints work correctly
- User flows are smooth and intuitive
- Multiplayer works reliably
- Performance meets requirements

### Sprint 4 Deliverables
- Polished and responsive UI
- Complete game lifecycle (creation to end)
- Robust error handling
- Comprehensive testing
- Production-ready POC

---

## Technical Architecture Summary

### Backend Services (MVP Versions)
- **GameManager**: Game lifecycle and state management with ORM integration
- **DeckManager**: Card distribution and hand management with database transactions
- **TurnController**: Turn-based gameplay logic with ORM state persistence
- **CardValidator**: Chronological validation with efficient database queries
- **WebSocketManager**: Real-time communication
- **DatabaseService**: ORM wrapper and database utilities

### Frontend Components
- **GameBoard**: Main timeline interface with drag-and-drop
- **PlayerHand**: Card management and display
- **PlayerList**: Multiplayer status and turn indicators
- **GameEvents**: Real-time activity feed
- **GameForms**: Creation and joining interfaces

### Database Schema (Prisma)
```prisma
// Core models for POC
model Game {
  id        String   @id @default(cuid())
  roomCode  String   @unique
  state     Json
  phase     GamePhase @default(WAITING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  players   Player[]
  timeline  TimelineCard[]
  
  @@map("games")
}

model Card {
  id                 String   @id @default(cuid())
  name               String
  description        String
  chronologicalValue Int
  difficulty         Difficulty
  category           String
  imageUrl           String?
  
  timelineCards      TimelineCard[]
  
  @@map("cards")
}

model Player {
  id         String   @id @default(cuid())
  name       String
  gameId     String
  handCards  Json     // Array of card IDs
  isConnected Boolean @default(true)
  isCurrentTurn Boolean @default(false)
  
  game       Game     @relation(fields: [gameId], references: [id])
  
  @@map("players")
}

model TimelineCard {
  id       String @id @default(cuid())
  gameId   String
  cardId   String
  position Int
  
  game     Game   @relation(fields: [gameId], references: [id])
  card     Card   @relation(fields: [cardId], references: [id])
  
  @@map("timeline_cards")
}

enum GamePhase {
  WAITING
  PLAYING
  PAUSED
  FINISHED
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

### WebSocket Events
- `join-game`: Player joins game
- `place-card`: Card placement attempt
- `turn-changed`: Turn rotation
- `game-updated`: Game state changes
- `player-joined/left`: Player connection events

---

## Success Criteria

The POC will be considered successful when:

1. **Working Game Loop**: Players can create, join, play, and complete a game
2. **Real-time Multiplayer**: 2-4 players can play simultaneously with real-time updates
3. **Educational Value**: Players learn about chronological ordering through gameplay
4. **Technical Foundation**: Clean architecture that can be extended for future phases
5. **User Experience**: Intuitive interface that doesn't require extensive instructions

## Risk Mitigation

### Technical Risks
- **WebSocket Complexity**: Start with basic Socket.io implementation
- **State Synchronization**: Use server-authoritative approach from the beginning
- **Performance**: Monitor and optimize as needed during development
- **ORM Learning Curve**: Start with Prisma's simple API and gradually use advanced features
- **Database Performance**: Use proper indexing and query optimization from the start

### Timeline Risks
- **Scope Creep**: Stick strictly to POC features
- **Integration Issues**: Test integration points early in each sprint
- **Dependencies**: Identify and address blocking dependencies early

## ORM Setup and Best Practices

### Prisma Configuration
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models defined in Database Schema section above
```

### Database Service Layer
```typescript
// services/DatabaseService.ts
import { PrismaClient } from '@prisma/client'

class DatabaseService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  }

  async createGame(roomCode: string, state: any) {
    return this.prisma.game.create({
      data: {
        roomCode,
        state,
        phase: 'WAITING'
      }
    })
  }

  async findGameByRoomCode(roomCode: string) {
    return this.prisma.game.findUnique({
      where: { roomCode },
      include: {
        players: true,
        timeline: {
          include: { card: true }
        }
      }
    })
  }

  async updateGameState(gameId: string, state: any) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: { state, updatedAt: new Date() }
    })
  }
}
```

### Migration and Seeding
```bash
# Initial setup
npx prisma generate
npx prisma migrate dev --name init

# Seed data
npx prisma db seed

# Production
npx prisma migrate deploy
```

## Next Steps After POC

Once the POC is complete and validated, the next phases will focus on:

1. **Phase 1**: Educational enhancements (hints, analytics, teacher tools)
2. **Phase 2**: Advanced features (adaptive learning, collaboration, LMS integration)

The POC provides the foundation for these advanced features while proving the core concept works. 