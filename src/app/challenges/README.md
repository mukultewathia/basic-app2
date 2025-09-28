# Challenges Feature

## Overview
The Challenges feature allows users to create, manage, and track habit challenges with a detailed grid view. Users can view challenges by status (Active, Expired, Scheduled) and track daily habit completion with notes.

## Features Implemented

### Core Functionality
- ✅ Tabbed view with Active, Expired, Scheduled challenges
- ✅ Challenge list with status indicators and progress
- ✅ Detailed challenge view with date×habit grid
- ✅ Habit completion tracking with optimistic updates
- ✅ Notes functionality for each day
- ✅ Responsive design for mobile and desktop

### UI Components
- **ChallengesPageComponent**: Main page with tabs and challenge list
- **ChallengeDetailPageComponent**: Detailed grid view with habit tracking
- **StatusIconComponent**: Reusable status indicator component
- **NoteDialogComponent**: Modal for editing notes
- **ChallengeService**: API service with optimistic update stubs

### State Management
- Lightweight RxJS with component-level state
- Optimistic updates for better UX
- Error handling and loading states
- Debounced API calls to prevent race conditions

### API Integration
- RESTful API service layer
- TypeScript interfaces for type safety
- Optimistic update stubs for future endpoints
- Error handling and retry logic

## File Structure
```
src/app/challenges/
├── challenges.page.ts              # Main page component
├── challenge-detail.page.ts        # Detail view component
├── challenge.service.ts            # API service
├── models.ts                      # TypeScript interfaces
├── challenges.routes.ts           # Routing configuration
└── README.md                      # This file

src/app/shared/ui/
├── status-icon.component.ts        # Status indicator component
└── note-dialog.component.ts        # Notes modal component
```

## Usage

### Navigation
Access the challenges feature at `/challenges` route.

### Viewing Challenges
1. Navigate to the Challenges page
2. Use tabs to filter by status (Active, Expired, Scheduled)
3. Click "View Details" on any challenge to see the detailed grid

### Tracking Progress
1. In the detail view, click on habit cells to toggle completion
2. Unknown status prompts for confirmation (Yes/No)
3. Known status toggles between completed/missed
4. Click on notes column to add/edit daily notes

### Challenge Grid
- **Date Column**: Shows day of week and formatted date
- **Habit Columns**: One column per habit with completion status
- **Notes Column**: Click to add/edit notes for each day
- **Status Icons**: ✔ (completed), ✖ (missed), • (unknown)

## Technical Details

### API Endpoints (Implemented)
- `GET /api/challenge?status=<status>` - Get challenges by status
- `GET /api/challenge/{id}` - Get challenge details
- `POST /api/challenge/create` - Create new challenge
- `PATCH /api/challenge/{id}` - Update challenge
- `DELETE /api/challenge/{id}` - Delete challenge
- `PUT /api/challenge/{id}/addHabit/{habitId}` - Add habit to challenge
- `DELETE /api/challenge/{id}/deleteHabit/{habitId}` - Remove habit from challenge

### Optimistic Update Stubs (TODO: Wire to Backend)
- `saveHabitEntry(challengeId, habitId, date, performed)` - Save habit entry
- `saveNote(challengeId, date, noteText)` - Save daily notes

### Data Models
```typescript
interface ChallengeSummaryResponse {
  challengeId: number;
  name: string;
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
  scheduleStatus: ChallengeScheduleStatus;
  completionStatus: string;
}

interface ChallengeDetailResponse {
  challengeId: number;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  scheduleStatus: ChallengeScheduleStatus;
  completionStatus: ChallengeCompletionStatus;
  successPercent: number;
  habitsInfo: HabitInfo[];
  createdAt: string;
  updatedAt: string;
}

interface HabitInfo {
  habitId: number;
  habitName: string;
  habitDescription?: string;
  habitEntries: HabitEntry[];
}

interface HabitEntry {
  entryId: number;
  entryDate: string; // YYYY-MM-DD
  performed: boolean | null; // null = unknown
  notes?: string | null;
}
```

## Responsive Design
- Desktop: Full grid view with all columns visible
- Tablet: Optimized grid with horizontal scrolling
- Mobile: Stacked layout with touch-friendly interactions

## Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast status indicators

## Performance
- Memoized computed grid data
- Optimistic updates for instant feedback
- Debounced API calls
- Virtual scrolling for large date ranges (future enhancement)

## Future Enhancements
- Real backend endpoints for habit entries and notes
- Challenge creation wizard
- Bulk habit operations
- Export functionality
- Challenge templates
- Social features (sharing, competitions)

## Integration Notes
- Uses existing AuthInterceptor for JWT authentication
- Follows existing app routing patterns
- Reuses shared UI components where possible
- Maintains consistency with existing habits feature
