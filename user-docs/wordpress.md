# Implementing HubSpot Form Enhancements in WordPress

This guide covers integrating `@fahlgren-mortine/hubspot-form-usability-enhancements` into a WordPress theme using Vite or webpack for asset compilation.

> 🚫 **HubSpot WordPress Plugin Not Supported**
>
> The official [HubSpot WordPress plugin](https://wordpress.org/plugins/leadin/) embeds forms in **iframes**. Due to browser cross-origin restrictions, this module **cannot enhance iframed forms** — JavaScript and CSS cannot reach content inside iframes hosted on HubSpot's domain.
>
> **This guide uses manual HubSpot embed code instead**, which supports inline (non-iframe) rendering.

## Prerequisites

- WordPress site with a custom theme
- Build tool (Vite or webpack) configured in your theme
- Node.js 20+
- npm or yarn
- HubSpot account with forms (you'll use the manual embed code, not the plugin)

## Installation

```bash
cd wp-content/themes/your-theme
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## File Structure

Typical WordPress theme structure with build tools:

```
wp-content/themes/your-theme/
├── assets/
│   ├── css/
│   │   └── main.css         # Your main CSS
│   └── js/
│       └── main.js          # Your main JS (imports module)
├── dist/                    # Compiled assets (Vite/webpack output)
├── functions.php            # Asset enqueuing
├── package.json
└── vite.config.js           # or webpack.config.js
```

## Step 1: Import in JavaScript

In your theme's main JavaScript file (e.g., `assets/js/main.js`):

```javascript
// Import the module's CSS first
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// IMPORTANT: Prevent auto-initialization (required for HubSpot plugin's React rendering)
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Your other imports...

// Delay HubSpot module import until after plugin renders forms
// The 500ms delay ensures HubSpot's React components finish hydrating
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");

  // Manually trigger initialization
  if (module.init) {
    module.init();
  }
}, 500);
```

### Why the Delayed Import?

The HubSpot WordPress plugin renders forms using React. If this module manipulates the DOM before React finishes hydrating, you'll see **React Hydration Error #418**:

> "Hydration failed because the initial UI does not match what was rendered on the server."

The delayed import pattern ensures React completes before DOM enhancements begin.

## Step 2: Configure File Upload Validation (Optional)

Control which file types are allowed in HubSpot file upload fields.

### Method 1: JavaScript Configuration

In your theme's main JavaScript file (e.g., `assets/js/main.js`):

```javascript
// Import the module's CSS first
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Configure file upload validation BEFORE setting no-auto-init
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = 'pdf,doc,docx,jpg,jpeg,png,gif,txt';
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '5MB';

// IMPORTANT: Prevent auto-initialization (required for HubSpot plugin's React rendering)
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// Rest of your setup...
```

### Method 2: PHP Configuration (Recommended)

Add to your theme's `functions.php` for easier content editor control:

```php
<?php
/**
 * Configure HubSpot form validation and error messages
 */
function configure_hubspot_forms() {
    // Get settings from WordPress options, theme customizer, or ACF
    $allowed_extensions = get_theme_mod('hubspot_allowed_extensions', 'pdf,doc,docx,jpg,jpeg,png,gif,txt');
    $max_file_size = get_theme_mod('hubspot_max_file_size', '10MB');
    
    // Get current language for multi-language error messages
    $locale = get_locale();
    $lang = substr($locale, 0, 2);
    
    $error_messages = [];
    if ($lang === 'es') {
        $error_messages = [
            'required' => 'Este campo es obligatorio.',
            'email' => 'Por favor ingrese un email válido.',
            'pattern' => 'Por favor verifique el formato.',
            'characterLimit' => 'Máximo {limit} caracteres. Tiene {overBy} caracter{plural} de más.',
        ];
    } elseif ($lang === 'fr') {
        $error_messages = [
            'required' => 'Ce champ est obligatoire.',
            'email' => 'Veuillez saisir une adresse email valide.',
            'pattern' => 'Veuillez vérifier le format.',
            'characterLimit' => 'Maximum {limit} caractères. Vous avez {overBy} caractère{plural} en trop.',
        ];
    } else {
        $error_messages = [
            'required' => 'This field is required for submission.',
            'email' => 'Please enter a valid email address.',
            'pattern' => 'Please check the format of this field.',
            'characterLimit' => 'Maximum {limit} characters allowed. You have {overBy} character{plural} too many.',
            'date' => 'Please enter a valid date.',
            'phone' => 'Please enter a valid phone number.',
            'file' => 'This file type is not allowed.',
            'fileSize' => 'File size exceeds the {maxSize} limit.',
            'fileType' => 'Only these file types are allowed: {allowedTypes}',
            'url' => 'Please enter a valid web address.',
            'number' => 'Please enter a valid number.',
            'confirmation' => 'The confirmation does not match.',
            'captcha' => 'Please complete the verification.',
            'submission' => 'There was an error submitting the form. Please try again.',
            'network' => 'Connection error. Please check your internet connection.'
        ];
    }
    
    // Output JavaScript configuration
    ?>
    <script>
        window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = <?php echo json_encode($allowed_extensions); ?>;
        window.HUBSPOT_FORMS_MAX_FILE_SIZE = <?php echo json_encode($max_file_size); ?>;
        window.HUBSPOT_FORMS_ERROR_MESSAGES = <?php echo json_encode($error_messages); ?>;
    </script>
    <?php
}
add_action('wp_head', 'configure_hubspot_forms', 5); // Run early
```

### Method 3: Theme Customizer Integration

Add HubSpot form settings to the WordPress Customizer:

```php
<?php
/**
 * Add HubSpot form settings to theme customizer
 */
function hubspot_customizer_settings($wp_customize) {
    // Add HubSpot section
    $wp_customize->add_section('hubspot_forms', [
        'title' => 'HubSpot Forms',
        'description' => 'Configure validation and error messages for HubSpot forms.',
        'priority' => 120,
    ]);
    
    // Allowed file extensions
    $wp_customize->add_setting('hubspot_allowed_extensions', [
        'default' => 'pdf,doc,docx,jpg,jpeg,png,gif,txt',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('hubspot_allowed_extensions', [
        'label' => 'Allowed File Extensions',
        'description' => 'Comma-separated list (e.g., pdf,jpg,png)',
        'section' => 'hubspot_forms',
        'type' => 'text',
    ]);
    
    // Maximum file size
    $wp_customize->add_setting('hubspot_max_file_size', [
        'default' => '10MB',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('hubspot_max_file_size', [
        'label' => 'Maximum File Size',
        'description' => 'Use format like 5MB, 2GB, etc.',
        'section' => 'hubspot_forms',
        'type' => 'text',
    ]);
}
add_action('customize_register', 'hubspot_customizer_settings');
```

### File Upload Configuration Options

| Setting | Purpose | Format | Default |
|---------|---------|--------|---------|
| `HUBSPOT_FORMS_ALLOWED_EXTENSIONS` | File types to accept | String or Array | `'pdf,doc,docx,jpg,jpeg,png,gif,txt'` |
| `HUBSPOT_FORMS_MAX_FILE_SIZE` | Maximum file size | Human readable (e.g., `'5MB'`, `'2GB'`) | `'10MB'` |

## Step 3: Enqueue Assets in functions.php

The **CSS load order is critical** — your custom overrides must load _after_ the module's styles.

```php
<?php
/**
 * Enqueue theme assets with proper load order for HubSpot form enhancements
 */
function theme_enqueue_assets() {
    // Get the manifest for cache-busted filenames (Vite example)
    $manifest_path = get_template_directory() . '/dist/.vite/manifest.json';
    $manifest = file_exists($manifest_path)
        ? json_decode(file_get_contents($manifest_path), true)
        : [];

    // Main theme JS (includes HubSpot module via import)
    // The module's CSS is imported in JS, so it loads with the JS bundle
    if (isset($manifest['assets/js/main.js'])) {
        wp_enqueue_script(
            'theme-main',
            get_template_directory_uri() . '/dist/' . $manifest['assets/js/main.js']['file'],
            [], // No dependencies
            null,
            true // Load in footer
        );
    }

    // Main theme CSS
    // This loads AFTER the module's CSS (which is bundled in JS)
    // so your :root overrides will take precedence
    if (isset($manifest['assets/css/main.css'])) {
        wp_enqueue_style(
            'theme-main',
            get_template_directory_uri() . '/dist/' . $manifest['assets/css/main.css']['file'],
            [], // No dependencies
            null
        );
    }
}
add_action('wp_enqueue_scripts', 'theme_enqueue_assets');
```

### Alternative: Explicit CSS Dependency Order

If your build tool outputs the module CSS separately, ensure proper order:

```php
<?php
function theme_enqueue_assets() {
    // 1. Module styles load first
    wp_enqueue_style(
        'hubspot-enhancements',
        get_template_directory_uri() . '/dist/hubspot-enhancements.css',
        [],
        '1.0.0'
    );

    // 2. Theme styles load second (can override module)
    wp_enqueue_style(
        'theme-main',
        get_template_directory_uri() . '/dist/main.css',
        ['hubspot-enhancements'], // Depends on module styles
        '1.0.0'
    );

    // 3. Theme JS (with module initialization)
    wp_enqueue_script(
        'theme-main',
        get_template_directory_uri() . '/dist/main.js',
        [],
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'theme_enqueue_assets');
```

## Step 4: Configure Build Tool

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "assets/js/main.js"),
        style: path.resolve(__dirname, "assets/css/main.css"),
      },
    },
  },
});
```

### Webpack Configuration

```javascript
// webpack.config.js
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    main: "./assets/js/main.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
  ],
};
```

## Step 5: Add Custom Style Overrides

Create a CSS file for your HubSpot form customizations:

```css
/* assets/css/hubspot-forms.css */

/* Override base colors to match your theme */
:root {
  --color-hs-form-primary: #0073aa; /* WordPress blue */
  --color-hs-form-primary-lt: #e5f5fa;
  --color-hs-form-primary-dk: #005177;

  /* Error colors */
  --color-hs-form-error: #dc3232;
  --color-hs-form-error-lt: #fef2f2;

  /* Form field styling */
  --hs-form-field-border-radius: 4px;
  --hs-form-field-border-color: #8c8f94;
}
```

Import in your main CSS:

```css
/* assets/css/main.css */
@import "./hubspot-forms.css";

/* Rest of your theme styles... */
```

## Step 6: Place HubSpot Forms

Use the **manual embed code** from HubSpot (not the WordPress plugin).

### Option A: Block Editor (Gutenberg) — Easiest

The simplest approach for content editors:

1. In HubSpot, go to **Marketing → Forms**
2. Select your form → **Actions → Share**
3. Click **Embed code** tab
4. Click **Developer Embed Code** (this generates inline code, not an iframe)
5. Copy the entire script

In WordPress:

1. Edit your page/post in the block editor
2. Add a **Custom HTML** block (search for "HTML" in the block inserter)
3. Paste the Developer Embed Code directly

The code will look something like:

```html
<script
  charset="utf-8"
  type="text/javascript"
  src="//js.hsforms.net/forms/embed/v2.js"
></script>
<script>
  hbspt.forms.create({
    region: "na1",
    portalId: "XXXXXXX",
    formId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  });
</script>
```

> 💡 **Tip**: For dark backgrounds, wrap in a Group block with your dark background class, then add the Custom HTML block inside with the form code wrapped in `<div class="hs-form-reverse">...</div>`.

### Option B: PHP Templates

For theme developers who need forms in template files:

```php
<!-- In a template file (e.g., template-parts/hubspot-form.php) -->
<div class="hubspot-form-wrapper">
    <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
    <script>
        hbspt.forms.create({
            region: "na1",
            portalId: "XXXXXXX",
            formId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        });
    </script>
</div>
```

### Option C: Custom Shortcode

Add to `functions.php` for editor-friendly form placement:

```php
<?php
/**
 * HubSpot Form Shortcode
 * Usage: [hubspot_form portal="XXXXXXX" form="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]
 */
function hubspot_form_shortcode($atts) {
    $atts = shortcode_atts([
        'portal' => '',
        'form' => '',
        'region' => 'na1',
    ], $atts);

    if (empty($atts['portal']) || empty($atts['form'])) {
        return '<!-- HubSpot form: missing portal or form ID -->';
    }

    ob_start();
    ?>
    <div class="hubspot-form-wrapper">
        <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
        <script>
            hbspt.forms.create({
                region: "<?php echo esc_js($atts['region']); ?>",
                portalId: "<?php echo esc_js($atts['portal']); ?>",
                formId: "<?php echo esc_js($atts['form']); ?>"
            });
        </script>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('hubspot_form', 'hubspot_form_shortcode');
```

Then use in the editor or templates:

```
[hubspot_form portal="XXXXXXX" form="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]
```

### Dark Background Forms

For forms on dark backgrounds, wrap with `.hs-form-reverse`:

```php
<div class="hs-form-reverse bg-dark p-4">
    [hubspot_form portal="XXXXXXX" form="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]
</div>
```

## Customizing Styles

### Option 1: Override CSS Variables

The simplest approach—override in your theme's CSS:

```css
:root {
  --color-hs-form-primary: #your-brand-color;
  --color-hs-form-primary-lt: #your-light-variant;
  --color-hs-form-primary-dk: #your-dark-variant;
}
```

### Option 2: Use the Theme Template

Copy the included theme template:

```bash
cp node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/theme-template.css assets/css/hubspot-theme.css
```

Import it after the module styles in your JS:

```javascript
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
import "../css/hubspot-theme.css";
```

## Troubleshooting

### React Hydration Error #418

**Cause**: Module initializes before HubSpot's JavaScript finishes rendering the form.

**Fix**: Ensure `window.HUBSPOT_FORMS_NO_AUTO_INIT = true` is set before importing the module, and use the delayed import pattern.

### Styles Not Applying / Being Overridden

**Cause**: CSS load order issue—module styles loading after your overrides.

**Fix**:

1. Check `wp_enqueue_style` dependencies
2. Ensure module CSS imports first in your JS
3. Use browser DevTools to verify load order

### Forms Not Enhanced

**Cause**: Module can't detect HubSpot forms, or forms load after module initializes.

**Fix**:

1. Verify forms are rendering with `.hsfc-Form` class (inspect the DOM)
2. The module uses MutationObserver to detect dynamically loaded forms
3. Check browser console for errors

### Using the HubSpot WordPress Plugin?

The official HubSpot WordPress plugin embeds forms in **iframes**, which this module cannot enhance due to browser cross-origin restrictions.

**Solution**: Use manual embed code instead of the plugin. See [Step 5: Place HubSpot Forms](#step-5-place-hubspot-forms) for instructions.

**How to check if you're affected**:

1. Right-click your form → Inspect
2. If you see `<iframe src="https://forms.hubspot.com/...">` wrapping the form content, you're using iframes
3. Switch to manual embed code for this module to work

## Complete Example

**`assets/js/main.js`**:

```javascript
// 1. Import module CSS
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// 2. Prevent auto-init
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

// 3. Your other theme code...
import "./components/navigation.js";
import "./components/sliders.js";

// 4. Delayed HubSpot initialization
setTimeout(async () => {
  const module =
    await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
  if (module.init) {
    module.init();
  }
}, 500);
```

**`assets/css/main.css`**:

```css
/* Theme styles */
@import "./base.css";
@import "./components.css";

/* HubSpot form overrides (loads after module CSS via JS import order) */
:root {
  --color-hs-form-primary: #0073aa;
  --color-hs-form-primary-lt: #e5f5fa;
  --color-hs-form-primary-dk: #005177;
}
```

**`functions.php`**:

```php
<?php
function theme_enqueue_assets() {
    wp_enqueue_script(
        'theme-main',
        get_template_directory_uri() . '/dist/main.js',
        [],
        filemtime(get_template_directory() . '/dist/main.js'),
        true
    );

    wp_enqueue_style(
        'theme-main',
        get_template_directory_uri() . '/dist/main.css',
        [],
        filemtime(get_template_directory() . '/dist/main.css')
    );
}
add_action('wp_enqueue_scripts', 'theme_enqueue_assets');
```

---

For the complete CSS variable reference, see the main [README](../README.md#css-cascade-reference).
