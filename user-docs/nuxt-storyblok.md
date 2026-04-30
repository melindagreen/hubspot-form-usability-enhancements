# Nuxt + Storyblok Integration

Add HubSpot form enhancements to Nuxt applications using Storyblok CMS.

## Requirements

- Nuxt 3/4
- @storyblok/nuxt module
- Node.js 20+

## Installation

```bash
npm install @fahlgren-mortine/hubspot-form-usability-enhancements
```

## Implementation

### app/layouts/default.vue

```vue
<script setup lang="ts">
import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';

if (typeof window !== 'undefined') {
  window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'jpg'];
  window.HUBSPOT_FORMS_MAX_FILE_SIZE = '10MB';
}
</script>

<template>
  <Navigation />
  <slot />
  <Footer />
</template>
```

### Storyblok Configuration

Add to site globals:

| Field | Type | Value |
|-------|------|-------|
| hubspot_portal_id | Text | Your portal ID |
| hubspot_region | Text | na1/eu1 |
| hubspot_allowed_file_types | Text | pdf,doc,jpg |
| hubspot_max_file_size | Text | 10MB |

```vue
<script lang="ts" setup>
// ... existing imports and props ...

// Get HubSpot config from your site globals composable
const siteGlobals = await useAsyncData("globals", () => {
  return fetchStoryblokGlobals();
});

const hubspotPortalId = computed(
  () => siteGlobals.data.value?.hubspot_portal_id,
);
const hubspotRegion = computed(
  () => siteGlobals.data.value?.hubspot_region || "na1",
);

// File upload configuration
const allowedFileTypes = computed(
  () => siteGlobals.data.value?.hubspot_allowed_file_types || 'pdf,doc,docx,jpg,jpeg,png,gif,txt',
);
const maxFileSize = computed(
  () => siteGlobals.data.value?.hubspot_max_file_size || '10MB',
);

// Error message configuration
const errorMessages = computed(() => {
  const locale = siteGlobals.data.value?.locale || 'en';
  
  // Support multi-language error messages from Storyblok
  if (locale === 'es') {
    return {
      required: "Este campo es obligatorio.",
      email: "Por favor ingrese un email válido.",
      pattern: "Por favor verifique el formato.",
      characterLimit: "Máximo {limit} caracteres. Tiene {overBy} caracter{plural} de más.",
    };
  } else if (locale === 'fr') {
    return {
      required: "Ce champ est obligatoire.",
      email: "Veuillez saisir une adresse email valide.",
      pattern: "Veuillez vérifier le format.",
      characterLimit: "Maximum {limit} caractères. Vous avez {overBy} caractère{plural} en trop.",
    };
  } else {
    return {
      required: "This field is required for submission.",
      email: "Please enter a valid email address.",
      pattern: "Please check the format of this field.",
      characterLimit: "Maximum {limit} characters allowed. You have {overBy} character{plural} too many.",
      date: "Please enter a valid date.",
      phone: "Please enter a valid phone number.",

### HubspotForm.vue Component

Create `app/components/storyblok/HubspotForm.vue`:

```vue
<script lang="ts" setup>
import { computed, nextTick, onMounted, watch } from 'vue';

interface HubspotBlok {
  form_id: string;
  _uid: string;
}

const props = defineProps<{ blok: HubspotBlok }>();
const formContainerId = `hs-form-${props.blok._uid}`;

// Fetch globals (adjust to your pattern)
const siteGlobals = await useAsyncData('globals', () => fetchStoryblokGlobals());

const hubspotPortalId = computed(() => siteGlobals.data.value?.hubspot_portal_id);
const hubspotRegion = computed(() => siteGlobals.data.value?.hubspot_region || 'na1');
const canRenderForm = computed(() => Boolean(hubspotPortalId.value && props.blok.form_id));

const getDeveloperScriptSrc = () => 
  `https://js.hsforms.net/forms/embed/developer/${hubspotPortalId.value}.js`;

const loadDeveloperScript = async ({ forceReload = false }) => {
  if (typeof window === 'undefined') return null;
  
  const win = window as Window & { HUBSPOT_FORMS_NO_AUTO_INIT?: boolean };
  win.HUBSPOT_FORMS_NO_AUTO_INIT = true;
  
  const baseSrc = getDeveloperScriptSrc();
  const existingScript = document.querySelector(
    `script[data-hubspot-developer="true"][data-hubspot-base-src="${baseSrc}"]`
  ) as HTMLScriptElement | null;
  
  if (existingScript && !forceReload) {
    if (existingScript.dataset.loaded === 'true') return true;
    await new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Script load failed')), { once: true });
    });
    return true;
  }
  
  if (existingScript && forceReload) existingScript.remove();
  
  const src = forceReload ? `${baseSrc}?t=${Date.now()}` : baseSrc;
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  script.dataset.hubspotDeveloper = 'true';
  script.dataset.hubspotBaseSrc = baseSrc;
  
  await new Promise<void>((resolve, reject) => {
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error('Script load failed')));
    document.body.appendChild(script);
  });
  
  return true;
};

const hasRenderedForm = () => {
  if (typeof window === 'undefined') return false;
  const container = document.getElementById(formContainerId);
  return Boolean(container?.querySelector('.hsfc-Form, form, .hs-form'));
};

const setupHubspotForms = async () => {
  if (typeof window === 'undefined' || !canRenderForm.value) return;
  
  await nextTick();
  
  const container = document.getElementById(formContainerId);
  if (!container) return;
  
  const renderedFormId = container.getAttribute('data-rendered-form-id');
  if (renderedFormId !== props.blok.form_id) {
    container.innerHTML = '';
    container.setAttribute('data-rendered-form-id', props.blok.form_id);
  }
  
  try {
    await loadDeveloperScript({ forceReload: false });
    await new Promise(resolve => setTimeout(resolve, 250));
    
    if (!hasRenderedForm()) {
      await loadDeveloperScript({ forceReload: true });
      await new Promise(resolve => setTimeout(resolve, 350));
    }
    
    const { HubSpotFormManager } = 
      await import('@fahlgren-mortine/hubspot-form-usability-enhancements');
    HubSpotFormManager.setupAllForms();
  } catch (error) {
    console.error('HubSpot form init failed:', error);
  }
};

onMounted(() => void setupHubspotForms());
watch([canRenderForm, () => props.blok.form_id], ([value]) => {
  if (value) void setupHubspotForms();
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
.hubspot-embed {
  --color-hs-form-primary: var(--color-brand-primary);
}
</style>
```

### Storyblok Schema

Create component `hubspot_form` with field:

| Field | Type | Purpose |
|-------|------|-------|
| form_id | Text | HubSpot form GUID |

### Registration

Component auto-registers via `@storyblok/nuxt`. File must be:
- `HubspotForm.vue` (PascalCase), or
- `hubspot_form.vue` (snake_case)

## Dark Backgrounds

```vue
<template>
  <div class="hs-form-reverse bg-slate-900">
    <StoryblokComponent :blok="formBlok" />
  </div>
</template>
```

## Troubleshooting

**Forms not rendering:** Check portal ID in globals, verify form ID format (GUID).

**React Hydration Error #418:** Component sets `HUBSPOT_FORMS_NO_AUTO_INIT = true` automatically.

**Styles not applying:** Verify module styles imported in layout first.

**Forms render as iframes:** Must use Developer Script URL (`.../forms/embed/developer/{portalId}.js`).
