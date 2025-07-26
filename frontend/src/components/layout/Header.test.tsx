import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header Component', () => {
  describe('User Experience', () => {
    it('user can see page title clearly at the top', () => {
      render(<Header title="Game Dashboard" />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Game Dashboard');
    });

    it('user can see subtitle when provided', () => {
      render(
        <Header 
          title="Game Dashboard" 
          subtitle="Manage your timeline games"
        />
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      const subtitle = screen.getByText('Manage your timeline games');
      
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500');
    });

    it('user can see header is properly positioned', () => {
      render(<Header title="Game Dashboard" />);
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');
    });

    it('user can see header content is readable', () => {
      render(
        <Header 
          title="Timeline Educational Game" 
          subtitle="Learn history through interactive gameplay"
        />
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      const subtitle = screen.getByText('Learn history through interactive gameplay');
      
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500');
    });

    it('user can see header adapts to different screen sizes', () => {
      render(<Header title="Responsive Header" />);
      
      const header = screen.getByRole('banner');
      const container = header.querySelector('.max-w-7xl');
      
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('user can see header provides clear page context', () => {
      render(
        <Header 
          title="Create New Game" 
          subtitle="Set up a new timeline game for your students"
        />
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      const subtitle = screen.getByText('Set up a new timeline game for your students');
      
      expect(title).toHaveTextContent('Create New Game');
      expect(subtitle).toHaveTextContent('Set up a new timeline game for your students');
    });
  });

  describe('Visual Behavior', () => {
    it('user can see header with default title', () => {
      render(<Header />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Timeline Game');
    });

    it('user can see header with custom title', () => {
      render(<Header title="Custom Title" />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Custom Title');
    });

    it('user can see header without subtitle', () => {
      render(<Header title="Simple Header" />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      
      // Should not have subtitle
      const subtitle = screen.queryByText('subtitle');
      expect(subtitle).not.toBeInTheDocument();
    });

    it('user can see header with custom className', () => {
      render(
        <Header 
          title="Custom Header" 
          className="custom-header-class"
        />
      );
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('custom-header-class');
    });

    it('user can see header combines default and custom classes', () => {
      render(
        <Header 
          title="Combined Header" 
          className="custom-class"
        />
      );
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200', 'custom-class');
    });

    it('user can see header has proper layout structure', () => {
      render(<Header title="Layout Test" />);
      
      const header = screen.getByRole('banner');
      const container = header.querySelector('.max-w-7xl');
      const flexContainer = container?.querySelector('.flex');
      
      expect(container).toBeInTheDocument();
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass('justify-between', 'items-center');
    });
  });

  describe('Accessibility', () => {
    it('user can see header is accessible with proper semantic structure', () => {
      render(<Header title="Accessible Header" />);
      
      const header = screen.getByRole('banner');
      const title = screen.getByRole('heading', { level: 1 });
      
      expect(header).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Accessible Header');
    });

    it('user can see header title is properly structured', () => {
      render(<Header title="Main Page Title" />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H1');
    });

    it('user can see header provides clear navigation context', () => {
      render(
        <Header 
          title="Game Lobby" 
          subtitle="Join or create a new game"
        />
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      const subtitle = screen.getByText('Join or create a new game');
      
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });

    it('user can see header is screen reader friendly', () => {
      render(<Header title="Screen Reader Test" />);
      
      const header = screen.getByRole('banner');
      const title = screen.getByRole('heading', { level: 1 });
      
      expect(header).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Screen Reader Test');
    });
  });

  describe('Responsive Design', () => {
    it('user can see header adapts to small screens', () => {
      render(<Header title="Small Screen Header" />);
      
      const header = screen.getByRole('banner');
      const container = header.querySelector('.max-w-7xl');
      
      expect(container).toHaveClass('px-4');
    });

    it('user can see header adapts to medium screens', () => {
      render(<Header title="Medium Screen Header" />);
      
      const header = screen.getByRole('banner');
      const container = header.querySelector('.max-w-7xl');
      
      expect(container).toHaveClass('sm:px-6');
    });

    it('user can see header adapts to large screens', () => {
      render(<Header title="Large Screen Header" />);
      
      const header = screen.getByRole('banner');
      const container = header.querySelector('.max-w-7xl');
      
      expect(container).toHaveClass('lg:px-8');
    });

    it('user can see header maintains proper spacing across screen sizes', () => {
      render(<Header title="Responsive Spacing" />);
      
      const header = screen.getByRole('banner');
      const flexContainer = header.querySelector('.flex');
      
      expect(flexContainer).toHaveClass('py-4');
    });
  });

  describe('Edge Cases', () => {
    it('user can see header handles empty title gracefully', () => {
      render(<Header title="" />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('');
    });

    it('user can see header handles very long title', () => {
      const longTitle = 'This is a very long header title that should wrap properly and not break the layout of the page';
      
      render(<Header title={longTitle} />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(longTitle);
    });

    it('user can see header handles special characters in title', () => {
      const specialTitle = 'Header with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      render(<Header title={specialTitle} />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(specialTitle);
    });

    it('user can see header handles empty subtitle gracefully', () => {
      render(<Header title="Test Header" subtitle="" />);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      
      // Should not render subtitle paragraph when subtitle is empty
      const subtitleParagraph = screen.queryByText('', { selector: 'p' });
      expect(subtitleParagraph).not.toBeInTheDocument();
    });

    it('user can see header handles very long subtitle', () => {
      const longSubtitle = 'This is a very long subtitle that should wrap properly and not break the layout of the header component';
      
      render(
        <Header 
          title="Long Subtitle Test" 
          subtitle={longSubtitle}
        />
      );
      
      const subtitle = screen.getByText(longSubtitle);
      expect(subtitle).toBeInTheDocument();
    });

    it('user can see header handles empty custom className gracefully', () => {
      render(
        <Header 
          title="Empty Class Test" 
          className=""
        />
      );
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');
    });
  });

  describe('Integration', () => {
    it('user can see header works within a page layout', () => {
      render(
        <div>
          <Header title="Page Header" subtitle="Page description" />
          <main>
            <h2>Main Content</h2>
            <p>This is the main content of the page.</p>
          </main>
        </div>
      );
      
      const header = screen.getByRole('banner');
      const mainContent = screen.getByText('Main Content');
      
      expect(header).toBeInTheDocument();
      expect(mainContent).toBeInTheDocument();
    });

    it('user can see header provides navigation context', () => {
      render(
        <Header 
          title="Game Settings" 
          subtitle="Configure your game preferences"
        />
      );
      
      const title = screen.getByRole('heading', { level: 1 });
      const subtitle = screen.getByText('Configure your game preferences');
      
      expect(title).toHaveTextContent('Game Settings');
      expect(subtitle).toHaveTextContent('Configure your game preferences');
    });

    it('user can see header maintains consistent styling with other components', () => {
      render(
        <div>
          <Header title="Consistent Header" />
          <div className="bg-white shadow-sm border-b border-gray-200">
            <p>Other component with similar styling</p>
          </div>
        </div>
      );
      
      const header = screen.getByRole('banner');
      const otherComponent = screen.getByText('Other component with similar styling').parentElement;
      
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');
      expect(otherComponent).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');
    });
  });

  describe('Future Navigation Support', () => {
    it('user can see header has space for future navigation items', () => {
      render(<Header title="Navigation Ready" />);
      
      const header = screen.getByRole('banner');
      const navigationSpace = header.querySelector('.flex.items-center.space-x-4');
      
      expect(navigationSpace).toBeInTheDocument();
      expect(navigationSpace).toBeEmptyDOMElement();
    });

    it('user can see header layout supports additional elements', () => {
      render(<Header title="Extensible Header" />);
      
      const header = screen.getByRole('banner');
      const flexContainer = header.querySelector('.flex.justify-between');
      
      expect(flexContainer).toBeInTheDocument();
      
      // Should have two main sections: title area and navigation area
      const children = flexContainer?.children;
      expect(children).toHaveLength(2);
    });
  });
}); 