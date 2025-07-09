export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: 'https://basic-app2-backend.onrender.com',
  
  // Authentication endpoints
  LOGIN: '/login',
  SIGNUP: '/signup',
  ALL_USERS: '/allUsers',
  
  // Weight tracking endpoints
  WEIGHTS: {
    ADD_WEIGHT: '/api/weights/addWeight',
    DAILY_AVERAGES: '/api/weights/dailyAverages'
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
  DAILY_AVERAGES: buildApiUrl(API_CONFIG.WEIGHTS.DAILY_AVERAGES)
}; 