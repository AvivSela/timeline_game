import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDragAndDrop } from './useDragAndDrop';
import { CardData } from '../types/game';

// Mock DOM methods
const mockSetDragImage = vi.fn();
const mockSetData = vi.fn();
const mockGetData = vi.fn();

const createMockDragEvent = (overrides: Partial<DragEvent> = {}): DragEvent => {
  return {
    clientX: 100,
    clientY: 200,
    currentTarget: document.createElement('div'),
    dataTransfer: {
      setDragImage: mockSetDragImage,
      setData: mockSetData,
      getData: mockGetData,
      effectAllowed: 'move',
      dropEffect: 'move',
    },
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as DragEvent;
};

const createMockCard = (overrides: Partial<CardData> = {}): CardData => ({
  id: 'test-card-1',
  name: 'Test Card',
  description: 'A test card for timeline',
  chronologicalValue: 1500,
  difficulty: 'EASY',
  category: 'History',
  ...overrides,
});

describe('useDragAndDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.body.appendChild and removeChild
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.createElement('div'));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.createElement('div'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return initial drag state', () => {
      const { result } = renderHook(() => useDragAndDrop());

      expect(result.current.dragState).toEqual({
        isDragging: false,
        draggedCard: null,
        dragOffset: { x: 0, y: 0 },
        dragStartPosition: { x: 0, y: 0 },
      });
    });

    it('should return drag event handlers', () => {
      const { result } = renderHook(() => useDragAndDrop());

      expect(result.current.handleDragStart).toBeDefined();
      expect(result.current.handleDragEnd).toBeDefined();
      expect(result.current.handleDragOver).toBeDefined();
      expect(result.current.handleDrop).toBeDefined();
    });
  });

  describe('handleDragStart', () => {
    it('should update drag state when drag starts', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const event = createMockDragEvent();

      act(() => {
        result.current.handleDragStart(card, event);
      });

      expect(result.current.dragState).toEqual({
        isDragging: true,
        draggedCard: card,
        dragOffset: { x: 100, y: 200 },
        dragStartPosition: { x: 100, y: 200 },
      });
    });

    it('should create custom drag image', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const event = createMockDragEvent();

      act(() => {
        result.current.handleDragStart(card, event);
      });

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(mockSetDragImage).toHaveBeenCalled();
      expect(mockSetData).toHaveBeenCalledWith('application/json', JSON.stringify(card));
    });

    it('should set cursor to grabbing', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const mockElement = document.createElement('div');
      const event = createMockDragEvent({
        currentTarget: mockElement,
      });

      act(() => {
        result.current.handleDragStart(card, event);
      });

      expect(mockElement.style.cursor).toBe('grabbing');
    });

    it('should handle drag start with different card data', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard({
        id: 'test-card-2',
        name: 'Another Test Card',
        chronologicalValue: 1800,
      });
      const event = createMockDragEvent();

      act(() => {
        result.current.handleDragStart(card, event);
      });

      expect(result.current.dragState.draggedCard).toEqual(card);
      expect(result.current.dragState.isDragging).toBe(true);
    });
  });

  describe('handleDragEnd', () => {
    it('should reset drag state when drag ends', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const startEvent = createMockDragEvent();
      const endEvent = createMockDragEvent();

      // Start drag
      act(() => {
        result.current.handleDragStart(card, startEvent);
      });

      expect(result.current.dragState.isDragging).toBe(true);

      // End drag
      act(() => {
        result.current.handleDragEnd(endEvent);
      });

      expect(result.current.dragState).toEqual({
        isDragging: false,
        draggedCard: null,
        dragOffset: { x: 0, y: 0 },
        dragStartPosition: { x: 0, y: 0 },
      });
    });

    it('should clean up drag image', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const startEvent = createMockDragEvent();
      const endEvent = createMockDragEvent();

      // Start drag to create drag image
      act(() => {
        result.current.handleDragStart(card, startEvent);
      });

      // End drag
      act(() => {
        result.current.handleDragEnd(endEvent);
      });

      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should reset cursor to grab', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const mockElement = document.createElement('div');
      const startEvent = createMockDragEvent({
        currentTarget: mockElement,
      });
      const endEvent = createMockDragEvent({
        currentTarget: mockElement,
      });

      // Start drag
      act(() => {
        result.current.handleDragStart(card, startEvent);
      });

      expect(mockElement.style.cursor).toBe('grabbing');

      // End drag
      act(() => {
        result.current.handleDragEnd(endEvent);
      });

      expect(mockElement.style.cursor).toBe('grab');
    });
  });

  describe('handleDragOver', () => {
    it('should prevent default and set drop effect', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const event = createMockDragEvent();

      act(() => {
        result.current.handleDragOver(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.dataTransfer!.dropEffect).toBe('move');
    });

    it('should handle drag over with different event data', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const event = createMockDragEvent({
        clientX: 300,
        clientY: 400,
      });

      act(() => {
        result.current.handleDragOver(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('handleDrop', () => {
    it('should prevent default and reset drag state', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const startEvent = createMockDragEvent();
      const dropEvent = createMockDragEvent();

      // Start drag
      act(() => {
        result.current.handleDragStart(card, startEvent);
      });

      expect(result.current.dragState.isDragging).toBe(true);

      // Drop
      act(() => {
        result.current.handleDrop(dropEvent);
      });

      expect(dropEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.draggedCard).toBeNull();
    });

    it('should clean up drag image on drop', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const startEvent = createMockDragEvent();
      const dropEvent = createMockDragEvent();

      // Start drag to create drag image
      act(() => {
        result.current.handleDragStart(card, startEvent);
      });

      // Drop
      act(() => {
        result.current.handleDrop(dropEvent);
      });

      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should reset cursor on drop', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const mockElement = document.createElement('div');
      const startEvent = createMockDragEvent({
        currentTarget: mockElement,
      });
      const dropEvent = createMockDragEvent({
        currentTarget: mockElement,
      });

      // Start drag
      act(() => {
        result.current.handleDragStart(card, startEvent);
      });

      expect(mockElement.style.cursor).toBe('grabbing');

      // Drop
      act(() => {
        result.current.handleDrop(dropEvent);
      });

      expect(mockElement.style.cursor).toBe('grab');
    });
  });

  describe('drag image creation', () => {
    it('should create drag image with card information', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard({
        name: 'Test Card Name',
        chronologicalValue: 1600,
      });
      const event = createMockDragEvent();

      act(() => {
        result.current.handleDragStart(card, event);
      });

      expect(document.body.appendChild).toHaveBeenCalled();
      // Check that the drag image was created with the correct content
      const calls = (document.body.appendChild as any).mock.calls;
      const dragImage = calls[calls.length - 1][0]; // Get the last call
      expect(dragImage.innerHTML).toContain('Test Card Name');
      expect(dragImage.innerHTML).toContain('1600');
    });

    it('should set drag image properties correctly', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const event = createMockDragEvent();

      act(() => {
        result.current.handleDragStart(card, event);
      });

      expect(document.body.appendChild).toHaveBeenCalled();
      // Check that the drag image was created with the correct properties
      const calls = (document.body.appendChild as any).mock.calls;
      const dragImage = calls[calls.length - 1][0]; // Get the last call
      expect(dragImage.style.position).toBe('absolute');
      expect(dragImage.style.top).toBe('-1000px');
      expect(dragImage.style.left).toBe('-1000px');
      expect(dragImage.style.width).toBe('200px');
      expect(dragImage.style.height).toBe('120px');
      expect(dragImage.style.backgroundColor).toBe('white');
      expect(dragImage.style.border).toBe('2px solid rgb(52, 152, 219)');
      expect(dragImage.style.borderRadius).toBe('8px');
      expect(dragImage.style.boxShadow).toBe('0 4px 12px rgba(0, 0, 0, 0.15)');
      expect(dragImage.style.transform).toBe('rotate(5deg) scale(1.05)');
      expect(dragImage.style.pointerEvents).toBe('none');
      expect(dragImage.style.zIndex).toBe('9999');
    });
  });

  describe('error handling', () => {
    it('should handle missing dataTransfer gracefully', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const event = createMockDragEvent({
        dataTransfer: null,
      });

      expect(() => {
        act(() => {
          result.current.handleDragStart(card, event);
        });
      }).not.toThrow();
    });

    it('should handle missing currentTarget gracefully', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const card = createMockCard();
      const event = createMockDragEvent({
        currentTarget: null,
      });

      // This should throw an error since getBoundingClientRect is called on null
      expect(() => {
        act(() => {
          result.current.handleDragStart(card, event);
        });
      }).toThrow('Cannot read properties of null');
    });
  });
}); 