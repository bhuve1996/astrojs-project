/**
 * Modal/Dialog utility functions
 */

export interface ModalOptions {
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  focusTrap?: boolean;
  restoreFocus?: boolean;
  animationDuration?: number;
}

const defaultOptions: ModalOptions = {
  closeOnOverlayClick: true,
  closeOnEscape: true,
  focusTrap: true,
  restoreFocus: true,
  animationDuration: 200
};

let activeModal: HTMLElement | null = null;
let previousFocus: HTMLElement | null = null;

/**
 * Initialize all modals on the page
 */
export function initModals(options: ModalOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const modals = document.querySelectorAll('[data-modal]');
  
  modals.forEach((modal) => {
    initModal(modal as HTMLElement, opts);
  });
}

/**
 * Initialize a single modal
 */
function initModal(modal: HTMLElement, options: ModalOptions) {
  const trigger = document.querySelector(
    `[data-modal-trigger="${modal.id}"]`
  ) as HTMLElement;
  const closeButtons = modal.querySelectorAll('[data-modal-close]');
  const overlay = modal.querySelector('[data-modal-overlay]') || modal;
  
  // Open modal
  const open = () => {
    if (activeModal) {
      closeModal(activeModal);
    }
    
    activeModal = modal;
    previousFocus = document.activeElement as HTMLElement;
    
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus trap
    if (options.focusTrap) {
      trapFocus(modal);
    }
    
    // Focus first focusable element
    const firstFocusable = getFocusableElements(modal)[0];
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }
  };
  
  // Close modal
  const close = () => {
    closeModal(modal);
  };
  
  // Trigger click handler
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }
  
  // Close button handlers
  closeButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });
  });
  
  // Overlay click handler
  if (options.closeOnOverlayClick) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });
  }
  
  // Escape key handler
  if (options.closeOnEscape) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal === activeModal) {
        close();
      }
    });
  }
  
  // Initialize ARIA attributes
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
}

/**
 * Close a modal
 */
function closeModal(modal: HTMLElement) {
  modal.classList.remove('modal-open');
  document.body.style.overflow = '';
  modal.setAttribute('aria-hidden', 'true');
  
  // Restore focus
  if (previousFocus && previousFocus.focus) {
    previousFocus.focus();
  }
  
  if (modal === activeModal) {
    activeModal = null;
    previousFocus = null;
  }
}

/**
 * Open a modal by ID
 */
export function openModal(modalId: string) {
  const modal = document.getElementById(modalId) || 
                document.querySelector(`[data-modal="${modalId}"]`) as HTMLElement;
  if (modal) {
    const event = new CustomEvent('modal:open', { detail: { modalId } });
    modal.dispatchEvent(event);
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    activeModal = modal;
  }
}

/**
 * Close a modal by ID
 */
export function closeModalById(modalId: string) {
  const modal = document.getElementById(modalId) || 
                document.querySelector(`[data-modal="${modalId}"]`) as HTMLElement;
  if (modal) {
    closeModal(modal);
  }
}

/**
 * Close all modals
 */
export function closeAllModals() {
  const openModals = document.querySelectorAll('.modal-open');
  openModals.forEach((modal) => {
    closeModal(modal as HTMLElement);
  });
}

/**
 * Get focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');
  
  return Array.from(container.querySelectorAll<HTMLElement>(selectors));
}

/**
 * Trap focus within modal
 */
function trapFocus(modal: HTMLElement) {
  const focusableElements = getFocusableElements(modal);
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  modal.addEventListener('keydown', function trapHandler(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}
