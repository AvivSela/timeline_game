# Database Schema Documentation

## Overview

This document provides a comprehensive overview of the database schema for the Timeline Educational Card Game. The database is built using PostgreSQL with Prisma ORM and includes models for games, players, cards, and timeline management.

## Database Models

### Game Model

The `Game` model represents a game session with room management and state tracking.

```prisma
model Game {
  id          String   @id @default(cuid())
  roomCode    String   @unique
  state       Json     @default("{}")
  phase       GamePhase @default(WAITING)
  maxPlayers  Int      @default(8)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  players     Player[]
  timelineCards TimelineCard[]

  @@index([roomCode])
  @@index([phase])
}
```

**Fields:**
- `id`: Unique identifier for the game (CUID)
- `roomCode`: Unique room code for players to join
- `state`: JSON field storing game state (current turn, round, etc.)
- `phase`: Current game phase (WAITING, PLAYING, FINISHED)
- `maxPlayers`: Maximum number of players allowed
- `createdAt`: Timestamp when game was created
- `updatedAt`: Timestamp when game was last updated

**Relationships:**
- One-to-many with `Player`
- One-to-many with `TimelineCard`

**Indexes:**
- `roomCode` for fast room lookups
- `phase` for filtering games by status

### Card Model

The `Card` model represents historical events that players place on the timeline.

```prisma
model Card {
  id                  String     @id @default(cuid())
  name                String
  description         String
  chronologicalValue  Int
  difficulty          Difficulty @default(MEDIUM)
  category            String
  imageUrl            String?
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  timelineCards       TimelineCard[]

  @@index([chronologicalValue])
  @@index([difficulty])
  @@index([category])
}
```

**Fields:**
- `id`: Unique identifier for the card (CUID)
- `name`: Name of the historical event
- `description`: Description of the event
- `chronologicalValue`: Year of the event (negative for BCE)
- `difficulty`: Difficulty level (EASY, MEDIUM, HARD)
- `category`: Category of the event (Ancient History, Middle Ages, etc.)
- `imageUrl`: Optional URL for event image
- `createdAt`: Timestamp when card was created
- `updatedAt`: Timestamp when card was last updated

**Relationships:**
- One-to-many with `TimelineCard`

**Indexes:**
- `chronologicalValue` for timeline ordering
- `difficulty` for filtering by difficulty
- `category` for filtering by category

### Player Model

The `Player` model represents players participating in games.

```prisma
model Player {
  id            String   @id @default(cuid())
  name          String
  gameId        String
  handCards     Json     @default("[]")
  isCurrentTurn Boolean  @default(false)
  score         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  game          Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@index([gameId])
  @@index([isCurrentTurn])
}
```

**Fields:**
- `id`: Unique identifier for the player (CUID)
- `name`: Player's display name
- `gameId`: Foreign key to the game
- `handCards`: JSON array of card IDs in player's hand
- `isCurrentTurn`: Whether it's this player's turn
- `score`: Player's current score
- `createdAt`: Timestamp when player was created
- `updatedAt`: Timestamp when player was last updated

**Relationships:**
- Many-to-one with `Game`

**Indexes:**
- `gameId` for fast player lookups by game
- `isCurrentTurn` for finding current player

### TimelineCard Model

The `TimelineCard` model represents cards placed on the timeline during gameplay.

```prisma
model TimelineCard {
  id        String   @id @default(cuid())
  gameId    String
  cardId    String
  position  Int
  placedAt  DateTime @default(now())

  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([gameId])
  @@index([cardId])
  @@index([position])
}
```

**Fields:**
- `id`: Unique identifier for the timeline card (CUID)
- `gameId`: Foreign key to the game
- `cardId`: Foreign key to the card
- `position`: Position on the timeline (0-based)
- `placedAt`: Timestamp when card was placed

**Relationships:**
- Many-to-one with `Game`
- Many-to-one with `Card`

**Indexes:**
- `gameId` for fast timeline lookups by game
- `cardId` for card references
- `position` for timeline ordering

## Enums

### GamePhase

```prisma
enum GamePhase {
  WAITING
  PLAYING
  FINISHED
}
```

- `WAITING`: Game is waiting for players to join
- `PLAYING`: Game is in progress
- `FINISHED`: Game has ended

### Difficulty

```prisma
enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

- `EASY`: Easy difficulty cards
- `MEDIUM`: Medium difficulty cards
- `HARD`: Hard difficulty cards

## Data Flow Patterns

### Game Creation Flow

1. Create `Game` record with unique `roomCode`
2. Set initial `state` and `phase`
3. Cache room code in Redis for fast lookups

### Player Join Flow

1. Validate game exists and has space
2. Create `Player` record with `gameId`
3. Update game state if needed
4. Set first player as `isCurrentTurn: true`

### Card Placement Flow

1. Validate player's turn and card ownership
2. Create `TimelineCard` record with position
3. Remove card from player's hand
4. Update game state and turn order
5. Validate timeline correctness

### Game State Management

Game state is stored as JSON in the `Game.state` field:

```json
{
  "currentTurn": 0,
  "round": 1,
  "maxRounds": 5,
  "currentPlayerId": "player_id",
  "gameStartTime": "2024-01-01T00:00:00Z",
  "lastActionTime": "2024-01-01T00:00:00Z"
}
```

## Performance Optimizations

### Database Indexes

- **Room Code Lookups**: Index on `Game.roomCode` for fast game retrieval
- **Player Management**: Index on `Player.gameId` for game-specific queries
- **Timeline Ordering**: Index on `TimelineCard.position` for chronological display
- **Card Filtering**: Indexes on `Card.difficulty` and `Card.category` for filtering

### Query Optimization

- Use `include` for related data fetching
- Implement connection pooling in Prisma client
- Cache frequently accessed data in Redis
- Use pagination for large result sets

### Caching Strategy

Redis is used for:
- Game state caching (TTL: 1 hour)
- Player session management (TTL: 24 hours)
- Room code lookups (TTL: 1 hour)
- Rate limiting
- Player presence tracking (TTL: 1 minute)

## Best Practices

### Data Integrity

1. **Cascade Deletes**: Use cascade deletes for related data cleanup
2. **Foreign Key Constraints**: All relationships are properly constrained
3. **Unique Constraints**: Room codes and card IDs are unique
4. **Default Values**: Sensible defaults for all fields

### Error Handling

1. **Validation**: Validate data before database operations
2. **Transaction Support**: Use transactions for multi-step operations
3. **Graceful Degradation**: Handle database failures gracefully
4. **Logging**: Log all database operations for debugging

### Security

1. **Input Validation**: Validate all user inputs
2. **SQL Injection Prevention**: Use Prisma's parameterized queries
3. **Access Control**: Implement proper access controls
4. **Data Encryption**: Sensitive data should be encrypted

## Migration Strategy

### Schema Changes

1. **Backward Compatibility**: Maintain backward compatibility when possible
2. **Migration Scripts**: Create proper migration scripts for schema changes
3. **Data Migration**: Handle data migration for breaking changes
4. **Rollback Plan**: Always have a rollback plan for migrations

### Version Control

1. **Migration Files**: Version control all migration files
2. **Schema History**: Maintain schema change history
3. **Environment Consistency**: Ensure schema consistency across environments
4. **Testing**: Test migrations in staging before production

## Monitoring and Maintenance

### Performance Monitoring

1. **Query Performance**: Monitor slow queries
2. **Connection Pool**: Monitor connection pool usage
3. **Index Usage**: Monitor index effectiveness
4. **Cache Hit Rates**: Monitor Redis cache performance

### Maintenance Tasks

1. **Cleanup Jobs**: Regular cleanup of old games and sessions
2. **Index Maintenance**: Regular index maintenance and optimization
3. **Data Archiving**: Archive old game data
4. **Backup Strategy**: Regular database backups

## Troubleshooting

### Common Issues

1. **Connection Issues**: Check database connectivity and credentials
2. **Migration Errors**: Verify migration scripts and dependencies
3. **Performance Issues**: Check indexes and query optimization
4. **Data Consistency**: Verify foreign key constraints and relationships

### Debugging Tools

1. **Prisma Studio**: Use for database inspection and debugging
2. **Query Logs**: Enable query logging for performance analysis
3. **Redis CLI**: Use for cache debugging
4. **Database Logs**: Monitor database server logs

## Future Enhancements

### Planned Features

1. **Analytics**: Add analytics tables for game statistics
2. **Achievements**: Add achievement system with user progress
3. **Tournaments**: Add tournament support with brackets
4. **Multi-language**: Add internationalization support

### Scalability Considerations

1. **Sharding**: Consider database sharding for large scale
2. **Read Replicas**: Add read replicas for read-heavy workloads
3. **Caching Layers**: Implement additional caching layers
4. **CDN Integration**: Add CDN for static assets 