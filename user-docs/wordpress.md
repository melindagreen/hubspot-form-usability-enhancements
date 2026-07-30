# WordPress Integration

Use this package in custom themes that render HubSpot forms inline.

Do not use the HubSpot WordPress plugin iframe mode with this package.

## Install

```bash
cd wp-content/themes/your-theme
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## Theme entry file

```js
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

window.HUBSPOT_FORMS_NO_AUTO_INIT = true;
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ["pdf", "doc", "jpg"];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = "5MB";
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  fileSize: "Max file size is {maxSize}",
};
window.HUBSPOT_FORMS_MOBILE_STEP_SCROLL_RESET = {
  enabled: true,
  breakpoint: 768,
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
```

## Optional wp_head config injection

```php
add_action('wp_head', function () {
  echo '<script>';
  echo 'window.HUBSPOT_FORMS_MAX_FILE_SIZE = "5MB";';
  echo 'window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ["pdf","doc","jpg"];';
  echo '</script>';
});
```

## Enqueue built assets

```php
add_action('wp_enqueue_scripts', function () {
  wp_enqueue_script('theme-main', get_template_directory_uri() . '/dist/main.js', [], null, true);
  wp_enqueue_style('theme-main', get_template_directory_uri() . '/dist/main.css', [], null);
});
```

## Troubleshooting

- No enhancement: confirm the form is inline markup and includes hsfc-Form.
- Wrong message text: set HUBSPOT_FORMS_ERROR_MESSAGES before module init.
- Wrong max size in message: set HUBSPOT_FORMS_MAX_FILE_SIZE, for example 4MB.
- Mobile step scroll reset not applying: confirm mobile breakpoint settings and multi-step form structure.
