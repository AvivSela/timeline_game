import React, { useEffect, useState } from 'react';
import { TimelineBackboneProps, BackboneDimensions } from '../../types/timeline';

const TimelineBackbone: React.FC<TimelineBackboneProps> = ({
  width,
  height,
  className = '',
  isVisible = true,
}) => {
  const [dimensions, setDimensions] = useState<BackboneDimensions>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  useEffect(() => {
    // Calculate dimensions based on props
    const backboneHeight = Math.max(height, 8); // Minimum height of 8px
    const newDimensions: BackboneDimensions = {
      width: Math.max(width, 100), // Minimum width of 100px
      height: backboneHeight,
      left: 0,
      top: (height - backboneHeight) / 2, // Center vertically
    };

    setDimensions(newDimensions);
  }, [width, height]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        timeline-backbone
        absolute
        z-10
        rounded-full
        transition-all
        duration-300
        ease-out
        ${className}
      `}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        left: `${dimensions.left}px`,
        top: `${dimensions.top}px`,
        background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transform: 'translate3d(0, 0, 0)', // GPU acceleration
      }}
      role="presentation"
      aria-hidden="true"
    >
      {/* Optional: Add subtle animation for visual appeal */}
      <div
        className="
          absolute
          inset-0
          rounded-full
          opacity-20
          animate-pulse
        "
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
        }}
      />
    </div>
  );
};

export default TimelineBackbone; 