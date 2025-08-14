# Habits Feature - Quick Start Guide

## Getting Started

### Step 1: Create a Habit
1. In the left sidebar, type a habit name in the input field (e.g., "Exercise", "Read", "Meditate")
2. Click the "Add" button or press Enter
3. Your habit will appear in the list below

### Step 2: Select a Habit
1. Check the checkbox next to the habit you want to track
2. You can select up to 3 habits at once
3. The calendar will show indicators for selected habits

### Step 3: Track Your Progress
1. Click on any calendar day to mark it as completed/incomplete
2. Green indicators = Completed
3. Red indicators = Missed/Incomplete
4. Navigate between months using the arrow buttons

## Features

### ✅ What Works
- Create new habits
- Select up to 3 habits for tracking
- Click calendar days to toggle completion
- Month navigation
- Visual indicators (green/red)
- Responsive design

### ⚠️ Current Limitations
- Username is hardcoded as 'testuser' (needs user authentication integration)
- Habit deletion only removes from local state (backend doesn't support it)
- Multiple habit selection shows basic popover (first habit gets toggled)

### 🔧 Technical Notes
- Backend API integration is complete
- All data is saved to the backend
- Real-time updates when clicking calendar days

## Troubleshooting

### "No habits selected" error
- Make sure you've created at least one habit
- Check the checkbox next to a habit in the left sidebar
- You should see a blue message saying "Select a habit from the left sidebar..."

### Calendar not responding
- Ensure you're clicking on days in the current month (not grayed out days)
- Check that you have at least one habit selected
- Try refreshing the page if issues persist

### Backend connection issues
- Make sure your backend server is running
- Check the browser console for API error messages
- Verify the API base URL in environment files

## Next Steps
- Integrate with user authentication system
- Add habit deletion support on backend
- Implement proper multi-habit selection popover
- Add notes/description support for entries
