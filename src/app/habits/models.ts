// Backend DTOs matching the Java HabitDto
export interface HabitRequest {
  username: string;
  habitName: string;
  description?: string;
}

export interface HabitResponse {
  habitId: number;
  userId: number;
  name: string;
  description?: string;
  createdAt: string; // OffsetDateTime from backend
}

export interface HabitEntryRequest {
  username: string;
  habitName: string;
  entryDate: string; // LocalDate from backend (YYYY-MM-DD)
  performed: boolean;
  notes?: string;
}

export interface HabitEntryResponse {
  entryId: number;
  habitId: number;
  habitName: string;
  entryDate: string; // LocalDate from backend (YYYY-MM-DD)
  performed: boolean;
  notes?: string;
  createdAt: string; // OffsetDateTime from backend
}

export interface AllHabitData {
  habitId: number;
  name: string;
  description?: string;
  createdAt: string; // OffsetDateTime from backend
}

// Frontend models (adapted from backend)
export interface Habit {
  id: number; // habitId from backend
  name: string;
  description?: string;
  createdAt?: string;
}

export interface HabitEntry {
  id: number; // entryId from backend
  habitId: number;
  habitName: string;
  date: string; // entryDate from backend (YYYY-MM-DD)
  isCompleted: boolean; // performed from backend
  notes?: string;
  createdAt?: string;
}

// Frontend DTOs for API calls
export interface CreateHabitDto {
  username: string;
  habitName: string;
  description?: string;
}

export interface CreateHabitEntryDto {
  username: string;
  habitName: string;
  entryDate: string; // YYYY-MM-DD
  performed: boolean;
  notes?: string;
}

// Response wrappers for consistency
export interface HabitsResponse {
  habits: AllHabitData[];
}

export interface HabitEntriesResponse {
  entries: HabitEntryResponse[];
}

// Calendar utility interface
export interface CalendarDay {
  date: string; // ISO format YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  entries: HabitEntry[];
}
