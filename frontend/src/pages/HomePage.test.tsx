
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import HomePage from './HomePage';
import { APP_NAME } from '@/utils/constants';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('User Experience Tests', () => {
    test('User can see welcome message with app name', () => {
      renderHomePage();
      expect(screen.getByText(`Welcome to ${APP_NAME}`)).toBeInTheDocument();
    });

    test('User can see game description and instructions', () => {
      renderHomePage();
      expect(screen.getByText(/Challenge your knowledge of history/)).toBeInTheDocument();
      expect(screen.getByText(/Arrange historical events in chronological order/)).toBeInTheDocument();
    });

    test('User can see "How to Play" section with step-by-step instructions', () => {
      renderHomePage();
      expect(screen.getByText('How to Play')).toBeInTheDocument();
      expect(screen.getByText('Create or join a game room')).toBeInTheDocument();
      expect(screen.getByText('Wait for all players to join')).toBeInTheDocument();
      expect(screen.getByText('Arrange historical events in order')).toBeInTheDocument();
    });

    test('User can see both "Create New Game" and "Join Game" cards', () => {
      renderHomePage();
      expect(screen.getByText('Create New Game')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join game/i })).toBeInTheDocument();
    });

    test('User can see proper visual hierarchy and layout', () => {
      renderHomePage();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(`Welcome to ${APP_NAME}`);
      
      const cardHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(cardHeadings).toHaveLength(2);
      expect(cardHeadings[0]).toHaveTextContent('Create New Game');
      expect(cardHeadings[1]).toHaveTextContent('Join Game');
    });
  });

  describe('Navigation Tests', () => {
    test('User can click "Create Game" button and navigate to create game page', () => {
      renderHomePage();
      const createGameButton = screen.getByRole('button', { name: /create game/i });
      
      fireEvent.click(createGameButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/create-game');
    });

    test('User can click "Join Game" button and navigate to join game page', () => {
      renderHomePage();
      const joinGameButton = screen.getByRole('button', { name: /join game/i });
      
      fireEvent.click(joinGameButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/join-game');
    });

    test('Navigation buttons have proper styling and hover states', () => {
      renderHomePage();
      const createGameButton = screen.getByRole('button', { name: /create game/i });
      const joinGameButton = screen.getByRole('button', { name: /join game/i });
      
      expect(createGameButton).toHaveClass('w-full');
      expect(joinGameButton).toHaveClass('w-full');
    });
  });

  describe('Accessibility Tests', () => {
    test('User can navigate using keyboard (Tab, Enter, Space)', () => {
      renderHomePage();
      const createGameButton = screen.getByRole('button', { name: /create game/i });
      const joinGameButton = screen.getByRole('button', { name: /join game/i });
      
      // Tab navigation
      createGameButton.focus();
      expect(createGameButton).toHaveFocus();
      
      // Click events (simulating keyboard navigation)
      fireEvent.click(createGameButton);
      expect(mockNavigate).toHaveBeenCalledWith('/create-game');
      
      fireEvent.click(joinGameButton);
      expect(mockNavigate).toHaveBeenCalledWith('/join-game');
    });

    test('Screen reader can read all content and navigation elements', () => {
      renderHomePage();
      
      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      
      // Check for button accessibility
      expect(screen.getByRole('button', { name: /create game/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join game/i })).toBeInTheDocument();
    });

    test('Proper heading hierarchy is maintained', () => {
      renderHomePage();
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });
      
      expect(h1).toBeInTheDocument();
      expect(h2s).toHaveLength(2);
      expect(h3).toBeInTheDocument();
    });

    test('All interactive elements have accessible names', () => {
      renderHomePage();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Responsive Design Tests', () => {
    test('Page displays correctly on desktop screens', () => {
      renderHomePage();
      
      // Check for grid layout classes
      const gridContainer = screen.getByText('Create New Game').closest('.grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });

    test('Page displays correctly on tablet screens', () => {
      renderHomePage();
      
      // Check for responsive container
      const container = screen.getByText('Create New Game').closest('[class*="max-w-2xl"]');
      expect(container).toBeInTheDocument();
    });

    test('Page displays correctly on mobile screens', () => {
      renderHomePage();
      
      // Check for responsive text sizing
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl');
    });

    test('Cards stack properly on smaller screens', () => {
      renderHomePage();
      
      const gridContainer = screen.getByText('Create New Game').closest('.grid');
      expect(gridContainer).toHaveClass('grid', 'md:grid-cols-2');
    });
  });

  describe('Content Structure Tests', () => {
    test('Game description is properly formatted', () => {
      renderHomePage();
      
      const description = screen.getByText(/Challenge your knowledge of history/);
      expect(description).toHaveClass('text-xl', 'text-gray-600');
    });

    test('Card descriptions are informative', () => {
      renderHomePage();
      
      expect(screen.getByText(/Start a new game room and invite friends/)).toBeInTheDocument();
      expect(screen.getByText(/Join an existing game using a room code/)).toBeInTheDocument();
    });

    test('Step-by-step instructions are numbered correctly', () => {
      renderHomePage();
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
}); 