import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimelineState } from './useTimelineState';
import { CardData } from '../types/game';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

const createMockCard = (overrides: Partial<CardData> = {}): CardData => ({
  id: 'test-card-1',
  name: 'Test Card',
  description: 'A test card for timeline',
  chronologicalValue: 1500,
  difficulty: 'EASY',
  category: 'History',
  ...overrides,
});

describe('useTimelineState', () => {
  const initialCards: CardData[] = [
    createMockCard({ id: 'card-1', name: 'Card 1', chronologicalValue: 1000 }),
    createMockCard({ id: 'card-2', name: 'Card 2', chronologicalValue: 2000 }),
    createMockCard({ id: 'card-3', name: 'Card 3', chronologicalValue: 3000 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty state when no initial cards', () => {
      const { result } = renderHook(() => useTimelineState());

      expect(result.current.state.placedCards).toEqual([]);
      expect(result.current.state.availableCards).toEqual([]);
      expect(result.current.state.insertionZones).toHaveLength(1); // Always has one zone for empty timeline
      expect(result.current.state.dragState.isDragging).toBe(false);
    });

    it('should initialize with initial cards in available cards', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      expect(result.current.state.placedCards).toEqual([]);
      expect(result.current.state.availableCards).toEqual(initialCards);
      expect(result.current.state.insertionZones).toHaveLength(1); // One zone for empty timeline
    });

    it('should create initial insertion zone', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      expect(result.current.state.insertionZones).toHaveLength(1);
      expect(result.current.state.insertionZones[0]).toEqual({
        position: 0,
        isValid: true,
        helperText: 'Start timeline here',
        onDrop: expect.any(Function),
      });
    });
  });

  describe('placeCard', () => {
    it('should place card at specified position', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      act(() => {
        result.current.actions.placeCard(card, 0);
      });

      expect(result.current.state.placedCards).toHaveLength(1);
      expect(result.current.state.placedCards[0]).toEqual({
        id: card.id,
        position: 0,
        card,
      });
      expect(result.current.state.availableCards).toHaveLength(2);
      expect(result.current.state.availableCards).not.toContain(card);
    });

    it('should place card at end position', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card1 = initialCards[0];
      const card2 = initialCards[1];

      // Place first card
      act(() => {
        result.current.actions.placeCard(card1, 0);
      });

      // Place second card at end
      act(() => {
        result.current.actions.placeCard(card2, 1);
      });

      expect(result.current.state.placedCards).toHaveLength(2);
      expect(result.current.state.placedCards[1]).toEqual({
        id: card2.id,
        position: 1,
        card: card2,
      });
    });

    it('should place card in middle position', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card1 = initialCards[0];
      const card2 = initialCards[1];
      const card3 = initialCards[2];

      // Place first and third cards
      act(() => {
        result.current.actions.placeCard(card1, 0);
        result.current.actions.placeCard(card3, 1);
      });

      // Place second card in middle
      act(() => {
        result.current.actions.placeCard(card2, 1);
      });

      expect(result.current.state.placedCards).toHaveLength(3);
      expect(result.current.state.placedCards[1]).toEqual({
        id: card2.id,
        position: 1,
        card: card2,
      });
      expect(result.current.state.placedCards[2]).toEqual({
        id: card3.id,
        position: 2,
        card: card3,
      });
    });

    it('should update insertion zones after placing card', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      act(() => {
        result.current.actions.placeCard(card, 0);
      });

      expect(result.current.state.insertionZones).toHaveLength(2); // Before and after
      expect(result.current.state.insertionZones[0].helperText).toBe(`Before ${card.chronologicalValue}`);
      expect(result.current.state.insertionZones[1].helperText).toBe(`After ${card.chronologicalValue}`);
    });
  });

  describe('removeCard', () => {
    it('should remove card from timeline', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      // Place card first
      act(() => {
        result.current.actions.placeCard(card, 0);
      });

      expect(result.current.state.placedCards).toHaveLength(1);

      // Remove card
      act(() => {
        result.current.actions.removeCard(card.id);
      });

      expect(result.current.state.placedCards).toHaveLength(0);
      expect(result.current.state.availableCards).toHaveLength(3);
      expect(result.current.state.availableCards).toContain(card);
    });

    it('should update positions after removing card', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card1 = initialCards[0];
      const card2 = initialCards[1];

      // Place two cards
      act(() => {
        result.current.actions.placeCard(card1, 0);
        result.current.actions.placeCard(card2, 1);
      });

      expect(result.current.state.placedCards[1].position).toBe(1);

      // Remove first card
      act(() => {
        result.current.actions.removeCard(card1.id);
      });

      expect(result.current.state.placedCards[0].position).toBe(0);
    });

    it('should do nothing when removing non-existent card', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      act(() => {
        result.current.actions.removeCard('non-existent-id');
      });

      expect(result.current.state.placedCards).toHaveLength(0);
      expect(result.current.state.availableCards).toHaveLength(3);
    });
  });

  describe('updateDragState', () => {
    it('should update drag state', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      act(() => {
        result.current.actions.updateDragState({
          isDragging: true,
          draggedCard: card,
        });
      });

      expect(result.current.state.dragState.isDragging).toBe(true);
      expect(result.current.state.dragState.draggedCard).toEqual(card);
    });

    it('should merge partial drag state updates', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      act(() => {
        result.current.actions.updateDragState({
          isDragging: true,
        });
      });

      expect(result.current.state.dragState.isDragging).toBe(true);
      expect(result.current.state.dragState.draggedCard).toBeNull(); // Should remain unchanged
    });
  });

  describe('timelineStats', () => {
    it('should calculate correct statistics', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      act(() => {
        result.current.actions.placeCard(card, 0);
      });

      expect(result.current.timelineStats).toEqual({
        totalCards: 3,
        placedCards: 1,
        availableCards: 2,
        completionPercentage: (1 / 3) * 100,
      });
    });

    it('should handle empty timeline', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      expect(result.current.timelineStats).toEqual({
        totalCards: 3,
        placedCards: 0,
        availableCards: 3,
        completionPercentage: 0,
      });
    });

    it('should handle completed timeline', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      act(() => {
        initialCards.forEach((card, index) => {
          result.current.actions.placeCard(card, index);
        });
      });

      expect(result.current.timelineStats).toEqual({
        totalCards: 3,
        placedCards: 3,
        availableCards: 0,
        completionPercentage: 100,
      });
    });
  });

  describe('validateTimeline', () => {
    it('should validate correct timeline order', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      act(() => {
        // Place cards in correct chronological order
        result.current.actions.placeCard(initialCards[0], 0); // 1000
        result.current.actions.placeCard(initialCards[1], 1); // 2000
        result.current.actions.placeCard(initialCards[2], 2); // 3000
      });

      const validation = result.current.validateTimeline();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect incorrect timeline order', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      act(() => {
        // Place cards in incorrect chronological order
        result.current.actions.placeCard(initialCards[2], 0); // 3000
        result.current.actions.placeCard(initialCards[0], 1); // 1000 (should be before 3000)
      });

      const validation = result.current.validateTimeline();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0].cardId).toBe(initialCards[0].id);
    });

    it('should handle empty timeline', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      const validation = result.current.validateTimeline();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('resetTimeline', () => {
    it('should reset timeline to initial state', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      // Place a card
      act(() => {
        result.current.actions.placeCard(card, 0);
      });

      expect(result.current.state.placedCards).toHaveLength(1);

      // Reset timeline
      act(() => {
        result.current.resetTimeline();
      });

      expect(result.current.state.placedCards).toHaveLength(0);
      expect(result.current.state.availableCards).toEqual(initialCards);
      expect(result.current.state.insertionZones).toHaveLength(1);
    });
  });

  describe('state persistence', () => {
    it('should persist state to localStorage', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      act(() => {
        result.current.actions.placeCard(card, 0);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'timeline-state',
        JSON.stringify({
          placedCards: result.current.state.placedCards,
          availableCards: result.current.state.availableCards,
        })
      );
    });

    it('should load persisted state on mount', () => {
      const persistedState = {
        placedCards: [
          {
            id: 'card-1',
            position: 0,
            card: initialCards[0],
          },
        ],
        availableCards: initialCards.slice(1),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(persistedState));

      const { result } = renderHook(() => useTimelineState(initialCards));

      expect(result.current.state.placedCards).toEqual(persistedState.placedCards);
      expect(result.current.state.availableCards).toEqual(persistedState.availableCards);
    });

    it('should handle invalid persisted state gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const { result } = renderHook(() => useTimelineState(initialCards));

      expect(result.current.state.placedCards).toEqual([]);
      expect(result.current.state.availableCards).toEqual(initialCards);
    });
  });

  describe('insertion zones', () => {
    it('should generate correct helper text for empty timeline', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      expect(result.current.state.insertionZones[0].helperText).toBe('Start timeline here');
    });

    it('should generate correct helper text for single card', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));
      const card = initialCards[0];

      act(() => {
        result.current.actions.placeCard(card, 0);
      });

      expect(result.current.state.insertionZones[0].helperText).toBe(`Before ${card.chronologicalValue}`);
      expect(result.current.state.insertionZones[1].helperText).toBe(`After ${card.chronologicalValue}`);
    });

    it('should generate correct helper text for multiple cards', () => {
      const { result } = renderHook(() => useTimelineState(initialCards));

      act(() => {
        result.current.actions.placeCard(initialCards[0], 0); // 1000
        result.current.actions.placeCard(initialCards[1], 1); // 2000
      });

      expect(result.current.state.insertionZones[0].helperText).toBe('Before 1000');
      expect(result.current.state.insertionZones[1].helperText).toBe('Between 1000 and 2000');
      expect(result.current.state.insertionZones[2].helperText).toBe('After 2000');
    });
  });
}); 