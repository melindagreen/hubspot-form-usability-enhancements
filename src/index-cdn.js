/**
 * CDN/Script Tag Entry Point
 *
 * This file auto-initializes when loaded via <script> tag.
 * Use this for HubSpot CMS or any non-bundler environment.
 *
 * NOTE: Logic is shared with index.js via core.js
 */

import {
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
  ErrorMessageConfig,
  removeHubSpotFormStyles,
} from "./hubspot-forms.js";

import { initializeCore } from './core.js';

/**
 * Auto-initialization for CDN usage
 */
const autoInit = () => {
  // Apply configuration from window globals if provided
  const options = {};
  
  if (typeof window !== 'undefined') {
    if (window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS) {
      options.allowedExtensions = window.HUBSPOT_FORMS_ALLOWED_EXTENSIONS;
    }
    if (window.HUBSPOT_FORMS_MAX_FILE_SIZE) {
      options.maxFileSize = window.HUBSPOT_FORMS_MAX_FILE_SIZE;
    }
    if (window.HUBSPOT_FORMS_ERROR_MESSAGES) {
      options.errorMessages = window.HUBSPOT_FORMS_ERROR_MESSAGES;
    }
  }

  // Initialize all core functionality
  initializeCore(options);
};

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else {
  autoInit();
}

// Expose to window for manual access
window.HubSpotFormEnhancements = {
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
  ErrorMessageConfig,
  removeHubSpotFormStyles,
  init: autoInit,
};
