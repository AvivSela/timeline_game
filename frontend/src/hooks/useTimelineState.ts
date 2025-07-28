import { useState, useCallback, useEffect, useMemo } from 'react';
import { TimelineState, TimelineActions, DragState, InsertionZoneProps } from '../types/timeline';
import { CardData, TimelineCard } from '../types/game';

export const useTimelineState = (initialCards: CardData[] = []) => {
  const [state, setState] = useState<TimelineState>({
    placedCards: [],
    availableCards: initialCards,
    dragState: {
      isDragging: false,
      draggedCard: null,
      dragOffset: { x: 0, y: 0 },
      dragStartPosition: { x: 0, y: 0 },
    },
    insertionZones: [],
  });

  // Generate helper text for insertion zones
  const generateHelperText = useCallback((position: number, placedCards: TimelineCard[]): string => {
    if (placedCards.length === 0) {
      return 'Start timeline here';
    }

    if (position === 0) {
      const firstCard = placedCards[0];
      return `Before ${firstCard.card.chronologicalValue}`;
    }

    if (position === placedCards.length) {
      const lastCard = placedCards[placedCards.length - 1];
      return `After ${lastCard.card.chronologicalValue}`;
    }

    const prevCard = placedCards[position - 1];
    const nextCard = placedCards[position];
    return `Between ${prevCard.card.chronologicalValue} and ${nextCard.card.chronologicalValue}`;
  }, []);

  // Update insertion zones when placed cards change
  const updateInsertionZones = useCallback(() => {
    const zones: InsertionZoneProps[] = [];
    const { placedCards } = state;

    // Add zones for each possible position
    for (let i = 0; i <= placedCards.length; i++) {
      zones.push({
        position: i,
        isValid: true, // Will be validated in future sprints
        helperText: generateHelperText(i, placedCards),
        onDrop: (card: CardData, position: number) => {
          placeCard(card, position);
        },
      });
    }

    setState(prev => ({
      ...prev,
      insertionZones: zones,
    }));
  }, [state.placedCards, generateHelperText]);

  // Place a card at a specific position
  const placeCard = useCallback((card: CardData, position: number) => {
    setState(prev => {
      // Remove card from available cards
      const newAvailableCards = prev.availableCards.filter(c => c.id !== card.id);
      
      // Create timeline card
      const timelineCard: TimelineCard = {
        id: card.id,
        position,
        card,
      };

      // Insert card at position
      const newPlacedCards = [...prev.placedCards];
      newPlacedCards.splice(position, 0, timelineCard);

      // Update positions for cards after the inserted card
      for (let i = position + 1; i < newPlacedCards.length; i++) {
        newPlacedCards[i] = {
          ...newPlacedCards[i],
          position: i,
        };
      }

      return {
        ...prev,
        placedCards: newPlacedCards,
        availableCards: newAvailableCards,
      };
    });
  }, []);

  // Remove a card from the timeline
  const removeCard = useCallback((cardId: string) => {
    setState(prev => {
      const cardToRemove = prev.placedCards.find(card => card.id === cardId);
      if (!cardToRemove) return prev;

      // Remove card from placed cards
      const newPlacedCards = prev.placedCards.filter(card => card.id !== cardId);
      
      // Update positions for remaining cards
      const updatedPlacedCards = newPlacedCards.map((card, index) => ({
        ...card,
        position: index,
      }));

      // Add card back to available cards
      const newAvailableCards = [...prev.availableCards, cardToRemove.card];

      return {
        ...prev,
        placedCards: updatedPlacedCards,
        availableCards: newAvailableCards,
      };
    });
  }, []);

  // Update drag state
  const updateDragState = useCallback((dragState: Partial<DragState>) => {
    setState(prev => ({
      ...prev,
      dragState: {
        ...prev.dragState,
        ...dragState,
      },
    }));
  }, []);

  // Reset timeline state
  const resetTimeline = useCallback(() => {
    setState(prev => ({
      ...prev,
      placedCards: [],
      availableCards: initialCards,
      insertionZones: [],
    }));
  }, [initialCards]);

  // Get timeline statistics
  const timelineStats = useMemo(() => {
    const { placedCards, availableCards } = state;
    return {
      totalCards: placedCards.length + availableCards.length,
      placedCards: placedCards.length,
      availableCards: availableCards.length,
      completionPercentage: placedCards.length / (placedCards.length + availableCards.length) * 100,
    };
  }, [state.placedCards, state.availableCards]);

  // Validate timeline order (basic validation for now)
  const validateTimeline = useCallback(() => {
    const { placedCards } = state;
    const errors: Array<{ cardId: string; message: string }> = [];

    for (let i = 1; i < placedCards.length; i++) {
      const prevCard = placedCards[i - 1];
      const currentCard = placedCards[i];
      
      if (currentCard.card.chronologicalValue < prevCard.card.chronologicalValue) {
        errors.push({
          cardId: currentCard.id,
          message: `${currentCard.card.name} (${currentCard.card.chronologicalValue}) should come after ${prevCard.card.name} (${prevCard.card.chronologicalValue})`,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state.placedCards]);

  // Persist state to localStorage
  const persistState = useCallback(() => {
    try {
      localStorage.setItem('timeline-state', JSON.stringify({
        placedCards: state.placedCards,
        availableCards: state.availableCards,
      }));
    } catch (error) {
      console.error('Failed to persist timeline state:', error);
    }
  }, [state.placedCards, state.availableCards]);

  // Load state from localStorage
  const loadPersistedState = useCallback(() => {
    try {
      const persisted = localStorage.getItem('timeline-state');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        setState(prev => ({
          ...prev,
          placedCards: parsed.placedCards || [],
          availableCards: parsed.availableCards || initialCards,
        }));
      }
    } catch (error) {
      console.error('Failed to load persisted timeline state:', error);
    }
  }, [initialCards]);

  // Auto-save state changes
  useEffect(() => {
    persistState();
  }, [state.placedCards, state.availableCards, persistState]);

  // Load persisted state on mount
  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  // Update insertion zones when placed cards change
  useEffect(() => {
    updateInsertionZones();
  }, [state.placedCards, updateInsertionZones]);

  const actions: TimelineActions = {
    placeCard,
    removeCard,
    updateDragState,
    updateInsertionZones,
  };

  return {
    state,
    actions,
    timelineStats,
    validateTimeline,
    resetTimeline,
  };
}; 