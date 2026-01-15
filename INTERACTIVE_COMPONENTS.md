# Interactive Components Guide

This document explains how to use the interactive components that have been implemented.

## 🎯 Available Components

### 1. Dropdowns

**Location:** `src/utils/client/dropdown.ts`

**Usage:**
```html
<div data-dropdown>
  <button data-dropdown-trigger>Menu</button>
  <div data-dropdown-menu>
    <a href="/item1">Item 1</a>
    <a href="/item2">Item 2</a>
    <button>Action</button>
  </div>
</div>
```

**Features:**
- ✅ Click to toggle
- ✅ Outside click to close
- ✅ Escape key to close
- ✅ Keyboard navigation (Arrow keys, Home, End)
- ✅ Smooth animations
- ✅ ARIA attributes for accessibility

**Options:**
```typescript
initDropdowns({
  closeOnOutsideClick: true,
  closeOnEscape: true,
  keyboardNavigation: true,
  animationDuration: 200
});
```

### 2. Mobile Menu

**Location:** `src/utils/client/mobile-menu.ts`

**Usage:**
```html
<button data-mobile-menu-toggle>☰ Menu</button>
<div data-mobile-menu>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</div>
<div data-mobile-menu-overlay></div>
```

**Features:**
- ✅ Toggle button
- ✅ Slide-in animation
- ✅ Overlay backdrop
- ✅ Close on link click
- ✅ Close on escape key
- ✅ Prevents body scroll when open
- ✅ Auto-closes on window resize

**Options:**
```typescript
initMobileMenu({
  animationDuration: 300,
  closeOnLinkClick: true,
  preventBodyScroll: true
});
```

### 3. Modals

**Location:** `src/utils/client/modals.ts`

**Usage:**
```html
<!-- Trigger -->
<button data-modal-trigger="my-modal">Open Modal</button>

<!-- Modal -->
<div id="my-modal" data-modal>
  <div data-modal-overlay></div>
  <div data-modal-content>
    <button data-modal-close>×</button>
    <h2>Modal Title</h2>
    <p>Modal content...</p>
  </div>
</div>
```

**Features:**
- ✅ Open/close functionality
- ✅ Overlay click to close
- ✅ Escape key to close
- ✅ Focus trap (keyboard navigation stays within modal)
- ✅ Restores focus after closing
- ✅ Prevents body scroll when open

**Programmatic Usage:**
```typescript
import { openModal, closeModalById } from './utils/client/modals';

openModal('my-modal');
closeModalById('my-modal');
```

### 4. Form Validation

**Location:** `src/utils/client/forms.ts`

**Usage:**
```html
<form data-validate-form>
  <input 
    name="email" 
    type="email"
    data-validate="required email"
    data-error-message="Please enter a valid email"
  />
  <input 
    name="password" 
    type="password"
    data-validate="required"
    data-min-length="8"
    data-error-message="Password must be at least 8 characters"
  />
  <button type="submit">Submit</button>
</form>
```

**Validation Attributes:**
- `data-validate="required"` - Field is required
- `data-validate="email"` - Must be valid email
- `data-validate="url"` - Must be valid URL
- `data-min-length="8"` - Minimum length
- `data-max-length="100"` - Maximum length
- `data-pattern="[0-9]+"` - Regex pattern
- `data-error-message="Custom error"` - Custom error message

**Features:**
- ✅ Real-time validation
- ✅ Error messages
- ✅ Visual error indicators
- ✅ ARIA attributes
- ✅ Custom validation rules

**Form Events:**
```javascript
form.addEventListener('form:valid', (e) => {
  console.log('Form is valid!', e.detail.form);
});

form.addEventListener('form:invalid', (e) => {
  console.log('Form has errors', e.detail.form);
});
```

### 5. Button Actions

**Location:** `src/utils/client/index.ts`

**Copy to Clipboard:**
```html
<button data-copy="text to copy">Copy</button>
```

**Custom Actions:**
```html
<button data-action="custom-action">Click Me</button>
```

```javascript
document.addEventListener('button:action', (e) => {
  if (e.detail.action === 'custom-action') {
    // Handle action
  }
});
```

### 6. Smooth Scrolling

Automatically enabled for all anchor links (`<a href="#section">`).

## 🎨 Styling

Styles are included in `src/utils/client/styles.css` and automatically loaded.

**Customization:**
You can override styles by adding your own CSS:

```css
[data-dropdown-menu] {
  /* Your custom styles */
}
```

## 🚀 Initialization

All components are automatically initialized when the page loads via `src/utils/client/index.ts`.

**Manual Initialization:**
```typescript
import { initInteractiveComponents } from './utils/client/index';
initInteractiveComponents();
```

## 📝 Examples

### Complete Dropdown Example
```html
<div data-dropdown>
  <button data-dropdown-trigger aria-label="Select country">
    Select Country
  </button>
  <ul data-dropdown-menu role="menu">
    <li><a href="#" role="menuitem">United States</a></li>
    <li><a href="#" role="menuitem">Canada</a></li>
    <li><a href="#" role="menuitem">United Kingdom</a></li>
  </ul>
</div>
```

### Complete Modal Example
```html
<button data-modal-trigger="login-modal">Login</button>

<div id="login-modal" data-modal role="dialog" aria-modal="true" aria-hidden="true">
  <div data-modal-overlay></div>
  <div data-modal-content>
    <button data-modal-close aria-label="Close modal">×</button>
    <h2>Login</h2>
    <form data-validate-form>
      <input name="email" type="email" data-validate="required email" />
      <input name="password" type="password" data-validate="required" />
      <button type="submit">Login</button>
    </form>
  </div>
</div>
```

## ♿ Accessibility

All components include:
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Respects `prefers-reduced-motion`

## 🔧 Troubleshooting

**Components not working?**
1. Check that scripts are loaded (check browser console)
2. Verify data attributes are correct
3. Ensure styles are loaded
4. Check for JavaScript errors in console

**Styling issues?**
- Components use minimal default styles
- Override in your own CSS as needed
- Check browser DevTools for computed styles
