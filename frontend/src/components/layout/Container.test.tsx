import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Container from './Container';

describe('Container Component', () => {
  describe('Layout Behavior', () => {
    it('user can see content is properly centered and constrained', () => {
      render(
        <Container>
          <div data-testid="content">Test content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('mx-auto', 'max-w-7xl');
    });

    it('user can see content has appropriate spacing from edges', () => {
      render(
        <Container padding="md">
          <div data-testid="content">Test content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('user can see content adapts to different screen sizes', () => {
      render(
        <Container maxWidth="lg" padding="lg">
          <div data-testid="content">Test content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-lg', 'px-4', 'sm:px-6', 'lg:px-8', 'xl:px-12');
    });

    it('user can see content does not overflow on small screens', () => {
      render(
        <Container maxWidth="sm">
          <div data-testid="content">Test content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-sm');
    });

    it('user can see content is readable and well-organized', () => {
      render(
        <Container>
          <h1>Main Title</h1>
          <p>This is a paragraph of content that should be well-organized and readable.</p>
          <button>Action Button</button>
        </Container>
      );
      
      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('This is a paragraph of content that should be well-organized and readable.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('user can see layout is consistent across different content types', () => {
      render(
        <Container>
          <div data-testid="text-content">Text content</div>
          <div data-testid="form-content">
            <input type="text" placeholder="Enter text" />
            <button>Submit</button>
          </div>
          <div data-testid="list-content">
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </Container>
      );
      
      const textContent = screen.getByTestId('text-content');
      const formContent = screen.getByTestId('form-content');
      const listContent = screen.getByTestId('list-content');
      
      expect(textContent).toBeInTheDocument();
      expect(formContent).toBeInTheDocument();
      expect(listContent).toBeInTheDocument();
      
      // All content should be within the same container
      const container = textContent.parentElement;
      expect(container).toContainElement(formContent);
      expect(container).toContainElement(listContent);
    });
  });

  describe('Responsive Design', () => {
    it('user can see content adapts to small screens with appropriate padding', () => {
      render(
        <Container padding="sm">
          <div data-testid="content">Small screen content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('px-4', 'sm:px-6');
    });

    it('user can see content adapts to medium screens with appropriate padding', () => {
      render(
        <Container padding="md">
          <div data-testid="content">Medium screen content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('user can see content adapts to large screens with appropriate padding', () => {
      render(
        <Container padding="lg">
          <div data-testid="content">Large screen content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8', 'xl:px-12');
    });

    it('user can see content adapts to extra large screens with appropriate max width', () => {
      render(
        <Container maxWidth="xl">
          <div data-testid="content">Extra large screen content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-xl');
    });

    it('user can see content adapts to 2xl screens with appropriate max width', () => {
      render(
        <Container maxWidth="2xl">
          <div data-testid="content">2XL screen content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-2xl');
    });
  });

  describe('Max Width Variants', () => {
    it('user can see small max width constraint', () => {
      render(
        <Container maxWidth="sm">
          <div data-testid="content">Small content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-sm');
    });

    it('user can see medium max width constraint', () => {
      render(
        <Container maxWidth="md">
          <div data-testid="content">Medium content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-md');
    });

    it('user can see large max width constraint', () => {
      render(
        <Container maxWidth="lg">
          <div data-testid="content">Large content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-lg');
    });

    it('user can see extra large max width constraint', () => {
      render(
        <Container maxWidth="xl">
          <div data-testid="content">Extra large content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-xl');
    });

    it('user can see 2xl max width constraint', () => {
      render(
        <Container maxWidth="2xl">
          <div data-testid="content">2XL content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-2xl');
    });

    it('user can see 7xl max width constraint (default)', () => {
      render(
        <Container>
          <div data-testid="content">7XL content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('max-w-7xl');
    });
  });

  describe('Padding Variants', () => {
    it('user can see no padding variant', () => {
      render(
        <Container padding="none">
          <div data-testid="content">No padding content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).not.toHaveClass('px-4', 'sm:px-6', 'lg:px-8', 'xl:px-12');
    });

    it('user can see small padding variant', () => {
      render(
        <Container padding="sm">
          <div data-testid="content">Small padding content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('px-4', 'sm:px-6');
    });

    it('user can see medium padding variant (default)', () => {
      render(
        <Container>
          <div data-testid="content">Medium padding content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('user can see large padding variant', () => {
      render(
        <Container padding="lg">
          <div data-testid="content">Large padding content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8', 'xl:px-12');
    });
  });

  describe('Custom Styling', () => {
    it('user can see container with custom className', () => {
      render(
        <Container className="custom-container">
          <div data-testid="content">Custom styled content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('custom-container');
    });

    it('user can see container combines default and custom classes', () => {
      render(
        <Container maxWidth="lg" padding="sm" className="custom-class">
          <div data-testid="content">Combined styling content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('mx-auto', 'max-w-lg', 'px-4', 'sm:px-6', 'custom-class');
    });

    it('user can see container handles empty custom className gracefully', () => {
      render(
        <Container className="">
          <div data-testid="content">Empty class content</div>
        </Container>
      );
      
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('Edge Cases', () => {
    it('user can see container handles complex nested content', () => {
      render(
        <Container>
          <div data-testid="nested-content">
            <header>
              <h1>Header</h1>
              <nav>
                <a href="#">Link 1</a>
                <a href="#">Link 2</a>
              </nav>
            </header>
            <main>
              <section>
                <h2>Section Title</h2>
                <p>Section content</p>
              </section>
            </main>
            <footer>
              <p>Footer content</p>
            </footer>
          </div>
        </Container>
      );
      
      const nestedContent = screen.getByTestId('nested-content');
      expect(nestedContent).toBeInTheDocument();
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('user can see container handles multiple children', () => {
      render(
        <Container>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </Container>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
      
      // All children should be within the same container
      const container = screen.getByTestId('child-1').parentElement;
      expect(container).toContainElement(screen.getByTestId('child-2'));
      expect(container).toContainElement(screen.getByTestId('child-3'));
    });

    it('user can see container handles empty children gracefully', () => {
      render(<Container>{null}</Container>);
      
      const container = document.querySelector('.mx-auto');
      expect(container).toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });

    it('user can see container handles boolean children gracefully', () => {
      render(
        <Container>
          {true && <div data-testid="conditional-content">Conditional content</div>}
          {false && <div>Hidden content</div>}
        </Container>
      );
      
      expect(screen.getByTestId('conditional-content')).toBeInTheDocument();
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('user can see container works with other components', () => {
      render(
        <Container>
          <div data-testid="header">Header Component</div>
          <div data-testid="form">
            <input type="text" placeholder="Enter name" />
            <button>Submit</button>
          </div>
          <div data-testid="footer">Footer Component</div>
        </Container>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('form')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('user can see container maintains proper spacing with different content types', () => {
      render(
        <Container padding="lg">
          <div data-testid="text-block">
            <h1>Title</h1>
            <p>This is a long paragraph of text that should wrap properly within the container and maintain proper spacing from the edges.</p>
          </div>
          <div data-testid="form-block">
            <form>
              <input type="email" placeholder="Email" />
              <textarea placeholder="Message"></textarea>
              <button type="submit">Send</button>
            </form>
          </div>
        </Container>
      );
      
      const textBlock = screen.getByTestId('text-block');
      const formBlock = screen.getByTestId('form-block');
      
      expect(textBlock).toBeInTheDocument();
      expect(formBlock).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    });
  });
}); 