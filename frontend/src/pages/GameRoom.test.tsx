
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import GameRoom from './GameRoom';

// Mock the gameService
vi.mock('@/services/gameService', () => ({
  gameService: {
    getGame: vi.fn(),
    startGame: vi.fn(),
    getPlayerHand: vi.fn(),
    getTimeline: vi.fn(),
    getTurnInfo: vi.fn(),
    placeCard: vi.fn(),
  },
}));

// Mock the game components
vi.mock('@/components/game/GameBoard', () => ({
  default: ({ isCurrentTurn }: { isCurrentTurn: boolean }) => (
    <div data-testid="game-board">
      Game Board {isCurrentTurn ? '(Current Turn)' : '(Not Current Turn)'}
    </div>
  ),
}));

vi.mock('@/components/game/PlayerHand', () => ({
  default: ({ cards, isCurrentTurn }: { cards: any[]; isCurrentTurn: boolean }) => (
    <div data-testid="player-hand">
      Player Hand ({cards.length} cards) {isCurrentTurn ? '(Current Turn)' : '(Not Current Turn)'}
    </div>
  ),
}));

vi.mock('@/components/game/PlayerList', () => ({
  default: ({ players, currentPlayerName }: { players: any[]; currentPlayerName: string | null }) => (
    <div data-testid="player-list">
      Player List ({players.length} players) {currentPlayerName ? `- Current: ${currentPlayerName}` : ''}
    </div>
  ),
}));

vi.mock('@/components/game/GameEvents', () => ({
  default: ({ events }: { events: any[] }) => (
    <div data-testid="game-events">
      Game Events ({events.length} events)
    </div>
  ),
}));

const renderGameRoom = () => {
  return render(
    <BrowserRouter>
      <GameRoom />
    </BrowserRouter>
  );
};

describe('GameRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderGameRoom();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // Note: More comprehensive tests would require proper mocking of the game service
  // and handling of async operations. For now, we just test the basic loading state.
}); 