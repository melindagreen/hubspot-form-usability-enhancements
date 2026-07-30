# Statamic Integration

Use this package in a Statamic site where HubSpot forms render hsfc markup.

## Install

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## resources/js/site.js example

```js
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
import Alpine from "alpinejs";

window.HUBSPOT_FORMS_NO_AUTO_INIT = true;
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ["pdf", "jpg", "png"];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = "4MB";
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  fileSize: "File exceeds maximum size of {maxSize}",
};
window.HUBSPOT_FORMS_MOBILE_STEP_SCROLL_RESET = {
  enabled: true,
  breakpoint: 768,
  onlyWhenFormTopAboveViewport: true,
  behavior: "smooth",
  respectReducedMotion: true,
};

window.Alpine = Alpine;
Alpine.start();

setTimeout(async () => {
  const module = await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  module.init({
    allowedExtensions: window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS,
    maxFileSize: window.HUBSPOT_FORMS_MAX_FILE_SIZE,
    errorMessages: window.HUBSPOT_FORMS_ERROR_MESSAGES,
    mobileStepScrollReset: window.HUBSPOT_FORMS_MOBILE_STEP_SCROLL_RESET,
  });
}, 500);
```

## Optional theming

```css
:root {
  --color-hs-form-primary: #1d4ed8;
  --color-hs-form-error: #b91c1c;
}
```

## Troubleshooting

- Messages not overridden: set HUBSPOT_FORMS_ERROR_MESSAGES before init.
- Wrong file-size placeholder value: set HUBSPOT_FORMS_MAX_FILE_SIZE explicitly.
- No enhancements: verify form markup includes hsfc-Form.
- Mobile step scroll reset not applying: verify viewport width and breakpoint configuration.
