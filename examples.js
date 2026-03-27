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
// 5. PREVENTING AUTO-INITIALIZATION
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
// 6. TYPESCRIPT USAGE
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
// 7. CONFIGURATION VIA ENVIRONMENT VARIABLES
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
// 8. DYNAMIC FORM LOADING
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
// 9. CUSTOM STYLING INTEGRATION
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
