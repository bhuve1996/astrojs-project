/**
 * Dropdown utility functions
 * Handles dropdown menu interactions with keyboard navigation and outside click detection
 */

export interface DropdownOptions {
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  keyboardNavigation?: boolean;
  animationDuration?: number;
}

const defaultOptions: DropdownOptions = {
  closeOnOutsideClick: true,
  closeOnEscape: true,
  keyboardNavigation: true,
  animationDuration: 200
};

/**
 * Initialize all dropdowns on the page
 */
export function initDropdowns(options: DropdownOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  
  dropdowns.forEach((dropdown) => {
    initDropdown(dropdown as HTMLElement, opts);
  });
}

/**
 * Initialize a single dropdown
 */
function initDropdown(element: HTMLElement, options: DropdownOptions) {
  const trigger = element.querySelector('[data-dropdown-trigger]') as HTMLElement;
  const menu = element.querySelector('[data-dropdown-menu]') as HTMLElement;
  
  if (!trigger || !menu) return;
  
  let isOpen = false;
  
  // Toggle dropdown
  const toggle = () => {
    isOpen = !isOpen;
    updateDropdownState();
  };
  
  // Close dropdown
  const close = () => {
    if (isOpen) {
      isOpen = false;
      updateDropdownState();
    }
  };
  
  // Open dropdown
  const open = () => {
    if (!isOpen) {
      isOpen = true;
      updateDropdownState();
    }
  };
  
  // Update visual state
  const updateDropdownState = () => {
    if (isOpen) {
      element.classList.add('dropdown-open');
      menu.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-expanded', 'true');
      
      // Focus first item if keyboard navigation is enabled
      if (options.keyboardNavigation) {
        const firstItem = menu.querySelector<HTMLElement>('a, button, [tabindex="0"]');
        if (firstItem) {
          setTimeout(() => firstItem.focus(), 50);
        }
      }
    } else {
      element.classList.remove('dropdown-open');
      menu.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-expanded', 'false');
    }
  };
  
  // Click handler for trigger
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  });
  
  // Outside click detection
  if (options.closeOnOutsideClick) {
    document.addEventListener('click', (e) => {
      if (isOpen && !element.contains(e.target as Node)) {
        close();
      }
    });
  }
  
  // Escape key handler
  if (options.closeOnEscape) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        close();
        trigger.focus();
      }
    });
  }
  
  // Keyboard navigation
  if (options.keyboardNavigation) {
    menu.addEventListener('keydown', (e) => {
      const items = Array.from(
        menu.querySelectorAll<HTMLElement>('a, button, [tabindex="0"]')
      );
      const currentIndex = items.indexOf(e.target as HTMLElement);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          items[prevIndex]?.focus();
          break;
        case 'Home':
          e.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    });
  }
  
  // Close when clicking menu items
  const menuItems = menu.querySelectorAll('a, button');
  menuItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (item.getAttribute('data-keep-open') !== 'true') {
        close();
      }
    });
  });
  
  // Initialize ARIA attributes
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-expanded', 'false');
}

/**
 * Close all open dropdowns
 */
export function closeAllDropdowns() {
  const openDropdowns = document.querySelectorAll('.dropdown-open');
  openDropdowns.forEach((dropdown) => {
    dropdown.classList.remove('dropdown-open');
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.setAttribute('aria-expanded', 'false');
  });
}
