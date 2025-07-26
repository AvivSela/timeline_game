export const APP_NAME = 'Timeline Game';

export const API_ENDPOINTS = {
  GAMES: '/games',
  JOIN_GAME: '/games/join',
} as const;

export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  DEFAULT_MAX_PLAYERS: 4,
  ROOM_CODE_LENGTH: 6,
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters long`,
  MAX_LENGTH: (max: number) => `Must be less than ${max} characters long`,
  INVALID_FORMAT: 'Invalid format',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  GAME_NOT_FOUND: 'Game not found. Please check the room code.',
  GAME_FULL: 'Game is full. Please try another game.',
  PLAYER_NAME_TAKEN: 'Player name is already taken in this game.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

export const SUCCESS_MESSAGES = {
  GAME_CREATED: 'Game created successfully!',
  GAME_JOINED: 'Successfully joined the game!',
} as const; 