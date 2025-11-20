// src/utils/adminAuthHelpers.ts
// Helper functions for AdminAuthContext
// Separated to fix ESLint fast-refresh warnings

// ============================================
// CONSTANTS
// ============================================
const ADMIN_TOKEN_KEY = 'ADMIN_TOKEN';
const ADMIN_TOKEN_EXPIRY_KEY = 'ADMIN_TOKEN_EXPIRY';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get remaining time until admin token expires (in minutes)
 * @returns number of minutes remaining, or null if no token
 */
export const getTokenRemainingTime = (): number | null => {
  const savedExpiry = localStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
  if (!savedExpiry) return null;

  const expiryTime = parseInt(savedExpiry, 10);
  const currentTime = Date.now();
  const remainingMs = expiryTime - currentTime;

  if (remainingMs <= 0) return 0;

  return Math.floor(remainingMs / 1000 / 60); // Convert to minutes
};

/**
 * Check if admin token exists and is valid
 * @returns true if token exists and hasn't expired, false otherwise
 */
export const isTokenValid = (): boolean => {
  const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const savedExpiry = localStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);

  if (!savedToken || !savedExpiry) return false;

  const expiryTime = parseInt(savedExpiry, 10);
  const currentTime = Date.now();

  return currentTime < expiryTime;
};

/**
 * Get admin token from localStorage
 * @returns token string or null
 */
export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

/**
 * Get token expiry time as Date object
 * @returns Date object or null if no expiry set
 */
export const getTokenExpiryDate = (): Date | null => {
  const savedExpiry = localStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
  if (!savedExpiry) return null;

  const expiryTime = parseInt(savedExpiry, 10);
  return new Date(expiryTime);
};

/**
 * Check if token will expire soon (within given minutes)
 * @param minutes - number of minutes to check
 * @returns true if token expires within the given time
 */
export const isTokenExpiringSoon = (minutes: number = 10): boolean => {
  const remaining = getTokenRemainingTime();
  if (remaining === null) return false;
  return remaining <= minutes && remaining > 0;
};

/**
 * Clear admin token and expiry from localStorage
 * Use this for manual cleanup if needed
 */
export const clearAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
};