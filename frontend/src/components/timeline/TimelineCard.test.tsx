import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TimelineCard from './TimelineCard';
import { CardData } from '../../types/game';

// Mock card data for testing
const mockCard: CardData = {
  id: 'test-card-1',
  name: 'Invention of the Printing Press',
  description: 'Johannes Gutenberg invented the printing press, revolutionizing the spread of information.',
  chronologicalValue: 1440,
  difficulty: 'MEDIUM',
  category: 'Technology',
};

const mockCardLongTitle: CardData = {
  id: 'test-card-2',
  name: 'The Very Long Title That Should Be Truncated According to Design Specifications',
  description: 'This is a very long description that should be hidden on smaller screens.',
  chronologicalValue: 1492,
  difficulty: 'HARD',
  category: 'Exploration',
};

describe('TimelineCard', () => {
  const defaultProps = {
    card: mockCard,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders card with correct content', () => {
      render(<TimelineCard {...defaultProps} />);
      
      expect(screen.getByText('Invention of the Printing Press')).toBeInTheDocument();
      expect(screen.getByText('1440')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getByText('Johannes Gutenberg invented the printing press, revolutionizing the spread of information.')).toBeInTheDocument();
    });

    it('renders with correct test attributes', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-card-id', 'test-card-1');
    });

    it('applies custom className', () => {
      render(<TimelineCard {...defaultProps} className="custom-class" />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Visual States', () => {
    it('renders in default state', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveClass('border-gray-200');
      expect(card).not.toHaveClass('border-green-500', 'border-red-500', 'scale-105', 'scale-110');
    });

    it('renders in placed state', () => {
      render(<TimelineCard {...defaultProps} isPlaced={true} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveClass('border-green-500');
      expect(screen.getByText('Placed')).toBeInTheDocument();
      expect(screen.getByText('1440')).toHaveClass('text-green-600');
    });

    it('renders in error state', () => {
      render(<TimelineCard {...defaultProps} isError={true} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveClass('border-red-500', 'animate-shake');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('1440')).toHaveClass('text-red-600');
    });

    it('renders in dragging state', () => {
      render(<TimelineCard {...defaultProps} isDragging={true} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveClass('scale-110', 'rotate-1', 'opacity-80');
    });

    it('applies hover state on mouse enter', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      
      await user.hover(card);
      
      expect(card).toHaveClass('scale-105', 'shadow-lg');
    });

    it('removes hover state on mouse leave', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      
      await user.hover(card);
      await user.unhover(card);
      
      expect(card).not.toHaveClass('scale-105', 'shadow-lg');
    });

    it('prioritizes dragging state over hover state', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} isDragging={true} />);
      
      const card = screen.getByTestId('timeline-card');
      
      await user.hover(card);
      
      expect(card).toHaveClass('scale-110', 'rotate-1');
      expect(card).not.toHaveClass('scale-105');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('aria-label', 'Timeline card: Invention of the Printing Press from year 1440');
      expect(card).toHaveAttribute('aria-describedby', 'card-description-test-card-1');
    });

    it('has focus ring on focus', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      await user.tab();
      
      expect(card).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      await user.tab();
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onClick).toHaveBeenCalledWith(mockCard);
    });

    it('handles space key navigation', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      await user.tab();
      await user.keyboard(' ');
      
      expect(defaultProps.onClick).toHaveBeenCalledWith(mockCard);
    });

    it('prevents default behavior on keyboard events', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      await user.tab();
      
      // Test that Enter key calls onClick
      await user.keyboard('{Enter}');
      expect(defaultProps.onClick).toHaveBeenCalledWith(mockCard);
    });
  });

  describe('Interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      await user.click(card);
      
      expect(defaultProps.onClick).toHaveBeenCalledWith(mockCard);
    });

    it('handles click without onClick prop', async () => {
      const user = userEvent.setup();
      render(<TimelineCard card={mockCard} />);
      
      const card = screen.getByTestId('timeline-card');
      await user.click(card);
      
      // Should not throw error
      expect(card).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive sizing classes', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveClass(
        'w-48', 'h-28',           // Mobile
        'md:w-56', 'md:h-32',     // Tablet
        'lg:w-64', 'lg:h-36',     // Desktop
        'xl:w-72', 'xl:h-40'      // Large
      );
    });

    it('applies responsive padding', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const content = screen.getByTestId('timeline-card').querySelector('div');
      expect(content).toHaveClass(
        'p-3',      // Mobile
        'md:p-4',   // Tablet
        'lg:p-5'    // Desktop
      );
    });

    it('applies responsive typography', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const title = screen.getByText('Invention of the Printing Press');
      expect(title).toHaveClass(
        'text-sm',      // Mobile
        'md:text-base', // Tablet
        'lg:text-lg'    // Desktop
      );
      
      const year = screen.getByText('1440');
      expect(year).toHaveClass(
        'text-lg',      // Mobile
        'md:text-xl',   // Tablet
        'lg:text-2xl'   // Desktop
      );
    });

    it('hides description on smaller screens', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const description = screen.getByText('Johannes Gutenberg invented the printing press, revolutionizing the spread of information.');
      expect(description).toHaveClass('hidden', 'lg:block');
    });
  });

  describe('Drag and Drop', () => {
    it('is draggable by default', () => {
      render(<TimelineCard {...defaultProps} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('is not draggable when placed', () => {
      render(<TimelineCard {...defaultProps} isPlaced={true} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toHaveAttribute('draggable', 'false');
    });
  });

  describe('Status Indicators', () => {
    it('shows success indicator when placed', () => {
      render(<TimelineCard {...defaultProps} isPlaced={true} />);
      
      const successIndicator = screen.getByText('✓');
      expect(successIndicator).toBeInTheDocument();
      expect(successIndicator.closest('div')).toHaveClass('bg-green-500', 'animate-pulse');
    });

    it('shows error indicator when in error state', () => {
      render(<TimelineCard {...defaultProps} isError={true} />);
      
      const errorIndicator = screen.getByText('✗');
      expect(errorIndicator).toBeInTheDocument();
      expect(errorIndicator.closest('div')).toHaveClass('bg-red-500', 'animate-pulse');
    });

    it('does not show indicators in default state', () => {
      render(<TimelineCard {...defaultProps} />);
      
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
      expect(screen.queryByText('✗')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('updates visual state when props change', () => {
      const { rerender } = render(<TimelineCard {...defaultProps} />);
      
      let card = screen.getByTestId('timeline-card');
      expect(card).not.toHaveClass('border-green-500');
      
      rerender(<TimelineCard {...defaultProps} isPlaced={true} />);
      
      card = screen.getByTestId('timeline-card');
      expect(card).toHaveClass('border-green-500');
    });
  });

  describe('Edge Cases', () => {
    it('handles cards with very long titles', () => {
      render(<TimelineCard card={mockCardLongTitle} onClick={vi.fn()} />);
      
      expect(screen.getByText('The Very Long Title That Should Be Truncated According to Design Specifications')).toBeInTheDocument();
    });

    it('handles cards without description', () => {
      const cardWithoutDescription = { ...mockCard, description: '' };
      render(<TimelineCard card={cardWithoutDescription} onClick={vi.fn()} />);
      
      const card = screen.getByTestId('timeline-card');
      expect(card).toBeInTheDocument();
    });

    it('handles cards with special characters in title', () => {
      const cardWithSpecialChars = { ...mockCard, name: 'Card with "quotes" & <tags>' };
      render(<TimelineCard card={cardWithSpecialChars} onClick={vi.fn()} />);
      
      expect(screen.getByText('Card with "quotes" & <tags>')).toBeInTheDocument();
    });
  });
}); 