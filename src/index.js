/**
 * @fahlgren-mortine/hubspot-form-usability-enhancements
 * Enhanced usability, validation, accessibility, and styling for HubSpot forms
 * 
 * NPM/Bundler Entry Point
 */

import { 
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
  ErrorMessageConfig,
  removeHubSpotFormStyles,
  setupAllFormsValidation,
  setupSingleFormValidation,
  setupFieldValidation
} from './hubspot-forms.js';

import { initializeCore } from './core.js';

/**
 * Main initialization function that accepts configuration options
 */
const init = (options = {}) => {
  if (typeof window === 'undefined') {
    return {
      HubSpotFormManager: null,
      HubSpotFormValidator: null,
      CharacterLimitValidator: null
    };
  }

  // Initialize all core functionality
  initializeCore(options);

  // Return the managers and validators for advanced usage
  return {
    HubSpotFormManager,
    HubSpotFormValidator,
    CharacterLimitValidator,
    FileUploadValidator,
    ErrorMessageConfig,
    FieldValidator,
    removeHubSpotFormStyles
  };
};

/**
 * Two-phase initialization for React/SSR environments
 */
export const initializeWithTwoPhases = async (options = {}) => {
  const defaultOptions = {
    characterLimit: 500,
    allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'],
    maxFileSize: 10 * 1024 * 1024,
    autoInit: true,
    delay: 1000,
    reactHydrationDelay: 500,
    cleanupDelay: 1000,
    ...options
  };

  // Always remove HubSpot injected styles on two-phase init
  removeHubSpotFormStyles();
  
  // Phase 1: Apply CSS-only positioning to prevent layout shifts
  const applyImmediateCSS = () => {
    const style = document.createElement('style');
    style.id = 'hubspot-forms-immediate-positioning';
    style.textContent = `
      /* Hide progress bars temporarily to prevent flashing */
      .hsfc-ProgressBar:not([data-repositioned]) {
        position: absolute;
        top: -9999px;
        opacity: 0;
      }
      
      /* Ensure validation errors appear in correct position */
      .hsfc-CustomValidationError {
        order: -2;
      }
      
      /* Ensure progress bars appear after validation errors */
      .hsfc-ProgressBar[data-repositioned] {
        order: -1;
      }
    `;
    document.head.appendChild(style);
  };

  // Apply immediate CSS
  applyImmediateCSS();

  // Phase 2: Wait for React hydration, then do proper DOM positioning
  setTimeout(async () => {
    try {
      init({
        characterLimit: defaultOptions.characterLimit,
        allowedExtensions: defaultOptions.allowedExtensions,
        maxFileSize: defaultOptions.maxFileSize,
      });

      // Remove temporary CSS after proper positioning is done
      setTimeout(() => {
        const tempStyle = document.getElementById('hubspot-forms-immediate-positioning');
        if (tempStyle) tempStyle.remove();
      }, defaultOptions.cleanupDelay);

    } catch (error) {
      // Silently fail to avoid console pollution in production
    }
  }, defaultOptions.reactHydrationDelay);
};

// Auto-initialization (unless disabled)
if (typeof window !== 'undefined' && !window.HUBSPOT_FORMS_NO_AUTO_INIT) {
  window.addEventListener('load', () => {
    setTimeout(initializeWithTwoPhases, 1000);
  });
}

// Named exports for granular control
export {
  // Main initialization function
  init,
  
  // Core managers and validators
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
  ErrorMessageConfig,
  
  // Utility functions
  removeHubSpotFormStyles,
  
  // Legacy compatibility functions
  setupAllFormsValidation,
  setupSingleFormValidation,
  setupFieldValidation
};

// Default export for simple usage
export default init;
