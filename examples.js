/**
 * Example usage of @fmd/hubspot-forms module
 * This file demonstrates various ways to integrate the module
 */

// ========================================
// 1. SIMPLE AUTO-INITIALIZATION
// ========================================

// Just import the module and styles - forms will work automatically
import '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

// ========================================
// 2. REACT COMPONENT USAGE
// ========================================

import { useEffect, useState } from 'react';
import hubspotForms from '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

function HubSpotFormComponent() {
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    // Initialize forms after component mounts
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
      maxFileSize: 5 * 1024 * 1024 // 5MB
    });

    // Set up listener for when HubSpot form loads
    const checkForForm = setInterval(() => {
      const form = document.querySelector('.hsfc-Form');
      if (form) {
        setFormLoaded(true);
        clearInterval(checkForForm);
      }
    }, 100);

    return () => clearInterval(checkForForm);
  }, []);

  return (
    <div className="hubspot-form-container">
      <h2>Contact Us</h2>
      {!formLoaded && <div>Loading form...</div>}
      {/* HubSpot embed script will inject form here */}
      <script
        type="text/javascript"
        id="hs-script-loader"
        async
        defer
        src="//js.hs-scripts.com/YOUR_PORTAL_ID.js"
      />
    </div>
  );
}

// ========================================
// 3. NEXT.JS USAGE
// ========================================

// pages/_app.js or app/layout.js
import { useEffect } from 'react';
import '@fmd/hubspot-forms/styles';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Client-side only initialization
    if (typeof window !== 'undefined') {
      import('@fmd/hubspot-forms').then(({ default: hubspotForms }) => {
        hubspotForms({
          characterLimit: 750,
          allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
          maxFileSize: 10 * 1024 * 1024 // 10MB
        });
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

// ========================================
// 4. CUSTOM CONFIGURATION
// ========================================

import hubspotForms, { 
  HubSpotFormManager, 
  CharacterLimitValidator 
} from '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

// Custom initialization with specific settings
hubspotForms({
  characterLimit: 2000,
  allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  maxFileSize: 25 * 1024 * 1024 // 25MB
});

// Manual form management
const initializeSpecificForm = (formSelector) => {
  const formElement = document.querySelector(formSelector);
  if (formElement) {
    HubSpotFormManager.setupSingleForm(formElement);
  }
};

// ========================================
// 5. PREVENTING AUTO-INITIALIZATION
// ========================================

// Set flag before importing
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

import '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

// Manual initialization with custom timing
const initializeWhenReady = () => {
  // Wait for specific conditions
  if (document.querySelector('#my-form-container')) {
    import('@fmd/hubspot-forms').then(({ HubSpotFormManager }) => {
      HubSpotFormManager.setupAllForms();
    });
  } else {
    setTimeout(initializeWhenReady, 100);
  }
};

initializeWhenReady();

// ========================================
// 6. TYPESCRIPT USAGE
// ========================================

import hubspotForms, { 
  HubSpotFormManager,
  ValidationResult 
} from '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

const config = {
  characterLimit: 1500,
  allowedExtensions: ['pdf', 'docx', 'xlsx'],
  maxFileSize: 15 * 1024 * 1024 // 15MB
};

const instance = hubspotForms(config);

// Form management
const setupFormWithTypes = (formContainer) => {
  HubSpotFormManager.setupSingleForm(formContainer);
};

// ========================================
// 7. ENVIRONMENT VARIABLE CONFIGURATION
// ========================================

// In your .env file:
// VITE_UPLOAD_ALLOWED_EXTENSIONS=pdf,doc,docx,jpg,jpeg,png,gif
// VITE_UPLOAD_MAX_SIZE=10MB

// The module will automatically use these environment variables
import '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

// ========================================
// 8. DYNAMIC FORM LOADING
// ========================================

import { HubSpotFormManager } from '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

const loadHubSpotForm = async (portalId, formId, targetSelector) => {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  // Load HubSpot form dynamically
  window.hbspt?.forms?.create({
    portalId: portalId,
    formId: formId,
    target: targetSelector,
    onFormReady: () => {
      // Initialize enhancements after form loads
      const formElement = target.querySelector('.hsfc-Form');
      if (formElement) {
        HubSpotFormManager.setupSingleForm(formElement);
      }
    }
  });
};

// Usage
loadHubSpotForm('YOUR_PORTAL_ID', 'YOUR_FORM_ID', '#hubspot-form-1');

// ========================================
// 9. CUSTOM STYLING INTEGRATION
// ========================================

// Import without default styles
import '@fmd/hubspot-forms';
// Don't import '@fmd/hubspot-forms/styles';

// Use your own CSS with Tailwind classes
import './custom-hubspot-styles.css';

// Or add custom CSS-in-JS
const customStyles = `
  div[data-hsfc-id=Renderer] form {
    @apply max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg;
  }
  
  div[data-hsfc-id=Renderer] form .hsfc-Row input {
    @apply focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = customStyles;
document.head.appendChild(styleSheet);

// ========================================
// 10. ERROR HANDLING AND DEBUGGING
// ========================================

import hubspotForms, { HubSpotFormManager } from '@fmd/hubspot-forms';
import '@fmd/hubspot-forms/styles';

// Debug mode
const debugConfig = {
  characterLimit: 500,
  allowedExtensions: ['pdf', 'jpg'],
  maxFileSize: 5 * 1024 * 1024
};

try {
  const instance = hubspotForms(debugConfig);
  console.log('HubSpot forms initialized:', instance);
} catch (error) {
  console.error('Failed to initialize HubSpot forms:', error);
  
  // Fallback initialization
  setTimeout(() => {
    HubSpotFormManager.setupAllForms();
  }, 1000);
}

// Monitor for form loading issues
const formLoadTimeout = setTimeout(() => {
  const forms = document.querySelectorAll('.hsfc-Form');
  if (forms.length === 0) {
    console.warn('No HubSpot forms found after 10 seconds');
  }
}, 10000);

// Clear timeout when forms are found
const observer = new MutationObserver(() => {
  const forms = document.querySelectorAll('.hsfc-Form');
  if (forms.length > 0) {
    clearTimeout(formLoadTimeout);
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

export {
  HubSpotFormComponent,
  initializeSpecificForm,
  loadHubSpotForm
};