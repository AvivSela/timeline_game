import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import CreateGamePage from '../pages/CreateGamePage';
import JoinGamePage from '../pages/JoinGamePage';
import GameRoom from '../pages/GameRoom';


// Mock the services
vi.mock('../services/gameService');
vi.mock('../services/api');

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('Critical Frontend Game Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Game Creation/Joining', () => {
    it('should render create game page', () => {
      render(
        <TestWrapper>
          <CreateGamePage />
        </TestWrapper>
      );

      // Test that the component renders basic elements
      expect(screen.getByText(/create game/i)).toBeInTheDocument();
    });

    it('should render join game page', () => {
      render(
        <TestWrapper>
          <JoinGamePage />
        </TestWrapper>
      );

      // Test that the component renders basic elements
      expect(screen.getByRole('heading', { name: /join game/i })).toBeInTheDocument();
    });

    it('should render home page', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      // Test that the component renders basic elements
      expect(screen.getByText(/timeline game/i)).toBeInTheDocument();
    });
  });

  describe('Game Room UI', () => {
    it('should render game room component', () => {
      render(
        <TestWrapper>
          <GameRoom />
        </TestWrapper>
      );

      // Test that the component renders basic elements (loading state)
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle component rendering errors gracefully', () => {
      // Test that components can render without crashing
      expect(() => {
        render(
          <TestWrapper>
            <HomePage />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('User Experience', () => {
    it('should provide basic user interface elements', () => {
      render(
        <TestWrapper>
          <CreateGamePage />
        </TestWrapper>
      );

      // Test that basic UI elements are present
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });
}); 