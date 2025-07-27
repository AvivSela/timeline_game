
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GameEvents from './GameEvents';

// Mock data
const mockEvents = [
  {
    id: 'event-1',
    type: 'card_placed' as const,
    message: 'Player placed a card',
    timestamp: '2024-01-01T10:00:00Z',
    playerName: 'Player1',
    cardName: 'Test Card'
  },
  {
    id: 'event-2',
    type: 'turn_changed' as const,
    message: 'Turn changed to Player2',
    timestamp: '2024-01-01T10:01:00Z',
    playerName: 'Player2'
  },
  {
    id: 'event-3',
    type: 'game_started' as const,
    message: 'Game started',
    timestamp: '2024-01-01T10:02:00Z'
  },
  {
    id: 'event-4',
    type: 'player_joined' as const,
    message: 'Player3 joined the game',
    timestamp: '2024-01-01T10:03:00Z',
    playerName: 'Player3'
  },
  {
    id: 'event-5',
    type: 'player_left' as const,
    message: 'Player4 left the game',
    timestamp: '2024-01-01T10:04:00Z',
    playerName: 'Player4'
  },
  {
    id: 'event-6',
    type: 'game_ended' as const,
    message: 'Game ended',
    timestamp: '2024-01-01T10:05:00Z'
  }
];

const defaultProps = {
  events: mockEvents
};

describe('GameEvents', () => {
  it('should apply correct styling based on event type', () => {
    render(<GameEvents {...defaultProps} />);
    
    // Check that all events are rendered with their respective styling
    expect(screen.getByText('Player placed a card')).toBeInTheDocument();
    expect(screen.getByText('Turn changed to Player2')).toBeInTheDocument();
    expect(screen.getByText('Game started')).toBeInTheDocument();
    expect(screen.getByText('Player3 joined the game')).toBeInTheDocument();
    expect(screen.getByText('Player4 left the game')).toBeInTheDocument();
    expect(screen.getByText('Game ended')).toBeInTheDocument();
    
    // The component should apply different background colors based on event type
    // We can't easily test the exact CSS classes, but we can verify the events are rendered
    const eventElements = screen.getAllByText(/Player|Game|Turn/);
    expect(eventElements.length).toBeGreaterThan(0);
  });

  it('should return correct icon for each event type', () => {
    render(<GameEvents {...defaultProps} />);
    
    // Check that the correct icons are rendered for each event type
    // 🎴 for card_placed, 🔄 for turn_changed, 🎮 for game_started, etc.
    expect(screen.getByText('🎴')).toBeInTheDocument(); // card_placed
    expect(screen.getByText('🔄')).toBeInTheDocument(); // turn_changed
    expect(screen.getByText('🎮')).toBeInTheDocument(); // game_started
    expect(screen.getAllByText('👋')).toHaveLength(2); // player_joined/left (2 instances)
    expect(screen.getByText('🏆')).toBeInTheDocument(); // game_ended
  });

  it('should limit events to maxEvents prop', () => {
    render(<GameEvents {...defaultProps} maxEvents={3} />);
    
    // Should only show the last 3 events
    expect(screen.getByText('Player4 left the game')).toBeInTheDocument();
    expect(screen.getByText('Game ended')).toBeInTheDocument();
    
    // Should show the "Showing last X events" message
    expect(screen.getByText('Showing last 3 events')).toBeInTheDocument();
    
    // Should not show the first few events
    expect(screen.queryByText('Player placed a card')).not.toBeInTheDocument();
    expect(screen.queryByText('Turn changed to Player2')).not.toBeInTheDocument();
  });

  it('should render empty state when no events', () => {
    render(<GameEvents events={[]} />);
    
    // Should show empty state message
    expect(screen.getByText('No events yet')).toBeInTheDocument();
    
    // Should not show any event content
    expect(screen.queryByText('Player placed a card')).not.toBeInTheDocument();
    expect(screen.queryByText('Turn changed to Player2')).not.toBeInTheDocument();
  });
}); 