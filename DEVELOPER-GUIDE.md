# Color System Implementation Checklist ✅

## For Developers: How to Use the New Color System

### ✅ When Creating New Components

- [ ] Use variables from `css/basics/variables.css` for all colors
- [ ] Never hardcode hex color values (#123456)
- [ ] Use semantic variable names (--danger, not --red)
- [ ] Test component in both light and dark themes
- [ ] Use `--text` for headings, `--text-secondary` for body text
- [ ] Use status color variables for validation (--danger, --success, --warning)

### ✅ Button Development

**Primary Action Button**
```css
.btn-primary {
  background: var(--btn-primary-bg);  /* Gradient button */
  color: white;
  box-shadow: 0 2px 8px rgba(244, 164, 96, 0.2);
}

.btn-primary:hover {
  background: var(--btn-primary-hover-bg);
  transform: translateY(-2px);
}
```

**Secondary Button**
```css
.btn-secondary {
  background: var(--btn-secondary-bg);
  color: var(--btn-secondary-color);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--btn-secondary-hover-bg);
  border-color: var(--accent);
}
```

### ✅ Form Development

**Input Fields**
```css
input, textarea, select {
  background-color: var(--card);
  color: var(--text);
  border: 1px solid var(--border-light);
}

input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(244, 164, 96, 0.1);
}
```

**Error States**
```css
input.form-error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-light);
}
```

### ✅ Text Development

**Heading**
```css
h1, h2, h3 {
  color: var(--text);
  font-weight: 700;
}
```

**Body Text**
```css
p {
  color: var(--text-secondary);
  font-weight: 400;
}
```

**Links**
```css
a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
}
```

### ✅ Status Indicators

**Success State**
```css
.success-message {
  background: var(--success-light);
  color: var(--success);
  padding: 8px 12px;
  border-radius: 6px;
}
```

**Danger State**
```css
.error-message {
  background: var(--danger-light);
  color: var(--danger);
  button {
    background: var(--btn-danger-bg);
  }
}
```

### ✅ Dark Theme Testing Checklist

For each new component:
- [ ] Component appears in light theme
- [ ] Component appears in dark theme
- [ ] Text is readable in both themes (sufficient contrast)
- [ ] Buttons are visible and clickable
- [ ] Links have clear hover states
- [ ] Form inputs are clearly visible
- [ ] Status colors are distinguishable

### ✅ Common Mistakes to Avoid

❌ **Don't do this:**
```css
.btn-primary {
  background: linear-gradient(135deg, #f4a460, #ff9533);  /* Hardcoded */
  color: #000000;  /* Hardcoded */
}
```

✅ **Do this instead:**
```css
.btn-primary {
  background: var(--btn-primary-bg);
  color: white;
}
```

❌ **Don't do this:**
```css
.text-important {
  color: #3e2723;  /* Only works in light mode */
}
```

✅ **Do this instead:**
```css
.text-important {
  color: var(--text);  /* Works in both themes */
}
```

### ✅ Dark Theme Specific Overrides (When Needed)

Only use `html[data-theme="dark"]` selector when you need special handling:

```css
/* Light theme default */
.card {
  background: var(--card);
  box-shadow: var(--shadow-md);
}

/* Dark theme override (if needed) */
html[data-theme="dark"] .card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);  /* Stronger shadow for dark */
}
```

### ✅ Variable Naming Reference

**Use these prefixes for clarity:**

| Prefix | Usage | Examples |
|--------|-------|----------|
| `--text-` | Text colors | `--text`, `--text-secondary` |
| `--bg-` | Background colors | `--bg`, `--card` (legacy in use) |
| `--btn-` | Button specific | `--btn-primary-bg`, `--btn-danger-bg` |
| `--accent` | Brand accent | `--accent`, `--accent-hover` |
| `--border-` | Border colors | `--border`, `--border-light` |
| `--shadow-` | Shadows | `--shadow-md`, `--shadow-lg` |
| `--success-`, `--danger-`, `--warning-`, `--info-` | Status colors | With `-light` variants |

### ✅ Browser DevTools Inspection

In Chrome DevTools:
1. Inspector → Select element
2. Styles panel → Look at computed colors
3. Hover over variable names to see resolved values
4. Change theme and see values update automatically

### ✅ Code Review Checklist

When reviewing color-related code:
- [ ] No hardcoded hex values (#XXXXXX)
- [ ] Variables used are from `variables.css`
- [ ] Component tested in both light/dark themes
- [ ] Shadows use semantic variables
- [ ] Borders use semantic variables
- [ ] Text colors use `--text` or `--text-secondary`
- [ ] Status colors use semantic names

### ✅ Performance Notes

✨ **Good:** CSS variables are calculated once per theme
✨ **Good:** No JavaScript color calculations needed
✨ **Good:** Theme switch is instant (just toggle attribute)
✨ **Good:** Works offline (no external color libraries)

### ✅ Accessibility Validation

Before shipping:
- [ ] Run contrast checker (axe DevTools or similar)
- [ ] All text meets WCAG AA standards (4.5:1 ratio)
- [ ] Test in both light and dark themes
- [ ] Test with color blindness simulator
- [ ] Keyboard navigation works
- [ ] Focus states are visible

---

## Quick Links

- **CSS Variables**: `css/basics/variables.css`
- **Color Documentation**: `css/COLOR-SYSTEM.md`
- **Button Styles**: `css/basics/buttons.css`
- **Form Styles**: `css/basics/forms.css`
- **Quick Reference**: `css/QUICK-REFERENCE.css`

## Questions?

See the color system documentation for detailed examples and best practices.

---

**Last Updated**: February 22, 2026
**Status**: ✅ Ready for use
