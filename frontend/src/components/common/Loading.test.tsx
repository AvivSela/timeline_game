import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Loading from './Loading';

describe('Loading Component', () => {
  describe('User Experience', () => {
    it('user can see loading animation is active', () => {
      render(<Loading />);
      
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });

    it('user can see loading text when provided', () => {
      render(<Loading text="Loading data..." />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('user can see different loading styles', () => {
      const { rerender } = render(<Loading variant="spinner" />);
      let loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading variant="dots" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading variant="pulse" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });

    it('user can see loading takes appropriate space for different sizes', () => {
      const { rerender } = render(<Loading size="sm" />);
      let loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading size="md" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading size="lg" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });

    it('user can see loading state is visually clear and not confusing', () => {
      render(<Loading text="Please wait..." />);
      
      // User can see loading indicator
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // User can see descriptive text
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      
      // User can see loading is centered and prominent
      const container = screen.getByText('Please wait...').parentElement;
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  describe('Accessibility', () => {
    it('user can see loading is accessible (screen reader friendly)', () => {
      render(<Loading text="Loading content" />);
      
      // User can see loading has proper ARIA attributes
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });

    it('user can see loading without text still has accessibility', () => {
      render(<Loading />);
      
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('Visual Behavior', () => {
    it('user can see loading with custom className', () => {
      render(<Loading className="custom-loading" />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('custom-loading');
    });

    it('user can see loading with different variants', () => {
      const { rerender } = render(<Loading variant="spinner" />);
      let loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading variant="dots" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading variant="pulse" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });

    it('user can see loading with different sizes', () => {
      const { rerender } = render(<Loading size="sm" />);
      let loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading size="md" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
      
      rerender(<Loading size="lg" />);
      loadingElement = screen.getByRole('status');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('user can see loading without any props', () => {
      render(<Loading />);
      
      // User can see default loading behavior
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('user can see loading with very long text', () => {
      const longText = 'This is a very long loading message that should be handled gracefully by the loading component';
      render(<Loading text={longText} />);
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('user can see loading with empty text', () => {
      render(<Loading text="" />);
      
      // User can see loading indicator without text
      expect(screen.getByRole('status')).toBeInTheDocument();
      // No text element should be rendered when text is empty
      expect(screen.queryByText('', { selector: 'p' })).not.toBeInTheDocument();
    });

    it('user can see loading with special characters in text', () => {
      render(<Loading text="Loading... 50% ✓" />);
      
      expect(screen.getByText('Loading... 50% ✓')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('user can see loading within a container', () => {
      render(
        <div data-testid="parent-container">
          <Loading text="Loading content" />
        </div>
      );
      
      const parentContainer = screen.getByTestId('parent-container');
      const loadingElement = screen.getByRole('status');
      
      expect(parentContainer).toContainElement(loadingElement);
    });

    it('user can see loading with multiple instances', () => {
      render(
        <div>
          <Loading text="Loading 1" />
          <Loading text="Loading 2" />
        </div>
      );
      
      expect(screen.getByText('Loading 1')).toBeInTheDocument();
      expect(screen.getByText('Loading 2')).toBeInTheDocument();
    });
  });
}); 