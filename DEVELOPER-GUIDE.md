# DatArchi - Quick Developer Guide

## Project Structure

```
DatArchi/
├── index.html                 # Landing page with auth forms
├── css/
│   ├── styles.css            # Main CSS entry point
│   ├── improvements-global.css # Global design system
│   ├── homepage.css           # Homepage-specific styles
│   ├── projects.css           # Projects page styles
│   ├── animations.css         # Animation definitions
│   ├── header.css             # Header/navbar styles
│   ├── footer.css             # Footer styles
│   ├── main.css               # Main layout styles
│   └── basics/               # Foundation styles
│       ├── variables.css      # CSS variables
│       ├── typography.css     # Font styles
│       ├── buttons.css        # Button styles
│       ├── forms.css          # Form styles
│       └── utilities.css      # Utility classes
├── js/
│   ├── main.js                # Main application logic
│   ├── vre-optimization-service.js # Performance utilities
│   ├── firebase-config.js     # Firebase setup
│   ├── vre-user-account-service.js # User management
│   ├── vre-find-service.js    # Find/artifact management
│   └── [other services]       # Various feature services
└── pages/
    ├── projects/index.html    # Projects listing
    ├── funde/                 # Finds/artifacts pages
    ├── admin/                 # Admin pages
    └── [other pages]          # Additional pages
```

---

## Key CSS Features

### Color System
```css
--primary-color: #f97316        /* Orange */
--success-color: #22c55e        /* Green */
--warning-color: #eab308        /* Yellow */
--error-color: #ef4444          /* Red */
--text-primary: #1f2937         /* Dark gray */
--bg-primary: #ffffff           /* White */
```

### Using Global Styles
```html
<!-- Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary btn-lg">Large Secondary</button>

<!-- Forms -->
<div class="form-group">
  <label for="email">Email</label>
  <input type="email" id="email" required>
</div>

<!-- Cards -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <!-- Content -->
</div>

<!-- Alerts -->
<div class="alert alert-success">
  <span class="alert-icon"><i class="fas fa-check-circle"></i></span>
  <span>Success message</span>
</div>
```

---

## Responsive Breakpoints

```css
/* Large screens */
@media (min-width: 1024px) { }

/* Tablets */
@media (max-width: 1024px) and (min-width: 768px) { }

/* Mobile */
@media (max-width: 768px) { }

/* Small mobile */
@media (max-width: 480px) { }
```

---

## Form Validation

### HTML5 Validation
```html
<input 
  type="email" 
  required 
  minlength="8"
  pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
>
```

### JavaScript Validation
```javascript
// Check if form is valid
if (!form.checkValidity()) {
  event.preventDefault();
  return;
}

// Show custom validation message
input.setCustomValidity('Error message here');
```

### Validation States
```html
<!-- Valid input -->
<input class="valid">

<!-- Invalid input -->
<input class="error">

<!-- Loading state -->
<input disabled>
```

---

## Animations

### Built-in Animations
```css
/* Slide animations */
animation: slideUp 0.3s ease-out;
animation: slideDown 0.3s ease-out;
animation: slideInFromLeft 0.3s ease-out;
animation: slideInFromRight 0.3s ease-out;

/* Fade animations */
animation: fadeIn 0.3s ease-out;
animation: fadeOut 0.3s ease-out;

/* Loading */
animation: loading 1.5s infinite;  /* Skeleton shimmer */
animation: spin 0.8s linear infinite; /* Loading spinner */
```

### Usage
```css
.my-element {
  animation: slideUp 0.3s ease-out;
  animation-fill-mode: both;
}
```

---

## JavaScript Utilities

### Performance Optimization Service
```javascript
import OptimizationService from './js/vre-optimization-service.js';

// Debounce search input
const debouncedSearch = OptimizationService.debounce((query) => {
  // Search implementation
}, 300);

// Throttle scroll events
const throttledScroll = OptimizationService.throttle(() => {
  // Scroll handler
}, 300);

// Initialize lazy loading
OptimizationService.initLazyLoading();

// Create cache with 5-minute TTL
const cache = OptimizationService.createCache(5 * 60 * 1000);
cache.set('key', data);
const cached = cache.get('key');

// Detect browser features
const features = OptimizationService.detectFeatures();
if (features.hasServiceWorker) {
  // Use service worker
}

// Safe DOM operations
const element = OptimizationService.safeQuery('.my-class');
OptimizationService.safeAddListener(element, 'click', handler);
```

---

## Form Handling Best Practices

### Basic Form Setup
```html
<form id="myForm">
  <div id="errorContainer" class="alert alert-danger" hidden></div>
  
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" required>
  </div>
  
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### JavaScript Handling
```javascript
document.getElementById('myForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorContainer = document.getElementById('errorContainer');
  
  // Disable form during submission
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Loading...';
  
  try {
    const data = new FormData(form);
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: data
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    // Success
    form.reset();
    errorContainer.hidden = true;
    
  } catch (error) {
    // Error handling
    errorContainer.textContent = error.message;
    errorContainer.hidden = false;
  } finally {
    // Re-enable form
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
  }
});
```

---

## Accessibility Best Practices

### Focus Management
```css
/* Always provide focus indicator */
*:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}
```

### Semantic HTML
```html
<!-- Good -->
<button>Click me</button>
<label for="input">Label</label>
<input id="input">

<!-- Bad -->
<div onclick="...">Click me</div>
<div>Label</div>
<div contenteditable>input</div>
```

### ARIA Labels
```html
<!-- When label is not visible -->
<button aria-label="Close menu">×</button>

<!-- For loading states -->
<div aria-live="polite" aria-label="Loading">
  <span class="spinner"></span>
</div>

<!-- For form errors -->
<input aria-invalid="true" aria-describedby="error">
<span id="error" role="alert">Invalid email</span>
```

---

## Dark Mode Support

### Automatic Detection
```css
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f3f4f6;
    --bg-primary: #1f2937;
  }
}
```

### Testing Dark Mode
Chrome DevTools → Ctrl+Shift+P → "Dark" → Select preferred color scheme

---

## Performance Tips

### 1. Reduce Renders
```javascript
// Bad - Multiple renders
data.forEach(item => {
  document.body.innerHTML += `<div>${item}</div>`;
});

// Good - Single render
const html = data.map(item => `<div>${item}</div>`).join('');
document.body.innerHTML = html;
```

### 2. Use Event Delegation
```javascript
// Bad - Multiple listeners
items.forEach(item => {
  item.addEventListener('click', handler);
});

// Good - Single listener
container.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handler(e);
  }
});
```

### 3. Lazy Load Images
```html
<img 
  data-src="image.jpg" 
  src="placeholder.jpg"
  alt="Description"
>
<script>
  OptimizationService.initLazyLoading();
</script>
```

---

## Common Patterns

### Modal Dialog
```html
<div id="myModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Modal Title</h2>
    <!-- Content -->
  </div>
</div>
```

```javascript
const modal = document.getElementById('myModal');
const closeBtn = modal.querySelector('.close');

// Open modal
function openModal() {
  modal.classList.add('show');
}

// Close modal
function closeModal() {
  modal.classList.remove('show');
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
```

### Loading Skeleton
```html
<div class="skeleton" style="height: 200px; border-radius: 8px;"></div>
```

### Toast/Notification
```javascript
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.innerHTML = `
    <span class="alert-icon"><i class="fas fa-${getIcon(type)}"></i></span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function getIcon(type) {
  const icons = {
    success: 'check-circle',
    error: 'times-circle',
    warning: 'exclamation-circle',
    info: 'info-circle'
  };
  return icons[type] || 'info-circle';
}
```

---

## Testing Checklist

### Visual Testing
- [ ] Page looks good on mobile (320px)
- [ ] Page looks good on tablet (768px)
- [ ] Page looks good on desktop (1200px+)
- [ ] Forms are readable and easy to use
- [ ] Buttons have clear hover states

### Functionality Testing
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Success states work
- [ ] Links navigate correctly
- [ ] Buttons trigger expected actions

### Accessibility Testing
- [ ] Tab through page - all interactive elements reachable
- [ ] Page works without mouse
- [ ] Color isn't only way to convey information
- [ ] Text has sufficient contrast
- [ ] Page works with screen reader

### Performance Testing
- [ ] Page loads in < 3 seconds
- [ ] Animations are smooth (60fps)
- [ ] No console errors
- [ ] Images are optimized
- [ ] No memory leaks

---

## Resources

### Documentation
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [Web.dev](https://web.dev/)

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)

---

## Troubleshooting

### Forms not validating
- Check HTML5 validation attributes
- Ensure form has proper `id` attributes
- Check JavaScript error console

### Styles not applying
- Clear browser cache (Ctrl+Shift+Delete)
- Check CSS file paths are correct
- Ensure CSS is imported in correct order
- Check for CSS specificity issues

### Animations not smooth
- Check for layout thrashing
- Ensure using `transform` and `opacity` only
- Check for performance issues in DevTools
- Respect `prefers-reduced-motion`

### Accessibility issues
- Run axe DevTools audit
- Test with keyboard navigation
- Test with screen reader
- Check color contrast ratios

---

## Getting Help

1. Check console for error messages
2. Review the IMPROVEMENTS.md file
3. Check MDN documentation
4. Test in different browsers
5. Create an issue with details
