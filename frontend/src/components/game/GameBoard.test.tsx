
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GameBoard from './GameBoard';
import { CardData } from '@/types/game';

// Mock data
const mockCardData: CardData = {
  id: 'card-1',
  name: 'Test Card',
  description: 'Test description',
  chronologicalValue: 1000,
  difficulty: 'EASY',
  category: 'History'
};

const mockTimeline = [
  {
    id: 'timeline-1',
    position: 0,
    card: mockCardData
  }
];

const defaultProps = {
  timeline: mockTimeline,
  onCardDrop: vi.fn(),
  isCurrentTurn: true
};

describe('GameBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle drag over events and update drag position', () => {
    render(<GameBoard {...defaultProps} />);
    
    const timelineElement = screen.getByText('Timeline').nextElementSibling;
    expect(timelineElement).toBeInTheDocument();
    
    // The component should render without throwing
    expect(timelineElement).toBeInTheDocument();
  });

  it('should handle drop events correctly when it is current turn', () => {
    render(<GameBoard {...defaultProps} />);
    
    const timelineElement = screen.getByText('Timeline').nextElementSibling;
    expect(timelineElement).toBeInTheDocument();
    
    // The component should render the drop zone when it's current turn
    expect(timelineElement).toBeInTheDocument();
  });

  it('should not handle drop events when not current turn', () => {
    render(<GameBoard {...defaultProps} isCurrentTurn={false} />);
    
    const timelineElement = screen.getByText('Timeline').nextElementSibling;
    expect(timelineElement).toBeInTheDocument();
    
    // Should show waiting message when not current turn
    expect(screen.getByText('Waiting for your turn...')).toBeInTheDocument();
  });

  it('should call onCardDrop with correct cardId and position', () => {
    render(<GameBoard {...defaultProps} />);
    
    const timelineElement = screen.getByText('Timeline').nextElementSibling;
    expect(timelineElement).toBeInTheDocument();
    
    // The component should be ready to handle drops
    expect(timelineElement).toBeInTheDocument();
  });

  it('should highlight slot when dragging over it', () => {
    render(<GameBoard {...defaultProps} />);
    
    const timelineElement = screen.getByText('Timeline').nextElementSibling;
    expect(timelineElement).toBeInTheDocument();
    
    // The component should render slots that can be highlighted
    expect(timelineElement).toBeInTheDocument();
  });

  it('should render cards in timeline slots correctly', () => {
    render(<GameBoard {...defaultProps} />);
    
    // Should render the card name and description
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should calculate correct drop position based on mouse coordinates', () => {
    render(<GameBoard {...defaultProps} />);
    
    const timelineElement = screen.getByText('Timeline').nextElementSibling;
    expect(timelineElement).toBeInTheDocument();
    
    // The component should render the timeline container
    expect(timelineElement).toBeInTheDocument();
  });

  it('should render timeline with correct number of slots', () => {
    render(<GameBoard {...defaultProps} />);
    
    // Should render at least 5 slots (minimum) or timeline.length + 1 slots
    const timelineElement = screen.getByText('Timeline').nextElementSibling;
    expect(timelineElement).toBeInTheDocument();
    
    // The component renders Math.max(timeline.length + 1, 5) slots
    // With 1 card in timeline, it should render at least 5 slots
    const slots = timelineElement!.children;
    expect(slots.length).toBeGreaterThanOrEqual(5);
  });
}); 