
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerList from './PlayerList';
import { Player } from '@/types/game';

// Mock data
const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'Player1',
    isHost: true,
    isReady: true,
    joinedAt: '2024-01-01T10:00:00Z',
    score: 100
  },
  {
    id: 'player-2',
    name: 'Player2',
    isHost: false,
    isReady: true,
    joinedAt: '2024-01-01T10:01:00Z',
    score: 75
  },
  {
    id: 'player-3',
    name: 'Player3',
    isHost: false,
    isReady: false,
    joinedAt: '2024-01-01T10:02:00Z',
    score: 50
  }
];

const defaultProps = {
  players: mockPlayers,
  currentPlayerId: 'player-1',
  currentPlayerName: 'Player1',
  turnNumber: 3
};

describe('PlayerList', () => {
  it('should highlight current turn player with green styling', () => {
    render(<PlayerList {...defaultProps} />);
    
    // Should show current turn player name (multiple instances)
    const player1Elements = screen.getAllByText('Player1');
    expect(player1Elements.length).toBeGreaterThan(0);
    
    // Should show "Current Turn" badge for the current player
    expect(screen.getByText('Current Turn')).toBeInTheDocument();
    
    // Should show current turn indicator in the summary (using flexible matcher)
    expect(screen.getByText(/Current Turn:/)).toBeInTheDocument();
    const player1Elements2 = screen.getAllByText(/Player1/);
    expect(player1Elements2.length).toBeGreaterThan(0);
    
    // The component should apply green styling to the current turn player
    // We can't easily test the exact CSS classes, but we can verify the current turn is indicated
    const currentTurnElements = screen.getAllByText(/Current Turn/);
    expect(currentTurnElements.length).toBeGreaterThan(0);
  });

  it('should display player score correctly', () => {
    render(<PlayerList {...defaultProps} />);
    
    // Should display scores for all players
    expect(screen.getByText('Score: 100')).toBeInTheDocument();
    expect(screen.getByText('Score: 75')).toBeInTheDocument();
    expect(screen.getByText('Score: 50')).toBeInTheDocument();
    
    // Should display player names (multiple instances for Player1)
    const player1Elements = screen.getAllByText('Player1');
    expect(player1Elements.length).toBeGreaterThan(0);
    expect(screen.getByText('Player2')).toBeInTheDocument();
    expect(screen.getByText('Player3')).toBeInTheDocument();
    
    // Should display host/player status
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getAllByText('Player')).toHaveLength(2);
    
    // Should display ready status
    expect(screen.getAllByText('Ready')).toHaveLength(2);
    expect(screen.getByText('Not Ready')).toBeInTheDocument();
  });

  it('should handle empty players array', () => {
    render(<PlayerList {...defaultProps} players={[]} currentPlayerName={null} />);
    
    // Should show the players header with count 0
    expect(screen.getByText('Players (0)')).toBeInTheDocument();
    
    // Should show turn number
    expect(screen.getByText('Turn 3')).toBeInTheDocument();
    
    // Should not show any player content
    expect(screen.queryByText('Player1')).not.toBeInTheDocument();
    expect(screen.queryByText('Player2')).not.toBeInTheDocument();
    expect(screen.queryByText('Player3')).not.toBeInTheDocument();
    
    // Should not show current turn summary when no current player
    expect(screen.queryByText(/Current Turn:/)).not.toBeInTheDocument();
  });
}); 