/**
 * Mobile menu toggle functionality
 */

export interface MobileMenuOptions {
  animationDuration?: number;
  closeOnLinkClick?: boolean;
  preventBodyScroll?: boolean;
}

const defaultOptions: MobileMenuOptions = {
  animationDuration: 300,
  closeOnLinkClick: true,
  preventBodyScroll: true
};

/**
 * Initialize mobile menu
 */
export function initMobileMenu(options: MobileMenuOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const menuToggle = document.querySelector('[data-mobile-menu-toggle]') as HTMLElement;
  const menu = document.querySelector('[data-mobile-menu]') as HTMLElement;
  const body = document.body;
  
  if (!menuToggle || !menu) return;
  
  let isOpen = false;
  
  const open = () => {
    if (isOpen) return;
    isOpen = true;
    menu.classList.add('mobile-menu-open');
    menuToggle.classList.add('mobile-menu-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-expanded', 'true');
    
    if (opts.preventBodyScroll) {
      body.style.overflow = 'hidden';
    }
  };
  
  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('mobile-menu-open');
    menuToggle.classList.remove('mobile-menu-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-expanded', 'false');
    
    if (opts.preventBodyScroll) {
      body.style.overflow = '';
    }
  };
  
  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };
  
  // Toggle button click
  menuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    toggle();
  });
  
  // Close on link click
  if (opts.closeOnLinkClick) {
    const links = menu.querySelectorAll('a');
    links.forEach((link) => {
      link.addEventListener('click', () => {
        close();
      });
    });
  }
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      close();
      menuToggle.focus();
    }
  });
  
  // Close on outside click (for overlay)
  const overlay = menu.querySelector('[data-mobile-menu-overlay]');
  if (overlay) {
    overlay.addEventListener('click', () => {
      close();
    });
  }
  
  // Initialize ARIA attributes
  menuToggle.setAttribute('aria-controls', menu.id || 'mobile-menu');
  menuToggle.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-expanded', 'false');
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) {
      close();
    }
  });
}
