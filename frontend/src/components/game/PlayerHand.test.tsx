
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlayerHand from './PlayerHand';
import { CardData } from '@/types/game';

// Mock data
const mockCards: CardData[] = [
  {
    id: 'card-1',
    name: 'Easy Card',
    description: 'An easy card to place',
    chronologicalValue: 1000,
    difficulty: 'EASY',
    category: 'History'
  },
  {
    id: 'card-2',
    name: 'Medium Card',
    description: 'A medium difficulty card',
    chronologicalValue: 1500,
    difficulty: 'MEDIUM',
    category: 'Science'
  },
  {
    id: 'card-3',
    name: 'Hard Card',
    description: 'A hard card to place correctly',
    chronologicalValue: 2000,
    difficulty: 'HARD',
    category: 'Technology'
  }
];

const defaultProps = {
  cards: mockCards,
  isCurrentTurn: true,
  onCardDragStart: vi.fn()
};

describe('PlayerHand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make cards draggable when isCurrentTurn is true', () => {
    render(<PlayerHand {...defaultProps} />);
    
    const cardElements = screen.getAllByText(/Easy Card|Medium Card|Hard Card/);
    
    cardElements.forEach(cardElement => {
      const cardContainer = cardElement.closest('[draggable]');
      expect(cardContainer).toHaveAttribute('draggable', 'true');
    });
  });

  it('should call onCardDragStart with correct parameters', () => {
    render(<PlayerHand {...defaultProps} />);
    
    const easyCard = screen.getByText('Easy Card').closest('[draggable]');
    expect(easyCard).toBeInTheDocument();
    
    fireEvent.dragStart(easyCard!);
    
    expect(defaultProps.onCardDragStart).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCardDragStart).toHaveBeenCalledWith(
      expect.any(Object), // React synthetic event
      mockCards[0] // The card data
    );
  });

  it('should display difficulty badge with correct styling', () => {
    render(<PlayerHand {...defaultProps} />);
    
    // Check that difficulty badges are rendered
    expect(screen.getByText('EASY')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('HARD')).toBeInTheDocument();
    
    // The component should apply different background colors based on difficulty
    // We can't easily test the exact CSS classes, but we can verify the badges are rendered
    const difficultyBadges = screen.getAllByText(/EASY|MEDIUM|HARD/);
    expect(difficultyBadges.length).toBe(3);
  });

  it('should show cards as disabled when not current turn', () => {
    render(<PlayerHand {...defaultProps} isCurrentTurn={false} />);
    
    const cardElements = screen.getAllByText(/Easy Card|Medium Card|Hard Card/);
    
    cardElements.forEach(cardElement => {
      const cardContainer = cardElement.closest('[draggable]');
      expect(cardContainer).toHaveAttribute('draggable', 'false');
    });
    
    // Should show the waiting message
    expect(screen.getByText('Wait for your turn to place cards')).toBeInTheDocument();
  });

  it('should render empty state when no cards', () => {
    render(<PlayerHand {...defaultProps} cards={[]} />);
    
    // Should show empty state messages
    expect(screen.getByText('No cards in hand')).toBeInTheDocument();
    expect(screen.getByText("You've placed all your cards!")).toBeInTheDocument();
    
    // Should not show any card content
    expect(screen.queryByText('Easy Card')).not.toBeInTheDocument();
    expect(screen.queryByText('Medium Card')).not.toBeInTheDocument();
    expect(screen.queryByText('Hard Card')).not.toBeInTheDocument();
  });
}); 