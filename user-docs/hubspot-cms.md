# HubSpot CMS Integration

This guide covers how to add form enhancements to HubSpot-hosted websites using the Developer Code form component.

## Quick Start (Global Site Settings)

The fastest way to add enhancements without editing theme files:

1. In HubSpot, go to **Settings → Website → Pages**
2. Scroll to **Site Header HTML**
3. Add the following code:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/index.cdn.js"></script>
```

4. Click **Save**

That's it! All forms using the Developer Code component will now have enhanced validation, accessibility, and styling.

> **Note**: Use `index.cdn.js` (not `index.js`) for script tag usage. This version auto-initializes and removes HubSpot's default styles automatically.

### Customizing Colors

Add CSS variable overrides after the stylesheet link:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css"
/>
<style>
  :root {
    --color-hs-form-primary: #0056b3;
    --color-hs-form-error: #dc3545;
    --color-hs-form-warning: #ffc107;
  }
</style>
<script src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/index.cdn.js"></script>
```

See the main [README](../README.md) for all available CSS variables.

---

## Theme Integration (Production Recommended)

For better performance and version control, add the files directly to your theme.

### Step 1: Download the Files

Download from npm or jsdelivr:

- `https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css`
- `https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/index.cdn.js`

Or if using the HubSpot CLI locally:

```bash
npm pack @fahlgren-mortine/hubspot-form-usability-enhancements
tar -xzf fahlgren-mortine-hubspot-form-usability-enhancements-*.tgz
cp package/dist/styles.css your-theme/assets/hubspot-form-enhancements.css
cp package/dist/index.cdn.js your-theme/assets/hubspot-form-enhancements.js
```

### Step 2: Add to Theme Assets

Place the files in your theme's assets folder:

```
your-theme/
  assets/
    hubspot-form-enhancements.css
    hubspot-form-enhancements.js
```

### Step 3: Reference in base.html

Add to your theme's `templates/layouts/base.html` (or equivalent):

```html
{# In the <head> section #}
{{ require_css(get_asset_url("../../assets/hubspot-form-enhancements.css")) }}

{# Before </body> #}
{{ require_js(get_asset_url("../../assets/hubspot-form-enhancements.js")) }}
```

### Step 4: Upload Theme

Using HubSpot CLI:

```bash
hs upload your-theme your-theme
```

---

## Custom Module Integration

If you only want enhancements on specific pages, create a custom module:

### Module HTML + HubL

```html
{# module.html #} {% require_css %}
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/styles.css"
/>
{% end_require_css %}

<div class="enhanced-form-wrapper">
  {% module "form" path="@hubspot/form" form=module.form_field %}
</div>

{% require_js %}
<script src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements/dist/index.cdn.js"></script>
{% end_require_js %}
```

---

## Dark Background Support

For forms on dark backgrounds, add the `.hs-form-reverse` class to a parent container:

```html
<div class="hs-form-reverse">{% module "form" path="@hubspot/form" %}</div>
```

Or via HubSpot's drag-and-drop editor, add a custom class to the section containing the form.

---

## Version Pinning

For production stability, pin to a specific version:

```html
<!-- Pin to exact version -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1.0.0/dist/styles.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@1.0.0/dist/index.cdn.js"></script>

<!-- Or use semver range for patch updates -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@^1.0.0/dist/styles.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@fahlgren-mortine/hubspot-form-usability-enhancements@^1.0.0/dist/index.cdn.js"></script>
```

---

## Troubleshooting

### Forms not styled

- Verify the form uses the **Developer Code component** (forms show `.hsfc-Form` class in inspector)
- Check browser console for loading errors
- Ensure CSS loads before the form renders

### JavaScript errors

- The script auto-initializes on page load
- If forms load dynamically after page load, the MutationObserver will detect them automatically
- No manual initialization needed

### Styles conflict with theme

- The enhancements use scoped selectors (`.hsfc-*`)
- If conflicts occur, increase specificity in your theme CSS or adjust the CSS variables

---

## Comparison: Integration Methods

| Method               | Setup Time | Performance | Maintenance    | Best For                   |
| -------------------- | ---------- | ----------- | -------------- | -------------------------- |
| Global Site Settings | 2 min      | Good        | Auto-updates   | Quick testing, small sites |
| Theme Assets         | 15 min     | Best        | Manual updates | Production sites           |
| Custom Module        | 10 min     | Best        | Manual updates | Selective page usage       |
