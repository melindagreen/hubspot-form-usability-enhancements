# Statamic Integration

Add HubSpot form enhancements to Statamic sites using Vite.

## Requirements

- Statamic with Vite
- Node.js 20+

## Installation

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## Implementation

### resources/js/site.js

```javascript
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

window.HUBSPOT_FORMS_NO_AUTO_INIT = true;
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'jpg'];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB';

import Alpine from 'alpinejs';
window.Alpine = Alpine;
Alpine.start();

// Delay for React hydration
setTimeout(async () => {
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
  module.init();
}, 500);
```

### resources/css/hubspot-forms.css (optional)

```css
:root {
  --color-hs-form-primary: oklch(53.24% 0.301 290.86);
  --color-hs-form-error: #dc2626;
  --hs-form-field-border-radius: 0.375rem;
}
```

```javascript
// In resources/js/site.js, BEFORE the dynamic import

// Configure allowed file types
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = 'pdf,doc,docx,jpg,jpeg,png,gif,txt';
// Or as an array:
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

// Configure maximum file size
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB'; // Supports: KB, MB, GB

// Customize error messages
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  required: "This field is required for submission.",
  email: "Please enter a valid email address.",
  pattern: "Please check the format of this field.",
  characterLimit: "Maximum {limit} characters allowed. You have {overBy} character{plural} too many.",
  date: "Please enter a valid date.",
  phone: "Please enter a valid phone number.",
  file: "This file type is not allowed.",
  fileSize: "File size exceeds the {maxSize} limit.",
  fileType: "Only these file types are allowed: {allowedTypes}",
  url: "Please enter a valid web address.",
  number: "Please enter a valid number.",
  confirmation: "The confirmation does not match.",
  captcha: "Please complete the verification.",
  submission: "There was an error submitting the form. Please try again.",
  network: "Connection error. Please check your internet connection."
};

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

### Configuration

```javascript
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'jpg'];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB';
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  required: "Required",
  email: "Invalid email",
  fileType: "Allowed: {allowedTypes}"
};
```

## Vite Configuration

```javascript
// vite.config.js
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    laravel({
      refresh: true,
      input: ['resources/css/site.css', 'resources/js/site.js']
    })
  ]
});
```

## Layout Template

```html
<!-- resources/views/layout.antlers.html -->
<!doctype html>
<html lang="{{ site:short_locale }}">
<head>
  {{ vite src="resources/css/site.css|resources/js/site.js" }}
</head>
<body>
  <!-- content -->
</body>
</html>
```

## Dark Backgrounds

```html
<div class="hs-form-reverse bg-slate-900">
  <!-- HubSpot form -->
</div>
```

## Troubleshooting

**React Hydration Error #418:** Set `window.HUBSPOT_FORMS_NO_AUTO_INIT = true` before import, use 500ms delay.

**Styles not applying:** Ensure module styles import first in JS.

**Forms not enhanced:** Verify `.hsfc-Form` class exists (Developer Code component).
