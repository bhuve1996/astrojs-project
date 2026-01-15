/**
 * Client-side utilities initialization
 * Main entry point for all interactive components
 */

import { initDropdowns } from './dropdown';
import { initMobileMenu } from './mobile-menu';
import { initModals } from './modals';
import { initFormValidation } from './forms';

/**
 * Initialize all interactive components
 */
export function initInteractiveComponents() {
  // Initialize dropdowns
  initDropdowns();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize modals
  initModals();
  
  // Initialize form validation for all forms
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-validate-form]');
  forms.forEach((form) => {
    initFormValidation(form);
  });
  
  // Initialize smooth scrolling for anchor links
  initSmoothScroll();
  
  // Initialize click handlers for buttons
  initButtonHandlers();
}

/**
 * Initialize smooth scrolling
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

/**
 * Initialize button click handlers
 */
function initButtonHandlers() {
  // Handle buttons with data-action attribute
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', (e) => {
      const action = button.getAttribute('data-action');
      if (action) {
        const event = new CustomEvent('button:action', {
          detail: { action, button }
        });
        document.dispatchEvent(event);
      }
    });
  });
  
  // Handle copy to clipboard buttons
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.getAttribute('data-copy');
      if (text) {
        try {
          await navigator.clipboard.writeText(text);
          button.dispatchEvent(new CustomEvent('copy:success'));
          // Show temporary success message
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => {
            if (originalText) button.textContent = originalText;
          }, 2000);
        } catch (err) {
          button.dispatchEvent(new CustomEvent('copy:error', { detail: { error: err } }));
        }
      }
    });
  });
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveComponents);
  } else {
    initInteractiveComponents();
  }
}
