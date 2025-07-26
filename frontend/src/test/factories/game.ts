import { Game, Player, CreateGameRequest, CreateGameResponse, JoinGameRequest, JoinGameResponse } from '@/types/game';

// Game factory with realistic game states
export const createMockGame = (overrides: Partial<Game> = {}): Game => ({
  id: 'game-123',
  roomCode: 'TEST123',
  maxPlayers: 4,
  status: 'waiting',
  players: [],
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  ...overrides,
});

export const createMockGameWithPlayers = (playerCount: number = 2): Game => ({
  ...createMockGame(),
  players: createMockPlayers(playerCount),
  status: playerCount >= 2 ? 'playing' : 'waiting',
});

export const createMockFullGame = (): Game => ({
  ...createMockGame(),
  players: createMockPlayers(8),
  maxPlayers: 8,
  status: 'playing',
});

// Player factory with realistic player data
export const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'player-123',
  name: 'TestPlayer',
  isHost: false,
  isReady: false,
  joinedAt: '2024-01-01T10:00:00Z',
  ...overrides,
});

export const createMockHost = (): Player => ({
  ...createMockPlayer(),
  isHost: true,
  name: 'GameHost',
});

export const createMockPlayers = (count: number): Player[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockPlayer({
      id: `player-${index + 1}`,
      name: `Player${index + 1}`,
      isHost: index === 0,
    })
  );
};

// API request/response factories
export const createMockCreateGameRequest = (overrides: Partial<CreateGameRequest> = {}): CreateGameRequest => ({
  maxPlayers: 4,
  ...overrides,
});

export const createMockCreateGameResponse = (overrides: Partial<CreateGameResponse> = {}): CreateGameResponse => ({
  game: createMockGame(),
  roomCode: 'TEST123',
  gameId: 'game-123',
  ...overrides,
});

export const createMockJoinGameRequest = (overrides: Partial<JoinGameRequest> = {}): JoinGameRequest => ({
  roomCode: 'TEST123',
  playerName: 'TestPlayer',
  ...overrides,
});

export const createMockJoinGameResponse = (overrides: Partial<JoinGameResponse> = {}): JoinGameResponse => ({
  game: createMockGame(),
  player: createMockPlayer(),
  ...overrides,
});

// Error scenario factories
export const createMockGameNotFoundError = () => ({
  error: 'Game not found',
  message: 'The game with room code TEST123 was not found.',
  statusCode: 404,
});

export const createMockGameFullError = () => ({
  error: 'Game is full',
  message: 'The game is already full and cannot accept more players.',
  statusCode: 400,
});

export const createMockPlayerNameTakenError = () => ({
  error: 'Player name taken',
  message: 'A player with this name already exists in the game.',
  statusCode: 400,
});

export const createMockNetworkError = () => ({
  error: 'Network error',
  message: 'Failed to connect to the server. Please check your internet connection.',
  statusCode: 0,
});

export const createMockServerError = () => ({
  error: 'Server error',
  message: 'An unexpected error occurred on the server.',
  statusCode: 500,
}); 