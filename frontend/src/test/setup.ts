import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock environment variables
vi.mock('@/utils/constants', () => ({
  APP_NAME: 'Timeline Game',
  API_ENDPOINTS: {
    GAMES: '/games',
    JOIN_GAME: '/games/join',
  },
  GAME_CONSTANTS: {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 8,
    DEFAULT_MAX_PLAYERS: 4,
    ROOM_CODE_LENGTH: 6,
  },
  VALIDATION_MESSAGES: {
    REQUIRED: 'This field is required',
    MIN_LENGTH: (min: number) => `Must be at least ${min} characters long`,
    MAX_LENGTH: (max: number) => `Must be less than ${max} characters long`,
    INVALID_FORMAT: 'Invalid format',
  },
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    GAME_NOT_FOUND: 'Game not found. Please check the room code.',
    GAME_FULL: 'Game is full. Please try another game.',
    PLAYER_NAME_TAKEN: 'Player name is already taken in this game.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
  },
  SUCCESS_MESSAGES: {
    GAME_CREATED: 'Game created successfully!',
    GAME_JOINED: 'Successfully joined the game!',
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Routes: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Route: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => 
    React.createElement('a', { href: to }, children),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
}); 