# Nuxt and Storyblok Integration

This guide covers client-side initialization in Nuxt after hydration.

## Install

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## app.vue or default layout

```vue
<script setup lang="ts">
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

if (process.client) {
  window.HUBSPOT_FORMS_NO_AUTO_INIT = true;
  window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ["pdf", "jpg", "png"];
  window.HUBSPOT_FORMS_MAX_FILE_SIZE = "4MB";
  window.HUBSPOT_FORMS_ERROR_MESSAGES = {
    fileSize: "Maximum file size is {maxSize}",
  };
  window.HUBSPOT_FORMS_MOBILE_STEP_SCROLL_RESET = {
    enabled: true,
    onlyWhenFormTopAboveViewport: true,
    behavior: "smooth",
    respectReducedMotion: true,
  };

  setTimeout(async () => {
    const module = await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
    module.init({
      allowedExtensions: window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS,
      maxFileSize: window.HUBSPOT_FORMS_MAX_FILE_SIZE,
      errorMessages: window.HUBSPOT_FORMS_ERROR_MESSAGES,
      mobileStepScrollReset: window.HUBSPOT_FORMS_MOBILE_STEP_SCROLL_RESET,
    });
  }, 500);
}
</script>
```

## Storyblok content model

Store values like portal, region, and form id in Storyblok fields. Render forms as inline markup, not iframes.

## Troubleshooting

- No enhancements: ensure client-only execution and hsfc-Form markup.
- Custom text not applied: define HUBSPOT_FORMS_ERROR_MESSAGES before init.
- fileSize placeholder wrong: set HUBSPOT_FORMS_MAX_FILE_SIZE explicitly.
- Mobile step scroll reset not applying: ensure viewport is below the configured breakpoint and the form has multiple steps.

**Forms render as iframes:** Must use Developer Script URL (`.../forms/embed/developer/{portalId}.js`).
