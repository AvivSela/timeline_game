import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimelineBackbone from './TimelineBackbone';

describe('TimelineBackbone', () => {
  it('renders with default props', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toBeInTheDocument();
    expect(backbone).toHaveClass('timeline-backbone');
  });

  it('does not render when isVisible is false', () => {
    render(<TimelineBackbone width={200} height={20} isVisible={false} />);

    const backbone = screen.queryByRole('presentation', { hidden: true });
    expect(backbone).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TimelineBackbone width={200} height={20} className="custom-class" />
    );

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveClass('custom-class');
  });

  it('has correct default classes', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveClass('timeline-backbone');
    expect(backbone).toHaveClass('absolute');
    expect(backbone).toHaveClass('z-10');
    expect(backbone).toHaveClass('rounded-full');
    expect(backbone).toHaveClass('transition-all');
    expect(backbone).toHaveClass('duration-300');
    expect(backbone).toHaveClass('ease-out');
  });

  it('has correct accessibility attributes', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies gradient background', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 100%)',
    });
  });

  it('applies GPU acceleration', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      transform: 'translate3d(0, 0, 0)',
    });
  });

  it('applies box shadow', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    });
  });

  it('calculates dimensions correctly', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      width: '200px',
      height: '20px',
    });
  });

  it('enforces minimum width', () => {
    render(<TimelineBackbone width={50} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      width: '100px', // Minimum width
    });
  });

  it('enforces minimum height', () => {
    render(<TimelineBackbone width={200} height={4} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      height: '8px', // Minimum height
    });
  });

  it('centers vertically', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    // Should be centered: (20 - 20) / 2 = 0px from top (since 20 > 8, backbone height is 20)
    expect(backbone).toHaveStyle({
      top: '0px',
    });
  });

  it('renders animation overlay', () => {
    render(<TimelineBackbone width={200} height={20} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    const overlay = backbone.querySelector('.animate-pulse');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('absolute');
    expect(overlay).toHaveClass('inset-0');
    expect(overlay).toHaveClass('rounded-full');
    expect(overlay).toHaveClass('opacity-20');
    expect(overlay).toHaveClass('animate-pulse');
  });

  it('updates dimensions when props change', () => {
    const { rerender } = render(<TimelineBackbone width={200} height={20} />);

    let backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({ width: '200px' });

    rerender(<TimelineBackbone width={300} height={30} />);

    backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({ width: '300px' });
  });

  it('handles zero dimensions gracefully', () => {
    render(<TimelineBackbone width={0} height={0} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      width: '100px', // Minimum width
      height: '8px', // Minimum height
    });
  });

  it('handles negative dimensions gracefully', () => {
    render(<TimelineBackbone width={-50} height={-10} />);

    const backbone = screen.getByRole('presentation', { hidden: true });
    expect(backbone).toHaveStyle({
      width: '100px', // Minimum width
      height: '8px', // Minimum height
    });
  });
}); 