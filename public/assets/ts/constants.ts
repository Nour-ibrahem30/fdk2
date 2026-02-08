/**
 * Application Constants
 * Centralized constants for the entire application
 */

// ============================================================================
// PAGE ROUTES & REDIRECTS
// ============================================================================
export const REDIRECT_URLS = {
  LOGIN: '/public/pages/login.html',
  STUDENT_PROFILE: '/public/pages/profile.html',
  TEACHER_DASHBOARD: '/public/pages/dashboard.html',
  VIDEOS: '/public/pages/videos.html',
  EXAMS: '/public/pages/exams.html',
  MATERIALS: '/public/pages/materials.html',
  NOTES: '/public/pages/notes.html',
  HOME: '/public/pages/index.html'
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================
export const API_ENDPOINTS = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    CHECK_AUTH: '/auth/check'
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile/update',
    GET_USER: '/users/:userId',
    LIST_USERS: '/users',
    DELETE_ACCOUNT: '/users/account/delete'
  },

  // Exams
  EXAMS: {
    LIST: '/exams',
    GET: '/exams/:examId',
    CREATE: '/exams/create',
    UPDATE: '/exams/:examId/update',
    DELETE: '/exams/:examId/delete',
    SUBMIT: '/exams/:examId/submit',
    GET_RESULTS: '/exams/:examId/results'
  },

  // Materials
  MATERIALS: {
    LIST: '/materials',
    GET: '/materials/:materialId',
    UPLOAD: '/materials/upload',
    DELETE: '/materials/:materialId/delete'
  },

  // Videos
  VIDEOS: {
    LIST: '/videos',
    GET: '/videos/:videoId',
    UPLOAD: '/videos/upload',
    DELETE: '/videos/:videoId/delete',
    GET_COMMENTS: '/videos/:videoId/comments'
  },

  // Notes
  NOTES: {
    LIST: '/notes',
    GET: '/notes/:noteId',
    CREATE: '/notes/create',
    UPDATE: '/notes/:noteId/update',
    DELETE: '/notes/:noteId/delete'
  },

  // Logs
  LOGS: {
    ERROR: '/logs/errors',
    INFO: '/logs/info'
  }
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'بيانات دخول غير صحيحة',
  EMAIL_ALREADY_EXISTS: 'البريد الإلكتروني مسجل بالفعل',
  USER_NOT_FOUND: 'المستخدم غير موجود',
  WEAK_PASSWORD: 'كلمة المرور ضعيفة جداً',
  INVALID_EMAIL: 'عنوان بريد إلكتروني غير صحيح',
  EMAIL_NOT_VERIFIED: 'البريد الإلكتروني غير مؤكد',
  SESSION_EXPIRED: 'انتهت صلاحية الجلسة',
  UNAUTHORIZED: 'غير مصرح لك بهذا الإجراء',

  // Validation
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_FORMAT: 'الصيغة غير صحيحة',
  MIN_LENGTH: 'النص قصير جداً',
  MAX_LENGTH: 'النص طويل جداً',

  // Network
  NETWORK_ERROR: 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت',
  TIMEOUT: 'انتهت مهلة الانتظار. حاول مرة أخرى',
  SERVER_ERROR: 'خطأ في الخادم. حاول لاحقاً',

  // File Upload
  FILE_TOO_LARGE: 'الملف كبير جداً',
  INVALID_FILE_TYPE: 'نوع الملف غير مدعوم',
  UPLOAD_FAILED: 'فشل تحميل الملف',

  // Database
  DATABASE_ERROR: 'خطأ في قاعدة البيانات',
  ITEM_NOT_FOUND: 'العنصر غير موجود',
  ITEM_ALREADY_EXISTS: 'العنصر موجود بالفعل',

  // Generic
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً',
  OPERATION_FAILED: 'فشل الإجراء',
  SUCCESS: 'تم الإجراء بنجاح'
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================
export const SUCCESS_MESSAGES = {
  LOGIN: 'تم تسجيل الدخول بنجاح',
  LOGOUT: 'تم تسجيل الخروج بنجاح',
  REGISTER: 'تم التسجيل بنجاح',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  EXAM_SUBMITTED: 'تم إرسال الاختبار بنجاح',
  NOTE_CREATED: 'تم إنشاء الملاحظة بنجاح',
  NOTE_UPDATED: 'تم تحديث الملاحظة بنجاح',
  NOTE_DELETED: 'تم حذف الملاحظة بنجاح',
  UPLOAD_SUCCESS: 'تم التحميل بنجاح',
  DELETE_SUCCESS: 'تم الحذف بنجاح'
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================
export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'philosopher_auth_token',
  REFRESH_TOKEN: 'philosopher_refresh_token',
  USER_DATA: 'philosopher_user_data',
  USER_ROLE: 'philosopher_user_role',

  // User Preferences
  THEME: 'philosopher_theme',
  LANGUAGE: 'philosopher_language',
  NOTIFICATIONS_ENABLED: 'philosopher_notifications_enabled',

  // Cache
  EXAMS_CACHE: 'philosopher_exams_cache',
  MATERIALS_CACHE: 'philosopher_materials_cache',
  VIDEOS_CACHE: 'philosopher_videos_cache',
  NOTES_CACHE: 'philosopher_notes_cache',

  // Session
  LAST_PAGE: 'philosopher_last_page',
  SESSION_TIMESTAMP: 'philosopher_session_timestamp'
} as const;

// ============================================================================
// PAGE ROUTES
// ============================================================================
export const PAGE_ROUTES = {
  HOME: '/',
  LOGIN: '/login.html',
  DASHBOARD: '/dashboard.html',
  PROFILE: '/profile.html',
  TEACHER_PROFILE: '/teacher-profile.html',
  EXAMS: '/exams.html',
  MATERIALS: '/materials.html',
  VIDEOS: '/videos.html',
  NOTES: '/notes.html',
  NOT_FOUND: '/404.html',
  UNAUTHORIZED: '/401.html'
} as const;

// ============================================================================
// USER ROLES
// ============================================================================
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  GUEST: 'guest'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ============================================================================
// PAGINATION
// ============================================================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
} as const;

// ============================================================================
// FILE UPLOAD CONFIG
// ============================================================================
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
  
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
} as const;

// ============================================================================
// TIME CONSTANTS (in milliseconds)
// ============================================================================
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  
  // API/Network timeouts
  REQUEST_TIMEOUT: 30 * 1000, // 30 seconds
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  CACHE_EXPIRY: 5 * 60 * 1000 // 5 minutes
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^[\d+\-\s()]+$/,
  URL: /^https?:\/\/.+/,
  ARABIC_TEXT: /[\u0600-\u06FF]/
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================
export const DEFAULT_VALUES = {
  ITEMS_PER_PAGE: 10,
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 3000,
  ANIMATION_DURATION_MS: 300
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_COMMENTS: true,
  ENABLE_SOCIAL_SHARING: true,
  MAINTENANCE_MODE: false
} as const;
