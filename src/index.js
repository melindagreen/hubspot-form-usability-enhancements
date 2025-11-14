/**
 * @fahlgren-mortine/hubspot-form-usability-enhancements
 * Enhanced usability, validation, accessibility, and styling for HubSpot forms implemented with the "Developer Code" script block
 * 
 * Main entry point for the module
 */

import { 
  HubSpotFormManager,
  HubSpotFormValidator,
  CharacterLimitValidator,
  FieldValidator,
  FileUploadValidator,
  removeHubSpotFormStyles,
  setupAllFormsValidation,
  setupSingleFormValidation,
  setupFieldValidation
} from './hubspot-forms.js';

/**
 * Main initialization function that accepts configuration options
 */
const init = (options = {}) => {
      // Hide native HubSpot character limit errors (was CSS :has-text)
      function hideNativeCharLimitErrors(root = document) {
        root.querySelectorAll('.hsfc-hs-form-errorAlert').forEach(el => {
          if (
            el.textContent.includes('Enter 500 characters or fewer') ||
            el.textContent.includes('enter 500 characters or fewer')
          ) {
            el.style.display = 'none';
          }
        });
      }
    // Utility: Toggle classes that replace :has() selectors
    function toggleHasReplacementClasses(root = document) {
      // 1. .hsfc-Step
      root.querySelectorAll('.hsfc-Step').forEach(step => {
        const hasValidation = step.querySelector('.hsfc-CustomValidationError, .hsfc-ProgressBar--repositioned');
        step.classList.toggle('hsfc-step-with-validation-and-progress', !!hasValidation);
      });

      // 2. .hsfc-Step__Content
      root.querySelectorAll('.hsfc-Step__Content').forEach(content => {
        const hasValidation = content.querySelector('.hsfc-CustomValidationError, .hsfc-ProgressBar--repositioned');
        content.classList.toggle('hsfc-content-with-validation-and-progress', !!hasValidation);
      });

      // 3. label:not(:has(.hsfc-FieldLabel__RequiredIndicator))
      root.querySelectorAll('label').forEach(label => {
        const hasRequired = label.querySelector('.hsfc-FieldLabel__RequiredIndicator');
        label.classList.toggle('hsfc-label-without-required', !hasRequired);
      });

      // 4. .hsfc-Row:has(input, select, textarea)
      root.querySelectorAll('.hsfc-Row').forEach(row => {
        const hasInput = row.querySelector('input, select, textarea');
        row.classList.toggle('hsfc-row-with-form-inputs', !!hasInput);
      });
    }

    // Initial run
    if (typeof window !== 'undefined') {
      toggleHasReplacementClasses();
      hideNativeCharLimitErrors();
    }

    // Observe DOM mutations to keep classes in sync
    if (typeof window !== 'undefined') {
      const hasClassObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                toggleHasReplacementClasses(node);
                hideNativeCharLimitErrors(node);
              }
            });
          } else if (mutation.type === 'attributes') {
            // If attributes change, re-check the affected element
            if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE) {
              toggleHasReplacementClasses(mutation.target);
              hideNativeCharLimitErrors(mutation.target);
            }
          }
        }
      });
      hasClassObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'type', 'name']
      });
    }
  if (typeof window === 'undefined') {
    return {
      HubSpotFormManager: null,
      HubSpotFormValidator: null,
      CharacterLimitValidator: null
    };
  }

  // Always remove HubSpot injected styles on init
  removeHubSpotFormStyles();

  // Apply configuration if provided
  if (options.characterLimit) {
    CharacterLimitValidator.DEFAULT_LIMIT = options.characterLimit;
  }
  
  if (options.allowedExtensions) {
    FileUploadValidator.allowedExtensions = options.allowedExtensions;
  }
  
  if (options.maxFileSize) {
    FileUploadValidator.maxFileSize = options.maxFileSize;
  }

  // Position elements immediately to prevent layout shifts
  const positionElementsImmediately = () => {
    // Find and reposition progress bars immediately
    document.querySelectorAll('.hsfc-ProgressBar').forEach(progressBar => {
      if (progressBar.hasAttribute('data-repositioned')) return;
      
      const step = progressBar.closest('.hsfc-Step');
      if (!step) return;
      
      progressBar.setAttribute('data-repositioned', 'true');
      progressBar.remove();
      
      const stepContent = step.querySelector('.hsfc-Step__Content') || step;
      const firstFormField = stepContent.querySelector('.hsfc-Row:has(input, select, textarea), .hsfc-FormField, .hs-form-field, input, select, textarea');
      const existingValidationError = stepContent.querySelector('.hsfc-CustomValidationError');
      
      if (existingValidationError) {
        existingValidationError.insertAdjacentElement('afterend', progressBar);
      } else if (firstFormField) {
        stepContent.insertBefore(progressBar, firstFormField);
      } else if (stepContent.firstChild) {
        stepContent.insertBefore(progressBar, stepContent.firstChild);
      } else {
        stepContent.appendChild(progressBar);
      }
      
      progressBar.classList.add('hsfc-ProgressBar--repositioned');
    });
  };

  // Run positioning immediately when module loads
  positionElementsImmediately();
  
  // Set up observer for new elements
      // Add class to character limit warning elements for styling
      document.querySelectorAll('.hsfc-CustomValidationError').forEach(el => {
        if (
          el.textContent.includes('Enter 500 characters or fewer') ||
          el.textContent.includes('enter 500 characters or fewer')
        ) {
          el.classList.add('has-500-char-warning');
        }
      });
  const positioningObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            if (addedNode.classList?.contains('hsfc-ProgressBar')) {
              positionElementsImmediately();
            }
            const progressBars = addedNode.querySelectorAll?.('.hsfc-ProgressBar');
            if (progressBars?.length > 0) {
              positionElementsImmediately();
            }
          }
        }
      }
    }
  });

  positioningObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initialize forms when safe, but positioning happens immediately
  const whenSafeToInitialize = (callback) => {
    if (typeof window === 'undefined') return;
    
    const executeCallback = () => {
      // Ensure we don't interfere with any ongoing hydration
      const isHydrationSafe = () => {
        // Check that the page is fully loaded
        if (document.readyState !== 'complete') return false;
        
        // Wait for any active React transitions to complete
        if (document.documentElement.classList.contains('react-hydrating')) return false;
        
        // Ensure no React hydration errors are present
        if (document.querySelector('[data-react-hydration-error]')) return false;
        
        return true;
      };
      
      if (isHydrationSafe()) {
        // Use requestIdleCallback to run during browser idle time
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(() => {
            // Final safety delay
            setTimeout(callback, 50);
          });
        } else {
          setTimeout(callback, 100);
        }
      } else {
        // Re-check in 100ms
        setTimeout(executeCallback, 100);
      }
    };
    
    executeCallback();
  };

  whenSafeToInitialize(() => {
    // Try to find and setup forms immediately
    const hubspotForms = document.querySelectorAll('.hsfc-Form');
    
    if (hubspotForms.length > 0) {
      HubSpotFormManager.setupAllForms();
      return;
    }

    // If no forms found immediately, set up observer for dynamic forms
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            // Check if added node is a form or contains forms
            const newForms = addedNode.classList?.contains('hsfc-Form') ? 
              [addedNode] : 
              addedNode.querySelectorAll?.('.hsfc-Form') || [];
            
            if (newForms.length > 0) {
              observer.disconnect();
              HubSpotFormManager.setupAllForms();
              return;
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup observer after timeout
    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  });

  // Return the managers and validators for advanced usage
  return {
    HubSpotFormManager,
    HubSpotFormValidator,
    CharacterLimitValidator,
    FileUploadValidator,
    FieldValidator,
    removeHubSpotFormStyles
  };
};

// Auto-initialization is completely disabled to prevent React hydration conflicts
// Users must explicitly call init() to initialize the module
// This ensures no interference with React hydration or other frameworks
// Export the initialization function for manual use
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
  
  // Utility functions
  removeHubSpotFormStyles,
  
  // Legacy compatibility functions
  setupAllFormsValidation,
  setupSingleFormValidation,
  setupFieldValidation
};

// Default export for simple usage
export default init;

/**
 * Usage Examples:
 * 
 * // Simple auto-initialization (happens automatically)
 * import '@fahlgren-mortine/hubspot-form-usability-enhancements';
 * import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
 * 
 * // Custom configuration
 * import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
 * import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
 * 
 * hubspotForms({
 *   characterLimit: 1000,
 *   allowedExtensions: ['pdf', 'docx', 'jpg', 'png'],
 *   maxFileSize: 5 * 1024 * 1024 // 5MB
 * });
 * 
 * // Granular control
 * import { HubSpotFormManager, CharacterLimitValidator } from '@fahlgren-mortine/hubspot-form-usability-enhancements';
 * import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
 * 
 * // Prevent auto-initialization
 * window.HUBSPOT_FORMS_NO_AUTO_INIT = true;
 * import '@fahlgren-mortine/hubspot-form-usability-enhancements';
 * 
 * // Manual initialization with custom settings
 * HubSpotFormManager.setupAllForms();
 * 
 * // React usage
 * import { useEffect } from 'react';
 * import hubspotForms from '@fahlgren-mortine/hubspot-form-usability-enhancements';
 * import '@fahlgren-mortine/hubspot-form-usability-enhancements/styles';
 * 
 * function MyComponent() {
 *   useEffect(() => {
 *     // Initialize forms after component mounts
 *     hubspotForms();
 *   }, []);
 *   
 *   return <div id="hubspot-form-container"></div>;
 * }
 */
