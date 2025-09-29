// Auth utility functions

export interface User {
  id: string;
  name: string;
  phone: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
  role: string;
}

// Validation functions
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateAddress = (address: {
  district: string;
  block: string;
  city: string;
  homeLodgeName: string;
}): boolean => {
  return !!(address.district && address.block && address.city && address.homeLodgeName);
};

// Form validation
export const validateSignUpForm = (data: {
  name: string;
  phone: string;
  password: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateName(data.name)) {
    errors.push('Name must be between 2 and 50 characters');
  }

  if (!validatePhone(data.phone)) {
    errors.push('Please enter a valid 10-digit phone number');
  }

  if (!validatePassword(data.password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!validateAddress(data.address)) {
    errors.push('Please fill in all address fields');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSignInForm = (data: {
  phone: string;
  password: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validatePhone(data.phone)) {
    errors.push('Please enter a valid phone number');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Token utilities
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};

// Session management
export const clearAuthData = (): void => {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
};

export const getStoredUser = (): User | null => {
  try {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return sessionStorage.getItem('token');
};

// Address formatting
export const formatAddress = (address: {
  district: string;
  block: string;
  city: string;
  homeLodgeName: string;
}): string => {
  return `${address.homeLodgeName}, ${address.city}, ${address.block}, ${address.district}`;
};

export const getShortAddress = (address: {
  district: string;
  block: string;
  city: string;
  homeLodgeName: string;
}): string => {
  return `${address.city}, ${address.district}`;
};