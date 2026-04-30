# WordPress Integration

Add HubSpot form enhancements to WordPress themes with Vite/webpack.

> **HubSpot WordPress Plugin Not Supported:** The official plugin uses iframes. This module requires inline embed code (non-iframe).

## Requirements

- WordPress custom theme with build tools (Vite/webpack)
- Node.js 20+
- Manual HubSpot embed code (not plugin)

## Installation

```bash
cd wp-content/themes/your-theme
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## Implementation

### assets/js/main.js

```javascript
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

window.HUBSPOT_FORMS_NO_AUTO_INIT = true;
window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'jpg'];
window.HUBSPOT_FORMS_MAX_FILE_SIZE = '5MB';

setTimeout(async () => {
  const module = await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
  module.init();
}, 500);
```

### functions.php (optional)

```php
add_action('wp_head', function() {
  $extensions = apply_filters('hubspot_forms_allowed_extensions', ['pdf', 'doc', 'jpg']);
  $maxSize = apply_filters('hubspot_forms_max_file_size', '10MB');
  
  echo '<script>';
  echo 'window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ' . json_encode($extensions) . ';';
  echo 'window.HUBSPOT_FORMS_MAX_FILE_SIZE = "' . esc_js($maxSize) . '";';
  echo '</script>';
});
```

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

### Enqueue Assets (functions.php)

```php
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

## Build Configuration

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'assets/js/main.js')
      }
    }
  }
});
```

### Webpack

```javascript
// webpack.config.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './assets/js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

## Embed Forms

### Block Editor (Gutenberg)

1. Get Developer Embed Code from HubSpot (not iframe)
2. Add Custom HTML block
3. Paste code

### Shortcode

```php
function hubspot_form_shortcode($atts) {
  $atts = shortcode_atts([
    'portal' => '',
    'form' => '',
    'region' => 'na1'
  ], $atts);
  
  if (empty($atts['portal']) || empty($atts['form'])) {
    return '';
  }
  
  ob_start();
  ?>
  <script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
  <script>
    hbspt.forms.create({
      region: "<?php echo esc_js($atts['region']); ?>",
      portalId: "<?php echo esc_js($atts['portal']); ?>",
      formId: "<?php echo esc_js($atts['form']); ?>"
    });
  </script>
  <?php
  return ob_get_clean();
}
add_shortcode('hubspot_form', 'hubspot_form_shortcode');
```

Usage: `[hubspot_form portal="XXXXXXX" form="xxx-xxx"]`

## Dark Backgrounds

```php
<div class="hs-form-reverse bg-dark">
  [hubspot_form portal="XXXXXXX" form="xxx-xxx"]
</div>
```

## Troubleshooting

**React Hydration Error #418:** Set `window.HUBSPOT_FORMS_NO_AUTO_INIT = true`, use 500ms delay.

**Styles not applying:** Check CSS load order in `functions.php`. Module styles must load first.

**Forms not enhanced:** Verify `.hsfc-Form` class. Use Developer Embed Code (not iframe/plugin).

**Plugin iframe issue:** Official WordPress plugin uses iframes (cannot enhance). Use manual embed code instead.
