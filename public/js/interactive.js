/**
 * Interactive Features JavaScript
 *
 * Handles modals, dropdowns, forms, and other interactive elements
 * Vanilla JavaScript implementation (no jQuery dependency)
 */

/* eslint-env browser */
(function () {
  'use strict';

  /**
   * Close a modal
   */
  function closeModal(modalSelector) {
    const modal =
      typeof modalSelector === 'string' ? document.querySelector(modalSelector) : modalSelector;

    if (modal) {
      modal.classList.remove('is-visible');
      document.body.style.overflow = '';
    }
  }

  /**
   * Open a modal
   */
  function openModal(modalSelector) {
    const modal =
      typeof modalSelector === 'string' ? document.querySelector(modalSelector) : modalSelector;

    if (modal) {
      modal.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Modal/Popup functionality
   */
  function initModals() {
    const modals = document.querySelectorAll('.cd-popup');

    modals.forEach(modal => {
      // Close button
      const closeButtons = modal.querySelectorAll('.cd-popup-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
      });

      // Close on background click
      modal.addEventListener('click', event => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Close on ESC key
    document.addEventListener('keyup', event => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        modals.forEach(modal => {
          if (modal.classList.contains('is-visible')) {
            closeModal(modal);
          }
        });
      }
    });
  }

  // Expose functions globally
  window.openModal = openModal;
  window.closeModal = closeModal;

  /**
   * Dropdown functionality
   */
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown, [data-dropdown]');

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle, [data-dropdown-toggle]');
      const menu = dropdown.querySelector('.dropdown-menu, [data-dropdown-menu]');

      if (toggle && menu) {
        toggle.addEventListener('click', e => {
          e.stopPropagation();
          const isOpen = dropdown.classList.contains('is-open');

          // Close all other dropdowns
          dropdowns.forEach(d => {
            if (d !== dropdown) {
              d.classList.remove('is-open');
            }
          });

          // Toggle current dropdown
          dropdown.classList.toggle('is-open', !isOpen);
        });
      }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', e => {
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('is-open');
        }
      });
    });
  }

  /**
   * Form validation
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(form => {
      form.addEventListener('submit', e => {
        if (!validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  /**
   * Validate a form
   */
  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
      if (field.value && !isValidEmail(field.value)) {
        isValid = false;
        field.classList.add('error');
      }
    });

    return isValid;
  }

  /**
   * Email validation (supports bro:xxxx format)
   */
  function isValidEmail(email) {
    // Regular email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Windscribe bro:xxxx format
    const broRegex = /^bro:[a-z0-9]+$/;

    return emailRegex.test(email) || broRegex.test(email);
  }

  /**
   * Initialize all interactive features
   */
  function initInteractive() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initModals();
        initDropdowns();
        initFormValidation();
      });
    } else {
      initModals();
      initDropdowns();
      initFormValidation();
    }
  }

  // Auto-initialize
  initInteractive();
})();
