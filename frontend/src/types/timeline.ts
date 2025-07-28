export interface TimelineContainerProps {
  children: React.ReactNode;
  className?: string;
  onScroll?: (scrollLeft: number) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export interface TimelineContainerState {
  isScrolling: boolean;
  scrollLeft: number;
  containerWidth: number;
}

export interface TimelineBackboneProps {
  width: number;
  height: number;
  className?: string;
  isVisible?: boolean;
}

export interface BackboneDimensions {
  width: number;
  height: number;
  left: number;
  top: number;
}

import { CardData, TimelineCard } from './game';

export interface TimelineCardProps {
  card: CardData;
  isPlaced?: boolean;
  isDragging?: boolean;
  isError?: boolean;
  onClick?: (card: CardData) => void;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
}

export interface CardVisualState {
  isHovered: boolean;
  isFocused: boolean;
  isDragging: boolean;
  isPlaced: boolean;
  isError: boolean;
}

export interface CardSourceAreaProps {
  cards: CardData[];
  onCardDragStart?: (card: CardData, event: DragEvent) => void;
  onCardDragEnd?: (card: CardData, event: DragEvent) => void;
  className?: string;
}

export interface SourceAreaState {
  draggedCard: CardData | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

export interface InsertionZoneProps {
  position: number;
  isValid: boolean;
  helperText: string;
  onDrop: (card: CardData, position: number) => void;
  className?: string;
}

export interface ZoneState {
  isHighlighted: boolean;
  isActive: boolean;
  isValid: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedCard: CardData | null;
  dragOffset: { x: number; y: number };
  dragStartPosition: { x: number; y: number };
}

export interface UseDragAndDropReturn {
  dragState: DragState;
  handleDragStart: (card: CardData, event: DragEvent) => void;
  handleDragEnd: (event: DragEvent) => void;
  handleDragOver: (event: DragEvent) => void;
  handleDrop: (event: DragEvent) => void;
}

export interface TimelineState {
  placedCards: TimelineCard[];
  availableCards: CardData[];
  dragState: DragState;
  insertionZones: InsertionZoneProps[];
}

export interface TimelineActions {
  placeCard: (card: CardData, position: number) => void;
  removeCard: (cardId: string) => void;
  updateDragState: (dragState: Partial<DragState>) => void;
  updateInsertionZones: () => void;
}

// Re-export CardData and TimelineCard from game types
export type { CardData, TimelineCard } from './game'; 