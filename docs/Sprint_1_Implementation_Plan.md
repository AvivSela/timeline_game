# Sprint 1 Implementation Plan: Core Timeline Foundation

**Sprint Duration:** 2 weeks (Weeks 1-2)  
**Focus:** Basic timeline functionality with drag-and-drop  
**Team:** Frontend developers (3), Backend developers (2), QA (1)

---

## 🎯 Sprint Goals

### Primary Objectives
1. Create responsive timeline container with proper styling
2. Implement timeline backbone with visual connector
3. Build timeline card components with all visual states
4. Create card source area for draggable cards
5. Implement basic drag and drop functionality
6. Create insertion zones for card placement
7. Establish timeline state management foundation

### Success Criteria
- [ ] Timeline container renders with responsive design
- [ ] Timeline backbone displays with gradient styling
- [ ] Cards can be dragged from source to timeline
- [ ] Insertion zones appear during drag operations
- [ ] All components have 100% test coverage
- [ ] Design system compliance verified

---

## 📁 File Structure Plan

### New Components to Create
```
frontend/src/components/timeline/
├── TimelineContainer.tsx
├── TimelineContainer.test.tsx
├── TimelineBackbone.tsx
├── TimelineBackbone.test.tsx
├── TimelineCard.tsx
├── TimelineCard.test.tsx
├── CardSourceArea.tsx
├── CardSourceArea.test.tsx
├── InsertionZone.tsx
├── InsertionZone.test.tsx
└── index.ts
```

### New Types to Add
```
frontend/src/types/
├── timeline.ts (new)
└── game.ts (extend existing)
```

### New Hooks to Create
```
frontend/src/hooks/
├── useTimeline.ts (new)
├── useDragAndDrop.ts (new)
└── useTimelineState.ts (new)
```

### New Utilities to Add
```
frontend/src/utils/
├── timelineHelpers.ts (new)
├── dragAndDropHelpers.ts (new)
└── validationHelpers.ts (new)
```

---

## 🚀 Epic 1.1: Timeline Container Setup

### Story 1.1.1: Create Timeline Container Component

#### Technical Implementation Details

**File:** `frontend/src/components/timeline/TimelineContainer.tsx`

```typescript
interface TimelineContainerProps {
  children: React.ReactNode;
  className?: string;
  onScroll?: (scrollLeft: number) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

interface TimelineContainerState {
  isScrolling: boolean;
  scrollLeft: number;
  containerWidth: number;
}
```

**Key Features:**
- Responsive breakpoints: 768px (tablet), 1024px (desktop), 1440px (large)
- CSS custom properties for theming
- Horizontal scroll capability with smooth behavior
- Fixed height with overflow management
- Design system compliance (colors, spacing, shadows)

**Design System Integration:**
- Colors: `#3498db`, `#2ecc71`, `#ecf0f1`, `#34495e`
- Spacing: 8px grid system
- Border radius: 8px for cards, 4px for containers
- Shadows: `0 2px 8px rgba(0, 0, 0, 0.1)` for cards

#### Testing Strategy
- **Unit Tests:** Component rendering, props handling, scroll behavior
- **Integration Tests:** Timeline backbone integration
- **Visual Tests:** Responsive breakpoints, design compliance
- **Accessibility Tests:** Keyboard navigation, screen reader support

### Story 1.1.2: Implement Timeline Backbone

#### Technical Implementation Details

**File:** `frontend/src/components/timeline/TimelineBackbone.tsx`

```typescript
interface TimelineBackboneProps {
  width: number;
  height: number;
  className?: string;
  isVisible?: boolean;
}

interface BackboneDimensions {
  width: number;
  height: number;
  left: number;
  top: number;
}
```

**Key Features:**
- Gradient styling: `90deg, #3498db 0%, #2ecc71 100%`
- Dynamic width calculation based on timeline content
- Smooth animations when content changes
- Proper positioning relative to cards
- Responsive height adjustments

**Animation Specifications:**
- Duration: 300ms for width changes
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- GPU acceleration with `transform3d`

#### Testing Strategy
- **Unit Tests:** Gradient rendering, width calculations
- **Integration Tests:** Timeline container integration
- **Visual Tests:** Gradient appearance, animation smoothness
- **Performance Tests:** Animation frame rate

---

## 🎮 Epic 1.2: Timeline Card Components

### Story 1.2.1: Create Timeline Card Component

#### Technical Implementation Details

**File:** `frontend/src/components/timeline/TimelineCard.tsx`

```typescript
interface TimelineCardProps {
  card: CardData;
  isPlaced?: boolean;
  isDragging?: boolean;
  isError?: boolean;
  onClick?: (card: CardData) => void;
  className?: string;
}

interface CardVisualState {
  isHovered: boolean;
  isFocused: boolean;
  isDragging: boolean;
  isPlaced: boolean;
  isError: boolean;
}
```

**Visual States Implementation:**
- **Default:** Clean card with subtle shadow
- **Hover:** Scale 1.02, enhanced shadow
- **Dragging:** Rotate 5deg, scale 1.05, strong shadow
- **Placed:** Green border, success animation
- **Error:** Red border, shake animation

**Responsive Sizing:**
- Mobile: 200px width, 120px height
- Tablet: 240px width, 140px height
- Desktop: 280px width, 160px height

**Accessibility Features:**
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Reduced motion support

#### Testing Strategy
- **Unit Tests:** All visual states, props handling
- **Integration Tests:** Click handlers, drag integration
- **Visual Tests:** All responsive breakpoints
- **Accessibility Tests:** ARIA compliance, keyboard navigation

### Story 1.2.2: Implement Card Source Area

#### Technical Implementation Details

**File:** `frontend/src/components/timeline/CardSourceArea.tsx`

```typescript
interface CardSourceAreaProps {
  cards: CardData[];
  onCardDragStart?: (card: CardData, event: DragEvent) => void;
  onCardDragEnd?: (card: CardData, event: DragEvent) => void;
  className?: string;
}

interface SourceAreaState {
  draggedCard: CardData | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}
```

**Key Features:**
- Grid layout for available cards
- Drag initiation with visual feedback
- Clear visual distinction from placed cards
- Responsive layout for different screen sizes
- Empty state handling

**Layout Specifications:**
- Grid: 2-4 columns based on screen size
- Gap: 16px between cards
- Padding: 24px around container
- Scroll: Vertical scroll for overflow

#### Testing Strategy
- **Unit Tests:** Card rendering, drag events
- **Integration Tests:** Timeline integration
- **Visual Tests:** Grid layout, responsive design
- **Interaction Tests:** Drag and drop functionality

---

## 🎯 Epic 1.3: Basic Drag & Drop

### Story 1.3.1: Implement Drag Initiation

#### Technical Implementation Details

**File:** `frontend/src/hooks/useDragAndDrop.ts`

```typescript
interface DragState {
  isDragging: boolean;
  draggedCard: CardData | null;
  dragOffset: { x: number; y: number };
  dragStartPosition: { x: number; y: number };
}

interface UseDragAndDropReturn {
  dragState: DragState;
  handleDragStart: (card: CardData, event: DragEvent) => void;
  handleDragEnd: (event: DragEvent) => void;
  handleDragOver: (event: DragEvent) => void;
  handleDrop: (event: DragEvent) => void;
}
```

**HTML5 Drag and Drop Implementation:**
- `draggable` attribute on cards
- `onDragStart`, `onDragEnd`, `onDragOver`, `onDrop` handlers
- Custom drag image with rotation and scaling
- Cursor styling: `grab` → `grabbing`

**Visual Effects:**
- Rotation: 5 degrees during drag
- Scaling: 1.05x during drag
- Shadow: Enhanced shadow during drag
- Opacity: 0.8 during drag

#### Testing Strategy
- **Unit Tests:** Drag state management, event handlers
- **Integration Tests:** Timeline integration
- **Visual Tests:** Drag effects, cursor changes
- **Performance Tests:** Smooth 60fps animations

### Story 1.3.2: Create Insertion Zones

#### Technical Implementation Details

**File:** `frontend/src/components/timeline/InsertionZone.tsx`

```typescript
interface InsertionZoneProps {
  position: number;
  isValid: boolean;
  helperText: string;
  onDrop: (card: CardData, position: number) => void;
  className?: string;
}

interface ZoneState {
  isHighlighted: boolean;
  isActive: boolean;
  isValid: boolean;
}
```

**Zone Types:**
- **Edge Zones:** Beginning/end of timeline
- **Middle Zones:** Between placed cards
- **Dynamic Zones:** Created as cards are placed

**Visual Indicators:**
- Valid zones: Green border, checkmark icon
- Invalid zones: Red border, X icon
- Active zones: Pulsing animation
- Helper text: Chronological range display

**Helper Text Logic:**
- "Before [year]" for edge zones
- "Between [year1] and [year2]" for middle zones
- "After [year]" for end zones

#### Testing Strategy
- **Unit Tests:** Zone rendering, validation logic
- **Integration Tests:** Timeline integration, drop handling
- **Visual Tests:** Zone appearance, animations
- **Logic Tests:** Helper text generation

---

## 🗂️ Timeline State Management

### Story 1.5.1: Implement Timeline State

#### Technical Implementation Details

**File:** `frontend/src/hooks/useTimelineState.ts`

```typescript
interface TimelineState {
  placedCards: TimelineCard[];
  availableCards: CardData[];
  dragState: DragState;
  insertionZones: InsertionZone[];
}

interface TimelineActions {
  placeCard: (card: CardData, position: number) => void;
  removeCard: (cardId: string) => void;
  updateDragState: (dragState: Partial<DragState>) => void;
  updateInsertionZones: () => void;
}
```

**State Management Features:**
- Immutable state updates
- Optimistic updates for better UX
- State persistence (localStorage)
- State validation and error handling

**Performance Optimizations:**
- Memoized selectors for derived state
- Debounced zone updates
- Efficient re-rendering with React.memo

#### Testing Strategy
- **Unit Tests:** State updates, actions
- **Integration Tests:** Component integration
- **Performance Tests:** State update performance
- **Persistence Tests:** localStorage integration

---

## 🎨 Design System Integration

### Color Palette
```css
:root {
  --primary-blue: #3498db;
  --primary-green: #2ecc71;
  --background-light: #ecf0f1;
  --text-dark: #34495e;
  --success-green: #27ae60;
  --error-red: #e74c3c;
  --warning-orange: #f39c12;
}
```

### Typography Scale
```css
:root {
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
}
```

### Spacing System
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
}
```

---

## 🧪 Testing Strategy

### Test Coverage Requirements
- **Unit Tests:** 100% coverage for all components
- **Integration Tests:** Timeline container + backbone + cards
- **Visual Tests:** All responsive breakpoints
- **Accessibility Tests:** WCAG 2.1 AA compliance

### Test File Structure
```
frontend/src/components/timeline/__tests__/
├── TimelineContainer.test.tsx
├── TimelineBackbone.test.tsx
├── TimelineCard.test.tsx
├── CardSourceArea.test.tsx
├── InsertionZone.test.tsx
└── integration/
    └── TimelineIntegration.test.tsx
```

### Testing Tools
- **React Testing Library:** Component testing
- **Vitest:** Test runner
- **jsdom:** DOM environment
- **@testing-library/user-event:** User interaction testing

---

## 📋 Daily Tasks Breakdown

### Week 1: Foundation

**Day 1-2: Timeline Container**
- [ ] Create TimelineContainer component
- [ ] Implement responsive design
- [ ] Add design system integration
- [ ] Write comprehensive tests

**Day 3-4: Timeline Backbone**
- [ ] Create TimelineBackbone component
- [ ] Implement gradient styling
- [ ] Add dynamic width calculation
- [ ] Write tests and documentation

**Day 5: Card Components Foundation**
- [ ] Create TimelineCard component structure
- [ ] Implement basic card rendering
- [ ] Add TypeScript interfaces
- [ ] Set up testing framework

### Week 2: Interaction & Polish

**Day 6-7: Card Visual States**
- [ ] Implement all visual states (default, hover, dragging, placed, error)
- [ ] Add accessibility features
- [ ] Create responsive sizing
- [ ] Write visual state tests

**Day 8-9: Card Source Area**
- [ ] Create CardSourceArea component
- [ ] Implement grid layout
- [ ] Add drag initiation
- [ ] Test responsive behavior

**Day 10: Drag & Drop Foundation**
- [ ] Create useDragAndDrop hook
- [ ] Implement basic drag functionality
- [ ] Add visual feedback
- [ ] Test drag interactions

**Day 11-12: Insertion Zones**
- [ ] Create InsertionZone component
- [ ] Implement zone positioning logic
- [ ] Add visual indicators
- [ ] Test zone validation

**Day 13-14: State Management & Integration**
- [ ] Create useTimelineState hook
- [ ] Integrate all components
- [ ] Add state persistence
- [ ] Comprehensive integration testing

---

## 🚀 Definition of Done

### For Each Component
- [ ] Component renders correctly with all props
- [ ] All visual states implemented and tested
- [ ] Responsive design verified across breakpoints
- [ ] Accessibility requirements met (ARIA labels, keyboard navigation)
- [ ] 100% test coverage achieved
- [ ] TypeScript types properly defined
- [ ] Design system compliance verified
- [ ] Performance requirements met (60fps animations)

### For Sprint Completion
- [ ] All user stories completed and tested
- [ ] Timeline container with backbone renders correctly
- [ ] Cards can be dragged from source to timeline
- [ ] Insertion zones appear and function properly
- [ ] State management handles all scenarios
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Code review completed and approved
- [ ] Documentation updated

---

## 🎯 Success Metrics

### Technical Metrics
- **Test Coverage:** 100% for all new components
- **Performance:** 60fps animations maintained
- **Accessibility:** WCAG 2.1 AA compliance
- **Responsive:** All breakpoints working correctly

### User Experience Metrics
- **Drag Responsiveness:** <16ms delay between drag and visual feedback
- **Visual Feedback:** All states clearly distinguishable
- **Error Handling:** Graceful handling of edge cases
- **Accessibility:** Full keyboard navigation support

### Quality Metrics
- **Code Quality:** ESLint passing, TypeScript strict mode
- **Documentation:** All components documented
- **Performance:** No memory leaks, efficient re-renders
- **Browser Support:** Chrome, Firefox, Safari, Edge

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ installed
- Yarn package manager
- Git for version control
- Code editor with TypeScript support

### Local Development
```bash
# Install dependencies
cd frontend && yarn install

# Start development server
yarn dev

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run linting
yarn lint
```

### Development Workflow
1. Create feature branch from main
2. Implement component with tests
3. Run tests and linting
4. Create pull request
5. Code review and approval
6. Merge to main branch

---

## 📚 Resources & References

### Design System
- Figma design files (to be provided)
- Color palette and typography scale
- Component specifications and spacing

### Technical Documentation
- React 18 documentation
- TypeScript handbook
- Testing Library documentation
- Accessibility guidelines (WCAG 2.1)

### Team Communication
- Daily standups (15 minutes)
- Sprint planning (1 hour)
- Sprint review (30 minutes)
- Sprint retrospective (30 minutes)

---

**Implementation Notes:**
- Prioritize user experience and smooth interactions
- Maintain consistent design system compliance
- Focus on accessibility from day one
- Ensure performance optimization throughout development
- Document all decisions and trade-offs

**Next Sprint Preview:**
- Sprint 2 will focus on validation and feedback systems
- Chronological validation logic
- Success/error feedback components
- Enhanced state management for validation 