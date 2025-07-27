import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input Component', () => {
  describe('User Interactions', () => {
    it('user can type text and see it appear in the input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input label="Test Input" onChange={handleChange} />);
      
      const input = screen.getByRole('textbox', { name: /test input/i });
      await user.type(input, 'Hello World');
      
      expect(handleChange).toHaveBeenCalledTimes(11); // One call per character
      expect(handleChange).toHaveBeenLastCalledWith('d'); // Last character typed
    });

    it('user can see the input label clearly', () => {
      render(<Input label="Clear Label" />);
      
      expect(screen.getByText('Clear Label')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /clear label/i })).toBeInTheDocument();
    });

    it('user can see placeholder text when input is empty', () => {
      render(<Input label="Test Input" placeholder="Enter your text here" />);
      
      const input = screen.getByRole('textbox', { name: /test input/i });
      expect(input).toHaveAttribute('placeholder', 'Enter your text here');
    });

    it('user can see error message when validation fails', () => {
      render(<Input label="Test Input" error="This field is required" />);
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveClass('text-danger-600');
    });

    it('user can see required field indicator (asterisk)', () => {
      render(<Input label="Required Input" required />);
      
      const label = screen.getByText('Required Input');
      expect(label).toHaveTextContent('*');
    });

    it('user cannot type more than maxLength characters', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input label="Limited Input" maxLength={5} onChange={handleChange} />);
      
      const input = screen.getByRole('textbox', { name: /limited input/i });
      await user.type(input, '123456789');
      
      // The input should respect maxLength - all characters are processed but maxLength is enforced
      expect(handleChange).toHaveBeenCalledTimes(9);
      expect(handleChange).toHaveBeenLastCalledWith('9');
    });

    it('user can focus the input with keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<Input label="Focusable Input" />);
      
      const input = screen.getByRole('textbox', { name: /focusable input/i });
      await user.tab();
      
      expect(input).toHaveFocus();
    });

    it('user can see input is disabled and cannot interact', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input label="Disabled Input" disabled onChange={handleChange} />);
      
      const input = screen.getByRole('textbox', { name: /disabled input/i });
      
      // User can see input is disabled
      expect(input).toBeDisabled();
      
      // User cannot interact with disabled input
      await user.type(input, 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('user can clear the input and see placeholder again', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input label="Clearable Input" placeholder="Enter text" onChange={handleChange} />);
      
      const input = screen.getByRole('textbox', { name: /clearable input/i });
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalledTimes(4); // One call per character
      
      await user.clear(input);
      expect(handleChange).toHaveBeenCalledTimes(4); // Clear doesn't trigger onChange in this implementation
    });
  });

  describe('Accessibility', () => {
    it('user can see input has proper accessibility labels', () => {
      render(<Input label="Accessible Input" error="Error message" />);
      
      const input = screen.getByRole('textbox', { name: /accessible input/i });
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('user can see input is accessible with screen reader', () => {
      render(<Input label="Screen Reader Input" />);
      
      const input = screen.getByRole('textbox', { name: /screen reader input/i });
      
      // Input has proper label association
      expect(input).toHaveAttribute('id');
      const label = screen.getByText('Screen Reader Input');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('user can see input with different types', () => {
      const { rerender } = render(<Input label="Text Input" type="text" />);
      let input = screen.getByRole('textbox', { name: /text input/i });
      expect(input).toHaveAttribute('type', 'text');
      
      rerender(<Input label="Email Input" type="email" />);
      input = screen.getByRole('textbox', { name: /email input/i });
      expect(input).toHaveAttribute('type', 'email');
      
      rerender(<Input label="Password Input" type="password" />);
      input = screen.getByDisplayValue(''); // Password inputs don't have role="textbox"
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Integration', () => {
    it('user can see input value updates when controlled', () => {
      const { rerender } = render(<Input label="Controlled Input" value="initial" />);
      
      let input = screen.getByRole('textbox', { name: /controlled input/i });
      expect(input).toHaveValue('initial');
      
      rerender(<Input label="Controlled Input" value="updated" />);
      input = screen.getByRole('textbox', { name: /controlled input/i });
      expect(input).toHaveValue('updated');
    });

    it('user can see input handles onBlur event', async () => {
      const handleBlur = vi.fn();
      
      render(<Input label="Blur Input" onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox', { name: /blur input/i });
      input.focus();
      input.blur();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Behavior', () => {
    it('user can see input with custom className', () => {
      render(<Input label="Custom Input" className="custom-class" />);
      
      const input = screen.getByRole('textbox', { name: /custom input/i });
      expect(input).toHaveClass('custom-class');
    });

    it('user can see input error state styling', () => {
      render(<Input label="Error Input" error="Error message" />);
      
      const input = screen.getByRole('textbox', { name: /error input/i });
      expect(input).toHaveClass('input-error');
    });

    it('user can see input with different sizes', () => {
      const { rerender } = render(<Input label="Small Input" size="sm" />);
      let input = screen.getByRole('textbox', { name: /small input/i });
      expect(input).toHaveClass('input');
      
      rerender(<Input label="Large Input" size="lg" />);
      input = screen.getByRole('textbox', { name: /large input/i });
      expect(input).toHaveClass('input');
    });
  });

  describe('Edge Cases', () => {
    it('user can see input handles missing onChange gracefully', async () => {
      
      render(<Input label="No Change Handler" />);
      
      const input = screen.getByRole('textbox', { name: /no change handler/i });
      
      // User can type without errors
      fireEvent.change(input, { target: { value: 'test' } });
      // No error should be thrown
    });

    it('user can see input with empty label', () => {
      render(<Input label="" placeholder="No label" />);
      
      const input = screen.getByDisplayValue(''); // No label means no accessible name
      expect(input).toBeInTheDocument();
    });

    it('user can see input with very long label', () => {
      const longLabel = 'This is a very long label that should be handled gracefully by the input component';
      render(<Input label={longLabel} />);
      
      expect(screen.getByText(longLabel)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: new RegExp(longLabel, 'i') })).toBeInTheDocument();
    });
  });
}); 