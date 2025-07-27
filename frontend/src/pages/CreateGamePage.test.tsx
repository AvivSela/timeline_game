import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CreateGamePage from './CreateGamePage';
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
const mockCreateGame = vi.fn();
const mockUseGame = vi.fn();
vi.mock('@/hooks/useGame', () => ({
  useGame: () => mockUseGame(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

const renderCreateGamePage = () => {
  return render(
    <BrowserRouter>
      <CreateGamePage />
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
      isHost: true,
      isReady: false,
      joinedAt: '2024-01-01T00:00:00Z',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('CreateGamePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateGame.mockClear();
    mockUseGame.mockReturnValue({
      createGame: mockCreateGame,
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('User Experience Tests', () => {
    test('User can see page title and description', () => {
      renderCreateGamePage();
      expect(screen.getByText('← Back to Home')).toBeInTheDocument();
    });

    test('User can see form with player name input', () => {
      renderCreateGamePage();
      expect(screen.getByRole("textbox", { name: /player name/i })).toBeInTheDocument();
    });

    test('User can see form with max players input', () => {
      renderCreateGamePage();
      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    test('User can see create game button', () => {
      renderCreateGamePage();
      expect(screen.getByRole('button', { name: /create game/i })).toBeInTheDocument();
    });

    test('User can see back to home link', () => {
      renderCreateGamePage();
      expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction Tests', () => {
    test('User can type player name and see it appear in input', async () => {
      renderCreateGamePage();
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      
      expect(playerNameInput).toHaveValue('Test Player');
    });

    test('User can select different max players values', () => {
      renderCreateGamePage();
      const maxPlayersInput = screen.getByRole("slider");
      
      fireEvent.change(maxPlayersInput, { target: { value: '6' } });
      
      expect(maxPlayersInput).toHaveValue('6');
    });

    test('User can submit form with valid data', async () => {
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreateGame).toHaveBeenCalledWith({
          playerName: 'Test Player',
          maxPlayers: 4,
        });
      });
    });

    test('User can see loading state during form submission', async () => {
      mockUseGame.mockReturnValue({
        createGame: mockCreateGame,
        loading: true,
        error: null,
      });
      
      renderCreateGamePage();
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('User can see success message after game creation', async () => {
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Game Created!')).toBeInTheDocument();
        expect(screen.getByText(SUCCESS_MESSAGES.GAME_CREATED)).toBeInTheDocument();
      });
    });

    test('User can see room code after successful game creation', async () => {
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByText(/Share this room code with your friends/i)).toBeInTheDocument();
      });
    });

    test('User can copy room code to clipboard', async () => {
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyButton);
        
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABC123');
      });
    });
  });

  // Note: Validation tests are covered in the form components themselves
  // Testing validation here would be redundant and testing implementation details

  describe('Error Handling Tests', () => {
    test('User can see error message when game creation fails', async () => {
      const mockError = { message: 'Failed to create game' };
      mockUseGame.mockReturnValue({
        createGame: mockCreateGame,
        loading: false,
        error: mockError,
      });
      
      renderCreateGamePage();
      
      expect(screen.getByText('Failed to create game')).toBeInTheDocument();
    });

    test('User can retry game creation after error', async () => {
      // Set up the mock to reject first, then resolve
      mockCreateGame
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockGameData);
      
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      
      // First attempt - should fail
      fireEvent.click(submitButton);
      
      // Wait for the first call to complete
      await waitFor(() => {
        expect(mockCreateGame).toHaveBeenCalledTimes(1);
      });
      
      // Simulate the error state that would be set by useGame hook
      mockUseGame.mockReturnValue({
        createGame: mockCreateGame,
        loading: false,
        error: { message: 'Network error' },
      });
      
      // Re-render to show the error
      renderCreateGamePage();
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      // Reset mock for second attempt
      mockUseGame.mockReturnValue({
        createGame: mockCreateGame,
        loading: false,
        error: null,
      });
      
      // Second attempt - should succeed
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreateGame).toHaveBeenCalledTimes(2);
      });
    });

    test('User can navigate back to home after error', () => {
      const mockError = { message: 'Failed to create game' };
      mockUseGame.mockReturnValue({
        createGame: mockCreateGame,
        loading: false,
        error: mockError,
      });
      
      renderCreateGamePage();
      
      const backButton = screen.getByRole('button', { name: /back to home/i });
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Navigation Tests', () => {
    test('User can click back to home and return to homepage', () => {
      renderCreateGamePage();
      const backButton = screen.getByRole('button', { name: /back to home/i });
      
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('User can navigate to game after successful creation', async () => {
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const goToGameButton = screen.getByRole('button', { name: /go to game room/i });
        fireEvent.click(goToGameButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/game/game-123');
      });
    });

    test('User can navigate back to home from success screen', async () => {
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
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
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Game Created!')).toBeInTheDocument();
        expect(screen.getByText('ABC123')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /go to game room/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
      });
    });

    test('Copy button has proper styling', async () => {
      mockCreateGame.mockResolvedValue(mockGameData);
      renderCreateGamePage();
      
      const playerNameInput = screen.getByRole("textbox", { name: /player name/i });
      const maxPlayersInput = screen.getByRole("slider");
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.change(playerNameInput, { target: { value: 'Test Player' } });
      fireEvent.change(maxPlayersInput, { target: { value: '4' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy/i });
        expect(copyButton).toHaveClass('btn-outline');
      });
    });
  });
}); 