/**
 * Toast Notification Component
 * @description Reusable toast notification system with accessibility features
 * @module components/toast
 */

import { createElement, on, addClass, removeClass } from '../utils/dom-utils';
import { generateUID } from '../utils/common';
import type { ToastType } from '../types';

/**
 * Toast Manager Class
 * Manages multiple toast notifications
 */
export class ToastManager {
  private static instance: ToastManager;
  private container: HTMLDivElement;
  private toasts: Map<string, Toast> = new Map();
  private maxToasts = 5;

  /**
     * Private constructor for singleton pattern
     */
  private constructor() {
    this.container = createElement('div', { id: 'toast-container' }, 'toast-container');
    document.body.appendChild(this.container);
  }

  /**
     * Get singleton instance
     * @returns {ToastManager} Singleton instance
     */
  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {ToastType} [type='info'] - Toast type
     * @param {number} [duration=3000] - Duration in milliseconds
     * @returns {Toast} Toast instance
     */
  show(message: string, type: ToastType = 'info', duration: number = 3000): Toast {
    if (this.toasts.size >= this.maxToasts) {
      const firstToast = this.toasts.values().next().value;
      if (firstToast) {
        firstToast.close();
      }
    }

    const toast = new Toast({ message, type, duration });
    this.container.appendChild(toast.getElement());
    this.toasts.set(toast.getId(), toast);

    toast.onClose(() => {
      this.toasts.delete(toast.getId());
    });

    return toast;
  }

  /**
     * Show success toast
     * @param {string} message - Message
     * @param {number} [duration=3000] - Duration
     * @returns {Toast} Toast instance
     */
  success(message: string, duration?: number): Toast {
    return this.show(message, 'success', duration);
  }

  /**
     * Show error toast
     * @param {string} message - Message
     * @param {number} [duration=5000] - Duration
     * @returns {Toast} Toast instance
     */
  error(message: string, duration: number = 5000): Toast {
    return this.show(message, 'error', duration);
  }

  /**
     * Show info toast
     * @param {string} message - Message
     * @param {number} [duration=3000] - Duration
     * @returns {Toast} Toast instance
     */
  info(message: string, duration?: number): Toast {
    return this.show(message, 'info', duration);
  }

  /**
     * Show warning toast
     * @param {string} message - Message
     * @param {number} [duration=4000] - Duration
     * @returns {Toast} Toast instance
     */
  warning(message: string, duration: number = 4000): Toast {
    return this.show(message, 'warning', duration);
  }

  /**
     * Close all toasts
     */
  closeAll(): void {
    this.toasts.forEach(toast => toast.close());
  }

  /**
     * Get all active toasts
     * @returns {Toast[]} Array of active toasts
     */
  getToasts(): Toast[] {
    return Array.from(this.toasts.values());
  }
}

/**
 * Toast Class
 * Individual toast notification
 */
export class Toast {
  private id: string;
  private element: HTMLDivElement;
  private message: string;
  private type: ToastType;
  private duration: number;
  private timeout?: NodeJS.Timeout;
  private closeCallbacks: (() => void)[] = [];
  private listeners: (() => void)[] = [];

  /**
     * Create a new Toast
     * @param {Object} options - Toast options
     * @param {string} options.message - Message text
     * @param {ToastType} [options.type='info'] - Toast type
     * @param {number} [options.duration=3000] - Duration in milliseconds
     */
  constructor(options: {
        message: string;
        type?: ToastType;
        duration?: number;
    }) {
    this.id = generateUID();
    this.message = options.message;
    this.type = options.type || 'info';
    this.duration = options.duration || 3000;

    // Create element
    this.element = createElement('div', { id: this.id, role: 'alert' }, `toast toast-${this.type}`);

    // Add icon
    const icon = createElement('span', { class: `toast-icon toast-icon-${this.type}` });
    icon.innerHTML = this.getIcon();

    // Add message
    const messageEl = createElement('span', { class: 'toast-message' });
    messageEl.textContent = this.message;

    // Add close button
    const closeBtn = createElement('button', {
      type: 'button',
      class: 'toast-close',
      'aria-label': 'إغلاق الإشعار'
    });
    closeBtn.innerHTML = '×';

    this.element.appendChild(icon);
    this.element.appendChild(messageEl);
    this.element.appendChild(closeBtn);

    // Setup listeners
    this.listeners.push(on(closeBtn, 'click', () => this.close()));

    // Auto close
    if (this.duration > 0) {
      this.timeout = setTimeout(() => this.close(), this.duration);
    }

    // Add enter animation
    setTimeout(() => addClass(this.element, 'show'), 10);
  }

  /**
     * Get appropriate icon for toast type
     * @returns {string} Icon HTML
     */
  private getIcon(): string {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ⓘ',
      warning: '⚠'
    };
    return icons[this.type];
  }

  /**
     * Get toast ID
     * @returns {string} Toast ID
     */
  getId(): string {
    return this.id;
  }

  /**
     * Get toast element
     * @returns {HTMLDivElement} Toast element
     */
  getElement(): HTMLDivElement {
    return this.element;
  }

  /**
     * Set close callback
     * @param {() => void} callback - Callback function
     */
  onClose(callback: () => void): void {
    this.closeCallbacks.push(callback);
  }

  /**
     * Close toast
     */
  close(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    removeClass(this.element, 'show');

    setTimeout(() => {
      this.element.parentNode?.removeChild(this.element);
      this.listeners.forEach(listener => listener());
      this.listeners = [];
      this.closeCallbacks.forEach(callback => callback());
      this.closeCallbacks = [];
    }, 300);
  }
}

// Export singleton instance
export const toastManager = ToastManager.getInstance();
