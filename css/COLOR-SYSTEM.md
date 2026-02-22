# DatArchi Color System Documentation

## Overview
This document outlines the centralized color system for DatArchi, ensuring consistent colors across all pages and themes.

## Color Variables
All color variables are defined in `css/basics/variables.css` and automatically adapt to light/dark theme contexts.

### Primary Colors
- `--accent`: Main brand color (#f4a460 light, #ffb84d dark)
- `--accent-hover`: Hover state (#ff9533 light, #ffc966 dark)
- `--accent-2`: Secondary accent (#daa520 light, #ffd700 dark)
- `--accent-3`: Tertiary accent (#d97706 light, #ff8c00 dark)

### Background Colors
- `--bg`: Main background (#fffaf0 light, #0f0a07 dark)
- `--card`: Card/Panel background (#fffef9 light, #1e1410 dark)
- `--card-darker`: Darker card variant (#fef3e6 light, #141008 dark)

### Text Colors
- `--text`: Primary text/headings (#3e2723 light, #f5f1eb dark)
- `--text-secondary`: Secondary text (#6b5b52 light, #d4c5b9 dark)
- `--text-tertiary`: Tertiary text (#999 both themes)
- `--muted`: Muted text (#a0826d light, #c9a86d dark)

### Status Colors
- `--success`: Success state (#84cc16 light, #b8cc00 dark)
- `--success-light`: Success background (#success with opacity)
- `--danger`: Error/Danger (#dc2626 light, #ff6b6b dark)
- `--danger-light`: Danger background (#danger with opacity)
- `--warning`: Warning (#f59e0b light, #ffb347 dark)
- `--warning-light`: Warning background (#warning with opacity)
- `--info`: Info (#f4a460 light, #ffb84d dark)
- `--info-light`: Info background (#info with opacity)

### Button Colors
- `--btn-primary-bg`: Primary button gradient
- `--btn-primary-hover-bg`: Primary button hover gradient
- `--btn-secondary-bg`: Secondary button background
- `--btn-secondary-hover-bg`: Secondary button hover background
- `--btn-success-bg`: Success button background
- `--btn-success-hover-bg`: Success button hover background
- `--btn-danger-bg`: Danger button background
- `--btn-danger-hover-bg`: Danger button hover background

### Border & Shadow
- `--border`: Semi-transparent border color
- `--border-light`: Light border color
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow
- `--shadow-neon`: Accent-colored glow

## Usage Guidelines

### Best Practices
1. **Always use CSS variables** instead of hardcoded hex values
2. **Use semantic variable names** (e.g., `--danger` for errors, not `--red`)
3. **Test in both themes** when adding new colors
4. **Use light/dark variants** for status indicators (e.g., `--success-light` for backgrounds)

### Examples

#### Button
```css
.btn-primary {
  background: var(--btn-primary-bg);
  color: white;
  box-shadow: 0 2px 8px rgba(244, 164, 96, 0.2);
}
```

#### Text
```css
p {
  color: var(--text-secondary);
  font-weight: 400;
}
```

#### Status Indicator
```css
.success-badge {
  background: var(--success-light);
  color: var(--success);
  padding: 8px 12px;
  border-radius: 6px;
}
```

## Theme Implementation
Themes are controlled via `data-theme` attribute on `<html>`:
- **Light theme**: `<html>` (no attribute or `data-theme="light"`)
- **Dark theme**: `<html data-theme="dark">`

## Color Consistency Across Pages
All pages automatically inherit the color system through imported CSS:
1. `css/styles.css` imports all base styles
2. `css/basics/variables.css` defines all colors
3. `css/basics/buttons.css` uses variables for buttons
4. `css/basics/forms.css` uses variables for forms
5. `css/basics/typography.css` uses variables for text

## Migration Guide
When refactoring old pages:

### Find & Replace Examples
- `#f4a460` → `var(--accent)`
- `#ffb84d` → `var(--accent)` in dark theme context
- `#3e2723` → `var(--text)`
- Status colors → Use semantic variables

### Checking for Consistency
Use this regex to find hardcoded colors:
```
background.*#[0-9a-fA-F]{6}
color.*#[0-9a-fA-F]{6}
border.*#[0-9a-fA-F]{6}
```

## Accessibility
- All color combinations meet WCAG AA contrast standards
- Text colors are adjusted for both light/dark themes
- Status colors (success/danger/warning) are distinguishable for colorblind users
- Focus states use `outline` for keyboard navigation

## Performance
- CSS variables are calculated once per theme change
- No runtime color calculations
- Efficient dark theme switching via attribute selector
- Minimal CSS output for production

---

**Last Updated**: February 2026
**Maintained by**: DatArchi Team
