/**
 * Form validation and handling utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: string) => boolean | string;
}

export interface FormField {
  name: string;
  rules: ValidationRule;
  errorMessage?: string;
}

export interface FormOptions {
  validateOnSubmit?: boolean;
  validateOnBlur?: boolean;
  validateOnInput?: boolean;
  showErrors?: boolean;
}

const defaultOptions: FormOptions = {
  validateOnSubmit: true,
  validateOnBlur: true,
  validateOnInput: false,
  showErrors: true
};

/**
 * Initialize form validation
 */
export function initFormValidation(form: HTMLFormElement, options: FormOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const fields = getFormFields(form);
  
  // Validate on submit
  if (opts.validateOnSubmit) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(form, fields)) {
        form.dispatchEvent(new CustomEvent('form:valid', { detail: { form } }));
        // Allow form submission if valid
        // form.submit();
      } else {
        form.dispatchEvent(new CustomEvent('form:invalid', { detail: { form } }));
      }
    });
  }
  
  // Validate on blur
  if (opts.validateOnBlur) {
    fields.forEach((field) => {
      const input = form.querySelector<HTMLInputElement>(`[name="${field.name}"]`);
      if (input) {
        input.addEventListener('blur', () => {
          validateField(input, field);
        });
      }
    });
  }
  
  // Validate on input (optional)
  if (opts.validateOnInput) {
    fields.forEach((field) => {
      const input = form.querySelector<HTMLInputElement>(`[name="${field.name}"]`);
      if (input) {
        input.addEventListener('input', () => {
          clearFieldError(input);
        });
      }
    });
  }
}

/**
 * Get form fields from data attributes
 */
function getFormFields(form: HTMLFormElement): FormField[] {
  const fields: FormField[] = [];
  const inputs = form.querySelectorAll<HTMLInputElement>('[data-validate]');
  
  inputs.forEach((input) => {
    const rules: ValidationRule = {};
    const validateAttr = input.getAttribute('data-validate') || '';
    
    if (validateAttr.includes('required')) rules.required = true;
    if (validateAttr.includes('email')) rules.email = true;
    if (validateAttr.includes('url')) rules.url = true;
    
    const minLength = input.getAttribute('data-min-length');
    if (minLength) rules.minLength = parseInt(minLength);
    
    const maxLength = input.getAttribute('data-max-length');
    if (maxLength) rules.maxLength = parseInt(maxLength);
    
    const pattern = input.getAttribute('data-pattern');
    if (pattern) rules.pattern = new RegExp(pattern);
    
    fields.push({
      name: input.name,
      rules,
      errorMessage: input.getAttribute('data-error-message') || undefined
    });
  });
  
  return fields;
}

/**
 * Validate entire form
 */
export function validateForm(form: HTMLFormElement, fields?: FormField[]): boolean {
  if (!fields) {
    fields = getFormFields(form);
  }
  
  let isValid = true;
  
  fields.forEach((field) => {
    const input = form.querySelector<HTMLInputElement>(`[name="${field.name}"]`);
    if (input && !validateField(input, field)) {
      isValid = false;
    }
  });
  
  return isValid;
}

/**
 * Validate a single field
 */
export function validateField(input: HTMLInputElement, field: FormField): boolean {
  const value = input.value.trim();
  const rules = field.rules;
  
  // Clear previous errors
  clearFieldError(input);
  
  // Required validation
  if (rules.required && !value) {
    showFieldError(input, field.errorMessage || `${field.name} is required`);
    return false;
  }
  
  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return true;
  }
  
  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    showFieldError(
      input,
      field.errorMessage || `${field.name} must be at least ${rules.minLength} characters`
    );
    return false;
  }
  
  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    showFieldError(
      input,
      field.errorMessage || `${field.name} must be no more than ${rules.maxLength} characters`
    );
    return false;
  }
  
  // Email validation
  if (rules.email && !isValidEmail(value)) {
    showFieldError(input, field.errorMessage || 'Please enter a valid email address');
    return false;
  }
  
  // URL validation
  if (rules.url && !isValidUrl(value)) {
    showFieldError(input, field.errorMessage || 'Please enter a valid URL');
    return false;
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    showFieldError(input, field.errorMessage || `${field.name} format is invalid`);
    return false;
  }
  
  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value);
    if (result !== true) {
      showFieldError(input, typeof result === 'string' ? result : `${field.name} is invalid`);
      return false;
    }
  }
  
  return true;
}

/**
 * Show field error
 */
function showFieldError(input: HTMLInputElement, message: string) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  
  // Create or update error message
  let errorElement = input.parentElement?.querySelector('.error-message');
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    input.parentElement?.appendChild(errorElement);
  }
  errorElement.textContent = message;
}

/**
 * Clear field error
 */
function clearFieldError(input: HTMLInputElement) {
  input.classList.remove('error');
  input.removeAttribute('aria-invalid');
  const errorElement = input.parentElement?.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get form data as object
 */
export function getFormData(form: HTMLFormElement): Record<string, string> {
  const formData = new FormData(form);
  const data: Record<string, string> = {};
  
  formData.forEach((value, key) => {
    data[key] = value.toString();
  });
  
  return data;
}
