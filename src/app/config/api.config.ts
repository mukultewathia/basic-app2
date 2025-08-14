import { environment } from '../../environments/environment';

export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: environment.apiBaseUrl,
  
  // Authentication endpoints
  LOGIN: '/login',
  SIGNUP: '/signup',
  ALL_USERS: '/allUsers',
  
  // Weight tracking endpoints
  WEIGHTS: {
    ADD_WEIGHT: '/api/weights/addWeight',
    DAILY_AVERAGES: '/api/weights/dailyAverages'
  },
  
  // Habits endpoints
  HABITS: {
    GET_ALL: '/api/habits/allHabits',
    CREATE: '/api/habits/addHabit',
    GET_ENTRIES: '/api/habits/allHabitEntries',
    CREATE_ENTRY: '/api/habits/addHabitEntry',
    DELETE_ENTRY: '/api/habits/deleteHabitEntry'
  }
};

// Helper function to build full URLs
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Pre-built URLs for common endpoints
export const API_URLS = {
  LOGIN: buildApiUrl(API_CONFIG.LOGIN),
  SIGNUP: buildApiUrl(API_CONFIG.SIGNUP),
  ALL_USERS: buildApiUrl(API_CONFIG.ALL_USERS),
  ADD_WEIGHT: buildApiUrl(API_CONFIG.WEIGHTS.ADD_WEIGHT),
  DAILY_AVERAGES: buildApiUrl(API_CONFIG.WEIGHTS.DAILY_AVERAGES),
  HABITS: {
    GET_ALL: buildApiUrl(API_CONFIG.HABITS.GET_ALL),
    CREATE: buildApiUrl(API_CONFIG.HABITS.CREATE),
    GET_ENTRIES: buildApiUrl(API_CONFIG.HABITS.GET_ENTRIES),
    CREATE_ENTRY: buildApiUrl(API_CONFIG.HABITS.CREATE_ENTRY),
    DELETE_ENTRY: buildApiUrl(API_CONFIG.HABITS.DELETE_ENTRY)
  }
}; 