# 🎨 Real Estate Design System

## Color Palette - Purple Gradient Theme

### Primary Colors
```scss
--primary-color: #667eea;        // Main purple
--primary-dark: #764ba2;         // Dark purple
--primary-light: rgba(102, 126, 234, 0.1);  // Light purple background
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Accent Colors
```scss
--accent-color: #f093fb;         // Pink accent
--success-color: #66BB6A;        // Green
--warning-color: #FFA726;        // Orange
--danger-color: #EF5350;         // Red
--info-color: #42A5F5;           // Blue
```

### Neutral Colors
```scss
--text-primary: #2c3e50;         // Dark text
--text-secondary: #6c757d;       // Gray text
--text-light: rgba(255, 255, 255, 0.9);  // White text
--bg-primary: #ffffff;           // White background
--bg-secondary: #f8f9fa;         // Light gray background
--bg-tertiary: #e9ecef;          // Medium gray background
--border-color: #e0e0e0;         // Border color
```

### Shadows
```scss
--shadow-sm: 0 2px 8px rgba(102, 126, 234, 0.1);
--shadow-md: 0 4px 15px rgba(102, 126, 234, 0.15);
--shadow-lg: 0 8px 30px rgba(102, 126, 234, 0.2);
--shadow-xl: 0 15px 50px rgba(102, 126, 234, 0.25);
```

## Usage Examples

### Buttons
```html
<!-- Primary button (auto-styled with gradient) -->
<button pButton label="לחץ כאן"></button>

<!-- Success button -->
<button pButton label="שמור" class="p-button-success"></button>

<!-- Danger button -->
<button pButton label="מחק" class="p-button-danger"></button>
```

### Gradient Text
```html
<h1 class="gradient-text">כותרת בגרדיאנט</h1>
```

### Gradient Background
```html
<div class="gradient-bg p-4 text-white">
  תוכן עם רקע גרדיאנט
</div>
```

### Cards with Purple Shadow
```html
<p-card class="shadow-purple">
  תוכן הכרטיס
</p-card>
```

## Component Styling Guidelines

### 1. Headers & Titles
- Use `var(--text-primary)` for main text
- Add gradient underline for section titles
- Font sizes: h1 (3rem), h2 (2.5rem), h3 (2rem)

### 2. Buttons
- Primary actions: Use gradient background
- Secondary actions: Use outlined style with purple border
- Hover: Add `translateY(-2px)` and shadow

### 3. Cards
- White background with `border-radius: 12px`
- Use `var(--shadow-sm)` for default state
- Hover: Increase to `var(--shadow-md)`

### 4. Forms
- Input focus: Purple border with light purple shadow
- Labels: Bold with `var(--text-primary)`
- Error states: Use `var(--danger-color)`

### 5. Dialogs
- Header: Use `var(--primary-gradient)`
- Content: White background
- Footer buttons: Primary gradient for confirm actions

## Animation Guidelines

### Transitions
```scss
transition: all 0.3s ease;
```

### Hover Effects
```scss
&:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Fade In
```scss
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Responsive Breakpoints
```scss
// Mobile
@media (max-width: 768px) { }

// Tablet
@media (min-width: 769px) and (max-width: 1024px) { }

// Desktop
@media (min-width: 1025px) { }
```

## Best Practices

1. ✅ Always use CSS variables instead of hardcoded colors
2. ✅ Maintain consistent spacing (8px grid system)
3. ✅ Use gradient for primary CTAs and headers
4. ✅ Add smooth transitions to interactive elements
5. ✅ Keep shadows subtle with purple tint
6. ✅ Ensure RTL support for all components
7. ✅ Test contrast ratios for accessibility

## Components Already Styled
- ✅ Homepage (hero, features, CTA)
- ✅ Footer
- ✅ Chatbot
- ✅ Contact Dialogs
- ✅ Admin Dashboard Charts

## Components To Update
- 🔄 Header/Navigation
- 🔄 Product Cards
- 🔄 Product Details
- 🔄 Cart & Checkout
- 🔄 User Profile
- 🔄 Auth Pages
- 🔄 About & Contact Pages
