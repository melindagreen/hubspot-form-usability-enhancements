# @fahlgren-mortine/hubspot-form-usability-enhancements

Enhanced HubSpot form validation, accessibility (WCAG 2.1 AA), and styling. React/SSR compatible.

Overrides HubSpot's default color values. Use developer-defined color palette via CSS custom properties.

## Features

- React/SSR hydration safe
- WCAG 2.1 AA compliant
- Dark background support (`.hs-form-reverse`)
- File upload validation (type, size)
- Character limit validation
- TypeScript definitions included

## Browser Support

- Chrome/Edge 105+
- Firefox 121+
- Safari 15.4+
- Older browsers: graceful degradation (`:has()` selector fallback)

## Installation

### npm/Bundlers

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

```javascript
import "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
```

### CDN (jsdelivr)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/styles.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/index.cdn.js"></script>
```

Configure via window globals before script load:

```html
<script>
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'png'];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB';
</script>
```

## Platform-Specific Guides

| Platform | Guide |
|----------|-------|
| HubSpot CMS | [user-docs/hubspot-cms.md](user-docs/hubspot-cms.md) |
| Nuxt + Storyblok | [user-docs/nuxt-storyblok.md](user-docs/nuxt-storyblok.md) |
| Statamic | [user-docs/statamic.md](user-docs/statamic.md) |
| WordPress | [user-docs/wordpress.md](user-docs/wordpress.md) |

## Usage

### Auto-Initialization

```javascript
import "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
```

### Manual Configuration

```javascript
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

hubspotForms({
  characterLimit: 1000,
  allowedExtensions: ["pdf", "docx", "jpg", "png"],
  maxFileSize: 5 * 1024 * 1024, // 5MB
});
```

### React/SSR Safe

```javascript
// Disable auto-init
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Initialize after framework hydration
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  if (module.init) {
    module.init({
      characterLimit: 1000,
      allowedExtensions: ["pdf", "docx", "jpg", "png"],
      maxFileSize: 5 * 1024 * 1024,
    });
  }
}, 500);
```

### Step 5: Test Your Integration

1. **Load your page** with a HubSpot form
2. **Check that styles are applied** - forms should have enhanced styling
3. **Test character limits** - type in textarea fields to see character counters
4. **Test file uploads** - try uploading files to see validation
5. **Test form validation** - submit incomplete forms to see enhanced error messages
6. **Check browser console** - should be free of errors
7. **Test on mobile devices** - ensure responsive behavior works

### Step 6: Customize (Optional)

If needed, override default styles or configuration:

```css
/* Custom styling */
.hsfc-Form {
  --hsfc-primary-color: #your-brand-color;
  --hsfc-error-color: #your-error-color;
}
```

```javascript
// Custom configuration
hubspotForms({
  characterLimit: 750, // Custom character limit
  allowedExtensions: [
    // Custom file types
    "pdf",
    "doc",
    "docx",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
  ],
  maxFileSize: 20 * 1024 * 1024, // 20MB limit
});
```

### Basic Usage (Auto-initialization)

For environments without React or hydration concerns:

```javascript
// Import the module and styles - forms will initialize automatically

import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Delay until framework hydrates
setTimeout(() => hubspotForms(), 500);
```

### React Component

```jsx
import { useEffect } from "react";
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

function FormComponent() {
  useEffect(() => {
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ["pdf", "docx", "jpg", "png"],
      maxFileSize: 5 * 1024 * 1024,
    });
  }, []);

  return <div id="hubspot-form-container"></div>;
}
```

## Configuration

### Options

```javascript
hubspotForms({
  characterLimit: 500,              // Max characters for textareas
  allowedExtensions: ['pdf', 'jpg'], // File types allowed
  maxFileSize: 10 * 1024 * 1024,    // Max file size in bytes (10MB)
  errorMessages: {                   // Custom error messages
    required: "Field required",
    email: "Invalid email",
    fileType: "File type: {allowedTypes}"
  }
});
```

### Window Globals (CDN)

```javascript
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'jpg'];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB';
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  required: "Required",
  email: "Invalid email"
};
```

## Advanced Usage

### Manual Control

```javascript
import {
  HubSpotFormManager,
  CharacterLimitValidator,
  FileUploadValidator,
} from "@fahlgren-mortine/hubspot-form-usability-enhancements";

// Setup all forms
HubSpotFormManager.setupAllForms();

// Setup specific form
const form = document.querySelector(".hsfc-Form");
HubSpotFormManager.setupSingleForm(form);
// Set flag before importing to prevent auto-initialization
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

import "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Manual initialization with custom timing
setTimeout(() => {
  import("@fahlgren-mortine/hubspot-form-usability-enhancements").then(
    ({ HubSpotFormManager }) => {
      HubSpotFormManager.setupAllForms();
    },
  );
}, 1000);
```

## Build System Integration

### Webpack

```javascript
// webpack.config.js
module.exports = {
  // ... your config
  resolve: {
    alias: {
      "@hubspot-forms": "@fahlgren-mortine/hubspot-form-usability-enhancements",
```

### Disable Auto-Init

```javascript
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;
```

## Styling

### Dark Backgrounds

Add `.hs-form-reverse` to parent container:

```html
<div class="hs-form-reverse">
  <!-- HubSpot form here - auto-applies white text -->
</div>
```

### Color Customization

Override CSS variables in `:root`:

```css
:root {
  --color-hs-form-primary: oklch(0.50 0.16 250.88);
  --color-hs-form-danger: oklch(0.55 0.22 25);
}
```

See [theme-template.css](theme-template.css) for all variables.

## Error Messages

### Customization

```javascript
hubspotForms({
  errorMessages: {
    required: "Required",
    email: "Invalid email",
    fileType: "Allowed: {allowedTypes}",
    characterLimit: "Max {limit} chars. {overBy} over."
  }
});
```

### Interpolation

| Key | Variables | Example |
|-----|-----------|---------|
| `characterLimit` | `{limit}`, `{overBy}`, `{plural}` | "Max 500 chars" |
| `fileSize` | `{maxSize}` | "Max 10 MB" |
| `fileType` | `{allowedTypes}` | "Only .pdf, .jpg" |

### Available Types

| Type | Default |
|------|---------|
| `required` | "Please complete this required field." |
| `email` | "must be formatted correctly" |
| `pattern` | "must be formatted correctly" |
| `characterLimit` | "Enter {limit} characters or fewer..." |
| `date` | "Please enter a valid date." |
| `phone` | "Please enter a valid phone number." |
| `file` | "File type not allowed." |
| `fileSize` | "File size exceeds {maxSize} limit" |
| `fileType` | "File type not allowed. Allowed: {allowedTypes}" |
| `url` | "Please enter a valid URL" |
| `number` | "Please enter a valid number" |

## API

### Exports

```javascript
import {
  init,                      // Main init function
  HubSpotFormManager,        // Form management
  HubSpotFormValidator,      // Validation
  CharacterLimitValidator,   // Character limits
  FileUploadValidator,       // File validation
  ErrorMessageConfig,        // Error messages
  FieldValidator,            // Field validation
  removeHubSpotFormStyles    // Style removal
} from "@fahlgren-mortine/hubspot-form-usability-enhancements";
| `required`        | Required field validation      | No                     |
| `email`           | Email format validation        | No                     |
| `pattern`         | Pattern/format validation      | No                     |
| `characterLimit`  | Character limit exceeded       | Yes (`{limit}`, `{overBy}`, `{plural}`) |
| `date`            | Date format validation         | No                     |
| `phone`           | Phone number validation        | No                     |
| `file`            | File type not allowed          | No                     |
| `fileSize`        | File size exceeded             | Yes (`{maxSize}`)      |
| `fileType`        | Detailed file type error       | Yes (`{allowedTypes}`) |
| `url`             | URL format validation          | No                     |
| `number`          | Number format validation       | No                     |
| `confirmation`    | Confirmation field mismatch    | No                     |
| `captcha`         | CAPTCHA/verification required  | No                     |
```

## Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## License

MIT

## Support

[GitHub Issues](https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements/issues)
- **`fileType`**: `{allowedTypes}` (e.g., ".pdf, .doc, .jpg")

```javascript
// Example with interpolation
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  characterLimit: "Please keep it under {limit} characters. You're {overBy} character{plural} over.",
  fileSize: "Maximum file size is {maxSize}. Please choose a smaller file.",
  fileType: "We accept these file types: {allowedTypes}",
};
```

### Fallback Behavior

If you don't define a custom message for a specific error type, the original HubSpot error message will be preserved. This allows you to customize only the messages you care about while keeping the defaults for everything else.

## Environment Variables

You can also configure the module using environment variables:

```bash
# .env
VITE_UPLOAD_ALLOWED_EXTENSIONS=pdf,doc,docx,jpg,jpeg,png
VITE_UPLOAD_MAX_SIZE=10MB
```

## Styling Customization

The module provides a flexible color system that works out of the box. The pre-compiled CSS is included.

### Color System Architecture

The styling system uses a two-tier architecture:

- **Base colors** defined in `:root` - these are the colors you override
- **Component colors** reference base colors using `var()` and cascade automatically

This cascading design means you typically only need to override base colors, and all components automatically update.

### Theme Template

For detailed theming, copy the included `theme-template.css` from your `node_modules`:

```bash
cp node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/theme-template.css ./my-theme.css
```

This file contains all CSS variables, commented out and organized by component. Uncomment only what you need to override.

### CSS Variables Cascade Reference

The following shows which base colors cascade to which component variables. Override base colors first; only override component variables when you need to break from the cascade.

<details>
<summary><strong>Primary Color Cascade</strong></summary>

| Base Color                   | Cascades To                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-hs-form-primary`    | `btn-primary-bg`, `btn-primary-border`, `field-checked-bg`, `link`, `progress-bar-fill`, `reverse-btn-primary-text`                                                 |
| `--color-hs-form-primary-lt` | `reverse-btn-primary-hover-bg`, `reverse-btn-primary-focus-bg`, `reverse-field-focus-outline`                                                                       |
| `--color-hs-form-primary-dk` | `btn-primary-hover-bg`, `btn-primary-hover-border`, `btn-primary-focus-*`, `btn-primary-active-*`, `link-hover`, `link-focus`, `link-active`, `field-focus-outline` |

</details>

<details>
<summary><strong>Secondary Color Cascade</strong></summary>

| Base Color                     | Cascades To                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `--color-hs-form-secondary`    | `btn-ancillary-bg`, `btn-ancillary-border`, `reverse-btn-ancillary-text`                                  |
| `--color-hs-form-secondary-lt` | `reverse-btn-ancillary-hover-bg`, `reverse-btn-ancillary-focus-bg`                                        |
| `--color-hs-form-secondary-dk` | `btn-ancillary-hover-bg`, `btn-ancillary-hover-border`, `btn-ancillary-focus-*`, `btn-ancillary-active-*` |

</details>

<details>
<summary><strong>Neutral Color Cascade</strong></summary>

| Base Color                    | Cascades To                                                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--color-hs-form-neutral`     | `btn-disabled-bg`, `text`, `field-text`, `label-text`, `selectlist-item-text`, `progress-bar-border`, `reverse-btn-disabled-text`                                                                                                    |
| `--color-hs-form-neutral-hlt` | `selectlist-item-hover-bg`, `selectlist-item-focus-bg`, `selectlist-item-active-bg`                                                                                                                                                  |
| `--color-hs-form-neutral-lt`  | `btn-disabled-text`, `field-border`, `field-hover-border`, `placeholder-text`, `selectlist-border`, `label-description-text`, `label-optional-text`, `reverse-field-checked-bg`, `reverse-progress-bar-*`, `reverse-btn-disabled-bg` |
| `--color-hs-form-neutral-dk`  | `headings`, `selectlist-caret-color`, `reverse-btn-*-hover-text`, `reverse-btn-*-focus-text`, `reverse-btn-*-active-text`                                                                                                            |

</details>

<details>
<summary><strong>Status Color Cascades (Error, Warning, Success)</strong></summary>

| Base Color                   | Cascades To                                               |
| ---------------------------- | --------------------------------------------------------- |
| `--color-hs-form-error`      | `required-indicator`, `error-message`, `error-box-border` |
| `--color-hs-form-error-lt`   | `error-box-bg`                                            |
| `--color-hs-form-error-dk`   | `error-box-text`                                          |
| `--color-hs-form-warning`    | `warning-message`                                         |
| `--color-hs-form-warning-dk` | `warning-border`                                          |
| `--color-hs-form-success`    | `success-message`, `success-box-text`                     |
| `--color-hs-form-success-lt` | `success-box-bg`                                          |
| `--color-hs-form-success-dk` | `success-box-border`                                      |

</details>

<details>
<summary><strong>White/Black Cascade</strong></summary>

| Base Color              | Cascades To                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-hs-form-white` | `btn-primary-text`, `btn-ancillary-text`, `selectlist-bg`, `selectlist-item-bg`, `progress-bar-bg`, `reverse-text`, `reverse-link`, `reverse-field-bg`, `reverse-btn-*-bg`, `reverse-progress-bar-bg` |
| `--color-hs-form-black` | `headings`, `field-bg`                                                                                                                                                                                |

</details>

<details>
<summary><strong>Common Override Scenarios</strong></summary>

**Progress bar fill should NOT be primary color:**

```css
:root {
  --color-hs-form-progress-bar-fill: #custom-color;
}
```

**Hover borders should be gray, not match default:**

```css
:root {
  --color-hs-form-field-hover-border: var(--color-hs-form-neutral);
}
```

**Button hover should be lighter, not darker:**

```css
:root {
  --color-hs-form-btn-primary-hover-bg: var(--color-hs-form-primary-lt);
  --color-hs-form-btn-primary-hover-border: var(--color-hs-form-primary-lt);
  --color-hs-form-btn-primary-hover-text: var(--color-hs-form-neutral-dk);
}
```

**Links should be different from primary:**

```css
:root {
  --color-hs-form-link: #0066cc;
  --color-hs-form-link-hover: #004499;
}
```

</details>

### Customizing Colors

You can fully customize colors by overriding base color variables in your project's CSS:

```css
/* your-styles.css */
:root {
  /* Primary brand colors */
  --color-hs-form-primary: oklch(0.55 0.2 340);
  --color-hs-form-primary-lt: oklch(0.92 0.08 340);
  --color-hs-form-primary-dk: oklch(0.35 0.22 340);

  /* Secondary colors */
  --color-hs-form-secondary: oklch(0.6 0.15 195);
  --color-hs-form-secondary-lt: oklch(0.9 0.08 195);
  --color-hs-form-secondary-dk: oklch(0.4 0.18 195);

  /* Error colors */
  --color-hs-form-error: oklch(0.65 0.24 29);
  --color-hs-form-error-lt: oklch(0.97 0.02 29);
  --color-hs-form-error-dk: oklch(0.45 0.22 29);
}
```

Import the pre-compiled CSS and your customizations will apply automatically:

```javascript
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
import "./your-styles.css"; // Your overrides
```

### Understanding OKLCH Colors

Colors use the OKLCH format. You can also use hex, rgb, or hsl if you prefer:

```css
/* OKLCH format (default) */
:root {
  --color-hs-form-primary: oklch(0.55 0.2 340);
  --color-hs-form-primary-lt: oklch(0.92 0.08 340);
  --color-hs-form-primary-dk: oklch(0.35 0.22 340);
}

/* Or use hex colors */
:root {
  --color-hs-form-primary: #3b82f6;
  --color-hs-form-primary-lt: #dbeafe;
  --color-hs-form-primary-dk: #1e40af;
}
```

### Common Customization Patterns

#### Change Primary Brand Color

```css
:root {
  /* Just change these three and buttons/links/focus states all update */
  --color-hs-form-primary: #3b82f6;
  --color-hs-form-primary-lt: #dbeafe;
  --color-hs-form-primary-dk: #1e40af;
}
```

#### Reverse Theme for Dark Backgrounds

**For forms appearing on a dark background**, a reverse-color theme (white text on dark background) can be achieved automatically by adding the class `.hs-form-reverse` to a parent container:

```html
<!-- Example: Form on a dark background -->
<div class="hs-form-reverse" style="background-color: #1a1a1a; padding: 2rem;">
  <!-- Your HubSpot form embed code here -->
  <div id="hubspot-form-container"></div>
</div>
```

The `.hs-form-reverse` class automatically applies:

- White text colors for labels and content
- Light button styles that work on dark backgrounds
- Inverted color schemes for all form elements
- Proper contrast for accessibility

No additional CSS customization needed - just add the class to any parent element containing your form.

#### Custom Dark Theme

If you need more control over dark theme colors, you can override the reverse theme variables:

```css
/* Custom dark theme overrides */
[data-theme="dark"] {
  --color-hs-form-primary: oklch(0.7 0.18 250);
  --color-hs-form-neutral: oklch(0.85 0.005 250);
  --color-hs-form-neutral-lt: oklch(0.65 0.004 250);
  --color-hs-form-neutral-dk: oklch(0.95 0.002 250);
  --color-hs-form-white: oklch(0.15 0 0);
  --color-hs-form-black: oklch(0.95 0 0);
}
```

### Advanced: Override Component Colors

If you need granular control over specific components (beyond base colors), override them in `:root`:

```css
/* Override specific component colors */
:root {
  /* Change only the submit button colors */
  --color-hs-form-btn-primary-bg: oklch(0.5 0.25 340);
  --color-hs-form-btn-primary-hover-bg: oklch(0.4 0.27 340);

  /* Change only error box styling */
  --color-hs-form-error-box-bg: oklch(0.98 0.01 29);
  --color-hs-form-error-box-border: oklch(0.4 0.24 29);
}
```

### Pre-built Themes

For convenience, you can create reusable theme files:

```css
/* themes/professional.css */
:root {
  --color-hs-form-primary: oklch(0.35 0.1 240);
  --color-hs-form-primary-lt: oklch(0.9 0.05 240);
  --color-hs-form-primary-dk: oklch(0.25 0.12 240);
}
```

```css
/* themes/vibrant.css */
:root {
  --color-hs-form-primary: oklch(0.6 0.25 300);
  --color-hs-form-primary-lt: oklch(0.95 0.08 300);
  --color-hs-form-primary-dk: oklch(0.4 0.27 300);
}
```

Then import the theme you want:

```javascript
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
import "./themes/professional.css"; // or vibrant.css
```

## TypeScript Support

The module includes full TypeScript definitions:

```typescript
import hubspotForms, {
  HubSpotFormsConfig,
  HubSpotFormManager,
  ValidationResult,
} from "@fahlgren-mortine/hubspot-form-usability-enhancements";

const config: HubSpotFormsConfig = {
  characterLimit: 1000,
  allowedExtensions: ["pdf", "docx"],
  maxFileSize: 5 * 1024 * 1024,
};

const instance = hubspotForms(config);
```

## Accessibility Features

- **WCAG 2.1 AA Compliant** - Meets accessibility standards
- **Keyboard Navigation** - Full keyboard support for all form elements
- **Screen Reader Support** - Proper ARIA labels and live regions
- **Focus Management** - Smart focus handling for multi-step forms
- **High Contrast Support** - Adapts to system high contrast settings
- **Reduced Motion Support** - Respects user motion preferences

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## React Hydration Compatibility

The module automatically detects React hydration contexts and:

- Delays initialization until hydration is complete
- Avoids conflicts with React DOM manipulation
- Uses `requestIdleCallback` for optimal performance
- Provides fallbacks for older browsers

### Hydration Error Solutions

If you encounter React hydration errors (like Error #418), use the delayed import pattern:

```javascript
// ❌ This may cause hydration conflicts
import "@fahlgren-mortine/hubspot-form-usability-enhancements";

// ✅ This prevents hydration conflicts
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  if (module.init) {
    module.init();
  }
}, 500); // 500ms delay allows React hydration to complete
```

### Framework-Specific Integration

The module works with any JavaScript framework or vanilla HTML. Here are platform-specific examples:

#### Vanilla HTML/JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css"
    />
  </head>
  <body>
    <!-- Your HubSpot form embed code here -->

    <script type="module">
      import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";

      // Auto-initialization will occur, or customize:
      hubspotForms({
        characterLimit: 1000,
        allowedExtensions: ["pdf", "docx", "jpg", "png"],
        maxFileSize: 5 * 1024 * 1024,
      });
    </script>
  </body>
</html>
```

#### React Applications

```jsx
// App.js or main component
import { useEffect } from "react";
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

function App() {
  useEffect(() => {
    // Initialize after React hydration is complete
    const timer = setTimeout(() => {
      hubspotForms({
        characterLimit: 1000,
        allowedExtensions: ["pdf", "docx", "jpg", "png"],
        maxFileSize: 5 * 1024 * 1024,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return <div className="App">{/* Your HubSpot form component */}</div>;
}
```

#### Vue.js Applications

```vue
<template>
  <div id="app">
    <!-- Your HubSpot form here -->
  </div>
</template>

<script>
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

export default {
  name: "App",
  mounted() {
    // Initialize after Vue component is mounted
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ["pdf", "docx", "jpg", "png"],
      maxFileSize: 5 * 1024 * 1024,
    });
  },
};
</script>
```

#### Angular Applications

```typescript
// app.component.ts
import { Component, OnInit } from "@angular/core";
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: [
    "./app.component.css",
    "../node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css",
  ],
})
export class AppComponent implements OnInit {
  ngOnInit() {
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ["pdf", "docx", "jpg", "png"],
      maxFileSize: 5 * 1024 * 1024,
    });
  }
}
```

#### Statamic with Alpine.js

```javascript
// resources/js/site.js
import Alpine from "alpinejs";

// Import CSS styles first
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Prevent auto-initialization
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Initialize Alpine first
window.Alpine = Alpine;
Alpine.start();

// Then initialize HubSpot forms after hydration
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  if (module.init) {
    module.init();
  }
}, 500);
```

#### Next.js App Router

```javascript
// app/layout.js
"use client";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { default: hubspotForms } =
        await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
      hubspotForms();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

#### Nuxt.js

```javascript
// plugins/hubspot-forms.client.js
export default defineNuxtPlugin(() => {
  if (process.client) {
    setTimeout(async () => {
      const { default: hubspotForms } =
        await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
      hubspotForms();
    }, 500);
  }
});
```

#### Svelte/SvelteKit

```svelte
<script>
  import { onMount } from 'svelte';
  import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
  import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

  onMount(() => {
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSize: 5 * 1024 * 1024
    });
  });
</script>

<!-- Your HubSpot form here -->
```

#### WordPress (with build tools)

```javascript
// src/js/main.js
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

document.addEventListener("DOMContentLoaded", () => {
  hubspotForms({
    characterLimit: 1000,
    allowedExtensions: ["pdf", "docx", "jpg", "png"],
    maxFileSize: 5 * 1024 * 1024,
  });
});
```

### Platform-Agnostic Integration

For any platform not listed above, follow this general pattern:

1. **Import the CSS styles** in your main stylesheet or JavaScript entry point
2. **Import the JavaScript module** in your main JavaScript file
3. **Initialize after DOM is ready** and any framework hydration is complete
4. **Use delayed initialization** (500ms timeout) if you encounter hydration conflicts

```javascript
// Generic platform integration
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Wait for DOM and framework initialization
const initializeHubSpotForms = () => {
  import("@fahlgren-mortine/hubspot-form-usability-enhancements").then(
    ({ default: hubspotForms }) => {
      hubspotForms({
        characterLimit: 1000,
        allowedExtensions: ["pdf", "docx", "jpg", "png"],
        maxFileSize: 5 * 1024 * 1024,
      });
    },
  );
};

// Choose appropriate timing for your platform:
// - Immediate: initializeHubSpotForms();
// - DOM ready: document.addEventListener('DOMContentLoaded', initializeHubSpotForms);
// - After hydration: setTimeout(initializeHubSpotForms, 500);
// - Framework lifecycle: useEffect(), mounted(), ngOnInit(), etc.
```

## API Reference

### Main Functions

#### `init(options?: HubSpotFormsConfig)`

Main initialization function.

```javascript
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";

const instance = hubspotForms({
  characterLimit: 750,
});
```

#### `HubSpotFormManager.setupAllForms()`

Setup validation for all HubSpot forms on the page.

#### `HubSpotFormManager.setupSingleForm(formContainer)`

Setup validation for a specific form.

#### `removeHubSpotFormStyles()`

Remove HubSpot's default form styles.

### Validators

#### `CharacterLimitValidator`

- `setupCharacterLimits(formContainer, cleanup)`
- `hasCharacterLimitError(textarea)`
- `getCharacterLimitErrorMessage(textarea)`

#### `FileUploadValidator`

- `validateFile(fileInput)`
- `formatFileSize(bytes)`
- `setup(formContainer)`

#### `FieldValidator`

- `isFieldValid(field, container)`
- `isFieldInvalid(field, container)`
- `needsValidation(field, container)`

## Troubleshooting

### React hydration conflicts (Error #418/#422)

**Problem**: React hydration errors when using immediate import

```javascript
// ❌ This can cause React hydration errors
import "@fahlgren-mortine/hubspot-form-usability-enhancements";
```

**Solution**: Use delayed import pattern

```javascript
// ✅ This prevents hydration conflicts
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  if (module.init) {
    module.init(); // Ensures proper positioning and functionality
  }
}, 500);
```

### Progress bars positioning incorrectly

**Problem**: Progress bars appear below forms instead of above
**Cause**: Module not calling immediate positioning logic
**Solution**: Ensure `module.init()` is called after delayed import

```javascript
// ✅ Correct: Manual init() preserves positioning
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  if (module.init) {
    module.init(); // This triggers immediate positioning
  }
}, 500);

// ❌ Incorrect: Only importing without initialization
setTimeout(() => {
  import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  // Missing init() call - positioning won't work
}, 500);
```

### Forms not initializing

```javascript
// Check if auto-initialization is disabled
if (window.HUBSPOT_FORMS_NO_AUTO_INIT) {
  // Manual initialization required
  import { HubSpotFormManager } from "@fahlgren-mortine/hubspot-form-usability-enhancements";
  HubSpotFormManager.setupAllForms();
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- GitHub Issues: [Repository Issues](https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements/issues)
- Documentation: [Full Documentation](https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements#readme)

---

Made with ❤️ by [Fahlgren Mortine Digital](https://www.fahlgrenmortine.com/)
