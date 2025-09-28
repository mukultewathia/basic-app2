// Challenge API Models - TypeScript interfaces matching backend responses

export type ChallengeScheduleStatus = 'scheduled' | 'active' | 'expired' | 'deleted';
export type ChallengeCompletionStatus = 'not_started' | 'in_progress' | 'success' | 'partial_success' | 'failed';

export interface ChallengeSummaryResponse {
  challengeId: number;
  name: string;
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
  scheduleStatus: ChallengeScheduleStatus;
  completionStatus: string; // keep as string if backend may extend
}

export interface HabitEntry {
  entryId: number;
  entryDate: string; // YYYY-MM-DD
  performed: boolean | null; // null = unknown
  notes?: string | null;
}

export interface HabitInfo {
  habitId: number;
  habitName: string;
  habitDescription?: string;
  habitEntries: HabitEntry[];
}

export interface ChallengeDetailResponse {
  challengeId: number;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  durationDays: number;
  scheduleStatus: ChallengeScheduleStatus;
  completionStatus: ChallengeCompletionStatus | string;
  successPercent: number;
  habitsInfo: HabitInfo[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// Frontend models for UI state
export interface ChallengeSummary {
  challengeId: number;
  name: string;
  startDate: string;
  endDate: string;
  scheduleStatus: ChallengeScheduleStatus;
  completionStatus: string;
  successPercent?: number;
}

export interface ChallengeDetail {
  challengeId: number;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  scheduleStatus: ChallengeScheduleStatus;
  completionStatus: ChallengeCompletionStatus | string;
  successPercent: number;
  habitsInfo: HabitInfo[];
  createdAt: string;
  updatedAt: string;
}

// Grid data structures for detail view
export interface ChallengeGridDate {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // EEE format
  formattedDate: string; // dd-MM-yyyy format
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface ChallengeGridHabit {
  habitId: number;
  habitName: string;
  habitDescription?: string;
}

export interface ChallengeGridCell {
  habitId: number;
  date: string;
  performed: boolean | null; // null = unknown
  entryId?: number;
  notes?: string | null;
}

export interface ChallengeGridNote {
  date: string;
  noteText: string;
  hasNote: boolean;
}

// API request/response types for optimistic updates
export interface SaveHabitEntryRequest {
  challengeId: number;
  habitId: number;
  entryDate: string;
  performed: boolean;
  note?: string;
}

export interface SaveNoteRequest {
  challengeId: number;
  date: string;
  noteText: string;
}

export interface SaveHabitEntryResponse {
  entryId: number;
  success: boolean;
}

export interface SaveNoteResponse {
  success: boolean;
}

// Create challenge request/response
export interface CreateChallengeRequest {
  name: string;
  habitIds: number[];
  startDate: string; // YYYY-MM-DD
  durationDays: number;
}

export interface CreateChallengeResponse {
  challengeId: number;
  userId: number;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  scheduleStatus: ChallengeScheduleStatus;
  completionStatus: ChallengeCompletionStatus;
  successPercent: number;
  createdAt: string;
  updatedAt: string;
}

// Dialog data types
export interface CreateChallengeData {
  name: string;
  habitIds: number[];
  startDate: string;
  durationDays: number;
}

// Status display helpers
export interface StatusDisplay {
  label: string;
  cssClass: string;
  icon: string;
}

export interface CompletionStatusDisplay {
  label: string;
  cssClass: string;
  icon: string;
}
