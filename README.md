# @fahlgren-mortine/hubspot-form-usability-enhancements

Enhanced HubSpot form usability, validation and styling with React hydration support and accessibility improvements.

## Features

- 🚀 **React Hydration Support** - Works seamlessly with SSR and React hydration
- ♿ **Accessibility Enhanced** - WCAG 2.1 compliant with improved keyboard navigation
- 🎨 **No Tailwind Required in Your Project** - Pre-compiled CSS included; no Tailwind dependency
- 🌓 **Dark Background Support** - Automatic reverse theme with `.hs-form-reverse` class for forms on dark backgrounds
- ✅ **Advanced Validation** - Custom validation with enhanced error handling
- 📁 **File Upload Validation** - Configurable file type and size validation
- 📝 **Character Limit Validation** - Smart character counting with custom error handling
- 📱 **Mobile Optimized** - Responsive design with touch-friendly interactions
- 🎯 **TypeScript Support** - Full type definitions included

## Installation

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```



**Important**: This package is built with Tailwind CSS v4.0+ and includes it as a peer dependency. However, **you don't need Tailwind CSS in your own project** to use this module:

- **Using pre-compiled CSS**: Simply import the compiled stylesheet - no Tailwind required in your project
- **Custom styling with Tailwind**: If your project already uses Tailwind CSS v4+, you can leverage `@apply` directives and `@theme` customization

See [Styling Customization](#styling-customization) for details on both approaches.

### CSS Styles

The module requires CSS styles to be imported separately for proper styling:

```javascript
// Always import the CSS styles
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
```

**Important**: The styles import is separate from the JavaScript module import. This allows you to:
- Import styles once in your main CSS/JS file
- Customize or replace styles without affecting functionality
- Optimize bundle splitting in build tools

```javascript
// Example: Import both module and styles
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
```

## Quick Start

For most users, this is all you need:

```bash
# Install the package (includes all necessary styles pre-compiled)
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

```javascript
// Import in your main JavaScript file
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// That's it! The module will auto-initialize when HubSpot forms are detected.
```

**No Tailwind CSS required in your project!** The package comes with pre-compiled CSS that includes all necessary styles. You can still customize colors by overriding CSS variables in `:root`.

**If your project uses Tailwind CSS v4+**: You can leverage advanced features like `@apply` directives and `@theme` customization. See [Styling Customization](#styling-customization) for details.

**For forms on dark backgrounds**: Simply add the class `.hs-form-reverse` to any parent container for automatic white text and inverted colors. See [Reverse Theme for Dark Backgrounds](#reverse-theme-for-dark-backgrounds).

For React/SSR applications, see the [React/Hydration-Safe Usage](#reacthydration-safe-usage) section below.

## Complete Setup Guide

### Step 1: Install the Package

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

### Step 2: Install Peer Dependencies (Optional for Your Project)

**You don't need to install Tailwind CSS unless your project already uses it.**

The package was built with Tailwind CSS v4.0+ (listed as a peer dependency), but the compiled CSS is included in the package. You only need to install Tailwind in your project if you want to use advanced customization features:

```bash
# Optional: Only install if your project uses Tailwind CSS v4+
npm install tailwindcss@^4.0.0
```

**Without Tailwind CSS in your project**: Use the pre-compiled CSS and customize by overriding CSS variables in `:root`. See [Styling Customization](#styling-customization).

**With Tailwind CSS v4+ in your project**: Access advanced features like `@apply` directives and `@theme` customization. You'll need to configure Tailwind (see Step 3).

### Step 3: Configure Tailwind CSS (Only If Your Project Uses Tailwind)

**Skip this step if your project doesn't use Tailwind CSS.**

If your project uses Tailwind CSS v4+, add the module to your Tailwind configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue,svelte}',
    './node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/**/*.js',
    // ... your other content paths
  ],
  theme: {
    extend: {
      // Your custom theme extensions
    }
  },
  plugins: [
    // Your plugins
  ]
};
```

### Step 4: Import Styles

Import the CSS styles in your main stylesheet or JavaScript entry point:

```javascript
// Method 1: Import in JavaScript
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Method 2: Import in CSS
@import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
```

```html
<!-- Method 3: Link in HTML -->
<link rel="stylesheet" href="node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css">
```

### Step 5: Add HubSpot Form Embed Code

Add your HubSpot form embed code to your HTML. The module will automatically detect and enhance any forms with the class `.hsfc-Form`.

```html
<!-- Example HubSpot form embed -->
<div id="hubspot-form-container">
  <!-- Your HubSpot form embed script goes here -->
</div>
```

### Step 6: Initialize the Module

Choose the initialization method that best fits your platform:

#### Option A: Auto-Initialization (Simplest)
```javascript
// Import and let the module initialize automatically
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
```

#### Option B: Manual Initialization (More Control)
```javascript
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

hubspotForms({
  characterLimit: 1000,
  allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
  maxFileSize: 5 * 1024 * 1024 // 5MB
});
```

#### Option C: Delayed Initialization (React/SSR Safe)
```javascript
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Prevent auto-initialization
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Initialize after framework hydration
setTimeout(async () => {
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
  if (module.init) {
    module.init({
      characterLimit: 1000,
      allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSize: 5 * 1024 * 1024
    });
  }
}, 500);
```

### Step 7: Test Your Integration

1. **Load your page** with a HubSpot form
2. **Check that styles are applied** - forms should have enhanced styling
3. **Test character limits** - type in textarea fields to see character counters
4. **Test file uploads** - try uploading files to see validation
5. **Test form validation** - submit incomplete forms to see enhanced error messages
6. **Check browser console** - should be free of errors
7. **Test on mobile devices** - ensure responsive behavior works

### Step 8: Customize (Optional)

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
  characterLimit: 750,           // Custom character limit
  allowedExtensions: [           // Custom file types
    'pdf', 'doc', 'docx', 
    'jpg', 'jpeg', 'png', 'gif', 'svg'
  ],
  maxFileSize: 20 * 1024 * 1024  // 20MB limit
});
```

### Basic Usage (Auto-initialization)

For environments without React or hydration concerns:

```javascript
// Import the module and styles - forms will initialize automatically
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
```

### React/Hydration-Safe Usage

For React applications or environments with hydration (SSR/SSG):

```javascript
// Import CSS styles first
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Prevent auto-initialization to avoid React hydration conflicts
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Initialize after framework hydration completes
setTimeout(async () => {
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
  
  // Manually trigger initialization after module loads
  if (module.init) {
    module.init();
  }
}, 500);
```

### React Component Usage

```jsx
import { useEffect } from 'react';
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

function MyFormComponent() {
  useEffect(() => {
    // Initialize forms after component mounts
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSize: 5 * 1024 * 1024 // 5MB
    });
  }, []);

  return (
    <div id="hubspot-form-container">
      {/* HubSpot form embed code goes here */}
    </div>
  );
}
```

### Custom Configuration

```javascript
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

hubspotForms({
  characterLimit: 1000,           // Custom character limit for textareas
  allowedExtensions: [            // Allowed file extensions
    'pdf', 'doc', 'docx', 
    'jpg', 'jpeg', 'png', 'gif'
  ],
  maxFileSize: 10 * 1024 * 1024   // 10MB file size limit
});
```

## Advanced Usage

### Granular Control

```javascript
import { 
  HubSpotFormManager, 
  CharacterLimitValidator,
  FileUploadValidator 
} from '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Manual form setup
HubSpotFormManager.setupAllForms();

// Setup specific form
const formElement = document.querySelector('.hsfc-Form');
HubSpotFormManager.setupSingleForm(formElement);

// Custom character limit for specific textarea
const textarea = document.querySelector('#my-textarea');
CharacterLimitValidator.setupSingleTextarea(textarea, cleanupController);
```

### Preventing Auto-initialization

```javascript
// Set flag before importing to prevent auto-initialization
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Manual initialization with custom timing
setTimeout(() => {
  import('@fahlgren-mortine/hubspot-form-usability-enhancements').then(({ HubSpotFormManager }) => {
    HubSpotFormManager.setupAllForms();
  });
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
      '@hubspot-forms': '@fahlgren-mortine/hubspot-form-usability-enhancements'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  }
};
```

### Vite
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // ... your config
  resolve: {
    alias: {
      '@hubspot-forms': '@fahlgren-mortine/hubspot-form-usability-enhancements'
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
});
```

### Rollup
```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';

export default {
  // ... your config
  plugins: [
    resolve(),
    postcss({
      extract: true,
      minimize: true
    })
  ]
};
```

### Parcel
```json
// package.json
{
  "browserslist": [
    "defaults"
  ],
  "@parcel/resolver-default": {
    "packageExports": true
  }
}
```

No additional configuration needed - Parcel handles the module automatically.

### esbuild
```javascript
// build.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outdir: 'dist',
  loader: {
    '.css': 'css'
  },
  external: ['@fahlgren-mortine/hubspot-form-usability-enhancements']
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `characterLimit` | `number` | `500` | Default character limit for textarea fields |
| `allowedExtensions` | `string[]` | `['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'txt']` | Allowed file extensions for upload fields |
| `maxFileSize` | `number` | `10485760` (10MB) | Maximum file size in bytes |

## Environment Variables

You can also configure the module using environment variables:

```bash
# .env
VITE_UPLOAD_ALLOWED_EXTENSIONS=pdf,doc,docx,jpg,jpeg,png
VITE_UPLOAD_MAX_SIZE=10MB
```

## Styling Customization


The module provides a flexible color system that works out of the box. **No Tailwind CSS is required** to use and customize this module. The pre-compiled CSS is included.

### Color System Architecture

The styling system uses a two-tier architecture:
- **Base colors** defined in `:root` - these are the colors you override
- **Component colors** defined in `@theme` - these reference base colors using `var()`

This cascading design means you typically only need to override base colors, and all components automatically update.


### Customizing Colors

You can fully customize colors by overriding base color variables in your project's CSS:

```css
/* your-styles.css */
:root {
  /* Primary brand colors */
  --color-hs-form-primary: oklch(0.55 0.20 340);
  --color-hs-form-primary-lt: oklch(0.92 0.08 340);
  --color-hs-form-primary-dk: oklch(0.35 0.22 340);
  
  /* Secondary colors */
  --color-hs-form-secondary: oklch(0.60 0.15 195);
  --color-hs-form-secondary-lt: oklch(0.90 0.08 195);
  --color-hs-form-secondary-dk: oklch(0.40 0.18 195);
  
  /* Error colors */
  --color-hs-form-error: oklch(0.65 0.24 29);
  --color-hs-form-error-lt: oklch(0.97 0.02 29);
  --color-hs-form-error-dk: oklch(0.45 0.22 29);
}
```

Import the pre-compiled CSS and your customizations will apply automatically:

```javascript
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
import './your-styles.css'; // Your overrides
```



### Understanding OKLCH Colors

Colors use the OKLCH format. You can also use hex, rgb, or hsl if you prefer:

```css
/* OKLCH format (default) */
:root {
  --color-hs-form-primary: oklch(0.55 0.20 340);
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
  --color-hs-form-primary: oklch(0.70 0.18 250);
  --color-hs-form-neutral: oklch(0.85 0.005 250);
  --color-hs-form-neutral-lt: oklch(0.65 0.004 250);
  --color-hs-form-neutral-dk: oklch(0.95 0.002 250);
  --color-hs-form-white: oklch(0.15 0 0);
  --color-hs-form-black: oklch(0.95 0 0);
}
```

### Advanced: Override Component Colors

If you need granular control over specific components (beyond base colors):

```css
/* Override specific component colors in @theme */
@theme {
  /* Change only the submit button colors */
  --color-hs-form-btn-hs-form-primary-bg: oklch(0.50 0.25 340);
  --color-hs-form-btn-hs-form-primary-hover-bg: oklch(0.40 0.27 340);
  
  /* Change only error box styling */
  --color-hs-form-error-box-bg: oklch(0.98 0.01 29);
  --color-hs-form-error-box-border: oklch(0.40 0.24 29);
}
```

### Pre-built Themes

For convenience, you can create reusable theme files:

```css
/* themes/professional.css */
:root {
  --color-hs-form-primary: oklch(0.35 0.10 240);
  --color-hs-form-primary-lt: oklch(0.90 0.05 240);
  --color-hs-form-primary-dk: oklch(0.25 0.12 240);
}
```

```css
/* themes/vibrant.css */
:root {
  --color-hs-form-primary: oklch(0.60 0.25 300);
  --color-hs-form-primary-lt: oklch(0.95 0.08 300);
  --color-hs-form-primary-dk: oklch(0.40 0.27 300);
}
```

Then import the theme you want:

```javascript
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
import './themes/professional.css'; // or vibrant.css
```

## TypeScript Support

The module includes full TypeScript definitions:

```typescript
import hubspotForms, { 
  HubSpotFormsConfig,
  HubSpotFormManager,
  ValidationResult 
} from '@fahlgren-mortine/hubspot-form-usability-enhancements';

const config: HubSpotFormsConfig = {
  characterLimit: 1000,
  allowedExtensions: ['pdf', 'docx'],
  maxFileSize: 5 * 1024 * 1024
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
import '@fahlgren-mortine/hubspot-form-usability-enhancements';

// ✅ This prevents hydration conflicts
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

setTimeout(async () => {
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
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
    <link rel="stylesheet" href="node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css">
</head>
<body>
    <!-- Your HubSpot form embed code here -->
    
    <script type="module">
        import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
        
        // Auto-initialization will occur, or customize:
        hubspotForms({
            characterLimit: 1000,
            allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
            maxFileSize: 5 * 1024 * 1024
        });
    </script>
</body>
</html>
```

#### React Applications
```jsx
// App.js or main component
import { useEffect } from 'react';
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

function App() {
  useEffect(() => {
    // Initialize after React hydration is complete
    const timer = setTimeout(() => {
      hubspotForms({
        characterLimit: 1000,
        allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
        maxFileSize: 5 * 1024 * 1024
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {/* Your HubSpot form component */}
    </div>
  );
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
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

export default {
  name: 'App',
  mounted() {
    // Initialize after Vue component is mounted
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSize: 5 * 1024 * 1024
    });
  }
}
</script>
```

#### Angular Applications
```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    '../node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css'
  ]
})
export class AppComponent implements OnInit {
  ngOnInit() {
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSize: 5 * 1024 * 1024
    });
  }
}
```

#### Statamic with Alpine.js
```javascript
// resources/js/site.js
import Alpine from 'alpinejs';

// Import CSS styles first
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Prevent auto-initialization
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Initialize Alpine first
window.Alpine = Alpine;
Alpine.start();

// Then initialize HubSpot forms after hydration
setTimeout(async () => {
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
  if (module.init) {
    module.init();
  }
}, 500);
```

#### Next.js App Router
```javascript
// app/layout.js
'use client';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { default: hubspotForms } = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
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
      const { default: hubspotForms } = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
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
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

document.addEventListener('DOMContentLoaded', () => {
  hubspotForms({
    characterLimit: 1000,
    allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
    maxFileSize: 5 * 1024 * 1024
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
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Wait for DOM and framework initialization
const initializeHubSpotForms = () => {
  import('@fahlgren-mortine/hubspot-form-usability-enhancements')
    .then(({ default: hubspotForms }) => {
      hubspotForms({
        characterLimit: 1000,
        allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
        maxFileSize: 5 * 1024 * 1024
      });
    });
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
import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';

const instance = hubspotForms({
  characterLimit: 750
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
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
```

**Solution**: Use delayed import pattern
```javascript
// ✅ This prevents hydration conflicts
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

setTimeout(async () => {
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
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
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
  if (module.init) {
    module.init(); // This triggers immediate positioning
  }
}, 500);

// ❌ Incorrect: Only importing without initialization
setTimeout(() => {
  import('@fahlgren-mortine/hubspot-form-usability-enhancements');
  // Missing init() call - positioning won't work
}, 500);
```

### Forms not initializing
```javascript
// Check if auto-initialization is disabled
if (window.HUBSPOT_FORMS_NO_AUTO_INIT) {
  // Manual initialization required
  import { HubSpotFormManager } from '@fahlgren-mortine/hubspot-form-usability-enhancements';
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