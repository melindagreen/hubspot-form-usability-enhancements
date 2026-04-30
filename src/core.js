/**
 * Core shared logic for both npm and CDN builds
 * This ensures feature parity between index.js and index-cdn.js
 */

import {
  HubSpotFormManager,
  CharacterLimitValidator,
  FileUploadValidator,
  ErrorMessageConfig,
  removeHubSpotFormStyles,
} from './hubspot-forms.js';

/**
 * Hide native HubSpot character limit errors
 */
export function hideNativeCharLimitErrors(root = document) {
  root.querySelectorAll('.hsfc-hs-form-errorAlert').forEach(el => {
    if (
      el.textContent.includes('Enter 500 characters or fewer') ||
      el.textContent.includes('enter 500 characters or fewer')
    ) {
      el.style.display = 'none';
    }
  });
}

/**
 * Toggle classes that replace :has() selectors for broader browser support
 */
export function toggleHasReplacementClasses(root = document) {
  root.querySelectorAll('.hsfc-Step').forEach(step => {
    const hasValidation = step.querySelector('.hsfc-CustomValidationError, .hsfc-ProgressBar--repositioned');
    step.classList.toggle('hsfc-step-with-validation-and-progress', !!hasValidation);
  });

  root.querySelectorAll('.hsfc-Step__Content').forEach(content => {
    const hasValidation = content.querySelector('.hsfc-CustomValidationError, .hsfc-ProgressBar--repositioned');
    content.classList.toggle('hsfc-content-with-validation-and-progress', !!hasValidation);
  });

  root.querySelectorAll('label').forEach(label => {
    const hasRequired = label.querySelector('.hsfc-FieldLabel__RequiredIndicator');
    label.classList.toggle('hsfc-label-without-required', !hasRequired);
  });

  root.querySelectorAll('.hsfc-Row').forEach(row => {
    const hasInput = row.querySelector('input, select, textarea');
    row.classList.toggle('hsfc-row-with-form-inputs', !!hasInput);
  });
}

/**
 * Setup mutation observer for class toggles and error hiding
 */
export function setupClassObserver() {
  if (typeof window === 'undefined') return null;
  
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
  
  return hasClassObserver;
}

/**
 * Position progress bars immediately to prevent layout shifts
 * Also deduplicates IDs to fix WCAG violations
 */
export function positionElementsImmediately() {
  document.querySelectorAll('.hsfc-ProgressBar').forEach((progressBar, index) => {
    if (progressBar.hasAttribute('data-repositioned')) return;
    
    const step = progressBar.closest('.hsfc-Step');
    if (!step) return;
    
    // Make ID unique by appending step index to prevent duplicate IDs
    if (progressBar.id) {
      progressBar.id = `${progressBar.id}-step-${index + 1}`;
    }
    
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
}

/**
 * Add styling class to character limit warnings
 */
export function styleCharacterLimitWarnings() {
  document.querySelectorAll('.hsfc-CustomValidationError').forEach(el => {
    if (
      el.textContent.includes('Enter 500 characters or fewer') ||
      el.textContent.includes('enter 500 characters or fewer')
    ) {
      el.classList.add('has-500-char-warning');
    }
  });
}

/**
 * Setup mutation observer for progress bar positioning
 */
export function setupPositioningObserver() {
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
  
  return positioningObserver;
}

/**
 * Wait for safe initialization (React hydration safety)
 */
export function whenSafeToInitialize(callback) {
  if (typeof window === 'undefined') return;
  
  const executeCallback = () => {
    const isHydrationSafe = () => {
      if (document.readyState !== 'complete') return false;
      if (document.documentElement.classList.contains('react-hydrating')) return false;
      if (document.querySelector('[data-react-hydration-error]')) return false;
      return true;
    };
    
    if (isHydrationSafe()) {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => {
          setTimeout(callback, 50);
        });
      } else {
        setTimeout(callback, 100);
      }
    } else {
      setTimeout(executeCallback, 100);
    }
  };
  
  executeCallback();
}

/**
 * Setup form initialization with dynamic form observer
 */
export function setupForms() {
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

  setTimeout(() => {
    observer.disconnect();
  }, 10000);
}

/**
 * Apply configuration options
 */
export function applyConfiguration(options = {}) {
  if (options.characterLimit) {
    CharacterLimitValidator.DEFAULT_LIMIT = options.characterLimit;
  }
  
  if (options.allowedExtensions) {
    FileUploadValidator.allowedExtensions = options.allowedExtensions;
  }
  
  if (options.maxFileSize) {
    FileUploadValidator.maxFileSize = options.maxFileSize;
  }
  
  if (options.errorMessages) {
    ErrorMessageConfig.messages = options.errorMessages;
  }
}

/**
 * Initialize all core functionality
 */
export function initializeCore(options = {}) {
  if (typeof window === 'undefined') return;
  
  // Initial setup
  toggleHasReplacementClasses();
  hideNativeCharLimitErrors();
  setupClassObserver();
  
  // Always remove HubSpot injected styles
  removeHubSpotFormStyles();
  
  // Apply configuration
  applyConfiguration(options);
  
  // Position elements immediately
  positionElementsImmediately();
  styleCharacterLimitWarnings();
  setupPositioningObserver();
  
  // Setup forms when safe
  whenSafeToInitialize(setupForms);
}
