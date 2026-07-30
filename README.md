# @fahlgren-mortine/hubspot-form-usability-enhancements

Accessible usability and validation enhancements for HubSpot Developer Code forms.

This package ships pre-compiled CSS. Consumers do not need Tailwind, PostCSS, or custom build configuration for package styles.

## What it adds

- Step-level validation summary with field links
- File validation for extension and size
- Character counters and character-limit messaging
- Progress-bar repositioning for better step UX
- Dark-background support via hs-form-reverse
- React and SSR-safe initialization pattern

## Installation

### npm or bundlers

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

```js
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
import init from "@fahlgren-mortine/hubspot-form-usability-enhancements";

init();
```

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/styles.css" />
<script>
  window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "png"];
  window.HUBSPOT_FORMS_MAX_FILE_SIZE = "10MB";
  window.HUBSPOT_FORMS_ERROR_MESSAGES = {
    required: "This field is required.",
    fileSize: "Maximum file size is {maxSize}.",
  };
</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/index.cdn.js"></script>
```

## Configuration

You can configure in two ways:

- Programmatic options via init
- Window globals for CDN and runtime overrides

Programmatic example:

```js
import init from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

init({
  characterLimit: 500,
  allowedExtensions: ["pdf", "jpg", "png"],
  maxFileSize: "5MB",
  errorMessages: {
    fileSize: "File exceeds {maxSize}",
    fileType: "Allowed types: {allowedTypes}",
  },
});
```

Window globals:

```js
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ["pdf", "jpg", "png"];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = "5MB";
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  fileSize: "File exceeds {maxSize}",
};
```

### Precedence and defaults

- Site or app config overrides package defaults.
- Default max file size is 10MB when no override is provided.
- maxSize interpolation is sourced from resolved config value, not parsed from text.

## React and SSR-safe usage

```js
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

setTimeout(async () => {
  const module = await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  module.init({
    maxFileSize: "4MB",
  });
}, 500);
```

## Error message placeholders

- characterLimit supports limit, overBy, plural
- fileSize supports maxSize
- fileType supports allowedTypes

## Styling

Override root-level CSS variables in your app stylesheet. See theme-template.css for the full variable list.

For dark sections, wrap the form in hs-form-reverse.

```html
<div class="hs-form-reverse">
  <!-- HubSpot form -->
</div>
```

## Platform guides

- HubSpot CMS: user-docs/hubspot-cms.md
- Statamic: user-docs/statamic.md
- Nuxt and Storyblok: user-docs/nuxt-storyblok.md
- WordPress: user-docs/wordpress.md

## Development

See docs/DEVELOPMENT.md.

## License

MIT
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

## File upload behaviour and security

### How HubSpot handles file uploads

HubSpot uploads a file to its own CDN **immediately when the user selects it** via the file picker, before the form is submitted. This is HubSpot's built-in behaviour and cannot be intercepted by client-side JavaScript.

This means:

- A file lands on HubSpot's CDN at the moment of selection, regardless of whether the user completes or submits the form.
- **Client-side validation** (extension checks, size limits) provided by this package is UX-only. It controls what gets attached to the form submission, not what gets uploaded to the CDN. An invalid file will be rejected and removed from the submission, but the upload to HubSpot has already occurred.
- Any file selected — even one later rejected by this package's validation — will exist as an orphaned object on HubSpot's CDN. It will not be associated with any contact record or submission, but it is stored there.

### Client-side validation is not a security control

You cannot rely on browser-side file type or size checks to prevent malicious or unwanted files from reaching HubSpot's servers. Anyone can bypass JavaScript validation using browser developer tools.

**Real enforcement must happen server-side.** For HubSpot Developer Code forms, this means:

1. **HubSpot's own CDN security** — HubSpot scans uploaded files for malware on their end.
2. **Downstream handling** — Treat any file received from a form submission as untrusted. Do not open, execute, or serve files without scanning them independently.
3. **Informing users** — If your use case requires strict control over what is uploaded, consider whether a HubSpot form file field is the right tool, or whether you need a custom backend upload endpoint with server-side validation.

### What this package does control

When this package rejects a file (wrong extension or size), it:

1. Shows the user a clear error message.
2. Removes the rejected file from `fileInput.files` so it is **not included in the form submission**.
3. Suppresses HubSpot's "Upload complete" confirmation so users are not confused by a success message appearing alongside a rejection error.

The file may already be on HubSpot's CDN, but it will not be attached to any CRM record or deal.

### Disclaimer for implementers

> **This package provides client-side UX enhancements only.** File type and size restrictions shown to users are for guidance and usability — they are not security boundaries. Do not rely on this package to prevent unwanted content from being uploaded to HubSpot's servers. Implement server-side validation and file scanning appropriate to your threat model.

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
