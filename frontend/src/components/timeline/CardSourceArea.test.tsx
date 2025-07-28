import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CardSourceArea from './CardSourceArea';
import { CardData } from '../../types/game';

// Mock card data for testing
const mockCards: CardData[] = [
  {
    id: 'card-1',
    name: 'Invention of the Printing Press',
    description: 'Johannes Gutenberg invented the printing press.',
    chronologicalValue: 1440,
    difficulty: 'MEDIUM',
    category: 'Technology',
  },
  {
    id: 'card-2',
    name: 'Discovery of America',
    description: 'Christopher Columbus reached the Americas.',
    chronologicalValue: 1492,
    difficulty: 'HARD',
    category: 'Exploration',
  },
  {
    id: 'card-3',
    name: 'First Moon Landing',
    description: 'Neil Armstrong walked on the moon.',
    chronologicalValue: 1969,
    difficulty: 'EASY',
    category: 'Space',
  },
];

describe('CardSourceArea', () => {
  const defaultProps = {
    cards: mockCards,
    onCardDragStart: vi.fn(),
    onCardDragEnd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with correct test attributes', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const container = screen.getByTestId('card-source-area');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('role', 'region');
      expect(container).toHaveAttribute('aria-label', 'Available cards for timeline');
    });

    it('renders header with card count', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      expect(screen.getByText('Available Cards')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders all cards in grid', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      expect(screen.getByText('Invention of the Printing Press')).toBeInTheDocument();
      expect(screen.getByText('Discovery of America')).toBeInTheDocument();
      expect(screen.getByText('First Moon Landing')).toBeInTheDocument();
      
      // Check that each card has a test ID
      expect(screen.getByTestId('source-card-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('source-card-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('source-card-card-3')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardSourceArea {...defaultProps} className="custom-class" />);
      
      const container = screen.getByTestId('card-source-area');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no cards', () => {
      render(<CardSourceArea cards={[]} />);
      
      expect(screen.getByText('No Cards Available')).toBeInTheDocument();
      expect(screen.getByText('Cards will appear here when the game starts.')).toBeInTheDocument();
      expect(screen.queryByText('Available Cards')).not.toBeInTheDocument();
    });

    it('shows correct empty state styling', () => {
      render(<CardSourceArea cards={[]} />);
      
      const container = screen.getByTestId('card-source-area');
      expect(container).toHaveClass('bg-gray-50', 'border-dashed', 'border-gray-300');
    });
  });

  describe('Grid Layout', () => {
    it('applies responsive grid classes', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const grid = screen.getByTestId('card-source-area').querySelector('div:last-child');
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-2',      // Mobile
        'sm:grid-cols-3',   // Small
        'md:grid-cols-4',   // Medium
        'lg:grid-cols-5',   // Large
        'xl:grid-cols-6'    // Extra large
      );
    });

    it('applies gap and auto-rows classes', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const grid = screen.getByTestId('card-source-area').querySelector('div:last-child');
      expect(grid).toHaveClass('gap-4', 'auto-rows-fr');
    });
  });

  describe('Drag and Drop', () => {
    it('calls onCardDragStart when card drag starts', async () => {
      const user = userEvent.setup();
      render(<CardSourceArea {...defaultProps} />);
      
      const firstCard = screen.getByTestId('source-card-card-1').querySelector('[data-testid="timeline-card"]');
      expect(firstCard).toBeInTheDocument();
      
      if (firstCard) {
        fireEvent.dragStart(firstCard);
        
        expect(defaultProps.onCardDragStart).toHaveBeenCalledWith(
          mockCards[0],
          expect.any(Object)
        );
      }
    });

    it('calls onCardDragEnd when card drag ends', async () => {
      const user = userEvent.setup();
      render(<CardSourceArea {...defaultProps} />);
      
      const firstCard = screen.getByTestId('source-card-card-1').querySelector('[data-testid="timeline-card"]');
      expect(firstCard).toBeInTheDocument();
      
      if (firstCard) {
        fireEvent.dragEnd(firstCard);
        
        expect(defaultProps.onCardDragEnd).toHaveBeenCalledWith(
          mockCards[0],
          expect.any(Object)
        );
      }
    });

    it('updates drag state during drag operations', async () => {
      const user = userEvent.setup();
      render(<CardSourceArea {...defaultProps} />);
      
      const container = screen.getByTestId('card-source-area');
      const firstCard = screen.getByTestId('source-card-card-1').querySelector('[data-testid="timeline-card"]');
      
      // Initially not dragging
      expect(container).not.toHaveClass('border-blue-400', 'bg-blue-50');
      
      if (firstCard) {
        fireEvent.dragStart(firstCard);
        
        // Should show dragging state
        expect(container).toHaveClass('border-blue-400', 'bg-blue-50');
      }
    });
  });

  describe('Card Interaction', () => {
    it('handles card click', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<CardSourceArea {...defaultProps} />);
      
      const firstCard = screen.getByTestId('source-card-card-1').querySelector('[data-testid="timeline-card"]');
      expect(firstCard).toBeInTheDocument();
      
      if (firstCard) {
        await user.click(firstCard);
        
        expect(consoleSpy).toHaveBeenCalledWith('Card clicked:', mockCards[0].name);
      }
      
      consoleSpy.mockRestore();
    });

    it('applies hover effects to cards', async () => {
      const user = userEvent.setup();
      render(<CardSourceArea {...defaultProps} />);
      
      const cardContainer = screen.getByTestId('source-card-card-1');
      expect(cardContainer).toHaveClass('hover:scale-105');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive container styling', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const container = screen.getByTestId('card-source-area');
      expect(container).toHaveClass(
        'bg-gray-50',
        'border-2',
        'border-dashed',
        'border-gray-300',
        'rounded-lg',
        'p-6'
      );
    });

    it('applies responsive card styling', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const firstCard = screen.getByTestId('source-card-card-1').querySelector('[data-testid="timeline-card"]');
      expect(firstCard).toHaveClass(
        'w-full',
        'max-w-xs',
        'cursor-grab',
        'active:cursor-grabbing'
      );
    });
  });

  describe('State Management', () => {
    it('resets drag state when cards change', () => {
      const { rerender } = render(<CardSourceArea {...defaultProps} />);
      
      const container = screen.getByTestId('card-source-area');
      
      // Simulate drag start
      const firstCard = screen.getByTestId('source-card-card-1').querySelector('[data-testid="timeline-card"]');
      if (firstCard) {
        fireEvent.dragStart(firstCard);
        expect(container).toHaveClass('border-blue-400', 'bg-blue-50');
      }
      
      // Change cards
      const newCards = [mockCards[0]];
      rerender(<CardSourceArea cards={newCards} onCardDragStart={vi.fn()} onCardDragEnd={vi.fn()} />);
      
      // Should reset drag state
      const newContainer = screen.getByTestId('card-source-area');
      expect(newContainer).not.toHaveClass('border-blue-400', 'bg-blue-50');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const container = screen.getByTestId('card-source-area');
      expect(container).toHaveAttribute('role', 'region');
      expect(container).toHaveAttribute('aria-label', 'Available cards for timeline');
    });

    it('has accessible header structure', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const header = screen.getByText('Available Cards');
      expect(header).toBeInTheDocument();
      
      const counter = screen.getByText('3');
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveClass('bg-blue-500', 'text-white', 'rounded-full');
    });
  });

  describe('Visual Feedback', () => {
    it('shows drag feedback overlay when dragging', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      const firstCard = screen.getByTestId('source-card-card-1').querySelector('[data-testid="timeline-card"]');
      if (firstCard) {
        fireEvent.dragStart(firstCard);
        
        // Should show drag feedback
        expect(screen.getByText(/Dragging:/)).toBeInTheDocument();
      }
    });

    it('hides drag feedback when not dragging', () => {
      render(<CardSourceArea {...defaultProps} />);
      
      expect(screen.queryByText(/Dragging:/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single card', () => {
      render(<CardSourceArea cards={[mockCards[0]]} onCardDragStart={vi.fn()} onCardDragEnd={vi.fn()} />);
      
      expect(screen.getByText('Available Cards')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Invention of the Printing Press')).toBeInTheDocument();
    });

    it('handles many cards', () => {
      const manyCards = Array.from({ length: 10 }, (_, i) => ({
        ...mockCards[0],
        id: `card-${i}`,
        name: `Card ${i}`,
        chronologicalValue: 1000 + i,
      }));
      
      render(<CardSourceArea cards={manyCards} onCardDragStart={vi.fn()} onCardDragEnd={vi.fn()} />);
      
      expect(screen.getByText('Available Cards')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('handles cards with special characters', () => {
      const specialCard = {
        ...mockCards[0],
        name: 'Card with "quotes" & <tags>',
        description: 'Description with "quotes" & <tags>',
      };
      
      render(<CardSourceArea cards={[specialCard]} onCardDragStart={vi.fn()} onCardDragEnd={vi.fn()} />);
      
      expect(screen.getByText('Card with "quotes" & <tags>')).toBeInTheDocument();
      expect(screen.getByText('Description with "quotes" & <tags>')).toBeInTheDocument();
    });
  });
}); 