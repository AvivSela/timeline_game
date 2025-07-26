import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  describe('User Interactions', () => {
    it('user can click the button and it triggers the expected action', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('user can see the button is disabled and cannot interact with it', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
      
      const button = screen.getByRole('button', { name: /disabled button/i });
      
      // User can see button is disabled
      expect(button).toBeDisabled();
      
      // User cannot interact with disabled button
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('user can use keyboard navigation (Enter/Space) to activate button', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button', { name: /keyboard button/i });
      button.focus();
      
      // User can activate with Enter key
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Reset for next test
      handleClick.mockClear();
      
      // User can activate with Space key
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('user can see loading state when button is processing', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button', { name: /loading button/i });
      
      // User can see button is disabled during loading
      expect(button).toBeDisabled();
      
      // User can see loading indicator
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Visual Behavior', () => {
    it('user can see different visual styles for different button types', () => {
      const { rerender } = render(<Button variant="primary">Primary Button</Button>);
      let button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toHaveClass('btn-primary');
      
      rerender(<Button variant="secondary">Secondary Button</Button>);
      button = screen.getByRole('button', { name: /secondary button/i });
      expect(button).toHaveClass('btn-secondary');
      
      rerender(<Button variant="danger">Danger Button</Button>);
      button = screen.getByRole('button', { name: /danger button/i });
      expect(button).toHaveClass('btn-danger');
      
      rerender(<Button variant="outline">Outline Button</Button>);
      button = screen.getByRole('button', { name: /outline button/i });
      expect(button).toHaveClass('btn-outline');
    });

    it('user can see the button text/content clearly', () => {
      render(<Button>Clear Text Button</Button>);
      
      const button = screen.getByRole('button', { name: /clear text button/i });
      expect(button).toHaveTextContent('Clear Text Button');
    });

    it('user can see different button sizes', () => {
      const { rerender } = render(<Button size="sm">Small Button</Button>);
      let button = screen.getByRole('button', { name: /small button/i });
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-xs');
      
      rerender(<Button size="md">Medium Button</Button>);
      button = screen.getByRole('button', { name: /medium button/i });
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
      
      rerender(<Button size="lg">Large Button</Button>);
      button = screen.getByRole('button', { name: /large button/i });
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });
  });

  describe('Accessibility', () => {
    it('user can see button has proper accessibility attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('user can see button responds to focus states', async () => {
      const user = userEvent.setup();
      
      render(<Button>Focusable Button</Button>);
      
      const button = screen.getByRole('button', { name: /focusable button/i });
      
      // User can focus the button
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('user can see button is accessible with screen reader', () => {
      render(<Button>Accessible Button</Button>);
      
      const button = screen.getByRole('button', { name: /accessible button/i });
      
      // Button is focusable (native button elements are focusable by default)
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('user can see button handles missing onClick gracefully', async () => {
      const user = userEvent.setup();
      
      render(<Button>No Click Handler</Button>);
      
      const button = screen.getByRole('button', { name: /no click handler/i });
      
      // User can click without errors
      await user.click(button);
      // No error should be thrown
    });

    it('user can see button with custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      
      const button = screen.getByRole('button', { name: /custom button/i });
      expect(button).toHaveClass('custom-class');
    });

    it('user can see button with children elements', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Icon');
      expect(button).toHaveTextContent('Text');
    });
  });
}); 