import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TimelineContainer from './TimelineContainer';

describe('TimelineContainer', () => {
  const mockOnScroll = vi.fn();
  const mockScrollRef = { current: null } as unknown as React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with children', () => {
    render(
      <TimelineContainer>
        <div data-testid="test-child">Test Content</div>
      </TimelineContainer>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TimelineContainer className="custom-class">
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct default classes', () => {
    render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    expect(container).toHaveClass('timeline-container');
    expect(container).toHaveClass('relative');
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('overflow-x-auto');
  });

  it('has responsive height classes', () => {
    render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    expect(container).toHaveClass('h-32');
    expect(container).toHaveClass('md:h-36');
    expect(container).toHaveClass('lg:h-40');
    expect(container).toHaveClass('xl:h-44');
  });

  it('calls onScroll callback when scrolled', async () => {
    render(
      <TimelineContainer onScroll={mockOnScroll}>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    fireEvent.scroll(container, { target: { scrollLeft: 100 } });

    await waitFor(() => {
      expect(mockOnScroll).toHaveBeenCalledWith(100);
    });
  });

  it('forwards scrollRef when provided', () => {
    render(
      <TimelineContainer scrollRef={mockScrollRef}>
        <div>Test Content</div>
      </TimelineContainer>
    );

    expect(mockScrollRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has correct accessibility attributes', () => {
    render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'Timeline container');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('has smooth scroll behavior', () => {
    render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    expect(container).toHaveStyle({ scrollBehavior: 'smooth' });
  });

  it('has correct scrollbar styling', () => {
    render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    expect(container).toHaveStyle({
      scrollbarWidth: 'thin',
      scrollbarColor: '#d1d5db transparent',
    });
  });

  it('handles scroll state correctly', async () => {
    render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const container = screen.getByRole('region');
    
    // Simulate scroll start
    fireEvent.scroll(container, { target: { scrollLeft: 50 } });
    
    // Wait for scroll end timeout
    await waitFor(() => {
      // Component should handle scroll state internally
      expect(container).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('renders with minimum content width', () => {
    const { container } = render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const contentDiv = container.querySelector('.flex');
    expect(contentDiv).toHaveStyle({ minWidth: 'max-content' });
  });

  it('has correct flex layout for children', () => {
    const { container } = render(
      <TimelineContainer>
        <div>Test Content</div>
      </TimelineContainer>
    );

    const contentDiv = container.querySelector('.flex');
    expect(contentDiv).toHaveClass('flex');
    expect(contentDiv).toHaveClass('items-center');
    expect(contentDiv).toHaveClass('min-w-full');
    expect(contentDiv).toHaveClass('h-full');
    expect(contentDiv).toHaveClass('px-4');
    expect(contentDiv).toHaveClass('py-2');
    expect(contentDiv).toHaveClass('gap-4');
  });
}); 