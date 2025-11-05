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

// Alpine.js or other framework initialization...
window.Alpine = Alpine;
Alpine.start();

// Delay HubSpot module import until after React hydration completes
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

### Next.js Usage

```javascript
// pages/_app.js or app/layout.js
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

// For client-side only initialization
useEffect(() => {
  if (typeof window !== 'undefined') {
    import('@fahlgren-mortine/hubspot-form-usability-enhancements').then(({ default: hubspotForms }) => {
      hubspotForms();
    });
  }
}, []);
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
console.log(window.HUBSPOT_FORMS_NO_AUTO_INIT);

// Manual initialization
import { HubSpotFormManager } from '@fahlgren-mortine/hubspot-form-usability-enhancements';
HubSpotFormManager.setupAllForms();
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