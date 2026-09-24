// Get service URLs from environment variables or use defaults for local development
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5001';
const PROFILE_SERVICE_URL = import.meta.env.VITE_PROFILE_SERVICE_URL || 'http://localhost:5002';
const EXPENSE_SERVICE_URL = import.meta.env.VITE_EXPENSE_SERVICE_URL || 'http://localhost:5003';
const FEED_SERVICE_URL = import.meta.env.VITE_FEED_SERVICE_URL || 'http://localhost:5006';

export const API_ENDPOINTS = {
  // Auth endpoints
  register: `${AUTH_SERVICE_URL}/api/auth/register`,
  login: `${AUTH_SERVICE_URL}/api/auth/login`,
  forgotPassword: `${AUTH_SERVICE_URL}/api/auth/forgot-password`,
  resetPassword: `${AUTH_SERVICE_URL}/api/auth/reset-password`,
  
  // Profile endpoints
  profile: `${PROFILE_SERVICE_URL}/api/profile/profile`,
  userStats: (userId) => `${PROFILE_SERVICE_URL}/api/profile/user-stats/${userId}`,
  
  // Expense endpoints
  expenses: `${EXPENSE_SERVICE_URL}/api/expenses/expenses`,
  deleteExpense: (id) => `${EXPENSE_SERVICE_URL}/api/expenses/expenses/${id}`,
  
  // Feed endpoints
  feed: `${FEED_SERVICE_URL}/api/feed/feed`,
  likeFeed: (postId) => `${FEED_SERVICE_URL}/api/feed/feed/${postId}/like`,
  commentFeed: (postId) => `${FEED_SERVICE_URL}/api/feed/feed/${postId}/comment`,
  deleteFeed: (postId) => `${FEED_SERVICE_URL}/api/feed/feed/${postId}`,
  deleteComment: (postId, commentId) => `${FEED_SERVICE_URL}/api/feed/feed/${postId}/comment/${commentId}`,
};

