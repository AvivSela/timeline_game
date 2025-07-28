import { useState, useCallback, useRef } from 'react';
import { DragState, UseDragAndDropReturn } from '../types/timeline';
import { CardData } from '../types/game';

export const useDragAndDrop = (): UseDragAndDropReturn => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCard: null,
    dragOffset: { x: 0, y: 0 },
    dragStartPosition: { x: 0, y: 0 },
  });

  const dragImageRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((card: CardData, event: DragEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Create custom drag image
    if (!dragImageRef.current) {
      dragImageRef.current = document.createElement('div');
      dragImageRef.current.style.position = 'absolute';
      dragImageRef.current.style.top = '-1000px';
      dragImageRef.current.style.left = '-1000px';
      dragImageRef.current.style.width = '200px';
      dragImageRef.current.style.height = '120px';
      dragImageRef.current.style.backgroundColor = 'white';
      dragImageRef.current.style.border = '2px solid #3498db';
      dragImageRef.current.style.borderRadius = '8px';
      dragImageRef.current.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      dragImageRef.current.style.transform = 'rotate(5deg) scale(1.05)';
      dragImageRef.current.style.pointerEvents = 'none';
      dragImageRef.current.style.zIndex = '9999';
      dragImageRef.current.innerHTML = `
        <div style="padding: 12px; text-align: center;">
          <div style="font-weight: bold; color: #2c3e50; margin-bottom: 4px;">${card.name}</div>
          <div style="font-size: 18px; font-weight: bold; color: #3498db;">${card.chronologicalValue}</div>
        </div>
      `;
      document.body.appendChild(dragImageRef.current);
    }

    // Set custom drag image
    if (event.dataTransfer && dragImageRef.current) {
      event.dataTransfer.setDragImage(dragImageRef.current, 100, 60);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify(card));
    }

    // Update drag state
    setDragState({
      isDragging: true,
      draggedCard: card,
      dragOffset: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
      dragStartPosition: {
        x: event.clientX,
        y: event.clientY,
      },
    });

    // Update cursor
    if (target) {
      target.style.cursor = 'grabbing';
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEvent) => {
    // Clean up drag image
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedCard: null,
      dragOffset: { x: 0, y: 0 },
      dragStartPosition: { x: 0, y: 0 },
    });

    // Reset cursor
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.style.cursor = 'grab';
    }
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    // Prevent default to allow drop
    event.preventDefault();
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    
    // Clean up drag image
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedCard: null,
      dragOffset: { x: 0, y: 0 },
      dragStartPosition: { x: 0, y: 0 },
    });

    // Reset cursor
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.style.cursor = 'grab';
    }
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
}; 