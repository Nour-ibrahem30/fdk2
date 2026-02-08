/**
 * Error Handler and Logger Utility
 * Provides centralized error handling and logging functionality
 */

export enum ErrorType {
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    VALIDATION = 'VALIDATION',
    NETWORK = 'NETWORK',
    DATABASE = 'DATABASE',
    FILE_UPLOAD = 'FILE_UPLOAD',
    UNKNOWN = 'UNKNOWN'
}

export interface ErrorContext {
    type?: ErrorType;
    message: string;
    code?: string;
    timestamp?: Date;
    context?: string;
    userId?: string;
    additionalData?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
        public message: string,
        public type: ErrorType = ErrorType.UNKNOWN,
        public code?: string,
        public additionalData?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ErrorHandler {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  private static errorLog: ErrorContext[] = [];
  private static maxLogSize = 100;

  /**
     * Handle error with logging and user notification
     */
  static async handle(error: any, context?: string): Promise<void> {
    const errorContext = this.parseError(error, context);

    // Log error
    this.storeError(errorContext);

    // Log to console in development
    if (this.isDevelopment) {
      console.error('Error:', errorContext);
    }

    // Log to server in production
    if (!this.isDevelopment) {
      await this.sendToServer(errorContext);
    }

    // Show user-friendly notification
    this.notifyUser(errorContext);
  }

  /**
     * Parse error object to standardized ErrorContext
     */
  private static parseError(error: any, context?: string): ErrorContext {
    let errorContext: ErrorContext = {
      message: 'حدث خطأ غير متوقع',
      type: ErrorType.UNKNOWN,
      timestamp: new Date(),
      context
    };

    if (error instanceof AppError) {
      errorContext = {
        message: error.message,
        type: error.type,
        code: error.code,
        additionalData: error.additionalData,
        timestamp: new Date(),
        context
      };
    } else if (error instanceof Error) {
      errorContext.message = error.message;
      errorContext.code = error.name;
    } else if (typeof error === 'string') {
      errorContext.message = error;
    } else if (error?.response) {
      // Handle API response errors
      errorContext.type = ErrorType.NETWORK;
      errorContext.message = error.response.data?.message || error.message;
      errorContext.code = error.response.status?.toString();
    }

    return errorContext;
  }

  /**
     * Store error in memory log
     */
  private static storeError(errorContext: ErrorContext): void {
    this.errorLog.push(errorContext);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  /**
     * Send error to server for logging
     */
  private static async sendToServer(errorContext: ErrorContext): Promise<void> {
    try {
      await fetch('/api/logs/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorContext)
      });
    } catch (err) {
      // Silently fail to avoid infinite error loops
      console.error('Failed to send error to server:', err);
    }
  }

  /**
     * Notify user of error
     */
  private static notifyUser(errorContext: ErrorContext): void {
    // This would integrate with your toast/notification system
    const message = errorContext.message || 'حدث خطأ. يرجى محاولة مرة أخرى.';

    // Dispatch custom event for notification system
    window.dispatchEvent(
      new CustomEvent('app-error', { detail: { message, type: 'error' } })
    );
  }

  /**
     * Log info message
     */
  static log(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, data || '');
    }

    this.storeLog('INFO', message, data);
  }

  /**
     * Log warning message
     */
  static warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }

    this.storeLog('WARN', message, data);
  }

  /**
     * Log error message
     */
  static logError(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, data || '');
    }

    this.storeLog('ERROR', message, data);
  }

  /**
     * Log debug message (development only)
     */
  static debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
     * Store log entry
     */
  private static storeLog(level: string, message: string, data?: any): void {
    this.errorLog.push({
      message: `[${level}] ${message}`,
      timestamp: new Date(),
      additionalData: data
    } as ErrorContext);

    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  /**
     * Get all stored logs
     */
  static getLogs(): ErrorContext[] {
    return [...this.errorLog];
  }

  /**
     * Clear all stored logs
     */
  static clearLogs(): void {
    this.errorLog = [];
  }

  /**
     * Export logs to JSON
     */
  static exportLogs(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }

  /**
     * Get last error
     */
  static getLastError(): ErrorContext | null {
    return this.errorLog.length > 0
      ? this.errorLog[this.errorLog.length - 1]
      : null;
  }
}

/**
 * Global error event handler
 */
window.addEventListener('error', (event: ErrorEvent) => {
  ErrorHandler.handle(event.error, 'Uncaught Error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection');
});
