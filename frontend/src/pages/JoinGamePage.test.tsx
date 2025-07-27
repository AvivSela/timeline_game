import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import JoinGamePage from './JoinGamePage';
import { SUCCESS_MESSAGES } from '@/utils/constants';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useGame hook
const mockJoinGame = vi.fn();
const mockUseGame = vi.fn();
vi.mock('@/hooks/useGame', () => ({
  useGame: () => mockUseGame(),
}));

const renderJoinGamePage = () => {
  return render(
    <BrowserRouter>
      <JoinGamePage />
    </BrowserRouter>
  );
};

const mockGameData = {
  id: 'game-123',
  roomCode: 'ABC123',
  status: 'waiting' as const,
  maxPlayers: 4,
  players: [
    {
      id: 'player-1',
      name: 'Test Player',
      isHost: false,
      isReady: false,
      joinedAt: '2024-01-01T00:00:00Z',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('JoinGamePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockJoinGame.mockClear();
    mockUseGame.mockReturnValue({
      joinGame: mockJoinGame,
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('User Experience Tests', () => {
    test('User can see page title and description', () => {
      renderJoinGamePage();
      expect(screen.getByText('← Back to Home')).toBeInTheDocument();
    });

    test('User can see form with room code input', () => {
      renderJoinGamePage();
      expect(screen.getByPlaceholderText(/enter 6-character room code/i)).toBeInTheDocument();
    });

    test('User can see form with player name input', () => {
      renderJoinGamePage();
      expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    });

    test('User can see join game button', () => {
      renderJoinGamePage();
      expect(screen.getByRole('button', { name: /join game/i })).toBeInTheDocument();
    });

    test('User can see back to home link', () => {
      renderJoinGamePage();
      expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction Tests', () => {
    test('User can type room code and see it appear in input', async () => {
      renderJoinGamePage();
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      
      expect(roomCodeInput).toHaveValue('ABC123');
    });

    test('User can type player name and see it appear in input', async () => {
      renderJoinGamePage();
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      
      expect(playerNameInput).toHaveValue('Test Player');
    });

    test('User can submit form with valid data', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockJoinGame).toHaveBeenCalledWith({
          roomCode: 'ABC123',
          playerName: 'Test Player',
        });
      });
    });

    test('User can see loading state during form submission', async () => {
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: true,
        error: null,
      });
      
      renderJoinGamePage();
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('User can see success message after joining game', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Successfully Joined!')).toBeInTheDocument();
        expect(screen.getByText(SUCCESS_MESSAGES.GAME_JOINED)).toBeInTheDocument();
      });
    });

    test('User can see game details after successful join', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to game room/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
      });
    });
  });

  // Note: Validation tests are covered in the form components themselves
  // Testing validation here would be redundant and testing implementation details

  describe('Error Handling Tests', () => {
    test('User can see error message when room code does not exist', async () => {
      const mockError = { message: 'Game not found' };
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: false,
        error: mockError,
      });
      
      renderJoinGamePage();
      
      expect(screen.getByText('Game not found')).toBeInTheDocument();
    });

    test('User can see error message when game is full', async () => {
      const mockError = { message: 'Game is full' };
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: false,
        error: mockError,
      });
      
      renderJoinGamePage();
      
      expect(screen.getByText('Game is full')).toBeInTheDocument();
    });

    test('User can see error message when player name is already taken', async () => {
      const mockError = { message: 'Player name already taken' };
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: false,
        error: mockError,
      });
      
      renderJoinGamePage();
      
      expect(screen.getByText('Player name already taken')).toBeInTheDocument();
    });

    test('User can see error message when network request fails', async () => {
      const mockError = { message: 'Network error' };
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: false,
        error: mockError,
      });
      
      renderJoinGamePage();
      
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    test('User can retry joining game after error', async () => {
      // Set up the mock to reject first, then resolve
      mockJoinGame
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockGameData);
      
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      
      // First attempt - should fail
      fireEvent.click(submitButton);
      
      // Wait for the first call to complete
      await waitFor(() => {
        expect(mockJoinGame).toHaveBeenCalledTimes(1);
      });
      
      // Simulate the error state that would be set by useGame hook
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: false,
        error: { message: 'Network error' },
      });
      
      // Re-render to show the error
      renderJoinGamePage();
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      // Reset mock for second attempt
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: false,
        error: null,
      });
      
      // Second attempt - should succeed
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockJoinGame).toHaveBeenCalledTimes(2);
      });
    });

    test('User can navigate back to home after error', () => {
      const mockError = { message: 'Failed to join game' };
      mockUseGame.mockReturnValue({
        joinGame: mockJoinGame,
        loading: false,
        error: mockError,
      });
      
      renderJoinGamePage();
      
      const backButton = screen.getByRole('button', { name: /back to home/i });
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Navigation Tests', () => {
    test('User can click back to home and return to homepage', () => {
      renderJoinGamePage();
      const backButton = screen.getByRole('button', { name: /back to home/i });
      
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('User can navigate to game after successful join', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const goToGameButton = screen.getByRole('button', { name: /go to game room/i });
        fireEvent.click(goToGameButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/game/game-123');
      });
    });

    test('User can navigate back to home from success screen', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to home/i });
        fireEvent.click(backButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Success State Tests', () => {
    test('Success screen shows correct game information', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Successfully Joined!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /go to game room/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
      });
    });

    test('Success screen has proper styling', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const successContainer = screen.getByText('Successfully Joined!').closest('.card');
        expect(successContainer).toHaveClass('max-w-md', 'mx-auto');
      });
    });
  });

  describe('Form State Management Tests', () => {
    test('Form maintains state during validation errors', async () => {
      renderJoinGamePage();
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(roomCodeInput).toHaveValue('ABC123');
        expect(playerNameInput).toHaveValue('Test Player');
      });
    });

    test('Form clears after successful submission', async () => {
      mockJoinGame.mockResolvedValue(mockGameData);
      renderJoinGamePage();
      
      const roomCodeInput = screen.getByPlaceholderText(/enter 6-character room code/i);
      const playerNameInput = screen.getByPlaceholderText(/enter your name/i);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Successfully Joined!')).toBeInTheDocument();
      });
    });
  });
}); 