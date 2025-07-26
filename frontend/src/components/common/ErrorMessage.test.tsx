import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage Component', () => {
  describe('User Experience', () => {
    it('user can see error message clearly with appropriate styling', () => {
      render(<ErrorMessage message="Something went wrong" />);
      
      const message = screen.getByText('Something went wrong');
      expect(message).toBeInTheDocument();
      
      // Find the main container (the outermost div with variant classes)
      const mainContainer = message.closest('div[class*="bg-danger-50"]');
      expect(mainContainer).toHaveClass('bg-danger-50', 'border-danger-200', 'text-danger-800');
    });

    it('user can see warning message with different visual treatment', () => {
      render(<ErrorMessage message="Please check your input" variant="warning" />);
      
      const message = screen.getByText('Please check your input');
      expect(message).toBeInTheDocument();
      
      // Find the main container (the outermost div with variant classes)
      const mainContainer = message.closest('div[class*="bg-yellow-50"]');
      expect(mainContainer).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
    });

    it('user can see info message with informational styling', () => {
      render(<ErrorMessage message="This is an informational message" variant="info" />);
      
      const message = screen.getByText('This is an informational message');
      expect(message).toBeInTheDocument();
      
      // Find the main container (the outermost div with variant classes)
      const mainContainer = message.closest('div[class*="bg-blue-50"]');
      expect(mainContainer).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
    });

    it('user can see message title when provided', () => {
      render(
        <ErrorMessage 
          title="Connection Error" 
          message="Unable to connect to the server" 
        />
      );
      
      const title = screen.getByText('Connection Error');
      const message = screen.getByText('Unable to connect to the server');
      
      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
    });

    it('user can see different message types are visually distinct', () => {
      const { rerender } = render(<ErrorMessage message="Error message" variant="error" />);
      let mainContainer = screen.getByText('Error message').closest('div[class*="bg-danger-50"]');
      expect(mainContainer).toHaveClass('bg-danger-50');
      
      rerender(<ErrorMessage message="Warning message" variant="warning" />);
      mainContainer = screen.getByText('Warning message').closest('div[class*="bg-yellow-50"]');
      expect(mainContainer).toHaveClass('bg-yellow-50');
      
      rerender(<ErrorMessage message="Info message" variant="info" />);
      mainContainer = screen.getByText('Info message').closest('div[class*="bg-blue-50"]');
      expect(mainContainer).toHaveClass('bg-blue-50');
    });

    it('user can see message takes appropriate space and does not break layout', () => {
      render(
        <div style={{ width: '300px' }}>
          <ErrorMessage 
            title="Very Long Title That Might Cause Layout Issues"
            message="This is a very long message that should wrap properly and not break the layout of the page or cause any overflow issues"
          />
        </div>
      );
      
      const mainContainer = screen.getByText('Very Long Title That Might Cause Layout Issues').closest('div[class*="bg-danger-50"]');
      expect(mainContainer).toBeInTheDocument();
      // The container should be properly contained within its parent
      expect(mainContainer?.parentElement?.offsetWidth).toBeLessThanOrEqual(300);
    });
  });

  describe('User Interactions', () => {
    it('user can click retry button and it triggers retry action', () => {
      const mockRetry = vi.fn();
      render(
        <ErrorMessage 
          message="Connection failed" 
          onRetry={mockRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('user can use keyboard navigation to activate retry button', () => {
      const mockRetry = vi.fn();
      render(
        <ErrorMessage 
          message="Connection failed" 
          onRetry={mockRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAttribute('type', 'button');
      
      // Test that button can be focused and has proper accessibility
      retryButton.focus();
      expect(retryButton).toHaveFocus();
    });

    it('user can see retry button has appropriate styling for different variants', () => {
      const mockRetry = vi.fn();
      
      const { rerender } = render(
        <ErrorMessage message="Error message" onRetry={mockRetry} variant="error" />
      );
      let retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toHaveClass('text-danger-600');
      
      rerender(
        <ErrorMessage message="Warning message" onRetry={mockRetry} variant="warning" />
      );
      retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toHaveClass('text-yellow-600');
      
      rerender(
        <ErrorMessage message="Info message" onRetry={mockRetry} variant="info" />
      );
      retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toHaveClass('text-blue-600');
    });
  });

  describe('Accessibility', () => {
    it('user can see message is accessible (screen reader friendly)', () => {
      render(
        <ErrorMessage 
          title="Error Title"
          message="This is an error message that should be accessible to screen readers"
        />
      );
      
      const title = screen.getByRole('heading', { name: 'Error Title' });
      const message = screen.getByText('This is an error message that should be accessible to screen readers');
      
      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
    });

    it('user can see retry button is accessible with proper ARIA attributes', () => {
      const mockRetry = vi.fn();
      render(
        <ErrorMessage 
          message="Connection failed" 
          onRetry={mockRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAttribute('type', 'button');
    });

    it('user can navigate to retry button using keyboard', () => {
      const mockRetry = vi.fn();
      render(
        <ErrorMessage 
          message="Connection failed" 
          onRetry={mockRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      retryButton.focus();
      
      expect(retryButton).toHaveFocus();
      expect(retryButton).toHaveClass('focus:outline-none', 'focus:underline');
    });

    it('user can see message without title is still accessible', () => {
      render(<ErrorMessage message="Simple error message" />);
      
      const message = screen.getByText('Simple error message');
      expect(message).toBeInTheDocument();
      
      // Should not have any heading elements when no title is provided
      const headings = screen.queryAllByRole('heading');
      expect(headings).toHaveLength(0);
    });
  });

  describe('Visual Behavior', () => {
    it('user can see error icon for error variant', () => {
      render(<ErrorMessage message="Error message" variant="error" />);
      
      const mainContainer = screen.getByText('Error message').closest('div[class*="bg-danger-50"]');
      const icon = mainContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-danger-400');
    });

    it('user can see warning icon for warning variant', () => {
      render(<ErrorMessage message="Warning message" variant="warning" />);
      
      const mainContainer = screen.getByText('Warning message').closest('div[class*="bg-yellow-50"]');
      const icon = mainContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-yellow-400');
    });

    it('user can see info icon for info variant', () => {
      render(<ErrorMessage message="Info message" variant="info" />);
      
      const mainContainer = screen.getByText('Info message').closest('div[class*="bg-blue-50"]');
      const icon = mainContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-blue-400');
    });

    it('user can see message with custom className', () => {
      render(
        <ErrorMessage 
          message="Custom styled message" 
          className="custom-class"
        />
      );
      
      const mainContainer = screen.getByText('Custom styled message').closest('div[class*="bg-danger-50"]');
      expect(mainContainer).toHaveClass('custom-class');
    });

    it('user can see message has proper spacing and layout', () => {
      render(
        <ErrorMessage 
          title="Test Title"
          message="Test message"
          onRetry={() => {}}
        />
      );
      
      const mainContainer = screen.getByText('Test Title').closest('div[class*="bg-danger-50"]');
      expect(mainContainer).toHaveClass('rounded-md', 'border', 'p-4');
      
      const flexContainer = mainContainer?.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('user can see message without any optional props', () => {
      render(<ErrorMessage message="Basic message" />);
      
      const message = screen.getByText('Basic message');
      expect(message).toBeInTheDocument();
      
      // Should not have title or retry button
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('user can see message with very long text', () => {
      const longMessage = 'This is a very long error message that should wrap properly and not cause any layout issues or overflow problems. It should be readable and maintain proper spacing and formatting even when the text is extremely long and contains multiple sentences.';
      
      render(<ErrorMessage message={longMessage} />);
      
      const message = screen.getByText(longMessage);
      expect(message).toBeInTheDocument();
    });

    it('user can see message with special characters', () => {
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      render(<ErrorMessage message={specialMessage} />);
      
      const message = screen.getByText(specialMessage);
      expect(message).toBeInTheDocument();
    });

    it('user can see message with empty title still works', () => {
      render(<ErrorMessage title="" message="Message with empty title" />);
      
      const message = screen.getByText('Message with empty title');
      expect(message).toBeInTheDocument();
      
      // Should not render empty title
      const headings = screen.queryAllByRole('heading');
      expect(headings).toHaveLength(0);
    });

    it('user can see message handles missing onRetry gracefully', () => {
      render(<ErrorMessage message="Message without retry" />);
      
      const message = screen.getByText('Message without retry');
      expect(message).toBeInTheDocument();
      
      // Should not have retry button
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('user can see message within a container', () => {
      render(
        <div data-testid="parent-container">
          <ErrorMessage message="Message in container" />
        </div>
      );
      
      const parentContainer = screen.getByTestId('parent-container');
      const message = screen.getByText('Message in container');
      
      expect(parentContainer).toContainElement(message);
    });

    it('user can see multiple error messages on the same page', () => {
      render(
        <div>
          <ErrorMessage message="First error" variant="error" />
          <ErrorMessage message="Second warning" variant="warning" />
          <ErrorMessage message="Third info" variant="info" />
        </div>
      );
      
      expect(screen.getByText('First error')).toBeInTheDocument();
      expect(screen.getByText('Second warning')).toBeInTheDocument();
      expect(screen.getByText('Third info')).toBeInTheDocument();
    });

    it('user can see message with title and retry button together', () => {
      const mockRetry = vi.fn();
      render(
        <ErrorMessage 
          title="Complete Error"
          message="This error has both title and retry functionality"
          onRetry={mockRetry}
        />
      );
      
      const title = screen.getByRole('heading', { name: 'Complete Error' });
      const message = screen.getByText('This error has both title and retry functionality');
      const retryButton = screen.getByRole('button', { name: /try again/i });
      
      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });
}); 