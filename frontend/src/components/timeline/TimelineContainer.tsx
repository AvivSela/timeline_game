import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TimelineContainerProps, TimelineContainerState } from '../../types/timeline';

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  children,
  className = '',
  onScroll,
  scrollRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<TimelineContainerState>({
    isScrolling: false,
    scrollLeft: 0,
    containerWidth: 0,
  });

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = event.currentTarget.scrollLeft;
    setState(prev => ({ ...prev, scrollLeft }));
    onScroll?.(scrollLeft);
  }, [onScroll]);

  const handleScrollStart = useCallback(() => {
    setState(prev => ({ ...prev, isScrolling: true }));
  }, []);

  const handleScrollEnd = useCallback(() => {
    setState(prev => ({ ...prev, isScrolling: false }));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateContainerWidth = () => {
      setState(prev => ({ ...prev, containerWidth: container.offsetWidth }));
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScrollWithTimeout = () => {
      handleScrollStart();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150);
    };

    container.addEventListener('scroll', handleScrollWithTimeout);

    return () => {
      container.removeEventListener('scroll', handleScrollWithTimeout);
      clearTimeout(scrollTimeout);
    };
  }, [handleScrollStart, handleScrollEnd]);

  // Forward ref to parent if provided
  useEffect(() => {
    if (scrollRef && containerRef.current) {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = containerRef.current;
    }
  }, [scrollRef]);

  return (
    <div
      ref={containerRef}
      className={`
        timeline-container
        relative
        w-full
        h-32
        md:h-36
        lg:h-40
        xl:h-44
        overflow-x-auto
        overflow-y-hidden
        bg-white
        border
        border-gray-200
        rounded-lg
        shadow-sm
        transition-all
        duration-300
        ease-in-out
        ${state.isScrolling ? 'scrollbar-thin scrollbar-thumb-gray-300' : 'scrollbar-hide'}
        ${className}
      `}
      style={{
        scrollBehavior: 'smooth',
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db transparent',
      }}
      onScroll={handleScroll}
      role="region"
      aria-label="Timeline container"
      tabIndex={0}
    >
      <div
        className="
          flex
          items-center
          min-w-full
          h-full
          px-4
          py-2
          gap-4
        "
        style={{
          minWidth: 'max-content',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default TimelineContainer; 