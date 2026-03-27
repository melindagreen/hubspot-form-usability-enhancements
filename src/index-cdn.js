/**
 * CDN/Script Tag Entry Point
 *
 * This file auto-initializes when loaded via <script> tag.
 * Use this for HubSpot CMS or any non-bundler environment.
 *
 * NOTE: This version does NOT remove HubSpot's BaseStyle tag to avoid
 * React hydration conflicts. Instead, our CSS overrides theirs via specificity.
 * Ensure styles.css loads AFTER HubSpot's form scripts for proper cascade.
 */

import {
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
} from "./hubspot-forms.js";

// Delay before manipulating form DOM (allows React hydration to complete)
const HYDRATION_DELAY = 1000;

// DO NOT remove HubSpot styles here - causes hydration errors
// Our CSS overrides via specificity instead

/**
 * Auto-initialization for CDN usage
 * Waits for hydration to complete before manipulating form DOM
 */
const autoInit = () => {
  // Set up form enhancements with delay to avoid hydration conflicts
  const setupFormsWithDelay = () => {
    const forms = document.querySelectorAll(".hsfc-Form");
    if (forms.length > 0) {
      // Wait for React hydration to complete
      setTimeout(() => {
        HubSpotFormManager.setupAllForms();
      }, HYDRATION_DELAY);
    }
  };

  // Try after initial delay
  setTimeout(setupFormsWithDelay, 100);

  // Also watch for dynamically added forms
  const observer = new MutationObserver((mutations) => {
    let foundNewForm = false;

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

    // Remove style tag if found (safe - only touches <head>)
    if (foundStyleTag) {
      removeHubSpotFormStyles();
    }

    // Setup new forms if found (with hydration delay)
    if (foundNewForm) {
      setTimeout(() => {
        HubSpotFormManager.setupAllForms();
      }, HYDRATION_DELAY);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
};

// Run when DOM is ready, then wait for hydration
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else {
  // DOM already loaded, run after short delay
  setTimeout(autoInit, 100);
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
