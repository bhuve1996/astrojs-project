/**
 * Interactive Features JavaScript
 *
 * Handles modals, dropdowns, forms, and other interactive elements
 * Vanilla JavaScript implementation (no jQuery dependency)
 * Replaces all jQuery functionality from scraped HTML
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
      const closeButtons = modal.querySelectorAll('.cd-popup-close, .img-replace');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          closeModal(modal);
        });
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
   * Language dropdown functionality
   */
  function initLanguageDropdown() {
    const languageSelector = document.querySelector('.language-selector');
    const languageToggle = document.querySelector('.language-selector-toggle');

    if (languageSelector && languageToggle) {
      languageToggle.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        languageSelector.classList.toggle('open');
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (!languageSelector.contains(e.target)) {
          languageSelector.classList.remove('open');
        }
      });
    }
  }

  /**
   * Dropdown functionality (generic)
   */
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown, [data-dropdown]');

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle, [data-dropdown-toggle]');
      const menu = dropdown.querySelector('.dropdown-menu, [data-dropdown-menu]');

      if (toggle && menu) {
        toggle.addEventListener('click', e => {
          e.preventDefault();
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
   * Build-a-Plan location selection
   */
  function initBuildAPlan() {
    // Build plan state
    const buildPlan = {
      locations: [],
      total: 0,
    };

    // Toggle location selection
    window.toggleAlcLocation = function (id) {
      const index = buildPlan.locations.indexOf(id);
      if (index === -1) {
        selectAlcLocation(id);
      } else {
        deselectAlcLocation(id);
      }
    };

    function selectAlcLocation(id) {
      if (buildPlan.locations.indexOf(id) === -1 && buildPlan.locations.length < 7) {
        buildPlan.locations.push(id);
        buildPlan.total++;

        const locElement = document.getElementById(`bap-loc${id}`);
        if (locElement) {
          const selectBtn = locElement.querySelector('.bap-select');
          const deselectBtn = locElement.querySelector('.bap-deselect');
          if (selectBtn) selectBtn.style.display = 'none';
          if (deselectBtn) deselectBtn.style.display = 'block';
        }

        updateBuildPlanUI();
      } else if (buildPlan.locations.length >= 7) {
        const maxMsg = document.getElementById('max-msg');
        if (maxMsg) {
          maxMsg.style.display = 'block';
          setTimeout(() => {
            maxMsg.style.display = 'none';
          }, 3000);
        }
      }
    }

    function deselectAlcLocation(id) {
      const index = buildPlan.locations.indexOf(id);
      if (index > -1) {
        buildPlan.locations.splice(index, 1);
        if (buildPlan.total > 0) {
          buildPlan.total--;
        }

        const locElement = document.getElementById(`bap-loc${id}`);
        if (locElement) {
          const selectBtn = locElement.querySelector('.bap-select');
          const deselectBtn = locElement.querySelector('.bap-deselect');
          if (selectBtn) selectBtn.style.display = 'block';
          if (deselectBtn) deselectBtn.style.display = 'none';
        }

        updateBuildPlanUI();
      }
    }

    function updateBuildPlanUI() {
      // Update total display if exists
      const totalElement = document.querySelector('.bap-total');
      if (totalElement) {
        totalElement.textContent = `$${buildPlan.total}`;
      }

      // Show/hide pay button based on minimum
      const payButton = document.getElementById('bap-pay-btn');
      if (payButton) {
        if (buildPlan.total >= 3) {
          payButton.style.display = 'block';
        } else {
          payButton.style.display = 'none';
        }
      }
    }

    // Build-a-plan modal functions
    window.openBuildPlanModal = function () {
      const modal = document.querySelector('.cd-popup.bap');
      if (modal) {
        openModal(modal);
      }
    };

    window.closeBuildPLanModal = function () {
      const modal = document.querySelector('.cd-popup.bap');
      if (modal) {
        closeModal(modal);
      }
    };

    window.bapPayButtonClick = function () {
      if (buildPlan.total <= 2) {
        const maxMsg = document.getElementById('max-msg');
        if (maxMsg) {
          const h1 = maxMsg.querySelector('h1');
          if (h1) {
            h1.textContent = 'The minimum purchase is $3.';
            h1.style.lineHeight = '30px';
          }
          maxMsg.style.display = 'block';
        }
      } else {
        window.closeBuildPLanModal();
        // Trigger gift buy now click
        const giftBtn = document.getElementById('gift-buynow');
        if (giftBtn) {
          giftBtn.click();
        }
      }
    };

    // Handle onclick attributes on location items
    document.querySelectorAll('.bap-loc-item[onclick]').forEach(item => {
      const onclick = item.getAttribute('onclick');
      if (onclick && onclick.includes('toggleAlcLocation')) {
        const match = onclick.match(/toggleAlcLocation\((\d+)\)/);
        if (match) {
          const id = parseInt(match[1], 10);
          item.removeAttribute('onclick');
          item.addEventListener('click', () => window.toggleAlcLocation(id));
        }
      }
    });
  }

  /**
   * Payment form interactions
   */
  function initPaymentForms() {
    // Payment option selection
    document.querySelectorAll('.payment_opt').forEach(option => {
      option.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.payment_opt').forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');

        const method = this.getAttribute('data-id');
        if (method) {
          // Update renewal text
          const renewOption = document.querySelector('.renew_option h1');
          if (renewOption) {
            if (method === 'coinpay' || method === 'paywall' || method === 'paypal') {
              renewOption.textContent = 'One-time payment';
            } else {
              renewOption.textContent = 'Renews automatically. Cancel anytime.';
            }
          }

          // Show/hide paywall options
          ['paywall_month', 'paywall_year', 'paywall_alc'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });

          // Show pay buttons
          document.querySelectorAll('.pay_btn').forEach(btn => {
            btn.style.display = 'block';
          });
        }
      });
    });

    // Plan selection buttons
    ['month-buynow', 'year-buynow', 'gift-buynow'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          handlePlanSelection(id);
        });
      }
    });

    // Handle hash-based navigation
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const targetMap = {
        month: '#pro-monthly-box',
        year: '#pro-yearly-box',
        gift: '#pro-gift-box',
      };

      if (targetMap[hash]) {
        setTimeout(() => {
          const target = document.querySelector(targetMap[hash]);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              const btn = document.getElementById(`${hash}-buynow`);
              if (btn) btn.click();
            }, 500);
          }
        }, 100);
      }
    }
  }

  function handlePlanSelection(buttonId) {
    // This would trigger the payment modal
    // For now, just log - actual implementation depends on payment integration
    console.log('Plan selected:', buttonId);
  }

  /**
   * Input field handlers
   */
  function initInputHandlers() {
    // Real-time validation
    document.querySelectorAll('input[type="email"], input[required]').forEach(input => {
      input.addEventListener('blur', function () {
        if (this.hasAttribute('required') && !this.value.trim()) {
          this.classList.add('error');
        } else {
          this.classList.remove('error');
        }

        if (this.type === 'email' && this.value) {
          if (!isValidEmail(this.value)) {
            this.classList.add('error');
          } else {
            this.classList.remove('error');
          }
        }
      });

      input.addEventListener('input', function () {
        if (this.classList.contains('error') && this.value.trim()) {
          this.classList.remove('error');
        }
      });
    });
  }

  /**
   * Handle all onclick attributes in HTML
   */
  function initOnclickHandlers() {
    // Find all elements with onclick attributes
    document.querySelectorAll('[onclick]').forEach(element => {
      const onclick = element.getAttribute('onclick');
      if (onclick) {
        // Remove onclick attribute
        element.removeAttribute('onclick');

        // Parse and handle common patterns
        if (onclick.includes('openModal') || onclick.includes('openBuildPlanModal')) {
          element.addEventListener('click', e => {
            e.preventDefault();
            const modal = document.querySelector('.cd-popup.bap');
            if (modal) openModal(modal);
          });
        } else if (onclick.includes('closeModal') || onclick.includes('closeBuildPLanModal')) {
          element.addEventListener('click', e => {
            e.preventDefault();
            const modal = document.querySelector('.cd-popup.bap');
            if (modal) closeModal(modal);
          });
        } else if (onclick.includes('continue_payment')) {
          element.addEventListener('click', e => {
            e.preventDefault();
            const warningModal = document.querySelector('.cd-popup.warning');
            if (warningModal) closeModal(warningModal);
            const giftBtn = document.getElementById('gift-buynow');
            if (giftBtn) giftBtn.click();
          });
        } else if (onclick.includes('toggleAlcLocation')) {
          // Already handled in initBuildAPlan
        } else {
          // Generic onclick handler - try to execute safely
          try {
            element.addEventListener('click', function (e) {
              // Create a safe execution context
              const func = new Function('event', onclick);
              func.call(this, e);
            });
          } catch (err) {
            console.warn('Could not convert onclick:', onclick, err);
          }
        }
      }
    });
  }

  /**
   * Form validation
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate], form#payment-form');

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
   * Smooth scroll to anchor
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && href !== '#0') {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /**
   * Initialize all interactive features
   */
  function initInteractive() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initModals();
        initLanguageDropdown();
        initDropdowns();
        initBuildAPlan();
        initPaymentForms();
        initInputHandlers();
        initOnclickHandlers();
        initFormValidation();
        initSmoothScroll();
      });
    } else {
      initModals();
      initLanguageDropdown();
      initDropdowns();
      initBuildAPlan();
      initPaymentForms();
      initInputHandlers();
      initOnclickHandlers();
      initFormValidation();
      initSmoothScroll();
    }
  }

  // Auto-initialize
  initInteractive();
})();
