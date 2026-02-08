/**
 * Common Utilities
 * @description General utility functions for common operations
 * @module utils/common
 */

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 * @template T - Function type
 * @param {T} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {(...args: any[]) => void} Debounced function
 */
export function debounce<T extends(...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @template T - Function type
 * @param {T} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {(...args: any[]) => void} Throttled function
 */
export function throttle<T extends(...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Clone object
 * @template T - Object type
 * @param {T} obj - Object to clone
 * @returns {T} Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (obj instanceof Object) {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (cloned as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Merge objects
 * @template T - Object type
 * @param {T} target - Target object
 * @param {...any[]} sources - Source objects
 * @returns {T} Merged object
 */
export function merge<T extends Record<string, any>>(target: T, ...sources: any[]): T {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        merge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return merge(target, ...sources);
}

/**
 * Check if value is object
 * @param {any} item - Item to check
 * @returns {boolean} Whether item is object
 */
export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Format date
 * @param {Date | string | number} date - Date to format
 * @param {string} [format] - Format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get URL parameter
 * @param {string} name - Parameter name
 * @returns {string | null} Parameter value or null
 */
export function getURLParameter(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Copy to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
    throw err;
  }
}

/**
 * Scroll to element
 * @param {HTMLElement} element - Element to scroll to
 * @param {boolean} [smooth] - Smooth scroll
 */
export function scrollToElement(element: HTMLElement, smooth: boolean = true): void {
  element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
}

/**
 * Get scroll position
 * @returns {{x: number, y: number}} Scroll position
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset
  };
}

/**
 * Check if user is online
 * @returns {boolean} Whether user is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get device type
 * @returns {'mobile' | 'tablet' | 'desktop'} Device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) {
    return 'mobile';
  }
  if (width < 1024) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Retry async operation
 * @param {() => Promise<T>} fn - Function to retry
 * @param {number} [maxAttempts=3] - Maximum attempts
 * @param {number} [delayMs=1000] - Delay between attempts
 * @returns {Promise<T>} Function result
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error;
      }
      await delay(delayMs);
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Capitalize string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create CSV from array of objects
 * @param {Record<string, any>[]} data - Data array
 * @param {string[]} columns - Column names
 * @returns {string} CSV string
 */
export function createCSV(data: Record<string, any>[], columns: string[]): string {
  const headers = columns.join(',');
  const rows = data.map(row => columns.map(col => row[col]).join(','));
  return [headers, ...rows].join('\n');
}
