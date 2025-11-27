export const API_BASE_URL = 'https://localhost:7020';
export const API_TIMEOUT = 10000;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

export const APP_CONFIG = {
  LIBRARY_NAME: 'Smart Library',
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  WELCOME: '/welcome',
  USER_DASHBOARD: '/user/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  LIBRARIAN_DASHBOARD: '/librarian/dashboard',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Backend server is not running. Please start your .NET API server.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;