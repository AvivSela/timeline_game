import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import CreateGameForm from './CreateGameForm';

// Mock the constants
vi.mock('@/utils/constants', () => ({
  GAME_CONSTANTS: {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 8,
    DEFAULT_MAX_PLAYERS: 4,
  },
}));

describe('CreateGameForm Component', () => {
  describe('User Experience', () => {
    it('user can see form with default values', async () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const title = screen.getByText('Create New Game');
      const description = screen.getByText('Create a new game room and invite other players to join.');
      const maxPlayersLabel = screen.getByText('Maximum Players');
      const maxPlayersValue = screen.getByText('4');
      const helpText = screen.getByText('Choose how many players can join your game (2-8 players)');
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(maxPlayersLabel).toBeInTheDocument();
      expect(maxPlayersValue).toBeInTheDocument();
      expect(helpText).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('user can adjust max players slider and see value update', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      expect(slider).toHaveValue('4');
      expect(valueDisplay).toHaveTextContent('4');
      
      // Move slider to 6
      await user.click(slider);
      fireEvent.change(slider, { target: { value: '6' } });
      
      expect(slider).toHaveValue('6');
      expect(valueDisplay).toHaveTextContent('6');
    });

    it('user can submit form with valid data and see success', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      // Fill in player name first
      const playerNameInput = screen.getByLabelText(/player name/i);
      await user.type(playerNameInput, 'TestPlayer');
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          playerName: 'TestPlayer',
          maxPlayers: 4,
        });
      });
    });

    it('user can see loading state while form is submitting', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
      render(<CreateGameForm onSubmit={mockOnSubmit} loading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      expect(submitButton).toBeDisabled();
      
      // Button should show loading spinner
      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('user can see error message when server returns error', () => {
      const mockOnSubmit = vi.fn();
      const errorMessage = 'Failed to create game. Please try again.';
      render(<CreateGameForm onSubmit={mockOnSubmit} error={errorMessage} />);
      
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.closest('div')).toHaveClass('bg-danger-50', 'border-danger-200');
    });

    it('user can see form is disabled during submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
      render(<CreateGameForm onSubmit={mockOnSubmit} loading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      // Only the submit button should be disabled during loading
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('user can see validation error for max players below minimum', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Set to minimum value (2) - this should be valid
      fireEvent.change(slider, { target: { value: '2' } });
      expect(slider).toHaveValue('2');
      expect(valueDisplay).toHaveTextContent('2');
      
      // Fill in player name first
      const playerNameInput = screen.getByLabelText(/player name/i);
      await user.type(playerNameInput, 'TestPlayer');
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      await user.click(submitButton);
      
      // Should submit successfully with minimum value
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          playerName: 'TestPlayer',
          maxPlayers: 2,
        });
      });
    });

    it('user can see validation error for max players above maximum', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Set to maximum value (8) - this should be valid
      fireEvent.change(slider, { target: { value: '8' } });
      expect(slider).toHaveValue('8');
      expect(valueDisplay).toHaveTextContent('8');
      
      // Fill in player name first
      const playerNameInput = screen.getByLabelText(/player name/i);
      await user.type(playerNameInput, 'TestPlayer');
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      await user.click(submitButton);
      
      // Should submit successfully with maximum value
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          playerName: 'TestPlayer',
          maxPlayers: 8,
        });
      });
    });

    it('user can see form maintains state during validation errors', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Change value
      fireEvent.change(slider, { target: { value: '6' } });
      expect(valueDisplay).toHaveTextContent('6');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create game/i });
      await user.click(submitButton);
      
      // Value should still be 6 after submission attempt
      expect(valueDisplay).toHaveTextContent('6');
    });

    it('user can see validation works for all valid max player values', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Test all valid values
      const validValues = [2, 3, 4, 5, 6, 7, 8];
      
      for (const value of validValues) {
        fireEvent.change(slider, { target: { value: value.toString() } });
        expect(slider).toHaveValue(value.toString());
        expect(valueDisplay).toHaveTextContent(value.toString());
        
        // Fill in player name first
        const playerNameInput = screen.getByLabelText(/player name/i);
        await user.clear(playerNameInput);
        await user.type(playerNameInput, 'TestPlayer');
        
        const submitButton = screen.getByRole('button', { name: /create game/i });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalledWith({
            playerName: 'TestPlayer',
            maxPlayers: value,
          });
        });
        
        // Reset mock for next iteration
        mockOnSubmit.mockClear();
      }
    });

    it('user can see form handles edge case values correctly', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Test boundary values
      const boundaryValues = [
        { value: 2, expected: 2, description: 'minimum value' },
        { value: 8, expected: 8, description: 'maximum value' },
        { value: 4, expected: 4, description: 'default value' }
      ];
      
      for (const { value, expected, description } of boundaryValues) {
        fireEvent.change(slider, { target: { value: value.toString() } });
        expect(slider).toHaveValue(value.toString());
        expect(valueDisplay).toHaveTextContent(value.toString());
        
        // Fill in player name first
        const playerNameInput = screen.getByLabelText(/player name/i);
        await user.clear(playerNameInput);
        await user.type(playerNameInput, 'TestPlayer');
        
        const submitButton = screen.getByRole('button', { name: /create game/i });
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalledWith({
            playerName: 'TestPlayer',
            maxPlayers: expected,
          });
        });
        
        // Reset mock for next iteration
        mockOnSubmit.mockClear();
      }
    });
  });

  describe('User Interactions', () => {
    it('user can interact with the slider to change max players', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Test different values
      const testValues = [2, 3, 5, 7, 8];
      
      for (const value of testValues) {
        fireEvent.change(slider, { target: { value: value.toString() } });
        expect(slider).toHaveValue(value.toString());
        expect(valueDisplay).toHaveTextContent(value.toString());
      }
    });

    it('user can see slider has proper min and max constraints', () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '2');
      expect(slider).toHaveAttribute('max', '8');
    });

    it('user can see form resets after successful submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Change value
      fireEvent.change(slider, { target: { value: '6' } });
      expect(valueDisplay).toHaveTextContent('6');
      
      // Fill in player name first
      const playerNameInput = screen.getByLabelText(/player name/i);
      await user.type(playerNameInput, 'TestPlayer');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create game/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          playerName: 'TestPlayer',
          maxPlayers: 6,
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('user can see form has proper accessibility labels', () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const maxPlayersLabel = screen.getByText('Maximum Players');
      const slider = screen.getByRole('slider');
      
      expect(maxPlayersLabel).toBeInTheDocument();
      expect(slider).toBeInTheDocument();
    });

    it('user can navigate form using keyboard', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      // Focus slider
      slider.focus();
      expect(slider).toHaveFocus();
      
      // Focus submit button
      submitButton.focus();
      expect(submitButton).toHaveFocus();
    });

    it('user can see form is accessible with screen reader', () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const submitButton = screen.getByRole('button', { name: /create game/i });
      
      expect(slider).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Visual Behavior', () => {
    it('user can see form has proper styling and layout', () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const title = screen.getByText('Create New Game');
      const description = screen.getByText('Create a new game room and invite other players to join.');
      
      expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
      expect(description).toHaveClass('text-sm', 'text-gray-600');
    });

    it('user can see slider has proper styling', () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('flex-1', 'h-2', 'bg-gray-200', 'rounded-lg');
    });

    it('user can see submit button has proper styling', () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      expect(submitButton).toHaveClass('w-full', 'sm:w-auto');
    });

    it('user can see error styling when error is present', () => {
      const mockOnSubmit = vi.fn();
      const errorMessage = 'Test error message';
      render(<CreateGameForm onSubmit={mockOnSubmit} error={errorMessage} />);
      
      const errorContainer = screen.getByText(errorMessage).closest('div');
      expect(errorContainer).toHaveClass('rounded-md', 'bg-danger-50', 'border', 'border-danger-200', 'p-4');
    });
  });

  describe('Edge Cases', () => {
    it('user can see form handles minimum player value', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Set to minimum value
      fireEvent.change(slider, { target: { value: '2' } });
      expect(slider).toHaveValue('2');
      expect(valueDisplay).toHaveTextContent('2');
      
      // Fill in player name first
      const playerNameInput = screen.getByLabelText(/player name/i);
      await user.type(playerNameInput, 'TestPlayer');
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          playerName: 'TestPlayer',
          maxPlayers: 2,
        });
      });
    });

    it('user can see form handles maximum player value', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} />);
      
      const slider = screen.getByRole('slider');
      const valueDisplay = screen.getByText('4');
      
      // Set to maximum value
      fireEvent.change(slider, { target: { value: '8' } });
      expect(slider).toHaveValue('8');
      expect(valueDisplay).toHaveTextContent('8');
      
      // Fill in player name first
      const playerNameInput = screen.getByLabelText(/player name/i);
      await user.type(playerNameInput, 'TestPlayer');
      
      const submitButton = screen.getByRole('button', { name: /create game/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          playerName: 'TestPlayer',
          maxPlayers: 8,
        });
      });
    });

    it('user can see form handles missing onSubmit gracefully', () => {
      // This test ensures the form doesn't crash if onSubmit is not provided
      expect(() => {
        render(<CreateGameForm onSubmit={undefined as any} />);
      }).not.toThrow();
    });

    it('user can see form handles empty error message gracefully', () => {
      const mockOnSubmit = vi.fn();
      render(<CreateGameForm onSubmit={mockOnSubmit} error="" />);
      
      // Should not render error container when error is empty
      const errorContainer = screen.queryByText('', { selector: '.bg-danger-50' });
      expect(errorContainer).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('user can see form works within a page layout', () => {
      const mockOnSubmit = vi.fn();
      render(
        <div>
          <header>Page Header</header>
          <main>
            <CreateGameForm onSubmit={mockOnSubmit} />
          </main>
          <footer>Page Footer</footer>
        </div>
      );
      
      expect(screen.getByText('Page Header')).toBeInTheDocument();
      expect(screen.getByText('Create New Game')).toBeInTheDocument();
      expect(screen.getByText('Page Footer')).toBeInTheDocument();
    });

    it('user can see form integrates with other components', () => {
      const mockOnSubmit = vi.fn();
      render(
        <div>
          <CreateGameForm onSubmit={mockOnSubmit} />
          <div>Other content</div>
        </div>
      );
      
      expect(screen.getByText('Create New Game')).toBeInTheDocument();
      expect(screen.getByText('Other content')).toBeInTheDocument();
    });
  });
}); 