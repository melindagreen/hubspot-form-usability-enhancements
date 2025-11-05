# @fahlgren-mortine/hubspot-form-usability-enhancements

Enhanced HubSpot form usability, validation and styling with React hydration support, accessibility improvements, and Tailwind CSS integration.

## Features

- 🚀 **React Hydration Support** - Works seamlessly with SSR and React hydration
- ♿ **Accessibility Enhanced** - WCAG 2.1 compliant with improved keyboard navigation
- 🎨 **Tailwind CSS 4+ Integration** - Modern styling with @apply directives
- ✅ **Advanced Validation** - Custom validation with enhanced error handling
- 📁 **File Upload Validation** - Configurable file type and size validation
- 📝 **Character Limit Validation** - Smart character counting with custom error handling
- 📱 **Mobile Optimized** - Responsive design with touch-friendly interactions
- 🎯 **TypeScript Support** - Full type definitions included

## Installation

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

**Peer Dependencies:**
- `tailwindcss`: ^4.0.0

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
# Install the package
npm install @fahlgren-mortine/hubspot-form-usability-enhancements

# Install Tailwind CSS peer dependency
npm install tailwindcss@^4.0.0
```

```javascript
// Import in your main JavaScript file
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// That's it! The module will auto-initialize when HubSpot forms are detected.
```

For React/SSR applications, see the [React/Hydration-Safe Usage](#reacthydration-safe-usage) section below.

## Complete Setup Guide

### Step 1: Install the Package

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

### Step 2: Install Peer Dependencies

```bash
npm install tailwindcss@^4.0.0
```

### Step 3: Configure Tailwind CSS

Add the module to your Tailwind configuration to ensure styles are processed:

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

The module uses Tailwind CSS for styling. You can customize the appearance by:

### 1. Overriding CSS Variables

```css
div[data-hsfc-id=Renderer] {
  --hsfc-primary-color: #your-color;
  --hsfc-error-color: #your-error-color;
  --hsfc-border-radius: 8px;
}
```

### 2. Custom Tailwind Classes

```javascript
// Import without styles and add your own
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
// Don't import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// Add your custom CSS file with Tailwind classes
import './my-custom-hubspot-styles.css';
```

### 3. Themed Variations

```css
/* Light theme (default) */
.hsfc-theme-light {
  /* Uses default styling */
}

/* Dark theme */
.hsfc-theme-dark {
  /* Add dark theme overrides */
}

/* Minimal theme */
.hsfc-theme-minimal {
  /* Add minimal styling */
}
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

### Styling not applied
```javascript
// Ensure Tailwind CSS is configured for the module
// tailwind.config.js
module.exports = {
  content: [
    './node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/**/*.js',
    // ... your other content paths
  ],
  // ... rest of config
};
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