# HubSpot CMS Integration

Use this package with HubSpot Developer Code forms that render hsfc markup.

## Site-wide include

Add in Site Header HTML.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/styles.css" />
<script>
  window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ["pdf", "doc", "jpg"];
  window.HUBSPOT_FORMS_MAX_FILE_SIZE = "10MB";
  window.HUBSPOT_FORMS_ERROR_MESSAGES = {
    fileSize: "Max file size is {maxSize}",
    fileType: "Allowed types: {allowedTypes}",
  };
  window.HUBSPOT_FORMS_MOBILE_STEP_SCROLL_RESET = {
    enabled: true,
    breakpoint: 768,
    onlyWhenFormTopAboveViewport: true,
    behavior: "smooth",
    respectReducedMotion: true,
  };
</script>
<script type="module" src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/index.cdn.js"></script>
```

## Per-page include

Use the same snippet in page-level advanced HTML when you do not want global behavior.

## Dark backgrounds

```html
<div class="hs-form-reverse">
  <!-- HubSpot form module -->
</div>
```

## Theming

Override CSS variables in a global style block.

```html
<style>
:root {
  --color-hs-form-primary: #0056b3;
  --color-hs-form-error: #c1121f;
}
</style>
```

## Troubleshooting

- Forms are not enhanced: confirm rendered markup contains hsfc-Form.
- Custom messages not used: define globals before loading index.cdn.js.
- Wrong file size in message: set HUBSPOT_FORMS_MAX_FILE_SIZE explicitly, for example 4MB.
- Mobile step scroll reset not applying: confirm viewport is below the configured breakpoint and the form is multi-step.
