/**
 * Interactive Features JavaScript
 *
 * Handles modals, dropdowns, forms, and other interactive elements
 * Vanilla JavaScript implementation (no jQuery dependency)
 * Replaces all jQuery functionality from scraped HTML
 * All selectors and settings are config-driven from site.config.ts
 */

/* eslint-env browser */
(function () {
  'use strict';

  // Get config (injected by BaseLayout.astro)
  const getConfig = () => {
    if (window.__INTERACTIVE_CONFIG__) {
      return window.__INTERACTIVE_CONFIG__;
    }

    // Fallback to default config if not injected
    return {
      selectors: {
        modals: '.cd-popup',
        modalClose: '.cd-popup-close, .img-replace',
        languageSelector: '.language-selector',
        languageToggle: '.language-selector-toggle',
        languageMenu: '.language-dropdown-menu',
        dropdown: '.dropdown, [data-dropdown]',
        dropdownToggle: '.dropdown-toggle, [data-dropdown-toggle]',
        dropdownMenu: '.dropdown-menu, [data-dropdown-menu]',
        bapLocationItem: '.bap-loc-item',
        bapSelect: '.bap-select',
        bapDeselect: '.bap-deselect',
        bapTotal: '.bap-total',
        bapPayButton: '#bap-pay-btn',
        bapMaxMsg: '#max-msg',
        paymentOption: '.payment_opt',
        planButtons: {
          month: '#month-buynow',
          year: '#year-buynow',
          gift: '#gift-buynow',
        },
        payButtons: '.pay_btn',
        renewOption: '.renew_option h1',
        paywallElements: ['#paywall_month', '#paywall_year', '#paywall_alc'],
      },
      buildAPlan: {
        maxLocations: 7,
        minPurchase: 3,
        pricePerLocation: 1,
      },
      hashNavigation: {
        targets: {
          month: '#pro-monthly-box',
          year: '#pro-yearly-box',
          gift: '#pro-gift-box',
        },
      },
    };
  };

  const config = getConfig();
  const selectors = config.selectors;
  const buildAPlanConfig = config.buildAPlan;
  const hashNav = config.hashNavigation;

  /**
   * Safe query selector with error handling
   */
  function safeQuerySelector(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (err) {
      console.warn('Invalid selector:', selector, err);
      return null;
    }
  }

  /**
   * Safe query selector all with error handling
   */
  function safeQuerySelectorAll(selector, context = document) {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (err) {
      console.warn('Invalid selector:', selector, err);
      return [];
    }
  }

  /**
   * Close a modal
   */
  function closeModal(modalSelector) {
    const modal =
      typeof modalSelector === 'string' ? safeQuerySelector(modalSelector) : modalSelector;

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
      typeof modalSelector === 'string' ? safeQuerySelector(modalSelector) : modalSelector;

    if (modal) {
      modal.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Modal/Popup functionality
   */
  function initModals() {
    const modals = safeQuerySelectorAll(selectors.modals);

    modals.forEach(modal => {
      // Close button
      const closeButtons = safeQuerySelectorAll(selectors.modalClose, modal);
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
    const languageSelector = safeQuerySelector(selectors.languageSelector);
    const languageToggle = safeQuerySelector(selectors.languageToggle);

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
    const dropdowns = safeQuerySelectorAll(selectors.dropdown);

    dropdowns.forEach(dropdown => {
      const toggle = safeQuerySelector(selectors.dropdownToggle, dropdown);
      const menu = safeQuerySelector(selectors.dropdownMenu, dropdown);

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
      if (
        buildPlan.locations.indexOf(id) === -1 &&
        buildPlan.locations.length < buildAPlanConfig.maxLocations
      ) {
        buildPlan.locations.push(id);
        buildPlan.total += buildAPlanConfig.pricePerLocation;

        const locElement = document.getElementById(`bap-loc${id}`);
        if (locElement) {
          const selectBtn = safeQuerySelector(selectors.bapSelect, locElement);
          const deselectBtn = safeQuerySelector(selectors.bapDeselect, locElement);
          if (selectBtn) selectBtn.style.display = 'none';
          if (deselectBtn) deselectBtn.style.display = 'block';
        }

        updateBuildPlanUI();
      } else if (buildPlan.locations.length >= buildAPlanConfig.maxLocations) {
        const maxMsg = safeQuerySelector(selectors.bapMaxMsg);
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
        if (buildPlan.total >= buildAPlanConfig.pricePerLocation) {
          buildPlan.total -= buildAPlanConfig.pricePerLocation;
        } else {
          buildPlan.total = 0;
        }

        const locElement = document.getElementById(`bap-loc${id}`);
        if (locElement) {
          const selectBtn = safeQuerySelector(selectors.bapSelect, locElement);
          const deselectBtn = safeQuerySelector(selectors.bapDeselect, locElement);
          if (selectBtn) selectBtn.style.display = 'block';
          if (deselectBtn) deselectBtn.style.display = 'none';
        }

        updateBuildPlanUI();
      }
    }

    function updateBuildPlanUI() {
      // Update total display if exists
      const totalElement = safeQuerySelector(selectors.bapTotal);
      if (totalElement) {
        totalElement.textContent = `$${buildPlan.total}`;
      }

      // Show/hide pay button based on minimum
      const payButton = safeQuerySelector(selectors.bapPayButton);
      if (payButton) {
        if (buildPlan.total >= buildAPlanConfig.minPurchase) {
          payButton.style.display = 'block';
        } else {
          payButton.style.display = 'none';
        }
      }
    }

    // Build-a-plan modal functions
    window.openBuildPlanModal = function () {
      const modal = safeQuerySelector(`${selectors.modals}.bap`);
      if (modal) {
        openModal(modal);
      }
    };

    window.closeBuildPLanModal = function () {
      const modal = safeQuerySelector(`${selectors.modals}.bap`);
      if (modal) {
        closeModal(modal);
      }
    };

    window.bapPayButtonClick = function () {
      if (buildPlan.total < buildAPlanConfig.minPurchase) {
        const maxMsg = safeQuerySelector(selectors.bapMaxMsg);
        if (maxMsg) {
          const h1 = maxMsg.querySelector('h1');
          if (h1) {
            h1.textContent = `The minimum purchase is $${buildAPlanConfig.minPurchase}.`;
            h1.style.lineHeight = '30px';
          }
          maxMsg.style.display = 'block';
        }
      } else {
        window.closeBuildPLanModal();
        // Trigger gift buy now click
        const giftBtn = safeQuerySelector(selectors.planButtons.gift);
        if (giftBtn) {
          giftBtn.click();
        }
      }
    };

    // Handle onclick attributes on location items
    safeQuerySelectorAll(`${selectors.bapLocationItem}[onclick]`).forEach(item => {
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
    safeQuerySelectorAll(selectors.paymentOption).forEach(option => {
      option.addEventListener('click', function (e) {
        e.preventDefault();
        safeQuerySelectorAll(selectors.paymentOption).forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');

        const method = this.getAttribute('data-id');
        if (method) {
          // Update renewal text
          const renewOption = safeQuerySelector(selectors.renewOption);
          if (renewOption) {
            if (method === 'coinpay' || method === 'paywall' || method === 'paypal') {
              renewOption.textContent = 'One-time payment';
            } else {
              renewOption.textContent = 'Renews automatically. Cancel anytime.';
            }
          }

          // Show/hide paywall options
          selectors.paywallElements.forEach(id => {
            const el = safeQuerySelector(id);
            if (el) el.style.display = 'none';
          });

          // Show pay buttons
          safeQuerySelectorAll(selectors.payButtons).forEach(btn => {
            btn.style.display = 'block';
          });
        }
      });
    });

    // Plan selection buttons
    Object.entries(selectors.planButtons).forEach(([key, id]) => {
      const btn = safeQuerySelector(id);
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          handlePlanSelection(key);
        });
      }
    });

    // Handle hash-based navigation
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const target = hashNav.targets[hash];

      if (target) {
        setTimeout(() => {
          const targetElement = safeQuerySelector(target);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              const btn = safeQuerySelector(selectors.planButtons[hash]);
              if (btn) btn.click();
            }, 500);
          }
        }, 100);
      }
    }
  }

  function handlePlanSelection(buttonKey) {
    // This would trigger the payment modal
    // For now, just log - actual implementation depends on payment integration
    if (window.__DEBUG__) {
      console.log('Plan selected:', buttonKey);
    }
  }

  /**
   * Input field handlers
   */
  function initInputHandlers() {
    // Real-time validation
    safeQuerySelectorAll('input[type="email"], input[required]').forEach(input => {
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
    safeQuerySelectorAll('[onclick]').forEach(element => {
      const onclick = element.getAttribute('onclick');
      if (onclick) {
        // Remove onclick attribute
        element.removeAttribute('onclick');

        // Parse and handle common patterns
        if (onclick.includes('openModal') || onclick.includes('openBuildPlanModal')) {
          element.addEventListener('click', e => {
            e.preventDefault();
            const modal = safeQuerySelector(`${selectors.modals}.bap`);
            if (modal) openModal(modal);
          });
        } else if (onclick.includes('closeModal') || onclick.includes('closeBuildPLanModal')) {
          element.addEventListener('click', e => {
            e.preventDefault();
            const modal = safeQuerySelector(`${selectors.modals}.bap`);
            if (modal) closeModal(modal);
          });
        } else if (onclick.includes('continue_payment')) {
          element.addEventListener('click', e => {
            e.preventDefault();
            const warningModal = safeQuerySelector(`${selectors.modals}.warning`);
            if (warningModal) closeModal(warningModal);
            const giftBtn = safeQuerySelector(selectors.planButtons.gift);
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
            if (window.__DEBUG__) {
              console.warn('Could not convert onclick:', onclick, err);
            }
          }
        }
      }
    });
  }

  /**
   * Form validation
   */
  function initFormValidation() {
    const forms = safeQuerySelectorAll('form[data-validate], form#payment-form');

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
    const requiredFields = safeQuerySelectorAll('[required]', form);

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    // Email validation
    const emailFields = safeQuerySelectorAll('input[type="email"]', form);
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
    safeQuerySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && href !== '#0') {
          const target = safeQuerySelector(href);
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
