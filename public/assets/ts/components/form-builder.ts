/**
 * Form Builder Component
 * @description Reusable form building and validation system
 * @module components/form-builder
 */

import { createElement, on, setAttributes, addClass, removeClass, querySelector } from '../utils/dom-utils';
import { validateRequired } from '../utils/validation';
import { generateUID } from '../utils/common';
import type { FormField, FormState } from '../types';

/**
 * FormBuilder Class
 * Builds accessible, validatable forms
 */
export class FormBuilder {
  private formId: string;
  private formElement: HTMLFormElement;
  private fields: Map<string, FormField> = new Map();
  private fieldElements: Map<string, HTMLElement> = new Map();
  private submitBtn?: HTMLButtonElement;
  private listeners: (() => void)[] = [];
  private state: FormState = {
    fields: {},
    isSubmitting: false,
    isValid: false,
    errors: {}
  };
  private onSubmit?: (data: Record<string, any>) => Promise<void> | void;

  /**
   * Create FormBuilder instance
   * @param {Object} options - Form options
   * @param {string} [options.id] - Form ID
   * @param {string} [options.className] - Form CSS class
   * @param {(data: Record<string, any>) => void} [options.onSubmit] - Submit handler
   */
  constructor(options: {
    id?: string;
    className?: string;
    onSubmit?: (data: Record<string, any>) => Promise<void> | void;
  } = {}) {
    this.formId = options.id || generateUID();
    this.formElement = createElement('form', { id: this.formId }, options.className || 'form-builder');
    this.onSubmit = options.onSubmit;

    // Setup form submission
    this.listeners.push(
      on(this.formElement, 'submit', (e) => this.handleSubmit(e))
    );
  }

  /**
   * Add field to form
   * @param {FormField} field - Field configuration
   * @returns {FormBuilder} This instance for chaining
   */
  addField(field: FormField): FormBuilder {
    this.fields.set(field.name, field);
    this.state.fields[field.name] = field;
    this.renderField(field);
    return this;
  }

  /**
   * Add multiple fields
   * @param {FormField[]} fields - Fields array
   * @returns {FormBuilder} This instance for chaining
   */
  addFields(fields: FormField[]): FormBuilder {
    fields.forEach(field => this.addField(field));
    return this;
  }

  /**
   * Render a form field
   * @param {FormField} field - Field to render
   */
  private renderField(field: FormField): void {
    const fieldContainer = createElement('div', { class: 'form-group' });
    const label = createElement('label', { for: field.name });
    label.textContent = field.label;

    if (field.required) {
      const required = createElement('span', { class: 'required' });
      required.textContent = '*';
      label.appendChild(required);
    }

    let input: HTMLElement;

    switch (field.type) {
    case 'textarea':
      input = createElement('textarea', { id: field.name, name: field.name });
      (input as HTMLTextAreaElement).placeholder = field.placeholder || '';
      (input as HTMLTextAreaElement).value = field.value || '';
      break;

    case 'select':
      input = createElement('select', { id: field.name, name: field.name });
      field.options?.forEach(option => {
        const optionEl = createElement('option', { value: option.value });
        optionEl.textContent = option.label;
        input.appendChild(optionEl);
      });
      (input as HTMLSelectElement).value = field.value || '';
      break;

    case 'checkbox':
    case 'radio':
      input = createElement('div', { class: 'checkbox-group' });
      field.options?.forEach(option => {
        const wrapper = createElement('div', { class: `${field.type}-wrapper` });
        const checkbox = createElement('input', {
          type: field.type,
          id: `${field.name}-${option.value}`,
          name: field.name,
          value: option.value
        });
        const label = createElement('label', { for: `${field.name}-${option.value}` });
        label.textContent = option.label;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        input.appendChild(wrapper);
      });
      break;

    case 'file':
      input = createElement('input', {
        type: 'file',
        id: field.name,
        name: field.name
      });
      break;

    default:
      input = createElement('input', {
        type: field.type,
        id: field.name,
        name: field.name
      });
      (input as HTMLInputElement).placeholder = field.placeholder || '';
      (input as HTMLInputElement).value = field.value || '';
    }

    // Add ARIA attributes
    if (field.required) {
      setAttributes(input, { 'aria-required': 'true' });
    }

    // Setup validation listener
    this.listeners.push(
      on(input, 'blur', () => this.validateField(field.name))
    );

    fieldContainer.appendChild(label);
    fieldContainer.appendChild(input);

    const errorContainer = createElement('div', { class: 'form-error' });
    fieldContainer.appendChild(errorContainer);

    this.formElement.appendChild(fieldContainer);
    this.fieldElements.set(field.name, fieldContainer);
  }

  /**
   * Add submit button
   * @param {Object} options - Button options
   * @param {string} options.label - Button label
   * @param {string} [options.className] - Button CSS class
   * @returns {FormBuilder} This instance for chaining
   */
  addSubmitButton(options: { label: string; className?: string }): FormBuilder {
    this.submitBtn = createElement('button', {
      type: 'submit',
      class: options.className || 'btn-primary'
    });
    this.submitBtn.textContent = options.label;
    this.formElement.appendChild(this.submitBtn);
    return this;
  }

  /**
   * Validate single field
   * @param {string} fieldName - Field name
   * @returns {boolean} Whether field is valid
   */
  validateField(fieldName: string): boolean {
    const field = this.fields.get(fieldName);
    if (!field) {
      return false;
    }

    const input = querySelector<HTMLInputElement>(`#${fieldName}`, this.formElement);
    if (!input) {
      return false;
    }

    const value = this.getFieldValue(fieldName);
    let error: string | undefined;

    // Check required
    if (field.required) {
      const result = validateRequired(value, field.label);
      if (!result.isValid) {
        error = result.error;
      }
    }

    // Custom validation
    if (!error && field.validate) {
      const customResult = field.validate(value);
      if (typeof customResult === 'string') {
        error = customResult;
      } else if (!customResult) {
        error = 'قيمة غير صحيحة';
      }
    }

    this.state.errors[fieldName] = error || '';

    // Update UI
    const fieldContainer = this.fieldElements.get(fieldName);
    if (fieldContainer) {
      const errorEl = querySelector('.form-error', fieldContainer);
      if (errorEl) {
        errorEl.textContent = error || '';
        if (error) {
          addClass(fieldContainer, 'has-error');
        } else {
          removeClass(fieldContainer, 'has-error');
        }
      }
    }

    return !error;
  }

  /**
   * Validate entire form
   * @returns {boolean} Whether form is valid
   */
  validateForm(): boolean {
    let isValid = true;
    this.fields.forEach((_, fieldName) => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });
    this.state.isValid = isValid;
    return isValid;
  }

  /**
   * Get field value
   * @param {string} fieldName - Field name
   * @returns {any} Field value
   */
  getFieldValue(fieldName: string): any {
    const input = querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      `#${fieldName}`,
      this.formElement
    );

    if (!input) {
      return null;
    }

    if (input instanceof HTMLInputElement) {
      if (input.type === 'checkbox' || input.type === 'radio') {
        return input.checked;
      }
      return input.value;
    }

    return (input as any).value;
  }

  /**
   * Get all form data
   * @returns {Record<string, any>} Form data
   */
  getFormData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.fields.forEach((_, fieldName) => {
      data[fieldName] = this.getFieldValue(fieldName);
    });
    return data;
  }

  /**
   * Set field value
   * @param {string} fieldName - Field name
   * @param {any} value - Value to set
   */
  setFieldValue(fieldName: string, value: any): void {
    const input = querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      `#${fieldName}`,
      this.formElement
    );

    if (input) {
      (input as any).value = value;
      const field = this.fields.get(fieldName);
      if (field) {
        field.value = value;
      }
    }
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.state.isSubmitting = true;
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
    }

    try {
      const data = this.getFormData();
      if (this.onSubmit) {
        await this.onSubmit(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      this.state.isSubmitting = false;
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
      }
    }
  }

  /**
   * Reset form
   */
  reset(): void {
    this.formElement.reset();
    this.state.errors = {};
    this.fieldElements.forEach((fieldEl) => {
      removeClass(fieldEl, 'has-error');
    });
  }

  /**
   * Get form element
   * @returns {HTMLFormElement} Form element
   */
  getElement(): HTMLFormElement {
    return this.formElement;
  }

  /**
   * Get form state
   * @returns {FormState} Form state
   */
  getState(): FormState {
    return { ...this.state };
  }

  /**
   * Destroy form
   */
  destroy(): void {
    this.listeners.forEach(listener => listener());
    this.listeners = [];
    this.fieldElements.clear();
    this.fields.clear();
    this.formElement.parentNode?.removeChild(this.formElement);
  }
}
