# Habits API Documentation

## Overview
This document contains the API endpoints and data structures for the Habits feature based on the actual backend implementation from `mukultewathia/basic-app2-backend`.

## Backend Endpoints (Verified)

### Habits Management

#### GET /api/habits/allHabits
- **Description**: Get all habits for a user, optionally filtered by habit name
- **Query Parameters**: 
  - `username` (string, required)
  - `habitName` (string, optional)
- **Response**: `AllHabitData[]`
- **Status Codes**: 200 (success), 400 (bad request), 500 (server error)

#### POST /api/habits/addHabit
- **Description**: Create a new habit
- **Request Body**: `HabitRequest`
- **Response**: `HabitResponse`
- **Status Codes**: 201 (created), 400 (bad request), 500 (server error)

### Habit Entries Management

#### GET /api/habits/allHabitEntries
- **Description**: Get habit entries for specified habits
- **Query Parameters**: 
  - `username` (string, required)
  - `habitNames` (string, comma-separated list)
- **Response**: `HabitEntryResponse[]`
- **Status Codes**: 200 (success), 400 (bad request), 500 (server error)

#### POST /api/habits/addHabitEntry
- **Description**: Create a new habit entry
- **Request Body**: `HabitEntryRequest`
- **Response**: `HabitEntryResponse`
- **Status Codes**: 201 (created), 400 (bad request), 500 (server error)

#### DELETE /api/habits/deleteHabitEntry
- **Description**: Delete a habit entry by entry ID
- **Query Parameters**: `entryId` (number, required)
- **Response**: void
- **Status Codes**: 204 (no content), 404 (not found), 500 (server error)

## Data Models

### HabitRequest
```typescript
{
  username: string;
  habitName: string;
  description?: string;
}
```

### HabitResponse
```typescript
{
  habitId: number;
  userId: number;
  name: string;
  description?: string;
  createdAt: string; // OffsetDateTime
}
```

### AllHabitData
```typescript
{
  habitId: number;
  name: string;
  description?: string;
  createdAt: string; // OffsetDateTime
}
```

### HabitEntryRequest
```typescript
{
  username: string;
  habitName: string;
  entryDate: string; // LocalDate (YYYY-MM-DD)
  performed: boolean;
  notes?: string;
}
```

### HabitEntryResponse
```typescript
{
  entryId: number;
  habitId: number;
  habitName: string;
  entryDate: string; // LocalDate (YYYY-MM-DD)
  performed: boolean;
  notes?: string;
  createdAt: string; // OffsetDateTime
}
```

## Notes
- Date format: Backend uses LocalDate (YYYY-MM-DD) for dates and OffsetDateTime for timestamps
- Authentication: Currently using username parameter (no JWT authentication implemented)
- Error responses: Standard HTTP status codes with optional error message in response body
- Habit deletion: Backend doesn't support deleting habits directly, only habit entries
- Username requirement: All endpoints require username parameter (should be integrated with user authentication)

## Implementation Notes
- ✅ Endpoint paths verified from backend repository
- ✅ Request/response body structures confirmed
- ✅ Date format requirements verified
- ✅ All fields in models confirmed
- ⚠️ Authentication mechanism needs integration with user system
- ⚠️ Username currently hardcoded as 'testuser' - needs to be dynamic
