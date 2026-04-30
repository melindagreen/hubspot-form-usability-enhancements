# HubSpot CMS Integration

Add form enhancements to HubSpot Developer Code forms.

## Site-Wide Setup

**Settings → Website → Pages → Site Header HTML:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/styles.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/index.cdn.js"></script>
```

## Configuration

### File Validation

```html
<script>
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'jpg'];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB';
</script>
<!-- Load script after config -->
```

### Color Customization

```html
<style>
:root {
  --color-hs-form-primary: #0056b3;
  --color-hs-form-danger: #dc3545;
}
</style>
```

### Error Messages

```html
<script>
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  required: "Required",
  email: "Invalid email",
  fileType: "Allowed: {allowedTypes}"
};
</script>
```

## Per-Page Setup

Add to Page Settings → Advanced → Footer HTML for individual pages.

## Theme Integration

### Download Files

```bash
npm pack @fahlgren-mortine/hubspot-form-usability-enhancements
tar -xzf *.tgz
cp package/dist/* your-theme/assets/
```

### Reference in base.html

```html
{# <head> #}
{{ require_css(get_asset_url("../../assets/styles.css")) }}

{# Before </body> #}
{{ require_js(get_asset_url("../../assets/index.cdn.js")) }}
```

### Upload

```bash
hs upload your-theme your-theme
```

## Custom Module

```html
{# module.html #}
{% require_css %}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/styles.css">
{% end_require_css %}

{% module "form" path="@hubspot/form" %}

{% require_js %}
<script type="module" src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1/dist/index.cdn.js"></script>
{% end_require_js %}
```

## Dark Backgrounds

```html
<div class="hs-form-reverse">
  {% module "form" path="@hubspot/form" %}
</div>
```

## Version Pinning

```html
<!-- Exact version -->
<script src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1.1.1/dist/index.cdn.js"></script>

<!-- Semver range (patch updates) -->
<script src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@^1.1.0/dist/index.cdn.js"></script>
```

## Troubleshooting

**Forms not styled:** Verify Developer Code component (`.hsfc-Form` class). CSS must load before form renders.

**Styles conflict:** Enhancements use `.hsfc-*` selectors. Override CSS variables for customization.
