# Implementing HubSpot Form Enhancements in Nuxt + Storyblok

This guide covers integrating `@fahlgren-mortine/hubspot-form-usability-enhancements` into a Nuxt application using Storyblok as the headless CMS.

## Prerequisites

- Nuxt 3 or 4 application
- [@storyblok/nuxt](https://github.com/storyblok/storyblok-nuxt) module configured
- HubSpot account with forms
- Node.js 20+

## Installation

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## Architecture Overview

This integration uses:

1. **Storyblok** — Content editors add HubSpot forms via a custom Storyblok component (just enter the form ID)
2. **HubSpot Developer Script** — Loads forms inline (not iframed) for full customization
3. **Vue component** — Handles script loading, hydration safety, and module initialization
4. **CSS variables** — Theme forms to match your brand via scoped styles

## Step 1: Import Styles Globally

In your default layout (e.g., `app/layouts/default.vue`):

```vue
<script setup lang="ts">
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// ... rest of your layout script
</script>

<template>
  <Navigation />
  <slot />
  <Footer />
</template>
```

This ensures the module's CSS is loaded once, globally, before any forms render.

## Step 2: Store HubSpot Config in Storyblok

Add these fields to your Storyblok **site globals** (or a settings content type):

| Field               | Type | Purpose                     |
| ------------------- | ---- | --------------------------- |
| `hubspot_portal_id` | Text | Your HubSpot portal ID      |
| `hubspot_region`    | Text | Region (e.g., `na1`, `eu1`) |

This allows content editors to configure HubSpot credentials without code changes.

## Step 3: Create the HubSpot Form Storyblok Component

### 3a. Create the Storyblok Schema

In Storyblok, create a new component called `hubspot_form` with:

| Field     | Type | Purpose               |
| --------- | ---- | --------------------- |
| `form_id` | Text | The HubSpot form GUID |

### 3b. Create the Vue Component

Create `app/components/storyblok/HubspotForm.vue`:

```vue
<script lang="ts" setup>
import { computed, nextTick, onMounted, watch } from "vue";

// Define your blok type (adjust based on your types)
interface HubspotBlok {
  form_id: string;
  _uid: string;
}

const props = defineProps<{ blok: HubspotBlok }>();

// Generate unique container ID for each form instance
const formContainerId = `hs-form-${props.blok._uid}`;

// Get HubSpot config from your site globals composable
// Adjust this to match your globals fetching pattern
const siteGlobals = await useAsyncData("globals", () => {
  // Your method to fetch Storyblok globals
  return fetchStoryblokGlobals();
});

const hubspotPortalId = computed(
  () => siteGlobals.data.value?.hubspot_portal_id,
);
const hubspotRegion = computed(
  () => siteGlobals.data.value?.hubspot_region || "na1",
);

const canRenderForm = computed(
  () => Boolean(hubspotPortalId.value) && Boolean(props.blok.form_id),
);

// Build the Developer Script URL
const getDeveloperScriptSrc = () =>
  `https://js.hsforms.net/forms/embed/developer/${hubspotPortalId.value}.js`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Load the HubSpot Developer Script
 * This script renders forms inline (not iframed) which allows full CSS/JS access
 */
const loadDeveloperScript = async ({
  forceReload = false,
}: {
  forceReload?: boolean;
}) => {
  if (typeof window === "undefined") return null;

  // CRITICAL: Prevent auto-init to avoid React hydration conflicts
  const win = window as Window & { HUBSPOT_FORMS_NO_AUTO_INIT?: boolean };
  win.HUBSPOT_FORMS_NO_AUTO_INIT = true;

  const baseSrc = getDeveloperScriptSrc();
  const existingScript = document.querySelector(
    `script[data-hubspot-developer="true"][data-hubspot-base-src="${baseSrc}"]`,
  ) as HTMLScriptElement | null;

  // Reuse existing script if already loaded
  if (existingScript && !forceReload) {
    if (existingScript.dataset.loaded === "true") return true;

    await new Promise<void>((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load HubSpot script")),
        { once: true },
      );
    });
    return true;
  }

  // Remove existing script if force reloading
  if (existingScript && forceReload) {
    existingScript.remove();
  }

  // Add cache-buster for force reload
  const src = forceReload
    ? `${baseSrc}${baseSrc.includes("?") ? "&" : "?"}t=${Date.now()}`
    : baseSrc;

  // Create and load the script
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  script.dataset.hubspotDeveloper = "true";
  script.dataset.hubspotBaseSrc = baseSrc;

  await new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () =>
      reject(new Error("Failed to load HubSpot script")),
    );
    document.body.appendChild(script);
  });

  return true;
};

/**
 * Check if the form has already rendered in the container
 */
const hasRenderedForm = () => {
  if (typeof window === "undefined") return false;
  const container = document.getElementById(formContainerId);
  if (!container) return false;
  return Boolean(container.querySelector(".hsfc-Form, form, .hs-form"));
};

/**
 * Main setup function - loads script, waits for form, initializes enhancements
 */
const setupHubspotForms = async () => {
  if (typeof window === "undefined" || !canRenderForm.value) return;

  await nextTick();

  const container = document.getElementById(formContainerId);
  if (!container) return;

  // Clear container if form ID changed (e.g., in Storyblok editor)
  const renderedFormId = container.getAttribute("data-rendered-form-id");
  if (renderedFormId !== props.blok.form_id) {
    container.innerHTML = "";
    container.setAttribute("data-rendered-form-id", props.blok.form_id);
  }

  try {
    // Load HubSpot Developer Script
    await loadDeveloperScript({ forceReload: false });
    await wait(250);

    // Retry with force reload if form didn't render
    if (!hasRenderedForm()) {
      await loadDeveloperScript({ forceReload: true });
      await wait(350);
    }

    // Initialize the enhancements module
    const { HubSpotFormManager } =
      await import("@fahlgren-mortine/hubspot-form-usability-enhancements");
    HubSpotFormManager.setupAllForms();
  } catch (error) {
    console.error("Failed to initialize HubSpot forms:", error);
  }
};

onMounted(() => {
  void setupHubspotForms();
});

// Re-initialize when form ID changes (live editing in Storyblok)
watch([canRenderForm, () => props.blok.form_id], ([value]) => {
  if (!value) return;
  void setupHubspotForms();
});
</script>

<template>
  <div v-if="canRenderForm" class="hubspot-embed" v-editable="blok">
    <div
      :id="formContainerId"
      :data-form-id="blok.form_id"
      :data-portal-id="hubspotPortalId"
      :data-region="hubspotRegion"
      class="hs-form-container"
    ></div>
  </div>
</template>

<style scoped>
/* Theme overrides - customize to match your brand */
.hubspot-embed {
  --color-hs-form-primary: var(--color-brand-primary);
  --color-hs-form-primary-lt: var(--color-brand-light);
  --color-hs-form-primary-dk: var(--color-brand-dark);
}
</style>
```

### Key Implementation Details

| Feature                  | Implementation                                                         |
| ------------------------ | ---------------------------------------------------------------------- |
| **Hydration safety**     | Sets `HUBSPOT_FORMS_NO_AUTO_INIT = true` before loading script         |
| **Script deduplication** | Tracks loaded scripts via `data-hubspot-developer` attribute           |
| **Form ID changes**      | Watches `blok.form_id` and re-initializes (for Storyblok live editing) |
| **Scoped theming**       | CSS variables in component's `<style>` block                           |
| **Error handling**       | Try/catch with console logging                                         |

## Step 4: Register the Component

The `@storyblok/nuxt` module auto-registers components in `app/components/storyblok/`. Just ensure your file is named to match the Storyblok component:

- Storyblok component: `hubspot_form`
- Vue file: `HubspotForm.vue` (PascalCase) or `hubspot_form.vue` (snake_case)

## Step 5: Add Forms in Storyblok

Content editors can now:

1. Edit any page in Storyblok
2. Add the **HubSpot Form** component
3. Enter the Form ID (found in HubSpot under Marketing → Forms → Form details)
4. Publish

The form will render inline with full styling and validation enhancements.

## Customizing Styles

### Option 1: Component-Scoped Variables

Override CSS variables in the component's `<style>` block:

```vue
<style scoped>
.hubspot-embed {
  --color-hs-form-primary: #7c3aed;
  --color-hs-form-btn-primary-bg: #7c3aed;
  --color-hs-form-btn-primary-hover-bg: #6d28d9;
}
</style>
```

### Option 2: Global Theme Variables

Add to your `main.css` or a dedicated HubSpot CSS file:

```css
body {
  --color-hs-form-primary: var(--color-brand-primary);
  --color-hs-form-error: var(--color-status-error);
  --font-hs-form-base: var(--font-sans);
}
```

### Option 3: Use the Theme Template

Copy and customize the included template:

```bash
cp node_modules/@fahlgren-mortine/hubspot-form-usability-enhancements/theme-template.css app/assets/css/hubspot-theme.css
```

Import in your layout after the module styles:

```vue
<script setup>
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";
import "~/assets/css/hubspot-theme.css";
</script>
```

## Dark Background Forms

For forms on dark backgrounds, add `.hs-form-reverse` to a parent container:

```vue
<template>
  <div class="bg-slate-900 p-8">
    <div class="hs-form-reverse">
      <StoryblokComponent :blok="formBlok" />
    </div>
  </div>
</template>
```

Or conditionally in your HubSpot component based on a Storyblok field:

```vue
<template>
  <div
    v-if="canRenderForm"
    class="hubspot-embed"
    :class="{ 'hs-form-reverse': blok.dark_background }"
  >
    <!-- form container -->
  </div>
</template>
```

## Troubleshooting

### Forms Not Rendering

**Cause**: HubSpot Developer Script not loading or portal ID missing.

**Fix**:

1. Check browser console for script errors
2. Verify `hubspot_portal_id` is set in Storyblok globals
3. Check that the form ID is correct (GUID format)

### React Hydration Error #418

**Cause**: Module manipulating DOM before Vue/Nuxt hydration completes.

**Fix**: Ensure `HUBSPOT_FORMS_NO_AUTO_INIT = true` is set before loading the HubSpot script. The component above handles this automatically.

### Styles Not Applying

**Cause**: CSS load order issue.

**Fix**:

1. Verify module styles are imported in the layout
2. Check that your overrides use the correct CSS variable names
3. Use browser DevTools to verify CSS cascade

### Forms Render as Iframes

**Cause**: Using standard embed code instead of Developer Script.

**Fix**: Ensure you're loading from `js.hsforms.net/forms/embed/developer/{portalId}.js` — the `/developer/` path is critical for inline rendering.

### Storyblok Live Preview Not Updating

**Cause**: Form not re-initializing when blok changes.

**Fix**: The `watch` in the component should handle this. Verify the watcher is running by adding console logs.

## Complete File Structure

```
app/
├── assets/
│   └── css/
│       └── main.css              # Global styles (optional hubspot overrides)
├── components/
│   └── storyblok/
│       └── HubspotForm.vue       # The HubSpot form component
├── layouts/
│   └── default.vue               # Imports module CSS globally
└── composables/
    └── getGlobals.ts             # Your Storyblok globals fetcher
```

---

For the complete CSS variable reference, see the main [README](../README.md#css-cascade-reference).
