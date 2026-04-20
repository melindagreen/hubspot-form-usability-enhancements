/**
 * Example usage of @fahlgren-mortine/hubspot-form-usability-enhancements module
 * This file demonstrates various ways to integrate the module
 */

// ========================================
// 1. SIMPLE AUTO-INITIALIZATION
// ========================================

// Just import the module and styles - forms will work automatically
import "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// ========================================
// 2. REACT COMPONENT USAGE
// ========================================

import { useEffect, useState } from "react";
import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

function HubSpotFormComponent() {
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    // Initialize forms after component mounts
    hubspotForms({
      characterLimit: 1000,
      allowedExtensions: ["pdf", "docx", "jpg", "png"],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      errorMessages: {
        required: "This field is required.",
        email: "Please enter a valid email address.",
        pattern: "Please enter a valid format.",
      },
    });

    // Set up listener for when HubSpot form loads
    const checkForForm = setInterval(() => {
      const form = document.querySelector(".hsfc-Form");
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
import { useEffect } from "react";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Client-side only initialization
    if (typeof window !== "undefined") {
      import("@fahlgren-mortine/hubspot-form-usability-enhancements").then(
        ({ default: hubspotForms }) => {
          hubspotForms({
            characterLimit: 750,
            allowedExtensions: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
            maxFileSize: 10 * 1024 * 1024, // 10MB
          });
        },
      );
    }
  }, []);

  return <Component {...pageProps} />;
}

// ========================================
// 4. CUSTOM CONFIGURATION
// ========================================

import hubspotForms, {
  HubSpotFormManager,
  CharacterLimitValidator,
} from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Custom initialization with specific settings
hubspotForms({
  characterLimit: 2000,
  allowedExtensions: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  maxFileSize: 25 * 1024 * 1024, // 25MB
});

// Manual form management
const initializeSpecificForm = (formSelector) => {
  const formElement = document.querySelector(formSelector);
  if (formElement) {
    HubSpotFormManager.setupSingleForm(formElement);
  }
};

// ========================================
// 5. CUSTOM ERROR MESSAGES
// ========================================

import hubspotForms, {
  ErrorMessageConfig,
} from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Method 1: Configuration via init options
hubspotForms({
  characterLimit: 500,
  errorMessages: {
    required: "This field is mandatory.",
    email: "Please enter a valid email address.",
    pattern: "The format is incorrect.",
    characterLimit: "Maximum {limit} characters allowed. You have {overBy} character{plural} too many.",
    date: "Please provide a valid date.",
    phone: "Please enter a valid phone number.",
    file: "File type not supported.",
    fileSize: "File exceeds maximum size of {maxSize}.",
    fileType: "Only these file types are allowed: {allowedTypes}",
    url: "Please enter a valid web address.",
    number: "Please enter a valid number.",
    confirmation: "The confirmation does not match.",
    captcha: "Please complete the security verification.",
    submission: "Form submission failed. Please try again.",
    network: "Network error. Please check your connection.",
  },
});

// Method 2: Direct property assignment
ErrorMessageConfig.messages = {
  required: "Este campo es obligatorio.",
  email: "debe tener el formato correcto",
  pattern: "el formato es incorrecto",
};

// Method 3: Window globals (set before importing)
window.HUBSPOT_FORMS_ERROR_MESSAGES = {
  required: "このフィールドは必須です。",
  email: "正しい形式で入力してください",
  pattern: "形式が正しくありません",
};

// Method 4: Partial customization (other messages use defaults)
hubspotForms({
  errorMessages: {
    required: "Required field missing!", // Custom
    // email and pattern will use built-in defaults
  },
});

// Method 5: Dynamic message updates
const updateMessagesForLocale = (locale) => {
  const messages = {
    en: {
      required: "Please complete this required field.",
      email: "must be formatted correctly",
      pattern: "must be formatted correctly",
    },
    es: {
      required: "Por favor complete este campo obligatorio.",
      email: "debe tener el formato correcto",
      pattern: "debe tener el formato correcto", 
    },
    fr: {
      required: "Veuillez remplir ce champ obligatoire.",
      email: "doit être formaté correctement",
      pattern: "doit être formaté correctement",
    },
  };
  
  ErrorMessageConfig.messages = messages[locale] || messages.en;
};

// Usage: updateMessagesForLocale('es');

// ========================================
// 6. PREVENTING AUTO-INITIALIZATION
// ========================================

// Set flag before importing
window.HUBSPOT_FORMS_NO_AUTO_INIT = true;

import "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Manual initialization with custom timing
const initializeWhenReady = () => {
  // Wait for specific conditions
  if (document.querySelector("#my-form-container")) {
    import("@fahlgren-mortine/hubspot-form-usability-enhancements").then(
      ({ HubSpotFormManager }) => {
        HubSpotFormManager.setupAllForms();
      },
    );
  } else {
    setTimeout(initializeWhenReady, 100);
  }
};

initializeWhenReady();

// ========================================
// 7. TYPESCRIPT USAGE
// ========================================

import hubspotForms, {
  HubSpotFormManager,
  ValidationResult,
} from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

const config = {
  characterLimit: 1500,
  allowedExtensions: ["pdf", "docx", "xlsx"],
  maxFileSize: 15 * 1024 * 1024, // 15MB
};

const instance = hubspotForms(config);

// Form management
const setupFormWithTypes = (formContainer) => {
  HubSpotFormManager.setupSingleForm(formContainer);
};

// ========================================
// 8. CONFIGURATION VIA ENVIRONMENT VARIABLES
// ========================================

// You can read environment variables in your app and pass them to the config.
// The module itself does NOT automatically read env vars.

import hubspotForms from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Example: Read from Vite env vars and pass to config
const allowedExtensions = import.meta.env.VITE_UPLOAD_ALLOWED_EXTENSIONS?.split(
  ",",
) || ["pdf", "jpg", "png"];
const maxFileSize =
  parseInt(import.meta.env.VITE_UPLOAD_MAX_SIZE) || 10 * 1024 * 1024;

hubspotForms({
  allowedExtensions,
  maxFileSize,
});

// ========================================
// 9. DYNAMIC FORM LOADING
// ========================================

import { HubSpotFormManager } from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

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
      const formElement = target.querySelector(".hsfc-Form");
      if (formElement) {
        HubSpotFormManager.setupSingleForm(formElement);
      }
    },
  });
};

// Usage
loadHubSpotForm("YOUR_PORTAL_ID", "YOUR_FORM_ID", "#hubspot-form-1");

// ========================================
// 10. CUSTOM STYLING INTEGRATION
// ========================================

// Option A: Use default styles and override CSS variables
import "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Override colors via CSS variables in your stylesheet:
// :root {
//   --color-hs-form-primary: #3b82f6;
//   --color-hs-form-primary-dk: #1e40af;
// }

// Option B: Use your own CSS entirely (skip default styles)
// import '@fahlgren-mortine/hubspot-form-usability-enhancements';
// import './custom-hubspot-styles.css';

// Option C: Add additional styles via JavaScript
const additionalStyles = `
  div[data-hsfc-id=Renderer] form {
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
    padding: 1.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ========================================
// 10. ERROR HANDLING AND DEBUGGING
// ========================================

import hubspotForms, {
  HubSpotFormManager,
} from "@fahlgren-mortine/hubspot-form-usability-enhancements";
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Production configuration
import "@fahlgren-mortine/hubspot-form-usability-enhancements/styles";

// Production configuration
const productionConfig = {
  characterLimit: 500,
  allowedExtensions: ["pdf", "jpg"],
  maxFileSize: 5 * 1024 * 1024,
};

try {
  const instance = hubspotForms(productionConfig);
} catch (error) {
  // Fallback initialization
  setTimeout(() => {
    HubSpotFormManager.setupAllForms();
  }, 1000);
}

export { HubSpotFormComponent, initializeSpecificForm, loadHubSpotForm };
