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

## Quick Start

### Basic Usage (Auto-initialization)

```javascript
// Import the module and styles - forms will initialize automatically
import '@fahlgren-mortine/hubspot-form-usability-enhancements';
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
```

### React Usage

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

### Forms not initializing
```javascript
// Check if auto-initialization is disabled
console.log(window.HUBSPOT_FORMS_NO_AUTO_INIT);

// Manual initialization
import { HubSpotFormManager } from '@fahlgren-mortine/hubspot-form-usability-enhancements';
HubSpotFormManager.setupAllForms();
```

### React hydration conflicts
```javascript
// Add delay for React hydration
useEffect(() => {
  const timer = setTimeout(() => {
    hubspotForms();
  }, 250);
  return () => clearTimeout(timer);
}, []);
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