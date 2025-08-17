import { environment } from '../../environments/environment';

export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: environment.apiBaseUrl,
  
  // Authentication endpoints
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  SIGNUP: '/api/auth/signup',
  ALL_USERS: '/api/users/allUsers',
  ME: '/api/auth/me',
  
  // Weight tracking endpoints
  WEIGHTS: {
    ADD_WEIGHT: '/api/weights/addWeight',
    DAILY_AVERAGES: '/api/weights/dailyAverages'
  },
  
  // Habits endpoints
  HABITS: {
    GET_ALL: '/api/habits/allHabits',
    CREATE: '/api/habits/addHabit',
    DELETE: '/api/habits/{habitId}',
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
  BASE_URL: API_CONFIG.BASE_URL,
  LOGIN: buildApiUrl(API_CONFIG.LOGIN),
  LOGOUT: buildApiUrl(API_CONFIG.LOGOUT),
  SIGNUP: buildApiUrl(API_CONFIG.SIGNUP),
  ALL_USERS: buildApiUrl(API_CONFIG.ALL_USERS),
  ME: buildApiUrl(API_CONFIG.ME),
  ADD_WEIGHT: buildApiUrl(API_CONFIG.WEIGHTS.ADD_WEIGHT),
  DAILY_AVERAGES: buildApiUrl(API_CONFIG.WEIGHTS.DAILY_AVERAGES),
  HABITS: {
    GET_ALL: buildApiUrl(API_CONFIG.HABITS.GET_ALL),
    CREATE: buildApiUrl(API_CONFIG.HABITS.CREATE),
    DELETE: buildApiUrl(API_CONFIG.HABITS.DELETE),
    GET_ENTRIES: buildApiUrl(API_CONFIG.HABITS.GET_ENTRIES),
    CREATE_ENTRY: buildApiUrl(API_CONFIG.HABITS.CREATE_ENTRY),
    DELETE_ENTRY: buildApiUrl(API_CONFIG.HABITS.DELETE_ENTRY)
  }
}; 