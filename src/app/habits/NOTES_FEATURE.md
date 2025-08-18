# Notes Feature for Calendar Days

## Overview
This feature allows users to add and edit notes for specific calendar days. Users can click on a notes button (📝) on any calendar day to open a popup where they can view, add, or edit notes for that day.

## Implementation Details

### Components
- **NotesPopupComponent**: A popup dialog for editing notes
- **CalendarMonthComponent**: Updated to include notes functionality

### Services
- **NotesService**: Manages notes state and API calls
- **HabitsApiService**: Extended with `upsertNote` and `getNotes` methods

### Models
- **NoteRequest**: Backend DTO for note requests
- **NoteResponse**: Backend DTO for note responses  
- **Note**: Frontend model for notes

### API Endpoints
- `POST /api/habits/upsertNote` - Creates or updates a note for a specific date
- `GET /api/habits/notes` - Retrieves all notes for the current user

### Features
1. **Notes Button**: Each calendar day has a notes button (📝) in the top-right corner
2. **Visual Indicator**: Days with notes show the button in blue and bold
3. **Popup Editor**: Clicking the button opens a modal with a textarea for editing
4. **Save Functionality**: Users can save notes with Ctrl+Enter or the Save button
5. **Cancel Option**: Users can cancel without saving changes
6. **Auto-loading**: Notes are automatically loaded when the calendar is initialized
7. **Tooltip Preview**: Hovering over the notes button shows a preview of existing notes
8. **Loading States**: Proper loading indicators during API calls

### Usage
1. Navigate to the habits calendar view
2. Notes are automatically loaded from the backend
3. Click the 📝 button on any calendar day
4. Add or edit your notes in the popup
5. Click "Save" or press Ctrl+Enter to save
6. Click "Cancel" or click outside the popup to close without saving

### Technical Notes
- Notes are stored per date in YYYY-MM-DD format
- The feature integrates with the existing habits calendar
- Notes are persisted to the backend via the upsertNote API
- Notes are loaded from the backend via the getNotes API
- The UI is responsive and accessible with proper ARIA labels
- Loading states provide feedback during API operations
