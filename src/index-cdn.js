/**
 * CDN/Script Tag Entry Point
 *
 * This file auto-initializes when loaded via <script> tag.
 * Use this for HubSpot CMS or any non-bundler environment.
 *
 * Strategy: Our CSS wins via specificity immediately (no flash).
 * Style removal happens AFTER hydration as a silent cleanup.
 */

import {
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
  removeHubSpotFormStyles,
} from "./hubspot-forms.js";

// Delay before any DOM manipulation (allows React hydration to complete)
const HYDRATION_DELAY = 1000;

// DO NOT remove styles immediately - causes React hydration errors
// Our CSS has higher specificity and wins immediately
// Style removal happens after hydration as cleanup

/**
 * Auto-initialization for CDN usage
 * All DOM manipulation waits for hydration to complete
 */
const autoInit = () => {
  // Set up form enhancements after hydration delay
  const setupForms = () => {
    const forms = document.querySelectorAll(".hsfc-Form");
    if (forms.length > 0) {
      HubSpotFormManager.setupAllForms();
    }
  };

  // Wait for hydration, then setup forms and remove redundant styles
  setTimeout(() => {
    removeHubSpotFormStyles();
    setupForms();
  }, HYDRATION_DELAY);

  // Watch for dynamically added forms (after initial delay)
  setTimeout(() => {
    const observer = new MutationObserver((mutations) => {
      let foundNewForm = false;
      let foundStyleTag = false;

      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;

        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;

          // Check for HubSpot's BaseStyle being re-added
          if (
            addedNode.tagName === "STYLE" &&
            addedNode.getAttribute("data-hsfc-id") === "BaseStyle"
          ) {
            foundStyleTag = true;
          }

          // Check for new forms
          if (
            addedNode.classList?.contains("hsfc-Form") ||
            addedNode.querySelector?.(".hsfc-Form")
          ) {
            foundNewForm = true;
          }
        }
      }

      // Remove style tag if found (safe after hydration)
      if (foundStyleTag) {
        removeHubSpotFormStyles();
      }

      // Setup new forms if found
      if (foundNewForm) {
        HubSpotFormManager.setupAllForms();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }, HYDRATION_DELAY);
};

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else {
  // DOM already loaded, run immediately
  autoInit();
}

// Expose for manual control if needed
window.HubSpotFormEnhancements = {
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
  removeHubSpotFormStyles,
  // Allow manual re-initialization
  init: autoInit,
};
