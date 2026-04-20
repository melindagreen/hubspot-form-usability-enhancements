# Implementing HubSpot Form Enhancements in Statamic

This guide covers integrating `@fahlgren-mortine/hubspot-form-usability-enhancements` into a Statamic site using Vite for asset compilation.

## Prerequisites

- Statamic site with Vite configured (e.g., [Statamic Peak](https://peak.1702.nl/))
- Node.js 20+
- npm or yarn

## Installation

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## File Structure

After installation, you'll work with these files:

```
resources/
├── css/
│   └── site.css          # Your main CSS (imports module styles)
└── js/
    └── site.js           # Your main JS (imports module + init logic)
```

## Step 1: Import Styles (CSS)

In your main CSS file (e.g., `resources/css/site.css`), the module's styles are imported via JavaScript, **not** directly in CSS. This is handled by Vite's CSS handling when you import from the JS file.

If you want to add custom overrides, they **must** load after the module's styles. Create a separate CSS file for your HubSpot form customizations:

```css
/* resources/css/hubspot-forms.css */

/* Override base colors */
:root {
  --color-hs-form-primary: oklch(53.24% 0.301 290.86);
  --color-hs-form-primary-lt: oklch(88% 0.08 290.86);
  --color-hs-form-primary-dk: oklch(35% 0.26 290.86);

  /* Error colors */
  --color-hs-form-error: #dc2626;
  --color-hs-form-error-lt: #fef2f2;

  /* Form field styling */
  --hs-form-field-border-radius: 0.375rem;
  --hs-form-field-border-color: #d1d5db;
}
```

## Step 2: Import JavaScript Module

In your main JavaScript file (e.g., `resources/js/site.js`):

```javascript
// Import the module's CSS first
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// IMPORTANT: Prevent auto-initialization (required for SSR/React hydration safety)
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Your other imports and setup code...
import Alpine from "alpinejs";
// ... etc

// Initialize Alpine or other frameworks
window.Alpine = Alpine;
Alpine.start();

// Delay HubSpot module import until after page hydration
// The 500ms delay ensures React/Alpine hydration completes first
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");

  // Manually trigger initialization
  if (module.init) {
    module.init();
  }
}, 500);
```

### Why the Delayed Import?

HubSpot forms are often rendered via React components. If this module manipulates the DOM before React finishes hydrating, you'll see **React Hydration Error #418**:

> "Hydration failed because the initial UI does not match what was rendered on the server."

The pattern above:

1. Sets `HUBSPOT_FORMS_NO_AUTO_INIT = true` to prevent immediate DOM manipulation
2. Waits 500ms for hydration to complete
3. Dynamically imports and initializes the module

## Step 3: Configure File Upload Validation (Optional)

Control which file types are allowed in HubSpot file upload fields:

```javascript
// In resources/js/site.js, BEFORE the dynamic import

// Configure allowed file types
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = 'pdf,doc,docx,jpg,jpeg,png,gif,txt';
// Or as an array:
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

// Configure maximum file size
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB'; // Supports: KB, MB, GB

// IMPORTANT: Prevent auto-initialization (required for SSR/React hydration safety)
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Your other imports and setup code...
import Alpine from "alpinejs";
// ... etc

// Initialize Alpine or other frameworks
window.Alpine = Alpine;
Alpine.start();

// Delay HubSpot module import until after page hydration
// The 500ms delay ensures React/Alpine hydration completes first
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");

  // Manually trigger initialization
  if (module.init) {
    module.init();
  }
}, 500);
```

### File Upload Configuration Options

| Setting | Purpose | Format | Default |
|---------|---------|--------|---------|
| `HUBSPOT_FORMS_ALLOWED_EXTENSIONS` | File types to accept | String or Array | `'pdf,doc,docx,jpg,jpeg,png,gif,txt'` |
| `HUBSPOT_FORMS_MAX_FILE_SIZE` | Maximum file size | Human readable (e.g., `'5MB'`, `'2GB'`) | `'10MB'` |

### Alternative: Runtime Configuration

You can also configure after the module loads:

```javascript
// After the module is imported
const { FileUploadValidator } = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');

// Set allowed extensions
FileUploadValidator.allowedExtensions = ['pdf', 'jpg', 'png'];

// Set max file size (in bytes)
FileUploadValidator.maxFileSize = 5 * 1024 * 1024; // 5MB
```

## Step 4: Configure Vite

Your `vite.config.js` should include both CSS and JS entry points:

```javascript
import laravel from "laravel-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    laravel({
      refresh: true,
      input: ["resources/css/site.css", "resources/js/site.js"],
    }),
  ],
});
```

## Step 5: Load Assets in Layout

In your Antlers layout template (e.g., `resources/views/layout.antlers.html`):

```html
<!doctype html>
<html lang="{{ site:short_locale }}">
  <head>
    <!-- Vite handles CSS + JS loading with proper order -->
    {{ vite src="resources/css/site.css|resources/js/site.js" }}
  </head>
  <body>
    <!-- Your content -->
  </body>
</html>
```

## CSS Load Order (Critical!)

For your custom styles to override the module's defaults, ensure this load order:

1. **Module styles** — `@fahlgren-mortine/hubspot-form-usability-enhancements/styles`
2. **Your custom overrides** — Import after the module styles in your JS

Example in `site.js`:

```javascript
// 1. Module styles load first
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// 2. Your custom overrides load second (if using CSS-in-JS or separate import)
import "../css/hubspot-forms.css";
```

Or, if keeping all CSS in `site.css` with Tailwind:

```css
/* resources/css/site.css */
@import "tailwindcss";

/* Your HubSpot form overrides go AFTER Tailwind base styles */
/* The module styles are injected via JS import, so these will layer on top */
```

## Customizing Styles

### Option 1: Override CSS Variables

The simplest approach—override the CSS custom properties in your stylesheet:

```css
:root {
  /* Brand colors */
  --color-hs-form-primary: #7c3aed;
  --color-hs-form-primary-lt: #ede9fe;
  --color-hs-form-primary-dk: #5b21b6;
}
```

### Option 2: Use the Theme Template

Copy the included theme template for a complete starting point:

```bash
cp node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/theme-template.css resources/css/hubspot-theme.css
```

Then import it after the module styles:

```javascript
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
import "../css/hubspot-theme.css";
```

### Option 3: Dark Background Forms

For forms on dark backgrounds, add the `.hs-form-reverse` class to your form container:

```html
<div class="hs-form-reverse bg-slate-900 p-8">
  <!-- HubSpot form embed code here -->
</div>
```

This automatically applies white text and inverted color schemes.

## Troubleshooting

### React Hydration Error #418

**Cause**: Module initializes before React finishes hydrating.

**Fix**: Ensure `window.HUBSPOT_FORMS_NO_AUTO_INIT = true` is set **before** importing the module, and use the delayed import pattern.

### Styles Not Applying

**Cause**: CSS load order issue—your overrides load before the module styles.

**Fix**: Check that the module's styles import comes first in your JS file.

### Forms Not Enhanced

**Cause**: Module can't find HubSpot form elements.

**Fix**:

1. Ensure HubSpot forms use the `.hsfc-Form` class (Developer Code component)
2. Check browser console for errors
3. Verify the dynamic import resolves successfully

## Complete Example

**`resources/js/site.js`**:

```javascript
import Alpine from "alpinejs";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Prevent auto-init for hydration safety
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();

// Delayed HubSpot module initialization
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  if (module.init) {
    module.init();
  }
}, 500);
```

**`resources/css/site.css`**:

```css
@import "tailwindcss";

/* HubSpot form color overrides */
:root {
  --color-hs-form-primary: theme("colors.violet.600");
  --color-hs-form-primary-lt: theme("colors.violet.50");
  --color-hs-form-primary-dk: theme("colors.violet.800");
}
```

---

For the complete CSS variable reference, see the main [README](../README.md#css-cascade-reference).
