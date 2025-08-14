# Habits Feature

## Overview
The Habits feature allows users to create, manage, and track daily habits with a monthly calendar view. Users can select up to 3 habits to display simultaneously in the calendar grid.

## Features Implemented

### Core Functionality
- ✅ Create new habits
- ✅ Delete existing habits
- ✅ Select up to 3 habits for calendar display
- ✅ Monthly calendar grid with habit completion indicators
- ✅ Toggle habit completion status by clicking on calendar days
- ✅ Month navigation (previous/next)
- ✅ Responsive design for mobile and desktop

### UI Components
- **HabitsPageComponent**: Main page shell with two-column layout
- **HabitListComponent**: Left sidebar for habit management
- **CalendarMonthComponent**: Right panel with monthly calendar grid
- **HabitsStore**: State management using RxJS BehaviorSubjects
- **HabitsApiService**: HTTP service for API communication
- **CalendarService**: Utility service for calendar calculations

### State Management
- Centralized state using RxJS BehaviorSubjects
- Reactive updates across all components
- Optimistic updates for better UX
- Error handling and loading states

### API Integration
- RESTful API service layer
- TypeScript interfaces for type safety
- Error handling and retry logic
- Environment-based API configuration

## File Structure
```
src/app/habits/
├── habits.page.ts              # Main page component
├── habits.page.html            # Page template
├── habits.page.scss            # Page styles
├── habit-list.component.ts     # Habit list component
├── habit-list.component.html   # List template
├── habit-list.component.scss   # List styles
├── calendar-month.component.ts # Calendar component
├── calendar-month.component.html # Calendar template
├── calendar-month.component.scss # Calendar styles
├── habits.store.ts             # State management
├── habits-api.service.ts       # API service
├── calendar.service.ts         # Calendar utilities
├── models.ts                   # TypeScript interfaces
├── habits.routes.ts            # Routing configuration
├── API_NOTES.md                # API documentation
└── README.md                   # This file
```

## Usage

### Navigation
Access the habits feature at `/habits` route.

### Creating Habits
1. Enter a habit name in the input field
2. Click "Add" or press Enter
3. The habit appears in the list below

### Selecting Habits
1. Check the checkbox next to any habit
2. Up to 3 habits can be selected simultaneously
3. Selected habits appear in the calendar grid

### Tracking Progress
1. Click on any calendar day to toggle habit completion
2. Green indicators show completed habits
3. Red indicators show missed habits
4. Navigate between months using the arrow buttons

### Deleting Habits
1. Click the "×" button next to any habit
2. Confirm the deletion in the dialog
3. The habit is removed from the list and calendar

## Technical Details

### API Endpoints (Assumed)
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `DELETE /api/habits/{id}` - Delete habit
- `GET /api/habit-entries` - Get entries for date range
- `PUT /api/habits/{id}/entries` - Create/update entry

### Data Models
```typescript
interface Habit {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### State Structure
```typescript
interface HabitsState {
  habits: Habit[];
  selectedHabitIds: string[];
  entriesByHabitId: Map<string, Map<string, HabitEntry>>;
  currentYear: number;
  currentMonth: number;
  loading: boolean;
  error: string | null;
}
```

## Responsive Design
- Desktop: Two-column layout (sidebar + calendar)
- Tablet: Stacked layout with calendar first
- Mobile: Optimized for touch interaction

## Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatibility
- High contrast color scheme

## Future Enhancements
- [ ] Habit categories/tags
- [ ] Streak tracking
- [ ] Weekly/monthly statistics
- [ ] Export functionality
- [ ] Habit templates
- [ ] Reminder notifications
- [ ] Social sharing
- [ ] Dark mode theme

## Notes
- The API endpoints are currently assumed based on common REST patterns
- Update `API_NOTES.md` once the actual backend API is discovered
- The feature is ready for integration with the real backend API
