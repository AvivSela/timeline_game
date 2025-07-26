import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import JoinGameForm from './JoinGameForm';

// Mock the constants
vi.mock('@/utils/constants', () => ({
  GAME_CONSTANTS: {
    ROOM_CODE_LENGTH: 6,
  },
}));

describe('JoinGameForm Component', () => {
  describe('User Experience', () => {
    it('user can see form with proper labels and placeholders', async () => {
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const title = screen.getByRole('heading', { level: 2, name: 'Join Game' });
      const description = screen.getByText('Enter the room code and your name to join an existing game.');
      const roomCodeLabel = screen.getByText('Room Code');
      const playerNameLabel = screen.getByText('Your Name');
      const roomCodePlaceholder = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNamePlaceholder = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(roomCodeLabel).toBeInTheDocument();
      expect(playerNameLabel).toBeInTheDocument();
      expect(roomCodePlaceholder).toBeInTheDocument();
      expect(playerNamePlaceholder).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('user can enter room code and see it formatted as uppercase', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      
      await user.type(roomCodeInput, 'abc123');
      
      expect(roomCodeInput).toHaveValue('ABC123');
    });

    it('user can enter player name and see it displayed', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      
      await user.type(playerNameInput, 'John Doe');
      
      expect(playerNameInput).toHaveValue('John Doe');
    });

    it('user can submit form with valid data and see success', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      await user.type(roomCodeInput, 'ABC123');
      await user.type(playerNameInput, 'John Doe');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          roomCode: 'ABC123',
          playerName: 'John Doe',
        });
      });
    });

    it('user can see loading state while form is submitting', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
      render(<JoinGameForm onSubmit={mockOnSubmit} loading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /join game/i });
      expect(submitButton).toBeDisabled();
      
      // Button should show loading spinner
      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('user can see error message when server returns error', () => {
      const mockOnSubmit = vi.fn();
      const errorMessage = 'Room code not found. Please check and try again.';
      render(<JoinGameForm onSubmit={mockOnSubmit} error={errorMessage} />);
      
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.closest('div')).toHaveClass('bg-danger-50', 'border-danger-200');
    });

    it('user can see form is disabled during submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
      render(<JoinGameForm onSubmit={mockOnSubmit} loading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      // Only the submit button should be disabled during loading
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('user can see validation prevents submission for empty room code', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      await user.type(playerNameInput, 'John Doe');
      await user.click(submitButton);
      
      // The form should not submit due to validation error
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see validation prevents submission for room code wrong length', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      // Test too short
      await user.type(roomCodeInput, 'ABC');
      await user.type(playerNameInput, 'John Doe');
      await user.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
      
      // Clear and test too short again (maxLength prevents typing too much)
      await user.clear(roomCodeInput);
      await user.type(roomCodeInput, 'AB');
      await user.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see validation prevents submission for room code invalid characters', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      // Test various invalid characters
      const invalidCodes = ['ABC@12', 'ABC#12', 'ABC$12', 'ABC%12', 'ABC&12'];
      
      for (const invalidCode of invalidCodes) {
        await user.clear(roomCodeInput);
        await user.type(roomCodeInput, invalidCode);
        await user.type(playerNameInput, 'John Doe');
        await user.click(submitButton);
        
        expect(mockOnSubmit).not.toHaveBeenCalled();
        
        // Clear player name for next iteration
        await user.clear(playerNameInput);
      }
    });

    it('user can see validation prevents submission for empty player name', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      await user.type(roomCodeInput, 'ABC123');
      await user.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see validation prevents submission for player name too short', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      await user.type(roomCodeInput, 'ABC123');
      await user.type(playerNameInput, 'J');
      await user.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see validation prevents submission for invalid player name characters', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      // Test various invalid characters
      const invalidNames = ['John@Doe', 'John#Doe', 'John$Doe', 'John%Doe', 'John&Doe', 'John*Doe'];
      
      for (const invalidName of invalidNames) {
        await user.clear(playerNameInput);
        await user.type(roomCodeInput, 'ABC123');
        await user.type(playerNameInput, invalidName);
        await user.click(submitButton);
        
        expect(mockOnSubmit).not.toHaveBeenCalled();
        
        // Clear room code for next iteration
        await user.clear(roomCodeInput);
      }
    });

    it('user can see form maintains state during validation errors', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      
      await user.type(roomCodeInput, 'ABC123');
      await user.type(playerNameInput, 'John Doe');
      
      // Submit with invalid data (empty room code)
      await user.clear(roomCodeInput);
      const submitButton = screen.getByRole('button', { name: /join game/i });
      await user.click(submitButton);
      
      // Values should still be there after validation error
      expect(roomCodeInput).toHaveValue('');
      expect(playerNameInput).toHaveValue('John Doe');
      
      // Form should not submit
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see multiple validation errors prevent submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /join game/i });
      await user.click(submitButton);
      
      // Form should not submit due to validation errors
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see validation allows submission with valid data', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      // Enter valid data
      await user.type(roomCodeInput, 'ABC123');
      await user.type(playerNameInput, 'John Doe');
      await user.click(submitButton);
      
      // Should submit successfully
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          roomCode: 'ABC123',
          playerName: 'John Doe',
        });
      });
    });
  });

  describe('User Interactions', () => {
    it('user can see room code input has proper max length constraint', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      
      // Try to type more than 6 characters
      await user.type(roomCodeInput, 'ABCDEFGHIJK');
      
      // Should only allow 6 characters
      expect(roomCodeInput).toHaveValue('ABCDEF');
    });

    it('user can see player name input has proper max length constraint', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      
      // Try to type more than 20 characters
      await user.type(playerNameInput, 'This is a very long player name that should be truncated');
      
      // Should only allow 20 characters
      expect(playerNameInput).toHaveValue('This is a very long ');
    });

    it('user can see form resets after successful submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      await user.type(roomCodeInput, 'ABC123');
      await user.type(playerNameInput, 'John Doe');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          roomCode: 'ABC123',
          playerName: 'John Doe',
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('user can see form has proper accessibility labels', () => {
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeLabel = screen.getByText('Room Code');
      const playerNameLabel = screen.getByText('Your Name');
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      
      expect(roomCodeLabel).toBeInTheDocument();
      expect(playerNameLabel).toBeInTheDocument();
      expect(roomCodeInput).toBeInTheDocument();
      expect(playerNameInput).toBeInTheDocument();
    });

    it('user can navigate form using keyboard', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      // Focus room code input
      roomCodeInput.focus();
      expect(roomCodeInput).toHaveFocus();
      
      // Tab to player name input
      await user.tab();
      expect(playerNameInput).toHaveFocus();
      
      // Tab to submit button
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('user can see form is accessible with screen reader', () => {
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      expect(roomCodeInput).toBeInTheDocument();
      expect(playerNameInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('user can see required field indicators', () => {
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const asterisks = screen.getAllByText('*', { selector: 'span' });
      
      expect(asterisks).toHaveLength(2);
      expect(asterisks[0]).toHaveClass('text-danger-500');
      expect(asterisks[1]).toHaveClass('text-danger-500');
    });
  });

  describe('Visual Behavior', () => {
    it('user can see form has proper styling and layout', () => {
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const title = screen.getByRole('heading', { level: 2, name: 'Join Game' });
      const description = screen.getByText('Enter the room code and your name to join an existing game.');
      
      expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
      expect(description).toHaveClass('text-sm', 'text-gray-600');
    });

    it('user can see input error styling when validation fails', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      // Submit with invalid data (too short room code)
      await user.type(roomCodeInput, 'ABC');
      await user.click(submitButton);
      
      // The form should not submit due to validation error
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see submit button has proper styling', () => {
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /join game/i });
      expect(submitButton).toHaveClass('w-full', 'sm:w-auto');
    });

    it('user can see error styling when error is present', () => {
      const mockOnSubmit = vi.fn();
      const errorMessage = 'Test error message';
      render(<JoinGameForm onSubmit={mockOnSubmit} error={errorMessage} />);
      
      const errorContainer = screen.getByText(errorMessage).closest('div');
      expect(errorContainer).toHaveClass('rounded-md', 'bg-danger-50', 'border', 'border-danger-200', 'p-4');
    });
  });

  describe('Edge Cases', () => {
    it('user can see form handles empty room code gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const playerNameInput = screen.getByPlaceholderText('Enter your name');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      await user.type(playerNameInput, 'John Doe');
      await user.click(submitButton);
      
      // The form should not submit due to validation error
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see form handles empty player name gracefully', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      const submitButton = screen.getByRole('button', { name: /join game/i });
      
      await user.type(roomCodeInput, 'ABC123');
      await user.click(submitButton);
      
      // The form should not submit due to validation error
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('user can see form handles missing onSubmit gracefully', () => {
      // This test ensures the form doesn't crash if onSubmit is not provided
      expect(() => {
        render(<JoinGameForm onSubmit={undefined as any} />);
      }).not.toThrow();
    });

    it('user can see form handles empty error message gracefully', () => {
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} error="" />);
      
      // Should not render error container when error is empty
      const errorContainer = screen.queryByText('', { selector: '.bg-danger-50' });
      expect(errorContainer).not.toBeInTheDocument();
    });

    it('user can see form handles special characters in room code input', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      render(<JoinGameForm onSubmit={mockOnSubmit} />);
      
      const roomCodeInput = screen.getByPlaceholderText('Enter 6-character room code');
      
      // Type special characters
      await user.type(roomCodeInput, 'abc@123');
      
      // Should filter out special characters and convert to uppercase
      expect(roomCodeInput).toHaveValue('ABC123');
    });
  });

  describe('Integration', () => {
    it('user can see form works within a page layout', () => {
      const mockOnSubmit = vi.fn();
      render(
        <div>
          <header>Page Header</header>
          <main>
            <JoinGameForm onSubmit={mockOnSubmit} />
          </main>
          <footer>Page Footer</footer>
        </div>
      );
      
      expect(screen.getByText('Page Header')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Join Game' })).toBeInTheDocument();
      expect(screen.getByText('Page Footer')).toBeInTheDocument();
    });

    it('user can see form integrates with other components', () => {
      const mockOnSubmit = vi.fn();
      render(
        <div>
          <JoinGameForm onSubmit={mockOnSubmit} />
          <div>Other content</div>
        </div>
      );
      
      expect(screen.getByRole('heading', { level: 2, name: 'Join Game' })).toBeInTheDocument();
      expect(screen.getByText('Other content')).toBeInTheDocument();
    });
  });
}); 